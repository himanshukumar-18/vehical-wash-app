import json
import logging

import razorpay
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from bookings.models import Booking

from .models import Payment
from .permission import IsAdmin
from .serializers import CreateOrderSerializer, MarkPaidSerializer, PaymentSerializer, RefundRequestSerializer, VerifyPaymentSerializer
from .services import PaymentService

logger = logging.getLogger(__name__)


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            booking = Booking.objects.get(pk=serializer.validated_data["booking_id"], customer=request.user)
            payment = PaymentService.create_razorpay_order(booking=booking, customer=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except razorpay.errors.BadRequestError:
            logger.exception("Razorpay rejected order creation")
            return Response({"detail": "Unable to create payment order."}, status=status.HTTP_502_BAD_GATEWAY)
        except Exception:
            logger.exception("Payment order creation failed")
            return Response({"detail": "Payment service is temporarily unavailable."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response({
            "payment_id": str(payment.id), "razorpay_order_id": payment.provider_order_id,
            "amount": int(payment.amount * 100), "currency": payment.currency,
            "razorpay_key": settings.RAZORPAY_KEY_ID,
        }, status=status.HTTP_201_CREATED)


class VerifyPaymentView(APIView):
    """Convenience verification only; the signed webhook remains the settlement authority."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            payment, changed = PaymentService.verify_razorpay_payment(
                order_id=data["razorpay_order_id"], payment_id=data["razorpay_payment_id"], signature=data["razorpay_signature"], customer=request.user,
            )
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)
        except (razorpay.errors.SignatureVerificationError, ValueError) as exc:
            return Response({"detail": str(exc) or "Payment verification failed."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"payment": PaymentSerializer(payment).data, "settled": changed})


class RazorpayWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return Response({"detail": "Invalid JSON payload."}, status=status.HTTP_400_BAD_REQUEST)
        event_id = request.headers.get("X-Razorpay-Event-Id") or request.headers.get("X-Request-Id")
        if not event_id:
            return Response({"detail": "Missing webhook event id."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            event, processed = PaymentService.record_webhook(
                payload=payload, raw_body=request.body, signature=request.headers.get("X-Razorpay-Signature"), event_id=event_id,
            )
        except ValueError as exc:
            logger.error("Rejected Razorpay webhook: %s", exc)
            return Response({"detail": "Webhook is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        if not event.signature_valid:
            return Response({"detail": "Invalid webhook signature."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"accepted": processed}, status=status.HTTP_200_OK)


class MarkPaidView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, booking_id):
        serializer = MarkPaidSerializer(data={"booking_id": booking_id})
        serializer.is_valid(raise_exception=True)
        try:
            payment = PaymentService.mark_cash_paid(booking=Booking.objects.get(pk=booking_id), actor=request.user)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(PaymentSerializer(payment).data, status=status.HTTP_201_CREATED)


class RefundRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RefundRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payment = Payment.objects.select_related("booking").get(pk=serializer.validated_data["payment_id"])
            if payment.booking.customer_id != request.user.id and request.user.role not in ["admin", "manager"]:
                return Response({"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)
            refund = PaymentService.request_refund(payment=payment, requested_by=request.user, amount=serializer.validated_data["amount"], reason=serializer.validated_data.get("reason", ""))
        except Payment.DoesNotExist:
            return Response({"detail": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"id": str(refund.id), "status": refund.status}, status=status.HTTP_201_CREATED)


class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = "booking_id"

    def get_object(self):
        queryset = Payment.objects.select_related("booking").filter(booking_id=self.kwargs["booking_id"])
        if self.request.user.role not in ["admin", "manager", "staff"]:
            queryset = queryset.filter(booking__customer=self.request.user)
        return queryset.order_by("-created_at").first() or self.permission_denied(self.request)

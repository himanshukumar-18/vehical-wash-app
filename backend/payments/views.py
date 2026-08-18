import json
import logging

import razorpay
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.views import APIView

from bookings.models import Booking

from .models import Payment
from .permission import IsAdmin
from .serializers import (
    CreateOrderSerializer,
    MarkPaidSerializer,
    PaymentSerializer,
    RefundRequestSerializer,
    VerifyPaymentSerializer,
)
from .services import PaymentService

logger = logging.getLogger(__name__)


class PaymentRateThrottle(UserRateThrottle):
    rate = "100/minute"


class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [PaymentRateThrottle]

    def post(self, request):
        serializer = CreateOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            booking = Booking.objects.get(pk=serializer.validated_data["booking_id"], customer=request.user)
            payment = PaymentService.create_razorpay_order(booking=booking, customer=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"success": False, "message": "Booking not found.", "code": "RESOURCE_NOT_FOUND", "errors": None},
                status=status.HTTP_404_NOT_FOUND,
            )
        except razorpay.errors.BadRequestError:
            logger.exception("Razorpay rejected order creation")
            return Response(
                {"success": False, "message": "Unable to create payment order with gateway.", "code": "PAYMENT_GATEWAY_ERROR", "errors": None},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                "success": True,
                "payment_id": str(payment.id),
                "razorpay_order_id": payment.provider_order_id,
                "amount": int(payment.amount * 100),
                "currency": payment.currency,
                "razorpay_key": settings.RAZORPAY_KEY_ID,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyPaymentView(APIView):
    """Convenience verification only; the signed webhook remains the settlement authority."""
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [PaymentRateThrottle]

    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            payment, changed = PaymentService.verify_razorpay_payment(
                order_id=data["razorpay_order_id"],
                payment_id=data["razorpay_payment_id"],
                signature=data["razorpay_signature"],
                customer=request.user,
            )
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "message": "Payment record not found.", "code": "RESOURCE_NOT_FOUND", "errors": None},
                status=status.HTTP_404_NOT_FOUND,
            )
        except razorpay.errors.SignatureVerificationError:
            return Response(
                {"success": False, "message": "Invalid payment signature.", "code": "INVALID_SIGNATURE", "errors": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "success": True,
                "message": "Payment verified successfully.",
                "payment": PaymentSerializer(payment).data,
                "settled": changed,
            },
            status=status.HTTP_200_OK,
        )


class RazorpayWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            payload = json.loads(request.body.decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            return Response(
                {"success": False, "message": "Invalid JSON payload.", "code": "PARSE_ERROR", "errors": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event_id = request.headers.get("X-Razorpay-Event-Id") or request.headers.get("X-Request-Id")
        if not event_id:
            return Response(
                {"success": False, "message": "Missing webhook event id.", "code": "MISSING_HEADER", "errors": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        signature = request.headers.get("X-Razorpay-Signature")
        if not signature:
            return Response(
                {"success": False, "message": "Invalid webhook signature.", "code": "INVALID_WEBHOOK_SIGNATURE", "errors": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            event, processed = PaymentService.record_webhook(
                payload=payload,
                raw_body=request.body,
                signature=signature,
                event_id=event_id,
            )
        except ValueError as exc:
            logger.error("Rejected Razorpay webhook: %s", exc)
            return Response(
                {"success": False, "message": "Webhook service is unavailable.", "code": "WEBHOOK_UNAVAILABLE", "errors": None},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not event.signature_valid:
            return Response(
                {"success": False, "message": "Invalid webhook signature.", "code": "INVALID_WEBHOOK_SIGNATURE", "errors": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"success": True, "accepted": processed, "already_processed": not processed},
            status=status.HTTP_200_OK,
        )


class MarkPaidView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def post(self, request, booking_id):
        serializer = MarkPaidSerializer(data={"booking_id": booking_id})
        serializer.is_valid(raise_exception=True)
        try:
            payment = PaymentService.mark_cash_paid(booking=Booking.objects.get(pk=booking_id), actor=request.user)
        except Booking.DoesNotExist:
            return Response(
                {"success": False, "message": "Booking not found.", "code": "RESOURCE_NOT_FOUND", "errors": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"success": True, "payment": PaymentSerializer(payment).data},
            status=status.HTTP_201_CREATED,
        )


class RefundRequestView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    throttle_classes = [PaymentRateThrottle]

    def post(self, request):
        serializer = RefundRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payment = Payment.objects.select_related("booking").get(pk=serializer.validated_data["payment_id"])
            if payment.booking.customer_id != request.user.id and request.user.role not in ["admin", "manager"]:
                return Response(
                    {"success": False, "message": "Payment not found.", "code": "RESOURCE_NOT_FOUND", "errors": None},
                    status=status.HTTP_404_NOT_FOUND,
                )
            refund = PaymentService.request_refund(
                payment=payment,
                requested_by=request.user,
                amount=serializer.validated_data["amount"],
                reason=serializer.validated_data.get("reason", ""),
            )
        except Payment.DoesNotExist:
            return Response(
                {"success": False, "message": "Payment not found.", "code": "RESOURCE_NOT_FOUND", "errors": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"success": True, "id": str(refund.id), "status": refund.status},
            status=status.HTTP_201_CREATED,
        )


class PaymentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = "booking_id"

    def get_object(self):
        queryset = Payment.objects.select_related("booking").filter(booking_id=self.kwargs["booking_id"])
        if self.request.user.role not in ["admin", "manager", "staff"]:
            queryset = queryset.filter(booking__customer=self.request.user)
        obj = queryset.order_by("-created_at").first()
        if not obj:
            self.permission_denied(self.request)
        return obj


class AdminPaymentListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role not in ["admin", "manager", "staff"]:
            return Payment.objects.none()
        return Payment.objects.select_related(
            "booking", "booking__customer", "booking__service", "booking__vehicle"
        ).order_by("-created_at")

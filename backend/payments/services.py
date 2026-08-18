import hashlib
import hmac
import json
import logging
from decimal import Decimal

import razorpay
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.utils import timezone

from bookings.models import Booking
from notifications.emails import EmailService
from notifications.services import NotificationService

from .models import Payment, PaymentEvent, Refund

logger = logging.getLogger(__name__)


class PaymentService:
    """Single writer for payment and refund state transitions."""

    @staticmethod
    def client():
        return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

    @classmethod
    @transaction.atomic
    def create_razorpay_order(cls, *, booking, customer):
        booking = Booking.objects.select_for_update().get(pk=booking.pk, customer=customer)
        if booking.payment_status == Booking.PaymentStatus.PAID:
            raise ValidationError("This booking is already paid.")
        if booking.status not in [Booking.Status.PENDING, Booking.Status.CONFIRMED]:
            raise ValidationError("Payment cannot be started for this booking.")

        existing = (Payment.objects.select_for_update()
                    .filter(booking=booking, provider=Payment.Provider.RAZORPAY, status=Payment.Status.PENDING)
                    .order_by("-created_at").first())
        if existing and existing.provider_order_id:
            return existing

        amount_in_paise = int(booking.total_price * Decimal("100"))
        if amount_in_paise <= 0:
            raise ValidationError("Booking amount must be positive.")

        order = cls.client().order.create({
            "amount": amount_in_paise,
            "currency": "INR",
            "receipt": booking.booking_number[:40],
            "payment_capture": 1,
            "notes": {"booking_number": booking.booking_number},
        })

        if existing:
            existing.provider_order_id = order["id"]
            existing.amount = booking.total_price
            existing.save(update_fields=["provider_order_id", "amount", "updated_at"])
            return existing

        return Payment.objects.create(
            booking=booking,
            amount=booking.total_price,
            currency="INR",
            provider=Payment.Provider.RAZORPAY,
            provider_order_id=order["id"],
        )

    @classmethod
    @transaction.atomic
    def verify_razorpay_payment(cls, *, order_id, payment_id, signature, customer):
        payment = Payment.objects.select_for_update().select_related("booking", "booking__customer").get(
            provider=Payment.Provider.RAZORPAY, provider_order_id=order_id, booking__customer=customer
        )

        if payment.status == Payment.Status.PAID:
            if payment.provider_payment_id == payment_id:
                return payment, False
            raise ValidationError("A different payment has already settled this order.")

        # Verify Signature with Razorpay SDK
        cls.client().utility.verify_payment_signature({
            "razorpay_order_id": order_id,
            "razorpay_payment_id": payment_id,
            "razorpay_signature": signature,
        })

        # Verify Amount consistency
        booking = payment.booking
        if booking.total_price != payment.amount:
            raise ValidationError("Payment amount does not match booking amount.")

        payment.mark_paid(payment_id)

        booking.payment_status = Booking.PaymentStatus.PAID
        if booking.status == Booking.Status.PENDING:
            booking.status = Booking.Status.CONFIRMED
            booking.confirmed_at = timezone.now()
            booking.save(update_fields=["payment_status", "status", "confirmed_at", "updated_at"])
        else:
            booking.save(update_fields=["payment_status", "updated_at"])

        transaction.on_commit(lambda p=payment: EmailService.enqueue_payment_success(p))
        transaction.on_commit(lambda p=payment: NotificationService.notify_payment_success(p))
        return payment, True

    @classmethod
    @transaction.atomic
    def mark_cash_paid(cls, *, booking, actor):
        booking = Booking.objects.select_for_update().get(pk=booking.pk)
        if booking.payment_status == Booking.PaymentStatus.PAID:
            raise ValidationError("This booking is already paid.")

        payment = Payment.objects.create(
            booking=booking,
            amount=booking.total_price,
            currency="INR",
            provider=Payment.Provider.CASH,
        )
        payment.mark_paid()

        booking.payment_status = Booking.PaymentStatus.PAID
        booking.save(update_fields=["payment_status", "updated_at"])

        transaction.on_commit(lambda p=payment: EmailService.enqueue_payment_success(p))
        transaction.on_commit(lambda p=payment: NotificationService.notify_payment_success(p))
        return payment

    @classmethod
    @transaction.atomic
    def request_refund(cls, *, payment, requested_by, amount, reason=""):
        payment = Payment.objects.select_for_update().get(pk=payment.pk)
        if payment.status != Payment.Status.PAID:
            raise ValidationError("Only a paid payment can be refunded.")
        if amount <= 0 or amount > payment.amount:
            raise ValidationError("Refund amount must be greater than zero and no more than the payment amount.")

        # Check existing active refunds
        existing = Refund.objects.filter(payment=payment, status__in=[Refund.Status.REQUESTED, Refund.Status.APPROVED, Refund.Status.PROCESSING, Refund.Status.SUCCEEDED]).exists()
        if existing:
            raise ValidationError("A refund request already exists for this payment.")

        refund = Refund.objects.create(payment=payment, requested_by=requested_by, amount=amount, reason=reason)
        transaction.on_commit(lambda r=refund: NotificationService.notify_refund_requested(r))
        return refund

    @classmethod
    @transaction.atomic
    def complete_manual_refund(cls, *, refund, reviewer):
        refund = Refund.objects.select_for_update().select_related("payment", "payment__booking").get(pk=refund.pk)
        if refund.status not in [Refund.Status.REQUESTED, Refund.Status.APPROVED, Refund.Status.PROCESSING]:
            raise ValidationError("This refund cannot be completed.")

        refund.status = Refund.Status.SUCCEEDED
        refund.reviewed_by = reviewer
        refund.reviewed_at = timezone.now()
        refund.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

        payment = refund.payment
        payment.transition_to(Payment.Status.REFUNDED)

        booking = payment.booking
        booking.payment_status = Booking.PaymentStatus.REFUNDED
        booking.save(update_fields=["payment_status", "updated_at"])

        transaction.on_commit(lambda r=refund: EmailService.enqueue_refund_success(r))
        transaction.on_commit(lambda r=refund: NotificationService.notify_refund_completed(r))
        return refund

    @classmethod
    @transaction.atomic
    def record_webhook(cls, *, payload, raw_body, signature, event_id):
        if not settings.RAZORPAY_WEBHOOK_SECRET:
            raise ValueError("Webhook secret is not configured.")

        expected = hmac.new(settings.RAZORPAY_WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256).hexdigest()
        signature_valid = hmac.compare_digest(expected, signature or "")
        event_type = payload.get("event", "unknown") if isinstance(payload, dict) else "unknown"

        event, created = PaymentEvent.objects.get_or_create(
            provider=Payment.Provider.RAZORPAY,
            event_id=event_id,
            defaults={
                "event_type": event_type,
                "payload": payload if isinstance(payload, dict) else {},
                "signature_valid": signature_valid,
            },
        )

        if not created or not signature_valid:
            return event, False

        # Webhook Settlement Processing
        if isinstance(payload, dict) and "payload" in payload:
            event_payload = payload["payload"]

            # Process payment.captured / order.paid / payment.authorized
            if event_type in ["payment.captured", "order.paid", "payment.authorized"]:
                payment_entity = (event_payload.get("payment", {}).get("entity", {}) or
                                  event_payload.get("order", {}).get("entity", {}))
                order_id = payment_entity.get("order_id") or payment_entity.get("id")
                payment_id = payment_entity.get("id") if event_type != "order.paid" else None

                if order_id:
                    payment = Payment.objects.select_for_update().select_related("booking").filter(
                        provider=Payment.Provider.RAZORPAY, provider_order_id=order_id
                    ).first()

                    if payment and payment.status != Payment.Status.PAID:
                        payment.mark_paid(payment_id)
                        event.payment = payment
                        booking = payment.booking
                        booking.payment_status = Booking.PaymentStatus.PAID
                        if booking.status == Booking.Status.PENDING:
                            booking.status = Booking.Status.CONFIRMED
                            booking.confirmed_at = timezone.now()
                            booking.save(update_fields=["payment_status", "status", "confirmed_at", "updated_at"])
                        else:
                            booking.save(update_fields=["payment_status", "updated_at"])

                        transaction.on_commit(lambda p=payment: EmailService.enqueue_payment_success(p))
                        transaction.on_commit(lambda p=payment: NotificationService.notify_payment_success(p))

            elif event_type == "payment.failed":
                payment_entity = event_payload.get("payment", {}).get("entity", {})
                order_id = payment_entity.get("order_id")
                if order_id:
                    payment = Payment.objects.select_for_update().select_related("booking").filter(
                        provider=Payment.Provider.RAZORPAY, provider_order_id=order_id
                    ).first()
                    if payment and payment.status not in [Payment.Status.PAID, Payment.Status.REFUNDED]:
                        error_code = payment_entity.get("error_code", "")
                        error_desc = payment_entity.get("error_description", "Payment failed")
                        payment.transition_to(Payment.Status.FAILED, failure_code=error_code[:80], failure_message=error_desc)
                        event.payment = payment
                        booking = payment.booking
                        booking.payment_status = Booking.PaymentStatus.FAILED
                        booking.save(update_fields=["payment_status", "updated_at"])

                        transaction.on_commit(lambda p=payment: NotificationService.notify_payment_failed(p))

        event.processed_at = timezone.now()
        event.save(update_fields=["processed_at", "payment"])
        return event, True

import hashlib
import hmac
import json
import logging
from decimal import Decimal

import razorpay
from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from bookings.models import Booking
from notifications.emails import EmailService

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
            raise ValueError("This booking is already paid.")
        if booking.status not in [Booking.Status.PENDING, Booking.Status.CONFIRMED]:
            raise ValueError("Payment cannot be started for this booking.")

        existing = (Payment.objects.select_for_update()
                    .filter(booking=booking, provider=Payment.Provider.RAZORPAY, status=Payment.Status.PENDING)
                    .order_by("-created_at").first())
        if existing and existing.provider_order_id:
            return existing

        order = cls.client().order.create({
            "amount": int(booking.total_price * Decimal("100")),
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
            booking=booking, amount=booking.total_price, provider=Payment.Provider.RAZORPAY,
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
            raise ValueError("A different payment has already settled this order.")
        cls.client().utility.verify_payment_signature({
            "razorpay_order_id": order_id, "razorpay_payment_id": payment_id, "razorpay_signature": signature,
        })
        payment.mark_paid(payment_id)
        booking = payment.booking
        booking.payment_status = Booking.PaymentStatus.PAID
        if booking.status == Booking.Status.PENDING:
            booking.status = Booking.Status.CONFIRMED
            booking.confirmed_at = timezone.now()
            booking.save(update_fields=["payment_status", "status", "confirmed_at", "updated_at"])
        else:
            booking.save(update_fields=["payment_status", "updated_at"])
        transaction.on_commit(lambda: EmailService.enqueue_payment_success(payment))
        return payment, True

    @classmethod
    @transaction.atomic
    def mark_cash_paid(cls, *, booking, actor):
        booking = Booking.objects.select_for_update().get(pk=booking.pk)
        if booking.payment_status == Booking.PaymentStatus.PAID:
            raise ValueError("This booking is already paid.")
        payment = Payment.objects.create(booking=booking, amount=booking.total_price, provider=Payment.Provider.CASH)
        payment.mark_paid()
        booking.payment_status = Booking.PaymentStatus.PAID
        booking.save(update_fields=["payment_status", "updated_at"])
        transaction.on_commit(lambda: EmailService.enqueue_payment_success(payment))
        return payment

    @classmethod
    @transaction.atomic
    def request_refund(cls, *, payment, requested_by, amount, reason=""):
        payment = Payment.objects.select_for_update().get(pk=payment.pk)
        if payment.status != Payment.Status.PAID:
            raise ValueError("Only a paid payment can be refunded.")
        if amount <= 0 or amount > payment.amount:
            raise ValueError("Refund amount must be greater than zero and no more than the payment amount.")
        return Refund.objects.create(payment=payment, requested_by=requested_by, amount=amount, reason=reason)

    @classmethod
    @transaction.atomic
    def complete_manual_refund(cls, *, refund, reviewer):
        refund = Refund.objects.select_for_update().select_related("payment", "payment__booking").get(pk=refund.pk)
        if refund.status not in [Refund.Status.REQUESTED, Refund.Status.APPROVED, Refund.Status.PROCESSING]:
            raise ValueError("This refund cannot be completed.")
        refund.status, refund.reviewed_by, refund.reviewed_at = Refund.Status.SUCCEEDED, reviewer, timezone.now()
        refund.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])
        payment = refund.payment
        payment.status = Payment.Status.REFUNDED
        payment.save(update_fields=["status", "updated_at"])
        booking = payment.booking
        booking.payment_status = Booking.PaymentStatus.REFUNDED
        booking.save(update_fields=["payment_status", "updated_at"])
        transaction.on_commit(lambda: EmailService.enqueue_refund_success(refund))
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
            provider=Payment.Provider.RAZORPAY, event_id=event_id,
            defaults={"event_type": event_type, "payload": payload if isinstance(payload, dict) else {}, "signature_valid": signature_valid},
        )
        if not created:
            return event, False
        if not signature_valid:
            return event, False
        event.processed_at = timezone.now()
        event.save(update_fields=["processed_at"])
        return event, True

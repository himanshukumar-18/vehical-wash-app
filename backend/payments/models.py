import uuid

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class Payment(models.Model):
    """An immutable-ish payment attempt. A booking can have retried attempts."""

    class Provider(models.TextChoices):
        RAZORPAY = "razorpay", "Razorpay"
        STRIPE = "stripe", "Stripe"
        CASH = "cash", "Cash"
        UPI = "upi", "UPI"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        AUTHORIZED = "authorized", "Authorized"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        CANCELLED = "cancelled", "Cancelled"
        EXPIRED = "expired", "Expired"
        REFUND_INITIATED = "refund_initiated", "Refund initiated"
        REFUNDED = "refunded", "Refunded"
        REFUND_FAILED = "refund_failed", "Refund failed"

    VALID_TRANSITIONS = {
        Status.PENDING: {Status.AUTHORIZED, Status.PAID, Status.FAILED, Status.CANCELLED, Status.EXPIRED},
        Status.AUTHORIZED: {Status.PAID, Status.FAILED, Status.CANCELLED, Status.EXPIRED},
        Status.PAID: {Status.REFUND_INITIATED, Status.REFUNDED},
        Status.FAILED: {Status.PAID},  # Settlement of retried payment attempt
        Status.CANCELLED: set(),
        Status.EXPIRED: set(),
        Status.REFUND_INITIATED: {Status.REFUNDED, Status.REFUND_FAILED},
        Status.REFUNDED: set(),
        Status.REFUND_FAILED: {Status.REFUNDED},
    }

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking = models.ForeignKey("bookings.Booking", on_delete=models.PROTECT, related_name="payments")
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    currency = models.CharField(max_length=3, default="INR")
    provider = models.CharField(max_length=20, choices=Provider.choices)
    status = models.CharField(max_length=24, choices=Status.choices, default=Status.PENDING, db_index=True)
    provider_order_id = models.CharField(max_length=128, blank=True, null=True, unique=True)
    provider_payment_id = models.CharField(max_length=128, blank=True, null=True, unique=True)
    idempotency_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    paid_at = models.DateTimeField(null=True, blank=True)
    failure_code = models.CharField(max_length=80, blank=True)
    failure_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["booking", "status"]), models.Index(fields=["provider", "created_at"])]

    def can_transition_to(self, new_status):
        if self.status == new_status:
            return True
        allowed = self.VALID_TRANSITIONS.get(self.status, set())
        return new_status in allowed

    def transition_to(self, new_status, save=True, **kwargs):
        if self.status == new_status:
            return False
        if not self.can_transition_to(new_status):
            raise ValidationError(
                f"Invalid payment state transition from {self.status} to {new_status}."
            )
        self.status = new_status
        update_fields = ["status", "updated_at"]
        for key, val in kwargs.items():
            setattr(self, key, val)
            update_fields.append(key)
        if save:
            self.save(update_fields=update_fields)
        return True

    def mark_paid(self, provider_payment_id=None):
        if self.status == self.Status.PAID:
            if provider_payment_id and not self.provider_payment_id:
                self.provider_payment_id = provider_payment_id
                self.save(update_fields=["provider_payment_id", "updated_at"])
            return False
        
        provider_id = provider_payment_id or self.provider_payment_id
        paid_time = timezone.now()
        self.transition_to(self.Status.PAID, provider_payment_id=provider_id, paid_at=paid_time)
        return True


class PaymentEvent(models.Model):
    """Deduplicates webhooks and records a forensic gateway audit trail."""
    provider = models.CharField(max_length=20)
    event_id = models.CharField(max_length=128)
    event_type = models.CharField(max_length=100)
    payment = models.ForeignKey(Payment, null=True, blank=True, on_delete=models.SET_NULL, related_name="events")
    payload = models.JSONField(default=dict)
    signature_valid = models.BooleanField(default=False)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["provider", "event_id"], name="unique_provider_event")]


class Refund(models.Model):
    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        APPROVED = "approved", "Approved"
        PROCESSING = "processing", "Processing"
        SUCCEEDED = "succeeded", "Succeeded"
        FAILED = "failed", "Failed"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    payment = models.ForeignKey(Payment, on_delete=models.PROTECT, related_name="refunds")
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="requested_refunds")
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED, db_index=True)
    provider_refund_id = models.CharField(max_length=128, blank=True, null=True, unique=True)
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_refunds")
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

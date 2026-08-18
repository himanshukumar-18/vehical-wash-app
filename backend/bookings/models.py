from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.db.models import Q

from services.models import Service
from slots.models import Slot
from vehicles.models import Vehicle


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending Confirmation"
        CONFIRMED = "confirmed", "Confirmed"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Payment Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Payment Failed"
        REFUNDED = "refunded", "Refunded"

    booking_number = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
    )

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    service = models.ForeignKey(
        Service,
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    slot = models.ForeignKey(
        Slot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bookings",
    )

    booking_date = models.DateField(
        null=True,
        blank=True,
    )

    address = models.TextField()

    customer_note = models.TextField(
        blank=True,
    )

    admin_note = models.TextField(
        blank=True,
    )

    base_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    tax = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )

    confirmed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    cancelled_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    arrival_otp = models.CharField(
        max_length=6,
        blank=True,
        help_text="OTP used to verify customer arrival.",
    )

    otp_verified = models.BooleanField(
        default=False,
        help_text="Whether the arrival OTP has been verified.",
    )

    otp_created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Time when the OTP was generated.",
    )

    otp_verified_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Time when the OTP was successfully verified.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

        indexes = [
            models.Index(fields=["booking_number"]),
            models.Index(fields=["status"]),
            models.Index(fields=["payment_status"]),
            models.Index(fields=["created_at"]),
            models.Index(fields=["customer", "status", "created_at"]),
            models.Index(fields=["booking_date", "status"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=Q(base_price__gte=0) & Q(tax__gte=0) & Q(discount__gte=0) & Q(total_price__gte=0),
                name="booking_amounts_non_negative",
            ),
        ]

    def __str__(self):
        return f"{self.booking_number} - {self.customer.fullname}"

    @property
    def can_cancel(self):
        return self.status in [self.Status.PENDING, self.Status.CONFIRMED]

    @property
    def can_start(self):
        return self.status == self.Status.CONFIRMED

    @property
    def can_complete(self):
        return self.status in [self.Status.CONFIRMED, self.Status.IN_PROGRESS]

    @property
    def is_paid(self):
        return self.payment_status == self.PaymentStatus.PAID

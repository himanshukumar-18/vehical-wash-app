from django.conf import settings
from django.db import models


class Booking(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        ASSIGNED = "assigned", "Assigned"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    booking_number = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    vehicle = models.ForeignKey(
        "vehicles.Vehicle",
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    service = models.ForeignKey(
        "services.Service",
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    slot = models.ForeignKey(
        "slots.Slot",
        on_delete=models.PROTECT,
        related_name="bookings",
    )

    address = models.TextField()

    notes = models.TextField(
        blank=True,
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    tax = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    total = models.DecimalField(
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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
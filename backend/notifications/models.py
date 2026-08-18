from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Category(models.TextChoices):
        ACCOUNT = "account", "Account"
        BOOKING = "booking", "Booking"
        PAYMENT = "payment", "Payment"
        REFUND = "refund", "Refund"
        SYSTEM = "system", "System"

    class Priority(models.TextChoices):
        LOW = "low", "Low"
        NORMAL = "normal", "Normal"
        HIGH = "high", "High"
        URGENT = "urgent", "Urgent"

    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=160)
    body = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.SYSTEM)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.NORMAL)
    action_url = models.CharField(max_length=500, blank=True)
    event_key = models.CharField(max_length=128, null=True, blank=True, unique=True, db_index=True)
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["recipient", "is_read", "created_at"])]

    def __str__(self):
        return f"{self.recipient.email} - {self.title}"

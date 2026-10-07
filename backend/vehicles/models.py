from django.conf import settings
from django.db import models

class Vehicle(models.Model):
    TYPE_HATCHBACK = "hatchback"
    TYPE_SEDAN = "sedan"
    TYPE_SUV = "suv"
    TYPE_LUXURY = "luxury"

    VEHICLE_TYPE_CHOICES = [
        (TYPE_HATCHBACK, "Hatchback"),
        (TYPE_SEDAN, "Sedan"),
        (TYPE_SUV, "SUV"),
        (TYPE_LUXURY, "Luxury"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vehicles",
    )
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    vehicle_type = models.CharField(
        max_length=20,
        choices=VEHICLE_TYPE_CHOICES,
        default=TYPE_HATCHBACK,
    )
    registration_number = models.CharField(max_length=20, db_index=True)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "registration_number"],
                name="unique_user_vehicle_registration",
            ),
        ]

    def __str__(self):
        return f"{self.brand} {self.model} ({self.registration_number})"

    def save(self, *args, **kwargs):
        # Normalize registration number to uppercase without whitespace
        self.registration_number = self.registration_number.strip().upper()
        if self.is_default:
            # Unset default flag on user's existing vehicles
            Vehicle.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models


class Vehicle(models.Model):
    class VehicleType(models.TextChoices):
        HATCHBACK = "hatchback", "Hatchback"
        SEDAN = "sedan", "Sedan"
        SUV = "suv", "SUV"
        MUV = "muv", "MUV"
        LUXURY = "luxury", "Luxury"
        BIKE = "bike", "Bike"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="vehicles",
    )

    brand = models.CharField(max_length=80)
    model = models.CharField(max_length=100)
    color = models.CharField(max_length=50, blank=True)

    vehicle_type = models.CharField(
        max_length=20,
        choices=VehicleType.choices,
        default=VehicleType.HATCHBACK,
    )

    registration_number = models.CharField(
        max_length=20,
        unique=True,
        validators=[
            RegexValidator(
                regex=r"^[A-Z0-9 -]+$",
                message="Use uppercase letters, numbers, spaces, or hyphens only.",
            )
        ],
    )

    image = models.ImageField(
        upload_to="vehicles/",
        blank=True,
        null=True,
    )

    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-created_at"]

    def __str__(self):
        return f"{self.brand} {self.model} - {self.registration_number}"
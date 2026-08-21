from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator


class ServiceArea(models.Model):
    name = models.CharField(
        max_length=150,
        help_text="Name of the service coverage zone (e.g. Hazaribagh Central, Matwari Zone)",
    )
    city = models.CharField(
        max_length=100,
        default="Hazaribagh",
    )
    description = models.TextField(
        blank=True,
    )
    pincodes = models.CharField(
        max_length=255,
        blank=True,
        help_text="Comma-separated list of pincodes served (e.g. 825301, 825302)",
    )
    latitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Center latitude coordinate",
    )
    longitude = models.DecimalField(
        max_digits=9,
        decimal_places=6,
        null=True,
        blank=True,
        help_text="Center longitude coordinate",
    )
    radius_km = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=Decimal("15.00"),
        help_text="Coverage radius in kilometers",
    )
    travel_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Travel fee applied for doorstep service in this area",
    )
    min_booking_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Minimum order subtotal required for this service area",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Designates whether doorstep service is currently active in this area",
    )
    display_order = models.PositiveIntegerField(
        default=0,
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
    )
    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["display_order", "name"]

    def __str__(self):
        return f"{self.name} ({self.city}) - Travel Charge: ₹{self.travel_charge}"

    def matches_address(self, address_text, lat=None, lng=None):
        """
        Check if an address string, pincode, or coordinate falls into this service area.
        Enforces Hazaribagh coverage restriction.
        """
        if not self.is_active:
            return False

        addr_lower = (address_text or "").strip().lower()
        if not addr_lower:
            return True

        # Non-Hazaribagh cities check
        unsupported_cities = [
            "ranchi", "patna", "dhanbad", "bokaro", "jamshedpur",
            "ramgarh", "giridih", "kolkata", "delhi", "mumbai",
            "bangalore", "hyderabad", "chennai", "pune", "ahmedabad"
        ]

        if any(city_name in addr_lower for city_name in unsupported_cities) and "hazaribagh" not in addr_lower:
            return False

        # 1. Pincode match check
        if self.pincodes and address_text:
            pincode_list = [p.strip() for p in self.pincodes.split(",") if p.strip()]
            for pin in pincode_list:
                if pin in address_text:
                    return True

        # 2. City or Area Name substring match check
        if self.name.lower() in addr_lower or self.city.lower() in addr_lower:
            return True

        # 3. Default fallback if area has no restricted pincodes and address mentions hazaribagh or generic doorstep
        if not self.pincodes and ("hazaribagh" in addr_lower or "doorstep" in addr_lower or "street" in addr_lower or "road" in addr_lower or "chowk" in addr_lower or "colony" in addr_lower or len(addr_lower) < 5):
            return True

        return False

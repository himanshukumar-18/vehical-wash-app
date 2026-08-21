from decimal import Decimal
from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

from services.models import Service
from service_areas.models import ServiceArea


class Offer(models.Model):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "percentage", "Percentage Discount (%)"
        FIXED = "fixed", "Fixed Amount Discount (₹)"

    name = models.CharField(
        max_length=150,
        help_text="Offer title (e.g. First Wash 10% OFF, Monsoon Special ₹150 OFF)",
    )
    description = models.TextField(
        blank=True,
    )
    discount_type = models.CharField(
        max_length=20,
        choices=DiscountType.choices,
        default=DiscountType.PERCENTAGE,
    )
    discount_value = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
        help_text="Percentage value (e.g. 10.00 for 10%) or fixed amount (e.g. 150.00 for ₹150)",
    )
    max_discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Maximum discount cap for percentage offers (optional)",
    )
    min_booking_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Minimum subtotal required to qualify for this offer",
    )
    start_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Offer start date & time (optional)",
    )
    end_date = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Offer expiration date & time (optional)",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Toggle to activate or deactivate the offer",
    )
    applicable_services = models.ManyToManyField(
        Service,
        blank=True,
        related_name="applicable_offers",
        help_text="Services eligible for this offer. Leave empty to apply to ALL services.",
    )
    applicable_service_areas = models.ManyToManyField(
        ServiceArea,
        blank=True,
        related_name="applicable_offers",
        help_text="Service areas eligible for this offer. Leave empty to apply to ALL areas.",
    )
    first_booking_only = models.BooleanField(
        default=False,
        help_text="Restrict offer exclusively to customer's first completed wash",
    )
    usage_limit = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Total overall redemption limit system-wide (optional)",
    )
    per_customer_usage_limit = models.PositiveIntegerField(
        default=1,
        help_text="Maximum times a single customer can redeem this offer",
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
        ordering = ["display_order", "-created_at"]

    def __str__(self):
        val_str = f"{self.discount_value}%" if self.discount_type == self.DiscountType.PERCENTAGE else f"₹{self.discount_value}"
        return f"{self.name} ({val_str} OFF)"

    def is_eligible(self, customer, service, service_area, subtotal):
        """
        Comprehensive eligibility evaluation.
        """
        now = timezone.now()

        # 1. Active status check
        if not self.is_active:
            return False, "Offer is inactive."

        # 2. Date range checks
        if self.start_date and now < self.start_date:
            return False, "Offer is not yet active."
        if self.end_date and now > self.end_date:
            return False, "Offer has expired."

        # 3. Minimum subtotal check
        if subtotal < self.min_booking_amount:
            return False, f"Minimum booking amount of ₹{self.min_booking_amount} required."

        # 4. Applicable services check
        if self.applicable_services.exists() and not self.applicable_services.filter(id=service.id).exists():
            return False, "Offer is not applicable to the selected service."

        # 5. Applicable service areas check
        if service_area and self.applicable_service_areas.exists() and not self.applicable_service_areas.filter(id=service_area.id).exists():
            return False, "Offer is not applicable to the selected service area."

        # 6. Customer First Booking check
        if self.first_booking_only and customer and customer.is_authenticated:
            past_bookings = customer.bookings.filter(status__in=["completed", "confirmed", "in_progress"]).count()
            if past_bookings > 0:
                return False, "Offer valid for first-time customers only."

        # 7. Total System Usage Limit check
        if self.usage_limit is not None:
            total_used = self.usages.count()
            if total_used >= self.usage_limit:
                return False, "Offer usage limit has been reached."

        # 8. Per Customer Usage Limit check
        if customer and customer.is_authenticated and self.per_customer_usage_limit > 0:
            user_used = self.usages.filter(user=customer).count()
            if user_used >= self.per_customer_usage_limit:
                return False, f"You have already redeemed this offer {user_used} time(s)."

        return True, "Eligible"

    def calculate_discount(self, subtotal):
        """
        Calculate actual discount amount in Decimal.
        """
        if self.discount_type == self.DiscountType.PERCENTAGE:
            raw_discount = (subtotal * Decimal(str(self.discount_value))) / Decimal("100.00")
            if self.max_discount_amount and raw_discount > self.max_discount_amount:
                return self.max_discount_amount
            return raw_discount
        else:
            return min(Decimal(str(self.discount_value)), subtotal)


class OfferUsage(models.Model):
    offer = models.ForeignKey(
        Offer,
        on_delete=models.CASCADE,
        related_name="usages",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="offer_usages",
    )
    booking = models.ForeignKey(
        "bookings.Booking",
        on_delete=models.CASCADE,
        related_name="offer_usages",
    )
    discount_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    used_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-used_at"]

    def __str__(self):
        return f"{self.user.email} - {self.offer.name} (₹{self.discount_amount})"

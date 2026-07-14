import random
import uuid
from decimal import Decimal, ROUND_HALF_UP

from django.utils import timezone


def generate_booking_number():
    """
    Example:
    BK-20260714-A8F3D1
    """

    today = timezone.localdate().strftime("%Y%m%d")
    unique = uuid.uuid4().hex[:6].upper()

    return f"BK-{today}-{unique}"


def generate_arrival_otp(length=4):
    """
    Generate numeric OTP.

    Example:
    4821
    """

    return "".join(
        random.choices(
            "0123456789",
            k=length,
        )
    )


def calculate_tax(
    base_price,
    tax_percentage=Decimal("18.00"),
):
    """
    GST Calculation.

    Example:
    Base Price = 100
    GST = 18%
    Returns 18
    """

    tax = (
        Decimal(base_price)
        * Decimal(tax_percentage)
        / Decimal("100")
    )

    return tax.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def calculate_discount(
    base_price,
    discount_percentage=Decimal("0.00"),
):
    """
    Percentage discount.
    """

    discount = (
        Decimal(base_price)
        * Decimal(discount_percentage)
        / Decimal("100")
    )

    return discount.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def calculate_total(
    base_price,
    tax,
    discount,
):
    """
    Total Amount.

    Formula:

    Total = Base + Tax - Discount
    """

    total = (
        Decimal(base_price)
        + Decimal(tax)
        - Decimal(discount)
    )

    return total.quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP,
    )


def format_currency(amount):
    """
    Example:

    ₹499.00
    """

    return f"₹{Decimal(amount):,.2f}"


def booking_summary(booking):
    """
    Returns booking summary dictionary.
    """

    return {
        "booking_number": booking.booking_number,
        "customer": booking.customer.fullname,
        "vehicle": str(booking.vehicle),
        "service": booking.service.name,
        "date": booking.slot.date,
        "time": (
            f"{booking.slot.start_time}"
            f" - "
            f"{booking.slot.end_time}"
        ),
        "status": booking.status,
        "payment_status": booking.payment_status,
        "total": format_currency(
            booking.total_price,
        ),
    }
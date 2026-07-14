from decimal import Decimal

from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone


def format_currency(amount):
    """
    Format decimal amount as Indian Rupees.
    """

    if amount is None:
        amount = Decimal("0.00")

    return f"₹ {Decimal(amount):,.2f}"


def get_support_email():
    """
    Return support email.
    """

    return settings.DEFAULT_FROM_EMAIL


def get_frontend_url():
    """
    Return frontend base URL.
    """

    return settings.FRONTEND_URL.rstrip("/")


def booking_url(booking):
    """
    Customer booking details page.
    """

    return (
        f"{get_frontend_url()}"
        f"/bookings/{booking.booking_number}"
    )


def review_url():
    """
    Customer review page.
    """

    return (
        f"{get_frontend_url()}"
        "/review"
    )


def otp_expiry_minutes():
    """
    OTP expiry duration.
    """

    return 30


def otp_expiry_time(booking):
    """
    Calculate OTP expiry timestamp.
    """

    if booking.otp_created_at is None:
        return None

    return booking.otp_created_at + timezone.timedelta(
        minutes=otp_expiry_minutes()
    )


def render_email_template(
    template_name,
    context,
):
    """
    Render HTML email template.
    """

    context.setdefault(
        "support_email",
        get_support_email(),
    )

    context.setdefault(
        "website_url",
        get_frontend_url(),
    )

    return render_to_string(
        template_name,
        context,
    )


def payment_summary(booking):
    """
    Payment summary dictionary.
    """

    return {
        "base_price": format_currency(
            booking.base_price,
        ),
        "tax": format_currency(
            booking.tax,
        ),
        "discount": format_currency(
            booking.discount,
        ),
        "total": format_currency(
            booking.total_price,
        ),
    }


def booking_context(booking):
    """
    Common email context.
    """

    return {
        "booking": booking,
        "website_url": booking_url(
            booking,
        ),
        "review_url": review_url(),
        "support_email": get_support_email(),
        "payment": payment_summary(
            booking,
        ),
        "otp_expiry_minutes": otp_expiry_minutes(),
        "otp_expiry_time": otp_expiry_time(
            booking,
        ),
    }
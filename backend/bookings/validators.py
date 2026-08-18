from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_service(service):
    """
    Ensure the selected service is active.
    """
    if not service.is_active:
        raise ValidationError("Selected service is not available.")


def validate_vehicle(customer, vehicle):
    """
    Ensure vehicle belongs to the logged-in customer.
    """
    if vehicle.owner_id != customer.id:
        raise ValidationError("This vehicle does not belong to you.")


def validate_booking_date(booking_date):
    """
    Prevent booking for past dates.
    """
    if not booking_date:
        raise ValidationError("Service date is required.")

    today = timezone.localdate()
    if booking_date < today:
        raise ValidationError("Cannot book a service for a past date.")


def validate_booking_status(booking):
    """
    Booking must be pending or confirmed to be cancelled.
    """
    if booking.status not in [
        booking.Status.PENDING,
        booking.Status.CONFIRMED,
    ]:
        raise ValidationError("Booking cannot be cancelled.")


def validate_payment_status(booking):
    """
    Booking must be paid before completion.
    """
    if booking.payment_status != booking.PaymentStatus.PAID:
        raise ValidationError("Payment is not completed.")


def validate_booking_available(customer, vehicle, service, booking_date=None, slot=None):
    """
    Master validator before creating mobile car wash booking.
    """
    validate_vehicle(customer, vehicle)
    validate_service(service)
    if booking_date:
        validate_booking_date(booking_date)
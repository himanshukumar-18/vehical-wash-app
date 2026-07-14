from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_service(service):
    """
    Ensure the selected service is active.
    """
    if not service.is_active:
        raise ValidationError(
            "Selected service is not available."
        )


def validate_vehicle(customer, vehicle):
    """
    Ensure vehicle belongs to the logged-in customer.
    """
    if vehicle.owner_id != customer.id:
        raise ValidationError(
            "This vehicle does not belong to you."
        )


def validate_slot(slot):
    """
    Validate slot before booking.
    """

    if not slot.is_active:
        raise ValidationError(
            "Selected slot is inactive."
        )

    if slot.is_blocked:
        raise ValidationError(
            "Selected slot is blocked."
        )

    if slot.booked_count >= slot.capacity:
        raise ValidationError(
            "Selected slot is full."
        )


def validate_slot_date(slot):
    """
    Prevent booking for past dates.
    """
    today = timezone.localdate()

    if slot.date < today:
        raise ValidationError(
            "Cannot book a past slot."
        )


def validate_duplicate_booking(customer, slot):
    """
    Customer cannot book the same slot twice.
    """
    from .models import Booking

    exists = Booking.objects.filter(
        customer=customer,
        slot=slot,
    ).exclude(
        status=Booking.Status.CANCELLED
    ).exists()

    if exists:
        raise ValidationError(
            "You already have a booking for this slot."
        )


def validate_booking_status(booking):
    """
    Booking must be pending or confirmed to be cancelled.
    """
    if booking.status not in [
        booking.Status.PENDING,
        booking.Status.CONFIRMED,
    ]:
        raise ValidationError(
            "Booking cannot be cancelled."
        )


def validate_payment_status(booking):
    """
    Booking must be paid before completion.
    """
    if booking.payment_status != booking.PaymentStatus.PAID:
        raise ValidationError(
            "Payment is not completed."
        )


def validate_booking_available(customer, vehicle, service, slot):
    """
    Master validator before creating booking.
    """

    validate_vehicle(customer, vehicle)

    validate_service(service)

    validate_slot(slot)

    validate_slot_date(slot)

    validate_duplicate_booking(customer, slot)
from django.core.exceptions import ValidationError
from django.utils import timezone

from .models import Slot
from .models import Holiday


def validate_slot_time(start_time, end_time):
    """
    Ensure slot end time is after start time.
    """
    if end_time <= start_time:
        raise ValidationError(
            "End time must be greater than start time."
        )


def validate_slot_capacity(capacity):
    """
    Capacity must be greater than zero.
    """
    if capacity < 1:
        raise ValidationError(
            "Capacity must be at least 1."
        )


def validate_slot_duration(duration):
    """
    Slot duration between 15 minutes and 4 hours.
    """
    if duration < 15:
        raise ValidationError(
            "Slot duration must be at least 15 minutes."
        )

    if duration > 240:
        raise ValidationError(
            "Slot duration cannot exceed 240 minutes."
        )


def validate_duplicate_slot(slot_date, start_time, end_time, instance=None):
    """
    Prevent duplicate slot creation.
    """

    queryset = Slot.objects.filter(
        date=slot_date,
        start_time=start_time,
        end_time=end_time,
    )

    if instance:
        queryset = queryset.exclude(pk=instance.pk)

    if queryset.exists():
        raise ValidationError(
            "A slot already exists for this time."
        )


def validate_holiday(slot_date):
    """
    Booking slots cannot exist on active holidays.
    """

    if Holiday.objects.filter(
        date=slot_date,
        is_active=True,
    ).exists():
        raise ValidationError(
            "Cannot create slots on a holiday."
        )


def validate_future_date(slot_date):
    """
    Slots cannot be generated in the past.
    """

    today = timezone.localdate()

    if slot_date < today:
        raise ValidationError(
            "Cannot create slots for past dates."
        )


def validate_booking_capacity(slot):
    """
    Ensure slot still has available capacity.
    """

    if slot.booked_count >= slot.capacity:
        raise ValidationError(
            "This slot is already full."
        )


def validate_slot_active(slot):
    """
    Slot must be active.
    """

    if not slot.is_active:
        raise ValidationError(
            "This slot is inactive."
        )


def validate_slot_blocked(slot):
    """
    Slot must not be blocked.
    """

    if slot.is_blocked:
        raise ValidationError(
            "This slot has been blocked."
        )


def validate_slot_available(slot):
    """
    Final validation before booking.
    """

    validate_slot_active(slot)
    validate_slot_blocked(slot)
    validate_booking_capacity(slot)
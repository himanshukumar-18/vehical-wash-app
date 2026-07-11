from datetime import datetime, timedelta


def combine_date_time(slot_date, slot_time):
    """
    Combine date and time into a datetime object.
    """
    return datetime.combine(slot_date, slot_time)


def generate_time_intervals(
    opening_time,
    closing_time,
    slot_duration,
    slot_date,
):
    """
    Generate slot intervals.

    Example:

    09:00
    09:30
    10:00
    10:30
    """

    current = combine_date_time(
        slot_date,
        opening_time,
    )

    closing = combine_date_time(
        slot_date,
        closing_time,
    )

    duration = timedelta(
        minutes=slot_duration,
    )

    while current + duration <= closing:

        yield (
            current.time(),
            (current + duration).time(),
        )

        current += duration


def calculate_remaining_capacity(
    capacity,
    booked_count,
):
    """
    Remaining booking capacity.
    """

    return max(
        capacity - booked_count,
        0,
    )


def calculate_occupancy_rate(
    capacity,
    booked_count,
):
    """
    Returns occupancy percentage.
    """

    if capacity == 0:
        return 0

    return round(
        (booked_count / capacity) * 100,
        2,
    )


def slot_is_full(
    capacity,
    booked_count,
):
    """
    Check if slot is full.
    """

    return booked_count >= capacity


def determine_slot_status(
    *,
    is_active,
    is_blocked,
    capacity,
    booked_count,
):
    """
    Returns slot status.

    Available
    Full
    Blocked
    Inactive
    """

    if not is_active:
        return "Inactive"

    if is_blocked:
        return "Blocked"

    if slot_is_full(
        capacity,
        booked_count,
    ):
        return "Full"

    return "Available"


def format_time_range(
    start_time,
    end_time,
):
    """
    Example:

    09:00 AM - 09:30 AM
    """

    return (
        f"{start_time.strftime('%I:%M %p')} - "
        f"{end_time.strftime('%I:%M %p')}"
    )


def next_slot_time(
    current_time,
    duration_minutes,
):
    """
    Calculate next slot start time.
    """

    return (
        datetime.combine(
            datetime.today(),
            current_time,
        )
        + timedelta(minutes=duration_minutes)
    ).time()
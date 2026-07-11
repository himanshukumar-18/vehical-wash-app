from datetime import timedelta

from django.db import transaction

from .models import (
    BusinessHours,
    Holiday,
    Slot,
)
from .utils import generate_time_intervals


class SlotGeneratorService:
    """
    Production-ready service for generating appointment slots.
    """

    @staticmethod
    @transaction.atomic
    def generate_slots(start_date, end_date):
        """
        Generate slots between two dates using Business Hours.
        Skips holidays and existing slots.
        """

        created_slots = 0
        skipped_slots = 0

        current_date = start_date

        while current_date <= end_date:

            weekday = current_date.weekday()

            # Get business hours for the day
            try:
                business_hours = BusinessHours.objects.get(
                    day=weekday,
                    is_open=True,
                )
            except BusinessHours.DoesNotExist:
                current_date += timedelta(days=1)
                continue

            # Skip holidays
            if Holiday.objects.filter(
                date=current_date,
                is_active=True,
            ).exists():
                current_date += timedelta(days=1)
                continue

            # Generate all time intervals using utils.py
            for start_time, end_time in generate_time_intervals(
                opening_time=business_hours.opening_time,
                closing_time=business_hours.closing_time,
                slot_duration=business_hours.slot_duration,
                slot_date=current_date,
            ):

                slot, created = Slot.objects.get_or_create(
                    date=current_date,
                    start_time=start_time,
                    end_time=end_time,
                    defaults={
                        "capacity": business_hours.default_capacity,
                    },
                )

                if created:
                    created_slots += 1
                else:
                    skipped_slots += 1

            current_date += timedelta(days=1)

        return {
            "success": True,
            "message": "Slot generation completed successfully.",
            "created_slots": created_slots,
            "skipped_slots": skipped_slots,
            "total_processed": created_slots + skipped_slots,
        }
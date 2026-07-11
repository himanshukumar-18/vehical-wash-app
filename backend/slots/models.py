from django.conf import settings
from django.db import models

from .utils import (
    calculate_remaining_capacity,
    determine_slot_status,
)

from .validators import (
    validate_slot_capacity,
    validate_slot_duration,
    validate_slot_time,
)

# slot
class Slot(models.Model):
    """
    Appointment time slot.
    """

    date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    capacity = models.PositiveIntegerField(default=2)

    booked_count = models.PositiveIntegerField(default=0)

    is_active = models.BooleanField(default=True)

    is_blocked = models.BooleanField(default=False)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_slots",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["date", "start_time"]

        constraints = [
            models.UniqueConstraint(
                fields=["date", "start_time", "end_time"],
                name="unique_slot_time",
            )
        ]

    def __str__(self):
        return f"{self.date} | {self.start_time} - {self.end_time}"

    @property
    def remaining_capacity(self):
        return calculate_remaining_capacity(
            self.capacity,
            self.booked_count,
        )

    @property
    def is_full(self):
        return self.booked_count >= self.capacity

    @property
    def status(self):
        return determine_slot_status(
            is_active=self.is_active,
            is_blocked=self.is_blocked,
            capacity=self.capacity,
            booked_count=self.booked_count,
        )

    def clean(self):
        validate_slot_time(
            self.start_time,
            self.end_time,
        )

        validate_slot_capacity(
            self.capacity,
        )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class BusinessHours(models.Model):
    """
    Weekly business schedule.
    Used by the slot generator to create daily slots.
    """

    class WeekDay(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    day = models.PositiveSmallIntegerField(
        choices=WeekDay.choices,
        unique=True,
    )

    opening_time = models.TimeField()

    closing_time = models.TimeField()

    slot_duration = models.PositiveIntegerField(
        default=30,
        help_text="Duration of each slot in minutes.",
    )

    default_capacity = models.PositiveIntegerField(
        default=4,
        help_text="Maximum bookings allowed per slot.",
    )

    is_open = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["day"]
        verbose_name = "Business Hours"
        verbose_name_plural = "Business Hours"

    def __str__(self):
        return self.get_day_display()

    def clean(self):
        validate_slot_time(
            self.opening_time,
            self.closing_time,
        )

        validate_slot_duration(
            self.slot_duration,
        )

        validate_slot_capacity(
            self.default_capacity,
        )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Holiday(models.Model):
    """
    Dates when the business is unavailable.
    Slot generation skips these dates automatically.
    """

    class HolidayType(models.TextChoices):
        PUBLIC = "public", "Public Holiday"
        MAINTENANCE = "maintenance", "Maintenance"
        STAFF = "staff", "Staff Leave"
        CUSTOM = "custom", "Custom"

    title = models.CharField(
        max_length=150,
    )

    date = models.DateField(
        unique=True,
    )

    holiday_type = models.CharField(
        max_length=20,
        choices=HolidayType.choices,
        default=HolidayType.PUBLIC,
    )

    description = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["date"]
        verbose_name = "Holiday"
        verbose_name_plural = "Holidays"

    def __str__(self):
        return f"{self.date} - {self.title}"

    def clean(self):
        super().clean()

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
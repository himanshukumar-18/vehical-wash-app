from django.contrib import admin

from .models import (
    BusinessHours,
    Holiday,
    Slot,
)


@admin.register(Slot)
class SlotAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "start_time",
        "end_time",
        "capacity",
        "booked_count",
        "remaining_capacity_display",
        "status_display",
        "is_active",
        "is_blocked",
    )

    list_filter = (
        "date",
        "is_active",
        "is_blocked",
    )

    search_fields = (
        "date",
    )

    ordering = (
        "date",
        "start_time",
    )

    readonly_fields = (
        "booked_count",
        "remaining_capacity_display",
        "status_display",
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Schedule",
            {
                "fields": (
                    "date",
                    "start_time",
                    "end_time",
                )
            },
        ),
        (
            "Capacity",
            {
                "fields": (
                    "capacity",
                    "booked_count",
                    "remaining_capacity_display",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "status_display",
                    "is_active",
                    "is_blocked",
                )
            },
        ),
        (
            "Audit",
            {
                "fields": (
                    "created_by",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    actions = (
        "block_slots",
        "unblock_slots",
        "activate_slots",
        "deactivate_slots",
    )

    def remaining_capacity_display(self, obj):
        return obj.remaining_capacity

    remaining_capacity_display.short_description = "Remaining"

    def status_display(self, obj):
        return obj.status

    status_display.short_description = "Status"

    @admin.action(description="Block selected slots")
    def block_slots(self, request, queryset):
        queryset.update(is_blocked=True)

    @admin.action(description="Unblock selected slots")
    def unblock_slots(self, request, queryset):
        queryset.update(is_blocked=False)

    @admin.action(description="Activate selected slots")
    def activate_slots(self, request, queryset):
        queryset.update(is_active=True)

    @admin.action(description="Deactivate selected slots")
    def deactivate_slots(self, request, queryset):
        queryset.update(is_active=False)


@admin.register(BusinessHours)
class BusinessHoursAdmin(admin.ModelAdmin):
    list_display = (
        "get_day_display",
        "opening_time",
        "closing_time",
        "slot_duration",
        "default_capacity",
        "is_open",
    )

    list_editable = (
        "opening_time",
        "closing_time",
        "slot_duration",
        "default_capacity",
        "is_open",
    )

    ordering = ("day",)

    list_filter = (
        "is_open",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Business Schedule",
            {
                "fields": (
                    "day",
                    "is_open",
                )
            },
        ),
        (
            "Working Hours",
            {
                "fields": (
                    "opening_time",
                    "closing_time",
                )
            },
        ),
        (
            "Slot Settings",
            {
                "fields": (
                    "slot_duration",
                    "default_capacity",
                )
            },
        ),
        (
            "Audit",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )


@admin.register(Holiday)
class HolidayAdmin(admin.ModelAdmin):
    list_display = (
        "date",
        "title",
        "holiday_type",
        "is_active",
    )

    list_filter = (
        "holiday_type",
        "is_active",
    )

    search_fields = (
        "title",
        "description",
    )

    ordering = (
        "date",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    fieldsets = (
        (
            "Holiday",
            {
                "fields": (
                    "title",
                    "holiday_type",
                    "date",
                    "description",
                    "is_active",
                )
            },
        ),
        (
            "Audit",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
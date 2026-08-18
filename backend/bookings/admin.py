from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    """
    Production-ready Booking Admin
    """

    list_display = (
        "booking_number",
        "customer",
        "service",
        "vehicle",
        "slot_date",
        "slot_time",
        "status",
        "payment_status",
        "total_price",
        "created_at",
    )

    list_filter = (
        "status",
        "payment_status",
        "slot__date",
        "service",
        "created_at",
    )

    search_fields = (
        "booking_number",
        "customer__fullname",
        "customer__email",
        "vehicle__registration_number",
        "service__name",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "booking_number",
        "base_price",
        "tax",
        "discount",
        "total_price",
        "arrival_otp",
        "confirmed_at",
        "started_at",
        "completed_at",
        "cancelled_at",
        "created_at",
        "updated_at",
    )

    autocomplete_fields = (
        "customer",
        "vehicle",
        "service",
        "slot",
    )

    list_per_page = 25

    date_hierarchy = "created_at"

    actions = (
        "mark_confirmed",
        "mark_completed",
        "mark_cancelled",
        "mark_paid",
    )

    fieldsets = (
        (
            "Booking Information",
            {
                "fields": (
                    "booking_number",
                    "customer",
                    "vehicle",
                    "service",
                    "slot",
                )
            },
        ),
        (
            "Pricing",
            {
                "fields": (
                    "base_price",
                    "tax",
                    "discount",
                    "total_price",
                )
            },
        ),
        (
            "Status",
            {
                "fields": (
                    "status",
                    "payment_status",
                    "arrival_otp",
                )
            },
        ),
        (
            "Notes",
            {
                "fields": (
                    "address",
                    "customer_note",
                    "admin_note",
                )
            },
        ),
        (
            "Timeline",
            {
                "classes": ("collapse",),
                "fields": (
                    "confirmed_at",
                    "started_at",
                    "completed_at",
                    "cancelled_at",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    @admin.display(description="Booking Date")
    def slot_date(self, obj):
        return obj.booking_date or (obj.slot.date if obj.slot else "N/A")

    @admin.display(description="Slot / Time")
    def slot_time(self, obj):
        if obj.slot:
            return f"{obj.slot.start_time} - {obj.slot.end_time}"
        return "Doorstep Service"

    @admin.action(description="Mark selected bookings as Confirmed")
    def mark_confirmed(self, request, queryset):
        queryset.filter(
            status=Booking.Status.PENDING
        ).update(
            status=Booking.Status.CONFIRMED
        )

    @admin.action(description="Mark selected bookings as Completed")
    def mark_completed(self, request, queryset):
        queryset.filter(
            status=Booking.Status.IN_PROGRESS
        ).update(
            status=Booking.Status.COMPLETED
        )

    @admin.action(description="Mark selected bookings as Cancelled")
    def mark_cancelled(self, request, queryset):
        queryset.exclude(
            status=Booking.Status.COMPLETED
        ).update(
            status=Booking.Status.CANCELLED
        )

    @admin.action(description="Mark payment as Paid")
    def mark_paid(self, request, queryset):
        queryset.update(
            payment_status=Booking.PaymentStatus.PAID
        )
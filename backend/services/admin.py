from django.contrib import admin

from .models import Service


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "price",
        "duration_minutes",
        "is_active",
        "is_featured",
        "display_order",
    )

    list_editable = (
        "is_active",
        "is_featured",
        "display_order",
    )

    list_filter = ("is_active", "is_featured")
    search_fields = ("name", "short_description")
    readonly_fields = ("created_at", "updated_at")

    fieldsets = (
        (
            "Service Details",
            {
                "fields": (
                    "name",
                    "slug",
                    "short_description",
                    "description",
                    "image",
                )
            },
        ),
        (
            "Pricing & Duration",
            {
                "fields": (
                    "price",
                    "duration_minutes",
                )
            },
        ),
        (
            "Visibility",
            {
                "fields": (
                    "is_active",
                    "is_featured",
                    "display_order",
                )
            },
        ),
        (
            "Timestamps",
            {
                "fields": (
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )
from django.contrib import admin

from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        "registration_number",
        "brand",
        "model",
        "vehicle_type",
        "owner",
        "is_default",
        "created_at",
    )

    list_filter = ("vehicle_type", "is_default")
    search_fields = (
        "registration_number",
        "brand",
        "model",
        "owner__fullname",
        "owner__email",
    )

    list_select_related = ("owner",)
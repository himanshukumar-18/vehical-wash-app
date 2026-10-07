from django.contrib import admin
from .models import Vehicle

@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = ("brand", "model", "vehicle_type", "registration_number", "user", "is_default", "created_at")
    list_filter = ("vehicle_type", "is_default", "created_at")
    search_fields = ("brand", "model", "registration_number", "user__email", "user__phone")
    raw_id_fields = ("user",)

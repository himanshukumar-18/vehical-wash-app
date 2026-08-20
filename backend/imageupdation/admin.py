from django.contrib import admin
from .models import DynamicImage


@admin.register(DynamicImage)
class DynamicImageAdmin(admin.ModelAdmin):
    list_display = ("title", "key", "category", "format", "recommended_resolution", "is_active", "updated_at")
    list_filter = ("category", "is_active", "format")
    search_fields = ("title", "key", "badge_tag", "description")
    ordering = ("category", "key")

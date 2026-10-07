from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, OTP

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("email", "fullname", "phone", "is_email_verified", "is_phone_verified", "is_staff", "date_joined")
    list_filter = ("is_email_verified", "is_phone_verified", "is_staff", "is_superuser")
    search_fields = ("email", "fullname", "phone")
    ordering = ("-date_joined",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("fullname", "phone")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "is_email_verified", "is_phone_verified", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "password", "fullname", "phone"),
        }),
    )

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ("identifier", "purpose", "attempts", "max_attempts", "is_used", "expires_at", "created_at")
    list_filter = ("purpose", "is_used", "created_at")
    search_fields = ("identifier",)
    readonly_fields = ("otp_hash", "created_at")

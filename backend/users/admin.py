from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Production-ready User Admin
    """

    list_display = (
        "email",
        "fullname",
        "role",
        "is_verified",
        "is_active",
        "is_staff",
        "created_at",
    )

    list_filter = (
        "role",
        "is_verified",
        "is_active",
        "is_staff",
        "is_superuser",
        "created_at",
    )

    search_fields = (
        "email",
        "fullname",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "last_login",
    )

    fieldsets = (
        (
            "User Information",
            {
                "fields": (
                    "email",
                    "password",
                    "fullname",
                    "role",
                    "is_verified",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Important Dates",
            {
                "fields": (
                    "last_login",
                    "created_at",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "fullname",
                    "role",
                    "password1",
                    "password2",
                    "is_verified",
                    "is_active",
                    "is_staff",
                ),
            },
        ),
    )
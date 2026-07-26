from rest_framework.permissions import BasePermission


class IsAdminOrStaff(BasePermission):
    message = "Only admin or staff users can manage services."

    def has_permission(self, request, view):
        user = request.user

        return bool(
            user
            and user.is_authenticated
            and user.role in ["admin", "manager", "staff"]
        )

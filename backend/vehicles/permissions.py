from rest_framework.permissions import BasePermission


class IsOwnerOrAdminStaff(BasePermission):
    message = "You do not have permission to access this vehicle."

    def has_object_permission(self, request, view, obj):
        if request.user.role in ["admin", "manager", "staff"]:
            return True

        return obj.owner == request.user

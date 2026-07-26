from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminOrStaff(BasePermission):
    """
    Allow access only to Admin or Staff users.
    """

    message = "You do not have permission to perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in ["admin", "manager", "staff"]
        )


class IsCustomer(BasePermission):
    """
    Allow access only to Customers.
    """

    message = "Only customers can perform this action."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "customer"
        )


class IsBookingOwner(BasePermission):
    """
    Customer can access only their own booking.
    Admin and Staff have full access.
    """

    message = "You can only access your own bookings."

    def has_object_permission(self, request, view, obj):

        # Admin & Staff
        if request.user.role in ["admin", "manager", "staff"]:
            return True

        # Customer
        return obj.customer == request.user


class IsBookingOwnerOrReadOnly(BasePermission):
    """
    Customer can only read their own booking.
    Admin & Staff can edit.
    """

    message = "Permission denied."

    def has_object_permission(self, request, view, obj):

        if request.user.role in ["admin", "manager", "staff"]:
            return True

        if request.method in SAFE_METHODS:
            return obj.customer == request.user

        return False


class CanCancelBooking(BasePermission):
    """
    Customer can cancel only their own booking.
    """

    message = "You are not allowed to cancel this booking."

    def has_object_permission(self, request, view, obj):

        if request.user.role in ["admin", "manager", "staff"]:
            return True

        return (
            obj.customer == request.user
            and obj.can_cancel
        )


class CanUpdateBookingStatus(BasePermission):
    """
    Only Admin & Staff can update booking status.
    """

    message = "Only Admin or Staff can update booking status."

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in ["admin", "manager", "staff"]
        )


class CanViewDashboard(BasePermission):
    """
    Dashboard is restricted to Admin & Staff.
    """

    message = "Dashboard access denied."

    def has_permission(self, request, view):

        return (
            request.user.is_authenticated
            and request.user.role in ["admin", "manager", "staff"]
        )

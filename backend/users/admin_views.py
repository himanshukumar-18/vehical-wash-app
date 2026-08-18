from django.db.models import Q, Sum
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from bookings.models import Booking
from bookings.permissions import IsAdminOrStaff
from vehicles.models import Vehicle
from .models import User


class AdminUserViewSet(viewsets.ViewSet):
    """
    Admin & Manager customer directory management endpoint.
    Provides customer listing, details, and emergency account deletion.
    """

    permission_classes = [IsAdminOrStaff]

    def list(self, request):
        role_filter = request.query_params.get("role")
        search_query = request.query_params.get("search", "").strip()

        queryset = User.objects.all().order_by("-created_at")

        if role_filter and role_filter != "All":
            queryset = queryset.filter(role=role_filter.lower())

        if search_query:
            queryset = queryset.filter(
                Q(fullname__icontains=search_query)
                | Q(email__icontains=search_query)
                | Q(id__icontains=search_query)
            )

        results = []
        for user in queryset:
            user_bookings = Booking.objects.filter(customer=user)
            total_bookings = user_bookings.count()
            completed_bookings = user_bookings.filter(status=Booking.Status.COMPLETED).count()
            cancelled_bookings = user_bookings.filter(status=Booking.Status.CANCELLED).count()
            total_spent = user_bookings.filter(status=Booking.Status.COMPLETED).aggregate(s=Sum("total_price"))["s"] or 0

            # Derive business status
            if total_bookings >= 5 or total_spent >= 5000:
                cust_status = "VIP"
            elif user.is_active:
                cust_status = "Active"
            else:
                cust_status = "Inactive"

            fullname = user.fullname or user.email
            initials = "".join([n[0] for n in fullname.split() if n]).upper()[:2] or "C"

            results.append({
                "id": str(user.id),
                "fullname": user.fullname,
                "name": user.fullname,
                "email": user.email,
                "phone": getattr(user, "phone", "") or "",
                "role": user.role,
                "is_verified": user.is_verified,
                "is_active": user.is_active,
                "totalBookings": total_bookings,
                "completedBookings": completed_bookings,
                "cancelledBookings": cancelled_bookings,
                "totalSpent": float(total_spent),
                "status": cust_status,
                "initials": initials,
                "created_at": user.created_at.strftime("%Y-%m-%d"),
            })

        return Response(results)

    def retrieve(self, request, pk=None):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "User not found.", "code": "RESOURCE_NOT_FOUND"},
                status=status.HTTP_404_NOT_FOUND,
            )

        user_bookings = Booking.objects.filter(customer=user).order_by("-created_at")
        user_vehicles = Vehicle.objects.filter(owner=user)

        total_bookings = user_bookings.count()
        completed_bookings = user_bookings.filter(status=Booking.Status.COMPLETED).count()
        cancelled_bookings = user_bookings.filter(status=Booking.Status.CANCELLED).count()
        total_spent = user_bookings.filter(status=Booking.Status.COMPLETED).aggregate(s=Sum("total_price"))["s"] or 0

        fullname = user.fullname or user.email
        initials = "".join([n[0] for n in fullname.split() if n]).upper()[:2] or "C"

        profile = {
            "id": str(user.id),
            "fullname": user.fullname,
            "name": user.fullname,
            "email": user.email,
            "phone": getattr(user, "phone", "") or "",
            "role": user.role,
            "is_verified": user.is_verified,
            "is_active": user.is_active,
            "totalBookings": total_bookings,
            "completedBookings": completed_bookings,
            "cancelledBookings": cancelled_bookings,
            "totalSpent": float(total_spent),
            "status": "VIP" if (total_bookings >= 5 or total_spent >= 5000) else ("Active" if user.is_active else "Inactive"),
            "initials": initials,
            "created_at": user.created_at.strftime("%Y-%m-%d"),
        }

        bookings_data = [
            {
                "id": b.id,
                "booking_number": b.booking_number,
                "service_name": b.service.name if b.service else "Service",
                "booking_date": str(b.booking_date or b.created_at.date()),
                "total_price": float(b.total_price),
                "status": b.status,
                "payment_status": b.payment_status,
                "address": b.address,
            }
            for b in user_bookings
        ]

        vehicles_data = [
            {
                "id": v.id,
                "brand": v.brand,
                "model": v.model,
                "registration_number": v.registration_number,
                "vehicle_type": v.vehicle_type,
                "color": getattr(v, "color", "") or "",
            }
            for v in user_vehicles
        ]

        return Response({
            "profile": profile,
            "bookings": bookings_data,
            "vehicles": vehicles_data,
        })

    def destroy(self, request, pk=None):
        if request.user.role not in ["admin", "manager"]:
            return Response(
                {"success": False, "message": "Only Admins and Managers can delete customer accounts."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.role in ["admin", "manager"] or user.is_superuser:
            return Response(
                {"success": False, "message": "Administrative accounts cannot be deleted from customer directory."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Deleting user; Booking.customer is SET_NULL to retain financial records for audit.
        user.delete()

        return Response(
            {"success": True, "message": "Customer account deleted successfully."},
            status=status.HTTP_200_OK,
        )

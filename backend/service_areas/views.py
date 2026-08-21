from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count

from bookings.permissions import IsAdminOrStaff
from .models import ServiceArea
from .serializers import ServiceAreaSerializer


class PublicServiceAreaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API to list active service coverage zones.
    """

    serializer_class = ServiceAreaSerializer
    permission_classes = [permissions.AllowAny]
    queryset = ServiceArea.objects.filter(is_active=True).order_by("display_order", "name")


class AdminServiceAreaViewSet(viewsets.ModelViewSet):
    """
    Admin API for Service Area Management.
    """

    serializer_class = ServiceAreaSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]
    queryset = ServiceArea.objects.all().annotate(bookings_count=Count("bookings")).order_by("display_order", "name")

    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        area = self.get_object()
        area.is_active = not area.is_active
        area.save(update_fields=["is_active", "updated_at"])
        return Response(
            {
                "success": True,
                "message": f"Service area status updated to {'Active' if area.is_active else 'Inactive'}.",
                "data": self.get_serializer(area).data,
            },
            status=status.HTTP_200_OK,
        )

from rest_framework import filters, permissions, viewsets

from .models import Service
from .permissions import IsAdminOrStaff
from .serializers import ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    lookup_field = "slug"

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "short_description", "description"]
    ordering_fields = ["price", "duration_minutes", "created_at", "display_order"]

    def get_queryset(self):
        queryset = Service.objects.all()

        if self.request.user.is_authenticated and self.request.user.role in [
            "admin",
            "staff",
        ]:
            return queryset

        return queryset.filter(is_active=True)

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]

        return [IsAdminOrStaff()]
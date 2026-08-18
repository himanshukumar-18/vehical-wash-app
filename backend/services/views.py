from rest_framework import filters, permissions, viewsets
from rest_framework.exceptions import NotFound

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

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_val = self.kwargs.get(lookup_url_kwarg)

        if lookup_val and str(lookup_val).isdigit():
            filter_kwargs = {"pk": lookup_val}
        else:
            filter_kwargs = {"slug": lookup_val}

        obj = queryset.filter(**filter_kwargs).first()
        if not obj:
            raise NotFound("Service not found.")

        self.check_object_permissions(self.request, obj)
        return obj

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]

        return [IsAdminOrStaff()]
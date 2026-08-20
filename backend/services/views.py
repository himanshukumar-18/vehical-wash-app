from django.db.models import ProtectedError
from rest_framework import filters, permissions, status, viewsets
from rest_framework.exceptions import NotFound
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Service
from .permissions import IsAdminOrStaff
from .serializers import ServiceSerializer


class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    lookup_field = "slug"
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "short_description", "description"]
    ordering_fields = ["price", "duration_minutes", "created_at", "display_order"]

    def get_queryset(self):
        queryset = Service.objects.all()
        user = self.request.user
        if user and user.is_authenticated:
            user_role = getattr(user, "role", "") or ""
            if user.is_staff or user.is_superuser or user_role.lower() in ["admin", "staff"]:
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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            instance.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (ProtectedError, Exception):
            instance.is_active = False
            instance.save()
            return Response(
                {
                    "detail": "Service has linked customer bookings, so it was deactivated instead of permanently deleted.",
                    "deactivated": True,
                },
                status=status.HTTP_200_OK,
            )

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]

        return [IsAdminOrStaff()]
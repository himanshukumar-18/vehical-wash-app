from rest_framework import permissions, viewsets
from .models import Vehicle
from .serializers import VehicleSerializer

class IsVehicleOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Object-level authorization check
        return obj.user == request.user

class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated, IsVehicleOwner]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        # Filter strictly by authenticated user
        return Vehicle.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Assign authenticated user as vehicle owner
        serializer.save(user=self.request.user)

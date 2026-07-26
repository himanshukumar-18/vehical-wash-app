from rest_framework import permissions, viewsets

from .models import Vehicle
from .permissions import IsOwnerOrAdminStaff
from .serializers import VehicleSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminStaff]

    def get_queryset(self):
        user = self.request.user

        if user.role in ["admin", "manager", "staff"]:
            return Vehicle.objects.select_related("owner").all()

        return Vehicle.objects.select_related("owner").filter(owner=user)

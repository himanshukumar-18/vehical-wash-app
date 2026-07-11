from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Slot
from .permissions import IsAdminOrStaff
from .serializers import (
    GenerateSlotSerializer,
    SlotSerializer,
)
from .services import SlotGeneratorService


class SlotViewSet(viewsets.ModelViewSet):
    serializer_class = SlotSerializer
    queryset = Slot.objects.all().order_by("date", "start_time")

    def get_permissions(self):
        if self.action in [
            "list",
            "retrieve",
            "available",
        ]:
            return [permissions.AllowAny()]

        return [IsAdminOrStaff()]

    def get_queryset(self):
        queryset = Slot.objects.all()

        date = self.request.query_params.get("date")

        if date:
            queryset = queryset.filter(date=date)

        status_filter = self.request.query_params.get("status")

        if status_filter == "available":
            queryset = queryset.filter(
                is_active=True,
                is_blocked=False,
            )

        return queryset.order_by("date", "start_time")

    @action(detail=False, methods=["get"])
    def available(self, request):
        date = request.query_params.get("date")

        queryset = Slot.objects.filter(
            is_active=True,
            is_blocked=False,
        )

        if date:
            queryset = queryset.filter(date=date)

        queryset = [
            slot
            for slot in queryset
            if not slot.is_full
        ]

        serializer = self.get_serializer(queryset, many=True)

        return Response(serializer.data)

    @action(
        detail=False,
        methods=["post"],
        permission_classes=[IsAdminOrStaff],
    )
    def generate(self, request):
        serializer = GenerateSlotSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        result = SlotGeneratorService.generate_slots(
            serializer.validated_data["start_date"],
            serializer.validated_data["end_date"],
        )

        return Response(
            result,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["patch"],
        permission_classes=[IsAdminOrStaff],
    )
    def block(self, request, pk=None):
        slot = self.get_object()

        slot.is_blocked = True
        slot.save()

        return Response({"message": "Slot blocked successfully."})

    @action(
        detail=True,
        methods=["patch"],
        permission_classes=[IsAdminOrStaff],
    )
    def unblock(self, request, pk=None):
        slot = self.get_object()

        slot.is_blocked = False
        slot.save()

        return Response({"message": "Slot unblocked successfully."})
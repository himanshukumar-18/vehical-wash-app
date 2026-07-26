from django.utils import timezone
from rest_framework import mixins, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        if self.request.query_params.get("archived") == "true":
            return queryset.filter(archived_at__isnull=False)
        return queryset.filter(archived_at__isnull=True)

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read, notification.read_at = True, timezone.now()
            notification.save(update_fields=["is_read", "read_at"])
        return Response(self.get_serializer(notification).data)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        notification = self.get_object()
        notification.archived_at = timezone.now()
        notification.save(update_fields=["archived_at"])
        return Response(status=204)

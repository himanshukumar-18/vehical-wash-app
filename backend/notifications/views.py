from django.utils import timezone
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NotificationSerializer

    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        if self.request.query_params.get("archived") == "true":
            return queryset.filter(archived_at__isnull=False)
        return queryset.filter(archived_at__isnull=True)

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False, archived_at__isnull=True).count()
        return Response({"success": True, "data": {"unread_count": count}}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"])
    def read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=["is_read", "read_at"])
        return Response({"success": True, "data": self.get_serializer(notification).data}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="read-all")
    def read_all(self, request):
        updated_count = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).update(is_read=True, read_at=timezone.now())
        return Response({"success": True, "message": f"{updated_count} notifications marked as read."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post", "delete"], url_path="clear-all")
    def clear_all(self, request):
        updated_count = Notification.objects.filter(
            recipient=request.user, archived_at__isnull=True
        ).update(archived_at=timezone.now(), is_read=True, read_at=timezone.now())
        return Response(
            {"success": True, "message": f"{updated_count} notifications cleared."},
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        notification = self.get_object()
        notification.archived_at = timezone.now()
        notification.save(update_fields=["archived_at"])
        return Response({"success": True, "message": "Notification archived."}, status=status.HTTP_200_OK)

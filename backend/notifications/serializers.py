from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ("id", "title", "body", "category", "priority", "action_url", "is_read", "read_at", "archived_at", "created_at")
        read_only_fields = fields

from rest_framework import serializers

from .models import Slot


class SlotSerializer(serializers.ModelSerializer):
    remaining_capacity = serializers.ReadOnlyField()
    status = serializers.ReadOnlyField()

    class Meta:
        model = Slot
        fields = [
            "id",
            "date",
            "start_time",
            "end_time",
            "capacity",
            "booked_count",
            "remaining_capacity",
            "status",
            "is_active",
            "is_blocked",
            "created_at",
            "updated_at",
        ]

        read_only_fields = (
            "booked_count",
            "remaining_capacity",
            "status",
            "created_at",
            "updated_at",
        )


class GenerateSlotSerializer(serializers.Serializer):
    start_date = serializers.DateField()
    end_date = serializers.DateField()

    def validate(self, attrs):
        if attrs["end_date"] < attrs["start_date"]:
            raise serializers.ValidationError(
                "End date must be after start date."
            )

        return attrs
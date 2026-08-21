from rest_framework import serializers
from .models import ServiceArea


class ServiceAreaSerializer(serializers.ModelSerializer):
    bookings_count = serializers.SerializerMethodField()

    class Meta:
        model = ServiceArea
        fields = [
            "id",
            "name",
            "city",
            "description",
            "pincodes",
            "latitude",
            "longitude",
            "radius_km",
            "travel_charge",
            "min_booking_amount",
            "is_active",
            "display_order",
            "bookings_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "bookings_count", "created_at", "updated_at"]

    def get_bookings_count(self, obj):
        return getattr(obj, "bookings_count", 0) or obj.bookings.count()

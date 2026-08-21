from rest_framework import serializers
from .models import Offer, OfferUsage
from services.serializers import ServiceSerializer
from service_areas.serializers import ServiceAreaSerializer


class OfferSerializer(serializers.ModelSerializer):
    applicable_services_detail = ServiceSerializer(source="applicable_services", many=True, read_only=True)
    applicable_service_areas_detail = ServiceAreaSerializer(source="applicable_service_areas", many=True, read_only=True)
    total_usages_count = serializers.SerializerMethodField()
    total_discount_given = serializers.SerializerMethodField()

    class Meta:
        model = Offer
        fields = [
            "id",
            "name",
            "description",
            "discount_type",
            "discount_value",
            "max_discount_amount",
            "min_booking_amount",
            "start_date",
            "end_date",
            "is_active",
            "applicable_services",
            "applicable_services_detail",
            "applicable_service_areas",
            "applicable_service_areas_detail",
            "first_booking_only",
            "usage_limit",
            "per_customer_usage_limit",
            "display_order",
            "total_usages_count",
            "total_discount_given",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "total_usages_count", "total_discount_given", "created_at", "updated_at"]

    def get_total_usages_count(self, obj):
        return getattr(obj, "usages_count", 0) or obj.usages.count()

    def get_total_discount_given(self, obj):
        return getattr(obj, "total_discount", 0) or sum(u.discount_amount for u in obj.usages.all())


class OfferUsageSerializer(serializers.ModelSerializer):
    offer_name = serializers.CharField(source="offer.name", read_only=True)
    user_email = serializers.CharField(source="user.email", read_only=True)
    booking_number = serializers.CharField(source="booking.booking_number", read_only=True)

    class Meta:
        model = OfferUsage
        fields = [
            "id",
            "offer",
            "offer_name",
            "user",
            "user_email",
            "booking",
            "booking_number",
            "discount_amount",
            "used_at",
        ]

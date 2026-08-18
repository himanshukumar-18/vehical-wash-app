from rest_framework import serializers

from .models import Booking
from services.models import Service
from slots.models import Slot
from vehicles.models import Vehicle


class BookingListSerializer(serializers.ModelSerializer):
    service = serializers.StringRelatedField()
    vehicle = serializers.StringRelatedField()
    booking_date = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = (
            "id",
            "booking_number",
            "customer",
            "customer_phone",
            "service",
            "vehicle",
            "booking_date",
            "address",
            "status",
            "payment_status",
            "total_price",
            "created_at",
        )

    def get_booking_date(self, obj):
        if obj.booking_date:
            return str(obj.booking_date)
        if obj.slot:
            return str(obj.slot.date)
        return None

    def get_customer_phone(self, obj):
        import re
        if obj.address:
            match = re.search(r'(?:Ph:\s*|Phone:\s*|Contact:\s*)?([6-9]\d{9})', obj.address)
            if match:
                return match.group(1)
        if obj.customer and getattr(obj.customer, "phone_number", None):
            return obj.customer.phone_number
        return None


class BookingDetailSerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField()
    service = serializers.StringRelatedField()
    vehicle = serializers.StringRelatedField()
    booking_date = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = "__all__"

    def get_booking_date(self, obj):
        if obj.booking_date:
            return str(obj.booking_date)
        if obj.slot:
            return str(obj.slot.date)
        return None


class BookingCreateSerializer(serializers.Serializer):
    vehicle_id = serializers.IntegerField()
    service_id = serializers.IntegerField()
    booking_date = serializers.DateField()
    address = serializers.CharField()
    slot_id = serializers.IntegerField(required=False, allow_null=True)
    customer_note = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    discount_percentage = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False,
        default=0,
    )

    def validate_vehicle_id(self, value):
        try:
            return Vehicle.objects.get(pk=value)
        except Vehicle.DoesNotExist:
            raise serializers.ValidationError("Vehicle not found.")

    def validate_service_id(self, value):
        try:
            return Service.objects.get(pk=value)
        except Service.DoesNotExist:
            raise serializers.ValidationError("Service not found.")

    def validate_slot_id(self, value):
        if not value:
            return None
        try:
            return Slot.objects.get(pk=value)
        except Slot.DoesNotExist:
            return None

    def validate(self, attrs):
        attrs["vehicle"] = attrs.pop("vehicle_id")
        attrs["service"] = attrs.pop("service_id")
        if "slot_id" in attrs:
            attrs["slot"] = attrs.pop("slot_id", None)
        return attrs


class BookingStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=Booking.Status.choices
    )


class PaymentStatusSerializer(serializers.Serializer):
    payment_status = serializers.ChoiceField(
        choices=Booking.PaymentStatus.choices
    )


class CancelBookingSerializer(serializers.Serializer):
    reason = serializers.CharField(
        required=False,
        allow_blank=True,
    )


class BookingDashboardSerializer(serializers.Serializer):
    total_bookings = serializers.IntegerField()
    pending = serializers.IntegerField()
    confirmed = serializers.IntegerField()
    in_progress = serializers.IntegerField()
    completed = serializers.IntegerField()
    cancelled = serializers.IntegerField()
    revenue = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
    )


class VerifyOTPSerializer(serializers.Serializer):
    otp = serializers.CharField(
        max_length=6,
        min_length=4,
    )


class ResendOTPSerializer(serializers.Serializer):
    pass
from rest_framework import serializers

from .models import Booking
from services.models import Service
from slots.models import Slot
from vehicles.models import Vehicle


class BookingListSerializer(serializers.ModelSerializer):
    service = serializers.StringRelatedField()
    vehicle = serializers.StringRelatedField()

    slot_date = serializers.DateField(
        source="slot.date",
        read_only=True,
    )

    start_time = serializers.TimeField(
        source="slot.start_time",
        read_only=True,
    )

    end_time = serializers.TimeField(
        source="slot.end_time",
        read_only=True,
    )

    class Meta:
        model = Booking
        fields = (
            "id",
            "booking_number",
            "service",
            "vehicle",
            "slot_date",
            "start_time",
            "end_time",
            "status",
            "payment_status",
            "total_price",
            "created_at",
        )


class BookingDetailSerializer(serializers.ModelSerializer):
    customer = serializers.StringRelatedField()
    service = serializers.StringRelatedField()
    vehicle = serializers.StringRelatedField()

    class Meta:
        model = Booking
        fields = "__all__"


class BookingCreateSerializer(serializers.Serializer):
    vehicle_id = serializers.IntegerField()

    service_id = serializers.IntegerField()

    slot_id = serializers.IntegerField()

    address = serializers.CharField()

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
            raise serializers.ValidationError(
                "Vehicle not found."
            )

    def validate_service_id(self, value):
        try:
            return Service.objects.get(pk=value)
        except Service.DoesNotExist:
            raise serializers.ValidationError(
                "Service not found."
            )

    def validate_slot_id(self, value):
        try:
            return Slot.objects.get(pk=value)
        except Slot.DoesNotExist:
            raise serializers.ValidationError(
                "Slot not found."
            )

    def validate(self, attrs):
        attrs["vehicle"] = attrs.pop("vehicle_id")
        attrs["service"] = attrs.pop("service_id")
        attrs["slot"] = attrs.pop("slot_id")
        return attrs


class BookingStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=Booking.Status.choices
    )


class PaymentStatusSerializer(serializers.Serializer):
    payment_status = serializers.ChoiceField(
        choices=Booking.PaymentStatus.choices
    )


class ChangeSlotSerializer(serializers.Serializer):
    slot_id = serializers.IntegerField()

    def validate_slot_id(self, value):
        try:
            return Slot.objects.get(pk=value)
        except Slot.DoesNotExist:
            raise serializers.ValidationError(
                "Slot not found."
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
    """
    Empty serializer for resend OTP endpoint.
    """
    pass
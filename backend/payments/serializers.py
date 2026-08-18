from decimal import Decimal
from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    booking_number = serializers.CharField(source="booking.booking_number", read_only=True)
    customer_fullname = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    service_name = serializers.CharField(source="booking.service.name", read_only=True, default="Wash Service")
    vehicle_info = serializers.SerializerMethodField()

    class Meta:
        model = Payment
        fields = (
            "id",
            "booking",
            "booking_number",
            "customer_fullname",
            "customer_email",
            "service_name",
            "vehicle_info",
            "amount",
            "currency",
            "provider",
            "status",
            "provider_order_id",
            "provider_payment_id",
            "paid_at",
            "created_at",
        )
        read_only_fields = (
            "id",
            "status",
            "provider_order_id",
            "provider_payment_id",
            "paid_at",
            "created_at",
        )

    def get_customer_fullname(self, obj):
        if obj.booking and obj.booking.customer:
            return obj.booking.customer.fullname or obj.booking.customer.email
        return "Customer unavailable"

    def get_customer_email(self, obj):
        if obj.booking and obj.booking.customer:
            return obj.booking.customer.email
        return ""

    def get_vehicle_info(self, obj):
        if obj.booking and obj.booking.vehicle:
            v = obj.booking.vehicle
            return f"{v.brand} {v.model}"
        return "Vehicle"


class CreateOrderSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()


class VerifyPaymentSerializer(serializers.Serializer):
    razorpay_order_id = serializers.CharField()
    razorpay_payment_id = serializers.CharField()
    razorpay_signature = serializers.CharField()


class MarkPaidSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()


class MarkRefundedSerializer(serializers.Serializer):
    booking_id = serializers.IntegerField()


class RefundRequestSerializer(serializers.Serializer):
    payment_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))
    reason = serializers.CharField(required=False, allow_blank=True, max_length=2000)

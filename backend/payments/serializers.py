from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = (
            'id', 'booking', 'amount', 'currency', 'provider',
            'status', 'provider_order_id', 'provider_payment_id',
            'paid_at', 'created_at'
        )
        read_only_fields = (
            'id', 'status', 'provider_order_id', 'provider_payment_id',
            'paid_at', 'created_at'
        )


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
    amount = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=0.01)
    reason = serializers.CharField(required=False, allow_blank=True, max_length=2000)

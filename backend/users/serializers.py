from datetime import timedelta
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from notifications.emails import EmailService
from notifications.services import NotificationService

from .email_services import send_otp_email
from .models import User
from .otp import OTP
from .otp_services import generate_otp


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('id', 'fullname', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            fullname=validated_data['fullname'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.CUSTOMER,
        )

        # Generate OTP
        otp_code = generate_otp()

        # Save OTP to database
        OTP.objects.create(user=user, otp=otp_code, expires_at=timezone.now() + timedelta(minutes=10))

        # Event 1 — OTP Request (Transaction-safe notification & HTML email)
        transaction.on_commit(lambda: NotificationService.notify_user_otp(user, otp_code))
        transaction.on_commit(lambda: EmailService.enqueue_user_otp(user.email, otp_code, user.fullname))

        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'fullname', 'email', 'role')


class CustomLoginSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        if not self.user.is_verified:
            raise serializers.ValidationError(
                {'error': 'Please verify your email with OTP before logging in'}
            )

        return data

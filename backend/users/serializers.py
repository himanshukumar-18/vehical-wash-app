from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

from notifications.services import normalize_phone_number
from .models import User, OTP

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "phone",
            "fullname",
            "is_email_verified",
            "is_phone_verified",
            "date_joined",
        ]
        read_only_fields = ["id", "is_email_verified", "is_phone_verified", "date_joined"]

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    fullname = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default="")

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized

    def validate_phone(self, value):
        if not value:
            return None
        normalized = normalize_phone_number(value)
        if User.objects.filter(phone=normalized).exists():
            raise serializers.ValidationError("An account with this phone number already exists.")
        return normalized

    def validate_password(self, value):
        validate_password(value)
        return value

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password")

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account has been disabled.")
        if not user.is_email_verified:
            raise serializers.ValidationError("Please verify your email address before logging in.")

        attrs["user"] = user
        return attrs

class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, min_length=6)

    def validate_email(self, value):
        return value.strip().lower()

class PhoneSendOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)

    def validate_phone(self, value):
        normalized = normalize_phone_number(value)
        if not normalized or len(normalized) < 10:
            raise serializers.ValidationError("Please enter a valid phone number.")
        return normalized

class PhoneVerifyOTPSerializer(serializers.Serializer):
    phone = serializers.CharField(max_length=20)
    otp = serializers.CharField(max_length=6, min_length=6)
    fullname = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")

    def validate_phone(self, value):
        normalized = normalize_phone_number(value)
        if not normalized:
            raise serializers.ValidationError("Please enter a valid phone number.")
        return normalized

class ResendOTPSerializer(serializers.Serializer):
    identifier = serializers.CharField(max_length=255)
    purpose = serializers.ChoiceField(choices=OTP.PURPOSE_CHOICES)

    def validate_identifier(self, value):
        val = value.strip()
        if "@" in val:
            return val.lower()
        return normalize_phone_number(val)

class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField()

    def validate_id_token(self, value):
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", "")
        try:
            # Verify google signature and token payload
            payload = id_token.verify_oauth2_token(
                value,
                google_requests.Request(),
                audience=client_id if client_id else None,
            )
            return payload
        except Exception:
            raise serializers.ValidationError("Invalid or expired Google credential.")

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

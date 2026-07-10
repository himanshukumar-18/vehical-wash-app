from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User
from .otp import OTP
from .otp_services import generate_otp
from .email_services import send_otp_email


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        # NOTE: 'role' added here only for testing via Postman.
        # Remove this field before going to production, so normal
        # users can never set themselves as admin.
        fields = ('id', 'fullname', 'email', 'password', 'role')

    def create(self, validated_data):
        user = User.objects.create_user(
            fullname=validated_data['fullname'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', User.Role.CUSTOMER)
        )

        # Generate OTP
        otp_code = generate_otp()

        # save otp to the database
        OTP.objects.create(user=user, otp=otp_code)

        # Send OTP email
        send_otp_email(user.email, otp_code)

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
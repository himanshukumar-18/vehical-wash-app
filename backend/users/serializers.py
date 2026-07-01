from rest_framework import serializers
from .models import User
from .otp import OTP
from .otp_services import generate_otp
from .email_services import send_otp_email

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'fullname', 'username', 'email', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            fullname=validated_data['fullname'],
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Generate OTP
        otp_code = generate_otp()
        
        # save otp to the database
        OTP.objects.create(user=user, code=otp_code)
        
        # Send OTP email
        send_otp_email(user.email, otp_code)
        
        return user

    

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'fullname', 'username', 'email')
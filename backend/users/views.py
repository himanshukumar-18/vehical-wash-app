from datetime import timedelta
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from notifications.email import send_otp_email, send_welcome_email
from notifications.services import send_otp_sms
from .models import User, OTP
from .serializers import (
    GoogleAuthSerializer,
    LoginSerializer,
    LogoutSerializer,
    PhoneSendOTPSerializer,
    PhoneVerifyOTPSerializer,
    RegisterSerializer,
    ResendOTPSerializer,
    UserSerializer,
    VerifyOTPSerializer,
)

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }

class AuthRateThrottle(ScopedRateThrottle):
    scope = "auth"

class OTPRateThrottle(ScopedRateThrottle):
    scope = "otp"

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        with transaction.atomic():
            user = User.objects.create_user(
                email=data["email"],
                password=data["password"],
                fullname=data.get("fullname", ""),
                phone=data.get("phone"),
                is_email_verified=False,
            )
            _, raw_otp = OTP.create_for_identifier(
                identifier=user.email,
                purpose=OTP.PURPOSE_EMAIL_VERIFICATION,
                user=user,
                expiry_minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 10),
                max_attempts=getattr(settings, "OTP_MAX_ATTEMPTS", 5),
            )

        send_otp_email(user.email, raw_otp)

        return Response(
            {
                "success": True,
                "message": "Account registered successfully. Please verify your email with the OTP sent.",
                "data": {"email": user.email},
            },
            status=status.HTTP_201_CREATED,
        )

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        tokens = get_tokens_for_user(user)

        return Response(
            {
                "success": True,
                "message": "Login successful.",
                "data": {
                    "tokens": tokens,
                    "user": UserSerializer(user).data,
                },
            },
            status=status.HTTP_200_OK,
        )

class VerifyEmailOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [OTPRateThrottle]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        raw_otp = serializer.validated_data["otp"]

        otp_instance = OTP.objects.filter(
            identifier=email,
            purpose=OTP.PURPOSE_EMAIL_VERIFICATION,
            is_used=False,
        ).first()

        if not otp_instance:
            return Response(
                {
                    "success": False,
                    "message": "No active OTP found. Please request a new code.",
                    "code": "INVALID_OTP",
                    "errors": None,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        success, message = otp_instance.verify(raw_otp)
        if not success:
            return Response(
                {
                    "success": False,
                    "message": message,
                    "code": "INVALID_OTP",
                    "errors": None,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email=email).first()
        if user:
            user.is_email_verified = True
            user.save(update_fields=["is_email_verified"])
            send_welcome_email(user.email, user.fullname)

        return Response(
            {
                "success": True,
                "message": "Email verified successfully. You can now log in.",
                "data": None,
            },
            status=status.HTTP_200_OK,
        )

class PhoneSendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [OTPRateThrottle]

    def post(self, request):
        serializer = PhoneSendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]
        user = User.objects.filter(phone=phone).first()

        _, raw_otp = OTP.create_for_identifier(
            identifier=phone,
            purpose=OTP.PURPOSE_PHONE_LOGIN,
            user=user,
            expiry_minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 10),
            max_attempts=getattr(settings, "OTP_MAX_ATTEMPTS", 5),
        )

        send_otp_sms(phone, raw_otp)

        return Response(
            {
                "success": True,
                "message": "Verification code dispatched to the provided phone number.",
                "data": {"phone": phone},
            },
            status=status.HTTP_200_OK,
        )

class PhoneVerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [OTPRateThrottle]

    def post(self, request):
        serializer = PhoneVerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone = serializer.validated_data["phone"]
        raw_otp = serializer.validated_data["otp"]
        fullname = serializer.validated_data.get("fullname", "")

        otp_instance = OTP.objects.filter(
            identifier=phone,
            purpose=OTP.PURPOSE_PHONE_LOGIN,
            is_used=False,
        ).first()

        if not otp_instance:
            return Response(
                {
                    "success": False,
                    "message": "No active OTP found. Please request a new code.",
                    "code": "INVALID_OTP",
                    "errors": None,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        success, message = otp_instance.verify(raw_otp)
        if not success:
            return Response(
                {
                    "success": False,
                    "message": message,
                    "code": "INVALID_OTP",
                    "errors": None,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user = User.objects.filter(phone=phone).first()
            if not user:
                # Generate unique synthetic email if user signed up via phone
                synthetic_email = f"{phone.replace('+', '')}@phone.theblackwash.com"
                user = User.objects.create_user(
                    email=synthetic_email,
                    phone=phone,
                    fullname=fullname,
                    is_phone_verified=True,
                    is_email_verified=False,
                )
            else:
                user.is_phone_verified = True
                user.save(update_fields=["is_phone_verified"])

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "success": True,
                "message": "Phone verified and authenticated successfully.",
                "data": {
                    "tokens": tokens,
                    "user": UserSerializer(user).data,
                },
            },
            status=status.HTTP_200_OK,
        )

class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [OTPRateThrottle]

    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        identifier = serializer.validated_data["identifier"]
        purpose = serializer.validated_data["purpose"]

        # Enforce resend cooldown
        cooldown_seconds = getattr(settings, "OTP_RESEND_COOLDOWN_SECONDS", 60)
        recent_otp = OTP.objects.filter(identifier=identifier, purpose=purpose).first()
        if recent_otp and (timezone.now() - recent_otp.created_at) < timedelta(seconds=cooldown_seconds):
            remaining = int(cooldown_seconds - (timezone.now() - recent_otp.created_at).total_seconds())
            return Response(
                {
                    "success": False,
                    "message": f"Please wait {remaining} seconds before requesting another code.",
                    "code": "COOLDOWN_ACTIVE",
                    "errors": None,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        user = User.objects.filter(email=identifier).first() or User.objects.filter(phone=identifier).first()
        _, raw_otp = OTP.create_for_identifier(
            identifier=identifier,
            purpose=purpose,
            user=user,
            expiry_minutes=getattr(settings, "OTP_EXPIRY_MINUTES", 10),
            max_attempts=getattr(settings, "OTP_MAX_ATTEMPTS", 5),
        )

        if "@" in identifier:
            send_otp_email(identifier, raw_otp)
        else:
            send_otp_sms(identifier, raw_otp)

        return Response(
            {
                "success": True,
                "message": "A new verification code has been dispatched.",
                "data": None,
            },
            status=status.HTTP_200_OK,
        )

class GoogleAuthView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        payload = serializer.validated_data["id_token"]
        email = payload.get("email", "").strip().lower()
        fullname = payload.get("name", "")

        if not email:
            return Response(
                {
                    "success": False,
                    "message": "Google account does not contain a valid email address.",
                    "code": "INVALID_GOOGLE_ACCOUNT",
                    "errors": None,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "fullname": fullname,
                    "is_email_verified": True,
                },
            )
            if not created and not user.is_email_verified:
                user.is_email_verified = True
                user.save(update_fields=["is_email_verified"])

        tokens = get_tokens_for_user(user)

        return Response(
            {
                "success": True,
                "message": "Google authentication successful.",
                "data": {
                    "tokens": tokens,
                    "user": UserSerializer(user).data,
                },
            },
            status=status.HTTP_200_OK,
        )

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except Exception:
            pass

        return Response(
            {
                "success": True,
                "message": "Successfully logged out.",
                "data": None,
            },
            status=status.HTTP_200_OK,
        )

class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

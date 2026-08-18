from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .otp import OTP
from .serializers import CustomLoginSerializer, RegisterSerializer, UserSerializer


class AuthRateThrottle(AnonRateThrottle):
    rate = "10/minute"


class OTPRateThrottle(AnonRateThrottle):
    rate = "5/minute"


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [OTPRateThrottle]

    def post(self, request):
        email = request.data.get("email")
        code = request.data.get("otp")

        if not email or not code:
            return Response(
                {"success": False, "message": "Email and OTP are required.", "code": "VALIDATION_ERROR", "errors": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "User not found.", "code": "RESOURCE_NOT_FOUND", "errors": None},
                status=status.HTTP_404_NOT_FOUND,
            )

        otp_entry = (
            OTP.objects.filter(user=user, otp=code, is_verified=False, expires_at__gt=timezone.now())
            .order_by("-id")
            .first()
        )

        if not otp_entry:
            latest = (
                OTP.objects.filter(user=user, is_verified=False, expires_at__gt=timezone.now())
                .order_by("-id")
                .first()
            )
            if latest:
                latest.attempts += 1
                latest.save(update_fields=["attempts"])
            return Response(
                {"success": False, "message": "Invalid OTP code.", "code": "INVALID_OTP", "errors": None},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_entry.attempts >= 5:
            return Response(
                {"success": False, "message": "Too many verification attempts.", "code": "RATE_LIMIT_EXCEEDED", "errors": None},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        # Mark every outstanding challenge consumed so an OTP cannot be replayed.
        OTP.objects.filter(user=user, is_verified=False).update(is_verified=True)

        was_verified = user.is_verified
        user.is_verified = True
        user.save(update_fields=["is_verified"])

        # Event 2 — Successful Registration Welcome Email & Notification
        if not was_verified:
            from django.db import transaction
            from notifications.emails import EmailService
            from notifications.services import NotificationService
            transaction.on_commit(lambda u=user: NotificationService.notify_registration_success(u))
            transaction.on_commit(lambda u=user: EmailService.enqueue_welcome_email(u))

        return Response(
            {"success": True, "message": "Email verified successfully."},
            status=status.HTTP_200_OK,
        )


class LoginView(TokenObtainPairView):
    serializer_class = CustomLoginSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"success": False, "message": "Refresh token is required.", "code": "VALIDATION_ERROR", "errors": None},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"success": True, "message": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(
                {"success": False, "message": "Invalid or expired token.", "code": "INVALID_TOKEN", "errors": None},
                status=status.HTTP_400_BAD_REQUEST,
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

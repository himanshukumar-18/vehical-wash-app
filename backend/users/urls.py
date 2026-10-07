from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    GoogleAuthView,
    LoginView,
    LogoutView,
    PhoneSendOTPView,
    PhoneVerifyOTPView,
    RegisterView,
    ResendOTPView,
    UserProfileView,
    VerifyEmailOTPView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("verify-otp/", VerifyEmailOTPView.as_view(), name="auth-verify-otp"),
    path("phone/send-otp/", PhoneSendOTPView.as_view(), name="auth-phone-send-otp"),
    path("phone/verify-otp/", PhoneVerifyOTPView.as_view(), name="auth-phone-verify-otp"),
    path("resend-otp/", ResendOTPView.as_view(), name="auth-resend-otp"),
    path("google/", GoogleAuthView.as_view(), name="auth-google"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
    path("me/", UserProfileView.as_view(), name="auth-user-profile"),
]

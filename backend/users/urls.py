from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .admin_views import AdminUserViewSet
from .views import LoginView, LogoutView, ProfileView, RegisterView, VerifyOTPView

admin_router = DefaultRouter()
admin_router.register(r"admin/users", AdminUserViewSet, basename="admin-user")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("", include(admin_router.urls)),
]
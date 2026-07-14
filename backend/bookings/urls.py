from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminBookingViewSet,
    BookingViewSet,
)

# Customer APIs
customer_router = DefaultRouter()
customer_router.register(
    r"bookings",
    BookingViewSet,
    basename="booking",
)

# Admin APIs
admin_router = DefaultRouter()
admin_router.register(
    r"bookings",
    AdminBookingViewSet,
    basename="admin-booking",
)

urlpatterns = [
    path("", include(customer_router.urls)),
    path("admin/", include(admin_router.urls)),
]
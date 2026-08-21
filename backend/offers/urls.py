from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PublicOfferViewSet, AdminOfferViewSet

router = DefaultRouter()
router.register(r"offers", PublicOfferViewSet, basename="public-offers")
router.register(r"admin/offers", AdminOfferViewSet, basename="admin-offers")

urlpatterns = [
    path("", include(router.urls)),
]

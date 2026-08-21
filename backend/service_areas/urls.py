from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PublicServiceAreaViewSet, AdminServiceAreaViewSet

router = DefaultRouter()
router.register(r"service-areas", PublicServiceAreaViewSet, basename="public-service-areas")
router.register(r"admin/service-areas", AdminServiceAreaViewSet, basename="admin-service-areas")

urlpatterns = [
    path("", include(router.urls)),
]

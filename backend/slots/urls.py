from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import SlotViewSet

router = DefaultRouter()
router.register("", SlotViewSet, basename="slots")

urlpatterns = [
    path("", include(router.urls)),
]
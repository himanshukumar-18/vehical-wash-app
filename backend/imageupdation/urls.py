from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicDynamicImagesView, AdminDynamicImageViewSet

router = DefaultRouter()
router.register(r"admin/images", AdminDynamicImageViewSet, basename="admin-dynamic-images")

urlpatterns = [
    path("images/", PublicDynamicImagesView.as_view(), name="public-dynamic-images"),
    path("", include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TestimonialViewSet, AdminTestimonialViewSet

router = DefaultRouter()
router.register(r"testimonials", TestimonialViewSet, basename="testimonial")
router.register(r"admin/testimonials", AdminTestimonialViewSet, basename="admin-testimonial")

urlpatterns = [
    path("", include(router.urls)),
]

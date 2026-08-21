from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from config.health_views import HealthLivenessView, HealthReadinessView

urlpatterns = [
    path("health/", HealthLivenessView.as_view(), name="health-liveness"),
    path("health/ready/", HealthReadinessView.as_view(), name="health-readiness"),
    path("admin/", admin.site.urls),

    path("api/auth/", include("users.urls")),
    path("api/", include("services.urls")),
    path("api/", include("vehicles.urls")),
    path("api/", include("slots.urls")),
    path("api/", include("bookings.urls")),
    path("api/payments/", include("payments.urls")),
    path("api/", include("notifications.urls")),
    path("api/", include("imageupdation.urls")),
    path("api/", include("testimonials.urls")),
    path("api/", include("service_areas.urls")),
    path("api/", include("offers.urls")),
    path("api/", include("analytics.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


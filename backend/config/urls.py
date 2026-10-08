from django.contrib import admin
from django.urls import include, path

from .views import HealthCheckView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", HealthCheckView.as_view(), name="health-check"),
    path("api/auth/", include("users.urls")),
    path("api/vehicles/", include("vehicles.urls")),
]
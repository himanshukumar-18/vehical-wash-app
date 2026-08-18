import logging
from django.db import connection
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

logger = logging.getLogger(__name__)


class HealthLivenessView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response({"status": "ok"}, status=status.HTTP_200_OK)


class HealthReadinessView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        checks = {}
        all_healthy = True

        # Database Check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            checks["database"] = "ok"
        except Exception as e:
            logger.error("Health check DB failure: %s", e)
            checks["database"] = "unavailable"
            all_healthy = False

        # Redis / Cache Check
        try:
            cache.set("health_check", "ok", timeout=5)
            val = cache.get("health_check")
            if val == "ok":
                checks["redis"] = "ok"
            else:
                checks["redis"] = "unavailable"
                all_healthy = False
        except Exception as e:
            logger.error("Health check Redis failure: %s", e)
            checks["redis"] = "unavailable"
            all_healthy = False

        http_status = status.HTTP_200_OK if all_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
        return Response(
            {
                "status": "ready" if all_healthy else "unhealthy",
                "checks": checks,
            },
            status=http_status,
        )

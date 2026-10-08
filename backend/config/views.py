from django.db import connection
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

class HealthCheckView(APIView):
    """
    Minimal, unauthenticated health check endpoint.
    Verifies Django application and database connectivity.
    GET /api/health/
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        db_healthy = True
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                row = cursor.fetchone()
                if not row or row[0] != 1:
                    db_healthy = False
        except Exception:
            db_healthy = False

        if not db_healthy:
            return Response(
                {"status": "error", "database": "unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response({"status": "ok"}, status=status.HTTP_200_OK)

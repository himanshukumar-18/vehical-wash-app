from django.test import TestCase
from django.urls import reverse
from rest_framework import status


class HealthCheckTests(TestCase):
    def test_liveness_endpoint(self):
        url = reverse("health-liveness")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"status": "ok"})

    def test_readiness_endpoint(self):
        url = reverse("health-readiness")
        response = self.client.get(url)
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_503_SERVICE_UNAVAILABLE])
        data = response.json()
        self.assertIn("status", data)
        self.assertIn("checks", data)
        self.assertIn("database", data["checks"])
        self.assertIn("redis", data["checks"])

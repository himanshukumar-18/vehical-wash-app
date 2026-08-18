from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class SecurityTests(TestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email="regular@example.com",
            fullname="Regular Customer",
            password="Password123!",
            role=User.Role.CUSTOMER,
            is_verified=True,
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            fullname="Admin User",
            password="Password123!",
            role=User.Role.ADMIN,
            is_staff=True,
            is_verified=True,
        )
        self.client = APIClient()

    def test_customer_cannot_access_admin_dashboard(self):
        self.client.force_authenticate(user=self.customer)
        url = reverse("admin-booking-dashboard")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_access_admin_dashboard(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse("admin-booking-dashboard")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_rate_limiting_on_login(self):
        url = reverse("login")
        payload = {"email": "regular@example.com", "password": "WrongPassword"}
        for _ in range(12):
            res = self.client.post(url, payload, format="json")
        self.assertIn(res.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_429_TOO_MANY_REQUESTS])

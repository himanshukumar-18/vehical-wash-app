from datetime import timedelta
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient
from users.models import OTP

User = get_user_model()


class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse("register")
        self.login_url = reverse("login")
        self.verify_otp_url = reverse("verify-otp")

    def test_user_registration(self):
        payload = {
            "fullname": "John Doe",
            "email": "john@example.com",
            "password": "SecurePassword123!",
        }
        response = self.client.post(self.register_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email="john@example.com").exists())
        user = User.objects.get(email="john@example.com")
        self.assertFalse(user.is_verified)
        self.assertEqual(user.role, User.Role.CUSTOMER)
        self.assertTrue(OTP.objects.filter(user=user).exists())

    def test_otp_verification(self):
        user = User.objects.create_user(
            email="verify@example.com",
            fullname="Verify User",
            password="Password123!",
        )
        otp = OTP.objects.create(
            user=user,
            otp="123456",
            expires_at=timezone.now() + timedelta(minutes=10),
        )

        payload = {"email": user.email, "otp": "123456"}
        response = self.client.post(self.verify_otp_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertTrue(user.is_verified)

    def test_unverified_user_cannot_login(self):
        user = User.objects.create_user(
            email="unverified@example.com",
            fullname="Unverified User",
            password="Password123!",
            is_verified=False,
        )
        payload = {"email": user.email, "password": "Password123!"}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verified_user_login_success(self):
        user = User.objects.create_user(
            email="verified@example.com",
            fullname="Verified User",
            password="Password123!",
            is_verified=True,
        )
        payload = {"email": user.email, "password": "Password123!"}
        response = self.client.post(self.login_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

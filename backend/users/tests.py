from unittest.mock import patch
from datetime import timedelta
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from users.models import User, OTP

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse("auth-register")
        self.login_url = reverse("auth-login")
        self.verify_otp_url = reverse("auth-verify-otp")
        self.phone_send_otp_url = reverse("auth-phone-send-otp")
        self.phone_verify_otp_url = reverse("auth-phone-verify-otp")
        self.resend_otp_url = reverse("auth-resend-otp")
        self.google_auth_url = reverse("auth-google")
        self.refresh_url = reverse("auth-token-refresh")
        self.logout_url = reverse("auth-logout")
        self.me_url = reverse("auth-user-profile")

    @patch("users.views.send_otp_email")
    def test_user_registration_and_email_verification(self, mock_send_email):
        mock_send_email.return_value = True

        # 1. Register
        payload = {
            "email": "customer@theblackwash.com",
            "password": "SecurePassword123!",
            "fullname": "Himanshu Kumar",
            "phone": "9876543210",
        }
        res = self.client.post(self.register_url, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(res.data["success"])

        user = User.objects.get(email="customer@theblackwash.com")
        self.assertFalse(user.is_email_verified)
        self.assertEqual(user.phone, "+919876543210")

        # 2. Login fails before verification
        login_res = self.client.post(self.login_url, {"email": "customer@theblackwash.com", "password": "SecurePassword123!"})
        self.assertEqual(login_res.status_code, status.HTTP_400_BAD_REQUEST)

        # 3. Verify OTP
        otp_obj = OTP.objects.filter(identifier=user.email, is_used=False).first()
        self.assertIsNotNone(otp_obj)

        # Simulate wrong OTP
        wrong_res = self.client.post(self.verify_otp_url, {"email": user.email, "otp": "000000"})
        self.assertEqual(wrong_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Retrieve valid OTP by regenerating known raw code for test
        _, raw_otp = OTP.create_for_identifier(user.email, OTP.PURPOSE_EMAIL_VERIFICATION, user=user)
        verify_res = self.client.post(self.verify_otp_url, {"email": user.email, "otp": raw_otp})
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)

        # 4. Login succeeds after verification
        login_success = self.client.post(self.login_url, {"email": "customer@theblackwash.com", "password": "SecurePassword123!"})
        self.assertEqual(login_success.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", login_success.data["data"])
        tokens = login_success.data["data"]["tokens"]
        access_token = tokens["access"]
        refresh_token = tokens["refresh"]

        # 5. Access profile with JWT
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        me_res = self.client.get(self.me_url)
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertEqual(me_res.data["email"], user.email)

        # 6. Refresh token
        refresh_res = self.client.post(self.refresh_url, {"refresh": refresh_token})
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn("access", refresh_res.data)

        # 7. Logout
        logout_res = self.client.post(self.logout_url, {"refresh": refresh_token})
        self.assertEqual(logout_res.status_code, status.HTTP_200_OK)

    @patch("users.views.send_otp_sms")
    def test_phone_otp_flow(self, mock_send_sms):
        mock_send_sms.return_value = True

        # 1. Send Phone OTP
        res = self.client.post(self.phone_send_otp_url, {"phone": "+919876543210"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        _, raw_otp = OTP.create_for_identifier("+919876543210", OTP.PURPOSE_PHONE_LOGIN)

        # 2. Verify Phone OTP (new user)
        verify_res = self.client.post(self.phone_verify_otp_url, {
            "phone": "+919876543210",
            "otp": raw_otp,
            "fullname": "Phone User",
        })
        self.assertEqual(verify_res.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", verify_res.data["data"])

        user = User.objects.get(phone="+919876543210")
        self.assertTrue(user.is_phone_verified)

    @patch("users.serializers.id_token.verify_oauth2_token")
    def test_google_authentication(self, mock_verify):
        mock_verify.return_value = {
            "email": "googleuser@theblackwash.com",
            "name": "Google User",
            "email_verified": True,
        }

        res = self.client.post(self.google_auth_url, {"id_token": "valid-mock-token"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn("tokens", res.data["data"])

        user = User.objects.get(email="googleuser@theblackwash.com")
        self.assertTrue(user.is_email_verified)
        self.assertEqual(user.fullname, "Google User")

    def test_otp_attempt_limits_and_expiration(self):
        user = User.objects.create_user(email="testlimit@theblackwash.com", password="Password123!")
        otp_obj, raw_otp = OTP.create_for_identifier(user.email, OTP.PURPOSE_EMAIL_VERIFICATION, user=user, max_attempts=2)

        # First wrong attempt
        success, _ = otp_obj.verify("111111")
        self.assertFalse(success)
        self.assertEqual(otp_obj.attempts, 1)

        # Second wrong attempt -> reach max
        success, _ = otp_obj.verify("222222")
        self.assertFalse(success)
        self.assertEqual(otp_obj.attempts, 2)

        # Third attempt blocked
        success, msg = otp_obj.verify(raw_otp)
        self.assertFalse(success)
        self.assertIn("Maximum", msg)

        # Test expiration
        expired_otp, raw_exp = OTP.create_for_identifier("exp@theblackwash.com", OTP.PURPOSE_EMAIL_VERIFICATION)
        expired_otp.expires_at = timezone.now() - timedelta(minutes=5)
        expired_otp.save()
        success, msg = expired_otp.verify(raw_exp)
        self.assertFalse(success)
        self.assertIn("expired", msg)

    @patch("users.views.send_otp_email")
    def test_duplicate_registration_validation(self, mock_send_email):
        mock_send_email.return_value = True
        User.objects.create_user(email="dup@theblackwash.com", password="Password123!")

        res = self.client.post(self.register_url, {
            "email": "dup@theblackwash.com",
            "password": "Password123!",
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.data["code"], "VALIDATION_ERROR")

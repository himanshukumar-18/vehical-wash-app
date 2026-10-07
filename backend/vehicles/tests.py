from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from users.models import User
from vehicles.models import Vehicle

class VehicleTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email="user1@theblackwash.com", password="Password123!", is_email_verified=True)
        self.user2 = User.objects.create_user(email="user2@theblackwash.com", password="Password123!", is_email_verified=True)

        self.token1 = str(RefreshToken.for_user(self.user1).access_token)
        self.token2 = str(RefreshToken.for_user(self.user2).access_token)

        self.vehicles_url = reverse("vehicles-list")

    def test_vehicle_crud_and_user_isolation(self):
        # 1. Create vehicle for User 1
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        payload = {
            "brand": "Hyundai",
            "model": "Creta",
            "vehicle_type": "suv",
            "registration_number": "jh02az1234",
            "is_default": True,
        }
        res = self.client.post(self.vehicles_url, payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["registration_number"], "JH02AZ1234")
        vehicle_id = res.data["id"]

        # 2. List vehicles for User 1
        list_res = self.client.get(self.vehicles_url)
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_res.data), 1)

        # 3. User 2 cannot see or access User 1's vehicle
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token2}")
        user2_list = self.client.get(self.vehicles_url)
        self.assertEqual(len(user2_list.data), 0)

        detail_url = reverse("vehicles-detail", kwargs={"pk": vehicle_id})
        user2_detail = self.client.get(detail_url)
        self.assertEqual(user2_detail.status_code, status.HTTP_404_NOT_FOUND)

        user2_delete = self.client.delete(detail_url)
        self.assertEqual(user2_delete.status_code, status.HTTP_404_NOT_FOUND)

        # 4. User 1 can update and delete their vehicle
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token1}")
        patch_res = self.client.patch(detail_url, {"model": "Creta Knight"})
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertEqual(patch_res.data["model"], "Creta Knight")

        del_res = self.client.delete(detail_url)
        self.assertEqual(del_res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Vehicle.objects.count(), 0)

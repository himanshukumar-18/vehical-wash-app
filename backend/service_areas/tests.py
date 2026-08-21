from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from .models import ServiceArea

User = get_user_model()


class ServiceAreaAPITestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="admin@test.com", password="adminpassword123", fullname="Admin User", role="admin"
        )
        self.area = ServiceArea.objects.create(
            name="Hazaribagh Central",
            city="Hazaribagh",
            pincodes="825301, 825302",
            travel_charge=Decimal("50.00"),
            is_active=True,
        )

    def test_public_list_service_areas(self):
        res = self.client.get("/api/service-areas/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data.get("results", res.data)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "Hazaribagh Central")

    def test_admin_crud_service_area(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            "name": "Matwari Zone",
            "city": "Hazaribagh",
            "pincodes": "825303",
            "travel_charge": "70.00",
            "is_active": True,
        }
        res = self.client.post("/api/admin/service-areas/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ServiceArea.objects.filter(name="Matwari Zone").exists())

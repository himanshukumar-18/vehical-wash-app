from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from bookings.models import Booking
from services.models import Service
from vehicles.models import Vehicle

User = get_user_model()


class AnalyticsAPITestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="admin@test.com", password="adminpassword123", fullname="Admin User", role="admin"
        )
        self.customer = User.objects.create_user(
            email="customer@test.com", password="customerpassword123", fullname="Customer User"
        )
        self.vehicle = Vehicle.objects.create(
            owner=self.customer, vehicle_type="SEDAN", vehicle_name="Honda City", registration_number="JH02AB1234"
        )
        self.service = Service.objects.create(
            name="Exterior Wash", price=Decimal("499.00"), duration_minutes=30, is_active=True
        )
        self.booking = Booking.objects.create(
            booking_number="BK1001",
            customer=self.customer,
            vehicle=self.vehicle,
            service=self.service,
            address="Hazaribagh",
            base_price=Decimal("499.00"),
            travel_charge=Decimal("50.00"),
            subtotal=Decimal("549.00"),
            discount=Decimal("49.00"),
            total_price=Decimal("500.00"),
            status=Booking.Status.COMPLETED,
            payment_status=Booking.PaymentStatus.PAID,
        )

    def test_admin_analytics_overview(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/admin/analytics/overview/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.data.get("data", res.data)
        self.assertEqual(data["total_bookings"], 1)
        self.assertEqual(data["completed_bookings"], 1)
        self.assertEqual(data["total_revenue"], 500.0)

    def test_admin_analytics_revenue(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/admin/analytics/revenue/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get("success"))

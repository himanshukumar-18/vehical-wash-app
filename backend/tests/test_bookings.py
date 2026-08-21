from datetime import date
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from bookings.models import Booking
from bookings.services import BookingService
from services.models import Service
from vehicles.models import Vehicle

User = get_user_model()


class BookingTests(TestCase):
    def setUp(self):
        self.customer = User.objects.create_user(
            email="cust@example.com",
            fullname="Customer One",
            password="Password123!",
            is_verified=True,
        )
        self.other_customer = User.objects.create_user(
            email="cust2@example.com",
            fullname="Customer Two",
            password="Password123!",
            is_verified=True,
        )
        self.vehicle = Vehicle.objects.create(
            owner=self.customer,
            brand="Honda",
            model="Civic",
            registration_number="KA01AB1234",
            vehicle_type=Vehicle.VehicleType.SEDAN,
        )
        self.service = Service.objects.create(
            name="Basic Wash",
            description="Basic exterior wash",
            price=Decimal("499.00"),
            duration_minutes=30,
        )
        self.cheap_service = Service.objects.create(
            name="Testing Service",
            description="Minimal testing service",
            price=Decimal("1.00"),
            duration_minutes=15,
        )
        self.today_date = date.today()
        self.client = APIClient()
        self.client.force_authenticate(user=self.customer)

    def test_create_booking_success(self):
        booking = BookingService.create_booking(
            customer=self.customer,
            vehicle=self.vehicle,
            service=self.service,
            booking_date=self.today_date,
            address="123 Test Street, Hazaribagh, 825301",
        )
        self.assertEqual(booking.customer, self.customer)
        self.assertEqual(booking.status, Booking.Status.PENDING)
        self.assertEqual(booking.booking_date, self.today_date)
        self.assertEqual(booking.address, "123 Test Street, Hazaribagh, 825301")

    def test_pricing_calculation_uses_authoritative_service_price(self):
        booking = BookingService.create_booking(
            customer=self.customer,
            vehicle=self.vehicle,
            service=self.cheap_service,
            booking_date=self.today_date,
            address="123 Test Street, Hazaribagh, 825301",
        )
        self.assertEqual(booking.base_price, Decimal("1.00"))
        self.assertEqual(booking.tax, Decimal("0.18"))
        self.assertEqual(booking.total_price, Decimal("51.18"))

    def test_client_pricing_tampering_ignored(self):
        response = self.client.post("/api/bookings/", {
            "vehicle_id": self.vehicle.id,
            "service_id": self.cheap_service.id,
            "booking_date": str(self.today_date),
            "address": "123 Test Street, Hazaribagh, 825301",
            "base_price": 9999,
            "total_price": 0,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        booking = Booking.objects.get(pk=response.data["id"])
        self.assertEqual(booking.base_price, Decimal("1.00"))
        self.assertEqual(booking.tax, Decimal("0.18"))
        self.assertEqual(booking.total_price, Decimal("51.18"))

    def test_idor_protection_customer_cannot_access_other_booking(self):
        booking = BookingService.create_booking(
            customer=self.other_customer,
            vehicle=Vehicle.objects.create(
                owner=self.other_customer,
                brand="Hyundai",
                model="i20",
                registration_number="KA03EF9012",
            ),
            service=self.service,
            booking_date=self.today_date,
            address="789 Other Street, Hazaribagh",
        )

        url = f"/api/bookings/{booking.id}/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

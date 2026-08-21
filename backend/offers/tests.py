from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Offer
from services.models import Service
from service_areas.models import ServiceArea
from bookings.pricing_service import BookingPricingService

User = get_user_model()


class OffersAPITestCase(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            email="admin@test.com", password="adminpassword123", fullname="Admin User", role="admin"
        )
        self.customer = User.objects.create_user(
            email="customer@test.com", password="customerpassword123", fullname="Customer User"
        )
        self.service = Service.objects.create(
            name="Exterior Foam Wash",
            description="Foam wash",
            price=Decimal("499.00"),
            duration_minutes=45,
            is_active=True,
        )
        self.area = ServiceArea.objects.create(
            name="Hazaribagh Central",
            city="Hazaribagh",
            pincodes="825301",
            travel_charge=Decimal("50.00"),
            is_active=True,
        )
        # Offer A: 10% OFF
        self.offer_pct = Offer.objects.create(
            name="10% OFF Special",
            discount_type=Offer.DiscountType.PERCENTAGE,
            discount_value=Decimal("10.00"),
            min_booking_amount=Decimal("400.00"),
            is_active=True,
        )
        # Offer B: ₹100 OFF Fixed (Higher discount than 10% of 549 = 54.90)
        self.offer_fixed = Offer.objects.create(
            name="₹100 OFF Deal",
            discount_type=Offer.DiscountType.FIXED,
            discount_value=Decimal("100.00"),
            min_booking_amount=Decimal("400.00"),
            is_active=True,
        )

    def test_automatic_best_offer_selection(self):
        # Service 499 + Travel 50 = Subtotal 549
        # Offer A (10%) discount = 54.90
        # Offer B (Fixed 100) discount = 100.00
        # Best offer selected should be Offer B (₹100 OFF Deal)
        pricing = BookingPricingService.calculate(
            service=self.service,
            address="Matwari, Hazaribagh 825301",
            customer=self.customer,
        )
        self.assertEqual(pricing.service_price, Decimal("499.00"))
        self.assertEqual(pricing.travel_charge, Decimal("50.00"))
        self.assertEqual(pricing.subtotal, Decimal("549.00"))
        self.assertEqual(pricing.discount, Decimal("100.00"))
        self.assertEqual(pricing.final_amount, Decimal("449.00"))
        self.assertEqual(pricing.offer.name, "₹100 OFF Deal")

    def test_admin_crud_offer(self):
        self.client.force_authenticate(user=self.admin)
        payload = {
            "name": "New Year Special",
            "discount_type": "percentage",
            "discount_value": "15.00",
            "min_booking_amount": "500.00",
            "is_active": True,
        }
        res = self.client.post("/api/admin/offers/", payload)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Offer.objects.filter(name="New Year Special").exists())

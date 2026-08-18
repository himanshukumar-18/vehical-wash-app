import hashlib
import hmac
import json
from datetime import date, time
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from bookings.models import Booking
from bookings.services import BookingService
from payments.models import Payment, PaymentEvent
from payments.services import PaymentService
from services.models import Service
from slots.models import Slot
from vehicles.models import Vehicle

User = get_user_model()


class PaymentTests(TestCase):
    def setUp(self):
        settings.RAZORPAY_KEY_ID = "rzp_test_mock"
        settings.RAZORPAY_KEY_SECRET = "mock_secret"
        settings.RAZORPAY_WEBHOOK_SECRET = "mock_webhook_secret"

        self.customer = User.objects.create_user(
            email="payuser@example.com",
            fullname="Pay User",
            password="Password123!",
            is_verified=True,
        )
        self.vehicle = Vehicle.objects.create(
            owner=self.customer,
            brand="Tesla",
            model="Model 3",
            registration_number="KA05TS1111",
        )
        self.service = Service.objects.create(
            name="Full Detail",
            price=Decimal("999.00"),
            duration_minutes=60,
        )
        self.slot = Slot.objects.create(
            date=date.today(),
            start_time=time(14, 0),
            end_time=time(15, 0),
            capacity=5,
        )
        self.booking = BookingService.create_booking(
            customer=self.customer,
            vehicle=self.vehicle,
            service=self.service,
            booking_date=date.today(),
            address="100 Tech Park",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.customer)

    def test_payment_record_creation(self):
        payment = Payment.objects.create(
            booking=self.booking,
            amount=self.booking.total_price,
            currency="INR",
            provider=Payment.Provider.RAZORPAY,
            provider_order_id="order_mock123",
        )
        self.assertEqual(payment.amount, self.booking.total_price)
        self.assertEqual(payment.status, Payment.Status.PENDING)

    def test_webhook_signature_verification_and_settlement(self):
        payment = Payment.objects.create(
            booking=self.booking,
            amount=self.booking.total_price,
            currency="INR",
            provider=Payment.Provider.RAZORPAY,
            provider_order_id="order_settle_999",
        )

        payload = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_mock999",
                        "order_id": "order_settle_999",
                        "amount": int(self.booking.total_price * 100),
                        "status": "captured",
                    }
                }
            },
        }
        raw_body = json.dumps(payload).encode("utf-8")
        signature = hmac.new(b"mock_webhook_secret", raw_body, hashlib.sha256).hexdigest()

        response = self.client.post(
            reverse("razorpay-webhook"),
            data=raw_body,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE=signature,
            HTTP_X_RAZORPAY_EVENT_ID="evt_mock999",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json().get("accepted"))

        payment.refresh_from_db()
        self.booking.refresh_from_db()
        self.assertEqual(payment.status, Payment.Status.PAID)
        self.assertEqual(self.booking.payment_status, Booking.PaymentStatus.PAID)
        self.assertEqual(self.booking.status, Booking.Status.CONFIRMED)

    def test_duplicate_webhook_idempotency(self):
        payment = Payment.objects.create(
            booking=self.booking,
            amount=self.booking.total_price,
            currency="INR",
            provider=Payment.Provider.RAZORPAY,
            provider_order_id="order_dup_111",
        )

        payload = {
            "event": "payment.captured",
            "payload": {
                "payment": {
                    "entity": {
                        "id": "pay_dup_111",
                        "order_id": "order_dup_111",
                        "amount": int(self.booking.total_price * 100),
                    }
                }
            },
        }
        raw_body = json.dumps(payload).encode("utf-8")
        signature = hmac.new(b"mock_webhook_secret", raw_body, hashlib.sha256).hexdigest()

        # First webhook request
        self.client.post(
            reverse("razorpay-webhook"),
            data=raw_body,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE=signature,
            HTTP_X_RAZORPAY_EVENT_ID="evt_dup_111",
        )

        # Duplicate webhook request with same event ID
        res2 = self.client.post(
            reverse("razorpay-webhook"),
            data=raw_body,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE=signature,
            HTTP_X_RAZORPAY_EVENT_ID="evt_dup_111",
        )
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertTrue(res2.json().get("already_processed"))

    def test_invalid_webhook_signature_rejected(self):
        payload = {"event": "payment.captured"}
        raw_body = json.dumps(payload).encode("utf-8")

        response = self.client.post(
            reverse("razorpay-webhook"),
            data=raw_body,
            content_type="application/json",
            HTTP_X_RAZORPAY_SIGNATURE="invalid_sig",
            HTTP_X_RAZORPAY_EVENT_ID="evt_bad_sig",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

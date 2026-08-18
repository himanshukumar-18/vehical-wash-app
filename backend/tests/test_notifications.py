from datetime import date, time
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from bookings.models import Booking
from bookings.services import BookingService
from notifications.models import Notification
from notifications.services import NotificationService
from payments.models import Payment
from payments.services import PaymentService
from services.models import Service
from slots.models import Slot
from vehicles.models import Vehicle

User = get_user_model()


class NotificationTests(TestCase):
    def setUp(self):
        self.customer1 = User.objects.create_user(
            email="notif1@example.com",
            fullname="User One",
            password="Password123!",
            is_verified=True,
        )
        self.customer2 = User.objects.create_user(
            email="notif2@example.com",
            fullname="User Two",
            password="Password123!",
            is_verified=True,
        )

        self.service = Service.objects.create(
            name="Deluxe Wash",
            price=Decimal("799.00"),
            duration_minutes=45,
        )
        self.slot = Slot.objects.create(
            date=date.today(),
            start_time=time(12, 0),
            end_time=time(12, 45),
            capacity=3,
        )
        self.vehicle = Vehicle.objects.create(
            owner=self.customer1,
            brand="Hyundai",
            model="Creta",
            registration_number="KA04MH7777",
        )

        self.client1 = APIClient()
        self.client1.force_authenticate(user=self.customer1)

        self.client2 = APIClient()
        self.client2.force_authenticate(user=self.customer2)

        from django.core.cache import cache
        cache.clear()

    def test_notification_creation_and_idempotency(self):
        n1, created1 = NotificationService.create_notification(
            recipient=self.customer1,
            title="Test Event",
            body="First payload",
            event_key="unique_evt_123",
        )
        self.assertTrue(created1)

        # Duplicate event key attempt
        n2, created2 = NotificationService.create_notification(
            recipient=self.customer1,
            title="Test Event Duplicate",
            body="Second payload",
            event_key="unique_evt_123",
        )
        self.assertFalse(created2)
        self.assertEqual(n1.id, n2.id)
        self.assertEqual(Notification.objects.filter(recipient=self.customer1).count(), 1)

    def test_idor_protection_recipient_isolation(self):
        NotificationService.create_notification(
            recipient=self.customer1,
            title="User 1 Private Notif",
            body="Secret data",
        )
        n2, _ = NotificationService.create_notification(
            recipient=self.customer2,
            title="User 2 Private Notif",
            body="Other data",
        )

        res = self.client1.get(reverse("notification-list"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        results = data.get("results", data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "User 1 Private Notif")

        read_url = reverse("notification-read", kwargs={"pk": n2.id})
        res_read = self.client1.post(read_url)
        self.assertEqual(res_read.status_code, status.HTTP_404_NOT_FOUND)

    def test_event1_user_registration_otp(self):
        client = APIClient()
        with self.captureOnCommitCallbacks(execute=True):
            res = client.post(
                reverse("register"),
                {
                    "fullname": "New Customer",
                    "email": "newcustomer@example.com",
                    "password": "Password123!",
                },
            )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        new_user = User.objects.get(email="newcustomer@example.com")

        self.assertTrue(
            Notification.objects.filter(
                recipient=new_user,
                category=Notification.Category.ACCOUNT,
            ).exists()
        )
        self.assertGreaterEqual(len(mail.outbox), 1)

    def test_event2_successful_registration_welcome_email(self):
        unverified = User.objects.create_user(
            email="unverified@example.com",
            fullname="Unverified User",
            password="Password123!",
            is_verified=False,
        )
        from users.otp import OTP
        from django.utils import timezone
        from datetime import timedelta
        OTP.objects.create(user=unverified, otp="123456", expires_at=timezone.now() + timedelta(minutes=10))

        client = APIClient()
        mail.outbox = []
        with self.captureOnCommitCallbacks(execute=True):
            res = client.post(
                reverse("verify-otp"),
                {"email": "unverified@example.com", "otp": "123456"},
            )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        unverified.refresh_from_db()
        self.assertTrue(unverified.is_verified)

        self.assertTrue(
            Notification.objects.filter(
                recipient=unverified,
                event_key=f"registration_success_{unverified.id}",
            ).exists()
        )

    def test_event3_successful_payment(self):
        booking = BookingService.create_booking(
            customer=self.customer1,
            vehicle=self.vehicle,
            service=self.service,
            booking_date=date.today(),
            address="Doorstep Location",
        )
        mail.outbox = []
        with self.captureOnCommitCallbacks(execute=True):
            payment = PaymentService.mark_cash_paid(booking=booking, actor=None)

        self.assertTrue(
            Notification.objects.filter(
                recipient=self.customer1,
                event_key=f"payment_success_{payment.id}",
            ).exists()
        )

    def test_event4_admin_confirms_booking(self):
        booking = BookingService.create_booking(
            customer=self.customer1,
            vehicle=self.vehicle,
            service=self.service,
            booking_date=date.today(),
            address="Doorstep Location",
        )
        mail.outbox = []
        with self.captureOnCommitCallbacks(execute=True):
            BookingService.confirm_booking(booking)

        self.assertTrue(
            Notification.objects.filter(
                recipient=self.customer1,
                event_key=f"booking_confirmed_{booking.id}",
            ).exists()
        )

    def test_event5_admin_completes_booking(self):
        booking = BookingService.create_booking(
            customer=self.customer1,
            vehicle=self.vehicle,
            service=self.service,
            booking_date=date.today(),
            address="Doorstep Location",
        )
        BookingService.confirm_booking(booking)
        mail.outbox = []
        with self.captureOnCommitCallbacks(execute=True):
            BookingService.complete_booking(booking)

        self.assertTrue(
            Notification.objects.filter(
                recipient=self.customer1,
                event_key=f"booking_completed_{booking.id}",
            ).exists()
        )

    def test_duplicate_status_transition_protection(self):
        booking = BookingService.create_booking(
            customer=self.customer1,
            vehicle=self.vehicle,
            service=self.service,
            booking_date=date.today(),
            address="Doorstep Location",
        )
        with self.captureOnCommitCallbacks(execute=True):
            BookingService.confirm_booking(booking)

        initial_count = Notification.objects.filter(
            recipient=self.customer1,
            event_key=f"booking_confirmed_{booking.id}",
        ).count()
        self.assertEqual(initial_count, 1)

        # Confirming an already confirmed booking should NOT generate duplicate notifications
        with self.captureOnCommitCallbacks(execute=True):
            BookingService.confirm_booking(booking)

        after_count = Notification.objects.filter(
            recipient=self.customer1,
            event_key=f"booking_confirmed_{booking.id}",
        ).count()
        self.assertEqual(after_count, 1)

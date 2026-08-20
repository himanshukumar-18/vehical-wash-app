from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone

from notifications.emails import EmailService
from notifications.services import NotificationService

from .models import Booking
from .utils import (
    calculate_discount,
    calculate_tax,
    calculate_total,
    generate_arrival_otp,
    generate_booking_number,
)
from .validators import (
    validate_booking_available,
    validate_booking_status,
    validate_payment_status,
)


class BookingService:
    """
    Booking business logic for Mobile Van Car Wash with transaction-safe notifications.
    """

    @staticmethod
    @transaction.atomic
    def create_booking(
        *,
        customer,
        vehicle,
        service,
        booking_date,
        address,
        customer_note="",
        discount_percentage=Decimal("0.00"),
        slot=None,
    ):
        """
        Production-safe mobile car wash booking creation.
        """
        validate_booking_available(customer, vehicle, service, booking_date=booking_date, slot=slot)

        base_price = service.price
        tax = calculate_tax(base_price)
        discount = calculate_discount(base_price, discount_percentage)
        total = calculate_total(base_price, tax, discount)

        booking = Booking.objects.create(
            booking_number=generate_booking_number(),
            customer=customer,
            vehicle=vehicle,
            service=service,
            booking_date=booking_date,
            slot=slot,
            address=address,
            customer_note=customer_note,
            base_price=base_price,
            tax=tax,
            discount=discount,
            total_price=total,
            arrival_otp=generate_arrival_otp(),
        )

        if slot:
            slot.booked_count += 1
            slot.save(update_fields=["booked_count"])

        # Notifications queued on transaction commit
        transaction.on_commit(lambda b=booking: EmailService.enqueue_booking_confirmation(b))
        transaction.on_commit(lambda b=booking: EmailService.enqueue_booking_otp(b))
        transaction.on_commit(lambda b=booking: NotificationService.notify_booking_created(b))

        return booking

    @staticmethod
    @transaction.atomic
    def confirm_booking(booking):
        """
        Owner/Admin confirms booking.
        """
        if booking.status == Booking.Status.CONFIRMED:
            return booking

        booking.status = Booking.Status.CONFIRMED
        booking.confirmed_at = timezone.now()
        booking.save(update_fields=["status", "confirmed_at", "updated_at"])
        transaction.on_commit(lambda b=booking: NotificationService.notify_booking_confirmed(b))
        transaction.on_commit(lambda b=booking: EmailService.enqueue_booking_confirmation(b))
        return booking

    @staticmethod
    @transaction.atomic
    def start_booking(booking):
        """
        Team starts washing.
        """
        booking.status = Booking.Status.IN_PROGRESS
        booking.started_at = timezone.now()
        booking.save(update_fields=["status", "started_at", "updated_at"])
        transaction.on_commit(
            lambda b=booking: NotificationService.create_notification(
                recipient=b.customer,
                title="Service Started",
                body=f"Your car wash service for booking #{b.booking_number} has started.",
                action_url=f"/bookings/{b.booking_number}",
            )
        )
        return booking

    @staticmethod
    @transaction.atomic
    def complete_booking(booking, otp=None):
        """
        Complete booking.
        Verifies customer arrival OTP if provided.
        Auto-settles cash payment if unpaid upon completion.
        """
        if not booking.otp_verified:
            if otp and str(booking.arrival_otp).strip() != str(otp).strip():
                raise ValidationError("Invalid Arrival OTP code. Please enter the correct OTP provided by the customer.")
            booking.otp_verified = True
            booking.otp_verified_at = timezone.now()

        if booking.payment_status != Booking.PaymentStatus.PAID:
            from payments.services import PaymentService
            PaymentService.mark_cash_paid(booking=booking, actor=None)
            booking.refresh_from_db()

        booking.status = Booking.Status.COMPLETED
        booking.completed_at = timezone.now()
        booking.save(update_fields=["status", "completed_at", "otp_verified", "otp_verified_at", "updated_at"])

        transaction.on_commit(lambda b=booking: EmailService.enqueue_booking_completed(b))
        transaction.on_commit(lambda b=booking: NotificationService.notify_booking_completed(b))
        return booking

    @staticmethod
    @transaction.atomic
    def cancel_booking(booking):
        """
        Cancel booking safely.
        """
        validate_booking_status(booking)

        booking.status = Booking.Status.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.save(update_fields=["status", "cancelled_at", "updated_at"])

        if booking.slot and booking.slot.booked_count > 0:
            booking.slot.booked_count -= 1
            booking.slot.save(update_fields=["booked_count"])

        transaction.on_commit(lambda b=booking: EmailService.enqueue_booking_cancelled(b))
        transaction.on_commit(lambda b=booking: NotificationService.notify_booking_cancelled(b))
        return booking

    @staticmethod
    @transaction.atomic
    def mark_payment_paid(booking):
        """
        Update payment status to paid.
        """
        from payments.services import PaymentService
        PaymentService.mark_cash_paid(booking=booking, actor=None)
        booking.refresh_from_db()
        return booking

    @staticmethod
    @transaction.atomic
    def refund_booking(booking):
        raise ValidationError("Use the payment refund workflow; direct status changes are not permitted.")

    @staticmethod
    @transaction.atomic
    def verify_otp(booking, otp):
        """
        Verify customer arrival OTP.
        """
        if booking.otp_verified:
            raise ValidationError("OTP already verified.")
        if booking.arrival_otp != otp:
            raise ValidationError("Invalid OTP.")

        booking.otp_verified = True
        booking.otp_verified_at = timezone.now()
        booking.save(update_fields=["otp_verified", "otp_verified_at"])

        transaction.on_commit(
            lambda b=booking: NotificationService.create_notification(
                recipient=b.customer,
                title="Arrival OTP Verified",
                body=f"Your arrival OTP for booking #{b.booking_number} was verified successfully.",
                action_url=f"/bookings/{b.booking_number}",
            )
        )
        return booking

    @staticmethod
    @transaction.atomic
    def resend_otp(booking):
        """
        Generate and resend arrival OTP.
        """
        if booking.otp_created_at:
            seconds = (timezone.now() - booking.otp_created_at).total_seconds()
            if seconds < 60:
                raise ValidationError(f"Please wait {int(60-seconds)} seconds before requesting another OTP.")

        booking.arrival_otp = generate_arrival_otp()
        booking.otp_created_at = timezone.now()
        booking.otp_verified = False
        booking.otp_verified_at = None

        booking.save(update_fields=["arrival_otp", "otp_created_at", "otp_verified", "otp_verified_at"])
        transaction.on_commit(lambda b=booking: EmailService.enqueue_booking_otp(b))
        return booking

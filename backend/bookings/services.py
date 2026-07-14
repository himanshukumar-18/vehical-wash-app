from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from django.core.exceptions import ValidationError

from notifications.emails import EmailService

from .models import Booking
from slots.models import Slot

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
    Booking business logic.
    """

    @staticmethod
    @transaction.atomic
    def create_booking(
        *,
        customer,
        vehicle,
        service,
        slot,
        address,
        customer_note="",
        discount_percentage=Decimal("0.00"),
    ):
        """
        Production-safe booking creation.
        Prevents race conditions using row locking.
        """

        # Lock slot row to prevent race condition
        slot = Slot.objects.select_for_update().get(pk=slot.pk)

        validate_booking_available(customer, vehicle, service, slot)

        base_price = service.price
        tax = calculate_tax(base_price)
        discount = calculate_discount(base_price, discount_percentage)
        total = calculate_total(base_price, tax, discount)

        booking = Booking.objects.create(
            booking_number=generate_booking_number(),
            customer=customer,
            vehicle=vehicle,
            service=service,
            slot=slot,
            address=address,
            customer_note=customer_note,
            base_price=base_price,
            tax=tax,
            discount=discount,
            total_price=total,
            arrival_otp=generate_arrival_otp(),
        )

        slot.booked_count += 1
        slot.save(update_fields=["booked_count"])

        # Send emails only after successful commit
        transaction.on_commit(
            lambda: EmailService.send_booking_confirmation(booking)
        )

        transaction.on_commit(
            lambda: EmailService.send_booking_otp(booking)
        )

        return booking

    @staticmethod
    @transaction.atomic
    def confirm_booking(booking):
        """
        Confirm booking.
        """

        booking.status = Booking.Status.CONFIRMED
        booking.confirmed_at = timezone.now()
        booking.save(update_fields=["status", "confirmed_at"])

        return booking

    @staticmethod
    @transaction.atomic
    def start_booking(booking):
        """
        Start washing.
        """

        booking.status = Booking.Status.IN_PROGRESS
        booking.started_at = timezone.now()
        booking.save(update_fields=["status", "started_at"])

        return booking

    @staticmethod
    @transaction.atomic
    def complete_booking(booking):
        """
        Complete booking.
        """

        validate_payment_status(booking)

        booking.status = Booking.Status.COMPLETED
        booking.completed_at = timezone.now()

        booking.save(
            update_fields=[
            "status",
            "completed_at",
            ]
        )

        transaction.on_commit(
            lambda: EmailService.send_booking_completed(booking)
        )

        return booking

    @staticmethod
    @transaction.atomic
    def cancel_booking(booking):
        """
        Cancel booking safely and release slot.
        """

        validate_booking_status(booking)

        # Lock slot row before decrementing
        slot = Slot.objects.select_for_update().get(pk=booking.slot.pk)

        booking.status = Booking.Status.CANCELLED
        booking.cancelled_at = timezone.now()
        booking.save(update_fields=["status", "cancelled_at"])

        if slot.booked_count > 0:
            slot.booked_count -= 1
            slot.save(update_fields=["booked_count"])

        transaction.on_commit(
            lambda: EmailService.send_booking_cancelled(booking)
        )

        return booking

    @staticmethod
    @transaction.atomic
    def mark_payment_paid(booking):
        """
        Update payment status to paid.
        """

        booking.payment_status = Booking.PaymentStatus.PAID

        booking.save(
            update_fields=[
        "payment_status",
        ]
        )

        transaction.on_commit(
            lambda: EmailService.send_payment_success(
                booking=booking,
                transaction_id=None,
                payment_method="Cash",
            )
        )

        return booking

    @staticmethod
    @transaction.atomic
    def refund_booking(booking):
        """
        Refund booking.
        """

        booking.payment_status = Booking.PaymentStatus.REFUNDED
        booking.save(update_fields=["payment_status"])

        return booking

    @staticmethod
    @transaction.atomic
    def change_slot(booking, new_slot):
        """
        Change booking slot safely.
        Releases old slot and locks new slot before assigning.
        """

        # Lock both slots to prevent race conditions
        old_slot = Slot.objects.select_for_update().get(pk=booking.slot.pk)
        new_slot = Slot.objects.select_for_update().get(pk=new_slot.pk)

        validate_booking_available(
            booking.customer,
            booking.vehicle,
            booking.service,
            new_slot,
        )

        if old_slot.booked_count > 0:
            old_slot.booked_count -= 1
            old_slot.save(update_fields=["booked_count"])

        new_slot.booked_count += 1
        new_slot.save(update_fields=["booked_count"])

        booking.slot = new_slot
        booking.save(update_fields=["slot"])

        return booking

    @staticmethod
    @transaction.atomic
    def verify_otp(
        booking,
        otp,
    ):
        """
        Verify customer arrival OTP.
        """

        if booking.otp_verified:
            raise ValidationError(
                "OTP already verified."
            )

        if booking.is_otp_expired:
            raise ValidationError(
                "OTP has expired."
            )

        if booking.arrival_otp != otp:
            raise ValidationError(
                "Invalid OTP."
            )

        booking.otp_verified = True
        booking.otp_verified_at = timezone.now()

        booking.save(
        update_fields=[
            "otp_verified",
            "otp_verified_at",
        ]
        )

        return booking

    @staticmethod
    @transaction.atomic
    def resend_otp(
        booking,
    ):
        """
        Generate and send a new OTP.
        """

        booking.arrival_otp = generate_arrival_otp()
        booking.otp_created_at = timezone.now()
        booking.otp_verified = False
        booking.otp_verified_at = None

        booking.save(
            update_fields=[
                "arrival_otp",
                "otp_created_at",
                "otp_verified",
                "otp_verified_at",
            ]
        )

        transaction.on_commit(
            lambda: EmailService.send_booking_otp(booking)
        )

        return booking

    @staticmethod
    @transaction.atomic
    def resend_otp(booking):
        """
        Generate and resend arrival OTP.
        """

        # Optional: Prevent frequent resend requests
        if booking.otp_created_at:
            seconds = (
                timezone.now() - booking.otp_created_at
            ).total_seconds()

            if seconds < 60:
                raise ValidationError(
                    f"Please wait {int(60-seconds)} seconds before requesting another OTP."
                )

        booking.arrival_otp = generate_arrival_otp()

        booking.otp_created_at = timezone.now()

        booking.otp_verified = False

        booking.otp_verified_at = None

        booking.save(
            update_fields=[
                "arrival_otp",
                "otp_created_at",
                "otp_verified",
                "otp_verified_at",
            ]
        )

        transaction.on_commit(
            lambda: EmailService.send_booking_otp(
                booking
            )
        )

        return booking
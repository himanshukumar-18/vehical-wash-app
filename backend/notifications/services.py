import logging
from django.db import IntegrityError, transaction
from .models import Notification

logger = logging.getLogger(__name__)


class NotificationService:
    """Centralized production notification service with built-in idempotency and safety."""

    @classmethod
    def create_notification(
        cls,
        *,
        recipient,
        title,
        body,
        category=Notification.Category.SYSTEM,
        priority=Notification.Priority.NORMAL,
        action_url="",
        event_key=None,
    ):
        """
        Creates an in-app notification idempotently if an event_key is provided.
        Catches database errors gracefully so background notifications never break core transactions.
        """
        if event_key:
            try:
                existing = Notification.objects.filter(event_key=event_key).first()
                if existing:
                    return existing, False
            except Exception as exc:
                logger.error("Error querying notification by event_key=%s: %s", event_key, exc)

        try:
            if event_key:
                notification, created = Notification.objects.get_or_create(
                    event_key=event_key,
                    defaults={
                        "recipient": recipient,
                        "title": title,
                        "body": body,
                        "category": category,
                        "priority": priority,
                        "action_url": action_url,
                    },
                )
                return notification, created
            else:
                notification = Notification.objects.create(
                    recipient=recipient,
                    title=title,
                    body=body,
                    category=category,
                    priority=priority,
                    action_url=action_url,
                )
                return notification, True
        except IntegrityError:
            logger.warning("Duplicate notification attempt for event_key=%s", event_key)
            try:
                return Notification.objects.filter(event_key=event_key).first(), False
            except Exception:
                return None, False
        except Exception as exc:
            logger.error("Failed to create notification for recipient=%s, title=%s: %s", recipient, title, exc)
            return None, False

    # ------------------------------------------------------------------
    # Account Lifecycle Notifications
    # ------------------------------------------------------------------

    @classmethod
    def notify_user_otp(cls, user, otp):
        event_key = f"user_otp_{user.id}_{otp}"
        return cls.create_notification(
            recipient=user,
            title="Email Verification OTP",
            body=f"Your verification OTP code for The Black Wash is: {otp}. Valid for 10 minutes.",
            category=Notification.Category.ACCOUNT,
            priority=Notification.Priority.HIGH,
            action_url="/verify-otp",
            event_key=event_key,
        )

    @classmethod
    def notify_registration_success(cls, user):
        event_key = f"registration_success_{user.id}"
        return cls.create_notification(
            recipient=user,
            title="Welcome to The Black Wash!",
            body=f"Hello {user.fullname}, your account has been verified and registered successfully. Welcome aboard!",
            category=Notification.Category.ACCOUNT,
            priority=Notification.Priority.HIGH,
            action_url="/",
            event_key=event_key,
        )

    # ------------------------------------------------------------------
    # Booking Lifecycle Notifications
    # ------------------------------------------------------------------

    @classmethod
    def notify_booking_created(cls, booking):
        event_key = f"booking_created_{booking.id}"
        pricing_str = f"Base: ₹{booking.base_price}"
        if getattr(booking, "travel_charge", 0) and float(booking.travel_charge) > 0:
            pricing_str += f", Travel Fee: ₹{booking.travel_charge}"
        if getattr(booking, "discount", 0) and float(booking.discount) > 0:
            offer_label = f" ({booking.offer_name_snapshot})" if getattr(booking, "offer_name_snapshot", "") else ""
            pricing_str += f", Offer Discount{offer_label}: -₹{booking.discount}"
        pricing_str += f", Total: ₹{booking.total_price}"

        return cls.create_notification(
            recipient=booking.customer,
            title="Booking Created",
            body=f"Your car wash booking #{booking.booking_number} for {booking.service.name} has been created. [{pricing_str}]",
            category=Notification.Category.BOOKING,
            priority=Notification.Priority.NORMAL,
            action_url=f"/bookings/{booking.booking_number}",
            event_key=event_key,
        )

    @classmethod
    def notify_booking_confirmed(cls, booking):
        event_key = f"booking_confirmed_{booking.id}"
        service_date = booking.booking_date or (booking.slot.date if booking.slot else "Scheduled Date")
        pricing_str = f"Base: ₹{booking.base_price}"
        if getattr(booking, "travel_charge", 0) and float(booking.travel_charge) > 0:
            pricing_str += f", Travel Fee: ₹{booking.travel_charge}"
        if getattr(booking, "discount", 0) and float(booking.discount) > 0:
            offer_label = f" ({booking.offer_name_snapshot})" if getattr(booking, "offer_name_snapshot", "") else ""
            pricing_str += f", Offer Discount{offer_label}: -₹{booking.discount}"
        pricing_str += f", Total Amount: ₹{booking.total_price}"

        return cls.create_notification(
            recipient=booking.customer,
            title="Booking Confirmed",
            body=f"Your car wash booking #{booking.booking_number} has been confirmed for {service_date}. [{pricing_str}]",
            category=Notification.Category.BOOKING,
            priority=Notification.Priority.HIGH,
            action_url=f"/bookings/{booking.booking_number}",
            event_key=event_key,
        )

    @classmethod
    def notify_booking_cancelled(cls, booking):
        event_key = f"booking_cancelled_{booking.id}"
        return cls.create_notification(
            recipient=booking.customer,
            title="Booking Cancelled",
            body=f"Your car wash booking #{booking.booking_number} for {booking.service.name} (Amount: ₹{booking.total_price}) has been cancelled successfully.",
            category=Notification.Category.BOOKING,
            priority=Notification.Priority.HIGH,
            action_url=f"/bookings/{booking.booking_number}",
            event_key=event_key,
        )

    @classmethod
    def notify_booking_rescheduled(cls, booking, new_slot=None):
        slot_id = getattr(new_slot, "id", "new")
        event_key = f"booking_rescheduled_{booking.id}_{slot_id}"
        date_str = getattr(new_slot, "date", booking.booking_date or "new date")
        time_str = f" ({new_slot.start_time})" if getattr(new_slot, "start_time", None) else ""
        return cls.create_notification(
            recipient=booking.customer,
            title="Booking Rescheduled",
            body=f"Your booking #{booking.booking_number} has been rescheduled to {date_str}{time_str}. Total: ₹{booking.total_price}.",
            category=Notification.Category.BOOKING,
            priority=Notification.Priority.NORMAL,
            action_url=f"/bookings/{booking.booking_number}",
            event_key=event_key,
        )

    @classmethod
    def notify_booking_completed(cls, booking):
        event_key = f"booking_completed_{booking.id}"
        pricing_str = f"Base: ₹{booking.base_price}"
        if getattr(booking, "travel_charge", 0) and float(booking.travel_charge) > 0:
            pricing_str += f", Travel Fee: ₹{booking.travel_charge}"
        if getattr(booking, "discount", 0) and float(booking.discount) > 0:
            offer_label = f" ({booking.offer_name_snapshot})" if getattr(booking, "offer_name_snapshot", "") else ""
            pricing_str += f", Offer Discount{offer_label}: -₹{booking.discount}"
        pricing_str += f", Total Paid: ₹{booking.total_price}"

        return cls.create_notification(
            recipient=booking.customer,
            title="Service Completed",
            body=f"Your car wash service for booking #{booking.booking_number} has been completed. [{pricing_str}]",
            category=Notification.Category.BOOKING,
            priority=Notification.Priority.NORMAL,
            action_url=f"/bookings/{booking.booking_number}",
            event_key=event_key,
        )

    # ------------------------------------------------------------------
    # Payment Lifecycle Notifications
    # ------------------------------------------------------------------

    @classmethod
    def notify_payment_success(cls, payment):
        event_key = f"payment_success_{payment.id}"
        return cls.create_notification(
            recipient=payment.booking.customer,
            title="Payment Successful",
            body=f"Payment of ₹{payment.amount} for booking #{payment.booking.booking_number} was completed successfully.",
            category=Notification.Category.PAYMENT,
            priority=Notification.Priority.HIGH,
            action_url=f"/bookings/{payment.booking.booking_number}",
            event_key=event_key,
        )

    @classmethod
    def notify_payment_failed(cls, payment):
        event_key = f"payment_failed_{payment.id}"
        return cls.create_notification(
            recipient=payment.booking.customer,
            title="Payment Failed",
            body=f"Payment attempt for booking #{payment.booking.booking_number} failed. Please try again.",
            category=Notification.Category.PAYMENT,
            priority=Notification.Priority.URGENT,
            action_url=f"/bookings/{payment.booking.booking_number}",
            event_key=event_key,
        )

    @classmethod
    def notify_refund_requested(cls, refund):
        event_key = f"refund_requested_{refund.id}"
        return cls.create_notification(
            recipient=refund.payment.booking.customer,
            title="Refund Requested",
            body=f"A refund request of ₹{refund.amount} for booking #{refund.payment.booking.booking_number} has been received.",
            category=Notification.Category.REFUND,
            priority=Notification.Priority.NORMAL,
            action_url=f"/bookings/{refund.payment.booking.booking_number}",
            event_key=event_key,
        )

    @classmethod
    def notify_refund_completed(cls, refund):
        event_key = f"refund_completed_{refund.id}"
        return cls.create_notification(
            recipient=refund.payment.booking.customer,
            title="Refund Processed",
            body=f"Your refund of ₹{refund.amount} for booking #{refund.payment.booking.booking_number} has been processed successfully.",
            category=Notification.Category.REFUND,
            priority=Notification.Priority.HIGH,
            action_url=f"/bookings/{refund.payment.booking.booking_number}",
            event_key=event_key,
        )


def create_booking_notification(booking, *, title, body, category=Notification.Category.BOOKING, priority=Notification.Priority.NORMAL):
    notification, _ = NotificationService.create_notification(
        recipient=booking.customer,
        title=title,
        body=body,
        category=category,
        priority=priority,
        action_url=f"/bookings/{booking.booking_number}",
    )
    return notification

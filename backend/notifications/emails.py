import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


class EmailService:
    """
    Centralized email service for The Black Wash with fail-safe async/sync dispatching.
    """

    @staticmethod
    def send_html_email(
        *,
        subject,
        template_name,
        context,
        recipient_list,
    ):
        """
        Send HTML email with fallback exception handling.
        """
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@theblackwash.com')
            html_content = render_to_string(
                template_name,
                context,
            )

            email = EmailMultiAlternatives(
                subject=subject,
                body="Please enable HTML email to view this message.",
                from_email=from_email,
                to=recipient_list,
            )

            email.attach_alternative(
                html_content,
                "text/html",
            )

            sent = email.send(fail_silently=True)
            logger.info("Dispatched HTML email '%s' to %s (sent=%s)", subject, recipient_list, sent)
            return sent
        except Exception as exc:
            logger.error("Failed to send HTML email '%s' to %s: %s", subject, recipient_list, exc)
            return 0

    @staticmethod
    def _enqueue(task, fallback_fn, *args):
        """
        Enqueues Celery task; falls back to synchronous execution if Celery or Redis is unreachable.
        """
        try:
            task.delay(*args)
        except Exception as exc:
            logger.warning("Celery dispatch unavailable for task %s (%s). Executing synchronously...", task, exc)
            try:
                fallback_fn(*args)
            except Exception as sync_exc:
                logger.error("Synchronous email fallback failed: %s", sync_exc)

    @classmethod
    def _enqueue_booking(cls, booking, event):
        from .tasks import send_booking_email
        fallback = getattr(cls, f"send_booking_{event}", None)
        cls._enqueue(send_booking_email, lambda b_id, evt: fallback(booking) if fallback else None, booking.pk, event)

    # -------------------------------------------------------
    # 1. Registration OTP
    # -------------------------------------------------------

    @classmethod
    def send_user_otp(cls, email, otp_code, user_name="Customer"):
        return cls.send_html_email(
            subject="🔐 Your Black Wash verification code is here!",
            template_name="otp_email.html",
            recipient_list=[email],
            context={
                "otp": otp_code,
                "user_name": user_name,
                "website_url": settings.FRONTEND_URL,
                "support_email": getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@theblackwash.com'),
            },
        )

    @classmethod
    def enqueue_user_otp(cls, email, otp_code, user_name="Customer"):
        from .tasks import send_user_otp_email
        cls._enqueue(send_user_otp_email, lambda e, o, n: cls.send_user_otp(e, o, n), email, otp_code, user_name)

    # -------------------------------------------------------
    # 2. Registration Success / Welcome
    # -------------------------------------------------------

    @classmethod
    def send_welcome_email(cls, user):
        return cls.send_html_email(
            subject="🎉 Welcome to The Black Wash!",
            template_name="welcome.html",
            recipient_list=[user.email],
            context={
                "user": user,
                "user_name": user.fullname,
                "website_url": settings.FRONTEND_URL,
                "support_email": getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@theblackwash.com'),
            },
        )

    @classmethod
    def enqueue_welcome_email(cls, user):
        from .tasks import send_welcome_email_task
        cls._enqueue(send_welcome_email_task, lambda u_id: cls.send_welcome_email(user), user.pk)

    # -------------------------------------------------------
    # 3. Booking Confirmation (Admin Confirms)
    # -------------------------------------------------------

    @classmethod
    def send_booking_confirmation(cls, booking):
        return cls.send_html_email(
            subject=f"🚗✨ Your car wash is officially confirmed • #{booking.booking_number}",
            template_name="booking_confirmation.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "website_url": settings.FRONTEND_URL,
                "support_email": getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@theblackwash.com'),
            },
        )

    @classmethod
    def enqueue_booking_confirmation(cls, booking):
        cls._enqueue_booking(booking, "confirmation")

    # -------------------------------------------------------
    # 4. Arrival OTP
    # -------------------------------------------------------

    @classmethod
    def send_booking_otp(cls, booking):
        return cls.send_html_email(
            subject="🔐 Your Vehicle Arrival OTP",
            template_name="otp_email.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "otp": booking.arrival_otp,
                "user_name": booking.customer.fullname if booking.customer else "Customer",
                "website_url": settings.FRONTEND_URL,
                "support_email": getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@theblackwash.com'),
            },
        )

    @classmethod
    def enqueue_booking_otp(cls, booking):
        cls._enqueue_booking(booking, "otp")

    # -------------------------------------------------------
    # 5. Payment Successful
    # -------------------------------------------------------

    @classmethod
    def send_payment_success(
        cls,
        booking,
        transaction_id=None,
        payment_method="Online",
        amount=None,
    ):
        paid_amount = amount if amount is not None else booking.total_price
        return cls.send_html_email(
            subject=f"💳 Payment received — you're all set! • #{booking.booking_number}",
            template_name="payment_success.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "transaction_id": transaction_id or f"PAY-{booking.booking_number}",
                "payment_method": payment_method,
                "amount": paid_amount,
                "payment_date": booking.updated_at,
                "website_url": settings.FRONTEND_URL,
                "support_email": getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@theblackwash.com'),
            },
        )

    @classmethod
    def enqueue_payment_success(cls, payment):
        from .tasks import send_payment_success_email
        cls._enqueue(
            send_payment_success_email,
            lambda p_id: cls.send_payment_success(
                payment.booking,
                transaction_id=payment.provider_payment_id,
                payment_method=payment.get_provider_display(),
                amount=payment.amount,
            ),
            str(payment.pk),
        )

    @classmethod
    def send_refund_success(cls, refund):
        return cls.send_html_email(
            subject=f"Refund successful • #{refund.payment.booking.booking_number}",
            template_name="booking_cancelled.html",
            recipient_list=[refund.payment.booking.customer.email],
            context={
                "booking": refund.payment.booking,
                "website_url": settings.FRONTEND_URL,
                "support_email": getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@theblackwash.com'),
                "refund": refund,
            },
        )

    @classmethod
    def enqueue_refund_success(cls, refund):
        from .tasks import send_refund_success_email
        cls._enqueue(
            send_refund_success_email,
            lambda r_id: cls.send_refund_success(refund),
            str(refund.pk),
        )

    # -------------------------------------------------------
    # 6. Booking Cancelled
    # -------------------------------------------------------

    @classmethod
    def send_booking_cancelled(cls, booking):
        return cls.send_html_email(
            subject=f"❌ Booking Cancelled • #{booking.booking_number}",
            template_name="booking_cancelled.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "website_url": settings.FRONTEND_URL,
                "support_email": getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@theblackwash.com'),
            },
        )

    @classmethod
    def enqueue_booking_cancelled(cls, booking):
        cls._enqueue_booking(booking, "cancelled")

    # -------------------------------------------------------
    # 7. Booking Completed (Admin Completes)
    # -------------------------------------------------------

    @classmethod
    def send_booking_completed(cls, booking):
        return cls.send_html_email(
            subject=f"✨ Your Black Wash service is complete! • #{booking.booking_number}",
            template_name="booking_completed.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "website_url": settings.FRONTEND_URL,
                "review_url": f"{settings.FRONTEND_URL}/review",
                "support_email": getattr(settings, 'DEFAULT_FROM_EMAIL', 'support@theblackwash.com'),
            },
        )

    @classmethod
    def enqueue_booking_completed(cls, booking):
        cls._enqueue_booking(booking, "completed")

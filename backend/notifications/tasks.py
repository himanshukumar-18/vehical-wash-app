import logging
import smtplib
from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    dont_autoretry_for=(smtplib.SMTPAuthenticationError,),
    retry_backoff=True,
    max_retries=3,
)
def send_templated_email(self, *, subject, template_name, context, recipient):
    try:
        html = render_to_string(template_name, context)
        message = EmailMultiAlternatives(
            subject, "Please enable HTML email to view this message.", to=[recipient]
        )
        message.attach_alternative(html, "text/html")
        message.send(fail_silently=False)
    except smtplib.SMTPAuthenticationError as exc:
        logger.error(
            "SMTP Authentication Error: Check EMAIL_HOST_USER and EMAIL_HOST_PASSWORD environment variables. %s",
            exc,
        )
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", recipient, exc)
        raise exc


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    dont_autoretry_for=(smtplib.SMTPAuthenticationError,),
    retry_backoff=True,
    max_retries=3,
)
def send_user_otp_email(self, email, otp_code, user_name="Customer"):
    from .emails import EmailService
    try:
        EmailService.send_user_otp(email, otp_code, user_name)
    except Exception as exc:
        logger.error("Error executing send_user_otp_email task for %s: %s", email, exc)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    dont_autoretry_for=(smtplib.SMTPAuthenticationError,),
    retry_backoff=True,
    max_retries=3,
)
def send_welcome_email_task(self, user_id):
    from users.models import User
    from .emails import EmailService
    try:
        user = User.objects.get(pk=user_id)
        EmailService.send_welcome_email(user)
    except Exception as exc:
        logger.error("Error executing send_welcome_email_task for user_id=%s: %s", user_id, exc)


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    dont_autoretry_for=(smtplib.SMTPAuthenticationError,),
    retry_backoff=True,
    max_retries=3,
)
def send_booking_email(self, booking_id, event):
    from bookings.models import Booking
    from .emails import EmailService

    try:
        booking = Booking.objects.select_related(
            "customer", "vehicle", "service", "slot"
        ).get(pk=booking_id)
        getattr(EmailService, f"send_booking_{event}")(booking)
    except smtplib.SMTPAuthenticationError as exc:
        logger.error(
            "SMTP Authentication Error during booking email send: %s", exc
        )
    except Exception as exc:
        logger.error(
            "Error executing send_booking_email task for booking_id=%s: %s",
            booking_id,
            exc,
        )


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    dont_autoretry_for=(smtplib.SMTPAuthenticationError,),
    retry_backoff=True,
    max_retries=3,
)
def send_payment_success_email(self, payment_id):
    from payments.models import Payment
    from .emails import EmailService

    try:
        payment = Payment.objects.select_related(
            "booking",
            "booking__customer",
            "booking__vehicle",
            "booking__service",
            "booking__slot",
        ).get(pk=payment_id)
        EmailService.send_payment_success(
            payment.booking,
            transaction_id=payment.provider_payment_id,
            payment_method=payment.get_provider_display(),
            amount=payment.amount,
        )
    except smtplib.SMTPAuthenticationError as exc:
        logger.error(
            "SMTP Authentication Error during payment success email send: %s",
            exc,
        )
    except Exception as exc:
        logger.error(
            "Error executing send_payment_success_email task for payment_id=%s: %s",
            payment_id,
            exc,
        )


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    dont_autoretry_for=(smtplib.SMTPAuthenticationError,),
    retry_backoff=True,
    max_retries=3,
)
def send_refund_success_email(self, refund_id):
    from payments.models import Refund
    from .emails import EmailService

    try:
        refund = Refund.objects.select_related(
            "payment", "payment__booking", "payment__booking__customer"
        ).get(pk=refund_id)
        EmailService.send_refund_success(refund)
    except smtplib.SMTPAuthenticationError as exc:
        logger.error(
            "SMTP Authentication Error during refund email send: %s", exc
        )
    except Exception as exc:
        logger.error(
            "Error executing send_refund_success_email task for refund_id=%s: %s",
            refund_id,
            exc,
        )

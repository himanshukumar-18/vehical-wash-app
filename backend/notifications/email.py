import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

def send_otp_email(to_email, otp_code):
    subject = f"{otp_code} is your verification code for The Black Wash"
    context = {"otp": otp_code}
    html_content = render_to_string("emails/otp.html", context)
    text_content = strip_tags(html_content)

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=False)
        return True
    except Exception as exc:
        # Log failure safely without exposing sensitive information
        logger.error("Failed to send OTP email: %s", exc.__class__.__name__)
        return False

def send_welcome_email(to_email, fullname=""):
    subject = "Welcome to The Black Wash"
    context = {"name": fullname or "Valued Customer"}
    html_content = render_to_string("emails/welcome.html", context)
    text_content = strip_tags(html_content)

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=True)
        return True
    except Exception as exc:
        logger.error("Failed to send welcome email: %s", exc.__class__.__name__)
        return False

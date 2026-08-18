import logging
from django.conf import settings
from notifications.emails import EmailService

logger = logging.getLogger(__name__)


def send_otp_email(email, otp, user_name="Customer"):
    """
    Dispatches OTP email using EmailService with fail-safe logging.
    """
    logger.info("==========================================")
    logger.info("[OTP CODE GENERATED] Email: %s | OTP: %s", email, otp)
    logger.info("==========================================")

    try:
        return EmailService.send_user_otp(email, otp, user_name)
    except Exception as exc:
        logger.error("Failed to deliver OTP email to %s: %s", email, exc)
        return 0
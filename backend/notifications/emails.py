from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


class EmailService:
    """
    Centralized email service for the application.
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
        Send HTML email.
        """

        html_content = render_to_string(
            template_name,
            context,
        )

        email = EmailMultiAlternatives(
            subject=subject,
            body="Please enable HTML email to view this message.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipient_list,
        )

        email.attach_alternative(
            html_content,
            "text/html",
        )

        email.send(
            fail_silently=False,
        )

    # -------------------------------------------------------
    # Booking Confirmation
    # -------------------------------------------------------

    @classmethod
    def send_booking_confirmation(
        cls,
        booking,
    ):
        cls.send_html_email(
            subject=f"🎉 Booking Confirmed • {booking.booking_number}",
            template_name="booking_confirmation.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "website_url": settings.FRONTEND_URL,
                "support_email": settings.DEFAULT_FROM_EMAIL,
            },
        )

    # -------------------------------------------------------
    # Arrival OTP
    # -------------------------------------------------------

    @classmethod
    def send_booking_otp(
        cls,
        booking,
    ):
        cls.send_html_email(
            subject="🔐 Your Vehicle Arrival OTP",
            template_name="otp_email.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "otp": booking.arrival_otp,
                "website_url": settings.FRONTEND_URL,
                "support_email": settings.DEFAULT_FROM_EMAIL,
            },
        )

    # -------------------------------------------------------
    # Payment Successful
    # -------------------------------------------------------

    @classmethod
    def send_payment_success(
        cls,
        booking,
        transaction_id=None,
        payment_method="Online",
    ):
        cls.send_html_email(
            subject=f"💳 Payment Successful • {booking.booking_number}",
            template_name="payment_success.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "transaction_id": transaction_id,
                "payment_method": payment_method,
                "payment_date": booking.updated_at,
                "website_url": settings.FRONTEND_URL,
                "support_email": settings.DEFAULT_FROM_EMAIL,
            },
        )

    # -------------------------------------------------------
    # Booking Cancelled
    # -------------------------------------------------------

    @classmethod
    def send_booking_cancelled(
        cls,
        booking,
    ):
        cls.send_html_email(
            subject=f"❌ Booking Cancelled • {booking.booking_number}",
            template_name="booking_cancelled.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "website_url": settings.FRONTEND_URL,
                "support_email": settings.DEFAULT_FROM_EMAIL,
            },
        )

    # -------------------------------------------------------
    # Booking Completed
    # -------------------------------------------------------

    @classmethod
    def send_booking_completed(
        cls,
        booking,
    ):
        cls.send_html_email(
            subject=f"🚗 Service Completed • {booking.booking_number}",
            template_name="booking_completed.html",
            recipient_list=[booking.customer.email],
            context={
                "booking": booking,
                "website_url": settings.FRONTEND_URL,
                "review_url": f"{settings.FRONTEND_URL}/review",
                "support_email": settings.DEFAULT_FROM_EMAIL,
            },
        )
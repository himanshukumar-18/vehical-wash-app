import logging

from celery import shared_task
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_jitter=True, max_retries=5)
def send_templated_email(self, *, subject, template_name, context, recipient):
    html = render_to_string(template_name, context)
    message = EmailMultiAlternatives(subject, "Please enable HTML email to view this message.", to=[recipient])
    message.attach_alternative(html, "text/html")
    message.send(fail_silently=False)


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_jitter=True, max_retries=5)
def send_booking_email(self, booking_id, event):
    from bookings.models import Booking
    from .emails import EmailService
    booking = Booking.objects.select_related("customer", "vehicle", "service", "slot").get(pk=booking_id)
    getattr(EmailService, f"send_booking_{event}")(booking)


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_jitter=True, max_retries=5)
def send_payment_success_email(self, payment_id):
    from payments.models import Payment
    from .emails import EmailService
    payment = Payment.objects.select_related("booking", "booking__customer", "booking__vehicle", "booking__service", "booking__slot").get(pk=payment_id)
    EmailService.send_payment_success(payment.booking, transaction_id=payment.provider_payment_id, payment_method=payment.get_provider_display())


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_jitter=True, max_retries=5)
def send_refund_success_email(self, refund_id):
    from payments.models import Refund
    from .emails import EmailService
    refund = Refund.objects.select_related("payment", "payment__booking", "payment__booking__customer").get(pk=refund_id)
    EmailService.send_refund_success(refund)

from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Booking


@receiver(post_save, sender=Booking)
def booking_created(sender, instance, created, **kwargs):
    """
    Triggered only when a booking is created.
    Keep business logic out of signals.
    """

    if not created:
        return

    # Future integrations:
    #
    # send_booking_confirmation_email(instance)
    # send_sms(instance)
    # create_notification(instance)
    # create_audit_log(instance)
    #
    pass


@receiver(post_save, sender=Booking)
def booking_completed(sender, instance, created, **kwargs):
    """
    Triggered when booking becomes completed.
    """

    if created:
        return

    if instance.status != Booking.Status.COMPLETED:
        return

    # Future integrations:
    #
    # send_feedback_email(instance)
    # update_dashboard_metrics(instance)
    #
    pass


@receiver(post_save, sender=Booking)
def booking_cancelled(sender, instance, created, **kwargs):
    """
    Triggered when booking becomes cancelled.
    """

    if created:
        return

    if instance.status != Booking.Status.CANCELLED:
        return

    # Future integrations:
    #
    # send_cancellation_email(instance)
    # send_refund_notification(instance)
    #
    pass
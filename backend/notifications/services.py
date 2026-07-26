from .models import Notification


def create_booking_notification(booking, *, title, body, category=Notification.Category.BOOKING, priority=Notification.Priority.NORMAL):
    return Notification.objects.create(
        recipient=booking.customer, title=title, body=body, category=category,
        priority=priority, action_url=f"/bookings/{booking.booking_number}",
    )

"""
Centralized Notification Event Types & Constants for The Black Wash.
"""

class NotificationEvent:
    OTP_VERIFICATION = "otp_verification"
    REGISTRATION_SUCCESS = "registration_success"
    PAYMENT_SUCCESS = "payment_success"
    PAYMENT_FAILED = "payment_failed"
    BOOKING_CREATED = "booking_created"
    BOOKING_CONFIRMED = "booking_confirmed"
    BOOKING_COMPLETED = "booking_completed"
    BOOKING_CANCELLED = "booking_cancelled"
    REFUND_REQUESTED = "refund_requested"
    REFUND_COMPLETED = "refund_completed"

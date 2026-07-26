from django.urls import path

from .views import CreateOrderView, MarkPaidView, PaymentDetailView, RazorpayWebhookView, RefundRequestView, VerifyPaymentView

urlpatterns = [
    path("orders/razorpay/", CreateOrderView.as_view(), name="razorpay-order"),
    path("verify/razorpay/", VerifyPaymentView.as_view(), name="razorpay-verify"),
    path("webhooks/razorpay/", RazorpayWebhookView.as_view(), name="razorpay-webhook"),
    path("bookings/<int:booking_id>/", PaymentDetailView.as_view(), name="payment-detail"),
    path("bookings/<int:booking_id>/cash/", MarkPaidView.as_view(), name="cash-payment"),
    path("refunds/", RefundRequestView.as_view(), name="refund-request"),
]

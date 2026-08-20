from django.db.models import Count, Q, Sum
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .models import Booking
from .serializers import (
    BookingCreateSerializer,
    BookingDashboardSerializer,
    BookingDetailSerializer,
    BookingListSerializer,
    CancelBookingSerializer,
    PaymentStatusSerializer,
)
from .services import BookingService
from .permissions import IsAdminOrStaff
from .serializers import VerifyOTPSerializer
from .serializers import ResendOTPSerializer

# ---------------------------------------------------------------------------
# Customer Booking ViewSet
# ---------------------------------------------------------------------------

class BookingViewSet(GenericViewSet):
    """
    Customer-facing booking endpoints.

    list      GET  /api/bookings/
    retrieve  GET  /api/bookings/{id}/
    create    POST /api/bookings/
    cancel    POST /api/bookings/{id}/cancel/
    change_slot POST /api/bookings/{id}/change-slot/
    """

    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Customers can only see their own bookings.
        """
        return (
            Booking.objects
            .filter(customer=self.request.user)
            .select_related("vehicle", "service", "slot")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action == "retrieve":
            return BookingDetailSerializer
        return BookingListSerializer

    # ------------------------------------------------------------------
    # GET /api/bookings/
    # ------------------------------------------------------------------

    def list(self, request):
        """
        Return all bookings for the logged-in customer.
        Supports filtering by status via ?status=pending
        """
        queryset = self.get_queryset()

        booking_status = request.query_params.get("status")
        if booking_status:
            queryset = queryset.filter(status=booking_status)

        serializer = BookingListSerializer(queryset, many=True)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # GET /api/bookings/{id}/
    # ------------------------------------------------------------------

    def retrieve(self, request, pk=None):
        """
        Return full detail for a single booking.
        """
        booking = self._get_customer_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # POST /api/bookings/
    # ------------------------------------------------------------------

    def create(self, request):
        """
        Create a new booking for the logged-in customer.
        """
        serializer = BookingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        booking = BookingService.create_booking(
            customer=request.user,
            vehicle=data["vehicle"],
            service=data["service"],
            booking_date=data["booking_date"],
            address=data["address"],
            slot=data.get("slot"),
            customer_note=data.get("customer_note", ""),
            discount_percentage=data.get("discount_percentage", 0),
        )

        return Response(
            BookingDetailSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )

    # ------------------------------------------------------------------
    # POST /api/bookings/{id}/cancel/
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        """
        Customer cancels their own booking.
        Only allowed if booking status is pending or confirmed.
        """
        booking = self._get_customer_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not booking.can_cancel:
            return Response(
                {"detail": "This booking cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = BookingService.cancel_booking(booking)

        return Response(BookingDetailSerializer(booking).data)



    # ------------------------------------------------------------------
    # Private helper
    # ------------------------------------------------------------------

    def _get_customer_booking(self, pk):
        """
        Safely fetch a booking that belongs to the current customer.
        Returns None if not found.
        """
        try:
            return self.get_queryset().get(pk=pk)
        except Booking.DoesNotExist:
            return None


# ---------------------------------------------------------------------------
# Admin Booking ViewSet
# ---------------------------------------------------------------------------

class AdminBookingViewSet(GenericViewSet):
    """
    Admin/manager-facing booking endpoints.

    list         GET   /api/admin/bookings/
    retrieve     GET   /api/admin/bookings/{id}/
    confirm      POST  /api/admin/bookings/{id}/confirm/
    start        POST  /api/admin/bookings/{id}/start/
    complete     POST  /api/admin/bookings/{id}/complete/
    cancel       POST  /api/admin/bookings/{id}/cancel/
    mark_paid    POST  /api/admin/bookings/{id}/mark-paid/
    refund       POST  /api/admin/bookings/{id}/refund/
    dashboard    GET   /api/admin/bookings/dashboard/
    """

    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        return (
            Booking.objects
            .select_related("customer", "vehicle", "service", "slot")
            .order_by("-created_at")
        )

    # ------------------------------------------------------------------
    # GET /api/admin/bookings/
    # ------------------------------------------------------------------

    def list(self, request):
        """
        Return all bookings.
        Supports filtering by status and payment_status.
        """
        queryset = self.get_queryset()

        booking_status = request.query_params.get("status")
        if booking_status:
            queryset = queryset.filter(status=booking_status)

        payment_status = request.query_params.get("payment_status")
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        serializer = BookingListSerializer(queryset, many=True)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # GET /api/admin/bookings/{id}/
    # ------------------------------------------------------------------

    def retrieve(self, request, pk=None):
        """
        Return full detail for any booking.
        """
        booking = self._get_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = BookingDetailSerializer(booking)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # POST /api/admin/bookings/{id}/confirm/
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="confirm")
    def confirm(self, request, pk=None):
        """
        Admin confirms a pending booking.
        """
        booking = self._get_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.status != Booking.Status.PENDING:
            return Response(
                {"detail": "Only pending bookings can be confirmed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking = BookingService.confirm_booking(booking)
        return Response(BookingDetailSerializer(booking).data)

    # ------------------------------------------------------------------
    # POST /api/admin/bookings/{id}/start/
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="start")
    def start(self, request, pk=None):
        """
        Admin marks a confirmed booking as in progress (wash started).
        """
        booking = self._get_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not booking.can_start:
            return Response(
                {"detail": "Only confirmed bookings can be started."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking = BookingService.start_booking(booking)
        return Response(BookingDetailSerializer(booking).data)

    # ------------------------------------------------------------------
    # POST /api/admin/bookings/{id}/complete/
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="complete")
    def complete(self, request, pk=None):
        """
        Admin marks a booking as completed (wash done).
        Requires verifying customer arrival OTP.
        """
        booking = self._get_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not booking.can_complete:
            return Response(
                {"detail": "Only confirmed or in-progress bookings can be completed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp = request.data.get("otp")
        if not booking.otp_verified and not otp:
            return Response(
                {"detail": "Customer Arrival OTP is required to complete this booking."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking = BookingService.complete_booking(booking, otp=otp)
        return Response(BookingDetailSerializer(booking).data)

    # ------------------------------------------------------------------
    # POST /api/admin/bookings/{id}/resend-otp/
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="resend-otp")
    def resend_otp(self, request, pk=None):
        """
        Admin resends customer arrival OTP.
        """
        booking = self._get_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        BookingService.resend_otp(booking)
        return Response(
            {
                "success": True,
                "message": f"Arrival OTP resent successfully to customer for booking #{booking.booking_number}.",
            },
            status=status.HTTP_200_OK,
        )

    # ------------------------------------------------------------------
    # POST /api/admin/bookings/{id}/cancel/
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        """
        Admin cancels any pending or confirmed booking.
        Slot is released automatically.
        """
        booking = self._get_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if not booking.can_cancel:
            return Response(
                {"detail": "This booking cannot be cancelled."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CancelBookingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = BookingService.cancel_booking(booking)
        return Response(BookingDetailSerializer(booking).data)

    # ------------------------------------------------------------------
    # POST /api/admin/bookings/{id}/mark-paid/
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="mark-paid")
    def mark_paid(self, request, pk=None):
        """
        Admin manually marks a booking payment as paid.
        Used for pay-at-center bookings.
        """
        booking = self._get_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.is_paid:
            return Response(
                {"detail": "Booking is already marked as paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking = BookingService.mark_payment_paid(booking)
        return Response(BookingDetailSerializer(booking).data)

    # ------------------------------------------------------------------
    # POST /api/admin/bookings/{id}/refund/
    # ------------------------------------------------------------------

    @action(detail=True, methods=["post"], url_path="refund")
    def refund(self, request, pk=None):
        """
        Admin marks a booking payment as refunded.
        """
        booking = self._get_booking(pk)
        if booking is None:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PaymentStatusSerializer(data={"payment_status": Booking.PaymentStatus.REFUNDED})
        serializer.is_valid(raise_exception=True)

        booking = BookingService.refund_booking(booking)
        return Response(BookingDetailSerializer(booking).data)

    # ------------------------------------------------------------------
    # GET /api/admin/bookings/dashboard/
    # ------------------------------------------------------------------

    @action(detail=False, methods=["get"], url_path="dashboard")
    def dashboard(self, request):
        """
        Return booking summary stats for the admin dashboard.
        """
        queryset = self.get_queryset()

        counts = queryset.aggregate(
            total_bookings=Count("id"),
            pending=Count("id", filter=Q(status=Booking.Status.PENDING)),
            confirmed=Count("id", filter=Q(status=Booking.Status.CONFIRMED)),
            in_progress=Count("id", filter=Q(status=Booking.Status.IN_PROGRESS)),
            completed=Count("id", filter=Q(status=Booking.Status.COMPLETED)),
            cancelled=Count("id", filter=Q(status=Booking.Status.CANCELLED)),
            revenue=Sum(
                "total_price",
                filter=Q(payment_status=Booking.PaymentStatus.PAID),
            ),
        )

        # revenue can be None if no paid bookings yet
        counts["revenue"] = counts["revenue"] or 0

        serializer = BookingDashboardSerializer(counts)
        return Response(serializer.data)

    # ------------------------------------------------------------------
    # Private helper
    # ------------------------------------------------------------------

    def _get_booking(self, pk):
        """
        Safely fetch any booking by pk.
        Returns None if not found.
        """
        try:
            return self.get_queryset().get(pk=pk)
        except Booking.DoesNotExist:
            return None
    
@action(
    detail=True,
    methods=["post"],
    url_path="verify-otp",
)
def verify_otp(self, request, pk=None):
    """
    Verify arrival OTP.
    """

    booking = self.get_object()

    serializer = VerifyOTPSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    BookingService.verify_otp(
        booking=booking,
        otp=serializer.validated_data["otp"],
    )

    return Response(
        {
            "success": True,
            "message": "OTP verified successfully.",
            "booking_number": booking.booking_number,
        },
        status=status.HTTP_200_OK,
    )

@action(
    detail=True,
    methods=["post"],
    url_path="resend-otp",
)
def resend_otp(self, request, pk=None):
    """
    Resend booking arrival OTP.
    """

    booking = self.get_object()

    serializer = ResendOTPSerializer(
        data=request.data
    )

    serializer.is_valid(
        raise_exception=True
    )

    BookingService.resend_otp(
        booking
    )

    return Response(
        {
            "success": True,
            "message": "A new OTP has been sent to your registered email."
        },
        status=status.HTTP_200_OK,
    )
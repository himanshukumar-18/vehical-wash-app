from datetime import datetime, timedelta
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg, Q, F
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from bookings.models import Booking
from bookings.permissions import IsAdminOrStaff
from offers.models import Offer, OfferUsage
from service_areas.models import ServiceArea
from services.models import Service

User = get_user_model()


class AdminAnalyticsViewSet(viewsets.ViewSet):
    """
    Admin & Owner Real PostgreSQL Analytics API.
    Provides aggregated metrics for Revenue, Bookings, Services, Customers, Offers, and Service Areas.
    """

    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]

    def _get_date_range(self, request):
        period = request.query_params.get("period", "30days")
        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

        if period == "today":
            start_date = today_start
            end_date = now
            prev_start = start_date - timedelta(days=1)
            prev_end = start_date
        elif period == "7days":
            start_date = today_start - timedelta(days=6)
            end_date = now
            duration = end_date - start_date
            prev_start = start_date - duration
            prev_end = start_date
        elif period == "this_month":
            start_date = today_start.replace(day=1)
            end_date = now
            prev_end = start_date
            # approximate 1 month back
            prev_start = (start_date - timedelta(days=1)).replace(day=1)
        elif period == "last_month":
            this_month_start = today_start.replace(day=1)
            end_date = this_month_start - timedelta(seconds=1)
            start_date = (this_month_start - timedelta(days=1)).replace(day=1)
            duration = end_date - start_date
            prev_end = start_date
            prev_start = start_date - duration
        else: # 30days default
            start_date = today_start - timedelta(days=29)
            end_date = now
            duration = end_date - start_date
            prev_start = start_date - duration
            prev_end = start_date

        return start_date, end_date, prev_start, prev_end

    def _calc_growth(self, current, previous):
        c = float(current or 0)
        p = float(previous or 0)
        if p == 0:
            return None # "No previous-period data"
        growth = ((c - p) / p) * 100.0
        return round(growth, 1)

    @action(detail=False, methods=["get"], url_path="overview")
    def overview(self, request):
        start_date, end_date, prev_start, prev_end = self._get_date_range(request)

        # Current Period Stats
        curr_qs = Booking.objects.filter(created_at__range=(start_date, end_date))
        curr_paid = curr_qs.filter(payment_status=Booking.PaymentStatus.PAID)

        total_bookings = curr_qs.count()
        completed_bookings = curr_qs.filter(status=Booking.Status.COMPLETED).count()
        pending_bookings = curr_qs.filter(status=Booking.Status.PENDING).count()
        confirmed_bookings = curr_qs.filter(status=Booking.Status.CONFIRMED).count()
        cancelled_bookings = curr_qs.filter(status=Booking.Status.CANCELLED).count()

        total_revenue = float(curr_paid.aggregate(val=Sum("total_price"))["val"] or 0)
        total_discounts = float(curr_qs.aggregate(val=Sum("discount"))["val"] or 0)
        avg_order_value = float(curr_paid.aggregate(val=Avg("total_price"))["val"] or 0)

        # Customer Counts
        total_customers = User.objects.filter(role="customer").count()
        new_customers = User.objects.filter(role="customer", date_joined__range=(start_date, end_date)).count()
        returning_customers = User.objects.filter(
            role="customer",
            bookings__created_at__range=(start_date, end_date)
        ).annotate(b_count=Count("bookings")).filter(b_count__gt=1).count()

        # Previous Period Stats for Growth
        prev_qs = Booking.objects.filter(created_at__range=(prev_start, prev_end))
        prev_paid = prev_qs.filter(payment_status=Booking.PaymentStatus.PAID)
        prev_revenue = float(prev_paid.aggregate(val=Sum("total_price"))["val"] or 0)
        prev_bookings = prev_qs.count()

        growth_revenue = self._calc_growth(total_revenue, prev_revenue)
        growth_bookings = self._calc_growth(total_bookings, prev_bookings)

        return Response({
            "success": True,
            "data": {
                "total_bookings": total_bookings,
                "completed_bookings": completed_bookings,
                "pending_bookings": pending_bookings,
                "confirmed_bookings": confirmed_bookings,
                "cancelled_bookings": cancelled_bookings,
                "total_customers": total_customers,
                "new_customers": new_customers,
                "returning_customers": returning_customers,
                "total_revenue": total_revenue,
                "total_discounts": total_discounts,
                "average_booking_value": round(avg_order_value, 2),
                "growth": {
                    "revenue_percent": growth_revenue,
                    "bookings_percent": growth_bookings,
                }
            }
        })

    @action(detail=False, methods=["get"], url_path="revenue")
    def revenue(self, request):
        start_date, end_date, _, _ = self._get_date_range(request)
        paid_qs = Booking.objects.filter(
            created_at__range=(start_date, end_date),
            payment_status=Booking.PaymentStatus.PAID
        )

        daily_revenue = (
            paid_qs.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(
                revenue=Sum("total_price"),
                bookings=Count("id"),
                discounts=Sum("discount"),
                avg_value=Avg("total_price"),
            )
            .order_by("date")
        )

        chart_data = [
            {
                "date": item["date"].strftime("%Y-%m-%d"),
                "revenue": float(item["revenue"] or 0),
                "bookings": item["bookings"],
                "discounts": float(item["discounts"] or 0),
                "avg_value": round(float(item["avg_value"] or 0), 2),
            }
            for item in daily_revenue
        ]

        return Response({"success": True, "data": chart_data})

    @action(detail=False, methods=["get"], url_path="services")
    def services(self, request):
        start_date, end_date, _, _ = self._get_date_range(request)
        qs = Booking.objects.filter(created_at__range=(start_date, end_date))
        total_bookings = qs.count() or 1

        service_stats = (
            qs.values("service__id", "service__name")
            .annotate(
                bookings_count=Count("id"),
                completed_count=Count("id", filter=Q(status=Booking.Status.COMPLETED)),
                revenue=Sum("total_price", filter=Q(payment_status=Booking.PaymentStatus.PAID)),
            )
            .order_by("-bookings_count")
        )

        data = [
            {
                "service_id": item["service__id"],
                "service_name": item["service__name"] or "Unknown Service",
                "bookings_count": item["bookings_count"],
                "completed_count": item["completed_count"],
                "revenue": float(item["revenue"] or 0),
                "share_percentage": round((item["bookings_count"] / total_bookings) * 100.0, 1),
            }
            for item in service_stats
        ]

        return Response({"success": True, "data": data})

    @action(detail=False, methods=["get"], url_path="customers")
    def customers(self, request):
        start_date, end_date, _, _ = self._get_date_range(request)

        total_cust = User.objects.filter(role="customer").count()
        new_cust = User.objects.filter(role="customer", date_joined__range=(start_date, end_date)).count()

        active_cust_qs = User.objects.filter(
            role="customer",
            bookings__created_at__range=(start_date, end_date)
        ).annotate(period_bookings=Count("bookings"))

        repeat_cust = active_cust_qs.filter(period_bookings__gt=1).count()
        total_active = active_cust_qs.count() or 1
        repeat_rate = round((repeat_cust / total_active) * 100.0, 1)

        return Response({
            "success": True,
            "data": {
                "total_customers": total_cust,
                "new_customers": new_cust,
                "active_customers": total_active,
                "returning_customers": repeat_cust,
                "repeat_customer_rate": repeat_rate,
            }
        })

    @action(detail=False, methods=["get"], url_path="offers")
    def offers(self, request):
        start_date, end_date, _, _ = self._get_date_range(request)

        offer_stats = (
            OfferUsage.objects.filter(used_at__range=(start_date, end_date))
            .values("offer__id", "offer__name")
            .annotate(
                usage_count=Count("id"),
                total_discount=Sum("discount_amount"),
                revenue_after_discount=Sum("booking__total_price", filter=Q(booking__payment_status=Booking.PaymentStatus.PAID)),
            )
            .order_by("-usage_count")
        )

        data = [
            {
                "offer_id": item["offer__id"],
                "offer_name": item["offer__name"] or "Promotional Offer",
                "usage_count": item["usage_count"],
                "total_discount_given": float(item["total_discount"] or 0),
                "revenue_generated": float(item["revenue_after_discount"] or 0),
            }
            for item in offer_stats
        ]

        active_offers_count = Offer.objects.filter(is_active=True).count()
        total_discount = float(OfferUsage.objects.filter(used_at__range=(start_date, end_date)).aggregate(val=Sum("discount_amount"))["val"] or 0)

        return Response({
            "success": True,
            "data": {
                "active_offers_count": active_offers_count,
                "total_discount_given": total_discount,
                "top_offers": data,
            }
        })

    @action(detail=False, methods=["get"], url_path="service-areas")
    def service_areas(self, request):
        start_date, end_date, _, _ = self._get_date_range(request)

        area_stats = (
            Booking.objects.filter(created_at__range=(start_date, end_date))
            .values("service_area__id", "service_area_name_snapshot")
            .annotate(
                bookings_count=Count("id"),
                revenue=Sum("total_price", filter=Q(payment_status=Booking.PaymentStatus.PAID)),
                travel_charges_collected=Sum("travel_charge"),
            )
            .order_by("-bookings_count")
        )

        data = [
            {
                "service_area_id": item["service_area__id"],
                "area_name": item["service_area_name_snapshot"] or "Hazaribagh Doorstep Area",
                "bookings_count": item["bookings_count"],
                "revenue": float(item["revenue"] or 0),
                "travel_charges_collected": float(item["travel_charges_collected"] or 0),
            }
            for item in area_stats
        ]

        return Response({"success": True, "data": data})

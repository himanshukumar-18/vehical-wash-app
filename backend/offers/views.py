from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum

from bookings.permissions import IsAdminOrStaff
from .models import Offer, OfferUsage
from .serializers import OfferSerializer, OfferUsageSerializer


class PublicOfferViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public API to list active promotional offers.
    """

    serializer_class = OfferSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Offer.objects.filter(is_active=True).order_by("display_order", "-created_at")


class AdminOfferViewSet(viewsets.ModelViewSet):
    """
    Admin API for Offers Management & Performance Analytics.
    """

    serializer_class = OfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]
    queryset = Offer.objects.all().annotate(
        usages_count=Count("usages"),
        total_discount=Sum("usages__discount_amount"),
    ).order_by("display_order", "-created_at")

    @action(detail=True, methods=["post"], url_path="toggle-active")
    def toggle_active(self, request, pk=None):
        offer = self.get_object()
        offer.is_active = not offer.is_active
        offer.save(update_fields=["is_active", "updated_at"])
        return Response(
            {
                "success": True,
                "message": f"Offer status updated to {'Active' if offer.is_active else 'Inactive'}.",
                "data": self.get_serializer(offer).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"], url_path="usages")
    def usages(self, request, pk=None):
        offer = self.get_object()
        usages_qs = offer.usages.all().select_related("user", "booking")
        serializer = OfferUsageSerializer(usages_qs, many=True)
        return Response(serializer.data)

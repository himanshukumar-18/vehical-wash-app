from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from bookings.permissions import IsAdminOrStaff
from .models import Testimonial
from .serializers import TestimonialSerializer


class TestimonialViewSet(viewsets.ModelViewSet):
    """
    Public ViewSet for testimonials.
    - List: Only returns approved testimonials.
    - Create: Allows any customer to submit feedback (defaults to is_approved=False).
    """

    serializer_class = TestimonialSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Testimonial.objects.filter(is_approved=True).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Force is_approved to False on public submission
        serializer.save(is_approved=False)
        return Response(
            {
                "success": True,
                "message": "Thank you for your feedback! Your review has been submitted for admin approval.",
                "data": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


class AdminTestimonialViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for testimonial moderation.
    - List: Returns all testimonials (pending & approved).
    - Approve action: Sets is_approved=True.
    - Destroy: Permanently deletes a review.
    """

    serializer_class = TestimonialSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]
    queryset = Testimonial.objects.all().order_by("-created_at")

    @action(detail=True, methods=["post"], url_path="approve")
    def approve(self, request, pk=None):
        testimonial = self.get_object()
        testimonial.is_approved = True
        testimonial.save(update_fields=["is_approved"])
        return Response(
            {
                "success": True,
                "message": "Testimonial approved and published to customer site.",
                "data": self.get_serializer(testimonial).data,
            },
            status=status.HTTP_200_OK,
        )

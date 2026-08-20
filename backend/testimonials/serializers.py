from rest_framework import serializers
from .models import Testimonial


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = [
            "id",
            "customer_name",
            "customer_title",
            "rating",
            "comment",
            "is_approved",
            "is_featured",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "is_approved", "created_at", "updated_at"]

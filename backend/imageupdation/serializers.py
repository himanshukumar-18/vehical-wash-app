from rest_framework import serializers
from .models import DynamicImage
from .constants import IMAGE_SPECIFICATIONS


class DynamicImagePublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicImage
        fields = (
            "key",
            "title",
            "category",
            "desktop_image_url",
            "mobile_image_url",
            "alt_text",
            "badge_tag",
            "link_url",
            "width",
            "height",
            "recommended_resolution",
            "aspect_ratio",
            "is_active",
        )


class DynamicImageAdminSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.ReadOnlyField()

    class Meta:
        model = DynamicImage
        fields = (
            "id",
            "key",
            "title",
            "category",
            "description",
            "desktop_image_url",
            "mobile_image_url",
            "alt_text",
            "badge_tag",
            "link_url",
            "format",
            "file_size_bytes",
            "file_size_mb",
            "width",
            "height",
            "recommended_resolution",
            "aspect_ratio",
            "max_file_size_mb",
            "is_active",
            "updated_at",
            "created_at",
        )


class ImageUploadSerializer(serializers.Serializer):
    key = serializers.ChoiceField(choices=DynamicImage.KEY_CHOICES)
    file = serializers.FileField(required=True)
    variant = serializers.ChoiceField(choices=["desktop", "mobile"], default="desktop")

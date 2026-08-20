import logging
from rest_framework import serializers
from .models import Service
from imageupdation.services import ImageUploadService

logger = logging.getLogger(__name__)


class ServiceSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Service
        fields = [
            "id",
            "name",
            "slug",
            "short_description",
            "description",
            "price",
            "duration_minutes",
            "image",
            "image_url",
            "is_active",
            "is_featured",
            "display_order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "slug",
            "created_at",
            "updated_at",
        ]

    def get_image_url(self, obj):
        if obj.image_url:
            return obj.image_url
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def create(self, validated_data):
        image_file = validated_data.get("image")
        if image_file and not isinstance(image_file, str):
            try:
                res = ImageUploadService.process_and_upload(image_file, folder="the_black_wash/services")
                validated_data["image_url"] = res["url"]
            except Exception as err:
                logger.warning("Failed to upload service image to Cloudinary: %s", err)

        return super().create(validated_data)

    def update(self, instance, validated_data):
        image_file = validated_data.get("image")
        if image_file and not isinstance(image_file, str):
            try:
                res = ImageUploadService.process_and_upload(image_file, folder="the_black_wash/services")
                validated_data["image_url"] = res["url"]
            except Exception as err:
                logger.warning("Failed to upload service image to Cloudinary: %s", err)

        return super().update(instance, validated_data)
from rest_framework import serializers

from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source="owner.fullname", read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "owner",
            "owner_name",
            "brand",
            "model",
            "color",
            "vehicle_type",
            "registration_number",
            "image",
            "image_url",
            "is_default",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "owner",
            "owner_name",
            "image_url",
            "created_at",
            "updated_at",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")

        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)

        return None

    def validate_registration_number(self, value):
        return value.strip().upper()

    def create(self, validated_data):
        request = self.context["request"]

        if validated_data.get("is_default"):
            Vehicle.objects.filter(owner=request.user, is_default=True).update(
                is_default=False
            )

        return Vehicle.objects.create(owner=request.user, **validated_data)

    def update(self, instance, validated_data):
        if validated_data.get("is_default"):
            Vehicle.objects.filter(
                owner=instance.owner,
                is_default=True,
            ).exclude(pk=instance.pk).update(is_default=False)

        return super().update(instance, validated_data)
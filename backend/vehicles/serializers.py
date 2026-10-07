from rest_framework import serializers
from .models import Vehicle

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = [
            "id",
            "brand",
            "model",
            "vehicle_type",
            "registration_number",
            "is_default",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_registration_number(self, value):
        cleaned = value.strip().upper()
        if len(cleaned) < 4:
            raise serializers.ValidationError("Please provide a valid registration number.")
        return cleaned

    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.method == "POST":
            reg_num = attrs.get("registration_number", "").strip().upper()
            if Vehicle.objects.filter(user=request.user, registration_number=reg_num).exists():
                raise serializers.ValidationError({"registration_number": "This vehicle is already in your garage."})
        return attrs

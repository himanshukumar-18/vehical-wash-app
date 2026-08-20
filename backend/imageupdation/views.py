from rest_framework import status, viewsets, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from bookings.permissions import IsAdminOrStaff
from .models import DynamicImage
from .constants import IMAGE_SPECIFICATIONS
from .serializers import (
    DynamicImagePublicSerializer,
    DynamicImageAdminSerializer,
    ImageUploadSerializer,
)
from .services import ImageUploadService


class PublicDynamicImagesView(APIView):
    """
    Public API endpoint returning all active owner-manageable dynamic images.
    No authentication required.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # Ensure default seed records exist in DB
        self._ensure_defaults_exist()

        images = DynamicImage.objects.filter(is_active=True).exclude(desktop_image_url="")
        serializer = DynamicImagePublicSerializer(images, many=True)
        
        # Format as key-indexed dictionary for simple frontend lookup
        data_by_key = {item["key"]: item for item in serializer.data}
        
        return Response({
            "success": True,
            "data": data_by_key,
        }, status=status.HTTP_200_OK)

    def _ensure_defaults_exist(self):
        for key, spec in IMAGE_SPECIFICATIONS.items():
            DynamicImage.objects.get_or_create(
                key=key,
                defaults={
                    "title": spec["title"],
                    "category": spec["category"],
                    "description": spec["description"],
                    "desktop_image_url": spec["default_url"],
                    "recommended_resolution": spec["recommended_resolution"],
                    "aspect_ratio": spec["aspect_ratio"],
                    "max_file_size_mb": spec["max_file_size_mb"],
                    "is_active": False,
                }
            )


class AdminDynamicImageViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for Owner CMS Image Management.
    Requires Admin privileges.
    """
    queryset = DynamicImage.objects.all().order_by("category", "key")
    serializer_class = DynamicImageAdminSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrStaff]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = "key"

    def list(self, request, *args, **kwargs):
        # Ensure default entries exist
        PublicDynamicImagesView()._ensure_defaults_exist()
        return super().list(request, *args, **kwargs)

    @action(detail=False, methods=["post"], url_path="upload")
    def upload_image(self, request):
        """
        Upload image file directly to Cloudinary and update corresponding DynamicImage record.
        Supports HD photos up to 50MB.
        """
        serializer = ImageUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        key = serializer.validated_data["key"]
        file_obj = serializer.validated_data["file"]
        variant = serializer.validated_data["variant"]

        spec = IMAGE_SPECIFICATIONS.get(key, {})
        max_size_mb = spec.get("max_file_size_mb", 50.0)
        file_size_mb = file_obj.size / (1024 * 1024)

        if file_size_mb > max_size_mb:
            return Response({
                "success": False,
                "message": f"File size ({file_size_mb:.2f}MB) exceeds maximum limit of {max_size_mb}MB for {key}.",
                "code": "FILE_TOO_LARGE",
            }, status=status.HTTP_400_BAD_REQUEST)

        # Upload & Process Image via Cloudinary
        result = ImageUploadService.process_and_upload(file_obj)

        dynamic_img, _ = DynamicImage.objects.get_or_create(
            key=key,
            defaults={
                "title": spec.get("title", key),
                "category": spec.get("category", "General"),
                "desktop_image_url": result["url"],
            }
        )

        if variant == "mobile":
            dynamic_img.mobile_image_url = result["url"]
        else:
            dynamic_img.desktop_image_url = result["url"]

        dynamic_img.width = result["width"]
        dynamic_img.height = result["height"]
        dynamic_img.format = result["format"]
        dynamic_img.file_size_bytes = result["file_size_bytes"]
        dynamic_img.is_active = True
        dynamic_img.save()

        output_serializer = DynamicImageAdminSerializer(dynamic_img)
        return Response({
            "success": True,
            "message": f"Image uploaded successfully for '{dynamic_img.title}'.",
            "data": output_serializer.data,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="remove")
    def remove_image(self, request, key=None):
        """
        Remove uploaded image from dynamic image slot and set is_active to False.
        """
        try:
            dynamic_img = DynamicImage.objects.get(key=key)
        except DynamicImage.DoesNotExist:
            return Response({"success": False, "message": "Image slot not found."}, status=status.HTTP_404_NOT_FOUND)

        dynamic_img.desktop_image_url = ""
        dynamic_img.mobile_image_url = None
        dynamic_img.file_size_bytes = 0
        dynamic_img.width = 0
        dynamic_img.height = 0
        dynamic_img.badge_tag = ""
        dynamic_img.link_url = None
        dynamic_img.is_active = False
        dynamic_img.save()

        serializer = DynamicImageAdminSerializer(dynamic_img)
        return Response({
            "success": True,
            "message": f"Image removed for '{dynamic_img.title}'.",
            "data": serializer.data,
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="reset")
    def reset_to_default(self, request, key=None):
        """
        Reset dynamic image slot.
        """
        spec = IMAGE_SPECIFICATIONS.get(key)
        if not spec:
            return Response({"success": False, "message": "Invalid key."}, status=status.HTTP_400_BAD_REQUEST)

        dynamic_img, _ = DynamicImage.objects.get_or_create(key=key)
        dynamic_img.desktop_image_url = ""
        dynamic_img.mobile_image_url = None
        dynamic_img.badge_tag = ""
        dynamic_img.link_url = None
        dynamic_img.file_size_bytes = 0
        dynamic_img.width = 0
        dynamic_img.height = 0
        dynamic_img.is_active = False
        dynamic_img.save()

        serializer = DynamicImageAdminSerializer(dynamic_img)
        return Response({
            "success": True,
            "message": f"Reset '{dynamic_img.title}'.",
            "data": serializer.data,
        }, status=status.HTTP_200_OK)

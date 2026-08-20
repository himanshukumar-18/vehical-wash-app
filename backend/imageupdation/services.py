import os
import logging
import cloudinary
import cloudinary.uploader
from PIL import Image as PILImage
from django.conf import settings
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)


class ImageUploadService:
    """
    Direct Cloudinary Image Upload Service for The Black Wash.
    All dynamic images are uploaded directly to Cloudinary cloud storage
    to prevent server disk load and preserve performance.
    """

    @classmethod
    def process_and_upload(cls, file_obj, folder="the_black_wash/dynamic_images"):
        """
        Uploads image file object directly to Cloudinary.
        Returns metadata dict: {url, width, height, format, file_size_bytes}
        """
        # 1. Read file bytes & metadata using Pillow
        file_obj.seek(0)
        file_bytes = file_obj.read()
        file_size_bytes = len(file_bytes)

        file_obj.seek(0)
        try:
            pil_img = PILImage.open(file_obj)
            width, height = pil_img.size
            img_format = (pil_img.format or "WEBP").upper()
        except Exception as err:
            logger.warning("Pillow failed to parse image metadata: %s", err)
            width, height = 0, 0
            img_format = "WEBP"

        # 2. Extract Cloudinary configuration
        cloud_name = getattr(settings, "CLOUDINARY_CLOUD_NAME", None) or os.environ.get("CLOUDINARY_CLOUD_NAME")
        api_key = getattr(settings, "CLOUDINARY_API_KEY", None) or os.environ.get("CLOUDINARY_API_KEY")
        api_secret = getattr(settings, "CLOUDINARY_API_SECRET", None) or os.environ.get("CLOUDINARY_API_SECRET")

        if not cloud_name or not api_key or not api_secret:
            raise ValidationError(
                "Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) "
                "are required to upload images. Local server disk uploads are disabled to save server load."
            )

        # 3. Direct Cloudinary Upload
        try:
            cloudinary.config(
                cloud_name=cloud_name,
                api_key=api_key,
                api_secret=api_secret,
                secure=True,
            )
            file_obj.seek(0)
            upload_result = cloudinary.uploader.upload(
                file_obj,
                folder=folder,
                resource_type="image",
                quality="auto",
                fetch_format="auto",
            )

            image_url = upload_result.get("secure_url") or upload_result.get("url")
            width = upload_result.get("width", width)
            height = upload_result.get("height", height)
            img_format = (upload_result.get("format") or img_format).upper()
            file_size_bytes = upload_result.get("bytes", file_size_bytes)

            logger.info("Successfully uploaded image to Cloudinary: %s (%dx%d, %s)", image_url, width, height, img_format)

            return {
                "url": image_url,
                "width": width,
                "height": height,
                "format": img_format,
                "file_size_bytes": file_size_bytes,
            }
        except Exception as exc:
            logger.error("Cloudinary upload failed: %s", exc)
            raise ValidationError(f"Cloudinary upload failed: {str(exc)}")

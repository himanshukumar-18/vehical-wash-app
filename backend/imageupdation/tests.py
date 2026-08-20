import io
from PIL import Image as PILImage
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from imageupdation.models import DynamicImage
from imageupdation.constants import IMAGE_SPECIFICATIONS

User = get_user_model()


class DynamicImageTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email="admin_images@example.com",
            fullname="Admin Image Mgr",
            password="Password123!",
            role=User.Role.ADMIN,
            is_staff=True,
            is_verified=True,
        )
        self.customer = User.objects.create_user(
            email="customer_images@example.com",
            fullname="Customer User",
            password="Password123!",
            role=User.Role.CUSTOMER,
            is_verified=True,
        )

        self.admin_client = APIClient()
        self.admin_client.force_authenticate(user=self.admin)

        self.customer_client = APIClient()
        self.customer_client.force_authenticate(user=self.customer)

        self.public_client = APIClient()

    def _generate_test_image_file(self, filename="test.png", width=800, height=600, color="blue"):
        file_obj = io.BytesIO()
        img = PILImage.new("RGB", (width, height), color=color)
        img.save(file_obj, format="PNG")
        file_obj.seek(0)
        return SimpleUploadedFile(filename, file_obj.read(), content_type="image/png")

    def test_public_dynamic_images_endpoint(self):
        # Create or update active image with non-empty URL
        hero, _ = DynamicImage.objects.get_or_create(key="home_hero")
        hero.desktop_image_url = "https://res.cloudinary.com/testcloud/image/upload/v1/hero.webp"
        hero.recommended_resolution = IMAGE_SPECIFICATIONS["home_hero"]["recommended_resolution"]
        hero.is_active = True
        hero.save()

        res = self.public_client.get(reverse("public-dynamic-images"))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("home_hero", data["data"])
        self.assertEqual(data["data"]["home_hero"]["recommended_resolution"], IMAGE_SPECIFICATIONS["home_hero"]["recommended_resolution"])

    def test_admin_list_and_permissions(self):
        # Customer access should be denied
        res_cust = self.customer_client.get(reverse("admin-dynamic-images-list"))
        self.assertEqual(res_cust.status_code, status.HTTP_403_FORBIDDEN)

        # Admin access should succeed
        res_admin = self.admin_client.get(reverse("admin-dynamic-images-list"))
        self.assertEqual(res_admin.status_code, status.HTTP_200_OK)
        data = res_admin.json()
        results = data.get("results", data)
        self.assertGreaterEqual(len(results), len(IMAGE_SPECIFICATIONS))

    from unittest.mock import patch

    @patch("cloudinary.uploader.upload")
    def test_admin_upload_image_workflow(self, mock_cloudinary_upload):
        mock_cloudinary_upload.return_value = {
            "secure_url": "https://res.cloudinary.com/testcloud/image/upload/v1234/the_black_wash/dynamic_images/diwali_offer.webp",
            "width": 1920,
            "height": 500,
            "format": "webp",
            "bytes": 204800,
        }

        with self.settings(
            CLOUDINARY_CLOUD_NAME="testcloud",
            CLOUDINARY_API_KEY="123456",
            CLOUDINARY_API_SECRET="secret123",
        ):
            uploaded_file = self._generate_test_image_file(filename="diwali_offer.png", width=1920, height=500)
            
            payload = {
                "key": "offer_banner",
                "file": uploaded_file,
                "variant": "desktop",
            }

            res = self.admin_client.post(
                reverse("admin-dynamic-images-upload-image"),
                payload,
                format="multipart",
            )
            self.assertEqual(res.status_code, status.HTTP_200_OK)
            res_data = res.json()
            self.assertTrue(res_data["success"])
            self.assertEqual(res_data["data"]["width"], 1920)
            self.assertEqual(res_data["data"]["height"], 500)

            # Verify DB updated
            img_obj = DynamicImage.objects.get(key="offer_banner")
            self.assertEqual(img_obj.width, 1920)
            self.assertEqual(img_obj.height, 500)
            self.assertEqual(img_obj.desktop_image_url, "https://res.cloudinary.com/testcloud/image/upload/v1234/the_black_wash/dynamic_images/diwali_offer.webp")

    def test_admin_reset_to_default(self):
        # First modify dynamic image
        img_obj = DynamicImage.objects.get(key="home_hero") if DynamicImage.objects.filter(key="home_hero").exists() else DynamicImage.objects.create(key="home_hero", title="Hero", desktop_image_url="http://custom.url")
        img_obj.desktop_image_url = "http://custom-modified-url.com/hero.jpg"
        img_obj.badge_tag = "CUSTOM HERO"
        img_obj.save()

        # Reset via Admin API
        res = self.admin_client.post(reverse("admin-dynamic-images-reset-to-default", kwargs={"key": "home_hero"}))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        img_obj.refresh_from_db()
        self.assertEqual(img_obj.desktop_image_url, IMAGE_SPECIFICATIONS["home_hero"]["default_url"])
        self.assertEqual(img_obj.badge_tag, "")

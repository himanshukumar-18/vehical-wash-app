from django.db import models
from .constants import IMAGE_SPECIFICATIONS


class DynamicImage(models.Model):
    """
    Owner-manageable Dynamic Image model for The Black Wash.
    Allows changing any website image (Hero, Banners, Offers, About, Services, Pricing, Contact)
    dynamically without code changes or redeployment.
    """
    KEY_CHOICES = [
        (key, spec["title"]) for key, spec in IMAGE_SPECIFICATIONS.items()
    ]

    key = models.CharField(
        max_length=64,
        choices=KEY_CHOICES,
        unique=True,
        db_index=True,
        help_text="Unique location key for the image slot on the frontend.",
    )
    title = models.CharField(max_length=150, help_text="Human-readable title/name of this image slot.")
    category = models.CharField(max_length=80, default="General", help_text="Section category for admin grouping.")
    description = models.TextField(blank=True, default="", help_text="Description of where this image is displayed.")

    # Image URLs (Desktop & Mobile variants)
    desktop_image_url = models.URLField(max_length=1000, blank=True, default="", help_text="Primary desktop image URL.")
    mobile_image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True,
        help_text="Optional mobile-optimized image URL.",
    )

    # Promotional / Offer Fields
    alt_text = models.CharField(max_length=255, blank=True, default="", help_text="SEO alt text for accessibility.")
    badge_tag = models.CharField(
        max_length=100,
        blank=True,
        default="",
        help_text="Optional badge text e.g. 'FESTIVAL OFFER', 'DIWALI SPECIAL 20% OFF'.",
    )
    link_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True,
        help_text="Optional click target link for promotional banners.",
    )

    # Metadata & Technical Info
    format = models.CharField(max_length=20, default="WEBP", help_text="Detected image format e.g. WEBP, PNG, JPEG.")
    file_size_bytes = models.PositiveBigIntegerField(default=0, help_text="Actual uploaded file size in bytes.")
    width = models.PositiveIntegerField(default=0, help_text="Image width in pixels.")
    height = models.PositiveIntegerField(default=0, help_text="Image height in pixels.")
    recommended_resolution = models.CharField(
        max_length=100,
        default="1920x1080",
        help_text="Recommended resolution for owner guidance.",
    )
    aspect_ratio = models.CharField(max_length=50, default="16:9", help_text="Recommended aspect ratio.")
    max_file_size_mb = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=50.00,
        help_text="Maximum allowed file size in megabytes.",
    )

    # State & Audit
    is_active = models.BooleanField(
        default=True,
        db_index=True,
        help_text="Controls if this dynamic image is active on the website.",
    )
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "key"]
        verbose_name = "Dynamic Image"
        verbose_name_plural = "Dynamic Images"

    def __str__(self):
        return f"{self.title} ({self.key}) - {'Active' if self.is_active else 'Inactive'}"

    @property
    def file_size_mb(self):
        return round(self.file_size_bytes / (1024 * 1024), 2)

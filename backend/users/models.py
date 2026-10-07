import hashlib
import secrets
from datetime import timedelta
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("An email address is required.")
        email = self.normalize_email(email).lower()
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_email_verified", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True, db_index=True)
    fullname = models.CharField(max_length=150, blank=True)
    is_email_verified = models.BooleanField(default=False)
    is_phone_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "user"
        verbose_name_plural = "users"
        ordering = ["-date_joined"]

    def __str__(self):
        return self.email

class OTP(models.Model):
    PURPOSE_EMAIL_VERIFICATION = "email_verification"
    PURPOSE_PHONE_LOGIN = "phone_login"
    PURPOSE_PASSWORD_RESET = "password_reset"

    PURPOSE_CHOICES = [
        (PURPOSE_EMAIL_VERIFICATION, "Email Verification"),
        (PURPOSE_PHONE_LOGIN, "Phone Login"),
        (PURPOSE_PASSWORD_RESET, "Password Reset"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="otps")
    identifier = models.CharField(max_length=255, db_index=True)
    otp_hash = models.CharField(max_length=128)
    purpose = models.CharField(max_length=32, choices=PURPOSE_CHOICES)
    attempts = models.PositiveSmallIntegerField(default=0)
    max_attempts = models.PositiveSmallIntegerField(default=5)
    is_used = models.BooleanField(default=False)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["identifier", "purpose", "is_used"]),
        ]
        ordering = ["-created_at"]

    @staticmethod
    def _hash_otp(raw_otp):
        # Deterministic SHA-256 hash for secure token comparison
        return hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()

    @classmethod
    def generate_otp_code(cls, length=6):
        # Cryptographically secure numeric OTP generation
        return "".join(secrets.choice("0123456789") for _ in range(length))

    @classmethod
    def create_for_identifier(cls, identifier, purpose, user=None, expiry_minutes=10, max_attempts=5):
        # Invalidate existing unverified OTPs for the same identifier and purpose
        cls.objects.filter(identifier=identifier, purpose=purpose, is_used=False).update(is_used=True)
        raw_otp = cls.generate_otp_code()
        expires_at = timezone.now() + timedelta(minutes=expiry_minutes)
        otp_instance = cls.objects.create(
            user=user,
            identifier=identifier,
            otp_hash=cls._hash_otp(raw_otp),
            purpose=purpose,
            max_attempts=max_attempts,
            expires_at=expires_at,
        )
        return otp_instance, raw_otp

    def verify(self, raw_otp):
        if self.is_used or timezone.now() > self.expires_at:
            return False, "OTP has expired or has already been used."
        if self.attempts >= self.max_attempts:
            return False, "Maximum verification attempts exceeded."
        
        if secrets.compare_digest(self.otp_hash, self._hash_otp(raw_otp)):
            self.is_used = True
            self.save(update_fields=["is_used"])
            return True, "Verification successful."
        
        self.attempts += 1
        self.save(update_fields=["attempts"])
        return False, "Invalid OTP code."

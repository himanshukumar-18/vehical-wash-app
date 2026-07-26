from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_verified', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):

    username = None

    class Role(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        STAFF = 'staff', 'Staff'
        MANAGER = 'manager', 'Manager'
        ADMIN = 'admin', 'Admin'

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)

    fullname = models.CharField(max_length=100)

    email = models.EmailField(unique=True)

    is_verified = models.BooleanField(default=False)

    # Keep business roles explicit; Django's is_staff controls admin-site access.
    # A suspended account must never be able to obtain a session/token.
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['fullname']

    objects = UserManager()

    def __str__(self):
        return self.email


class OTP(models.Model):
    """Short-lived, single-use email verification challenge."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="otp_challenges")
    otp = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    attempts = models.PositiveSmallIntegerField(default=0)
    expires_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["user", "is_verified", "expires_at"])]

    def is_expired(self):
        return timezone.now() >= self.expires_at

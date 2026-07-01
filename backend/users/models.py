from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):

    username = None
    
    class Role(models.TextChoices):
        CUSTOMER = 'customer', 'Customer'
        ADMIN = 'admin', 'Admin'
    
        
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.CUSTOMER)
    
    fullname = models.CharField(max_length=100)
    
    email = models.EmailField(unique=True)
    
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email
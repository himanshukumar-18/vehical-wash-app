from django.db import models
from users.models import User

class OTP(models.Model):
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    otp = models.CharField(max_length=6)
    
    is_verified = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"OTP for {self.user.email} - Verified: {self.is_verified}"
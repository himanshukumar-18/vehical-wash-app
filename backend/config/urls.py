from django.contrib import admin
from django.urls import path
from django.urls import include  # Import the include function

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),  # Include the users app URLs
]

from django.utils.decorators import method_decorator
from django_ratelimit.decorators import ratelimit

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .otp import OTP
from .serializers import RegisterSerializer, UserSerializer, CustomLoginSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    @method_decorator(ratelimit(key='ip', rate='5/h', method='POST', block=True))
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from .models import User
from .otp import OTP


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('otp')

        if not email or not code:
            return Response({'error': 'email and otp are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

        otp_entry = OTP.objects.filter(user=user, otp=code, is_verified=False, expires_at__gt=timezone.now()).order_by('-id').first()

        if not otp_entry:
            latest = OTP.objects.filter(user=user, is_verified=False, expires_at__gt=timezone.now()).order_by('-id').first()
            if latest:
                latest.attempts += 1
                latest.save(update_fields=['attempts'])
            return Response({'error': 'invalid otp'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_entry.attempts >= 5:
            return Response({'error': 'too many verification attempts'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Mark every outstanding challenge consumed so an OTP cannot be replayed.
        OTP.objects.filter(user=user, is_verified=False).update(is_verified=True)

        # mark user verified
        user.is_verified = True
        user.save(update_fields=['is_verified'])

        return Response({'message': 'email verified successfully'}, status=status.HTTP_200_OK)


class LoginView(TokenObtainPairView):
    serializer_class = CustomLoginSerializer
    permission_classes = [permissions.AllowAny]


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response({'error': 'invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

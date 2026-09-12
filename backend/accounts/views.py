from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .serializers import ChangePasswordSerializer, RegisterSerializer, UserSerializer

from core.models import Activity
from core.services import log_activity


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [
        permissions.AllowAny,
    ]

    def perform_create(self, serializer):
        user = serializer.save()

        log_activity(
            user=user,
            activity_type=Activity.TYPE_USER,
            action=Activity.ACTION_REGISTERED,
            title='User registered',
            description=(
                f'{user.get_full_name() or user.email} '
                f'registered for the Kiangini ICT Centre platform.'
            ),
            object_id=user.id,
            object_name=user.email,
        )


class LoginTokenSerializer(
    TokenObtainPairSerializer
):
    username_field = User.USERNAME_FIELD

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['role'] = user.role
        token['email'] = user.email
        token['name'] = user.get_full_name()

        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        log_activity(
            user=self.user,
            activity_type=Activity.TYPE_USER,
            action=Activity.ACTION_LOGIN,
            title='User logged in',
            description=(
                f'{self.user.get_full_name() or self.user.email} '
                f'logged into the platform.'
            ),
            object_id=self.user.id,
            object_name=self.user.email,
        )

        data['user'] = UserSerializer(
            self.user
        ).data

        return data


class LoginView(TokenObtainPairView):
    serializer_class = LoginTokenSerializer


class LogoutView(APIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request):
        refresh_token = request.data.get(
            'refresh'
        )

        if not refresh_token:
            return Response(
                {
                    'detail': (
                        'Refresh token is required.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

        except Exception:
            return Response(
                {
                    'detail': (
                        'Invalid or expired refresh token.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user

        log_activity(
            user=user,
            activity_type=Activity.TYPE_USER,
            action=Activity.ACTION_LOGOUT,
            title='User logged out',
            description=(
                f'{user.get_full_name() or user.email} '
                f'logged out of the platform.'
            ),
            object_id=user.id,
            object_name=user.email,
        )

        return Response(
            {
                'detail': 'Logout successful.'
            },
            status=status.HTTP_200_OK,
        )


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        user = serializer.save()

        log_activity(
            user=self.request.user,
            activity_type=Activity.TYPE_USER,
            action=Activity.ACTION_PROFILE_UPDATED,
            title='Profile updated',
            description=(
                f'{user.get_full_name() or user.email} '
                f'updated their profile.'
            ),
            object_id=user.id,
            object_name=user.email,
        )

class ChangePasswordView(APIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={
                'request': request,
            },
        )

        serializer.is_valid(raise_exception=True)

        user = request.user

        user.set_password(
            serializer.validated_data['new_password']
        )

        user.save(
            update_fields=['password']
        )

        log_activity(
            user=user,
            activity_type=Activity.TYPE_USER,
            action=Activity.ACTION_PASSWORD_CHANGED,
            title='Password changed',
            description=(
                f'{user.get_full_name() or user.email} '
                'changed their account password.'
            ),
            object_id=user.id,
            object_name=user.email,
        )

        return Response(
            {
                'detail': (
                    'Your password has been changed '
                    'successfully.'
                )
            },
            status=status.HTTP_200_OK,
        )
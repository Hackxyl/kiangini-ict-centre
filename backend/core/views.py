from datetime import timedelta

from django.db import connection
from django.utils import timezone

from rest_framework import generics, permissions
from rest_framework.response import Response

from accounts.models import User

from .models import Activity
from .serializers import ActivitySerializer


class IsAdminUser(permissions.BasePermission):
    """
    Allows access only to authenticated users
    with the administrator role.
    """

    message = 'Administrator access is required.'

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == User.ROLE_ADMIN
        )


class ActivityListView(generics.ListAPIView):
    """
    Returns activities belonging to the authenticated user.
    """

    serializer_class = ActivitySerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        queryset = (
            Activity.objects
            .select_related('user')
            .filter(user=self.request.user)
        )

        activity_type = self.request.query_params.get(
            'type'
        )

        action = self.request.query_params.get(
            'action'
        )

        search = self.request.query_params.get(
            'search'
        )

        if activity_type:
            queryset = queryset.filter(
                activity_type=activity_type
            )

        if action:
            queryset = queryset.filter(
                action=action
            )

        if search:
            queryset = (
                queryset.filter(
                    title__icontains=search
                )
                | queryset.filter(
                    description__icontains=search
                )
                | queryset.filter(
                    object_name__icontains=search
                )
            )

        return queryset


class ActivityStatsView(generics.GenericAPIView):
    """
    Returns activity statistics for the authenticated user.
    """

    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get(self, request, *args, **kwargs):
        queryset = Activity.objects.filter(
            user=request.user
        )

        now = timezone.now()

        today_start = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        week_start = today_start - timedelta(
            days=today_start.weekday()
        )

        return Response({
            'total': queryset.count(),
            'today': queryset.filter(
                created_at__gte=today_start
            ).count(),
            'this_week': queryset.filter(
                created_at__gte=week_start
            ).count(),
            'important': queryset.filter(
                action__in=[
                    Activity.ACTION_APPROVED,
                    Activity.ACTION_REJECTED,
                    Activity.ACTION_PUBLISHED,
                    Activity.ACTION_DELETED,
                ]
            ).count(),
        })


class AdminActivityListView(generics.ListAPIView):
    """
    Returns system-wide activity for administrators.
    """

    serializer_class = ActivitySerializer
    permission_classes = [
        permissions.IsAuthenticated,
        IsAdminUser,
    ]

    def get_queryset(self):
        queryset = (
            Activity.objects
            .select_related('user')
            .all()
        )

        activity_type = self.request.query_params.get(
            'type'
        )

        action = self.request.query_params.get(
            'action'
        )

        search = self.request.query_params.get(
            'search'
        )

        user_id = self.request.query_params.get(
            'user'
        )

        if activity_type:
            queryset = queryset.filter(
                activity_type=activity_type
            )

        if action:
            queryset = queryset.filter(
                action=action
            )

        if user_id:
            queryset = queryset.filter(
                user_id=user_id
            )

        if search:
            queryset = (
                queryset.filter(
                    title__icontains=search
                )
                | queryset.filter(
                    description__icontains=search
                )
                | queryset.filter(
                    object_name__icontains=search
                )
                | queryset.filter(
                    user__email__icontains=search
                )
                | queryset.filter(
                    user__first_name__icontains=search
                )
                | queryset.filter(
                    user__last_name__icontains=search
                )
            )

        return queryset


class HealthCheckView(generics.GenericAPIView):
    """
    Public health check for the API, database,
    authentication configuration, and application.
    """

    permission_classes = [
        permissions.AllowAny,
    ]

    def get(self, request, *args, **kwargs):
        database_status = 'ok'
        authentication_status = 'ok'
        application_status = 'ok'

        # Database health
        try:
            connection.ensure_connection()

        except Exception:
            database_status = 'error'

        # JWT authentication configuration
        try:
            from rest_framework_simplejwt.settings import api_settings

            if not api_settings.ACCESS_TOKEN_LIFETIME:
                authentication_status = 'error'

        except Exception:
            authentication_status = 'error'

        # Application health
        try:
            from django.conf import settings

            if not settings.INSTALLED_APPS:
                application_status = 'error'

        except Exception:
            application_status = 'error'

        overall_status = (
            'ok'
            if (
                database_status == 'ok'
                and authentication_status == 'ok'
                and application_status == 'ok'
            )
            else 'error'
        )

        return Response({
            'status': overall_status,
            'service': 'Kiangini ICT Centre API',
            'api': 'ok',
            'database': database_status,
            'authentication': authentication_status,
            'application': application_status,
        })
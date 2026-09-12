from datetime import timedelta

from django.utils import timezone
from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Activity
from .serializers import ActivitySerializer


class ActivityListView(generics.ListAPIView):
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
            queryset = queryset.filter(
                title__icontains=search
            ) | queryset.filter(
                description__icontains=search
            ) | queryset.filter(
                object_name__icontains=search
            )

        return queryset


class ActivityStatsView(
    generics.GenericAPIView
):
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
from django.urls import path

from .views import (
    ActivityListView,
    ActivityStatsView,
    AdminActivityListView,
    HealthCheckView,
)


urlpatterns = [
    path(
        'activities/',
        ActivityListView.as_view(),
        name='activity-list',
    ),

    path(
        'activities/stats/',
        ActivityStatsView.as_view(),
        name='activity-stats',
    ),

    path(
        'admin/activities/',
        AdminActivityListView.as_view(),
        name='admin-activity-list',
    ),

    path(
        'health/',
        HealthCheckView.as_view(),
        name='health-check',
    ),
]
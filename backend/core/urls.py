from django.urls import path

from .views import (
    ActivityListView,
    ActivityStatsView,
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
]
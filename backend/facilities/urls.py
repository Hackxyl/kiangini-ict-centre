from django.urls import path

from .views import (
    FacilityListView,
    FacilityManagementDetailView,
    FacilityManagementListCreateView,
)


urlpatterns = [
    path(
        '',
        FacilityListView.as_view(),
        name='facility-list',
    ),

    path(
        'management/',
        FacilityManagementListCreateView.as_view(),
        name='facility-management-list-create',
    ),

    path(
        'management/<int:pk>/',
        FacilityManagementDetailView.as_view(),
        name='facility-management-detail',
    ),
]
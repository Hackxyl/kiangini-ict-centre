from django.urls import path

from .views import (
    AnnouncementManagementDetailView,
    AnnouncementManagementListCreateView,
    PublishedAnnouncementDetailView,
    PublishedAnnouncementListView,
)


urlpatterns = [
    # Public announcements
    path(
        '',
        PublishedAnnouncementListView.as_view(),
        name='announcement-list',
    ),

    path(
        '<int:pk>/',
        PublishedAnnouncementDetailView.as_view(),
        name='announcement-detail',
    ),

    # Officer / admin management
    path(
        'management/',
        AnnouncementManagementListCreateView.as_view(),
        name='announcement-management-list-create',
    ),

    path(
        'management/<int:pk>/',
        AnnouncementManagementDetailView.as_view(),
        name='announcement-management-detail',
    ),
]
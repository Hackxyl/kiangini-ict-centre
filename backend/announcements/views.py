from django.utils import timezone
from rest_framework import generics, permissions

from .models import Announcement
from .permissions import IsAdminOrOfficer
from .serializers import AnnouncementSerializer

from core.models import Activity
from core.services import log_activity

class PublishedAnnouncementListView(
    generics.ListAPIView
):
    serializer_class = AnnouncementSerializer
    permission_classes = [
        permissions.AllowAny
    ]

    def get_queryset(self):
        return (
            Announcement.objects
            .filter(is_published=True)
            .select_related('created_by')
            .order_by(
                '-published_at',
                '-created_at',
            )
        )


class PublishedAnnouncementDetailView(
    generics.RetrieveAPIView
):
    serializer_class = AnnouncementSerializer
    permission_classes = [
        permissions.AllowAny
    ]

    def get_queryset(self):
        return (
            Announcement.objects
            .filter(is_published=True)
            .select_related('created_by')
        )


class AnnouncementManagementListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = AnnouncementSerializer
    permission_classes = [
        IsAdminOrOfficer
    ]

    def get_queryset(self):
        return (
            Announcement.objects
            .select_related('created_by')
            .order_by(
                '-created_at'
            )
        )

    def perform_create(self, serializer):
        announcement = serializer.save(
            created_by=self.request.user
        )

        action = (
            Activity.ACTION_PUBLISHED
            if announcement.is_published
            else Activity.ACTION_CREATED
        )

        title = (
            'Announcement published'
            if announcement.is_published
            else 'Announcement created'
        )

        log_activity(
            user=self.request.user,
            activity_type=Activity.TYPE_ANNOUNCEMENT,
            action=action,
            title=title,
            description=announcement.title,
            object_id=announcement.id,
            object_name=announcement.title,
        )


class AnnouncementManagementDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = AnnouncementSerializer
    permission_classes = [
        IsAdminOrOfficer
    ]

    def get_queryset(self):
        return (
            Announcement.objects
            .select_related('created_by')
        )

    def perform_update(self, serializer):
        old_instance = self.get_object()

        was_published = old_instance.is_published

        announcement = serializer.save()

        if not was_published and announcement.is_published:
            action = Activity.ACTION_PUBLISHED
            title = 'Announcement published'
        else:
            action = Activity.ACTION_UPDATED
            title = 'Announcement updated'

        log_activity(
            user=self.request.user,
            activity_type=Activity.TYPE_ANNOUNCEMENT,
            action=action,
            title=title,
            description=announcement.title,
            object_id=announcement.id,
            object_name=announcement.title,
        )

    def perform_destroy(self, instance):
        announcement_title = instance.title
        announcement_id = instance.id

        log_activity(
            user=self.request.user,
            activity_type=Activity.TYPE_ANNOUNCEMENT,
            action=Activity.ACTION_DELETED,
            title='Announcement deleted',
            description=announcement_title,
            object_id=announcement_id,
            object_name=announcement_title,
        )

        instance.delete()
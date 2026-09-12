from django.conf import settings
from django.db import models


class Announcement(models.Model):
    TYPE_GENERAL = 'general'
    TYPE_ACADEMIC = 'academic'
    TYPE_SYSTEM = 'system'
    TYPE_EVENT = 'event'
    TYPE_MAINTENANCE = 'maintenance'
    TYPE_URGENT = 'urgent'

    TYPE_CHOICES = [
        (TYPE_GENERAL, 'General'),
        (TYPE_ACADEMIC, 'Academic'),
        (TYPE_SYSTEM, 'System'),
        (TYPE_EVENT, 'Event'),
        (TYPE_MAINTENANCE, 'Maintenance'),
        (TYPE_URGENT, 'Urgent'),
    ]

    title = models.CharField(max_length=255)

    message = models.TextField()

    announcement_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default=TYPE_GENERAL,
    )

    is_published = models.BooleanField(default=True)

    published_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='announcements_created',
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title

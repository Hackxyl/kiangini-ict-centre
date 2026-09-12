
from django.conf import settings
from django.db import models


class Activity(models.Model):
    TYPE_ANNOUNCEMENT = 'announcement'
    TYPE_BOOKING = 'booking'
    TYPE_FACILITY = 'facility'
    TYPE_USER = 'user'
    TYPE_SYSTEM = 'system'

    TYPE_CHOICES = [
        (TYPE_ANNOUNCEMENT, 'Announcement'),
        (TYPE_BOOKING, 'Booking'),
        (TYPE_FACILITY, 'Facility'),
        (TYPE_USER, 'User'),
        (TYPE_SYSTEM, 'System'),
    ]

    ACTION_CREATED = 'created'
    ACTION_UPDATED = 'updated'
    ACTION_DELETED = 'deleted'
    ACTION_PUBLISHED = 'published'
    ACTION_APPROVED = 'approved'
    ACTION_REJECTED = 'rejected'
    ACTION_CANCELLED = 'cancelled'
    ACTION_REGISTERED = 'registered'
    ACTION_LOGIN = 'login'
    ACTION_LOGOUT = 'logout'
    ACTION_PROFILE_UPDATED = 'profile_updated'
    ACTION_PASSWORD_CHANGED = 'password_changed'

    ACTION_CHOICES = [
      (ACTION_CREATED, 'Created'),
      (ACTION_UPDATED, 'Updated'),
      (ACTION_DELETED, 'Deleted'),
      (ACTION_PUBLISHED, 'Published'),
      (ACTION_APPROVED, 'Approved'),
      (ACTION_REJECTED, 'Rejected'),
      (ACTION_CANCELLED, 'Cancelled'),
      (ACTION_REGISTERED, 'Registered'),
      (ACTION_LOGIN, 'Login'),
      (ACTION_LOGOUT, 'Logout'),
      (ACTION_PROFILE_UPDATED, 'Profile Updated'),
      (ACTION_PASSWORD_CHANGED, 'Password Changed'),
]

    activity_type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES,
    )

    action = models.CharField(
        max_length=30,
        choices=ACTION_CHOICES,
    )

    title = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activities',
    )

    object_id = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    object_name = models.CharField(
        max_length=255,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(
                fields=['activity_type', '-created_at'],
            ),
            models.Index(
                fields=['action', '-created_at'],
            ),
            models.Index(
                fields=['user', '-created_at'],
            ),
        ]

    def __str__(self):
        return self.title
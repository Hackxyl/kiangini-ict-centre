from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Booking(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_APPROVED = 'approved'
    STATUS_REJECTED = 'rejected'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_APPROVED, 'Approved'),
        (STATUS_REJECTED, 'Rejected'),
        (STATUS_CANCELLED, 'Cancelled'),
        (STATUS_COMPLETED, 'Completed'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings',
    )

    facility = models.ForeignKey(
        'facilities.Facility',
        on_delete=models.PROTECT,
        related_name='bookings',
    )

    booking_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    purpose = models.CharField(
        max_length=255,
    )

    notes = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
    )

    rejection_reason = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ['-booking_date', '-start_time']
        indexes = [
            models.Index(
                fields=[
                    'facility',
                    'booking_date',
                ],
            ),
            models.Index(
                fields=[
                    'user',
                    'status',
                ],
            ),
        ]

    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError(
                'End time must be later than start time.'
            )

    def __str__(self):
        return (
            f'{self.user} - '
            f'{self.facility} - '
            f'{self.booking_date}'
        )
from django.db import models


class Facility(models.Model):
    STATUS_AVAILABLE = 'available'
    STATUS_MAINTENANCE = 'maintenance'
    STATUS_INACTIVE = 'inactive'

    STATUS_CHOICES = [
        (STATUS_AVAILABLE, 'Available'),
        (STATUS_MAINTENANCE, 'Under Maintenance'),
        (STATUS_INACTIVE, 'Inactive'),
    ]

    name = models.CharField(
        max_length=150,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    location = models.CharField(
        max_length=255,
        blank=True,
    )

    capacity = models.PositiveIntegerField(
        default=1,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_AVAILABLE,
    )

    is_bookable = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

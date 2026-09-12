from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager


class User(AbstractUser):
    ROLE_STUDENT = 'student'
    ROLE_OFFICER = 'officer'
    ROLE_ADMIN = 'admin'

    ROLE_CHOICES = [
        (ROLE_STUDENT, 'Student'),
        (ROLE_OFFICER, 'Officer'),
        (ROLE_ADMIN, 'Administrator'),
    ]

    username = models.CharField(
        max_length=150,
        unique=False,
        blank=True,
    )

    email = models.EmailField(
        unique=True,
        db_index=True,
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default=ROLE_STUDENT,
    )

    phone = models.CharField(
        max_length=20,
        blank=True,
    )

    student_id = models.CharField(
        max_length=50,
        unique=True,
        null=True,
        blank=True,
    )

    course = models.CharField(
        max_length=255,
        blank=True,
    )

    year_of_study = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.get_full_name() or self.email
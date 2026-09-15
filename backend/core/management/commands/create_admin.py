import os

from django.core.management.base import BaseCommand
from django.db import IntegrityError

from accounts.models import User


class Command(BaseCommand):
    help = "Create the production admin user from environment variables."

    def handle(self, *args, **options):
        email = os.environ.get("DJANGO_ADMIN_EMAIL")
        password = os.environ.get("DJANGO_ADMIN_PASSWORD")

        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    "DJANGO_ADMIN_EMAIL or DJANGO_ADMIN_PASSWORD is not set. "
                    "Skipping admin creation."
                )
            )
            return

        email = email.strip().lower()

        try:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "role": User.ROLE_ADMIN,
                    "is_staff": True,
                    "is_superuser": True,
                    "is_active": True,
                },
            )

            if created:
                user.set_password(password)
                user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Production admin created: {email}"
                    )
                )
            else:
                updated = False

                if user.role != User.ROLE_ADMIN:
                    user.role = User.ROLE_ADMIN
                    updated = True

                if not user.is_staff:
                    user.is_staff = True
                    updated = True

                if not user.is_superuser:
                    user.is_superuser = True
                    updated = True

                if not user.is_active:
                    user.is_active = True
                    updated = True

                if updated:
                    user.save()

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Production admin already exists: {email}"
                    )
                )

        except IntegrityError as error:
            self.stdout.write(
                self.style.ERROR(
                    f"Unable to create production admin: {error}"
                )
            )
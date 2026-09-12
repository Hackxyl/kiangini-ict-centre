from django.contrib import admin

from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'announcement_type',
        'is_published',
        'published_at',
        'created_by',
        'created_at',
    ]

    list_filter = [
        'announcement_type',
        'is_published',
    ]

    search_fields = [
        'title',
        'message',
    ]

    readonly_fields = [
        'created_at',
        'updated_at',
    ]
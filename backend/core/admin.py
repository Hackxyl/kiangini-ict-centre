from django.contrib import admin

from .models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'activity_type',
        'action',
        'user',
        'created_at',
    ]

    list_filter = [
        'activity_type',
        'action',
        'created_at',
    ]

    search_fields = [
        'title',
        'description',
        'object_name',
        'user__email',
        'user__first_name',
        'user__last_name',
    ]

    readonly_fields = [
        'created_at',
    ]
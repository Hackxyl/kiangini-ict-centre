from django.contrib import admin

from .models import Facility


@admin.register(Facility)
class FacilityAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'location',
        'capacity',
        'status',
        'is_bookable',
        'created_at',
    ]

    list_filter = [
        'status',
        'is_bookable',
    ]

    search_fields = [
        'name',
        'location',
        'description',
    ]
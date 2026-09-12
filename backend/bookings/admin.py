from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'facility',
        'user',
        'booking_date',
        'start_time',
        'end_time',
        'status',
        'created_at',
    ]

    list_filter = [
        'status',
        'booking_date',
        'facility',
    ]

    search_fields = [
        'facility__name',
        'user__email',
        'user__first_name',
        'user__last_name',
        'purpose',
    ]

    readonly_fields = [
        'created_at',
        'updated_at',
    ]
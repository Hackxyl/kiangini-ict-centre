from django.utils import timezone
from rest_framework import serializers

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    facility_name = serializers.CharField(
        source='facility.name',
        read_only=True,
    )

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'user_name',
            'facility',
            'facility_name',
            'booking_date',
            'start_time',
            'end_time',
            'purpose',
            'notes',
            'status',
            'rejection_reason',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'user_name',
            'facility_name',
            'status',
            'rejection_reason',
            'created_at',
            'updated_at',
        ]

    def get_user_name(self, obj):
        return (
            obj.user.get_full_name()
            or obj.user.email
        )

    def validate(self, attrs):
        booking_date = attrs.get('booking_date')
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')

        if start_time >= end_time:
            raise serializers.ValidationError({
                'end_time': (
                    'End time must be later than '
                    'start time.'
                ),
            })

        if booking_date < timezone.localdate():
            raise serializers.ValidationError({
                'booking_date': (
                    'You cannot create a booking '
                    'for a past date.'
                ),
            })

        facility = attrs.get('facility')

        if facility and (
            not facility.is_bookable
            or facility.status != facility.STATUS_AVAILABLE
        ):
            raise serializers.ValidationError({
                'facility': (
                    'This facility is currently '
                    'not available for booking.'
                ),
            })

        overlapping_bookings = Booking.objects.filter(
            facility=facility,
            booking_date=booking_date,
            status__in=[
                Booking.STATUS_PENDING,
                Booking.STATUS_APPROVED,
            ],
        ).filter(
            start_time__lt=end_time,
            end_time__gt=start_time,
        )

        if self.instance:
            overlapping_bookings = (
                overlapping_bookings.exclude(
                    pk=self.instance.pk
                )
            )

        if overlapping_bookings.exists():
            raise serializers.ValidationError({
                'booking_date': (
                    'This facility is already booked '
                    'during the selected time.'
                ),
            })

        return attrs

    def create(self, validated_data):
        request = self.context['request']

        return Booking.objects.create(
            user=request.user,
            **validated_data,
        )
    
class BookingManagementSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(
        source='user.email',
        read_only=True,
    )
    facility_name = serializers.CharField(
        source='facility.name',
        read_only=True,
    )

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'facility',
            'facility_name',
            'booking_date',
            'start_time',
            'end_time',
            'purpose',
            'notes',
            'status',
            'rejection_reason',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'facility',
            'facility_name',
            'booking_date',
            'start_time',
            'end_time',
            'purpose',
            'notes',
            'status',
            'rejection_reason',
            'created_at',
            'updated_at',
        ]

    def get_user_name(self, obj):
        return (
            obj.user.get_full_name()
            or obj.user.email
        )
from django.utils import timezone
from rest_framework import serializers

from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    type_display = serializers.CharField(
        source='get_announcement_type_display',
        read_only=True,
    )

    class Meta:
        model = Announcement
        fields = [
            'id',
            'title',
            'message',
            'announcement_type',
            'type_display',
            'is_published',
            'published_at',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'created_by',
            'created_by_name',
            'type_display',
            'created_at',
            'updated_at',
        ]

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return 'Kiangini ICT Centre'

        return (
            obj.created_by.get_full_name()
            or obj.created_by.email
        )

    def validate_title(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Announcement title is required.'
            )

        return value

    def validate_message(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                'Announcement message is required.'
            )

        return value

    def validate(self, attrs):
        is_published = attrs.get(
            'is_published',
            getattr(
                self.instance,
                'is_published',
                True,
            ),
        )

        published_at = attrs.get(
            'published_at',
            getattr(
                self.instance,
                'published_at',
                None,
            ),
        )

        if is_published and not published_at:
            attrs['published_at'] = timezone.now()

        if not is_published:
            attrs['published_at'] = None

        return attrs
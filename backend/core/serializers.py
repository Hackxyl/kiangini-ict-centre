from rest_framework import serializers

from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(
        source='get_activity_type_display',
        read_only=True,
    )

    action_display = serializers.CharField(
        source='get_action_display',
        read_only=True,
    )

    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = [
            'id',
            'activity_type',
            'activity_type_display',
            'action',
            'action_display',
            'title',
            'description',
            'user',
            'user_name',
            'object_id',
            'object_name',
            'created_at',
        ]
        read_only_fields = fields

    def get_user_name(self, obj):
        if not obj.user:
            return 'System'

        return (
            obj.user.get_full_name()
            or obj.user.email
        )
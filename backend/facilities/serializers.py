from rest_framework import serializers

from .models import Facility


class FacilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Facility
        fields = [
            'id',
            'name',
            'description',
            'location',
            'capacity',
            'status',
            'is_bookable',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'id',
            'created_at',
            'updated_at',
        ]
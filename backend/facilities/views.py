from rest_framework import generics, permissions

from .models import Facility
from .serializers import FacilitySerializer
from announcements.permissions import IsAdminOrOfficer

from core.models import Activity
from core.services import log_activity


class FacilityListView(generics.ListAPIView):
    serializer_class = FacilitySerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        return Facility.objects.filter(
            status=Facility.STATUS_AVAILABLE,
            is_bookable=True,
        )


class FacilityManagementListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = FacilitySerializer
    permission_classes = [
        IsAdminOrOfficer,
    ]

    def get_queryset(self):
        return Facility.objects.all()

    def perform_create(self, serializer):
        facility = serializer.save()

        log_activity(
            user=self.request.user,
            activity_type=Activity.TYPE_FACILITY,
            action=Activity.ACTION_CREATED,
            title='Facility created',
            description=(
                f'{facility.name} was added to the ICT Centre facilities.'
            ),
            object_id=facility.id,
            object_name=facility.name,
        )


class FacilityManagementDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = FacilitySerializer
    permission_classes = [
        IsAdminOrOfficer,
    ]

    def get_queryset(self):
        return Facility.objects.all()

    def perform_update(self, serializer):
        old_facility = self.get_object()

        old_status = old_facility.status
        old_bookable = old_facility.is_bookable

        facility = serializer.save()

        if old_status != facility.status:
            title = 'Facility status changed'
            description = (
                f'{facility.name} status changed from '
                f'{old_facility.get_status_display()} to '
                f'{facility.get_status_display()}.'
            )
        elif old_bookable != facility.is_bookable:
            title = 'Facility booking access updated'
            description = (
                f'Booking access for {facility.name} was '
                f'{"enabled" if facility.is_bookable else "disabled"}.'
            )
        else:
            title = 'Facility updated'
            description = (
                f'{facility.name} facility details were updated.'
            )

        log_activity(
            user=self.request.user,
            activity_type=Activity.TYPE_FACILITY,
            action=Activity.ACTION_UPDATED,
            title=title,
            description=description,
            object_id=facility.id,
            object_name=facility.name,
        )

    def perform_destroy(self, instance):
        facility_name = instance.name
        facility_id = instance.id

        log_activity(
            user=self.request.user,
            activity_type=Activity.TYPE_FACILITY,
            action=Activity.ACTION_DELETED,
            title='Facility deleted',
            description=(
                f'{facility_name} was removed from the ICT Centre facilities.'
            ),
            object_id=facility_id,
            object_name=facility_name,
        )

        instance.delete()
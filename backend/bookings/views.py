from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Booking
from .permissions import IsAdminOrOfficer
from .serializers import (
    BookingManagementSerializer,
    BookingSerializer,
)

from core.models import Activity
from core.services import log_activity


class MyBookingListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = BookingSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        return (
            Booking.objects
            .filter(user=self.request.user)
            .select_related('facility', 'user')
        )


class BookingDetailView(
    generics.RetrieveAPIView
):
    serializer_class = BookingSerializer
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def get_queryset(self):
        return (
            Booking.objects
            .filter(user=self.request.user)
            .select_related('facility', 'user')
        )


class BookingCancelView(APIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(
                pk=pk,
                user=request.user,
            )
        except Booking.DoesNotExist:
            return Response(
                {
                    'detail': 'Booking not found.'
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.status not in [
            Booking.STATUS_PENDING,
            Booking.STATUS_APPROVED,
        ]:
            return Response(
                {
                    'detail': (
                        'This booking can no longer '
                        'be cancelled.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.STATUS_CANCELLED

        booking.save(
            update_fields=[
                'status',
                'updated_at',
            ]
        )

        log_activity(
            user=request.user,
            activity_type=Activity.TYPE_BOOKING,
            action=Activity.ACTION_CANCELLED,
            title='Booking cancelled',
            description=(
                f'Booking for {booking.facility.name} on '
                f'{booking.booking_date} was cancelled.'
            ),
            object_id=booking.id,
            object_name=booking.facility.name,
        )

        return Response(
            BookingSerializer(
                booking,
                context={'request': request},
            ).data,
            status=status.HTTP_200_OK,
        )


# =========================================================
# OFFICER / ADMIN BOOKING MANAGEMENT
# =========================================================

class BookingManagementListView(
    generics.ListAPIView
):
    """
    Allows ICT officers and administrators to view
    all booking requests.
    """

    serializer_class = BookingManagementSerializer
    permission_classes = [
        IsAdminOrOfficer,
    ]

    def get_queryset(self):
        queryset = (
            Booking.objects
            .select_related('facility', 'user')
            .order_by(
                'status',
                'booking_date',
                'start_time',
            )
        )

        booking_status = self.request.query_params.get(
            'status'
        )

        if booking_status:
            queryset = queryset.filter(
                status=booking_status
            )

        return queryset


class BookingManagementDetailView(
    generics.RetrieveAPIView
):
    """
    Allows officers and administrators to view
    a specific booking request.
    """

    serializer_class = BookingManagementSerializer
    permission_classes = [
        IsAdminOrOfficer,
    ]

    def get_queryset(self):
        return (
            Booking.objects
            .select_related('facility', 'user')
        )


class BookingApproveView(APIView):
    """
    Approves a pending booking.
    """

    permission_classes = [
        IsAdminOrOfficer,
    ]

    def post(self, request, pk):
        try:
            booking = (
                Booking.objects
                .select_related('facility', 'user')
                .get(pk=pk)
            )
        except Booking.DoesNotExist:
            return Response(
                {
                    'detail': 'Booking not found.'
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.status != Booking.STATUS_PENDING:
            return Response(
                {
                    'detail': (
                        'Only pending bookings can '
                        'be approved.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Re-check for overlapping approved/pending
        # bookings before approval.
        overlapping_booking = (
            Booking.objects
            .filter(
                facility=booking.facility,
                booking_date=booking.booking_date,
                status__in=[
                    Booking.STATUS_PENDING,
                    Booking.STATUS_APPROVED,
                ],
                start_time__lt=booking.end_time,
                end_time__gt=booking.start_time,
            )
            .exclude(pk=booking.pk)
            .first()
        )

        if overlapping_booking:
            return Response(
                {
                    'detail': (
                        'This facility already has '
                        'another booking during the '
                        'selected time.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.STATUS_APPROVED
        booking.rejection_reason = ''

        booking.save(
            update_fields=[
                'status',
                'rejection_reason',
                'updated_at',
            ]
        )

        log_activity(
            user=request.user,
            activity_type=Activity.TYPE_BOOKING,
            action=Activity.ACTION_APPROVED,
            title='Booking approved',
            description=(
                f'Booking for {booking.facility.name} on '
                f'{booking.booking_date} was approved.'
            ),
            object_id=booking.id,
            object_name=booking.facility.name,
        )

        return Response(
            BookingManagementSerializer(
                booking,
                context={'request': request},
            ).data,
            status=status.HTTP_200_OK,
        )


class BookingRejectView(APIView):
    """
    Rejects a pending booking.
    """

    permission_classes = [
        IsAdminOrOfficer,
    ]

    def post(self, request, pk):
        try:
            booking = (
                Booking.objects
                .select_related('facility', 'user')
                .get(pk=pk)
            )
        except Booking.DoesNotExist:
            return Response(
                {
                    'detail': 'Booking not found.'
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if booking.status != Booking.STATUS_PENDING:
            return Response(
                {
                    'detail': (
                        'Only pending bookings can '
                        'be rejected.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = str(
            request.data.get(
                'rejection_reason',
                ''
            )
        ).strip()

        if not reason:
            return Response(
                {
                    'rejection_reason': (
                        'A rejection reason is required.'
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = Booking.STATUS_REJECTED
        booking.rejection_reason = reason

        booking.save(
            update_fields=[
                'status',
                'rejection_reason',
                'updated_at',
            ]
        )

        log_activity(
            user=request.user,
            activity_type=Activity.TYPE_BOOKING,
            action=Activity.ACTION_REJECTED,
            title='Booking rejected',
            description=(
                f'Booking for {booking.facility.name} on '
                f'{booking.booking_date} was rejected. '
                f'Reason: {reason}'
            ),
            object_id=booking.id,
            object_name=booking.facility.name,
        )

        return Response(
            BookingManagementSerializer(
                booking,
                context={'request': request},
            ).data,
            status=status.HTTP_200_OK,
        )
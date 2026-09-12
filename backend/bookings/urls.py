from django.urls import path

from .views import (
    BookingApproveView,
    BookingCancelView,
    BookingDetailView,
    BookingManagementDetailView,
    BookingManagementListView,
    BookingRejectView,
    MyBookingListCreateView,
)


urlpatterns = [
    # =====================================================
    # STUDENT BOOKING ENDPOINTS
    # =====================================================

    path(
        '',
        MyBookingListCreateView.as_view(),
        name='booking-list-create',
    ),

    path(
        '<int:pk>/',
        BookingDetailView.as_view(),
        name='booking-detail',
    ),

    path(
        '<int:pk>/cancel/',
        BookingCancelView.as_view(),
        name='booking-cancel',
    ),

    # =====================================================
    # OFFICER / ADMIN MANAGEMENT ENDPOINTS
    # =====================================================

    path(
        'management/',
        BookingManagementListView.as_view(),
        name='booking-management-list',
    ),

    path(
        'management/<int:pk>/',
        BookingManagementDetailView.as_view(),
        name='booking-management-detail',
    ),

    path(
        'management/<int:pk>/approve/',
        BookingApproveView.as_view(),
        name='booking-approve',
    ),

    path(
        'management/<int:pk>/reject/',
        BookingRejectView.as_view(),
        name='booking-reject',
    ),
]
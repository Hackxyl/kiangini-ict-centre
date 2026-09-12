import api from '../config/api';

const officerBookingService = {
  getBookings: async (status = '') => {
    const endpoint = status
      ? `/bookings/management/?status=${status}`
      : '/bookings/management/';

    const response = await api.get(endpoint);

    return response.data;
  },

  getBooking: async (id) => {
    const response = await api.get(
      `/bookings/management/${id}/`,
    );

    return response.data;
  },

  approveBooking: async (id) => {
    const response = await api.post(
      `/bookings/management/${id}/approve/`,
    );

    return response.data;
  },

  rejectBooking: async (id, rejectionReason) => {
    const response = await api.post(
      `/bookings/management/${id}/reject/`,
      {
        rejection_reason: rejectionReason,
      },
    );

    return response.data;
  },
};

export default officerBookingService;
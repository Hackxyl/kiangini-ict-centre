import api from '../config/api';

const bookingService = {
  getBookings: async () => {
    const response = await api.get('/bookings/');

    return response.data;
  },

  getBooking: async (id) => {
    const response = await api.get(
      `/bookings/${id}/`,
    );

    return response.data;
  },

  createBooking: async (bookingData) => {
    const response = await api.post(
      '/bookings/',
      bookingData,
    );

    return response.data;
  },

  cancelBooking: async (id) => {
    const response = await api.post(
      `/bookings/${id}/cancel/`,
    );

    return response.data;
  },
};

export default bookingService;
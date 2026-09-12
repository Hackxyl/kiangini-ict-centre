import api from '../config/api';

const announcementService = {
  getAnnouncements: async () => {
    const response = await api.get('/announcements/');
    return response.data;
  },

  getAnnouncement: async (id) => {
    const response = await api.get(
      `/announcements/${id}/`,
    );

    return response.data;
  },

  getManagementAnnouncements: async () => {
    const response = await api.get(
      '/announcements/management/',
    );

    return response.data;
  },

  createAnnouncement: async (announcementData) => {
    const response = await api.post(
      '/announcements/management/',
      announcementData,
    );

    return response.data;
  },

  updateAnnouncement: async (id, announcementData) => {
    const response = await api.patch(
      `/announcements/management/${id}/`,
      announcementData,
    );

    return response.data;
  },

  deleteAnnouncement: async (id) => {
    const response = await api.delete(
      `/announcements/management/${id}/`,
    );

    return response.data;
  },
};

export default announcementService;
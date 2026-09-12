import api from '../config/api';

const facilityService = {
  getFacilities: async () => {
    const response = await api.get('/facilities/');
    return response.data;
  },

  getManagementFacilities: async () => {
    const response = await api.get(
      '/facilities/management/',
    );

    return response.data;
  },

  getFacility: async (id) => {
    const response = await api.get(
      `/facilities/management/${id}/`,
    );

    return response.data;
  },

  createFacility: async (facilityData) => {
    const response = await api.post(
      '/facilities/management/',
      facilityData,
    );

    return response.data;
  },

  updateFacility: async (id, facilityData) => {
    const response = await api.patch(
      `/facilities/management/${id}/`,
      facilityData,
    );

    return response.data;
  },

  deleteFacility: async (id) => {
    const response = await api.delete(
      `/facilities/management/${id}/`,
    );

    return response.data;
  },
};

export default facilityService;
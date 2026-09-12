import api from '../config/api';

const activityService = {
  getActivities: async (params = {}) => {
    const response = await api.get(
      '/activities/',
      {
        params,
      },
    );

    return response.data;
  },

  getStats: async () => {
    const response = await api.get(
      '/activities/stats/',
    );

    return response.data;
  },
};

export default activityService;
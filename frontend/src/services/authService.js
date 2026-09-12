import api from '../config/api';

const authService = {
  login: async (email, password) => {
    const response = await api.post(
      '/auth/login/',
      {
        email,
        password,
      },
    );

    return response.data;
  },

  register: async (userData) => {
    const response = await api.post(
      '/auth/register/',
      userData,
    );

    return response.data;
  },

  getMe: async () => {
    const response = await api.get(
      '/auth/me/',
    );

    return response.data;
  },

  updateMe: async (userData) => {
    const response = await api.patch(
      '/auth/me/',
      userData,
    );

    return response.data;
  },

  refreshToken: async (refresh) => {
    const response = await api.post(
      '/auth/token/refresh/',
      {
        refresh,
      },
    );

    return response.data;
  },

  logout: async (refreshToken) => {
    const response = await api.post(
      '/auth/logout/',
      {
        refresh: refreshToken,
      },
    );

    return response.data;
  },

  changePassword: async (
    currentPassword,
    newPassword,
    newPasswordConfirm,
  ) => {
    const response = await api.post(
      '/auth/change-password/',
      {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirm: newPasswordConfirm,
      },
    );

    return response.data;
  },
};

export default authService;
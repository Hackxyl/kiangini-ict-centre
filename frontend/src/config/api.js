import axios from 'axios';

const ACCESS_TOKEN_KEY = 'kiangini_access_token';
const REFRESH_TOKEN_KEY = 'kiangini_refresh_token';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/*
|--------------------------------------------------------------------------
| Attach access token to every authenticated request
|--------------------------------------------------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/*
|--------------------------------------------------------------------------
| Automatically refresh expired access tokens
|--------------------------------------------------------------------------
*/

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeToTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function notifyTokenRefresh(newAccessToken) {
  refreshSubscribers.forEach((callback) => {
    callback(newAccessToken);
  });

  refreshSubscribers = [];
}

function clearAuthentication() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    /*
     * Only handle 401 responses once.
     */
    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    /*
     * Never try to refresh the login or refresh endpoints.
     */
    if (
      originalRequest.url?.includes('/auth/login/') ||
      originalRequest.url?.includes('/auth/token/refresh/')
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(
      REFRESH_TOKEN_KEY,
    );

    if (!refreshToken) {
      clearAuthentication();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    /*
     * If another request is already refreshing the token,
     * wait for it to finish.
     */
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeToTokenRefresh((newAccessToken) => {
          if (!newAccessToken) {
            reject(error);
            return;
          }

          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/token/refresh/`,
        {
          refresh: refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const newAccessToken = response.data.access;

      localStorage.setItem(
        ACCESS_TOKEN_KEY,
        newAccessToken,
      );

      notifyTokenRefresh(newAccessToken);

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      clearAuthentication();

      notifyTokenRefresh(null);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
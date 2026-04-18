import axios from 'axios';

/**
 * Axios API instance with interceptors
 * Handles authentication tokens and error handling
 */
const api = axios.create({
  baseURL: 'http://localhost:8081/', // Backend API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const authEndpoints = ['/auth/login', '/auth/register', '/auth/reset-password', '/auth/request-password-reset'];
      const isAuthRequest = authEndpoints.some((path) => requestUrl.endsWith(path));

      if (!isAuthRequest) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    // Handle other errors
    if (error.response?.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;

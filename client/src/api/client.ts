import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('store_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or invalid
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('store_token');
        localStorage.removeItem('store_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;


import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/dashboard`,
});

// Adjuntar JWT a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dashboard_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 → limpiar sesión y redirigir
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('dashboard_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const API_BASE = API_URL;
export default api;

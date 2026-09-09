// src/config/api.js
import axios from 'axios';

// Base URL desde env Vite, fallback a localhost para desarrollo
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Cliente Axios centralizado - usar este en servicios nuevos
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor REQUEST: inyecta Authorization Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor RESPONSE: maneja 401 -> limpia sesión y redirige a login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      // Evitar loop si ya está en login/register
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && !currentPath.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// También configurar axios global para compatibilidad con servicios que usan axios directo + API_URL
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Solo inyectar si es llamada a la API y hay token
    if (token && config.url?.includes(API_URL)) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (token && config.url?.startsWith('/api')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && !currentPath.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API_URL;

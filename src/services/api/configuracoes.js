import axios from 'axios';

export const API_CONFIG = {
  BASE_URL: 'http://35.196.79.227:8000',
  TIMEOUT: 10000,
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  HEADERS: {
    'Content-Type': 'application/json'
  }
}

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    ...API_CONFIG.HEADERS,
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  withCredentials: false
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.warn('Token expirado ou inválido. Usuário precisa fazer login novamente.');
    }
    return Promise.reject(error);
  }
);

export default api; 
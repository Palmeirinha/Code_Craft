import axios from 'axios';

// Configuração da API
// Constantes essenciais movidas de utils/constants.js
export const API_CONFIG = {
  BASE_URL: 'http://35.196.79.227:8000',
  TIMEOUT: 10000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  HEADERS: {
    'Content-Type': 'application/json'
  }
}

// Instância do axios configurada
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS,
});

// Interceptor para adicionar token automaticamente
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

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Não redirecionar automaticamente, deixar o componente decidir
      console.warn('Token expirado ou inválido. Usuário precisa fazer login novamente.');
    }
    return Promise.reject(error);
  }
);

export default api; 
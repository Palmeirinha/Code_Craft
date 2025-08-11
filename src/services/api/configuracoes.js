// Importação da biblioteca axios para requisições HTTP
import axios from 'axios';

// ===== CONFIGURAÇÕES DA API =====
// Este módulo centraliza todas as configurações da API e cria uma instância
// configurada do axios com interceptors para autenticação e tratamento de erros

// Configuração da API
// Constantes essenciais movidas de utils/constants.js
export const API_CONFIG = {
  // URL base da API backend
  BASE_URL: 'http://35.196.79.227:8000',
  
  // Timeout padrão para requisições (10 segundos)
  TIMEOUT: 10000,
  
  // Tamanho máximo de arquivo permitido (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Tipos de imagem suportados para upload
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  
  // Headers padrão para todas as requisições
  HEADERS: {
    'Content-Type': 'application/json'
  }
}

// ===== INSTÂNCIA CONFIGURADA DO AXIOS =====
// Cria uma instância do axios com configurações personalizadas
// Esta instância será usada por todos os módulos de API
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,    // URL base da API
  timeout: API_CONFIG.TIMEOUT,     // Timeout padrão
  headers: API_CONFIG.HEADERS,     // Headers padrão
});

// ===== INTERCEPTOR DE REQUISIÇÃO =====
// Intercepta todas as requisições antes de serem enviadas
// Adiciona automaticamente o token de autenticação se disponível
api.interceptors.request.use(
  (config) => {
    // Busca o token de autenticação no localStorage
    const token = localStorage.getItem('token');
    
    // Se o token existir, adiciona no header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Retorna a configuração modificada
    return config;
  },
  (error) => {
    // Em caso de erro na configuração, rejeita a Promise
    return Promise.reject(error);
  }
);

// ===== INTERCEPTOR DE RESPOSTA =====
// Intercepta todas as respostas da API
// Trata automaticamente erros de autenticação (401)
api.interceptors.response.use(
  (response) => {
    // Se a resposta for bem-sucedida, retorna normalmente
    return response;
  },
  (error) => {
    // Verifica se o erro é de autenticação (401 - Unauthorized)
    if (error.response?.status === 401) {
      // Token expirado ou inválido - limpa dados de autenticação
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Não redireciona automaticamente, deixa o componente decidir
      // Isso permite que cada componente trate a expiração de forma específica
      console.warn('Token expirado ou inválido. Usuário precisa fazer login novamente.');
    }
    
    // Rejeita a Promise com o erro para tratamento no componente
    return Promise.reject(error);
  }
);

// ===== EXPORTAÇÃO =====
// Exporta a instância configurada do axios para uso em outros módulos
export default api; 
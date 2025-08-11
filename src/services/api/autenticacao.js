// Importação da instância configurada da API
import api from './configuracoes.js';

// ===== AUTENTICAÇÃO =====
// Este módulo contém as funções para autenticação de usuários
// Inclui login e cadastro com tratamento de erros robusto

/**
 * Função para autenticação de usuário (login)
 * @param {string} email - Email do usuário para autenticação
 * @param {string} password - Senha do usuário para autenticação
 * @returns {Promise<Object>} Dados da resposta da API (token, usuário, etc.)
 * @throws {string} Mensagem de erro personalizada em caso de falha
 */
export async function loginApi(email, password) {
  try {
    // Faz requisição POST para o endpoint de login
    // Envia email e password no corpo da requisição
    const response = await api.post('/login', { email, password })
    
    // Retorna os dados da resposta (token, informações do usuário, etc.)
    return response.data
  } catch (error) {
    // Tratamento de erro personalizado
    // Tenta extrair detalhes do erro da API, senão usa mensagem padrão
    throw error.response?.data?.detail || 'Erro ao fazer login.'
  }
}

/**
 * Função para cadastro de novo usuário (registro)
 * @param {string} name - Nome completo do usuário
 * @param {string} email - Email único do usuário para cadastro
 * @param {string} password - Senha do usuário para cadastro
 * @returns {Promise<Object>} Dados da resposta da API (usuário criado, etc.)
 * @throws {string} Mensagem de erro personalizada em caso de falha
 */
export async function cadastroApi(name, email, password) {
  try {
    // Faz requisição POST para o endpoint de registro
    // Envia name, email e password no corpo da requisição
    const response = await api.post('/register', { name, email, password })
    
    // Retorna os dados da resposta (usuário criado, etc.)
    return response.data
  } catch (error) {
    // Tratamento de erro personalizado
    // Tenta extrair detalhes do erro da API, senão usa mensagem padrão
    throw error.response?.data?.detail || 'Erro ao cadastrar.'
  }
}

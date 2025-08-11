import api from './configuracoes.js';

export async function loginApi(email, password) {
  try {
    const response = await api.post('/login', { email, password })
    return response.data
  } catch (error) {
    throw error.response?.data?.detail || 'Erro ao fazer login.'
  }
}

export async function cadastroApi(name, email, password) {
  try {
    const response = await api.post('/register', { name, email, password })
    return response.data
  } catch (error) {
    throw error.response?.data?.detail || 'Erro ao cadastrar.'
  }
}

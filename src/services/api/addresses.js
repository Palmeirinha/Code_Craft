import api from './config.js';

// ===== ENDEREÇOS =====
export async function listarEnderecos() {
  const response = await api.get('/addresses/')
  return response.data
}

export async function criarEndereco(endereco) {
  const response = await api.post('/addresses/', endereco)
  return response.data
}

export async function atualizarEndereco(id, endereco) {
  const response = await api.put(`/addresses/${id}`, endereco)
  return response.data
}

export async function deletarEndereco(id) {
  const response = await api.delete(`/addresses/${id}`)
  return response.data
}

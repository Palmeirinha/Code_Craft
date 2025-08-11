// Importação da instância configurada da API
import api from './configuracoes.js';

// ===== ENDEREÇOS =====
// Este módulo contém todas as operações CRUD relacionadas aos endereços dos usuários
// Inclui listagem, criação, atualização e exclusão de endereços de entrega

/**
 * Função para listar todos os endereços do usuário autenticado
 * @returns {Promise<Array>} Array com todos os endereços do usuário
 */
export async function listarEnderecos() {
  const response = await api.get('/addresses/')
  return response.data
}

/**
 * Função para criar um novo endereço para o usuário
 * @param {Object} endereco - Objeto com dados do endereço
 * @param {string} endereco.street - Rua/Avenida do endereço
 * @param {string} endereco.number - Número do endereço
 * @param {string} endereco.complement - Complemento (apartamento, bloco, etc.)
 * @param {string} endereco.neighborhood - Bairro do endereço
 * @param {string} endereco.city - Cidade do endereço
 * @param {string} endereco.state - Estado/Província do endereço
 * @param {string} endereco.zip_code - CEP/Código postal do endereço
 * @param {string} endereco.country - País do endereço (padrão: Brasil)
 * @returns {Promise<Object>} Dados do endereço criado
 */
export async function criarEndereco(endereco) {
  const response = await api.post('/addresses/', endereco)
  return response.data
}

/**
 * Função para atualizar um endereço existente
 * @param {number} id - ID do endereço a ser atualizado
 * @param {Object} endereco - Objeto com novos dados do endereço
 * @param {string} endereco.street - Nova rua/Avenida do endereço
 * @param {string} endereco.number - Novo número do endereço
 * @param {string} endereco.complement - Novo complemento
 * @param {string} endereco.neighborhood - Novo bairro do endereço
 * @param {string} endereco.city - Nova cidade do endereço
 * @param {string} endereco.state - Novo estado/Província do endereço
 * @param {string} endereco.zip_code - Novo CEP/Código postal do endereço
 * @param {string} endereco.country - Novo país do endereço
 * @returns {Promise<Object>} Dados do endereço atualizado
 */
export async function atualizarEndereco(id, endereco) {
  const response = await api.put(`/addresses/${id}`, endereco)
  return response.data
}

/**
 * Função para deletar um endereço existente
 * @param {number} id - ID do endereço a ser deletado
 * @returns {Promise<Object>} Resposta da API após exclusão
 */
export async function deletarEndereco(id) {
  const response = await api.delete(`/addresses/${id}`)
  return response.data
}

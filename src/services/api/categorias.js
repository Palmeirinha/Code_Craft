// Importação da instância configurada da API
import api from './configuracoes.js';

// ===== CATEGORIAS =====
// Este módulo contém todas as operações CRUD relacionadas às categorias de produtos
// Inclui listagem, criação, atualização, atualização de imagem e exclusão

/**
 * Função para listar todas as categorias disponíveis
 * @returns {Promise<Array>} Array com todas as categorias
 */
export async function listarCategorias() {
  const response = await api.get('/categories/')
  return response.data
}

/**
 * Função para listar categorias específicas de um usuário
 * @param {number} user_id - ID do usuário para buscar categorias
 * @returns {Promise<Array>} Array com categorias do usuário
 * @throws {Error} Erro em caso de falha na busca
 */
export async function listarCategoriasPorUsuario(user_id) {
  try {
    const response = await api.get(`/categories/user/${user_id}`)
    console.log(`API: Categorias do usuário ${user_id} carregadas:`, response.data.length)
    return response.data
  } catch (error) {
    console.error(`API: Erro ao carregar categorias do usuário ${user_id}:`, error)
    if (error.response) {
      console.error('API: Status:', error.response.status)
      console.error('API: Data:', error.response.data)
    }
    throw error
  }
}

/**
 * Função para criar uma nova categoria
 * @param {Object} categoria - Objeto com dados da categoria
 * @param {string} categoria.name - Nome da categoria (obrigatório)
 * @param {string} categoria.description - Descrição da categoria (opcional)
 * @param {File} categoria.image - Imagem da categoria (opcional)
 * @returns {Promise<Object>} Dados da categoria criada
 */
export async function criarCategoria({ name, description, image }) {
  // Cria FormData para envio de arquivos
  const formData = new FormData()
  formData.append('name', name)
  if (description) formData.append('description', description)
  if (image) formData.append('image', image)
  
  // Envia requisição POST com FormData para suportar upload de imagem
  const response = await api.post('/categories/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

/**
 * Função para atualizar dados básicos de uma categoria existente
 * @param {number} id - ID da categoria a ser atualizada
 * @param {Object} dados - Objeto com novos dados da categoria
 * @param {string} dados.name - Novo nome da categoria
 * @param {string} dados.description - Nova descrição da categoria
 * @returns {Promise<Object>} Dados da categoria atualizada
 */
export async function atualizarCategoria(id, { name, description }) {
  const response = await api.put(`/categories/${id}`, { name, description })
  return response.data
}

/**
 * Função para atualizar apenas a imagem de uma categoria
 * @param {number} id - ID da categoria para atualizar imagem
 * @param {File} image - Nova imagem da categoria
 * @returns {Promise<Object>} Dados da categoria com imagem atualizada
 */
export async function atualizarImagemCategoria(id, image) {
  // Cria FormData para envio do arquivo de imagem
  const formData = new FormData()
  formData.append('image', image)
  
  // Envia requisição PUT específica para atualização de imagem
  const response = await api.put(`/categories/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

/**
 * Função para deletar uma categoria existente
 * @param {number} id - ID da categoria a ser deletada
 * @returns {Promise<Object>} Resposta da API após exclusão
 */
export async function deletarCategoria(id) {
  const response = await api.delete(`/categories/${id}`)
  return response.data
}

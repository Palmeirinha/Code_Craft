// Importação da instância configurada da API
import api from './configuracoes.js';

// ===== USUÁRIOS =====
// Este módulo contém todas as operações relacionadas aos usuários do sistema
// Inclui operações pessoais (meu perfil) e administrativas (listagem, criação de moderadores)

/**
 * Função para obter dados do usuário autenticado
 * Retorna informações do perfil do usuário logado
 * @returns {Promise<Object>} Dados do usuário autenticado
 * @throws {Error} Erro em caso de falha na autenticação ou usuário não encontrado
 */
export async function getUserMe() {
  const response = await api.get('/users/me')
  return response.data
}

/**
 * Função para atualizar dados do usuário autenticado
 * Permite que o usuário modifique seu próprio perfil
 * @param {Object} dados - Novos dados do usuário
 * @param {string} dados.name - Novo nome do usuário (opcional)
 * @param {string} dados.email - Novo email do usuário (opcional)
 * @param {string} dados.password - Nova senha do usuário (opcional)
 * @param {string} dados.phone - Novo telefone do usuário (opcional)
 * @param {string} dados.birth_date - Nova data de nascimento (opcional)
 * @returns {Promise<Object>} Dados do usuário atualizado
 * @throws {Error} Erro em caso de falha na atualização ou dados inválidos
 */
export async function putUserMe(dados) {
  const response = await api.put('/users/me', dados)
  return response.data
}

/**
 * Função para deletar a conta do usuário autenticado
 * Remove permanentemente o usuário e todos os seus dados
 * @returns {Promise<Object>} Resposta da API após exclusão
 * @throws {Error} Erro em caso de falha na exclusão ou usuário não encontrado
 */
export async function deleteUserMe() {
  const response = await api.delete('/users/me')
  return response.data
}

/**
 * Função para fazer upload da imagem de perfil do usuário
 * Permite que o usuário altere sua foto de perfil
 * @param {File} file - Arquivo de imagem para upload
 * @returns {Promise<Object>} Dados do usuário com nova imagem
 * @throws {Error} Erro em caso de falha no upload ou arquivo inválido
 */
export async function uploadUserImage(file) {
  // Cria FormData para envio do arquivo de imagem
  const formData = new FormData()
  formData.append('image', file)
  
  // Envia requisição PUT com FormData para suportar upload de arquivo
  const response = await api.put('/users/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

/**
 * Função para listar todos os usuários do sistema
 * Acesso administrativo - lista todos os usuários registrados
 * @returns {Promise<Array>} Array com todos os usuários do sistema
 * @throws {Error} Erro em caso de falha na busca ou sem permissão administrativa
 */
export async function listarUsuarios() {
  const response = await api.get('/users/')
  return response.data
}

/**
 * Função para criar um novo usuário moderador
 * Acesso administrativo - permite criar usuários com papel de moderador
 * @param {Object} dados - Dados do novo moderador
 * @param {string} dados.name - Nome completo do moderador
 * @param {string} dados.email - Email único do moderador
 * @param {string} dados.password - Senha do moderador
 * @returns {Promise<Object>} Dados do moderador criado
 * @throws {Error} Erro em caso de falha na criação ou dados inválidos
 */
export async function criarModerador({ name, email, password }) {
  const response = await api.post('/users/create-moderator', { 
    name, 
    email, 
    password, 
    role: 'MODERATOR'  // Define automaticamente o papel como moderador
  })
  return response.data
}

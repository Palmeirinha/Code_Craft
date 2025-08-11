// Importação da instância configurada da API
import api from './configuracoes.js';

// ===== PEDIDOS =====
// Este módulo contém todas as operações relacionadas aos pedidos do sistema
// Inclui listagem (todos, por admin, por usuário), criação, atualização de status e cancelamento

/**
 * Função para listar todos os pedidos do sistema (acesso administrativo)
 * Retorna todos os pedidos de todos os usuários para fins de administração
 * @returns {Promise<Array>} Array com todos os pedidos do sistema
 * @throws {Error} Erro em caso de falha na busca
 */
export async function listarTodosPedidos() {
  try {
    const response = await api.get('/orders/all')
    console.log('API: Pedidos carregados com sucesso:', response.data.length)
    return response.data
  } catch (error) {
    console.error('API: Erro ao carregar pedidos:', error)
    if (error.response) {
      console.error('API: Status:', error.response.status)
      console.error('API: Data:', error.response.data)
    }
    throw error
  }
}

/**
 * Função para listar pedidos específicos de um administrador
 * Permite que admins vejam apenas os pedidos relacionados ao seu contexto
 * @param {number} admin_id - ID do administrador para filtrar pedidos
 * @returns {Promise<Array>} Array com pedidos do administrador específico
 * @throws {Error} Erro em caso de falha na busca
 */
export async function listarPedidosPorAdmin(admin_id) {
  try {
    const response = await api.get(`/orders/all/${admin_id}`)
    console.log(`API: Pedidos do admin ${admin_id} carregados:`, response.data.length)
    return response.data
  } catch (error) {
    console.error(`API: Erro ao carregar pedidos do admin ${admin_id}:`, error)
    if (error.response) {
      console.error('API: Status:', error.response.status)
      console.error('API: Data:', error.response.data)
    }
    throw error
  }
}

/**
 * Função para listar pedidos do usuário autenticado
 * Retorna apenas os pedidos do usuário logado
 * Em caso de erro, retorna array vazio para não quebrar a interface
 * @returns {Promise<Array>} Array com pedidos do usuário ou array vazio em caso de erro
 */
export async function listarPedidosUsuario() {
  try {
    const response = await api.get('/orders/')
    console.log('API: Pedidos do usuário carregados:', response.data.length)
    return response.data
  } catch (error) {
    console.error('API: Erro ao carregar pedidos do usuário:', error)
    if (error.response) {
      console.error('API: Status:', error.response.status)
      console.error('API: Data:', error.response.data)
    }
    // Em caso de erro, retornar array vazio
    // Isso evita que a interface quebre e permite fallback para estado vazio
    return []
  }
}

/**
 * Função para criar um novo pedido
 * Cria um pedido baseado no carrinho atual do usuário
 * @param {number} address_id - ID do endereço de entrega selecionado
 * @param {number|null} coupon_id - ID do cupom aplicado (opcional)
 * @returns {Promise<Object>} Dados do pedido criado
 * @throws {Error} Erro em caso de falha na criação
 */
export async function criarPedido(address_id, coupon_id = null) {
  try {
    // Prepara o payload com dados obrigatórios e opcionais
    const payload = { address_id }
    if (coupon_id) payload.coupon_id = coupon_id
    
    console.log('API: Criando pedido com payload:', payload)
    const response = await api.post('/orders/', payload)
    console.log('API: Pedido criado com sucesso:', response.data)
    return response.data
  } catch (error) {
    console.error('API: Erro ao criar pedido:', error)
    if (error.response) {
      console.error('API: Status:', error.response.status)
      console.error('API: Data:', error.response.data)
    }
    throw error
  }
}

/**
 * Função para atualizar o status de um pedido existente
 * Permite que administradores alterem o status (pendente, aprovado, enviado, entregue, etc.)
 * @param {number} order_id - ID do pedido a ser atualizado
 * @param {string} status - Novo status do pedido
 * @returns {Promise<Object>} Dados do pedido com status atualizado
 * @throws {Error} Erro em caso de falha na atualização
 */
export async function atualizarStatusPedido(order_id, status) {
  try {
    console.log(`API: Atualizando status do pedido ${order_id} para ${status}`)
    const response = await api.put(`/orders/${order_id}`, { status })
    console.log('API: Status do pedido atualizado com sucesso:', response.data)
    return response.data
  } catch (error) {
    console.error(`API: Erro ao atualizar status do pedido ${order_id}:`, error)
    if (error.response) {
      console.error('API: Status:', error.response.status)
      console.error('API: Data:', error.response.data)
    }
    throw error
  }
}

/**
 * Função para cancelar um pedido existente
 * Permite que usuários ou administradores cancelem pedidos
 * @param {number} order_id - ID do pedido a ser cancelado
 * @returns {Promise<Object>} Resposta da API após cancelamento
 * @throws {Error} Erro em caso de falha no cancelamento
 */
export async function cancelarPedido(order_id) {
  try {
    console.log(`API: Cancelando pedido ${order_id}`)
    const response = await api.delete(`/orders/${order_id}`)
    console.log('API: Pedido cancelado com sucesso')
    return response.data
  } catch (error) {
    console.error(`API: Erro ao cancelar pedido ${order_id}:`, error)
    if (error.response) {
      console.error('API: Status:', error.response.status)
      console.error('API: Data:', error.response.data)
    }
    throw error
  }
}

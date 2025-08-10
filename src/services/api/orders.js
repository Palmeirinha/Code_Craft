import api from './config.js';

// ===== PEDIDOS =====
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
    return []
  }
}

export async function criarPedido(address_id, coupon_id = null) {
  try {
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

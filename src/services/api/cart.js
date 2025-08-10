import api from './config.js';

// ===== CARRINHO =====
export async function buscarCarrinho() {
  try {
    const response = await api.get('/cart/items')
    return response.data
  } catch (error) {
    // Se o carrinho não existe (404), criar um novo
    if (error.response?.status === 404) {
      try {
        // Criar o carrinho
        await api.post('/cart/')
        
        // Buscar o carrinho criado
        const response = await api.get('/cart/items')
        return response.data
      } catch (createError) {
        // Se falhar ao criar, retornar carrinho vazio
        return { items: [], total_amount: 0 }
      }
    }
    // Em caso de qualquer erro, retornar carrinho vazio
    return { items: [], total_amount: 0 }
  }
}

export async function atualizarCarrinho(produtos) {
  try {
    console.log('API: Atualizando carrinho com produtos:', produtos.length)
    
    // Primeiro, limpar o carrinho
    await api.delete('/cart/clear')
    console.log('API: Carrinho limpo')
    
    // Depois, adicionar cada produto individualmente
    for (const produto of produtos) {
      const item = {
        product_id: produto.id,
        quantity: 1,
        unit_price: produto.price
      }
      console.log('API: Adicionando produto ao carrinho:', item)
      await api.post('/cart/items', item)
    }
    
    // Retornar o carrinho atualizado
    const response = await api.get('/cart/items')
    console.log('API: Carrinho atualizado com sucesso:', response.data)
    return response.data
  } catch (error) {
    console.error('API: Erro ao atualizar carrinho:', error)
    if (error.response) {
      console.error('API: Status:', error.response.status)
      console.error('API: Data:', error.response.data)
    }
    throw error
  }
}

export async function removerCarrinho() {
  const response = await api.delete('/cart/clear')
  return response.data
}

export async function adicionarItemCarrinho(product_id, quantity = 1, unit_price) {
  try {
    const response = await api.post('/cart/items', {
      product_id,
      quantity,
      unit_price
    })
    return response.data
  } catch (error) {
    // Se o carrinho não existe (404), criar primeiro e depois adicionar
    if (error.response?.status === 404) {
      try {
        await api.post('/cart/')
        const response = await api.post('/cart/items', {
          product_id,
          quantity,
          unit_price
        })
        return response.data
      } catch (createError) {
        throw createError
      }
    }
    throw error
  }
}

export async function removerItemCarrinho(product_id) {
  const response = await api.delete('/cart/items', {
    data: { product_id }
  })
  return response.data
}

export async function atualizarQuantidadeItem(product_id, quantity) {
  const response = await api.put('/cart/items', {
    product_id,
    quantity
  })
  return response.data
}

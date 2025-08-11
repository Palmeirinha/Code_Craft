// Importação da instância configurada da API
import api from './configuracoes.js';

// ===== CARRINHO =====
// Este módulo contém todas as operações relacionadas ao carrinho de compras
// Inclui busca, criação, atualização, adição/remoção de itens e limpeza

/**
 * Função para buscar o carrinho atual do usuário
 * Se o carrinho não existir, cria um novo automaticamente
 * @returns {Promise<Object>} Dados do carrinho (items, total_amount)
 */
export async function buscarCarrinho() {
  try {
    // Tenta buscar o carrinho existente
    const response = await api.get('/cart/items')
    return response.data
  } catch (error) {
    // Se o carrinho não existe (404), criar um novo
    if (error.response?.status === 404) {
      try {
        // Criar o carrinho vazio na API
        await api.post('/cart/')
        
        // Buscar o carrinho recém-criado
        const response = await api.get('/cart/items')
        return response.data
      } catch (createError) {
        // Se falhar ao criar, retornar carrinho vazio local
        return { items: [], total_amount: 0 }
      }
    }
    // Em caso de qualquer outro erro, retornar carrinho vazio
    return { items: [], total_amount: 0 }
  }
}

/**
 * Função para atualizar completamente o carrinho
 * Primeiro limpa o carrinho atual, depois adiciona os novos produtos
 * @param {Array} produtos - Array de produtos para adicionar ao carrinho
 * @returns {Promise<Object>} Dados do carrinho atualizado
 * @throws {Error} Erro em caso de falha na atualização
 */
export async function atualizarCarrinho(produtos) {
  try {
    console.log('API: Atualizando carrinho com produtos:', produtos.length)
    
    // Primeiro, limpar o carrinho existente
    await api.delete('/cart/clear')
    console.log('API: Carrinho limpo')
    
    // Depois, adicionar cada produto individualmente
    for (const produto of produtos) {
      const item = {
        product_id: produto.id,        // ID do produto
        quantity: 1,                   // Quantidade (padrão: 1)
        unit_price: produto.price     // Preço unitário do produto
      }
      console.log('API: Adicionando produto ao carrinho:', item)
      await api.post('/cart/items', item)
    }
    
    // Retornar o carrinho atualizado após todas as operações
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

/**
 * Função para remover completamente o carrinho
 * Limpa todos os itens e zera o total
 * @returns {Promise<Object>} Resposta da API após limpeza
 */
export async function removerCarrinho() {
  const response = await api.delete('/cart/clear')
  return response.data
}

/**
 * Função para adicionar um item específico ao carrinho
 * Se o carrinho não existir, cria um novo automaticamente
 * @param {number} product_id - ID do produto a ser adicionado
 * @param {number} quantity - Quantidade do produto (padrão: 1)
 * @param {number} unit_price - Preço unitário do produto
 * @returns {Promise<Object>} Dados do item adicionado
 * @throws {Error} Erro em caso de falha na adição
 */
export async function adicionarItemCarrinho(product_id, quantity = 1, unit_price) {
  try {
    // Tenta adicionar o item ao carrinho existente
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
        // Criar carrinho vazio
        await api.post('/cart/')
        // Adicionar o item ao carrinho recém-criado
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

/**
 * Função para remover um item específico do carrinho
 * Remove o produto pelo ID, independente da quantidade
 * @param {number} product_id - ID do produto a ser removido
 * @returns {Promise<Object>} Resposta da API após remoção
 */
export async function removerItemCarrinho(product_id) {
  const response = await api.delete('/cart/items', {
    data: { product_id }  // Envia o ID no corpo da requisição DELETE
  })
  return response.data
}

/**
 * Função para atualizar a quantidade de um item específico
 * Modifica apenas a quantidade, mantendo o produto e preço
 * @param {number} product_id - ID do produto a ser atualizado
 * @param {number} quantity - Nova quantidade desejada
 * @returns {Promise<Object>} Dados do item atualizado
 */
export async function atualizarQuantidadeItem(product_id, quantity) {
  const response = await api.put('/cart/items', {
    product_id,
    quantity
  })
  return response.data
}

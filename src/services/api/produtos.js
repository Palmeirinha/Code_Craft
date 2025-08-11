import api from './configuracoes.js';
import { listarDescontos } from './promocoes.js';

export async function listarProdutos() {
  const response = await api.get('/products/')
  return response.data
}

export async function criarProduto(produto) {
  const headers = {}
  if (produto instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data'
  }
  const response = await api.post('/products/', produto, { headers })
  return response.data
}

export async function editarProduto(id, produto, imagemFile = null) {
  try {
    if (imagemFile) {
      const formData = new FormData()
      formData.append('image', imagemFile)
      const response = await api.put(`/products/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } else {
      const payload = {
        name: produto.name,
        price: produto.price,
        category_id: produto.category_id,
        description: produto.description || ''
      }
      const response = await api.put(`/products/${id}`, payload)
      return response.data
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    if (error.response?.status === 403) {
      throw new Error('Você não tem permissão para editar produtos.')
    }
    if (error.response?.status === 404) {
      throw new Error('Produto não encontrado.')
    }
    if (error.response?.status === 400 || error.response?.status === 422) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message
      throw new Error(errorMessage)
    }
    throw error
  }
}

export async function removerProduto(id) {
  try {
    const response = await api.delete(`/products/${id}`)
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    if (error.response?.status === 403) {
      throw new Error('Você não tem permissão para excluir produtos.')
    }
    if (error.response?.status === 404) {
      throw new Error('Produto não encontrado.')
    }
    if (error.response?.status === 400 || error.response?.status === 422) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('order_items')) {
        throw new Error('Este produto não pode ser excluído porque está sendo usado em pedidos. Considere desativar o produto em vez de excluí-lo.')
      }
    }
    throw error
  }
}

export async function atualizarEstoqueProduto(id, stock) {
  try {
    const response = await api.put(`/products/${id}/stock`, { stock })
    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    if (error.response?.status === 403) {
      throw new Error('Você não tem permissão para atualizar estoque.')
    }
    if (error.response?.status === 404) {
      throw new Error('Produto não encontrado.')
    }
    if (error.response?.status === 400 || error.response?.data?.status === 422) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message
      throw new Error(errorMessage)
    }
    throw error
  }
}

export async function listarProdutosComDescontos() {
  try {
    const [produtos, descontos] = await Promise.all([
      listarProdutos(),
      listarDescontos()
    ])
    
    const produtosComDescontos = produtos.map(produto => {
      const descontoAtivo = descontos.find(desconto => 
        desconto.product_id === produto.id && 
        isDescontoAtivo(desconto)
      )
      
      if (descontoAtivo) {
        return {
          ...produto,
          desconto: {
            id: descontoAtivo.id,
            percentage: descontoAtivo.discount_percentage,
            description: descontoAtivo.description,
            start_date: descontoAtivo.start_date,
            end_date: descontoAtivo.end_date
          },
          precoOriginal: produto.price,
          precoComDesconto: calcularPrecoComDesconto(produto.price, descontoAtivo.discount_percentage)
        }
      }
      
      return produto
    })
    
    return produtosComDescontos
  } catch (error) {
    console.error('Erro ao buscar produtos com descontos:', error)
    return await listarProdutos()
  }
}

function isDescontoAtivo(desconto) {
  const now = new Date()
  const startDate = new Date(desconto.start_date)
  const endDate = new Date(desconto.end_date)
  
  return now >= startDate && now <= endDate
}

function calcularPrecoComDesconto(preco, percentualDesconto) {
  const desconto = preco * (percentualDesconto / 100)
  return Math.max(0, preco - desconto)
}

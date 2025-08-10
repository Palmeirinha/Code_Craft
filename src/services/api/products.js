import api from './config.js';
import { listarDescontos } from './promotions.js';

// ===== PRODUTOS =====
export async function listarProdutos() {
  const response = await api.get('/products/')
  return response.data
}

export async function criarProduto(produto) {
  const headers = {}
  // Se for FormData, adiciona o header correto
  if (produto instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data'
  }
  const response = await api.post('/products/', produto, { headers })
  return response.data
}

export async function editarProduto(id, produto, imagemFile = null) {
  try {
    // Se for atualizar a imagem
    if (imagemFile) {
      const formData = new FormData()
      formData.append('image', imagemFile)
      const response = await api.put(`/products/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      return response.data
    } else {
      // Atualização normal (JSON) - apenas os campos permitidos pela API
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
    // Se for erro de autenticação
    if (error.response?.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    // Se for erro de permissão
    if (error.response?.status === 403) {
      throw new Error('Você não tem permissão para editar produtos.')
    }
    // Se o produto não for encontrado
    if (error.response?.status === 404) {
      throw new Error('Produto não encontrado.')
    }
    // Se for erro de validação
    if (error.response?.status === 400 || error.response?.status === 422) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message
      throw new Error(errorMessage)
    }
    throw error
  }
}

export async function removerProduto(id) {
  try {
    // De acordo com a documentação da API: DELETE /products/{product_id}
    const response = await api.delete(`/products/${id}`)
    return response.data
  } catch (error) {
    // Se for erro de autenticação
    if (error.response?.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    // Se for erro de permissão
    if (error.response?.status === 403) {
      throw new Error('Você não tem permissão para excluir produtos.')
    }
    // Se o produto não for encontrado
    if (error.response?.status === 404) {
      throw new Error('Produto não encontrado.')
    }
    // Se for erro de constraint de chave estrangeira
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
    // Se for erro de autenticação
    if (error.response?.status === 401) {
      throw new Error('Sessão expirada. Faça login novamente.')
    }
    // Se for erro de permissão
    if (error.response?.status === 403) {
      throw new Error('Você não tem permissão para atualizar estoque.')
    }
    // Se o produto não for encontrado
    if (error.response?.status === 404) {
      throw new Error('Produto não encontrado.')
    }
    // Se for erro de validação
    if (error.response?.status === 400 || error.response?.data?.status === 422) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message
      throw new Error(errorMessage)
    }
    throw error
  }
}

// ===== PRODUTOS COM DESCONTOS =====
export async function listarProdutosComDescontos() {
  try {
    // Buscar produtos e descontos em paralelo
    const [produtos, descontos] = await Promise.all([
      listarProdutos(),
      listarDescontos()
    ])
    
    // Aplicar descontos aos produtos
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
    // Em caso de erro, retorna produtos sem descontos
    return await listarProdutos()
  }
}

// Função auxiliar para verificar se um desconto está ativo
function isDescontoAtivo(desconto) {
  const now = new Date()
  const startDate = new Date(desconto.start_date)
  const endDate = new Date(desconto.end_date)
  
  return now >= startDate && now <= endDate
}

// Função auxiliar para calcular preço com desconto
function calcularPrecoComDesconto(preco, percentualDesconto) {
  const desconto = preco * (percentualDesconto / 100)
  return Math.max(0, preco - desconto)
}

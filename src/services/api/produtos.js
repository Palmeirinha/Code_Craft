// Importação da instância configurada da API
import api from './configuracoes.js';
// Importação da função para buscar descontos ativos
import { listarDescontos } from './promocoes.js';

// ===== PRODUTOS =====
// Este módulo contém todas as operações CRUD relacionadas aos produtos do sistema
// Inclui listagem, criação, edição, remoção, atualização de estoque e integração com descontos

/**
 * Função para listar todos os produtos disponíveis no sistema
 * @returns {Promise<Array>} Array com todos os produtos
 */
export async function listarProdutos() {
  const response = await api.get('/products/')
  return response.data
}

/**
 * Função para criar um novo produto no sistema
 * Suporta tanto dados JSON quanto FormData para upload de imagem
 * @param {Object|FormData} produto - Dados do produto ou FormData com imagem
 * @returns {Promise<Object>} Dados do produto criado
 */
export async function criarProduto(produto) {
  const headers = {}
  // Se for FormData, adiciona o header correto para upload de arquivo
  if (produto instanceof FormData) {
    headers['Content-Type'] = 'multipart/form-data'
  }
  const response = await api.post('/products/', produto, { headers })
  return response.data
}

/**
 * Função para editar um produto existente
 * Suporta atualização de dados básicos ou apenas da imagem
 * @param {number} id - ID do produto a ser editado
 * @param {Object} produto - Novos dados do produto
 * @param {File|null} imagemFile - Arquivo de imagem para atualização (opcional)
 * @returns {Promise<Object>} Dados do produto atualizado
 * @throws {Error} Erro personalizado baseado no status da resposta
 */
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

/**
 * Função para remover um produto do sistema
 * Verifica se o produto pode ser excluído (não está em uso)
 * @param {number} id - ID do produto a ser removido
 * @returns {Promise<Object>} Resposta da API após remoção
 * @throws {Error} Erro personalizado baseado no status da resposta
 */
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

/**
 * Função para atualizar o estoque de um produto
 * Permite ajustar a quantidade disponível em estoque
 * @param {number} id - ID do produto para atualizar estoque
 * @param {number} stock - Nova quantidade em estoque
 * @returns {Promise<Object>} Dados do produto com estoque atualizado
 * @throws {Error} Erro personalizado baseado no status da resposta
 */
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
// Seção especializada para produtos que possuem descontos ativos
// Combina dados de produtos com informações de descontos para exibição

/**
 * Função para listar produtos com descontos ativos aplicados
 * Combina dados de produtos com descontos e calcula preços finais
 * @returns {Promise<Array>} Array com produtos e informações de desconto
 */
export async function listarProdutosComDescontos() {
  try {
    // Buscar produtos e descontos em paralelo para otimizar performance
    const [produtos, descontos] = await Promise.all([
      listarProdutos(),
      listarDescontos()
    ])
    
    // Aplicar descontos aos produtos que possuem desconto ativo
    const produtosComDescontos = produtos.map(produto => {
      // Busca desconto ativo para este produto específico
      const descontoAtivo = descontos.find(desconto => 
        desconto.product_id === produto.id && 
        isDescontoAtivo(desconto)
      )
      
      // Se encontrou desconto ativo, aplica as informações
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
      
      // Se não tem desconto, retorna produto sem modificações
      return produto
    })
    
    return produtosComDescontos
  } catch (error) {
    console.error('Erro ao buscar produtos com descontos:', error)
    // Em caso de erro, retorna produtos sem descontos como fallback
    // Isso garante que a interface continue funcionando mesmo com falha nos descontos
    return await listarProdutos()
  }
}

// ===== FUNÇÕES AUXILIARES =====
// Funções internas para suporte às operações principais

/**
 * Função auxiliar para verificar se um desconto está ativo
 * Verifica se a data atual está dentro do período de validade do desconto
 * @param {Object} desconto - Objeto com dados do desconto
 * @param {string} desconto.start_date - Data de início do desconto
 * @param {string} desconto.end_date - Data de fim do desconto
 * @returns {boolean} True se o desconto estiver ativo, False caso contrário
 */
function isDescontoAtivo(desconto) {
  const now = new Date()
  const startDate = new Date(desconto.start_date)
  const endDate = new Date(desconto.end_date)
  
  // Verifica se a data atual está entre início e fim do desconto
  return now >= startDate && now <= endDate
}

/**
 * Função auxiliar para calcular preço com desconto aplicado
 * Calcula o preço final após aplicar o percentual de desconto
 * @param {number} preco - Preço original do produto
 * @param {number} percentualDesconto - Percentual de desconto (ex: 15 para 15%)
 * @returns {number} Preço final com desconto aplicado (mínimo 0)
 */
function calcularPrecoComDesconto(preco, percentualDesconto) {
  const desconto = preco * (percentualDesconto / 100)
  // Garante que o preço não seja negativo
  return Math.max(0, preco - desconto)
}

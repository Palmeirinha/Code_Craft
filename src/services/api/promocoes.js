// Importação da instância configurada da API
import api from './configuracoes.js';

// ===== DESCONTOS =====
// Este módulo contém todas as operações CRUD relacionadas aos descontos de produtos
// Os descontos são aplicados automaticamente aos produtos durante a listagem

/**
 * Função para listar todos os descontos disponíveis no sistema
 * @returns {Promise<Array>} Array com todos os descontos ativos e inativos
 */
export async function listarDescontos() {
  const response = await api.get('/discounts/')
  return response.data
}

/**
 * Função para criar um novo desconto no sistema
 * @param {Object} desconto - Objeto com dados do desconto
 * @param {number} desconto.product_id - ID do produto que receberá o desconto
 * @param {number} desconto.discount_percentage - Percentual de desconto (ex: 15 para 15%)
 * @param {string} desconto.description - Descrição do desconto
 * @param {string} desconto.start_date - Data de início do desconto (formato ISO)
 * @param {string} desconto.end_date - Data de fim do desconto (formato ISO)
 * @returns {Promise<Object>} Dados do desconto criado
 */
export async function criarDesconto(desconto) {
  const response = await api.post('/discounts/', desconto)
  return response.data
}

/**
 * Função para obter um desconto específico pelo ID
 * @param {number} id - ID do desconto a ser buscado
 * @returns {Promise<Object>} Dados do desconto encontrado
 */
export async function obterDesconto(id) {
  const response = await api.get(`/discounts/${id}`)
  return response.data
}

/**
 * Função para atualizar um desconto existente
 * @param {number} id - ID do desconto a ser atualizado
 * @param {Object} desconto - Novos dados do desconto
 * @param {number} desconto.product_id - Novo ID do produto (opcional)
 * @param {number} desconto.discount_percentage - Novo percentual de desconto (opcional)
 * @param {string} desconto.description - Nova descrição do desconto (opcional)
 * @param {string} desconto.start_date - Nova data de início (opcional)
 * @param {string} desconto.end_date - Nova data de fim (opcional)
 * @returns {Promise<Object>} Dados do desconto atualizado
 */
export async function atualizarDesconto(id, desconto) {
  const response = await api.put(`/discounts/${id}`, desconto)
  return response.data
}

/**
 * Função para excluir um desconto do sistema
 * @param {number} id - ID do desconto a ser excluído
 * @returns {Promise<Object>} Resposta da API após exclusão
 */
export async function excluirDesconto(id) {
  const response = await api.delete(`/discounts/${id}`)
  return response.data
}

// ===== CUPONS =====
// Este módulo também gerencia cupons de desconto para aplicação em pedidos
// Os cupons são diferentes dos descontos - são aplicados no momento da compra

/**
 * Função para buscar um cupom específico pelo ID
 * @param {number} coupon_id - ID do cupom a ser buscado
 * @returns {Promise<Object>} Dados do cupom encontrado
 */
export async function getCupomById(coupon_id) {
  const response = await api.get(`/coupons/${coupon_id}`)
  return response.data
}

/**
 * Função para atualizar um cupom existente
 * @param {number} coupon_id - ID do cupom a ser atualizado
 * @param {Object} dados - Novos dados do cupom
 * @param {string} dados.code - Novo código do cupom (opcional)
 * @param {number} dados.discount_percentage - Novo percentual de desconto (opcional)
 * @param {string} dados.description - Nova descrição do cupom (opcional)
 * @param {string} dados.start_date - Nova data de início (opcional)
 * @param {string} dados.end_date - Nova data de fim (opcional)
 * @param {number} dados.minimum_order_value - Novo valor mínimo do pedido (opcional)
 * @param {number} dados.maximum_uses - Novo número máximo de usos (opcional)
 * @returns {Promise<Object>} Dados do cupom atualizado
 */
export async function atualizarCupom(coupon_id, dados) {
  const response = await api.put(`/coupons/${coupon_id}`, dados)
  return response.data
}

/**
 * Função para deletar um cupom do sistema
 * @param {number} coupon_id - ID do cupom a ser deletado
 * @returns {Promise<Object>} Resposta da API após exclusão
 */
export async function deletarCupom(coupon_id) {
  const response = await api.delete(`/coupons/${coupon_id}`)
  return response.data
}

/**
 * Função para listar todos os cupons disponíveis no sistema
 * @returns {Promise<Array>} Array com todos os cupons ativos e inativos
 */
export async function listarCupons() {
  const response = await api.get('/coupons/')
  return response.data
}

/**
 * Função para criar um novo cupom no sistema
 * @param {Object} cupom - Objeto com dados do cupom
 * @param {string} cupom.code - Código único do cupom (ex: "DESCONTO20")
 * @param {number} cupom.discount_percentage - Percentual de desconto (ex: 20 para 20%)
 * @param {string} cupom.description - Descrição do cupom
 * @param {string} cupom.start_date - Data de início de validade (formato ISO)
 * @param {string} cupom.end_date - Data de fim de validade (formato ISO)
 * @param {number} cupom.minimum_order_value - Valor mínimo do pedido para aplicar o cupom
 * @param {number} cupom.maximum_uses - Número máximo de vezes que o cupom pode ser usado
 * @returns {Promise<Object>} Dados do cupom criado
 */
export async function criarCupom(cupom) {
  const response = await api.post('/coupons/', cupom)
  return response.data
}

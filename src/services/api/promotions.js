import api from './config.js';

// ===== DESCONTOS =====
export async function listarDescontos() {
  const response = await api.get('/discounts/')
  return response.data
}

export async function criarDesconto(desconto) {
  const response = await api.post('/discounts/', desconto)
  return response.data
}

export async function obterDesconto(id) {
  const response = await api.get(`/discounts/${id}`)
  return response.data
}

export async function atualizarDesconto(id, desconto) {
  const response = await api.put(`/discounts/${id}`, desconto)
  return response.data
}

export async function excluirDesconto(id) {
  const response = await api.delete(`/discounts/${id}`)
  return response.data
}

// ===== CUPONS =====
export async function getCupomById(coupon_id) {
  const response = await api.get(`/coupons/${coupon_id}`)
  return response.data
}

export async function atualizarCupom(coupon_id, dados) {
  const response = await api.put(`/coupons/${coupon_id}`, dados)
  return response.data
}

export async function deletarCupom(coupon_id) {
  const response = await api.delete(`/coupons/${coupon_id}`)
  return response.data
}

export async function listarCupons() {
  const response = await api.get('/coupons/')
  return response.data
}

export async function criarCupom(cupom) {
  const response = await api.post('/coupons/', cupom)
  return response.data
}

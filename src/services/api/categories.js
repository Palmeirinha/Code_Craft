import api from './config.js';

// ===== CATEGORIAS =====
export async function listarCategorias() {
  const response = await api.get('/categories/')
  return response.data
}

export async function listarCategoriasPorUsuario(user_id) {
  try {
    const response = await api.get(`/categories/user/${user_id}`)
    console.log(`API: Categorias do usuário ${user_id} carregadas:`, response.data.length)
    return response.data
  } catch (error) {
    console.error(`API: Erro ao carregar categorias do usuário ${user_id}:`, error)
    if (error.response) {
      console.error('API: Status:', error.response.status)
      console.error('API: Data:', error.response.data)
    }
    throw error
  }
}

export async function criarCategoria({ name, description, image }) {
  const formData = new FormData()
  formData.append('name', name)
  if (description) formData.append('description', description)
  if (image) formData.append('image', image)
  
  const response = await api.post('/categories/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export async function atualizarCategoria(id, { name, description }) {
  const response = await api.put(`/categories/${id}`, { name, description })
  return response.data
}

export async function atualizarImagemCategoria(id, image) {
  const formData = new FormData()
  formData.append('image', image)
  
  const response = await api.put(`/categories/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export async function deletarCategoria(id) {
  const response = await api.delete(`/categories/${id}`)
  return response.data
}

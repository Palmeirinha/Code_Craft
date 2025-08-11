import api from './configuracoes.js';

export async function getUserMe() {
  const response = await api.get('/users/me')
  return response.data
}

export async function putUserMe(dados) {
  const response = await api.put('/users/me', dados)
  return response.data
}

export async function deleteUserMe() {
  const response = await api.delete('/users/me')
  return response.data
}

export async function uploadUserImage(file) {
  const formData = new FormData()
  formData.append('image', file)
  
  const response = await api.put('/users/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export async function listarUsuarios() {
  const response = await api.get('/users/')
  return response.data
}

export async function criarModerador({ name, email, password }) {
  const response = await api.post('/users/create-moderator', { 
    name, 
    email, 
    password, 
    role: 'MODERATOR'
  })
  return response.data
}

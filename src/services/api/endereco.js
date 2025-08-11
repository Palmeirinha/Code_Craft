import api from './configuracoes.js';

export async function listarEnderecos() {
  const response = await api.get('/addresses/')
  return response.data
}

export async function criarEndereco(endereco) {
  const response = await api.post('/addresses/', endereco)
  return response.data
}

export async function atualizarEndereco(id, endereco) {
  const response = await api.put(`/addresses/${id}`, endereco)
  return response.data
}

export async function deletarEndereco(id) {
  try {
    console.log(`Tentando deletar endereço ${id}...`)
    
    const response = await api.delete(`/addresses/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log(`Endereço ${id} deletado com sucesso:`, response.status)
    return response.data
  } catch (error) {
    console.error(`Erro ao deletar endereço ${id}:`, error)
    
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Dados:', error.response.data)
      console.error('Headers:', error.response.headers)
    } else if (error.request) {
      console.error('Erro na requisição:', error.request)
    } else {
      console.error('Erro geral:', error.message)
    }
    
    throw error
  }
}

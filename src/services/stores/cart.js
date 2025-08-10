import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useUserStore } from './auth'
import { buscarCarrinho, atualizarCarrinho, removerCarrinho, adicionarItemCarrinho, removerItemCarrinho } from '../api/cart'
import { API_CONFIG } from '../api/config.js'

export const useCartStore = defineStore('cart', () => {
  const produtos = ref([])
  const total = ref(0)
  const carregando = ref(false)

  // Obtém o id do usuário logado
  const userStore = useUserStore()
  
  // Função para processar URLs de imagens
  function processarImagem(imagePath) {
    if (!imagePath) return ''
    if (imagePath.startsWith('http')) return imagePath
    if (imagePath.startsWith('data:')) return imagePath // Para SVGs inline
    const fullPath = API_CONFIG.BASE_URL + imagePath
    console.log('Processando imagem:', { original: imagePath, full: fullPath })
    return fullPath
  }
  
  function getCarrinhoKey() {
    const userId = userStore.user?.id || 'anonimo'
    return `carrinho_${userId}`
  }

  async function fetchCarrinho() {
    carregando.value = true
    try {
      // Se o usuário está autenticado, buscar da API
      if (userStore.isAuthenticated) {
        try {
          const carrinhoAPI = await buscarCarrinho()
          
          if (carrinhoAPI && carrinhoAPI.items && carrinhoAPI.items.length > 0) {
            // Converter itens do carrinho para o formato do frontend
            produtos.value = carrinhoAPI.items.map(item => ({
              id: item.product_id,
              name: item.name,
              price: parseFloat(item.unit_price),
              image_path: processarImagem(item.image_path || item.image || ''), // Processar imagem
              category: item.category || item.category_name || 'Sem categoria'
            }))
            total.value = carrinhoAPI.total_amount || carrinhoAPI.items.reduce((sum, item) => sum + parseFloat(item.unit_price), 0)
          } else {
            // Se não há produtos na API, usar localStorage
            const carrinhoSalvo = localStorage.getItem(getCarrinhoKey())
            if (carrinhoSalvo) {
              const produtosLocal = JSON.parse(carrinhoSalvo)
              produtos.value = produtosLocal
              total.value = produtosLocal.reduce((sum, produto) => sum + produto.price, 0)
              
              // Se há produtos no localStorage mas não na API, sincronizar
              if (produtosLocal.length > 0) {
                try {
                  await atualizarCarrinho(produtosLocal)
                } catch (syncError) {
                  // Erro silencioso na sincronização
                }
              }
            } else {
              produtos.value = []
              total.value = 0
            }
          }
        } catch (apiError) {
          // Fallback para localStorage
          const carrinhoSalvo = localStorage.getItem(getCarrinhoKey())
          if (carrinhoSalvo) {
            produtos.value = JSON.parse(carrinhoSalvo)
            total.value = produtos.value.reduce((sum, produto) => sum + produto.price, 0)
          } else {
            produtos.value = []
            total.value = 0
          }
        }
      } else {
        // Usuário não autenticado, usar localStorage
        const carrinhoSalvo = localStorage.getItem(getCarrinhoKey())
        if (carrinhoSalvo) {
          produtos.value = JSON.parse(carrinhoSalvo)
          total.value = produtos.value.reduce((sum, produto) => sum + produto.price, 0)
        } else {
          produtos.value = []
          total.value = 0
        }
      }
    } catch (error) {
      produtos.value = []
      total.value = 0
    } finally {
      carregando.value = false
    }
  }

  async function addProduto(produto) {
    try {
      // Processar a imagem para garantir URL completa
      const produtoProcessado = {
        ...produto,
        image_path: processarImagem(produto.image_path)
      }
      
      console.log('Produto adicionado ao carrinho:', {
        original: produto,
        processado: produtoProcessado,
        imagePath: produto.image_path,
        processedImagePath: produtoProcessado.image_path
      })
      
      const novosProdutos = [...produtos.value, produtoProcessado]
      
      // Se o usuário está autenticado, sincronizar com a API
      if (userStore.isAuthenticated) {
        try {
          await adicionarItemCarrinho(produto.id, 1, produto.price)
        } catch (apiError) {
          // Fallback para localStorage
          localStorage.setItem(getCarrinhoKey(), JSON.stringify(novosProdutos))
        }
      } else {
        // Usuário não autenticado, usar localStorage
        localStorage.setItem(getCarrinhoKey(), JSON.stringify(novosProdutos))
      }
      
      produtos.value = novosProdutos
      total.value = novosProdutos.reduce((sum, p) => sum + parseFloat(p.price), 0)
    } catch (error) {
      // Erro silencioso
    }
  }

  async function removeProduto(produtoId) {
    try {
      const novosProdutos = produtos.value.filter(p => p.id !== produtoId)
      
      // Se o usuário está autenticado, sincronizar com a API
      if (userStore.isAuthenticated) {
        try {
          await removerItemCarrinho(produtoId)
        } catch (apiError) {
          // Fallback para localStorage
          localStorage.setItem(getCarrinhoKey(), JSON.stringify(novosProdutos))
        }
      } else {
        // Usuário não autenticado, usar localStorage
        localStorage.setItem(getCarrinhoKey(), JSON.stringify(novosProdutos))
      }
      
      produtos.value = novosProdutos
      total.value = novosProdutos.reduce((sum, p) => sum + parseFloat(p.price), 0)
    } catch (error) {
      // Erro silencioso
    }
  }

  async function limparCarrinho() {
    try {
      produtos.value = []
      total.value = 0
      localStorage.removeItem(getCarrinhoKey())
      
      // Se o usuário está autenticado, limpar na API também
      if (userStore.isAuthenticated) {
        try {
          await removerCarrinho()
        } catch (apiError) {
          // Erro silencioso
        }
      }
    } catch (error) {
      // Erro silencioso
    }
  }

  function carregarCarrinhoLocal() {
    try {
      const carrinhoSalvo = localStorage.getItem(getCarrinhoKey())
      if (carrinhoSalvo) {
        produtos.value = JSON.parse(carrinhoSalvo)
        total.value = produtos.value.reduce((sum, p) => sum + p.price, 0)
      }
    } catch (error) {
      // Erro silencioso
    }
  }

  carregarCarrinhoLocal()

  async function sincronizarComAPI() {
    if (!userStore.isAuthenticated) return
    
    try {
      await atualizarCarrinho(produtos.value)
    } catch (error) {
      // Erro silencioso na sincronização
    }
  }

  return { 
    produtos, 
    total, 
    carregando, 
    fetchCarrinho, 
    addProduto, 
    removeProduto, 
    limparCarrinho,
    carregarCarrinhoLocal,
    sincronizarComAPI
  }
}) 
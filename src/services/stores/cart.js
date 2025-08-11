// Importação das funcionalidades principais do Pinia para gerenciamento de estado
import { defineStore } from 'pinia'
// Importação das funcionalidades reativas do Vue 3
import { ref } from 'vue'
// Importação da store de usuário para verificar autenticação
import { useUserStore } from './auth'
// Importação das funções da API de carrinho para sincronização
import { buscarCarrinho, atualizarCarrinho, removerCarrinho, adicionarItemCarrinho, removerItemCarrinho } from '../api/carrinho'
// Importação das configurações da API para processamento de imagens
import { API_CONFIG } from '../api/configuracoes.js'

// ===== STORE DO CARRINHO =====
// Esta store gerencia todo o estado relacionado ao carrinho de compras
// Inclui produtos, total, sincronização com API e fallback para localStorage
export const useCartStore = defineStore('cart', () => {
  // ===== ESTADO REATIVO =====
  // Variáveis reativas que armazenam o estado do carrinho
  
  // Array de produtos no carrinho
  const produtos = ref([])
  
  // Valor total do carrinho (soma dos preços)
  const total = ref(0)
  
  // Flag indicando se o carrinho está sendo carregado
  const carregando = ref(false)

  // ===== DEPENDÊNCIAS =====
  // Obtém a store de usuário para verificar se está autenticado
  const userStore = useUserStore()
  
  // ===== FUNÇÕES AUXILIARES =====
  
  /**
   * Função para processar URLs de imagens dos produtos
   * Converte caminhos relativos em URLs completas para exibição
   * 
   * @param {string} imagePath - Caminho da imagem (pode ser relativo, absoluto ou data URL)
   * @returns {string} URL completa da imagem ou string vazia se não houver imagem
   */
  function processarImagem(imagePath) {
    // Se não houver caminho, retorna string vazia
    if (!imagePath) return ''
    
    // Se já for uma URL absoluta (começa com 'http'), retorna como está
    if (imagePath.startsWith('http')) return imagePath
    
    // Se for uma data URL (SVG inline), retorna como está
    if (imagePath.startsWith('data:')) return imagePath
    
    // Para caminhos relativos, constrói a URL completa
    const fullPath = API_CONFIG.BASE_URL + imagePath
    
    // Log para debug do processamento de imagem
    console.log('Processando imagem:', { original: imagePath, full: fullPath })
    
    return fullPath
  }
  
  /**
   * Função para gerar chave única do carrinho no localStorage
   * Usa o ID do usuário se autenticado, ou 'anonimo' se não autenticado
   * 
   * @returns {string} Chave única para o carrinho no localStorage
   */
  function getCarrinhoKey() {
    // Obtém o ID do usuário logado ou usa 'anonimo' como padrão
    const userId = userStore.user?.id || 'anonimo'
    return `carrinho_${userId}`
  }

  // ===== FUNÇÕES PRINCIPAIS =====
  
  /**
   * Função para buscar o carrinho da API ou localStorage
   * Implementa estratégia de fallback: API primeiro, localStorage como backup
   * Sincroniza dados entre localStorage e API quando possível
   */
  async function fetchCarrinho() {
    // Marca o carrinho como carregando
    carregando.value = true
    
    try {
      // ===== USUÁRIO AUTENTICADO =====
      // Se o usuário está logado, tenta buscar da API primeiro
      if (userStore.isAuthenticated) {
        try {
          // Busca carrinho da API
          const carrinhoAPI = await buscarCarrinho()
          
          // Se a API retornou dados válidos com produtos
          if (carrinhoAPI && carrinhoAPI.items && carrinhoAPI.items.length > 0) {
            // Converte itens da API para o formato do frontend
            produtos.value = carrinhoAPI.items.map(item => ({
              id: item.product_id,                    // ID do produto
              name: item.name,                        // Nome do produto
              price: parseFloat(item.unit_price),     // Preço unitário
              image_path: processarImagem(item.image_path || item.image || ''), // Processa imagem
              category: item.category || item.category_name || 'Sem categoria' // Categoria
            }))
            
            // Calcula o total: usa total da API ou soma os preços dos itens
            total.value = carrinhoAPI.total_amount || 
                         carrinhoAPI.items.reduce((sum, item) => sum + parseFloat(item.unit_price), 0)
          } else {
            // ===== FALLBACK PARA LOCALSTORAGE =====
            // Se não há produtos na API, tenta usar localStorage
            const carrinhoSalvo = localStorage.getItem(getCarrinhoKey())
            
            if (carrinhoSalvo) {
              // Carrega produtos do localStorage
              const produtosLocal = JSON.parse(carrinhoSalvo)
              produtos.value = produtosLocal
              total.value = produtosLocal.reduce((sum, produto) => sum + produto.price, 0)
              
              // ===== SINCRONIZAÇÃO AUTOMÁTICA =====
              // Se há produtos no localStorage mas não na API, tenta sincronizar
              if (produtosLocal.length > 0) {
                try {
                  await atualizarCarrinho(produtosLocal)
                } catch (syncError) {
                  // Erro silencioso na sincronização - não quebra a experiência
                }
              }
            } else {
              // Carrinho vazio tanto na API quanto no localStorage
              produtos.value = []
              total.value = 0
            }
          }
        } catch (apiError) {
          // ===== FALLBACK COMPLETO PARA LOCALSTORAGE =====
          // Se a API falhar, usa localStorage como backup
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
        // ===== USUÁRIO NÃO AUTENTICADO =====
        // Usuário não logado, usa apenas localStorage
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
      // ===== TRATAMENTO DE ERRO GLOBAL =====
      // Em caso de erro inesperado, limpa o carrinho
      produtos.value = []
      total.value = 0
    } finally {
      // Sempre marca como não carregando, independente do resultado
      carregando.value = false
    }
  }

  /**
   * Função para adicionar um produto ao carrinho
   * Adiciona tanto no estado local quanto na API (se autenticado)
   * 
   * @param {Object} produto - Produto a ser adicionado ao carrinho
   * @param {number} produto.id - ID único do produto
   * @param {string} produto.name - Nome do produto
   * @param {number} produto.price - Preço do produto
   * @param {string} produto.image_path - Caminho da imagem do produto
   * @param {string} produto.category - Categoria do produto
   */
  async function addProduto(produto) {
    try {
      // Processa a imagem para garantir URL completa
      const produtoProcessado = {
        ...produto,
        image_path: processarImagem(produto.image_path)
      }
      
      // Log para debug da adição de produto
      console.log('Produto adicionado ao carrinho:', {
        original: produto,
        processado: produtoProcessado,
        imagePath: produto.image_path,
        processedImagePath: produtoProcessado.image_path
      })
      
      // Cria nova lista com o produto adicionado
      const novosProdutos = [...produtos.value, produtoProcessado]
      
      // ===== SINCRONIZAÇÃO COM API =====
      // Se o usuário está autenticado, sincroniza com a API
      if (userStore.isAuthenticated) {
        try {
          // Adiciona item na API (produto ID, quantidade 1, preço)
          await adicionarItemCarrinho(produto.id, 1, produto.price)
        } catch (apiError) {
          // ===== FALLBACK PARA LOCALSTORAGE =====
          // Se a API falhar, salva no localStorage como backup
          localStorage.setItem(getCarrinhoKey(), JSON.stringify(novosProdutos))
        }
      } else {
        // ===== USUÁRIO NÃO AUTENTICADO =====
        // Usuário não logado, usa apenas localStorage
        localStorage.setItem(getCarrinhoKey(), JSON.stringify(novosProdutos))
      }
      
      // Atualiza o estado reativo
      produtos.value = novosProdutos
      total.value = novosProdutos.reduce((sum, p) => sum + parseFloat(p.price), 0)
    } catch (error) {
      // Erro silencioso - não quebra a experiência do usuário
    }
  }

  /**
   * Função para remover um produto do carrinho
   * Remove tanto do estado local quanto da API (se autenticado)
   * 
   * @param {number} produtoId - ID do produto a ser removido
   */
  async function removeProduto(produtoId) {
    try {
      // Filtra o produto removido da lista
      const novosProdutos = produtos.value.filter(p => p.id !== produtoId)
      
      // ===== SINCRONIZAÇÃO COM API =====
      // Se o usuário está autenticado, sincroniza com a API
      if (userStore.isAuthenticated) {
        try {
          // Remove item da API
          await removerItemCarrinho(produtoId)
        } catch (apiError) {
          // ===== FALLBACK PARA LOCALSTORAGE =====
          // Se a API falhar, salva no localStorage como backup
          localStorage.setItem(getCarrinhoKey(), JSON.stringify(novosProdutos))
        }
      } else {
        // ===== USUÁRIO NÃO AUTENTICADO =====
        // Usuário não logado, usa apenas localStorage
        localStorage.setItem(getCarrinhoKey(), JSON.stringify(novosProdutos))
      }
      
      // Atualiza o estado reativo
      produtos.value = novosProdutos
      total.value = novosProdutos.reduce((sum, p) => sum + parseFloat(p.price), 0)
    } catch (error) {
      // Erro silencioso - não quebra a experiência do usuário
    }
  }

  /**
   * Função para limpar completamente o carrinho
   * Remove todos os produtos tanto do estado quanto da API/localStorage
   */
  async function limparCarrinho() {
    try {
      // Limpa o estado reativo
      produtos.value = []
      total.value = 0
      
      // Remove do localStorage
      localStorage.removeItem(getCarrinhoKey())
      
      // ===== SINCRONIZAÇÃO COM API =====
      // Se o usuário está autenticado, limpa na API também
      if (userStore.isAuthenticated) {
        try {
          await removerCarrinho()
        } catch (apiError) {
          // Erro silencioso - não quebra a experiência
        }
      }
    } catch (error) {
      // Erro silencioso - não quebra a experiência
    }
  }

  /**
   * Função para carregar o carrinho do localStorage
   * Útil para inicialização e recuperação de dados salvos
   */
  function carregarCarrinhoLocal() {
    try {
      const carrinhoSalvo = localStorage.getItem(getCarrinhoKey())
      
      if (carrinhoSalvo) {
        // Carrega produtos do localStorage
        produtos.value = JSON.parse(carrinhoSalvo)
        
        // Calcula o total baseado nos produtos carregados
        total.value = produtos.value.reduce((sum, p) => sum + p.price, 0)
      }
    } catch (error) {
      // Erro silencioso - não quebra a experiência
    }
  }

  // ===== INICIALIZAÇÃO AUTOMÁTICA =====
  // Carrega o carrinho do localStorage ao inicializar a store
  carregarCarrinhoLocal()

  /**
   * Função para sincronizar o carrinho local com a API
   * Útil para garantir consistência entre dispositivos
   * Só funciona se o usuário estiver autenticado
   */
  async function sincronizarComAPI() {
    // Só sincroniza se o usuário estiver autenticado
    if (!userStore.isAuthenticated) return
    
    try {
      // Envia produtos locais para a API
      await atualizarCarrinho(produtos.value)
    } catch (error) {
      // Erro silencioso na sincronização
    }
  }

  // ===== EXPORTAÇÃO =====
  // Retorna todas as variáveis e funções que devem estar disponíveis para uso externo
  
  return { 
    // Estado reativo
    produtos,              // Array de produtos no carrinho
    total,                 // Valor total do carrinho
    carregando,            // Flag de carregamento
    
    // Funções principais
    fetchCarrinho,         // Busca carrinho da API/localStorage
    addProduto,            // Adiciona produto ao carrinho
    removeProduto,         // Remove produto do carrinho
    limparCarrinho,        // Limpa todo o carrinho
    
    // Funções auxiliares
    carregarCarrinhoLocal, // Carrega carrinho do localStorage
    sincronizarComAPI      // Sincroniza com a API
  }
}) 
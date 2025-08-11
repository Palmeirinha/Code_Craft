<template>
  <!-- Seção principal da página de Cursos -->
  <section class="cursos-section">
    <div class="cursos-container">
      <!-- Header da página com ícone e texto explicativo -->
      <div class="cursos-header">
        <div class="cursos-header-content">
          <div class="cursos-header-icon">
            <i class="bi bi-journal-code"></i>
          </div>
          <div class="cursos-header-text">
            <h1 class="cursos-title">Nossos Cursos</h1>
            <p class="cursos-subtitle">Descubra o conhecimento que transformará sua carreira</p>
          </div>
        </div>
      </div>

      <div class="cursos-main-content">
        <!-- Sistema de Filtros e Busca - Controles de navegação -->
        <div class="cursos-filters-section">
          <!-- Barra de busca principal com estatísticas -->
          <div class="cursos-search-section">
            <div class="cursos-search-container">
              <i class="bi bi-search cursos-search-icon"></i>
              <input 
                v-model="busca" 
                type="text" 
                class="cursos-search-input" 
                placeholder="Buscar por nome, descrição ou categoria..."
              />
              <span class="cursos-search-stats">{{ cursosFiltrados.length }} cursos encontrados</span>
            </div>
          </div>

          <!-- Filtros avançados para refinar busca -->
          <div class="cursos-advanced-filters">
            <!-- Filtro por categoria - Select dropdown -->
            <div class="cursos-filter-group">
              <label class="cursos-filter-label">
                <i class="bi bi-tags"></i>
                Categoria
              </label>
              <select v-model="filtroCategoria" class="cursos-filter-select">
                <option value="">Todas as categorias</option>
                <option v-for="cat in categoriasDisponiveis" :key="cat.id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Ordenação - Select para organizar resultados -->
            <div class="cursos-filter-group">
              <label class="cursos-filter-label">
                <i class="bi bi-sort-down"></i>
                Ordenar por
              </label>
              <select v-model="ordenacao" class="cursos-filter-select">
                <option value="relevancia">Relevância</option>
                <option value="nome">Nome A-Z</option>
                <option value="nome-desc">Nome Z-A</option>
                <option value="preco-baixo">Menor preço</option>
                <option value="preco-alto">Maior preço</option>
                <option value="categoria">Categoria</option>
              </select>
            </div>

            <!-- Botão limpar filtros - Reset de todos os filtros -->
            <div class="cursos-filter-group">
              <button 
                @click="limparFiltros" 
                class="cursos-clear-filters-btn"
                :disabled="!filtrosAtivos"
              >
                <i class="bi bi-x-circle"></i>
                Limpar Filtros
              </button>
            </div>
          </div>

          <!-- Tags de filtros ativos - Visualização dos filtros aplicados -->
          <div v-if="filtrosAtivos" class="cursos-active-filters">
            <span class="cursos-active-filters-label">Filtros ativos:</span>
            <div class="cursos-filter-tags">
              <span 
                v-if="filtroCategoria" 
                class="cursos-filter-tag"
                @click="filtroCategoria = ''"
              >
                Categoria: {{ filtroCategoria }}
                <i class="bi bi-x"></i>
              </span>

            </div>
          </div>
        </div>

        <!-- Estado de carregamento - Loading spinner -->
        <div v-if="loading" class="cursos-loading">
          <div class="cursos-spinner"></div>
          <h3 class="cursos-loading-title">Carregando cursos...</h3>
          <p class="cursos-loading-text">Aguarde enquanto buscamos os melhores cursos para você</p>
        </div>

        <!-- Estado de erro - Mensagem de erro com botão de retry -->
        <div v-else-if="error" class="cursos-error">
          <i class="bi bi-exclamation-triangle cursos-error-icon"></i>
          <h3 class="cursos-error-title">Erro ao carregar cursos</h3>
          <p class="cursos-error-text">{{ error }}</p>
          <button class="cursos-btn cursos-btn-retry" @click="carregarCursos">
            <i class="bi bi-arrow-clockwise"></i>
            Tentar novamente
          </button>
        </div>

        <!-- Grid de cursos - Lista principal de cursos -->
        <div v-else-if="cursosPaginados.length > 0" class="cursos-grid">
          <div 
            v-for="curso in cursosPaginados" 
            :key="curso.id" 
            class="cursos-card"
            @click="abrirModal(curso)"
          >
            <!-- Container da imagem do curso -->
            <div class="cursos-image-container">
              <img 
                :src="curso.imagem || ''" 
                :alt="curso.titulo" 
                class="cursos-image"
                @error="handleImageError"
              />
            </div>
            
            <!-- Conteúdo do card do curso -->
            <div class="cursos-card-content">
              <span class="cursos-category-badge">{{ curso.categoria || 'Geral' }}</span>
              <h3 class="cursos-card-title">{{ curso.titulo }}</h3>
              <p class="cursos-card-description">{{ curso.descricao || 'Descrição não disponível' }}</p>
              
              <!-- Seção de preço e botão de adicionar ao carrinho -->
              <div class="cursos-price">
                <div class="cursos-price-container">
                  <span v-if="curso.desconto > 0" class="cursos-price-original">
                    R$ {{ curso.precoOriginal?.toFixed(2).replace('.', ',') }}
                  </span>
                  <span class="cursos-price-current">
                    R$ {{ precoComDesconto(curso).replace('.', ',') }}
                  </span>
                </div>
                <button 
                  class="cursos-btn cursos-btn-add-cart"
                  :class="{ 'cursos-in-cart': isInCart(curso.id) }"
                  @click.stop="adicionarAoCarrinho(curso)"
                >
                  <i :class="isInCart(curso.id) ? 'bi bi-check-circle' : 'bi bi-cart-plus'"></i>
                  <span>{{ isInCart(curso.id) ? 'No carrinho' : 'Adicionar' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vazio - Quando não há cursos encontrados -->
        <div v-else-if="!loading && !error" class="cursos-empty">
          <i class="bi bi-search cursos-empty-icon"></i>
          <h3 class="cursos-empty-title">Nenhum curso encontrado</h3>
          <p class="cursos-empty-text">Tente ajustar sua busca ou explore nossas categorias</p>
        </div>

        <!-- Sistema de paginação - Controles de navegação entre páginas -->
        <div v-if="!loading && !error && totalPaginas > 1" class="cursos-pagination">
          <!-- Informações da paginação atual -->
          <div class="cursos-pagination-info">
            <span class="cursos-pagination-text">
              Mostrando {{ inicioPagina + 1 }} a {{ fimPagina }} de {{ cursosFiltrados.length }} cursos
            </span>
          </div>
          
          <!-- Controles de navegação da paginação -->
          <div class="cursos-pagination-controls">
            <!-- Botão página anterior -->
            <button 
              class="cursos-pagination-btn"
              :class="{ 'cursos-pagination-btn-disabled': paginaAtual === 1 }"
              @click="paginaAnterior"
              :disabled="paginaAtual === 1"
            >
              <i class="bi bi-chevron-left"></i>
              Anterior
            </button>
            
            <!-- Números das páginas com ellipsis -->
            <div class="cursos-pagination-pages">
              <button 
                v-for="pagina in paginasVisiveis" 
                :key="pagina"
                class="cursos-pagination-page"
                :class="{ 
                  'cursos-pagination-page-active': pagina === paginaAtual,
                  'cursos-pagination-page-ellipsis': pagina === '...'
                }"
                @click="pagina === '...' ? null : irParaPagina(pagina)"
                :disabled="pagina === '...'"
              >
                {{ pagina }}
              </button>
            </div>
            
            <!-- Botão próxima página -->
            <button 
              class="cursos-pagination-btn"
              :class="{ 'cursos-pagination-btn-disabled': paginaAtual === totalPaginas }"
              @click="proximaPagina"
              :disabled="paginaAtual === totalPaginas"
            >
              Próxima
              <i class="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de detalhes do curso - Teleport para body -->
    <Teleport to="body">
      <transition name="cursos-modal-fade" appear>
        <div v-if="modalAberto && cursoSelecionado" class="cursos-modal-overlay" @click="fecharModal">
          <div class="cursos-modal-container" @click.stop>
            <!-- Header do modal com título e botão de fechar -->
            <div class="cursos-modal-header">
              <div class="cursos-modal-title-section">
                <div class="cursos-modal-icon">
                  <i class="bi bi-journal-code"></i>
                </div>
                <div class="cursos-modal-title-content">
                  <h3 class="cursos-modal-title">{{ cursoSelecionado.titulo }}</h3>
                  <p class="cursos-modal-subtitle">{{ cursoSelecionado.categoria || 'Geral' }}</p>
                </div>
              </div>
              <button class="cursos-modal-close" @click="fecharModal">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <!-- Corpo do modal com conteúdo do curso -->
            <div class="cursos-modal-body">
              <div class="cursos-modal-content">
                <div class="cursos-modal-grid">
                  <!-- Seção da imagem do curso no modal -->
                  <div class="cursos-modal-image-section">
                    <img 
                      :src="cursoSelecionado.imagem || ''" 
                      :alt="cursoSelecionado.titulo" 
                      class="cursos-modal-image"
                      @error="handleImageError"
                    />
                    <div v-if="cursoSelecionado.desconto > 0" class="cursos-modal-badge">
                      -{{ cursoSelecionado.desconto }}% OFF
                    </div>
                  </div>
                  
                  <!-- Seção de informações detalhadas do curso -->
                  <div class="cursos-modal-info-section">
                    <!-- Descrição detalhada do curso -->
                    <div class="cursos-modal-description">
                      <h4 class="cursos-modal-description-title">Descrição</h4>
                      <p class="cursos-modal-description-text">{{ cursoSelecionado.descricao || 'Descrição não disponível' }}</p>
                    </div>
                    
                    <!-- Estatísticas do curso -->
                    <div class="cursos-modal-stats">
                      <div class="cursos-modal-stat-item">
                        <i class="bi bi-clock"></i>
                        <div class="cursos-modal-stat-content">
                          <span class="cursos-modal-stat-value">Flexível</span>
                          <span class="cursos-modal-stat-label">Tempo de acesso</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Seção de preço e botão de adicionar ao carrinho no modal -->
                    <div class="cursos-modal-price-section">
                      <div class="cursos-modal-price-info">
                        <div class="cursos-modal-price-display">
                          <span v-if="cursoSelecionado.desconto > 0" class="cursos-modal-price-original">
                            R$ {{ cursoSelecionado.precoOriginal?.toFixed(2).replace('.', ',') }}
                          </span>
                          <span class="cursos-modal-price-current">
                            R$ {{ precoComDesconto(cursoSelecionado).replace('.', ',') }}
                          </span>
                        </div>
                        <div class="cursos-modal-price-installments">
                          ou 12x de R$ {{ (Number(precoComDesconto(cursoSelecionado)) / 12).toFixed(2).replace('.', ',') }}
                        </div>
                      </div>
                      
                      <button 
                        class="cursos-btn cursos-btn-curso-add-cart"
                        :class="{ 'cursos-in-cart': isInCart(cursoSelecionado.id) }"
                        @click="adicionarAoCarrinho(cursoSelecionado)"
                      >
                        <i :class="isInCart(cursoSelecionado.id) ? 'bi bi-check-circle' : 'bi bi-cart-plus'"></i>
                        <span>{{ isInCart(cursoSelecionado.id) ? 'Adicionado ao carrinho' : 'Adicionar ao carrinho' }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </section>
</template>

<script setup>
// Importações do Vue 3 Composition API
import { ref, computed, onMounted, watch } from 'vue'
// Importação do Vue Router para acessar parâmetros da URL
import { useRoute } from 'vue-router'
// Importação do store do carrinho para gerenciar produtos
import { useCartStore } from '../../services/stores/cart'
// Importação do Pinia para converter store em refs reativos
import { storeToRefs } from 'pinia'
// Importações das APIs para buscar dados
import { listarCategoriasPorUsuario } from '../../services/api/categorias'
import { listarProdutos } from '../../services/api/produtos'

// Constantes e configurações
const API_BASE = 'http://35.196.79.227:8000'  // URL base da API
const route = useRoute()                       // Instância do router para acessar query params
const cartStore = useCartStore()               // Store do carrinho
const { produtos } = storeToRefs(cartStore)   // Produtos do carrinho como refs reativos

// Estados reativos principais
const cursos = ref([])                    // Lista de todos os cursos disponíveis
const busca = ref('')                     // Termo de busca do usuário
const modalAberto = ref(false)            // Controla abertura/fechamento do modal
const cursoSelecionado = ref(null)        // Curso selecionado para exibir no modal
const loading = ref(true)                 // Estado de carregamento da página
const error = ref(null)                   // Mensagem de erro, se houver

// Estados dos filtros
const filtroCategoria = ref('')           // Categoria selecionada para filtrar
const ordenacao = ref('relevancia')       // Tipo de ordenação aplicada

// Estados da paginação
const itensPorPagina = 9                  // Número de cursos por página
const paginaAtual = ref(1)                // Página atual sendo exibida

// Computed properties para filtros e paginação
const cursosFiltrados = computed(() => {
  let cursosFiltrados = cursos.value

  // Filtro por busca de texto (nome, descrição ou categoria)
  if (busca.value) {
    cursosFiltrados = cursosFiltrados.filter(curso => 
      curso.titulo.toLowerCase().includes(busca.value.toLowerCase()) ||
      curso.descricao?.toLowerCase().includes(busca.value.toLowerCase()) ||
      curso.categoria?.toLowerCase().includes(busca.value.toLowerCase())
    )
  }

  // Filtro por categoria específica
  if (filtroCategoria.value) {
    cursosFiltrados = cursosFiltrados.filter(curso => 
      curso.categoria === filtroCategoria.value
    )
  }

  // Aplicar ordenação aos resultados filtrados
  cursosFiltrados = [...cursosFiltrados].sort((a, b) => {
    switch (ordenacao.value) {
      case 'nome':
        return a.titulo.localeCompare(b.titulo, 'pt-BR')
      case 'nome-desc':
        return b.titulo.localeCompare(a.titulo, 'pt-BR')
      case 'preco-baixo':
        return Number(precoComDesconto(a)) - Number(precoComDesconto(b))
      case 'preco-alto':
        return Number(precoComDesconto(b)) - Number(precoComDesconto(a))
      case 'categoria':
        return (a.categoria || '').localeCompare(b.categoria || '', 'pt-BR')
      default: // relevancia
        return 0 // manter ordem original da API
    }
  })

  return cursosFiltrados
})

// Computed properties para paginação
const totalPaginas = computed(() => Math.ceil(cursosFiltrados.value.length / itensPorPagina))
const inicioPagina = computed(() => (paginaAtual.value - 1) * itensPorPagina)
const fimPagina = computed(() => Math.min(inicioPagina.value + itensPorPagina, cursosFiltrados.value.length))
const cursosPaginados = computed(() => cursosFiltrados.value.slice(inicioPagina.value, fimPagina.value))

// Computed para gerar números de páginas visíveis com ellipsis
const paginasVisiveis = computed(() => {
  const totalPages = totalPaginas.value
  const pages = []
  
  if (totalPages <= 5) {
    // Se há 5 páginas ou menos, mostrar todas
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    // Lógica para páginas com ellipsis
    pages.push(1) // Sempre mostrar primeira página
    
    if (paginaAtual.value > 3) pages.push('...')
    
    const start = Math.max(2, paginaAtual.value - 1)
    const end = Math.min(totalPages - 1, paginaAtual.value + 1)
    
    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) pages.push(i)
    }
    
    if (paginaAtual.value < totalPages - 2) pages.push('...')
    if (totalPages > 1) pages.push(totalPages) // Sempre mostrar última página
  }
  
  return pages
})

// Computed properties para filtros
const categoriasDisponiveis = computed(() => {
  // Extrair categorias únicas dos cursos e mapear para formato esperado pelo select
  const categoriasUnicas = [...new Set(cursos.value.map(curso => curso.categoria).filter(Boolean))]
  return categoriasUnicas.map(nome => ({ id: nome, name: nome }))
})

const filtrosAtivos = computed(() => {
  // Verificar se há filtros aplicados (apenas categoria por enquanto)
  return filtroCategoria.value
})

// Watchers para resetar paginação quando filtros mudam
watch([busca, filtroCategoria, ordenacao], () => {
  paginaAtual.value = 1
})

// Watcher para abrir modal automaticamente quando há parâmetro na URL
watch(() => route.query.curso, (novoCursoId) => {
  if (novoCursoId && cursos.value.length > 0) {
    const curso = cursos.value.find(c => c.id === Number(novoCursoId))
    if (curso) setTimeout(() => abrirModal(curso), 100)
  }
})

// Funções de controle do modal
function abrirModal(curso) {
  cursoSelecionado.value = curso
  modalAberto.value = true
}

function fecharModal() {
  modalAberto.value = false
  cursoSelecionado.value = null
}

// Funções de verificação e manipulação do carrinho
function isInCart(cursoId) {
  return produtos.value.some(p => p.id === cursoId)
}

function adicionarAoCarrinho(curso) {
  if (!isInCart(curso.id)) {
    cartStore.addProduto({
      id: curso.id,
      name: curso.titulo,
      price: Number(precoComDesconto(curso)),
      category: curso.categoria,
      image_path: curso.imagem,
      description: curso.descricao
    })
  }
}

// Função para tratar erros de carregamento de imagem
function handleImageError(event) {
  // SVG placeholder para quando a imagem falha
  const placeholderSVG = `
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#1e293b"/>
      <rect x="50" y="50" width="100" height="100" rx="8" fill="#334155"/>
      <circle cx="100" cy="100" r="20" fill="#64748b"/>
      <rect x="80" y="130" width="40" height="20" rx="4" fill="#64748b"/>
    </svg>
  `
  const encodedSVG = encodeURIComponent(placeholderSVG)
  event.target.src = `data:image/svg+xml;charset=utf-8,${encodedSVG}`
}

// Funções para gerenciar filtros
function limparFiltros() {
  busca.value = ''
  filtroCategoria.value = ''
  ordenacao.value = 'relevancia'
}

// Função para calcular preço com desconto
function precoComDesconto(curso) {
  const preco = curso.precoOriginal || 0
  const desconto = curso.desconto || 0
  return desconto ? (preco * (1 - desconto / 100)).toFixed(2) : preco.toFixed(2)
}

// Funções de navegação da paginação
function paginaAnterior() {
  if (paginaAtual.value > 1) paginaAtual.value--
}

function proximaPagina() {
  if (paginaAtual.value < totalPaginas.value) paginaAtual.value++
}

function irParaPagina(pagina) {
  if (typeof pagina === 'number' && pagina >= 1 && pagina <= totalPaginas.value) {
    paginaAtual.value = pagina
  }
}

// Função principal para carregar cursos da API
async function carregarCursos() {
  try {
    loading.value = true
    error.value = null
    
    // Buscar produtos da API
    const produtos = await listarProdutos()
    if (!produtos?.length) {
      throw new Error('Nenhum produto encontrado')
    }
    
    // Buscar categorias do usuário específico (ID 192 - hardcoded)
    let categoriasIds = []
    try {
      const categorias = await listarCategoriasPorUsuario(192)
      categoriasIds = categorias?.map(cat => cat.id) || []
    } catch (catError) {
      console.warn('Erro ao buscar categorias:', catError)
    }
    
    // Filtrar produtos por categorias do usuário (se disponíveis)
    const produtosFiltrados = categoriasIds.length > 0 
      ? produtos.filter(prod => categoriasIds.includes(prod.category_id))
      : produtos
    
    // Mapear produtos da API para formato de cursos da interface
    cursos.value = produtosFiltrados
      .filter(prod => prod.id && prod.name)
      .map(prod => ({
        id: prod.id,
        titulo: prod.name,
        descricao: prod.description || 'Descrição não disponível',
        preco: Number(prod.price || 0),
        precoOriginal: Number(prod.price || 0),
        imagem: prod.image_path ? (prod.image_path.startsWith('http') ? prod.image_path : API_BASE + prod.image_path) : '',
        categoria: prod.category?.name || 'Geral',
        desconto: Number(prod.discounts?.[0]?.discount_percentage || 0),
        alunos: Number(prod.alunos || 0),
        nota: Number(prod.nota || 0)
      }))
    
    loading.value = false
    
    // Verificar se há parâmetro de curso na URL para abrir o modal automaticamente
    const cursoId = route.query.curso
    if (cursoId) {
      const curso = cursos.value.find(c => c.id === Number(cursoId))
      if (curso) {
        setTimeout(() => abrirModal(curso), 100)
      }
    }
  } catch (err) {
    error.value = err.message
    loading.value = false
  }
}

// Lifecycle hook - Carrega cursos quando componente é montado
onMounted(carregarCursos)
</script>

<style scoped>
/* Estilos específicos da página de cursos podem ser adicionados aqui se necessário */
</style>


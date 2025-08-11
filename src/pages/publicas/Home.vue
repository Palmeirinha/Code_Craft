<template>
  <div>
    <!-- Banner Principal Integrado - Hero section da página inicial -->
    <section class="home-banner-principal">
      <div class="home-banner-container">
        <div class="home-banner-content">
          <!-- Código animado com efeito glow -->
          <pre class="home-banner-code animated-glow"><code>{ Craft(<span class="home-banner-var">yourFuture</span> =&gt; <span class="home-banner-func">withCode</span>) }</code></pre>
          <!-- Comentário com efeito de digitação -->
          <p class="home-banner-comment"><span class="typing">// O próximo grande projeto começa com uma linha de código. Escreva a sua história!</span></p>
          <!-- Botão CTA para navegar aos cursos -->
          <button @click="scrollToCursos" class="home-banner-btn">
            <i class="bi bi-arrow-down-circle"></i>Ver Cursos
          </button>
          
          <!-- Banner promocional XP + Cupom XPINICIAL -->
          <div class="home-xp-banner">
            <div class="home-xp-content">
              <div class="home-xp-icon">
                <i class="bi bi-stars"></i>
              </div>
              <div class="home-xp-text">
                <span class="home-xp-highlight">+20XP</span> direto no seu inventário! Use <strong>XPINICIAL</strong> por tempo limitado e ganhe <span class="home-xp-off">20% OFF</span>.
              </div>
              <div class="home-xp-badge">
                <span class="home-xp-badge-text">LIMITADO</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Card Flutuante do Cupom XPINICIAL - Promoção destacada -->
    <div v-if="mostrarCupom" class="home-cupom-flutuante">
      <div class="home-cupom-card">
        <!-- Header do card do cupom -->
        <div class="home-cupom-header">
          <div class="home-cupom-icon">
            <i class="bi bi-gift"></i>
          </div>
          <div class="home-cupom-info">
            <h4 class="home-cupom-title">🎉 Oferta Especial!</h4>
            <p class="home-cupom-subtitle">Use o cupom <strong>XPINICIAL</strong> e ganhe desconto exclusivo</p>
          </div>
          <button class="home-cupom-close" @click="fecharCupom" aria-label="Fechar cupom">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <!-- Corpo do card do cupom -->
        <div class="home-cupom-body">
          <!-- Código do cupom com botão de copiar -->
          <div class="home-cupom-code">
            <span class="home-cupom-codigo">XPINICIAL</span>
            <button class="home-cupom-copiar" @click="copiarCupom" title="Copiar código">
              <i class="bi bi-clipboard"></i>
            </button>
          </div>
          <p class="home-cupom-descricao">Aproveite este desconto especial em sua primeira compra!</p>
          <!-- Botão para navegar aos cursos -->
          <router-link to="/cursos" class="home-cupom-btn">
            <i class="bi bi-arrow-right"></i>
            Ver Cursos
          </router-link>
        </div>
      </div>
    </div>

    <!-- Carrossel de Cursos em Destaque - Seção principal de produtos -->
    <section id="cursos-destaque" class="home-carrossel-section">
      <div class="home-carrossel-container">
        <!-- Header da seção de carrossel -->
        <div class="home-carrossel-header">
          <h3 class="home-carrossel-title">Cursos em Destaque</h3>
          <p class="home-carrossel-subtitle">Os mais populares entre nossos alunos</p>
        </div>
        
        <!-- Container principal do carrossel -->
        <div id="carrosselDestaque" class="home-carousel-container">
          <!-- Estado de Carregamento - Loading spinner -->
          <div v-if="loading" class="home-carousel-loading">
            <div class="home-loading-spinner"></div>
            <p>Carregando cursos...</p>
          </div>
          
          <!-- Estado Vazio - Quando não há cursos -->
          <div v-else-if="slides.length === 0" class="home-carousel-empty">
            <i class="bi bi-journal-x"></i>
            <h4>Nenhum curso encontrado</h4>
            <p>Tente novamente mais tarde</p>
          </div>
          
          <!-- Carrossel com Conteúdo - Slides dos cursos -->
          <div v-else class="home-carousel-inner">
            <div v-for="(slide, idx) in slides" :key="idx" :class="['home-carousel-item', {active: idx === currentSlide}]">
              <!-- Grid de cards dos cursos em destaque -->
              <div class="home-carousel-grid">
                <div v-for="(curso, index) in slide" :key="curso.id || index" class="home-carousel-card-wrapper">
                  <!-- Card individual do curso -->
                  <div class="home-curso-destaque-card">
                    <!-- Container da imagem com overlay -->
                    <div class="home-card-image-container">
                      <img :src="curso.imagem || ''" class="home-card-img-top" :alt="curso.titulo || 'Curso'">
                      <div class="home-card-overlay">
                        <!-- Badge de desconto se aplicável -->
                        <div class="home-curso-badge" v-if="(curso.desconto || 0) > 0">
                          <span class="home-badge-text">-{{ curso.desconto || 0 }}%</span>
                        </div>
                      </div>
                    </div>
                    <!-- Corpo do card com informações do curso -->
                    <div class="home-card-body">
                      <h5 class="home-card-title">{{ curso.titulo || 'Curso' }}</h5>
                      <!-- Container de preços com desconto -->
                      <div class="home-price-container">
                        <span v-if="(curso.desconto || 0) > 0" class="home-badge home-badge-desconto">-{{ curso.desconto || 0 }}%</span>
                        <span v-if="(curso.desconto || 0) > 0" class="home-price-original">R$ {{ typeof curso.precoOriginal === 'number' ? curso.precoOriginal.toFixed(2).replace('.', ',') : '0,00' }}</span>
                        <span class="home-price-current">R$ {{ precoComDesconto(curso).replace('.', ',') }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Indicadores do Carrossel - Pontos de navegação (só aparecem se houver mais de um slide) -->
          <div class="home-carousel-indicators" v-if="slides.length > 1">
            <button 
              v-for="(slide, idx) in slides" 
              :key="idx"
              :class="['home-carousel-indicator', { active: idx === currentSlide }]"
              @click="currentSlide = idx"
              :aria-label="`Ir para slide ${idx + 1}`"
            ></button>
          </div>
          
          <!-- Controles de navegação - Botões anterior/próximo (só aparecem se houver mais de um slide) -->
          <button class="home-carousel-control-prev" type="button" @click="prevSlide" v-if="slides.length > 1">
            <span class="home-carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Anterior</span>
          </button>
          <button class="home-carousel-control-next" type="button" @click="nextSlide" v-if="slides.length > 1">
            <span class="home-carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Próximo</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Seção de botão para ver todos os cursos -->
    <div class="home-cursos-section">
      <router-link to="/cursos" class="home-cursos-btn">
        <i class="bi bi-journal-code"></i>
        Ver Todos os Cursos
      </router-link>
    </div>
  </div>
</template>

<script setup>
// Importações do Vue 3 Composition API
import { ref, onMounted, computed } from 'vue'
// Importações das APIs para buscar dados
import { listarCategoriasPorUsuario } from '../../services/api/categorias'
import { listarProdutos } from '../../services/api/produtos'

// Importar estilos específicos da página home
import '@/assets/styles/css/home.css'

// Constantes e configurações
const API_BASE = 'http://35.196.79.227:8000'  // URL base da API

// Estados reativos principais
const cursosDestaque = ref([])    // Lista de cursos em destaque
const currentSlide = ref(0)       // Slide atual do carrossel
const loading = ref(true)         // Estado de carregamento
const mostrarCupom = ref(true)    // Controla exibição do cupom flutuante

// Função para calcular preço com desconto
const precoComDesconto = (curso) => {
  const preco = typeof curso.precoOriginal === 'number' ? curso.precoOriginal : Number(curso.precoOriginal || curso.preco || 0)
  const desconto = curso.desconto || 0
  if (!desconto) return preco.toFixed(2)
  return (preco * (1 - desconto / 100)).toFixed(2)
}

// Computed property para gerar slides do carrossel
// Como agora temos apenas 3 cursos, criamos um slide único
const slides = computed(() => {
  if (cursosDestaque.value.length === 0) return []
  return [cursosDestaque.value] // Um único slide com os 3 cursos
})

// Função para navegar para o slide anterior
function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  } else {
    // Loop para o último slide
    currentSlide.value = slides.value.length - 1
  }
}

// Função para navegar para o próximo slide
function nextSlide() {
  if (currentSlide.value < slides.value.length - 1) {
    currentSlide.value++
  } else {
    // Loop para o primeiro slide
    currentSlide.value = 0
  }
}

// Função para scroll suave até a seção de cursos em destaque
function scrollToCursos() {
  const cursosSection = document.getElementById('cursos-destaque')
  if (cursosSection) {
    cursosSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Funções do cupom flutuante
function fecharCupom() {
  mostrarCupom.value = false
  // Salvar no localStorage para não mostrar novamente na sessão
  localStorage.setItem('cupomXPINICIAL_fechado', 'true')
}

// Função para copiar código do cupom para clipboard
function copiarCupom() {
  navigator.clipboard.writeText('XPINICIAL').then(() => {
    // Feedback visual (pode ser melhorado com toast)
    const btn = event.target.closest('button')
    const icon = btn.querySelector('i')
    const originalClass = icon.className
    
    // Mudar ícone para check e cor para verde
    icon.className = 'bi bi-check-lg'
    btn.style.background = '#10b981'
    
    // Reverter após 2 segundos
    setTimeout(() => {
      icon.className = originalClass
      btn.style.background = ''
    }, 2000)
  }).catch(() => {
    // Fallback para navegadores que não suportam clipboard API
    const textArea = document.createElement('textarea')
    textArea.value = 'XPINICIAL'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  })
}

// Lifecycle hook - Carrega dados quando componente é montado
onMounted(async () => {
  // Verificar se o cupom foi fechado anteriormente na sessão
  const cupomFechado = localStorage.getItem('cupomXPINICIAL_fechado')
  if (cupomFechado === 'true') {
    mostrarCupom.value = false
  }
  
  try {
    loading.value = true
    
    // Buscar categorias do usuário específico (ID 192 - hardcoded)
    const categorias = await listarCategoriasPorUsuario(192)
    const categoriasIds = (categorias || []).map(cat => cat.id)
    
    // Buscar todos os produtos da API
    const produtos = await listarProdutos()
    
    // Filtrar produtos que pertencem às categorias do usuário 192
    const produtosFiltrados = (produtos || []).filter(prod => categoriasIds.includes(prod.category_id))
    
    // Selecionar apenas 3 cursos como destaque e mapear dados
    cursosDestaque.value = (produtosFiltrados || []).slice(0, 3).map(prod => ({
      id: prod.id || 0,
      titulo: prod.name || 'Curso',
      descricao: prod.description || 'Descrição não disponível',
      preco: Number(prod.price || 0),
      precoOriginal: Number(prod.price || 0),
      imagem: prod.image_path ? (prod.image_path.startsWith('http') ? prod.image_path : API_BASE + prod.image_path) : '',
      categoria: prod.category?.name || 'Geral',
      desconto: Number(prod.discounts?.[0]?.discount_percentage || 0),
      alunos: Number(prod.alunos || 0),
      nota: Number(prod.nota || 5),
      link: '#'
    }))
  } catch (error) {
    console.error('Erro ao carregar cursos:', error)
  } finally {
    loading.value = false
  }
})
</script>

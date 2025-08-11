<template>
  <div>
    <section class="home-banner-principal">
      <div class="home-banner-container">
        <div class="home-banner-content">
          <pre class="home-banner-code animated-glow"><code>{ Craft(<span class="home-banner-var">yourFuture</span> =&gt; <span class="home-banner-func">withCode</span>) }</code></pre>
          <p class="home-banner-comment"><span class="typing">// O próximo grande projeto começa com uma linha de código. Escreva a sua história!</span></p>
          <button @click="scrollToCursos" class="home-banner-btn">
            <i class="bi bi-arrow-down-circle"></i>Ver Cursos
          </button>
          
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

    <!-- Carrossel de cursos em destaque -->
    <section id="cursos-destaque" class="home-carrossel-section">
      <div class="home-carrossel-container">
        <div class="home-carrossel-header">
          <h3 class="home-carrossel-title">Cursos em Destaque</h3>
          <p class="home-carrossel-subtitle">Os mais populares entre nossos alunos</p>
        </div>
        
        <div id="carrosselDestaque" class="home-carousel-container">
          <div v-if="loading" class="home-carousel-loading">
            <div class="home-loading-spinner"></div>
            <p>Carregando cursos...</p>
          </div>
          
          <div v-else-if="slides.length === 0" class="home-carousel-empty">
            <i class="bi bi-journal-x"></i>
            <h4>Nenhum curso encontrado</h4>
            <p>Tente novamente mais tarde</p>
          </div>
          
          <!-- Slides dos cursos -->
          <div v-else class="home-carousel-inner">
            <div v-for="(slide, idx) in slides" :key="idx" :class="['home-carousel-item', {active: idx === currentSlide}]">
              <div class="home-carousel-grid">
                <div v-for="(curso, index) in slide" :key="curso.id || index" class="home-carousel-card-wrapper">
                  <div class="home-curso-destaque-card">
                    <div class="home-card-image-container">
                      <img :src="curso.imagem || ''" class="home-card-img-top" :alt="curso.titulo || 'Curso'">
                      <div class="home-card-overlay">
                        <div class="home-curso-badge" v-if="(curso.desconto || 0) > 0">
                          <span class="home-badge-text">-{{ curso.desconto || 0 }}%</span>
                        </div>
                      </div>
                    </div>
                    <div class="home-card-body">
                      <h5 class="home-card-title">{{ curso.titulo || 'Curso' }}</h5>
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
          
          <!-- Indicadores de navegação -->
          <div class="home-carousel-indicators" v-if="slides.length > 1">
            <button 
              v-for="(slide, idx) in slides" 
              :key="idx"
              :class="['home-carousel-indicator', { active: idx === currentSlide }]"
              @click="currentSlide = idx"
              :aria-label="`Ir para slide ${idx + 1}`"
            ></button>
          </div>
          
          <!-- Botões de navegação -->
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

    <!-- Botão para ver todos os cursos -->
    <div class="home-cursos-section">
      <router-link to="/cursos" class="home-cursos-btn">
        <i class="bi bi-journal-code"></i>
        Ver Todos os Cursos
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { listarCategoriasPorUsuario } from '../../services/api/categorias'
import { listarProdutos } from '../../services/api/produtos'

import '@/assets/styles/css/home.css'

const API_BASE = 'http://35.196.79.227:8000'

// Estados reativos
const cursosDestaque = ref([])
const currentSlide = ref(0)
const loading = ref(true)

// Calcula preço com desconto
const precoComDesconto = (curso) => {
  const preco = typeof curso.precoOriginal === 'number' ? curso.precoOriginal : Number(curso.precoOriginal || curso.preco || 0)
  const desconto = curso.desconto || 0
  if (!desconto) return preco.toFixed(2)
  return (preco * (1 - desconto / 100)).toFixed(2)
}

// Gera slides do carrossel (1 slide com 3 cursos)
const slides = computed(() => {
  if (cursosDestaque.value.length === 0) return []
  return [cursosDestaque.value]
})

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  } else {
    currentSlide.value = slides.value.length - 1
  }
}

function nextSlide() {
  if (currentSlide.value < slides.value.length - 1) {
    currentSlide.value++
  } else {
    currentSlide.value = 0
  }
}

// Scroll suave para seção de cursos
function scrollToCursos() {
  const cursosSection = document.getElementById('cursos-destaque')
  if (cursosSection) {
    cursosSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }
}

// Carrega dados na montagem
onMounted(async () => {
  try {
    loading.value = true
    
    // Busca categorias do usuário 192
    const categorias = await listarCategoriasPorUsuario(192)
    const categoriasIds = (categorias || []).map(cat => cat.id)
    
    // Busca produtos da API
    const produtos = await listarProdutos()
    
    // Filtra produtos por categoria e seleciona 3 para destaque
    const produtosFiltrados = (produtos || []).filter(prod => categoriasIds.includes(prod.category_id))
    
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

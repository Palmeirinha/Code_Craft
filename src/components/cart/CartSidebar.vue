<template>
  <!-- Overlay para fechar a sidebar -->
  <div 
    v-if="isOpen" 
    class="carrinho-overlay active" 
    @click="fechar"
  ></div>

  <!-- Sidebar do carrinho -->
  <div 
    class="carrinho-sidebar" 
    :class="{ 'carrinho-sidebar-open': isOpen }"
  >
    <!-- Header da sidebar -->
    <div class="carrinho-header">
      <div class="carrinho-header-content">
        <div class="carrinho-header-left">
          <div class="carrinho-icon-wrapper">
            <i class="bi bi-cart3"></i>
          </div>
          <div>
            <h3 class="carrinho-title">Carrinho</h3>
            <p class="carrinho-item-count">{{ produtos.length }} item{{ produtos.length !== 1 ? 's' : '' }}</p>
          </div>
        </div>
        <button 
          class="carrinho-btn-close" 
          @click="fechar"
          title="Fechar carrinho"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
    </div>

    <!-- Conteúdo da sidebar -->
    <div class="carrinho-content">
      <!-- Loading -->
      <div v-if="carregando" class="carrinho-loading">
        <div class="carrinho-spinner"></div>
        <p class="carrinho-loading-text">Carregando carrinho...</p>
      </div>

      <!-- Carrinho vazio -->
      <div v-else-if="produtos.length === 0" class="carrinho-vazio">
        <i class="bi bi-cart carrinho-empty-icon"></i>
        <h5 class="carrinho-empty-title">Seu carrinho está vazio</h5>
        <p class="carrinho-empty-text">Adicione alguns cursos para começar!</p>
        <button class="carrinho-btn-vazios" @click="irParaCursos">
          <i class="bi bi-journal-code"></i>
          Ver Cursos
        </button>
      </div>

      <!-- Lista de produtos -->
      <div v-else class="carrinho-produtos">
        <div class="carrinho-produtos-lista">
          <div 
            v-for="produto in produtos" 
            :key="produto.id" 
            class="produto-item"
          >
            <!-- Imagem do produto -->
            <div class="produto-imagem">
              <img 
                v-if="produto.image_path" 
                :src="produto.image_path" 
                :alt="produto.name"
                @error="handleImageError"
                class="produto-img"
              />
              <div v-else class="produto-img-placeholder">
                <i class="bi bi-journal-code"></i>
              </div>
            </div>
            
            <div class="produto-info">
              <div class="produto-header">
                <h6 class="produto-name">{{ produto.name }}</h6>
                <span class="produto-categoria">
                  <i class="bi bi-tag-fill me-1"></i>
                  {{ produto.category }}
                </span>
              </div>
              <div class="produto-price">
                <span class="carrinho-price-value">R$ {{ produto.price }}</span>
              </div>
            </div>
            <button 
              class="carrinho-btn-remove" 
              @click="remover(produto.id)" 
              :disabled="loadingAcao"
              title="Remover do carrinho"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <!-- Resumo e ações -->
        <div class="carrinho-footer">
          <div class="carrinho-total">
            <div class="carrinho-total-container">
              <div class="carrinho-total-label">Total da Compra</div>
              <div class="carrinho-total-value">
                R$ {{ total.toFixed(2).replace('.', ',') }}
              </div>
            </div>
          </div>

          <!-- Botões de ação -->
          <div class="carrinho-acoes">
            <button 
              class="carrinho-btn-finalizar" 
              @click="finalizarCompra" 
              :disabled="loadingAcao"
            >
              <i class="bi bi-check-circle me-2"></i>
              Finalizar Compra
            </button>
            <button 
              class="carrinho-btn-esvaziar" 
              @click="confirmarEsvaziar" 
              :disabled="loadingAcao"
            >
              <i class="bi bi-x-circle me-2"></i>
              Esvaziar Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Confirmação -->
  <Teleport to="body">
    <div v-if="mostrarConfirmacao" class="carrinho-confirm-modal-overlay" @click="mostrarConfirmacao = false">
      <div class="carrinho-confirm-modal" @click.stop>
        <div class="carrinho-confirm-content">
          <div class="carrinho-confirm-header">
            <i class="bi bi-exclamation-triangle"></i>
            <h3>Confirmar Ação</h3>
          </div>
          <div class="carrinho-confirm-body">
            <p>Tem certeza que deseja esvaziar o carrinho?</p>
            <p class="carrinho-confirm-warning">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="carrinho-confirm-actions">
            <button class="carrinho-confirm-btn-cancel" @click="mostrarConfirmacao = false">
              Cancelar
            </button>
            <button class="carrinho-confirm-btn-confirm" @click="esvaziar" :disabled="loadingAcao">
              <span v-if="loadingAcao" class="carrinho-spinner"></span>
              <span v-else>Confirmar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, inject } from 'vue'
import { useCartStore } from '../../services/stores/cart'
import { useUserStore } from '../../services/stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close'])

// Store e refs
const cart = useCartStore()
const userStore = useUserStore()
const { produtos, total, carregando } = storeToRefs(cart)
const { fetchCarrinho, removeProduto, limparCarrinho } = cart
const loadingAcao = ref(false)
const router = useRouter()

// Modal de confirmação
const mostrarConfirmacao = ref(false)
const acaoConfirmacao = ref(null)

// Sistema global de autenticação
const openAuthModal = inject('openAuthModal')

// Toast global
const showToastGlobal = inject('showToastGlobal')



// Métodos
function fechar() {
  emit('close')
}

function handleImageError(event) {
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

function irParaCursos() {
  router.push('/cursos')
  fechar()
}

async function remover(id) {
  loadingAcao.value = true
  try {
    await removeProduto(id)
    showToastGlobal && showToastGlobal('Produto removido do carrinho!', 'success')
  } catch (error) {
    showToastGlobal && showToastGlobal('Erro ao remover produto', 'danger')
  }
  loadingAcao.value = false
}

function confirmarEsvaziar() {
  acaoConfirmacao.value = 'esvaziar'
  mostrarConfirmacao.value = true
}

async function esvaziar() {
  loadingAcao.value = true
  try {
    await limparCarrinho()
    showToastGlobal && showToastGlobal('Carrinho esvaziado!', 'success')
  } catch (error) {
    showToastGlobal && showToastGlobal('Erro ao esvaziar carrinho', 'danger')
  }
  loadingAcao.value = false
  mostrarConfirmacao.value = false
}

function finalizarCompra() {
  if (!userStore.isAuthenticated) {
    openAuthModal()
    fechar()
    return
  }
  
  router.push('/finalizar-compra')
  fechar()
}



// Lifecycle
onMounted(() => {
  fetchCarrinho()
})
</script>


<template>
  <header class="header">
    <nav class="header-nav">
      <!-- Logo -->
      <router-link class="header-logo" to="/">
        <div class="header-logo-content">
          <i class="bi bi-code-slash"></i>
          <img :src="logoImage" alt="Logo Code Craft" />
        </div>
      </router-link>
      
      <!-- Navegação central -->
      <div class="header-nav-links">
        <!-- Link sempre visível -->
        <router-link class="header-nav-link" to="/cursos">
          <i class="bi bi-journal-text"></i>
          <span>Cursos</span>
        </router-link>
        
        <!-- Links apenas para usuários autenticados -->
        <template v-if="userStore.isAuthenticated">
          <router-link class="header-nav-link" to="/meus-cursos">
            <i class="bi bi-list-check"></i>
            <span>Meus Cursos</span>
          </router-link>
          <router-link class="header-nav-link" to="/meus-pedidos">
            <i class="bi bi-receipt"></i>
            <span>Meus Pedidos</span>
          </router-link>
        </template>
      </div>
      
      <!-- Ações do usuário -->
      <div class="header-actions">
        <button 
          class="header-cart-btn" 
          :class="{ 'has-items': cartStore.produtos.length > 0 }"
          title="Carrinho" 
          @click="abrirCarrinho"
        >
          <i class="bi bi-cart3"></i>
          <span v-if="cartStore.produtos.length > 0" class="header-cart-badge">{{ cartStore.produtos.length }}</span>
        </button>
        
        <!-- Menu de navegação para usuários não autenticados -->
        <template v-if="!userStore.isAuthenticated">
          <div class="header-nav-menu" :class="{ 'header-nav-menu-open': navMenuOpen }">
            <button 
              class="header-nav-menu-toggle" 
              type="button" 
              title="Menu de navegação"
              @click="toggleNavMenu"
              @blur="handleNavMenuBlur"
            >
              <i class="bi bi-list"></i>
              <span>Menu</span>
            </button>
            <ul class="header-nav-menu-list">
              <li><hr class="header-nav-menu-divider"></li>
              <li>
                <button class="header-nav-menu-item header-nav-login-btn" @click="openAuthModal">
                  <i class="bi bi-person"></i> Entrar
                </button>
              </li>
            </ul>
          </div>
        </template>
        
        <!-- Menu do usuário para usuários autenticados -->
        <template v-else>
          <div class="header-user-menu" :class="{ 'header-user-menu-open': userMenuOpen }">
            <button 
              class="header-user-menu-toggle" 
              type="button" 
              title="Menu do usuário"
              @click="toggleUserMenu"
              @blur="handleUserMenuBlur"
            >
              <i class="bi bi-person-circle"></i>
              <span class="header-user-name">
                <span class="header-user-text">{{ userStore.user?.nome || userStore.user?.name || userStore.user?.email || '' }}</span>
                <span v-if="role === 'ADMIN'" class="header-badge header-badge-admin">Admin</span>
                <span v-else-if="role === 'MODERATOR'" class="header-badge header-badge-moderator">Moderador</span>
                <span v-else class="header-badge header-badge-client">Cliente</span>
              </span>
            </button>
            <ul class="header-user-menu-list">
              <!-- Perfil do usuário -->
              <li><a class="header-user-menu-item" href="#" @click.prevent="abrirPerfil">
                <i class="bi bi-person"></i> Perfil
              </a></li>
              
              <!-- Links administrativos para admin e moderadores -->
              <template v-if="role === 'ADMIN' || role === 'MODERATOR'">
                <li><hr class="header-user-menu-divider"></li>
                <li v-if="role === 'ADMIN'">
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('CriarModerador')">
                    <i class="bi bi-person-plus"></i> Criar Moderador
                  </a>
                </li>
                <li v-if="role === 'ADMIN'">
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('CategoriaAdmin')">
                    <i class="bi bi-tags"></i> Gerenciar Categorias
                  </a>
                </li>
                <li>
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('ProdutoAdmin')">
                    <i class="bi bi-box-seam"></i> Gerenciar Produtos
                  </a>
                </li>
                <li v-if="role === 'ADMIN'">
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('DescontosAdmin')">
                    <i class="bi bi-percent"></i> Gerenciar Descontos
                  </a>
                </li>
                <li v-if="role === 'ADMIN'">
                  <router-link class="header-user-menu-item" :to="{ name: 'CuponsAdmin' }">
                    <i class="bi bi-ticket-perforated"></i> Gerenciar Cupons
                  </router-link>
                </li>
                <li v-if="role === 'ADMIN'">
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('PedidosAdmin')">
                    <i class="bi bi-clipboard-data"></i> Pedidos do Sistema
                  </a>
                </li>
              </template>
              
              <li><hr class="header-user-menu-divider"></li>
              <li><a class="header-user-menu-item" href="#" @click.prevent="logout">
                <i class="bi bi-box-arrow-right"></i> Sair
              </a></li>
            </ul>
          </div>
        </template>
      </div>
    </nav>
    
    <!-- Modais -->
    <AuthModal :show="showAuthModalGlobal" @close="closeAuthModal" />
    <PerfilModal :show="showPerfil" @close="showPerfil = false" />
  </header>

  <!-- Sidebar do carrinho -->
  <CarrinhoSidebar 
    v-if="carrinhoAberto"
    :is-open="carrinhoAberto" 
    @close="fecharCarrinho" 
  />
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted, inject } from 'vue'
import { useUserStore } from '../../services/stores/auth'
import { useCartStore } from '../../services/stores/cart'
import AuthModal from '../auth/AuthModal.vue'
import PerfilModal from '../auth/ProfileModal.vue'
import CarrinhoSidebar from '../cart/CartSidebar.vue'
import { useRouter } from 'vue-router'
import logoImage from '@/assets/images/logos/logo_code_Craft.png'

// Importar estilos
import '@/assets/styles/css/header.css'

// Props e emits
const props = defineProps({})
const emit = defineEmits([])

// Stores
const userStore = useUserStore()
const cartStore = useCartStore()
const router = useRouter()

// Sistema global de autenticação
const showAuthModalGlobal = inject('showAuthModalGlobal')
const openAuthModal = inject('openAuthModal')
const closeAuthModal = inject('closeAuthModal')



// Estados reativos
const showPerfil = ref(false)
const carrinhoAberto = ref(false)
const mobileMenuOpen = ref(false)
const userMenuOpen = ref(false)
const navMenuOpen = ref(false)
const sessaoRestante = ref('')

// Computed properties
const isAuthenticated = computed(() => userStore.isAuthenticated)
const role = computed(() => {
  const userRole = (userStore.user?.role || 'client').toUpperCase()
  return userRole
})

// Interval para sessão
let sessaoInterval = null

// Função para obter expiração do token
function getTokenExpiration(token) {
  if (!token || token.split('.').length !== 3) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    if (payload.exp) {
      return new Date(payload.exp * 1000)
    }
  } catch {}
  return null
}

// Função para atualizar sessão restante
function atualizarSessaoRestante() {
  const token = localStorage.getItem('token')
  const exp = getTokenExpiration(token)
  if (!exp) {
    sessaoRestante.value = ''
    return
  }
  const diff = exp.getTime() - Date.now()
  if (diff <= 0) {
    sessaoRestante.value = 'Sessão expirada'
    return
  }
  const horas = Math.floor(diff / 1000 / 60 / 60)
  const minutos = Math.floor((diff / 1000 / 60) % 60)
  const segundos = Math.floor((diff / 1000) % 60)
  sessaoRestante.value = `Sessão expira em: ${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`
}

// Watchers
watch(isAuthenticated, (val) => {
  if (val) {
    atualizarSessaoRestante()
    if (sessaoInterval) clearInterval(sessaoInterval)
    sessaoInterval = setInterval(atualizarSessaoRestante, 1000)
  } else {
    sessaoRestante.value = ''
    if (sessaoInterval) clearInterval(sessaoInterval)
  }
}, { immediate: true })

// Atualiza o carrinho ao logar/deslogar
watch(() => userStore.user, () => {
  cartStore.fetchCarrinho()
})

// Lifecycle hooks
onMounted(() => {
  // Garantir que o menu mobile comece fechado
  mobileMenuOpen.value = false
  
  // Event listeners
  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (sessaoInterval) clearInterval(sessaoInterval)
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})

// Event handlers
function handleResize() {
  if (window.innerWidth >= 768 && mobileMenuOpen.value) {
    closeMobileMenu()
  }
}

function handleClickOutside(event) {
  // Fechar menu mobile
  if (mobileMenuOpen.value) {
    const mobileMenu = document.querySelector('.mobile-menu')
    const mobileToggle = document.querySelector('.mobile-menu-toggle')
    
    if (mobileMenu && !mobileMenu.contains(event.target) && !mobileToggle?.contains(event.target)) {
      closeMobileMenu()
    }
  }
  
  // Fechar dropdown do usuário
  const userMenu = document.querySelector('.header-user-menu')
  if (userMenu && !userMenu.contains(event.target)) {
    userMenuOpen.value = false
  }
  
  // Fechar dropdown de navegação
  const navMenu = document.querySelector('.header-nav-menu')
  if (navMenu && !navMenu.contains(event.target)) {
    navMenuOpen.value = false
  }
}

// Funções do menu mobile
function toggleMobileMenu() {
  console.log('Toggle mobile menu - current:', mobileMenuOpen.value)
  mobileMenuOpen.value = !mobileMenuOpen.value
  console.log('Toggle mobile menu - new:', mobileMenuOpen.value)
  
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

function closeMobileMenu() {
  console.log('Closing mobile menu')
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// Funções do carrinho
function abrirCarrinho() {
  carrinhoAberto.value = true
}

function fecharCarrinho() {
  carrinhoAberto.value = false
}

// Funções do usuário
function logout() {
  userStore.logout()
  closeMobileMenu()
  window.location.href = '/'
}

function abrirPerfil() {
  showPerfil.value = true
  userMenuOpen.value = false
}

// Funções do menu de navegação
function toggleNavMenu() {
  navMenuOpen.value = !navMenuOpen.value
}

function handleNavMenuBlur() {
  setTimeout(() => {
    navMenuOpen.value = false
  }, 100)
}

function irPara(destino) {
  if (destino === 'CriarModerador') {
    router.push({ name: 'CriarModerador' })
  } else if (destino === 'CategoriaAdmin') {
    router.push({ name: 'CategoriaAdmin' })
  } else if (destino === 'ProdutoAdmin') {
    router.push({ name: 'ProdutoAdmin' })
  } else if (destino === 'DescontosAdmin') {
    router.push({ name: 'DescontosAdmin' })
  } else if (destino === 'PedidosAdmin') {
    router.push({ name: 'PedidosAdmin' })
  }
  userMenuOpen.value = false
}

// Funções do dropdown do usuário
function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function handleUserMenuBlur(event) {
  setTimeout(() => {
    if (!event.currentTarget.contains(document.activeElement)) {
      userMenuOpen.value = false
    }
  }, 100)
}
</script>
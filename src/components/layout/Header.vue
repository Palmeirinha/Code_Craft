<template>
  <!-- Cabeçalho principal da aplicação -->
  <header class="header">
    <!-- Navegação principal -->
    <nav class="header-nav">
      <!-- Logo da empresa com link para home -->
      <router-link class="header-logo" to="/">
        <div class="header-logo-content">
          <i class="bi bi-code-slash"></i>
          <img :src="logoImage" alt="Logo Code Craft" />
        </div>
      </router-link>
      
      <!-- Navegação central com links principais -->
      <div class="header-nav-links">
        <!-- Link sempre visível para todos os usuários -->
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
      
      <!-- Ações do usuário (carrinho, menu, etc.) -->
      <div class="header-actions">
        <!-- Botão do carrinho com badge de quantidade -->
        <button 
          class="header-cart-btn" 
          :class="{ 'has-items': cartStore.produtos.length > 0 }"
          title="Carrinho" 
          @click="abrirCarrinho"
        >
          <i class="bi bi-cart3"></i>
          <!-- Badge mostrando quantidade de itens no carrinho -->
          <span v-if="cartStore.produtos.length > 0" class="header-cart-badge">{{ cartStore.produtos.length }}</span>
        </button>
        
        <!-- Menu de navegação para usuários NÃO autenticados -->
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
            <!-- Lista de opções do menu de navegação -->
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
            <!-- Botão toggle do menu do usuário -->
            <button 
              class="header-user-menu-toggle" 
              type="button" 
              title="Menu do usuário"
              @click="toggleUserMenu"
              @blur="handleUserMenuBlur"
            >
              <i class="bi bi-person-circle"></i>
              <!-- Nome do usuário e badge de role -->
              <span class="header-user-name">
                <span class="header-user-text">{{ userStore.user?.nome || userStore.user?.name || userStore.user?.email || '' }}</span>
                <!-- Badge mostrando o tipo de usuário -->
                <span v-if="role === 'ADMIN'" class="header-badge header-badge-admin">Admin</span>
                <span v-else-if="role === 'MODERATOR'" class="header-badge header-badge-moderator">Moderador</span>
                <span v-else class="header-badge header-badge-client">Cliente</span>
              </span>
            </button>
            <!-- Lista de opções do menu do usuário -->
            <ul class="header-user-menu-list">
              <!-- Opção de perfil -->
              <li><a class="header-user-menu-item" href="#" @click.prevent="abrirPerfil">
                <i class="bi bi-person"></i> Perfil
              </a></li>
              
              <!-- Links administrativos para admin e moderadores -->
              <template v-if="role === 'ADMIN' || role === 'MODERATOR'">
                <li><hr class="header-user-menu-divider"></li>
                <!-- Apenas admin pode criar moderadores -->
                <li v-if="role === 'ADMIN'">
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('CriarModerador')">
                    <i class="bi bi-person-plus"></i> Criar Moderador
                  </a>
                </li>
                <!-- Apenas admin pode gerenciar categorias -->
                <li v-if="role === 'ADMIN'">
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('CategoriaAdmin')">
                    <i class="bi bi-tags"></i> Gerenciar Categorias
                  </a>
                </li>
                <!-- Admin e moderadores podem gerenciar produtos -->
                <li>
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('ProdutoAdmin')">
                    <i class="bi bi-box-seam"></i> Gerenciar Produtos
                  </a>
                </li>
                <!-- Apenas admin pode gerenciar descontos -->
                <li v-if="role === 'ADMIN'">
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('DescontosAdmin')">
                    <i class="bi bi-percent"></i> Gerenciar Descontos
                  </a>
                </li>
                <!-- Apenas admin pode gerenciar cupons -->
                <li v-if="role === 'ADMIN'">
                  <router-link class="header-user-menu-item" :to="{ name: 'CuponsAdmin' }">
                    <i class="bi bi-ticket-perforated"></i> Gerenciar Cupons
                  </router-link>
                </li>
                <!-- Apenas admin pode ver pedidos do sistema -->
                <li v-if="role === 'ADMIN'">
                  <a class="header-user-menu-item" href="#" @click.prevent="irPara('PedidosAdmin')">
                    <i class="bi bi-clipboard-data"></i> Pedidos do Sistema
                  </a>
                </li>
              </template>
              
              <!-- Separador e opção de logout -->
              <li><hr class="header-user-menu-divider"></li>
              <li><a class="header-user-menu-item" href="#" @click.prevent="logout">
                <i class="bi bi-box-arrow-right"></i> Sair
              </a></li>
            </ul>
          </div>
        </template>
      </div>
    </nav>
    
    <!-- Modais do cabeçalho -->
    <!-- Modal de autenticação (login/cadastro) -->
    <AuthModal :show="showAuthModalGlobal" @close="closeAuthModal" />
    <!-- Modal de perfil do usuário -->
    <PerfilModal :show="showPerfil" @close="showPerfil = false" />
  </header>

  <!-- Sidebar do carrinho (renderizado condicionalmente) -->
  <CarrinhoSidebar 
    v-if="carrinhoAberto"
    :is-open="carrinhoAberto" 
    @close="fecharCarrinho" 
  />
</template>

<script setup>
// Importações do Vue 3 Composition API
import { ref, onMounted, watch, computed, onUnmounted, inject } from 'vue'
// Importações das stores (Pinia)
import { useUserStore } from '../../services/stores/auth'
import { useCartStore } from '../../services/stores/cart'
// Importações dos componentes
import AuthModal from '../auth/AuthModal.vue'
import PerfilModal from '../auth/ProfileModal.vue'
import CarrinhoSidebar from '../cart/CartSidebar.vue'
// Importação do Vue Router
import { useRouter } from 'vue-router'
// Importação da imagem do logo
import logoImage from '@/assets/images/logos/logo_code_Craft.png'

// Importar estilos CSS específicos do header
import '@/assets/styles/css/header.css'

// Props e emits (não utilizados neste componente)
const props = defineProps({})
const emit = defineEmits([])

// Stores do Pinia para gerenciamento de estado
const userStore = useUserStore()    // Store de autenticação do usuário
const cartStore = useCartStore()    // Store do carrinho de compras
const router = useRouter()          // Instância do Vue Router

// Sistema global de autenticação (injetado do App.vue)
const showAuthModalGlobal = inject('showAuthModalGlobal')  // Controla exibição do modal de auth
const openAuthModal = inject('openAuthModal')              // Função para abrir modal de auth
const closeAuthModal = inject('closeAuthModal')            // Função para fechar modal de auth

// Estados reativos do componente
const showPerfil = ref(false)           // Controla exibição do modal de perfil
const carrinhoAberto = ref(false)       // Controla exibição do sidebar do carrinho
const userMenuOpen = ref(false)         // Controla dropdown do menu do usuário
const navMenuOpen = ref(false)          // Controla dropdown do menu de navegação

// Computed properties (propriedades computadas)
const role = computed(() => {
  // Obtém o role do usuário e converte para maiúsculo
  const userRole = (userStore.user?.role || 'client').toUpperCase()
  return userRole
})



// Watchers (observadores de mudanças)
// Observa mudanças no usuário para atualizar o carrinho
watch(() => userStore.user, () => {
  cartStore.fetchCarrinho()
})

// Lifecycle hooks (ganchos de ciclo de vida)
onMounted(() => {
  // Adicionar event listeners
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Limpar event listeners ao desmontar
  document.removeEventListener('click', handleClickOutside)
})

// Event handlers (manipuladores de eventos)
// Manipula cliques fora dos menus para fechá-los
function handleClickOutside(event) {
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

// Função para navegar para páginas administrativas
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
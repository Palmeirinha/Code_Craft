<script setup>
import Header from './components/layout/Header.vue'
import { ref, computed, provide, onMounted } from 'vue'
import { useUserStore } from './services/stores/auth'
import { useRoute, useRouter } from 'vue-router'
import Footer from './components/layout/Footer.vue'
import { useCartStore } from './services/stores/cart'

// Estilos de toast agora estão em carrinho.css'
// Importar estilos do contato
import '@/assets/styles/css/contato.css'

const userStore = useUserStore()
const cartStore = useCartStore()
const role = computed(() => userStore.user?.role || 'client')
const route = useRoute()
const router = useRouter()

// Toast global
const toastShow = ref(false)
const toastMsg = ref('')
const toastType = ref('success')
let toastTimeout = null

function showToastGlobal(msg, type = 'success', duration = 2500) {
  toastMsg.value = msg
  toastType.value = type
  toastShow.value = true
  if (toastTimeout) clearTimeout(toastTimeout)
  toastTimeout = setTimeout(() => { toastShow.value = false }, duration)
}
function closeToastGlobal() {
  toastShow.value = false
  if (toastTimeout) clearTimeout(toastTimeout)
}

// Modal de autenticação global
const showAuthModalGlobal = ref(false)

function openAuthModal() {
  showAuthModalGlobal.value = true
}

function closeAuthModal() {
  showAuthModalGlobal.value = false
}

// Disponibiliza para todos os componentes
provide('showToastGlobal', showToastGlobal)
provide('openAuthModal', openAuthModal)
provide('closeAuthModal', closeAuthModal)
provide('showAuthModalGlobal', showAuthModalGlobal)

// Funções de helpers movidas de utils/helpers.js
async function inicializarSistema() {
  try {
    // 1. Verificar se o usuário está autenticado
    if (userStore.isAuthenticated) {
      // 2. Inicializar carrinho automaticamente
      try {
        await cartStore.fetchCarrinho()
      } catch (error) {
        // Continuar mesmo com erro no carrinho
      }
      
      // 3. Verificar se o usuário tem role válido
      if (!userStore.user.role) {
        userStore.updateUserRole('CLIENT')
      }
    }
  } catch (error) {
    // Erro silencioso na inicialização
  }
}

function verificarCompatibilidade() {
  // Verificar se o token está presente mas o usuário não
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  
  if (token && !user) {
    localStorage.removeItem('token')
  }
  
  if (!token && user) {
    localStorage.removeItem('user')
  }
  
  // Verificar se o usuário tem role válido
  if (userStore.user && !userStore.user.role) {
    userStore.updateUserRole('CLIENT')
  }
}

function limparDadosCorrompidos() {
  try {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      if (!userData.id || !userData.name || !userData.email) {
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
  } catch (error) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }
}

// Inicialização do sistema
onMounted(async () => {
  // Limpar dados corrompidos
  limparDadosCorrompidos()
  
  // Verificar compatibilidade
  verificarCompatibilidade()
  
  // Inicializar sistema
  await inicializarSistema()
})
</script>

<template>
  <div class="app-wrapper">
    <Header />
    <!-- Toast Global Integrado -->
    <Teleport to="body">
      <transition name="toast-fade" appear>
        <div v-if="toastShow" :class="['toast-global', `toast-${toastType}`]" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="toast-content">
            <div class="toast-icon">
              <i v-if="toastType==='success'" class="bi bi-check-circle-fill"></i>
              <i v-else-if="toastType==='danger'" class="bi bi-x-circle-fill"></i>
              <i v-else-if="toastType==='info'" class="bi bi-info-circle-fill"></i>
              <i v-else-if="toastType==='warning'" class="bi bi-exclamation-triangle-fill"></i>
            </div>
            <div class="toast-message">
              {{ toastMsg }}
            </div>
            <button type="button" class="toast-close" @click="closeToastGlobal" aria-label="Fechar">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </transition>
    </Teleport>
    <div class="conteudo-principal">
      <router-view />
    </div>
    <Footer />
  </div>
</template>



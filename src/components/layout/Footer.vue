<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <!-- Seção da Marca -->
        <div class="footer-section">
          <div class="footer-logo">
            <img :src="logoImage" alt="Logo Code Craft" />
          </div>
          <p class="footer-description">
            <i class="bi bi-lightbulb footer-description-icon"></i>
            Transformando carreiras com educação em tecnologia.
          </p>
        </div>

        <!-- Links Úteis -->
        <div class="footer-section">
          <h3 class="footer-title">
            <i class="bi bi-link-45deg"></i>
            Links Úteis
          </h3>
          <ul class="footer-links">
            <li>
              <router-link to="/cursos">
                <i class="bi bi-book"></i>
                Cursos
              </router-link>
            </li>
            <li>
              <router-link to="/sobre">
                <i class="bi bi-info-circle"></i>
                Sobre Nós
              </router-link>
            </li>
            <li>
              <router-link to="/contato">
                <i class="bi bi-envelope"></i>
                Contato
              </router-link>
            </li>
          </ul>
        </div>




      </div>

      <!-- Rodapé Inferior -->
      <div class="footer-bottom">
        <p class="footer-copyright">&copy; {{ ano }} Code Craft. Todos os direitos reservados.</p>
      </div>
    </div>

    <!-- Botão Voltar ao Topo -->
    <button 
      class="footer-back-to-top" 
      :class="{ 'footer-back-to-top-hidden': !showBackToTop }"
      @click="scrollToTop"
      title="Voltar ao topo"
    >
      <i class="bi bi-arrow-up"></i>
    </button>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import logoImage from '@/assets/images/logos/logo_code_Craft.png'

const ano = new Date().getFullYear()
const showBackToTop = ref(false)

// Função para voltar ao topo
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Função para verificar se deve mostrar o botão
function handleScroll() {
  showBackToTop.value = window.scrollY > 300
}

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>


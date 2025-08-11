<template>
  <!-- Rodapé principal da aplicação -->
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <!-- Seção da Marca/Logo -->
        <div class="footer-section">
          <div class="footer-logo">
            <img :src="logoImage" alt="Logo Code Craft" />
          </div>
          <!-- Descrição da empresa -->
          <p class="footer-description">
            <i class="bi bi-lightbulb footer-description-icon"></i>
            Transformando carreiras com educação em tecnologia.
          </p>
        </div>

        <!-- Seção de Links Úteis -->
        <div class="footer-section">
          <h3 class="footer-title">
            <i class="bi bi-link-45deg"></i>
            Links Úteis
          </h3>
          <!-- Lista de links de navegação -->
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

      <!-- Rodapé Inferior com Copyright -->
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
// Importações necessárias do Vue
import { ref, onMounted, onUnmounted } from 'vue'
// Importação da imagem do logo
import logoImage from '@/assets/images/logos/logo_code_Craft.png'

// Variáveis reativas locais
const ano = new Date().getFullYear()        // Ano atual para o copyright
const showBackToTop = ref(false)            // Controla visibilidade do botão "voltar ao topo"

// Função para rolar suavemente para o topo da página
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// Função para verificar se deve mostrar o botão "voltar ao topo"
function handleScroll() {
  // Mostra o botão quando o usuário rola mais de 300px
  showBackToTop.value = window.scrollY > 300
}

// Lifecycle hooks
onMounted(() => {
  // Adiciona listener de scroll quando o componente é montado
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // Remove listener de scroll quando o componente é desmontado
  window.removeEventListener('scroll', handleScroll)
})
</script>


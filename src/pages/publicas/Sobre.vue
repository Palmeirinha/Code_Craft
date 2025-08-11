<template>
    <section class="sobre-section">
    <div class="sobre-container">
      <!-- Hero Section - Título principal e logo -->
      <div class="sobre-header">
        <div class="sobre-content">
          <div class="sobre-text">
            <h1 class="sobre-title">Transformando Carreiras através da Tecnologia</h1>
            <p class="sobre-subtitle">O Code Craft é mais que uma plataforma de cursos. Somos uma comunidade apaixonada por tecnologia, dedicada a democratizar o conhecimento e impulsionar o futuro da programação.</p>
          </div>
          <div class="sobre-image">
            <img src="@/assets/images/logos/logo_code_Craft.png" alt="Code Craft Logo" />
          </div>
        </div>
      </div>

      <!-- Missão da empresa -->
      <div class="sobre-mission">
        <h3 class="sobre-mission-title">Nossa Missão</h3>
        <p class="sobre-mission-text">Democratizar o acesso à educação tecnológica de qualidade, oferecendo cursos práticos e atualizados que realmente preparam nossos alunos para o mercado de trabalho. Acreditamos que o conhecimento deve ser acessível a todos, independentemente de sua localização ou condição financeira.</p>
      </div>

      <!-- Grid dos 6 valores da empresa -->
      <div class="sobre-values">
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-heart"></i>
          </div>
          <h4 class="sobre-value-title">Paixão</h4>
          <p class="sobre-value-description">Amamos o que fazemos e transmitimos essa paixão em cada curso, inspirando nossos alunos a perseguir seus sonhos na tecnologia.</p>
        </div>
        
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-award"></i>
          </div>
          <h4 class="sobre-value-title">Qualidade</h4>
          <p class="sobre-value-description">Comprometimento com a excelência em todo o conteúdo oferecido, garantindo que nossos alunos recebam o melhor ensino possível.</p>
        </div>
        
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-people"></i>
          </div>
          <h4 class="sobre-value-title">Comunidade</h4>
          <p class="sobre-value-description">Construímos juntos uma comunidade forte e colaborativa, onde o conhecimento é compartilhado e todos crescem juntos.</p>
        </div>
        
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-lightbulb"></i>
          </div>
          <h4 class="sobre-value-title">Inovação</h4>
          <p class="sobre-value-description">Sempre buscamos as melhores práticas e tecnologias mais recentes para manter nossos cursos atualizados e relevantes.</p>
        </div>
        
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-shield-check"></i>
          </div>
          <h4 class="sobre-value-title">Confiança</h4>
          <p class="sobre-value-description">Construímos relacionamentos duradouros baseados na confiança, transparência e resultados comprovados de nossos alunos.</p>
        </div>
        
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-graph-up"></i>
          </div>
          <h4 class="sobre-value-title">Crescimento</h4>
          <p class="sobre-value-description">Acreditamos no crescimento contínuo, tanto pessoal quanto profissional, e apoiamos nossos alunos em sua jornada de desenvolvimento.</p>
        </div>
      </div>

      <!-- Call to Action - Botões para conversão -->
      <div class="sobre-cta">
        <div class="sobre-cta-content">
          <div class="sobre-cta-icon">
            <i class="bi bi-rocket"></i>
          </div>
          <h2 class="sobre-cta-title">Pronto para Transformar sua Carreira?</h2>
          <p class="sobre-cta-text">Junte-se a milhares de alunos que já mudaram suas vidas com nossos cursos de qualidade</p>
          <div class="sobre-cta-actions">
            <router-link to="/cursos" class="sobre-cta-btn-primary">
              <i class="bi bi-play-circle"></i>
              Começar Agora
            </router-link>
            <button class="sobre-cta-btn-secondary" @click="abrirModalContato">
              <i class="bi bi-chat-dots"></i>
              Fale com Especialista
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de contato -->
      <div v-if="modalContatoAberto" class="sobre-modal-overlay" @click="fecharModalContato">
        <div class="sobre-modal-container" @click.stop>
          <div class="sobre-modal-header">
            <h5 class="sobre-modal-title">Fale Conosco</h5>
            <button type="button" class="sobre-modal-close" @click="fecharModalContato">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="sobre-modal-body">
            <form @submit.prevent="enviarContato" class="sobre-modal-form">
              <div class="sobre-form-row">
                <div class="sobre-form-group">
                  <label for="nome" class="sobre-form-label">Nome</label>
                  <input type="text" class="sobre-form-control" id="nome" v-model="formContato.nome" required>
                </div>
                <div class="sobre-form-group">
                  <label for="email" class="sobre-form-label">Email</label>
                  <input type="email" class="sobre-form-control" id="email" v-model="formContato.email" required>
                </div>
              </div>
              <div class="sobre-form-group">
                <label for="assunto" class="sobre-form-label">Assunto</label>
                <select class="sobre-form-control" id="assunto" v-model="formContato.assunto" required>
                  <option value="">Selecione um assunto</option>
                  <option value="duvida">Dúvida sobre cursos</option>
                  <option value="suporte">Suporte técnico</option>
                  <option value="parceria">Proposta de parceria</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div class="sobre-form-group">
                <label for="mensagem" class="sobre-form-label">Mensagem</label>
                <textarea class="sobre-form-control" id="mensagem" rows="4" v-model="formContato.mensagem" required></textarea>
              </div>
              <div class="sobre-modal-actions">
                <button type="button" class="sobre-btn-secondary" @click="fecharModalContato">Cancelar</button>
                <button type="submit" class="sobre-btn-primary">Enviar Mensagem</button>
          </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Toast de notificação -->
      <div class="sobre-toast-container">
        <div id="sobreToastNotificacao" class="sobre-toast" :class="{ 'sobre-toast-show': toastVisivel }">
          <div class="sobre-toast-header">
            <i class="bi bi-check-circle-fill sobre-toast-icon-success"></i>
            <strong class="sobre-toast-title">{{ toastTitulo }}</strong>
            <button type="button" class="sobre-toast-close" @click="fecharToast">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="sobre-toast-body">
            {{ toastMensagem }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Formulário de contato
const formContato = reactive({
  nome: '',
  email: '',
  assunto: '',
  mensagem: ''
})

// Sistema de toast
const toastTitulo = ref('')
const toastMensagem = ref('')
const toastVisivel = ref(false)

// Modal de contato
const modalContatoAberto = ref(false)

function abrirModalContato() {
  modalContatoAberto.value = true
}

function fecharModalContato() {
  modalContatoAberto.value = false
}

function mostrarToast() {
  toastVisivel.value = true
  setTimeout(() => {
    toastVisivel.value = false
  }, 3000)
}

function fecharToast() {
  toastVisivel.value = false
}

// Envio do formulário
async function enviarContato() {
  try {
    // TODO: Implementar chamada real para API
    // const response = await enviarMensagemApi(formContato.nome, formContato.email, formContato.assunto, formContato.mensagem)
    
    // Limpar formulário
    Object.assign(formContato, {
      nome: '',
      email: '',
      assunto: '',
      mensagem: ''
    })
    
    fecharModalContato()
    
    // Toast de sucesso
    toastTitulo.value = 'Mensagem Enviada!'
    toastMensagem.value = 'Obrigado pelo contato. Retornaremos em breve!'
    mostrarToast()
  } catch (error) {
    // Toast de erro
    toastTitulo.value = 'Erro!'
    toastMensagem.value = 'Erro ao enviar mensagem. Tente novamente.'
    mostrarToast()
  }
}
</script>


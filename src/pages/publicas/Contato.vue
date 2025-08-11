<template>
  <section class="contato-section">
    <div class="contato-container">
      <!-- Header da página -->
      <div class="contato-header">
        <h1 class="contato-title">Entre em Contato</h1>
        <p class="contato-subtitle">Estamos aqui para ajudar você em sua jornada de aprendizado. Entre em contato conosco e responderemos o mais rápido possível.</p>
      </div>

      <div class="contato-content">
        <!-- Informações de contato -->
        <div class="contato-info">
          <h3 class="contato-info-title">Informações de Contato</h3>
          
          <div class="contato-info-item">
            <div class="contato-info-icon">
              <i class="bi bi-geo-alt"></i>
            </div>
            <div class="contato-info-content">
              <h4 class="contato-info-label">Endereço</h4>
              <p class="contato-info-text">São Paulo, SP - Brasil</p>
            </div>
          </div>
          
          <div class="contato-info-item">
            <div class="contato-info-icon">
              <i class="bi bi-envelope"></i>
            </div>
            <div class="contato-info-content">
              <h4 class="contato-info-label">Email</h4>
              <p class="contato-info-text">contato@codecraft.com</p>
            </div>
          </div>
          
          <div class="contato-info-item">
            <div class="contato-info-icon">
              <i class="bi bi-telephone"></i>
            </div>
            <div class="contato-info-content">
              <h4 class="contato-info-label">Telefone</h4>
              <p class="contato-info-text">+55 (11) 99999-9999</p>
            </div>
          </div>
          
          <div class="contato-info-item">
            <div class="contato-info-icon">
              <i class="bi bi-clock"></i>
            </div>
            <div class="contato-info-content">
              <h4 class="contato-info-label">Horário de Atendimento</h4>
              <p class="contato-info-text">Segunda a Sexta: 8h às 18h<br>Sábado: 9h às 14h</p>
            </div>
          </div>
        </div>

        <!-- Formulário de contato -->
        <div class="contato-form">
          <h3 class="contato-form-title">Envie sua Mensagem</h3>
          <p class="contato-form-description">Preencha o formulário abaixo e entraremos em contato em até 24 horas</p>
          
          <form @submit.prevent="enviarMensagem" class="contato-form-content">
            <div class="contato-form-group">
              <label for="nome" class="contato-form-label">
                <i class="bi bi-person"></i>
                Nome Completo
              </label>
              <input 
                v-model="nome" 
                type="text" 
                id="nome" 
                class="contato-form-input" 
                required 
                autocomplete="name"
                placeholder="Digite seu nome completo"
              />
            </div>
            
            <div class="contato-form-group">
              <label for="email" class="contato-form-label">
                <i class="bi bi-envelope"></i>
                Email
              </label>
              <input 
                v-model="email" 
                type="email" 
                id="email" 
                class="contato-form-input" 
                required 
                autocomplete="email"
                placeholder="Digite seu email"
              />
            </div>
            
            <div class="contato-form-group">
              <label for="assunto" class="contato-form-label">
                <i class="bi bi-tag"></i>
                Assunto
              </label>
              <select 
                v-model="assunto" 
                id="assunto" 
                class="contato-form-select" 
                required
              >
                <option value="">Selecione um assunto</option>
                <option value="duvida">Dúvida sobre cursos</option>
                <option value="suporte">Suporte técnico</option>
                <option value="parceria">Proposta de parceria</option>
                <option value="sugestao">Sugestão</option>
                <option value="reclamacao">Reclamação</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            
            <div class="contato-form-group">
              <label for="mensagem" class="contato-form-label">
                <i class="bi bi-chat-left-text"></i>
                Mensagem
              </label>
              <textarea 
                v-model="mensagem" 
                id="mensagem" 
                class="contato-form-textarea" 
                rows="5" 
                required
                placeholder="Digite sua mensagem aqui..."
              ></textarea>
            </div>
            
            <button 
              type="submit" 
              class="contato-form-submit" 
              :disabled="enviando"
            >
              <span v-if="enviando" class="contato-spinner">
                <i class="bi bi-arrow-clockwise"></i>
              </span>
              <i v-else class="bi bi-send"></i>
              {{ enviando ? 'Enviando...' : 'Enviar Mensagem' }}
            </button>
          </form>
        </div>
      </div>

      <!-- Toast de notificações -->
      <div class="contato-toast-container">
        <div id="contatoToastNotificacao" class="contato-toast" :class="{ 'contato-toast-show': toastVisivel }">
          <div class="contato-toast-header">
            <i class="bi bi-check-circle-fill contato-toast-icon-success"></i>
            <strong class="contato-toast-title">{{ toastTitulo }}</strong>
            <button type="button" class="contato-toast-close" @click="fecharToast">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="contato-toast-body">
            {{ toastMensagem }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'

// Estados reativos
const nome = ref('')
const email = ref('')
const assunto = ref('')
const mensagem = ref('')
const enviando = ref(false)

// Sistema de toast
const toastTitulo = ref('')
const toastMensagem = ref('')
const toastVisivel = ref(false)

function mostrarToast() {
  toastVisivel.value = true
  setTimeout(() => {
    toastVisivel.value = false
  }, 3000)
}

function fecharToast() {
  toastVisivel.value = false
}

// Envio da mensagem
async function enviarMensagem() {
  if (enviando.value) return
  
  enviando.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Limpar formulário
    nome.value = ''
    email.value = ''
    assunto.value = ''
    mensagem.value = ''
    
    // Toast de sucesso
    toastTitulo.value = 'Mensagem Enviada!'
    toastMensagem.value = 'Obrigado pelo contato. Retornaremos em breve!'
    mostrarToast()
  } catch (error) {
    // Toast de erro
    toastTitulo.value = 'Erro!'
    toastMensagem.value = 'Erro ao enviar mensagem. Tente novamente.'
    mostrarToast()
  } finally {
    enviando.value = false
  }
}
</script>


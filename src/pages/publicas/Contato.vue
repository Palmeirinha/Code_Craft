<template>
  <!-- Seção principal da página de Contato -->
  <section class="contato-section">
    <div class="contato-container">
      <!-- Header da página com título e descrição -->
      <div class="contato-header">
        <h1 class="contato-title">Entre em Contato</h1>
        <p class="contato-subtitle">Estamos aqui para ajudar você em sua jornada de aprendizado. Entre em contato conosco e responderemos o mais rápido possível.</p>
      </div>

      <div class="contato-content">
        <!-- Seção de Informações de Contato - Dados da empresa -->
        <div class="contato-info">
          <h3 class="contato-info-title">Informações de Contato</h3>
          
          <!-- Item de Endereço -->
          <div class="contato-info-item">
            <div class="contato-info-icon">
              <i class="bi bi-geo-alt"></i>
            </div>
            <div class="contato-info-content">
              <h4 class="contato-info-label">Endereço</h4>
              <p class="contato-info-text">São Paulo, SP - Brasil</p>
            </div>
          </div>
          
          <!-- Item de Email -->
          <div class="contato-info-item">
            <div class="contato-info-icon">
              <i class="bi bi-envelope"></i>
            </div>
            <div class="contato-info-content">
              <h4 class="contato-info-label">Email</h4>
              <p class="contato-info-text">contato@codecraft.com</p>
            </div>
          </div>
          
          <!-- Item de Telefone -->
          <div class="contato-info-item">
            <div class="contato-info-icon">
              <i class="bi bi-telephone"></i>
            </div>
            <div class="contato-info-content">
              <h4 class="contato-info-label">Telefone</h4>
              <p class="contato-info-text">+55 (11) 99999-9999</p>
            </div>
          </div>
          
          <!-- Item de Horário de Atendimento -->
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

        <!-- Seção do Formulário de Contato -->
        <div class="contato-form">
          <h3 class="contato-form-title">Envie sua Mensagem</h3>
          <p class="contato-form-description">Preencha o formulário abaixo e entraremos em contato em até 24 horas</p>
          
          <!-- Formulário principal com validação -->
          <form @submit.prevent="enviarMensagem" class="contato-form-content">
            <!-- Campo Nome Completo -->
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
            
            <!-- Campo Email -->
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
            
            <!-- Campo Assunto - Select com opções pré-definidas -->
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
            
            <!-- Campo Mensagem - Textarea para texto longo -->
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
            
            <!-- Botão de Submit com estado de loading -->
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

      <!-- Container de Toast para notificações de sucesso/erro -->
      <div class="contato-toast-container">
        <div id="contatoToastNotificacao" class="contato-toast" :class="{ 'contato-toast-show': toastVisivel }">
          <!-- Header do toast com ícone e botão de fechar -->
          <div class="contato-toast-header">
            <i class="bi bi-check-circle-fill contato-toast-icon-success"></i>
            <strong class="contato-toast-title">{{ toastTitulo }}</strong>
            <button type="button" class="contato-toast-close" @click="fecharToast">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <!-- Corpo do toast com a mensagem -->
          <div class="contato-toast-body">
            {{ toastMensagem }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Importações do Vue 3 Composition API
import { ref } from 'vue'

// Estados reativos do formulário
const nome = ref('')                    // Nome completo do usuário
const email = ref('')                   // Email do usuário
const assunto = ref('')                 // Assunto selecionado do select
const mensagem = ref('')                // Mensagem do usuário
const enviando = ref(false)             // Estado de loading durante envio

// Estados do sistema de toast
const toastTitulo = ref('')             // Título do toast
const toastMensagem = ref('')           // Mensagem do toast
const toastVisivel = ref(false)         // Controla visibilidade do toast

// Função para mostrar o toast de notificação
function mostrarToast() {
  toastVisivel.value = true
  // Auto-hide após 3 segundos
  setTimeout(() => {
    toastVisivel.value = false
  }, 3000)
}

// Função para fechar o toast manualmente
function fecharToast() {
  toastVisivel.value = false
}

// Função principal para enviar mensagem de contato
async function enviarMensagem() {
  // Previne múltiplos envios simultâneos
  if (enviando.value) return
  
  // Inicia estado de loading
  enviando.value = true
  
  try {
    // Simular delay de envio (simulação de API)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Limpar formulário após sucesso
    nome.value = ''
    email.value = ''
    assunto.value = ''
    mensagem.value = ''
    
    // Configurar e mostrar toast de sucesso
    toastTitulo.value = 'Mensagem Enviada!'
    toastMensagem.value = 'Obrigado pelo contato. Retornaremos em breve!'
    mostrarToast()
  } catch (error) {
    // Configurar e mostrar toast de erro
    toastTitulo.value = 'Erro!'
    toastMensagem.value = 'Erro ao enviar mensagem. Tente novamente.'
    mostrarToast()
  } finally {
    // Finaliza estado de loading
    enviando.value = false
  }
}
</script>


<template>
  <!-- Seção principal da página Sobre -->
  <section class="sobre-section">
    <div class="sobre-container">
      <!-- Hero Section - Cabeçalho principal da página -->
      <div class="sobre-header">
        <div class="sobre-content">
          <!-- Área de texto com título e subtítulo -->
          <div class="sobre-text">
            <h1 class="sobre-title">Transformando Carreiras através da Tecnologia</h1>
            <p class="sobre-subtitle">O Code Craft é mais que uma plataforma de cursos. Somos uma comunidade apaixonada por tecnologia, dedicada a democratizar o conhecimento e impulsionar o futuro da programação.</p>
          </div>
          <!-- Imagem do logo da empresa -->
          <div class="sobre-image">
            <img src="@/assets/images/logos/logo_code_Craft.png" alt="Code Craft Logo" />
          </div>
        </div>
      </div>

      <!-- Nossa Missão - Seção explicativa da missão da empresa -->
      <div class="sobre-mission">
        <h3 class="sobre-mission-title">Nossa Missão</h3>
        <p class="sobre-mission-text">Democratizar o acesso à educação tecnológica de qualidade, oferecendo cursos práticos e atualizados que realmente preparam nossos alunos para o mercado de trabalho. Acreditamos que o conhecimento deve ser acessível a todos, independentemente de sua localização ou condição financeira.</p>
      </div>

      <!-- Nossos Valores - Grid de cards com os valores da empresa -->
      <div class="sobre-values">
        <!-- Card do valor: Paixão -->
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-heart"></i>
          </div>
          <h4 class="sobre-value-title">Paixão</h4>
          <p class="sobre-value-description">Amamos o que fazemos e transmitimos essa paixão em cada curso, inspirando nossos alunos a perseguir seus sonhos na tecnologia.</p>
        </div>
        
        <!-- Card do valor: Qualidade -->
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-award"></i>
          </div>
          <h4 class="sobre-value-title">Qualidade</h4>
          <p class="sobre-value-description">Comprometimento com a excelência em todo o conteúdo oferecido, garantindo que nossos alunos recebam o melhor ensino possível.</p>
        </div>
        
        <!-- Card do valor: Comunidade -->
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-people"></i>
          </div>
          <h4 class="sobre-value-title">Comunidade</h4>
          <p class="sobre-value-description">Construímos juntos uma comunidade forte e colaborativa, onde o conhecimento é compartilhado e todos crescem juntos.</p>
        </div>
        
        <!-- Card do valor: Inovação -->
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-lightbulb"></i>
          </div>
          <h4 class="sobre-value-title">Inovação</h4>
          <p class="sobre-value-description">Sempre buscamos as melhores práticas e tecnologias mais recentes para manter nossos cursos atualizados e relevantes.</p>
        </div>
        
        <!-- Card do valor: Confiança -->
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-shield-check"></i>
          </div>
          <h4 class="sobre-value-title">Confiança</h4>
          <p class="sobre-value-description">Construímos relacionamentos duradouros baseados na confiança, transparência e resultados comprovados de nossos alunos.</p>
        </div>
        
        <!-- Card do valor: Crescimento -->
        <div class="sobre-value-card">
          <div class="sobre-value-icon">
            <i class="bi bi-graph-up"></i>
          </div>
          <h4 class="sobre-value-title">Crescimento</h4>
          <p class="sobre-value-description">Acreditamos no crescimento contínuo, tanto pessoal quanto profissional, e apoiamos nossos alunos em sua jornada de desenvolvimento.</p>
        </div>
      </div>

      <!-- CTA Section - Call to Action para conversão -->
      <div class="sobre-cta">
        <div class="sobre-cta-content">
          <!-- Ícone decorativo do CTA -->
          <div class="sobre-cta-icon">
            <i class="bi bi-rocket"></i>
          </div>
          <!-- Título e texto motivacional -->
          <h2 class="sobre-cta-title">Pronto para Transformar sua Carreira?</h2>
          <p class="sobre-cta-text">Junte-se a milhares de alunos que já mudaram suas vidas com nossos cursos de qualidade</p>
          <!-- Botões de ação -->
          <div class="sobre-cta-actions">
            <!-- Botão primário para navegar aos cursos -->
            <router-link to="/cursos" class="sobre-cta-btn-primary">
              <i class="bi bi-play-circle"></i>
              Começar Agora
            </router-link>
            <!-- Botão secundário para abrir modal de contato -->
            <button class="sobre-cta-btn-secondary" @click="abrirModalContato">
              <i class="bi bi-chat-dots"></i>
              Fale com Especialista
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Contato - Overlay para formulário de contato -->
      <div v-if="modalContatoAberto" class="sobre-modal-overlay" @click="fecharModalContato">
        <div class="sobre-modal-container" @click.stop>
          <!-- Header do modal com título e botão de fechar -->
          <div class="sobre-modal-header">
            <h5 class="sobre-modal-title">Fale Conosco</h5>
            <button type="button" class="sobre-modal-close" @click="fecharModalContato">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <!-- Corpo do modal com formulário -->
          <div class="sobre-modal-body">
            <form @submit.prevent="enviarContato" class="sobre-modal-form">
              <!-- Linha com campos Nome e Email -->
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
              <!-- Campo de seleção de assunto -->
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
              <!-- Campo de mensagem -->
              <div class="sobre-form-group">
                <label for="mensagem" class="sobre-form-label">Mensagem</label>
                <textarea class="sobre-form-control" id="mensagem" rows="4" v-model="formContato.mensagem" required></textarea>
              </div>
              <!-- Botões de ação do formulário -->
              <div class="sobre-modal-actions">
                <button type="button" class="sobre-btn-secondary" @click="fecharModalContato">Cancelar</button>
                <button type="submit" class="sobre-btn-primary">Enviar Mensagem</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Toast de Notificação - Sistema de feedback para o usuário -->
      <div class="sobre-toast-container">
        <div id="sobreToastNotificacao" class="sobre-toast" :class="{ 'sobre-toast-show': toastVisivel }">
          <!-- Header do toast com ícone, título e botão de fechar -->
          <div class="sobre-toast-header">
            <i class="bi bi-check-circle-fill sobre-toast-icon-success"></i>
            <strong class="sobre-toast-title">{{ toastTitulo }}</strong>
            <button type="button" class="sobre-toast-close" @click="fecharToast">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <!-- Corpo do toast com a mensagem -->
          <div class="sobre-toast-body">
            {{ toastMensagem }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Importações do Vue 3 Composition API
import { ref, reactive } from 'vue'

// Estados reativos para o formulário de contato
const formContato = reactive({
  nome: '',      // Nome do usuário
  email: '',     // Email do usuário
  assunto: '',   // Assunto selecionado
  mensagem: ''   // Mensagem do usuário
})

// Estados reativos para o sistema de toast
const toastTitulo = ref('')      // Título do toast
const toastMensagem = ref('')    // Mensagem do toast
const toastVisivel = ref(false)  // Controla visibilidade do toast

// Estado reativo para o modal de contato
const modalContatoAberto = ref(false)  // Controla abertura/fechamento do modal

// Funções para controle do modal de contato
function abrirModalContato() {
  modalContatoAberto.value = true
}

function fecharModalContato() {
  modalContatoAberto.value = false
}

// Funções para controle do sistema de toast
function mostrarToast() {
  toastVisivel.value = true
  // Auto-hide após 3 segundos
  setTimeout(() => {
    toastVisivel.value = false
  }, 3000)
}

function fecharToast() {
  toastVisivel.value = false
}

// Função principal para envio do formulário de contato
async function enviarContato() {
  try {
    // Aqui você implementaria a chamada real para a API
    // const response = await enviarMensagemApi(formContato.nome, formContato.email, formContato.assunto, formContato.mensagem)
    
    // Limpar formulário após envio bem-sucedido
    Object.assign(formContato, {
      nome: '',
      email: '',
      assunto: '',
      mensagem: ''
    })
    
    // Fechar modal de contato
    fecharModalContato()
    
    // Mostrar toast de sucesso
    toastTitulo.value = 'Mensagem Enviada!'
    toastMensagem.value = 'Obrigado pelo contato. Retornaremos em breve!'
    mostrarToast()
  } catch (error) {
    // Mostrar toast de erro em caso de falha
    toastTitulo.value = 'Erro!'
    toastMensagem.value = 'Erro ao enviar mensagem. Tente novamente.'
    mostrarToast()
  }
}
</script>


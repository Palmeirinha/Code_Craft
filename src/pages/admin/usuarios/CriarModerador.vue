<template>
  <!-- Página principal para criação de moderadores -->
  <div class="criar-moderador-page">
    <div class="criar-moderador-container">
      <!-- Header da página - Título e descrição -->
      <div class="criar-moderador-page-header">
        <div class="criar-moderador-page-title">
          <i class="bi bi-person-plus-fill"></i>
          <h1>Criar Moderador</h1>
        </div>
        <p class="criar-moderador-page-subtitle">
          Adicione um novo moderador ao sistema para gerenciar produtos
        </p>
      </div>

      <!-- Card principal - Formulário de criação -->
      <div class="criar-moderador-card">
        <div class="criar-moderador-card-header">
          <h2 class="criar-moderador-card-title">
            <i class="bi bi-shield-check"></i>
            Informações do Moderador
          </h2>
        </div>

        <div class="criar-moderador-card-body">
          <form @submit.prevent="onCriar" class="criar-moderador-form">
            <!-- Campo Nome Completo -->
            <div class="criar-moderador-form-group">
              <label for="nome" class="criar-moderador-form-label">
                <i class="bi bi-person"></i>
                Nome Completo
              </label>
              <input
                id="nome"
                v-model="nome"
                type="text"
                required
                class="criar-moderador-form-control"
                placeholder="Digite o nome completo"
              />
            </div>

            <!-- Campo Email -->
            <div class="criar-moderador-form-group">
              <label for="email" class="criar-moderador-form-label">
                <i class="bi bi-envelope"></i>
                Email
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="criar-moderador-form-control"
                placeholder="moderador@codecraft.com"
              />
            </div>

            <!-- Campo Senha -->
            <div class="criar-moderador-form-group">
              <label for="senha" class="criar-moderador-form-label">
                <i class="bi bi-lock"></i>
                Senha
              </label>
              <input
                id="senha"
                v-model="senha"
                type="password"
                required
                minlength="6"
                class="criar-moderador-form-control"
                placeholder="Digite a senha"
              />
              <small class="criar-moderador-form-text">
                A senha deve ter pelo menos 6 caracteres
              </small>
            </div>

            <!-- Badge de Role - Indica que será criado como MODERATOR -->
            <div class="criar-moderador-role-badge">
              <i class="bi bi-shield-check"></i>
              <span>MODERATOR</span>
            </div>

            <!-- Botão de Submit - Cria o moderador -->
            <button
              type="submit"
              :disabled="carregando"
              class="criar-moderador-btn criar-moderador-btn-primary"
            >
              <span v-if="carregando" class="criar-moderador-spinner">
                <i class="bi bi-arrow-clockwise"></i>
              </span>
              <span>{{ carregando ? 'Criando moderador...' : 'Criar Moderador' }}</span>
            </button>

            <!-- Mensagem de Erro - Exibida quando há problemas -->
            <div v-if="erro" class="criar-moderador-alert criar-moderador-alert-danger">
              <i class="bi bi-exclamation-triangle"></i>
              <span>{{ erro }}</span>
            </div>

            <!-- Mensagem de Sucesso - Exibida quando moderador é criado -->
            <div v-if="sucesso" class="criar-moderador-alert criar-moderador-alert-success">
              <i class="bi bi-check-circle"></i>
              <span>Moderador criado com sucesso!</span>
            </div>
          </form>
        </div>
      </div>

      <!-- Seção informativa - Explica o papel do moderador -->
      <div class="criar-moderador-info-section">
        <h3 class="criar-moderador-info-title">
          <i class="bi bi-info-circle"></i>
          Papel do Moderador
        </h3>
        <div class="criar-moderador-info-grid">
          <!-- Card de Gerenciamento -->
          <div class="criar-moderador-info-card">
            <div class="criar-moderador-info-icon">
              <i class="bi bi-box-seam"></i>
            </div>
            <h4 class="criar-moderador-info-card-title">Gerenciamento</h4>
            <p class="criar-moderador-info-card-text">
              Pode gerenciar produtos e estoque do sistema
            </p>
          </div>
          <!-- Card de Supervisão -->
          <div class="criar-moderador-info-card">
            <div class="criar-moderador-info-icon">
              <i class="bi bi-eye"></i>
            </div>
            <h4 class="criar-moderador-info-card-title">Supervisão</h4>
            <p class="criar-moderador-info-card-text">
              Monitora produtos das categorias específicas
            </p>
          </div>
          <!-- Card de Segurança -->
          <div class="criar-moderador-info-card">
            <div class="criar-moderador-info-icon">
              <i class="bi bi-shield-check"></i>
            </div>
            <h4 class="criar-moderador-info-card-title">Segurança</h4>
            <p class="criar-moderador-info-card-text">
              Mantém a qualidade dos produtos da plataforma
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Importações do Vue 3 Composition API
import { ref, inject } from 'vue'
// Importação da API para criar moderadores
import { criarModerador } from '../../../services/api/usuarios'

// Definição de emits - Eventos que o componente pode emitir
const emit = defineEmits(['moderador-criado'])

// Injeção do toast global para notificações
const showToastGlobal = inject('showToastGlobal')

// Estados reativos do formulário
const nome = ref('')                    // Nome completo do moderador
const email = ref('')                   // Email do moderador
const senha = ref('')                   // Senha do moderador
const carregando = ref(false)           // Estado de carregamento durante criação
const erro = ref('')                    // Mensagem de erro (se houver)
const sucesso = ref(false)              // Flag de sucesso na criação

// Função principal para criar moderador
async function onCriar() {
  // Validação: verifica se todos os campos estão preenchidos
  if (!nome.value.trim() || !email.value.trim() || !senha.value.trim()) {
    erro.value = 'Todos os campos são obrigatórios.'
    return
  }

  // Validação: verifica se a senha tem pelo menos 6 caracteres
  if (senha.value.length < 6) {
    erro.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }

  // Inicia processo de criação
  carregando.value = true
  erro.value = ''
  sucesso.value = false

  try {
    // Chama a API para criar o moderador
    await criarModerador({ 
      name: nome.value, 
      email: email.value, 
      password: senha.value 
    })
    
    // Limpa o formulário após sucesso
    nome.value = ''
    email.value = ''
    senha.value = ''
    
    // Define flag de sucesso
    sucesso.value = true
    
    // Mostra toast de sucesso
    showToastGlobal('Moderador criado com sucesso!', 'success')
    
    // Emite evento para notificar componente pai
    emit('moderador-criado')
    
    // Limpa mensagem de sucesso após 3 segundos
    setTimeout(() => {
      sucesso.value = false
    }, 3000)
    
  } catch (e) {
    // Trata erros da API
    erro.value = typeof e === 'string' ? e : 'Erro ao criar moderador.'
    showToastGlobal && showToastGlobal(erro.value, 'danger')
  } finally {
    // Finaliza estado de carregamento
    carregando.value = false
  }
}
</script>

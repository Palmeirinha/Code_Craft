<template>
  <div class="criar-moderador-page">
    <div class="criar-moderador-container">
      <!-- Header da página -->
      <div class="criar-moderador-page-header">
        <div class="criar-moderador-page-title">
          <i class="bi bi-person-plus-fill"></i>
          <h1>Criar Moderador</h1>
        </div>
        <p class="criar-moderador-page-subtitle">
          Adicione um novo moderador ao sistema para gerenciar produtos
        </p>
      </div>

      <!-- Card principal -->
      <div class="criar-moderador-card">
        <div class="criar-moderador-card-header">
          <h2 class="criar-moderador-card-title">
            <i class="bi bi-shield-check"></i>
            Informações do Moderador
          </h2>
        </div>

        <div class="criar-moderador-card-body">
          <form @submit.prevent="onCriar" class="criar-moderador-form">
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

            <div class="criar-moderador-role-badge">
              <i class="bi bi-shield-check"></i>
              <span>MODERATOR</span>
            </div>

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

            <div v-if="erro" class="criar-moderador-alert criar-moderador-alert-danger">
              <i class="bi bi-exclamation-triangle"></i>
              <span>{{ erro }}</span>
            </div>

            <div v-if="sucesso" class="criar-moderador-alert criar-moderador-alert-success">
              <i class="bi bi-check-circle"></i>
              <span>Moderador criado com sucesso!</span>
            </div>
          </form>
        </div>
      </div>

      <!-- Seção informativa -->
      <div class="criar-moderador-info-section">
        <h3 class="criar-moderador-info-title">
          <i class="bi bi-info-circle"></i>
          Papel do Moderador
        </h3>
        <div class="criar-moderador-info-grid">
          <div class="criar-moderador-info-card">
            <div class="criar-moderador-info-icon">
              <i class="bi bi-box-seam"></i>
            </div>
            <h4 class="criar-moderador-info-card-title">Gerenciamento</h4>
            <p class="criar-moderador-info-card-text">
              Pode gerenciar produtos e estoque do sistema
            </p>
          </div>
          <div class="criar-moderador-info-card">
            <div class="criar-moderador-info-icon">
              <i class="bi bi-eye"></i>
            </div>
            <h4 class="criar-moderador-info-card-title">Supervisão</h4>
            <p class="criar-moderador-info-card-text">
              Monitora produtos das categorias específicas
            </p>
          </div>
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
import { ref, inject } from 'vue'
import { criarModerador } from '../../../services/api/usuarios'

const emit = defineEmits(['moderador-criado'])
const showToastGlobal = inject('showToastGlobal')

// Estados reativos
const nome = ref('')
const email = ref('')
const senha = ref('')
const carregando = ref(false)
const erro = ref('')
const sucesso = ref(false)

// Cria o moderador
async function onCriar() {
  if (!nome.value.trim() || !email.value.trim() || !senha.value.trim()) {
    erro.value = 'Todos os campos são obrigatórios.'
    return
  }

  if (senha.value.length < 6) {
    erro.value = 'A senha deve ter pelo menos 6 caracteres.'
    return
  }

  carregando.value = true
  erro.value = ''
  sucesso.value = false

  try {
    await criarModerador({ 
      name: nome.value, 
      email: email.value, 
      password: senha.value 
    })
    
    // Limpar formulário
    nome.value = ''
    email.value = ''
    senha.value = ''
    
    sucesso.value = true
    showToastGlobal('Moderador criado com sucesso!', 'success')
    emit('moderador-criado')
    
    setTimeout(() => {
      sucesso.value = false
    }, 3000)
    
  } catch (e) {
    erro.value = typeof e === 'string' ? e : 'Erro ao criar moderador.'
    showToastGlobal && showToastGlobal(erro.value, 'danger')
  } finally {
    carregando.value = false
  }
}
</script>

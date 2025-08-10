<template>
  <Teleport to="body">
    <transition name="auth-modal-fade" appear>
      <div v-if="show" class="auth-modal-overlay" @click="handleBackdropClick">
        <div class="auth-modal-container" @click.stop>
          <!-- Header -->
          <div class="auth-modal-header">
            <div class="auth-modal-title-section">
              <div class="auth-modal-icon">
                <i class="bi bi-person-circle"></i>
              </div>
              <div class="auth-modal-title-content">
                <h3 class="auth-modal-title">Autenticação</h3>
                <p class="auth-modal-subtitle">Entre ou crie sua conta</p>
              </div>
            </div>
            <button 
              class="auth-modal-close" 
              @click="$emit('close')"
              aria-label="Fechar modal"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Body -->
          <div class="auth-modal-body">
            <div class="auth-modal-content">
              <!-- Tabs de navegação -->
              <div class="auth-tabs">
                <button 
                  class="auth-tab" 
                  :class="{ active: aba === 'login' }" 
                  @click="aba = 'login'"
                >
                  <i class="bi bi-box-arrow-in-right"></i>
                  <span>Entrar</span>
                </button>
                <button 
                  class="auth-tab" 
                  :class="{ active: aba === 'cadastro' }" 
                  @click="aba = 'cadastro'"
                >
                  <i class="bi bi-person-plus"></i>
                  <span>Cadastrar</span>
                </button>
              </div>

              <!-- Alertas -->
              <div v-if="erro" class="auth-alert auth-alert-error">
                <i class="bi bi-exclamation-triangle"></i>
                <span>{{ erro }}</span>
              </div>

              <!-- Formulário de Login -->
              <form v-if="aba === 'login'" @submit.prevent="onLogin" class="auth-form">
                <div class="auth-form-group">
                  <label for="emailLogin" class="auth-form-label">E-mail</label>
                  <div class="auth-input-group">
                    <span class="auth-input-icon">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input 
                      v-model="email" 
                      type="email" 
                      id="emailLogin" 
                      class="auth-input"
                      required 
                      autocomplete="email"
                      placeholder="Digite seu e-mail"
                    />
                  </div>
                </div>

                <div class="auth-form-group">
                  <label for="senhaLogin" class="auth-form-label">Senha</label>
                  <div class="auth-input-group">
                    <span class="auth-input-icon">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input 
                      v-model="senha" 
                      type="password" 
                      id="senhaLogin" 
                      class="auth-input"
                      required 
                      autocomplete="current-password"
                      placeholder="Digite sua senha"
                    />
                  </div>
                </div>

                <div class="auth-remember">
                  <div class="auth-checkbox-group">
                    <input type="checkbox" id="lembrar" class="auth-checkbox" />
                    <label for="lembrar" class="auth-checkbox-label">Lembrar de mim</label>
                  </div>
                  <a href="#" class="auth-forgot-link">Esqueceu a senha?</a>
                </div>

                <button type="submit" class="auth-submit-btn" :disabled="carregando">
                  <span v-if="carregando" class="auth-spinner"></span>
                  <i v-else class="bi bi-box-arrow-in-right"></i>
                  <span>{{ carregando ? 'Entrando...' : 'Entrar' }}</span>
                </button>
              </form>

              <!-- Formulário de Cadastro -->
              <form v-else @submit.prevent="onCadastro" class="auth-form">
                <div class="auth-form-group">
                  <label for="nomeCadastro" class="auth-form-label">Nome</label>
                  <div class="auth-input-group">
                    <span class="auth-input-icon">
                      <i class="bi bi-person"></i>
                    </span>
                    <input 
                      v-model="nome" 
                      type="text" 
                      id="nomeCadastro" 
                      class="auth-input"
                      required 
                      autocomplete="name"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                </div>

                <div class="auth-form-group">
                  <label for="emailCadastro" class="auth-form-label">E-mail</label>
                  <div class="auth-input-group">
                    <span class="auth-input-icon">
                      <i class="bi bi-envelope"></i>
                    </span>
                    <input 
                      v-model="email" 
                      type="email" 
                      id="emailCadastro" 
                      class="auth-input"
                      required 
                      autocomplete="email"
                      placeholder="Digite seu e-mail"
                    />
                  </div>
                </div>

                <div class="auth-form-group">
                  <label for="senhaCadastro" class="auth-form-label">Senha</label>
                  <div class="auth-input-group">
                    <span class="auth-input-icon">
                      <i class="bi bi-lock"></i>
                    </span>
                    <input 
                      v-model="senha" 
                      type="password" 
                      id="senhaCadastro" 
                      class="auth-input"
                      required 
                      autocomplete="new-password"
                      placeholder="Digite sua senha"
                    />
                  </div>
                </div>

                <div class="auth-form-group">
                  <div class="auth-checkbox-group">
                    <input type="checkbox" id="termos" class="auth-checkbox" required />
                    <label for="termos" class="auth-checkbox-label">
                      Concordo com os <a href="#" class="auth-forgot-link">Termos de Uso</a> e 
                      <a href="#" class="auth-forgot-link">Política de Privacidade</a>
                    </label>
                  </div>
                </div>

                <button type="submit" class="auth-submit-btn" :disabled="carregando">
                  <span v-if="carregando" class="auth-spinner"></span>
                  <i v-else class="bi bi-person-plus"></i>
                  <span>{{ carregando ? 'Cadastrando...' : 'Cadastrar' }}</span>
                </button>
              </form>

              <!-- Link de Switch -->
              <div class="auth-switch">
                <p class="auth-switch-text">
                  {{ aba === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?' }}
                </p>
                <a 
                  href="#" 
                  class="auth-switch-link"
                  @click.prevent="aba = aba === 'login' ? 'cadastro' : 'login'"
                >
                  {{ aba === 'login' ? 'Criar conta' : 'Fazer login' }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, inject, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../../services/stores/auth'
import { loginApi, cadastroApi } from '../../services/api/auth'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const aba = ref('login')
const nome = ref('')
const email = ref('')
const senha = ref('')
const erro = ref('')
const sucesso = ref(false)
const carregando = ref(false)
const userStore = useUserStore()
const showToastGlobal = inject('showToastGlobal')

// Handle backdrop click
function handleBackdropClick() {
  limparCampos()
  emit('close')
}

// Função para limpar todos os campos
function limparCampos() {
  nome.value = ''
  email.value = ''
  senha.value = ''
  erro.value = ''
  sucesso.value = false
  carregando.value = false
}

// Handle escape key
function handleEscapeKey(event) {
  if (event.key === 'Escape' && props.show) {
    emit('close')
  }
}

// Add/remove event listeners
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})

watch(() => props.show, (val) => {
  if (val) {
    aba.value = 'login'
    limparCampos()
  }
})

// Limpar campos quando alternar entre abas
watch(() => aba.value, (newAba) => {
  // Limpar apenas os campos específicos da aba anterior
  if (newAba === 'login') {
    nome.value = ''
  } else if (newAba === 'cadastro') {
    // Garantir que os campos não fiquem com espaços em branco
    email.value = email.value.trim()
    senha.value = senha.value.trim()
  }
  erro.value = ''
  sucesso.value = false
})

// Garantir que os inputs sempre tenham valores válidos
watch([email, senha, nome], ([newEmail, newSenha, newNome]) => {
  // Remover espaços em branco extras
  if (newEmail !== undefined) email.value = newEmail.trim()
  if (newSenha !== undefined) senha.value = newSenha.trim()
  if (newNome !== undefined) nome.value = newNome.trim()
})

async function onLogin() {
  erro.value = ''
  carregando.value = true
  try {
    const response = await loginApi(email.value, senha.value)
    if (response.token && response.user) {
      userStore.setAuth(response)
      showToastGlobal('Login realizado com sucesso!', 'success')
      setTimeout(() => {
        emit('close')
      }, 1200)
    } else {
      throw new Error('E-mail ou senha inválidos.')
    }
  } catch (e) {
    erro.value = e.message
    showToastGlobal(e.message, 'danger')
  } finally {
    carregando.value = false
  }
}

async function onCadastro() {
  erro.value = ''
  sucesso.value = false
  carregando.value = true
  try {
    const response = await cadastroApi(nome.value, email.value, senha.value)
    sucesso.value = true
    showToastGlobal('Cadastro realizado com sucesso!', 'success')
    setTimeout(() => {
      aba.value = 'login'
      sucesso.value = false
    }, 1200)
  } catch (e) {
    erro.value = typeof e === 'string' ? e : 'Erro ao cadastrar.'
    showToastGlobal(erro.value, 'danger')
  } finally {
    carregando.value = false
  }
}
</script>


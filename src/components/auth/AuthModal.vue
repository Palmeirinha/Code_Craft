<template>
  <!-- Teleport move o modal para o body do DOM, evitando problemas de z-index -->
  <Teleport to="body">
    <!-- Transição de entrada/saída do modal -->
    <transition name="auth-modal-fade" appear>
      <!-- Overlay do modal - fundo escuro -->
      <div v-if="show" class="auth-modal-overlay" @click="handleBackdropClick">
        <!-- Container principal do modal -->
        <div class="auth-modal-container" @click.stop>
          <!-- Cabeçalho do modal -->
          <div class="auth-modal-header">
            <div class="auth-modal-title-section">
              <!-- Ícone do usuário -->
              <div class="auth-modal-icon">
                <i class="bi bi-person-circle"></i>
              </div>
              <!-- Título e subtítulo -->
              <div class="auth-modal-title-content">
                <h3 class="auth-modal-title">Autenticação</h3>
                <p class="auth-modal-subtitle">Entre ou crie sua conta</p>
              </div>
            </div>
            <!-- Botão de fechar -->
            <button 
              class="auth-modal-close" 
              @click="$emit('close')"
              aria-label="Fechar modal"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Corpo do modal -->
          <div class="auth-modal-body">
            <div class="auth-modal-content">
              <!-- Abas de navegação entre login e cadastro -->
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

              <!-- Exibição de erros -->
              <div v-if="erro" class="auth-alert auth-alert-error">
                <i class="bi bi-exclamation-triangle"></i>
                <span>{{ erro }}</span>
              </div>

              <!-- Formulário de Login - exibido quando aba === 'login' -->
              <form v-if="aba === 'login'" @submit.prevent="onLogin" class="auth-form">
                <!-- Campo de e-mail -->
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

                <!-- Campo de senha -->
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

                <!-- Checkbox "lembrar de mim" e link "esqueceu a senha" -->
                <div class="auth-remember">
                  <div class="auth-checkbox-group">
                    <input type="checkbox" id="lembrar" class="auth-checkbox" />
                    <label for="lembrar" class="auth-checkbox-label">Lembrar de mim</label>
                  </div>
                  <a href="#" class="auth-forgot-link">Esqueceu a senha?</a>
                </div>

                <!-- Botão de submit do login -->
                <button type="submit" class="auth-submit-btn" :disabled="carregando">
                  <span v-if="carregando" class="auth-spinner"></span>
                  <i v-else class="bi bi-box-arrow-in-right"></i>
                  <span>{{ carregando ? 'Entrando...' : 'Entrar' }}</span>
                </button>
              </form>

              <!-- Formulário de Cadastro - exibido quando aba === 'cadastro' -->
              <form v-else @submit.prevent="onCadastro" class="auth-form">
                <!-- Campo de nome -->
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

                <!-- Campo de e-mail -->
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

                <!-- Campo de senha -->
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

                <!-- Checkbox de aceitação dos termos -->
                <div class="auth-form-group">
                  <div class="auth-checkbox-group">
                    <input type="checkbox" id="termos" class="auth-checkbox" required />
                    <label for="termos" class="auth-checkbox-label">
                      Concordo com os <a href="#" class="auth-forgot-link">Termos de Uso</a> e 
                      <a href="#" class="auth-forgot-link">Política de Privacidade</a>
                    </label>
                  </div>
                </div>

                <!-- Botão de submit do cadastro -->
                <button type="submit" class="auth-submit-btn" :disabled="carregando">
                  <span v-if="carregando" class="auth-spinner"></span>
                  <i v-else class="bi bi-person-plus"></i>
                  <span>{{ carregando ? 'Cadastrando...' : 'Cadastrar' }}</span>
                </button>
              </form>

              <!-- Link para alternar entre as abas -->
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
// Importações necessárias do Vue
import { ref, watch, inject, onMounted, onUnmounted } from 'vue'
// Importação da store de usuário (Pinia)
import { useUserStore } from '../../services/stores/auth'
// Importação das APIs de autenticação
import { loginApi, cadastroApi } from '../../services/api/autenticacao'

// Props recebidas do componente pai
const props = defineProps({ show: Boolean })
// Emits para comunicação com o componente pai
const emit = defineEmits(['close'])

// Variáveis reativas locais
const aba = ref('login')           // Controla qual aba está ativa (login/cadastro)
const nome = ref('')               // Nome para cadastro
const email = ref('')              // E-mail para login/cadastro
const senha = ref('')              // Senha para login/cadastro
const erro = ref('')               // Mensagem de erro
const carregando = ref(false)      // Estado de carregamento
const userStore = useUserStore()   // Store do usuário
const showToastGlobal = inject('showToastGlobal') // Função global de toast (injetada)

// Função para lidar com clique no backdrop (fundo escuro)
function handleBackdropClick() {
  limparCampos()
  emit('close')
}

// Função para limpar todos os campos do formulário
function limparCampos() {
  nome.value = ''
  email.value = ''
  senha.value = ''
  erro.value = ''
  carregando.value = false
}

// Função para lidar com tecla ESC
function handleEscapeKey(event) {
  if (event.key === 'Escape' && props.show) {
    emit('close')
  }
}

// Lifecycle hooks
onMounted(() => {
  // Adiciona listener para tecla ESC
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  // Remove listener para tecla ESC
  document.removeEventListener('keydown', handleEscapeKey)
})

// Watcher para quando o modal é aberto/fechado
watch(() => props.show, (val) => {
  if (val) {
    // Reseta para aba de login e limpa campos
    aba.value = 'login'
    limparCampos()
  }
})

// Watcher para quando alterna entre abas
watch(() => aba.value, (newAba) => {
  // Limpa campos específicos ao alternar abas
  if (newAba === 'login') {
    nome.value = ''
  } else if (newAba === 'cadastro') {
    // Remove espaços em branco dos campos
    email.value = email.value.trim()
    senha.value = senha.value.trim()
  }
  erro.value = ''
})

// Watcher para garantir que inputs sempre tenham valores válidos
watch([email, senha, nome], ([newEmail, newSenha, newNome]) => {
  // Remove espaços em branco extras automaticamente
  if (newEmail !== undefined) email.value = newEmail.trim()
  if (newSenha !== undefined) senha.value = newSenha.trim()
  if (newNome !== undefined) nome.value = newNome.trim()
})

// Função para processar login
async function onLogin() {
  erro.value = ''
  carregando.value = true
  try {
    // Chama API de login
    const response = await loginApi(email.value, senha.value)
    if (response.token && response.user) {
      // Salva dados de autenticação na store
      userStore.setAuth(response)
      showToastGlobal('Login realizado com sucesso!', 'success')
      // Fecha modal após 1.2 segundos
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

// Função para processar cadastro
async function onCadastro() {
  erro.value = ''
  carregando.value = true
  try {
    // Chama API de cadastro
    const response = await cadastroApi(nome.value, email.value, senha.value)
    showToastGlobal('Cadastro realizado com sucesso!', 'success')
    // Muda para aba de login após 1.2 segundos
    setTimeout(() => {
      aba.value = 'login'
    }, 1200)
  } catch (e) {
    erro.value = typeof e === 'string' ? e : 'Erro ao cadastrar.'
    showToastGlobal(erro.value, 'danger')
  } finally {
    carregando.value = false
  }
}
</script>


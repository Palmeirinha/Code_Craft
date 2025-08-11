<template>
  <!-- Modal de Autenticação - Login e Registro -->
  <Teleport to="body">
    <transition name="auth-modal-fade" appear>
      <div v-if="isOpen" class="auth-modal-overlay" @click="fecharModal">
        <div class="auth-modal-container" @click.stop>
          <!-- Header do Modal -->
          <div class="auth-modal-header">
            <h3 class="auth-modal-title">
              {{ modo === 'login' ? 'Entrar' : 'Criar Conta' }}
            </h3>
            <button class="auth-modal-close" @click="fecharModal">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Conteúdo do Modal -->
          <div class="auth-modal-body">
            <!-- Formulário de Login -->
            <form v-if="modo === 'login'" @submit.prevent="fazerLogin" :key="'login-' + formKey" class="auth-form">
              <div class="auth-form-group">
                <label for="login-email" class="auth-form-label">Email</label>
                <input
                  id="login-email"
                  v-model="formLogin.email"
                  type="email"
                  class="auth-form-input"
                  placeholder="Digite seu email"
                  autocomplete="off"
                  required
                />
              </div>
              
              <div class="auth-form-group">
                <label for="login-password" class="auth-form-label">Senha</label>
                <input
                  id="login-password"
                  v-model="formLogin.senha"
                  type="password"
                  class="auth-form-input"
                  placeholder="Digite sua senha"
                  autocomplete="off"
                  required
                />
              </div>
              
              <button type="submit" class="auth-btn auth-btn-primary" :disabled="carregando">
                <span v-if="carregando" class="auth-spinner"></span>
                <span v-else>Entrar</span>
              </button>
            </form>

            <!-- Formulário de Registro -->
            <form v-else @submit.prevent="fazerRegistro" :key="'registro-' + formKey" class="auth-form">
              <div class="auth-form-group">
                <label for="register-name" class="auth-form-label">Nome Completo</label>
                <input
                  id="register-name"
                  v-model="formRegistro.nome"
                  type="text"
                  class="auth-form-input"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>
              
              <div class="auth-form-group">
                <label for="register-email" class="auth-form-label">Email</label>
                <input
                  id="register-email"
                  v-model="formRegistro.email"
                  type="email"
                  class="auth-form-input"
                  placeholder="Digite seu email"
                  autocomplete="off"
                  required
                />
              </div>
              
              <div class="auth-form-group">
                <label for="register-password" class="auth-form-label">Senha</label>
                <input
                  id="register-password"
                  v-model="formRegistro.senha"
                  type="password"
                  class="auth-form-input"
                  placeholder="Digite sua senha"
                  autocomplete="off"
                  required
                />
              </div>
              
              <div class="auth-form-group">
                <label for="register-confirm-password" class="auth-form-label">Confirmar Senha</label>
                <input
                  id="register-confirm-password"
                  v-model="formRegistro.confirmarSenha"
                  type="password"
                  class="auth-form-input"
                  placeholder="Confirme sua senha"
                  autocomplete="off"
                  required
                />
              </div>
              
              <button type="submit" class="auth-btn auth-btn-primary" :disabled="carregando">
                <span v-if="carregando" class="auth-spinner"></span>
                <span v-else>Criar Conta</span>
              </button>
            </form>

            <!-- Links de Navegação entre Modos -->
            <div class="auth-modal-footer">
              <p v-if="modo === 'login'" class="auth-switch-text">
                Não tem uma conta?
                <button type="button" class="auth-switch-btn" @click="alternarModo">
                  Criar conta
                </button>
              </p>
              <p v-else class="auth-switch-text">
                Já tem uma conta?
                <button type="button" class="auth-switch-btn" @click="alternarModo">
                  Fazer login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>

import { ref, reactive, watch, inject } from 'vue'
import { useUserStore } from '../../services/stores/auth'

// Props e Emits
const props = defineProps({
  isOpen: Boolean,
  modo: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'registro'].includes(value)
  }
})

const emit = defineEmits(['close', 'login-success', 'registro-success'])


const showToastGlobal = inject('showToastGlobal')


const userStore = useUserStore()

// Estados reativos
const carregando = ref(false)
const formKey = ref(0) 

// Formulários
const formLogin = reactive({
  email: '',
  senha: ''
})

const formRegistro = reactive({
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: ''
})

// Funções principais
function fecharModal() {
  limparCampos()
  emit('close')
}

function alternarModo() {
  limparCampos()
  emit('close')
  // Emite evento para o componente pai alternar o modo
  emit('modo-alterado', props.modo === 'login' ? 'registro' : 'login')
}

function limparCampos() {
  
  Object.assign(formLogin, { email: '', senha: '' })
  Object.assign(formRegistro, { nome: '', email: '', senha: '', confirmarSenha: '' })
  formKey.value++
}

async function fazerLogin() {
  if (carregando.value) return
  
  carregando.value = true
  
  try {
    await userStore.login(formLogin.email, formLogin.senha)
    
    showToastGlobal && showToastGlobal('Login realizado com sucesso!', 'success')
    emit('login-success')
    fecharModal()
    
  } catch (error) {
    const mensagem = error.response?.data?.detail || 'Erro ao fazer login. Tente novamente.'
    showToastGlobal && showToastGlobal(mensagem, 'danger')
  } finally {
    carregando.value = false
  }
}

async function fazerRegistro() {
  if (carregando.value) return
  
  // Validação de senhas
  if (formRegistro.senha !== formRegistro.confirmarSenha) {
    showToastGlobal && showToastGlobal('As senhas não coincidem!', 'danger')
    return
  }
  
  carregando.value = true
  
  try {
    await userStore.registrar(formRegistro.nome, formRegistro.email, formRegistro.senha)
    
    showToastGlobal && showToastGlobal('Conta criada com sucesso!', 'success')
    emit('registro-success')
    fecharModal()
    
  } catch (error) {
    const mensagem = error.response?.data?.detail || 'Erro ao criar conta. Tente novamente.'
    showToastGlobal && showToastGlobal(mensagem, 'danger')
  } finally {
    carregando.value = false
  }
}

// Watchers
watch(() => props.isOpen, (novoValor) => {
  if (!novoValor) {
    limparCampos()
  }
})
</script>



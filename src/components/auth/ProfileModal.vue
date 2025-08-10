<template>
  <div v-if="show" class="perfil-modal-backdrop" @click="$emit('close')">
    <div class="perfil-modal" @click.stop>
      <div class="perfil-modal-content">
        
        <!-- Modal Header -->
        <div class="perfil-modal-header">
          <div class="perfil-header-content">
            <h3 class="perfil-modal-title">
              <i class="bi bi-person-circle"></i>Perfil do Usuário
            </h3>
            <p class="perfil-modal-subtitle">Gerencie suas informações pessoais</p>
          </div>
          <button type="button" class="perfil-close-btn" @click="$emit('close')" title="Fechar">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="perfil-modal-body">
          <form @submit.prevent="onSalvar" class="perfil-modal-form">
            
            <!-- Profile Photo Section -->
            <div class="perfil-profile-photo-section">
              <div class="perfil-photo-container">
                <div class="perfil-photo-wrapper">
                  <img 
                    v-if="profilePhoto" 
                    :src="profilePhoto" 
                    alt="Foto de perfil"
                    class="perfil-profile-photo"
                  />
                  <div v-else class="perfil-profile-photo-placeholder">
                    <i class="bi bi-person"></i>
                  </div>
                  <div v-if="carregandoImagem" class="perfil-photo-loading">
                    <div class="perfil-spinner" role="status">
                      <span class="visually-hidden">Carregando...</span>
                    </div>
                  </div>
                </div>
                
                <div class="perfil-photo-actions">
                  <label class="perfil-upload-btn">
                    <i class="bi bi-camera"></i>Alterar Foto
                    <input 
                      type="file" 
                      accept="image/*" 
                      @change="onPhotoChange"
                      class="perfil-file-input"
                    />
                  </label>
                  
                  <div v-if="sucessoImagem" class="perfil-upload-success">
                    <i class="bi bi-check-circle"></i>Foto atualizada!
                  </div>
                  <div v-if="erroImagem" class="perfil-upload-error">
                    <i class="bi bi-exclamation-triangle"></i>{{ erroImagem }}
                  </div>
                </div>
              </div>
            </div>

            <!-- User Info Section -->
            <div class="perfil-user-info-section">
              <h4 class="perfil-section-title">
                <i class="bi bi-info-circle"></i>Informações Pessoais
              </h4>
              
              <div class="perfil-form-group">
                <label class="perfil-form-label">Nome Completo</label>
                <div class="perfil-input-wrapper">
                  <i class="bi bi-person perfil-input-icon"></i>
                  <input 
                    type="text" 
                    v-model="nome"
                    :readonly="!editando"
                    class="perfil-form-control"
                    :class="{ readonly: !editando }"
                  />
                </div>
              </div>
              
              <div class="perfil-form-group">
                <label class="perfil-form-label">E-mail</label>
                <div class="perfil-input-wrapper">
                  <i class="bi bi-envelope perfil-input-icon"></i>
                  <input 
                    type="email" 
                    v-model="email"
                    :readonly="!editando"
                    class="perfil-form-control"
                    :class="{ readonly: !editando }"
                  />
                </div>
              </div>
              
              <div class="perfil-form-group">
                <label class="perfil-form-label">Função</label>
                <div class="perfil-input-wrapper">
                  <i class="bi bi-shield-check perfil-input-icon"></i>
                  <input 
                    type="text" 
                    :value="role"
                    readonly
                    class="perfil-form-control readonly"
                  />
                  <span class="perfil-role-badge" :class="getRoleClass(role)">
                    {{ role.toUpperCase() }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Token Info -->
            <div v-if="tokenExpiracao" class="perfil-token-info">
              <div class="perfil-token-header">
                <i class="bi bi-clock"></i>
                <span>Token expira em:</span>
              </div>
              <div class="perfil-token-time" :class="getTokenClass()">
                {{ formatTokenExpiration() }}
              </div>
            </div>

            <!-- Actions Section -->
            <div class="perfil-actions-section">
              <div v-if="editando" class="perfil-edit-actions">
                <button type="button" class="perfil-btn perfil-btn-secondary" @click="cancelarEdicao">
                  <i class="bi bi-x-circle"></i>Cancelar
                </button>
                <button type="submit" class="perfil-btn perfil-btn-primary" :disabled="carregando">
                  <span v-if="carregando" class="perfil-spinner"></span>
                  <i v-else class="bi bi-check-circle"></i>
                  {{ carregando ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
              
              <div v-else class="perfil-view-actions">
                <button type="button" class="perfil-btn perfil-btn-primary" @click="editando = true">
                  <i class="bi bi-pencil-square"></i>Editar Perfil
                </button>
                <button 
                  type="button" 
                  class="perfil-btn perfil-btn-danger"
                  @click="confirmarExclusao = !confirmarExclusao"
                >
                  <i v-if="!confirmarExclusao" class="bi bi-trash"></i>
                  <i v-else class="bi bi-exclamation-triangle"></i>
                  {{ confirmarExclusao ? 'Confirmar Exclusão' : 'Excluir Conta' }}
                </button>
                <button 
                  v-if="confirmarExclusao"
                  type="button" 
                  class="perfil-btn perfil-btn-danger" 
                  @click="excluirConta"
                  :disabled="excluindo"
                >
                  <span v-if="excluindo" class="perfil-spinner"></span>
                  <i v-else class="bi bi-trash"></i>
                  {{ excluindo ? 'Excluindo...' : 'Confirmar' }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Alerts -->
  <div v-if="erro" class="perfil-alert perfil-alert-danger">
    <i class="bi bi-exclamation-triangle"></i>{{ erro }}
  </div>
  <div v-if="sucesso" class="perfil-alert perfil-alert-success">
    <i class="bi bi-check-circle"></i>Perfil atualizado com sucesso!
  </div>
</template>

<script setup>
import { ref, watch, inject, computed } from 'vue'
import { useUserStore } from '../../services/stores/auth'
import { getUserMe, putUserMe, deleteUserMe, uploadUserImage } from '../../services/api/users'
import { getImageUrl } from '../../services/api/utils'

function getTokenExpiration(token) {
  if (!token || token.split('.').length !== 3) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return new Date(payload.exp * 1000);
    }
  } catch {}
  return null;
}

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])
const userStore = useUserStore()
const showToastGlobal = inject('showToastGlobal')

const nome = ref('')
const email = ref('')
const role = ref('')
const imagePath = ref('')
const editando = ref(false)
const carregando = ref(false)
const erro = ref('')
const sucesso = ref(false)
const carregandoImagem = ref(false)
const sucessoImagem = ref(false)
const erroImagem = ref('')
const confirmarExclusao = ref(false)
const excluindo = ref(false)
const tokenExpiracao = ref(null)

// Computed property for profile photo
const profilePhoto = computed(() => {
  return imagePath.value || null
})

watch(() => props.show, async (val) => {
  if (val) {
    await carregarPerfil()
    editando.value = false
    erro.value = ''
    sucesso.value = false
    erroImagem.value = ''
    sucessoImagem.value = false
    confirmarExclusao.value = false
    tokenExpiracao.value = getTokenExpiration(localStorage.getItem('token'))
  }
})

function getRoleClass(role) {
  const classMap = {
    'admin': 'perfil-role-admin',
    'moderator': 'perfil-role-moderator',
    'user': 'perfil-role-user'
  }
  return classMap[role] || 'perfil-role-user'
}

function getTokenClass() {
  if (!tokenExpiracao.value) return 'perfil-token-unknown'
  const now = new Date()
  const diff = tokenExpiracao.value - now
  const hours = diff / (1000 * 60 * 60)
  
  if (hours < 1) return 'perfil-token-expired'
  if (hours < 24) return 'perfil-token-warning'
  return 'perfil-token-ok'
}

function formatTokenExpiration() {
  if (!tokenExpiracao.value) return 'Desconhecido'
  
  const now = new Date()
  const diff = tokenExpiracao.value - now
  
  if (diff <= 0) return 'Expirado'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

async function carregarPerfil() {
  carregando.value = true
  try {
    const user = await getUserMe()
    nome.value = user.name || user.nome || ''
    email.value = user.email || ''
    role.value = user.role || ''
    imagePath.value = getImageUrl(user.image_path);
  } catch (e) {
    nome.value = userStore.user?.name || userStore.user?.nome || ''
    email.value = userStore.user?.email || ''
    role.value = userStore.user?.role || ''
    imagePath.value = getImageUrl(userStore.user?.image_path);
  } finally {
    carregando.value = false
  }
}

function cancelarEdicao() {
  carregarPerfil()
  editando.value = false
  erro.value = ''
  sucesso.value = false
}

async function onSalvar() {
  erro.value = ''
  sucesso.value = false
  carregando.value = true
  try {
    const atualizado = await putUserMe({ name: nome.value, email: email.value })
    userStore.user = { ...userStore.user, ...atualizado }
    localStorage.setItem('user', JSON.stringify(userStore.user))
    sucesso.value = true
    editando.value = false
    await carregarPerfil()
    showToastGlobal && showToastGlobal('Perfil atualizado com sucesso!', 'success')
  } catch (e) {
    const errorMsg = typeof e === 'string' ? e : 'Erro ao atualizar perfil.'
    erro.value = errorMsg
    showToastGlobal && showToastGlobal(errorMsg, 'danger')
  } finally {
    carregando.value = false
  }
}

async function onPhotoChange(e) {
  erroImagem.value = ''
  sucessoImagem.value = false
  carregandoImagem.value = true
  try {
    const file = e.target.files[0]
    if (!file) return
    await uploadUserImage(file)
    sucessoImagem.value = true
    await carregarPerfil()
    showToastGlobal && showToastGlobal('Foto de perfil atualizada!', 'success')
  } catch (e) {
    const errorMsg = typeof e === 'string' ? e : 'Erro ao enviar imagem.'
    erroImagem.value = errorMsg
    showToastGlobal && showToastGlobal(errorMsg, 'danger')
  } finally {
    carregandoImagem.value = false
  }
}

async function excluirConta() {
  if (!confirmarExclusao.value) {
    confirmarExclusao.value = true
    return
  }
  excluindo.value = true
  try {
    await deleteUserMe()
    userStore.logout()
    showToastGlobal && showToastGlobal('Conta excluída com sucesso', 'success')
    window.location.href = '/'
  } catch (e) {
    const errorMsg = typeof e === 'string' ? e : 'Erro ao excluir conta.'
    showToastGlobal && showToastGlobal(errorMsg, 'danger')
  } finally {
    excluindo.value = false
  }
}
</script>


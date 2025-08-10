import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  function setAuth(data) {
    token.value = data.token
    // Garante que o usuário tenha uma role padrão se não estiver definida
    const userData = {
      ...data.user,
      role: (data.user.role || 'CLIENT').toUpperCase()
    }
    // Força role maiúsculo mesmo se vier de login de teste
    if (userData.role) userData.role = userData.role.toUpperCase()
    user.value = userData
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  function updateUserRole(role) {
    if (user.value) {
      user.value.role = role
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  // Valida se o token ainda é válido (simulação)
  function validateToken() {
    if (!token.value || !user.value) {
      logout()
      return false
    }
    return true
  }

  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value && validateToken()
  })
  
  const userRole = computed(() => user.value?.role || 'CLIENT')

  return { 
    token, 
    user, 
    setAuth, 
    logout, 
    updateUserRole,
    validateToken,
    isAuthenticated,
    userRole
  }
}) 
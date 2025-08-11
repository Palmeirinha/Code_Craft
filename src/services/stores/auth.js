// Importação das funcionalidades principais do Pinia para gerenciamento de estado
import { defineStore } from 'pinia'
// Importação das funcionalidades reativas do Vue 3
import { ref, computed } from 'vue'

// ===== STORE DE AUTENTICAÇÃO =====
// Esta store gerencia todo o estado relacionado à autenticação do usuário
// Inclui token, dados do usuário, funções de login/logout e validações
export const useUserStore = defineStore('user', () => {
  // ===== ESTADO REATIVO =====
  // Variáveis reativas que armazenam o estado da autenticação
  
  // Token de autenticação JWT obtido do localStorage ou string vazia
  const token = ref(localStorage.getItem('token') || '')
  
  // Dados do usuário autenticado obtidos do localStorage ou null
  // JSON.parse converte a string do localStorage de volta para objeto
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  // ===== FUNÇÕES DE AUTENTICAÇÃO =====
  
  /**
   * Função para definir dados de autenticação após login bem-sucedido
   * Armazena token e dados do usuário tanto no estado reativo quanto no localStorage
   * 
   * @param {Object} data - Dados retornados pela API de login
   * @param {string} data.token - Token JWT de autenticação
   * @param {Object} data.user - Dados do usuário (id, name, email, role, etc.)
   */
  function setAuth(data) {
    // Atualiza o token no estado reativo
    token.value = data.token
    
    // Prepara os dados do usuário garantindo que a role esteja definida
    const userData = {
      ...data.user,  // Espalha todos os dados originais do usuário
      role: (data.user.role || 'CLIENT').toUpperCase()  // Define role padrão 'CLIENT' se não existir
    }
    
    // Força a role para maiúsculo mesmo se vier de login de teste
    // Isso garante consistência no sistema de roles
    if (userData.role) userData.role = userData.role.toUpperCase()
    
    // Atualiza o usuário no estado reativo
    user.value = userData
    
    // Persiste os dados no localStorage para manter a sessão entre recarregamentos
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  /**
   * Função para fazer logout do usuário
   * Remove token e dados do usuário tanto do estado quanto do localStorage
   * Efetivamente "limpa" a sessão do usuário
   */
  function logout() {
    // Limpa o token no estado reativo
    token.value = ''
    
    // Limpa os dados do usuário no estado reativo
    user.value = null
    
    // Remove os dados do localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  /**
   * Função para atualizar a role do usuário atual
   * Útil para casos onde a role pode ser alterada durante a sessão
   * 
   * @param {string} role - Nova role para o usuário (ex: 'ADMIN', 'MODERATOR', 'CLIENT')
   */
  function updateUserRole(role) {
    // Verifica se existe um usuário logado antes de tentar atualizar
    if (user.value) {
      // Atualiza a role no estado reativo
      user.value.role = role
      
      // Persiste a mudança no localStorage
      localStorage.setItem('user', JSON.stringify(user.value))
    }
  }

  // ===== VALIDAÇÃO DE TOKEN =====
  
  /**
   * Função para validar se o token atual ainda é válido
   * Atualmente implementa uma validação básica (simulação)
   * Em produção, poderia fazer uma requisição para a API para verificar validade
   * 
   * @returns {boolean} true se o token for válido, false caso contrário
   */
  function validateToken() {
    // Verifica se existe tanto token quanto dados do usuário
    if (!token.value || !user.value) {
      // Se algum dos dois estiver ausente, faz logout automático
      logout()
      return false
    }
    // Por enquanto, retorna true se ambos existirem
    // Em implementação real, poderia verificar expiração do JWT
    return true
  }

  // ===== COMPUTED PROPERTIES =====
  // Propriedades computadas que derivam do estado reativo
  
  /**
   * Propriedade computada que indica se o usuário está autenticado
   * Combina verificação de token, dados do usuário e validação
   * 
   * @returns {boolean} true se o usuário estiver autenticado, false caso contrário
   */
  const isAuthenticated = computed(() => {
    // Retorna true apenas se:
    // 1. Token existir
    // 2. Dados do usuário existirem
    // 3. Token for validado com sucesso
    return !!token.value && !!user.value && validateToken()
  })
  
  /**
   * Propriedade computada que retorna a role atual do usuário
   * Fornece uma role padrão 'CLIENT' se o usuário não estiver logado
   * 
   * @returns {string} Role do usuário (ADMIN, MODERATOR, CLIENT) ou 'CLIENT' como padrão
   */
  const userRole = computed(() => user.value?.role || 'CLIENT')

  // ===== EXPORTAÇÃO =====
  // Retorna todas as variáveis e funções que devem estar disponíveis para uso externo
  
  return { 
    // Estado reativo
    token,        // Token de autenticação
    user,         // Dados do usuário
    
    // Funções de autenticação
    setAuth,      // Define dados de autenticação (login)
    logout,       // Remove autenticação (logout)
    updateUserRole, // Atualiza role do usuário
    
    // Funções de validação
    validateToken, // Valida se o token é válido
    
    // Propriedades computadas
    isAuthenticated, // Indica se o usuário está autenticado
    userRole         // Role atual do usuário
  }
}) 
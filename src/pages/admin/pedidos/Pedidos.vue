<template>
  <!-- Seção principal de gestão de pedidos -->
  <section class="pedidos-section">
    <div class="pedidos-container">
      <!-- Header Section - Título e descrição da página -->
      <div class="pedidos-header">
        <h1 class="pedidos-title">
          <i class="bi bi-clipboard-data"></i>
          Gestão de Pedidos
        </h1>
        <p class="pedidos-subtitle">Gerencie todos os pedidos da plataforma</p>
      </div>

      <!-- Controls - Botões de controle e filtros -->
      <div class="pedidos-controls">
        <div class="pedidos-controls-content">
          <div class="pedidos-controls-left">
            <!-- Botão para atualizar/recarregar dados -->
            <button class="pedidos-btn pedidos-btn-primary" @click="carregar" :disabled="carregando">
              <i class="bi bi-arrow-clockwise" :class="{ 'pedidos-spinning': carregando }"></i>
              Atualizar
            </button>
            <!-- Select para filtrar por status -->
            <select v-model="filtroStatus" @change="filtrarPedidos" class="pedidos-select">
              <option value="">Todos os Status</option>
              <option value="PENDING">Pendente</option>
              <option value="PROCESSING">Processando</option>
              <option value="SHIPPED">Enviado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Statistics Cards - Cards com estatísticas dos pedidos -->
      <div class="pedidos-stats">
        <!-- Card do total de pedidos -->
        <div class="pedidos-stats-card pedidos-stats-total">
          <div class="pedidos-stats-content">
            <div class="pedidos-stats-icon">
              <i class="bi bi-cart-check"></i>
            </div>
            <h3 class="pedidos-stats-number">{{ estatisticas.total }}</h3>
            <p class="pedidos-stats-label">Total de Pedidos</p>
          </div>
        </div>
        
        <!-- Card dos pedidos pendentes -->
        <div class="pedidos-stats-card pedidos-stats-pending">
          <div class="pedidos-stats-content">
            <div class="pedidos-stats-icon">
              <i class="bi bi-clock-history"></i>
            </div>
            <h3 class="pedidos-stats-number">{{ estatisticas.pendentes }}</h3>
            <p class="pedidos-stats-label">Pendentes</p>
          </div>
        </div>
        
        <!-- Card dos pedidos processando -->
        <div class="pedidos-stats-card pedidos-stats-processing">
          <div class="pedidos-stats-content">
            <div class="pedidos-stats-icon">
              <i class="bi bi-gear-fill"></i>
            </div>
            <h3 class="pedidos-stats-number">{{ estatisticas.processando }}</h3>
            <p class="pedidos-stats-label">Processando</p>
          </div>
        </div>
        
        <!-- Card dos pedidos concluídos -->
        <div class="pedidos-stats-card pedidos-stats-completed">
          <div class="pedidos-stats-content">
            <div class="pedidos-stats-icon">
              <i class="bi bi-check-circle-fill"></i>
            </div>
            <h3 class="pedidos-stats-number">{{ estatisticas.concluidos }}</h3>
            <p class="pedidos-stats-label">Concluídos</p>
          </div>
        </div>
      </div>

      <!-- Loading State - Estado de carregamento -->
      <div v-if="carregando" class="pedidos-loading">
        <div class="pedidos-spinner"></div>
        <p class="pedidos-loading-text">Carregando pedidos...</p>
      </div>

      <!-- Empty State - Estado quando não há pedidos -->
      <div v-else-if="pedidosFiltrados.length === 0" class="pedidos-empty">
        <div class="pedidos-empty-icon">
          <i class="bi bi-archive"></i>
        </div>
        <h2 class="pedidos-empty-title">Nenhum pedido encontrado</h2>
        <p class="pedidos-empty-description">Não há pedidos que correspondam aos filtros aplicados.</p>
        <div class="pedidos-empty-tips">
          <div class="pedidos-tip-item">
            <i class="bi bi-lightbulb"></i>
            <span>Tente remover os filtros para ver todos os pedidos</span>
          </div>
          <div class="pedidos-tip-item">
            <i class="bi bi-arrow-clockwise"></i>
            <span>Clique em "Atualizar" para recarregar os dados</span>
          </div>
        </div>
      </div>

      <!-- Orders Table - Tabela principal dos pedidos -->
      <div v-else class="pedidos-table-container">
        <div class="pedidos-table-responsive">
          <table class="pedidos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Data</th>
                <th>Status</th>
                <th>Produtos</th>
                <th>Valor Total</th>
                <th>Endereço</th>
                <th>Cupom</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <!-- Loop através dos pedidos paginados -->
              <tr v-for="pedido in pedidosPaginados" :key="pedido.id" class="pedidos-table-row">
                <!-- Coluna ID do pedido -->
                <td class="pedidos-td-id">
                  <div class="pedidos-info">
                    <span class="pedidos-id">#{{ pedido.id }}</span>
                  </div>
                </td>
                <!-- Coluna ID do usuário -->
                <td class="pedidos-td-user">
                  <div class="pedidos-info">
                    <span class="pedidos-user">ID: {{ pedido.user_id }}</span>
                  </div>
                </td>
                <!-- Coluna data do pedido -->
                <td class="pedidos-td-date">
                  <div class="pedidos-info">
                    <span class="pedidos-date">{{ formatarData(pedido.order_date) }}</span>
                  </div>
                </td>
                <!-- Coluna status com badge colorido -->
                <td class="pedidos-td-status">
                  <span class="pedidos-status-badge" :class="pedidosStatusClass(pedido.status)">
                    {{ traduzirStatus(pedido.status) }}
                  </span>
                </td>
                <!-- Coluna produtos do pedido -->
                <td class="pedidos-td-products">
                  <div class="pedidos-products-info">
                    <div v-for="prod in pedido.products" :key="prod.name" class="pedidos-produto-item">
                      <span class="pedidos-produto-name">{{ prod.name }}</span>
                      <span class="pedidos-produto-price">R$ {{ prod.price }}</span>
                      <span v-if="prod.category" class="pedidos-categoria-badge">
                        {{ prod.category.name }}
                      </span>
                    </div>
                  </div>
                </td>
                <!-- Coluna valores (subtotal, desconto, total) -->
                <td class="pedidos-td-total">
                  <div class="pedidos-total-info">
                    <div class="pedidos-total-subtotal">
                      <span class="pedidos-total-label">Subtotal:</span>
                      <span class="pedidos-total-value">R$ {{ calcularSubtotal(pedido.products) }}</span>
                    </div>
                    <div v-if="pedido.coupon_id" class="pedidos-total-desconto">
                      <span class="pedidos-total-label">Desconto:</span>
                      <span class="pedidos-total-value desconto">- R$ {{ calcularDesconto(pedido.products, pedido.coupon_id) }}</span>
                    </div>
                    <div class="pedidos-total-final">
                      <span class="pedidos-total-label">Total:</span>
                      <span class="pedidos-total-value final">R$ {{ calcularTotalComDesconto(pedido.products, pedido.coupon_id) }}</span>
                    </div>
                  </div>
                </td>
                <!-- Coluna endereço de entrega -->
                <td class="pedidos-td-address">
                  <div class="pedidos-address-info">
                    <div class="pedidos-address-main">
                      {{ getEnderecoCompleto(pedido.address_id) }}
                    </div>
                    <div class="pedidos-address-id">
                      ID: {{ pedido.address_id }}
                    </div>
                  </div>
                </td>
                <!-- Coluna cupom aplicado -->
                <td class="pedidos-td-coupon">
                  <div class="pedidos-cupom-info">
                    <span v-if="pedido.coupon_id" class="pedidos-cupom-id">
                      ID: {{ pedido.coupon_id }}
                      <span v-if="getCupomPercentual(pedido.coupon_id)" class="pedidos-cupom-percentual">
                        ({{ getCupomPercentual(pedido.coupon_id) }}%)
                      </span>
                    </span>
                    <span v-else class="pedidos-sem-cupom">Sem cupom</span>
                  </div>
                </td>
                <!-- Coluna ações (mudar status, cancelar) -->
                <td class="pedidos-td-actions">
                  <div class="pedidos-actions">
                    <!-- Select para mudar status do pedido -->
                    <select v-model="pedido.status" class="pedidos-status-select" @change="atualizarStatus(pedido)">
                      <option value="PENDING">Pendente</option>
                      <option value="PROCESSING">Processando</option>
                      <option value="SHIPPED">Enviado</option>
                      <option value="COMPLETED">Concluído</option>
                      <option value="CANCELED">Cancelado</option>
                    </select>
                    <!-- Botão para cancelar pedido -->
                    <button 
                      class="pedidos-btn pedidos-btn-danger pedidos-btn-sm" 
                      @click="cancelar(pedido.id)"
                      :disabled="pedido.status === 'CANCELED' || pedido.status === 'COMPLETED'"
                      title="Cancelar pedido"
                    >
                      <i class="bi bi-x-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação - Navegação entre páginas -->
        <div v-if="totalPaginas > 1" class="pedidos-pagination">
          <button 
            class="pedidos-btn pedidos-btn-outline pedidos-btn-sm" 
            :disabled="paginaAtual === 1" 
            @click="paginaAtual--"
          >
            <i class="bi bi-chevron-left"></i>Anterior
          </button>
          <span class="pedidos-pagination-info">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
          <button 
            class="pedidos-btn pedidos-btn-outline pedidos-btn-sm" 
            :disabled="paginaAtual === totalPaginas" 
            @click="paginaAtual++"
          >
            Próxima<i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Toast Notifications - Sistema de notificações -->
      <div class="pedidos-toast-container">
        <div v-for="(toast, i) in toasts" :key="i" :class="['pedidos-toast', 'pedidos-toast-' + toast.type, 'pedidos-toast-show']" role="alert">
          <div class="pedidos-toast-content">
            <div class="pedidos-toast-body">
              <i v-if="toast.type==='success'" class="bi bi-check-circle-fill"></i>
              <i v-else class="bi bi-x-circle-fill"></i>
              {{ toast.msg }}
            </div>
            <button type="button" class="pedidos-toast-close" @click="removerToast(i)" aria-label="Close">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Importações do Vue 3 Composition API
import { ref, onMounted, computed } from 'vue'
// Importações das APIs necessárias
import { listarTodosPedidos, atualizarStatusPedido, cancelarPedido } from '../../../services/api/orders'
import { listarCategoriasPorUsuario } from '../../../services/api/categorias'
import { listarCupons } from '../../../services/api/promocoes'
import { listarEnderecos } from '../../../services/api/endereco'
// Importação da store de autenticação
import { useUserStore } from '../../../services/stores/auth'

// Lógica de filtragem por papel do usuário:
// - ADMIN: Vê apenas pedidos relacionados às suas categorias (filtro aplicado)
// - CLIENT: Não tem acesso a esta página (controlado pelo router)

// Estados reativos principais
const pedidos = ref([])                                    // Lista completa de pedidos carregados
const pedidosFiltrados = ref([])                           // Lista de pedidos após aplicação dos filtros
const carregando = ref(false)                              // Estado de carregamento da página
const toasts = ref([])                                     // Lista de notificações toast
const filtroStatus = ref('')                               // Filtro selecionado por status
const categoriasUsuario = ref([])                          // Categorias do usuário admin logado
const mostrarApenasMinhasCategorias = ref(false)           // Flag para filtrar apenas categorias do usuário
const cupons = ref([])                                     // Lista de cupons para cálculos de desconto
const enderecos = ref([])                                  // Lista de endereços para exibição completa

// Store do usuário para verificar papel e permissões
const userStore = useUserStore()

// Função para ajustar filtro de categorias baseado no papel do usuário
const ajustarFiltroCategorias = () => {
  // Apenas admins devem filtrar por suas categorias
  mostrarApenasMinhasCategorias.value = userStore.userRole === 'ADMIN'
}

// Configurações de paginação
const paginaAtual = ref(1)                                 // Página atual sendo exibida
const pedidosPorPagina = 10                                // Quantidade de pedidos por página

// Estatísticas computadas baseadas nos pedidos filtrados
const estatisticas = computed(() => {
  // Para admins, usar pedidosFiltrados (que pode estar filtrado por categorias)
  const pedidosParaEstatisticas = pedidosFiltrados.value
  const total = pedidosParaEstatisticas.length
  const pendentes = pedidosParaEstatisticas.filter(p => p.status === 'PENDING').length
  const processando = pedidosParaEstatisticas.filter(p => p.status === 'PROCESSING').length
  const concluidos = pedidosParaEstatisticas.filter(p => p.status === 'COMPLETED').length
  
  return { total, pendentes, processando, concluidos }
})

// Computed properties para paginação
const totalPaginas = computed(() => {
  return Math.ceil(pedidosFiltrados.value.length / pedidosPorPagina)
})

const pedidosPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * pedidosPorPagina
  const end = start + pedidosPorPagina
  return pedidosFiltrados.value.slice(start, end)
})

// Função para exibir notificações toast
function showToastGlobal(msg, type = 'danger') {
  toasts.value.push({ msg, type })
  setTimeout(() => { toasts.value.shift() }, 4000)
}

// Função para remover toast específico
function removerToast(i) { 
  toasts.value.splice(i, 1) 
}

// Função para formatar data em formato brasileiro
function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleString('pt-BR')
}

// Função para traduzir status do inglês para português
function traduzirStatus(status) {
  const traducoes = {
    'PENDING': 'Pendente',
    'PROCESSING': 'Processando',
    'SHIPPED': 'Enviado',
    'COMPLETED': 'Concluído',
    'CANCELED': 'Cancelado'
  }
  return traducoes[status] || status
}

// Função para retornar classe CSS baseada no status do pedido
function pedidosStatusClass(status) {
  if (status === 'PENDING') return 'pedidos-bg-warning'
  if (status === 'PROCESSING') return 'pedidos-bg-info'
  if (status === 'SHIPPED') return 'pedidos-bg-primary'
  if (status === 'COMPLETED') return 'pedidos-bg-success'
  if (status === 'CANCELED') return 'pedidos-bg-danger'
  return 'pedidos-bg-secondary'
}

// Funções para cálculo de valores dos pedidos
// Calcula subtotal dos produtos
function calcularSubtotal(products) {
  if (!products || !Array.isArray(products)) return '0,00'
  const subtotal = products.reduce((total, product) => {
    const price = parseFloat(String(product.price).replace(',', '.')) || 0
    return total + price
  }, 0)
  return subtotal.toFixed(2).replace('.', ',')
}

// Calcula valor do desconto baseado no cupom
function calcularDesconto(products, couponId) {
  if (!couponId || !products || !Array.isArray(products)) return '0,00'
  
  const subtotal = products.reduce((total, product) => {
    const price = parseFloat(String(product.price).replace(',', '.')) || 0
    return total + price
  }, 0)
  
  // Buscar o cupom real na lista de cupons
  const cupom = cupons.value.find(c => c.id === couponId)
  
  if (cupom && cupom.discount_percentage) {
    const percentualDesconto = parseFloat(String(cupom.discount_percentage).replace(',', '.')) / 100
    const desconto = subtotal * percentualDesconto
    return desconto.toFixed(2).replace('.', ',')
  }
  
  // Fallback: usar desconto baseado no ID do cupom
  let percentualDesconto = 0.1 // 10% padrão
  if (couponId % 2 === 0) {
    percentualDesconto = 0.15 // 15%
  } else {
    percentualDesconto = 0.1 // 10%
  }
  
  const desconto = subtotal * percentualDesconto
  return desconto.toFixed(2).replace('.', ',')
}

// Calcula valor total com desconto aplicado
function calcularTotalComDesconto(products, couponId) {
  if (!products || !Array.isArray(products)) return '0,00'
  
  const subtotal = products.reduce((total, product) => {
    const price = parseFloat(String(product.price).replace(',', '.')) || 0
    return total + price
  }, 0)
  
  if (!couponId) return subtotal.toFixed(2).replace('.', ',')
  
  // Buscar o cupom real na lista de cupons
  const cupom = cupons.value.find(c => c.id === couponId)
  
  if (cupom && cupom.discount_percentage) {
    const percentualDesconto = parseFloat(String(cupom.discount_percentage).replace(',', '.')) / 100
    const desconto = subtotal * percentualDesconto
    const totalComDesconto = subtotal - desconto
    return totalComDesconto.toFixed(2).replace('.', ',')
  }
  
  // Fallback: usar desconto baseado no ID do cupom
  let percentualDesconto = 0.1 // 10% padrão
  if (couponId % 2 === 0) {
    percentualDesconto = 0.15 // 15%
  } else {
    percentualDesconto = 0.1 // 10%
  }
  
  const desconto = subtotal * percentualDesconto
  const totalComDesconto = subtotal - desconto
  
  return totalComDesconto.toFixed(2).replace('.', ',')
}

// Função para obter percentual de desconto do cupom
function getCupomPercentual(couponId) {
  if (!couponId) return null
  
  const cupom = cupons.value.find(c => c.id === couponId)
  if (cupom && cupom.discount_percentage) {
    return parseFloat(String(cupom.discount_percentage).replace(',', '.'))
  }
  
  // Fallback: retornar percentual baseado no ID
  return couponId % 2 === 0 ? 15 : 10
}

// Função para obter endereço completo formatado
function getEnderecoCompleto(addressId) {
  if (!addressId) return 'Endereço não informado'
  
  const endereco = enderecos.value.find(e => e.id === addressId)
  if (!endereco) return `ID: ${addressId} (não encontrado)`
  
  const partes = []
  if (endereco.street) partes.push(endereco.street)
  if (endereco.number) partes.push(endereco.number)
  if (endereco.complement) partes.push(endereco.complement)
  if (endereco.neighborhood) partes.push(endereco.neighborhood)
  if (endereco.city) partes.push(endereco.city)
  if (endereco.state) partes.push(endereco.state)
  if (endereco.zip_code) partes.push(endereco.zip_code)
  
  return partes.length > 0 ? partes.join(', ') : `ID: ${addressId}`
}

// Função principal de filtragem de pedidos
function filtrarPedidos() {
  let pedidosFiltradosTemp = pedidos.value
  console.log('Filtrando pedidos. Total:', pedidos.value.length, 'Role:', userStore.userRole)

  // Filtrar por categorias do usuário apenas se for ADMIN e tiver categorias
  if (userStore.userRole === 'ADMIN' && mostrarApenasMinhasCategorias.value && categoriasUsuario.value.length > 0) {
    const idsCategoriasUsuario = categoriasUsuario.value.map(cat => cat.id)
    console.log('Filtrando por categorias do admin:', idsCategoriasUsuario)
    
    pedidosFiltradosTemp = pedidos.value.filter(pedido => {
      // Verificar se pelo menos um produto do pedido pertence às categorias do usuário
      return pedido.products && pedido.products.some(produto => {
        // Se o produto tem category_id, verificar se está na lista
        if (produto.category_id) {
          return idsCategoriasUsuario.includes(produto.category_id)
        }
        // Se não tem category_id, verificar se tem category com id
        if (produto.category && produto.category.id) {
          return idsCategoriasUsuario.includes(produto.category.id)
        }
        return false
      })
    })
    console.log('Pedidos filtrados para admin:', pedidosFiltradosTemp.length)
  }

  // Filtrar por status (aplicado para todos os usuários)
  if (filtroStatus.value) {
    pedidosFiltradosTemp = pedidosFiltradosTemp.filter(p => p.status === filtroStatus.value)
    console.log('Pedidos após filtro de status:', pedidosFiltradosTemp.length)
  }

  pedidosFiltrados.value = pedidosFiltradosTemp
  console.log('Pedidos finais filtrados:', pedidosFiltrados.value.length)
}

// Função principal para carregar todos os dados necessários
async function carregar() {
  carregando.value = true
  
  // Ajustar filtro de categorias baseado no papel do usuário
  ajustarFiltroCategorias()
  
  try {
    // Buscar pedidos
    const pedidosData = await listarTodosPedidos()
    pedidos.value = pedidosData
    console.log('Pedidos carregados:', pedidosData.length)
    
    // Buscar cupons para cálculo de desconto
    try {
      const cuponsData = await listarCupons()
      cupons.value = cuponsData
    } catch (error) {
      console.warn('Erro ao carregar cupons:', error)
      cupons.value = []
    }
    
    // Buscar endereços para exibição completa
    try {
      const enderecosData = await listarEnderecos()
      enderecos.value = enderecosData
    } catch (error) {
      console.warn('Erro ao carregar endereços:', error)
      enderecos.value = []
    }
    
    // Buscar categorias do usuário apenas se for ADMIN
    if (userStore.userRole === 'ADMIN' && userStore.user && userStore.user.id) {
      try {
        const categoriasData = await listarCategoriasPorUsuario(userStore.user.id)
        categoriasUsuario.value = categoriasData
        console.log('Categorias do admin carregadas:', categoriasData.length)
      } catch (error) {
        console.warn('Erro ao carregar categorias do usuário:', error)
        categoriasUsuario.value = []
      }
    } else {
      // Para outros usuários, não precisamos carregar categorias específicas
      categoriasUsuario.value = []
    }
    
    filtrarPedidos()
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
    showToastGlobal('Erro ao carregar pedidos: ' + error.message, 'danger')
  } finally {
    carregando.value = false
  }
}

// Função para atualizar status do pedido via API
async function atualizarStatus(pedido) {
  try {
    await atualizarStatusPedido(pedido.id, pedido.status)
    showToastGlobal(`Status do pedido #${pedido.id} atualizado para ${traduzirStatus(pedido.status)}`, 'success')
  } catch (error) {
    showToastGlobal('Erro ao atualizar status: ' + error.message, 'danger')
    // Reverter mudança em caso de erro
    await carregar()
  }
}

// Função para cancelar pedido via API
async function cancelar(pedidoId) {
  try {
    await cancelarPedido(pedidoId)
    showToastGlobal(`Pedido #${pedidoId} cancelado com sucesso`, 'success')
    await carregar()
  } catch (error) {
    showToastGlobal('Erro ao cancelar pedido: ' + error.message, 'danger')
  }
}

// Lifecycle hook: executado quando o componente é montado
onMounted(() => {
  console.log('ListaPedidos: Componente montado')
  console.log('ListaPedidos: Role do usuário:', userStore.userRole)
  console.log('ListaPedidos: Usuário:', userStore.user)
  carregar()
})
</script>

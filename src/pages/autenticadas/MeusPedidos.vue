<template>
  <!-- Seção principal da página Meus Pedidos -->
  <section class="meus-pedidos-section">
    <div class="meus-pedidos-container">
      <!-- Header da página com título e botão de atualizar -->
      <div class="meus-pedidos-header">
        <h1 class="meus-pedidos-title">
          <i class="bi bi-receipt"></i>
          Meus Pedidos
        </h1>
        <button class="meus-pedidos-btn meus-pedidos-btn-outline" @click="carregar">
          <i class="bi bi-arrow-clockwise"></i> Atualizar
        </button>
      </div>

      <!-- Estatísticas do usuário - Cards com números totais -->
      <div class="meus-pedidos-stats">
        <!-- Card de Total de Pedidos -->
        <div class="meus-pedidos-stats-card meus-pedidos-stats-total">
          <div class="meus-pedidos-stats-content">
            <div class="meus-pedidos-stats-icon">
              <i class="bi bi-receipt"></i>
            </div>
            <h4 class="meus-pedidos-stats-number">{{ estatisticas.total }}</h4>
            <p class="meus-pedidos-stats-label">Total de Pedidos</p>
          </div>
        </div>
        <!-- Card de Pedidos Concluídos -->
        <div class="meus-pedidos-stats-card meus-pedidos-stats-completed">
          <div class="meus-pedidos-stats-content">
            <div class="meus-pedidos-stats-icon">
              <i class="bi bi-check-circle"></i>
            </div>
            <h4 class="meus-pedidos-stats-number">{{ estatisticas.concluidos }}</h4>
            <p class="meus-pedidos-stats-label">Concluídos</p>
          </div>
        </div>
      </div>

      <!-- Estado de carregamento -->
      <div v-if="carregando" class="meus-pedidos-loading">
        <div class="meus-pedidos-spinner"></div>
        <p class="meus-pedidos-loading-text">Carregando seus pedidos...</p>
      </div>

      <!-- Estado vazio - Quando não há pedidos -->
      <div v-else-if="pedidos.length === 0" class="meus-pedidos-empty">
        <div class="meus-pedidos-empty-icon">
          <i class="bi bi-archive"></i>
        </div>
        <h2 class="meus-pedidos-empty-title">Nenhum pedido encontrado</h2>
        <p class="meus-pedidos-empty-description">Você ainda não fez nenhum pedido.</p>
        <p class="meus-pedidos-empty-subtitle">Explore nossos cursos e faça sua primeira compra!</p>
        <router-link to="/cursos" class="meus-pedidos-explore-btn">
          <i class="bi bi-book"></i>
          <span>Ver Cursos</span>
        </router-link>
      </div>

      <!-- Tabela de pedidos quando há pedidos disponíveis -->
      <div v-else class="meus-pedidos-table-container">
        <div class="meus-pedidos-table-responsive">
          <table class="meus-pedidos-table">
            <!-- Cabeçalho da tabela -->
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Status</th>
                <th>Cursos</th>
                <th>Cupom</th>
                <th>Endereço</th>
                <th>Ações</th>
              </tr>
            </thead>
            <!-- Corpo da tabela com lista de pedidos -->
            <tbody>
              <tr v-for="pedido in pedidos" :key="pedido.id" class="meus-pedidos-table-row">
                <!-- Coluna ID do pedido -->
                <td class="meus-pedidos-td-id">
                  <div class="meus-pedidos-info">
                    <span class="meus-pedidos-id">#{{ pedido.id }}</span>
                  </div>
                </td>
                <!-- Coluna Data do pedido -->
                <td class="meus-pedidos-td-date">
                  <div class="meus-pedidos-info">
                    <span class="meus-pedidos-date">{{ formatarData(pedido.order_date) }}</span>
                  </div>
                </td>
                <!-- Coluna Status do pedido -->
                <td class="meus-pedidos-td-status">
                  <span class="meus-pedidos-status-badge" :class="meusPedidosStatusClass(pedido.status)">
                    {{ traduzirStatus(pedido.status) }}
                  </span>
                </td>
                <!-- Coluna Produtos/Cursos do pedido -->
                <td class="meus-pedidos-td-products">
                  <div class="meus-pedidos-products-info">
                    <div v-for="prod in pedido.products" :key="prod.name" class="meus-pedidos-produto-item">
                      <span class="meus-pedidos-produto-name">{{ prod.name }}</span>
                      <span class="meus-pedidos-produto-price">R$ {{ prod.price }}</span>
                      <span v-if="prod.category" class="meus-pedidos-categoria-badge">
                        {{ prod.category.name }}
                      </span>
                    </div>
                  </div>
                </td>
                <!-- Coluna Cupom aplicado -->
                <td class="meus-pedidos-td-coupon">
                  <div class="meus-pedidos-cupom-info">
                    <span v-if="pedido.coupon_id" class="meus-pedidos-cupom-id">ID: {{ pedido.coupon_id }}</span>
                    <span v-else class="meus-pedidos-sem-cupom">Sem cupom</span>
                  </div>
                </td>
                <!-- Coluna Endereço de entrega -->
                <td class="meus-pedidos-td-address">
                  <div class="meus-pedidos-info">
                    <span class="meus-pedidos-address">ID: {{ pedido.address_id }}</span>
                  </div>
                </td>
                <!-- Coluna Ações disponíveis -->
                <td class="meus-pedidos-td-actions">
                  <div class="meus-pedidos-actions">
                    <!-- Botão de cancelar para pedidos pendentes -->
                    <button v-if="pedido.status === 'PENDING'" class="meus-pedidos-btn meus-pedidos-btn-danger meus-pedidos-btn-sm"
                      @click="confirmarCancelar(pedido.id)" title="Cancelar pedido">
                      <i class="bi bi-x-circle"></i>
                    </button>
                    <!-- Botão de concluído para pedidos finalizados -->
                    <button v-if="pedido.status === 'COMPLETED' || pedido.status === 'SHIPPED'" class="meus-pedidos-btn meus-pedidos-btn-success meus-pedidos-btn-sm" disabled
                      title="Pedido concluído">
                      <i class="bi bi-check-circle"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Container de toasts para notificações -->
      <div class="meus-pedidos-toast-container">
        <div v-for="(toast, i) in toasts" :key="i" :class="['meus-pedidos-toast', 'meus-pedidos-toast-' + toast.type, 'meus-pedidos-toast-show']"
          role="alert" aria-live="assertive" aria-atomic="true">
          <div class="meus-pedidos-toast-content">
            <div class="meus-pedidos-toast-body">
              <i v-if="toast.type === 'success'" class="bi bi-check-circle-fill"></i>
              <i v-else class="bi bi-x-circle-fill"></i>
              {{ toast.msg }}
            </div>
            <button type="button" class="meus-pedidos-toast-close" @click="removerToast(i)"
              aria-label="Close">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Modal de Confirmação de Cancelamento - Teleport para body -->
  <Teleport to="body">
    <div v-if="mostrarConfirmacaoCancelar" class="meus-pedidos-confirm-modal-overlay" @click="mostrarConfirmacaoCancelar = false">
      <div class="meus-pedidos-confirm-modal" @click.stop>
        <div class="meus-pedidos-confirm-content">
          <!-- Header do modal -->
          <div class="meus-pedidos-confirm-header">
            <i class="bi bi-exclamation-triangle"></i>
            <h3>Confirmar Cancelamento</h3>
          </div>
          <!-- Corpo do modal com mensagem de confirmação -->
          <div class="meus-pedidos-confirm-body">
            <p>Tem certeza que deseja cancelar este pedido?</p>
            <p class="meus-pedidos-confirm-warning">Esta ação não pode ser desfeita.</p>
          </div>
          <!-- Botões de ação do modal -->
          <div class="meus-pedidos-confirm-actions">
            <button class="meus-pedidos-confirm-btn-cancel" @click="mostrarConfirmacaoCancelar = false">
              Cancelar
            </button>
            <button class="meus-pedidos-confirm-btn-confirm" @click="cancelar(pedidoParaCancelar)">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
// Importações do Vue 3 Composition API
import { ref, onMounted, computed } from 'vue'
// Importações das APIs de pedidos
import { listarPedidosUsuario, cancelarPedido } from '../../services/api/orders'
// Importação do store de usuário para autenticação
import { useUserStore } from '../../services/stores/auth'

// Estados reativos principais
const pedidos = ref([])                    // Lista de pedidos do usuário
const carregando = ref(false)              // Estado de carregamento
const toasts = ref([])                     // Lista de toasts para notificações

// Estados do modal de confirmação
const mostrarConfirmacaoCancelar = ref(false)  // Controla exibição do modal
const pedidoParaCancelar = ref(null)           // ID do pedido a ser cancelado

// Computed property para calcular estatísticas dos pedidos
const estatisticas = computed(() => {
  const total = pedidos.value.length
  const concluidos = pedidos.value.filter(p => p.status === 'COMPLETED' || p.status === 'SHIPPED').length

  return { total, concluidos }
})

// Função para mostrar toast global
function showToastGlobal(msg, type = 'danger') {
  toasts.value.push({ msg, type })
  setTimeout(() => { toasts.value.shift() }, 4000)
}

// Função para remover toast específico
function removerToast(i) {
  toasts.value.splice(i, 1)
}

// Função para formatar data do pedido
function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleString('pt-BR')
}

// Função para traduzir status do pedido para português
function traduzirStatus(status) {
  const traducoes = {
    'PENDING': 'Pendente',
    'PROCESSING': 'Processando',
    'SHIPPED': 'Concluído',
    'COMPLETED': 'Concluído',
    'CANCELED': 'Cancelado'
  }
  return traducoes[status] || status
}

// Função para retornar classe CSS baseada no status do pedido
function meusPedidosStatusClass(status) {
  if (status === 'PENDING') return 'meus-pedidos-bg-warning'
  if (status === 'PROCESSING') return 'meus-pedidos-bg-info'
  if (status === 'SHIPPED') return 'meus-pedidos-bg-success'
  if (status === 'COMPLETED') return 'meus-pedidos-bg-success'
  if (status === 'CANCELED') return 'meus-pedidos-bg-danger'
  return 'meus-pedidos-bg-secondary'
}

// Função principal para carregar pedidos do usuário
async function carregar() {
  carregando.value = true
  try {
    const todosPedidos = await listarPedidosUsuario()

    // Verificar se o usuário está logado
    const userStore = useUserStore()
    if (!userStore.user || !userStore.user.id) {
      console.warn('⚠️ Usuário não encontrado, mostrando todos os pedidos')
      pedidos.value = todosPedidos
    } else {
      // Filtrar apenas os pedidos do usuário logado
      pedidos.value = todosPedidos.filter(pedido => pedido.user_id === userStore.user.id)
    }

    // Pedidos carregados com sucesso
  } catch (e) {
    // Erro ao carregar pedidos
    // Em caso de erro, mostrar array vazio em vez de erro
    pedidos.value = []
    showToastGlobal('Não foi possível carregar os pedidos. Tente novamente.', 'warning')
  } finally {
    carregando.value = false
  }
}

// Lifecycle hook - Carrega dados quando componente é montado
onMounted(carregar)

// Função para abrir modal de confirmação de cancelamento
function confirmarCancelar(id) {
  pedidoParaCancelar.value = id
  mostrarConfirmacaoCancelar.value = true
}

// Função para cancelar pedido confirmado
async function cancelar(id) {
  try {
    await cancelarPedido(id)
    showToastGlobal(`Pedido #${id} cancelado com sucesso!`, 'success')
    await carregar() // Recarrega a lista após cancelamento
  } catch (e) {
    // Erro ao cancelar pedido
    showToastGlobal('Erro ao cancelar pedido: ' + (e.response?.data?.detail || e.message), 'danger')
  } finally {
    mostrarConfirmacaoCancelar.value = false
  }
}
</script>


<template>
  <section class="meus-pedidos-section">
    <div class="meus-pedidos-container">
      <!-- Header da página -->
      <div class="meus-pedidos-header">
        <h1 class="meus-pedidos-title">
          <i class="bi bi-receipt"></i>
          Meus Pedidos
        </h1>
        <button class="meus-pedidos-btn meus-pedidos-btn-outline" @click="carregar">
          <i class="bi bi-arrow-clockwise"></i> Atualizar
        </button>
      </div>

      <!-- Estatísticas do usuário -->
      <div class="meus-pedidos-stats">
        <div class="meus-pedidos-stats-card meus-pedidos-stats-total">
          <div class="meus-pedidos-stats-content">
            <div class="meus-pedidos-stats-icon">
              <i class="bi bi-receipt"></i>
            </div>
            <h4 class="meus-pedidos-stats-number">{{ estatisticas.total }}</h4>
            <p class="meus-pedidos-stats-label">Total de Pedidos</p>
          </div>
        </div>
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

      <!-- Loading -->
      <div v-if="carregando" class="meus-pedidos-loading">
        <div class="meus-pedidos-spinner"></div>
        <p class="meus-pedidos-loading-text">Carregando seus pedidos...</p>
      </div>

      <!-- Estado vazio -->
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

      <!-- Tabela de pedidos -->
      <div v-else class="meus-pedidos-table-container">
        <div class="meus-pedidos-table-responsive">
          <table class="meus-pedidos-table">
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
            <tbody>
              <tr v-for="pedido in pedidos" :key="pedido.id" class="meus-pedidos-table-row">
                <td class="meus-pedidos-td-id">
                  <div class="meus-pedidos-info">
                    <span class="meus-pedidos-id">#{{ pedido.id }}</span>
                  </div>
                </td>
                <td class="meus-pedidos-td-date">
                  <div class="meus-pedidos-info">
                    <span class="meus-pedidos-date">{{ formatarData(pedido.order_date) }}</span>
                  </div>
                </td>
                <td class="meus-pedidos-td-status">
                  <span class="meus-pedidos-status-badge" :class="meusPedidosStatusClass(pedido.status)">
                    {{ traduzirStatus(pedido.status) }}
                  </span>
                </td>
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
                <td class="meus-pedidos-td-coupon">
                  <div class="meus-pedidos-cupom-info">
                    <span v-if="pedido.coupon_id" class="meus-pedidos-cupom-id">ID: {{ pedido.coupon_id }}</span>
                    <span v-else class="meus-pedidos-sem-cupom">Sem cupom</span>
                  </div>
                </td>
                <td class="meus-pedidos-td-address">
                  <div class="meus-pedidos-info">
                    <span class="meus-pedidos-address">ID: {{ pedido.address_id }}</span>
                  </div>
                </td>
                <td class="meus-pedidos-td-actions">
                  <div class="meus-pedidos-actions">
                    <button v-if="pedido.status === 'PENDING'" class="meus-pedidos-btn meus-pedidos-btn-danger meus-pedidos-btn-sm"
                      @click="confirmarCancelar(pedido.id)" title="Cancelar pedido">
                      <i class="bi bi-x-circle"></i>
                    </button>
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

      <!-- Toasts de notificação -->
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

  <!-- Modal de confirmação de cancelamento -->
  <Teleport to="body">
    <div v-if="mostrarConfirmacaoCancelar" class="meus-pedidos-confirm-modal-overlay" @click="mostrarConfirmacaoCancelar = false">
      <div class="meus-pedidos-confirm-modal" @click.stop>
        <div class="meus-pedidos-confirm-content">
          <div class="meus-pedidos-confirm-header">
            <i class="bi bi-exclamation-triangle"></i>
            <h3>Confirmar Cancelamento</h3>
          </div>
          <div class="meus-pedidos-confirm-body">
            <p>Tem certeza que deseja cancelar este pedido?</p>
            <p class="meus-pedidos-confirm-warning">Esta ação não pode ser desfeita.</p>
          </div>
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
import { ref, onMounted, computed } from 'vue'
import { listarPedidosUsuario, cancelarPedido } from '../../services/api/orders'
import { useUserStore } from '../../services/stores/auth'

// Estados reativos
const pedidos = ref([])
const carregando = ref(false)
const toasts = ref([])

// Modal de confirmação
const mostrarConfirmacaoCancelar = ref(false)
const pedidoParaCancelar = ref(null)

// Estatísticas dos pedidos
const estatisticas = computed(() => {
  const total = pedidos.value.length
  const concluidos = pedidos.value.filter(p => p.status === 'COMPLETED' || p.status === 'SHIPPED').length

  return { total, concluidos }
})

// Toast global
function showToastGlobal(msg, type = 'danger') {
  toasts.value.push({ msg, type })
  setTimeout(() => { toasts.value.shift() }, 4000)
}

function removerToast(i) {
  toasts.value.splice(i, 1)
}

// Formatação de dados
function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleString('pt-BR')
}

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

function meusPedidosStatusClass(status) {
  if (status === 'PENDING') return 'meus-pedidos-bg-warning'
  if (status === 'PROCESSING') return 'meus-pedidos-bg-info'
  if (status === 'SHIPPED') return 'meus-pedidos-bg-success'
  if (status === 'COMPLETED') return 'meus-pedidos-bg-success'
  if (status === 'CANCELED') return 'meus-pedidos-bg-danger'
  return 'meus-pedidos-bg-secondary'
}

// Carrega pedidos do usuário
async function carregar() {
  carregando.value = true
  try {
    const todosPedidos = await listarPedidosUsuario()

    const userStore = useUserStore()
    if (!userStore.user || !userStore.user.id) {
      console.warn('⚠️ Usuário não encontrado, mostrando todos os pedidos')
      pedidos.value = todosPedidos
    } else {
      pedidos.value = todosPedidos.filter(pedido => pedido.user_id === userStore.user.id)
    }

  } catch (e) {
    pedidos.value = []
    showToastGlobal('Não foi possível carregar os pedidos. Tente novamente.', 'warning')
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

// Confirmação de cancelamento
function confirmarCancelar(id) {
  pedidoParaCancelar.value = id
  mostrarConfirmacaoCancelar.value = true
}

async function cancelar(id) {
  try {
    await cancelarPedido(id)
    showToastGlobal(`Pedido #${id} cancelado com sucesso!`, 'success')
    await carregar()
  } catch (e) {
    showToastGlobal('Erro ao cancelar pedido: ' + (e.response?.data?.detail || e.message), 'danger')
  } finally {
    mostrarConfirmacaoCancelar.value = false
  }
}
</script>


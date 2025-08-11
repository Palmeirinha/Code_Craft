<template>
  <section class="desconto-section">
    <div class="desconto-container">
      <div class="desconto-wrapper">
        <!-- Header da seção -->
        <div class="desconto-header">
          <h1 class="desconto-title">Gerenciar Descontos</h1>
          <p class="desconto-subtitle">Configure descontos especiais para seus produtos</p>
        </div>

        <!-- Formulário de criação -->
        <div class="desconto-form-container">
          <h3 class="desconto-form-title">
            <i class="bi bi-percent"></i>{{ editandoDesconto ? 'Editar Desconto' : 'Novo Desconto' }}
          </h3>
          <form @submit.prevent="onSalvarDesconto" class="desconto-form">
            <div class="desconto-form-grid">
              <div class="desconto-form-group">
                <label class="desconto-form-label">Descrição do Desconto</label>
                <input 
                  v-model="formDesconto.description" 
                  class="desconto-form-input" 
                  placeholder="Ex: Black Friday - 50% off" 
                  required 
                />
              </div>
              <div class="desconto-form-group">
                <label class="desconto-form-label">Percentual de Desconto</label>
                <input 
                  v-model.number="formDesconto.discount_percentage" 
                  class="desconto-form-input" 
                  placeholder="Ex: 50" 
                  required 
                  type="number" 
                  min="1" 
                  max="100" 
                />
              </div>
              <div class="desconto-form-group">
                <label class="desconto-form-label">Data de Início</label>
                <input 
                  v-model="formDesconto.start_date" 
                  class="desconto-form-input" 
                  type="datetime-local" 
                  required 
                />
              </div>
              <div class="desconto-form-group">
                <label class="desconto-form-label">Data de Fim</label>
                <input 
                  v-model="formDesconto.end_date" 
                  class="desconto-form-input" 
                  type="datetime-local" 
                  required 
                />
              </div>
              <div class="desconto-form-group desconto-form-group-full">
                <label class="desconto-form-label">ID do Produto</label>
                <input 
                  v-model.number="formDesconto.product_id" 
                  class="desconto-form-input" 
                  placeholder="Ex: 123" 
                  required 
                  type="number" 
                  min="1" 
                />
              </div>
            </div>
            <div class="desconto-form-actions">
              <button 
                v-if="editandoDesconto" 
                class="desconto-btn desconto-btn-outline" 
                type="button" 
                @click="cancelarEdicaoDesconto"
              >
                <i class="bi bi-x-circle"></i>Cancelar
              </button>
              <button 
                class="desconto-btn desconto-btn-primary" 
                type="submit" 
                :disabled="carregandoDesconto"
              >
                <span v-if="carregandoDesconto" class="desconto-spinner"></span>
                <i v-else class="bi bi-check-circle"></i>
                {{ editandoDesconto ? 'Salvar Alterações' : 'Criar Desconto' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de descontos -->
        <div class="desconto-list-container">
          <div class="desconto-list-header">
            <h3 class="desconto-list-title">Descontos Cadastrados</h3>
            <span class="desconto-stats-badge">
              <i class="bi bi-percent"></i>
              {{ descontos.length }} descontos
            </span>
          </div>

          <!-- Loading -->
          <div v-if="carregandoListaDesconto" class="desconto-loading">
            <div class="desconto-spinner"></div>
            <p class="desconto-loading-text">Carregando descontos...</p>
          </div>

          <!-- Estado vazio -->
          <div v-else-if="descontos.length === 0" class="desconto-empty">
            <i class="bi bi-percent"></i>
            <h4 class="desconto-empty-title">Nenhum desconto encontrado</h4>
            <p class="desconto-empty-text">Crie seu primeiro desconto para começar a oferecer promoções especiais.</p>
          </div>

          <!-- Tabela de descontos -->
          <div v-else class="desconto-table-container">
            <div class="desconto-table-responsive">
              <table class="desconto-table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Desconto (%)</th>
                    <th>Produto ID</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th>Status</th>
                    <th class="desconto-th-actions">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="desc in descontosPaginados" :key="desc.id" class="desconto-table-row">
                    <td class="desconto-td-description">
                      <span class="desconto-description">{{ desc.description }}</span>
                    </td>
                    <td class="desconto-td-percentage">
                      <span class="desconto-discount-badge">{{ desc.discount_percentage }}%</span>
                    </td>
                    <td class="desconto-td-product">
                      <span class="desconto-product-id">{{ desc.product_id }}</span>
                    </td>
                    <td class="desconto-td-start">
                      <span class="desconto-date-text">{{ formatarData(desc.start_date) }}</span>
                    </td>
                    <td class="desconto-td-end">
                      <span class="desconto-date-text">{{ formatarData(desc.end_date) }}</span>
                    </td>
                    <td class="desconto-td-status">
                      <span class="desconto-status-badge" :class="descontoStatusClass(desc)">
                        {{ getStatusText(desc) }}
                      </span>
                    </td>
                    <td class="desconto-td-actions">
                      <div class="desconto-actions">
                        <button 
                          class="desconto-btn desconto-btn-outline desconto-btn-sm" 
                          @click="editarDesconto(desc)"
                          title="Editar desconto"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <button 
                          class="desconto-btn desconto-btn-danger desconto-btn-sm" 
                          @click="confirmarExcluirDesconto(desc.id)" 
                          :disabled="carregandoDesconto === desc.id"
                          title="Excluir desconto"
                        >
                          <span v-if="carregandoDesconto === desc.id" class="desconto-spinner"></span>
                          <i v-else class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginação -->
            <div v-if="totalPaginas > 1" class="desconto-pagination">
              <button 
                class="desconto-btn desconto-btn-outline desconto-btn-sm" 
                :disabled="paginaAtual === 1" 
                @click="paginaAtual--"
              >
                <i class="bi bi-chevron-left"></i>Anterior
              </button>
              <span class="desconto-pagination-info">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
              <button 
                class="desconto-btn desconto-btn-outline desconto-btn-sm" 
                :disabled="paginaAtual === totalPaginas" 
                @click="paginaAtual++"
              >
                Próxima<i class="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Modal de confirmação de exclusão -->
  <Teleport to="body">
    <div v-if="mostrarConfirmacaoExcluir" class="desconto-confirm-modal-overlay" @click="mostrarConfirmacaoExcluir = false">
      <div class="desconto-confirm-modal" @click.stop>
        <div class="desconto-confirm-content">
          <div class="desconto-confirm-header">
            <i class="bi bi-exclamation-triangle"></i>
            <h3>Confirmar Exclusão</h3>
          </div>
          <div class="desconto-confirm-body">
            <p>Tem certeza que deseja excluir este desconto?</p>
            <p class="desconto-confirm-warning">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="desconto-confirm-actions">
            <button class="desconto-confirm-btn-cancel" @click="mostrarConfirmacaoExcluir = false">
              Cancelar
            </button>
            <button class="desconto-confirm-btn-confirm" @click="excluirDesconto(descontoParaExcluir)" :disabled="carregandoDesconto">
              <span v-if="carregandoDesconto" class="desconto-spinner"></span>
              <span v-else>Confirmar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, inject, computed } from 'vue'
import { listarDescontos, criarDesconto, atualizarDesconto, excluirDesconto as excluirDescontoApi } from '../../../services/api/promocoes'

// Estados reativos
const descontos = ref([])
const carregandoListaDesconto = ref(false)
const carregandoDesconto = ref(false)
const editandoDesconto = ref(false)
const idEditandoDesconto = ref(null)
const formDesconto = ref({
  description: '', discount_percentage: '', start_date: '', end_date: '', product_id: ''
})

// Paginação
const paginaAtual = ref(1)
const descontosPorPagina = 10

const showToastGlobal = inject('showToastGlobal')

// Modal de confirmação
const mostrarConfirmacaoExcluir = ref(false)
const descontoParaExcluir = ref(null)

// Paginação
const totalPaginas = computed(() => {
  return Math.ceil(descontos.value.length / descontosPorPagina)
})

const descontosPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * descontosPorPagina
  const end = start + descontosPorPagina
  return descontos.value.slice(start, end)
})

// Formatação de dados
function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleString('pt-BR')
}

function descontoStatusClass(desconto) {
  const now = new Date()
  const startDate = new Date(desconto.start_date)
  const endDate = new Date(desconto.end_date)
  
  if (now < startDate) return 'desconto-status-pending'
  if (now >= startDate && now <= endDate) return 'desconto-status-active'
  return 'desconto-status-expired'
}

function getStatusText(desconto) {
  const now = new Date()
  const startDate = new Date(desconto.start_date)
  const endDate = new Date(desconto.end_date)
  
  if (now < startDate) return 'Pendente'
  if (now >= startDate && now <= endDate) return 'Ativo'
  return 'Expirado'
}

// Gerenciamento do formulário
function resetFormDesconto() {
  formDesconto.value = { description: '', discount_percentage: '', start_date: '', end_date: '', product_id: '' }
  editandoDesconto.value = false
  idEditandoDesconto.value = null
}

function cancelarEdicaoDesconto() {
  resetFormDesconto()
}

// Carrega descontos da API
async function carregarDescontos() {
  carregandoListaDesconto.value = true
  try {
    descontos.value = await listarDescontos()
  } catch (e) {
    showToastGlobal && showToastGlobal('Erro ao carregar descontos.', 'danger')
  } finally {
    carregandoListaDesconto.value = false
  }
}

// Salva desconto (criar ou editar)
async function onSalvarDesconto() {
  carregandoDesconto.value = true
  try {
    if (editandoDesconto.value) {
      await atualizarDesconto(idEditandoDesconto.value, formDesconto.value)
      showToastGlobal && showToastGlobal('Desconto editado com sucesso!', 'success')
    } else {
      await criarDesconto(formDesconto.value)
      showToastGlobal && showToastGlobal('Desconto criado com sucesso!', 'success')
    }
    resetFormDesconto()
    await carregarDescontos()
  } catch (e) {
    showToastGlobal && showToastGlobal('Erro ao salvar desconto.', 'danger')
  } finally {
    carregandoDesconto.value = false
  }
}

// Edição e exclusão
function editarDesconto(desc) {
  formDesconto.value = { ...desc }
  editandoDesconto.value = true
  idEditandoDesconto.value = desc.id
}

function confirmarExcluirDesconto(id) {
  descontoParaExcluir.value = id
  mostrarConfirmacaoExcluir.value = true
}

async function excluirDesconto(id) {
  carregandoDesconto.value = id
  try {
    await excluirDescontoApi(id)
    showToastGlobal && showToastGlobal('Desconto excluído com sucesso!', 'success')
    await carregarDescontos()
  } catch (e) {
    showToastGlobal && showToastGlobal('Erro ao excluir desconto.', 'danger')
  } finally {
    carregandoDesconto.value = false
    mostrarConfirmacaoExcluir.value = false
  }
}

onMounted(carregarDescontos)
</script>


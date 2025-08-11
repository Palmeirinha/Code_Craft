<template>
  <!-- Seção principal de gestão de descontos -->
  <section class="desconto-section">
    <div class="desconto-container">
      <div class="desconto-wrapper">
        <!-- Header da seção - Título e descrição -->
        <div class="desconto-header">
          <h1 class="desconto-title">Gerenciar Descontos</h1>
          <p class="desconto-subtitle">Configure descontos especiais para seus produtos</p>
        </div>

        <!-- Formulário de Criação - Formulário para criar/editar descontos -->
        <div class="desconto-form-container">
          <h3 class="desconto-form-title">
            <i class="bi bi-percent"></i>{{ editandoDesconto ? 'Editar Desconto' : 'Novo Desconto' }}
          </h3>
          <form @submit.prevent="onSalvarDesconto" class="desconto-form">
            <div class="desconto-form-grid">
              <!-- Campo Descrição do Desconto -->
              <div class="desconto-form-group">
                <label class="desconto-form-label">Descrição do Desconto</label>
                <input 
                  v-model="formDesconto.description" 
                  class="desconto-form-input" 
                  placeholder="Ex: Black Friday - 50% off" 
                  required 
                />
              </div>
              <!-- Campo Percentual de Desconto -->
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
              <!-- Campo Data de Início -->
              <div class="desconto-form-group">
                <label class="desconto-form-label">Data de Início</label>
                <input 
                  v-model="formDesconto.start_date" 
                  class="desconto-form-input" 
                  type="datetime-local" 
                  required 
                />
              </div>
              <!-- Campo Data de Fim -->
              <div class="desconto-form-group">
                <label class="desconto-form-label">Data de Fim</label>
                <input 
                  v-model="formDesconto.end_date" 
                  class="desconto-form-input" 
                  type="datetime-local" 
                  required 
                />
              </div>
              <!-- Campo ID do Produto (largura completa) -->
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
            <!-- Botões de ação do formulário -->
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

        <!-- Lista de Descontos - Tabela com descontos cadastrados -->
        <div class="desconto-list-container">
          <div class="desconto-list-header">
            <h3 class="desconto-list-title">Descontos Cadastrados</h3>
            <span class="desconto-stats-badge">
              <i class="bi bi-percent"></i>
              {{ descontos.length }} descontos
            </span>
          </div>

          <!-- Loading State - Estado de carregamento da lista -->
          <div v-if="carregandoListaDesconto" class="desconto-loading">
            <div class="desconto-spinner"></div>
            <p class="desconto-loading-text">Carregando descontos...</p>
          </div>

          <!-- Empty State - Estado quando não há descontos -->
          <div v-else-if="descontos.length === 0" class="desconto-empty">
            <i class="bi bi-percent"></i>
            <h4 class="desconto-empty-title">Nenhum desconto encontrado</h4>
            <p class="desconto-empty-text">Crie seu primeiro desconto para começar a oferecer promoções especiais.</p>
          </div>

          <!-- Descontos Table - Tabela principal dos descontos -->
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
                  <!-- Loop através dos descontos paginados -->
                  <tr v-for="desc in descontosPaginados" :key="desc.id" class="desconto-table-row">
                    <!-- Coluna Descrição do Desconto -->
                    <td class="desconto-td-description">
                      <span class="desconto-description">{{ desc.description }}</span>
                    </td>
                    <!-- Coluna Percentual de Desconto -->
                    <td class="desconto-td-percentage">
                      <span class="desconto-discount-badge">{{ desc.discount_percentage }}%</span>
                    </td>
                    <!-- Coluna ID do Produto -->
                    <td class="desconto-td-product">
                      <span class="desconto-product-id">{{ desc.product_id }}</span>
                    </td>
                    <!-- Coluna Data de Início -->
                    <td class="desconto-td-start">
                      <span class="desconto-date-text">{{ formatarData(desc.start_date) }}</span>
                    </td>
                    <!-- Coluna Data de Fim -->
                    <td class="desconto-td-end">
                      <span class="desconto-date-text">{{ formatarData(desc.end_date) }}</span>
                    </td>
                    <!-- Coluna Status - Status dinâmico baseado nas datas -->
                    <td class="desconto-td-status">
                      <span class="desconto-status-badge" :class="descontoStatusClass(desc)">
                        {{ getStatusText(desc) }}
                      </span>
                    </td>
                    <!-- Coluna Ações - Botões de editar e excluir -->
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

            <!-- Paginação - Navegação entre páginas -->
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

  <!-- Modal de Confirmação de Exclusão - Confirma exclusão de desconto -->
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
// Importações do Vue 3 Composition API
import { ref, onMounted, inject, computed } from 'vue'
// Importações das APIs de promoções
import { listarDescontos, criarDesconto, atualizarDesconto, excluirDesconto as excluirDescontoApi } from '../../../services/api/promocoes'

// Estados reativos principais
const descontos = ref([])                                   // Lista de descontos carregados
const carregandoListaDesconto = ref(false)                  // Estado de carregamento da lista
const carregandoDesconto = ref(false)                        // Estado de carregamento geral
const editandoDesconto = ref(false)                          // Flag para controlar modo de edição
const idEditandoDesconto = ref(null)                         // ID do desconto sendo editado
const formDesconto = ref({
  description: '', discount_percentage: '', start_date: '', end_date: '', product_id: ''
})                                                           // Dados do formulário principal

// Configurações de paginação
const paginaAtual = ref(1)                                   // Página atual sendo exibida
const descontosPorPagina = 10                                // Quantidade de descontos por página

// Toast global injetado do componente pai
const showToastGlobal = inject('showToastGlobal')

// Estados para modal de confirmação
const mostrarConfirmacaoExcluir = ref(false)                 // Controla exibição do modal de confirmação
const descontoParaExcluir = ref(null)                        // ID do desconto a ser excluído

// Computed properties para paginação
const totalPaginas = computed(() => {
  return Math.ceil(descontos.value.length / descontosPorPagina)
})

const descontosPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * descontosPorPagina
  const end = start + descontosPorPagina
  return descontos.value.slice(start, end)
})

// Função para formatar data em formato brasileiro
function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleString('pt-BR')
}

// Função para determinar a classe CSS do status baseado nas datas
function descontoStatusClass(desconto) {
  const now = new Date()
  const startDate = new Date(desconto.start_date)
  const endDate = new Date(desconto.end_date)
  
  if (now < startDate) return 'desconto-status-pending'      // Status: Pendente
  if (now >= startDate && now <= endDate) return 'desconto-status-active'  // Status: Ativo
  return 'desconto-status-expired'                           // Status: Expirado
}

// Função para obter o texto do status baseado nas datas
function getStatusText(desconto) {
  const now = new Date()
  const startDate = new Date(desconto.start_date)
  const endDate = new Date(desconto.end_date)
  
  if (now < startDate) return 'Pendente'                     // Ainda não começou
  if (now >= startDate && now <= endDate) return 'Ativo'     // Em andamento
  return 'Expirado'                                          // Já terminou
}

// Função para resetar formulário e estados
function resetFormDesconto() {
  formDesconto.value = { description: '', discount_percentage: '', start_date: '', end_date: '', product_id: '' }
  editandoDesconto.value = false
  idEditandoDesconto.value = null
}

// Função para cancelar modo de edição
function cancelarEdicaoDesconto() {
  resetFormDesconto()
}

// Função principal para carregar descontos da API
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

// Função principal para salvar desconto (criar ou editar)
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

// Função para abrir modo de edição
function editarDesconto(desc) {
  formDesconto.value = { ...desc }
  editandoDesconto.value = true
  idEditandoDesconto.value = desc.id
}

// Função para abrir modal de confirmação de exclusão
function confirmarExcluirDesconto(id) {
  descontoParaExcluir.value = id
  mostrarConfirmacaoExcluir.value = true
}

// Função para excluir desconto via API
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

// Lifecycle hook: executado quando o componente é montado
onMounted(carregarDescontos)
</script>


<template>
  <!-- Seção principal de gestão de cupons -->
  <section class="cupom-section">
    <div class="cupom-container">
      <div class="cupom-wrapper">
        <!-- Header da seção - Título e descrição -->
        <div class="cupom-header">
          <h1 class="cupom-title">Gerenciar Cupons</h1>
          <p class="cupom-subtitle">Crie e gerencie cupons de desconto para os cursos</p>
        </div>

        <!-- Formulário de Criação - Formulário para criar novos cupons -->
        <div class="cupom-form-container">
          <h3 class="cupom-form-title">
            <i class="bi bi-ticket-perforated"></i>Novo Cupom
          </h3>
          <form @submit.prevent="onSalvar" class="cupom-form">
            <div class="cupom-form-grid">
              <!-- Campo Código do Cupom -->
              <div class="cupom-form-group">
                <label class="cupom-form-label">Código do Cupom</label>
                <input 
                  v-model="form.code" 
                  class="cupom-form-input" 
                  placeholder="Ex: DESCONTO20" 
                  required 
                />
              </div>
              <!-- Campo Percentual de Desconto -->
              <div class="cupom-form-group">
                <label class="cupom-form-label">% Desconto</label>
                <input 
                  v-model.number="form.discount_percentage" 
                  class="cupom-form-input" 
                  placeholder="Ex: 20" 
                  required 
                  type="number" 
                  min="1" 
                  max="100" 
                />
              </div>
              <!-- Campo Data de Início -->
              <div class="cupom-form-group">
                <label class="cupom-form-label">Data de Início</label>
                <input 
                  v-model="form.start_date" 
                  class="cupom-form-input" 
                  type="datetime-local" 
                  required 
                />
              </div>
              <!-- Campo Data de Fim -->
              <div class="cupom-form-group">
                <label class="cupom-form-label">Data de Fim</label>
                <input 
                  v-model="form.end_date" 
                  class="cupom-form-input" 
                  type="datetime-local" 
                  required 
                />
              </div>
            </div>
            <!-- Botões de ação do formulário -->
            <div class="cupom-form-actions">
              <button 
                v-if="editando" 
                class="cupom-btn cupom-btn-outline" 
                type="button" 
                @click="cancelarEdicao"
              >
                <i class="bi bi-x-circle"></i>Cancelar
              </button>
              <button 
                class="cupom-btn cupom-btn-primary" 
                type="submit" 
                :disabled="carregando"
              >
                <span v-if="carregando" class="cupom-spinner"></span>
                <i v-else class="bi bi-check-circle"></i>
                {{ editando ? 'Salvar Alterações' : 'Criar Cupom' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de Cupons - Tabela com cupons cadastrados -->
        <div class="cupom-list-container">
          <div class="cupom-list-header">
            <h3 class="cupom-list-title">Cupons Cadastrados</h3>
            <span class="cupom-stats-badge">
              <i class="bi bi-ticket-perforated"></i>
              {{ cupons.length }} cupons
            </span>
          </div>

          <!-- Loading State - Estado de carregamento da lista -->
          <div v-if="carregandoLista" class="cupom-loading">
            <div class="cupom-spinner"></div>
            <p class="cupom-loading-text">Carregando cupons...</p>
          </div>

          <!-- Empty State - Estado quando não há cupons -->
          <div v-else-if="cupons.length === 0" class="cupom-empty">
            <i class="bi bi-ticket-perforated"></i>
            <h4 class="cupom-empty-title">Nenhum cupom encontrado</h4>
            <p class="cupom-empty-text">Crie seu primeiro cupom para começar a oferecer descontos.</p>
          </div>

          <!-- Cupons Table - Tabela principal dos cupons -->
          <div v-else class="cupom-table-container">
            <div class="cupom-table-responsive">
              <table class="cupom-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Desconto (%)</th>
                    <th>Início</th>
                    <th>Fim</th>
                    <th class="cupom-th-actions">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Loop através dos cupons paginados -->
                  <tr v-for="cupom in cuponsPaginados" :key="cupom.id" class="cupom-table-row">
                    <!-- Coluna Código do Cupom -->
                    <td class="cupom-td-code">
                      <span class="cupom-code">{{ cupom.code }}</span>
                    </td>
                    <!-- Coluna Percentual de Desconto -->
                    <td class="cupom-td-percentage">
                      <span class="cupom-discount-badge">{{ cupom.discount_percentage }}%</span>
                    </td>
                    <!-- Coluna Data de Início -->
                    <td class="cupom-td-start">
                      <span class="cupom-date-text">{{ formatarData(cupom.start_date) }}</span>
                    </td>
                    <!-- Coluna Data de Fim -->
                    <td class="cupom-td-end">
                      <span class="cupom-date-text">{{ formatarData(cupom.end_date) }}</span>
                    </td>
                    <!-- Coluna Ações - Botões de editar e excluir -->
                    <td class="cupom-td-actions">
                      <div class="cupom-actions">
                        <button 
                          class="cupom-btn cupom-btn-outline cupom-btn-sm" 
                          @click="abrirModalEditar(cupom)"
                          title="Editar cupom"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <button 
                          class="cupom-btn cupom-btn-danger cupom-btn-sm" 
                          @click="confirmarExcluir(cupom.id)" 
                          :disabled="carregando === cupom.id"
                          title="Excluir cupom"
                        >
                          <span v-if="carregando === cupom.id" class="cupom-spinner"></span>
                          <i v-else class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginação - Navegação entre páginas -->
            <div v-if="totalPaginas > 1" class="cupom-pagination">
              <button 
                class="cupom-btn cupom-btn-outline cupom-btn-sm" 
                :disabled="paginaAtual === 1" 
                @click="paginaAtual--"
              >
                <i class="bi bi-chevron-left"></i>Anterior
              </button>
              <span class="cupom-pagination-info">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
              <button 
                class="cupom-btn cupom-btn-outline cupom-btn-sm" 
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

    <!-- Modal de Edição - Modal para editar cupons existentes -->
    <template v-if="mostrarModalEditar">
      <div class="cupom-modal-backdrop"></div>
      <div class="cupom-modal">
        <div class="cupom-modal-dialog">
          <div class="cupom-modal-content">
            <div class="cupom-modal-header">
              <h5 class="cupom-modal-title">
                <i class="bi bi-pencil-square"></i>Editar Cupom
              </h5>
              <button type="button" class="cupom-modal-close" @click="fecharModalEditar">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <form @submit.prevent="onSalvarEdicao">
              <div class="cupom-modal-body">
                <!-- Campo Código no modal de edição -->
                <div class="cupom-modal-form-group">
                  <label class="cupom-modal-label">Código do Cupom</label>
                  <input 
                    v-model="formEditar.code" 
                    type="text" 
                    class="cupom-modal-input" 
                    required 
                  />
                </div>
                <!-- Campo Percentual no modal de edição -->
                <div class="cupom-modal-form-group">
                  <label class="cupom-modal-label">% Desconto</label>
                  <input 
                    v-model.number="formEditar.discount_percentage" 
                    class="cupom-modal-input" 
                    required 
                    type="number" 
                    min="1" 
                    max="100" 
                  />
                </div>
                <!-- Campo Data de Início no modal de edição -->
                <div class="cupom-modal-form-group">
                  <label class="cupom-modal-label">Data de Início</label>
                  <input 
                    v-model="formEditar.start_date" 
                    class="cupom-modal-input" 
                    type="datetime-local" 
                    required 
                  />
                </div>
                <!-- Campo Data de Fim no modal de edição -->
                <div class="cupom-modal-form-group">
                  <label class="cupom-modal-label">Data de Fim</label>
                  <input 
                    v-model="formEditar.end_date" 
                    class="cupom-modal-input" 
                    type="datetime-local" 
                    required 
                  />
                </div>
              </div>
              <!-- Botões de ação do modal de edição -->
              <div class="cupom-modal-footer">
                <button type="button" class="cupom-btn cupom-btn-secondary" @click="fecharModalEditar">
                  <i class="bi bi-x-circle"></i>Cancelar
                </button>
                <button type="submit" class="cupom-btn cupom-btn-primary" :disabled="carregandoEditar">
                  <span v-if="carregandoEditar" class="cupom-spinner"></span>
                  <i v-else class="bi bi-check-circle"></i>
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </template>
  </section>

  <!-- Modal de Confirmação de Exclusão - Confirma exclusão de cupom -->
  <Teleport to="body">
    <div v-if="mostrarConfirmacaoExcluir" class="cupom-confirm-modal-overlay" @click="mostrarConfirmacaoExcluir = false">
      <div class="cupom-confirm-modal" @click.stop>
        <div class="cupom-confirm-content">
          <div class="cupom-confirm-header">
            <i class="bi bi-exclamation-triangle"></i>
            <h3>Confirmar Exclusão</h3>
          </div>
          <div class="cupom-confirm-body">
            <p>Tem certeza que deseja excluir este cupom?</p>
            <p class="cupom-confirm-warning">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="cupom-confirm-actions">
            <button class="cupom-confirm-btn-cancel" @click="mostrarConfirmacaoExcluir = false">
              Cancelar
            </button>
            <button class="cupom-confirm-btn-confirm" @click="excluir(cupomParaExcluir)" :disabled="carregando">
              <span v-if="carregando" class="cupom-spinner"></span>
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
import { ref, onMounted, onActivated, computed, inject } from 'vue'
// Importações das APIs de promoções
import { getCupomById, atualizarCupom, deletarCupom, listarCupons, criarCupom } from '../../../services/api/promocoes'

// Estados reativos principais
const cupons = ref([])                                      // Lista de cupons carregados
const carregandoLista = ref(false)                          // Estado de carregamento da lista
const carregando = ref(false)                                // Estado de carregamento geral
const editando = ref(false)                                  // Flag para controlar modo de edição
const idEditando = ref(null)                                 // ID do cupom sendo editado
const form = ref({
  code: '', discount_percentage: '', start_date: '', end_date: ''
})                                                           // Dados do formulário principal

// Estados para modal de edição
const mostrarModalEditar = ref(false)                        // Controla exibição do modal de edição
const carregandoEditar = ref(false)                          // Estado de carregamento da edição
const formEditar = ref({ code: '', discount_percentage: '', start_date: '', end_date: '' })  // Dados do formulário de edição

// Toast global injetado do componente pai
const showToastGlobal = inject('showToastGlobal')

// Estados para modal de confirmação
const mostrarConfirmacaoExcluir = ref(false)                 // Controla exibição do modal de confirmação
const cupomParaExcluir = ref(null)                           // ID do cupom a ser excluído

// Configurações de paginação
const cuponsPorPagina = 6                                    // Quantidade de cupons por página
const paginaAtual = ref(1)                                   // Página atual sendo exibida

// Computed properties para paginação
const cuponsPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * cuponsPorPagina
  return cupons.value.slice(start, start + cuponsPorPagina)
})
const totalPaginas = computed(() => Math.max(1, Math.ceil(cupons.value.length / cuponsPorPagina)))

// Função principal para carregar cupons da API
async function carregarCupons() {
  carregandoLista.value = true
  try {
    cupons.value = await listarCupons()
  } catch (e) {
    showToastGlobal && showToastGlobal('Erro ao carregar cupons.', 'danger')
  } finally {
    carregandoLista.value = false
  }
}

// Função para resetar formulário e estados
function resetForm() {
  form.value = { code: '', discount_percentage: '', start_date: '', end_date: '' }
  editando.value = false
  idEditando.value = null
}

// Função para cancelar modo de edição
function cancelarEdicao() {
  resetForm()
}

// Função para validar dados do cupom
function validarCupom(cupom) {
  const erros = []
  if (!cupom.code || cupom.code.length < 3) {
    erros.push('O código do cupom deve ter pelo menos 3 caracteres.')
  }
  if (!cupom.discount_percentage || isNaN(cupom.discount_percentage) || cupom.discount_percentage < 1 || cupom.discount_percentage > 100) {
    erros.push('O desconto deve ser entre 1% e 100%.')
  }
  if (!cupom.start_date) {
    erros.push('A data de início é obrigatória.')
  }
  if (!cupom.end_date) {
    erros.push('A data de fim é obrigatória.')
  }
  if (cupom.start_date && cupom.end_date && new Date(cupom.end_date) <= new Date(cupom.start_date)) {
    erros.push('A data de fim deve ser maior que a data de início.')
  }
  return erros
}

// Função principal para salvar cupom (criar ou editar)
async function onSalvar() {
  const erros = validarCupom(form.value)
  if (erros.length > 0) {
    erros.forEach(msg => showToastGlobal && showToastGlobal(msg, 'danger'))
    return
  }
  carregando.value = true
  try {
    if (editando.value) {
      await atualizarCupom(idEditando.value, form.value)
      showToastGlobal && showToastGlobal('Cupom editado com sucesso!', 'success')
    } else {
      await criarCupom(form.value)
      showToastGlobal && showToastGlobal('Cupom criado com sucesso!', 'success')
    }
    resetForm()
    await carregarCupons()
  } catch (e) {
    showToastGlobal && showToastGlobal('Erro ao salvar cupom.', 'danger')
  } finally {
    carregando.value = false
  }
}

// Função para abrir modal de edição
function abrirModalEditar(cupom) {
  formEditar.value = { ...cupom }
  formEditar.value.start_date = cupom.start_date.slice(0, 16)
  formEditar.value.end_date = cupom.end_date.slice(0, 16)
  mostrarModalEditar.value = true
}

// Função para fechar modal de edição
function fecharModalEditar() {
  mostrarModalEditar.value = false
}

// Função para salvar edição via modal
async function onSalvarEdicao() {
  const erros = validarCupom(formEditar.value)
  if (erros.length > 0) {
    erros.forEach(msg => showToastGlobal && showToastGlobal(msg, 'danger'))
    return
  }
  carregandoEditar.value = true
  try {
    await atualizarCupom(formEditar.value.id, formEditar.value)
    showToastGlobal && showToastGlobal('Cupom editado com sucesso!', 'success')
    mostrarModalEditar.value = false
    await carregarCupons()
  } catch (e) {
    showToastGlobal && showToastGlobal('Erro ao editar cupom.', 'danger')
  } finally {
    carregandoEditar.value = false
  }
}

// Função para abrir modal de confirmação de exclusão
function confirmarExcluir(id) {
  cupomParaExcluir.value = id
  mostrarConfirmacaoExcluir.value = true
}

// Função para excluir cupom via API
async function excluir(id) {
  carregando.value = id
  try {
    await deletarCupom(id)
    showToastGlobal && showToastGlobal('Cupom excluído com sucesso!', 'success')
    await carregarCupons()
  } catch (e) {
    showToastGlobal && showToastGlobal('Erro ao excluir cupom.', 'danger')
  } finally {
    carregando.value = false
    mostrarConfirmacaoExcluir.value = false
  }
}

// Função para formatar data em formato brasileiro
function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleString('pt-BR')
}

// Lifecycle hook: executado quando o componente é montado
onMounted(carregarCupons)
// Lifecycle hook: executado quando o componente é reativado (keep-alive)
onActivated(carregarCupons)
</script>


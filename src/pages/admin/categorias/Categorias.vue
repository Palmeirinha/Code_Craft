<template>
  <!-- Seção principal de gerenciamento de categorias -->
  <section class="categoria-section">
    <div class="categoria-container">
      <div class="categoria-wrapper">
        <!-- Header da seção com título e subtítulo -->
        <div class="categoria-header">
          <h1 class="categoria-title">Gerenciar Categorias</h1>
          <p class="categoria-subtitle">Crie e gerencie as categorias dos cursos</p>
        </div>

        <!-- Formulário para criação de novas categorias -->
        <div class="categoria-form-container">
          <h3 class="categoria-form-title">
            <i class="bi bi-plus-circle"></i>Nova Categoria
          </h3>
          <!-- Formulário de criação com validação -->
          <form @submit.prevent="onCriarCategoria" class="categoria-form">
            <div class="categoria-form-row">
              <!-- Campo para nome da categoria -->
              <div class="categoria-form-col">
                <div class="categoria-form-group">
                  <label class="categoria-form-label">Nome da Categoria</label>
                  <input 
                    v-model="novaCategoria.name" 
                    class="categoria-form-control" 
                    placeholder="Ex: Desenvolvimento Web" 
                    required 
                  />
                </div>
              </div>
              <!-- Campo para descrição da categoria -->
              <div class="categoria-form-col">
                <div class="categoria-form-group">
                  <label class="categoria-form-label">Descrição</label>
                  <input 
                    v-model="novaCategoria.description" 
                    class="categoria-form-control" 
                    placeholder="Breve descrição da categoria" 
                  />
                </div>
              </div>
              <!-- Campo para upload de imagem -->
              <div class="categoria-form-col-full">
                <div class="categoria-form-group">
                  <label class="categoria-form-label">Imagem da Categoria</label>
                  <input 
                    type="file" 
                    class="categoria-form-control" 
                    @change="onFileChange" 
                    accept="image/*" 
                  />
                  <small class="categoria-form-text">Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB</small>
                </div>
              </div>
            </div>
            <!-- Botão de ação do formulário -->
            <div class="categoria-form-actions">
              <button 
                class="categoria-btn categoria-btn-primary" 
                type="submit" 
                :disabled="carregandoCriar"
              >
                <!-- Spinner de carregamento -->
                <span v-if="carregandoCriar" class="categoria-spinner-small"></span>
                <i v-else class="bi bi-plus-circle"></i>
                {{ carregandoCriar ? 'Criando...' : 'Criar Categoria' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Container da lista de categorias existentes -->
        <div class="categoria-list-container">
          <!-- Header da lista com título e contador -->
          <div class="categoria-list-header">
            <h3 class="categoria-list-title">Categorias Cadastradas</h3>
            <span class="categoria-stats-badge">
              <i class="bi bi-tags"></i>
              {{ categorias.length }} categorias
            </span>
          </div>

          <!-- Estado de carregamento da lista -->
          <div v-if="carregandoLista" class="categoria-loading-container">
            <div class="categoria-spinner" role="status">
              <span class="categoria-visually-hidden">Carregando...</span>
            </div>
            <p class="categoria-loading-text">Carregando categorias...</p>
          </div>

          <!-- Estado de erro na lista -->
          <div v-else-if="erroLista" class="categoria-error-container">
            <i class="bi bi-exclamation-triangle categoria-error-icon"></i>
            <p class="categoria-error-text">{{ erroLista }}</p>
            <button class="categoria-btn categoria-btn-outline" @click="carregarCategorias">
              <i class="bi bi-arrow-clockwise"></i>Tentar Novamente
            </button>
          </div>

          <!-- Tabela de categorias (estado normal) -->
          <div v-else class="categoria-table-container">
            <div class="categoria-table-responsive">
              <table class="categoria-table">
                <thead>
                  <tr>
                    <th class="categoria-th-image">Imagem</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th class="categoria-th-actions">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Linha para cada categoria com paginação -->
                  <tr v-for="cat in categoriasPaginadas" :key="cat.id" class="categoria-table-row">
                    <!-- Célula da imagem da categoria -->
                    <td class="categoria-td-image">
                      <div class="categoria-image">
                        <img 
                          v-if="cat.image_path" 
                          :src="getImageUrl(cat.image_path)" 
                          alt="Imagem da categoria" 
                          class="categoria-image-img"
                        />
                        <!-- Placeholder quando não há imagem -->
                        <div v-else class="categoria-placeholder-image">
                          <i class="bi bi-image"></i>
                        </div>
                      </div>
                    </td>
                    <!-- Célula do nome da categoria -->
                    <td class="categoria-td-name">
                      <span class="categoria-name">{{ cat.name }}</span>
                    </td>
                    <!-- Célula da descrição da categoria -->
                    <td class="categoria-td-description">
                      <span class="categoria-description">{{ cat.description || 'Sem descrição' }}</span>
                    </td>
                    <!-- Célula das ações (editar/excluir) -->
                    <td class="categoria-td-actions">
                      <div class="categoria-actions">
                        <!-- Botão de editar categoria -->
                        <button 
                          class="categoria-btn categoria-btn-outline categoria-btn-sm" 
                          @click="abrirModalEditar(cat)"
                          title="Editar categoria"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <!-- Botão de excluir categoria -->
                        <button 
                          class="categoria-btn categoria-btn-danger categoria-btn-sm" 
                          @click="confirmarExcluirCategoria(cat.id)" 
                          :disabled="carregandoExcluir === cat.id"
                          title="Excluir categoria"
                        >
                          <span v-if="carregandoExcluir === cat.id" class="categoria-spinner-small"></span>
                          <i v-else class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Sistema de paginação -->
            <div v-if="totalPaginas > 1" class="categoria-pagination-container">
              <!-- Botão página anterior -->
              <button 
                class="categoria-btn categoria-btn-outline categoria-btn-sm" 
                :disabled="paginaAtual === 1" 
                @click="paginaAtual--"
              >
                <i class="bi bi-chevron-left"></i>Anterior
              </button>
              <!-- Informações da paginação -->
              <span class="categoria-pagination-info">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
              <!-- Botão próxima página -->
              <button 
                class="categoria-btn categoria-btn-outline categoria-btn-sm" 
                :disabled="paginaAtual === totalPaginas" 
                @click="paginaAtual++"
              >
                Próxima<i class="bi bi-chevron-right"></i>
              </button>
            </div>

            <!-- Estado vazio (quando não há categorias) -->
            <div v-if="categorias.length === 0" class="categoria-empty-container">
              <i class="bi bi-tags categoria-empty-icon"></i>
              <h4 class="categoria-empty-title">Nenhuma categoria encontrada</h4>
              <p class="categoria-empty-text">Crie sua primeira categoria para começar a organizar os cursos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para edição de categorias -->
    <template v-if="mostrarModalEditar">
      <div class="categoria-modal-overlay" @click="fecharModalEditar">
        <div class="categoria-modal-container" @click.stop>
          <div class="categoria-modal-content">
            <!-- Header do modal -->
            <div class="categoria-modal-header">
              <h5 class="categoria-modal-title">
                <i class="bi bi-pencil-square"></i>Editar Categoria
              </h5>
              <button type="button" class="categoria-modal-close" @click="fecharModalEditar">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <!-- Formulário de edição -->
            <form @submit.prevent="onEditarCategoria">
              <div class="categoria-modal-body">
                <!-- Campo nome -->
                <div class="categoria-form-group">
                  <label class="categoria-form-label">Nome</label>
                  <input 
                    v-model="categoriaEditar.name" 
                    type="text" 
                    class="categoria-form-control" 
                    required 
                  />
                </div>
                <!-- Campo descrição -->
                <div class="categoria-form-group">
                  <label class="categoria-form-label">Descrição</label>
                  <textarea 
                    v-model="categoriaEditar.description" 
                    class="categoria-form-control" 
                    rows="3"
                  ></textarea>
                </div>
                <!-- Campo nova imagem (opcional) -->
                <div class="categoria-form-group">
                  <label class="categoria-form-label">Nova Imagem (opcional)</label>
                  <input 
                    type="file" 
                    class="categoria-form-control" 
                    @change="onFileChangeEditar" 
                    accept="image/*" 
                  />
                </div>
                <!-- Mensagens de erro e sucesso -->
                <div v-if="erroEditar" class="categoria-alert categoria-alert-danger">
                  <i class="bi bi-exclamation-triangle"></i>{{ erroEditar }}
                </div>
                <div v-if="sucessoEditar" class="categoria-alert categoria-alert-success">
                  <i class="bi bi-check-circle"></i>Categoria editada com sucesso!
                </div>
              </div>
              <!-- Footer do modal com botões -->
              <div class="categoria-modal-footer">
                <button type="button" class="categoria-btn categoria-btn-secondary" @click="fecharModalEditar">
                  <i class="bi bi-x-circle"></i>Cancelar
                </button>
                <button type="submit" class="categoria-btn categoria-btn-primary" :disabled="carregandoEditar">
                  <span v-if="carregandoEditar" class="categoria-spinner-small"></span>
                  <i v-else class="bi bi-check-circle"></i>
                  {{ carregandoEditar ? 'Salvando...' : 'Salvar Alterações' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </template>
  </section>

  <!-- Modal de confirmação para exclusão de categorias -->
  <Teleport to="body">
    <div v-if="mostrarConfirmacaoExcluir" class="categoria-confirm-modal-overlay" @click="mostrarConfirmacaoExcluir = false">
      <div class="categoria-confirm-modal" @click.stop>
        <div class="categoria-confirm-content">
          <!-- Header do modal de confirmação -->
          <div class="categoria-confirm-header">
            <i class="bi bi-exclamation-triangle"></i>
            <h3>Confirmar Exclusão</h3>
          </div>
          <!-- Corpo do modal com aviso -->
          <div class="categoria-confirm-body">
            <p>Tem certeza que deseja excluir esta categoria?</p>
            <p class="categoria-confirm-warning">Esta ação não pode ser desfeita.</p>
          </div>
          <!-- Ações do modal (cancelar/confirmar) -->
          <div class="categoria-confirm-actions">
            <button class="categoria-confirm-btn-cancel" @click="mostrarConfirmacaoExcluir = false">
              Cancelar
            </button>
            <button class="categoria-confirm-btn-confirm" @click="excluirCategoria(categoriaParaExcluir)" :disabled="carregandoExcluir">
              <span v-if="carregandoExcluir" class="categoria-spinner-small"></span>
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
// Importações das APIs de categorias
import { listarCategorias, listarCategoriasPorUsuario, criarCategoria, deletarCategoria, atualizarCategoria, atualizarImagemCategoria } from '../../../services/api/categorias'

// Configuração da API base para imagens
const API_BASE = 'http://35.196.79.227:8000'

// Função para obter URL completa da imagem
function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return API_BASE + path
}

// Estados reativos principais
const categorias = ref([])                    // Lista de categorias carregadas
const carregandoLista = ref(false)            // Estado de carregamento da lista
const erroLista = ref('')                     // Mensagem de erro da lista
const novaCategoria = ref({ name: '', description: '', image: null })  // Dados do formulário de criação
const carregandoCriar = ref(false)            // Estado de carregamento da criação
const erroCriar = ref('')                     // Mensagem de erro na criação
const carregandoExcluir = ref(null)           // ID da categoria sendo excluída

// Estados para paginação
const categoriasPorPagina = 6                 // Quantidade de categorias por página
const paginaAtual = ref(1)                    // Página atual da paginação

// Computed properties para paginação
const totalPaginas = computed(() => Math.max(1, Math.ceil(categorias.value.length / categoriasPorPagina)))

const categoriasPaginadas = computed(() => {
  const start = (paginaAtual.value - 1) * categoriasPorPagina
  return categorias.value.slice(start, start + categoriasPorPagina)
})

// Função para carregar categorias da API
async function carregarCategorias() {
  carregandoLista.value = true
  erroLista.value = ''
  try {
    // Carrega categorias de um usuário específico (ID 192)
    categorias.value = await listarCategoriasPorUsuario(192)
  } catch (e) {
    console.warn('Erro ao carregar categorias do usuário:', e)
    categorias.value = []
    erroLista.value = typeof e === 'string' ? e : 'Erro ao carregar categorias.'
  } finally {
    carregandoLista.value = false
  }
}

// Função para capturar arquivo selecionado no formulário de criação
function onFileChange(e) {
  novaCategoria.value.image = e.target.files[0]
}

// Função para resetar formulário de criação
function resetForm() {
  novaCategoria.value = { name: '', description: '', image: null }
  erroCriar.value = ''
}

// Função para validar dados da categoria
function validarCategoria(cat) {
  const erros = []
  if (!cat.name || cat.name.length < 3) {
    erros.push('O nome deve ter pelo menos 3 caracteres.')
  }
  if (cat.name && cat.name.length > 50) {
    erros.push('O nome deve ter no máximo 50 caracteres.')
  }
  if (cat.description && cat.description.length > 200) {
    erros.push('A descrição deve ter no máximo 200 caracteres.')
  }
  return erros
}

// Função para validar imagem da categoria
function validarImagemCategoria(imagem) {
  if (!imagem) return []
  const tipos = ['image/jpeg', 'image/png', 'image/jpg']
  if (!tipos.includes(imagem.type)) {
    return ['A imagem deve ser JPG ou PNG.']
  }
  return []
}

// Função para criar nova categoria
async function onCriarCategoria() {
  erroCriar.value = ''
  
  // Validação dos dados
  const erros = [
    ...validarCategoria(novaCategoria.value),
    ...validarImagemCategoria(novaCategoria.value.image)
  ]
  
  if (erros.length > 0) {
    erros.forEach(msg => showToastGlobal && showToastGlobal(msg, 'danger'))
    return
  }
  
  carregandoCriar.value = true
  try {
    await criarCategoria(novaCategoria.value)
    showToastGlobal && showToastGlobal('Categoria criada com sucesso!', 'success')
    resetForm()
    await carregarCategorias()
  } catch (e) {
    erroCriar.value = typeof e === 'string' ? e : 'Erro ao criar categoria.'
    showToastGlobal && showToastGlobal(erroCriar.value, 'danger')
  } finally {
    carregandoCriar.value = false
  }
}

// Função para confirmar exclusão de categoria
function confirmarExcluirCategoria(id) {
  categoriaParaExcluir.value = id
  mostrarConfirmacaoExcluir.value = true
}

// Função para excluir categoria
async function excluirCategoria(id) {
  carregandoExcluir.value = id
  try {
    await deletarCategoria(id)
    showToastGlobal && showToastGlobal('Categoria excluída com sucesso!', 'success')
    await carregarCategorias()
  } catch (e) {
    erroLista.value = typeof e === 'string' ? e : 'Erro ao excluir categoria.'
    showToastGlobal && showToastGlobal(erroLista.value, 'danger')
  } finally {
    carregandoExcluir.value = null
    mostrarConfirmacaoExcluir.value = false
  }
}

// Estados para modal de edição
const mostrarModalEditar = ref(false)        // Controla exibição do modal
const categoriaEditar = ref({})              // Dados da categoria sendo editada
const carregandoEditar = ref(false)          // Estado de carregamento da edição
const erroEditar = ref('')                   // Mensagem de erro na edição
const sucessoEditar = ref(false)             // Flag de sucesso na edição
let imagemEditar = null                      // Nova imagem para edição

// Injeção do sistema global de toast
const showToastGlobal = inject('showToastGlobal')

// Estados para modal de confirmação de exclusão
const mostrarConfirmacaoExcluir = ref(false) // Controla exibição do modal de confirmação
const categoriaParaExcluir = ref(null)       // ID da categoria a ser excluída

// Função para abrir modal de edição
function abrirModalEditar(cat) {
  categoriaEditar.value = { ...cat }
  sucessoEditar.value = false
  erroEditar.value = ''
  mostrarModalEditar.value = true
  imagemEditar = null
}

// Função para fechar modal de edição
function fecharModalEditar() {
  mostrarModalEditar.value = false
  categoriaEditar.value = {}
  erroEditar.value = ''
  sucessoEditar.value = false
  imagemEditar = null
}

// Função para capturar arquivo selecionado no modal de edição
function onFileChangeEditar(e) {
  imagemEditar = e.target.files[0]
}

// Função para editar categoria
async function onEditarCategoria() {
  erroEditar.value = ''
  sucessoEditar.value = false
  carregandoEditar.value = true
  
  try {
    // Atualiza nome e descrição (JSON)
    await atualizarCategoria(categoriaEditar.value.id, {
      name: categoriaEditar.value.name,
      description: categoriaEditar.value.description
    })
    
    // Se houver nova imagem, atualiza separadamente
    if (imagemEditar) {
      await atualizarImagemCategoria(categoriaEditar.value.id, imagemEditar)
    }
    
    sucessoEditar.value = true
    showToastGlobal && showToastGlobal('Categoria editada com sucesso!', 'success')
    await carregarCategorias()
    
    // Fecha modal após 1.2 segundos para mostrar sucesso
    setTimeout(() => fecharModalEditar(), 1200)
  } catch (e) {
    erroEditar.value = typeof e === 'string' ? e : 'Erro ao editar categoria.'
    showToastGlobal && showToastGlobal(erroEditar.value, 'danger')
  } finally {
    carregandoEditar.value = false
  }
}

// Lifecycle hooks
onMounted(carregarCategorias)      // Carrega categorias ao montar componente
onActivated(carregarCategorias)    // Recarrega ao ativar componente (keep-alive)
</script>


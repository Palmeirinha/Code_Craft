<template>
  <section class="produto-section">
    <div class="produto-container">
      <div class="produto-wrapper">
        <!-- Header da seção -->
        <div class="produto-header">
          <h1 class="produto-title">Gerenciar Produtos</h1>
          <p class="produto-subtitle">Crie e gerencie os produtos dos cursos</p>
        </div>

        <!-- Formulário de criação -->
        <div class="produto-form-container">
          <h3 class="produto-form-title">
            <i class="bi bi-box-seam"></i>Novo Produto
          </h3>
          <form @submit.prevent="onCriarProduto" class="produto-form">
            <div class="produto-form-grid">
              <div class="produto-form-group">
                <label class="produto-form-label">Nome do Produto</label>
                <input 
                  v-model="novoProduto.name" 
                  type="text" 
                  class="produto-form-input" 
                  placeholder="Ex: Curso de Vue.js" 
                  required 
                />
              </div>
              <div class="produto-form-group">
                <label class="produto-form-label">Categoria</label>
                <select v-model="novoProduto.category_id" class="produto-form-select" required>
                  <option value="" disabled>Selecione uma categoria</option>
                  <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                </select>
              </div>
              <div class="produto-form-group">
                <label class="produto-form-label">Preço</label>
                <input 
                  v-model.number="novoProduto.price" 
                  type="number" 
                  class="produto-form-input" 
                  placeholder="Ex: 99.90" 
                  min="0" 
                  step="0.01" 
                  required 
                />
              </div>
              <div class="produto-form-group">
                <label class="produto-form-label">Estoque</label>
                <input 
                  v-model.number="novoProduto.stock" 
                  type="number" 
                  class="produto-form-input" 
                  placeholder="Ex: 50" 
                  min="0" 
                  required 
                />
              </div>
              <div class="produto-form-group produto-form-group-full">
                <label class="produto-form-label">Descrição</label>
                <textarea 
                  v-model="novoProduto.description" 
                  class="produto-form-textarea" 
                  placeholder="Breve descrição do produto" 
                  rows="3"
                ></textarea>
              </div>
              <div class="produto-form-group produto-form-group-full">
                <label class="produto-form-label">Imagem do Produto</label>
                <input 
                  type="file" 
                  class="produto-form-file" 
                  @change="onFileChange" 
                  accept="image/*" 
                  required 
                />
                <small class="produto-form-help">Formatos aceitos: JPG, PNG. Tamanho máximo: 5MB</small>
              </div>
            </div>
            <div class="produto-form-actions">
              <button 
                class="produto-btn produto-btn-outline" 
                type="button" 
                @click="resetForm" 
                :disabled="carregandoCriar"
              >
                <i class="bi bi-x-circle"></i>Limpar
              </button>
              <button 
                class="produto-btn produto-btn-primary" 
                type="submit" 
                :disabled="carregandoCriar"
              >
                <span v-if="carregandoCriar" class="produto-spinner"></span>
                <i v-else class="bi bi-check-circle"></i>
                {{ carregandoCriar ? 'Criando...' : 'Criar Produto' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Lista de produtos -->
        <div class="produto-list-container">
          <div class="produto-list-header">
            <h3 class="produto-list-title">Produtos Cadastrados</h3>
            <span class="produto-stats-badge">
              <i class="bi bi-box-seam"></i>
              {{ produtos.length }} produtos
            </span>
          </div>

          <!-- Busca -->
          <div class="produto-search-container">
            <div class="produto-search-group">
              <span class="produto-search-icon">
                <i class="bi bi-search"></i>
              </span>
              <input 
                v-model="busca" 
                type="text" 
                class="produto-search-input" 
                placeholder="Buscar produto por nome ou descrição..." 
              />
            </div>
          </div>

          <!-- Loading -->
          <div v-if="carregandoLista" class="produto-loading">
            <div class="produto-spinner"></div>
            <p class="produto-loading-text">Carregando produtos...</p>
          </div>

          <!-- Erro -->
          <div v-else-if="erroLista" class="produto-error">
            <i class="bi bi-exclamation-triangle"></i>
            <p class="produto-error-text">{{ erroLista }}</p>
            <button class="produto-btn produto-btn-outline" @click="carregarProdutos">
              <i class="bi bi-arrow-clockwise"></i>Tentar Novamente
            </button>
          </div>

          <!-- Estado vazio -->
          <div v-else-if="produtosFiltrados.length === 0" class="produto-empty">
            <i class="bi bi-archive"></i>
            <h3 class="produto-empty-title">Nenhum produto encontrado</h3>
            <p class="produto-empty-text">{{ busca ? 'Nenhum produto corresponde à sua busca.' : 'Crie seu primeiro produto para começar a vender cursos.' }}</p>
          </div>

          <!-- Tabela de produtos -->
          <div v-else class="produto-table-container">
            <div class="produto-table-responsive">
              <table class="produto-table">
                <thead>
                  <tr>
                    <th class="produto-th-image">Imagem</th>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th class="produto-th-actions">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="prod in produtosPaginados" :key="prod.id" class="produto-table-row">
                    <td class="produto-td-image">
                      <div class="produto-image-cell">
                        <img 
                          v-if="prod.image_path" 
                          :src="getImageUrl(prod.image_path)" 
                          alt="Imagem do produto" 
                          class="produto-table-image"
                        />
                        <div v-else class="produto-placeholder-image">
                          <i class="bi bi-image"></i>
                        </div>
                      </div>
                    </td>
                    <td class="produto-td-name">
                      <div class="produto-info">
                        <span class="produto-name">{{ prod.name }}</span>
                        <span v-if="prod.description" class="produto-description">{{ prod.description }}</span>
                      </div>
                    </td>
                    <td class="produto-td-category">
                      <span class="produto-categoria-badge">{{ prod.category?.name || '-' }}</span>
                    </td>
                    <td class="produto-td-price">
                      <div class="produto-price-info">
                        <span class="produto-price-value">R$ {{ prod.price }}</span>
                        <span v-if="prod.discounts && prod.discounts.length" class="produto-discount-badge">
                          {{ prod.discounts[0].discount_percentage }}% OFF
                        </span>
                      </div>
                    </td>
                    <td class="produto-td-stock">
                      <span class="produto-stock-badge" :class="produtoStockClass(prod.stock)">
                        {{ prod.stock }}
                      </span>
                    </td>
                    <td class="produto-td-actions">
                      <div class="produto-actions">
                        <button 
                          class="produto-btn produto-btn-outline produto-btn-sm" 
                          @click="abrirModalEditar(prod)"
                          title="Editar produto"
                        >
                          <i class="bi bi-pencil-square"></i>
                        </button>
                        <button 
                          class="produto-btn produto-btn-danger produto-btn-sm" 
                          @click="remover(prod.id)" 
                          :disabled="carregandoRemover === prod.id"
                          title="Remover produto"
                        >
                          <span v-if="carregandoRemover === prod.id" class="produto-spinner"></span>
                          <i v-else class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginação -->
            <div v-if="totalPaginas > 1" class="produto-pagination">
              <button 
                class="produto-btn produto-btn-outline produto-btn-sm" 
                :disabled="paginaAtual === 1" 
                @click="paginaAtual--"
              >
                <i class="bi bi-chevron-left"></i>Anterior
              </button>
              <span class="produto-pagination-info">Página {{ paginaAtual }} de {{ totalPaginas }}</span>
              <button 
                class="produto-btn produto-btn-outline produto-btn-sm" 
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

    <!-- Modal de edição -->
    <template v-if="mostrarModalEditar">
      <div class="produto-modal-backdrop" @click="fecharModalEditar"></div>
      <div class="produto-modal">
        <div class="produto-modal-dialog" @click.stop>
          <div class="produto-modal-content">
            <div class="produto-modal-header">
              <h5 class="produto-modal-title">
                <i class="bi bi-pencil-square"></i>Editar Produto
              </h5>
              <button type="button" class="produto-modal-close" @click="fecharModalEditar">
                <i class="bi bi-x-lg"></i>
              </button>
            </div>
            <form @submit.prevent="onEditarProduto">
              <div class="produto-modal-body">
                <div class="produto-modal-form-group">
                  <label class="produto-modal-label">Nome</label>
                  <input 
                    v-model="produtoEditar.name" 
                    type="text" 
                    class="produto-modal-input" 
                    required 
                  />
                </div>
                <div class="produto-modal-form-group">
                  <label class="produto-modal-label">Categoria</label>
                  <select v-model="produtoEditar.category_id" class="produto-modal-select" required>
                    <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
                  </select>
                </div>
                <div class="produto-modal-form-group">
                  <label class="produto-modal-label">Preço</label>
                  <input 
                    v-model.number="produtoEditar.price" 
                    type="number" 
                    class="produto-modal-input" 
                    step="0.01" 
                    required 
                  />
                </div>
                <div class="produto-modal-form-group">
                  <label class="produto-modal-label">Estoque</label>
                  <input 
                    v-model.number="produtoEditar.stock" 
                    type="number" 
                    class="produto-modal-input" 
                    required 
                  />
                </div>
                <div class="produto-modal-form-group">
                  <label class="produto-modal-label">Descrição</label>
                  <textarea 
                    v-model="produtoEditar.description" 
                    class="produto-modal-textarea"
                    rows="3"
                  ></textarea>
                </div>
                <div class="produto-modal-form-group">
                  <label class="produto-modal-label">Nova Imagem (opcional)</label>
                  <input 
                    type="file" 
                    class="produto-modal-file" 
                    @change="onFileChangeEditar" 
                    accept="image/*" 
                  />
                </div>
              </div>
              <div class="produto-modal-footer">
                <button type="button" class="produto-btn produto-btn-secondary" @click="fecharModalEditar">
                  <i class="bi bi-x-circle"></i>Cancelar
                </button>
                <button type="submit" class="produto-btn produto-btn-primary" :disabled="carregandoEditar">
                  <span v-if="carregandoEditar" class="produto-spinner"></span>
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
</template>

<script setup>
// Importações do Vue 3 Composition API
import { ref, onMounted, onActivated, computed, watch, inject } from 'vue'
// Importações das APIs necessárias
import { listarProdutos, criarProduto, removerProduto, editarProduto, atualizarEstoqueProduto } from '../../../services/api/produtos'
import { listarCategoriasPorUsuario } from '../../../services/api/categorias'
import { getImageUrl } from '../../../services/api/utils'
// Importação da store de autenticação
import { useUserStore } from '../../../services/stores/auth'

// Store do usuário para verificar papel e permissões
const userStore = useUserStore()

// Funções de validação movidas de utils/validators.js
// Validação de imagem (tipo, tamanho, formato)
function validarImagem(imagem, maxSize = 5) {
  if (!imagem) return { valido: false, erro: 'Imagem é obrigatória' }
  
  // Verificar tipo
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/jpg']
  if (!tiposPermitidos.includes(imagem.type)) {
    return { valido: false, erro: 'Tipo de imagem não suportado. Use JPG, JPEG ou PNG' }
  }
  
  // Verificar tamanho (em MB)
  const tamanhoMB = imagem.size / (1024 * 1024)
  if (tamanhoMB > maxSize) {
    return { valido: false, erro: `Imagem muito grande. Máximo: ${maxSize}MB` }
  }
  
  return { valido: true, erro: null }
}

// Validação completa do produto (nome, descrição, preço, estoque, categoria)
function validarProduto(produto, isEdicao = false) {
  const erros = []
  
  // Nome
  if (!produto.name || produto.name.trim().length < 3) {
    erros.push('Nome deve ter pelo menos 3 caracteres')
  }
  if (produto.name && produto.name.trim().length > 50) {
    erros.push('Nome deve ter no máximo 50 caracteres')
  }
  
  // Descrição
  if (!produto.description || produto.description.trim().length < 10) {
    erros.push('Descrição deve ter pelo menos 10 caracteres')
  }
  if (produto.description && produto.description.trim().length > 300) {
    erros.push('Descrição deve ter no máximo 300 caracteres')
  }
  
  // Preço
  if (!produto.price || isNaN(produto.price) || Number(produto.price) <= 0) {
    erros.push('Preço deve ser um valor válido maior que zero')
  }
  if (produto.price && Number(produto.price) > 500) {
    erros.push('Preço deve ser no máximo R$ 500,00')
  }
  
  // Estoque
  if (!produto.stock || isNaN(produto.stock) || Number(produto.stock) < 0) {
    erros.push('Estoque deve ser um número válido maior ou igual a zero')
  }
  if (produto.stock && Number(produto.stock) > 1000) {
    erros.push('Estoque deve ser no máximo 1000')
  }
  
  // Categoria
  if (!produto.category_id) {
    erros.push('Categoria é obrigatória')
  }
  
  // Imagem (apenas para criação)
  if (!isEdicao && (!produto.image || !validarImagem(produto.image).valido)) {
    erros.push('Imagem é obrigatória para novos produtos')
  }
  
  return {
    valido: erros.length === 0,
    erros: erros
  }
}

// Estados reativos principais
const produtos = ref([])                                    // Lista completa de produtos carregados
const categorias = ref([])                                  // Lista de categorias disponíveis para o usuário
const categoriasIdsUsuario = ref([])                        // IDs das categorias do usuário para filtro
const categoriasAdmin192 = ref([])                          // Categorias do admin 192 para moderadores
const carregandoLista = ref(false)                          // Estado de carregamento da lista
const erroLista = ref('')                                   // Mensagem de erro da lista
const novoProduto = ref({ name: '', description: '', price: '', stock: '', category_id: '', image: null })  // Dados do formulário de criação
const carregandoCriar = ref(false)                          // Estado de carregamento da criação
const carregandoRemover = ref(null)                         // ID do produto sendo removido
const busca = ref('')                                        // Termo de busca para filtrar produtos

// Toast global injetado do componente pai
const showToastGlobal = inject('showToastGlobal')

// Configurações de paginação
const produtosPorPagina = 6                                 // Quantidade de produtos por página
const paginaAtual = ref(1)                                  // Página atual sendo exibida

// Computed properties para filtro e paginação
const produtosFiltrados = computed(() => {
  if (!busca.value) return produtos.value
  const termo = busca.value.toLowerCase()
  return produtos.value.filter(prod =>
    (prod.name && prod.name.toLowerCase().includes(termo)) ||
    (prod.description && prod.description.toLowerCase().includes(termo))
  )
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(produtosFiltrados.value.length / produtosPorPagina)))
const produtosPaginados = computed(() => {
  const start = (paginaAtual.value - 1) * produtosPorPagina
  return produtosFiltrados.value.slice(start, start + produtosPorPagina)
})

// Watcher para resetar página ao buscar
watch(busca, () => { paginaAtual.value = 1 })

// Função para capturar arquivo de imagem selecionado
function onFileChange(e) {
  novoProduto.value.image = e.target.files[0]
}

// Função para resetar formulário de criação
function resetForm() {
  novoProduto.value = { name: '', description: '', price: '', stock: '', category_id: '', image: null }
}

// Função para retornar classe CSS baseada no estoque do produto
function produtoStockClass(stock) {
  if (stock === 0) return 'produto-stock-empty'
  if (stock <= 10) return 'produto-stock-low'
  return 'produto-stock-ok'
}

// Função principal para carregar produtos da API
async function carregarProdutos() {
  carregandoLista.value = true
  erroLista.value = ''
  try {
    const todosProdutos = await listarProdutos()
    console.log('Produtos carregados:', todosProdutos.length, 'Role:', userStore.userRole)
    
    if (userStore.userRole === 'ADMIN') {
      // Admin vê apenas produtos de suas categorias
      produtos.value = todosProdutos.filter(prod => categoriasIdsUsuario.value.includes(prod.category_id))
      console.log('Produtos filtrados para admin:', produtos.value.length)
    } else if (userStore.userRole === 'MODERATOR') {
      // Moderador vê apenas produtos das categorias do admin 192
      const idsCategoriasAdmin192 = categoriasAdmin192.value.map(cat => cat.id)
      console.log('IDs das categorias do admin 192 para filtro:', idsCategoriasAdmin192)
      
      produtos.value = todosProdutos.filter(prod => idsCategoriasAdmin192.includes(prod.category_id))
      console.log('Produtos filtrados para moderador (admin 192):', produtos.value.length)
    } else {
      // Usuário comum vê todos os produtos
      produtos.value = todosProdutos
    }
  } catch (e) {
    erroLista.value = typeof e === 'string' ? e : 'Erro ao carregar produtos.'
    showToastGlobal && showToastGlobal(erroLista.value, 'danger')
  } finally {
    carregandoLista.value = false
  }
}

// Função para carregar categorias baseada no papel do usuário
async function carregarCategorias() {
  try {
    // Usar o ID do usuário logado em vez do ID fixo
    const userId = userStore.user?.id
    if (!userId) {
      console.warn('Usuário não encontrado, não é possível carregar categorias')
      categorias.value = []
      categoriasIdsUsuario.value = []
      return
    }
    
    console.log('Carregando categorias para usuário:', userId, 'Role:', userStore.userRole)
    
    if (userStore.userRole === 'ADMIN') {
      // Admin carrega suas próprias categorias
      categorias.value = await listarCategoriasPorUsuario(userId)
      categoriasIdsUsuario.value = categorias.value.map(cat => cat.id)
      console.log('Categorias carregadas para admin:', userId, 'Total:', categorias.value.length)
    } else if (userStore.userRole === 'MODERATOR') {
      // Moderador carrega as categorias do admin 192 para foco e formulário
      try {
        console.log('Moderador: Carregando categorias do admin 192...')
        const categoriasAdmin192Data = await listarCategoriasPorUsuario(192)
        console.log('Categorias do admin 192 carregadas para moderador:', categoriasAdmin192Data.length)
        
        if (categoriasAdmin192Data && categoriasAdmin192Data.length > 0) {
          // Moderador usa as categorias do admin 192 para o formulário de criação
          categoriasAdmin192.value = categoriasAdmin192Data
          categorias.value = categoriasAdmin192Data
          categoriasIdsUsuario.value = categorias.value.map(cat => cat.id)
          console.log('Categorias do admin 192 carregadas para formulário do moderador:', categorias.value.length)
          console.log('IDs das categorias disponíveis:', categoriasIdsUsuario.value)
        } else {
          console.warn('Nenhuma categoria encontrada para o admin 192')
          categorias.value = []
          categoriasIdsUsuario.value = []
        }
      } catch (error) {
        console.warn('Erro ao carregar categorias do admin 192:', error)
        categoriasAdmin192.value = []
        categorias.value = []
        categoriasIdsUsuario.value = []
      }
    } else {
      // Usuário comum carrega suas categorias
      categorias.value = await listarCategoriasPorUsuario(userId)
      categoriasIdsUsuario.value = categorias.value.map(cat => cat.id)
      console.log('Categorias carregadas para usuário:', userId, 'Total:', categorias.value.length)
    }
  } catch (e) {
    console.warn('Erro ao carregar categorias do usuário:', e)
    categorias.value = []
    categoriasIdsUsuario.value = []
  }
}

// Função para criar novo produto via API
async function onCriarProduto() {
  const validacao = validarProduto(novoProduto.value)
  if (!validacao.valido) {
    showToastGlobal && showToastGlobal(validacao.erros.join('\n'), 'danger')
    return
  }
  carregandoCriar.value = true
  try {
    const formData = new FormData()
    formData.append('name', novoProduto.value.name)
    formData.append('price', String(Number(novoProduto.value.price).toFixed(2)))
    formData.append('stock', parseInt(novoProduto.value.stock))
    formData.append('category_id', parseInt(novoProduto.value.category_id))
    if (novoProduto.value.description) formData.append('description', novoProduto.value.description)
    if (novoProduto.value.image) formData.append('image', novoProduto.value.image)
    await criarProduto(formData)
    resetForm()
    await carregarProdutos()
    showToastGlobal && showToastGlobal('Produto criado com sucesso!', 'success')
  } catch (e) {
    const erro = typeof e === 'string' ? e : 'Erro ao criar produto.'
    showToastGlobal && showToastGlobal(erro, 'danger')
  } finally {
    carregandoCriar.value = false
  }
}

// Função para remover produto via API
async function remover(id) {
  // Verificar se há token de autenticação
  const token = localStorage.getItem('token')
  if (!token) {
    showToastGlobal && showToastGlobal('Sessão expirada. Faça login novamente.', 'danger')
    return
  }
  
  carregandoRemover.value = id
  try {
    await removerProduto(id)
    await carregarProdutos()
    showToastGlobal && showToastGlobal('Produto removido com sucesso!', 'success')
  } catch (e) {
    const erro = typeof e === 'string' ? e : 'Erro ao remover produto.'
    showToastGlobal && showToastGlobal(erro, 'danger')
  } finally {
    carregandoRemover.value = null
  }
}

// Estados para modal de edição
const mostrarModalEditar = ref(false)                       // Controla exibição do modal de edição
const produtoEditar = ref({
  name: '',
  description: '',
  price: '',
  stock: '',
  category_id: '',
  image: null
})                                                          // Dados do produto sendo editado
const carregandoEditar = ref(false)                         // Estado de carregamento da edição
let imagemEditar = null                                     // Nova imagem selecionada para edição
let estoqueOriginalEditar = null                            // Estoque original para comparação

// Função para abrir modal de edição
function abrirModalEditar(prod) {
  produtoEditar.value = { ...prod }
  mostrarModalEditar.value = true
  imagemEditar = null
  estoqueOriginalEditar = prod.stock
}

// Função para fechar modal de edição
function fecharModalEditar() {
  mostrarModalEditar.value = false
  produtoEditar.value = {
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: null
  }
  imagemEditar = null
  estoqueOriginalEditar = null
}

// Função para capturar arquivo de imagem no modal de edição
function onFileChangeEditar(e) {
  imagemEditar = e.target.files[0]
}

// Função para editar produto via API
async function onEditarProduto() {
  const validacao = validarProduto(produtoEditar.value, true)
  if (!validacao.valido) {
    showToastGlobal && showToastGlobal(validacao.erros.join('\n'), 'danger')
    carregandoEditar.value = false
    return
  }
  carregandoEditar.value = true
  try {
    // Preparar payload com os dados do produto (apenas campos permitidos pela API)
    const payload = {
      name: produtoEditar.value.name,
      price: Number(produtoEditar.value.price),
      category_id: Number(produtoEditar.value.category_id),
      description: produtoEditar.value.description || ''
    }
    
    // Primeiro, atualizar dados gerais do produto
    await editarProduto(produtoEditar.value.id, payload)
    
    // Se há nova imagem, atualizar imagem separadamente
    if (imagemEditar) {
      await editarProduto(produtoEditar.value.id, {}, imagemEditar)
    }
    
    // Atualizar estoque se foi alterado (endpoint separado)
    if (produtoEditar.value.stock !== estoqueOriginalEditar) {
      await atualizarEstoqueProduto(produtoEditar.value.id, produtoEditar.value.stock)
    }
    
    await carregarProdutos()
    showToastGlobal && showToastGlobal('Produto editado com sucesso!', 'success')
    setTimeout(() => fecharModalEditar(), 1200)
  } catch (e) {
    const erro = typeof e === 'string' ? e : 'Erro ao editar produto.'
    showToastGlobal && showToastGlobal(erro, 'danger')
  } finally {
    carregandoEditar.value = false
  }
}

// Lifecycle hook: executado quando o componente é montado
onMounted(async () => {
  await carregarCategorias()
  await carregarProdutos()
})

// Lifecycle hook: executado quando o componente é reativado (keep-alive)
onActivated(async () => {
  await carregarCategorias()
  await carregarProdutos()
})
</script>


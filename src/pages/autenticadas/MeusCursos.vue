<template>
  <section class="meus-cursos-section">
    <div class="meus-cursos-container">
      <div class="meus-cursos-header">
        <h1 class="meus-cursos-title">
          <i class="bi bi-book"></i>
          Meus Cursos
        </h1>
        <button class="meus-cursos-btn meus-cursos-btn-outline" @click="carregar">
          <i class="bi bi-arrow-clockwise"></i> Atualizar
        </button>
      </div>

      <!-- Estatísticas dos cursos -->
      <div class="meus-cursos-stats">
        <div class="meus-cursos-stat-card meus-cursos-stat-primary">
          <div class="meus-cursos-stat-icon">
            <i class="bi bi-book"></i>
          </div>
          <div class="meus-cursos-stat-content">
            <h3 class="meus-cursos-stat-number">{{ estatisticas.total }}</h3>
            <p class="meus-cursos-stat-label">Total de Cursos</p>
          </div>
        </div>
        <div class="meus-cursos-stat-card meus-cursos-stat-success">
          <div class="meus-cursos-stat-icon">
            <i class="bi bi-play-circle"></i>
          </div>
          <div class="meus-cursos-stat-content">
            <h3 class="meus-cursos-stat-number">{{ estatisticas.ativos }}</h3>
            <p class="meus-cursos-stat-label">Cursos Ativos</p>
          </div>
        </div>
        <div class="meus-cursos-stat-card meus-cursos-stat-info">
          <div class="meus-cursos-stat-icon">
            <i class="bi bi-check-circle"></i>
          </div>
          <div class="meus-cursos-stat-content">
            <h3 class="meus-cursos-stat-number">{{ estatisticas.concluidos }}</h3>
            <p class="meus-cursos-stat-label">Concluídos</p>
          </div>
        </div>
      </div>

      <div v-if="carregando" class="meus-cursos-loading">
        <div class="meus-cursos-spinner"></div>
        <p class="meus-cursos-loading-text">Carregando seus cursos...</p>
      </div>
      
      <div v-else>
        <div v-if="cursos.length === 0" class="meus-cursos-empty">
          <div class="meus-cursos-empty-icon">
            <i class="bi bi-book"></i>
          </div>
          <h2 class="meus-cursos-empty-title">Você ainda não possui nenhum curso</h2>
          <p class="meus-cursos-empty-description">
            Os cursos aparecem aqui quando o administrador marca seus pedidos como "Entregue"
          </p>
          
          <div class="meus-cursos-tips-card">
            <div class="meus-cursos-tips-header">
              <i class="bi bi-lightbulb"></i>
              <span>Como obter seus cursos:</span>
            </div>
            <div class="meus-cursos-tips-content">
              <div class="meus-cursos-tip-item">
                <div class="meus-cursos-tip-number">1</div>
                <span>Faça um pedido na seção "Cursos"</span>
              </div>
              <div class="meus-cursos-tip-item">
                <div class="meus-cursos-tip-number">2</div>
                <span>Aguarde o administrador marcar o pedido como "Entregue"</span>
              </div>
              <div class="meus-cursos-tip-item">
                <div class="meus-cursos-tip-number">3</div>
                <span>O curso aparecerá automaticamente aqui</span>
              </div>
            </div>
          </div>
          
          <router-link to="/cursos" class="meus-cursos-explore-btn">
            <i class="bi bi-search"></i>
            <span>Explorar Cursos</span>
          </router-link>
        </div>
        
        <div v-else class="meus-cursos-grid">
          <div 
            v-for="curso in cursos" 
            :key="curso.id" 
            :class="['meus-cursos-item', { 'completed': curso.progress === 100 }]"
          >
            <div class="meus-cursos-item-image">
              <img 
                v-if="curso.image_path" 
                :src="getImageUrl(curso.image_path)" 
                :alt="curso.name"
                class="meus-cursos-img"
              >
              <div v-else class="meus-cursos-placeholder">
                <i class="bi bi-book"></i>
              </div>
              <div class="meus-cursos-badge">
                <span :class="meusCursosStatusClass(curso.status)">{{ traduzirStatus(curso.status) }}</span>
              </div>
            </div>
            
            <div class="meus-cursos-item-content">
              <h5 class="meus-cursos-item-title">{{ curso.name }}</h5>
              <p class="meus-cursos-item-description">{{ curso.description || 'Descrição não disponível' }}</p>
              
              <div class="meus-cursos-item-meta">
                <div class="meus-cursos-item-price">
                  <span class="meus-cursos-price-tag">R$ {{ curso.price }}</span>
                  <span class="meus-cursos-category-tag">{{ curso.category_name || 'Sem categoria' }}</span>
                </div>
                <div class="meus-cursos-item-order">
                  <i class="bi bi-receipt"></i>
                  <span>Pedido #{{ curso.order_id }}</span>
                </div>
              </div>
              
              <div class="meus-cursos-item-progress">
                <div class="meus-cursos-progress-info">
                  <span class="meus-cursos-progress-text">{{ curso.progress }}% concluído</span>
                </div>
                <div class="meus-cursos-progress-bar-container">
                  <div 
                    class="meus-cursos-progress-fill" 
                    :style="{ width: curso.progress + '%' }"
                  ></div>
                </div>
              </div>
              
              <div class="meus-cursos-item-actions">
                <button class="meus-cursos-btn meus-cursos-btn-primary" @click="marcarConcluido(curso)">
                  <i class="bi bi-check-circle"></i>
                  <span>Marcar como Concluído</span>
                </button>
                <button class="meus-cursos-btn meus-cursos-btn-secondary" @click="baixarCertificado(curso)">
                  <i class="bi bi-download"></i>
                  <span>Baixar Certificado</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Toasts globais -->
      <div class="meus-cursos-toast-container">
        <div v-for="(toast, i) in toasts" :key="i" :class="['meus-cursos-toast', 'meus-cursos-toast-' + toast.type, 'meus-cursos-toast-show']" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="meus-cursos-toast-content">
            <div class="meus-cursos-toast-body">
              <i v-if="toast.type==='success'" class="bi bi-check-circle-fill"></i>
              <i v-else class="bi bi-x-circle-fill"></i>
              {{ toast.msg }}
            </div>
            <button type="button" class="meus-cursos-toast-close" @click="removerToast(i)" aria-label="Close">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { listarPedidosUsuario } from '../../services/api/orders'
import { getImageUrl } from '../../services/api/utils'
import { useUserStore } from '../../services/stores/auth'
import { listarCategoriasPorUsuario } from '../../services/api/categories'
import jsPDF from 'jspdf'

const cursos = ref([])
const carregando = ref(false)
const toasts = ref([])
const categorias = ref([])

// Estatísticas computadas
const estatisticas = computed(() => {
  const total = cursos.value.length
  const ativos = cursos.value.filter(c => c.status === 'ACTIVE').length
  const concluidos = cursos.value.filter(c => c.progress === 100).length
  
  return { total, ativos, concluidos }
})

function showToastGlobal(msg, type = 'danger') {
  toasts.value.push({ msg, type })
  setTimeout(() => { toasts.value.shift() }, 4000)
}

function removerToast(i) { 
  toasts.value.splice(i, 1) 
}

function formatarData(data) {
  if (!data) return ''
  return new Date(data).toLocaleString('pt-BR')
}

function buscarNomeCategoria(categoryId) {
  if (!categoryId || !categorias.value.length) return 'Sem categoria'
  
  const categoria = categorias.value.find(cat => cat.id === categoryId)
  return categoria ? categoria.name : `Categoria ${categoryId}`
}

function traduzirStatus(status) {
  const traducoes = {
    'ACTIVE': 'Ativo',
    'COMPLETED': 'Concluído',
    'IN_PROGRESS': 'Em Andamento',
    'NOT_STARTED': 'Não Iniciado'
  }
  return traducoes[status] || status
}

function meusCursosStatusClass(status) {
  if (status === 'ACTIVE') return 'meus-cursos-badge-success'
  if (status === 'COMPLETED') return 'meus-cursos-badge-primary'
  if (status === 'IN_PROGRESS') return 'meus-cursos-badge-warning'
  if (status === 'NOT_STARTED') return 'meus-cursos-badge-secondary'
  return 'meus-cursos-badge-secondary'
}

async function carregar() {
  carregando.value = true
  try {
    const userStore = useUserStore()
    
    // Primeiro, carregar as categorias disponíveis
    try {
      const categoriasDisponiveis = await listarCategoriasPorUsuario(userStore.user?.id)
      categorias.value = categoriasDisponiveis
      console.log('🔍 Categorias carregadas:', categoriasDisponiveis)
    } catch (error) {
      console.warn('⚠️ Não foi possível carregar categorias:', error)
      categorias.value = []
    }
    
    // Depois, carregar os pedidos
    const pedidos = await listarPedidosUsuario()
    console.log('🔍 Estrutura dos pedidos:', pedidos)
    
    // Extrair cursos dos pedidos SHIPPED (gambiarra: quando admin marca como entregue)
    const cursosComprados = []
    
    pedidos.forEach(pedido => {
      console.log('🔍 Pedido:', pedido)
      console.log('🔍 Status:', pedido.status)
      console.log('🔍 Products:', pedido.products)
      
      if (pedido.status === 'SHIPPED' && pedido.products) {
        // Pedido entregue, extraindo cursos
        pedido.products.forEach(produto => {
          console.log('🔍 Produto:', produto)
          console.log('🔍 Categoria do produto:', produto.category_name)
          console.log('🔍 Category ID:', produto.category_id)
          console.log('🔍 Category object:', produto.category)
          
          // Verificar se o curso já não foi adicionado
          const cursoExistente = cursosComprados.find(c => c.id === produto.id)
          if (!cursoExistente) {
            // Buscar nome da categoria de forma mais robusta
            let categoryName = 'Sem categoria'
            
            if (produto.category_name) {
              categoryName = produto.category_name
            } else if (produto.category && produto.category.name) {
              categoryName = produto.category.name
            } else if (produto.category_id) {
              categoryName = buscarNomeCategoria(produto.category_id)
            }
            
            const novoCurso = {
              id: produto.id,
              name: produto.name,
              description: produto.description,
              price: produto.price,
              image_path: produto.image_path,
              category_name: categoryName,
              status: 'ACTIVE', // Curso ativo quando pedido está SHIPPED (entregue)
              progress: 0, // Progresso inicial
              order_date: pedido.order_date,
              order_id: pedido.id // Guardar ID do pedido para referência
            }
            console.log('🔍 Novo curso criado:', novoCurso)
            cursosComprados.push(novoCurso)
            // Curso adicionado aos meus cursos
          }
        })
      } else {
        console.log('🔍 Pedido não entregue ou sem produtos')
        // Pedido aguardando entrega
      }
    })
    
    cursos.value = cursosComprados
    
    // Carregar dados salvos do localStorage (progresso, status)
    carregarCursosLocal()
    
    // Total de cursos disponíveis
  } catch (e) {
    // Erro ao carregar cursos
    cursos.value = []
    showToastGlobal('Não foi possível carregar seus cursos. Tente novamente.', 'warning')
  } finally {
    carregando.value = false
  }
}

function marcarConcluido(curso) {
  try {
    // Atualizar o progresso do curso para 100%
    curso.progress = 100
    curso.status = 'COMPLETED'
    
    // Salvar no localStorage para persistir os dados
    salvarCursosLocal()
    
    // Mostrar mensagem de sucesso
    showToastGlobal(`Parabéns! Curso "${curso.name}" marcado como concluído! 🎉`, 'success')
    
    // Atualizar estatísticas automaticamente
    // (as computed properties já fazem isso)
    
  } catch (error) {
    showToastGlobal('Erro ao marcar curso como concluído. Tente novamente.', 'danger')
    console.error('Erro ao marcar curso como concluído:', error)
  }
}

function baixarCertificado(curso) {
  try {
    // Verificar se o curso foi concluído
    if (curso.progress < 100) {
      showToastGlobal('Complete o curso primeiro para baixar o certificado! 📚', 'warning')
      return
    }
    
    // Gerar o certificado
    gerarCertificadoPDF(curso)
    
    showToastGlobal(`Certificado do curso "${curso.name}" gerado com sucesso! 🎓`, 'success')
    
  } catch (error) {
    showToastGlobal('Erro ao gerar certificado. Tente novamente.', 'danger')
    console.error('Erro ao gerar certificado:', error)
  }
}

function gerarCertificadoPDF(curso) {
  const userStore = useUserStore()
  const userName = userStore.user?.name || 'Usuário'
  const dataAtual = new Date().toLocaleDateString('pt-BR')
  
  // Criar novo documento PDF
  const doc = new jsPDF()
  
  // Configurar fonte e tamanho
  doc.setFontSize(24)
  doc.setTextColor(59, 130, 246) // Azul
  
  // Título do certificado
  doc.text('CERTIFICADO DE CONCLUSÃO', 105, 40, { align: 'center' })
  
  // Linha decorativa
  doc.setDrawColor(59, 130, 246)
  doc.setLineWidth(0.5)
  doc.line(30, 50, 180, 50)
  
  // Texto do certificado
  doc.setFontSize(14)
  doc.setTextColor(51, 51, 51)
  doc.text(`Certificamos que ${userName} concluiu com êxito o curso:`, 105, 70, { align: 'center' })
  
  // Nome do curso
  doc.setFontSize(18)
  doc.setTextColor(59, 130, 246)
  doc.text(curso.name, 105, 90, { align: 'center' })
  
  // Descrição adicional
  doc.setFontSize(12)
  doc.setTextColor(51, 51, 51)
  doc.text('Este certificado atesta a conclusão de todos os módulos e atividades', 105, 110, { align: 'center' })
  doc.text('do curso, demonstrando domínio dos conhecimentos apresentados.', 105, 120, { align: 'center' })
  
  // Data de conclusão
  doc.setFontSize(14)
  doc.text(`Data de Conclusão: ${dataAtual}`, 105, 150, { align: 'center' })
  
  // Categoria do curso
  doc.setFontSize(12)
  doc.text(`Categoria: ${curso.category_name || 'Geral'}`, 105, 170, { align: 'center' })
  
  // Assinatura (simulada)
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('CodeCraft Academy', 105, 200, { align: 'center' })
  
  // Salvar o PDF
  const nomeArquivo = `certificado_${curso.name.replace(/[^a-zA-Z0-9]/g, '_')}_${dataAtual.replace(/\//g, '-')}.pdf`
  doc.save(nomeArquivo)
}

function salvarCursosLocal() {
  try {
    const userStore = useUserStore()
    const userId = userStore.user?.id || 'anonimo'
    const chave = `meus_cursos_${userId}`
    
    // Salvar cursos atualizados no localStorage
    localStorage.setItem(chave, JSON.stringify(cursos.value))
  } catch (error) {
    console.error('Erro ao salvar cursos no localStorage:', error)
  }
}

function carregarCursosLocal() {
  try {
    const userStore = useUserStore()
    const userId = userStore.user?.id || 'anonimo'
    const chave = `meus_cursos_${userId}`
    
    // Carregar cursos salvos do localStorage
    const cursosSalvos = localStorage.getItem(chave)
    if (cursosSalvos) {
      const cursosLocal = JSON.parse(cursosSalvos)
      
      // Mesclar com os cursos da API, mantendo progresso local
      cursos.value.forEach(cursoAPI => {
        const cursoLocal = cursosLocal.find(c => c.id === cursoAPI.id)
        if (cursoLocal) {
          cursoAPI.progress = cursoLocal.progress
          cursoAPI.status = cursoLocal.status
        }
      })
    }
  } catch (error) {
    console.error('Erro ao carregar cursos do localStorage:', error)
  }
}

onMounted(carregar)
</script>


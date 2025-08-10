<template>
  <div class="finalizar-compra-container">
    <!-- Header da página -->
    <div class="finalizar-compra-page-header">
      <div class="finalizar-compra-header-content">
        <div class="finalizar-compra-header-icon">
            <i class="bi bi-cart-check"></i>
          </div>
        <div class="finalizar-compra-header-text">
          <h1>Finalizar Compra</h1>
          <p>Complete sua compra de forma segura e rápida</p>
        </div>
      </div>
    </div>

    <div class="finalizar-compra-content">
      <!-- Mensagem para usuários não autenticados -->
      <div v-if="!userStore.isAuthenticated" class="finalizar-compra-auth-required-message">
        <div class="finalizar-compra-auth-required-content">
          <div class="finalizar-compra-auth-required-icon">
            <i class="bi bi-shield-lock"></i>
          </div>
          <h3 class="finalizar-compra-auth-required-title">Autenticação Necessária</h3>
          <p class="finalizar-compra-auth-required-text">Para finalizar sua compra, você precisa estar logado em sua conta.</p>
          <button class="finalizar-compra-auth-required-btn" @click="openAuthModal">
            <i class="bi bi-person"></i>
            Fazer Login
          </button>
        </div>
      </div>

      <div v-else class="finalizar-compra-main-content">
        <!-- Resumo do Pedido -->
        <div class="finalizar-compra-resumo-wrapper">
          <div class="finalizar-compra-resumo-card">
            <div class="finalizar-compra-resumo-header">
              <div class="finalizar-compra-resumo-icon">
                <i class="bi bi-receipt"></i>
              </div>
              <h3 class="finalizar-compra-resumo-title">Resumo do Pedido</h3>
              <span class="finalizar-compra-resumo-count">{{ produtos.length }} item{{ produtos.length !== 1 ? 's' : '' }}</span>
            </div>

            <div class="finalizar-compra-resumo-produtos">
              <div 
                v-for="item in produtos" 
                :key="item.id" 
                class="finalizar-compra-produto-item"
              >
                <div class="finalizar-compra-produto-imagem">
                  <img 
                    v-if="item.image_path" 
                    :src="item.image_path" 
                    :alt="item.name"
                    @error="handleImageError"
                    class="finalizar-compra-produto-img"
                  />
                  <div v-else class="finalizar-compra-produto-icon">
                    <i class="bi bi-journal-code"></i>
                  </div>
                </div>
                <div class="finalizar-compra-produto-info">
                  <h6 class="finalizar-compra-produto-nome">{{ item.name }}</h6>
                  <span class="finalizar-compra-produto-categoria">{{ item.category }}</span>
                </div>
                <div class="finalizar-compra-produto-preco">
                  R$ {{ item.price.toFixed(2).replace('.', ',') }}
                </div>
              </div>
            </div>

            <div class="finalizar-compra-resumo-totais">
              <div class="finalizar-compra-total-item">
                <span>Subtotal</span>
                <span>R$ {{ total.toFixed(2).replace('.', ',') }}</span>
              </div>
              
              <div v-if="cupomSucesso" class="finalizar-compra-total-item desconto">
                <span>Desconto ({{ cupomSucesso.discount_percentage }}%)</span>
                <span>- R$ {{ (total * (cupomSucesso.discount_percentage/100)).toFixed(2).replace('.', ',') }}</span>
              </div>
              
              <div class="finalizar-compra-total-item total-final">
                <span>Total Final</span>
                <span>R$ {{ totalComDesconto.toFixed(2).replace('.', ',') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Formulário de Finalização -->
        <div class="finalizar-compra-formulario-wrapper">
          <div class="finalizar-compra-formulario-container">
            <!-- Endereço de Entrega -->
            <div class="finalizar-compra-form-section">
              <div class="finalizar-compra-section-header">
                <div class="finalizar-compra-section-icon">
                  <i class="bi bi-geo-alt"></i>
                </div>
                <h4>Endereço de Entrega</h4>
              </div>
              
              <div class="finalizar-compra-section-content">
                <div v-if="enderecoSelecionado" class="finalizar-compra-endereco-selecionado">
                  <div class="finalizar-compra-endereco-info">
                    <i class="bi bi-check-circle-fill"></i>
                    <div class="finalizar-compra-endereco-texto">
                      <strong>{{ enderecoFormatado }}</strong>
                    </div>
                  </div>
                  <button class="finalizar-compra-btn-trocar" @click="abrirModalEndereco">
                    <i class="bi bi-pencil"></i>
                    Trocar Endereço
                  </button>
                </div>
                <div v-else class="finalizar-compra-endereco-vazio">
                  <div class="finalizar-compra-endereco-placeholder">
                    <i class="bi bi-geo-alt"></i>
                    <p>Nenhum endereço selecionado</p>
                  </div>
                  <button class="finalizar-compra-btn-selecionar" @click="abrirModalEndereco">
                    <i class="bi bi-plus-circle"></i>
                    Selecionar Endereço
                  </button>
                </div>
              </div>
            </div>

            <!-- Cupom de Desconto -->
            <div class="finalizar-compra-form-section">
              <div class="finalizar-compra-section-header">
                <div class="finalizar-compra-section-icon">
                  <i class="bi bi-ticket-perforated"></i>
                </div>
                <h4>Cupom de Desconto</h4>
              </div>
              
              <div class="finalizar-compra-section-content">
                <div class="finalizar-compra-cupom-container">
                  <div class="finalizar-compra-cupom-input-group">
                    <input 
                      v-model="codigoCupom" 
                      class="finalizar-compra-cupom-input" 
                      placeholder="Digite o código do cupom" 
                      :disabled="aplicandoCupom"
                    />
                    <button 
                      class="finalizar-compra-btn-aplicar-cupom" 
                      @click="aplicarCupom" 
                      :disabled="aplicandoCupom || !codigoCupom.trim()"
                    >
                      <span v-if="aplicandoCupom" class="finalizar-compra-spinner"></span>
                      <span v-else>Aplicar</span>
                    </button>
                  </div>
                  
                  <div v-if="cupomErro" class="finalizar-compra-cupom-erro">
                    <i class="bi bi-exclamation-circle"></i>
                    {{ cupomErro }}
                  </div>
                  
                  <div v-if="cupomSucesso" class="finalizar-compra-cupom-sucesso">
                    <i class="bi bi-check-circle"></i>
                    Cupom aplicado: {{ cupomSucesso.code }} ({{ cupomSucesso.discount_percentage }}% de desconto)
                  </div>
                </div>
              </div>
            </div>

            <!-- Forma de Pagamento -->
            <div class="finalizar-compra-form-section">
              <div class="finalizar-compra-section-header">
                <div class="finalizar-compra-section-icon">
                  <i class="bi bi-credit-card"></i>
                </div>
                <h4>Forma de Pagamento</h4>
              </div>
              
              <div class="finalizar-compra-section-content">
                <div class="finalizar-compra-pagamento-opcoes">
                  <div 
                    class="finalizar-compra-pagamento-opcao" 
                    :class="{ selected: pagamento === 'pix' }"
                    @click="pagamento = 'pix'"
                  >
                    <div class="finalizar-compra-opcao-icon">
                      <i class="bi bi-cash-coin"></i>
                    </div>
                    <div class="finalizar-compra-opcao-info">
                      <h6>PIX</h6>
                      <p>Pagamento instantâneo</p>
                    </div>
                    <div class="finalizar-compra-opcao-radio">
                      <input type="radio" value="pix" v-model="pagamento" />
                    </div>
                  </div>
                  
                  <div 
                    class="finalizar-compra-pagamento-opcao" 
                    :class="{ selected: pagamento === 'cartao' }"
                    @click="pagamento = 'cartao'"
                  >
                    <div class="finalizar-compra-opcao-icon">
                      <i class="bi bi-credit-card-2-front"></i>
                    </div>
                    <div class="finalizar-compra-opcao-info">
                      <h6>Cartão de Crédito</h6>
                      <p>Visa, Mastercard, Elo</p>
                    </div>
                    <div class="finalizar-compra-opcao-radio">
                      <input type="radio" value="cartao" v-model="pagamento" />
                    </div>
                  </div>
                  
                  <div 
                    class="finalizar-compra-pagamento-opcao" 
                    :class="{ selected: pagamento === 'boleto' }"
                    @click="pagamento = 'boleto'"
                  >
                    <div class="finalizar-compra-opcao-icon">
                      <i class="bi bi-upc-scan"></i>
                    </div>
                    <div class="finalizar-compra-opcao-info">
                      <h6>Boleto Bancário</h6>
                      <p>Vencimento em 3 dias</p>
                    </div>
                    <div class="finalizar-compra-opcao-radio">
                      <input type="radio" value="boleto" v-model="pagamento" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão de Finalizar -->
      <div class="finalizar-compra-actions">
        <button 
          class="finalizar-compra-btn-finalizar" 
          :disabled="!enderecoSelecionado || !pagamento || confirmando || produtos.length === 0" 
          @click="confirmarEPagar"
        >
          <span v-if="confirmando" class="finalizar-compra-spinner"></span>
          <i v-else class="bi bi-check-circle finalizar-compra-btn-icon"></i>
          {{ confirmando ? 'Processando...' : 'Confirmar e Pagar' }}
        </button>
        
        <div v-if="feedbackMsg" :class="['finalizar-compra-feedback-message', feedbackType]">
          <i :class="feedbackType === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-circle'"></i>
          {{ feedbackMsg }}
        </div>
      </div>
    </div>

    <!-- Modal de seleção de endereço integrado -->
    <div class="finalizar-compra-address-modal-overlay" v-if="showModalEndereco" @click="fecharModalEndereco">
      <div class="finalizar-compra-address-modal-container" @click.stop>
        <div class="finalizar-compra-address-modal-content">
          <div class="finalizar-compra-address-modal-header">
            <h5 class="finalizar-compra-address-modal-title">
              <i class="bi bi-geo-alt"></i>Escolha o Endereço de Entrega
            </h5>
            <button type="button" class="finalizar-compra-address-modal-close" @click="fecharModalEndereco">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="finalizar-compra-address-modal-body">
            <div v-if="carregandoEnderecos" class="finalizar-compra-address-loading">
              <div class="finalizar-compra-address-spinner"></div>
              <p>Carregando...</p>
            </div>
            <div v-else>
              <div v-if="enderecos.length === 0" class="finalizar-compra-address-alert finalizar-compra-address-alert-info">
                Nenhum endereço cadastrado. Cadastre um novo abaixo.
              </div>
              <div v-else>
                <div class="finalizar-compra-address-list">
                  <div v-for="end in enderecos" :key="end.id" class="finalizar-compra-address-item"
                    :class="{active: enderecoSelecionadoModal === end.id}">
                    <label class="finalizar-compra-address-label">
                      <input type="radio" v-model="enderecoSelecionadoModal" :value="end.id" class="finalizar-compra-address-radio" />
                      <span class="finalizar-compra-address-text">{{ end.street }}, {{ end.number }} - {{ end.city }}/{{ end.state }} ({{ end.zip }})</span>
                    </label>
                    <button 
                      class="finalizar-compra-address-remove-btn" 
                      @click="confirmarRemoverEndereco(end.id)"
                      :disabled="removendoEndereco"
                      title="Remover endereço"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
              <form @submit.prevent="onSalvarEndereco" class="finalizar-compra-address-form">
                <h6 class="finalizar-compra-address-form-title">Cadastrar novo endereço</h6>
                <div class="finalizar-compra-address-form-grid">
                  <div class="finalizar-compra-address-form-group">
                    <input v-model="formEndereco.street" class="finalizar-compra-address-input" placeholder="Rua" required />
                  </div>
                  <div class="finalizar-compra-address-form-group">
                    <input v-model="formEndereco.number" class="finalizar-compra-address-input" placeholder="Número" required type="number" />
                  </div>
                  <div class="finalizar-compra-address-form-group">
                    <input v-model="formEndereco.zip" class="finalizar-compra-address-input" placeholder="CEP" required />
                  </div>
                  <div class="finalizar-compra-address-form-group">
                    <input v-model="formEndereco.city" class="finalizar-compra-address-input" placeholder="Cidade" required />
                  </div>
                  <div class="finalizar-compra-address-form-group">
                    <input v-model="formEndereco.state" class="finalizar-compra-address-input" placeholder="Estado" required />
                  </div>
                  <div class="finalizar-compra-address-form-group">
                    <input v-model="formEndereco.country" class="finalizar-compra-address-input" placeholder="País" required />
                  </div>
                </div>
                <div class="finalizar-compra-address-form-actions">
                  <button class="finalizar-compra-address-btn finalizar-compra-address-btn-outline" type="submit" :disabled="carregandoNovoEndereco">
                    <span v-if="carregandoNovoEndereco" class="finalizar-compra-address-spinner-small"></span>
                    Adicionar Endereço
                  </button>
                </div>
                <div v-if="erroEndereco" class="finalizar-compra-address-alert finalizar-compra-address-alert-danger">{{ erroEndereco }}</div>
              </form>
            </div>
          </div>
          <div class="finalizar-compra-address-modal-footer">
            <button class="finalizar-compra-address-btn finalizar-compra-address-btn-secondary" @click="fecharModalEndereco">Cancelar</button>
            <button class="finalizar-compra-address-btn finalizar-compra-address-btn-primary" :disabled="!enderecoSelecionadoModal" @click="confirmarEndereco">Usar este Endereço</button>
          </div>
        </div>
      </div>
    </div>


  </div>

  <!-- Modal de Confirmação de Remoção de Endereço -->
  <Teleport to="body">
    <div v-if="mostrarConfirmacaoEndereco" class="finalizar-compra-confirm-modal-overlay" @click="mostrarConfirmacaoEndereco = false">
      <div class="finalizar-compra-confirm-modal" @click.stop>
        <div class="finalizar-compra-confirm-content">
          <div class="finalizar-compra-confirm-header">
            <i class="bi bi-exclamation-triangle"></i>
            <h3>Confirmar Remoção</h3>
          </div>
          <div class="finalizar-compra-confirm-body">
            <p>Tem certeza que deseja remover este endereço?</p>
            <p class="finalizar-compra-confirm-warning">Esta ação não pode ser desfeita.</p>
          </div>
          <div class="finalizar-compra-confirm-actions">
            <button class="finalizar-compra-confirm-btn-cancel" @click="mostrarConfirmacaoEndereco = false">
              Cancelar
            </button>
            <button class="finalizar-compra-confirm-btn-confirm" @click="removerEndereco(enderecoParaRemover)" :disabled="removendoEndereco">
              <span v-if="removendoEndereco" class="finalizar-compra-address-spinner-small"></span>
              <span v-else>Confirmar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { useCartStore } from '../../services/stores/cart'
import { useUserStore } from '../../services/stores/auth'
import { storeToRefs } from 'pinia'
import { listarCupons, criarCupom } from '../../services/api/promotions'
import { criarPedido, listarPedidosUsuario } from '../../services/api/orders'
import { buscarCarrinho } from '../../services/api/cart'
import { listarEnderecos, criarEndereco, deletarEndereco } from '../../services/api/addresses'
import { useRouter } from 'vue-router'

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()
const { produtos, total } = storeToRefs(cartStore)
const showToastGlobal = inject('showToastGlobal')

// Modal de confirmação
const mostrarConfirmacaoEndereco = ref(false)
const enderecoParaRemover = ref(null)
const openAuthModal = inject('openAuthModal')



// Estados reativos
const enderecoSelecionado = ref(null)
const showModalEndereco = ref(false)
const confirmando = ref(false)
const feedbackMsg = ref('')
const feedbackType = ref('success')

// Estados do cupom
const codigoCupom = ref('')
const cupomSucesso = ref(null)
const cupomErro = ref('')
const aplicandoCupom = ref(false)

// Estado do pagamento
const pagamento = ref('')

// Estados do modal de endereço
const enderecos = ref([])
const carregandoEnderecos = ref(false)
const carregandoNovoEndereco = ref(false)
const removendoEndereco = ref(false)
const enderecoSelecionadoModal = ref(null)
const erroEndereco = ref('')
const toastMsgEndereco = ref('')
const formEndereco = ref({
  street: '',
  number: '',
  zip: '',
  city: '',
  state: '',
  country: ''
})

// Computed para total com desconto
const totalComDesconto = computed(() => {
  if (!cupomSucesso.value) return total.value
  const desconto = Number(String(cupomSucesso.value.discount_percentage).replace(',', '.')) || 0
  return total.value * (1 - desconto / 100)
})

onMounted(async () => {
  await cartStore.fetchCarrinho()
  await carregarEnderecos()
})

// Watcher para monitorar mudanças na autenticação
watch(() => userStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    // Recarregar endereços quando o usuário fizer login
    carregarEnderecos()
  }
})

// Funções
function handleImageError(event) {
  const placeholderSVG = `
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#1e293b"/>
      <rect x="50" y="50" width="100" height="100" rx="8" fill="#334155"/>
      <circle cx="100" cy="100" r="20" fill="#64748b"/>
      <rect x="80" y="130" width="40" height="20" rx="4" fill="#64748b"/>
    </svg>
  `
  const encodedSVG = encodeURIComponent(placeholderSVG)
  event.target.src = `data:image/svg+xml;charset=utf-8,${encodedSVG}`
}

async function carregarEnderecos() {
  carregandoEnderecos.value = true
  try {
    enderecos.value = await listarEnderecos()
  } catch (error) {
    console.error('Erro ao carregar endereços:', error)
  } finally {
    carregandoEnderecos.value = false
  }
}

async function onSalvarEndereco() {
  carregandoNovoEndereco.value = true
  erroEndereco.value = ''
  
  try {
    const novoEndereco = await criarEndereco(formEndereco.value)
    enderecos.value.push(novoEndereco)
    enderecoSelecionadoModal.value = novoEndereco.id
    
    // Limpar formulário
    formEndereco.value = {
      street: '',
      number: '',
      zip: '',
      city: '',
      state: '',
      country: ''
    }
    
    toastMsgEndereco.value = 'Endereço cadastrado com sucesso!'
    setTimeout(() => {
      toastMsgEndereco.value = ''
    }, 3000)
    
  } catch (error) {
    erroEndereco.value = 'Erro ao cadastrar endereço. Tente novamente.'
  } finally {
    carregandoNovoEndereco.value = false
  }
}

function confirmarRemoverEndereco(id) {
  enderecoParaRemover.value = id
  mostrarConfirmacaoEndereco.value = true
}

async function removerEndereco(id) {
  removendoEndereco.value = true
  
  try {
    await deletarEndereco(id)
    
    // Remover da lista local
    enderecos.value = enderecos.value.filter(e => e.id !== id)
    
    // Se o endereço removido era o selecionado, limpar seleção
    if (enderecoSelecionadoModal.value === id) {
      enderecoSelecionadoModal.value = null
    }
    
    // Se o endereço removido era o endereço selecionado na página, limpar
    if (enderecoSelecionado.value?.id === id) {
      enderecoSelecionado.value = null
    }
    
    showToastGlobal && showToastGlobal('Endereço removido com sucesso!', 'success')
    
  } catch (error) {
    showToastGlobal && showToastGlobal('Erro ao remover endereço. Tente novamente.', 'danger')
  } finally {
    removendoEndereco.value = false
    mostrarConfirmacaoEndereco.value = false
  }
}

function confirmarEndereco() {
  const endereco = enderecos.value.find(e => e.id === enderecoSelecionadoModal.value)
  if (endereco) {
    enderecoSelecionado.value = endereco
    fecharModalEndereco()
  }
}

function fecharModalEndereco() {
  showModalEndereco.value = false
  enderecoSelecionadoModal.value = null
  erroEndereco.value = ''
}

function abrirModalEndereco() {
  if (!userStore.isAuthenticated) {
    openAuthModal()
    return
  }
  
  showModalEndereco.value = true
  if (enderecoSelecionado.value) {
    enderecoSelecionadoModal.value = enderecoSelecionado.value.id
}
}



const enderecoFormatado = computed(() => {
  if (!enderecoSelecionado.value) return ''
  const e = enderecoSelecionado.value
  return `${e.street}, ${e.number} - ${e.city}/${e.state} (${e.zip})`
})

function aplicarCupom() {
  cupomErro.value = ''
  cupomSucesso.value = null
  aplicandoCupom.value = true
  
  listarCupons().then(cupons => {
    const cupom = cupons.find(c => c.code.toLowerCase() === codigoCupom.value.trim().toLowerCase())
    if (!cupom) {
      cupomErro.value = 'Cupom não encontrado.'
      aplicandoCupom.value = false
      return
    }
    if (cupom.expired) {
      cupomErro.value = 'Cupom expirado.'
      aplicandoCupom.value = false
      return
    }
    cupomSucesso.value = cupom
    aplicandoCupom.value = false
  }).catch(() => {
    cupomErro.value = 'Erro ao validar cupom.'
    aplicandoCupom.value = false
  })
}

async function confirmarEPagar() {
  feedbackMsg.value = ''
  
  // Validações
  if (!userStore.isAuthenticated) {
    openAuthModal()
    return
  }
  
  if (!enderecoSelecionado.value) {
    feedbackMsg.value = 'Selecione um endereço.'
    feedbackType.value = 'danger'
    return
  }
  
  if (!pagamento.value) {
    feedbackMsg.value = 'Selecione uma forma de pagamento.'
    feedbackType.value = 'danger'
    return
  }
  
  if (!produtos.value || produtos.value.length === 0) {
    feedbackMsg.value = 'Seu carrinho está vazio. Adicione produtos antes de finalizar.'
    feedbackType.value = 'danger'
    return
  }
  
  // Garantir que o carrinho está sincronizado com a API
  try {
    await cartStore.fetchCarrinho()
    
    if (produtos.value.length > 0) {
      await cartStore.sincronizarComAPI()
    }
  } catch (error) {
    console.warn('Erro ao sincronizar carrinho, continuando com dados locais:', error.message)
  }
  
  confirmando.value = true
  
  try {
    const pedido = await criarPedido(enderecoSelecionado.value.id, cupomSucesso.value?.id)
    
    feedbackMsg.value = 'Pedido realizado com sucesso!'
    feedbackType.value = 'success'
    
    // Limpar carrinho APÓS criar o pedido com sucesso
    await cartStore.limparCarrinho()
    
    // Mostrar toast de sucesso
    if (showToastGlobal) {
      showToastGlobal('Pedido realizado! Após a confirmação do pagamento, seu curso estará disponível em Meus Cursos.', 'success', 6000)
    }
    
    // Redirecionar após 1.2 segundos
    setTimeout(() => {
      router.push('/meus-cursos')
    }, 1200)
    
  } catch (e) {
    console.error('Erro ao criar pedido:', e)
    
    let errorMessage = 'Erro ao finalizar pedido.'
    
    if (e.response?.data?.detail) {
      errorMessage += ` ${e.response.data.detail}`
    } else if (e.message) {
      errorMessage += ` ${e.message}`
    }
    
    feedbackMsg.value = errorMessage
    feedbackType.value = 'danger'
  } finally {
    confirmando.value = false
  }
}
</script>


// Importação das funcionalidades principais do Vue Router
import { createRouter, createWebHashHistory } from 'vue-router'
// Importação da store de usuário para controle de autenticação
import { useUserStore } from '../stores/auth'
// Importação do Pinia para acessar a store ativa no contexto do router
import { getActivePinia } from 'pinia'

// ===== COMPONENTES PRINCIPAIS =====
// Página inicial pública - acessível a todos os usuários
import Home from '../../pages/publicas/Home.vue'

// ===== PÁGINAS PÚBLICAS =====
// Páginas que não requerem autenticação - acessíveis a visitantes
import Cursos from '../../pages/publicas/Cursos.vue'      // Lista de cursos disponíveis
import Sobre from '../../pages/publicas/Sobre.vue'        // Informações sobre a empresa
import Contato from '../../pages/publicas/Contato.vue'    // Formulário de contato

// ===== PÁGINAS ADMIN =====
// Páginas administrativas - requerem autenticação e role específico
import CategoriaAdmin from '../../pages/admin/categorias/Categorias.vue'     // Gerenciamento de categorias
import ProdutoAdmin from '../../pages/admin/produtos/Produtos.vue'           // Gerenciamento de produtos
import CriarModerador from '../../pages/admin/usuarios/CriarModerador.vue'   // Criação de usuários moderadores
import DescontosAdmin from '../../pages/admin/promocoes/Descontos.vue'       // Gerenciamento de descontos
import PedidosAdmin from '../../pages/admin/pedidos/Pedidos.vue'             // Visualização de todos os pedidos
import CuponsAdmin from '../../pages/admin/promocoes/Cupons.vue'             // Gerenciamento de cupons

// ===== PÁGINAS DE USUÁRIO =====
// Páginas que requerem autenticação - acessíveis a usuários logados
import MeusPedidos from '../../pages/autenticadas/MeusPedidos.vue'          // Histórico de pedidos do usuário
import MeusCursos from '../../pages/autenticadas/MeusCursos.vue'            // Cursos adquiridos pelo usuário
import FinalizarCompra from '../../pages/autenticadas/FinalizarCompra.vue'  // Processo de checkout

// ===== CONFIGURAÇÃO DAS ROTAS =====
// Array que define todas as rotas da aplicação com suas configurações
const routes = [
  // ===== ROTAS PÚBLICAS =====
  // Rotas acessíveis a todos os visitantes, sem restrições
  { path: '/', name: 'Home', component: Home },                    // Página inicial
  { path: '/cursos', name: 'Cursos', component: Cursos },          // Lista de cursos
  { path: '/sobre', name: 'Sobre', component: Sobre },             // Sobre a empresa
  { path: '/contato', name: 'Contato', component: Contato },       // Formulário de contato
  
  // ===== ROTAS ADMIN =====
  // Rotas administrativas com controle de acesso baseado em roles
  {
    path: '/admin/categorias',                    // URL da rota
    name: 'CategoriaAdmin',                       // Nome único da rota para navegação programática
    component: CategoriaAdmin,                    // Componente Vue a ser renderizado
    meta: { requiresAuth: true, roles: ['ADMIN'] } // Metadados: requer autenticação e role ADMIN
  },
  {
    path: '/admin/produtos',                      // Gerenciamento de produtos
    name: 'ProdutoAdmin',
    component: ProdutoAdmin,
    meta: { requiresAuth: true, roles: ['ADMIN', 'MODERATOR'] } // ADMIN e MODERATOR podem acessar
  },
  {
    path: '/admin/moderador/criar',               // Criação de novos moderadores
    name: 'CriarModerador',
    component: CriarModerador,
    meta: { requiresAuth: true, roles: ['ADMIN'] } // Apenas ADMIN pode criar moderadores
  },
  {
    path: '/admin/descontos',                     // Gerenciamento de descontos
    name: 'DescontosAdmin',
    component: DescontosAdmin,
    meta: { requiresAuth: true, roles: ['ADMIN'] } // Apenas ADMIN pode gerenciar descontos
  },
  {
    path: '/admin/pedidos',                       // Visualização de todos os pedidos do sistema
    name: 'PedidosAdmin',
    component: PedidosAdmin,
    meta: { requiresAuth: true, roles: ['ADMIN'] } // Apenas ADMIN pode ver todos os pedidos
  },
  {
    path: '/admin/cupons',                        // Gerenciamento de cupons
    name: 'CuponsAdmin',
    component: CuponsAdmin,
    meta: { requiresAuth: true, roles: ['ADMIN'] } // Apenas ADMIN pode gerenciar cupons
  },
  
  // ===== ROTAS DE USUÁRIO =====
  // Rotas que requerem autenticação mas não têm restrição de role
  {
    path: '/meus-cursos',                         // Cursos adquiridos pelo usuário logado
    name: 'MeusCursos',
    component: MeusCursos,
    meta: { requiresAuth: true }                  // Requer apenas autenticação, qualquer role pode acessar
  },
  {
    path: '/meus-pedidos',                        // Histórico de pedidos do usuário logado
    name: 'MeusPedidos',
    component: MeusPedidos,
    meta: { requiresAuth: true }                  // Requer apenas autenticação
  },
  {
    path: '/finalizar-compra',                    // Processo de finalização de compra
    name: 'FinalizarCompra',
    component: FinalizarCompra,
    meta: { requiresAuth: true }                  // Requer apenas autenticação
  },
]

// ===== CRIAÇÃO DA INSTÂNCIA DO ROUTER =====
// Cria uma instância do Vue Router com as configurações definidas
const router = createRouter({
  history: createWebHashHistory(),                // Usa hash mode para compatibilidade e SPA
  routes,                                         // Array de rotas definido acima
})

// ===== GUARDAS DE ROTA =====
// Intercepta todas as navegações antes de serem executadas
// Permite implementar lógica de controle de acesso e validações
router.beforeEach((to, from, next) => {
  // Obtém a store de usuário ativa para verificar autenticação e roles
  const userStore = useUserStore(getActivePinia())
  
  // ===== VERIFICAÇÃO DE ROLES =====
  // Verifica se a rota tem restrição de roles (apenas para rotas admin)
  if (to.meta.roles) {
    // Obtém o role do usuário atual ou define como 'USER' por padrão
    const userRole = userStore.user?.role || 'USER'
    
    // Verifica se o usuário tem um dos roles permitidos para a rota
    if (!to.meta.roles.includes(userRole)) {
      // Se não tiver permissão, redireciona para a página inicial
      return next('/')
    }
  }
  
  // ===== COMPORTAMENTO PADRÃO =====
  // Para rotas que requerem autenticação, permite o acesso mas deixa o componente decidir
  // se deve mostrar o modal de autenticação ou não
  // Esta abordagem é flexível e permite diferentes estratégias de autenticação
  next()
})

// ===== EXPORTAÇÃO =====
// Exporta a instância configurada do router para uso na aplicação principal
export default router 
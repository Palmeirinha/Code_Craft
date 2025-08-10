import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '../stores/auth'
import { getActivePinia } from 'pinia'

// ===== COMPONENTES PRINCIPAIS =====
import Home from '../../pages/publicas/Home.vue'

// ===== PÁGINAS PÚBLICAS =====
import Cursos from '../../pages/publicas/Cursos.vue'
import Sobre from '../../pages/publicas/Sobre.vue'
import Contato from '../../pages/publicas/Contato.vue'

// ===== PÁGINAS ADMIN =====
import CategoriaAdmin from '../../pages/admin/categorias/ListaCategorias.vue'
import ProdutoAdmin from '../../pages/admin/produtos/ListaProdutos.vue'
import CriarModerador from '../../pages/admin/usuarios/CriarModerador.vue'
import DescontosAdmin from '../../pages/admin/promocoes/ListaDescontos.vue'
import PedidosAdmin from '../../pages/admin/pedidos/ListaPedidos.vue'
import CuponsAdmin from '../../pages/admin/promocoes/ListaCupons.vue'

// ===== PÁGINAS DE USUÁRIO =====
import MeusPedidos from '../../pages/autenticadas/MeusPedidos.vue'
import MeusCursos from '../../pages/autenticadas/MeusCursos.vue'
import FinalizarCompra from '../../pages/autenticadas/FinalizarCompra.vue'


const routes = [
  // ===== ROTAS PÚBLICAS =====
  { path: '/', name: 'Home', component: Home },
  { path: '/cursos', name: 'Cursos', component: Cursos },
  { path: '/sobre', name: 'Sobre', component: Sobre },
  { path: '/contato', name: 'Contato', component: Contato },
  
  // ===== ROTAS ADMIN =====
  {
    path: '/admin/categorias',
    name: 'CategoriaAdmin',
    component: CategoriaAdmin,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/produtos',
    name: 'ProdutoAdmin',
    component: ProdutoAdmin,
    meta: { requiresAuth: true, roles: ['ADMIN', 'MODERATOR'] }
  },
  {
    path: '/admin/moderador/criar',
    name: 'CriarModerador',
    component: CriarModerador,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/descontos',
    name: 'DescontosAdmin',
    component: DescontosAdmin,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/pedidos',
    name: 'PedidosAdmin',
    component: PedidosAdmin,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  {
    path: '/admin/cupons',
    name: 'CuponsAdmin',
    component: CuponsAdmin,
    meta: { requiresAuth: true, roles: ['ADMIN'] }
  },
  
  // ===== ROTAS DE USUÁRIO =====
  {
    path: '/meus-cursos',
    name: 'MeusCursos',
    component: MeusCursos,
    meta: { requiresAuth: true }
  },
  {
    path: '/meus-pedidos',
    name: 'MeusPedidos',
    component: MeusPedidos,
    meta: { requiresAuth: true }
  },
  {
    path: '/finalizar-compra',
    name: 'FinalizarCompra',
    component: FinalizarCompra,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// ===== GUARDAS DE ROTA =====
router.beforeEach((to, from, next) => {
  const userStore = useUserStore(getActivePinia())
  
  // Verifica se a rota tem restrição de roles (apenas para rotas admin)
  if (to.meta.roles) {
    const userRole = userStore.user?.role || 'USER'
    if (!to.meta.roles.includes(userRole)) {
      return next('/')
    }
  }
  
  // Para rotas que requerem autenticação, permitir acesso mas deixar o componente decidir
  // se deve mostrar o modal de autenticação ou não
  next()
})

export default router 
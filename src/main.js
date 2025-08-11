// ===== ARQUIVO PRINCIPAL DA APLICAÇÃO =====
// Este é o ponto de entrada principal da aplicação Vue
// Responsável por inicializar e configurar todos os plugins e dependências
// É executado quando a aplicação é carregada no navegador

// ===== IMPORTAÇÃO DE ESTILOS =====
// Importa o arquivo CSS principal que contém todos os estilos da aplicação
// Este arquivo deve ser importado primeiro para garantir que os estilos sejam aplicados
import './assets/styles/main.css'

// ===== IMPORTAÇÕES DO VUE =====
// Importa a função principal do Vue 3 para criar a instância da aplicação
// createApp é a nova API do Vue 3 para inicialização de aplicações
import { createApp } from 'vue'

// ===== IMPORTAÇÃO DO COMPONENTE RAIZ =====
// Importa o componente principal App.vue que será o ponto de partida da interface
// Este componente contém toda a estrutura base da aplicação
import App from './App.vue'

// ===== IMPORTAÇÃO DO ROUTER =====
// Importa a configuração do Vue Router para gerenciar a navegação entre páginas
// O router é configurado em src/services/router/index.js
import router from './services/router'

// ===== IMPORTAÇÃO DO PINIA =====
// Importa a função para criar a instância do Pinia
// Pinia é a biblioteca oficial de gerenciamento de estado para Vue 3
// Substitui o Vuex e oferece uma API mais simples e TypeScript-friendly
import { createPinia } from 'pinia'

// ===== CRIAÇÃO DA INSTÂNCIA DO PINIA =====
// Cria uma nova instância do Pinia para gerenciar o estado global da aplicação
// Esta instância será compartilhada por todas as stores (auth, cart, etc.)
const pinia = createPinia()

// ===== CRIAÇÃO E CONFIGURAÇÃO DA APLICAÇÃO =====
// Cria a instância principal da aplicação Vue usando o componente App
// Configura os plugins na seguinte ordem:
// 1. .use(pinia) - Adiciona o Pinia para gerenciamento de estado
// 2. .use(router) - Adiciona o Vue Router para navegação
// 3. .mount('#app') - Monta a aplicação no elemento DOM com id 'app'
// 
// A ordem dos plugins é importante:
// - Pinia deve ser configurado antes do router para que as stores estejam disponíveis
// - Router deve ser configurado antes da montagem para que as rotas funcionem
// - A montagem deve ser o último passo para renderizar a aplicação
createApp(App).use(pinia).use(router).mount('#app')

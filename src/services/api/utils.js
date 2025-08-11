// Importação das configurações da API para acessar a URL base
import { API_CONFIG } from './configuracoes.js';

// ===== UTILITÁRIOS =====
// Este módulo contém funções utilitárias para operações comuns na aplicação
// Atualmente focado em manipulação de URLs de imagens

/**
 * Função para gerar URLs completas de imagens
 * Converte caminhos relativos de imagens em URLs absolutas
 * 
 * @param {string} path - Caminho da imagem (pode ser relativo, absoluto ou vazio)
 * @returns {string} URL completa da imagem ou string vazia se não houver caminho
 * 
 * @example
 * // Caminho relativo
 * getImageUrl('/media/images/produto.jpg')
 * // Retorna: 'http://35.196.79.227:8000/media/images/produto.jpg'
 * 
 * // URL absoluta (não é modificada)
 * getImageUrl('https://exemplo.com/imagem.jpg')
 * // Retorna: 'https://exemplo.com/imagem.jpg'
 * 
 * // Caminho vazio ou null
 * getImageUrl('')
 * // Retorna: ''
 * 
 * @description
 * Esta função é essencial para exibir imagens na interface, pois:
 * 1. Verifica se o caminho existe
 * 2. Preserva URLs absolutas (que começam com 'http')
 * 3. Constrói URLs completas para caminhos relativos usando a URL base da API
 * 4. Retorna string vazia para casos onde não há imagem
 */
export function getImageUrl(path) {
  // Se não houver caminho, retorna string vazia
  if (!path) return ''
  
  // Se o caminho já for uma URL absoluta (começa com 'http'), retorna como está
  if (path.startsWith('http')) return path
  
  // Para caminhos relativos, constrói a URL completa concatenando com a URL base da API
  return `${API_CONFIG.BASE_URL}${path}`
}

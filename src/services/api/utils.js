import { API_CONFIG } from './config.js';

// ===== UTILITÁRIOS =====
export function getImageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${API_CONFIG.BASE_URL}${path}`
}

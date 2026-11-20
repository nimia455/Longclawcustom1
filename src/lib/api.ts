const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return RAW_API_BASE ? `${RAW_API_BASE}${normalizedPath}` : normalizedPath;
}

export function isStaticHostWithoutBackend(): boolean {
  if (RAW_API_BASE) return false;
  if (typeof window === 'undefined') return false;
  return /\.github\.io$/i.test(window.location.hostname);
}

export function getStaticHostNotice(lang: 'en' | 'tr'): string {
  return lang === 'tr'
    ? 'Bu site GitHub Pages üzerinde statik önizleme olarak çalışıyor. Canlı Longclaw yanıtları için bir sunucu adresi (VITE_API_BASE_URL) bağlayın veya uygulamayı tam sürüm sunucusunda açın.'
    : 'This site is running as a static GitHub Pages preview. To enable live Longclaw replies, connect a backend URL (VITE_API_BASE_URL) or open the full-stack server.';
}


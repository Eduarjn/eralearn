// Configurações de upload para diferentes ambientes
export const uploadConfig = {
  // URLs base para upload
  local: {
    baseUrl: 'http://localhost:3001',
    uploadEndpoint: '/api/videos/upload-local',
    videosEndpoint: '/videos'
  },
  
  // URL completa para upload local
  getLocalUploadUrl: () => {
    return `${uploadConfig.local.baseUrl}${uploadConfig.local.uploadEndpoint}`;
  },
  
  // URL para acessar vídeos locais
  getLocalVideoUrl: (filename: string) => {
    return `${uploadConfig.local.baseUrl}${uploadConfig.local.videosEndpoint}/${filename}`;
  },
  
  // Verificar se está em desenvolvimento
  isDevelopment: () => {
    return import.meta.env.DEV || window.location.hostname === 'localhost';
  },
  
  // Obter URL de upload baseada no ambiente
  getUploadUrl: (target: 'local' | 'supabase') => {
    if (target === 'local' && uploadConfig.isDevelopment()) {
      return uploadConfig.getLocalUploadUrl();
    }
    // Para Supabase ou produção, usar URL relativa
    return '/api/videos/upload';
  }
};
























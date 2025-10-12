import { supabase } from '@/lib/supabaseClient';
import { uploadConfig } from '@/config/upload';

export type VideoUploadTarget = 'supabase' | 'local';

export interface VideoUploadResult {
  publicUrl: string;
  storagePath: string;
}

/**
 * Obtém o target de upload configurado via variável de ambiente
 */
export function getVideoUploadTarget(): VideoUploadTarget {
  // Usar feature flag STORAGE_PROVIDER se disponível
  const storageProvider = import.meta.env.STORAGE_PROVIDER;
  if (storageProvider === 'supabase') return 'supabase';
  if (storageProvider === 'external') return 'local';
  
  // Fallback para backend local (mais confiável)
  return (import.meta.env.VITE_VIDEO_UPLOAD_TARGET as VideoUploadTarget) || 'local';
}

/**
 * Upload para Supabase Storage (lógica extraída do VideoUpload.tsx)
 */
export async function uploadToSupabase(file: File): Promise<VideoUploadResult> {
  // Sanitize do nome do arquivo para evitar erros de "Invalid key" no Supabase
  // 1) Remover acentos/diacríticos
  // 2) Substituir espaços por _
  // 3) Manter apenas [a-zA-Z0-9._-]
  // 4) Normalizar múltiplos _ e remover _ nas bordas
  const originalName = file.name;
  const sanitizedBaseName = originalName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  const filePath = `videos/${Date.now()}_${sanitizedBaseName}`;
  
  const { data, error } = await supabase.storage
    .from("training-videos")
    .upload(filePath, file, { upsert: false });
    
  if (error) {
    throw new Error(`Erro no upload para Supabase: ${error.message}`);
  }
  
  const { data: publicData } = supabase.storage
    .from("training-videos")
    .getPublicUrl(filePath);
    
  return {
    publicUrl: publicData.publicUrl,
    storagePath: filePath
  };
}

/**
 * Upload para servidor local
 */
export async function uploadToLocal(file: File): Promise<VideoUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Usar configuração centralizada
  const uploadUrl = uploadConfig.getLocalUploadUrl();
  
  console.log(`🎯 Upload local - Enviando para: ${uploadUrl}`);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Erro no upload local - Status: ${response.status}, Response: ${errorText}`);
    throw new Error(`Erro no upload local: ${errorText}`);
  }

  const result = await response.json();
  console.log(`✅ Upload local bem-sucedido:`, result);
  
  return {
    publicUrl: result.publicUrl,
    storagePath: result.storagePath
  };
}

/**
 * Função unificada que decide o target e executa o upload apropriado
 */
export async function uploadVideo(file: File, targetOverride?: VideoUploadTarget): Promise<VideoUploadResult> {
  const target = targetOverride || getVideoUploadTarget();
  
  console.log(`🎯 Upload de vídeo - Target: ${target}${targetOverride ? ' (manual)' : ' (configurado)'}`);
  
  switch (target) {
    case 'local':
      return await uploadToLocal(file);
    case 'supabase':
    default:
      return await uploadToSupabase(file);
  }
}

/**
 * Obtém informações do target atual para exibição
 */
export function getVideoUploadTargetInfo() {
  const target = getVideoUploadTarget();
  const maxSize = import.meta.env.VITE_VIDEO_MAX_UPLOAD_MB || '50';
  
  return {
    target,
    maxSize: `${maxSize}MB`,
    isLocal: target === 'local',
    isSupabase: target === 'supabase'
  };
}

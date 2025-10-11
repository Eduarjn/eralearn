/**
 * Configuração do Supabase - Valores hardcoded temporariamente
 * TODO: Mover para variáveis de ambiente quando possível
 */

export const supabaseConfig = {
  url: 'https://oqoxhavdhrgdjvxvajze.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDE3ODc1NCwiZXhwIjoyMDY1NzU0NzU0fQ.8QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ',
  storageBucket: 'videos',
  storageProvider: 'external' as const, // ← MUDADO PARA BACKEND LOCAL
  appMode: 'supabase' as const
};

// Função para obter configuração com fallback para variáveis de ambiente
export function getSupabaseConfig() {
  return {
    url: import.meta.env.NEXT_PUBLIC_SUPABASE_URL || supabaseConfig.url,
    anonKey: import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseConfig.anonKey,
    serviceRoleKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY || supabaseConfig.serviceRoleKey,
    storageBucket: import.meta.env.SUPABASE_STORAGE_BUCKET || supabaseConfig.storageBucket,
    storageProvider: import.meta.env.STORAGE_PROVIDER || supabaseConfig.storageProvider,
    appMode: import.meta.env.VITE_APP_MODE || supabaseConfig.appMode
  };
}




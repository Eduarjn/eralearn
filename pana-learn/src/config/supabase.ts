/**
 * Configuração do Supabase - Valores hardcoded temporariamente
 * TODO: Mover para variáveis de ambiente quando possível
 */

export const supabaseConfig = {
  url: 'https://eralearn.sobreip.com.br/rest-api',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
  serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q',
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




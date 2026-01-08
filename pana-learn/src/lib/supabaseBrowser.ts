import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/config/supabase';

/**
 * Cliente Supabase para o browser (apenas chave anon)
 * Usado no frontend para operações que não requerem privilégios administrativos
 */
export const supabaseBrowser = () => {
  const config = getSupabaseConfig();
  
  if (!config.url || !config.anonKey) {
    throw new Error('Supabase configuration missing for browser client');
  }
  
  return createClient(
    config.url,
    config.anonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );
};

// Export default para compatibilidade
export default supabaseBrowser;

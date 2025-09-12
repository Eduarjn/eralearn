import { createClient } from '@supabase/supabase-js';
import { getSupabaseConfig } from '@/config/supabase';

/**
 * Cliente Supabase Admin (service role) - APENAS para uso no servidor
 * NUNCA expor no cliente - contém privilégios administrativos
 */
const config = getSupabaseConfig();

if (!config.url || !config.serviceRoleKey) {
  throw new Error('Supabase admin configuration missing');
}

export const supabaseAdmin = createClient(
  config.url,
  config.serviceRoleKey, // server only
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// Validação de segurança - garantir que não está sendo usado no cliente
if (typeof window !== 'undefined') {
  throw new Error('supabaseAdmin não deve ser usado no cliente! Use supabaseBrowser()');
}

export default supabaseAdmin;

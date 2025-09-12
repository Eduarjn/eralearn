/**
 * Validação de configuração para Supabase Storage
 */

interface ConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida se todas as configurações necessárias estão presentes
 */
export function validateSupabaseConfig(): ConfigValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Verificar variáveis obrigatórias
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL não está definida');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida');
  }

  // Verificar service role (apenas no servidor)
  if (typeof window === 'undefined' && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    errors.push('SUPABASE_SERVICE_ROLE_KEY não está definida (necessária no servidor)');
  }

  // Verificar configuração de storage
  const storageProvider = process.env.STORAGE_PROVIDER;
  if (!storageProvider) {
    warnings.push('STORAGE_PROVIDER não está definida, usando padrão: supabase');
  } else if (!['supabase', 'external'].includes(storageProvider)) {
    errors.push(`STORAGE_PROVIDER inválida: ${storageProvider}. Use 'supabase' ou 'external'`);
  }

  // Verificar bucket
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!bucket) {
    warnings.push('SUPABASE_STORAGE_BUCKET não está definida, usando padrão: videos');
  }

  // Verificar URLs válidas
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL deve começar com https://');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Log da configuração atual (sem expor chaves sensíveis)
 */
export function logConfigStatus(): void {
  const validation = validateSupabaseConfig();
  
  console.log('🔧 Status da Configuração Supabase:');
  console.log(`   URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Não definida'}`);
  console.log(`   Anon Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida'}`);
  console.log(`   Service Role: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não definida'}`);
  console.log(`   Storage Provider: ${process.env.STORAGE_PROVIDER || 'supabase (padrão)'}`);
  console.log(`   Storage Bucket: ${process.env.SUPABASE_STORAGE_BUCKET || 'videos (padrão)'}`);
  
  if (validation.errors.length > 0) {
    console.error('❌ Erros de configuração:');
    validation.errors.forEach(error => console.error(`   - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Avisos de configuração:');
    validation.warnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  if (validation.isValid) {
    console.log('✅ Configuração válida!');
  }
}

/**
 * Validação específica para a rota de media
 */
export function validateMediaRouteConfig(): boolean {
  const storageProvider = process.env.STORAGE_PROVIDER;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  
  if (storageProvider !== 'supabase') {
    console.warn('⚠️ STORAGE_PROVIDER não é "supabase", rota de media pode não funcionar');
    return false;
  }
  
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY é obrigatória para a rota de media');
    return false;
  }
  
  if (!bucket) {
    console.warn('⚠️ SUPABASE_STORAGE_BUCKET não definida, usando padrão');
  }
  
  return true;
}












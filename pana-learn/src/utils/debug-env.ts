// Utilitário para debug de variáveis de ambiente
export const debugEnvironment = () => {
  const env = {
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada',
    FEATURE_AI: import.meta.env.FEATURE_AI,
    BUILD_TIME: import.meta.env.BUILD_TIME,
    BASE_URL: import.meta.env.BASE_URL,
  };

  console.log('🔍 Debug Environment Variables:', env);
  
  // Verificar se as variáveis essenciais estão configuradas
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variáveis de ambiente faltando:', missingVars);
    return false;
  }

  console.log('✅ Todas as variáveis de ambiente estão configuradas');
  return true;
};

// Função para testar conexão com Supabase
export const testSupabaseConnection = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('🔍 Testando conexão com Supabase...');
    
    // Teste simples de conexão
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      return false;
    }
    
    console.log('✅ Conexão com Supabase funcionando');
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar Supabase:', error);
    return false;
  }
};

// Função para verificar autenticação
export const testAuthentication = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('🔍 Testando autenticação...');
    
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro na autenticação:', error);
      return false;
    }
    
    if (session) {
      console.log('✅ Usuário autenticado:', session.user.email);
    } else {
      console.log('ℹ️ Nenhum usuário autenticado');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar autenticação:', error);
    return false;
  }
};

// Função completa de diagnóstico
export const runDiagnostics = async () => {
  console.log('🚀 Iniciando diagnóstico completo...');
  
  // 1. Verificar variáveis de ambiente
  const envOk = debugEnvironment();
  
  // 2. Testar conexão com Supabase
  const supabaseOk = await testSupabaseConnection();
  
  // 3. Testar autenticação
  const authOk = await testAuthentication();
  
  // Resumo
  console.log('📊 Resumo do Diagnóstico:');
  console.log(`- Variáveis de ambiente: ${envOk ? '✅' : '❌'}`);
  console.log(`- Conexão Supabase: ${supabaseOk ? '✅' : '❌'}`);
  console.log(`- Autenticação: ${authOk ? '✅' : '❌'}`);
  
  const allOk = envOk && supabaseOk && authOk;
  
  if (allOk) {
    console.log('🎉 Diagnóstico completo: TUDO OK!');
  } else {
    console.log('⚠️ Diagnóstico completo: PROBLEMAS ENCONTRADOS');
  }
  
  return allOk;
};

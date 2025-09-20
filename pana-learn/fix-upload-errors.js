// Script para verificar e corrigir problemas de upload
// Execute no console do navegador (F12)

console.log('🔍 Verificando configurações de upload...');

// 1. Verificar configurações atuais
console.log('📋 Configurações atuais:');
console.log('- VITE_VIDEO_UPLOAD_TARGET:', import.meta.env.VITE_VIDEO_UPLOAD_TARGET);
console.log('- STORAGE_PROVIDER:', import.meta.env.STORAGE_PROVIDER);
console.log('- VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);

// 2. Testar conectividade Supabase
async function testSupabaseConnection() {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase: Conectado com sucesso');
      return true;
    } else {
      console.log('❌ Supabase: Erro de conexão', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Supabase: Erro de rede', error.message);
    return false;
  }
}

// 3. Testar se função SQL existe
async function testSQLFunction() {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/obter_proxima_ordem_video`, {
      method: 'POST',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_curso_id: '98f3a689-389c-4ded-9833-846d59fcc183' })
    });
    
    if (response.status === 404) {
      console.log('❌ Função SQL: obter_proxima_ordem_video não encontrada');
      console.log('💡 Execute o script fix-missing-function.sql no Supabase');
      return false;
    } else {
      console.log('✅ Função SQL: obter_proxima_ordem_video existe');
      return true;
    }
  } catch (error) {
    console.log('❌ Função SQL: Erro ao testar', error.message);
    return false;
  }
}

// 4. Executar todos os testes
async function runDiagnostics() {
  console.log('\n🧪 Executando diagnósticos...');
  
  const supabaseOk = await testSupabaseConnection();
  const functionOk = await testSQLFunction();
  
  console.log('\n📊 Resumo dos testes:');
  console.log(`- Conectividade Supabase: ${supabaseOk ? '✅' : '❌'}`);
  console.log(`- Função SQL: ${functionOk ? '✅' : '❌'}`);
  
  if (!supabaseOk || !functionOk) {
    console.log('\n🛠️ Ações necessárias:');
    if (!supabaseOk) {
      console.log('1. Verificar credenciais do Supabase no arquivo .env.local');
    }
    if (!functionOk) {
      console.log('2. Executar o script fix-missing-function.sql no Supabase SQL Editor');
    }
  } else {
    console.log('\n🎉 Tudo configurado corretamente!');
  }
}

// Executar diagnósticos
runDiagnostics();


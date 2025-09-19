#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { validateSupabaseConfig, logConfigStatus } from '../src/lib/validateConfig';

/**
 * Script de teste para validar a implementação do Supabase Storage
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testSupabaseConnection() {
  console.log('🔌 Testando conexão com Supabase...');
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Variáveis de ambiente do Supabase não configuradas');
    return false;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Testar conexão básica
    const { data, error } = await supabase.from('videos').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error.message);
      return false;
    }
    
    console.log('✅ Conexão com Supabase estabelecida');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Supabase:', error);
    return false;
  }
}

async function testStorageBucket() {
  console.log('🪣 Testando bucket de storage...');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Service role key não configurada');
    return false;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verificar se bucket existe
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('❌ Erro ao listar buckets:', error.message);
      return false;
    }
    
    const videosBucket = buckets.find(bucket => bucket.id === 'videos');
    
    if (!videosBucket) {
      console.error('❌ Bucket "videos" não encontrado');
      console.log('📋 Buckets disponíveis:', buckets.map(b => b.id));
      return false;
    }
    
    console.log('✅ Bucket "videos" encontrado');
    console.log(`   - Público: ${videosBucket.public}`);
    console.log(`   - Criado: ${videosBucket.created_at}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar bucket:', error);
    return false;
  }
}

async function testVideosTable() {
  console.log('📊 Testando tabela videos...');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Service role key não configurada');
    return false;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Verificar estrutura da tabela
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, titulo, provider, bucket, path, url_video')
      .limit(5);
    
    if (error) {
      console.error('❌ Erro ao consultar tabela videos:', error.message);
      return false;
    }
    
    console.log(`✅ Tabela videos acessível (${videos?.length || 0} registros encontrados)`);
    
    if (videos && videos.length > 0) {
      const sample = videos[0];
      console.log('📋 Exemplo de registro:');
      console.log(`   - ID: ${sample.id}`);
      console.log(`   - Título: ${sample.titulo}`);
      console.log(`   - Provider: ${sample.provider || 'não definido'}`);
      console.log(`   - Bucket: ${sample.bucket || 'não definido'}`);
      console.log(`   - Path: ${sample.path || 'não definido'}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar tabela videos:', error);
    return false;
  }
}

async function testSignedUrlGeneration() {
  console.log('🔐 Testando geração de URL assinada...');
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Service role key não configurada');
    return false;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Criar um arquivo de teste
    const testContent = 'Test file for signed URL generation';
    const testPath = `test/${Date.now()}_test.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(testPath, testContent, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      console.error('❌ Erro ao fazer upload de teste:', uploadError.message);
      return false;
    }
    
    console.log('✅ Upload de teste realizado');
    
    // Gerar URL assinada
    const { data: signedData, error: signError } = await supabase.storage
      .from('videos')
      .createSignedUrl(testPath, 60);
    
    if (signError || !signedData?.signedUrl) {
      console.error('❌ Erro ao gerar URL assinada:', signError?.message);
      return false;
    }
    
    console.log('✅ URL assinada gerada com sucesso');
    console.log(`   - URL: ${signedData.signedUrl.substring(0, 100)}...`);
    
    // Limpar arquivo de teste
    await supabase.storage.from('videos').remove([testPath]);
    console.log('🧹 Arquivo de teste removido');
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar URL assinada:', error);
    return false;
  }
}

async function testMediaAPI() {
  console.log('🌐 Testando API de media...');
  
  try {
    // Testar endpoint (sem autenticação para ver se retorna 401)
    const response = await fetch('http://localhost:3000/api/media?id=test-id');
    
    if (response.status === 401) {
      console.log('✅ API de media retorna 401 para usuário não autenticado (correto)');
      return true;
    } else if (response.status === 500) {
      console.log('⚠️ API de media retorna 500 (possível problema de configuração)');
      const error = await response.text();
      console.log(`   Erro: ${error}`);
      return false;
    } else {
      console.log(`⚠️ API de media retornou status inesperado: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('⚠️ Não foi possível testar API de media (servidor pode não estar rodando)');
    console.log(`   Erro: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🧪 Iniciando testes de validação da implementação Supabase Storage\n');
  
  // Validar configuração
  logConfigStatus();
  console.log('');
  
  const tests = [
    { name: 'Conexão Supabase', fn: testSupabaseConnection },
    { name: 'Bucket de Storage', fn: testStorageBucket },
    { name: 'Tabela Videos', fn: testVideosTable },
    { name: 'URL Assinada', fn: testSignedUrlGeneration },
    { name: 'API de Media', fn: testMediaAPI }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`\n📋 Teste: ${test.name}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await test.fn();
      if (result) {
        passedTests++;
        console.log(`✅ ${test.name}: PASSOU`);
      } else {
        console.log(`❌ ${test.name}: FALHOU`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: ERRO - ${error}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 Resumo dos Testes: ${passedTests}/${totalTests} passaram`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Todos os testes passaram! Implementação está funcionando.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique a configuração.');
  }
  
  console.log('\n📚 Próximos passos:');
  console.log('1. Configure as variáveis de ambiente se necessário');
  console.log('2. Execute os SQLs de setup no Supabase');
  console.log('3. Teste upload e reprodução de vídeos na aplicação');
  console.log('4. Execute migração de dados se necessário');
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error);
}

export { testSupabaseConnection, testStorageBucket, testVideosTable, testSignedUrlGeneration, testMediaAPI };























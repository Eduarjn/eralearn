#!/usr/bin/env node

/**
 * Script para testar conexão com Supabase (Cloud e Local)
 * 
 * Uso:
 * npm run test:supabase
 * 
 * Ou para testar modo específico:
 * PLATFORM_SUPABASE_MODE=cloud node scripts/test-supabase-connection.js
 * PLATFORM_SUPABASE_MODE=local node scripts/test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const mode = process.env.PLATFORM_SUPABASE_MODE || 'cloud';
const isLocal = mode === 'local';

console.log('🔍 Testando conexão Supabase...');
console.log(`📡 Modo: ${mode.toUpperCase()}`);

// Configuração baseada no modo
const url = isLocal
  ? process.env.LOCAL_SUPABASE_URL || 'http://localhost:8000'
  : process.env.VITE_SUPABASE_URL || 'https://oqoxhavdhrgdjvxvajze.supabase.co';

const anonKey = isLocal
  ? process.env.LOCAL_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
  : process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM';

if (!url) {
  console.error(`❌ Supabase URL não configurada para modo: ${mode}`);
  process.exit(1);
}

if (!anonKey) {
  console.error(`❌ Supabase Anon Key não configurada para modo: ${mode}`);
  process.exit(1);
}

console.log(`📍 URL: ${url}`);
console.log(`🔑 Anon Key: ${anonKey.substring(0, 20)}...`);

// Criar cliente
const supabase = createClient(url, anonKey, {
  auth: { 
    persistSession: false,
    autoRefreshToken: false
  }
});

async function testConnection() {
  try {
    console.log('\n🧪 Testando conexão...');
    
    // Teste 1: Verificar se consegue conectar
    const { data: testData, error: testError } = await supabase
      .from('branding_config')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Erro na conexão:', testError.message);
      return false;
    }
    
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Teste 2: Verificar tabelas principais
    console.log('\n📊 Verificando tabelas principais...');
    
    const tables = [
      'branding_config',
      'usuarios', 
      'cursos',
      'videos',
      'video_progress'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`⚠️  Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: ${err.message}`);
      }
    }
    
    // Teste 3: Verificar storage
    console.log('\n🗂️  Verificando storage...');
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.log(`⚠️  Storage: ${bucketError.message}`);
      } else {
        console.log(`✅ Storage: ${buckets.length} buckets encontrados`);
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.name}`);
        });
      }
    } catch (err) {
      console.log(`❌ Storage: ${err.message}`);
    }
    
    // Teste 4: Verificar auth
    console.log('\n🔐 Verificando auth...');
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.log(`⚠️  Auth: ${authError.message}`);
      } else {
        console.log(`✅ Auth: ${session ? 'Sessão ativa' : 'Sem sessão'}`);
      }
    } catch (err) {
      console.log(`❌ Auth: ${err.message}`);
    }
    
    console.log('\n🎉 Teste concluído!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    return false;
  }
}

// Executar teste
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});

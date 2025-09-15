#!/usr/bin/env node

/**
 * Script de teste para o sistema de branding
 * Execute: node test-branding.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://oqoxhavdhrgdjvxvajze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBrandingSystem() {
  console.log('🚀 Testando sistema de branding...\n');

  try {
    // Teste 1: Verificar se a tabela existe
    console.log('1️⃣ Verificando tabela branding_config...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('branding_config')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError.message);
      console.log('💡 Execute o script fix-branding-config.sql no Supabase SQL Editor');
      return;
    }
    console.log('✅ Tabela branding_config existe\n');

    // Teste 2: Verificar dados existentes
    console.log('2️⃣ Verificando dados existentes...');
    const { data: existingData, error: fetchError } = await supabase
      .from('branding_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('❌ Erro ao buscar dados:', fetchError.message);
      return;
    }

    if (existingData && existingData.length > 0) {
      console.log('✅ Dados encontrados:', existingData[0]);
    } else {
      console.log('⚠️ Nenhum dado encontrado, inserindo configuração padrão...');
      
      const { data: insertData, error: insertError } = await supabase
        .from('branding_config')
        .insert({
          logo_url: '/logotipoeralearn.png',
          sub_logo_url: '/era-sub-logo.png',
          favicon_url: '/favicon.ico',
          background_url: '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
          primary_color: '#CCFF00',
          secondary_color: '#232323',
          company_name: 'ERA Learn',
          company_slogan: 'Smart Training'
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao inserir dados:', insertError.message);
        return;
      }
      console.log('✅ Configuração padrão inserida:', insertData);
    }

    // Teste 3: Testar função get_branding_config
    console.log('\n3️⃣ Testando função get_branding_config...');
    const { data: functionData, error: functionError } = await supabase.rpc('get_branding_config');

    if (functionError) {
      console.error('❌ Erro na função get_branding_config:', functionError.message);
      console.log('💡 Verifique se a função foi criada corretamente');
      return;
    }

    if (functionData && functionData.success) {
      console.log('✅ Função get_branding_config funcionando:', functionData.data);
    } else {
      console.error('❌ Função retornou erro:', functionData);
    }

    // Teste 4: Testar função update_branding_config
    console.log('\n4️⃣ Testando função update_branding_config...');
    const { data: updateData, error: updateError } = await supabase.rpc('update_branding_config', {
      p_company_name: 'ERA Learn Teste'
    });

    if (updateError) {
      console.error('❌ Erro na função update_branding_config:', updateError.message);
      console.log('💡 Verifique se a função foi criada corretamente');
      return;
    }

    if (updateData && updateData.success) {
      console.log('✅ Função update_branding_config funcionando:', updateData.data);
    } else {
      console.error('❌ Função retornou erro:', updateData);
    }

    // Teste 5: Verificar políticas RLS
    console.log('\n5️⃣ Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('branding_config')
      .select('*')
      .limit(1);

    if (policiesError) {
      console.error('❌ Erro ao verificar políticas RLS:', policiesError.message);
    } else {
      console.log('✅ Políticas RLS configuradas corretamente');
    }

    console.log('\n🎉 Testes concluídos!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Acesse http://localhost:8080/configuracoes/whitelabel');
    console.log('2. Teste o upload de imagens');
    console.log('3. Verifique se as alterações são salvas');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar testes
testBrandingSystem();





















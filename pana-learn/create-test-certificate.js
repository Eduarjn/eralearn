// Script para criar um certificado de teste
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://oqoxhavdhrgdjvxvajze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestCertificate() {
  console.log('🧪 Criando certificado de teste...');
  
  try {
    // Primeiro, buscar um usuário existente
    const { data: users, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome')
      .limit(1);
    
    if (userError || !users || users.length === 0) {
      console.log('❌ Erro ao buscar usuários:', userError?.message || 'Nenhum usuário encontrado');
      return;
    }
    
    const user = users[0];
    console.log('👤 Usando usuário:', user);
    
    // Criar certificado de teste
    const { data: certificate, error: certError } = await supabase
      .from('certificados')
      .insert({
        usuario_id: user.id,
        categoria: 'Teste',
        categoria_nome: 'Curso de Teste',
        nota: 85,
        data_conclusao: new Date().toISOString(),
        numero_certificado: `TEST-${Date.now()}`,
        status: 'ativo'
      })
      .select()
      .single();
    
    if (certError) {
      console.log('❌ Erro ao criar certificado:', certError.message);
      console.log('❌ Detalhes:', certError.details);
    } else {
      console.log('✅ Certificado de teste criado com sucesso!');
      console.log('📋 Certificado:', certificate);
    }
    
  } catch (err) {
    console.log('❌ Erro inesperado:', err.message);
  }
}

createTestCertificate();

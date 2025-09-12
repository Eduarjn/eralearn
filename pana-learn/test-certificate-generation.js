// Teste para verificar geração de certificados
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://oqoxhavdhrgdjvxvajze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCertificateGeneration() {
  console.log('🧪 Testando geração de certificados...');
  
  try {
    // Testar se a função existe
    const { data, error } = await supabase
      .rpc('gerar_certificado_dinamico', {
        p_usuario_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
        p_curso_id: '00000000-0000-0000-0000-000000000000',   // UUID de teste
        p_quiz_id: '00000000-0000-0000-0000-000000000000',    // UUID de teste
        p_nota: 85
      });
    
    if (error) {
      console.log('❌ Erro ao testar função:', error.message);
    } else {
      console.log('✅ Função existe e responde:', data);
    }
  } catch (err) {
    console.log('❌ Erro inesperado:', err.message);
  }
  
  // Verificar se a tabela certificados existe
  try {
    const { data, error } = await supabase
      .from('certificados')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro ao acessar tabela certificados:', error.message);
    } else {
      console.log('✅ Tabela certificados acessível');
    }
  } catch (err) {
    console.log('❌ Erro ao acessar tabela:', err.message);
  }
}

testCertificateGeneration();

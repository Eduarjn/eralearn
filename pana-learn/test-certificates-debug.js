// Teste para verificar certificados no banco
const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = 'https://oqoxhavdhrgdjvxvajze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCertificates() {
  console.log('🧪 Testando certificados no banco...');
  
  try {
    // Testar se a tabela existe e tem dados
    const { data, error } = await supabase
      .from('certificados')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Erro ao acessar tabela certificados:', error.message);
      console.log('❌ Código do erro:', error.code);
      console.log('❌ Detalhes:', error.details);
    } else {
      console.log('✅ Tabela certificados acessível');
      console.log('📊 Total de certificados encontrados:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('📋 Estrutura do primeiro certificado:');
        console.log(JSON.stringify(data[0], null, 2));
      } else {
        console.log('⚠️ Nenhum certificado encontrado na tabela');
      }
    }
  } catch (err) {
    console.log('❌ Erro inesperado:', err.message);
  }
  
  // Testar se há usuários
  try {
    const { data: users, error: userError } = await supabase
      .from('usuarios')
      .select('id, nome, email')
      .limit(3);
    
    if (userError) {
      console.log('❌ Erro ao acessar usuários:', userError.message);
    } else {
      console.log('👥 Usuários encontrados:', users?.length || 0);
      if (users && users.length > 0) {
        console.log('👤 Primeiro usuário:', users[0]);
      }
    }
  } catch (err) {
    console.log('❌ Erro ao buscar usuários:', err.message);
  }
  
  // Testar se há cursos
  try {
    const { data: cursos, error: cursoError } = await supabase
      .from('cursos')
      .select('id, nome, categoria')
      .limit(3);
    
    if (cursoError) {
      console.log('❌ Erro ao acessar cursos:', cursoError.message);
    } else {
      console.log('📚 Cursos encontrados:', cursos?.length || 0);
      if (cursos && cursos.length > 0) {
        console.log('📖 Primeiro curso:', cursos[0]);
      }
    }
  } catch (err) {
    console.log('❌ Erro ao buscar cursos:', err.message);
  }
}

testCertificates();

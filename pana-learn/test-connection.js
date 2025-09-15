// Script rápido para testar conexão com Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oqoxhavdhrgdjvxvajze.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xb3hoYXZkaHJnZGp2eHZhanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzg3NTQsImV4cCI6MjA2NTc1NDc1NH0.m5r7W5hzL1x8pA0nqRQXRpFLTqM1sUIJuSCh00uFRgM';

console.log('🔌 Testando conexão com Supabase...');
console.log('URL:', SUPABASE_URL);
console.log('Anon Key Length:', SUPABASE_ANON_KEY.length);

try {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log('✅ Cliente Supabase criado com sucesso');
  
  // Testar conexão básica
  supabase.from('cursos').select('count').limit(1)
    .then(({ data, error }) => {
      if (error) {
        console.error('❌ Erro na consulta:', error.message);
      } else {
        console.log('✅ Conexão com banco de dados funcionando');
        console.log('Dados retornados:', data);
      }
    })
    .catch(err => {
      console.error('❌ Erro na conexão:', err.message);
    });
    
} catch (error) {
  console.error('❌ Erro ao criar cliente:', error.message);
}













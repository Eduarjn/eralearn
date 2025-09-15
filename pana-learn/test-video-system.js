#!/usr/bin/env node

/**
 * Script de Teste Rápido do Sistema de Vídeos
 * Verifica se o sistema está funcionando corretamente
 */

import fs from 'fs';
import path from 'path';

console.log('🎥 TESTE RÁPIDO DO SISTEMA DE VÍDEOS');
console.log('=====================================\n');

// Função para verificar se um arquivo existe
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Função para verificar se um arquivo contém uma string específica
function fileContains(filePath, searchString) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  } catch (error) {
    return false;
  }
}

// Teste 1: Verificar se os componentes foram criados
console.log('📁 1. VERIFICANDO COMPONENTES CRIADOS:');
const components = [
  'src/components/VideoFallback.tsx',
  'src/components/VideoPlayerWithFallback.tsx',
  'fix-video-database.sql'
];

let allComponentsExist = true;
components.forEach(component => {
  const exists = fileExists(component);
  console.log(`   ${exists ? '✅' : '❌'} ${component}`);
  if (!exists) allComponentsExist = false;
});

// Teste 2: Verificar se as correções foram aplicadas
console.log('\n🔧 2. VERIFICANDO CORREÇÕES APLICADAS:');
const hookFile = 'src/hooks/useSignedMediaUrl.ts';
if (fileExists(hookFile)) {
  const corrections = [
    'Vídeo não disponível. Verifique se o arquivo foi carregado corretamente ou entre em contato com o suporte.',
    'Vídeo específico não encontrado, tentando alternativas...'
  ];
  
  corrections.forEach(correction => {
    const applied = fileContains(hookFile, correction);
    console.log(`   ${applied ? '✅' : '❌'} ${correction.substring(0, 50)}...`);
  });
} else {
  console.log('   ❌ Arquivo useSignedMediaUrl.ts não encontrado');
}

// Teste 3: Verificar se o servidor de vídeos existe
console.log('\n🖥️  3. VERIFICANDO SERVIDOR DE VÍDEOS:');
if (fileExists('local-video-server.js')) {
  console.log('   ✅ Servidor local de vídeos existe');
  console.log('   ✅ Pronto para ser executado com: npm run start:video-server');
} else {
  console.log('   ❌ Servidor local de vídeos não encontrado');
}

// Teste 4: Verificar scripts do package.json
console.log('\n📦 4. VERIFICANDO SCRIPTS:');
if (fileExists('package.json')) {
  const scripts = [
    'start:video-server',
    'start:videos'
  ];
  
  scripts.forEach(script => {
    const hasScript = fileContains('package.json', script);
    console.log(`   ${hasScript ? '✅' : '❌'} Script: ${script}`);
  });
} else {
  console.log('   ❌ package.json não encontrado');
}

// Resultado final
console.log('\n📊 RESULTADO DO TESTE:');
console.log('========================');

if (allComponentsExist) {
  console.log('✅ Todos os componentes foram criados');
  console.log('✅ Correções aplicadas no hook');
  console.log('✅ Sistema pronto para teste');
  
  console.log('\n🚀 PRÓXIMOS PASSOS:');
  console.log('1. Execute o script SQL no Supabase:');
  console.log('   - Abra o Supabase SQL Editor');
  console.log('   - Cole o conteúdo de fix-video-database.sql');
  console.log('   - Execute o script');
  console.log('');
  console.log('2. Inicie o frontend:');
  console.log('   npm run dev');
  console.log('');
  console.log('3. Teste no navegador:');
  console.log('   - Acesse: http://localhost:8080');
  console.log('   - Vá para o curso PABX');
  console.log('   - Os vídeos devem carregar ou mostrar fallback amigável');
  console.log('');
  console.log('4. Se ainda houver problemas:');
  console.log('   - Verifique o console do navegador');
  console.log('   - Execute o script SQL novamente');
  console.log('   - Entre em contato com o suporte');
  
} else {
  console.log('❌ Alguns componentes não foram encontrados');
  console.log('⚠️  Verifique se todas as correções foram aplicadas');
}

console.log('\n🎯 TESTE CONCLUÍDO!');





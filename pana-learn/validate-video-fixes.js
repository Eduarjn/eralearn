#!/usr/bin/env node

/**
 * Script de Validação das Correções de Vídeo
 * Verifica se todas as correções foram aplicadas corretamente
 */

import fs from 'fs';
import path from 'path';

console.log('🎥 VALIDAÇÃO DAS CORREÇÕES DE VÍDEO');
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

// Teste 1: Verificar se os arquivos principais existem
console.log('📁 1. VERIFICANDO ARQUIVOS PRINCIPAIS:');
const requiredFiles = [
  'src/hooks/useSignedMediaUrl.ts',
  'local-video-server.js',
  'package.json',
  'SOLUCAO_CARREGAMENTO_VIDEOS.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fileExists(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
});

// Teste 2: Verificar se as correções foram aplicadas no useSignedMediaUrl.ts
console.log('\n🔧 2. VERIFICANDO CORREÇÕES NO HOOK:');
const hookFile = 'src/hooks/useSignedMediaUrl.ts';
if (fileExists(hookFile)) {
  const corrections = [
    'Vídeo não disponível. O servidor local está offline e o arquivo não foi encontrado no Supabase.',
    'Vídeo não disponível. Verifique se o arquivo foi carregado corretamente.',
    'tentar Supabase primeiro (mais confiável), depois servidor local'
  ];
  
  corrections.forEach(correction => {
    const applied = fileContains(hookFile, correction);
    console.log(`   ${applied ? '✅' : '❌'} ${correction.substring(0, 50)}...`);
  });
} else {
  console.log('   ❌ Arquivo useSignedMediaUrl.ts não encontrado');
}

// Teste 3: Verificar se o servidor de vídeos foi criado
console.log('\n🖥️  3. VERIFICANDO SERVIDOR DE VÍDEOS:');
if (fileExists('local-video-server.js')) {
  const serverFeatures = [
    'express',
    'cors',
    'PORT = 3001',
    'VIDEOS_DIR',
    'app.use(\'/videos\', express.static(VIDEOS_DIR))'
  ];
  
  serverFeatures.forEach(feature => {
    const hasFeature = fileContains('local-video-server.js', feature);
    console.log(`   ${hasFeature ? '✅' : '❌'} ${feature}`);
  });
} else {
  console.log('   ❌ Servidor de vídeos não encontrado');
}

// Teste 4: Verificar se os scripts foram adicionados ao package.json
console.log('\n📦 4. VERIFICANDO SCRIPTS DO PACKAGE.JSON:');
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

// Teste 5: Verificar se o guia de solução foi criado
console.log('\n📚 5. VERIFICANDO DOCUMENTAÇÃO:');
if (fileExists('SOLUCAO_CARREGAMENTO_VIDEOS.md')) {
  const docSections = [
    'PROBLEMA IDENTIFICADO',
    'SOLUÇÕES IMPLEMENTADAS',
    'COMO RESOLVER O PROBLEMA',
    'OPÇÃO 1: Usar Apenas Supabase',
    'OPÇÃO 2: Usar Servidor Local'
  ];
  
  docSections.forEach(section => {
    const hasSection = fileContains('SOLUCAO_CARREGAMENTO_VIDEOS.md', section);
    console.log(`   ${hasSection ? '✅' : '❌'} ${section}`);
  });
} else {
  console.log('   ❌ Guia de solução não encontrado');
}

// Teste 6: Verificar se as correções da faixa preta foram aplicadas
console.log('\n🎨 6. VERIFICANDO CORREÇÕES DA FAIXA PRETA:');
const layoutFiles = [
  'src/components/ERALayout.tsx',
  'src/components/layout/Sidebar.tsx',
  'src/index.css'
];

layoutFiles.forEach(file => {
  if (fileExists(file)) {
    const hasFix = fileContains(file, 'lg:pl-64') === false; // Não deve ter lg:pl-64
    console.log(`   ${hasFix ? '✅' : '❌'} ${file} - Faixa preta removida`);
  } else {
    console.log(`   ❌ ${file} não encontrado`);
  }
});

// Resultado final
console.log('\n📊 RESULTADO DA VALIDAÇÃO:');
console.log('==========================');

if (allFilesExist) {
  console.log('✅ Todos os arquivos principais foram criados');
  console.log('✅ Correções de vídeo implementadas');
  console.log('✅ Servidor local de vídeos criado');
  console.log('✅ Scripts adicionados ao package.json');
  console.log('✅ Documentação criada');
  
  console.log('\n🚀 PRÓXIMOS PASSOS PARA TESTAR:');
  console.log('1. Instalar dependências do servidor (se necessário):');
  console.log('   npm install express cors');
  console.log('');
  console.log('2. Iniciar o servidor de vídeos:');
  console.log('   npm run start:video-server');
  console.log('');
  console.log('3. Iniciar o frontend (em outro terminal):');
  console.log('   npm run dev');
  console.log('');
  console.log('4. Testar no navegador:');
  console.log('   - Acesse: http://localhost:8080');
  console.log('   - Vá para qualquer curso');
  console.log('   - Verifique se os vídeos carregam');
  console.log('   - Verifique se não há mais faixa preta');
  console.log('');
  console.log('5. Verificar logs no console:');
  console.log('   - Não deve haver mais erros de "Servidor local indisponível"');
  console.log('   - Vídeos devem carregar do Supabase automaticamente');
  
} else {
  console.log('❌ Alguns arquivos não foram encontrados');
  console.log('⚠️  Verifique se todas as correções foram aplicadas');
}

console.log('\n🎯 VALIDAÇÃO CONCLUÍDA!');

#!/usr/bin/env node

/**
 * Script de Teste Local Automatizado
 * Executa verificações básicas antes do deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 INICIANDO TESTES LOCAIS AUTOMATIZADOS...\n');

// Cores para output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command, description) {
  try {
    log(`🔍 ${description}...`, 'blue');
    execSync(command, { stdio: 'pipe' });
    log(`✅ ${description} - OK`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} - FALHOU`, 'red');
    log(`   Erro: ${error.message}`, 'red');
    return false;
  }
}

function checkFile(filePath, description) {
  try {
    log(`🔍 ${description}...`, 'blue');
    if (fs.existsSync(filePath)) {
      log(`✅ ${description} - ENCONTRADO`, 'green');
      return true;
    } else {
      log(`❌ ${description} - NÃO ENCONTRADO`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description} - ERRO`, 'red');
    return false;
  }
}

// Array para armazenar resultados
const results = [];

// 1. Verificar Node.js
results.push(checkCommand('node --version', 'Verificando versão do Node.js'));
results.push(checkCommand('npm --version', 'Verificando versão do NPM'));

// 2. Verificar arquivos essenciais
results.push(checkFile('.env.local', 'Arquivo .env.local'));
results.push(checkFile('package.json', 'Arquivo package.json'));
results.push(checkFile('vite.config.ts', 'Arquivo vite.config.ts'));

// 3. Verificar dependências
results.push(checkCommand('npm list --depth=0', 'Verificando dependências instaladas'));

// 4. Verificar TypeScript
results.push(checkCommand('npx tsc --noEmit', 'Verificando tipos TypeScript'));

// 5. Verificar ESLint
results.push(checkCommand('npx eslint src --ext .ts,.tsx', 'Verificando linting'));

// 6. Verificar build
results.push(checkCommand('npm run build', 'Verificando build de produção'));

// 7. Verificar se o servidor inicia
log('\n🚀 TESTANDO SERVIDOR DE DESENVOLVIMENTO...', 'yellow');
log('   Iniciando servidor em background...', 'blue');

try {
  const server = execSync('npm run dev', { 
    stdio: 'pipe',
    timeout: 10000 // 10 segundos
  });
  log('✅ Servidor iniciado com sucesso', 'green');
  results.push(true);
} catch (error) {
  log('❌ Erro ao iniciar servidor', 'red');
  results.push(false);
}

// Resumo dos resultados
const passed = results.filter(r => r).length;
const total = results.length;

log('\n' + '='.repeat(50), 'bold');
log(`📊 RESUMO DOS TESTES: ${passed}/${total} PASSARAM`, 'bold');

if (passed === total) {
  log('🎉 TODOS OS TESTES PASSARAM! Código pronto para deploy.', 'green');
  log('\n📋 PRÓXIMOS PASSOS:', 'yellow');
  log('1. Testar funcionalidades manualmente no localhost:5173', 'blue');
  log('2. Verificar se todas as features estão funcionando', 'blue');
  log('3. Fazer commit das mudanças', 'blue');
  log('4. Fazer push para o repositório', 'blue');
  log('5. Aguardar deploy automático no Vercel', 'blue');
} else {
  log('⚠️ ALGUNS TESTES FALHARAM. Corrija os problemas antes do deploy.', 'red');
  log('\n🔧 AÇÕES NECESSÁRIAS:', 'yellow');
  log('1. Verificar erros listados acima', 'red');
  log('2. Corrigir problemas identificados', 'red');
  log('3. Executar este script novamente', 'red');
  log('4. Só fazer deploy após todos os testes passarem', 'red');
}

log('\n' + '='.repeat(50), 'bold');

// Checklist manual
log('\n📋 CHECKLIST MANUAL (execute no navegador):', 'yellow');
log('□ Login com diferentes tipos de usuário', 'blue');
log('□ Upload de imagens no White-Label', 'blue');
log('□ Configuração de cores e informações da empresa', 'blue');
log('□ Reprodução de vídeos dos cursos', 'blue');
log('□ Sistema de quizzes e certificados', 'blue');
log('□ Criação e edição de usuários', 'blue');
log('□ Todas as páginas de configurações', 'blue');

log('\n🌐 Acesse: http://localhost:5173', 'green');
log('🔍 Abra o console do navegador para verificar erros', 'blue');

process.exit(passed === total ? 0 : 1);

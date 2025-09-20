#!/usr/bin/env node

/**
 * Script de configuração do sistema de certificados
 * Cria estrutura de diretórios e configura ambiente
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração
const CERT_DATA_DIR = process.env.CERT_DATA_DIR || './data';

async function createDirectoryStructure() {
  console.log('📁 Criando estrutura de diretórios...');
  
  const directories = [
    path.join(CERT_DATA_DIR, 'manifests'),
    path.join(CERT_DATA_DIR, 'files'),
    path.join(CERT_DATA_DIR, 'locks')
  ];
  
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Diretório criado: ${dir}`);
    } catch (error) {
      console.log(`⚠️ Diretório já existe: ${dir}`);
    }
  }
}

async function verifyTemplates() {
  console.log('\n🎨 Verificando templates SVG...');
  
  const templates = [
    'Configurações Avançadas OMNI.svg',
    'Configurações Avançadas PABX.svg',
    'Fundamentos CALLCENTER.svg',
    'Fundamentos de PABX.svg',
    'OMNICHANNEL para Empresas.svg'
  ];
  
  const templatesDir = path.join(__dirname, 'certificates');
  
  for (const template of templates) {
    const filePath = path.join(templatesDir, template);
    try {
      await fs.access(filePath);
      console.log(`✅ Template encontrado: ${template}`);
      
      // Verificar dimensões
      const content = await fs.readFile(filePath, 'utf8');
      const widthMatch = content.match(/width="([^"]+)"/);
      const heightMatch = content.match(/height="([^"]+)"/);
      const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
      
      if (widthMatch && heightMatch && viewBoxMatch) {
        console.log(`   Dimensões: ${widthMatch[1]} × ${heightMatch[1]}, ViewBox: ${viewBoxMatch[1]}`);
      }
    } catch (error) {
      console.log(`❌ Template não encontrado: ${template}`);
    }
  }
}

async function createIndexFile() {
  console.log('\n📋 Criando arquivo de índice...');
  
  const indexPath = path.join(CERT_DATA_DIR, 'manifests', 'index.jsonl');
  
  try {
    await fs.access(indexPath);
    console.log(`✅ Arquivo de índice já existe: ${indexPath}`);
  } catch {
    try {
      await fs.writeFile(indexPath, '', 'utf8');
      console.log(`✅ Arquivo de índice criado: ${indexPath}`);
    } catch (error) {
      console.log(`❌ Erro ao criar arquivo de índice: ${error.message}`);
    }
  }
}

async function createEnvironmentFile() {
  console.log('\n🔧 Configurando variáveis de ambiente...');
  
  const envContent = `# Configuração do sistema de certificados
CERT_DATA_DIR=${CERT_DATA_DIR}

# Adicione outras variáveis de ambiente conforme necessário
`;

  const envPath = path.join(__dirname, '.env.local');
  
  try {
    await fs.access(envPath);
    console.log(`⚠️ Arquivo .env.local já existe. Adicione manualmente: CERT_DATA_DIR=${CERT_DATA_DIR}`);
  } catch {
    try {
      await fs.writeFile(envPath, envContent, 'utf8');
      console.log(`✅ Arquivo .env.local criado com CERT_DATA_DIR=${CERT_DATA_DIR}`);
    } catch (error) {
      console.log(`❌ Erro ao criar arquivo .env.local: ${error.message}`);
    }
  }
}

async function testPermissions() {
  console.log('\n🔐 Testando permissões de escrita...');
  
  const testFile = path.join(CERT_DATA_DIR, 'test-permissions.tmp');
  
  try {
    await fs.writeFile(testFile, 'test', 'utf8');
    await fs.unlink(testFile);
    console.log(`✅ Permissões de escrita OK em: ${CERT_DATA_DIR}`);
  } catch (error) {
    console.log(`❌ Erro de permissão em: ${CERT_DATA_DIR}`);
    console.log(`   Erro: ${error.message}`);
    console.log(`   Solução: Verifique as permissões do diretório ou execute com sudo`);
  }
}

async function createSampleCertificate() {
  console.log('\n🧪 Criando certificado de exemplo...');
  
  const sampleData = {
    templateKey: 'pabx_fundamentos',
    format: 'svg',
    tokens: {
      NOME_COMPLETO: 'Usuário de Teste',
      CURSO: 'Fundamentos de PABX',
      DATA_CONCLUSAO: new Date().toISOString().split('T')[0],
      CARGA_HORARIA: '8h',
      CERT_ID: 'TEST-' + Date.now(),
      QR_URL: 'https://meudominio.com/verify/TEST-' + Date.now()
    },
    overwrite: false
  };
  
  console.log('Dados de exemplo:');
  console.log(JSON.stringify(sampleData, null, 2));
  
  console.log('\nPara testar a geração, execute:');
  console.log('curl -X POST http://localhost:8080/api/certificates/generate \\');
  console.log('  -H "Content-Type: application/json" \\');
  console.log('  -d \'{"templateKey":"pabx_fundamentos","format":"svg","tokens":{"NOME_COMPLETO":"Usuário de Teste","CURSO":"Fundamentos de PABX","DATA_CONCLUSAO":"2025-01-09","CARGA_HORARIA":"8h","CERT_ID":"TEST-123","QR_URL":"https://meudominio.com/verify/TEST-123"},"overwrite":false}\'');
}

async function showUsageInstructions() {
  console.log('\n📖 Instruções de uso:');
  console.log('');
  console.log('1. Iniciar o servidor:');
  console.log('   npm run dev');
  console.log('');
  console.log('2. Testar o sistema:');
  console.log('   node test-certificate-system.js');
  console.log('');
  console.log('3. Gerar certificado via API:');
  console.log('   POST /api/certificates/generate');
  console.log('');
  console.log('4. Listar templates:');
  console.log('   GET /api/certificates/templates');
  console.log('');
  console.log('5. Verificar certificado:');
  console.log('   GET /verify/{id}');
  console.log('');
  console.log('📚 Documentação completa: CERTIFICATE_SYSTEM_README.md');
}

async function main() {
  console.log('🚀 Configurando sistema de certificados ERA Learn...\n');
  
  try {
    await createDirectoryStructure();
    await verifyTemplates();
    await createIndexFile();
    await createEnvironmentFile();
    await testPermissions();
    await createSampleCertificate();
    await showUsageInstructions();
    
    console.log('\n✅ Sistema de certificados configurado com sucesso!');
    console.log(`📁 Dados serão salvos em: ${CERT_DATA_DIR}`);
    
  } catch (error) {
    console.error('\n❌ Erro durante a configuração:', error);
    process.exit(1);
  }
}

// Executar se o script for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  createDirectoryStructure,
  verifyTemplates,
  createIndexFile,
  createEnvironmentFile,
  testPermissions,
  createSampleCertificate,
  showUsageInstructions
};

#!/usr/bin/env node

/**
 * Script de teste para o sistema de certificados
 * Testa todas as funcionalidades implementadas
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// Configuração
const CERT_DATA_DIR = process.env.CERT_DATA_DIR || './data';
const BASE_URL = 'http://localhost:8080';

// Templates disponíveis
const TEMPLATES = {
  'omni_avancado': 'Configurações Avançadas OMNI.svg',
  'pabx_avancado': 'Configurações Avançadas PABX.svg',
  'callcenter_fundamentos': 'Fundamentos CALLCENTER.svg',
  'pabx_fundamentos': 'Fundamentos de PABX.svg',
  'omnichannel_empresas': 'OMNICHANNEL para Empresas.svg'
};

// Dados de teste
const TEST_CERTIFICATE = {
  templateKey: 'pabx_fundamentos',
  format: 'svg',
  tokens: {
    NOME_COMPLETO: 'Eduarjose Fajardo',
    CURSO: 'Fundamentos de PABX',
    DATA_CONCLUSAO: '2025-01-09',
    CARGA_HORARIA: '8h',
    CERT_ID: 'FUP-2025-000123',
    QR_URL: 'https://meudominio.com/verify/FUP-2025-000123'
  },
  overwrite: false
};

async function makeRequest(url, options = {}) {
  const fetch = (await import('node-fetch')).default;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = data;
    }
    
    return {
      status: response.status,
      data: jsonData,
      headers: response.headers
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      headers: {}
    };
  }
}

async function testTemplateExists() {
  console.log('🧪 Testando existência dos templates...');
  
  for (const [key, fileName] of Object.entries(TEMPLATES)) {
    const filePath = path.join(process.cwd(), 'certificates', fileName);
    try {
      await fs.access(filePath);
      console.log(`✅ Template ${key}: ${fileName} - OK`);
    } catch {
      console.log(`❌ Template ${key}: ${fileName} - NÃO ENCONTRADO`);
    }
  }
}

async function testTemplateTokens() {
  console.log('\n🧪 Testando extração de tokens dos templates...');
  
  for (const [key, fileName] of Object.entries(TEMPLATES)) {
    const filePath = path.join(process.cwd(), 'certificates', fileName);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const tokenRegex = /\{\{([^}]+)\}\}/g;
      const tokens = [];
      let match;
      
      while ((match = tokenRegex.exec(content)) !== null) {
        const token = match[1].trim();
        if (!tokens.includes(token)) {
          tokens.push(token);
        }
      }
      
      console.log(`✅ Template ${key}: ${tokens.length} tokens encontrados`);
      console.log(`   Tokens: ${tokens.join(', ')}`);
    } catch (error) {
      console.log(`❌ Template ${key}: Erro ao ler arquivo - ${error.message}`);
    }
  }
}

async function testSvgDimensions() {
  console.log('\n🧪 Testando dimensões dos SVGs...');
  
  for (const [key, fileName] of Object.entries(TEMPLATES)) {
    const filePath = path.join(process.cwd(), 'certificates', fileName);
    try {
      const content = await fs.readFile(filePath, 'utf8');
      
      const widthMatch = content.match(/width="([^"]+)"/);
      const heightMatch = content.match(/height="([^"]+)"/);
      const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
      
      const width = widthMatch ? widthMatch[1] : 'N/A';
      const height = heightMatch ? heightMatch[1] : 'N/A';
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : 'N/A';
      
      console.log(`✅ Template ${key}:`);
      console.log(`   Width: ${width}, Height: ${height}, ViewBox: ${viewBox}`);
      
      // Verificar se não foi modificado
      if (width === '800' && height === '600' && viewBox === '0 0 800 600') {
        console.log(`   ✅ Dimensões originais preservadas`);
      } else {
        console.log(`   ⚠️ Dimensões podem ter sido modificadas`);
      }
    } catch (error) {
      console.log(`❌ Template ${key}: Erro ao verificar dimensões - ${error.message}`);
    }
  }
}

async function testTokenReplacement() {
  console.log('\n🧪 Testando substituição de tokens...');
  
  const templatePath = path.join(process.cwd(), 'certificates', TEMPLATES.pabx_fundamentos);
  try {
    const originalContent = await fs.readFile(templatePath, 'utf8');
    
    // Substituir tokens
    let modifiedContent = originalContent;
    for (const [key, value] of Object.entries(TEST_CERTIFICATE.tokens)) {
      const tokenPattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      modifiedContent = modifiedContent.replace(tokenPattern, value);
    }
    
    // Verificar se todos os tokens foram substituídos
    const remainingTokens = modifiedContent.match(/\{\{[^}]+\}\}/g);
    if (remainingTokens) {
      console.log(`❌ Tokens não substituídos: ${remainingTokens.join(', ')}`);
    } else {
      console.log(`✅ Todos os tokens foram substituídos com sucesso`);
    }
    
    // Verificar se o conteúdo foi modificado
    if (modifiedContent !== originalContent) {
      console.log(`✅ Conteúdo foi modificado corretamente`);
    } else {
      console.log(`❌ Conteúdo não foi modificado`);
    }
    
  } catch (error) {
    console.log(`❌ Erro ao testar substituição de tokens: ${error.message}`);
  }
}

async function testApiEndpoints() {
  console.log('\n🧪 Testando endpoints da API...');
  
  // Testar listagem de templates
  console.log('Testando GET /api/certificates/templates...');
  const templatesResponse = await makeRequest(`${BASE_URL}/api/certificates/templates`);
  if (templatesResponse.status === 200) {
    console.log(`✅ Templates API: ${templatesResponse.data.total} templates encontrados`);
  } else {
    console.log(`❌ Templates API: Status ${templatesResponse.status}`);
  }
  
  // Testar geração de certificado
  console.log('Testando POST /api/certificates/generate...');
  const generateResponse = await makeRequest(`${BASE_URL}/api/certificates/generate`, {
    method: 'POST',
    body: JSON.stringify(TEST_CERTIFICATE)
  });
  
  if (generateResponse.status === 200) {
    console.log(`✅ Geração de certificado: ID ${generateResponse.data.id}`);
    
    // Testar busca de manifesto
    console.log(`Testando GET /api/certificates/${generateResponse.data.id}/manifest...`);
    const manifestResponse = await makeRequest(`${BASE_URL}/api/certificates/${generateResponse.data.id}/manifest`);
    if (manifestResponse.status === 200) {
      console.log(`✅ Manifesto: Encontrado`);
    } else {
      console.log(`❌ Manifesto: Status ${manifestResponse.status}`);
    }
    
    // Testar download de arquivo
    console.log(`Testando GET /api/certificates/${generateResponse.data.id}/file?format=svg...`);
    const fileResponse = await makeRequest(`${BASE_URL}/api/certificates/${generateResponse.data.id}/file?format=svg`);
    if (fileResponse.status === 200) {
      console.log(`✅ Arquivo SVG: Disponível`);
    } else {
      console.log(`❌ Arquivo SVG: Status ${fileResponse.status}`);
    }
    
  } else {
    console.log(`❌ Geração de certificado: Status ${generateResponse.status}`);
    console.log(`   Erro: ${JSON.stringify(generateResponse.data)}`);
  }
}

async function testFileSystemStructure() {
  console.log('\n🧪 Testando estrutura do sistema de arquivos...');
  
  const requiredDirs = [
    'manifests',
    'files',
    'locks'
  ];
  
  for (const dir of requiredDirs) {
    const dirPath = path.join(CERT_DATA_DIR, dir);
    try {
      await fs.access(dirPath);
      console.log(`✅ Diretório ${dir}: Existe`);
    } catch {
      console.log(`❌ Diretório ${dir}: Não existe`);
    }
  }
}

async function testIdempotency() {
  console.log('\n🧪 Testando idempotência (overwrite=false)...');
  
  // Primeira geração
  const firstResponse = await makeRequest(`${BASE_URL}/api/certificates/generate`, {
    method: 'POST',
    body: JSON.stringify(TEST_CERTIFICATE)
  });
  
  if (firstResponse.status === 200) {
    console.log(`✅ Primeira geração: ID ${firstResponse.data.id}`);
    
    // Segunda geração com mesmo ID (deve falhar)
    const secondResponse = await makeRequest(`${BASE_URL}/api/certificates/generate`, {
      method: 'POST',
      body: JSON.stringify(TEST_CERTIFICATE)
    });
    
    if (secondResponse.status === 409) {
      console.log(`✅ Idempotência: Segunda geração falhou corretamente (409)`);
    } else {
      console.log(`❌ Idempotência: Segunda geração deveria falhar, mas retornou ${secondResponse.status}`);
    }
  } else {
    console.log(`❌ Primeira geração falhou: ${firstResponse.status}`);
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes do sistema de certificados...\n');
  
  try {
    await testTemplateExists();
    await testTemplateTokens();
    await testSvgDimensions();
    await testTokenReplacement();
    await testFileSystemStructure();
    await testApiEndpoints();
    await testIdempotency();
    
    console.log('\n✅ Todos os testes concluídos!');
  } catch (error) {
    console.error('\n❌ Erro durante os testes:', error);
  }
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testTemplateExists,
  testTemplateTokens,
  testSvgDimensions,
  testTokenReplacement,
  testApiEndpoints,
  testFileSystemStructure,
  testIdempotency
};







#!/usr/bin/env node

/**
 * Script de teste para o sistema de upload local
 * Execute: node test-upload-local.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const SERVER_URL = 'http://localhost:3001';
const TEST_VIDEO_PATH = path.join(__dirname, 'test-video.mp4');

async function testHealthCheck() {
  console.log('🔍 Testando health check...');
  
  try {
    const response = await fetch(`${SERVER_URL}/api/health`);
    const data = await response.json();
    
    console.log('✅ Health check OK:', data);
    return true;
  } catch (error) {
    console.error('❌ Health check falhou:', error.message);
    return false;
  }
}

async function createTestVideo() {
  console.log('🎬 Criando vídeo de teste...');
  
  // Criar um arquivo de teste simples (1MB de dados aleatórios)
  const testData = Buffer.alloc(1024 * 1024, 'A'); // 1MB de 'A's
  
  fs.writeFileSync(TEST_VIDEO_PATH, testData);
  console.log('✅ Vídeo de teste criado:', TEST_VIDEO_PATH);
}

async function testUpload() {
  console.log('📤 Testando upload...');
  
  if (!fs.existsSync(TEST_VIDEO_PATH)) {
    console.error('❌ Arquivo de teste não encontrado');
    return false;
  }
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(TEST_VIDEO_PATH), {
      filename: 'test-video.mp4',
      contentType: 'video/mp4'
    });
    
    const response = await fetch(`${SERVER_URL}/api/videos/upload-local`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Upload bem-sucedido:', result);
    
    // Testar acesso ao arquivo
    console.log('🔍 Testando acesso ao arquivo...');
    const fileResponse = await fetch(`${SERVER_URL}${result.publicUrl}`);
    
    if (fileResponse.ok) {
      console.log('✅ Arquivo acessível via URL pública');
    } else {
      console.error('❌ Arquivo não acessível:', fileResponse.status);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Upload falhou:', error.message);
    return false;
  }
}

async function cleanup() {
  console.log('🧹 Limpando arquivos de teste...');
  
  if (fs.existsSync(TEST_VIDEO_PATH)) {
    fs.unlinkSync(TEST_VIDEO_PATH);
    console.log('✅ Arquivo de teste removido');
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes do sistema de upload local...\n');
  
  // Teste 1: Health check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('\n❌ Servidor não está rodando. Execute:');
    console.log('cd server && npm run dev');
    return;
  }
  
  // Teste 2: Criar vídeo de teste
  await createTestVideo();
  
  // Teste 3: Upload
  const uploadOk = await testUpload();
  
  // Limpeza
  await cleanup();
  
  // Resultado final
  console.log('\n📊 Resultado dos testes:');
  console.log(`Health Check: ${healthOk ? '✅' : '❌'}`);
  console.log(`Upload: ${uploadOk ? '✅' : '❌'}`);
  
  if (healthOk && uploadOk) {
    console.log('\n🎉 Todos os testes passaram! Sistema funcionando corretamente.');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique a configuração.');
  }
}

// Executar testes
runTests().catch(console.error);

























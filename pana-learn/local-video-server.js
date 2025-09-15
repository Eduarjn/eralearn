#!/usr/bin/env node

/**
 * Servidor Local Simples para Vídeos
 * Este servidor serve vídeos localmente para desenvolvimento
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Diretório onde os vídeos estão armazenados
const VIDEOS_DIR = path.join(__dirname, 'videos');

// Criar diretório de vídeos se não existir
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  console.log('📁 Diretório de vídeos criado:', VIDEOS_DIR);
}

// Servir vídeos estáticos
app.use('/videos', express.static(VIDEOS_DIR));

// Endpoint para listar vídeos
app.get('/api/videos', (req, res) => {
  try {
    const files = fs.readdirSync(VIDEOS_DIR);
    const videos = files
      .filter(file => /\.(mp4|webm|mov|avi)$/i.test(file))
      .map(file => ({
        name: file,
        path: `/videos/${file}`,
        size: fs.statSync(path.join(VIDEOS_DIR, file)).size
      }));
    
    res.json({ videos });
  } catch (error) {
    console.error('Erro ao listar vídeos:', error);
    res.status(500).json({ error: 'Erro ao listar vídeos' });
  }
});

// Endpoint para upload de vídeos
app.post('/api/videos/upload', (req, res) => {
  res.status(501).json({ error: 'Upload não implementado neste servidor simples' });
});

// Endpoint de saúde
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    videosDir: VIDEOS_DIR,
    videosCount: fs.readdirSync(VIDEOS_DIR).length
  });
});

// Página de informações
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Servidor Local de Vídeos - ERA Learn</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .container { max-width: 800px; margin: 0 auto; }
          .status { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 4px; }
          code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎥 Servidor Local de Vídeos - ERA Learn</h1>
          
          <div class="status">
            <h2>✅ Servidor Online</h2>
            <p>Porta: <code>${PORT}</code></p>
            <p>Diretório de vídeos: <code>${VIDEOS_DIR}</code></p>
            <p>Vídeos encontrados: <code>${fs.readdirSync(VIDEOS_DIR).length}</code></p>
          </div>
          
          <h2>📋 Endpoints Disponíveis:</h2>
          
          <div class="endpoint">
            <strong>GET /health</strong> - Status do servidor
          </div>
          
          <div class="endpoint">
            <strong>GET /api/videos</strong> - Listar vídeos disponíveis
          </div>
          
          <div class="endpoint">
            <strong>GET /videos/{filename}</strong> - Acessar vídeo específico
          </div>
          
          <h2>📁 Como Adicionar Vídeos:</h2>
          <p>Copie seus arquivos de vídeo para o diretório:</p>
          <code>${VIDEOS_DIR}</code>
          
          <h2>🔧 Configuração no ERA Learn:</h2>
          <p>O sistema está configurado para usar este servidor automaticamente.</p>
          <p>URL base: <code>http://localhost:${PORT}</code></p>
        </div>
      </body>
    </html>
  `);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('🎥 Servidor Local de Vídeos iniciado!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📁 Diretório: ${VIDEOS_DIR}`);
  console.log(`📊 Vídeos encontrados: ${fs.readdirSync(VIDEOS_DIR).length}`);
  console.log('');
  console.log('💡 Para adicionar vídeos, copie os arquivos para:');
  console.log(`   ${VIDEOS_DIR}`);
  console.log('');
  console.log('🔄 Para parar o servidor, pressione Ctrl+C');
});

// Tratamento de erros
process.on('SIGINT', () => {
  console.log('\n🛑 Servidor parado pelo usuário');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Erro não tratado:', error);
  process.exit(1);
});









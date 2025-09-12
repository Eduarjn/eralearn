import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Configurações de upload
const VIDEO_DIR = path.join(__dirname, 'videos');
const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

// Criar diretório de vídeos se não existir
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  console.log(`📁 Diretório criado: ${VIDEO_DIR}`);
}

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEO_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${sanitizedName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov', 'video/mkv'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo não permitido: ${file.mimetype}`));
    }
  }
});

// Endpoint de upload
app.post('/api/videos/upload-local', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileName = req.file.filename;
    const filePath = path.join(VIDEO_DIR, fileName);
    const publicUrl = `http://localhost:3001/videos/${fileName}`;

    console.log(`📹 Vídeo enviado: ${fileName}`);
    console.log(`📁 Caminho: ${filePath}`);
    console.log(`🌐 URL pública: ${publicUrl}`);

    res.json({
      publicUrl,
      storagePath: `videos/${fileName}`,
      fileName,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Servir arquivos de vídeo
app.use('/videos', express.static(VIDEO_DIR, {
  setHeaders: (res, filePath) => {
    res.set('Accept-Ranges', 'bytes');
    res.set('Cache-Control', 'public, max-age=3600');
    
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.mp4') res.set('Content-Type', 'video/mp4');
    else if (ext === '.webm') res.set('Content-Type', 'video/webm');
    else if (ext === '.avi') res.set('Content-Type', 'video/avi');
    else if (ext === '.mov') res.set('Content-Type', 'video/quicktime');
    else if (ext === '.mkv') res.set('Content-Type', 'video/x-matroska');
  }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      videoDir: VIDEO_DIR,
      maxFileSize: `${MAX_FILE_SIZE / (1024 * 1024)}MB`
    }
  });
});

// Tratamento de erros
app.use((error, req, res, next) => {
  console.error('❌ Erro:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: `Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB` 
      });
    }
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de upload local rodando na porta ${PORT}`);
  console.log(`📁 Diretório de vídeos: ${VIDEO_DIR}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📏 Tamanho máximo: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
  console.log(`✅ Endpoint: POST http://localhost:${PORT}/api/videos/upload-local`);
});

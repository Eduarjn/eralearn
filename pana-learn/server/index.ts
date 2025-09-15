import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configurações de upload
const VIDEO_LOCAL_DIR = process.env.VIDEO_LOCAL_DIR || '/var/www/videos';
const VIDEO_PUBLIC_BASE = process.env.VIDEO_PUBLIC_BASE || '/media/videos';
const VIDEO_MAX_UPLOAD_MB = parseInt(process.env.VIDEO_MAX_UPLOAD_MB || '1024');

// Garantir que o diretório existe
if (!fs.existsSync(VIDEO_LOCAL_DIR)) {
  fs.mkdirSync(VIDEO_LOCAL_DIR, { recursive: true });
  console.log(`📁 Diretório criado: ${VIDEO_LOCAL_DIR}`);
}

// Configuração do Multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const videosDir = path.join(VIDEO_LOCAL_DIR, 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }
    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${sanitizedName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: VIDEO_MAX_UPLOAD_MB * 1024 * 1024 // Converter MB para bytes
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de vídeo permitidos
    const allowedMimeTypes = [
      'video/mp4',
      'video/webm',
      'video/avi',
      'video/mov',
      'video/mkv'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de arquivo não permitido: ${file.mimetype}`));
    }
  }
});

// Middleware para parsing JSON
app.use(express.json());

// Middleware para servir arquivos estáticos
app.use(VIDEO_PUBLIC_BASE, express.static(VIDEO_LOCAL_DIR, {
  acceptRanges: true,
  setHeaders: (res, path) => {
    // Headers para streaming de vídeo
    res.set('Accept-Ranges', 'bytes');
    res.set('Cache-Control', 'public, max-age=3600');
    
    // Content-Type baseado na extensão
    const ext = path.split('.').pop()?.toLowerCase();
    if (ext === 'mp4') {
      res.set('Content-Type', 'video/mp4');
    } else if (ext === 'webm') {
      res.set('Content-Type', 'video/webm');
    } else if (ext === 'avi') {
      res.set('Content-Type', 'video/avi');
    } else if (ext === 'mov') {
      res.set('Content-Type', 'video/quicktime');
    } else if (ext === 'mkv') {
      res.set('Content-Type', 'video/x-matroska');
    }
  }
}));

// Endpoint para upload de vídeos
app.post('/api/videos/upload-local', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const fileName = req.file.filename;
    const storagePath = `videos/${fileName}`;
    const publicUrl = `${VIDEO_PUBLIC_BASE}/${storagePath}`;

    console.log(`📹 Vídeo enviado: ${fileName}`);
    console.log(`📁 Caminho: ${storagePath}`);
    console.log(`🌐 URL pública: ${publicUrl}`);

    res.json({
      publicUrl,
      storagePath,
      fileName,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

  } catch (error) {
    console.error('❌ Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      videoLocalDir: VIDEO_LOCAL_DIR,
      videoPublicBase: VIDEO_PUBLIC_BASE,
      maxUploadMB: VIDEO_MAX_UPLOAD_MB
    }
  });
});

// Middleware de tratamento de erros
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: `Arquivo muito grande. Tamanho máximo: ${VIDEO_MAX_UPLOAD_MB}MB` 
      });
    }
  }
  
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de upload local rodando na porta ${PORT}`);
  console.log(`📁 Diretório de vídeos: ${VIDEO_LOCAL_DIR}`);
  console.log(`🌐 Base URL pública: ${VIDEO_PUBLIC_BASE}`);
  console.log(`📏 Tamanho máximo: ${VIDEO_MAX_UPLOAD_MB}MB`);
});





















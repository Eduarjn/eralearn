#!/usr/bin/env node

/**
 * Servidor local simples para simular Supabase
 * Funciona como uma API REST simples em memória
 */

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('storage'));

// Banco de dados em memória
let database = {
  usuarios: [
    {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'admin@eralearn.com',
      nome: 'Administrador',
      tipo_usuario: 'admin',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  cursos: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      titulo: 'Curso de Exemplo',
      descricao: 'Curso demonstrativo do ERA Learn',
      imagem_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  videos: [],
  video_progress: [],
  branding_config: [
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      logo_url: '/logotipoeralearn.png',
      sub_logo_url: '/era-sub-logo.png',
      favicon_url: '/favicon.ico',
      background_url: '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
      primary_color: '#CCFF00',
      secondary_color: '#232323',
      company_name: 'ERA Learn',
      company_slogan: 'Smart Training',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
};

// Helper para gerar UUID simples
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Routes para tabelas
Object.keys(database).forEach(table => {
  // GET - Listar todos
  app.get(`/${table}`, (req, res) => {
    let data = database[table];
    
    // Filtros básicos
    if (req.query.select) {
      // Simular select específico
      const fields = req.query.select.split(',');
      data = data.map(item => {
        const filtered = {};
        fields.forEach(field => {
          filtered[field.trim()] = item[field.trim()];
        });
        return filtered;
      });
    }
    
    res.json(data);
  });
  
  // POST - Criar novo
  app.post(`/${table}`, (req, res) => {
    const newItem = {
      id: generateUUID(),
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    database[table].push(newItem);
    res.status(201).json(newItem);
  });
  
  // PATCH - Atualizar
  app.patch(`/${table}`, (req, res) => {
    const { eq } = req.query;
    if (!eq) {
      return res.status(400).json({ error: 'Missing eq filter' });
    }
    
    const [field, value] = eq.split('.');
    const itemIndex = database[table].findIndex(item => item[field] === value);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    database[table][itemIndex] = {
      ...database[table][itemIndex],
      ...req.body,
      updated_at: new Date().toISOString()
    };
    
    res.json(database[table][itemIndex]);
  });
  
  // DELETE - Deletar
  app.delete(`/${table}`, (req, res) => {
    const { eq } = req.query;
    if (!eq) {
      return res.status(400).json({ error: 'Missing eq filter' });
    }
    
    const [field, value] = eq.split('.');
    const itemIndex = database[table].findIndex(item => item[field] === value);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    database[table].splice(itemIndex, 1);
    res.status(204).send();
  });
});

// RPC Functions
app.post('/rpc/get_branding_config', (req, res) => {
  const config = database.branding_config[0];
  if (config) {
    res.json({ success: true, data: config });
  } else {
    res.json({ success: false, message: 'Nenhuma configuração encontrada' });
  }
});

app.post('/rpc/update_branding_config', (req, res) => {
  const updates = req.body;
  if (database.branding_config.length > 0) {
    database.branding_config[0] = {
      ...database.branding_config[0],
      ...updates,
      updated_at: new Date().toISOString()
    };
    res.json({ success: true, message: 'Configuração atualizada com sucesso' });
  } else {
    res.status(404).json({ success: false, message: 'Configuração não encontrada' });
  }
});

// Storage simulation
app.get('/storage/v1/bucket', (req, res) => {
  res.json([
    { name: 'training-videos', public: true },
    { name: 'certificates', public: true },
    { name: 'branding', public: true }
  ]);
});

// Upload de arquivo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'storage/training-videos/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

app.post('/storage/v1/object/training-videos', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const publicUrl = `http://localhost:3001/training-videos/${req.file.filename}`;
  res.json({
    Key: req.file.filename,
    publicURL: publicUrl
  });
});

// Auth simulation (básico)
app.get('/auth/v1/user', (req, res) => {
  res.json({ user: null, session: null });
});

app.post('/auth/v1/signup', (req, res) => {
  const { email, password } = req.body;
  const newUser = {
    id: generateUUID(),
    email,
    email_confirmed_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  database.usuarios.push({
    id: newUser.id,
    email,
    nome: email.split('@')[0],
    tipo_usuario: 'aluno',
    created_at: newUser.created_at,
    updated_at: newUser.updated_at
  });
  
  res.json({ user: newUser, session: { access_token: 'fake-token' } });
});

app.post('/auth/v1/token', (req, res) => {
  const { email, password } = req.body;
  const user = database.usuarios.find(u => u.email === email);
  
  if (user) {
    res.json({ 
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: new Date().toISOString()
      }, 
      session: { access_token: 'fake-token' } 
    });
  } else {
    res.status(400).json({ error: 'Invalid credentials' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor local rodando em http://localhost:${PORT}`);
  console.log(`📊 Simulando Supabase local`);
  console.log(`🗂️  Storage: http://localhost:3001`);
  console.log('');
  console.log('Tabelas disponíveis:');
  Object.keys(database).forEach(table => {
    console.log(`  - ${table}: ${database[table].length} registros`);
  });
});

// Storage server (porta 3001)
const storageApp = express();
storageApp.use(cors());
storageApp.use(express.static('storage'));

storageApp.listen(3001, () => {
  console.log(`📁 Storage server rodando em http://localhost:3001`);
});





















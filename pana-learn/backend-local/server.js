// ========================================
// ERA LEARN - BACKEND LOCAL STANDALONE
// ========================================
// Servidor completo para substituir Supabase

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar rotas
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import coursesRoutes from './routes/courses.js';
import videosRoutes from './routes/videos.js';
import quizzesRoutes from './routes/quizzes.js';
import certificatesRoutes from './routes/certificates.js';
import uploadRoutes from './routes/upload.js';
import brandingRoutes from './routes/branding.js';

// Importar middlewares
import { authenticateToken } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Configurações
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARES GLOBAIS
// ========================================

// Segurança
app.use(helmet());

// Compressão
app.use(compression());

// Logs
app.use(morgan('combined'));

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // máximo 1000 requests por IP
    message: {
        error: 'Muitas requisições. Tente novamente em 15 minutos.'
    }
});
app.use(limiter);

// Rate limiting para autenticação
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // máximo 10 tentativas de login por IP
    message: {
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    }
});

// Parsing
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Arquivos estáticos
app.use('/uploads', express.static('uploads'));

// ========================================
// HEALTH CHECK
// ========================================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// ========================================
// ROTAS DA API
// ========================================

// Rotas públicas (sem autenticação)
app.use('/api/auth', authLimiter, authRoutes);

// Rotas protegidas (com autenticação)
app.use('/api/users', authenticateToken, usersRoutes);
app.use('/api/courses', authenticateToken, coursesRoutes);
app.use('/api/videos', authenticateToken, videosRoutes);
app.use('/api/quizzes', authenticateToken, quizzesRoutes);
app.use('/api/certificates', authenticateToken, certificatesRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/branding', authenticateToken, brandingRoutes);

// ========================================
// ROTAS ESPECIAIS (COMPATIBILIDADE SUPABASE)
// ========================================

// Rota para simular endpoints do Supabase
app.get('/rest/v1/:table', authenticateToken, async (req, res) => {
    try {
        const { table } = req.params;
        const { select, eq, limit, order } = req.query;
        
        // Implementar lógica de consulta genérica
        const result = await handleSupabaseQuery(table, { select, eq, limit, order });
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/rest/v1/:table', authenticateToken, async (req, res) => {
    try {
        const { table } = req.params;
        const data = req.body;
        
        // Implementar lógica de inserção genérica
        const result = await handleSupabaseInsert(table, data);
        
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ========================================
// MIDDLEWARE DE ERRO
// ========================================
app.use(errorHandler);

// ========================================
// ROTA 404
// ========================================
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint não encontrado',
        path: req.originalUrl,
        method: req.method
    });
});

// ========================================
// INICIALIZAÇÃO DO SERVIDOR
// ========================================
app.listen(PORT, () => {
    console.log('🚀 ==========================================');
    console.log('🚀 ERA LEARN BACKEND LOCAL');
    console.log('🚀 ==========================================');
    console.log(`🌐 Servidor rodando na porta: ${PORT}`);
    console.log(`🌍 URL: http://localhost:${PORT}`);
    console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
    console.log('🚀 ==========================================');
    
    // Testar conexão com banco
    testDatabaseConnection();
});

// ========================================
// FUNÇÕES AUXILIARES
// ========================================
async function handleSupabaseQuery(table, params) {
    // Implementar lógica de consulta SQL baseada nos parâmetros
    // Esta função simula o comportamento do Supabase REST API
    return { data: [], error: null };
}

async function handleSupabaseInsert(table, data) {
    // Implementar lógica de inserção SQL
    // Esta função simula o comportamento do Supabase REST API
    return { data: data, error: null };
}

async function testDatabaseConnection() {
    try {
        // Testar conexão com PostgreSQL
        const { testConnection } = await import('./config/database.js');
        await testConnection();
        console.log('✅ Conexão com banco de dados estabelecida');
    } catch (error) {
        console.error('❌ Erro ao conectar com banco de dados:', error.message);
    }
}



















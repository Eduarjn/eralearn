// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ========================================
// Substituição para Supabase Auth

import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'era_learn_super_secret_jwt_key_2024!';
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '24h';

// ========================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ========================================
export async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Token de acesso requerido',
                message: 'Faça login para acessar este recurso'
            });
        }

        // Verificar token JWT
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Buscar usuário no banco
        const result = await query(
            'SELECT id, email, nome, tipo_usuario, domain_id, ativo FROM usuarios WHERE id = $1',
            [decoded.userId]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Usuário não encontrado',
                message: 'Token inválido ou usuário removido'
            });
        }

        const user = result.rows[0];

        if (!user.ativo) {
            return res.status(401).json({
                error: 'Usuário inativo',
                message: 'Conta desativada. Contate o administrador'
            });
        }

        // Adicionar informações do usuário na requisição
        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
                message: 'Faça login novamente'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                message: 'Sua sessão expirou. Faça login novamente'
            });
        }

        console.error('Erro na autenticação:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao verificar autenticação'
        });
    }
}

// ========================================
// MIDDLEWARE DE AUTORIZAÇÃO POR ROLE
// ========================================
export function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Usuário não autenticado'
            });
        }

        const userRole = req.user.tipo_usuario;
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Acesso negado',
                message: `Requer uma das seguintes permissões: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
}

// ========================================
// MIDDLEWARE DE AUTORIZAÇÃO POR DOMÍNIO
// ========================================
export function requireDomain(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            error: 'Usuário não autenticado'
        });
    }

    // Admin master pode acessar qualquer domínio
    if (req.user.tipo_usuario === 'admin_master') {
        return next();
    }

    // Verificar se o usuário tem acesso ao domínio
    const requestedDomain = req.params.domainId || req.body.domain_id || req.query.domain_id;
    
    if (requestedDomain && requestedDomain !== req.user.domain_id) {
        return res.status(403).json({
            error: 'Acesso negado',
            message: 'Você não tem permissão para acessar este domínio'
        });
    }

    next();
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================
export function generateToken(userId, userInfo = {}) {
    const payload = {
        userId,
        ...userInfo,
        iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw error;
    }
}

export async function createSession(userId, ipAddress, userAgent) {
    try {
        const token = generateToken(userId);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

        await query(`
            INSERT INTO sessoes (usuario_id, token, expires_at, ip_address, user_agent)
            VALUES ($1, $2, $3, $4, $5)
        `, [userId, token, expiresAt, ipAddress, userAgent]);

        return token;
    } catch (error) {
        console.error('Erro ao criar sessão:', error);
        throw error;
    }
}

export async function invalidateSession(token) {
    try {
        await query('DELETE FROM sessoes WHERE token = $1', [token]);
        return true;
    } catch (error) {
        console.error('Erro ao invalidar sessão:', error);
        return false;
    }
}

export async function cleanExpiredSessions() {
    try {
        const result = await query('DELETE FROM sessoes WHERE expires_at < NOW()');
        console.log(`🧹 Limpeza de sessões: ${result.rowCount} sessões expiradas removidas`);
        return result.rowCount;
    } catch (error) {
        console.error('Erro na limpeza de sessões:', error);
        return 0;
    }
}

// Limpeza automática de sessões a cada hora
setInterval(cleanExpiredSessions, 60 * 60 * 1000);
























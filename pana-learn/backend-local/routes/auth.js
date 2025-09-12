// ========================================
// ROTAS DE AUTENTICAÇÃO
// ========================================
// Substituição para Supabase Auth

import express from 'express';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { generateToken, createSession, invalidateSession } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// LOGIN
// ========================================
router.post('/login', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 })
], async (req, res) => {
    try {
        // Validação de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { email, password } = req.body;
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent');

        // Buscar usuário
        const result = await query(
            'SELECT id, email, nome, tipo_usuario, senha_hash, domain_id, ativo FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        const user = result.rows[0];

        if (!user.ativo) {
            return res.status(401).json({
                error: 'Conta inativa',
                message: 'Sua conta foi desativada. Contate o administrador'
            });
        }

        // Verificar senha
        const validPassword = await bcrypt.compare(password, user.senha_hash);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Credenciais inválidas',
                message: 'Email ou senha incorretos'
            });
        }

        // Gerar token
        const token = await createSession(user.id, ipAddress, userAgent);

        // Atualizar último login
        await query(
            'UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1',
            [user.id]
        );

        // Remover senha do objeto de retorno
        delete user.senha_hash;

        res.json({
            message: 'Login realizado com sucesso',
            user,
            session: {
                access_token: token,
                token_type: 'bearer',
                expires_in: 86400 // 24 horas em segundos
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao realizar login'
        });
    }
});

// ========================================
// REGISTRO
// ========================================
router.post('/register', [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('nome').isLength({ min: 2 }),
    body('tipo_usuario').isIn(['admin', 'cliente'])
], async (req, res) => {
    try {
        // Validação de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { email, password, nome, tipo_usuario, domain_id } = req.body;

        // Verificar se email já existe
        const existingUser = await query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(409).json({
                error: 'Email já cadastrado',
                message: 'Este email já está em uso'
            });
        }

        // Criptografar senha
        const saltRounds = 12;
        const senha_hash = await bcrypt.hash(password, saltRounds);

        // Inserir usuário
        const result = await query(`
            INSERT INTO usuarios (email, nome, tipo_usuario, senha_hash, domain_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, nome, tipo_usuario, domain_id, ativo, created_at
        `, [email, nome, tipo_usuario, senha_hash, domain_id]);

        const newUser = result.rows[0];

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            user: newUser
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao criar usuário'
        });
    }
});

// ========================================
// LOGOUT
// ========================================
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            await invalidateSession(token);
        }

        res.json({
            message: 'Logout realizado com sucesso'
        });

    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao realizar logout'
        });
    }
});

// ========================================
// VERIFICAR SESSÃO
// ========================================
router.get('/session', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                session: null,
                error: 'Token não fornecido'
            });
        }

        // Verificar se sessão existe no banco
        const result = await query(`
            SELECT s.*, u.id, u.email, u.nome, u.tipo_usuario, u.domain_id, u.ativo
            FROM sessoes s
            JOIN usuarios u ON u.id = s.usuario_id
            WHERE s.token = $1 AND s.expires_at > NOW()
        `, [token]);

        if (result.rows.length === 0) {
            return res.status(401).json({
                session: null,
                error: 'Sessão inválida ou expirada'
            });
        }

        const sessionData = result.rows[0];
        const user = {
            id: sessionData.id,
            email: sessionData.email,
            nome: sessionData.nome,
            tipo_usuario: sessionData.tipo_usuario,
            domain_id: sessionData.domain_id,
            ativo: sessionData.ativo
        };

        res.json({
            session: {
                access_token: token,
                user
            },
            error: null
        });

    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        res.status(500).json({
            session: null,
            error: 'Erro interno do servidor'
        });
    }
});

// ========================================
// ALTERAR SENHA
// ========================================
router.post('/change-password', [
    body('current_password').isLength({ min: 6 }),
    body('new_password').isLength({ min: 6 })
], async (req, res) => {
    try {
        // Validação de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }

        const { current_password, new_password } = req.body;
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Token requerido'
            });
        }

        // Buscar usuário pela sessão
        const sessionResult = await query(`
            SELECT u.id, u.senha_hash
            FROM sessoes s
            JOIN usuarios u ON u.id = s.usuario_id
            WHERE s.token = $1 AND s.expires_at > NOW()
        `, [token]);

        if (sessionResult.rows.length === 0) {
            return res.status(401).json({
                error: 'Sessão inválida'
            });
        }

        const user = sessionResult.rows[0];

        // Verificar senha atual
        const validPassword = await bcrypt.compare(current_password, user.senha_hash);
        if (!validPassword) {
            return res.status(400).json({
                error: 'Senha atual incorreta'
            });
        }

        // Criptografar nova senha
        const saltRounds = 12;
        const new_senha_hash = await bcrypt.hash(new_password, saltRounds);

        // Atualizar senha
        await query(
            'UPDATE usuarios SET senha_hash = $1, updated_at = NOW() WHERE id = $2',
            [new_senha_hash, user.id]
        );

        res.json({
            message: 'Senha alterada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Erro ao alterar senha'
        });
    }
});

// ========================================
// RESETAR SENHA (simplificado)
// ========================================
router.post('/reset-password', [
    body('email').isEmail().normalizeEmail()
], async (req, res) => {
    try {
        const { email } = req.body;

        // Verificar se usuário existe
        const result = await query(
            'SELECT id, nome FROM usuarios WHERE email = $1',
            [email]
        );

        // Sempre retornar sucesso por segurança (não revelar se email existe)
        res.json({
            message: 'Se o email existir, instruções foram enviadas'
        });

        // Em implementação real, enviar email aqui
        if (result.rows.length > 0) {
            console.log(`📧 Reset de senha solicitado para: ${email}`);
            // TODO: Implementar envio de email
        }

    } catch (error) {
        console.error('Erro no reset de senha:', error);
        res.status(500).json({
            error: 'Erro interno do servidor'
        });
    }
});

export default router;



















// ========================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ========================================
// Conexão PostgreSQL para substituir Supabase

import pg from 'pg';
const { Pool } = pg;

// Configuração da conexão
const pool = new Pool({
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'eralearn',
    user: process.env.DB_USER || 'eralearn',
    password: process.env.DB_PASSWORD || 'eralearn2024!',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// ========================================
// FUNÇÕES DE CONEXÃO
// ========================================

export async function query(text, params) {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('🔍 Query executada:', { text, duration, rows: result.rowCount });
        return result;
    } catch (error) {
        console.error('❌ Erro na query:', error.message);
        throw error;
    }
}

export async function getClient() {
    return await pool.connect();
}

export async function testConnection() {
    try {
        const result = await query('SELECT NOW() as timestamp, VERSION() as version');
        console.log('✅ Banco conectado:', result.rows[0]);
        return true;
    } catch (error) {
        console.error('❌ Erro de conexão:', error.message);
        throw error;
    }
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

export async function selectFrom(table, conditions = {}, options = {}) {
    try {
        let queryText = `SELECT * FROM ${table}`;
        const params = [];
        let paramCount = 1;

        // WHERE conditions
        if (Object.keys(conditions).length > 0) {
            const whereClause = Object.keys(conditions)
                .map(key => {
                    params.push(conditions[key]);
                    return `${key} = $${paramCount++}`;
                })
                .join(' AND ');
            queryText += ` WHERE ${whereClause}`;
        }

        // ORDER BY
        if (options.orderBy) {
            queryText += ` ORDER BY ${options.orderBy}`;
            if (options.orderDirection) {
                queryText += ` ${options.orderDirection}`;
            }
        }

        // LIMIT
        if (options.limit) {
            queryText += ` LIMIT ${options.limit}`;
        }

        // OFFSET
        if (options.offset) {
            queryText += ` OFFSET ${options.offset}`;
        }

        const result = await query(queryText, params);
        return { data: result.rows, error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
}

export async function insertInto(table, data) {
    try {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        
        const queryText = `
            INSERT INTO ${table} (${keys.join(', ')})
            VALUES (${placeholders})
            RETURNING *
        `;

        const result = await query(queryText, values);
        return { data: result.rows[0], error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
}

export async function updateTable(table, id, data) {
    try {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
        
        const queryText = `
            UPDATE ${table}
            SET ${setClause}, updated_at = NOW()
            WHERE id = $${keys.length + 1}
            RETURNING *
        `;

        const result = await query(queryText, [...values, id]);
        return { data: result.rows[0], error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
}

export async function deleteFrom(table, id) {
    try {
        const queryText = `DELETE FROM ${table} WHERE id = $1 RETURNING *`;
        const result = await query(queryText, [id]);
        return { data: result.rows[0], error: null };
    } catch (error) {
        return { data: null, error: error.message };
    }
}

// ========================================
// FUNÇÕES ESPECÍFICAS PARA SUPABASE COMPATIBILITY
// ========================================

export async function rpc(functionName, params = {}) {
    try {
        switch (functionName) {
            case 'get_user_progress':
                return await getUserProgress(params.user_id, params.course_id);
            
            case 'update_video_progress':
                return await updateVideoProgress(params);
            
            case 'generate_certificate':
                return await generateCertificate(params);
            
            case 'get_branding_config':
                return await getBrandingConfig(params.domain_id);
            
            default:
                return { data: null, error: `Função ${functionName} não implementada` };
        }
    } catch (error) {
        return { data: null, error: error.message };
    }
}

// Implementações específicas
async function getUserProgress(userId, courseId) {
    const result = await query(`
        SELECT 
            vp.*,
            v.titulo as video_titulo,
            v.duracao as video_duracao
        FROM video_progress vp
        JOIN videos v ON v.id = vp.video_id
        WHERE vp.usuario_id = $1 AND vp.curso_id = $2
        ORDER BY v.ordem
    `, [userId, courseId]);
    
    return { data: result.rows, error: null };
}

async function updateVideoProgress(params) {
    const { usuario_id, video_id, curso_id, tempo_assistido, tempo_total, percentual_assistido, concluido } = params;
    
    const result = await query(`
        INSERT INTO video_progress (usuario_id, video_id, curso_id, tempo_assistido, tempo_total, percentual_assistido, concluido)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (usuario_id, video_id)
        DO UPDATE SET
            tempo_assistido = $4,
            tempo_total = $5,
            percentual_assistido = $6,
            concluido = $7,
            updated_at = NOW()
        RETURNING *
    `, [usuario_id, video_id, curso_id, tempo_assistido, tempo_total, percentual_assistido, concluido]);
    
    return { data: result.rows[0], error: null };
}

async function generateCertificate(params) {
    const { usuario_id, curso_id, nota_final } = params;
    
    // Gerar número do certificado único
    const certificateNumber = `ERA${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    const result = await query(`
        INSERT INTO certificados (usuario_id, curso_id, numero_certificado, nota_final, categoria)
        SELECT $1, $2, $3, $4, c.categoria
        FROM cursos c
        WHERE c.id = $2
        RETURNING *
    `, [usuario_id, curso_id, certificateNumber, nota_final]);
    
    return { data: result.rows[0], error: null };
}

async function getBrandingConfig(domainId) {
    const result = await query(`
        SELECT * FROM branding_config 
        WHERE domain_id = $1 OR domain_id IS NULL
        ORDER BY domain_id NULLS LAST
        LIMIT 1
    `, [domainId]);
    
    return { data: result.rows[0] || {}, error: null };
}

// Finalizar conexões
process.on('SIGINT', () => {
    console.log('🔌 Fechando conexões do banco...');
    pool.end();
    process.exit(0);
});




















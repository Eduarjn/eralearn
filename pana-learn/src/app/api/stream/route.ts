import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const QuerySchema = z.object({
  path: z.string(),
  token: z.string()
});

/**
 * Rota para streaming de vídeos internos via X-Accel-Redirect
 * Valida token JWT e delega entrega do arquivo para o NGINX
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.safeParse({
      path: searchParams.get('path') ?? '',
      token: searchParams.get('token') ?? ''
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { path, token } = parsed.data;

    // 1. Validar token JWT
    let payload: any;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 403 });
    }

    // 2. Verificar se o path no token corresponde ao path da requisição
    if (payload.path !== path) {
      return NextResponse.json({ error: 'Path mismatch' }, { status: 403 });
    }

    // 3. Configurar X-Accel-Redirect para NGINX
    const internalPrefix = process.env.INTERNAL_PUBLIC_PREFIX || '/protected/';
    const fullPath = internalPrefix + path;

    // 4. Criar resposta com X-Accel-Redirect
    const response = new NextResponse(null, { status: 200 });
    
    // Headers para streaming de vídeo
    response.headers.set('X-Accel-Redirect', fullPath);
    response.headers.set('Accept-Ranges', 'bytes');
    response.headers.set('Cache-Control', 'public, max-age=3600');
    
    // Headers de segurança
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');

    return response;

  } catch (error: any) {
    console.error('Erro na rota de stream:', error);
    return NextResponse.json({ 
      error: error?.message ?? 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Método OPTIONS para CORS
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}











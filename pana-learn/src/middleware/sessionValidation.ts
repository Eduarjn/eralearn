import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * Middleware para validar sessões em rotas protegidas
 * Verifica se o usuário tem uma sessão válida antes de permitir acesso
 */
export async function validateSessionMiddleware(request: NextRequest) {
  try {
    // Extrair token de sessão do header ou cookie
    const sessionToken = request.headers.get('x-session-token') || 
                        request.cookies.get('session-token')?.value;
    
    const userId = request.headers.get('x-user-id') || 
                  request.cookies.get('user-id')?.value;

    if (!sessionToken || !userId) {
      return NextResponse.json(
        { error: 'Sessão não encontrada' },
        { status: 401 }
      );
    }

    // Validar sessão no banco de dados
    const { data: isValid, error } = await supabaseAdmin.rpc('validate_user_session', {
      p_user_id: userId,
      p_session_token: sessionToken
    });

    if (error) {
      console.error('Erro ao validar sessão:', error);
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      );
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Sessão inválida ou expirada' },
        { status: 401 }
      );
    }

    // Sessão válida, continuar
    return NextResponse.next();
  } catch (error) {
    console.error('Erro no middleware de sessão:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Função para verificar se uma rota requer validação de sessão
 */
export function requiresSessionValidation(pathname: string): boolean {
  // Lista de rotas que requerem validação de sessão
  const protectedRoutes = [
    '/dashboard',
    '/cursos',
    '/videos',
    '/perfil',
    '/configuracoes',
    '/admin'
  ];

  // Verificar se a rota está na lista de rotas protegidas
  return protectedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Middleware principal para Next.js
 */
export function sessionMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se a rota requer validação de sessão
  if (requiresSessionValidation(pathname)) {
    return validateSessionMiddleware(request);
  }

  // Rota pública, continuar
  return NextResponse.next();
}












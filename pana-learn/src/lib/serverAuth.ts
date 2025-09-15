import { NextRequest } from 'next/server';
import { supabaseAdmin } from './supabaseAdmin';

/**
 * Extrai informações do usuário autenticado a partir da requisição
 * TODO: Integrar com auth-helpers do Supabase se disponível
 */
export async function getUserFromRequest(req: NextRequest): Promise<{ id: string; email?: string } | null> {
  try {
    // Estratégia 1: Verificar Authorization header
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verificar token com Supabase
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      if (error || !user) {
        return null;
      }
      
      return {
        id: user.id,
        email: user.email
      };
    }

    // Estratégia 2: Verificar cookies (se usando cookies para auth)
    const sessionCookie = req.cookies.get('sb-access-token')?.value;
    if (sessionCookie) {
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(sessionCookie);
      if (error || !user) {
        return null;
      }
      
      return {
        id: user.id,
        email: user.email
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao extrair usuário da requisição:', error);
    return null;
  }
}

/**
 * Valida se o usuário pode acessar um asset específico
 * TODO: Implementar lógica de permissões baseada em matrículas/cursos
 */
export async function assertCanAccess(userId: string, assetId: string): Promise<boolean> {
  try {
    // Estratégia mínima: verificar se o asset está ligado a uma aula/curso
    // que o usuário tem permissão de acessar
    
    // TODO: Implementar verificação real baseada em:
    // 1. Tabela de matrículas (enrollments)
    // 2. Permissões de curso
    // 3. Roles do usuário (admin, instrutor, aluno)
    
    // Por enquanto, permitir acesso se o usuário está autenticado
    // Em produção, implementar a lógica real de permissões
    return true;
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return false;
  }
}

















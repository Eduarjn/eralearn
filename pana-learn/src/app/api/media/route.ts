import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getUserFromRequest, assertCanAccess } from '@/lib/serverAuth';
import { validateMediaRouteConfig } from '@/lib/validateConfig';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

const QuerySchema = z.object({
  id: z.string().uuid()
});

/**
 * Rota para resolver assets e gerar URLs de reprodução
 * Suporta providers: internal (servidor próprio) e youtube
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = QuerySchema.safeParse({ 
      id: searchParams.get('id') ?? '' 
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid asset ID' }, { status: 400 });
    }

    // 1. Autenticação
    const user = await getUserFromRequest(req);
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Buscar asset
    const { data: asset, error } = await supabaseAdmin
      .from('assets')
      .select('id, provider, youtube_id, youtube_url, bucket, path, mime, title')
      .eq('id', parsed.data.id)
      .eq('ativo', true)
      .single();

    if (error || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // 3. Verificar permissão de acesso
    // TODO: Implementar verificação de matrícula no curso
    // const canAccess = await assertCanAccess(user.id, asset.id);
    // if (!canAccess) {
    //   return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    // }

    // 4. Processar baseado no provider
    if (asset.provider === 'youtube') {
      // YouTube: retornar URL parametrizada para reduzir branding
      const url = asset.youtube_url?.replace('youtube.com/watch?v=', 'youtube.com/embed/') || 
                  `https://www.youtube.com/embed/${asset.youtube_id}`;
      const safeUrl = `${url}?modestbranding=1&rel=0&iv_load_policy=3&showinfo=0`;
      
      return NextResponse.json({ 
        kind: 'youtube', 
        id: asset.youtube_id, 
        url: safeUrl,
        title: asset.title
      });
    }

    if (asset.provider === 'internal') {
      // Internal: gerar URL assinada para X-Accel-Redirect
      const ttl = parseInt(process.env.MEDIA_SIGN_TTL || '3600');
      const token = jwt.sign(
        { uid: user.id, path: asset.path }, 
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: ttl }
      );
      
      const streamUrl = `/api/stream?path=${encodeURIComponent(asset.path)}&token=${token}`;
      
      return NextResponse.json({ 
        kind: 'internal', 
        url: streamUrl, 
        mime: asset.mime,
        title: asset.title
      });
    }

    return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });

  } catch (error: any) {
    console.error('Erro na rota de media:', error);
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

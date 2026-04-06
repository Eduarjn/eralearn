import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface RecentComment {
  id: string;
  texto: string;
  data_criacao: string;
  autor_nome: string;
  is_admin: boolean;
  video_id: string;
  video_titulo: string;
  curso_id: string;
}

export function useRecentComments(limit = 10) {
  const [comments, setComments] = useState<RecentComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('comentarios')
          .select(`
            id, 
            texto, 
            data_criacao, 
            parent_id,
            video_id,
            usuarios:usuario_id(nome, tipo_usuario),
            videos:video_id(titulo, curso_id)
          `)
          .is('parent_id', null)
          .eq('ativo', true)
          .order('data_criacao', { ascending: false })
          .limit(limit);

        if (error) {
          console.error("Erro ao buscar comentários:", error);
          return;
        }

        if (data) {
          const formattedComments = data.map((c: any) => {
            // Tratamento de segurança caso o Supabase retorne array ou objeto
            const usuario = Array.isArray(c.usuarios) ? c.usuarios[0] : c.usuarios;
            const video = Array.isArray(c.videos) ? c.videos[0] : c.videos;

            return {
              id: c.id,
              texto: c.texto,
              data_criacao: c.data_criacao,
              autor_nome: usuario?.nome || 'Usuário',
              is_admin: usuario?.tipo_usuario === 'admin' || usuario?.tipo_usuario === 'admin_master',
              video_id: c.video_id,
              video_titulo: video?.titulo || 'Vídeo não encontrado',
              curso_id: video?.curso_id || ''
            };
          });
          
          // Ocultar os comentários dos admins no mural (para focar nos clientes)
          setComments(formattedComments.filter(c => !c.is_admin));
        }
      } catch (err) {
        console.error("Exceção:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [limit]);

  return { data: comments, isLoading: loading };
}
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  texto: string;
  data_criacao: string;
  autor_nome: string;
  autor_id: string;
  parent_id?: string;
  is_admin: boolean;
  nivel_resposta: number;
}

interface CommentsSectionProps {
  videoId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ videoId }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Carregar comentários com respostas
  const loadComments = async () => {
    if (!videoId) return;
    
    try {
      setLoading(true);
      
      // Usar função RPC para buscar comentários com respostas
      const { data, error } = await supabase.rpc('get_video_comments_with_replies', {
        p_video_id: videoId
      });

      if (error) {
        console.error('Erro ao carregar comentários:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao carregar comentários',
          variant: 'destructive'
        });
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [videoId]);

  // Deletar comentário (usuário normal ou admin)
  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Excluir este comentário?')) return;
    
    try {
      let error;
      
      // Se for admin, usar função específica para deletar qualquer comentário
      if (userProfile?.tipo_usuario === 'admin') {
        const { error: adminError } = await supabase.rpc('delete_video_comment_admin', {
          p_comentario_id: commentId
        });
        error = adminError;
      } else {
        // Usuário normal só pode deletar seus próprios comentários
        const { error: userError } = await supabase.rpc('delete_video_comment', {
          p_comentario_id: commentId
        });
        error = userError;
      }

      if (error) {
        console.error('Erro ao deletar comentário:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao deletar comentário',
          variant: 'destructive'
        });
        return;
      }

      // Recarregar comentários
      await loadComments();
      
      toast({
        title: 'Sucesso',
        description: 'Comentário excluído com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
    }
  };

  // Enviar comentário principal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userProfile?.id) return;
    
    try {
      setSubmitting(true);
      
      // Usar função RPC para adicionar comentário
      const { data, error } = await supabase.rpc('add_video_comment', {
        p_video_id: videoId,
        p_texto: newComment.trim()
      });

      if (error) {
        console.error('Erro ao enviar comentário:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao enviar comentário',
          variant: 'destructive'
        });
        return;
      }

      // Recarregar comentários
      await loadComments();
      
      setNewComment('');
      
      toast({
        title: 'Sucesso',
        description: 'Comentário enviado com sucesso',
      });
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar comentário',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Enviar resposta (apenas para admins)
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !replyingTo || !userProfile?.id) return;
    
    try {
      setSubmitting(true);
      
      // Usar função RPC para adicionar resposta
      const { data, error } = await supabase.rpc('add_video_reply', {
        p_video_id: videoId,
        p_parent_id: replyingTo,
        p_texto: replyText.trim()
      });

      if (error) {
        console.error('Erro ao enviar resposta:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao enviar resposta',
          variant: 'destructive'
        });
        return;
      }

      // Recarregar comentários
      await loadComments();
      
      setReplyText('');
      setReplyingTo(null);
      
      toast({
        title: 'Sucesso',
        description: 'Resposta enviada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao enviar resposta:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao enviar resposta',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Organizar comentários em hierarquia
  const organizeComments = (comments: Comment[]) => {
    const mainComments = comments.filter(c => c.nivel_resposta === 0);
    const replies = comments.filter(c => c.nivel_resposta > 0);
    
    return mainComments.map(main => ({
      ...main,
      replies: replies.filter(reply => reply.parent_id === main.id)
    }));
  };

  const organizedComments = organizeComments(comments);

  // Renderizar comentário individual
  const renderComment = (comment: Comment, isReply = false) => (
    <div 
      key={comment.id} 
      className={`p-3 bg-white border border-gray-200 rounded-lg flex flex-col gap-1 relative ${
        isReply ? 'ml-6 border-l-2 border-era-green' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className={`font-medium text-sm ${
            comment.is_admin ? 'text-era-green' : 'text-era-blue'
          }`}>
            {comment.autor_nome}
            {comment.is_admin && ' 👑'}
          </span>
          {isReply && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Resposta
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {new Date(comment.data_criacao).toLocaleDateString('pt-BR')} {' '}
            {new Date(comment.data_criacao).toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {(userProfile?.tipo_usuario === 'admin' || comment.autor_id === userProfile?.id) && (
            <button
              className="text-red-500 hover:text-red-700 text-base px-2 py-1 rounded transition"
              onClick={() => handleDelete(comment.id)}
              title="Excluir comentário"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      <div className="text-gray-700 text-sm whitespace-pre-line">
        {comment.texto}
      </div>
      
      {/* Botão de resposta (apenas para admins em comentários principais) */}
      {!isReply && userProfile?.tipo_usuario === 'admin' && (
        <div className="mt-2">
          <button
            className="text-era-green hover:text-era-green/80 text-sm font-medium"
            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
          >
            {replyingTo === comment.id ? 'Cancelar resposta' : 'Responder'}
          </button>
        </div>
      )}
      
      {/* Formulário de resposta */}
      {!isReply && replyingTo === comment.id && userProfile?.tipo_usuario === 'admin' && (
        <form onSubmit={handleReply} className="mt-3 flex flex-col gap-2">
          <textarea
            className="border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-era-green focus:border-era-green"
            rows={2}
            placeholder="Escreva sua resposta..."
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 text-sm"
              onClick={() => {
                setReplyingTo(null);
                setReplyText('');
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-era-green text-white font-semibold px-4 py-1 rounded-lg shadow hover:bg-era-green/90 transition disabled:opacity-60 text-sm"
              disabled={submitting || replyText.trim() === ''}
            >
              {submitting ? 'Enviando...' : 'Responder'}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-2">Comentários</h3>
      
      {/* Lista de comentários */}
      <div className="max-h-[400px] overflow-y-auto flex flex-col gap-3 mb-4">
        {loading ? (
          <div className="text-gray-400 text-sm">Carregando comentários...</div>
        ) : organizedComments.length === 0 ? (
          <div className="text-gray-400 text-sm">Nenhum comentário ainda.</div>
        ) : (
          organizedComments.map(comment => (
            <div key={comment.id}>
              {renderComment(comment)}
              {/* Respostas */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 space-y-2">
                  {comment.replies.map(reply => renderComment(reply, true))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Formulário para novo comentário */}
      {userProfile?.id && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            className="border border-gray-300 rounded-lg p-2 text-sm resize-none focus:ring-2 focus:ring-era-green focus:border-era-green"
            rows={2}
            placeholder="Escreva um comentário..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-era-green text-white font-semibold px-4 py-1 rounded-lg shadow hover:bg-era-green/90 transition disabled:opacity-60"
              disabled={submitting || newComment.trim() === ''}
            >
              {submitting ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      )}
      
      {!userProfile?.id && (
        <div className="text-gray-500 text-sm text-center py-4">
          Faça login para comentar
        </div>
      )}
    </div>
  );
};

export default CommentsSection; 
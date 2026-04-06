import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { useRecentComments } from '@/hooks/useRecentComments';
import { useNavigate } from 'react-router-dom';

export function RecentCommentsWidget() {
  const { data: comments, isLoading } = useRecentComments(5);
  const navigate = useNavigate();

  const handleNavigateToVideo = (cursoId: string) => {
    if(cursoId) navigate(`/curso/${cursoId}`);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
      <CardHeader className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white rounded-t-xl pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-white/20 rounded-lg">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-white font-bold text-lg">Mural de Dúvidas</CardTitle>
            <p className="text-xs text-white/90 font-medium mt-1">Últimos comentários</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-era-green"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">Nenhum comentário recente.</p>
        ) : (
          <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-sm text-era-black">{comment.autor_nome}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.data_criacao).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                  Em: <span className="font-medium">{comment.video_titulo}</span>
                </p>
                
                <div className="bg-gray-50 p-3 rounded-md border border-gray-100 mb-3">
                  <p className="text-sm text-gray-700 italic line-clamp-3">"{comment.texto}"</p>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => handleNavigateToVideo(comment.curso_id)}
                    className="flex items-center gap-1 text-xs font-medium text-era-green hover:text-era-black transition-colors"
                  >
                    Responder <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
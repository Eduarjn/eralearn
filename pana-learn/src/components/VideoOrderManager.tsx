import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, GripVertical, Save, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Video {
  id: string;
  titulo: string;
  duracao: number;
  ordem: number;
  curso_id: string;
}

interface VideoOrderManagerProps {
  cursoId: string;
  onOrderChange?: () => void;
}

export const VideoOrderManager: React.FC<VideoOrderManagerProps> = ({
  cursoId,
  onOrderChange
}) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Carregar vídeos do curso
  useEffect(() => {
    loadVideos();
  }, [cursoId]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('id, titulo, duracao, ordem, curso_id')
        .eq('curso_id', cursoId)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) {
        console.error('Erro ao carregar vídeos:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os vídeos",
          variant: "destructive"
        });
        return;
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para salvar nova ordem
  const saveOrder = async () => {
    try {
      setSaving(true);
      
      // Preparar array de IDs na nova ordem
      const videoIds = videos.map(video => video.id);
      
      // Chamar função SQL para reordenar
      const { error } = await supabase.rpc('reordenar_videos_curso', {
        p_curso_id: cursoId,
        p_video_ids: videoIds
      });

      if (error) {
        console.error('Erro ao salvar ordem:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a nova ordem",
          variant: "destructive"
        });
        return;
      }

      setHasChanges(false);
      toast({
        title: "Sucesso",
        description: "Ordem dos vídeos salva com sucesso!",
      });

      // Recarregar vídeos para confirmar mudanças
      await loadVideos();
      
      // Notificar componente pai
      onOrderChange?.();
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setSaving(false);
    }
  };

  // Função para resetar ordem
  const resetOrder = async () => {
    try {
      setSaving(true);
      
      // Reordenar por data de criação
      const { data, error } = await supabase
        .from('videos')
        .select('id')
        .eq('curso_id', cursoId)
        .eq('ativo', true)
        .order('data_criacao', { ascending: true });

      if (error) {
        console.error('Erro ao resetar ordem:', error);
        return;
      }

      const videoIds = data?.map(v => v.id) || [];
      
      if (videoIds.length > 0) {
        const { error: reorderError } = await supabase.rpc('reordenar_videos_curso', {
          p_curso_id: cursoId,
          p_video_ids: videoIds
        });

        if (reorderError) {
          console.error('Erro ao reordenar:', reorderError);
          return;
        }
      }

      await loadVideos();
      setHasChanges(false);
      toast({
        title: "Ordem Resetada",
        description: "Vídeos reordenados por data de criação",
      });
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setSaving(false);
    }
  };

  // Função para lidar com drag and drop
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Atualizar ordem dos itens
    const updatedVideos = items.map((item, index) => ({
      ...item,
      ordem: index + 1
    }));

    setVideos(updatedVideos);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Carregando vídeos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Gerenciar Ordem dos Vídeos
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetOrder}
              disabled={saving}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Resetar
            </Button>
            <Button
              size="sm"
              onClick={saveOrder}
              disabled={saving || !hasChanges}
            >
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Salvando...' : 'Salvar Ordem'}
            </Button>
          </div>
        </div>
        {hasChanges && (
          <p className="text-sm text-amber-600">
            ⚠️ Você tem alterações não salvas. Clique em "Salvar Ordem" para aplicar as mudanças.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhum vídeo encontrado para este curso.
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="videos">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {videos.map((video, index) => (
                    <Draggable
                      key={video.id}
                      draggableId={video.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`
                            flex items-center gap-3 p-3 rounded-lg border
                            ${snapshot.isDragging 
                              ? 'bg-blue-50 border-blue-200 shadow-lg' 
                              : 'bg-white border-gray-200'
                            }
                            ${hasChanges ? 'ring-2 ring-amber-200' : ''}
                          `}
                        >
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {video.ordem}
                              </Badge>
                              <span className="font-medium">{video.titulo}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              Duração: {Math.floor(video.duracao / 60)}:{(video.duracao % 60).toString().padStart(2, '0')}
                            </div>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </CardContent>
    </Card>
  );
};

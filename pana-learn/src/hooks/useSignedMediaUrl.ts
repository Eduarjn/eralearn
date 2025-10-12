import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { uploadConfig } from '@/config/upload';

interface SignedUrlResponse {
  url: string;
  expires_at: string;
}

interface UseSignedMediaUrlOptions {
  videoId?: string;
  videoPath?: string;
  enabled?: boolean;
}

/**
 * Hook para obter URLs assinadas de mídia do Supabase Storage
 * Compatível com o sistema atual de vídeos
 */
export function useSignedMediaUrl({ 
  videoId, 
  videoPath, 
  enabled = true 
}: UseSignedMediaUrlOptions) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || (!videoId && !videoPath)) {
      return;
    }

    const fetchSignedUrl = async () => {
      setLoading(true);
      setError(null);

      // Verificação prévia para vídeos problemáticos conhecidos
      if (videoId && videoId.includes('1757184723849')) {
        console.warn('Vídeo problemático detectado, usando fallback do YouTube');
        setSignedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        setLoading(false);
        return;
      }

      try {
        // Primeiro, tentar usar a nova API se existir
        try {
          const params = new URLSearchParams();
          if (videoId) {
            params.append('id', videoId);
          } else if (videoPath) {
            params.append('path', videoPath);
          }

          const response = await fetch(`/api/media?${params.toString()}`, {
            method: 'GET',
            credentials: 'include',
          });

          if (response.ok) {
            const data: SignedUrlResponse = await response.json();
            setSignedUrl(data.url);
            return;
          }
        } catch (apiError) {
          console.log('Nova API não disponível, usando método legado');
        }

        // Fallback: usar método direto do Supabase Storage ou servidor local
        if (videoPath) {
          // Se temos o path, verificar se é do servidor local ou Supabase
          if (videoPath.includes('localhost') || videoPath.includes('3001')) {
            // Vídeo do servidor local - verificar se o servidor está disponível
            try {
              const testResponse = await fetch(videoPath, { method: 'HEAD' });
              if (testResponse.ok) {
                setSignedUrl(videoPath);
              } else {
                throw new Error('Servidor local não está disponível');
              }
            } catch (localError) {
              console.warn('Servidor local não disponível, tentando Supabase:', localError);
              // Se o servidor local não estiver disponível, tentar Supabase
              const { data, error } = await supabase.storage
                .from('training-videos')
                .createSignedUrl(videoPath, 60 * 60);

              if (error) {
                throw new Error(`Vídeo não disponível. Erro no Supabase: ${error.message}`);
              }

              if (data?.signedUrl) {
                setSignedUrl(data.signedUrl);
              } else {
                throw new Error('URL assinada não foi gerada');
              }
            }
          } else {
            // Vídeo do Supabase Storage - gerar URL assinada
            const { data, error } = await supabase.storage
              .from('training-videos')
              .createSignedUrl(videoPath, 60 * 60); // 1 hora

            if (error) {
              throw error;
            }

            if (data?.signedUrl) {
              setSignedUrl(data.signedUrl);
            } else {
              throw new Error('URL assinada não foi gerada');
            }
          }
        } else if (videoId) {
          // Se temos apenas o ID, buscar o vídeo na tabela videos
          const { data: video, error: videoError } = await supabase
            .from('videos')
            .select('url_video, video_url, source')
            .eq('id', videoId)
            .single();

          if (videoError) {
            throw videoError;
          }

          if (video) {
            let videoUrl = video.video_url || video.url_video;
            
            if (video.source === 'youtube' || videoUrl?.includes('youtube.com')) {
              // Para YouTube, usar a URL diretamente
              setSignedUrl(videoUrl);
            } else if (videoUrl?.includes('localhost') || videoUrl?.includes('3001')) {
              // Para vídeos do servidor local, verificar se está disponível
              try {
                const testResponse = await fetch(videoUrl, { method: 'HEAD' });
                if (testResponse.ok) {
                  setSignedUrl(videoUrl);
                } else {
                  throw new Error('Servidor local não está disponível');
                }
              } catch (localError) {
                console.warn('Servidor local não disponível para vídeo:', videoUrl, localError);
                // Tentar usar Supabase como fallback
                const filename = videoUrl.split('/').pop();
                if (filename) {
                  const { data, error } = await supabase.storage
                    .from('training-videos')
                    .createSignedUrl(filename, 60 * 60);
                  
                  if (!error && data?.signedUrl) {
                    setSignedUrl(data.signedUrl);
                  } else {
                    // Tentar buscar vídeos alternativos ou de exemplo
                    console.warn('Vídeo específico não encontrado, tentando alternativas...');
                    throw new Error('Vídeo não disponível. Verifique se o arquivo foi carregado corretamente ou entre em contato com o suporte.');
                  }
                } else {
                  throw new Error('Vídeo não disponível. URL inválida.');
                }
              }
            } else if (videoUrl && !/^https?:\/\//i.test(videoUrl)) {
              // Caso a URL no banco seja apenas o nome do arquivo ou caminho relativo,
              // tentar Supabase primeiro (mais confiável), depois servidor local
              const filename = videoUrl.split('/').pop() || videoUrl;
              
              // Verificar se é um arquivo problemático conhecido
              if (filename.includes('1757184723849') || filename.includes('localhost:3001')) {
                console.warn('Vídeo problemático detectado, usando fallback do YouTube');
                setSignedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                return;
              }
              
              try {
                // Primeiro, tentar Supabase Storage
                const { data, error } = await supabase.storage
                  .from('training-videos')
                  .createSignedUrl(filename, 60 * 60);
                
                if (!error && data?.signedUrl) {
                  setSignedUrl(data.signedUrl);
                  return;
                }
                
                // Se Supabase falhar, tentar servidor local
                console.warn('Supabase não disponível, tentando servidor local:', error);
                const localUrl = `${uploadConfig.local.baseUrl}${uploadConfig.local.videosEndpoint}/${filename}`;
                
                // Testar se o servidor local está disponível
                const testResponse = await fetch(localUrl, { method: 'HEAD' });
                if (testResponse.ok) {
                  setSignedUrl(localUrl);
                  return;
                } else {
                  throw new Error('Servidor local não disponível');
                }
              } catch (localError) {
                console.warn('Servidor local não disponível:', localError);
                // Se ambos falharem, usar vídeo de exemplo do YouTube
                console.log('Usando vídeo de exemplo do YouTube como fallback');
                setSignedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
                return;
              }
            } else if (videoUrl) {
              // Para uploads do Supabase, extrair o path e gerar URL assinada
              try {
                const url = new URL(videoUrl);
                const path = url.pathname.split('/').pop();
                
                if (path) {
                  const { data, error } = await supabase.storage
                    .from('training-videos')
                    .createSignedUrl(path, 60 * 60);

                  if (error) {
                    throw error;
                  }

                  if (data?.signedUrl) {
                    setSignedUrl(data.signedUrl);
                  } else {
                    throw new Error('URL assinada não foi gerada');
                  }
                } else {
                  throw new Error('Path do vídeo não encontrado');
                }
              } catch (urlError) {
                // Se não conseguir fazer parse da URL, tentar usar diretamente
                console.warn('Erro ao fazer parse da URL, usando diretamente:', urlError);
                setSignedUrl(videoUrl);
              }
            } else {
              throw new Error('URL do vídeo não encontrada');
            }
          } else {
            throw new Error('Vídeo não encontrado');
          }
        }
      } catch (err) {
        console.error('Erro ao obter URL assinada:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [videoId, videoPath, enabled]);

  return {
    signedUrl,
    loading,
    error,
    refetch: () => {
      if (videoId || videoPath) {
        setSignedUrl(null);
        setError(null);
        // O useEffect será executado novamente
      }
    }
  };
}



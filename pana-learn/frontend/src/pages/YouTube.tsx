import React, { useState, useEffect } from 'react';
import { Calendar } from '../components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ExternalLink, Play, Calendar as CalendarIcon, Bell, CheckCircle } from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnails: {
    high: {
      url: string;
    };
  };
  publishedAt: string;
}

interface LiveEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'live' | 'webinar' | 'event';
}

const YouTubePage = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Dados mockados para eventos ao vivo (em produção, viriam de uma API)
  const liveEvents: LiveEvent[] = [
    {
      id: '1',
      title: 'Webinar: Novidades do Produto 2024',
      date: new Date(2024, 11, 15),
      time: '14:00',
      type: 'webinar'
    },
    {
      id: '2',
      title: 'Live: Q&A com Especialistas',
      date: new Date(2024, 11, 20),
      time: '16:00',
      type: 'live'
    },
    {
      id: '3',
      title: 'Evento: Lançamento da Nova Plataforma',
      date: new Date(2024, 11, 25),
      time: '10:00',
      type: 'event'
    }
  ];

  useEffect(() => {
    const fetchYouTubeVideos = async () => {
      try {
        // Simulando dados de vídeos recomendados (em produção, usar API do YouTube)
        const mockVideos: YouTubeVideo[] = [
          {
            id: 'dQw4w9WgXcQ',
            title: 'Como usar nossa plataforma - Tutorial Completo',
            thumbnails: {
              high: {
                url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
              }
            },
            publishedAt: '2024-01-15'
          },
          {
            id: '9bZkp7q19f0',
            title: 'Dicas e Truques para Maximizar seus Resultados',
            thumbnails: {
              high: {
                url: 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg'
              }
            },
            publishedAt: '2024-01-10'
          },
          {
            id: 'kJQP7kiw5Fk',
            title: 'Entrevista com CEO sobre o Futuro da Empresa',
            thumbnails: {
              high: {
                url: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg'
              }
            },
            publishedAt: '2024-01-05'
          },
          {
            id: 'ZZ5LpwO-An4',
            title: 'Treinamento Avançado para Usuários Premium',
            thumbnails: {
              high: {
                url: 'https://img.youtube.com/vi/ZZ5LpwO-An4/hqdefault.jpg'
              }
            },
            publishedAt: '2024-01-01'
          }
        ];

        setVideos(mockVideos);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar vídeos:', err);
        setLoading(false);
      }
    };

    fetchYouTubeVideos();
  }, []);

  const handleChannelRedirect = () => {
    window.open('https://www.youtube.com/@minhaeravideos', '_blank');
  };

  const handleVideoClick = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
  };

  const handleAddReminder = (event: LiveEvent) => {
    // Criar uma notificação visual mais elegante
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 transform translate-x-full transition-transform duration-300';
    notification.innerHTML = `
      <CheckCircle class="h-5 w-5" />
      <span>Lembrete adicionado para: ${event.title}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateX(full)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'live':
        return 'bg-red-500';
      case 'webinar':
        return 'bg-blue-500';
      case 'event':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'live':
        return 'AO VIVO';
      case 'webinar':
        return 'WEBINAR';
      case 'event':
        return 'EVENTO';
      default:
        return 'EVENTO';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header com Link do Canal e Botão */}
      <div className="page-hero mb-8 text-center py-8 rounded-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Canal Oficial da Empresa
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="https://www.youtube.com/@minhaeravideos"
            target="_blank"
            rel="noopener noreferrer"
            className="youtube-channel-link"
          >
            <ExternalLink className="h-5 w-5" />
            youtube.com/@minhaeravideos
          </a>
          
          <Button
            onClick={handleChannelRedirect}
            className="youtube-channel-button"
          >
            <Play className="h-5 w-5" />
            Ir para o Canal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vídeos Recomendados */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-6 w-6 text-red-600" />
                Vídeos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      className="youtube-video-card"
                      onClick={() => handleVideoClick(video.id)}
                    >
                      <div className="relative">
                        <img
                          src={video.thumbnails.high.url}
                          alt={video.title}
                          className="youtube-video-thumbnail"
                        />
                        <div className="youtube-video-overlay">
                          <Play className="youtube-play-icon" />
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(video.publishedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calendário de Eventos */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
                Próximos Eventos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="calendar-container"
                />
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Eventos Agendados</h4>
                  {liveEvents.map((event) => (
                    <div key={event.id} className="event-item">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`${getEventTypeColor(event.type)} text-white text-xs`}>
                              {getEventTypeLabel(event.type)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {event.date.toLocaleDateString('pt-BR')} às {event.time}
                            </span>
                          </div>
                          <h5 className="font-medium text-sm text-gray-900">
                            {event.title}
                          </h5>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddReminder(event)}
                          className="reminder-button"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default YouTubePage;

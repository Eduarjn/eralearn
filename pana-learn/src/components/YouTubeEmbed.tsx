
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Play, Link, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface YouTubeEmbedProps {
  initialUrl?: string;
  title?: string;
  onUrlChange?: (url: string) => void;
}

export function YouTubeEmbed({ initialUrl = '', title = 'Vídeo de Treinamento', onUrlChange }: YouTubeEmbedProps) {
  const [youtubeUrl, setYoutubeUrl] = useState(initialUrl);
  const [embedUrl, setEmbedUrl] = useState('');
  const [error, setError] = useState('');

  const extractVideoId = (url: string): string | null => {
    // Limpar a URL de espaços
    url = url.trim();
    
    // Padrões de URL do YouTube
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  };

  const handleUrlSubmit = () => {
    setError('');
    
    if (!youtubeUrl.trim()) {
      setError('Por favor, insira uma URL do YouTube');
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    
    if (!videoId) {
      setError('URL do YouTube inválida. Use o formato: https://www.youtube.com/watch?v=ID ou https://youtu.be/ID');
      return;
    }

    const newEmbedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0`;
    setEmbedUrl(newEmbedUrl);
    onUrlChange?.(youtubeUrl);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUrlSubmit();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-pana-text">
          <Play className="h-5 w-5 text-pana-purple" />
          {title}
        </CardTitle>
        <CardDescription className="text-pana-text-secondary">
          Cole o link do YouTube abaixo para exibir o vídeo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input para URL do YouTube */}
        <div className="space-y-2">
          <Label htmlFor="youtube-url" className="text-pana-text font-medium">
            URL do YouTube
          </Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pana-text-secondary" />
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 form-input"
              />
            </div>
            <Button 
              onClick={handleUrlSubmit}
              className="pana-primary-button px-6"
            >
              Carregar
            </Button>
          </div>
        </div>

        {/* Mensagem de erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Área do vídeo */}
        <div className="mt-6">
          {embedUrl ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-pana-text">Vídeo Carregado</h3>
              <div className="rounded-lg overflow-hidden shadow-lg bg-black">
                <iframe
                  src={embedUrl}
                  className="youtube-embed"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={title}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-pana-light-gray rounded-lg border-2 border-dashed border-gray-300">
              <Play className="h-12 w-12 text-pana-text-secondary mb-3" />
              <p className="text-pana-text-secondary text-center">
                Nenhum vídeo carregado
              </p>
              <p className="text-sm text-pana-text-secondary text-center mt-1">
                Cole uma URL do YouTube acima para começar
              </p>
            </div>
          )}
        </div>

        {/* Instruções */}
        <div className="bg-pana-light-gray p-4 rounded-lg">
          <h4 className="font-semibold text-pana-text mb-2">Como usar:</h4>
          <ul className="text-sm text-pana-text-secondary space-y-1">
            <li>• Cole o link completo do YouTube (ex: https://www.youtube.com/watch?v=ID)</li>
            <li>• Ou use o link curto (ex: https://youtu.be/ID)</li>
            <li>• O vídeo será exibido automaticamente no formato embed</li>
            <li>• Funciona tanto localmente quanto em produção</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

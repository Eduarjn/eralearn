import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Download, 
  Share2, 
  Linkedin, 
  Facebook, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

interface CourseCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewCertificate: () => void;
  categoriaNome: string;
  nota: number;
  certificadoUrl?: string;
}

export const CourseCompletionModal: React.FC<CourseCompletionModalProps> = ({
  isOpen,
  onClose,
  onViewCertificate,
  categoriaNome,
  nota,
  certificadoUrl
}) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const handleShare = async (platform: 'linkedin' | 'facebook' | 'copy') => {
    const shareUrl = certificadoUrl || `${window.location.origin}/certificado/${categoriaNome}`;
    const shareText = `🎉 Acabei de concluir o curso ${categoriaNome} com ${nota}% de aproveitamento!`;
    
    try {
      switch (platform) {
        case 'linkedin': {
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`;
          window.open(linkedinUrl, '_blank');
          break;
        }
          
        case 'facebook': {
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
          window.open(facebookUrl, '_blank');
          break;
        }
          
        case 'copy':
          await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`);
          setCopied(true);
          toast({
            title: "Link copiado!",
            description: "O link do certificado foi copiado para a área de transferência.",
            variant: "default"
          });
          setTimeout(() => setCopied(false), 2000);
          break;
      }
    } catch (error) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleDownloadCertificate = () => {
    if (certificadoUrl) {
      const link = document.createElement('a');
      link.href = certificadoUrl;
      link.download = `certificado-${categoriaNome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Certificado em processamento",
        description: "O certificado está sendo gerado. Tente novamente em alguns instantes.",
        variant: "default"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold text-green-600">
                Parabéns! 🎉
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-6">
          {/* Mensagem principal */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Você concluiu o curso <span className="text-blue-600 font-bold">{categoriaNome}</span> com sucesso!
            </h2>
            
            <div className="flex items-center justify-center gap-4">
              <Badge variant="default" className="bg-green-100 text-green-800 text-lg px-4 py-2">
                Nota: {nota}%
              </Badge>
              <Badge variant="default" className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                <Trophy className="w-4 h-4 mr-1" />
                Certificado Disponível
              </Badge>
            </div>

            <p className="text-gray-600 text-lg">
              Seu certificado foi gerado e está pronto para download. 
              Compartilhe sua conquista nas redes sociais!
            </p>
          </div>

          {/* Botões principais */}
          <div className="space-y-3">
            <Button
              onClick={onViewCertificate}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Ver Certificado
            </Button>

            <div className="relative">
              <Button
                onClick={() => setShowShareMenu(!showShareMenu)}
                variant="outline"
                className="w-full py-3 text-lg"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartilhar Conquista
              </Button>

              {/* Menu de compartilhamento */}
              {showShareMenu && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-10 shadow-lg">
                  <CardContent className="p-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        onClick={() => handleShare('linkedin')}
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1"
                      >
                        <Linkedin className="w-4 h-4 text-blue-600" />
                        <span className="text-xs">LinkedIn</span>
                      </Button>
                      
                      <Button
                        onClick={() => handleShare('facebook')}
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                        <span className="text-xs">Facebook</span>
                      </Button>
                      
                      <Button
                        onClick={() => handleShare('copy')}
                        variant="outline"
                        size="sm"
                        className="flex flex-col items-center gap-1"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-xs">
                          {copied ? 'Copiado!' : 'Copiar'}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Button
              onClick={handleDownloadCertificate}
              variant="outline"
              className="w-full py-3 text-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar Certificado (PDF)
            </Button>
          </div>

          {/* Informações adicionais */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
            <p className="font-medium mb-2">📋 Informações do certificado:</p>
            <ul className="text-left space-y-1">
              <li>• Certificado válido e assinado digitalmente</li>
              <li>• QR Code para validação online</li>
              <li>• Disponível para download em PDF</li>
              <li>• Pode ser compartilhado nas redes sociais</li>
            </ul>
          </div>

          {/* Botão fechar */}
          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Continuar Estudando
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
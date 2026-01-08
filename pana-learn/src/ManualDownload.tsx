import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, FileText, X, File, BookOpen } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getManuaisByCurso, type Manual } from '@/config/manuais';

interface ManualDownloadProps {
  cursoId: string;
  cursoNome: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ManualDownload({ cursoId, cursoNome, isOpen, onClose }: ManualDownloadProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  // Obter manuais do curso usando a configuração
  const manuais = getManuaisByCurso(cursoId);

  const handleDownload = async (manual: Manual) => {
    setDownloading(manual.titulo);
    
    try {
      // Criar link de download
      const link = document.createElement('a');
      link.href = manual.arquivo;
      link.download = `${manual.titulo}.${manual.tipo.toLowerCase()}`;
      link.target = '_blank';
      
      // Adicionar ao DOM temporariamente
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log do download
      console.log(`📥 Download iniciado: ${manual.titulo}`);
      
      toast({
        title: "Download iniciado",
        description: `Baixando: ${manual.titulo}`,
      });
    } catch (error) {
      console.error('❌ Erro no download:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar download. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setDownloading(null);
    }
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'ppt':
      case 'pptx':
        return <FileText className="h-5 w-5 text-orange-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-era-black via-era-gray-medium to-era-green rounded-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <span>Manuais do Curso</span>
              <p className="text-sm font-normal text-gray-600 mt-1">{cursoNome}</p>
            </div>
          </DialogTitle>
          <DialogDescription>
            Baixe os manuais e materiais complementares do curso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {manuais.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum manual disponível
              </h3>
              <p className="text-gray-500">
                Este curso ainda não possui manuais para download.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {manuais.map((manual, index) => (
                <Card key={index} className="hover:shadow-md transition-all duration-200 border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        {getFileIcon(manual.tipo)}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1 truncate">
                            {manual.titulo}
                          </h4>
                          {manual.descricao && (
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {manual.descricao}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <File className="h-3 w-3" />
                              {manual.tipo.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          onClick={() => handleDownload(manual)}
                          disabled={downloading === manual.titulo}
                          size="sm"
                          className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green hover:from-era-black/90 hover:via-era-gray-medium/90 hover:to-era-green/90 text-white"
                        >
                          {downloading === manual.titulo ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span className="ml-2">
                            {downloading === manual.titulo ? 'Baixando...' : 'Baixar'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {manuais.length} manual{manuais.length !== 1 ? 'is' : ''} disponível{manuais.length !== 1 ? 'is' : ''}
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-300"
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

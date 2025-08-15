import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useBranding } from '@/context/BrandingContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Linkedin, 
  Facebook, 
  Copy, 
  Check,
  ArrowLeft,
  QrCode,
  Calendar,
  User,
  Award
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CertificateData {
  id: string;
  usuario_id: string;
  curso_id: string;
  categoria_nome: string;
  nota: number;
  data_conclusao: string;
  certificado_url?: string;
  qr_code_url?: string;
  usuario?: {
    nome: string;
    email: string;
  };
  curso?: {
    nome: string;
    descricao?: string;
  };
}

const Certificado: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { userProfile } = useAuth();
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      loadCertificate();
    }
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      
      // Buscar certificado com dados do usuário e curso
      const { data, error } = await supabase
        .from('certificados')
        .select(`
          *,
          usuario:usuarios(nome, email),
          curso:cursos(nome, descricao)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erro ao carregar certificado:', error);
        toast({
          title: "Erro",
          description: "Certificado não encontrado.",
          variant: "destructive"
        });
        navigate('/dashboard');
        return;
      }

      setCertificate(data);
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar certificado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (certificate?.certificado_url) {
      const link = document.createElement('a');
      link.href = certificate.certificado_url;
      link.download = `certificado-${certificate.categoria_nome}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Certificado em processamento",
        description: "O PDF está sendo gerado. Tente novamente em alguns instantes.",
        variant: "default"
      });
    }
  };

  const handleShare = async (platform: 'linkedin' | 'facebook' | 'copy') => {
    if (!certificate) return;

    const shareUrl = `${window.location.origin}/certificado/${certificate.id}`;
    const shareText = `🎉 ${certificate.usuario?.nome} concluiu o curso ${certificate.categoria_nome} com ${certificate.nota}% de aproveitamento!`;
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando certificado...</p>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Certificado não encontrado</h2>
          <p className="text-gray-500 mb-4">O certificado solicitado não existe ou foi removido.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar ao Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            
            <Button
              onClick={() => handleShare('copy')}
              variant="outline"
            >
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </Button>
          </div>
        </div>

        {/* Certificado */}
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-0">
            {/* Template do Certificado */}
            <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 p-12">
              {/* Borda decorativa */}
              <div className="absolute inset-4 border-2 border-blue-200 rounded-lg"></div>
              
              {/* Cabeçalho */}
              <div className="text-center mb-8 relative z-10">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <img 
                    src={branding.logo_url} 
                    alt="ERA Learn Logo" 
                    className="h-16 w-auto object-contain"
                  />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Certificado de Conclusão
                </h2>
                <p className="text-gray-600">
                  Este documento certifica que o participante concluiu com êxito o curso
                </p>
              </div>

              {/* Conteúdo principal */}
              <div className="text-center mb-8 relative z-10">
                <h3 className="text-4xl font-bold text-blue-700 mb-6">
                  {certificate.categoria_nome}
                </h3>
                
                <div className="text-xl text-gray-700 mb-8">
                  <p className="mb-2">
                    <span className="font-semibold">Concedido a:</span>
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mb-4">
                    {certificate.usuario?.nome}
                  </p>
                  
                  <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{certificate.usuario?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(certificate.data_conclusao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nota */}
                <div className="inline-block bg-green-100 text-green-800 px-6 py-3 rounded-full mb-8">
                  <Badge variant="default" className="bg-green-500 text-white text-lg px-4 py-2">
                    Nota: {certificate.nota}%
                  </Badge>
                </div>

                {/* Descrição */}
                {certificate.curso?.descricao && (
                  <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                    {certificate.curso.descricao}
                  </p>
                )}

                {/* Assinatura */}
                <div className="flex justify-between items-end max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                    <p className="text-sm text-gray-600">Assinatura Digital</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-32 h-0.5 bg-gray-400 mb-2"></div>
                    <p className="text-sm text-gray-600">Data de Emissão</p>
                    <p className="text-sm font-medium">
                      {new Date().toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="absolute bottom-8 right-8">
                <div className="bg-white p-3 rounded-lg shadow-md">
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded">
                    <QrCode className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">QR Code</p>
                </div>
              </div>

              {/* Número do certificado */}
              <div className="absolute bottom-8 left-8">
                <p className="text-xs text-gray-500">
                  Certificado ID: {certificate.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botões de compartilhamento */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartilhar Certificado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => handleShare('linkedin')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Linkedin className="w-4 h-4 text-blue-600" />
                LinkedIn
              </Button>
              
              <Button
                onClick={() => handleShare('facebook')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>
              
              <Button
                onClick={() => handleShare('copy')}
                variant="outline"
                className="flex items-center gap-2"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-600" />
                )}
                {copied ? 'Copiado!' : 'Copiar Link'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Certificado; 
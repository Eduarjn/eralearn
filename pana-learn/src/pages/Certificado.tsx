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

  const handleDownload = async () => {
    // 1. Validação inicial com logs para debug
    console.log("Botão de download clicado. Dados:", certificate);

    if (!certificate?.certificado_url) {
      console.warn("URL vazia.");
      toast({
        title: "Certificado indisponível",
        description: "O arquivo ainda não foi gerado pelo sistema.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Iniciando download...",
        description: "Aguarde enquanto preparamos o arquivo.",
      });

      // 2. Busca o arquivo via código (Fetch)
      // Isso "engana" o navegador para baixar o arquivo ao invés de só abrir
      const response = await fetch(certificate.certificado_url);
      
      if (!response.ok) throw new Error('Falha na requisição do arquivo');
      
      const blob = await response.blob(); // Transforma em objeto binário
      const url = window.URL.createObjectURL(blob); // Cria URL temporária na memória

      // 3. Cria o link de download forçado
      const link = document.createElement('a');
      link.href = url;
      
      // Define um nome de arquivo limpo e profissional
      const nomeLimpo = certificate.categoria_nome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      link.download = `certificado_era_learn_${nomeLimpo}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      // 4. Limpeza
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Libera memória
      console.log("Download concluído com sucesso.");

    } catch (error) {
      console.error("Erro no download direto:", error);
      
      // 5. FALLBACK (Plano B)
      // Se o método acima falhar (ex: bloqueio de CORS), abre em nova aba
      console.log("Tentando método alternativo (Nova Aba)...");
      window.open(certificate.certificado_url, '_blank');
      
      toast({
        title: "Download alternativo",
        description: "Não foi possível baixar direto. Abrimos o PDF em uma nova aba para você salvar.",
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
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
          <Button onClick={() => navigate('/dashboard')}>Voltar ao Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 font-sans">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header de Navegação */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="flex items-center gap-2 hover:bg-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="bg-black text-white hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>

        {/* CONTAINER DO CERTIFICADO */}
        <Card className="bg-white shadow-2xl border-0 overflow-hidden relative print:shadow-none print:w-full">
          <CardContent className="p-0">
            
            {/* Template do Certificado */}
            <div className="relative bg-white p-1 md:p-12 min-h-[600px] flex flex-col justify-between">
              
              {/* 1. Marca D'água (Background Logo) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <img 
                  src={branding.logo_url} 
                  alt="" 
                  className="w-[550px] opacity-[0.03] grayscale-0 transform scale-150"
                />
              </div>

              {/* 2. Borda Decorativa Interna */}
              <div className="absolute inset-4 md:inset-6 border-[3px] border-double border-gray-300 pointer-events-none rounded-sm"></div>
              
              {/* Conteúdo Centralizado */}
              <div className="relative z-10 flex flex-col items-center text-center space-y-8 py-8">
                
                {/* Cabeçalho da Marca */}
                <div className="mb-6">
                  <img 
                    src={branding.logo_url} 
                    alt="ERA Learn" 
                    className="h-20 w-auto object-contain mx-auto"
                  />
                </div>

                {/* Título Oficial */}
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-wide uppercase mb-2">
                    Certificado de Conclusão
                  </h1>
                  <div className="w-24 h-1 bg-lime-400 mx-auto rounded-full"></div>
                </div>

                {/* Texto Introdutório */}
                <p className="text-gray-500 text-lg font-serif italic">
                  Certificamos para os devidos fins que
                </p>

                {/* Nome do Aluno */}
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 capitalize tracking-tight">
                  {certificate.usuario?.nome}
                </h2>

                {/* Detalhes do Curso */}
                <div className="space-y-2">
                  <p className="text-gray-500 text-lg">concluiu com êxito o curso de formação profissional em</p>
                  <h3 className="text-3xl font-bold text-lime-600 uppercase tracking-wider">
                    {certificate.categoria_nome}
                  </h3>
                </div>

                {/* Badges e Infos Extras */}
                <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                  <Badge variant="outline" className="px-4 py-1 text-sm border-gray-300 bg-gray-50 text-gray-700">
                    Carga Horária: 1h
                  </Badge>
                  <Badge className="px-4 py-1 text-sm bg-lime-400 text-black hover:bg-lime-500 border-none font-bold">
                    Aproveitamento: {certificate.nota}%
                  </Badge>
                </div>

                {/* Descrição Curta (Opcional) */}
                {certificate.curso?.descricao && (
                  <p className="text-gray-500 max-w-2xl text-sm leading-relaxed mt-4">
                    {certificate.curso.descricao.slice(0, 150)}...
                  </p>
                )}

              </div>

              {/* Rodapé do Certificado */}
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-8 items-end">
                
                {/* Data e Local */}
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Data de Emissão</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">São Paulo, Brasil</p>
                </div>

                {/* Assinatura (Centro) */}
                <div className="text-center">
                  {/* Espaço para assinatura imagem se houver, ou linha */}
                  <p className="font-bold text-gray-800">Sabrina Coghe </p>
                  <div className="w-full h-px bg-gray-300 mb-4"></div>
                  <p className="font-bold text-gray-800">Gerente de operações</p>
                  <p className="text-xs text-gray-500">ERA</p>
                </div>

                {/* Código de Validação */}
                <div className="text-center md:text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Validação</p>
                  <p className="text-xs font-mono text-gray-500 break-all">
                    ID: {certificate.id.slice(0, 8)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Verifique a autenticidade deste documento no portal.
                  </p>
                </div>

              </div>

              {/* QR Code (COMENTADO conforme solicitado)
              <div className="absolute bottom-8 right-8 print:block">
                <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                   <QrCode className="w-12 h-12 text-gray-800" />
                </div>
              </div>
              */}

            </div>
          </CardContent>
        </Card>

        {/* Footer de Compartilhamento Externo */}
        <Card className="mt-8 bg-gray-50 border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-center gap-2 text-base text-gray-600">
              <Share2 className="w-4 h-4" />
              Orgulhoso da sua conquista? Compartilhe!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => handleShare('linkedin')}
                variant="outline"
                className="flex items-center gap-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
              >
                <Linkedin className="w-4 h-4 text-blue-600" />
                Compartilhar no LinkedIn
              </Button>
              
              <Button
                onClick={() => handleShare('copy')}
                variant="outline"
                className="flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                {copied ? 'Link Copiado' : 'Copiar Link'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Certificado;
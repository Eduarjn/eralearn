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
  Award,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateData {
  id: string;
  usuario_id: string;
  curso_id: string;
  categoria_nome: string;
  nota: number;
  data_conclusao: string;
  numero_certificado?: string;
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
  const { branding } = useBranding();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
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

  const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
    try {
      const res = await fetch(imageUrl, { mode: 'cors' });
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      console.warn("Falha ao converter imagem para base64 (CORS restritivo?), tentando direto...", e);
      return null;
    }
  };

  const handleDownload = async () => {
    if (!certificate) return;
    setGeneratingPdf(true);

    try {
      // 1. TENTA O DOWNLOAD DIRETO SE TIVER URL SALVA NO BANCO
      if (certificate.certificado_url) {
        console.log("Tentando baixar via URL existente:", certificate.certificado_url);
        try {
          const response = await fetch(certificate.certificado_url);
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `certificado-${certificate.categoria_nome}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast({ title: "Download concluído!" });
            setGeneratingPdf(false);
            return;
          }
        } catch (e) {
          console.warn("Falha no download direto, indo para geração manual:", e);
        }
      }

      // 2. SE NÃO DEU CERTO, GERA O PDF NA HORA (MANUAL)
      toast({
        title: "Gerando Certificado",
        description: "Criando arquivo de alta qualidade...",
      });

      let logoSrc = branding.logo_url;
      if (logoSrc) {
        const base64 = await getBase64ImageFromUrl(logoSrc);
        if (base64) logoSrc = base64;
      }

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      
      const formattedDate = new Date(certificate.data_conclusao).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
      const shortId = certificate.id.slice(0, 8).toUpperCase();
      
      // --- HTML AJUSTADO PARA O PDF ---
      tempDiv.innerHTML = `
        <div style="font-family: 'Arial', sans-serif; width: 1122px; height: 794px; padding: 40px; background: white; display: flex; justify-content: center; align-items: center; box-sizing: border-box;">
          <div style="width: 100%; height: 100%; border: 10px double #333; padding: 40px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative;">
            
            ${logoSrc ? `<img src="${logoSrc}" style="height: 90px; margin-bottom: 20px; object-fit: contain;" />` : '<h1 style="font-size: 40px;">ERA LEARN</h1>'}
            
            <h1 style="font-size: 48px; color: #111; text-transform: uppercase; margin: 10px 0; letter-spacing: 2px;">Certificado de Conclusão</h1>
            
            <p style="font-size: 24px; color: #666; margin: 20px 0; font-style: italic;">Certificamos para os devidos fins que</p>
            
            <h2 style="font-size: 50px; font-weight: bold; color: #000; margin: 20px 0; border-bottom: 2px solid #ddd; padding-bottom: 10px; min-width: 60%; text-transform: capitalize;">
              ${certificate.usuario?.nome}
            </h2>
            
            <p style="font-size: 24px; color: #444;">concluiu com êxito o curso de formação profissional em</p>
            
            <h3 style="font-size: 42px; font-weight: bold; color: #2563eb; margin: 20px 0; text-transform: uppercase;">
              ${certificate.categoria_nome}
            </h3>
            
            <div style="margin: 30px 0; display: flex; gap: 20px; justify-content: center;">
              <span style="background: #f3f4f6; padding: 10px 25px; border-radius: 50px; border: 1px solid #d1d5db; font-size: 18px; font-weight: bold;">
                Carga Horária: 1h
              </span>
              <span style="background: #a3e635; color: black; padding: 10px 25px; border-radius: 50px; font-size: 18px; font-weight: bold;">
                Aproveitamento: ${certificate.nota}%
              </span>
            </div>

            <div style="margin-top: auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr 1fr; align-items: flex-end; text-align: center; padding-bottom: 30px;">
              
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #999; text-transform: uppercase;">Data de Emissão</div>
                <div style="font-size: 16px; font-weight: bold; color: #333; margin-top: 5px;">${formattedDate}</div>
                <div style="font-size: 12px; color: #666;">São Paulo, Brasil</div>
              </div>
              
              <div>
                <div style="font-weight: bold; font-size: 22px; color: #000; font-family: cursive; margin-bottom: 15px;">Sabrina Coghe</div>
                <div style="width: 250px; height: 1px; background: #333; margin: 0 auto 10px auto;"></div>
                <div style="font-size: 14px; font-weight: bold; color: #333;">Gerente de Operações</div>
                <div style="font-size: 12px; color: #666;">ERA</div>
              </div>
              
              <div style="text-align: right;">
                <div style="font-size: 12px; color: #999; text-transform: uppercase;">Validação</div>
                <div style="font-family: monospace; font-size: 14px; color: #333; margin-top: 5px;">ID: ${shortId}</div>
                <div style="font-size: 10px; color: #666;">Verifique a autenticidade<br>no portal do aluno.</div>
              </div>

            </div>

          </div>
        </div>
      `;
      document.body.appendChild(tempDiv);

      const images = Array.from(tempDiv.getElementsByTagName('img'));
      await Promise.all(images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });
      }));

      const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(tempDiv);

      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      
      const nomeLimpo = certificate.categoria_nome.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`certificado_era_${nomeLimpo}.pdf`);
      
      toast({ title: "Sucesso!", description: "Download do PDF iniciado." });

    } catch (error) {
      console.error('Erro PDF:', error);
      toast({ 
        title: "Erro ao gerar PDF", 
        description: "Tente novamente ou contate o suporte.", 
        variant: "destructive" 
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShare = async (platform: 'linkedin' | 'facebook' | 'copy') => {
    if (!certificate) return;

    const shareUrl = `${window.location.origin}/certificado/${certificate.id}`;
    
    try {
      switch (platform) {
        case 'linkedin': {
          const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          window.open(linkedinUrl, '_blank');
          break;
        }
        case 'facebook': {
          const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          window.open(facebookUrl, '_blank');
          break;
        }
        case 'copy':
          await navigator.clipboard.writeText(shareUrl);
          setCopied(true);
          toast({
            title: "Link copiado!",
            description: "O link foi copiado para a área de transferência.",
            variant: "default"
          });
          setTimeout(() => setCopied(false), 2000);
          break;
      }
    } catch (error) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-gray-900 mx-auto mb-4" />
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
              disabled={generatingPdf}
              className="bg-black text-white hover:bg-gray-800"
            >
              {generatingPdf ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {generatingPdf ? "Gerando PDF..." : "Baixar PDF"}
            </Button>
          </div>
        </div>

        <Card className="bg-white shadow-2xl border-0 overflow-hidden relative">
          <CardContent className="p-0">
            <div className="relative bg-white p-1 md:p-12 min-h-[600px] flex flex-col justify-between">
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <img 
                  src={branding.logo_url} 
                  alt="" 
                  className="w-[550px] opacity-[0.03] grayscale-0 transform scale-150"
                />
              </div>

              <div className="absolute inset-4 md:inset-6 border-[3px] border-double border-gray-300 pointer-events-none rounded-sm"></div>
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-8 py-8">
                
                <div className="mb-6">
                  <img 
                    src={branding.logo_url} 
                    alt="ERA Learn" 
                    className="h-20 w-auto object-contain mx-auto"
                  />
                </div>

                <div>
                  <h1 className="text-3xl md:text-4xl font-serif text-gray-900 tracking-wide uppercase mb-2">
                    Certificado de Conclusão
                  </h1>
                  <div className="w-24 h-1 bg-lime-400 mx-auto rounded-full"></div>
                </div>

                <p className="text-gray-500 text-lg font-serif italic">
                  Certificamos para os devidos fins que
                </p>

                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 capitalize tracking-tight">
                  {certificate.usuario?.nome}
                </h2>

                <div className="space-y-2">
                  <p className="text-gray-500 text-lg">concluiu com êxito o curso de formação profissional em</p>
                  <h3 className="text-3xl font-bold text-lime-600 uppercase tracking-wider">
                    {certificate.categoria_nome}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
                  <Badge variant="outline" className="px-4 py-1 text-sm border-gray-300 bg-gray-50 text-gray-700">
                    Carga Horária: 1h
                  </Badge>
                  <Badge className="px-4 py-1 text-sm bg-lime-400 text-black hover:bg-lime-500 border-none font-bold">
                    Aproveitamento: {certificate.nota}%
                  </Badge>
                </div>

                {certificate.curso?.descricao && (
                  <p className="text-gray-500 max-w-2xl text-sm leading-relaxed mt-4">
                    {certificate.curso.descricao.slice(0, 150)}...
                  </p>
                )}
              </div>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 px-8 items-end">
                <div className="text-center md:text-left">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Data de Emissão</p>
                  <p className="text-sm font-medium text-gray-700">
                    {new Date(certificate.data_conclusao).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">São Paulo, Brasil</p>
                </div>

                <div className="text-center">
                  <p className="font-bold text-gray-800">Sabrina Coghe</p>
                  <div className="w-full h-px bg-gray-300 mb-4"></div>
                  <p className="font-bold text-gray-800">Gerente de operações</p>
                  <p className="text-xs text-gray-500">ERA</p>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Validação</p>
                  <p className="text-xs font-mono text-gray-500 break-all">
                    ID: {certificate.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Verifique a autenticidade deste documento no portal.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
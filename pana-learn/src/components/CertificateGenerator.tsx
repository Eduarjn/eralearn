import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, QrCode, Award, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CertificatePDFGenerator } from './CertificatePDFGenerator';

interface CertificateData {
  id: string;
  curso_nome: string;
  categoria: string;
  numero_certificado: string;
  data_emissao: string;
  carga_horaria: number;
  nota: number;
  status: string;
  certificado_url?: string;
  qr_code_url?: string;
}

interface CertificateGeneratorProps {
  userId: string;
  courseId: string;
  courseName: string;
  onCertificateGenerated?: (certificate: CertificateData) => void;
}

export function CertificateGenerator({
  userId,
  courseId,
  courseName,
  onCertificateGenerated
}: CertificateGeneratorProps) {
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<'classic' | 'minimal' | 'tech'>('classic');
  const { toast } = useToast();

  // Verificar se já existe certificado para este curso
  useEffect(() => {
    checkExistingCertificate();
  }, [userId, courseId]);

  const checkExistingCertificate = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .rpc('buscar_certificados_usuario_dinamico', {
          p_usuario_id: userId
        });

      if (error) {
        console.error('Erro ao buscar certificados:', error);
        return;
      }

      // Encontrar certificado para este curso
      const courseCertificate = data?.find((cert: CertificateData) => 
        cert.curso_nome === courseName
      );

      if (courseCertificate) {
        setCertificate(courseCertificate);
      }
    } catch (error) {
      console.error('Erro ao verificar certificado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCertificate = async () => {
    try {
      setIsGenerating(true);

      // Primeiro, buscar o quiz_id do curso
      const { data: mappingData } = await supabase
        .from('curso_quiz_mapping')
        .select('quiz_id')
        .eq('curso_id', courseId)
        .single();

      if (!mappingData?.quiz_id) {
        toast({
          title: "Erro",
          description: "Quiz não encontrado para este curso",
          variant: "destructive"
        });
        return;
      }

      // Gerar certificado usando a função dinâmica
      const { data: certId, error } = await supabase
        .rpc('gerar_certificado_dinamico', {
          p_usuario_id: userId,
          p_curso_id: courseId,
          p_quiz_id: mappingData.quiz_id,
          p_nota: 100 // Nota padrão, pode ser ajustada
        });

      if (error) {
        console.error('Erro ao gerar certificado:', error);
        toast({
          title: "Erro",
          description: "Erro ao gerar certificado. Tente novamente.",
          variant: "destructive"
        });
        return;
      }

      // Buscar dados do certificado gerado
      const { data: certData } = await supabase
        .rpc('buscar_certificados_usuario_dinamico', {
          p_usuario_id: userId
        });

      const newCertificate = certData?.find((cert: CertificateData) => 
        cert.id === certId
      );

      if (newCertificate) {
        setCertificate(newCertificate);
        onCertificateGenerated?.(newCertificate);
        
        toast({
          title: "Parabéns!",
          description: "Certificado gerado com sucesso!",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Erro ao gerar certificado:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar certificado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = () => {
    if (!certificate) return;
    
    toast({
      title: "Gerando PDF",
      description: "Preparando certificado para download...",
      variant: "default"
    });
  };

  const shareCertificate = () => {
    if (!certificate) return;
    
    // Compartilhar número do certificado
    const shareText = `Certificado: ${certificate.numero_certificado}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Meu Certificado',
        text: shareText,
        url: window.location.href
      });
    } else {
      // Fallback: copiar para clipboard
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copiado!",
        description: "Número do certificado copiado para a área de transferência",
        variant: "default"
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Verificando certificado...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (certificate) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Award className="h-6 w-6" />
            Certificado Conquistado!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Curso:</span>
              <p className="text-gray-700">{certificate.curso_nome}</p>
            </div>
            <div>
              <span className="font-semibold">Carga Horária:</span>
              <p className="text-gray-700">{certificate.carga_horaria}h</p>
            </div>
            <div>
              <span className="font-semibold">Número:</span>
              <p className="text-gray-700 font-mono text-xs">{certificate.numero_certificado}</p>
            </div>
            <div>
              <span className="font-semibold">Data:</span>
              <p className="text-gray-700">
                {new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Nota: {certificate.nota}%
            </Badge>
            <Badge variant="outline" className="border-green-300 text-green-700">
              {certificate.status}
            </Badge>
          </div>
          
                     <div className="space-y-3 pt-2">
             <div className="flex gap-2">
               <Button
                 onClick={downloadCertificate}
                 variant="outline"
                 size="sm"
                 className="flex-1"
               >
                 <Download className="h-4 w-4 mr-2" />
                 Baixar
               </Button>
               <Button
                 onClick={shareCertificate}
                 variant="outline"
                 size="sm"
                 className="flex-1"
               >
                 <Share2 className="h-4 w-4 mr-2" />
                 Compartilhar
               </Button>
             </div>
             
             <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700">Tema do Certificado:</label>
               <div className="flex gap-2">
                 <Button
                   variant={selectedTheme === 'classic' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setSelectedTheme('classic')}
                   className="flex-1"
                 >
                   Classic
                 </Button>
                 <Button
                   variant={selectedTheme === 'minimal' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setSelectedTheme('minimal')}
                   className="flex-1"
                 >
                   Minimal
                 </Button>
                 <Button
                   variant={selectedTheme === 'tech' ? 'default' : 'outline'}
                   size="sm"
                   onClick={() => setSelectedTheme('tech')}
                   className="flex-1"
                 >
                   Tech
                 </Button>
               </div>
             </div>
             
             <CertificatePDFGenerator
               certificate={{
                 ...certificate,
                 usuario_nome: certificate.curso_nome // Temporário, será substituído pelo nome real
               }}
               theme={selectedTheme}
               onGenerated={(pdfBlob) => {
                 toast({
                   title: "PDF Gerado!",
                   description: "Certificado baixado com sucesso",
                   variant: "default"
                 });
               }}
             />
           </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Gerar Certificado
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Parabéns por concluir o curso! Clique no botão abaixo para gerar seu certificado.
        </p>
        
        <Button
          onClick={generateCertificate}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Gerando...
            </>
          ) : (
            <>
              <Award className="h-4 w-4 mr-2" />
              Gerar Certificado
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

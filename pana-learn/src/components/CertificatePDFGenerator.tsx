import React from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface CertificateData {
  id: string;
  curso_nome: string;
  categoria: string;
  numero_certificado: string;
  data_emissao: string;
  carga_horaria: number;
  nota: number;
  status: string;
  usuario_nome: string;
}

interface CertificatePDFGeneratorProps {
  certificate: CertificateData;
  theme?: 'classic' | 'minimal' | 'tech';
  onGenerated?: (pdfBlob: Blob) => void;
}

export function CertificatePDFGenerator({
  certificate,
  theme = 'classic',
  onGenerated
}: CertificatePDFGeneratorProps) {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const generateShortId = (fullId: string) => {
    return fullId.substring(0, 8).toUpperCase();
  };

  const generateCertificateHTML = () => {
    const shortId = generateShortId(certificate.numero_certificado);
    const formattedDate = formatDate(certificate.data_emissao);
    
    // Cores extraídas do Logotipo (Brand Colors)
    // Primary: #333 (Cinza Escuro/Preto Suave)
    // Accent:  #00aa00 (Verde ajustado para impressão - o #00ff00 puro pode ficar ilegível no branco)
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificado - ${certificate.curso_nome}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;700;900&display=swap');

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Lato', 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0f0f0;
            width: 297mm;
            height: 210mm;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #333;
          }
          
          /* Container da Borda Externa (Cor do Fundo do Logo) */
          .certificate-border {
            width: 280mm;
            height: 195mm;
            border: 3px solid #333333; /* Cor escura do logo */
            background: white;
            position: relative;
            box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          }

          /* Container da Borda Interna (Cor do Texto do Logo) */
          .certificate-inner-border {
            width: 100%;
            height: 100%;
            border: 6px solid #00aa00; /* Verde da marca */
            padding: 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
            /* Textura sutil de fundo */
            background-image: radial-gradient(#333 0.5px, transparent 0.5px);
            background-size: 30px 30px;
            background-color: #ffffff;
          }
          
          /* LOGOTIPO ORIGINAL MANTIDO */
          .era-logo {
            background: #333;
            color: #00ff00;
            padding: 10px 25px;
            font-weight: 900;
            font-size: 28px;
            letter-spacing: 3px;
            margin-bottom: 20px;
            border: 2px solid #00aa00;
            box-shadow: 0 4px 0 rgba(0,0,0,0.2);
            text-transform: uppercase;
            z-index: 20;
          }
          
          /* Marca d'água de fundo */
          .watermark-logo {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.03;
            font-size: 200px;
            font-weight: bold;
            color: #333;
            z-index: 0;
            pointer-events: none;
            font-family: 'Playfair Display', serif;
          }
          
          .content-layer {
            z-index: 10;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          /* Cabeçalho */
          .header {
            margin-bottom: 10px;
          }
          
          .title {
            font-family: 'Playfair Display', serif;
            font-size: 56px;
            color: #333;
            margin-bottom: 5px;
            letter-spacing: -0.5px;
            text-transform: uppercase;
          }
          
          .subtitle {
            font-size: 18px;
            color: #555;
            font-style: italic;
            margin-top: 0;
          }
          
          /* Seção do Aluno */
          .recipient-section {
            margin: 15px 0;
          }
          
          .recipient-name {
            font-family: 'Playfair Display', serif;
            font-size: 48px;
            color: #333; 
            border-bottom: 2px solid #00aa00; /* Linha verde */
            display: inline-block;
            padding-bottom: 10px;
            margin-bottom: 15px;
            min-width: 500px;
          }
          
          .action-text {
            font-size: 18px;
            margin-bottom: 10px;
            color: #444;
          }
          
          .course-title {
            font-size: 36px;
            font-weight: 900;
            color: #333;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          /* Grid de Detalhes Técnicos */
          .details-grid {
            display: flex;
            justify-content: center;
            gap: 60px;
            margin-top: 20px;
            color: #444;
            font-size: 14px;
            background: #f9f9f9;
            padding: 15px 30px;
            border-radius: 50px;
            border: 1px solid #ddd;
            display: inline-flex;
          }
          
          .detail-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          
          .detail-item strong {
            color: #00aa00; /* Verde nos títulos dos detalhes */
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            font-weight: 900;
          }
          
          .detail-item span {
            font-size: 16px;
            font-weight: 700;
            color: #333;
          }
          
          /* Assinaturas e Rodapé */
          .footer-section {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 0 20px;
            margin-bottom: 10px;
          }
          
          .signature-block {
            text-align: center;
            width: 250px;
          }
          
          .signature-line {
            border-top: 1px solid #333;
            margin-bottom: 8px;
          }
          
          .signer-name {
            font-weight: bold;
            font-size: 16px;
            color: #333;
          }
          
          .signer-role {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          /* Selo Personalizado com Cores da Marca */
          .seal-container {
            width: 110px;
            height: 110px;
            background: #333; /* Fundo Preto do Selo */
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #00ff00; /* Texto Verde Neon */
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            position: relative;
            bottom: 10px;
            border: 4px double #00aa00;
          }
          
          .seal-inner {
            width: 95px;
            height: 95px;
            border: 1px dashed rgba(0, 255, 0, 0.5);
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            text-align: center;
            line-height: 1.4;
            font-weight: bold;
            text-transform: uppercase;
          }
          
          .seal-star {
            font-size: 24px;
            margin-bottom: 2px;
            color: #00ff00;
          }
          
          /* Link de Validação Discreto */
          .validation-link {
            position: absolute;
            bottom: 10px;
            width: 100%;
            text-align: center;
            font-size: 10px;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="certificate-border">
          <div class="certificate-inner-border">
            
            <div class="watermark-logo">ERA</div>
            
            <div class="content-layer">
              <div style="display: flex; justify-content: center;">
                <div class="era-logo">ERA</div>
              </div>

              <div class="header">
                <div class="title">Certificado de Conclusão</div>
                <div class="subtitle">Certificamos para os devidos fins que</div>
              </div>
              
              <div class="recipient-section">
                <div class="recipient-name">${certificate.usuario_nome}</div>
                <div class="action-text">concluiu com êxito o curso profissionalizante</div>
                <div class="course-title">${certificate.curso_nome}</div>
                
                <div class="details-grid">
                  <div class="detail-item">
                    <strong>Data de Emissão</strong>
                    <span>${formattedDate}</span>
                  </div>
                  <div class="detail-item">
                    <strong>Carga Horária</strong>
                    <span>${certificate.carga_horaria} Horas</span>
                  </div>
                  <div class="detail-item">
                    <strong>Código de Validação</strong>
                    <span>${shortId}</span>
                  </div>
                </div>
              </div>
              
              <div class="footer-section">
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signer-name">Diretoria Acadêmica</div>
                  <div class="signer-role">ERA Learn Education</div>
                </div>
                
                <div class="seal-container">
                    <div class="seal-inner">
                        <div class="seal-star">★</div>
                        Certificado<br>Verificado<br>ERA
                    </div>
                </div>
                
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signer-name">Coordenação de Ensino</div>
                  <div class="signer-role">Responsável Técnico</div>
                </div>
              </div>
              
              <div class="validation-link">
                A autenticidade deste documento pode ser verificada em https://verify.era.com
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const generatePDF = async () => {
    try {
      // Criar elemento temporário com o HTML do certificado
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = generateCertificateHTML();
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      document.body.appendChild(tempDiv);

      // Capturar o HTML como canvas
      const canvas = await html2canvas(tempDiv.firstElementChild as HTMLElement, {
        width: 297, // A4 Landscape mm
        height: 210, // A4 Landscape mm
        scale: 2, // Melhor qualidade
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#f0f0f0' 
      });

      // Remover elemento temporário
      document.body.removeChild(tempDiv);

      // Criar PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      
      // Adicionar imagem do canvas ao PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);

      // Adicionar metadados
      pdf.setProperties({
        title: `Certificado - ${certificate.curso_nome}`,
        subject: 'Certificado de Conclusão de Curso',
        author: 'ERA Learn',
        creator: 'ERA Learn Certificate System',
        keywords: `certificado, ${certificate.curso_nome}, ${certificate.usuario_nome}`,
        producer: 'ERA Learn'
      });

      // Gerar blob para download
      const pdfBlob = pdf.output('blob');
      
      // Chamar callback se fornecido
      onGenerated?.(pdfBlob);

      // Download automático
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-${certificate.numero_certificado}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw error;
    }
  };

  return (
    <div className="certificate-pdf-generator">
      <button
        onClick={generatePDF}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Gerar PDF do Certificado
      </button>
    </div>
  );
}
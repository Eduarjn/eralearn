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
    
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificado - ${certificate.curso_nome}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Arial', sans-serif;
            background: white;
            width: 297mm;
            height: 210mm;
            margin: 0;
            padding: 20mm;
            position: relative;
            overflow: hidden;
          }
          
          .certificate-container {
            width: 100%;
            height: 100%;
            border: 2px solid #333;
            position: relative;
            background: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
          }
          
          .era-logo {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: #00ff00;
            padding: 10px 20px;
            font-weight: bold;
            font-size: 24px;
            letter-spacing: 2px;
          }
          
          .title {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          
          .subtitle {
            font-size: 16px;
            color: #666;
            margin-bottom: 40px;
          }
          
          .recipient-name {
            font-size: 28px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            max-width: 80%;
            word-wrap: break-word;
          }
          
          .course-info {
            font-size: 18px;
            color: #333;
            margin-bottom: 10px;
          }
          
          .course-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            max-width: 90%;
            word-wrap: break-word;
          }
          
          .completion-date {
            font-size: 16px;
            color: #666;
            margin-bottom: 40px;
          }
          
          .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 120px;
            color: rgba(0, 255, 0, 0.1);
            font-weight: bold;
            z-index: 1;
            pointer-events: none;
          }
          
          .content {
            position: relative;
            z-index: 2;
          }
          
          .signatures {
            position: absolute;
            bottom: 80px;
            left: 0;
            right: 0;
            display: flex;
            justify-content: space-between;
            padding: 0 40px;
          }
          
          .signature {
            text-align: center;
          }
          
          .signature-line {
            width: 200px;
            height: 2px;
            background: #333;
            margin-bottom: 10px;
          }
          
          .signature-name {
            font-size: 14px;
            font-weight: bold;
            color: #333;
          }
          
          .signature-title {
            font-size: 12px;
            color: #666;
          }
          
          .era-stamp {
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .stamp-circle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #333;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
          }
          
          .star {
            color: white;
            font-size: 20px;
          }
          
          .footer-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: #333;
            color: white;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
          }
          
          .footer-left {
            display: flex;
            gap: 30px;
          }
          
          .footer-right {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .qr-code {
            width: 30px;
            height: 30px;
            background: white;
            border: 1px solid #ccc;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 8px;
            color: #333;
          }
          
          /* Theme variations */
          body.theme-minimal {
            background: #f8f9fa;
          }
          
          body.theme-minimal .certificate-container {
            border: 1px solid #dee2e6;
            background: white;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          body.theme-tech {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          
          body.theme-tech .certificate-container {
            border: 3px solid #667eea;
            background: white;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
          }
          
          body.theme-tech .era-logo {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
        </style>
      </head>
      <body class="theme-${theme}">
        <div class="certificate-container">
          <div class="era-logo">ERA</div>
          
          <div class="watermark">ERA</div>
          
          <div class="content">
            <div class="title">Certificado de Conclusão</div>
            <div class="subtitle">É com grande satisfação que certificamos que</div>
            
            <div class="recipient-name">${certificate.usuario_nome}</div>
            
            <div class="course-info">concluiu com sucesso o curso</div>
            <div class="course-title">${certificate.curso_nome}</div>
            <div class="completion-date">em ${formattedDate}</div>
          </div>
          
          <div class="signatures">
            <div class="signature">
              <div class="signature-line"></div>
              <div class="signature-name">Dr. João Silva</div>
              <div class="signature-title">Instrutor</div>
            </div>
            
            <div class="signature era-stamp">
              <div class="stamp-circle">
                <div class="star">★</div>
              </div>
              <div class="signature-name">ERA</div>
              <div class="signature-title">ERA</div>
            </div>
          </div>
          
          <div class="footer-bar">
            <div class="footer-left">
              <span>ID: ${shortId}</span>
              <span>Carga Horária: ${certificate.carga_horaria} horas</span>
              <span>São Paulo, Brasil - ${formattedDate}</span>
            </div>
            <div class="footer-right">
              <span>Verificar: https://verify.era.com</span>
              <div class="qr-code">QR</div>
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
        width: 297,
        height: 210,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
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

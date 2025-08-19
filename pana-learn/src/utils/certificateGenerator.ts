// Utilitário para gerar PDFs de certificados
import type { Certificate } from '@/types/certificate';

export const generateCertificatePDF = async (certificate: Certificate): Promise<string> => {
  // Esta é uma implementação básica que gera um HTML que pode ser convertido para PDF
  // Em produção, você pode usar bibliotecas como jsPDF, html2pdf, ou fazer uma chamada para uma API
  
  const certificateHTML = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Certificado - ${certificate.curso_nome || certificate.cursos?.nome}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .certificate {
          background: white;
          padding: 60px;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
          max-width: 800px;
          width: 100%;
        }
        .header {
          border-bottom: 3px solid #667eea;
          padding-bottom: 30px;
          margin-bottom: 40px;
        }
        .title {
          font-size: 36px;
          color: #2c3e50;
          margin-bottom: 10px;
          font-weight: bold;
        }
        .subtitle {
          font-size: 18px;
          color: #7f8c8d;
          margin-bottom: 20px;
        }
        .course-name {
          font-size: 28px;
          color: #34495e;
          margin-bottom: 30px;
          font-weight: bold;
        }
        .student-info {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 15px;
          margin-bottom: 40px;
        }
        .student-name {
          font-size: 24px;
          color: #2c3e50;
          margin-bottom: 20px;
          font-weight: bold;
        }
        .certificate-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 40px;
        }
        .detail-item {
          text-align: left;
          padding: 15px;
          background: #ecf0f1;
          border-radius: 10px;
        }
        .detail-label {
          font-size: 14px;
          color: #7f8c8d;
          margin-bottom: 5px;
        }
        .detail-value {
          font-size: 16px;
          color: #2c3e50;
          font-weight: bold;
        }
        .footer {
          border-top: 2px solid #bdc3c7;
          padding-top: 30px;
          margin-top: 40px;
        }
        .footer-text {
          font-size: 14px;
          color: #7f8c8d;
          line-height: 1.6;
        }
        .certificate-number {
          font-size: 12px;
          color: #95a5a6;
          margin-top: 20px;
        }
        .grade {
          font-size: 48px;
          color: #27ae60;
          font-weight: bold;
          margin: 20px 0;
        }
        .status-badge {
          display: inline-block;
          padding: 8px 16px;
          background: #27ae60;
          color: white;
          border-radius: 20px;
          font-size: 14px;
          font-weight: bold;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="header">
          <div class="title">CERTIFICADO DE CONCLUSÃO</div>
          <div class="subtitle">ERA Learn - Plataforma de Ensino</div>
        </div>
        
        <div class="course-name">
          ${certificate.curso_nome || certificate.cursos?.nome || 'Curso'}
        </div>
        
        <div class="student-info">
          <div class="student-name">
            ${certificate.usuarios?.nome || 'Aluno'}
          </div>
          <div class="grade">
            ${certificate.nota_final || certificate.nota || 0}%
          </div>
          <div class="status-badge">
            ${certificate.status.toUpperCase()}
          </div>
        </div>
        
        <div class="certificate-details">
          <div class="detail-item">
            <div class="detail-label">Número do Certificado</div>
            <div class="detail-value">${certificate.numero_certificado}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Categoria</div>
            <div class="detail-value">${certificate.categoria}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Data de Emissão</div>
            <div class="detail-value">${new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">${certificate.status}</div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-text">
            Este certificado confirma que o aluno concluiu com sucesso o curso acima mencionado, 
            demonstrando proficiência no conteúdo ministrado e atingindo os objetivos de aprendizagem estabelecidos.
          </div>
          <div class="certificate-number">
            Certificado válido - ${certificate.numero_certificado}
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  // Criar um blob com o HTML
  const blob = new Blob([certificateHTML], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  return url;
};

export const downloadCertificateAsPDF = async (certificate: Certificate) => {
  try {
    const url = await generateCertificatePDF(certificate);
    
    // Criar link de download
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${certificate.numero_certificado}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpar URL após download
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return false;
  }
};

export const openCertificateInNewWindow = async (certificate: Certificate) => {
  try {
    const url = await generateCertificatePDF(certificate);
    
    // Abrir em nova janela
    const newWindow = window.open(url, '_blank', 'width=900,height=700');
    
    if (newWindow) {
      // Limpar URL após um tempo
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao abrir certificado:', error);
    return false;
  }
};

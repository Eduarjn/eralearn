import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { Certificate } from '@/types/certificate';

// Função auxiliar para gerar o HTML do certificado para captura
const getCertificateHTML = (certificate: Certificate) => {
  return `
    <div id="certificate-container" style="
      font-family: 'Arial', sans-serif;
      width: 297mm;
      height: 210mm;
      padding: 0;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
    ">
      <div style="
        background: white;
        width: 260mm;
        height: 170mm;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        text-align: center;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      ">
        <div style="border-bottom: 3px solid #667eea; padding-bottom: 30px; margin-bottom: 40px;">
          <h1 style="font-size: 36px; color: #2c3e50; margin: 0 0 10px 0; font-weight: bold;">CERTIFICADO DE CONCLUSÃO</h1>
          <p style="font-size: 18px; color: #7f8c8d; margin: 0;">ERA Learn - Plataforma de Ensino</p>
        </div>
        
        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <h2 style="font-size: 28px; color: #34495e; margin: 0 0 30px 0; font-weight: bold;">
            ${certificate.curso_nome || certificate.cursos?.nome || 'Curso'}
          </h2>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 15px; margin-bottom: 40px;">
            <h3 style="font-size: 24px; color: #2c3e50; margin: 0 0 20px 0; font-weight: bold;">
              ${certificate.usuarios?.nome || 'Aluno'}
            </h3>
            
            <div style="display: flex; justify-content: center; align-items: center; gap: 20px;">
              <span style="font-size: 48px; color: #27ae60; font-weight: bold;">
                ${certificate.nota_final || certificate.nota || 0}%
              </span>
              <span style="display: inline-block; padding: 8px 16px; background: #27ae60; color: white; border-radius: 20px; font-size: 14px; font-weight: bold;">
                ${certificate.status?.toUpperCase() || 'CONCLUÍDO'}
              </span>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; text-align: left;">
            <div style="padding: 15px; background: #ecf0f1; border-radius: 10px;">
              <div style="font-size: 14px; color: #7f8c8d; margin-bottom: 5px;">Número do Certificado</div>
              <div style="font-size: 16px; color: #2c3e50; font-weight: bold;">${certificate.numero_certificado}</div>
            </div>
            <div style="padding: 15px; background: #ecf0f1; border-radius: 10px;">
              <div style="font-size: 14px; color: #7f8c8d; margin-bottom: 5px;">Data de Emissão</div>
              <div style="font-size: 16px; color: #2c3e50; font-weight: bold;">${new Date(certificate.data_emissao).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
        </div>
        
        <div style="border-top: 2px solid #bdc3c7; padding-top: 30px; margin-top: 20px;">
          <p style="font-size: 14px; color: #7f8c8d; line-height: 1.6; margin: 0;">
            Este certificado confirma que o aluno concluiu com sucesso o curso acima mencionado.
          </p>
          <p style="font-size: 12px; color: #95a5a6; margin-top: 20px;">
            Certificado válido - ${certificate.numero_certificado}
          </p>
        </div>
      </div>
    </div>
  `;
};

// Função central que cria o PDF real (Blob)
const createPDFBlob = async (certificate: Certificate): Promise<Blob> => {
  // 1. Criar elemento temporário invisível no DOM
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = getCertificateHTML(certificate); // Injeta o HTML criado acima
  document.body.appendChild(container);

  try {
    // 2. Aguardar carregamento de imagens (se houver) e converter HTML em Canvas
    const element = container.querySelector('#certificate-container') as HTMLElement;
    
    const canvas = await html2canvas(element, {
      scale: 2, // Aumenta a qualidade (resolução)
      useCORS: true, // Permite carregar imagens externas se necessário
      logging: false,
      backgroundColor: '#ffffff'
    });

    // 3. Gerar PDF com jsPDF
    const pdf = new jsPDF({
      orientation: 'landscape', // Certificado em paisagem
      unit: 'mm',
      format: 'a4' // Tamanho A4
    });

    // Adiciona a imagem do canvas ao PDF (A4 Paisagem = 297x210 mm)
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);

    // Metadados do PDF (Propriedades do arquivo)
    pdf.setProperties({
      title: `Certificado - ${certificate.curso_nome || 'Curso'}`,
      subject: 'Certificado de Conclusão',
      author: 'ERA Learn',
      creator: 'Sistema ERA Learn'
    });

    return pdf.output('blob');

  } finally {
    // Limpeza: remove o elemento temporário do DOM
    document.body.removeChild(container);
  }
};

// Gera apenas a URL do PDF (útil para pré-visualização)
export const generateCertificatePDF = async (certificate: Certificate): Promise<string> => {
  try {
    const pdfBlob = await createPDFBlob(certificate);
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error('Erro ao gerar URL do PDF:', error);
    throw error;
  }
};

// Função de Download do PDF (Agora salva como .pdf real)
export const downloadCertificateAsPDF = async (certificate: Certificate) => {
  try {
    const pdfBlob = await createPDFBlob(certificate);
    const url = URL.createObjectURL(pdfBlob);
    
    // Criar link invisível para forçar o download
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${certificate.numero_certificado}.pdf`; // Extensão .pdf
    document.body.appendChild(link);
    link.click();
    
    // Limpar memória
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return false;
  }
};

// Abre o PDF em uma nova aba
export const openCertificateInNewWindow = async (certificate: Certificate) => {
  try {
    const pdfBlob = await createPDFBlob(certificate);
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    return true;
  } catch (error) {
    console.error('Erro ao abrir certificado:', error);
    return false;
  }
};
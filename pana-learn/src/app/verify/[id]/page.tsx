import { notFound } from 'next/navigation';
import fs from 'fs/promises';
import path from 'path';
import { getManifestPath, getFilesPath, type CertificateManifest } from '@/utils/certificateUtils';

interface VerifyPageProps {
  params: { id: string };
}

async function getCertificateManifest(id: string): Promise<CertificateManifest | null> {
  try {
    // Buscar manifesto em todas as pastas de data
    const dataDir = process.env.CERT_DATA_DIR || './data';
    const manifestsDir = path.join(dataDir, 'manifests');
    
    // Procurar em todas as subpastas YYYY/MM
    const years = await fs.readdir(manifestsDir).catch(() => []);
    
    for (const year of years) {
      if (year.match(/^\d{4}$/)) {
        const yearPath = path.join(manifestsDir, year);
        const months = await fs.readdir(yearPath).catch(() => []);
        
        for (const month of months) {
          if (month.match(/^\d{2}$/)) {
            const manifestPath = path.join(yearPath, month, `${id}.json`);
            
            try {
              const manifestContent = await fs.readFile(manifestPath, 'utf8');
              return JSON.parse(manifestContent);
            } catch {
              // Manifesto não encontrado nesta pasta, continuar procurando
              continue;
            }
          }
        }
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = params;
  
  if (!id) {
    notFound();
  }
  
  const manifest = await getCertificateManifest(id);
  
  if (!manifest) {
    notFound();
  }
  
  const { tokens, templateKey, createdAt, hashes, dimensions } = manifest;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificação de Certificado
          </h1>
          <p className="text-gray-600">
            ID do Certificado: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{id}</span>
          </p>
        </div>
        
        {/* Certificate Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Informações do Certificado
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <p className="mt-1 text-lg text-gray-900">{tokens.NOME_COMPLETO}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Curso</label>
              <p className="mt-1 text-lg text-gray-900">{tokens.CURSO}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Conclusão</label>
              <p className="mt-1 text-lg text-gray-900">{tokens.DATA_CONCLUSAO}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Carga Horária</label>
              <p className="mt-1 text-lg text-gray-900">{tokens.CARGA_HORARIA}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Template</label>
              <p className="mt-1 text-lg text-gray-900">{templateKey}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Data de Emissão</label>
              <p className="mt-1 text-lg text-gray-900">
                {new Date(createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
        
        {/* Certificate Preview */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Visualização do Certificado
          </h2>
          
          <div className="flex justify-center">
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <img
                src={`/api/certificates/${id}/file?format=svg`}
                alt="Certificado"
                className="max-w-full h-auto"
                style={{ maxWidth: '600px' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="text-center text-gray-500 py-8">
                        <p>Certificado não disponível para visualização</p>
                        <p class="text-sm mt-2">ID: ${id}</p>
                      </div>
                    `;
                  }
                }}
              />
            </div>
          </div>
          
          {/* Download Links */}
          <div className="mt-6 flex justify-center space-x-4">
            <a
              href={`/api/certificates/${id}/file?format=svg`}
              download={`certificado-${id}.svg`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Download SVG
            </a>
            <a
              href={`/api/certificates/${id}/file?format=png`}
              download={`certificado-${id}.png`}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Download PNG
            </a>
            <a
              href={`/api/certificates/${id}/file?format=pdf`}
              download={`certificado-${id}.pdf`}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Download PDF
            </a>
          </div>
        </div>
        
        {/* Technical Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Detalhes Técnicos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700">Dimensões</label>
              <p className="mt-1 text-gray-900">
                {dimensions.width} × {dimensions.height} {dimensions.unit}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Hash SVG Final</label>
              <p className="mt-1 text-gray-900 font-mono text-xs break-all">
                {hashes.finalSvgSha256}
              </p>
            </div>
            
            {hashes.pngSha256 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Hash PNG</label>
                <p className="mt-1 text-gray-900 font-mono text-xs break-all">
                  {hashes.pngSha256}
                </p>
              </div>
            )}
            
            {hashes.pdfSha256 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Hash PDF</label>
                <p className="mt-1 text-gray-900 font-mono text-xs break-all">
                  {hashes.pdfSha256}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>ERA Learn - Plataforma de Ensino Online</p>
          <p>Certificado verificado em {new Date().toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </div>
  );
}







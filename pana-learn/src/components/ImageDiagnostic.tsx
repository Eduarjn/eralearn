import React, { useState, useEffect } from 'react';

export function ImageDiagnostic() {
  const [imageStatus, setImageStatus] = useState<{[key: string]: 'loading' | 'success' | 'error'}>({});
  const [environment, setEnvironment] = useState<string>('');

  const images = [
    '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
    '/lovable-uploads/92441561-a944-48ee-930e-7e3b16318673.png',
    '/lovable-uploads/c9f9e3e7-a54d-4972-9dbb-127fbb0c2bc8.png',
    '/logotipoeralearn.png',
    '/logotipoeralearn.svg'
  ];

  useEffect(() => {
    // Detectar ambiente
    const isVercel = window.location.hostname.includes('vercel.app');
    const isLocalhost = window.location.hostname.includes('localhost');
    setEnvironment(isVercel ? 'Vercel' : isLocalhost ? 'Localhost' : 'Outro');

    // Testar imagens
    images.forEach(imagePath => {
      const img = new Image();
      img.onload = () => {
        console.log(`✅ Imagem carregada: ${imagePath}`);
        setImageStatus(prev => ({ ...prev, [imagePath]: 'success' }));
      };
      img.onerror = (e) => {
        console.error(`❌ Erro ao carregar imagem: ${imagePath}`, e);
        setImageStatus(prev => ({ ...prev, [imagePath]: 'error' }));
      };
      img.src = imagePath;
    });
  }, []);

  const getStatusColor = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🔍 Diagnóstico de Imagens</h2>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Informações do Ambiente:</h3>
        <div className="text-sm space-y-1">
          <div><strong>URL:</strong> {window.location.href}</div>
          <div><strong>Hostname:</strong> {window.location.hostname}</div>
          <div><strong>Protocol:</strong> {window.location.protocol}</div>
          <div><strong>Ambiente:</strong> <span className="font-bold text-blue-600">{environment}</span></div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-3">Status das Imagens:</h3>
        <div className="space-y-2">
          {images.map(imagePath => (
            <div key={imagePath} className="flex items-center justify-between p-3 border rounded">
              <div className="flex-1">
                <div className="font-mono text-sm text-gray-600">{imagePath}</div>
                <div className="text-xs text-gray-500">
                  {imageStatus[imagePath] === 'success' && 'Imagem carregada com sucesso'}
                  {imageStatus[imagePath] === 'error' && 'Erro ao carregar imagem'}
                  {imageStatus[imagePath] === 'loading' && 'Testando carregamento...'}
                </div>
              </div>
              <div className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(imageStatus[imagePath] || 'loading')}`}>
                {getStatusIcon(imageStatus[imagePath] || 'loading')} {imageStatus[imagePath] || 'loading'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">🔧 Soluções Recomendadas:</h3>
        <ul className="text-sm space-y-1">
          <li>• Verificar se o arquivo <code>vercel.json</code> está na raiz do projeto</li>
          <li>• Confirmar que as imagens estão na pasta <code>public/</code></li>
          <li>• Verificar configurações de cache no Vercel</li>
          <li>• Testar URLs diretas das imagens no navegador</li>
        </ul>
      </div>
    </div>
  );
}

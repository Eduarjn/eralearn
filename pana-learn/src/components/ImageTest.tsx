import React, { useState, useEffect } from 'react';

export function ImageTest() {
  const [imageStatus, setImageStatus] = useState<{[key: string]: 'loading' | 'success' | 'error'}>({});
  const [backgroundStatus, setBackgroundStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const images = [
    '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png',
    '/lovable-uploads/92441561-a944-48ee-930e-7e3b16318673.png',
    '/lovable-uploads/c9f9e3e7-a54d-4972-9dbb-127fbb0c2bc8.png',
    '/logotipoeralearn.png',
    '/logotipoeralearn.svg'
  ];

  useEffect(() => {
    // Testar imagem de fundo
    const testBackgroundImage = () => {
      const img = new Image();
      img.onload = () => setBackgroundStatus('success');
      img.onerror = () => setBackgroundStatus('error');
      img.src = '/lovable-uploads/aafcc16a-d43c-4f66-9fa4-70da46d38ccb.png';
    };

    testBackgroundImage();

    // Testar outras imagens
    images.forEach(imagePath => {
      const img = new Image();
      img.onload = () => setImageStatus(prev => ({ ...prev, [imagePath]: 'success' }));
      img.onerror = () => setImageStatus(prev => ({ ...prev, [imagePath]: 'error' }));
      img.src = imagePath;
    });
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Teste de Imagens</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Imagem de Fundo:</h3>
        <div className={`inline-block px-3 py-1 rounded text-sm ${
          backgroundStatus === 'success' ? 'bg-green-100 text-green-800' :
          backgroundStatus === 'error' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {backgroundStatus === 'success' ? '✅ Carregada' :
           backgroundStatus === 'error' ? '❌ Erro' : '⏳ Carregando...'}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Outras Imagens:</h3>
        <div className="space-y-2">
          {images.map(imagePath => (
            <div key={imagePath} className="flex items-center gap-2">
              <span className="text-sm font-mono">{imagePath}</span>
              <div className={`inline-block px-2 py-1 rounded text-xs ${
                imageStatus[imagePath] === 'success' ? 'bg-green-100 text-green-800' :
                imageStatus[imagePath] === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {imageStatus[imagePath] === 'success' ? '✅' :
                 imageStatus[imagePath] === 'error' ? '❌' : '⏳'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Informações do Ambiente:</h3>
        <div className="text-sm space-y-1">
          <div>URL: {window.location.href}</div>
          <div>Hostname: {window.location.hostname}</div>
          <div>Protocol: {window.location.protocol}</div>
        </div>
      </div>
    </div>
  );
}

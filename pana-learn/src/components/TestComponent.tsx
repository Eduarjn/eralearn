import React from 'react';

export const TestComponent: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          🎉 Teste de Renderização
        </h1>
        <p className="text-gray-600 mb-4">
          Se você está vendo esta tela, a aplicação está funcionando!
        </p>
        <div className="space-y-2 text-sm text-gray-500">
          <div>✅ React funcionando</div>
          <div>✅ Tailwind CSS funcionando</div>
          <div>✅ Componentes renderizando</div>
          <div>✅ Estilos aplicados</div>
        </div>
      </div>
    </div>
  );
};

export default TestComponent; 
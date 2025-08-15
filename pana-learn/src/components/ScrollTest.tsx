import React from 'react';

export function ScrollTest() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Teste de Scroll</h1>
      
      {/* Conteúdo para forçar scroll */}
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} className="p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold">Item {i + 1}</h2>
          <p className="text-gray-600">
            Este é o item número {i + 1} para testar o scroll. 
            Se você consegue ver este texto e rolar a página, o scroll está funcionando corretamente.
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </div>
        </div>
      ))}
      
      <div className="p-4 bg-green-100 rounded-lg">
        <h2 className="text-lg font-semibold text-green-800">✅ Scroll Funcionando!</h2>
        <p className="text-green-700">
          Se você conseguiu chegar até aqui rolando a página, o scroll está funcionando perfeitamente!
        </p>
      </div>
    </div>
  );
}







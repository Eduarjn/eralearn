import React from 'react';

interface ProgressStepperProps {
  steps: string[];
  current: number; // 0, 1, 2
}

const statusColors = [
  'bg-gray-300', // não iniciado
  'bg-yellow-400', // andamento
  'bg-lime-500', // concluído
];

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ steps, current }) => {
  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
                ${idx < current ? 'bg-lime-500' : idx === current ? 'bg-blue-500' : 'bg-gray-300'}`}
            >
              {idx < current ? '✓' : idx === current ? '●' : '○'}
            </div>
            <span className="text-xs mt-1 text-gray-600">{step}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-1 mx-1 ${idx < current ? 'bg-lime-400' : 'bg-gray-200'}`}></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}; 
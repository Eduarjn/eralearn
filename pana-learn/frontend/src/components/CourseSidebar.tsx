import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';

interface Aula {
  id: string;
  titulo: string;
  duracao: number; // minutos
}

interface Modulo {
  id: string;
  nome: string;
  aulas: Aula[];
}

interface CourseSidebarProps {
  modulos: Modulo[];
  aulaAtualId: string;
  onAulaClick?: (aulaId: string) => void;
}

const CourseSidebar: React.FC<CourseSidebarProps> = ({ modulos, aulaAtualId, onAulaClick }) => {
  return (
    <aside className="w-full max-w-xs bg-[#F7F7F7] h-full p-4 overflow-y-auto border-r border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Conteúdo do Curso</h2>
      <Accordion type="multiple" className="space-y-2">
        {modulos.map((modulo, idx) => (
          <AccordionItem key={modulo.id} value={modulo.id} className="bg-white rounded shadow-sm">
            <AccordionTrigger className="font-semibold text-base px-4 py-2">
              {`Módulo ${idx + 1}: ${modulo.nome}`}
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ul className="divide-y divide-gray-100">
                {modulo.aulas.map((aula) => {
                  const isAtual = aula.id === aulaAtualId;
                  return (
                    <li
                      key={aula.id}
                      className={`flex items-center px-4 py-2 cursor-pointer transition-all group
                        ${isAtual ? 'bg-blue-100 border-l-4 border-blue-600' : 'hover:bg-gray-100'}
                      `}
                      onClick={() => onAulaClick && onAulaClick(aula.id)}
                    >
                      <Play className={`mr-2 h-4 w-4 ${isAtual ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} />
                      <span className={`flex-1 truncate ${isAtual ? 'font-semibold text-blue-900' : 'text-gray-800'}`}>{aula.titulo}</span>
                      <Badge className="ml-2 bg-gray-200 text-gray-700 font-medium min-w-[40px] justify-center">
                        {aula.duracao} min
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </aside>
  );
};

export default CourseSidebar; 
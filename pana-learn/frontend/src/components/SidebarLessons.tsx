import React from 'react';

interface Module {
  id: string;
  title: string;
}

interface SidebarLessonsProps {
  modules: Module[];
  selectedModuleId?: string;
  onSelectModule?: (moduleId: string) => void;
}

export const SidebarLessons: React.FC<SidebarLessonsProps> = ({ modules, selectedModuleId, onSelectModule }) => {
  return (
    <div className="h-full max-h-[60vh] overflow-y-auto space-y-2 pr-2">
      {modules.map((mod) => (
        <button
          key={mod.id}
          className={`w-full text-left px-4 py-2 rounded-xl transition font-medium ${selectedModuleId === mod.id ? 'bg-era-lime text-white' : 'bg-white text-gray-800 hover:bg-era-lime/10'}`}
          onClick={() => onSelectModule?.(mod.id)}
        >
          {mod.title}
        </button>
      ))}
    </div>
  );
}; 
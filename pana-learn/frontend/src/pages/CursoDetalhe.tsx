import React, { useState, useEffect } from 'react';
import { CheckCircle, Video, Settings, Phone, PlusCircle, Star, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { Badge } from '../components/ui/badge';

// Mock de vídeos e módulos
const mockModules = [
  {
    id: 'mod1',
    name: 'PABX',
    icon: <Video className="h-4 w-4 mr-1 text-blue-600" />,
    videos: [
      {
        id: 'v1',
        title: 'Introdução ao PABX',
        description: 'Conceitos básicos e história dos sistemas PABX',
        youtubeId: 'dQw4w9WgXcQ',
        imported: true,
        watched: true,
        duracao: 12,
      },
      {
        id: 'v2',
        title: 'Instalação e Configuração Inicial',
        description: 'Como instalar e configurar um sistema PABX básico',
        youtubeId: '9bZkp7q19f0',
        imported: false,
        watched: false,
        duracao: 8,
      },
    ],
  },
  {
    id: 'mod2',
    name: 'Omnichannel',
    icon: <Video className="h-4 w-4 mr-1 text-purple-600" />,
    videos: [
      {
        id: 'v3',
        title: 'Visão Geral do Omnichannel',
        description: 'O que é Omnichannel e como aplicar',
        youtubeId: '',
        imported: false,
        watched: false,
        duracao: 15,
      },
    ],
  },
  {
    id: 'mod3',
    name: 'Configuração Avançada',
    icon: <Settings className="h-4 w-4 mr-1 text-green-600" />,
    videos: [
      {
        id: 'v4',
        title: 'Ajustes Avançados',
        description: 'Configurações avançadas para especialistas',
        youtubeId: '',
        imported: false,
        watched: false,
        duracao: 20,
      },
    ],
  },
];

const cursoInfo = {
  titulo: 'Curso Completo de Telefonia PABX',
  instrutor: 'João Silva',
  avaliacao: 4.7,
  imagem: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  publico: 'Técnicos, Empresas, Iniciantes',
};

export default function CursoDetalhe() {
  const [selected, setSelected] = useState<{ module: number; video: number } | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [youtubeLink, setYoutubeLink] = useState('');

  useEffect(() => {
    if (!selected) {
      for (let m = 0; m < mockModules.length; m++) {
        for (let v = 0; v < mockModules[m].videos.length; v++) {
          const vid = mockModules[m].videos[v];
          if (vid.imported && vid.youtubeId) {
            setSelected({ module: m, video: v });
            return;
          }
        }
      }
    }
  }, [selected, mockModules]);

  // Calcular tempo total e número de aulas
  const tempoTotal = mockModules.reduce((acc, m) => acc + m.videos.reduce((a, v) => a + (v.duracao || 0), 0), 0);
  const numAulas = mockModules.reduce((acc, m) => acc + m.videos.length, 0);

  // Aula selecionada
  const currentVideo = selected ? mockModules[selected.module].videos[selected.video] : null;

  const handleImport = () => {
    setShowImport(false);
    setYoutubeLink('');
    alert('Vídeo importado! (mock)');
  };

  // --- NOVO LAYOUT ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#F3F4F6] to-[#CCFF00]/10">
      {/* Header do Curso */}
      <div className="max-w-5xl mx-auto mt-8 mb-6">
        <div className="rounded-3xl shadow-lg bg-gradient-to-r from-[#2563EB] via-[#7C3AED] to-[#CCFF00] p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <Video className="w-12 h-12 text-[#CCFF00]" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow mb-2">{cursoInfo.titulo}</h1>
            <span className="inline-block bg-[#CCFF00] text-[#374151] font-bold px-4 py-1 rounded-full text-sm mb-2">PABX</span>
            <p className="text-white/90 text-lg mb-2">Curso introdutório sobre sistemas PABX e suas funcionalidades básicas</p>
            <div className="flex items-center gap-4">
              <span className="text-white/80 text-sm">Progresso geral:</span>
              <div className="w-40 bg-white/30 rounded-full h-3">
                <div className="bg-[#CCFF00] h-3 rounded-full" style={{ width: '40%' }} />
              </div>
              <span className="text-white font-bold">40%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Sidebar de módulos */}
        <aside className="w-full md:w-1/3 space-y-6">
          <div className="bg-white rounded-2xl shadow p-4">
            <h2 className="text-lg font-bold text-[#2563EB] mb-4">Módulos</h2>
            {/* Lista de módulos e vídeos */}
            <ul className="space-y-2">
              {mockModules.map((mod, modIdx) => (
                <li key={mod.id} className="mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    {mod.icon}
                    <span className="font-semibold text-[#374151]">{mod.name}</span>
                  </div>
                  {/* Progresso do módulo */}
                  {(() => {
                    const importedVideos = mod.videos.filter(v => v.imported && v.youtubeId);
                    const watchedCount = importedVideos.filter(v => v.watched).length;
                    const progress = importedVideos.length > 0 ? (watchedCount / importedVideos.length) * 100 : 0;
                    return (
                      <div className="mb-1">
                        <div className="w-full bg-[#E5E7EB] rounded-full h-2">
                          <div className="bg-[#CCFF00] h-2 rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-[#2563EB] font-bold">{Math.round(progress)}%</span>
                      </div>
                    );
                  })()}
                  {/* Lista de vídeos */}
                  <ul className="flex flex-col gap-1 mt-1">
                    {mod.videos.filter(vid => vid.imported && vid.youtubeId).map((vid, vidIdx) => (
                      <li
                        key={vid.id}
                        className={`flex items-center gap-2 cursor-pointer rounded px-2 py-2 transition-colors border ${selected && selected.module === modIdx && selected.video === vidIdx ? 'bg-[#CCFF00]/30 border-[#2563EB] font-bold' : 'hover:bg-[#7C3AED]/10 border-transparent'}`}
                        onClick={() => setSelected({ module: modIdx, video: vidIdx })}
                      >
                        <Video className="h-4 w-4 text-[#2563EB]" />
                        <span className="truncate flex-1">{vid.title}</span>
                        <Badge className="bg-[#E5E7EB] text-[#374151] font-medium min-w-[40px] justify-center">{vid.duracao} min</Badge>
                        {vid.watched && <CheckCircle className="h-4 w-4 text-green-500 ml-1" />}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Player e detalhes */}
        <main className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            {/* Player de vídeo */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4 flex items-center justify-center">
              {currentVideo && currentVideo.youtubeId ? (
                <iframe
                  className="w-full h-full min-h-[200px] max-h-[60vw] md:max-h-[400px] border-none"
                  src={`https://www.youtube.com/embed/${currentVideo.youtubeId}`}
                  title={currentVideo.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <span className="text-white text-lg">Selecione um vídeo para começar</span>
              )}
            </div>
            {currentVideo && (
              <>
                <h2 className="text-2xl font-bold text-[#2563EB] mb-2">{currentVideo.title}</h2>
                <p className="text-[#374151] mb-4">{currentVideo.description}</p>
                {/* Progresso do vídeo */}
                <div className="w-full bg-[#E5E7EB] rounded-full h-2 mb-4">
                  <div className="bg-[#CCFF00] h-2 rounded-full" style={{ width: currentVideo.watched ? '100%' : '0%' }} />
                </div>
              </>
            )}
          </div>
          {/* Comentários */}
          <div className="bg-white rounded-2xl shadow p-4">
            <h3 className="text-lg font-bold text-[#7C3AED] mb-2">Comentários</h3>
            <div className="mb-2 text-[#374151]/80">Nenhum comentário ainda.</div>
            <div className="flex gap-2">
              <input className="flex-1 border-2 border-[#CCFF00] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2563EB]" placeholder="Escreva um comentário..." />
              <button className="bg-[#2563EB] text-white font-bold px-6 py-2 rounded-xl hover:bg-[#7C3AED] transition">Enviar</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 
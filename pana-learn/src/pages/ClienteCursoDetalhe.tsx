import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

export default function ClienteCursoDetalhe() {
  const { curso_id } = useParams();
  const [curso, setCurso] = useState(null);
  const [modulos, setModulos] = useState([]);
  const [videosPorModulo, setVideosPorModulo] = useState({});
  const [selected, setSelected] = useState({ moduloId: null, videoId: null });
  const [progresso, setProgresso] = useState({}); // progresso local por vídeo

  useEffect(() => {
    async function fetchData() {
      // Buscar curso
      const { data: cursoData } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', curso_id)
        .single();
      setCurso(cursoData);

      // Buscar módulos do curso
      const { data: modulosData } = await supabase
        .from('modulos')
        .select('*')
        .eq('curso_id', curso_id)
        .order('ordem', { ascending: true });
      setModulos(modulosData || []);

      // Buscar vídeos de todos os módulos
      const moduloIds = (modulosData || []).map(m => m.id);
      if (moduloIds.length === 0) return;
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .in('modulo_id', moduloIds)
        .order('ordem', { ascending: true });

      // Agrupar vídeos por módulo
      const agrupado = {};
      (videosData || []).forEach(video => {
        if (!agrupado[video.modulo_id]) agrupado[video.modulo_id] = [];
        agrupado[video.modulo_id].push(video);
      });
      setVideosPorModulo(agrupado);

      // Selecionar primeiro vídeo do primeiro módulo por padrão
      if (modulosData && modulosData.length > 0) {
        const primeiroModulo = modulosData[0];
        const videosDoModulo = agrupado[primeiroModulo.id] || [];
        setSelected({
          moduloId: primeiroModulo.id,
          videoId: videosDoModulo.length > 0 ? videosDoModulo[0].id : null,
        });
      }
    }
    fetchData();
  }, [curso_id]);

  const moduloSelecionado = modulos.find(m => m.id === selected.moduloId);
  const videosDoModulo = videosPorModulo[selected.moduloId] || [];
  const videoSelecionado = videosDoModulo.find(v => v.id === selected.videoId);

  // Progresso local (checkbox)
  const handleToggleProgresso = (videoId) => {
    setProgresso(prev => ({ ...prev, [videoId]: !prev[videoId] }));
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f9fa' }}>
      {/* Sidebar estilo Udemy */}
      <aside style={{ width: 340, background: '#fff', borderRight: '1px solid #eee', padding: 24, overflowY: 'auto', height: '100vh' }}>
        <h2 style={{ fontWeight: 'bold', marginBottom: 16, fontSize: 22 }}>{curso?.nome || 'Curso'}</h2>
        {modulos.map(modulo => (
          <div key={modulo.id} style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 16 }}>
              {modulo.nome_modulo}
            </div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {(videosPorModulo[modulo.id] || []).map(video => (
                <li
                  key={video.id}
                  style={{
                    padding: 10,
                    background: selected.videoId === video.id ? '#e6f0ff' : 'transparent',
                    borderRadius: 6,
                    cursor: 'pointer',
                    marginBottom: 4,
                    display: 'flex',
                    alignItems: 'center',
                    fontWeight: selected.videoId === video.id ? 'bold' : 'normal',
                    borderLeft: selected.videoId === video.id ? '4px solid #2d2f31' : '4px solid transparent'
                  }}
                  onClick={() => setSelected({ moduloId: modulo.id, videoId: video.id })}
                >
                  <input
                    type="checkbox"
                    style={{ marginRight: 10 }}
                    checked={!!progresso[video.id]}
                    onChange={() => handleToggleProgresso(video.id)}
                  />
                  <span style={{ flex: 1 }}>{video.titulo || 'Sem título'}</span>
                  {video.duracao && (
                    <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{video.duracao} min</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </aside>
      {/* Área principal */}
      <main style={{ flex: 1, padding: 32, maxWidth: 900, margin: '0 auto' }}>
        {videoSelecionado ? (
          <>
            <div style={{ background: '#000', borderRadius: 12, overflow: 'hidden', marginBottom: 24 }}>
              {videoSelecionado.url_video?.includes('youtube.com') || videoSelecionado.url_video?.includes('youtu.be') ? (
                <iframe
                  width="100%"
                  height="480"
                  src={videoSelecionado.url_video}
                  title={videoSelecionado.titulo}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ display: 'block', width: '100%' }}
                />
              ) : (
                <video width="100%" height="480" src={videoSelecionado.url_video} controls style={{ display: 'block', width: '100%' }} />
              )}
            </div>
            
            {/* Informações do Vídeo */}
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 12, color: '#1f2937' }}>
                {videoSelecionado.titulo}
              </h1>
              {videoSelecionado.descricao && (
                <p style={{ color: '#6b7280', fontSize: 16, lineHeight: 1.6, marginBottom: 16 }}>
                  {videoSelecionado.descricao}
                </p>
              )}
              
              {/* Status do Vídeo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingTop: 16, borderTop: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#9ca3af', fontSize: 14 }}>⏱️</span>
                  <span style={{ color: '#6b7280', fontSize: 14 }}>
                    {videoSelecionado.duracao ? `${Math.round(videoSelecionado.duracao / 60)} min` : 'Duração não definida'}
                  </span>
                </div>
                
                {progresso[videoSelecionado.id] && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                    <span style={{ color: '#10b981', fontSize: 14, fontWeight: 500 }}>
                      Assistido
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Selecione um vídeo</p>
        )}
      </main>
    </div>
  );
} 
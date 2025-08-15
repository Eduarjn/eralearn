import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface AuditLog {
  id: string;
  usuario_id: string | null;
  empresa_id: string | null;
  acao: string;
  tabela: string | null;
  registro_id: string | null;
  detalhes: any;
  ip: string | null;
  user_agent: string | null;
  created_at: string;
}

export default function AuditLogs() {
  const { userProfile } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState({ acao: '', tabela: '', usuario: '', empresa: '', periodo: '' });
  const [detalhe, setDetalhe] = useState<AuditLog | null>(null);

  // Só admin_master pode acessar
  if (userProfile?.tipo_usuario !== 'admin_master') {
    return <div className="p-8 text-center text-red-600 font-bold">Acesso restrito ao administrador master.</div>;
  }

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [filtro]);

  async function fetchLogs() {
    setLoading(true);
    let query = supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
    if (filtro.acao) query = query.eq('acao', filtro.acao);
    if (filtro.tabela) query = query.eq('tabela', filtro.tabela);
    if (filtro.usuario) query = query.eq('usuario_id', filtro.usuario);
    if (filtro.empresa) query = query.eq('empresa_id', filtro.empresa);
    // Filtro de período pode ser adicionado aqui
    const { data, error } = await query;
    if (!error) setLogs(data || []);
    setLoading(false);
  }

  return (
    <div className="max-w-5xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Logs de Auditoria</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <Input placeholder="Ação" value={filtro.acao} onChange={e => setFiltro(f => ({ ...f, acao: e.target.value }))} className="w-32" />
        <Input placeholder="Tabela" value={filtro.tabela} onChange={e => setFiltro(f => ({ ...f, tabela: e.target.value }))} className="w-32" />
        <Input placeholder="Usuário ID" value={filtro.usuario} onChange={e => setFiltro(f => ({ ...f, usuario: e.target.value }))} className="w-40" />
        <Input placeholder="Empresa ID" value={filtro.empresa} onChange={e => setFiltro(f => ({ ...f, empresa: e.target.value }))} className="w-40" />
        {/* Filtro de período pode ser adicionado aqui */}
        <Button onClick={fetchLogs} variant="outline">Filtrar</Button>
        <Button onClick={() => setFiltro({ acao: '', tabela: '', usuario: '', empresa: '', periodo: '' })} variant="secondary">Limpar</Button>
      </div>
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="space-y-2">
          {logs.map(log => (
            <Card key={log.id} className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50" onClick={() => setDetalhe(log)}>
              <div>
                <div className="font-semibold">{log.acao}</div>
                <div className="text-xs text-gray-500">{log.tabela} | {log.usuario_id} | {log.empresa_id}</div>
                <div className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</div>
              </div>
              <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); setDetalhe(log); }}>Detalhes</Button>
            </Card>
          ))}
        </div>
      )}
      {/* Modal de detalhes */}
      {detalhe && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
            <Button className="absolute top-2 right-2" size="icon" variant="ghost" onClick={() => setDetalhe(null)}>X</Button>
            <h2 className="text-lg font-bold mb-2">Detalhes do Log</h2>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-96">{JSON.stringify(detalhe, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 
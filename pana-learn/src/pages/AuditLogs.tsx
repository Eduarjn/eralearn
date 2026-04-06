import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*, usuarios:admin_id(nome)')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          setLogs(data);
        }
      } catch (err) {
        console.error("Erro ao buscar logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-era-black via-era-gray-medium to-era-green text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <FileText className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
            <p className="text-white/90">Histórico de alterações no sistema (Exclusivo Admin Master)</p>
          </div>
        </div>
      </div>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-4">Data/Hora</th>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Ação</th>
                  <th className="px-6 py-4">Tabela</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} className="text-center py-8">Carregando logs...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">Nenhum registro encontrado.</td></tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 font-medium text-era-black">
                        {log.usuarios?.nome || 'Desconhecido'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          log.action_type === 'INSERT' ? 'bg-green-100 text-green-700' :
                          log.action_type === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600">
                        {log.table_name}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
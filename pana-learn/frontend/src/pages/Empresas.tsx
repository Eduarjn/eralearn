import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface Empresa {
  id: string;
  nome: string;
  logo_url?: string;
  cor_primaria?: string;
  cor_secundaria?: string;
}

export default function Empresas() {
  const { userProfile } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Empresa | null>(null);
  const [form, setForm] = useState<Partial<Empresa>>({});
  const [error, setError] = useState<string | null>(null);

  // Só admin_master pode acessar
  if (userProfile?.tipo_usuario !== 'admin_master') {
    return <div className="p-8 text-center text-red-600 font-bold">Acesso restrito ao administrador master.</div>;
  }

  useEffect(() => {
    fetchEmpresas();
  }, []);

  async function fetchEmpresas() {
    setLoading(true);
    const { data, error } = await supabase.from('empresas').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    setEmpresas(data || []);
    setLoading(false);
  }

  function handleEdit(empresa: Empresa) {
    setEditing(empresa);
    setForm(empresa);
  }

  function handleNew() {
    setEditing(null);
    setForm({});
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.nome) {
      setError('Nome é obrigatório');
      return;
    }
    if (editing) {
      // Update
      const { error } = await supabase.from('empresas').update(form).eq('id', editing.id);
      if (error) setError(error.message);
    } else {
      // Insert
      const { error } = await supabase.from('empresas').insert(form);
      if (error) setError(error.message);
    }
    setForm({});
    setEditing(null);
    fetchEmpresas();
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Tem certeza que deseja deletar esta empresa?')) return;
    await supabase.from('empresas').delete().eq('id', id);
    fetchEmpresas();
  }

  return (
    <div className="max-w-3xl mx-auto py-10">
      <div className="page-hero flex flex-col md:flex-row items-center justify-between gap-4 p-6 mb-8">
        <h1 className="text-2xl font-bold">Empresas</h1>
        <Button onClick={handleNew}>Nova Empresa</Button>
      </div>
      {(editing || !form.nome) && (
        <Card className="mb-6">
          <form onSubmit={handleSave} className="space-y-4 p-4">
            <CardHeader>
              <CardTitle>{editing ? 'Editar Empresa' : 'Nova Empresa'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Nome" value={form.nome || ''} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              <Input placeholder="Logo URL" value={form.logo_url || ''} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} />
              <Input placeholder="Cor Primária" value={form.cor_primaria || ''} onChange={e => setForm(f => ({ ...f, cor_primaria: e.target.value }))} />
              <Input placeholder="Cor Secundária" value={form.cor_secundaria || ''} onChange={e => setForm(f => ({ ...f, cor_secundaria: e.target.value }))} />
              {error && <div className="text-red-600 text-sm">{error}</div>}
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button type="submit">Salvar</Button>
              <Button type="button" variant="secondary" onClick={() => { setEditing(null); setForm({}); }}>Cancelar</Button>
            </CardFooter>
          </form>
        </Card>
      )}
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <div className="space-y-4">
          {empresas.map(emp => (
            <Card key={emp.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {emp.logo_url && <img src={emp.logo_url} alt={emp.nome} className="w-10 h-10 rounded bg-white border" />}
                <div>
                  <div className="font-bold">{emp.nome}</div>
                  <div className="text-xs text-gray-500">{emp.id}</div>
                  <div className="flex gap-2 mt-1">
                    {emp.cor_primaria && <span className="inline-block w-4 h-4 rounded-full" style={{ background: emp.cor_primaria }} title="Cor Primária" />}
                    {emp.cor_secundaria && <span className="inline-block w-4 h-4 rounded-full" style={{ background: emp.cor_secundaria }} title="Cor Secundária" />}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(emp)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(emp.id)}>Deletar</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
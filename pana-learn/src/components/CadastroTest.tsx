import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export function CadastroTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    password: '',
    tipo_usuario: 'cliente' as 'admin' | 'cliente'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      console.log('📝 Iniciando teste de cadastro:', formData);

      // Teste 1: Verificar conexão com Supabase
      const { data: connectionTest, error: connectionError } = await supabase
        .from('usuarios')
        .select('count')
        .limit(1);

      if (connectionError) {
        throw new Error(`Erro de conexão: ${connectionError.message}`);
      }

      console.log('✅ Conexão com Supabase OK');

      // Teste 2: Tentar cadastro
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome: formData.nome,
            tipo_usuario: formData.tipo_usuario
          }
        }
      });

      if (error) {
        console.error('❌ Erro no cadastro:', error);
        setResult({
          success: false,
          error: error.message,
          code: error.status
        });
      } else {
        console.log('✅ Cadastro realizado com sucesso:', data);
        setResult({
          success: true,
          data: data,
          message: 'Usuário criado com sucesso!'
        });

        // Teste 3: Verificar se usuário foi criado na tabela
        if (data.user) {
          setTimeout(async () => {
            const { data: profile, error: profileError } = await supabase
              .from('usuarios')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (profileError) {
              console.log('⚠️ Erro ao buscar perfil:', profileError);
              setResult(prev => ({
                ...prev,
                profileError: profileError.message
              }));
            } else {
              console.log('✅ Perfil encontrado:', profile);
              setResult(prev => ({
                ...prev,
                profile: profile
              }));
            }
          }, 1000);
        }
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Erro inesperado'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Teste de Cadastro de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Seu nome completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo_usuario">Tipo de Usuário</Label>
              <select
                id="tipo_usuario"
                value={formData.tipo_usuario}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo_usuario: e.target.value as 'admin' | 'cliente' }))}
                className="w-full p-2 border rounded-md"
              >
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? '🔄 Testando...' : '🧪 Testar Cadastro'}
            </Button>
          </form>

          {result && (
            <div className={`mt-4 p-4 rounded-md ${
              result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'
            }`}>
              <h4 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                {result.success ? '✅ Sucesso' : '❌ Erro'}
              </h4>
              <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.message || result.error}
              </p>
              {result.code && (
                <p className="text-xs text-gray-600 mt-1">
                  Código: {result.code}
                </p>
              )}
              {result.data && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">Ver detalhes</summary>
                  <pre className="text-xs mt-1 bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}















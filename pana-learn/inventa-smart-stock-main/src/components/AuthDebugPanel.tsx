
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, CheckCircle } from 'lucide-react';

export function AuthDebugPanel() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [isError, setIsError] = useState(false);

  const createTestData = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Criar alguns cursos de exemplo primeiro
      const cursosExemplo = [
        {
          nome: 'Fundamentos de PABX',
          categoria: 'Básico',
          descricao: 'Curso introdutório sobre sistemas PABX',
          status: 'ativo' as const,
          ordem: 1
        },
        {
          nome: 'Omnichannel Avançado',
          categoria: 'Avançado',
          descricao: 'Estratégias avançadas de omnichannel',
          status: 'ativo' as const,
          ordem: 2
        }
      ];

      // Inserir cursos
      const { error: cursosError } = await supabase
        .from('cursos')
        .upsert(cursosExemplo, { onConflict: 'nome' });

      if (cursosError) {
        console.error('Erro ao criar cursos:', cursosError);
      }

      // Criar categorias
      const categorias = [
        { nome: 'Básico', cor: '#3B82F6' },
        { nome: 'Intermediário', cor: '#10B981' },
        { nome: 'Avançado', cor: '#F59E0B' }
      ];

      const { error: categoriasError } = await supabase
        .from('categorias')
        .upsert(categorias, { onConflict: 'nome' });

      if (categoriasError) {
        console.error('Erro ao criar categorias:', categoriasError);
      }

      setMessage('Dados de teste criados com sucesso!');
      setIsError(false);
    } catch (error) {
      console.error('Erro ao criar dados de teste:', error);
      setMessage('Erro ao criar dados de teste');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const testAuthentication = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Teste de login com usuário de teste
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@eralearn.com',
        password: 'test123456'
      });

      if (error) {
        console.error('Erro no teste de auth:', error);
        setMessage(`Erro de autenticação: ${error.message}`);
        setIsError(true);
      } else {
        setMessage('Teste de autenticação bem-sucedido!');
        setIsError(false);
        
        // Logout automático após teste
        setTimeout(() => {
          supabase.auth.signOut();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro no teste:', error);
      setMessage('Erro inesperado no teste de autenticação');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Painel de Debug - Autenticação
        </CardTitle>
        <CardDescription>
          Ferramentas para testar e depurar a autenticação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={createTestData} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Criando...' : 'Criar Dados de Teste'}
          </Button>
          
          <Button 
            onClick={testAuthentication} 
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Testando...' : 'Testar Autenticação'}
          </Button>
        </div>

        {message && (
          <Alert className={isError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            {isError ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <AlertDescription className={isError ? 'text-red-800' : 'text-green-800'}>
              {message}
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Credenciais de Teste:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Admin:</strong> admin@eralearn.com / test123456</p>
            <p><strong>Cliente:</strong> cliente@eralearn.com / test123456</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

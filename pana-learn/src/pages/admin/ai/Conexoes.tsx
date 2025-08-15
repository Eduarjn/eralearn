import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAI } from '@/hooks/useAI';
import { AIProvider } from '@/lib/ai-types';
import { 
  Database, 
  Key, 
  TestTube, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export function Conexoes() {
  const { useAIProviders } = useAI();
  const { providers, loading, error, createProvider, updateProvider, deleteProvider } = useAIProviders();
  
  const [formData, setFormData] = React.useState({
    provider: 'openai' as const,
    name: '',
    description: '',
    api_base: '',
    use_platform_key: true,
    api_key: ''
  });
  
  const [showForm, setShowForm] = React.useState(false);
  const [testing, setTesting] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.use_platform_key) {
        await createProvider({
          ...formData,
          api_key: undefined
        });
      } else {
        await createProvider(formData);
      }
      setShowForm(false);
      setFormData({
        provider: 'openai',
        name: '',
        description: '',
        api_base: '',
        use_platform_key: true,
        api_key: ''
      });
    } catch (error) {
      console.error('Erro ao criar provedor:', error);
    }
  };

  const handleTestConnection = async (providerId: string) => {
    setTesting(providerId);
    // Simular teste de conexão
    setTimeout(() => {
      setTesting(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>Erro ao carregar provedores: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conexões</h2>
          <p className="text-muted-foreground">
            Configure provedores de IA e gerencie chaves de API
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Database className="h-4 w-4 mr-2" />
          Novo Provedor
        </Button>
      </div>

      {/* Lista de Provedores */}
      <div className="grid gap-4">
        {providers?.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                    <CardDescription>{provider.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={provider.active ? "default" : "secondary"}>
                    {provider.active ? "Ativo" : "Inativo"}
                  </Badge>
                  <Badge variant="outline">{provider.provider}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {provider.api_base && `Base: ${provider.api_base}`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConnection(provider.id!)}
                    disabled={testing === provider.id}
                  >
                    {testing === provider.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    Testar
                  </Button>
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Formulário */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Provedor</CardTitle>
            <CardDescription>
              Configure uma nova conexão com provedor de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="provider">Provedor</Label>
                  <Select
                    value={formData.provider}
                    onValueChange={(value: 'openai' | 'azure' | 'openrouter') =>
                      setFormData({ ...formData, provider: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="azure">Azure OpenAI</SelectItem>
                      <SelectItem value="openrouter">OpenRouter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do provedor"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição opcional"
                />
              </div>

              {formData.provider === 'azure' && (
                <div>
                  <Label htmlFor="api_base">URL Base (Azure)</Label>
                  <Input
                    id="api_base"
                    value={formData.api_base}
                    onChange={(e) => setFormData({ ...formData, api_base: e.target.value })}
                    placeholder="https://your-resource.openai.azure.com/"
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="use_platform_key"
                  checked={formData.use_platform_key}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, use_platform_key: checked })
                  }
                />
                <Label htmlFor="use_platform_key">Usar chave da plataforma</Label>
              </div>

              {!formData.use_platform_key && (
                <div>
                  <Label htmlFor="api_key">Chave da API</Label>
                  <Input
                    id="api_key"
                    type="password"
                    value={formData.api_key}
                    onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                    placeholder="sk-..."
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">Salvar Provedor</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

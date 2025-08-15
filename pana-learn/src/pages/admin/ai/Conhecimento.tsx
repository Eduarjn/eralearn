import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAI } from '@/hooks/useAI';
import { AIKnowledgeSource } from '@/lib/ai-types';
import { 
  BookOpen, 
  Upload, 
  Link, 
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

export function Conhecimento() {
  const { useAIKnowledge } = useAI();
  const { sources, loading, error, createSource, updateSource, deleteSource, reindexSource } = useAIKnowledge();
  
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    type: 'url' as 'url' | 'text',
    content: '',
    url: '',
    chunk_size: 1000,
    chunk_overlap: 200,
    language: 'pt'
  });
  
  const [showForm, setShowForm] = React.useState(false);
  const [reindexing, setReindexing] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const sourceData = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        content: formData.type === 'text' ? formData.content : undefined,
        url: formData.type === 'url' ? formData.url : undefined,
        metadata: {
          chunk_size: formData.chunk_size,
          chunk_overlap: formData.chunk_overlap,
          language: formData.language
        }
      };
      
      await createSource(sourceData);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        type: 'url',
        content: '',
        url: '',
        chunk_size: 1000,
        chunk_overlap: 200,
        language: 'pt'
      });
    } catch (error) {
      console.error('Erro ao criar fonte:', error);
    }
  };

  const handleReindex = async (sourceId: string) => {
    setReindexing(sourceId);
    try {
      await reindexSource(sourceId);
    } catch (error) {
      console.error('Erro ao reindexar:', error);
    } finally {
      setReindexing(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'indexing':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>;
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'indexing':
        return <Badge variant="secondary">Indexando</Badge>;
      case 'ok':
        return <Badge variant="default">Pronto</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
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
        <AlertDescription>Erro ao carregar fontes: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Conhecimento</h2>
          <p className="text-muted-foreground">
            Gerencie fontes de conhecimento para RAG (Retrieval Augmented Generation)
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <BookOpen className="h-4 w-4 mr-2" />
          Nova Fonte
        </Button>
      </div>

      {/* Lista de Fontes */}
      <div className="grid gap-4">
        {sources?.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {source.type === 'url' ? (
                    <Link className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <CardDescription>{source.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(source.status)}
                  {getStatusBadge(source.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {source.type === 'url' ? (
                    <span>URL: {source.url}</span>
                  ) : (
                    <span>Texto: {source.content?.substring(0, 100)}...</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReindex(source.id!)}
                    disabled={reindexing === source.id || source.status === 'indexing'}
                  >
                    {reindexing === source.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Reindexar
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
            <CardTitle>Nova Fonte de Conhecimento</CardTitle>
            <CardDescription>
              Adicione conteúdo para treinar o assistente de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome da fonte"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'url' | 'text' })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="url">URL</option>
                    <option value="text">Texto</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descrição da fonte"
                />
              </div>

              {formData.type === 'url' ? (
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://exemplo.com/documento"
                    required
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="content">Conteúdo</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Cole aqui o conteúdo do documento..."
                    rows={6}
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="chunk_size">Tamanho do Chunk</Label>
                  <Input
                    id="chunk_size"
                    type="number"
                    value={formData.chunk_size}
                    onChange={(e) => setFormData({ ...formData, chunk_size: parseInt(e.target.value) })}
                    min="100"
                    max="2000"
                  />
                </div>
                <div>
                  <Label htmlFor="chunk_overlap">Sobreposição</Label>
                  <Input
                    id="chunk_overlap"
                    type="number"
                    value={formData.chunk_overlap}
                    onChange={(e) => setFormData({ ...formData, chunk_overlap: parseInt(e.target.value) })}
                    min="0"
                    max="500"
                  />
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <select
                    id="language"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="pt">Português</option>
                    <option value="en">Inglês</option>
                    <option value="es">Espanhol</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Salvar Fonte</Button>
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

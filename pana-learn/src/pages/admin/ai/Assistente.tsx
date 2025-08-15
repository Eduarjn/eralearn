// ========================================
// ABA: Assistente - Configuração de IA
// ========================================
// Feature Flag: FEATURE_AI=true

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  Edit,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { useAI } from '@/hooks/useAI';
import { AIAssistant, AITool } from '@/lib/ai-types';
import { AI_AVAILABLE_TOOLS, getToolDescription } from '@/lib/ai-utils';
import { AIAssistantSchema } from '@/lib/ai-types';
import { validateAssistantConfig } from '@/lib/ai-utils';

export function Assistente() {
  const { useAIAssistants } = useAI();
  const { assistants, loading, error, createAssistant, updateAssistant, deleteAssistant } = useAIAssistants();
  
  const [editingAssistant, setEditingAssistant] = useState<AIAssistant | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    system_prompt: '',
    default_model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 1000,
    tools: [] as AITool[],
    active: true,
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Playground state
  const [playgroundData, setPlaygroundData] = useState({
    system_prompt: '',
    user_message: '',
    response: '',
    isLoading: false,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erros quando usuário edita
    if (formErrors.length > 0) {
      setFormErrors([]);
    }
  };

  const handleToolToggle = (tool: AITool) => {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter(t => t !== tool)
        : [...prev.tools, tool]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar dados
    const errors = validateAssistantConfig(formData as AIAssistant);
    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingAssistant) {
        await updateAssistant(editingAssistant.id!, formData);
        setEditingAssistant(null);
      } else {
        await createAssistant(formData);
      }
      
      // Limpar formulário
      setFormData({
        name: '',
        system_prompt: '',
        default_model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 1000,
        tools: [],
        active: true,
      });
      setShowForm(false);
      setFormErrors([]);
    } catch (error) {
      console.error('Erro ao salvar assistente:', error);
    }
  };

  const handleEdit = (assistant: AIAssistant) => {
    setEditingAssistant(assistant);
    setFormData({
      name: assistant.name,
      system_prompt: assistant.system_prompt,
      default_model: assistant.default_model,
      temperature: assistant.temperature,
      max_tokens: assistant.max_tokens,
      tools: assistant.tools,
      active: assistant.active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar este assistente?')) {
      try {
        await deleteAssistant(id);
      } catch (error) {
        console.error('Erro ao deletar assistente:', error);
      }
    }
  };

  const handlePlaygroundTest = async () => {
    setPlaygroundData(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Simular teste do playground
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPlaygroundData(prev => ({
        ...prev,
        response: 'Esta é uma resposta simulada do assistente. Em produção, isso seria uma chamada real para a API de IA.',
        isLoading: false,
      }));
    } catch (error) {
      setPlaygroundData(prev => ({
        ...prev,
        response: 'Erro ao testar assistente',
        isLoading: false,
      }));
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
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Erro ao carregar assistentes: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Assistentes de IA
          </h2>
          <p className="text-muted-foreground">
            Configure assistentes personalizados para diferentes propósitos
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Assistente
        </Button>
      </div>

      {/* Lista de Assistentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assistants.map((assistant) => (
          <Card key={assistant.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  {assistant.name}
                </CardTitle>
                <Badge variant={assistant.active ? "default" : "secondary"}>
                  {assistant.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <CardDescription>
                Modelo: {assistant.default_model}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Prompt do Sistema:</p>
                  <p className="text-sm line-clamp-2">{assistant.system_prompt}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Temperatura:</span>
                  <Badge variant="outline">{assistant.temperature}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Max Tokens:</span>
                  <Badge variant="outline">{assistant.max_tokens}</Badge>
                </div>

                {assistant.tools.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Ferramentas:</p>
                    <div className="flex flex-wrap gap-1">
                      {assistant.tools.map((tool) => (
                        <Badge key={tool} variant="secondary" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(assistant)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(assistant.id!)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
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
            <CardTitle>
              {editingAssistant ? 'Editar Assistente' : 'Novo Assistente'}
            </CardTitle>
            <CardDescription>
              Configure as propriedades do assistente de IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Erros */}
              {formErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {formErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Nome */}
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Assistente</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Assistente de Suporte"
                  required
                />
              </div>

              {/* Prompt do Sistema */}
              <div className="space-y-2">
                <Label htmlFor="system_prompt">
                  Prompt do Sistema
                  <span className="text-xs text-muted-foreground ml-2">
                    ({formData.system_prompt.length}/4000)
                  </span>
                </Label>
                <Textarea
                  id="system_prompt"
                  value={formData.system_prompt}
                  onChange={(e) => handleInputChange('system_prompt', e.target.value)}
                  placeholder="Defina o comportamento e personalidade do assistente..."
                  rows={4}
                  maxLength={4000}
                  required
                />
              </div>

              {/* Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <select
                    id="model"
                    value={formData.default_model}
                    onChange={(e) => handleInputChange('default_model', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">
                    Temperatura: {formData.temperature}
                  </Label>
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    0 = Determinístico, 2 = Muito Criativo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_tokens">
                    Máximo de Tokens: {formData.max_tokens}
                  </Label>
                  <input
                    id="max_tokens"
                    type="range"
                    min="100"
                    max="4000"
                    step="100"
                    value={formData.max_tokens}
                    onChange={(e) => handleInputChange('max_tokens', parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Ferramentas */}
              <div className="space-y-3">
                <Label>Ferramentas Disponíveis</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AI_AVAILABLE_TOOLS.map((tool) => (
                    <div key={tool} className="flex items-center space-x-2">
                      <Switch
                        id={tool}
                        checked={formData.tools.includes(tool)}
                        onCheckedChange={() => handleToolToggle(tool)}
                      />
                      <Label htmlFor={tool} className="flex-1">
                        <div className="font-medium">{tool.replace('_', ' ')}</div>
                        <div className="text-xs text-muted-foreground">
                          {getToolDescription(tool)}
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
                <Label htmlFor="active">Assistente Ativo</Label>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2">
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {editingAssistant ? 'Atualizar' : 'Criar'} Assistente
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAssistant(null);
                    setFormErrors([]);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Playground */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Playground de Teste
          </CardTitle>
          <CardDescription>
            Teste a configuração do assistente antes de salvar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playground_prompt">Prompt do Sistema</Label>
              <Textarea
                id="playground_prompt"
                value={playgroundData.system_prompt}
                onChange={(e) => setPlaygroundData(prev => ({ ...prev, system_prompt: e.target.value }))}
                placeholder="Cole aqui o prompt do sistema para testar..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="playground_message">Mensagem do Usuário</Label>
              <Textarea
                id="playground_message"
                value={playgroundData.user_message}
                onChange={(e) => setPlaygroundData(prev => ({ ...prev, user_message: e.target.value }))}
                placeholder="Digite uma mensagem para testar..."
                rows={2}
              />
            </div>

            <Button
              onClick={handlePlaygroundTest}
              disabled={playgroundData.isLoading || !playgroundData.system_prompt || !playgroundData.user_message}
              className="flex items-center gap-2"
            >
              {playgroundData.isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Play className="h-4 w-4" />
              )}
              Testar Assistente
            </Button>

            {playgroundData.response && (
              <div className="space-y-2">
                <Label>Resposta do Assistente</Label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{playgroundData.response}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAI } from '@/hooks/useAI';
import { 
  Shield, 
  AlertTriangle,
  UserCheck,
  Lock,
  Eye,
  EyeOff,
  Save,
  XCircle
} from 'lucide-react';

export function Seguranca() {
  const { useAISecurity } = useAI();
  const { settings, loading, error, updateSettings } = useAISecurity();
  
  const [formData, setFormData] = React.useState({
    // Limites de uso
    requests_per_minute: 10,
    tokens_per_day: 10000,
    max_tokens_per_request: 2000,
    
    // Segurança
    mask_pii: true,
    block_terms: true,
    escalate_to_human: false,
    
    // Termos bloqueados
    blocked_terms: '',
    
    // Configurações de escalação
    escalation_threshold: 3,
    escalation_message: ''
  });

  React.useEffect(() => {
    if (settings) {
      setFormData({
        requests_per_minute: settings.requests_per_minute || 10,
        tokens_per_day: settings.tokens_per_day || 10000,
        max_tokens_per_request: settings.max_tokens_per_request || 2000,
        mask_pii: settings.mask_pii ?? true,
        block_terms: settings.block_terms ?? true,
        escalate_to_human: settings.escalate_to_human ?? false,
        blocked_terms: settings.blocked_terms || '',
        escalation_threshold: settings.escalation_threshold || 3,
        escalation_message: settings.escalation_message || ''
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
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
        <AlertDescription>Erro ao carregar configurações: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Segurança</h2>
          <p className="text-muted-foreground">
            Configure limites de uso e políticas de segurança
          </p>
        </div>
        <Button onClick={handleSubmit}>
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Limites de Uso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Limites de Uso
            </CardTitle>
            <CardDescription>
              Configure limites para controlar o uso da IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="requests_per_minute">Requisições por Minuto</Label>
                <Input
                  id="requests_per_minute"
                  type="number"
                  value={formData.requests_per_minute}
                  onChange={(e) => setFormData({ ...formData, requests_per_minute: parseInt(e.target.value) })}
                  min="1"
                  max="100"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Máximo de requisições por usuário por minuto
                </p>
              </div>
              <div>
                <Label htmlFor="tokens_per_day">Tokens por Dia</Label>
                <Input
                  id="tokens_per_day"
                  type="number"
                  value={formData.tokens_per_day}
                  onChange={(e) => setFormData({ ...formData, tokens_per_day: parseInt(e.target.value) })}
                  min="1000"
                  max="100000"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Limite diário de tokens por usuário
                </p>
              </div>
              <div>
                <Label htmlFor="max_tokens_per_request">Tokens por Requisição</Label>
                <Input
                  id="max_tokens_per_request"
                  type="number"
                  value={formData.max_tokens_per_request}
                  onChange={(e) => setFormData({ ...formData, max_tokens_per_request: parseInt(e.target.value) })}
                  min="100"
                  max="8000"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Máximo de tokens por requisição individual
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacidade e PII */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacidade e PII
            </CardTitle>
            <CardDescription>
              Configure proteções de dados pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mask_pii">Mascarar Dados Pessoais</Label>
                <p className="text-sm text-muted-foreground">
                  Substitui emails e CPFs por [EMAIL] e [CPF]
                </p>
              </div>
              <Switch
                id="mask_pii"
                checked={formData.mask_pii}
                onCheckedChange={(checked) => setFormData({ ...formData, mask_pii: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Filtros de Conteúdo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Filtros de Conteúdo
            </CardTitle>
            <CardDescription>
              Configure bloqueio de termos e conteúdo inadequado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="block_terms">Bloquear Termos</Label>
                <p className="text-sm text-muted-foreground">
                  Ativa filtro de palavras e frases proibidas
                </p>
              </div>
              <Switch
                id="block_terms"
                checked={formData.block_terms}
                onCheckedChange={(checked) => setFormData({ ...formData, block_terms: checked })}
              />
            </div>
            
            {formData.block_terms && (
              <div>
                <Label htmlFor="blocked_terms">Termos Bloqueados</Label>
                <Textarea
                  id="blocked_terms"
                  value={formData.blocked_terms}
                  onChange={(e) => setFormData({ ...formData, blocked_terms: e.target.value })}
                  placeholder="Digite os termos a serem bloqueados, um por linha..."
                  rows={4}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Um termo por linha. Ex: palavrão, termo inadequado
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Escalação para Humano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Escalação para Humano
            </CardTitle>
            <CardDescription>
              Configure quando transferir para atendimento humano
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="escalate_to_human">Ativar Escalação</Label>
                <p className="text-sm text-muted-foreground">
                  Transfere conversas complexas para humanos
                </p>
              </div>
              <Switch
                id="escalate_to_human"
                checked={formData.escalate_to_human}
                onCheckedChange={(checked) => setFormData({ ...formData, escalate_to_human: checked })}
              />
            </div>
            
            {formData.escalate_to_human && (
              <>
                <div>
                  <Label htmlFor="escalation_threshold">Limite de Tentativas</Label>
                  <Input
                    id="escalation_threshold"
                    type="number"
                    value={formData.escalation_threshold}
                    onChange={(e) => setFormData({ ...formData, escalation_threshold: parseInt(e.target.value) })}
                    min="1"
                    max="10"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Número de tentativas antes de escalar
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="escalation_message">Mensagem de Escalação</Label>
                  <Textarea
                    id="escalation_message"
                    value={formData.escalation_message}
                    onChange={(e) => setFormData({ ...formData, escalation_message: e.target.value })}
                    placeholder="Mensagem exibida quando escalar para humano..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Status Atual */}
        <Card>
          <CardHeader>
            <CardTitle>Status das Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Badge variant={formData.mask_pii ? "default" : "secondary"}>
                  {formData.mask_pii ? "PII Ativo" : "PII Inativo"}
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant={formData.block_terms ? "default" : "secondary"}>
                  {formData.block_terms ? "Filtros Ativos" : "Filtros Inativos"}
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant={formData.escalate_to_human ? "default" : "secondary"}>
                  {formData.escalate_to_human ? "Escalação Ativa" : "Escalação Inativa"}
                </Badge>
              </div>
              <div className="text-center">
                <Badge variant="outline">
                  {formData.requests_per_minute}/min
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

// ========================================
// UTILITÁRIOS PARA MÓDULO DE IA
// ========================================
// Feature Flag: FEATURE_AI=true

import { AIProvider, AIAssistant, AITool, AIProcessingStatus } from './ai-types';

// ========================================
// 1. VERIFICAÇÃO DE FEATURE FLAG
// ========================================

/**
 * Verifica se o módulo de IA está habilitado
 */
export function isAIEnabled(): boolean {
  return import.meta.env.VITE_FEATURE_AI === 'true';
}

/**
 * Guard para verificar se IA está habilitado
 */
export function requireAI(): void {
  if (!isAIEnabled()) {
    throw new Error('Módulo de IA não está habilitado');
  }
}

// ========================================
// 2. VALIDAÇÃO E SANITIZAÇÃO
// ========================================

/**
 * Sanitiza texto removendo caracteres perigosos
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Valida se o texto contém termos bloqueados
 */
export function containsBlockedTerms(text: string, blockedTerms: string[]): boolean {
  const lowerText = text.toLowerCase();
  return blockedTerms.some(term => lowerText.includes(term.toLowerCase()));
}

/**
 * Mascara PII (Personal Identifiable Information)
 */
export function maskPII(text: string): string {
  return text
    // Mascara emails
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
    // Mascara CPF
    .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF]')
    // Mascara telefones
    .replace(/\b\(\d{2}\)\s?\d{4,5}-\d{4}\b/g, '[TELEFONE]')
    // Mascara CNPJ
    .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ]');
}

// ========================================
// 3. CÁLCULOS DE CUSTO
// ========================================

/**
 * Calcula custo baseado em tokens
 */
export function calculateCost(
  tokensPrompt: number,
  tokensCompletion: number,
  provider: string
): number {
  const pricing = getProviderPricing(provider);
  
  const promptCost = (tokensPrompt / 1000) * pricing.input_per_1k;
  const completionCost = (tokensCompletion / 1000) * pricing.output_per_1k;
  
  return promptCost + completionCost;
}

/**
 * Obtém preços do provedor
 */
export function getProviderPricing(provider: string) {
  const pricing = {
    openai: {
      input_per_1k: 0.03, // GPT-4
      output_per_1k: 0.06,
      embedding_per_1k: 0.0001,
    },
    azure: {
      input_per_1k: 0.03,
      output_per_1k: 0.06,
      embedding_per_1k: 0.0001,
    },
    openrouter: {
      input_per_1k: 0.02,
      output_per_1k: 0.04,
      embedding_per_1k: 0.0001,
    },
  };
  
  return pricing[provider as keyof typeof pricing] || pricing.openai;
}

// ========================================
// 4. FORMATAÇÃO E EXIBIÇÃO
// ========================================

/**
 * Formata custo para exibição
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(2)}/1k tokens`;
  }
  return `$${cost.toFixed(4)}`;
}

/**
 * Formata tamanho de arquivo
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formata status de processamento
 */
export function formatProcessingStatus(status: AIProcessingStatus): string {
  const statusMap = {
    pending: 'Pendente',
    indexing: 'Indexando...',
    completed: 'Concluído',
    error: 'Erro',
  };
  
  return statusMap[status];
}

/**
 * Obtém cor do status
 */
export function getStatusColor(status: AIProcessingStatus): string {
  const colorMap = {
    pending: 'text-yellow-600',
    indexing: 'text-blue-600',
    completed: 'text-green-600',
    error: 'text-red-600',
  };
  
  return colorMap[status];
}

// ========================================
// 5. VALIDAÇÃO DE PROVEDORES
// ========================================

/**
 * Valida configuração do provedor
 */
export function validateProviderConfig(provider: AIProvider): string[] {
  const errors: string[] = [];
  
  if (!provider.name.trim()) {
    errors.push('Nome é obrigatório');
  }
  
  if (provider.provider === 'azure' && !provider.api_base) {
    errors.push('API Base é obrigatória para Azure');
  }
  
  if (provider.provider === 'azure' && provider.api_base) {
    try {
      new URL(provider.api_base);
    } catch {
      errors.push('API Base deve ser uma URL válida');
    }
  }
  
  return errors;
}

/**
 * Obtém modelos disponíveis para o provedor
 */
export function getAvailableModels(provider: string): string[] {
  const models = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    azure: ['gpt-4', 'gpt-35-turbo'],
    openrouter: ['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'],
  };
  
  return models[provider as keyof typeof models] || [];
}

// ========================================
// 6. VALIDAÇÃO DE ASSISTENTES
// ========================================

/**
 * Valida configuração do assistente
 */
export function validateAssistantConfig(assistant: AIAssistant): string[] {
  const errors: string[] = [];
  
  if (!assistant.name.trim()) {
    errors.push('Nome é obrigatório');
  }
  
  if (!assistant.system_prompt.trim()) {
    errors.push('Prompt do sistema é obrigatório');
  }
  
  if (assistant.system_prompt.length > 4000) {
    errors.push('Prompt do sistema deve ter no máximo 4000 caracteres');
  }
  
  if (!assistant.default_model.trim()) {
    errors.push('Modelo padrão é obrigatório');
  }
  
  if (assistant.temperature < 0 || assistant.temperature > 2) {
    errors.push('Temperatura deve estar entre 0 e 2');
  }
  
  if (assistant.max_tokens < 1 || assistant.max_tokens > 4000) {
    errors.push('Máximo de tokens deve estar entre 1 e 4000');
  }
  
  return errors;
}

/**
 * Obtém descrição da ferramenta
 */
export function getToolDescription(tool: AITool): string {
  const descriptions = {
    search_course: 'Buscar informações nos cursos',
    generate_summary: 'Gerar resumos de conteúdo',
    create_quiz: 'Criar quizzes automaticamente',
    open_ticket: 'Abrir tickets de suporte',
  };
  
  return descriptions[tool];
}

// ========================================
// 7. UTILITÁRIOS DE ARQUIVO
// ========================================

/**
 * Valida tipo de arquivo
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  const extension = file.name.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

/**
 * Obtém extensão do arquivo
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Valida tamanho do arquivo
 */
export function isValidFileSize(file: File, maxSizeMB: number): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
}

// ========================================
// 8. UTILITÁRIOS DE DATA
// ========================================

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Obtém período do mês atual
 */
export function getCurrentMonthPeriod(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

// ========================================
// 9. UTILITÁRIOS DE BUSCA
// ========================================

/**
 * Busca chunks similares usando embeddings
 */
export async function searchSimilarChunks(
  query: string,
  embeddings: number[][],
  topK: number = 6
): Promise<{ index: number; score: number }[]> {
  // Simulação de busca por similaridade de cosseno
  // Em produção, isso seria feito no banco com pgvector
  
  const queryEmbedding = await generateEmbedding(query);
  const similarities = embeddings.map((embedding, index) => ({
    index,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));
  
  return similarities
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

/**
 * Calcula similaridade de cosseno
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ========================================
// 10. UTILITÁRIOS DE EMBEDDING
// ========================================

/**
 * Gera embedding para texto (simulação)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Em produção, isso seria uma chamada para a API de embeddings
  // Por enquanto, retorna um vetor simulado
  
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(1536).fill(0);
  
  words.forEach((word, index) => {
    if (index < embedding.length) {
      embedding[index] = Math.random();
    }
  });
  
  return embedding;
}

// ========================================
// 11. UTILITÁRIOS DE SEGURANÇA
// ========================================

/**
 * Verifica se deve escalar para humano
 */
export function shouldEscalateToHuman(
  message: string,
  escalationKeywords: string[]
): boolean {
  const lowerMessage = message.toLowerCase();
  return escalationKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
}

/**
 * Verifica limites de uso
 */
export function checkUsageLimits(
  currentUsage: number,
  limit: number,
  limitType: string
): { withinLimit: boolean; remaining: number } {
  const remaining = Math.max(0, limit - currentUsage);
  return {
    withinLimit: currentUsage < limit,
    remaining,
  };
}

// ========================================
// 12. UTILITÁRIOS DE LOGGING
// ========================================

/**
 * Log de atividade da IA
 */
export function logAIActivity(
  action: string,
  details: Record<string, any>,
  userId?: string
): void {
  console.log(`[AI Activity] ${action}:`, {
    timestamp: new Date().toISOString(),
    userId,
    details,
  });
}

/**
 * Log de erro da IA
 */
export function logAIError(
  error: Error,
  context: Record<string, any> = {}
): void {
  console.error(`[AI Error] ${error.message}:`, {
    timestamp: new Date().toISOString(),
    stack: error.stack,
    context,
  });
}

// ========================================
// 13. CONSTANTES
// ========================================

export const AI_CONSTANTS = {
  MAX_FILE_SIZE_MB: 10,
  SUPPORTED_FILE_TYPES: ['pdf', 'doc', 'docx', 'txt'],
  MAX_SYSTEM_PROMPT_LENGTH: 4000,
  DEFAULT_CHUNK_SIZE: 1000,
  DEFAULT_CHUNK_OVERLAP: 200,
  DEFAULT_TOP_K: 6,
  RATE_LIMIT_REQUESTS_PER_MINUTE: 60,
  RATE_LIMIT_TOKENS_PER_DAY: 100000,
  RATE_LIMIT_COST_PER_DAY: 10,
} as const;

// ========================================
// 14. UTILITÁRIOS DE EXPORTAÇÃO
// ========================================

/**
 * Exporta dados para CSV
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => 
        JSON.stringify(row[header] || '')
      ).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

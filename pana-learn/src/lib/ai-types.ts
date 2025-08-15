// ========================================
// TIPOS PARA MÓDULO DE IA
// ========================================
// Feature Flag: FEATURE_AI=true

import { z } from 'zod';

// ========================================
// SCHEMAS DE VALIDAÇÃO
// ========================================

export const AIProviderSchema = z.object({
  id: z.string().uuid().optional(),
  domain_id: z.string().uuid(),
  provider: z.enum(['openai', 'azure', 'openrouter']),
  api_base: z.string().url().optional(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  active: z.boolean().default(true),
});

export const AIProviderKeySchema = z.object({
  id: z.string().uuid().optional(),
  domain_id: z.string().uuid(),
  provider_id: z.string().uuid(),
  owner_scope: z.enum(['platform', 'tenant']),
  key_ciphertext: z.string(),
  active: z.boolean().default(true),
});

export const AIAssistantSchema = z.object({
  id: z.string().uuid().optional(),
  domain_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  system_prompt: z.string().min(1),
  default_model: z.string().min(1).max(100),
  temperature: z.number().min(0).max(2).default(0.7),
  max_tokens: z.number().min(1).max(4000).default(1000),
  tools: z.array(z.string()).default([]),
  active: z.boolean().default(true),
});

export const AIKnowledgeSourceSchema = z.object({
  id: z.string().uuid().optional(),
  domain_id: z.string().uuid(),
  assistant_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['url', 'text']),
  content: z.string().optional(),
  url: z.string().url().optional(),
  status: z.enum(['pending', 'indexing', 'ok', 'error']).default('pending'),
  metadata: z.record(z.unknown()).default({}),
});

export const AIChunkSchema = z.object({
  id: z.string().uuid().optional(),
  source_id: z.string().uuid(),
  content: z.string().min(1),
  embedding: z.array(z.number()).optional(),
  metadata: z.record(z.unknown()).default({}),
});

export const AIChatSessionSchema = z.object({
  id: z.string().uuid().optional(),
  domain_id: z.string().uuid(),
  user_id: z.string().uuid(),
  assistant_id: z.string().uuid(),
  title: z.string().optional(),
});

export const AIMessageSchema = z.object({
  id: z.string().uuid().optional(),
  session_id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  prompt_tokens: z.number().default(0),
  completion_tokens: z.number().default(0),
  cost_usd: z.number().default(0),
  sources: z.array(z.record(z.unknown())).default([]),
  status: z.enum(['success', 'error']).default('success'),
});

export const AIUsageLimitSchema = z.object({
  id: z.string().uuid().optional(),
  domain_id: z.string().uuid(),
  limit_type: z.enum(['requests_per_minute', 'tokens_per_day', 'cost_per_day']),
  limit_value: z.number().positive(),
  scope: z.enum(['domain', 'user']).default('domain'),
  active: z.boolean().default(true),
});

export const AISecuritySettingsSchema = z.object({
  id: z.string().uuid().optional(),
  domain_id: z.string().uuid(),
  requests_per_minute: z.number().min(1).max(100).default(10),
  tokens_per_day: z.number().min(1000).max(100000).default(10000),
  max_tokens_per_request: z.number().min(100).max(8000).default(2000),
  mask_pii: z.boolean().default(true),
  block_terms: z.boolean().default(true),
  blocked_terms: z.string().default(''),
  escalate_to_human: z.boolean().default(false),
  escalation_threshold: z.number().min(1).max(10).default(3),
  escalation_message: z.string().default(''),
});

// ========================================
// TIPOS INFERIDOS
// ========================================

export type AIProvider = z.infer<typeof AIProviderSchema>;
export type AIProviderKey = z.infer<typeof AIProviderKeySchema>;
export type AIAssistant = z.infer<typeof AIAssistantSchema>;
export type AIKnowledgeSource = z.infer<typeof AIKnowledgeSourceSchema>;
export type AIChunk = z.infer<typeof AIChunkSchema>;
export type AIChatSession = z.infer<typeof AIChatSessionSchema>;
export type AIMessage = z.infer<typeof AIMessageSchema>;
export type AIUsageLimit = z.infer<typeof AIUsageLimitSchema>;
export type AISecuritySettings = z.infer<typeof AISecuritySettingsSchema>;

// ========================================
// TIPOS PARA API
// ========================================

export interface AIChatRequest {
  message: string;
  session_id?: string;
  assistant_id?: string;
  use_rag?: boolean;
  context?: {
    course_id?: string;
    user_context?: string;
  };
}

export interface AIChatResponse {
  message: string;
  session_id: string;
  sources?: Array<{
    content: string;
    metadata: Record<string, unknown>;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost_usd: number;
}

export interface AIEmbedRequest {
  source_id: string;
  content: string;
  metadata?: Record<string, unknown>;
  chunk_size?: number;
  chunk_overlap?: number;
}

export interface AIEmbedResponse {
  success: boolean;
  chunks_count: number;
  error?: string;
}

// ========================================
// TIPOS PARA FRONTEND
// ========================================

export interface AIState {
  isEnabled: boolean;
  loading: boolean;
  error: string | null;
}

export interface AIProviderState {
  providers: AIProvider[];
  loading: boolean;
  error: string | null;
}

export interface AIAssistantState {
  assistants: AIAssistant[];
  loading: boolean;
  error: string | null;
}

export interface AIKnowledgeState {
  sources: AIKnowledgeSource[];
  loading: boolean;
  error: string | null;
}

export interface AIChatState {
  sessions: AIChatSession[];
  messages: AIMessage[];
  loading: boolean;
  error: string | null;
}

export interface AIUsageState {
  logs: AIMessage[];
  limits: AIUsageLimit[];
  loading: boolean;
  error: string | null;
}

export interface AISecurityState {
  settings: AISecuritySettings | null;
  loading: boolean;
  error: string | null;
}

// ========================================
// CONSTANTES
// ========================================

export const AI_PROVIDERS = {
  OPENAI: 'openai',
  AZURE: 'azure',
  OPENROUTER: 'openrouter',
} as const;

export const AI_MODELS = {
  GPT_4: 'gpt-4',
  GPT_4_TURBO: 'gpt-4-turbo-preview',
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  CLAUDE_3_OPUS: 'claude-3-opus-20240229',
  CLAUDE_3_SONNET: 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU: 'claude-3-haiku-20240307',
} as const;

export const AI_TOOLS = {
  SEARCH_COURSE: 'search_course',
  GENERATE_SUMMARY: 'generate_summary',
  CREATE_QUIZ: 'create_quiz',
  OPEN_TICKET: 'open_ticket',
} as const;

export const AI_STATUS = {
  PENDING: 'pending',
  INDEXING: 'indexing',
  OK: 'ok',
  ERROR: 'error',
} as const;

export const AI_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
} as const;

// ========================================
// TIPOS DE UTILIDADE
// ========================================

export type AIProviderType = typeof AI_PROVIDERS[keyof typeof AI_PROVIDERS];
export type AIModelType = typeof AI_MODELS[keyof typeof AI_MODELS];
export type AIToolType = typeof AI_TOOLS[keyof typeof AI_TOOLS];
export type AIStatusType = typeof AI_STATUS[keyof typeof AI_STATUS];
export type AIRoleType = typeof AI_ROLES[keyof typeof AI_ROLES];

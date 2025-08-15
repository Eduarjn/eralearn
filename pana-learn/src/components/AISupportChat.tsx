import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  X, 
  Zap, 
  AlertCircle,
  Loader2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: Date;
  tokensUsed?: number;
}

interface TokenUsage {
  userId: string;
  tokensUsed: number;
  tokensLimit: number;
  lastReset: Date;
}

interface AISupportChatProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  courseName?: string;
}

export function AISupportChat({ isOpen, onClose, courseId, courseName }: AISupportChatProps) {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<TokenUsage | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Configuração da IA
  const AI_CONFIG = {
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
    systemPrompt: `Você é um assistente especializado em suporte técnico para a plataforma ERA Learn. 
    
    Contexto da plataforma:
    - Plataforma de treinamentos online
    - Cursos sobre PABX, Omnichannel, configurações
    - Sistema de vídeos, quizzes e certificados
    - Usuários: admin, admin_master, client, user
    
    Regras:
    1. Responda de forma clara e objetiva
    2. Seja sempre educado e profissional
    3. Se não souber algo, sugira contatar suporte humano
    4. Use linguagem técnica quando apropriado
    5. Limite respostas a 1000 tokens
    
    Curso atual: ${courseName || 'Não especificado'}
    ID do curso: ${courseId || 'Não especificado'}`
  };

  // Carregar histórico de mensagens
  useEffect(() => {
    if (isOpen && userProfile?.id) {
      loadChatHistory();
      loadTokenUsage();
    }
  }, [isOpen, userProfile?.id]);

  // Auto-scroll para última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Foco no input quando abrir
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('user_id', userProfile?.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;

      const formattedMessages: Message[] = data?.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender,
        timestamp: new Date(msg.created_at),
        tokensUsed: msg.tokens_used
      })) || [];

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadTokenUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_token_usage')
        .select('*')
        .eq('user_id', userProfile?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setTokenUsage({
          userId: data.user_id,
          tokensUsed: data.tokens_used || 0,
          tokensLimit: data.tokens_limit || 10000,
          lastReset: new Date(data.last_reset)
        });
      } else {
        // Criar registro inicial
        await createInitialTokenUsage();
      }
    } catch (error) {
      console.error('Erro ao carregar uso de tokens:', error);
    }
  };

  const createInitialTokenUsage = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_token_usage')
        .insert({
          user_id: userProfile?.id,
          tokens_used: 0,
          tokens_limit: 10000,
          last_reset: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setTokenUsage({
        userId: data.user_id,
        tokensUsed: 0,
        tokensLimit: 10000,
        lastReset: new Date(data.last_reset)
      });
    } catch (error) {
      console.error('Erro ao criar uso de tokens:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Verificar limite de tokens
      if (tokenUsage && tokenUsage.tokensUsed >= tokenUsage.tokensLimit) {
        throw new Error('Limite de tokens atingido. Entre em contato com o suporte.');
      }

      // Salvar mensagem do usuário
      await saveMessage(userMessage);

      // Gerar resposta da IA
      const aiResponse = await generateAIResponse(inputMessage.trim());
      
      // Salvar resposta da IA
      await saveMessage(aiResponse);

      // Atualizar uso de tokens
      await updateTokenUsage(aiResponse.tokensUsed || 0);

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'Erro ao processar sua mensagem. Tente novamente.',
        sender: 'system',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveMessage = async (message: Message) => {
    try {
      const { error } = await supabase
        .from('ai_chat_history')
        .insert({
          user_id: userProfile?.id,
          content: message.content,
          sender: message.sender,
          tokens_used: message.tokensUsed || 0,
          course_id: courseId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  };

  const generateAIResponse = async (userMessage: string): Promise<Message> => {
    // Simulação de resposta da IA (substitua pela API real)
    const responses = [
      "Entendo sua dúvida sobre a plataforma ERA Learn. Posso ajudar com configurações, vídeos, cursos e muito mais. O que você gostaria de saber especificamente?",
      "Para resolver esse problema, você pode verificar as configurações do curso na seção administrativa. Se precisar de mais ajuda, posso detalhar o processo.",
      "Essa funcionalidade está disponível para usuários com permissão de administrador. Você pode solicitar acesso através do suporte.",
      "O sistema de vídeos suporta formatos MP4, MOV e AVI. Para uploads, use a seção 'Adicionar Vídeo' no curso desejado.",
      "Para dúvidas mais complexas, recomendo entrar em contato com nosso suporte humano. Posso ajudar com questões básicas e orientações gerais."
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const estimatedTokens = Math.ceil(randomResponse.length / 4); // Estimativa aproximada

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return {
      id: Date.now().toString(),
      content: randomResponse,
      sender: 'ai',
      timestamp: new Date(),
      tokensUsed: estimatedTokens
    };
  };

  const updateTokenUsage = async (tokensUsed: number) => {
    try {
      const { error } = await supabase
        .from('ai_token_usage')
        .update({
          tokens_used: (tokenUsage?.tokensUsed || 0) + tokensUsed,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userProfile?.id);

      if (error) throw error;

      setTokenUsage(prev => prev ? {
        ...prev,
        tokensUsed: prev.tokensUsed + tokensUsed
      } : null);
    } catch (error) {
      console.error('Erro ao atualizar uso de tokens:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getTokenUsagePercentage = () => {
    if (!tokenUsage) return 0;
    return Math.min((tokenUsage.tokensUsed / tokenUsage.tokensLimit) * 100, 100);
  };

  const getTokenUsageColor = () => {
    const percentage = getTokenUsagePercentage();
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`
        w-80 transition-all duration-300 ${isMinimized ? 'h-12' : 'h-96'}
        bg-surface border border-futuristic shadow-neon
      `}
      style={{
        '--surface': 'var(--surface)',
        '--border': 'var(--border)',
      } as React.CSSProperties}
      >
        <CardHeader className="pb-2 border-b border-futuristic">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm text-text">
              <Bot className="h-4 w-4 text-accent" />
              Suporte IA
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-muted hover:text-text hover:bg-surface-hover"
              >
                {isMinimized ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0 text-muted hover:text-text hover:bg-surface-hover"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {!isMinimized && (
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Tokens: {tokenUsage?.tokensUsed || 0}/{tokenUsage?.tokensLimit || 10000}</span>
              <span className={getTokenUsageColor()}>
                {getTokenUsagePercentage().toFixed(1)}%
              </span>
            </div>
          )}
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            <ScrollArea className="h-64 px-4">
              <div className="space-y-3 pb-4">
                                 {messages.length === 0 && (
                   <div className="text-center text-sm text-muted py-8">
                     <Bot className="h-8 w-8 mx-auto mb-2 text-accent" />
                     <p>Olá! Sou o assistente IA da ERA Learn.</p>
                     <p>Como posso ajudar você hoje?</p>
                   </div>
                 )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                                         <div
                       className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                         message.sender === 'user'
                           ? 'bg-accent text-black border border-accent-600'
                           : message.sender === 'ai'
                           ? 'bg-surface-2 text-text border border-futuristic'
                           : 'bg-red-900/20 text-red-300 border border-red-500/30'
                       }`}
                     >
                      <div className="flex items-center gap-2 mb-1">
                        {message.sender === 'user' ? (
                          <User className="h-3 w-3" />
                        ) : message.sender === 'ai' ? (
                          <Bot className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                        {message.tokensUsed && (
                          <Badge variant="outline" className="text-xs">
                            {message.tokensUsed} tokens
                          </Badge>
                        )}
                      </div>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                
                                 {isLoading && (
                   <div className="flex justify-start">
                     <div className="bg-surface-2 border border-futuristic rounded-lg px-3 py-2 text-sm">
                       <div className="flex items-center gap-2">
                         <Loader2 className="h-3 w-3 animate-spin text-accent" />
                         <span className="text-text">IA está digitando...</span>
                       </div>
                     </div>
                   </div>
                 )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

                         <div className="border-t border-futuristic p-3">
               <div className="flex gap-2">
                 <Input
                   ref={inputRef}
                   value={inputMessage}
                   onChange={(e) => setInputMessage(e.target.value)}
                   onKeyPress={handleKeyPress}
                   placeholder="Digite sua dúvida..."
                   disabled={isLoading}
                   className="flex-1 text-sm bg-surface border-futuristic text-text placeholder:text-muted focus:border-accent focus:ring-accent"
                 />
                 <Button
                   onClick={handleSendMessage}
                   disabled={isLoading || !inputMessage.trim()}
                   size="sm"
                   className="bg-accent hover:bg-accent-600 text-black border border-accent-600 focus:ring-accent"
                 >
                   <Send className="h-4 w-4" />
                 </Button>
               </div>
              
                             {tokenUsage && getTokenUsagePercentage() >= 90 && (
                 <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-300">
                   <AlertCircle className="h-3 w-3 inline mr-1" />
                   Limite de tokens próximo. Entre em contato com suporte humano.
                 </div>
               )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

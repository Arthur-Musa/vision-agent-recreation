
/**
 * Evo AI Integration Service - Gerenciamento avançado de agentes IA
 */

import { config } from '@/config/environment';

export interface EvoAIAgent {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'training';
  model: string;
  capabilities: string[];
  instructions: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface EvoAIConversation {
  id: string;
  agentId: string;
  userId: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  status: 'active' | 'completed' | 'error';
  createdAt: string;
}

export interface EvoAIRequest {
  agentId: string;
  message: string;
  context?: Record<string, any>;
  options?: {
    stream?: boolean;
    maxTokens?: number;
    temperature?: number;
  };
}

export interface EvoAIResponse {
  id: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
  metadata?: Record<string, any>;
}

class EvoAIService {
  private baseURL: string;
  private apiKey: string;
  private instanceName: string;

  constructor() {
    // Configurações padrão - devem ser configuradas pelo usuário
    this.baseURL = 'http://localhost:8080'; // URL padrão do Evo AI
    this.apiKey = ''; // Será configurado via interface
    this.instanceName = 'olga-instance';
  }

  /**
   * Configura as credenciais e URL do Evo AI
   */
  configure(baseURL: string, apiKey: string, instanceName: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
    this.instanceName = instanceName;
    
    // Salvar configurações no localStorage
    localStorage.setItem('evoai_config', JSON.stringify({
      baseURL,
      apiKey,
      instanceName
    }));
  }

  /**
   * Carrega configurações salvas
   */
  loadConfig() {
    const saved = localStorage.getItem('evoai_config');
    if (saved) {
      const config = JSON.parse(saved);
      this.baseURL = config.baseURL;
      this.apiKey = config.apiKey;
      this.instanceName = config.instanceName;
    }
  }

  /**
   * Faz requisições para a API do Evo AI
   */
  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.apiKey) {
      throw new Error('Evo AI não configurado. Configure as credenciais primeiro.');
    }

    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'apikey': this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Evo AI API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Lista todos os agentes disponíveis
   */
  async listAgents(): Promise<EvoAIAgent[]> {
    try {
      const response = await this.request(`/${this.instanceName}/agents`);
      return response.agents || [];
    } catch (error) {
      console.error('Erro ao listar agentes Evo AI:', error);
      return [];
    }
  }

  /**
   * Cria um novo agente no Evo AI
   */
  async createAgent(agentData: Partial<EvoAIAgent>): Promise<EvoAIAgent> {
    const response = await this.request(`/${this.instanceName}/agents`, {
      method: 'POST',
      body: JSON.stringify({
        name: agentData.name,
        description: agentData.description,
        instructions: agentData.instructions,
        model: agentData.model || 'gpt-4o-mini',
        temperature: agentData.temperature || 0.7,
        maxTokens: agentData.maxTokens || 2000,
        capabilities: agentData.capabilities || [],
        metadata: agentData.metadata || {}
      }),
    });

    return response.agent;
  }

  /**
   * Atualiza um agente existente
   */
  async updateAgent(agentId: string, agentData: Partial<EvoAIAgent>): Promise<EvoAIAgent> {
    const response = await this.request(`/${this.instanceName}/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(agentData),
    });

    return response.agent;
  }

  /**
   * Remove um agente
   */
  async deleteAgent(agentId: string): Promise<void> {
    await this.request(`/${this.instanceName}/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Envia mensagem para um agente
   */
  async sendMessage(request: EvoAIRequest): Promise<EvoAIResponse> {
    const response = await this.request(`/${this.instanceName}/agents/${request.agentId}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        message: request.message,
        context: request.context,
        options: request.options,
      }),
    });

    return response;
  }

  /**
   * Inicia uma conversa com stream
   */
  async sendMessageStream(
    request: EvoAIRequest,
    onChunk: (chunk: string) => void,
    onComplete: (response: EvoAIResponse) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/${this.instanceName}/agents/${request.agentId}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          message: request.message,
          context: request.context,
          options: { ...request.options, stream: true },
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Stream não disponível');
      }

      let buffer = '';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                onChunk(data.content);
                fullResponse += data.content;
              }
              if (data.done) {
                onComplete({
                  id: data.id,
                  content: fullResponse,
                  usage: data.usage,
                  model: data.model,
                  finishReason: data.finishReason,
                });
                return;
              }
            } catch (e) {
              console.warn('Erro ao parsear chunk SSE:', e);
            }
          }
        }
      }
    } catch (error) {
      onError(error as Error);
    }
  }

  /**
   * Lista conversas de um agente
   */
  async getConversations(agentId: string): Promise<EvoAIConversation[]> {
    try {
      const response = await this.request(`/${this.instanceName}/agents/${agentId}/conversations`);
      return response.conversations || [];
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      return [];
    }
  }

  /**
   * Busca uma conversa específica
   */
  async getConversation(conversationId: string): Promise<EvoAIConversation | null> {
    try {
      const response = await this.request(`/${this.instanceName}/conversations/${conversationId}`);
      return response.conversation;
    } catch (error) {
      console.error('Erro ao buscar conversa:', error);
      return null;
    }
  }

  /**
   * Verifica se o Evo AI está funcionando
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request('/health');
      return response.status === 'ok';
    } catch (error) {
      console.error('Evo AI health check falhou:', error);
      return false;
    }
  }

  /**
   * Migra agentes existentes para o Evo AI
   */
  async migrateExistingAgents(agents: Array<{
    id: string;
    name: string;
    description: string;
    systemPrompt: string;
    capabilities: string[];
  }>): Promise<{ success: EvoAIAgent[], failed: Array<{ id: string, error: string }> }> {
    const success: EvoAIAgent[] = [];
    const failed: Array<{ id: string, error: string }> = [];

    for (const agent of agents) {
      try {
        const evoAgent = await this.createAgent({
          name: agent.name,
          description: agent.description,
          instructions: agent.systemPrompt,
          capabilities: agent.capabilities,
          metadata: { 
            originalId: agent.id,
            migratedAt: new Date().toISOString()
          }
        });
        
        success.push(evoAgent);
      } catch (error) {
        failed.push({
          id: agent.id,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        });
      }
    }

    return { success, failed };
  }

  /**
   * Executa comunicação entre agentes (A2A)
   */
  async agentToAgentCommunication(
    fromAgentId: string,
    toAgentId: string,
    message: string,
    context?: Record<string, any>
  ): Promise<EvoAIResponse> {
    const response = await this.request(`/${this.instanceName}/agents/communicate`, {
      method: 'POST',
      body: JSON.stringify({
        fromAgent: fromAgentId,
        toAgent: toAgentId,
        message,
        context,
      }),
    });

    return response;
  }
}

export const evoAIService = new EvoAIService();

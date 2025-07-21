/**
 * Sistema Próprio de Agentes IA - Inspirado no Evo AI
 * Gerenciamento avançado de agentes com banco de dados próprio
 */

import { openaiService } from '../openaiService';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: string;
  system_prompt: string;
  capabilities: string[];
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentConversation {
  id: string;
  agent_id: string;
  user_id?: string;
  session_id: string;
  messages: ConversationMessage[];
  status: 'active' | 'completed' | 'error';
  created_at: string;
  metadata?: Record<string, any>;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AgentRequest {
  agent_id: string;
  message: string;
  context?: Record<string, any>;
  session_id?: string;
  options?: {
    stream?: boolean;
    max_tokens?: number;
    temperature?: number;
  };
}

export interface AgentResponse {
  id: string;
  content: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  finish_reason: string;
  metadata?: Record<string, any>;
  extractedData?: Record<string, any>;
  confidence?: number;
  validations?: Array<{
    field: string;
    status: 'success' | 'warning' | 'error';
    message: string;
  }>;
  recommendations?: string[];
  citations?: string[];
}

class AIAgentService {
  // Simulação de dados para desenvolvimento
  private agents: AIAgent[] = [];
  private conversations: Record<string, ConversationMessage[]> = {};

  /**
   * Lista todos os agentes ativos
   */
  async listAgents(): Promise<AIAgent[]> {
    try {
      // Por enquanto, usar dados simulados
      return this.agents.filter(agent => agent.is_active);
    } catch (error) {
      console.error('Erro ao listar agentes:', error);
      return [];
    }
  }

  /**
   * Busca um agente por ID
   */
  async getAgent(agentId: string): Promise<AIAgent | null> {
    try {
      return this.agents.find(agent => agent.id === agentId && agent.is_active) || null;
    } catch (error) {
      console.error('Erro ao buscar agente:', error);
      return null;
    }
  }

  /**
   * Busca agente por tipo
   */
  async getAgentByType(type: string): Promise<AIAgent | null> {
    try {
      return this.agents.find(agent => agent.type === type && agent.is_active) || null;
    } catch (error) {
      console.error('Erro ao buscar agente por tipo:', error);
      return null;
    }
  }

  /**
   * Cria um novo agente
   */
  async createAgent(agentData: Omit<AIAgent, 'id' | 'created_at' | 'updated_at'>): Promise<AIAgent> {
    const now = new Date().toISOString();
    const agent: AIAgent = {
      id: crypto.randomUUID(),
      ...agentData,
      created_at: now,
      updated_at: now
    };

    this.agents.push(agent);
    this.saveToLocalStorage();
    return agent;
  }

  /**
   * Atualiza um agente existente
   */
  async updateAgent(agentId: string, agentData: Partial<AIAgent>): Promise<AIAgent> {
    const index = this.agents.findIndex(agent => agent.id === agentId);
    if (index === -1) {
      throw new Error('Agente não encontrado');
    }

    this.agents[index] = {
      ...this.agents[index],
      ...agentData,
      updated_at: new Date().toISOString()
    };

    this.saveToLocalStorage();
    return this.agents[index];
  }

  /**
   * Remove um agente (marca como inativo)
   */
  async deleteAgent(agentId: string): Promise<void> {
    const index = this.agents.findIndex(agent => agent.id === agentId);
    if (index !== -1) {
      this.agents[index].is_active = false;
      this.saveToLocalStorage();
    }
  }

  /**
   * Processa mensagem com um agente
   */
  async sendMessage(request: AgentRequest): Promise<AgentResponse> {
    // Buscar o agente
    const agent = await this.getAgent(request.agent_id);
    if (!agent) {
      throw new Error(`Agente ${request.agent_id} não encontrado`);
    }

    // Salvar mensagem do usuário
    if (request.session_id) {
      await this.saveMessage(request.session_id, 'user', request.message, request.context);
    }

    try {
      // Usar o OpenAI service existente
      const openAIAgents = openaiService.getInsuranceAgents();
      
      // Mapear tipo do agente para configuração OpenAI
      const agentConfig = this.mapAgentTypeToOpenAI(agent.type) || {
        name: agent.name,
        systemPrompt: agent.system_prompt,
        temperature: request.options?.temperature || 0.7,
        maxTokens: request.options?.max_tokens || 2000
      };

      // Processar com OpenAI
      const response = await openaiService.processWithAgent(
        agentConfig,
        request.message,
        undefined, // documentText
        request.context
      );

      // Salvar resposta do assistente
      if (request.session_id) {
        await this.saveMessage(request.session_id, 'assistant', response.content, {
          agent_id: agent.id,
          agent_name: agent.name,
          usage: response.extractedData?.usage,
          confidence: response.confidence
        });
      }

      // Converter para formato AgentResponse
      return {
        id: crypto.randomUUID(),
        content: response.content,
        usage: response.extractedData?.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        },
        model: 'gpt-4o-mini',
        finish_reason: 'stop',
        metadata: {
          agent_id: agent.id,
          agent_name: agent.name,
          agent_type: agent.type
        },
        extractedData: response.extractedData,
        confidence: response.confidence,
        validations: response.validations,
        recommendations: response.recommendations,
        citations: (response.citations || []).map(c => typeof c === 'string' ? c : c.text || '')
      };

    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      throw error;
    }
  }

  /**
   * Mapeia tipo de agente para configuração OpenAI
   */
  private mapAgentTypeToOpenAI(agentType: string) {
    const openAIAgents = openaiService.getInsuranceAgents();
    
    const mapping: Record<string, any> = {
      'claims': openAIAgents.claimsProcessor,
      'fraud': openAIAgents.fraudDetector,
      'underwriting': openAIAgents.underwritingAssistant,
      'legal': openAIAgents.contractReviewer,
      'customer': openAIAgents.customerAssistant,
      'policy': openAIAgents.policyAnalyzer
    };

    return mapping[agentType];
  }

  /**
   * Salva mensagem na conversa
   */
  async saveMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      if (!this.conversations[sessionId]) {
        this.conversations[sessionId] = [];
      }

      const message: ConversationMessage = {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: new Date().toISOString(),
        metadata
      };

      this.conversations[sessionId].push(message);
      this.saveToLocalStorage();
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
    }
  }

  /**
   * Busca conversas de uma sessão
   */
  async getConversationMessages(sessionId: string): Promise<ConversationMessage[]> {
    try {
      return this.conversations[sessionId] || [];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      return [];
    }
  }

  /**
   * Comunicação entre agentes (A2A)
   */
  async agentToAgentCommunication(
    fromAgentId: string,
    toAgentId: string,
    message: string,
    context?: Record<string, any>
  ): Promise<AgentResponse> {
    const fromAgent = await this.getAgent(fromAgentId);
    const toAgent = await this.getAgent(toAgentId);

    if (!fromAgent || !toAgent) {
      throw new Error('Agente(s) não encontrado(s) para comunicação A2A');
    }

    // Criar contexto de comunicação A2A
    const a2aContext = {
      ...context,
      communication_type: 'agent_to_agent',
      from_agent: {
        id: fromAgent.id,
        name: fromAgent.name,
        type: fromAgent.type
      },
      to_agent: {
        id: toAgent.id,
        name: toAgent.name,
        type: toAgent.type
      }
    };

    // Formatar mensagem para comunicação A2A
    const a2aMessage = `
Comunicação entre agentes:
De: ${fromAgent.name} (${fromAgent.type})
Para: ${toAgent.name} (${toAgent.type})

Mensagem: ${message}

Responda como ${toAgent.name} baseado em sua especialização.
`;

    return await this.sendMessage({
      agent_id: toAgentId,
      message: a2aMessage,
      context: a2aContext
    });
  }

  /**
   * Workflow colaborativo entre múltiplos agentes
   */
  async collaborativeWorkflow(
    agentIds: string[],
    initialMessage: string,
    context?: Record<string, any>
  ): Promise<AgentResponse[]> {
    const results: AgentResponse[] = [];
    let currentContext = { ...context };

    for (let i = 0; i < agentIds.length; i++) {
      const agentId = agentIds[i];
      const isFirst = i === 0;
      const isLast = i === agentIds.length - 1;

      // Primeira iteração usa mensagem inicial
      let message = isFirst ? initialMessage : 
        `Baseado na análise anterior, continue o processamento:\n\n${results[i-1].content}`;

      const result = await this.sendMessage({
        agent_id: agentId,
        message,
        context: currentContext
      });

      results.push(result);

      // Atualizar contexto para próximo agente
      if (!isLast) {
        currentContext = {
          ...currentContext,
          [`step_${i}_result`]: result.content,
          [`step_${i}_agent`]: result.metadata?.agent_name,
          [`step_${i}_data`]: result.extractedData
        };
      }
    }

    return results;
  }

  /**
   * Criar agentes padrão do sistema
   */
  async createDefaultAgents(): Promise<AIAgent[]> {
    const defaultAgents = [
      {
        name: 'Aura - Processador de Sinistros',
        description: 'Especialista em análise e processamento de sinistros de seguros',
        type: 'claims',
        system_prompt: `Você é Aura, um especialista em processamento de sinistros de seguros. 
        Analise documentos, avalie coberturas, calcule indenizações e identifique possíveis fraudes.
        Seja preciso, objetivo e sempre baseie suas análises em dados concretos.`,
        capabilities: ['document-analysis', 'claim-processing', 'fraud-detection', 'coverage-analysis'],
        avatar_url: null,
        is_active: true
      },
      {
        name: 'Detector de Fraudes',
        description: 'Identificação de padrões suspeitos e análise de risco',
        type: 'fraud',
        system_prompt: `Você é um especialista em detecção de fraudes em seguros.
        Analise padrões suspeitos, inconsistências em documentos e comportamentos anômalos.
        Forneça scores de risco e recomendações de investigação.`,
        capabilities: ['fraud-detection', 'risk-analysis', 'pattern-recognition'],
        avatar_url: null,
        is_active: true
      },
      {
        name: 'Assistente de Subscrição',
        description: 'Análise de riscos e aprovação de apólices',
        type: 'underwriting',
        system_prompt: `Você é um assistente de subscrição especializado em análise de riscos.
        Avalie propostas de seguro, calcule prêmios e determine termos de cobertura.
        Considere fatores de risco e regulamentações aplicáveis.`,
        capabilities: ['risk-assessment', 'policy-analysis', 'premium-calculation'],
        avatar_url: null,
        is_active: true
      }
    ];

    const createdAgents: AIAgent[] = [];

    for (const agentData of defaultAgents) {
      try {
        // Verificar se agente já existe
        const existing = await this.getAgentByType(agentData.type);
        if (!existing) {
          const agent = await this.createAgent(agentData);
          createdAgents.push(agent);
        }
      } catch (error) {
        console.error(`Erro ao criar agente ${agentData.name}:`, error);
      }
    }

    return createdAgents;
  }

  /**
   * Obter estatísticas de uso dos agentes
   */
  async getAgentStatistics(): Promise<{
    totalAgents: number;
    activeAgents: number;
    totalConversations: number;
    conversationsToday: number;
  }> {
    try {
      const totalAgents = this.agents.length;
      const activeAgents = this.agents.filter(agent => agent.is_active).length;
      const totalConversations = Object.values(this.conversations).reduce((total, messages) => total + messages.length, 0);
      
      const today = new Date().toISOString().split('T')[0];
      const conversationsToday = Object.values(this.conversations)
        .flat()
        .filter(msg => msg.timestamp.startsWith(today)).length;

      return {
        totalAgents,
        activeAgents,
        totalConversations,
        conversationsToday
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalAgents: 0,
        activeAgents: 0,
        totalConversations: 0,
        conversationsToday: 0
      };
    }
  }

  /**
   * Salvar dados no localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('ai_agents', JSON.stringify(this.agents));
      localStorage.setItem('ai_conversations', JSON.stringify(this.conversations));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  }

  /**
   * Carregar dados do localStorage
   */
  loadFromLocalStorage(): void {
    try {
      const savedAgents = localStorage.getItem('ai_agents');
      const savedConversations = localStorage.getItem('ai_conversations');

      if (savedAgents) {
        this.agents = JSON.parse(savedAgents);
      }

      if (savedConversations) {
        this.conversations = JSON.parse(savedConversations);
      }
    } catch (error) {
      console.error('Erro ao carregar do localStorage:', error);
    }
  }

  /**
   * Inicializar o serviço
   */
  initialize(): void {
    this.loadFromLocalStorage();
  }
}

export const aiAgentService = new AIAgentService();

// Inicializar o serviço
aiAgentService.initialize();
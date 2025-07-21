
/**
 * Adaptador para integrar Evo AI com o sistema existente
 */

import { evoAIService } from './evoAIService';
import { openaiService, AgentResponse } from '../openaiService';
import { agentOptimizer, TaskRequirements } from '../agentOptimizer';

export interface HybridAgentConfig {
  useEvoAI: boolean;
  fallbackToOpenAI: boolean;
  preferredProvider: 'evoai' | 'openai' | 'auto';
}

class EvoAIAdapter {
  private config: HybridAgentConfig = {
    useEvoAI: false,
    fallbackToOpenAI: true,
    preferredProvider: 'auto'
  };

  /**
   * Configura o adaptador híbrido
   */
  configure(config: Partial<HybridAgentConfig>) {
    this.config = { ...this.config, ...config };
    localStorage.setItem('evoai_adapter_config', JSON.stringify(this.config));
  }

  /**
   * Carrega configuração salva
   */
  loadConfig() {
    const saved = localStorage.getItem('evoai_adapter_config');
    if (saved) {
      this.config = { ...this.config, ...JSON.parse(saved) };
    }
  }

  /**
   * Verifica se o Evo AI está disponível
   */
  async isEvoAIAvailable(): Promise<boolean> {
    try {
      return await evoAIService.healthCheck();
    } catch {
      return false;
    }
  }

  /**
   * Seleciona o provedor baseado na configuração e disponibilidade
   */
  async selectProvider(taskRequirements?: TaskRequirements): Promise<'evoai' | 'openai'> {
    const evoAIAvailable = await this.isEvoAIAvailable();

    switch (this.config.preferredProvider) {
      case 'evoai':
        return evoAIAvailable ? 'evoai' : 'openai';
      
      case 'openai':
        return 'openai';
      
      case 'auto':
        // Lógica inteligente de seleção
        if (!evoAIAvailable) return 'openai';
        
        // Se tem requisitos específicos, usar otimizador
        if (taskRequirements) {
          const complexity = taskRequirements.complexity;
          const urgency = taskRequirements.urgency;
          
          // Para tarefas urgentes e simples, usar OpenAI (mais rápido)
          if (urgency === 'urgent' && complexity === 'low') {
            return 'openai';
          }
          
          // Para tarefas complexas, usar Evo AI (mais capaz)
          if (complexity === 'high') {
            return 'evoai';
          }
        }
        
        // Default para Evo AI se disponível
        return 'evoai';
      
      default:
        return evoAIAvailable ? 'evoai' : 'openai';
    }
  }

  /**
   * Mapeia agentes OpenAI para Evo AI
   */
  private mapAgentToEvoAI(agentType: string): string {
    const agentMapping: Record<string, string> = {
      'claims-processor': 'processador-sinistros',
      'fraud-detector': 'detector-fraudes',
      'underwriting-assistant': 'assistente-subscricao',
      'policy-analyzer': 'analisador-apolices',
      'contract-reviewer': 'revisor-contratos',
      'customer-assistant': 'assistente-cliente'
    };

    return agentMapping[agentType] || agentType;
  }

  /**
   * Processa mensagem com agente híbrido
   */
  async processWithHybridAgent(
    agentType: string,
    userMessage: string,
    documentText?: string,
    context?: Record<string, any>,
    taskRequirements?: TaskRequirements
  ): Promise<AgentResponse> {
    this.loadConfig();
    
    const provider = await this.selectProvider(taskRequirements);
    
    console.log(`Usando provedor: ${provider} para agente: ${agentType}`);

    try {
      if (provider === 'evoai') {
        return await this.processWithEvoAI(agentType, userMessage, documentText, context);
      } else {
        return await this.processWithOpenAI(agentType, userMessage, documentText, context);
      }
    } catch (error) {
      console.error(`Erro no provedor ${provider}:`, error);
      
      // Fallback automático se configurado
      if (this.config.fallbackToOpenAI && provider === 'evoai') {
        console.log('Fazendo fallback para OpenAI...');
        return await this.processWithOpenAI(agentType, userMessage, documentText, context);
      }
      
      throw error;
    }
  }

  /**
   * Processa com Evo AI
   */
  private async processWithEvoAI(
    agentType: string,
    userMessage: string,
    documentText?: string,
    context?: Record<string, any>
  ): Promise<AgentResponse> {
    const evoAgentId = this.mapAgentToEvoAI(agentType);
    
    // Construir mensagem completa
    let fullMessage = userMessage;
    if (documentText) {
      fullMessage += `\n\nDocumento para análise:\n${documentText}`;
    }
    if (context) {
      fullMessage += `\n\nContexto adicional: ${JSON.stringify(context, null, 2)}`;
    }

    const response = await evoAIService.sendMessage({
      agentId: evoAgentId,
      message: fullMessage,
      context,
      options: {
        maxTokens: 2000,
        temperature: 0.3
      }
    });

    // Converter resposta do Evo AI para formato AgentResponse
    return {
      content: response.content,
      extractedData: response.metadata || {},
      confidence: 0.9, // Evo AI não retorna confidence diretamente
      validations: [{
        field: 'evoai',
        status: 'success' as const,
        message: `Processado com Evo AI - Modelo: ${response.model}`
      }],
      recommendations: [
        'Resultado processado pelo Evo AI',
        `Tokens utilizados: ${response.usage.totalTokens}`
      ],
      citations: []
    };
  }

  /**
   * Processa com OpenAI (método existente)
   */
  private async processWithOpenAI(
    agentType: string,
    userMessage: string,
    documentText?: string,
    context?: Record<string, any>
  ): Promise<AgentResponse> {
    const agents = openaiService.getInsuranceAgents();
    const agentConfig = agents[agentType] || agents.claimsProcessor;

    return await openaiService.processWithAgent(
      agentConfig,
      userMessage,
      documentText,
      context
    );
  }

  /**
   * Comunicação entre agentes (A2A) usando Evo AI
   */
  async agentToAgentCommunication(
    fromAgentType: string,
    toAgentType: string,
    message: string,
    context?: Record<string, any>
  ): Promise<AgentResponse> {
    const evoAIAvailable = await this.isEvoAIAvailable();
    
    if (!evoAIAvailable) {
      throw new Error('Comunicação A2A requer Evo AI ativo');
    }

    const fromAgentId = this.mapAgentToEvoAI(fromAgentType);
    const toAgentId = this.mapAgentToEvoAI(toAgentType);

    const response = await evoAIService.agentToAgentCommunication(
      fromAgentId,
      toAgentId,
      message,
      context
    );

    return {
      content: response.content,
      extractedData: response.metadata || {},
      confidence: 0.9,
      validations: [{
        field: 'a2a',
        status: 'success' as const,
        message: `Comunicação A2A: ${fromAgentType} → ${toAgentType}`
      }],
      recommendations: [`Resposta de ${toAgentType} via comunicação A2A`],
      citations: []
    };
  }

  /**
   * Workflow colaborativo entre múltiplos agentes
   */
  async collaborativeWorkflow(
    agents: string[],
    initialMessage: string,
    context?: Record<string, any>
  ): Promise<AgentResponse[]> {
    const results: AgentResponse[] = [];
    let currentContext = { ...context };

    for (let i = 0; i < agents.length; i++) {
      const agentType = agents[i];
      const isFirst = i === 0;
      const isLast = i === agents.length - 1;

      // Primeira iteração usa mensagem inicial
      let message = isFirst ? initialMessage : 
        `Baseado na análise anterior, continue o processamento: ${results[i-1].content}`;

      const result = await this.processWithHybridAgent(
        agentType,
        message,
        undefined,
        currentContext
      );

      results.push(result);

      // Atualizar contexto para próximo agente
      if (!isLast) {
        currentContext = {
          ...currentContext,
          [`step_${i}_result`]: result.content,
          [`step_${i}_data`]: result.extractedData
        };
      }
    }

    return results;
  }

  /**
   * Obter estatísticas de uso
   */
  getUsageStats(): {
    evoAIUsage: number;
    openAIUsage: number;
    totalRequests: number;
    successRate: number;
  } {
    // Implementar tracking de uso
    const stats = localStorage.getItem('hybrid_agent_stats');
    if (stats) {
      return JSON.parse(stats);
    }

    return {
      evoAIUsage: 0,
      openAIUsage: 0,
      totalRequests: 0,
      successRate: 0
    };
  }
}

export const evoAIAdapter = new EvoAIAdapter();

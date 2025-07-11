/**
 * Concierge AI - Assistente Virtual Inteligente com orquestração de comandos
 */

import { llmService } from './llmService';
import { pipelineOrchestrator } from './pipelineOrchestrator';

export interface ConciergeRequest {
  message: string;
  context: {
    userId?: string;
    sessionId?: string;
    userRole?: string;
    previousContext?: any;
    availableActions?: string[];
  };
  attachments?: Array<{
    type: 'document' | 'image';
    data: string;
    name: string;
  }>;
}

export interface ConciergeResponse {
  response: string;
  intent: {
    type: 'question' | 'action' | 'analysis' | 'navigation' | 'help';
    confidence: number;
    parameters?: Record<string, any>;
  };
  suggestedActions?: Array<{
    id: string;
    label: string;
    description: string;
    actionType: 'navigate' | 'trigger_pipeline' | 'request_document' | 'schedule_task';
    parameters?: any;
  }>;
  contextUpdate?: any;
  requiresEscalation?: boolean;
  escalationReason?: string;
  persona: 'olga' | 'manus' | 'specialized_agent';
}

export interface ActionRequest {
  actionId: string;
  parameters: any;
  userId: string;
  sessionId: string;
}

export interface ActionResult {
  success: boolean;
  result?: any;
  message: string;
  newContext?: any;
}

class ConciergeAI {
  private knowledgeBase: Map<string, any> = new Map();
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private actionHandlers: Map<string, (params: any, context: any) => Promise<ActionResult>> = new Map();
  private userSessions: Map<string, any> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeIntentPatterns();
    this.initializeActionHandlers();
  }

  private initializeKnowledgeBase() {
    // Base de conhecimento sobre seguros brasileiros
    this.knowledgeBase.set('coberturas_basicas', {
      auto: ['Colisão', 'Roubo/Furto', 'Incêndio', 'Fenômenos da Natureza', 'Danos a Terceiros'],
      residencial: ['Incêndio', 'Roubo', 'Danos Elétricos', 'Vendaval', 'Responsabilidade Civil'],
      vida: ['Morte Natural', 'Morte Acidental', 'Invalidez Permanente', 'Doenças Graves']
    });

    this.knowledgeBase.set('procedimentos_sinistro', {
      passos: [
        'Comunicar o sinistro em até 30 dias',
        'Apresentar documentação completa',
        'Aguardar vistoria (se aplicável)',
        'Acompanhar análise da seguradora',
        'Receber indenização ou reparo'
      ],
      documentos_necessarios: [
        'Aviso de sinistro preenchido',
        'Cópia da apólice',
        'Documento de identidade',
        'Boletim de ocorrência (quando aplicável)',
        'Orçamentos de reparo (quando aplicável)'
      ]
    });

    this.knowledgeBase.set('regulamentacao_susep', {
      prazos: {
        comunicacao_sinistro: '30 dias',
        analise_documentos: '30 dias',
        pagamento_indenizacao: '30 dias'
      },
      direitos_segurado: [
        'Receber cópia da apólice',
        'Contestar decisões',
        'Solicitar segunda opinião',
        'Recorrer à SUSEP'
      ]
    });
  }

  private initializeIntentPatterns() {
    // Padrões para identificar intenções
    this.intentPatterns.set('question', [
      /^(como|qual|quando|onde|por que|o que)/i,
      /(dúvida|pergunta|informação|esclarecimento)/i,
      /(posso|consigo|é possível)/i
    ]);

    this.intentPatterns.set('action', [
      /(solicitar|processar|analisar|enviar|submeter)/i,
      /(quero|preciso|gostaria)/i,
      /(abrir|criar|iniciar|começar)/i
    ]);

    this.intentPatterns.set('analysis', [
      /(analise|verifique|examine|avalie)/i,
      /(documento|sinistro|apólice|contrato)/i,
      /(fraude|risco|cobertura)/i
    ]);

    this.intentPatterns.set('navigation', [
      /(ir para|navegar|acessar|abrir)/i,
      /(página|seção|dashboard|relatório)/i,
      /(mostrar|exibir|visualizar)/i
    ]);

    this.intentPatterns.set('help', [
      /(ajuda|help|socorro|não sei)/i,
      /(como funciona|como usar)/i,
      /(tutorial|guia|instruções)/i
    ]);
  }

  private initializeActionHandlers() {
    // Handlers para diferentes tipos de ação

    // Navegação
    this.actionHandlers.set('navigate_to_dashboard', async (params) => ({
      success: true,
      message: 'Redirecionando para o dashboard...',
      result: { route: '/dashboard' }
    }));

    this.actionHandlers.set('navigate_to_claims', async (params) => ({
      success: true,
      message: 'Abrindo lista de sinistros...',
      result: { route: '/claims' }
    }));

    // Análise de documentos
    this.actionHandlers.set('analyze_document', async (params, context) => {
      try {
        const pipelineId = await pipelineOrchestrator.startPipeline('document_analysis', {
          documents: params.documents,
          type: params.analysisType || 'general'
        });

        return {
          success: true,
          message: 'Análise de documento iniciada com sucesso!',
          result: { pipelineId, status: 'started' },
          newContext: { activePipeline: pipelineId }
        };
      } catch (error) {
        return {
          success: false,
          message: `Erro ao iniciar análise: ${error}`,
        };
      }
    });

    // Processamento de sinistros
    this.actionHandlers.set('process_claim', async (params, context) => {
      try {
        const pipelineId = await pipelineOrchestrator.startPipeline('claim_processing', {
          claimData: params.claimData,
          documents: params.documents,
          priority: params.priority || 'normal'
        });

        return {
          success: true,
          message: 'Processamento de sinistro iniciado!',
          result: { pipelineId, status: 'processing' },
          newContext: { activeClaimPipeline: pipelineId }
        };
      } catch (error) {
        return {
          success: false,
          message: `Erro ao processar sinistro: ${error}`,
        };
      }
    });

    // Análise de subscrição
    this.actionHandlers.set('underwriting_analysis', async (params, context) => {
      try {
        const pipelineId = await pipelineOrchestrator.startPipeline('underwriting', {
          applicationData: params.applicationData,
          documents: params.documents
        });

        return {
          success: true,
          message: 'Análise de subscrição iniciada!',
          result: { pipelineId, status: 'analyzing' },
          newContext: { activeUnderwritingPipeline: pipelineId }
        };
      } catch (error) {
        return {
          success: false,
          message: `Erro na análise de subscrição: ${error}`,
        };
      }
    });

    // Solicitar documentos
    this.actionHandlers.set('request_document', async (params, context) => {
      // Simular solicitação de documento
      return {
        success: true,
        message: `Solicitação de ${params.documentType} enviada ao cliente.`,
        result: {
          requestId: `REQ-${Date.now()}`,
          documentType: params.documentType,
          status: 'pending'
        }
      };
    });
  }

  async processMessage(request: ConciergeRequest): Promise<ConciergeResponse> {
    try {
      const { message, context, attachments } = request;
      
      // Detectar intenção
      const intent = this.detectIntent(message);
      
      // Recuperar contexto da sessão
      const sessionContext = this.getUserSession(context.sessionId || 'default');
      
      // Processar com LLM
      const llmResponse = await llmService.handleCustomerQuery(message, {
        ...context,
        ...sessionContext,
        intent,
        knowledgeBase: this.getRelevantKnowledge(message),
        attachments: attachments?.length || 0
      });

      // Gerar ações sugeridas
      const suggestedActions = this.generateSuggestedActions(intent, message, context);
      
      // Determinar persona
      const persona = this.selectPersona(intent, context);
      
      // Verificar necessidade de escalação
      const escalation = this.assessEscalationNeed(intent, llmResponse, context);

      // Atualizar contexto da sessão
      const contextUpdate = {
        lastMessage: message,
        lastIntent: intent.type,
        timestamp: new Date().toISOString(),
        ...(attachments?.length ? { hasAttachments: true } : {})
      };

      this.updateUserSession(context.sessionId || 'default', contextUpdate);

      return {
        response: this.formatResponse(llmResponse.response, persona),
        intent,
        suggestedActions,
        contextUpdate,
        requiresEscalation: escalation.required,
        escalationReason: escalation.reason,
        persona
      };
    } catch (error) {
      return {
        response: 'Desculpe, houve um erro interno. Nossa equipe técnica foi notificada.',
        intent: { type: 'help', confidence: 0.1 },
        requiresEscalation: true,
        escalationReason: 'Erro técnico do sistema',
        persona: 'olga'
      };
    }
  }

  async executeAction(actionRequest: ActionRequest): Promise<ActionResult> {
    const { actionId, parameters, userId, sessionId } = actionRequest;
    
    const handler = this.actionHandlers.get(actionId);
    if (!handler) {
      return {
        success: false,
        message: `Ação ${actionId} não encontrada.`
      };
    }

    const context = this.getUserSession(sessionId);
    
    try {
      const result = await handler(parameters, context);
      
      // Atualizar contexto se fornecido
      if (result.newContext) {
        this.updateUserSession(sessionId, result.newContext);
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: `Erro ao executar ação: ${error}`
      };
    }
  }

  private detectIntent(message: string): { type: 'question' | 'action' | 'analysis' | 'navigation' | 'help'; confidence: number; parameters?: Record<string, any> } {
    const messageLower = message.toLowerCase();
    let bestMatch: { type: 'question' | 'action' | 'analysis' | 'navigation' | 'help'; confidence: number } = { type: 'question', confidence: 0.5 };
    
    for (const [intentType, patterns] of this.intentPatterns.entries()) {
      for (const pattern of patterns) {
        if (pattern.test(messageLower)) {
          const confidence = this.calculateIntentConfidence(messageLower, pattern);
          if (confidence > bestMatch.confidence) {
            bestMatch = { type: intentType as any, confidence };
          }
        }
      }
    }

    // Extrair parâmetros específicos
    const parameters = this.extractParameters(message, bestMatch.type);
    
    return { ...bestMatch, parameters };
  }

  private calculateIntentConfidence(message: string, pattern: RegExp): number {
    const match = message.match(pattern);
    if (!match) return 0;
    
    // Confiança baseada no tamanho do match e posição na frase
    let confidence = 0.6;
    
    if (match.index === 0) confidence += 0.2; // Começa com o padrão
    if (match[0].length > 5) confidence += 0.1; // Match longo
    
    return Math.min(confidence, 0.95);
  }

  private extractParameters(message: string, intentType: string): Record<string, any> {
    const parameters: Record<string, any> = {};
    
    // Extrair valores monetários
    const moneyMatch = message.match(/R\$\s*([\d.,]+)/);
    if (moneyMatch) {
      parameters.valor = moneyMatch[1];
    }
    
    // Extrair datas
    const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (dateMatch) {
      parameters.data = dateMatch[1];
    }
    
    // Extrair tipos de documento
    const docTypes = ['rg', 'cpf', 'cnh', 'laudo', 'orçamento', 'nota fiscal'];
    for (const docType of docTypes) {
      if (message.toLowerCase().includes(docType)) {
        parameters.tipoDocumento = docType;
        break;
      }
    }
    
    return parameters;
  }

  private getRelevantKnowledge(message: string): any {
    const relevantKnowledge: any = {};
    
    if (message.toLowerCase().includes('cobertura')) {
      relevantKnowledge.coberturas = this.knowledgeBase.get('coberturas_basicas');
    }
    
    if (message.toLowerCase().includes('sinistro')) {
      relevantKnowledge.procedimentos = this.knowledgeBase.get('procedimentos_sinistro');
    }
    
    if (message.toLowerCase().includes('regulamentação') || message.toLowerCase().includes('susep')) {
      relevantKnowledge.regulamentacao = this.knowledgeBase.get('regulamentacao_susep');
    }
    
    return relevantKnowledge;
  }

  private generateSuggestedActions(intent: any, message: string, context: any): Array<any> {
    const actions: Array<any> = [];
    
    switch (intent.type) {
      case 'analysis':
        if (message.toLowerCase().includes('documento')) {
          actions.push({
            id: 'analyze_document',
            label: 'Analisar Documento',
            description: 'Iniciar análise automática do documento',
            actionType: 'trigger_pipeline',
            parameters: { analysisType: 'document' }
          });
        }
        break;
        
      case 'action':
        if (message.toLowerCase().includes('sinistro')) {
          actions.push({
            id: 'process_claim',
            label: 'Processar Sinistro',
            description: 'Iniciar processamento de sinistro',
            actionType: 'trigger_pipeline'
          });
        }
        break;
        
      case 'navigation':
        actions.push({
          id: 'navigate_to_dashboard',
          label: 'Ir para Dashboard',
          description: 'Acessar painel principal',
          actionType: 'navigate',
          parameters: { route: '/dashboard' }
        });
        break;
    }
    
    // Ações comuns sempre disponíveis
    actions.push({
      id: 'request_document',
      label: 'Solicitar Documento',
      description: 'Solicitar documento adicional',
      actionType: 'request_document'
    });
    
    return actions;
  }

  private selectPersona(intent: any, context: any): 'olga' | 'manus' | 'specialized_agent' {
    // Lógica para selecionar persona baseada no contexto
    if (intent.type === 'analysis' || context.userRole === 'analyst') {
      return 'manus';
    }
    
    if (context.userRole === 'specialist' || intent.confidence < 0.7) {
      return 'specialized_agent';
    }
    
    return 'olga'; // Padrão
  }

  private assessEscalationNeed(intent: any, llmResponse: any, context: any): { required: boolean; reason?: string } {
    // Critérios para escalação humana
    if (intent.confidence < 0.3) {
      return { required: true, reason: 'Intenção não identificada claramente' };
    }
    
    if (llmResponse.confidence < 0.5) {
      return { required: true, reason: 'Resposta com baixa confiança' };
    }
    
    // Palavras-chave que indicam necessidade de revisão humana
    const escalationKeywords = ['judicial', 'processo', 'advogado', 'fraude grave', 'compliance'];
    const message = context.lastMessage || '';
    
    if (escalationKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      return { required: true, reason: 'Questão que requer revisão especializada' };
    }
    
    return { required: false };
  }

  private formatResponse(response: string, persona: string): string {
    const personalities = {
      olga: {
        prefix: 'Olá! Sou a Olga, sua assistente virtual. ',
        tone: 'amigável e profissional'
      },
      manus: {
        prefix: 'Aqui é o Manus, especialista em análises. ',
        tone: 'técnico e detalhado'
      },
      specialized_agent: {
        prefix: 'Falo como agente especializado. ',
        tone: 'formal e preciso'
      }
    };
    
    const personality = personalities[persona as keyof typeof personalities];
    
    // Se a resposta já tem personalidade, retornar como está
    if (response.toLowerCase().startsWith('olá') || response.toLowerCase().startsWith('oi')) {
      return response;
    }
    
    return `${personality.prefix}${response}`;
  }

  private getUserSession(sessionId: string): any {
    return this.userSessions.get(sessionId) || {};
  }

  private updateUserSession(sessionId: string, updates: any): void {
    const current = this.getUserSession(sessionId);
    this.userSessions.set(sessionId, { ...current, ...updates });
  }

  // Métodos públicos para integração
  async handleChatMessage(message: string, context: any): Promise<ConciergeResponse> {
    return await this.processMessage({
      message,
      context: context || {},
      attachments: []
    });
  }

  async handleDocumentAnalysis(documents: any[], context: any): Promise<ConciergeResponse> {
    return await this.processMessage({
      message: 'Analisar documentos anexados',
      context: context || {},
      attachments: documents.map(doc => ({
        type: 'document' as const,
        data: doc.content || '',
        name: doc.name
      }))
    });
  }

  getAvailableActions(): Array<{ id: string; description: string }> {
    const actions: Array<{ id: string; description: string }> = [];
    
    for (const [actionId] of this.actionHandlers) {
      // Mapear descrições das ações
      const descriptions: Record<string, string> = {
        'navigate_to_dashboard': 'Navegar para o dashboard principal',
        'navigate_to_claims': 'Acessar lista de sinistros',
        'analyze_document': 'Analisar documento com IA',
        'process_claim': 'Processar sinistro completo',
        'underwriting_analysis': 'Análise de subscrição',
        'request_document': 'Solicitar documento ao cliente'
      };
      
      actions.push({
        id: actionId,
        description: descriptions[actionId] || `Ação: ${actionId}`
      });
    }
    
    return actions;
  }
}

export const conciergeAI = new ConciergeAI();
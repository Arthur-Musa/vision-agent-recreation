/**
 * Serviço de LLM - Coordena diferentes modelos de linguagem
 */

import { openaiService } from '../openaiService';

export interface LLMRequest {
  type: 'analysis' | 'extraction' | 'classification' | 'conversation' | 'decision';
  content: string;
  context?: any;
  model?: 'gpt-4' | 'gpt-3.5-turbo' | 'claude' | 'local';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface LLMResponse {
  response: string;
  confidence: number;
  model: string;
  tokensUsed: number;
  processingTime: number;
  extractedData?: any;
  classification?: any;
}

class LLMService {
  private modelEndpoints: Map<string, (request: LLMRequest) => Promise<LLMResponse>> = new Map();
  private promptTemplates: Map<string, string> = new Map();
  private cache: Map<string, LLMResponse> = new Map();

  constructor() {
    this.initializeModels();
    this.initializePrompts();
  }

  private initializeModels() {
    // OpenAI GPT models
    this.modelEndpoints.set('gpt-4', async (request: LLMRequest) => {
      return await this.callOpenAI(request, 'gpt-4.1-2025-04-14');
    });

    this.modelEndpoints.set('gpt-3.5-turbo', async (request: LLMRequest) => {
      return await this.callOpenAI(request, 'gpt-4.1-mini-2025-04-14');
    });

    // Placeholder para outros modelos
    this.modelEndpoints.set('claude', async (request: LLMRequest) => {
      // Implementar Claude API quando disponível
      throw new Error('Claude API não implementada ainda');
    });

    this.modelEndpoints.set('local', async (request: LLMRequest) => {
      // Implementar modelo local quando disponível
      throw new Error('Modelo local não implementado ainda');
    });
  }

  private initializePrompts() {
    this.promptTemplates.set('document_analysis', `
Você é um especialista em análise de documentos de seguros. Analise o seguinte documento e extraia informações estruturadas.

Documento: {content}

Por favor, extraia as seguintes informações se estiverem disponíveis:
- Tipo de documento
- Número da apólice/sinistro
- Data do incidente
- Valor reclamado
- Nome do segurado
- Descrição do sinistro
- Localização do incidente

Responda em formato JSON com os campos encontrados.
`);

    this.promptTemplates.set('fraud_analysis', `
Você é um especialista em detecção de fraudes em seguros. Analise as seguintes informações e identifique possíveis indicadores de fraude.

Dados do Sinistro: {content}

Considere os seguintes fatores:
- Inconsistências nas datas
- Valores desproporcionais
- Padrões suspeitos na descrição
- Histórico do segurado (se disponível)

Forneça:
1. Score de fraude (0-100)
2. Principais indicadores identificados
3. Recomendações de investigação
4. Nível de confiança da análise

Responda em formato JSON estruturado.
`);

    this.promptTemplates.set('risk_assessment', `
Você é um analista de riscos de seguros. Avalie o risco baseado nas informações fornecidas.

Informações: {content}

Analise:
- Perfil de risco do segurado
- Histórico de sinistros
- Fatores de risco específicos
- Adequação da cobertura

Forneça:
1. Score de risco (1-10)
2. Fatores de risco identificados
3. Recomendações de prêmio
4. Condições especiais sugeridas

Responda em formato JSON.
`);

    this.promptTemplates.set('customer_service', `
Você é Olga, assistente virtual especializada em seguros. Responda de forma amigável e profissional.

Contexto do cliente: {context}
Pergunta: {content}

Base de conhecimento:
- Coberturas básicas de seguros
- Procedimentos de sinistros
- Renovações e alterações
- Regulamentações SUSEP

Forneça uma resposta clara e útil. Se necessário, sugira próximos passos ou encaminhamentos.
`);

    this.promptTemplates.set('contract_analysis', `
Você é um especialista em análise de contratos de seguros. Analise o seguinte contrato/apólice.

Contrato: {content}

Identifique:
- Coberturas incluídas
- Exclusões importantes
- Limites de indenização
- Carências e franquias
- Cláusulas especiais
- Pontos de atenção

Responda em formato estruturado e destaque pontos críticos.
`);
  }

  async processRequest(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now();
    
    // Verificar cache
    const cacheKey = this.generateCacheKey(request);
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      return { ...cached, processingTime: Date.now() - startTime };
    }

    // Selecionar modelo
    const model = request.model || 'gpt-4';
    const modelHandler = this.modelEndpoints.get(model);
    
    if (!modelHandler) {
      throw new Error(`Modelo ${model} não suportado`);
    }

    // Preparar prompt
    const preparedRequest = this.preparePrompt(request);

    try {
      const response = await modelHandler(preparedRequest);
      response.processingTime = Date.now() - startTime;
      
      // Cache se for análise ou classificação
      if (request.type === 'analysis' || request.type === 'classification') {
        this.cache.set(cacheKey, response);
      }
      
      return response;
    } catch (error) {
      throw new Error(`Erro no modelo ${model}: ${error}`);
    }
  }

  private preparePrompt(request: LLMRequest): LLMRequest {
    let systemPrompt = request.systemPrompt;
    
    // Usar template se disponível
    if (!systemPrompt) {
      const templateKey = this.getTemplateKey(request.type);
      const template = this.promptTemplates.get(templateKey);
      
      if (template) {
        systemPrompt = this.fillTemplate(template, {
          content: request.content,
          context: JSON.stringify(request.context || {}, null, 2)
        });
      }
    }

    return {
      ...request,
      systemPrompt: systemPrompt || this.getDefaultSystemPrompt(request.type)
    };
  }

  private async callOpenAI(request: LLMRequest, model: string): Promise<LLMResponse> {
    try {
      const messages = [
        {
          role: 'system' as const,
          content: request.systemPrompt || this.getDefaultSystemPrompt(request.type)
        },
        {
          role: 'user' as const,
          content: request.content
        }
      ];

      const response = await openaiService.generateCompletion(
        request.content,
        {
          model: model,
          temperature: request.temperature || 0.3,
          maxTokens: request.maxTokens || 2000,
          systemPrompt: request.systemPrompt
        }
      );

      let extractedData;
      let classification;

      // Tentar extrair JSON se for análise ou classificação
      if (request.type === 'analysis' || request.type === 'classification') {
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (request.type === 'analysis') {
              extractedData = parsed;
            } else {
              classification = parsed;
            }
          }
        } catch (e) {
          // JSON parsing falhou, continuar normalmente
        }
      }

      return {
        response,
        confidence: this.calculateConfidence(response, request.type),
        model,
        tokensUsed: this.estimateTokens(request.content + (request.systemPrompt || '')),
        processingTime: 0, // será preenchido no processRequest
        extractedData,
        classification
      };
    } catch (error) {
      throw new Error(`Erro na chamada OpenAI: ${error}`);
    }
  }

  private getTemplateKey(type: string): string {
    const mapping: Record<string, string> = {
      'analysis': 'document_analysis',
      'extraction': 'document_analysis',
      'classification': 'document_analysis',
      'conversation': 'customer_service',
      'decision': 'risk_assessment'
    };
    return mapping[type] || 'customer_service';
  }

  private fillTemplate(template: string, variables: Record<string, string>): string {
    let filled = template;
    Object.entries(variables).forEach(([key, value]) => {
      filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return filled;
  }

  private getDefaultSystemPrompt(type: string): string {
    const prompts: Record<string, string> = {
      'analysis': 'Você é um especialista em análise de documentos. Seja preciso e estruturado.',
      'extraction': 'Você é especialista em extração de dados. Extraia informações de forma estruturada.',
      'classification': 'Você é especialista em classificação. Categorize de forma precisa.',
      'conversation': 'Você é Olga, assistente virtual amigável e profissional.',
      'decision': 'Você é um analista de decisões. Seja objetivo e fundamentado.'
    };
    return prompts[type] || prompts.conversation;
  }

  private calculateConfidence(response: string, type: string): number {
    // Heurística simples para calcular confiança
    let confidence = 0.7;
    
    if (response.length > 100) confidence += 0.1;
    if (response.includes('JSON') || response.includes('{')) confidence += 0.1;
    if (type === 'conversation' && response.length > 50) confidence += 0.1;
    
    return Math.min(confidence, 0.95);
  }

  private estimateTokens(text: string): number {
    // Estimativa aproximada: ~4 caracteres por token
    return Math.ceil(text.length / 4);
  }

  private generateCacheKey(request: LLMRequest): string {
    const key = `${request.type}_${request.model}_${request.content.substring(0, 100)}`;
    return btoa(key).substring(0, 32);
  }

  // Métodos públicos para casos específicos
  async analyzeDocument(content: string, context?: any): Promise<LLMResponse> {
    return await this.processRequest({
      type: 'analysis',
      content,
      context,
      model: 'gpt-4'
    });
  }

  async detectFraud(claimData: any): Promise<LLMResponse> {
    return await this.processRequest({
      type: 'analysis',
      content: JSON.stringify(claimData, null, 2),
      systemPrompt: this.promptTemplates.get('fraud_analysis')
    });
  }

  async assessRisk(riskData: any): Promise<LLMResponse> {
    return await this.processRequest({
      type: 'decision',
      content: JSON.stringify(riskData, null, 2),
      systemPrompt: this.promptTemplates.get('risk_assessment')
    });
  }

  async handleCustomerQuery(query: string, context?: any): Promise<LLMResponse> {
    return await this.processRequest({
      type: 'conversation',
      content: query,
      context,
      model: 'gpt-3.5-turbo'
    });
  }

  async analyzeContract(contractText: string): Promise<LLMResponse> {
    return await this.processRequest({
      type: 'analysis',
      content: contractText,
      systemPrompt: this.promptTemplates.get('contract_analysis'),
      model: 'gpt-4'
    });
  }
}

export const llmService = new LLMService();
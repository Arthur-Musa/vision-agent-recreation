import OpenAI from 'openai';
import { config } from '@/config/environment';

export interface OpenAIAgentConfig {
  name: string;
  description: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  assistantId?: string; // ID do assistant criado na OpenAI Platform
}

export interface AgentResponse {
  content: string;
  extractedData?: Record<string, any>;
  confidence: number;
  validations: Array<{
    field: string;
    status: 'success' | 'warning' | 'error';
    message: string;
  }>;
  recommendations: string[];
  citations?: Array<{
    text: string;
    page: number;
    confidence: number;
  }>;
}

class OpenAIService {
  private client: OpenAI | null = null;
  
  private async callOpenAI(body: any): Promise<any> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const response = await supabase.functions.invoke('openai-proxy', { body });
    
    if (response.error) {
      throw new Error(`OpenAI API error: ${response.error.message || 'Unknown error'}`);
    }
    
    return response.data;
  }

  async processWithAgent(
    agentConfig: OpenAIAgentConfig,
    userMessage: string,
    documentText?: string,
    context?: Record<string, any>
  ): Promise<AgentResponse> {
    try {
      // Se tem assistantId, usar Assistant API
      if (agentConfig.assistantId) {
        return await this.processWithAssistant(
          agentConfig.assistantId,
          userMessage,
          agentConfig.name,
          documentText,
          context
        );
      }
      
      // Construir mensagens
      const messages: any[] = [
        {
          role: 'system',
          content: agentConfig.systemPrompt
        }
      ];

      // Adicionar contexto se fornecido
      if (context) {
        messages.push({
          role: 'user',
          content: `Contexto adicional: ${JSON.stringify(context, null, 2)}`
        });
      }

      // Adicionar texto do documento se fornecido
      if (documentText) {
        messages.push({
          role: 'user',
          content: `Documento para análise:\n\n${documentText}`
        });
      }

      // Adicionar mensagem do usuário
      messages.push({
        role: 'user',
        content: userMessage
      });

      const completion = await this.callOpenAI({
        endpoint: '/chat/completions',
        method: 'POST',
        body: {
          model: agentConfig.model,
          messages,
          temperature: agentConfig.temperature,
          max_tokens: agentConfig.maxTokens,
          response_format: { type: 'json_object' }
        }
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('Resposta vazia da OpenAI');
      }

      // Parse da resposta JSON
      const parsedResponse = JSON.parse(response);
      
      return {
        content: parsedResponse.content || parsedResponse.analysis || 'Análise concluída',
        extractedData: parsedResponse.extractedData || {},
        confidence: parsedResponse.confidence || 0.9,
        validations: parsedResponse.validations || [],
        recommendations: parsedResponse.recommendations || [],
        citations: parsedResponse.citations || []
      };

    } catch (error) {
      console.error('Erro ao processar com OpenAI:', error);
      
      // Fallback para resposta simulada em caso de erro
      return this.getFallbackResponse(agentConfig.name, userMessage);
    }
  }

  private async processWithAssistant(
    assistantId: string,
    userMessage: string,
    agentName: string,
    documentText?: string,
    context?: Record<string, any>
  ): Promise<AgentResponse> {
    try {
      // Construir mensagem completa
      let fullMessage = userMessage;
      
      if (context) {
        fullMessage += `\n\nContexto adicional: ${JSON.stringify(context, null, 2)}`;
      }
      
      if (documentText) {
        fullMessage += `\n\nDocumento para análise:\n\n${documentText}`;
      }
      
      // Chamar assistant via backend
      const response = await this.callOpenAI({
        assistantId,
        threadId: null, // Novo thread para cada interação
        body: {
          message: fullMessage,
          instructions: `Você é o agente ${agentName}. Responda sempre em JSON com a estrutura: {"content": "análise", "extractedData": {}, "confidence": 0.9, "validations": [], "recommendations": [], "citations": []}`
        }
      });

      if (response.error) {
        throw new Error(`Assistant API error: ${response.error}`);
      }

      // Parse da resposta do assistant
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response.content);
      } catch (e) {
        // Se não conseguir fazer parse, usar resposta direta
        parsedResponse = {
          content: response.content,
          extractedData: {},
          confidence: 0.9,
          validations: [],
          recommendations: [],
          citations: []
        };
      }

      return {
        content: parsedResponse.content || response.content,
        extractedData: parsedResponse.extractedData || {},
        confidence: parsedResponse.confidence || 0.9,
        validations: parsedResponse.validations || [{
          field: 'assistant',
          status: 'success' as const,
          message: `Processado com Assistant OpenAI: ${agentName}`
        }],
        recommendations: parsedResponse.recommendations || ['Resultado processado pelo assistant'],
        citations: parsedResponse.citations || []
      };
    } catch (error) {
      console.error('Erro ao processar com Assistant:', error);
      return this.getFallbackResponse(agentName, userMessage);
    }
  }

  private getFallbackResponse(agentName: string, userMessage: string): AgentResponse {
    return {
      content: `Serviço temporariamente indisponível. O agente ${agentName} processaria: ${userMessage}`,
      extractedData: {},
      confidence: 0.1,
      validations: [
        {
          field: 'sistema',
          status: 'warning',
          message: 'Usando modo offline - configure OpenAI API key'
        }
      ],
      recommendations: [
        'Configure a API key da OpenAI',
        'Verifique a conectividade',
        'Tente novamente em alguns minutos'
      ]
    };
  }

  async generateCompletion(
    prompt: string,
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      systemPrompt?: string;
    } = {}
  ): Promise<string> {
    try {
      const messages: any[] = [];
      
      if (options.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: prompt
      });

      const completion = await this.callOpenAI({
        endpoint: '/chat/completions',
        method: 'POST',
        body: {
          model: options.model || 'gpt-4o-mini',
          messages,
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 1000
        }
      });

      return completion.choices[0]?.message?.content || 'Sem resposta';
    } catch (error) {
      console.error('Erro ao gerar completion:', error);
      return 'Erro: Serviço temporariamente indisponível';
    }
  }

  async analyzeImageWithVision(
    base64Image: string,
    prompt: string,
    options: {
      model?: string;
      maxTokens?: number;
    } = {}
  ): Promise<string> {
    try {
      const completion = await this.callOpenAI({
        endpoint: '/chat/completions',
        method: 'POST',
        body: {
          model: options.model || 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                    detail: 'high'
                  }
                }
              ]
            }
          ],
          max_tokens: options.maxTokens || 2000,
          temperature: 0.1
        }
      });

      return completion.choices[0]?.message?.content || 'Análise não disponível';
    } catch (error) {
      console.error('Erro na análise de visão:', error);
      return 'Erro: Serviço de visão temporariamente indisponível';
    }
  }

  // Agentes pré-configurados para seguros brasileiros
  getInsuranceAgents(): Record<string, OpenAIAgentConfig> {
    // Agentes customizados serão gerenciados via backend se necessário
    const customAgents: Record<string, OpenAIAgentConfig> = {};
    
    // Agentes padrão (fallback)
    const defaultAgents = {
      claimsProcessor: {
        name: 'Processador de Sinistros',
        description: 'Analisa documentos de sinistro e extrai informações relevantes',
        model: 'gpt-4o-mini',
        temperature: 0.1,
        maxTokens: 2000,
        systemPrompt: `Você é um especialista em análise de sinistros de seguros no Brasil.

Suas responsabilidades:
1. Extrair informações estruturadas de documentos de sinistro
2. Validar consistência dos dados
3. Verificar conformidade com regulamentações brasileiras
4. Identificar possíveis fraudes
5. Recomendar próximos passos

Sempre responda em JSON com a estrutura:
{
  "content": "Análise detalhada em português",
  "extractedData": {
    "numeroSinistro": "string",
    "dataOcorrencia": "YYYY-MM-DD",
    "tipoSinistro": "string",
    "valorReclamado": "number",
    "segurado": "string",
    "localOcorrencia": "string"
  },
  "confidence": 0.95,
  "validations": [
    {
      "field": "nome_campo",
      "status": "success|warning|error",
      "message": "mensagem em português"
    }
  ],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "citations": [
    {
      "text": "texto extraído",
      "page": 1,
      "confidence": 0.9
    }
  ]
}`
      },

      fraudDetector: {
        name: 'Detector de Fraudes',
        description: 'Identifica indicadores de fraude em documentos',
        model: 'gpt-4o-mini',
        temperature: 0.1,
        maxTokens: 2000,
        systemPrompt: `Você é um especialista em detecção de fraudes em seguros no Brasil.

Suas responsabilidades:
1. Analisar documentos em busca de indicadores de fraude
2. Verificar consistência temporal e geográfica
3. Identificar padrões suspeitos
4. Calcular score de risco
5. Recomendar investigações adicionais

Foque em indicadores como:
- Inconsistências nas datas
- Valores atípicos
- Documentação duvidosa
- Padrões de comportamento suspeitos

Sempre responda em JSON com a estrutura especificada.`
      },

      customerService: {
        name: 'Atendimento ao Cliente',
        description: 'Processa solicitações e dúvidas de clientes',
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 1500,
        systemPrompt: `Você é um assistente de atendimento ao cliente especializado em seguros no Brasil.

Suas responsabilidades:
1. Responder dúvidas sobre apólices e sinistros
2. Orientar sobre procedimentos
3. Explicar coberturas e benefícios
4. Resolver problemas simples
5. Encaminhar casos complexos

Tom de comunicação:
- Cordial e profissional
- Linguagem clara e acessível
- Empático e prestativo
- Focado na solução

Sempre responda em JSON com a estrutura especificada, adaptando o conteúdo para atendimento.`
      }
    };
    
    // Retorna assistants customizados primeiro, depois os padrão
    return { ...defaultAgents, ...customAgents };
  }
}

export const openaiService = new OpenAIService();
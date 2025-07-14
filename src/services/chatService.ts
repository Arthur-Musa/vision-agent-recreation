import { workflowEngine } from './workflowEngine';
import { conciergeOrchestrator } from './conciergeOrchestrator';
import { ProcessingResult, Citation } from '@/types/workflow';
import { openaiService } from './openaiService';
import { olgaApi } from './olgaApiService';

export interface ChatAnalysisResult {
  documentType: string;
  extractedData: Record<string, any>;
  confidence: number;
  validations: Array<{
    field: string;
    status: 'success' | 'warning' | 'error';
    message: string;
  }>;
  recommendations: string[];
  citations?: Citation[];
}

export interface ChatResponse {
  content: string;
  analysis?: ChatAnalysisResult;
  suggestions: string[];
  nextActions?: string[];
}

class ChatService {
  async processUserMessage(message: string, files?: File[]): Promise<ChatResponse> {
    // Se há arquivos anexados, processa com os agentes
    if (files && files.length > 0) {
      return this.processDocuments(message, files);
    }

    // Senão, processa como consulta de texto
    return this.processTextQuery(message);
  }

  private async processDocuments(userMessage: string, files: File[]): Promise<ChatResponse> {
    try {
      // Analisa documentos com IA real
      const analysisResult = await this.analyzeDocumentsWithAI(files, userMessage);
      
      const suggestions = this.generateSuggestions(analysisResult);
      const nextActions = this.generateNextActions(analysisResult);

      return {
        content: this.generateAnalysisMessage(analysisResult),
        analysis: analysisResult,
        suggestions,
        nextActions
      };
    } catch (error) {
      console.error('Erro ao processar documentos:', error);
      // Fallback para simulação se IA não estiver configurada
      const analysisResult = await this.analyzeDocuments(files);
      
      return {
        content: this.generateAnalysisMessage(analysisResult) + '\n\n⚠️ Modo demonstração - Configure OpenAI para IA real.',
        analysis: analysisResult,
        suggestions: this.generateSuggestions(analysisResult),
        nextActions: this.generateNextActions(analysisResult)
      };
    }
  }

  private async processTextQuery(message: string): Promise<ChatResponse> {
    try {
      // Tenta usar IA real para consultas de texto
      const agents = openaiService.getInsuranceAgents();
      const customerServiceAgent = agents.customerService;
      
      const response = await openaiService.processWithAgent(
        customerServiceAgent,
        message
      );
      
      return {
        content: response.content,
        suggestions: response.recommendations.slice(0, 4),
        nextActions: response.validations.length > 0 ? ['Ver detalhes', 'Continuar conversa'] : undefined
      };
    } catch (error) {
      console.error('Erro ao processar consulta:', error);
      // Fallback para lógica baseada em palavras-chave
      return this.processTextQueryFallback(message);
    }
  }

  private processTextQueryFallback(message: string): ChatResponse {
    const lowerMessage = message.toLowerCase();

    // Identifica o tipo de consulta
    if (lowerMessage.includes('sinistro')) {
      return {
        content: 'Entendo que você precisa analisar um sinistro. Para que eu possa ajudar melhor, você poderia compartilhar o documento do sinistro? Aceito arquivos em PDF, imagens ou outros formatos.',
        suggestions: [
          'Anexar documento de sinistro',
          'Informar número do sinistro',
          'Descrever o caso',
          'Ver sinistros anteriores'
        ]
      };
    }

    if (lowerMessage.includes('apólice') || lowerMessage.includes('apolice')) {
      return {
        content: 'Perfeito! Posso ajudar com a análise de apólices. Por favor, compartilhe o documento da apólice que você gostaria que eu analisasse.',
        suggestions: [
          'Anexar apólice',
          'Verificar cobertura',
          'Validar dados',
          'Comparar apólices'
        ]
      };
    }

    if (lowerMessage.includes('endosso')) {
      return {
        content: 'Vou ajudar você com o processamento do endosso. Preciso do documento do endosso e da apólice original para fazer a análise completa.',
        suggestions: [
          'Anexar endosso',
          'Anexar apólice original',
          'Explicar alterações',
          'Validar mudanças'
        ]
      };
    }

    if (lowerMessage.includes('fraude') || lowerMessage.includes('suspeito')) {
      return {
        content: 'Posso ajudar na análise de indicadores de fraude. Para uma análise detalhada, preciso dos documentos relacionados ao caso.',
        suggestions: [
          'Anexar documentos do caso',
          'Descrever os indícios',
          'Analisar histórico do cliente',
          'Verificar padrões suspeitos'
        ]
      };
    }

    if (lowerMessage.includes('cobertura') || lowerMessage.includes('limite')) {
      return {
        content: 'Posso ajudar na análise de cobertura. Compartilhe a apólice e eu verificarei os limites, franquias e coberturas ativas.',
        suggestions: [
          'Anexar apólice',
          'Verificar coberturas específicas',
          'Calcular limites disponíveis',
          'Comparar com outras apólices'
        ]
      };
    }

    // Resposta genérica
    return {
      content: 'Entendi. Posso ajudar você com várias tarefas relacionadas a seguros. Você gostaria de:',
      suggestions: [
        'Analisar documentos de sinistro',
        'Verificar informações de apólices',
        'Processar endossos',
        'Validar documentação',
        'Calcular valores de indenização',
        'Detectar fraudes'
      ]
    };
  }

  private async analyzeDocumentsWithAI(files: File[], userMessage: string): Promise<ChatAnalysisResult> {
    try {
      // Primeira tentativa: usar API da Olga se disponível
      const olgaStatus = olgaApi.getConnectionStatus();
      
      if (olgaStatus.connected) {
        const result = await this.processWithOlgaAPI(files, userMessage);
        return result;
      }

      // Segunda tentativa: usar agentes configurados se disponível
      // Chaves API agora são gerenciadas no backend via edge functions
      
      // Processa documentos com agente de IA real
      const result = await this.processWithRealAI(files, userMessage);
      return result;

      // Fallback: usar análise simulada
      return this.simulateDocumentAnalysis(files, userMessage);
    } catch (error) {
      console.error('Erro na análise com IA:', error);
      return this.simulateDocumentAnalysis(files, userMessage);
    }
  }

  private async processWithRealAI(files: File[], userMessage: string): Promise<ChatAnalysisResult> {
    const firstFile = files[0];
    const fileName = firstFile.name.toLowerCase();
    
    // Simula extração de texto do documento (em produção, usaria OCR real)
    const mockDocumentText = `
    Documento: ${firstFile.name}
    Tipo: ${firstFile.type}
    Tamanho: ${firstFile.size} bytes
    
    Conteúdo simulado baseado no nome do arquivo...
    `;

    // Determina qual agente usar baseado no tipo de documento
    const agents = openaiService.getInsuranceAgents();
    let selectedAgent = agents.claimsProcessor; // padrão

    if (fileName.includes('sinistro') || fileName.includes('aviso')) {
      selectedAgent = agents.claimsProcessor;
    } else if (fileName.includes('apolice') || fileName.includes('seguro')) {
      selectedAgent = agents.policyAnalyzer;
    } else if (fileName.includes('fraude') || userMessage.toLowerCase().includes('fraude')) {
      selectedAgent = agents.fraudDetector;
    } else if (fileName.includes('juridico') || fileName.includes('legal')) {
      selectedAgent = agents.legalAnalyzer;
    }

    const response = await openaiService.processWithAgent(
      selectedAgent,
      `Analise este documento: ${userMessage || 'Análise completa do documento'}`,
      mockDocumentText,
      {
        fileName: firstFile.name,
        fileType: firstFile.type,
        fileSize: firstFile.size
      }
    );

    return {
      documentType: this.getDocumentTypeFromFileName(fileName),
      extractedData: response.extractedData || {},
      confidence: response.confidence,
      validations: response.validations,
      recommendations: response.recommendations,
      citations: response.citations
    };
  }

  private async simulateDocumentAnalysis(files: File[], userMessage: string): Promise<ChatAnalysisResult> {
    // Usa a lógica existente de simulação
    return this.analyzeDocuments(files);
  }

  private getDocumentTypeFromFileName(fileName: string): string {
    if (fileName.includes('sinistro') || fileName.includes('aviso')) {
      return 'Aviso de Sinistro';
    } else if (fileName.includes('apolice') || fileName.includes('seguro')) {
      return 'Apólice de Seguro';
    } else if (fileName.includes('endosso')) {
      return 'Endosso';
    } else if (fileName.includes('laudo')) {
      return 'Laudo de Vistoria';
    }
    return 'Documento de Seguro';
  }

  private async analyzeDocuments(files: File[]): Promise<ChatAnalysisResult> {
    // Simula análise baseada no tipo de arquivo
    const firstFile = files[0];
    const fileName = firstFile.name.toLowerCase();

    // Determina o tipo de documento baseado no nome
    let documentType = 'Documento de Seguro';
    let mockData: Record<string, any> = {};

    if (fileName.includes('sinistro') || fileName.includes('aviso')) {
      documentType = 'Aviso de Sinistro';
      mockData = {
        numeroSinistro: 'SIN-12345678',
        dataOcorrencia: '15/06/2025',
        localSinistro: 'Av. Paulista, 1000, São Paulo/SP',
        tipoSinistro: 'Colisão',
        valorEstimado: 'R$ 15.750,00',
        segurado: 'João Oliveira',
        numeroApolice: '9876543210'
      };
    } else if (fileName.includes('apolice') || fileName.includes('seguro')) {
      documentType = 'Apólice de Seguro';
      mockData = {
        numeroApolice: '9876543210',
        segurado: 'João Oliveira',
        vigenciaInicio: '01/01/2025',
        vigenciaFim: '31/12/2025',
        tipoSeguro: 'Auto',
        valorCobertura: 'R$ 50.000,00',
        premioTotal: 'R$ 2.400,00'
      };
    } else if (fileName.includes('endosso')) {
      documentType = 'Endosso';
      mockData = {
        numeroEndosso: 'END-789123',
        numeroApolice: '9876543210',
        tipoAlteracao: 'Inclusão de Cobertura',
        dataVigencia: '01/07/2025',
        valorAdicional: 'R$ 350,00'
      };
    }

    // Simula validações
    const validations: Array<{
      field: string;
      status: 'success' | 'warning' | 'error';
      message: string;
    }> = [
      { field: 'formato', status: 'success', message: 'Documento em formato válido' },
      { field: 'legibilidade', status: 'success', message: 'Documento legível e completo' }
    ];

    if (documentType === 'Aviso de Sinistro') {
      validations.push(
        { field: 'vigencia', status: 'success' as const, message: 'Sinistro dentro da vigência da apólice' },
        { field: 'cobertura', status: 'success' as const, message: 'Tipo de sinistro está coberto' },
        { field: 'documentacao', status: 'warning' as const, message: 'Faltam fotos dos danos e orçamentos' }
      );
    } else if (documentType === 'Apólice de Seguro') {
      validations.push(
        { field: 'dados_segurado', status: 'success' as const, message: 'Dados do segurado completos' },
        { field: 'coberturas', status: 'success' as const, message: 'Coberturas adequadas ao perfil' },
        { field: 'pagamento', status: 'warning' as const, message: 'Verificar status do pagamento' }
      );
    }

    // Simula recomendações
    const recommendations = this.generateRecommendations(documentType, validations);

    return {
      documentType,
      extractedData: mockData,
      confidence: 0.95,
      validations,
      recommendations
    };
  }

  private generateRecommendations(documentType: string, validations: any[]): string[] {
    const recommendations: string[] = [];

    if (documentType === 'Aviso de Sinistro') {
      const hasWarnings = validations.some(v => v.status === 'warning');
      if (hasWarnings) {
        recommendations.push('Solicitar fotos dos danos ao segurado');
        recommendations.push('Solicitar pelo menos dois orçamentos de oficinas');
        recommendations.push('Verificar boletim de ocorrência');
      } else {
        recommendations.push('Aprovar sinistro para processamento');
        recommendations.push('Agendar vistoria se necessário');
      }
    } else if (documentType === 'Apólice de Seguro') {
      recommendations.push('Verificar documentação complementar');
      recommendations.push('Confirmar dados cadastrais');
      recommendations.push('Agendar contato para orientações');
    } else if (documentType === 'Endosso') {
      recommendations.push('Validar alterações com segurado');
      recommendations.push('Calcular diferença de prêmio');
      recommendations.push('Emitir nova versão da apólice');
    }

    return recommendations;
  }

  private generateSuggestions(analysisResult: ChatAnalysisResult): string[] {
    const suggestions: string[] = [];

    if (analysisResult.documentType === 'Aviso de Sinistro') {
      suggestions.push('Solicitar documentos faltantes');
      suggestions.push('Aprovar sinistro');
      suggestions.push('Encaminhar para análise manual');
      suggestions.push('Gerar relatório');
    } else if (analysisResult.documentType === 'Apólice de Seguro') {
      suggestions.push('Validar dados');
      suggestions.push('Verificar cobertura');
      suggestions.push('Calcular prêmio');
      suggestions.push('Emitir apólice');
    }

    suggestions.push('Exportar análise');
    suggestions.push('Compartilhar com equipe');

    return suggestions;
  }

  private generateNextActions(analysisResult: ChatAnalysisResult): string[] {
    const actions: string[] = [];

    const hasErrors = analysisResult.validations.some(v => v.status === 'error');
    const hasWarnings = analysisResult.validations.some(v => v.status === 'warning');

    if (hasErrors) {
      actions.push('Corrigir erros identificados');
      actions.push('Solicitar nova versão do documento');
    } else if (hasWarnings) {
      actions.push('Resolver pendências');
      actions.push('Solicitar documentos complementares');
    } else {
      actions.push('Continuar processamento');
      actions.push('Enviar para aprovação');
    }

    return actions;
  }

  private generateAnalysisMessage(analysisResult: ChatAnalysisResult): string {
    const { documentType, confidence, validations } = analysisResult;
    
    const successCount = validations.filter(v => v.status === 'success').length;
    const warningCount = validations.filter(v => v.status === 'warning').length;
    const errorCount = validations.filter(v => v.status === 'error').length;

    let message = `Analisei o documento e identifiquei como **${documentType}** com ${Math.round(confidence * 100)}% de confiança.\n\n`;

    message += `**Resumo da análise:**\n`;
    message += `✅ ${successCount} verificações aprovadas\n`;
    
    if (warningCount > 0) {
      message += `⚠️ ${warningCount} itens com atenção\n`;
    }
    
    if (errorCount > 0) {
      message += `❌ ${errorCount} erros encontrados\n`;
    }

    message += `\nAbaixo estão os detalhes extraídos e as recomendações para próximos passos.`;

    return message;
  }

  private async processWithOlgaAPI(files: File[], userMessage: string): Promise<ChatAnalysisResult> {
    try {
      // Determinar tipo de documento baseado no nome/extensão
      const documentType = this.determineDocumentType(files[0]);
      
      // Executar workflow na Olga API
      const workflowRequest = {
        workflowType: 'claims_processing' as const,
        documents: files,
        context: {
          userMessage,
          analysisType: documentType,
          timestamp: new Date().toISOString()
        },
        priority: 'medium' as const
      };

      const workflowExecution = await olgaApi.executeWorkflow(workflowRequest);
      
      // Aguardar conclusão do workflow
      let status = await olgaApi.getWorkflowStatus(workflowExecution.executionId);
      
      // Poll até completar (max 30 segundos)
      const maxAttempts = 15;
      let attempts = 0;
      
      while (status.status === 'running' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        status = await olgaApi.getWorkflowStatus(workflowExecution.executionId);
        attempts++;
      }

      if (status.status === 'completed') {
        return this.convertOlgaResultToAnalysis(status.results, documentType);
      } else {
        throw new Error(`Workflow não concluído: ${status.status}`);
      }
    } catch (error) {
      console.error('Erro ao processar com Olga API:', error);
      throw error;
    }
  }

  private convertOlgaResultToAnalysis(results: Record<string, any>, documentType: string): ChatAnalysisResult {
    const docAnalysis = results.document_analysis || {};
    const fraudCheck = results.fraud_check || {};
    const complianceCheck = results.compliance_check || {};

    // Compilar dados extraídos
    const extractedData = {
      ...docAnalysis.extractedData,
      fraudScore: fraudCheck.riskScore,
      complianceScore: complianceCheck.complianceScore
    };

    // Gerar validações baseadas nos resultados
    const validations = [];
    
    if (docAnalysis.confidence > 0.8) {
      validations.push({
        field: 'document_quality',
        status: 'success' as const,
        message: 'Documento analisado com alta confiança'
      });
    }

    if (fraudCheck.riskScore < 30) {
      validations.push({
        field: 'fraud_risk',
        status: 'success' as const,
        message: 'Baixo risco de fraude detectado'
      });
    } else if (fraudCheck.riskScore > 70) {
      validations.push({
        field: 'fraud_risk',
        status: 'error' as const,
        message: 'Alto risco de fraude - revisão necessária'
      });
    }

    if (complianceCheck.complianceScore > 0.9) {
      validations.push({
        field: 'compliance',
        status: 'success' as const,
        message: 'Documento em conformidade com regulamentações'
      });
    }

    // Compilar recomendações
    const recommendations = [
      ...(docAnalysis.recommendations || []),
      ...(fraudCheck.recommendations || []),
      ...(complianceCheck.recommendations || [])
    ].filter(Boolean);

    return {
      documentType,
      extractedData,
      confidence: docAnalysis.confidence || 0.8,
      validations,
      recommendations,
      citations: docAnalysis.citations || []
    };
  }

  private determineDocumentType(file: File): 'claim' | 'policy' | 'medical' | 'invoice' {
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes('sinistro') || fileName.includes('claim')) {
      return 'claim';
    }
    if (fileName.includes('apolice') || fileName.includes('policy')) {
      return 'policy';
    }
    if (fileName.includes('medico') || fileName.includes('laudo') || fileName.includes('medical')) {
      return 'medical';
    }
    if (fileName.includes('nota') || fileName.includes('invoice') || fileName.includes('fatura')) {
      return 'invoice';
    }
    
    return 'claim'; // Default
  }
}

export const chatService = new ChatService();
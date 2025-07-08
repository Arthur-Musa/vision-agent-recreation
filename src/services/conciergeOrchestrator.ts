/**
 * Enhanced Concierge Orchestrator - Intelligent task routing and agent coordination
 * Inspired by V7Labs architecture with advanced context engineering
 */

import { workflowEngine } from './workflowEngine';
import { WorkflowExecution } from '@/types/workflow';

export interface TaskContext {
  id: string;
  originalQuery: string;
  taskType: 'claims' | 'policies' | 'legal' | 'customer_service' | 'general';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  extractedData: Record<string, any>;
  suggestedAgent: string;
  suggestedWorkflow?: string;
  confidence: number;
  subAgentResults: Record<string, any>;
  workflowExecution?: WorkflowExecution;
  metadata: {
    documentsAttached: number;
    estimatedComplexity: 'low' | 'medium' | 'high';
    requiresHumanReview: boolean;
    complianceRisk: 'low' | 'medium' | 'high';
  };
  decisions: Array<{
    timestamp: string;
    agent: string;
    decision: any;
    justification: string;
    confidence: number;
  }>;
}

export interface ConciergeResponse {
  success: boolean;
  context: TaskContext;
  message: string;
  nextSteps: string[];
  redirectTo?: string;
  workflowId?: string;
  estimatedDuration?: string;
  requiresDocuments?: string[];
  escalationReasons?: string[];
}

class ConciergeOrchestrator {
  
  async processQuery(query: string, documents?: File[]): Promise<ConciergeResponse> {
    // 1. Criar contexto inicial avançado
    const context: TaskContext = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      originalQuery: query,
      taskType: this.classifyTask(query),
      priority: this.assessPriority(query),
      extractedData: {},
      suggestedAgent: '',
      suggestedWorkflow: '',
      confidence: 0,
      subAgentResults: {},
      metadata: {
        documentsAttached: documents?.length || 0,
        estimatedComplexity: this.assessComplexity(query),
        requiresHumanReview: false,
        complianceRisk: this.assessComplianceRisk(query)
      },
      decisions: []
    };

    // 2. Triagem inicial
    await this.performInitialTriage(context);
    
    // 3. Análise paralela com subagentes
    await this.executeParallelAnalysis(context);
    
    // 4. Consolidação e decisão final
    const response = await this.consolidateAndDecide(context);
    
    return response;
  }

  private classifyTask(query: string): TaskContext['taskType'] {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('sinistro') || lowerQuery.includes('acidente') || lowerQuery.includes('dano')) {
      return 'claims';
    }
    
    if (lowerQuery.includes('apólice') || lowerQuery.includes('seguro') || lowerQuery.includes('cobertura')) {
      return 'policies';
    }
    
    if (lowerQuery.includes('jurídico') || lowerQuery.includes('legal') || lowerQuery.includes('processo')) {
      return 'legal';
    }
    
    if (lowerQuery.includes('atendimento') || lowerQuery.includes('dúvida') || lowerQuery.includes('informação')) {
      return 'customer_service';
    }
    
    return 'general';
  }

  private assessPriority(query: string): TaskContext['priority'] {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('urgente') || lowerQuery.includes('emergência')) {
      return 'urgent';
    }
    
    if (lowerQuery.includes('importante') || lowerQuery.includes('prioritário')) {
      return 'high';
    }
    
    return 'medium';
  }

  private assessComplexity(query: string): 'low' | 'medium' | 'high' {
    const complexityIndicators = {
      high: ['múltiplos', 'complexo', 'judicial', 'fraude', 'internacional'],
      medium: ['avaliação', 'análise', 'verificação', 'compliance'],
      low: ['informação', 'consulta', 'dúvida', 'simples']
    };
    
    const queryLower = query.toLowerCase();
    
    if (complexityIndicators.high.some(indicator => queryLower.includes(indicator))) {
      return 'high';
    }
    
    if (complexityIndicators.medium.some(indicator => queryLower.includes(indicator))) {
      return 'medium';
    }
    
    return 'low';
  }

  private assessComplianceRisk(query: string): 'low' | 'medium' | 'high' {
    const highRiskTerms = ['judicial', 'processo', 'susep', 'regulamentação'];
    const mediumRiskTerms = ['compliance', 'legal', 'auditoria'];
    
    const queryLower = query.toLowerCase();
    
    if (highRiskTerms.some(term => queryLower.includes(term))) {
      return 'high';
    }
    
    if (mediumRiskTerms.some(term => queryLower.includes(term))) {
      return 'medium';
    }
    
    return 'low';
  }

  private async performInitialTriage(context: TaskContext): Promise<void> {
    // Simula análise inicial inteligente
    const extractedData = this.extractDataFromQuery(context.originalQuery);
    const suggestedAgent = this.selectAgent(context.taskType, extractedData);
    
    context.extractedData = extractedData;
    context.suggestedAgent = suggestedAgent;
    context.confidence = this.calculateConfidence(context);
    
    context.decisions.push({
      timestamp: new Date().toISOString(),
      agent: 'concierge_orchestrator',
      decision: {
        taskType: context.taskType,
        priority: context.priority,
        suggestedAgent: context.suggestedAgent,
        extractedData: context.extractedData
      },
      justification: `Classificação inicial baseada na análise do conteúdo: "${context.originalQuery}"`,
      confidence: context.confidence
    });
  }

  private extractDataFromQuery(query: string): Record<string, any> {
    const data: Record<string, any> = {};
    
    // Extrai valores monetários
    const moneyMatch = query.match(/R\$\s*([\d.,]+)/);
    if (moneyMatch) {
      data.valor_estimado = parseFloat(moneyMatch[1].replace(',', ''));
    }
    
    // Extrai datas
    const dateMatch = query.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
    if (dateMatch) {
      data.data_mencionada = dateMatch[0];
    }
    
    // Identifica tipos de sinistro
    if (query.toLowerCase().includes('carro') || query.toLowerCase().includes('veículo')) {
      data.tipo_sinistro = 'Automotivo';
    } else if (query.toLowerCase().includes('casa') || query.toLowerCase().includes('residência')) {
      data.tipo_sinistro = 'Residencial';
    }
    
    // Identifica tipo de verificação para apólices
    if (query.toLowerCase().includes('cobertura') || query.toLowerCase().includes('gap') || query.toLowerCase().includes('compliance')) {
      data.tipo_verificacao = 'cobertura';
    }
    
    // Identifica documentos mencionados
    const docTypes = ['rg', 'cpf', 'cnh', 'laudo', 'orçamento', 'nota fiscal'];
    const mentionedDocs = docTypes.filter(doc => 
      query.toLowerCase().includes(doc)
    );
    if (mentionedDocs.length > 0) {
      data.documentos_mencionados = mentionedDocs;
    }
    
    return data;
  }

  private selectAgent(taskType: TaskContext['taskType'], extractedData: Record<string, any>): string {
    switch (taskType) {
      case 'claims':
        if (extractedData.valor_estimado && extractedData.valor_estimado > 50000) {
          return 'senior-claims-processor';
        }
        return 'claims-processor';
        
      case 'policies':
        if (extractedData.tipo_verificacao === 'cobertura') {
          return 'coverage-verification';
        }
        return 'underwriting-assistant';
        
      case 'legal':
        return 'legal-analyst';
        
      case 'customer_service':
        return 'customer-service-agent';
        
      default:
        return 'general-assistant';
    }
  }

  private calculateConfidence(context: TaskContext): number {
    let confidence = 0.5; // Base confidence
    
    // Aumenta confiança baseado em dados extraídos
    if (Object.keys(context.extractedData).length > 0) {
      confidence += 0.2;
    }
    
    // Aumenta confiança baseado na clareza da classificação
    const keywords = {
      claims: ['sinistro', 'acidente', 'dano', 'prejuízo'],
      policies: ['apólice', 'seguro', 'cobertura', 'prêmio'],
      legal: ['jurídico', 'legal', 'processo', 'contestação']
    };
    
    const taskKeywords = keywords[context.taskType as keyof typeof keywords] || [];
    const matchedKeywords = taskKeywords.filter(keyword => 
      context.originalQuery.toLowerCase().includes(keyword)
    );
    
    confidence += (matchedKeywords.length / taskKeywords.length) * 0.3;
    
    return Math.min(confidence, 1.0);
  }

  private async executeParallelAnalysis(context: TaskContext): Promise<void> {
    // Simula execução paralela de subagentes para análise (apenas leitura)
    const analysisPromises = [
      this.runDocumentAnalysis(context),
      this.runRiskAssessment(context),
      this.runComplianceCheck(context)
    ];
    
    const results = await Promise.all(analysisPromises);
    
    context.subAgentResults = {
      documentAnalysis: results[0],
      riskAssessment: results[1],
      complianceCheck: results[2]
    };
    
    // Registra as análises no contexto
    context.decisions.push({
      timestamp: new Date().toISOString(),
      agent: 'parallel_sub_agents',
      decision: context.subAgentResults,
      justification: 'Análise paralela completada pelos subagentes especializados',
      confidence: context.confidence
    });
  }

  private async runDocumentAnalysis(context: TaskContext): Promise<any> {
    // Simula análise documental
    return {
      documentsRequired: this.getRequiredDocuments(context.taskType),
      documentsPresent: context.extractedData.documentos_mencionados || [],
      qualityScore: 85,
      missingDocuments: []
    };
  }

  private async runRiskAssessment(context: TaskContext): Promise<any> {
    // Simula avaliação de risco
    let riskScore = 30; // Base risk
    
    if (context.extractedData.valor_estimado > 100000) {
      riskScore += 20;
    }
    
    return {
      riskScore,
      riskFactors: this.identifyRiskFactors(context),
      recommendedActions: this.getRecommendedActions(riskScore)
    };
  }

  private async runComplianceCheck(context: TaskContext): Promise<any> {
    // Simula verificação de compliance
    return {
      susepCompliant: true,
      lgpdCompliant: true,
      requiredApprovals: this.getRequiredApprovals(context),
      regulatoryNotes: []
    };
  }

  private getRequiredDocuments(taskType: TaskContext['taskType']): string[] {
    const docMap = {
      claims: ['RG', 'CPF', 'Apólice', 'Laudo de danos', 'Orçamento de reparo'],
      policies: ['RG', 'CPF', 'Comprovante de renda'],
      legal: ['Documentos do processo', 'Contestação'],
      customer_service: [],
      general: []
    };
    
    return docMap[taskType];
  }

  private identifyRiskFactors(context: TaskContext): string[] {
    const factors = [];
    
    if (context.extractedData.valor_estimado > 100000) {
      factors.push('Valor elevado');
    }
    
    if (context.priority === 'urgent') {
      factors.push('Urgência declarada');
    }
    
    return factors;
  }

  private getRecommendedActions(riskScore: number): string[] {
    if (riskScore > 70) {
      return ['Análise manual obrigatória', 'Aprovação de supervisor', 'Verificação adicional'];
    } else if (riskScore > 40) {
      return ['Revisão por especialista', 'Validação de documentos'];
    }
    
    return ['Processamento automático autorizado'];
  }

  private getRequiredApprovals(context: TaskContext): string[] {
    const approvals = [];
    
    if (context.extractedData.valor_estimado > 50000) {
      approvals.push('Supervisor de sinistros');
    }
    
    if (context.priority === 'urgent') {
      approvals.push('Gerente de operações');
    }
    
    return approvals;
  }

  private async consolidateAndDecide(context: TaskContext): Promise<ConciergeResponse> {
    // Consolida todas as análises e toma decisão final
    const riskScore = context.subAgentResults.riskAssessment?.riskScore || 0;
    const missingDocs = context.subAgentResults.documentAnalysis?.missingDocuments || [];
    
    let message = `Analisei sua solicitação sobre "${context.originalQuery}". `;
    message += `Classifiquei como ${this.getTaskTypeLabel(context.taskType)} `;
    message += `com prioridade ${context.priority}. `;
    
    const nextSteps = [];
    let redirectTo = '';
    
    if (missingDocs.length > 0) {
      message += `Identifiquei que você precisará fornecer alguns documentos adicionais.`;
      nextSteps.push('Upload de documentos necessários');
      redirectTo = '/upload';
    } else {
      message += `Todos os dados necessários foram identificados. Redirecionando para o agente especializado.`;
      nextSteps.push('Análise pelo agente especializado');
      nextSteps.push('Processamento automático');
      redirectTo = `/conversation/${context.suggestedAgent}`;
    }
    
    if (riskScore > 50) {
      nextSteps.push('Revisão manual por especialista');
    }
    
    // Registra decisão final
    context.decisions.push({
      timestamp: new Date().toISOString(),
      agent: 'concierge_final_decision',
      decision: {
        redirectTo,
        nextSteps,
        requiresManualReview: riskScore > 50
      },
      justification: `Decisão baseada na consolidação de todas as análises realizadas`,
      confidence: context.confidence
    });
    
    return {
      success: true,
      context,
      message,
      nextSteps,
      redirectTo
    };
  }

  private getTaskTypeLabel(taskType: TaskContext['taskType']): string {
    const labels = {
      claims: 'análise de sinistro',
      policies: 'questão de apólice',
      legal: 'questão jurídica',
      customer_service: 'atendimento ao cliente',
      general: 'consulta geral'
    };
    
    return labels[taskType];
  }
}

export const conciergeOrchestrator = new ConciergeOrchestrator();
/**
 * Enhanced Concierge Service - Advanced AI routing and workflow management
 * Implements sophisticated decision trees and context awareness
 */

import { TaskContext, ConciergeResponse } from './conciergeOrchestrator';
import { workflowEngine } from './workflowEngine';

export class EnhancedConciergeService {
  
  async performAdvancedTriage(context: TaskContext): Promise<void> {
    // Enhanced data extraction using NLP patterns
    const extractedData = await this.advancedDataExtraction(context.originalQuery);
    const suggestedAgent = await this.intelligentAgentSelection(context.taskType, extractedData);
    
    context.extractedData = extractedData;
    context.suggestedAgent = suggestedAgent;
    context.confidence = this.calculateAdvancedConfidence(context);
    
    // Assess human review requirements
    context.metadata.requiresHumanReview = this.assessHumanReviewRequired(context);
    
    this.addDecision(context, 'enhanced_triage', {
      taskType: context.taskType,
      priority: context.priority,
      suggestedAgent: context.suggestedAgent,
      extractedData: context.extractedData,
      metadata: context.metadata
    }, 'Advanced triage with enhanced context analysis');
  }

  async selectOptimalWorkflow(context: TaskContext): Promise<void> {
    const workflowId = this.selectWorkflowByContext(context);
    context.suggestedWorkflow = workflowId;
    
    this.addDecision(context, 'workflow_selection', {
      selectedWorkflow: workflowId,
      reason: this.getWorkflowSelectionReason(context)
    }, 'Workflow selected based on task complexity and requirements');
  }

  private async advancedDataExtraction(query: string): Promise<Record<string, any>> {
    const data: Record<string, any> = {};
    
    // Enhanced monetary value extraction
    const moneyPatterns = [
      /R\$\s*([\d.,]+)/g,
      /([Vv]alor|[Qq]uantia|[Mm]ontante)[:\s]*(R\$)?\s*([\d.,]+)/g,
      /([\d.,]+)\s*reais/gi
    ];
    
    for (const pattern of moneyPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        const values = matches.map(match => {
          const numStr = match.replace(/[^\d.,]/g, '');
          return parseFloat(numStr.replace(',', '.'));
        }).filter(v => !isNaN(v));
        
        if (values.length > 0) {
          data.valor_estimado = Math.max(...values);
        }
      }
    }
    
    // Enhanced date extraction
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
      /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/gi,
      /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/gi
    ];
    
    for (const pattern of datePatterns) {
      const match = query.match(pattern);
      if (match) {
        data.data_mencionada = match[0];
        break;
      }
    }
    
    // Enhanced document type detection
    const documentTypes = {
      'rg': ['rg', 'registro geral', 'carteira de identidade'],
      'cpf': ['cpf', 'cadastro de pessoa física'],
      'cnh': ['cnh', 'carteira nacional', 'habilitação'],
      'laudo': ['laudo', 'parecer técnico', 'avaliação'],
      'orçamento': ['orçamento', 'cotação', 'estimativa'],
      'nota_fiscal': ['nota fiscal', 'nf', 'cupom fiscal'],
      'apolice': ['apólice', 'contrato de seguro', 'política'],
      'sinistro': ['boletim de ocorrência', 'bo', 'registro de sinistro']
    };
    
    const mentionedDocs: string[] = [];
    Object.entries(documentTypes).forEach(([key, terms]) => {
      if (terms.some(term => query.toLowerCase().includes(term))) {
        mentionedDocs.push(key);
      }
    });
    
    if (mentionedDocs.length > 0) {
      data.documentos_mencionados = mentionedDocs;
    }
    
    // Enhanced claim type detection
    const claimTypes = {
      'automotivo': ['carro', 'veículo', 'automóvel', 'moto', 'acidente de trânsito'],
      'residencial': ['casa', 'residência', 'imóvel', 'apartamento', 'incêndio', 'roubo'],
      'vida': ['vida', 'óbito', 'morte', 'invalidez'],
      'saude': ['saúde', 'médico', 'hospital', 'tratamento', 'cirurgia'],
      'viagem': ['viagem', 'bagagem', 'cancelamento', 'internacional']
    };
    
    Object.entries(claimTypes).forEach(([type, keywords]) => {
      if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
        data.tipo_sinistro = type;
      }
    });
    
    // Enhanced urgency indicators
    const urgencyKeywords = ['urgente', 'emergência', 'crítico', 'imediato', 'prioritário'];
    if (urgencyKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      data.urgencia_detectada = true;
    }
    
    // Compliance risk indicators
    const complianceKeywords = ['susep', 'regulamentação', 'compliance', 'legal', 'judicial'];
    if (complianceKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      data.risco_compliance = true;
    }
    
    // Extract policy numbers
    const policyPattern = /[Pp]ol[íi]cia[\s\-]?(\w+)|[Nn]úmero[\s:]*([\w\-]+)/g;
    const policyMatch = query.match(policyPattern);
    if (policyMatch) {
      data.numero_apolice = policyMatch[0];
    }
    
    return data;
  }

  private async intelligentAgentSelection(
    taskType: TaskContext['taskType'], 
    extractedData: Record<string, any>
  ): Promise<string> {
    // Advanced agent selection logic
    switch (taskType) {
      case 'claims':
        if (extractedData.valor_estimado && extractedData.valor_estimado > 100000) {
          return 'senior-claims-processor';
        }
        if (extractedData.tipo_sinistro === 'automotivo') {
          return 'automotive-claims-specialist';
        }
        if (extractedData.urgencia_detectada) {
          return 'emergency-claims-processor';
        }
        return 'claims-processor';
        
      case 'policies':
        if (extractedData.risco_compliance) {
          return 'compliance-specialist';
        }
        if (extractedData.documentos_mencionados?.includes('apolice')) {
          return 'coverage-verification';
        }
        return 'underwriting-assistant';
        
      case 'legal':
        if (extractedData.valor_estimado && extractedData.valor_estimado > 50000) {
          return 'senior-legal-analyst';
        }
        return 'legal-analyst';
        
      case 'customer_service':
        return 'customer-service-agent';
        
      default:
        return 'general-assistant';
    }
  }

  private calculateAdvancedConfidence(context: TaskContext): number {
    let confidence = 0.6; // Enhanced base confidence
    
    // Boost confidence based on extracted data richness
    const dataPoints = Object.keys(context.extractedData).length;
    confidence += Math.min(dataPoints * 0.05, 0.25);
    
    // Boost confidence for specific patterns
    if (context.extractedData.valor_estimado) confidence += 0.1;
    if (context.extractedData.tipo_sinistro) confidence += 0.1;
    if (context.extractedData.documentos_mencionados?.length > 0) confidence += 0.05;
    
    // Task type specificity boost
    const specificityMap = {
      claims: 0.15,
      policies: 0.1,
      legal: 0.12,
      customer_service: 0.08,
      general: 0.05
    };
    
    confidence += specificityMap[context.taskType] || 0.05;
    
    return Math.min(confidence, 0.98);
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

  private assessHumanReviewRequired(context: TaskContext): boolean {
    // High-value claims
    if (context.extractedData.valor_estimado > 50000) return true;
    
    // High compliance risk
    if (context.metadata.complianceRisk === 'high') return true;
    
    // High complexity tasks
    if (context.metadata.estimatedComplexity === 'high') return true;
    
    // Urgent priority with legal implications
    if (context.priority === 'urgent' && context.taskType === 'legal') return true;
    
    return false;
  }

  private selectWorkflowByContext(context: TaskContext): string {
    if (context.taskType === 'claims') {
      return 'claims_processing';
    }
    
    if (context.taskType === 'policies' && 
        context.extractedData.documentos_mencionados?.includes('apolice')) {
      return 'coverage_verification';
    }
    
    if (context.taskType === 'legal') {
      return 'legal_analysis';
    }
    
    return 'general_inquiry';
  }

  private getWorkflowSelectionReason(context: TaskContext): string {
    const reasons = [];
    
    if (context.taskType === 'claims') {
      reasons.push('Processo de sinistro identificado');
    }
    
    if (context.metadata.requiresHumanReview) {
      reasons.push('Revisão humana necessária');
    }
    
    if (context.metadata.estimatedComplexity === 'high') {
      reasons.push('Alta complexidade detectada');
    }
    
    return reasons.join(', ') || 'Workflow padrão selecionado';
  }

  private addDecision(
    context: TaskContext, 
    agent: string, 
    decision: any, 
    justification: string
  ): void {
    context.decisions.push({
      timestamp: new Date().toISOString(),
      agent,
      decision,
      justification,
      confidence: context.confidence
    });
  }
}

export const enhancedConcierge = new EnhancedConciergeService();
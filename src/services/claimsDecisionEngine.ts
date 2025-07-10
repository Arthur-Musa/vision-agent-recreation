// Motor de Decisão Automática para Sinistros APE+BAG
// Baseado no fluxo V7 claims e regras de negócio

export interface ClaimDocument {
  id: string;
  name: string;
  type: string;
  content?: string;
  extractedData?: Record<string, any>;
}

export interface ClaimAnalysis {
  claimNumber: string;
  claimType: 'APE' | 'BAG' | 'APE+BAG';
  claimValue: number;
  occurrenceDate: string;
  insuredName: string;
  policyNumber: string;
  extractedData: Record<string, any>;
  confidence: number;
  riskIndicators: RiskIndicator[];
  documentValidation: DocumentValidation[];
}

export interface RiskIndicator {
  type: 'fraud' | 'inconsistency' | 'missing_doc' | 'high_value' | 'suspicious_timing';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  score: number;
}

export interface DocumentValidation {
  document: string;
  status: 'valid' | 'invalid' | 'suspicious' | 'missing';
  issues: string[];
  confidence: number;
}

export type DecisionType = 'APPROVE' | 'DENY' | 'INVESTIGATE' | 'ADDITIONAL_DOCS';

export interface DecisionResult {
  decision: DecisionType;
  reasoning: string[];
  confidence: number;
  autoExecutable: boolean;
  requiredActions: ActionItem[];
  escalationLevel: 'none' | 'supervisor' | 'fraud_investigation' | 'manual_review';
  estimatedReserve?: number;
  paymentInstruction?: PaymentInstruction;
  nextSteps: string[];
}

export interface ActionItem {
  type: 'payment' | 'investigation' | 'documentation' | 'communication' | 'review';
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  dueDate?: string;
  automated: boolean;
}

export interface PaymentInstruction {
  amount: number;
  recipient: string;
  method: 'automatic_transfer' | 'manual_check' | 'hold_pending';
  authorization: 'pre_approved' | 'requires_approval' | 'denied';
  bankDetails?: Record<string, any>;
}

export class ClaimsDecisionEngine {
  
  // Regras de negócio configuráveis
  private readonly BUSINESS_RULES = {
    AUTO_APPROVAL_LIMIT: 20000, // R$ 20.000
    HIGH_VALUE_THRESHOLD: 50000, // R$ 50.000
    FRAUD_SCORE_THRESHOLD: 0.7,
    MINIMUM_CONFIDENCE: 0.8,
    REQUIRED_DOCUMENTS: {
      APE: ['medical_report', 'death_certificate', 'identity_document'],
      BAG: ['police_report', 'receipts', 'identity_document'],
      'APE+BAG': ['medical_report', 'death_certificate', 'police_report', 'receipts', 'identity_document']
    }
  };

  async processClaimDecision(
    analysis: ClaimAnalysis,
    documents: ClaimDocument[]
  ): Promise<DecisionResult> {
    
    console.log(`[DECISION ENGINE] Processando sinistro ${analysis.claimNumber}`);
    
    // 1. Validação de documentos obrigatórios
    const docValidation = this.validateRequiredDocuments(analysis, documents);
    
    // 2. Análise de risco e fraude
    const riskAssessment = this.assessRisk(analysis);
    
    // 3. Aplicação das regras de negócio
    const businessRuleResult = this.applyBusinessRules(analysis, riskAssessment);
    
    // 4. Determinação da decisão final
    const decision = this.makeDecision(analysis, docValidation, riskAssessment, businessRuleResult);
    
    console.log(`[DECISION ENGINE] Decisão: ${decision.decision} para ${analysis.claimNumber}`);
    
    return decision;
  }

  private validateRequiredDocuments(
    analysis: ClaimAnalysis, 
    documents: ClaimDocument[]
  ): { isComplete: boolean; missingDocs: string[]; issues: DocumentValidation[] } {
    
    const requiredDocs = this.BUSINESS_RULES.REQUIRED_DOCUMENTS[analysis.claimType];
    const providedDocTypes = documents.map(d => d.type.toLowerCase());
    
    const missingDocs = requiredDocs.filter(req => 
      !providedDocTypes.some(provided => provided.includes(req.replace('_', '')))
    );
    
    const issues: DocumentValidation[] = documents.map(doc => ({
      document: doc.name,
      status: this.validateDocument(doc),
      issues: this.getDocumentIssues(doc),
      confidence: this.calculateDocumentConfidence(doc)
    }));
    
    return {
      isComplete: missingDocs.length === 0,
      missingDocs,
      issues
    };
  }

  private validateDocument(doc: ClaimDocument): 'valid' | 'invalid' | 'suspicious' | 'missing' {
    // Lógica de validação de documento
    if (!doc.content && !doc.extractedData) return 'missing';
    
    // Verificações básicas de integridade
    if (doc.extractedData?.suspicious_patterns) return 'suspicious';
    if (doc.extractedData?.validation_errors) return 'invalid';
    
    return 'valid';
  }

  private getDocumentIssues(doc: ClaimDocument): string[] {
    const issues: string[] = [];
    
    if (!doc.content) issues.push('Conteúdo não extraído');
    if (doc.extractedData?.low_quality) issues.push('Qualidade de imagem baixa');
    if (doc.extractedData?.missing_signatures) issues.push('Assinaturas ausentes');
    if (doc.extractedData?.date_inconsistencies) issues.push('Inconsistência de datas');
    
    return issues;
  }

  private calculateDocumentConfidence(doc: ClaimDocument): number {
    // Calcula confiança baseada na qualidade do documento
    let confidence = 1.0;
    
    if (!doc.content) confidence -= 0.3;
    if (doc.extractedData?.low_quality) confidence -= 0.2;
    if (doc.extractedData?.missing_signatures) confidence -= 0.1;
    if (doc.extractedData?.date_inconsistencies) confidence -= 0.2;
    
    return Math.max(0, confidence);
  }

  private assessRisk(analysis: ClaimAnalysis): { 
    totalScore: number; 
    level: 'low' | 'medium' | 'high' | 'critical';
    indicators: RiskIndicator[] 
  } {
    
    let totalScore = 0;
    const indicators: RiskIndicator[] = [...analysis.riskIndicators];
    
    // Análise de valor
    if (analysis.claimValue > this.BUSINESS_RULES.HIGH_VALUE_THRESHOLD) {
      indicators.push({
        type: 'high_value',
        severity: 'high',
        description: `Valor elevado: R$ ${analysis.claimValue.toLocaleString()}`,
        score: 0.3
      });
      totalScore += 0.3;
    }
    
    // Análise temporal
    const occurrenceDate = new Date(analysis.occurrenceDate);
    const daysSinceOccurrence = (Date.now() - occurrenceDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceOccurrence < 1) {
      indicators.push({
        type: 'suspicious_timing',
        severity: 'medium',
        description: 'Sinistro reportado muito rapidamente após ocorrência',
        score: 0.2
      });
      totalScore += 0.2;
    }
    
    // Soma scores dos indicadores existentes
    totalScore += analysis.riskIndicators.reduce((sum, indicator) => sum + indicator.score, 0);
    
    const level = this.determineRiskLevel(totalScore);
    
    return { totalScore, level, indicators };
  }

  private determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 0.8) return 'critical';
    if (score >= 0.6) return 'high';
    if (score >= 0.3) return 'medium';
    return 'low';
  }

  private applyBusinessRules(
    analysis: ClaimAnalysis,
    riskAssessment: { totalScore: number; level: string }
  ): {
    autoApprovable: boolean;
    requiresInvestigation: boolean;
    exceedsAuthorization: boolean;
    reasoning: string[];
  } {
    
    const reasoning: string[] = [];
    let autoApprovable = true;
    let requiresInvestigation = false;
    let exceedsAuthorization = false;
    
    // Regra 1: Limite de aprovação automática
    if (analysis.claimValue > this.BUSINESS_RULES.AUTO_APPROVAL_LIMIT) {
      autoApprovable = false;
      exceedsAuthorization = true;
      reasoning.push(`Valor R$ ${analysis.claimValue.toLocaleString()} excede limite de aprovação automática (R$ ${this.BUSINESS_RULES.AUTO_APPROVAL_LIMIT.toLocaleString()})`);
    }
    
    // Regra 2: Score de fraude
    if (riskAssessment.totalScore > this.BUSINESS_RULES.FRAUD_SCORE_THRESHOLD) {
      autoApprovable = false;
      requiresInvestigation = true;
      reasoning.push(`Score de risco ${(riskAssessment.totalScore * 100).toFixed(1)}% requer investigação`);
    }
    
    // Regra 3: Confiança mínima
    if (analysis.confidence < this.BUSINESS_RULES.MINIMUM_CONFIDENCE) {
      autoApprovable = false;
      reasoning.push(`Confiança da análise ${(analysis.confidence * 100).toFixed(1)}% abaixo do mínimo exigido`);
    }
    
    // Regra 4: Tipo de sinistro APE+BAG sempre requer revisão adicional
    if (analysis.claimType === 'APE+BAG') {
      requiresInvestigation = true;
      reasoning.push('Sinistros APE+BAG requerem revisão especializada devido à complexidade');
    }
    
    return {
      autoApprovable,
      requiresInvestigation,
      exceedsAuthorization,
      reasoning
    };
  }

  private makeDecision(
    analysis: ClaimAnalysis,
    docValidation: any,
    riskAssessment: any,
    businessRules: any
  ): DecisionResult {
    
    let decision: DecisionType;
    let escalationLevel: DecisionResult['escalationLevel'] = 'none';
    let autoExecutable = false;
    const requiredActions: ActionItem[] = [];
    let paymentInstruction: PaymentInstruction | undefined;
    
    // Decisão baseada nas validações
    if (!docValidation.isComplete) {
      decision = 'ADDITIONAL_DOCS';
      requiredActions.push({
        type: 'documentation',
        description: `Solicitar documentos faltantes: ${docValidation.missingDocs.join(', ')}`,
        priority: 'high',
        automated: true
      });
    }
    else if (businessRules.requiresInvestigation || riskAssessment.level === 'critical') {
      decision = 'INVESTIGATE';
      escalationLevel = 'fraud_investigation';
      requiredActions.push({
        type: 'investigation',
        description: 'Investigação de fraude necessária',
        priority: 'urgent',
        automated: false
      });
    }
    else if (businessRules.exceedsAuthorization) {
      decision = 'INVESTIGATE';
      escalationLevel = 'supervisor';
      requiredActions.push({
        type: 'review',
        description: 'Aprovação supervisora necessária para valor elevado',
        priority: 'high',
        automated: false
      });
    }
    else if (businessRules.autoApprovable && riskAssessment.level === 'low') {
      decision = 'APPROVE';
      autoExecutable = true;
      
      // Configurar pagamento automático
      paymentInstruction = {
        amount: analysis.claimValue,
        recipient: analysis.insuredName,
        method: 'automatic_transfer',
        authorization: 'pre_approved'
      };
      
      requiredActions.push({
        type: 'payment',
        description: `Pagamento automático de R$ ${analysis.claimValue.toLocaleString()}`,
        priority: 'medium',
        automated: true
      });
    }
    else {
      decision = 'DENY';
      requiredActions.push({
        type: 'communication',
        description: 'Notificar segurado sobre negativa',
        priority: 'medium',
        automated: true
      });
    }
    
    const reasoning = [
      ...businessRules.reasoning,
      `Nível de risco: ${riskAssessment.level}`,
      `Confiança da análise: ${(analysis.confidence * 100).toFixed(1)}%`,
      `Documentos: ${docValidation.isComplete ? 'Completos' : 'Incompletos'}`
    ];
    
    const nextSteps = this.generateNextSteps(decision, requiredActions);
    
    return {
      decision,
      reasoning,
      confidence: analysis.confidence,
      autoExecutable,
      requiredActions,
      escalationLevel,
      estimatedReserve: decision === 'APPROVE' ? analysis.claimValue : undefined,
      paymentInstruction,
      nextSteps
    };
  }

  private generateNextSteps(decision: DecisionType, actions: ActionItem[]): string[] {
    const steps: string[] = [];
    
    switch (decision) {
      case 'APPROVE':
        steps.push('1. Executar pagamento automático');
        steps.push('2. Notificar segurado sobre aprovação');
        steps.push('3. Atualizar reservas técnicas');
        steps.push('4. Arquivar processo');
        break;
        
      case 'DENY':
        steps.push('1. Notificar segurado sobre negativa');
        steps.push('2. Disponibilizar recurso/contestação');
        steps.push('3. Arquivar processo');
        break;
        
      case 'INVESTIGATE':
        steps.push('1. Encaminhar para equipe de investigação');
        steps.push('2. Notificar segurado sobre análise adicional');
        steps.push('3. Definir prazo para conclusão');
        break;
        
      case 'ADDITIONAL_DOCS':
        steps.push('1. Solicitar documentos faltantes');
        steps.push('2. Definir prazo para entrega');
        steps.push('3. Reagendar análise após recebimento');
        break;
    }
    
    return steps;
  }

  // Método para executar ações automáticas
  async executeAutomaticActions(
    decision: DecisionResult,
    claimNumber: string
  ): Promise<{ success: boolean; executedActions: string[]; errors: string[] }> {
    
    const executedActions: string[] = [];
    const errors: string[] = [];
    
    if (!decision.autoExecutable) {
      return { success: false, executedActions, errors: ['Decisão não é auto-executável'] };
    }
    
    for (const action of decision.requiredActions.filter(a => a.automated)) {
      try {
        switch (action.type) {
          case 'payment':
            await this.executePayment(decision.paymentInstruction!, claimNumber);
            executedActions.push(`Pagamento executado: ${action.description}`);
            break;
            
          case 'communication':
            await this.sendNotification(claimNumber, decision);
            executedActions.push(`Notificação enviada: ${action.description}`);
            break;
            
          case 'documentation':
            await this.requestDocuments(claimNumber, action.description);
            executedActions.push(`Documentos solicitados: ${action.description}`);
            break;
        }
      } catch (error) {
        errors.push(`Erro ao executar ${action.type}: ${error}`);
      }
    }
    
    return {
      success: errors.length === 0,
      executedActions,
      errors
    };
  }

  private async executePayment(instruction: PaymentInstruction, claimNumber: string): Promise<void> {
    // Integração com sistema de pagamentos
    console.log(`[PAYMENT] Executando pagamento para sinistro ${claimNumber}:`, instruction);
    
    // Aqui seria integrado com o sistema real de pagamentos
    // Por enquanto, apenas simula a execução
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  private async sendNotification(claimNumber: string, decision: DecisionResult): Promise<void> {
    // Integração com sistema de notificações
    console.log(`[NOTIFICATION] Enviando notificação para sinistro ${claimNumber}:`, decision.decision);
    
    // Aqui seria integrado com sistema de email/SMS
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  private async requestDocuments(claimNumber: string, description: string): Promise<void> {
    // Solicitação de documentos adicionais
    console.log(`[DOCS] Solicitando documentos para sinistro ${claimNumber}:`, description);
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

export const claimsDecisionEngine = new ClaimsDecisionEngine();
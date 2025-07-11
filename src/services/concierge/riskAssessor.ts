/**
 * Risk Assessment Service - Evaluates complexity, compliance and human review needs
 */

import { TaskContext } from '../conciergeOrchestrator';

export class RiskAssessorService {
  
  assessComplexity(query: string): 'low' | 'medium' | 'high' {
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

  assessComplianceRisk(query: string): 'low' | 'medium' | 'high' {
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

  assessHumanReviewRequired(context: TaskContext): boolean {
    // High-value claims
    if (context.extractedData?.valor_estimado > 50000) return true;
    
    // High compliance risk
    if (context.metadata?.complianceRisk === 'high') return true;
    
    // High complexity tasks
    if (context.metadata?.estimatedComplexity === 'high') return true;
    
    // Urgent priority with legal implications
    if (context.priority === 'urgent' && context.taskType === 'legal') return true;
    
    return false;
  }
}

export const riskAssessor = new RiskAssessorService();
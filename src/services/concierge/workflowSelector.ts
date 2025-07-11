/**
 * Workflow Selection Service - Selects optimal workflows based on context
 */

import { TaskContext } from '../conciergeOrchestrator';

export class WorkflowSelectorService {
  
  selectWorkflowByContext(context: TaskContext): string {
    if (context.taskType === 'claims') {
      return 'claims_processing';
    }
    
    if (context.taskType === 'policies' && 
        context.extractedData?.documentos_mencionados?.includes('apolice')) {
      return 'coverage_verification';
    }
    
    if (context.taskType === 'legal') {
      return 'legal_analysis';
    }
    
    return 'general_inquiry';
  }

  getWorkflowSelectionReason(context: TaskContext): string {
    const reasons = [];
    
    if (context.taskType === 'claims') {
      reasons.push('Processo de sinistro identificado');
    }
    
    if (context.metadata?.requiresHumanReview) {
      reasons.push('Revisão humana necessária');
    }
    
    if (context.metadata?.estimatedComplexity === 'high') {
      reasons.push('Alta complexidade detectada');
    }
    
    return reasons.join(', ') || 'Workflow padrão selecionado';
  }
}

export const workflowSelector = new WorkflowSelectorService();
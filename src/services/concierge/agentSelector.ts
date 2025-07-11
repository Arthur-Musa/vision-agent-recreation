/**
 * Agent Selection Service - Intelligent agent routing based on context
 */

import { TaskContext } from '../conciergeOrchestrator';

export class AgentSelectorService {
  
  async selectOptimalAgent(
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

  calculateAgentConfidence(context: TaskContext): number {
    let confidence = 0.6; // Enhanced base confidence
    
    // Boost confidence based on extracted data richness
    const dataPoints = Object.keys(context.extractedData || {}).length;
    confidence += Math.min(dataPoints * 0.05, 0.25);
    
    // Boost confidence for specific patterns
    if (context.extractedData?.valor_estimado) confidence += 0.1;
    if (context.extractedData?.tipo_sinistro) confidence += 0.1;
    if (context.extractedData?.documentos_mencionados?.length > 0) confidence += 0.05;
    
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
}

export const agentSelector = new AgentSelectorService();
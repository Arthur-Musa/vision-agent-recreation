// Mapeamento entre agentes do frontend e tipos da API
export const AGENT_TYPE_MAPPING = {
  'claims-processor': 'fraud_detection', // Para detecção de fraude
  'fraud-detector': 'fraud_detection',
  'underwriting-assistant': 'underwriting_analysis',
  'policy-analyzer': 'policy_analysis',
  'contract-reviewer': 'legal_analysis',
  'customer-assistant': 'customer_service'
} as const;

export const API_AGENT_CAPABILITIES = {
  fraud_detection: {
    name: 'Detecção de Fraude',
    description: 'Análise avançada para identificar potenciais fraudes',
    features: ['Análise de padrões', 'Score de risco', 'Detecção de inconsistências'],
    outputs: ['fraud_score', 'risk_indicators', 'confidence_level']
  },
  underwriting_analysis: {
    name: 'Análise de Subscrição',
    description: 'Avaliação de riscos e propostas de seguro',
    features: ['Avaliação de riscos', 'Cálculo de prêmios', 'Validação documental'],
    outputs: ['risk_assessment', 'premium_calculation', 'approval_recommendation']
  },
  policy_analysis: {
    name: 'Análise de Apólices',
    description: 'Extração e análise de termos contratuais',
    features: ['Extração de termos', 'Análise de coberturas', 'Identificação de exclusões'],
    outputs: ['extracted_terms', 'coverage_analysis', 'exclusions_list']
  },
  legal_analysis: {
    name: 'Análise Jurídica',
    description: 'Revisão de contratos e identificação de riscos legais',
    features: ['Identificação de riscos', 'Análise de cláusulas', 'Compliance check'],
    outputs: ['legal_risks', 'clause_analysis', 'compliance_status']
  },
  customer_service: {
    name: 'Atendimento ao Cliente',
    description: 'Processamento de solicitações e triagem automática',
    features: ['Triagem inteligente', 'Respostas automáticas', 'Escalação de casos'],
    outputs: ['response_suggestion', 'escalation_needed', 'customer_satisfaction']
  }
} as const;

export function getApiAgentType(frontendAgentId: string): string {
  return AGENT_TYPE_MAPPING[frontendAgentId as keyof typeof AGENT_TYPE_MAPPING] || 'fraud_detection';
}

export function getAgentCapabilities(apiAgentType: string) {
  return API_AGENT_CAPABILITIES[apiAgentType as keyof typeof API_AGENT_CAPABILITIES] || API_AGENT_CAPABILITIES.fraud_detection;
}
import { InsuranceAgent } from '../types/agents';

export const insuranceAgents: InsuranceAgent[] = [
  // CLAIMS PROCESSING AGENTS
  {
    id: 'claims-processor',
    name: {
      'pt-BR': 'Olga Processador de Sinistros',
      'pt': 'Olga Processador de Sinistros',
      'en': 'Olga Claims Processor'
    },
    description: {
      'pt-BR': 'Automatiza a análise completa de sinistros, extraindo dados de FNOL, avaliando severidade e roteando para equipes especializadas.',
      'pt': 'Automatiza a análise completa de sinistros, extraindo dados de FNOL, avaliando severidade e roteando para equipes especializadas.',
      'en': 'Automates complete claims analysis, extracting FNOL data, assessing severity and routing to specialized teams.'
    },
    category: 'claims',
    features: [
      {
        'pt-BR': 'Extração de Dados FNOL',
        'pt': 'Extração de Dados FNOL',
        'en': 'FNOL Data Extraction'
      },
      {
        'pt-BR': 'Avaliação de Severidade',
        'pt': 'Avaliação de Severidade',
        'en': 'Severity Assessment'
      },
      {
        'pt-BR': 'Roteamento Automático',
        'pt': 'Roteamento Automático',
        'en': 'Automatic Routing'
      }
    ],
    estimatedTime: '2-5 min',
    complexityLevel: 'medium',
    documentTypes: ['PDF', 'Images', 'Forms'],
    capabilities: ['document_parsing', 'data_extraction', 'risk_assessment'],
    useCase: {
      'pt-BR': 'Processa automaticamente novos sinistros, extraindo informações críticas e determinando prioridade de atendimento.',
      'pt': 'Processa automaticamente novos sinistros, extraindo informações críticas e determinando prioridade de atendimento.',
      'en': 'Automatically processes new claims, extracting critical information and determining service priority.'
    }
  },
  {
    id: 'fraud-detector',
    name: {
      'pt-BR': 'Olga Detector de Fraudes',
      'pt': 'Olga Detector de Fraudes',
      'en': 'Olga Fraud Detector'
    },
    description: {
      'pt-BR': 'Identifica padrões suspeitos em sinistros, analisando inconsistências, timing e histórico para detectar potenciais fraudes.',
      'pt': 'Identifica padrões suspeitos em sinistros, analisando inconsistências, timing e histórico para detectar potenciais fraudes.',
      'en': 'Identifies suspicious patterns in claims, analyzing inconsistencies, timing and history to detect potential fraud.'
    },
    category: 'claims',
    features: [
      {
        'pt-BR': 'Análise de Padrões',
        'pt': 'Análise de Padrões',
        'en': 'Pattern Analysis'
      },
      {
        'pt-BR': 'Score de Risco',
        'pt': 'Score de Risco',
        'en': 'Risk Scoring'
      },
      {
        'pt-BR': 'Detecção de Inconsistências',
        'pt': 'Detecção de Inconsistências',
        'en': 'Inconsistency Detection'
      }
    ],
    estimatedTime: '3-7 min',
    complexityLevel: 'high',
    documentTypes: ['PDF', 'Images', 'Reports', 'Forms'],
    capabilities: ['fraud_detection', 'pattern_analysis', 'risk_scoring'],
    useCase: {
      'pt-BR': 'Analisa sinistros em busca de indicadores de fraude, gerando score de risco e relatórios detalhados.',
      'pt': 'Analisa sinistros em busca de indicadores de fraude, gerando score de risco e relatórios detalhados.',
      'en': 'Analyzes claims for fraud indicators, generating risk scores and detailed reports.'
    }
  },

  // UNDERWRITING AGENTS
  {
    id: 'underwriting-assistant',
    name: {
      'pt-BR': 'Olga Assistente de Subscrição',
      'pt': 'Olga Assistente de Subscrição',
      'en': 'Olga Underwriting Assistant'
    },
    description: {
      'pt-BR': 'Avalia propostas de seguro automaticamente, analisando riscos, calculando prêmios e validando documentação.',
      'pt': 'Avalia propostas de seguro automaticamente, analisando riscos, calculando prêmios e validando documentação.',
      'en': 'Automatically evaluates insurance proposals, analyzing risks, calculating premiums and validating documentation.'
    },
    category: 'underwriting',
    features: [
      {
        'pt-BR': 'Avaliação de Riscos',
        'pt': 'Avaliação de Riscos',
        'en': 'Risk Assessment'
      },
      {
        'pt-BR': 'Cálculo de Prêmios',
        'pt': 'Cálculo de Prêmios',
        'en': 'Premium Calculation'
      },
      {
        'pt-BR': 'Validação de Documentos',
        'pt': 'Validação de Documentos',
        'en': 'Document Validation'
      }
    ],
    estimatedTime: '5-10 min',
    complexityLevel: 'high',
    documentTypes: ['PDF', 'Excel', 'Forms', 'Images'],
    capabilities: ['risk_analysis', 'premium_calculation', 'document_validation'],
    useCase: {
      'pt-BR': 'Acelera o processo de subscrição analisando propostas e fornecendo recomendações baseadas em dados.',
      'pt': 'Acelera o processo de subscrição analisando propostas e fornecendo recomendações baseadas em dados.',
      'en': 'Accelerates underwriting process by analyzing proposals and providing data-driven recommendations.'
    }
  },
  {
    id: 'policy-analyzer',
    name: {
      'pt-BR': 'Olga Analisador de Apólices',
      'pt': 'Olga Analisador de Apólices',
      'en': 'Olga Policy Analyzer'
    },
    description: {
      'pt-BR': 'Extrai e analisa termos de apólices, identificando coberturas, exclusões e cláusulas especiais.',
      'pt': 'Extrai e analisa termos de apólices, identificando coberturas, exclusões e cláusulas especiais.',
      'en': 'Extracts and analyzes policy terms, identifying coverages, exclusions and special clauses.'
    },
    category: 'underwriting',
    features: [
      {
        'pt-BR': 'Extração de Termos',
        'pt': 'Extração de Termos',
        'en': 'Terms Extraction'
      },
      {
        'pt-BR': 'Análise de Coberturas',
        'pt': 'Análise de Coberturas',
        'en': 'Coverage Analysis'
      },
      {
        'pt-BR': 'Identificação de Exclusões',
        'pt': 'Identificação de Exclusões',
        'en': 'Exclusions Identification'
      }
    ],
    estimatedTime: '2-4 min',
    complexityLevel: 'medium',
    documentTypes: ['PDF', 'Word'],
    capabilities: ['document_parsing', 'terms_extraction', 'coverage_analysis'],
    useCase: {
      'pt-BR': 'Digitaliza e estrutura informações de apólices para facilitar consultas e comparações.',
      'pt': 'Digitaliza e estrutura informações de apólices para facilitar consultas e comparações.',
      'en': 'Digitizes and structures policy information to facilitate queries and comparisons.'
    }
  },

  // LEGAL AGENTS
  {
    id: 'contract-reviewer',
    name: {
      'pt-BR': 'Olga Revisor de Contratos',
      'pt': 'Olga Revisor de Contratos',
      'en': 'Olga Contract Reviewer'
    },
    description: {
      'pt-BR': 'Analisa contratos de seguro, identificando riscos jurídicos, cláusulas não-padrão e obrigações contratuais.',
      'pt': 'Analisa contratos de seguro, identificando riscos jurídicos, cláusulas não-padrão e obrigações contratuais.',
      'en': 'Analyzes insurance contracts, identifying legal risks, non-standard clauses and contractual obligations.'
    },
    category: 'legal',
    features: [
      {
        'pt-BR': 'Identificação de Riscos',
        'pt': 'Identificação de Riscos',
        'en': 'Risk Identification'
      },
      {
        'pt-BR': 'Análise de Cláusulas',
        'pt': 'Análise de Cláusulas',
        'en': 'Clause Analysis'
      },
      {
        'pt-BR': 'Rastreamento de Obrigações',
        'pt': 'Rastreamento de Obrigações',
        'en': 'Obligations Tracking'
      }
    ],
    estimatedTime: '7-12 min',
    complexityLevel: 'high',
    documentTypes: ['PDF', 'Word'],
    capabilities: ['legal_analysis', 'risk_identification', 'clause_extraction'],
    useCase: {
      'pt-BR': 'Acelera a revisão jurídica de contratos, identificando pontos críticos e sugerindo melhorias.',
      'pt': 'Acelera a revisão jurídica de contratos, identificando pontos críticos e sugerindo melhorias.',
      'en': 'Accelerates legal contract review, identifying critical points and suggesting improvements.'
    }
  },

  // CUSTOMER SERVICE AGENTS
  {
    id: 'customer-assistant',
    name: {
      'pt-BR': 'Olga Assistente do Cliente',
      'pt': 'Olga Assistente do Cliente',
      'en': 'Olga Customer Assistant'
    },
    description: {
      'pt-BR': 'Automatiza atendimento ao cliente, triando solicitações, fornecendo respostas e escalando casos complexos.',
      'pt': 'Automatiza atendimento ao cliente, triando solicitações, fornecendo respostas e escalando casos complexos.',
      'en': 'Automates customer service, triaging requests, providing answers and escalating complex cases.'
    },
    category: 'customer',
    features: [
      {
        'pt-BR': 'Triagem Inteligente',
        'pt': 'Triagem Inteligente',
        'en': 'Smart Triage'
      },
      {
        'pt-BR': 'Respostas Automáticas',
        'pt': 'Respostas Automáticas',
        'en': 'Automated Responses'
      },
      {
        'pt-BR': 'Escalação de Casos',
        'pt': 'Escalação de Casos',
        'en': 'Case Escalation'
      }
    ],
    estimatedTime: '1-3 min',
    complexityLevel: 'low',
    documentTypes: ['Text', 'Email', 'Forms'],
    capabilities: ['natural_language', 'triage', 'escalation'],
    useCase: {
      'pt-BR': 'Melhora a experiência do cliente fornecendo respostas rápidas e direcionamento adequado.',
      'pt': 'Melhora a experiência do cliente fornecendo respostas rápidas e direcionamento adequado.',
      'en': 'Improves customer experience by providing quick responses and proper routing.'
    }
  }
];

export const agentCategories = [
  {
    id: 'claims' as const,
    name: {
      'pt-BR': 'Sinistros',
      'pt': 'Sinistros',
      'en': 'Claims'
    },
    description: {
      'pt-BR': 'Processamento e análise de sinistros',
      'pt': 'Processamento e análise de sinistros',
      'en': 'Claims processing and analysis'
    },
    gradient: 'gradient-claims'
  },
  {
    id: 'underwriting' as const,
    name: {
      'pt-BR': 'Subscrição',
      'pt': 'Subscrição',
      'en': 'Underwriting'
    },
    description: {
      'pt-BR': 'Avaliação de riscos e propostas',
      'pt': 'Avaliação de riscos e propostas',
      'en': 'Risk assessment and proposals'
    },
    gradient: 'gradient-underwriting'
  },
  {
    id: 'legal' as const,
    name: {
      'pt-BR': 'Jurídico',
      'pt': 'Jurídico',
      'en': 'Legal'
    },
    description: {
      'pt-BR': 'Análise de contratos e compliance',
      'pt': 'Análise de contratos e compliance',
      'en': 'Contract analysis and compliance'
    },
    gradient: 'gradient-legal'
  },
  {
    id: 'customer' as const,
    name: {
      'pt-BR': 'Atendimento',
      'pt': 'Atendimento',
      'en': 'Customer Service'
    },
    description: {
      'pt-BR': 'Suporte e atendimento ao cliente',
      'pt': 'Suporte e atendimento ao cliente',
      'en': 'Customer support and service'
    },
    gradient: 'gradient-customer'
  }
];
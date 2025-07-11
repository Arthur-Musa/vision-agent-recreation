/**
 * Orquestrador de Pipeline de IA - Coordena fluxos de processamento complexos
 */

export interface PipelineStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'skipped';
  description: string;
  timestamp?: string;
  result?: any;
  error?: string;
  retryCount?: number;
  dependencies?: string[];
}

export interface PipelineContext {
  id: string;
  type: 'claim_processing' | 'underwriting' | 'document_analysis' | 'fraud_detection';
  input: any;
  steps: PipelineStep[];
  currentStep: number;
  metadata: Record<string, any>;
  startTime: string;
  endTime?: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
}

export interface PipelineDefinition {
  id: string;
  name: string;
  description: string;
  steps: Array<{
    id: string;
    name: string;
    description: string;
    processor: string;
    config?: any;
    retry?: { maxAttempts: number; backoffMs: number };
    timeout?: number;
    dependencies?: string[];
    parallel?: boolean;
  }>;
}

class PipelineOrchestrator {
  private pipelines: Map<string, PipelineDefinition> = new Map();
  private runningContexts: Map<string, PipelineContext> = new Map();
  private processors: Map<string, (input: any, config?: any) => Promise<any>> = new Map();

  constructor() {
    this.initializePipelines();
    this.registerProcessors();
  }

  private initializePipelines() {
    // Pipeline para processamento de sinistros
    this.pipelines.set('claim_processing', {
      id: 'claim_processing',
      name: 'Processamento de Sinistros',
      description: 'Pipeline completo para análise e processamento de sinistros',
      steps: [
        {
          id: 'document_classification',
          name: 'Classificação de Documentos',
          description: 'Classificar tipos de documentos recebidos',
          processor: 'classify_documents',
          retry: { maxAttempts: 3, backoffMs: 1000 },
          timeout: 30000
        },
        {
          id: 'field_extraction',
          name: 'Extração de Campos',
          description: 'Extrair informações estruturadas dos documentos',
          processor: 'extract_fields',
          dependencies: ['document_classification'],
          parallel: true,
          retry: { maxAttempts: 2, backoffMs: 2000 }
        },
        {
          id: 'fraud_analysis',
          name: 'Análise de Fraude',
          description: 'Aplicar modelos de detecção de fraude',
          processor: 'fraud_detection',
          dependencies: ['field_extraction'],
          timeout: 45000
        },
        {
          id: 'damage_assessment',
          name: 'Avaliação de Danos',
          description: 'Analisar imagens e estimar danos',
          processor: 'damage_analysis',
          dependencies: ['field_extraction'],
          parallel: true
        },
        {
          id: 'risk_calculation',
          name: 'Cálculo de Risco',
          description: 'Calcular score de risco e reservas',
          processor: 'risk_assessment',
          dependencies: ['fraud_analysis', 'damage_assessment']
        },
        {
          id: 'decision_generation',
          name: 'Geração de Decisão',
          description: 'Gerar recomendação final e próximos passos',
          processor: 'decision_maker',
          dependencies: ['risk_calculation']
        }
      ]
    });

    // Pipeline para subscrição
    this.pipelines.set('underwriting', {
      id: 'underwriting',
      name: 'Análise de Subscrição',
      description: 'Pipeline para análise de propostas de seguro',
      steps: [
        {
          id: 'application_validation',
          name: 'Validação da Proposta',
          description: 'Validar completude e consistência da proposta',
          processor: 'validate_application'
        },
        {
          id: 'risk_profiling',
          name: 'Perfilamento de Risco',
          description: 'Analisar perfil de risco do segurado',
          processor: 'risk_profiling',
          dependencies: ['application_validation']
        },
        {
          id: 'premium_calculation',
          name: 'Cálculo de Prêmio',
          description: 'Calcular prêmio baseado no risco',
          processor: 'premium_calculator',
          dependencies: ['risk_profiling']
        },
        {
          id: 'compliance_check',
          name: 'Verificação de Compliance',
          description: 'Verificar conformidade regulatória',
          processor: 'compliance_validator',
          dependencies: ['risk_profiling'],
          parallel: true
        },
        {
          id: 'underwriting_decision',
          name: 'Decisão de Subscrição',
          description: 'Gerar decisão final de aceite/recusa',
          processor: 'underwriting_decision',
          dependencies: ['premium_calculation', 'compliance_check']
        }
      ]
    });
  }

  private registerProcessors() {
    // Processadores de documentos
    this.processors.set('classify_documents', async (input: any) => {
      // Simula classificação de documentos
      await this.delay(2000);
      return {
        documents: input.documents?.map((doc: any) => ({
          ...doc,
          type: this.classifyDocumentType(doc.name),
          confidence: Math.random() * 0.3 + 0.7
        })) || []
      };
    });

    this.processors.set('extract_fields', async (input: any) => {
      await this.delay(3000);
      return {
        extractedData: {
          claimNumber: `CLM-${Date.now()}`,
          incidentDate: new Date().toISOString(),
          claimAmount: Math.floor(Math.random() * 100000) + 10000,
          location: 'São Paulo, SP',
          description: 'Sinistro processado automaticamente'
        }
      };
    });

    this.processors.set('fraud_detection', async (input: any) => {
      await this.delay(4000);
      const fraudScore = Math.random();
      return {
        fraudScore,
        riskLevel: fraudScore > 0.7 ? 'high' : fraudScore > 0.4 ? 'medium' : 'low',
        indicators: fraudScore > 0.5 ? ['Valor alto', 'Padrão suspeito'] : [],
        requiresReview: fraudScore > 0.6
      };
    });

    this.processors.set('damage_analysis', async (input: any) => {
      await this.delay(3500);
      return {
        damageLevel: Math.random() > 0.5 ? 'moderate' : 'severe',
        estimatedCost: Math.floor(Math.random() * 50000) + 5000,
        repairRecommendations: ['Substituir peça X', 'Reparar component Y']
      };
    });

    this.processors.set('risk_assessment', async (input: any) => {
      await this.delay(2500);
      return {
        riskScore: Math.random() * 100,
        reserveAmount: input.extractedData?.claimAmount * 1.2,
        confidence: Math.random() * 0.3 + 0.7
      };
    });

    this.processors.set('decision_maker', async (input: any) => {
      await this.delay(1500);
      return {
        decision: Math.random() > 0.3 ? 'approve' : 'review_required',
        reasoning: 'Baseado na análise de risco e detecção de fraude',
        nextSteps: ['Notificar segurado', 'Agendar vistoria'],
        confidence: Math.random() * 0.4 + 0.6
      };
    });

    // Processadores de subscrição
    this.processors.set('validate_application', async (input: any) => {
      await this.delay(1000);
      return { isValid: true, missingFields: [] };
    });

    this.processors.set('risk_profiling', async (input: any) => {
      await this.delay(2000);
      return { riskProfile: 'medium', factors: ['Age', 'Location', 'History'] };
    });

    this.processors.set('premium_calculator', async (input: any) => {
      await this.delay(1500);
      return { premium: Math.floor(Math.random() * 2000) + 500 };
    });

    this.processors.set('compliance_validator', async (input: any) => {
      await this.delay(2500);
      return { compliant: true, issues: [] };
    });

    this.processors.set('underwriting_decision', async (input: any) => {
      await this.delay(1000);
      return { decision: 'approve', conditions: [] };
    });
  }

  async startPipeline(pipelineId: string, input: any): Promise<string> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) {
      throw new Error(`Pipeline ${pipelineId} não encontrado`);
    }

    const contextId = `${pipelineId}_${Date.now()}`;
    const context: PipelineContext = {
      id: contextId,
      type: pipelineId as any,
      input,
      steps: pipeline.steps.map(step => ({
        id: step.id,
        name: step.name,
        status: 'pending',
        description: step.description,
        dependencies: step.dependencies
      })),
      currentStep: 0,
      metadata: {},
      startTime: new Date().toISOString(),
      status: 'running'
    };

    this.runningContexts.set(contextId, context);
    
    // Executar pipeline de forma assíncrona
    this.executePipeline(contextId).catch(error => {
      console.error(`Pipeline ${contextId} failed:`, error);
      context.status = 'failed';
    });

    return contextId;
  }

  private async executePipeline(contextId: string): Promise<void> {
    const context = this.runningContexts.get(contextId);
    if (!context) return;

    const pipeline = this.pipelines.get(context.type);
    if (!pipeline) return;

    try {
      // Executar steps sequenciais e paralelos
      await this.executeSteps(context, pipeline);
      
      context.status = 'completed';
      context.endTime = new Date().toISOString();
    } catch (error) {
      context.status = 'failed';
      context.endTime = new Date().toISOString();
      throw error;
    }
  }

  private async executeSteps(context: PipelineContext, pipeline: PipelineDefinition): Promise<void> {
    const executed = new Set<string>();
    const results = new Map<string, any>();
    
    while (executed.size < pipeline.steps.length) {
      const readySteps = pipeline.steps.filter(step => 
        !executed.has(step.id) && 
        (step.dependencies || []).every(dep => executed.has(dep))
      );

      if (readySteps.length === 0) {
        throw new Error('Pipeline deadlock: nenhum step pode ser executado');
      }

      // Executar steps prontos (paralelamente se possível)
      const parallelSteps = readySteps.filter(step => step.parallel);
      const sequentialSteps = readySteps.filter(step => !step.parallel);

      // Executar steps paralelos
      if (parallelSteps.length > 0) {
        const promises = parallelSteps.map(step => this.executeStep(context, step, results));
        const stepResults = await Promise.all(promises);
        
        parallelSteps.forEach((step, index) => {
          results.set(step.id, stepResults[index]);
          executed.add(step.id);
        });
      }

      // Executar steps sequenciais
      for (const step of sequentialSteps) {
        const result = await this.executeStep(context, step, results);
        results.set(step.id, result);
        executed.add(step.id);
      }
    }

    context.metadata.results = Object.fromEntries(results);
  }

  private async executeStep(
    context: PipelineContext, 
    stepDef: any, 
    previousResults: Map<string, any>
  ): Promise<any> {
    const stepIndex = context.steps.findIndex(s => s.id === stepDef.id);
    const step = context.steps[stepIndex];
    
    step.status = 'processing';
    step.timestamp = new Date().toISOString();
    context.currentStep = stepIndex + 1;

    try {
      const processor = this.processors.get(stepDef.processor);
      if (!processor) {
        throw new Error(`Processor ${stepDef.processor} não encontrado`);
      }

      // Preparar input com resultados anteriores
      const stepInput = {
        ...context.input,
        ...Object.fromEntries(previousResults)
      };

      const result = await processor(stepInput, stepDef.config);
      
      step.status = 'completed';
      step.result = result;
      
      return result;
    } catch (error) {
      step.status = 'error';
      step.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  getContext(contextId: string): PipelineContext | undefined {
    return this.runningContexts.get(contextId);
  }

  getAllRunningContexts(): PipelineContext[] {
    return Array.from(this.runningContexts.values());
  }

  pausePipeline(contextId: string): boolean {
    const context = this.runningContexts.get(contextId);
    if (context && context.status === 'running') {
      context.status = 'paused';
      return true;
    }
    return false;
  }

  resumePipeline(contextId: string): boolean {
    const context = this.runningContexts.get(contextId);
    if (context && context.status === 'paused') {
      context.status = 'running';
      this.executePipeline(contextId);
      return true;
    }
    return false;
  }

  private classifyDocumentType(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.includes('rg') || lower.includes('identidade')) return 'RG';
    if (lower.includes('cpf')) return 'CPF';
    if (lower.includes('cnh') || lower.includes('habilitacao')) return 'CNH';
    if (lower.includes('laudo')) return 'LAUDO';
    if (lower.includes('orcamento')) return 'ORÇAMENTO';
    if (lower.includes('nota') || lower.includes('fiscal')) return 'NOTA_FISCAL';
    if (lower.includes('apolice') || lower.includes('contrato')) return 'APÓLICE';
    if (lower.includes('bo') || lower.includes('ocorrencia')) return 'BOLETIM_OCORRENCIA';
    return 'DOCUMENTO_GENERICO';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const pipelineOrchestrator = new PipelineOrchestrator();
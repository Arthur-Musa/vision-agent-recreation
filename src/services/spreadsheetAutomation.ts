import { conciergeAI } from './aiMiddleware/conciergeAI';
import { pipelineOrchestrator } from './aiMiddleware/pipelineOrchestrator';
import { localStorageService } from './localStorageService';

interface SpreadsheetRow {
  id: string;
  claimNumber: string;
  type: string;
  status: string;
  agent: string;
  processedAt: string;
  insuredName: string;
  estimatedAmount: number;
  automationStatus?: 'pending' | 'processing' | 'completed' | 'error';
  taskId?: string;
  progress?: number;
  lastUpdate?: string;
}

interface AutomationTask {
  id: string;
  rowId: string;
  type: 'claim_analysis' | 'fraud_detection' | 'coverage_analysis' | 'underwriting';
  status: 'pending' | 'processing' | 'completed' | 'error';
  assignedAgents: string[];
  context: Record<string, any>;
  results?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class SpreadsheetAutomation {
  private concierge = conciergeAI;
  private orchestrator = pipelineOrchestrator;
  private processingTasks = new Map<string, AutomationTask>();
  private isWatching = false;

  constructor() {
    // Serviços já inicializados como instâncias
  }

  // Inicia o monitoramento automatizado
  startAutomation() {
    if (this.isWatching) return;
    
    this.isWatching = true;
    this.watchSpreadsheetChanges();
    console.log('🤖 Automação do Spreadsheet iniciada');
  }

  // Para o monitoramento
  stopAutomation() {
    this.isWatching = false;
    console.log('⏹️ Automação do Spreadsheet pausada');
  }

  // Monitora mudanças no localStorage
  private watchSpreadsheetChanges() {
    let lastKnownData: SpreadsheetRow[] = [];

    const checkChanges = () => {
      if (!this.isWatching) return;

      try {
        const currentData = this.getSpreadsheetData();
        const newRows = this.detectNewRows(lastKnownData, currentData);
        
        if (newRows.length > 0) {
          console.log(`📊 Detectadas ${newRows.length} novas linhas para processamento`);
          newRows.forEach(row => this.processNewRow(row));
        }

        lastKnownData = [...currentData];
      } catch (error) {
        console.error('Erro ao monitorar spreadsheet:', error);
      }

      // Verifica novamente em 2 segundos
      setTimeout(checkChanges, 2000);
    };

    checkChanges();
  }

  // Detecta novas linhas comparando datasets
  private detectNewRows(oldData: SpreadsheetRow[], newData: SpreadsheetRow[]): SpreadsheetRow[] {
    const oldIds = new Set(oldData.map(row => row.id));
    return newData.filter(row => 
      !oldIds.has(row.id) && 
      !row.automationStatus // Só processa se ainda não foi automatizada
    );
  }

  // Processa uma nova linha detectada
  private async processNewRow(row: SpreadsheetRow) {
    try {
      console.log(`🔄 Processando nova linha: ${row.claimNumber}`);
      
      // Marca como processando
      await this.updateRowStatus(row.id, 'processing', 0);

      // Analisa a tarefa com o Concierge
      const taskAnalysis = await this.analyzeTask(row);
      
      // Cria task de automação
      const task: AutomationTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rowId: row.id,
        type: this.determineTaskType(row),
        status: 'pending',
        assignedAgents: taskAnalysis.recommendedAgents || [],
        context: taskAnalysis.context || {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.processingTasks.set(task.id, task);

      // Executa pipeline de automação
      await this.executeAutomationPipeline(task, row);

    } catch (error) {
      console.error(`Erro ao processar linha ${row.claimNumber}:`, error);
      await this.updateRowStatus(row.id, 'error', 0);
    }
  }

  // Analisa a tarefa usando o Concierge
  private async analyzeTask(row: SpreadsheetRow) {
    const message = `
Analise esta solicitação no spreadsheet:
- Tipo: ${row.type}
- Segurado: ${row.insuredName}
- Valor: R$ ${row.estimatedAmount?.toLocaleString('pt-BR')}
- Status atual: ${row.status}

Determine:
1. Tipo de análise necessária
2. Agentes recomendados
3. Contexto adicional
4. Prioridade
`;

    try {
      const analysis = await this.concierge.processMessage({
        message,
        context: {
          sessionId: `analysis_${row.id}`,
          userRole: 'system',
          availableActions: ['analyze_task', 'recommend_agents']
        }
      });

      return {
        recommendedAgents: this.extractAgentsFromAnalysis(analysis.response, row.type),
        context: {
          analysisResult: analysis.response,
          priority: this.calculatePriority(row),
          estimatedDuration: this.estimateDuration(row.type)
        }
      };
    } catch (error) {
      console.error('Erro na análise do Concierge:', error);
      return {
        recommendedAgents: [this.getDefaultAgent(row.type)],
        context: { error: 'Fallback to default agent' }
      };
    }
  }

  // Executa o pipeline de automação
  private async executeAutomationPipeline(task: AutomationTask, row: SpreadsheetRow) {
    try {
      console.log(`🚀 Iniciando pipeline para ${row.claimNumber}`);
      
      // Atualiza progresso: Iniciando
      await this.updateRowStatus(row.id, 'processing', 20, task.id);

      // Define o workflow baseado no tipo
      const workflowSteps = this.defineWorkflowSteps(task.type, row);
      
      let currentProgress = 20;
      const progressIncrement = 60 / workflowSteps.length;

      // Executa cada step do workflow
      for (const step of workflowSteps) {
        console.log(`📋 Executando: ${step.name}`);
        
        const stepResult = await this.executeWorkflowStep(step, task, row);
        
        // Atualiza progresso
        currentProgress += progressIncrement;
        await this.updateRowStatus(row.id, 'processing', currentProgress, task.id);

        // Adiciona resultado ao task
        if (!task.results) task.results = {};
        task.results[step.name] = stepResult;
      }

      // Finaliza processamento
      await this.finalizeAutomation(task, row);

    } catch (error) {
      console.error(`Erro no pipeline para ${row.claimNumber}:`, error);
      task.status = 'error';
      await this.updateRowStatus(row.id, 'error', 0, task.id);
    }
  }

  // Define steps do workflow baseado no tipo
  private defineWorkflowSteps(taskType: string, row: SpreadsheetRow) {
    const baseSteps = [
      { name: 'document_classification', agent: 'classifier' },
      { name: 'data_extraction', agent: 'extractor' },
      { name: 'validation', agent: 'validator' }
    ];

    switch (taskType) {
      case 'claim_analysis':
        return [
          ...baseSteps,
          { name: 'coverage_verification', agent: 'coverage_analyzer' },
          { name: 'damage_assessment', agent: 'damage_assessor' },
          { name: 'fraud_check', agent: 'fraud_detector' }
        ];
      
      case 'fraud_detection':
        return [
          ...baseSteps,
          { name: 'pattern_analysis', agent: 'fraud_detector' },
          { name: 'risk_scoring', agent: 'risk_analyzer' },
          { name: 'investigation_recommendation', agent: 'investigator' }
        ];
      
      case 'coverage_analysis':
        return [
          ...baseSteps,
          { name: 'policy_review', agent: 'policy_analyzer' },
          { name: 'coverage_mapping', agent: 'coverage_analyzer' },
          { name: 'exclusion_check', agent: 'exclusion_checker' }
        ];
      
      default:
        return baseSteps;
    }
  }

  // Executa um step do workflow
  private async executeWorkflowStep(step: any, task: AutomationTask, row: SpreadsheetRow) {
    try {
      // Simula processamento do agente
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Retorna resultado simulado baseado no step
      switch (step.name) {
        case 'document_classification':
          return { documentTypes: ['policy', 'claim_form', 'evidence'], confidence: 0.95 };
        
        case 'data_extraction':
          return { 
            extractedFields: {
              policyNumber: `POL-${Math.random().toString(36).substr(2, 8)}`,
              incidentDate: new Date().toISOString(),
              claimAmount: row.estimatedAmount
            }
          };
        
        case 'fraud_check':
          const fraudScore = Math.random();
          return { 
            fraudScore, 
            riskLevel: fraudScore > 0.7 ? 'high' : fraudScore > 0.4 ? 'medium' : 'low',
            flags: fraudScore > 0.7 ? ['suspicious_timing', 'high_value'] : []
          };
        
        default:
          return { status: 'completed', timestamp: new Date().toISOString() };
      }
    } catch (error) {
      console.error(`Erro no step ${step.name}:`, error);
      return { error: error.message, status: 'failed' };
    }
  }

  // Finaliza a automação e atualiza spreadsheet
  private async finalizeAutomation(task: AutomationTask, row: SpreadsheetRow) {
    try {
      // Compila resultados finais
      const finalResults = this.compileFinalResults(task);
      
      // Atualiza status da linha no spreadsheet
      await this.updateSpreadsheetRow(row.id, {
        status: finalResults.recommendedStatus,
        agent: finalResults.assignedAgent,
        automationStatus: 'completed',
        progress: 100,
        lastUpdate: new Date().toISOString()
      });

      // Remove da lista de processamento
      this.processingTasks.delete(task.id);

      console.log(`✅ Automação concluída para ${row.claimNumber}`);

      // Notifica conclusão
      this.notifyAutomationComplete(row, finalResults);

    } catch (error) {
      console.error('Erro ao finalizar automação:', error);
      throw error;
    }
  }

  // Compila resultados finais da automação
  private compileFinalResults(task: AutomationTask) {
    const results = task.results || {};
    
    // Determina status recomendado baseado nos resultados
    let recommendedStatus = 'completed';
    let assignedAgent = 'Claims Processor';

    if (results.fraud_check?.fraudScore > 0.7) {
      recommendedStatus = 'flagged';
      assignedAgent = 'Fraud Detector';
    } else if (results.validation?.issues?.length > 0) {
      recommendedStatus = 'pending';
      assignedAgent = 'Review Specialist';
    }

    return {
      recommendedStatus,
      assignedAgent,
      fraudScore: results.fraud_check?.fraudScore || 0,
      extractedData: results.data_extraction?.extractedFields || {},
      automationSummary: `Processado automaticamente em ${new Date().toLocaleString('pt-BR')}`
    };
  }

  // Métodos auxiliares
  private getSpreadsheetData(): SpreadsheetRow[] {
    try {
      const data = localStorage.getItem('olga_spreadsheet_cases');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async updateRowStatus(rowId: string, status: string, progress: number, taskId?: string) {
    const data = this.getSpreadsheetData();
    const rowIndex = data.findIndex(row => row.id === rowId);
    
    if (rowIndex !== -1) {
      data[rowIndex] = {
        ...data[rowIndex],
        automationStatus: status as any,
        progress,
        taskId,
        lastUpdate: new Date().toISOString()
      };
      
      localStorage.setItem('olga_spreadsheet_cases', JSON.stringify(data));
    }
  }

  private async updateSpreadsheetRow(rowId: string, updates: Partial<SpreadsheetRow>) {
    const data = this.getSpreadsheetData();
    const rowIndex = data.findIndex(row => row.id === rowId);
    
    if (rowIndex !== -1) {
      data[rowIndex] = { ...data[rowIndex], ...updates };
      localStorage.setItem('olga_spreadsheet_cases', JSON.stringify(data));
    }
  }

  private determineTaskType(row: SpreadsheetRow): AutomationTask['type'] {
    switch (row.type.toLowerCase()) {
      case 'auto': return 'claim_analysis';
      case 'vida': return 'fraud_detection';
      case 'ape':
      case 'bag': return 'coverage_analysis';
      default: return 'claim_analysis';
    }
  }

  private extractAgentsFromAnalysis(analysis: string, type: string): string[] {
    // Lógica para extrair agentes recomendados da análise
    const defaultAgents = {
      'APE': ['Claims Processor', 'Aura'],
      'BAG': ['Claims Processor', 'Aura'],
      'Auto': ['Claims Processor', 'Fraud Detector'],
      'Vida': ['Fraud Detector', 'Claims Processor'],
      'Residencial': ['Claims Processor', 'Aura']
    };
    
    return defaultAgents[type as keyof typeof defaultAgents] || ['Claims Processor'];
  }

  private calculatePriority(row: SpreadsheetRow): 'high' | 'medium' | 'low' {
    if (row.estimatedAmount > 50000) return 'high';
    if (row.estimatedAmount > 20000) return 'medium';
    return 'low';
  }

  private estimateDuration(type: string): number {
    const durations = {
      'claim_analysis': 300, // 5 minutos
      'fraud_detection': 600, // 10 minutos
      'coverage_analysis': 180, // 3 minutos
      'underwriting': 900 // 15 minutos
    };
    
    return durations[type as keyof typeof durations] || 300;
  }

  private getDefaultAgent(type: string): string {
    const defaults = {
      'APE': 'Claims Processor',
      'BAG': 'Aura', 
      'Auto': 'Claims Processor',
      'Vida': 'Fraud Detector',
      'Residencial': 'Claims Processor'
    };
    
    return defaults[type as keyof typeof defaults] || 'Claims Processor';
  }

  private notifyAutomationComplete(row: SpreadsheetRow, results: any) {
    // Pode implementar notificações toast, webhooks, etc.
    console.log(`🔔 Automação concluída: ${row.claimNumber}`, results);
  }

  // API para webhook externo
  static async processWebhookData(webhookData: any) {
    try {
      // Converte dados do webhook para formato do spreadsheet
      const spreadsheetRow: SpreadsheetRow = {
        id: `WH-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        claimNumber: webhookData.claimNumber || `AUTO-${Date.now()}`,
        type: webhookData.type || 'Auto',
        status: 'pending',
        agent: 'Automation',
        processedAt: new Date().toISOString(),
        insuredName: webhookData.insuredName || 'Webhook Import',
        estimatedAmount: webhookData.amount || 0
      };

      // Adiciona ao spreadsheet
      const currentData = JSON.parse(localStorage.getItem('olga_spreadsheet_cases') || '[]');
      currentData.push(spreadsheetRow);
      localStorage.setItem('olga_spreadsheet_cases', JSON.stringify(currentData));

      console.log(`📥 Dados do webhook adicionados ao spreadsheet: ${spreadsheetRow.claimNumber}`);
      
      return { success: true, rowId: spreadsheetRow.id };
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      return { success: false, error: error.message };
    }
  }
}

// Instância global da automação
export const spreadsheetAutomation = new SpreadsheetAutomation();
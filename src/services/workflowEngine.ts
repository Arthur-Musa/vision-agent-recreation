/**
 * Enhanced Workflow Engine inspired by V7Labs
 * Manages agent orchestration, conditional logic, and result validation
 */

import { 
  WorkflowStep, 
  WorkflowExecution, 
  StepExecution, 
  AgentDefinition,
  ProcessingResult,
  Citation,
  ConditionRule,
  ValidationError
} from '@/types/workflow';

export class WorkflowEngine {
  private workflows: Map<string, WorkflowStep[]> = new Map();
  private agents: Map<string, AgentDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();

  constructor() {
    this.initializeDefaultWorkflows();
  }

  async executeWorkflow(
    workflowId: string, 
    initialContext: Record<string, any>,
    documents?: File[]
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execution: WorkflowExecution = {
      id: `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      workflowId,
      status: 'running',
      currentStep: workflow[0].id,
      context: { ...initialContext },
      citations: [],
      results: {},
      startedAt: new Date().toISOString(),
      steps: []
    };

    this.executions.set(execution.id, execution);

    try {
      await this.processWorkflowSteps(execution, workflow);
      execution.status = 'completed';
      execution.completedAt = new Date().toISOString();
    } catch (error) {
      execution.status = 'failed';
      execution.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      execution.completedAt = new Date().toISOString();
    }

    return execution;
  }

  private async processWorkflowSteps(
    execution: WorkflowExecution, 
    workflow: WorkflowStep[]
  ): Promise<void> {
    let currentStepId = execution.currentStep;
    const visitedSteps = new Set<string>();

    while (currentStepId && !visitedSteps.has(currentStepId)) {
      visitedSteps.add(currentStepId);
      
      const step = workflow.find(s => s.id === currentStepId);
      if (!step) {
        throw new Error(`Step ${currentStepId} not found in workflow`);
      }

      execution.currentStep = currentStepId;
      
      const stepExecution = await this.executeStep(step, execution);
      execution.steps.push(stepExecution);

      if (stepExecution.citations) {
        execution.citations.push(...stepExecution.citations);
      }

      // Determine next step
      currentStepId = await this.determineNextStep(step, stepExecution, execution);
    }
  }

  private async executeStep(
    step: WorkflowStep, 
    execution: WorkflowExecution
  ): Promise<StepExecution> {
    const stepExecution: StepExecution = {
      stepId: step.id,
      status: 'running',
      startedAt: new Date().toISOString(),
      input: { ...execution.context, ...step.properties }
    };

    try {
      switch (step.type) {
        case 'agent':
          await this.executeAgentStep(step, stepExecution, execution);
          break;
        case 'condition':
          await this.executeConditionStep(step, stepExecution, execution);
          break;
        case 'action':
          await this.executeActionStep(step, stepExecution, execution);
          break;
        case 'human_review':
          await this.executeHumanReviewStep(step, stepExecution, execution);
          break;
        case 'api_call':
          await this.executeApiCallStep(step, stepExecution, execution);
          break;
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }

      stepExecution.status = 'completed';
      stepExecution.completedAt = new Date().toISOString();
      
      if (stepExecution.startedAt) {
        stepExecution.duration = new Date().getTime() - new Date(stepExecution.startedAt).getTime();
      }

    } catch (error) {
      stepExecution.status = 'failed';
      stepExecution.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      stepExecution.completedAt = new Date().toISOString();
      throw error;
    }

    return stepExecution;
  }

  private async executeAgentStep(
    step: WorkflowStep,
    stepExecution: StepExecution,
    execution: WorkflowExecution
  ): Promise<void> {
    if (!step.agentId) {
      throw new Error('Agent ID is required for agent steps');
    }

    const agent = this.agents.get(step.agentId);
    if (!agent) {
      throw new Error(`Agent ${step.agentId} not found`);
    }

    // Simulate agent processing
    const result = await this.processWithAgent(agent, stepExecution.input, execution);
    
    stepExecution.output = result.extractedData;
    stepExecution.citations = result.citations;
    stepExecution.confidence = result.confidence;

    // Update execution context with results
    execution.context = {
      ...execution.context,
      ...result.extractedData,
      [`${step.id}_result`]: result
    };

    execution.results[step.id] = result;
  }

  private async executeConditionStep(
    step: WorkflowStep,
    stepExecution: StepExecution,
    execution: WorkflowExecution
  ): Promise<void> {
    if (!step.conditions) {
      throw new Error('Conditions are required for condition steps');
    }

    const result = this.evaluateConditions(step.conditions, execution.context);
    
    stepExecution.output = { conditionResult: result };
    execution.context[`${step.id}_result`] = result;
  }

  private async executeActionStep(
    step: WorkflowStep,
    stepExecution: StepExecution,
    execution: WorkflowExecution
  ): Promise<void> {
    // Simulate action execution (send email, update database, etc.)
    const result = await this.simulateAction(step.properties, execution.context);
    
    stepExecution.output = result;
    execution.context[`${step.id}_result`] = result;
  }

  private async executeHumanReviewStep(
    step: WorkflowStep,
    stepExecution: StepExecution,
    execution: WorkflowExecution
  ): Promise<void> {
    // Pause execution for human review
    execution.status = 'paused';
    
    stepExecution.output = {
      requiresHumanReview: true,
      reviewData: execution.context,
      reviewInstructions: step.properties.instructions || 'Review required'
    };
  }

  private async executeApiCallStep(
    step: WorkflowStep,
    stepExecution: StepExecution,
    execution: WorkflowExecution
  ): Promise<void> {
    // Simulate API call
    const result = await this.simulateApiCall(step.properties, execution.context);
    
    stepExecution.output = result;
    execution.context[`${step.id}_result`] = result;
  }

  private async processWithAgent(
    agent: AgentDefinition,
    input: Record<string, any>,
    execution: WorkflowExecution
  ): Promise<ProcessingResult> {
    // Simulate agent processing with citations
    const mockCitations: Citation[] = [
      {
        id: `citation_${Date.now()}`,
        documentId: 'doc_1',
        documentName: 'Apólice de Seguro.pdf',
        page: 1,
        text: 'Valor da cobertura: R$ 100.000,00',
        confidence: 0.95,
        boundingBox: { x: 100, y: 200, width: 300, height: 50 },
        extractedData: { coverageAmount: 100000 },
        timestamp: new Date().toISOString()
      }
    ];

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

    return {
      success: true,
      confidence: 0.92,
      extractedData: {
        policyholder: 'João Silva',
        policyNumber: 'POL-123456',
        coverageAmount: 100000,
        claimAmount: input.claimAmount || 0
      },
      citations: mockCitations,
      validationErrors: [],
      processingTime: 1000,
      model: agent.model.model,
      tokens: {
        prompt: 150,
        completion: 75,
        total: 225,
        cost: 0.01
      }
    };
  }

  private evaluateConditions(conditions: ConditionRule[], context: Record<string, any>): boolean {
    return conditions.every(condition => {
      const value = context[condition.property];
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        case 'contains':
          return String(value).includes(String(condition.value));
        case 'exists':
          return value !== undefined && value !== null;
        case 'regex':
          return new RegExp(condition.value).test(String(value));
        default:
          return false;
      }
    });
  }

  private async determineNextStep(
    step: WorkflowStep,
    stepExecution: StepExecution,
    execution: WorkflowExecution
  ): Promise<string | null> {
    if (stepExecution.status === 'failed' && step.failureSteps?.length) {
      return step.failureSteps[0];
    }

    if (step.type === 'condition' && stepExecution.output?.conditionResult === false) {
      return step.failureSteps?.[0] || null;
    }

    return step.nextSteps[0] || null;
  }

  private async simulateAction(properties: Record<string, any>, context: Record<string, any>): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      actionType: properties.actionType,
      result: 'success',
      timestamp: new Date().toISOString()
    };
  }

  private async simulateApiCall(properties: Record<string, any>, context: Record<string, any>): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 750));
    return {
      apiEndpoint: properties.endpoint,
      response: { status: 'success', data: {} },
      timestamp: new Date().toISOString()
    };
  }

  private initializeDefaultWorkflows(): void {
    // Claims processing workflow
    const claimsWorkflow: WorkflowStep[] = [
      {
        id: 'document_upload',
        name: 'Document Upload',
        type: 'action',
        properties: { actionType: 'upload_documents' },
        nextSteps: ['document_analysis']
      },
      {
        id: 'document_analysis',
        name: 'Document Analysis',
        type: 'agent',
        agentId: 'claims-processor',
        properties: {},
        nextSteps: ['fraud_check']
      },
      {
        id: 'fraud_check',
        name: 'Fraud Detection',
        type: 'agent',
        agentId: 'fraud-detector',
        properties: {},
        nextSteps: ['risk_assessment']
      },
      {
        id: 'risk_assessment',
        name: 'Risk Assessment',
        type: 'condition',
        conditions: [
          { property: 'claimAmount', operator: 'greater_than', value: 50000 }
        ],
        properties: {},
        nextSteps: ['human_review'],
        failureSteps: ['auto_approval']
      },
      {
        id: 'human_review',
        name: 'Human Review Required',
        type: 'human_review',
        properties: { instructions: 'High-value claim requires manual review' },
        nextSteps: ['final_decision']
      },
      {
        id: 'auto_approval',
        name: 'Auto Approval',
        type: 'action',
        properties: { actionType: 'approve_claim' },
        nextSteps: ['notification']
      },
      {
        id: 'final_decision',
        name: 'Final Decision',
        type: 'action',
        properties: { actionType: 'finalize_decision' },
        nextSteps: ['notification']
      },
      {
        id: 'notification',
        name: 'Send Notification',
        type: 'action',
        properties: { actionType: 'send_notification' },
        nextSteps: []
      }
    ];

    this.workflows.set('claims_processing', claimsWorkflow);

    // Coverage verification workflow  
    const coverageWorkflow: WorkflowStep[] = [
      {
        id: 'policy_extraction',
        name: 'Extract Policy Data',
        type: 'agent',
        agentId: 'coverage-verification',
        properties: {},
        nextSteps: ['compliance_check']
      },
      {
        id: 'compliance_check',
        name: 'Compliance Verification',
        type: 'agent', 
        agentId: 'legal-analyst',
        properties: {},
        nextSteps: ['gap_analysis']
      },
      {
        id: 'gap_analysis',
        name: 'Coverage Gap Analysis',
        type: 'agent',
        agentId: 'coverage-verification',
        properties: { analysisType: 'gap_detection' },
        nextSteps: ['generate_report']
      },
      {
        id: 'generate_report',
        name: 'Generate Coverage Report',
        type: 'action',
        properties: { actionType: 'generate_coverage_report' },
        nextSteps: []
      }
    ];

    this.workflows.set('coverage_verification', coverageWorkflow);
  }

  // Public API methods
  getWorkflowStatus(executionId: string): WorkflowExecution | null {
    return this.executions.get(executionId) || null;
  }

  pauseWorkflow(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      return true;
    }
    return false;
  }

  resumeWorkflow(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      // Continue processing from current step
      return true;
    }
    return false;
  }

  cancelWorkflow(executionId: string): boolean {
    const execution = this.executions.get(executionId);
    if (execution && ['running', 'paused'].includes(execution.status)) {
      execution.status = 'cancelled';
      execution.completedAt = new Date().toISOString();
      return true;
    }
    return false;
  }
}

export const workflowEngine = new WorkflowEngine();
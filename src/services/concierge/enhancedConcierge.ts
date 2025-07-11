/**
 * Enhanced Concierge Service - Refactored main orchestrator
 */

import { TaskContext, ConciergeResponse } from '../conciergeOrchestrator';
import { dataExtractor } from './dataExtractor';
import { agentSelector } from './agentSelector';
import { riskAssessor } from './riskAssessor';
import { workflowSelector } from './workflowSelector';

export class EnhancedConciergeService {
  
  async performAdvancedTriage(context: TaskContext): Promise<void> {
    // Enhanced data extraction using NLP patterns
    const extractedData = await dataExtractor.extractDataFromQuery(context.originalQuery);
    const suggestedAgent = await agentSelector.selectOptimalAgent(context.taskType, extractedData);
    
    context.extractedData = extractedData;
    context.suggestedAgent = suggestedAgent;
    context.confidence = agentSelector.calculateAgentConfidence(context);
    
    // Assess complexity and compliance risk
    context.metadata.estimatedComplexity = riskAssessor.assessComplexity(context.originalQuery);
    context.metadata.complianceRisk = riskAssessor.assessComplianceRisk(context.originalQuery);
    
    // Assess human review requirements
    context.metadata.requiresHumanReview = riskAssessor.assessHumanReviewRequired(context);
    
    this.addDecision(context, 'enhanced_triage', {
      taskType: context.taskType,
      priority: context.priority,
      suggestedAgent: context.suggestedAgent,
      extractedData: context.extractedData,
      metadata: context.metadata
    }, 'Advanced triage with enhanced context analysis');
  }

  async selectOptimalWorkflow(context: TaskContext): Promise<void> {
    const workflowId = workflowSelector.selectWorkflowByContext(context);
    context.suggestedWorkflow = workflowId;
    
    this.addDecision(context, 'workflow_selection', {
      selectedWorkflow: workflowId,
      reason: workflowSelector.getWorkflowSelectionReason(context)
    }, 'Workflow selected based on task complexity and requirements');
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
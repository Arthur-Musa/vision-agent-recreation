/**
 * Advanced Agent Optimizer - Dynamic agent selection and load balancing
 * Based on the Vision Agent Recreation project architecture
 */

import { insuranceAgents } from '@/data/insuranceAgents';
import { InsuranceAgent } from '@/types/agents';

interface AgentPerformanceMetrics {
  agentId: string;
  responseTime: number;
  successRate: number;
  accuracy: number;
  loadLevel: number;
  specialization: string[];
  lastUpdated: number;
}

interface TaskRequirements {
  documentTypes: string[];
  complexity: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  requiredCapabilities: string[];
  estimatedDataVolume: number;
  complianceRisk: 'low' | 'medium' | 'high';
}

interface AgentRecommendation {
  primaryAgent: InsuranceAgent;
  backupAgents: InsuranceAgent[];
  confidence: number;
  estimatedDuration: string;
  reasoning: string;
  optimizations: string[];
}

class AgentOptimizer {
  private performanceCache = new Map<string, AgentPerformanceMetrics>();
  private taskHistory: Array<{
    taskId: string;
    agentId: string;
    requirements: TaskRequirements;
    actualDuration: number;
    success: boolean;
    timestamp: number;
  }> = [];

  constructor() {
    this.initializePerformanceMetrics();
  }

  /**
   * Get optimal agent recommendation based on task requirements
   */
  async recommendAgent(requirements: TaskRequirements): Promise<AgentRecommendation> {
    console.log('Analyzing optimal agent for requirements:', requirements);
    
    // Score all agents for this task
    const agentScores = await this.scoreAgents(requirements);
    
    // Sort by score descending
    const rankedAgents = agentScores
      .sort((a, b) => b.score - a.score)
      .map(item => item.agent);

    const primaryAgent = rankedAgents[0];
    const backupAgents = rankedAgents.slice(1, 4);
    
    const recommendation: AgentRecommendation = {
      primaryAgent,
      backupAgents,
      confidence: this.calculateRecommendationConfidence(primaryAgent, requirements),
      estimatedDuration: this.estimateTaskDuration(primaryAgent, requirements),
      reasoning: this.generateRecommendationReasoning(primaryAgent, requirements),
      optimizations: this.suggestOptimizations(primaryAgent, requirements)
    };

    console.log('Agent recommendation:', recommendation);
    return recommendation;
  }

  /**
   * Update agent performance metrics based on task completion
   */
  updateAgentPerformance(
    agentId: string, 
    taskRequirements: TaskRequirements,
    actualDuration: number, 
    success: boolean,
    accuracyScore?: number
  ): void {
    const metrics = this.performanceCache.get(agentId);
    if (!metrics) return;

    // Update metrics with exponential moving average
    const alpha = 0.3; // Learning rate
    
    metrics.responseTime = metrics.responseTime * (1 - alpha) + actualDuration * alpha;
    metrics.successRate = metrics.successRate * (1 - alpha) + (success ? 100 : 0) * alpha;
    
    if (accuracyScore !== undefined) {
      metrics.accuracy = metrics.accuracy * (1 - alpha) + accuracyScore * alpha;
    }

    metrics.lastUpdated = Date.now();
    
    // Store task history for learning
    this.taskHistory.push({
      taskId: `task_${Date.now()}`,
      agentId,
      requirements: taskRequirements,
      actualDuration,
      success,
      timestamp: Date.now()
    });

    // Keep only recent history (last 1000 tasks)
    if (this.taskHistory.length > 1000) {
      this.taskHistory = this.taskHistory.slice(-1000);
    }

    console.log(`Updated performance metrics for agent ${agentId}:`, metrics);
  }

  /**
   * Get current load distribution across agents
   */
  getLoadDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    this.performanceCache.forEach((metrics, agentId) => {
      distribution[agentId] = metrics.loadLevel;
    });

    return distribution;
  }

  /**
   * Suggest load balancing recommendations
   */
  getLoadBalancingRecommendations(): Array<{
    issue: string;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const recommendations = [];
    const distribution = this.getLoadDistribution();
    
    // Find overloaded agents
    Object.entries(distribution).forEach(([agentId, load]) => {
      if (load > 80) {
        recommendations.push({
          issue: `Agent ${agentId} is overloaded (${load}% capacity)`,
          recommendation: `Consider redirecting tasks to backup agents or scaling capacity`,
          priority: 'high' as const
        });
      } else if (load > 60) {
        recommendations.push({
          issue: `Agent ${agentId} approaching capacity limit (${load}%)`,
          recommendation: `Monitor closely and prepare backup agents`,
          priority: 'medium' as const
        });
      }
    });

    return recommendations;
  }

  private async scoreAgents(requirements: TaskRequirements): Promise<Array<{agent: InsuranceAgent, score: number}>> {
    const scores = [];

    for (const agent of insuranceAgents) {
      let score = 0;

      // Base capability matching (40% weight)
      const capabilityMatch = this.calculateCapabilityMatch(agent, requirements);
      score += capabilityMatch * 0.4;

      // Document type compatibility (20% weight)
      const docTypeMatch = this.calculateDocumentTypeMatch(agent, requirements);
      score += docTypeMatch * 0.2;

      // Performance metrics (25% weight)
      const performanceScore = this.calculatePerformanceScore(agent.id);
      score += performanceScore * 0.25;

      // Load balancing (10% weight)
      const loadScore = this.calculateLoadScore(agent.id);
      score += loadScore * 0.1;

      // Complexity suitability (5% weight)
      const complexityMatch = this.calculateComplexityMatch(agent, requirements);
      score += complexityMatch * 0.05;

      scores.push({ agent, score: Math.round(score * 100) / 100 });
    }

    return scores;
  }

  private calculateCapabilityMatch(agent: InsuranceAgent, requirements: TaskRequirements): number {
    const agentCapabilities = agent.capabilities || [];
    const requiredCapabilities = requirements.requiredCapabilities;

    if (requiredCapabilities.length === 0) return 0.8; // Default score

    const matches = requiredCapabilities.filter(req => 
      agentCapabilities.some(cap => cap.includes(req) || req.includes(cap))
    );

    return matches.length / requiredCapabilities.length;
  }

  private calculateDocumentTypeMatch(agent: InsuranceAgent, requirements: TaskRequirements): number {
    const agentDocTypes = agent.documentTypes || [];
    const requiredDocTypes = requirements.documentTypes;

    if (requiredDocTypes.length === 0) return 0.8; // Default score

    const matches = requiredDocTypes.filter(req => 
      agentDocTypes.some(doc => doc.toLowerCase().includes(req.toLowerCase()))
    );

    return matches.length / requiredDocTypes.length;
  }

  private calculatePerformanceScore(agentId: string): number {
    const metrics = this.performanceCache.get(agentId);
    if (!metrics) return 0.5; // Default score

    // Combine success rate, accuracy, and response time
    const successScore = metrics.successRate / 100;
    const accuracyScore = metrics.accuracy / 100;
    const speedScore = Math.max(0, 1 - (metrics.responseTime / 30000)); // 30s baseline

    return (successScore * 0.4 + accuracyScore * 0.4 + speedScore * 0.2);
  }

  private calculateLoadScore(agentId: string): number {
    const metrics = this.performanceCache.get(agentId);
    if (!metrics) return 1.0; // Default score

    // Higher score for lower load
    return Math.max(0, 1 - (metrics.loadLevel / 100));
  }

  private calculateComplexityMatch(agent: InsuranceAgent, requirements: TaskRequirements): number {
    const agentComplexity = agent.complexityLevel;
    const taskComplexity = requirements.complexity;

    const complexityMap = { low: 1, medium: 2, high: 3 };
    const agentLevel = complexityMap[agentComplexity];
    const taskLevel = complexityMap[taskComplexity];

    // Perfect match gets full score, over/under qualified gets partial score
    if (agentLevel === taskLevel) return 1.0;
    if (Math.abs(agentLevel - taskLevel) === 1) return 0.7;
    return 0.3;
  }

  private calculateRecommendationConfidence(agent: InsuranceAgent, requirements: TaskRequirements): number {
    const metrics = this.performanceCache.get(agent.id);
    if (!metrics) return 75; // Default confidence

    // Base confidence on historical performance
    let confidence = (metrics.successRate + metrics.accuracy) / 2;

    // Adjust based on capability match
    const capabilityMatch = this.calculateCapabilityMatch(agent, requirements);
    confidence = confidence * 0.7 + capabilityMatch * 100 * 0.3;

    return Math.round(confidence);
  }

  private estimateTaskDuration(agent: InsuranceAgent, requirements: TaskRequirements): string {
    const baseTime = this.parseEstimatedTime(agent.estimatedTime);
    const metrics = this.performanceCache.get(agent.id);
    
    let adjustedTime = baseTime;

    // Adjust based on complexity
    const complexityMultiplier = {
      low: 0.8,
      medium: 1.0,
      high: 1.5
    };
    adjustedTime *= complexityMultiplier[requirements.complexity];

    // Adjust based on urgency
    const urgencyMultiplier = {
      low: 1.2,
      medium: 1.0,
      high: 0.8,
      urgent: 0.6
    };
    adjustedTime *= urgencyMultiplier[requirements.urgency];

    // Adjust based on current load
    if (metrics && metrics.loadLevel > 70) {
      adjustedTime *= 1.3;
    }

    return this.formatDuration(adjustedTime);
  }

  private generateRecommendationReasoning(agent: InsuranceAgent, requirements: TaskRequirements): string {
    const reasons = [];
    
    const capabilityMatch = this.calculateCapabilityMatch(agent, requirements);
    if (capabilityMatch > 0.8) {
      reasons.push('Excelente compatibilidade de capacidades');
    }

    const metrics = this.performanceCache.get(agent.id);
    if (metrics && metrics.successRate > 90) {
      reasons.push('Alta taxa de sucesso histórica');
    }

    if (agent.complexityLevel === requirements.complexity) {
      reasons.push('Nível de complexidade ideal');
    }

    if (reasons.length === 0) {
      reasons.push('Melhor opção disponível baseada nos critérios');
    }

    return reasons.join(', ');
  }

  private suggestOptimizations(agent: InsuranceAgent, requirements: TaskRequirements): string[] {
    const optimizations = [];

    // Suggest parallel processing for high volume
    if (requirements.estimatedDataVolume > 100) {
      optimizations.push('Considerar processamento em lote para maior eficiência');
    }

    // Suggest caching for repeated document types
    if (requirements.documentTypes.length === 1) {
      optimizations.push('Cache de resultados pode acelerar documentos similares');
    }

    // Suggest pre-processing for complex tasks
    if (requirements.complexity === 'high') {
      optimizations.push('Pré-processamento pode reduzir tempo de análise');
    }

    return optimizations;
  }

  private initializePerformanceMetrics(): void {
    insuranceAgents.forEach(agent => {
      this.performanceCache.set(agent.id, {
        agentId: agent.id,
        responseTime: this.parseEstimatedTime(agent.estimatedTime) * 1000, // Convert to ms
        successRate: 85, // Default
        accuracy: 80, // Default  
        loadLevel: Math.random() * 50, // Random initial load
        specialization: agent.capabilities || [],
        lastUpdated: Date.now()
      });
    });
  }

  private parseEstimatedTime(timeStr: string): number {
    // Parse "2-5 min" format and return average in minutes
    const match = timeStr.match(/(\d+)-(\d+)\s*min/);
    if (match) {
      const min = parseInt(match[1]);
      const max = parseInt(match[2]);
      return (min + max) / 2;
    }
    return 5; // Default 5 minutes
  }

  private formatDuration(minutes: number): string {
    if (minutes < 1) {
      return '< 1 min';
    } else if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = Math.round(minutes % 60);
      return `${hours}h ${mins}min`;
    }
  }
}

export const agentOptimizer = new AgentOptimizer();
export type { TaskRequirements, AgentRecommendation, AgentPerformanceMetrics };

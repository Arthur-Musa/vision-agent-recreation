export interface PropertyType {
  id: string;
  name: string;
  type: 'file' | 'text' | 'number' | 'single_select' | 'multi_select' | 'url' | 'json';
  required: boolean;
  description?: string;
  options?: string[]; // For select types
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  properties: PropertyType[];
  conditions?: WorkflowCondition[];
  nextStages?: string[];
  isManualReview?: boolean;
}

export interface WorkflowCondition {
  propertyId: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
  nextStageId: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  version: string;
  stages: WorkflowStage[];
  initialStageId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  currentStageId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_review';
  data: Record<string, any>;
  executionPath: string[];
  startedAt: string;
  completedAt?: string;
  assignedTo?: string;
}

export interface ConciergeRequest {
  id: string;
  message: string;
  files?: File[];
  context?: Record<string, any>;
  timestamp: string;
}

export interface ConciergeResponse {
  id: string;
  requestId: string;
  message: string;
  suggestedAgent?: string;
  extractedData?: Record<string, any>;
  confidence: number;
  citations?: Citation[];
  nextActions?: string[];
  timestamp: string;
}

export interface Citation {
  text: string;
  source: string;
  page?: number;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
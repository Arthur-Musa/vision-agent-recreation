// Enhanced workflow types inspired by V7Labs architecture

export interface PropertyType {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect' | 'file' | 'currency' | 'percentage' | 'single_select' | 'multi_select' | 'url' | 'json';
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[] | { min?: number; max?: number; pattern?: string };
  options?: SelectOption[] | string[];
  description?: string;
  category?: string;
}

export interface ValidationRule {
  type: 'min' | 'max' | 'regex' | 'required' | 'custom';
  value?: any;
  message: string;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'agent' | 'condition' | 'action' | 'human_review' | 'api_call';
  agentId?: string;
  conditions?: ConditionRule[];
  properties: Record<string, any>;
  nextSteps: string[];
  failureSteps?: string[];
  timeout?: number;
  retryPolicy?: RetryPolicy;
}

export interface ConditionRule {
  property: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists' | 'regex';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  initialDelay: number;
}

export interface Citation {
  id?: string;
  documentId?: string;
  documentName?: string;
  page?: number;
  text: string;
  source?: string;
  confidence: number;
  boundingBox?: BoundingBox;
  extractedData?: Record<string, any>;
  timestamp?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  currentStep: string;
  context: Record<string, any>;
  citations: Citation[];
  results: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  errorMessage?: string;
  steps: StepExecution[];
}

export interface StepExecution {
  stepId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  input: Record<string, any>;
  output?: Record<string, any>;
  errorMessage?: string;
  citations?: Citation[];
  confidence?: number;
  duration?: number;
}

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  category: 'claims' | 'underwriting' | 'legal' | 'customer_service';
  version: string;
  inputProperties: PropertyType[];
  outputProperties: PropertyType[];
  capabilities: AgentCapability[];
  model: ModelConfiguration;
  prompts: PromptConfiguration;
  validationRules: ValidationRule[];
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  type: 'extraction' | 'classification' | 'validation' | 'calculation' | 'translation';
}

export interface ModelConfiguration {
  provider: 'openai' | 'anthropic' | 'azure' | 'custom';
  model: string;
  temperature: number;
  maxTokens: number;
  stopSequences?: string[];
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface PromptConfiguration {
  systemPrompt: string;
  userPromptTemplate: string;
  fewShotExamples?: FewShotExample[];
  outputFormat: 'json' | 'text' | 'structured';
  extractionSchema?: Record<string, any>;
}

export interface FewShotExample {
  input: Record<string, any>;
  output: Record<string, any>;
  description?: string;
}

export interface ProcessingResult {
  success: boolean;
  confidence: number;
  extractedData: Record<string, any>;
  citations: Citation[];
  validationErrors: ValidationError[];
  processingTime: number;
  model: string;
  tokens: TokenUsage;
}

export interface ValidationError {
  property: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestedValue?: any;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
  cost?: number;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  type: string;
  size: number;
  pageCount?: number;
  language?: string;
  uploadedAt: string;
  processedAt?: string;
  tags: string[];
  extractedText?: string;
  ocrConfidence?: number;
}

// Legacy types for backward compatibility
export interface WorkflowStage {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_review';
}

export interface PropertyField {
  id: string;
  name: string;
  type: string;
  required: boolean;
  value: any;
  validation?: any;
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
// Types for Olga Insurance Platform

export interface LocalizedString {
  'pt-BR': string;
  'pt': string;
  'en': string;
}

export type AgentCategory = 'claims' | 'underwriting' | 'legal' | 'customer';

export interface InsuranceAgent {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  category: AgentCategory;
  features: LocalizedString[];
  estimatedTime: string;
  complexityLevel: 'low' | 'medium' | 'high';
  documentTypes: string[];
  capabilities: string[];
  useCase: LocalizedString;
  icon?: string;
}

export interface AgentCapability {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
}

export interface ProcessingResult {
  id: string;
  agentId: string;
  status: 'processing' | 'completed' | 'failed';
  confidence: number;
  extractedData: Record<string, any>;
  citations: Citation[];
  processingTime: number;
  recommendations?: string[];
}

export interface Citation {
  id: string;
  documentName: string;
  page: number;
  text: string;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface DocumentUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  file?: File; // Para referência do arquivo original
  preview?: string; // Para preview de imagens
  uploadedAt: Date;
}

export interface Case {
  id: string;
  title: string;
  agentId: string;
  documents: DocumentUpload[];
  results?: ProcessingResult;
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'processing' | 'completed' | 'failed';
}
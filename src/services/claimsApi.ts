import { config } from '@/config/environment';
import { validateClaimData, sanitizeError } from '@/lib/validation';
import { apiRateLimiter } from '@/lib/rateLimiter';

const API_BASE = config.api.baseUrl;

export interface Claim {
  id: string;
  numero_sinistro: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  analysis_started_at?: string;
  analysis_completed_at?: string;
  data: {
    tipo_sinistro: string;
    descricao: string;
    valor_estimado?: number;
    documentos?: string[];
  };
  analysis_result?: {
    confidence: number;
    findings: string[];
    fraud_score?: number;
    recommendation: string;
  };
}

export interface ClaimStatus {
  id: string;
  status: string;
  progress?: number;
  estimated_completion?: string;
  current_step?: string;
  error_message?: string;
}

export interface ClaimReport {
  id: string;
  analysis_summary: string;
  findings: string[];
  confidence: number;
  fraud_indicators: string[];
  recommendation: string;
  processing_time: number;
  documents_analyzed: number;
}

class ClaimsApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Rate limiting check
    if (!apiRateLimiter.canMakeRequest('api-calls')) {
      throw new Error('Muitas requisições. Tente novamente em alguns segundos.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.api.timeout);

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(sanitizeError(`API Error: ${response.status} ${response.statusText}`));
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(sanitizeError(error));
    }
  }

  async createClaim(claimData: any): Promise<Claim> {
    const validation = validateClaimData(claimData);
    if (!validation.success) {
      throw new Error(`Dados inválidos: ${validation.error.errors.map(e => e.message).join(', ')}`);
    }

    return this.request<Claim>('/sinistros', {
      method: 'POST',
      body: JSON.stringify(validation.data),
    });
  }

  async getClaim(id: string): Promise<Claim> {
    return this.request<Claim>(`/sinistros/${id}`);
  }

  async startAnalysis(id: string): Promise<{ message: string; status: string }> {
    return this.request(`/sinistros/${id}/analisar`, {
      method: 'POST',
    });
  }

  async getClaimStatus(id: string): Promise<ClaimStatus> {
    return this.request<ClaimStatus>(`/sinistros/${id}/status`);
  }

  async getClaimReport(id: string): Promise<ClaimReport> {
    return this.request<ClaimReport>(`/sinistros/${id}/relatorio`);
  }

  // Upload de documentos
  async uploadDocument(claimId: string, file: File): Promise<{ success: boolean; message: string }> {
    const formData = new FormData();
    formData.append('documento', file);
    
    const response = await fetch(`${API_BASE}/sinistros/${claimId}/documentos`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Análise específica por tipo de agente
  async analyzeWithAgent(claimId: string, agentType: string): Promise<{ success: boolean; analysis_id: string }> {
    return this.request(`/sinistros/${claimId}/analisar`, {
      method: 'POST',
      body: JSON.stringify({ agent_type: agentType }),
    });
  }

  // Legacy integration methods
  async sendLegacyClaim(claimData: any): Promise<any> {
    return this.request('/integrations/legacy/claim', {
      method: 'POST',
      body: JSON.stringify(claimData),
    });
  }

  async getClaimByNumber(numero_sinistro: string): Promise<ClaimStatus> {
    return this.request<ClaimStatus>(`/integrations/claim/${numero_sinistro}/status`);
  }
}

export const claimsApi = new ClaimsApiService();
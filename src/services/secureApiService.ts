/**
 * Secure API Service - Handles sensitive API calls securely
 * Removes direct browser exposure of API keys
 */

import { sanitizeError } from '@/lib/validation';

export interface SecureApiConfig {
  timeout: number;
  maxRetries: number;
  baseUrl?: string;
}

export interface SecureApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

class SecureApiService {
  private config: SecureApiConfig;
  
  constructor() {
    this.config = {
      timeout: 30000, // 30 seconds
      maxRetries: 2,
      baseUrl: '/api' // Proxy through backend
    };
  }

  /**
   * Secure request method that proxies through backend
   * This eliminates the need for client-side API keys
   */
  private async secureRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<SecureApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      // Get auth token from secure context
      const authToken = this.getAuthToken();
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers as Record<string, string>,
      };

      // Add auth token if available
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers,
        mode: 'cors',
        credentials: 'same-origin',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const error = sanitizeError(new Error(responseData.message || `HTTP ${response.status}`));
        
        // Retry on 5xx errors
        if (response.status >= 500 && retryCount < this.config.maxRetries) {
          await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
          return this.secureRequest<T>(endpoint, options, retryCount + 1);
        }

        return {
          success: false,
          error,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        data: responseData,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors
      if (retryCount < this.config.maxRetries && !controller.signal.aborted) {
        await this.delay(Math.pow(2, retryCount) * 1000);
        return this.secureRequest<T>(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: sanitizeError(error),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * OpenAI completion through secure backend proxy
   */
  async openaiCompletion(prompt: string, options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}): Promise<SecureApiResponse<{ content: string; usage?: any }>> {
    return this.secureRequest('/openai/completion', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        ...options
      })
    });
  }

  /**
   * Process document with AI agent through secure backend
   */
  async processWithAgent(
    agentType: string,
    message: string,
    documentData?: string,
    context?: Record<string, any>
  ): Promise<SecureApiResponse<any>> {
    return this.secureRequest('/agents/process', {
      method: 'POST',
      body: JSON.stringify({
        agentType,
        message,
        documentData,
        context
      })
    });
  }

  /**
   * Olga API analysis through secure backend
   */
  async olgaAnalysis(
    documentType: string,
    agentType: string,
    documentData?: string,
    context?: Record<string, any>
  ): Promise<SecureApiResponse<any>> {
    return this.secureRequest('/olga/analyze', {
      method: 'POST',
      body: JSON.stringify({
        documentType,
        agentType,
        documentData,
        context
      })
    });
  }

  /**
   * File upload with security validation
   */
  async uploadFile(
    file: File,
    purpose: string,
    options: {
      maxSize?: number;
      allowedTypes?: string[];
    } = {}
  ): Promise<SecureApiResponse<{ fileId: string; url: string }>> {
    // Client-side validation
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    const allowedTypes = options.allowedTypes || [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (file.size > maxSize) {
      return {
        success: false,
        error: `Arquivo muito grande. Máximo: ${Math.round(maxSize / 1024 / 1024)}MB`,
        timestamp: new Date().toISOString()
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Tipo de arquivo não permitido',
        timestamp: new Date().toISOString()
      };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);

    return this.secureRequest('/files/upload', {
      method: 'POST',
      body: formData
    });
  }

  /**
   * Get authentication token from secure storage
   */
  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<SecureApiResponse<{ status: string; timestamp: string }>> {
    return this.secureRequest('/health', {
      method: 'GET'
    });
  }

  /**
   * Clear all sensitive data
   */
  clearSensitiveData(): void {
    // This would be called on logout or security events
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_session');
    
    // Clear any cached sensitive data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('sensitive') || name.includes('api')) {
            caches.delete(name);
          }
        });
      });
    }
  }
}

export const secureApiService = new SecureApiService();
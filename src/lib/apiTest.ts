import { config } from '@/config/environment';
import { sanitizeError } from '@/lib/validation';

export interface ApiTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
}

export class ApiTester {
  private static async testEndpoint(
    url: string, 
    options: RequestInit = {}
  ): Promise<ApiTestResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        mode: 'cors', // Explicitly set CORS mode
        ...options,
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          message: `API conectada com sucesso (${response.status})`,
          responseTime,
        };
      } else {
        return {
          success: false,
          message: `API retornou erro HTTP ${response.status}`,
          responseTime,
          error: response.statusText,
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error instanceof Error) {
        // Check for CORS errors
        if (error.message.includes('CORS') || error.message.includes('fetch')) {
          return {
            success: false,
            message: 'Erro de CORS - API não permite requisições desta origem',
            responseTime,
            error: sanitizeError(error),
          };
        }
      }

      return {
        success: false,
        message: 'Falha na conexão com a API',
        responseTime,
        error: sanitizeError(error),
      };
    }
  }

  // Test main claims API
  static async testClaimsApi(): Promise<ApiTestResult> {
    const url = `${config.api.baseUrl}/health`;
    return this.testEndpoint(url);
  }

  // Test alternative health check endpoint
  static async testAlternativeHealthCheck(): Promise<ApiTestResult> {
    const url = `${config.api.baseUrl}/`;
    return this.testEndpoint(url);
  }

  // Test if we can make a simple GET request to the API
  static async testApiConnection(): Promise<ApiTestResult> {
    const url = `${config.api.baseUrl}/sinistros`;
    return this.testEndpoint(url);
  }

  // Test multiple endpoints
  static async runFullApiTest(): Promise<{
    claimsApi: ApiTestResult;
    healthCheck: ApiTestResult;
    connection: ApiTestResult;
    summary: {
      totalTests: number;
      passed: number;
      failed: number;
      avgResponseTime: number;
    };
  }> {
    const [claimsApi, healthCheck, connection] = await Promise.all([
      this.testClaimsApi(),
      this.testAlternativeHealthCheck(),
      this.testApiConnection(),
    ]);

    const results = [claimsApi, healthCheck, connection];
    const passed = results.filter(r => r.success).length;
    const failed = results.length - passed;
    const avgResponseTime = results
      .filter(r => r.responseTime)
      .reduce((sum, r) => sum + (r.responseTime || 0), 0) / results.length;

    return {
      claimsApi,
      healthCheck,
      connection,
      summary: {
        totalTests: results.length,
        passed,
        failed,
        avgResponseTime: Math.round(avgResponseTime),
      },
    };
  }

  // Test with CORS preflight
  static async testWithCorsHeaders(): Promise<ApiTestResult> {
    const url = `${config.api.baseUrl}/`;
    
    return this.testEndpoint(url, {
      headers: {
        'Origin': window.location.origin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });
  }
}

// Utility function to check if running in development
export const isDevelopment = () => {
  return window.location.hostname === 'localhost' || 
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname.includes('lovable.app');
};

// Get current domain for CORS configuration
export const getCurrentDomain = () => {
  return window.location.origin;
};

// Format test results for display
export const formatTestResults = (results: ApiTestResult[]): string => {
  return results.map(result => {
    const status = result.success ? '✅' : '❌';
    const time = result.responseTime ? ` (${result.responseTime}ms)` : '';
    const error = result.error ? ` - ${result.error}` : '';
    
    return `${status} ${result.message}${time}${error}`;
  }).join('\n');
};
/**
 * API Health Checker for WitnessOS
 * 
 * Simple utility to test API connectivity without CORS issues
 * Provides detailed diagnostics for connection problems
 */

export interface HealthCheckResult {
  isReachable: boolean;
  status: 'healthy' | 'unhealthy' | 'cors_blocked' | 'network_error' | 'timeout';
  responseTime: number;
  error?: string;
  details?: {
    url: string;
    method: string;
    headers: Record<string, string>;
    timestamp: string;
  };
}

export class APIHealthChecker {
  private static instance: APIHealthChecker;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.witnessos.space';
  }

  static getInstance(): APIHealthChecker {
    if (!APIHealthChecker.instance) {
      APIHealthChecker.instance = new APIHealthChecker();
    }
    return APIHealthChecker.instance;
  }

  /**
   * Perform a comprehensive health check
   */
  async checkHealth(timeout: number = 5000): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const url = `${this.baseUrl}/health`;

    const result: HealthCheckResult = {
      isReachable: false,
      status: 'unhealthy',
      responseTime: 0,
      details: {
        url,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timestamp: new Date().toISOString(),
      },
    };

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Make the request with minimal headers to avoid CORS issues
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'application/json',
          // Don't set Content-Type for GET requests
        },
      });

      clearTimeout(timeoutId);
      result.responseTime = Date.now() - startTime;

      if (response.ok) {
        result.isReachable = true;
        result.status = 'healthy';
        
        // Try to parse response
        try {
          const data = await response.json();
          console.log('✅ API Health Check Success:', {
            status: response.status,
            data,
            responseTime: result.responseTime,
          });
        } catch (parseError) {
          console.log('✅ API reachable but response not JSON:', response.status);
        }
      } else {
        result.status = 'unhealthy';
        result.error = `HTTP ${response.status}: ${response.statusText}`;
        console.warn('⚠️ API Health Check Failed:', result.error);
      }

    } catch (error) {
      result.responseTime = Date.now() - startTime;
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Detect specific error types
        if (errorMessage.includes('cors') || errorMessage.includes('cross-origin')) {
          result.status = 'cors_blocked';
          result.error = 'CORS policy blocked the request';
        } else if (errorMessage.includes('networkerror') || errorMessage.includes('failed to fetch')) {
          result.status = 'network_error';
          result.error = 'Network connection failed';
        } else if (error.name === 'AbortError') {
          result.status = 'timeout';
          result.error = `Request timed out after ${timeout}ms`;
        } else {
          result.status = 'network_error';
          result.error = error.message;
        }
      } else {
        result.status = 'network_error';
        result.error = 'Unknown error occurred';
      }

      // Only log in development or for non-network errors
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ API Health Check Error:', {
          status: result.status,
          error: result.error,
          responseTime: result.responseTime,
        });
      }
    }

    return result;
  }

  /**
   * Quick connectivity test (no detailed logging)
   */
  async quickCheck(): Promise<boolean> {
    try {
      const result = await this.checkHealth(3000);
      return result.isReachable;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test multiple endpoints to determine API status
   */
  async comprehensiveCheck(): Promise<{
    overall: 'healthy' | 'partial' | 'down';
    endpoints: Record<string, HealthCheckResult>;
    recommendations: string[];
  }> {
    const endpoints = ['/health', '/engines'];
    const results: Record<string, HealthCheckResult> = {};
    const recommendations: string[] = [];

    // Test each endpoint
    for (const endpoint of endpoints) {
      const originalBaseUrl = this.baseUrl;
      this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.witnessos.space';
      
      try {
        const result = await this.checkHealth(5000);
        results[endpoint] = result;
      } catch (error) {
        results[endpoint] = {
          isReachable: false,
          status: 'network_error',
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
      
      this.baseUrl = originalBaseUrl;
    }

    // Analyze results
    const healthyCount = Object.values(results).filter(r => r.isReachable).length;
    const totalCount = Object.keys(results).length;

    let overall: 'healthy' | 'partial' | 'down';
    if (healthyCount === totalCount) {
      overall = 'healthy';
    } else if (healthyCount > 0) {
      overall = 'partial';
      recommendations.push('Some API endpoints are not responding');
    } else {
      overall = 'down';
      
      // Analyze common issues
      const corsIssues = Object.values(results).some(r => r.status === 'cors_blocked');
      const networkIssues = Object.values(results).some(r => r.status === 'network_error');
      const timeouts = Object.values(results).some(r => r.status === 'timeout');

      if (corsIssues) {
        recommendations.push('CORS policy is blocking requests - backend configuration may need updating');
      }
      if (networkIssues) {
        recommendations.push('Network connectivity issues - check if backend is running');
      }
      if (timeouts) {
        recommendations.push('API is responding slowly or timing out');
      }
      
      recommendations.push('Application will run in offline mode with limited functionality');
    }

    return {
      overall,
      endpoints: results,
      recommendations,
    };
  }

  /**
   * Get user-friendly status message
   */
  getStatusMessage(result: HealthCheckResult): string {
    switch (result.status) {
      case 'healthy':
        return `Connected (${result.responseTime}ms)`;
      case 'cors_blocked':
        return 'CORS policy blocking connection';
      case 'network_error':
        return 'Network connection failed';
      case 'timeout':
        return 'Connection timed out';
      case 'unhealthy':
        return `Server error: ${result.error}`;
      default:
        return 'Connection status unknown';
    }
  }
}

// Export singleton instance
export const apiHealthChecker = APIHealthChecker.getInstance();

// Utility functions
export async function testAPIConnection(): Promise<HealthCheckResult> {
  return apiHealthChecker.checkHealth();
}

export async function isAPIReachable(): Promise<boolean> {
  return apiHealthChecker.quickCheck();
}

export async function getAPIStatus(): Promise<{
  overall: 'healthy' | 'partial' | 'down';
  endpoints: Record<string, HealthCheckResult>;
  recommendations: string[];
}> {
  return apiHealthChecker.comprehensiveCheck();
}

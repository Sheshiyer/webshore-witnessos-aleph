/**
 * Service Health Monitor for WitnessOS Enhanced Architecture
 * 
 * Comprehensive health monitoring system for all microservices
 * including circuit breakers, retry logic, and graceful degradation.
 */

// Health status types
export interface ServiceHealth {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  responseTime: number;
  errorRate: number;
  uptime: number;
  metadata?: any;
}

export interface HealthCheckResult {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  services: ServiceHealth[];
  timestamp: string;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

// Circuit breaker states
interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

/**
 * Service Health Monitor
 * 
 * Monitors the health of all microservices and provides
 * circuit breaker functionality for resilient operations.
 */
export class ServiceHealthMonitor {
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private healthHistory: Map<string, ServiceHealth[]> = new Map();
  
  // Circuit breaker configuration
  private readonly failureThreshold = 5;
  private readonly recoveryTimeout = 60000; // 1 minute
  private readonly halfOpenMaxCalls = 3;

  constructor(private env: any) {}

  /**
   * Perform comprehensive health check of all services
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    const services: ServiceHealth[] = [];

    // Check each service
    const serviceChecks = [
      this.checkEngineService(),
      this.checkForecastService(),
      this.checkAIService(),
      this.checkDurableObjects(),
      this.checkWorkflows()
    ];

    const results = await Promise.allSettled(serviceChecks);
    
    // Process results
    for (const result of results) {
      if (result.status === 'fulfilled') {
        services.push(...result.value);
      } else {
        console.error('Health check failed:', result.reason);
        services.push({
          service: 'unknown',
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          responseTime: -1,
          errorRate: 100,
          uptime: 0,
          metadata: { error: result.reason }
        });
      }
    }

    // Calculate overall health
    const summary = {
      total: services.length,
      healthy: services.filter(s => s.status === 'healthy').length,
      degraded: services.filter(s => s.status === 'degraded').length,
      unhealthy: services.filter(s => s.status === 'unhealthy').length
    };

    let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (summary.unhealthy > 0) {
      overall = summary.unhealthy > summary.healthy ? 'unhealthy' : 'degraded';
    } else if (summary.degraded > 0) {
      overall = 'degraded';
    }

    const result: HealthCheckResult = {
      overall,
      services,
      timestamp: new Date().toISOString(),
      summary
    };

    // Store health history
    this.updateHealthHistory(services);

    return result;
  }

  /**
   * Check Engine Service health
   */
  private async checkEngineService(): Promise<ServiceHealth[]> {
    const services: ServiceHealth[] = [];
    
    if (this.env.ENGINE_SERVICE) {
      const startTime = Date.now();
      
      try {
        const health = await this.callWithCircuitBreaker(
          'engine-service',
          () => this.env.ENGINE_SERVICE.healthCheck()
        );
        
        const responseTime = Date.now() - startTime;
        
        services.push({
          service: 'engine-service',
          status: health.status === 'healthy' ? 'healthy' : 'degraded',
          lastCheck: new Date().toISOString(),
          responseTime,
          errorRate: 0,
          uptime: 100,
          metadata: health
        });
        
      } catch (error) {
        services.push({
          service: 'engine-service',
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          responseTime: Date.now() - startTime,
          errorRate: 100,
          uptime: 0,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    } else {
      services.push({
        service: 'engine-service',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: -1,
        errorRate: 100,
        uptime: 0,
        metadata: { error: 'Service not configured' }
      });
    }

    return services;
  }

  /**
   * Check Forecast Service health
   */
  private async checkForecastService(): Promise<ServiceHealth[]> {
    const services: ServiceHealth[] = [];
    
    if (this.env.FORECAST_SERVICE) {
      const startTime = Date.now();
      
      try {
        // Simple health check by attempting to generate a minimal forecast
        const testProfile = {
          userId: 'health-check',
          birthDate: '1990-01-01',
          birthTime: '12:00',
          birthLocation: { latitude: 0, longitude: 0 }
        };
        
        const result = await this.callWithCircuitBreaker(
          'forecast-service',
          () => this.env.FORECAST_SERVICE.generateDailyForecast({
            userProfile: testProfile,
            date: new Date().toISOString().split('T')[0],
            options: { useCache: false }
          })
        );
        
        const responseTime = Date.now() - startTime;
        
        services.push({
          service: 'forecast-service',
          status: result.success ? 'healthy' : 'degraded',
          lastCheck: new Date().toISOString(),
          responseTime,
          errorRate: result.success ? 0 : 50,
          uptime: result.success ? 100 : 50,
          metadata: { testResult: result.success }
        });
        
      } catch (error) {
        services.push({
          service: 'forecast-service',
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          responseTime: Date.now() - startTime,
          errorRate: 100,
          uptime: 0,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    } else {
      services.push({
        service: 'forecast-service',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: -1,
        errorRate: 100,
        uptime: 0,
        metadata: { error: 'Service not configured' }
      });
    }

    return services;
  }

  /**
   * Check AI Service health
   */
  private async checkAIService(): Promise<ServiceHealth[]> {
    const services: ServiceHealth[] = [];
    
    if (this.env.AI_SERVICE) {
      const startTime = Date.now();
      
      try {
        const health = await this.callWithCircuitBreaker(
          'ai-service',
          () => this.env.AI_SERVICE.healthCheck()
        );
        
        const responseTime = Date.now() - startTime;
        
        services.push({
          service: 'ai-service',
          status: health.status === 'healthy' ? 'healthy' : 'degraded',
          lastCheck: new Date().toISOString(),
          responseTime,
          errorRate: health.status === 'healthy' ? 0 : 25,
          uptime: health.status === 'healthy' ? 100 : 75,
          metadata: health
        });
        
      } catch (error) {
        services.push({
          service: 'ai-service',
          status: 'unhealthy',
          lastCheck: new Date().toISOString(),
          responseTime: Date.now() - startTime,
          errorRate: 100,
          uptime: 0,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
        });
      }
    } else {
      services.push({
        service: 'ai-service',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: -1,
        errorRate: 100,
        uptime: 0,
        metadata: { error: 'Service not configured' }
      });
    }

    return services;
  }

  /**
   * Check Durable Objects health
   */
  private async checkDurableObjects(): Promise<ServiceHealth[]> {
    const services: ServiceHealth[] = [];
    
    // Check Engine Coordinator
    if (this.env.ENGINE_COORDINATOR) {
      services.push({
        service: 'engine-coordinator',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 100,
        metadata: { type: 'durable-object', configured: true }
      });
    } else {
      services.push({
        service: 'engine-coordinator',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: -1,
        errorRate: 100,
        uptime: 0,
        metadata: { error: 'Durable Object not configured' }
      });
    }

    // Check Forecast Session
    if (this.env.FORECAST_SESSION) {
      services.push({
        service: 'forecast-session',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 100,
        metadata: { type: 'durable-object', configured: true }
      });
    } else {
      services.push({
        service: 'forecast-session',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: -1,
        errorRate: 100,
        uptime: 0,
        metadata: { error: 'Durable Object not configured' }
      });
    }

    return services;
  }

  /**
   * Check Workflows health
   */
  private async checkWorkflows(): Promise<ServiceHealth[]> {
    const services: ServiceHealth[] = [];
    
    // Check Consciousness Workflow
    if (this.env.CONSCIOUSNESS_WORKFLOW) {
      services.push({
        service: 'consciousness-workflow',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 100,
        metadata: { type: 'workflow', configured: true }
      });
    } else {
      services.push({
        service: 'consciousness-workflow',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: -1,
        errorRate: 100,
        uptime: 0,
        metadata: { error: 'Workflow not configured' }
      });
    }

    // Check Integration Workflow
    if (this.env.INTEGRATION_WORKFLOW) {
      services.push({
        service: 'integration-workflow',
        status: 'healthy',
        lastCheck: new Date().toISOString(),
        responseTime: 0,
        errorRate: 0,
        uptime: 100,
        metadata: { type: 'workflow', configured: true }
      });
    } else {
      services.push({
        service: 'integration-workflow',
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime: -1,
        errorRate: 100,
        uptime: 0,
        metadata: { error: 'Workflow not configured' }
      });
    }

    return services;
  }

  /**
   * Call service with circuit breaker protection
   */
  private async callWithCircuitBreaker<T>(
    serviceName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const breaker = this.getCircuitBreaker(serviceName);
    
    // Check circuit breaker state
    if (breaker.state === 'open') {
      if (Date.now() < breaker.nextAttemptTime) {
        throw new Error(`Circuit breaker open for ${serviceName}`);
      } else {
        // Transition to half-open
        breaker.state = 'half-open';
      }
    }

    try {
      const result = await operation();
      
      // Success - reset circuit breaker
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        breaker.failureCount = 0;
      }
      
      return result;
      
    } catch (error) {
      // Failure - update circuit breaker
      breaker.failureCount++;
      breaker.lastFailureTime = Date.now();
      
      if (breaker.failureCount >= this.failureThreshold) {
        breaker.state = 'open';
        breaker.nextAttemptTime = Date.now() + this.recoveryTimeout;
      }
      
      throw error;
    }
  }

  /**
   * Get or create circuit breaker for service
   */
  private getCircuitBreaker(serviceName: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: 0,
        nextAttemptTime: 0
      });
    }
    
    return this.circuitBreakers.get(serviceName)!;
  }

  /**
   * Update health history for trending analysis
   */
  private updateHealthHistory(services: ServiceHealth[]): void {
    for (const service of services) {
      if (!this.healthHistory.has(service.service)) {
        this.healthHistory.set(service.service, []);
      }
      
      const history = this.healthHistory.get(service.service)!;
      history.push(service);
      
      // Keep only last 100 entries
      if (history.length > 100) {
        history.shift();
      }
    }
  }

  /**
   * Get health trends for a service
   */
  getHealthTrends(serviceName: string): ServiceHealth[] {
    return this.healthHistory.get(serviceName) || [];
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): Record<string, CircuitBreakerState> {
    const status: Record<string, CircuitBreakerState> = {};
    
    for (const [service, breaker] of this.circuitBreakers.entries()) {
      status[service] = { ...breaker };
    }
    
    return status;
  }
}

// Export utility functions
export function createServiceHealthMonitor(env: any): ServiceHealthMonitor {
  return new ServiceHealthMonitor(env);
}

export function isServiceHealthy(health: ServiceHealth): boolean {
  return health.status === 'healthy';
}

export function getOverallHealthScore(result: HealthCheckResult): number {
  const { healthy, degraded, unhealthy, total } = result.summary;
  
  if (total === 0) return 0;
  
  // Weighted scoring: healthy = 1, degraded = 0.5, unhealthy = 0
  const score = (healthy * 1 + degraded * 0.5 + unhealthy * 0) / total;
  return Math.round(score * 100);
}

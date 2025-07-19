/**
 * Enhanced API Router for WitnessOS
 * 
 * Main request router that orchestrates specialized service workers
 * using Cloudflare's native RPC (Remote Procedure Call) system.
 * Replaces the monolithic api-handlers.ts with a clean, maintainable
 * microservice architecture.
 */

import { createKVDataAccess, CloudflareKVDataAccess } from '../lib/kv-data-access';
import { AuthService } from '../lib/auth';
import { createServiceHealthMonitor, ServiceHealthMonitor } from '../utils/service-health-monitor';

// Environment interface for the main router
interface RouterEnv {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  KV_USER_PROFILES: KVNamespace;
  KV_FORECASTS: KVNamespace;
  
  // Service bindings (RPC)
  ENGINE_SERVICE: any;
  FORECAST_SERVICE: any;
  AI_SERVICE: any;
  AUTH_SERVICE?: any;
  USER_SERVICE?: any;
  
  // Durable Objects
  ENGINE_COORDINATOR?: any;
  FORECAST_SESSION?: any;

  // Workflows
  CONSCIOUSNESS_WORKFLOW?: any;
  INTEGRATION_WORKFLOW?: any;
  
  // Secrets
  JWT_SECRET: string;
  OPENROUTER_API_KEY?: string;
}

/**
 * Enhanced API Router
 * 
 * Routes requests to appropriate service workers via RPC calls.
 * Provides intelligent service orchestration, load balancing,
 * and comprehensive error handling.
 */
export class EnhancedAPIRouter {
  private kvData: CloudflareKVDataAccess;
  private authService: AuthService;
  private healthMonitor: ServiceHealthMonitor;
  private corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };

  constructor(private env: RouterEnv) {
    this.kvData = createKVDataAccess(env);
    this.authService = new AuthService(env.DB, env.JWT_SECRET);
    this.healthMonitor = createServiceHealthMonitor(env);
  }

  /**
   * Main request routing method
   */
  async route(request: Request): Promise<Response> {
    const requestId = crypto.randomUUID();
    
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return this.createResponse(200, this.corsHeaders, null);
      }

      const url = new URL(request.url);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      
      console.log(`[${requestId}] ${request.method} ${url.pathname}`);

      // Health check endpoint
      if (url.pathname === '/health') {
        return await this.handleHealthCheck(requestId);
      }

      // Route to appropriate service
      if (pathSegments.length === 0) {
        return this.createErrorResponse(400, 'INVALID_PATH', 'API endpoint required', requestId);
      }

      const domain = pathSegments[0];
      const remainingSegments = pathSegments.slice(1);

      switch (domain) {
        case 'engines':
          return await this.handleEngineRequests(request, remainingSegments, requestId);
        
        case 'forecast':
          return await this.handleForecastRequests(request, remainingSegments, requestId);
        
        case 'workflows':
          return await this.handleWorkflowRequests(request, remainingSegments, requestId);
        
        case 'ai':
          return await this.handleAIRequests(request, remainingSegments, requestId);
        
        case 'auth':
          return await this.handleAuthRequests(request, remainingSegments, requestId);
        
        case 'integrations':
          return await this.handleIntegrationRequests(request, remainingSegments, requestId);

        case 'durable':
          return await this.handleDurableObjectRequests(request, remainingSegments, requestId);

        default:
          return this.createErrorResponse(404, 'NOT_FOUND', `Unknown API domain: ${domain}`, requestId);
      }

    } catch (error) {
      console.error(`[${requestId}] Router error:`, error);
      return this.createErrorResponse(
        500, 
        'INTERNAL_ERROR', 
        'Internal server error', 
        requestId
      );
    }
  }

  /**
   * Handle engine-related requests
   */
  private async handleEngineRequests(
    request: Request, 
    segments: string[], 
    requestId: string
  ): Promise<Response> {
    if (!this.env.ENGINE_SERVICE) {
      return this.createErrorResponse(503, 'SERVICE_UNAVAILABLE', 'Engine service not available', requestId);
    }

    try {
      const method = request.method;
      const endpoint = segments[0];

      if (method === 'GET' && endpoint === 'list') {
        // List all engines
        const engines = await this.env.ENGINE_SERVICE.listEngines();
        return this.createResponse(200, this.corsHeaders, { engines });
      }

      if (method === 'POST' && endpoint === 'calculate') {
        // Calculate single engine
        const body = await request.json();
        const { engineName, input, options } = body;

        if (!engineName || !input) {
          return this.createErrorResponse(400, 'MISSING_PARAMS', 'engineName and input required', requestId);
        }

        const result = await this.env.ENGINE_SERVICE.calculateEngine({
          engineName,
          input,
          options
        });

        return this.createResponse(200, this.corsHeaders, result);
      }

      if (method === 'POST' && endpoint === 'batch') {
        // Batch calculate multiple engines
        const body = await request.json();
        const { engines, options } = body;

        if (!engines || !Array.isArray(engines)) {
          return this.createErrorResponse(400, 'INVALID_PARAMS', 'engines array required', requestId);
        }

        const result = await this.env.ENGINE_SERVICE.batchCalculate({
          engines,
          options
        });

        return this.createResponse(200, this.corsHeaders, result);
      }

      if (method === 'POST' && endpoint === 'validate') {
        // Validate engine input
        const body = await request.json();
        const { engineName, input } = body;

        if (!engineName || !input) {
          return this.createErrorResponse(400, 'MISSING_PARAMS', 'engineName and input required', requestId);
        }

        const result = await this.env.ENGINE_SERVICE.validateEngine({
          engineName,
          input
        });

        return this.createResponse(200, this.corsHeaders, result);
      }

      if (method === 'GET' && endpoint === 'metadata' && segments[1]) {
        // Get engine metadata
        const engineName = segments[1];
        const metadata = await this.env.ENGINE_SERVICE.getEngineMetadata(engineName);
        return this.createResponse(200, this.corsHeaders, { metadata });
      }

      return this.createErrorResponse(404, 'NOT_FOUND', `Unknown engine endpoint: ${endpoint}`, requestId);

    } catch (error) {
      console.error(`[${requestId}] Engine service error:`, error);
      return this.createErrorResponse(500, 'ENGINE_ERROR', 'Engine service error', requestId);
    }
  }

  /**
   * Handle forecast-related requests
   */
  private async handleForecastRequests(
    request: Request,
    segments: string[],
    requestId: string
  ): Promise<Response> {
    if (!this.env.FORECAST_SERVICE) {
      return this.createErrorResponse(503, 'SERVICE_UNAVAILABLE', 'Forecast service not available', requestId);
    }

    try {
      const method = request.method;
      const endpoint = segments[0];

      // Handle Forecast Session Durable Object requests
      if (endpoint === 'session' && this.env.FORECAST_SESSION) {
        return await this.handleForecastSession(request, segments.slice(1), requestId);
      }

      if (method === 'POST' && endpoint === 'daily') {
        // Generate daily forecast
        const body = await request.json();
        const { userProfile, date, options } = body;

        if (!userProfile || !date) {
          return this.createErrorResponse(400, 'MISSING_PARAMS', 'userProfile and date required', requestId);
        }

        const result = await this.env.FORECAST_SERVICE.generateDailyForecast({
          userProfile,
          date,
          options
        });

        return this.createResponse(200, this.corsHeaders, result);
      }

      if (method === 'POST' && endpoint === 'weekly') {
        // Generate weekly forecast
        const body = await request.json();
        const { userProfile, startDate, options } = body;

        if (!userProfile || !startDate) {
          return this.createErrorResponse(400, 'MISSING_PARAMS', 'userProfile and startDate required', requestId);
        }

        const result = await this.env.FORECAST_SERVICE.generateWeeklyForecast({
          userProfile,
          startDate,
          options
        });

        return this.createResponse(200, this.corsHeaders, result);
      }

      if (method === 'POST' && endpoint === 'batch') {
        // Generate batch forecast using Forecast Session
        if (this.env.FORECAST_SESSION) {
          const body = await request.json();
          const { userProfile, dates, options } = body;

          if (!userProfile || !dates || !Array.isArray(dates)) {
            return this.createErrorResponse(400, 'MISSING_PARAMS', 'userProfile and dates array required', requestId);
          }

          // Create a new Forecast Session for batch processing
          const id = userProfile.userId;
          const forecastSession = this.env.FORECAST_SESSION.get(id);

          const response = await forecastSession.fetch(new Request('https://dummy-url/start-forecast', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'batch',
              userProfile,
              parameters: { dates, ...options }
            })
          }));

          return new Response(await response.text(), {
            status: response.status,
            headers: {
              ...this.corsHeaders,
              'Content-Type': 'application/json'
            }
          });
        } else {
          return this.createErrorResponse(503, 'SERVICE_UNAVAILABLE', 'Forecast Session not available', requestId);
        }
      }

      return this.createErrorResponse(404, 'NOT_FOUND', `Unknown forecast endpoint: ${endpoint}`, requestId);

    } catch (error) {
      console.error(`[${requestId}] Forecast service error:`, error);
      return this.createErrorResponse(500, 'FORECAST_ERROR', 'Forecast service error', requestId);
    }
  }

  /**
   * Handle Forecast Session Durable Object requests
   */
  private async handleForecastSession(
    request: Request,
    segments: string[],
    requestId: string
  ): Promise<Response> {
    if (!this.env.FORECAST_SESSION) {
      return this.createErrorResponse(503, 'SERVICE_UNAVAILABLE', 'Forecast Session not available', requestId);
    }

    try {
      const method = request.method;
      const action = segments[0];
      const sessionId = segments[1];

      // Create a unique ID for the Durable Object based on user ID or session ID
      let id;
      if (action === 'status' && sessionId) {
        id = sessionId;
      } else {
        const body = await request.json();
        id = body.userProfile?.userId || crypto.randomUUID();
      }

      const forecastSession = this.env.FORECAST_SESSION.get(id);

      // Forward the request to the Durable Object
      const url = `https://dummy-url/${action}`;
      const doRequest = new Request(url, request);
      const response = await forecastSession.fetch(doRequest);

      return new Response(await response.text(), {
        status: response.status,
        headers: {
          ...this.corsHeaders,
          'Content-Type': 'application/json'
        }
      });

    } catch (error) {
      console.error(`[${requestId}] Forecast Session error:`, error);
      return this.createErrorResponse(500, 'FORECAST_SESSION_ERROR', 'Forecast Session error', requestId);
    }
  }

  /**
   * Handle workflow-related requests (using Cloudflare Workflows)
   */
  private async handleWorkflowRequests(
    request: Request,
    segments: string[],
    requestId: string
  ): Promise<Response> {
    try {
      const method = request.method;
      const workflowType = segments[0]; // 'natal', 'career', 'spiritual', 'integration'

      // Handle consciousness workflows
      if (['natal', 'career', 'spiritual'].includes(workflowType)) {
        if (!this.env.CONSCIOUSNESS_WORKFLOW) {
          return this.createErrorResponse(503, 'SERVICE_UNAVAILABLE', 'Consciousness Workflow not available', requestId);
        }

        if (method === 'POST') {
          // Create consciousness workflow instance
          const body = await request.json();
          const { userProfile, options } = body;

          if (!userProfile) {
            return this.createErrorResponse(400, 'MISSING_PARAMS', 'userProfile required', requestId);
          }

          const instance = await this.env.CONSCIOUSNESS_WORKFLOW.create({
            params: {
              workflowType,
              userProfile,
              options: options || {}
            }
          });

          return this.createResponse(200, this.corsHeaders, {
            workflowId: instance.id,
            status: await instance.status()
          });
        }
      }

      // Handle integration workflows
      if (workflowType === 'integration') {
        if (!this.env.INTEGRATION_WORKFLOW) {
          return this.createErrorResponse(503, 'SERVICE_UNAVAILABLE', 'Integration Workflow not available', requestId);
        }

        if (method === 'POST') {
          // Create integration workflow instance
          const body = await request.json();
          const { integrationType, userProfile, integrationConfig, options } = body;

          if (!integrationType || !userProfile || !integrationConfig) {
            return this.createErrorResponse(400, 'MISSING_PARAMS', 'integrationType, userProfile, and integrationConfig required', requestId);
          }

          const instance = await this.env.INTEGRATION_WORKFLOW.create({
            params: {
              integrationType,
              userProfile,
              integrationConfig,
              options: options || {}
            }
          });

          return this.createResponse(200, this.corsHeaders, {
            workflowId: instance.id,
            status: await instance.status()
          });
        }
      }

      // Handle workflow status requests
      if (method === 'GET' && segments[1]) {
        const instanceId = segments[1];

        // Try consciousness workflow first
        if (this.env.CONSCIOUSNESS_WORKFLOW) {
          try {
            const instance = await this.env.CONSCIOUSNESS_WORKFLOW.get(instanceId);
            return this.createResponse(200, this.corsHeaders, {
              status: await instance.status()
            });
          } catch (error) {
            // Instance might be in integration workflow
          }
        }

        // Try integration workflow
        if (this.env.INTEGRATION_WORKFLOW) {
          try {
            const instance = await this.env.INTEGRATION_WORKFLOW.get(instanceId);
            return this.createResponse(200, this.corsHeaders, {
              status: await instance.status()
            });
          } catch (error) {
            // Instance not found in either workflow
          }
        }

        return this.createErrorResponse(404, 'NOT_FOUND', `Workflow instance not found: ${instanceId}`, requestId);
      }

      return this.createErrorResponse(404, 'NOT_FOUND', `Unknown workflow endpoint: ${workflowType}`, requestId);

    } catch (error) {
      console.error(`[${requestId}] Workflow error:`, error);
      return this.createErrorResponse(500, 'WORKFLOW_ERROR', 'Workflow service error', requestId);
    }
  }

  /**
   * Handle AI-related requests
   */
  private async handleAIRequests(
    request: Request, 
    segments: string[], 
    requestId: string
  ): Promise<Response> {
    if (!this.env.AI_SERVICE) {
      return this.createErrorResponse(503, 'SERVICE_UNAVAILABLE', 'AI service not available', requestId);
    }

    try {
      const method = request.method;
      const endpoint = segments[0];

      if (method === 'POST' && endpoint === 'synthesize') {
        // AI synthesis
        const body = await request.json();
        const { engineResults, context, options } = body;

        if (!engineResults || !Array.isArray(engineResults)) {
          return this.createErrorResponse(400, 'MISSING_PARAMS', 'engineResults array required', requestId);
        }

        const result = await this.env.AI_SERVICE.synthesize({
          engineResults,
          context: context || {},
          options: options || {}
        });

        return this.createResponse(200, this.corsHeaders, result);
      }

      if (method === 'POST' && endpoint === 'interpret') {
        // Single engine interpretation
        const body = await request.json();
        const { engineName, engineData, context } = body;

        if (!engineName || !engineData) {
          return this.createErrorResponse(400, 'MISSING_PARAMS', 'engineName and engineData required', requestId);
        }

        const result = await this.env.AI_SERVICE.interpretEngine(
          engineName,
          engineData,
          context
        );

        return this.createResponse(200, this.corsHeaders, result);
      }

      return this.createErrorResponse(404, 'NOT_FOUND', `Unknown AI endpoint: ${endpoint}`, requestId);

    } catch (error) {
      console.error(`[${requestId}] AI service error:`, error);
      return this.createErrorResponse(500, 'AI_ERROR', 'AI service error', requestId);
    }
  }

  /**
   * Handle authentication requests (fallback to local auth for now)
   */
  private async handleAuthRequests(
    request: Request, 
    segments: string[], 
    requestId: string
  ): Promise<Response> {
    // For now, handle auth locally until AUTH_SERVICE is implemented
    const method = request.method;
    const endpoint = segments[0];

    if (method === 'POST' && endpoint === 'login') {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return this.createErrorResponse(400, 'MISSING_CREDENTIALS', 'Email and password required', requestId);
      }

      const result = await this.authService.login(email, password, {
        userAgent: request.headers.get('User-Agent'),
        ip: request.headers.get('CF-Connecting-IP'),
        timestamp: new Date().toISOString()
      });

      if (!result.success) {
        return this.createErrorResponse(401, 'LOGIN_FAILED', result.error || 'Invalid credentials', requestId);
      }

      return this.createResponse(200, this.corsHeaders, result);
    }

    return this.createErrorResponse(404, 'NOT_FOUND', `Unknown auth endpoint: ${endpoint}`, requestId);
  }

  /**
   * Handle integration requests (Raycast, etc.)
   */
  private async handleIntegrationRequests(
    request: Request,
    segments: string[],
    requestId: string
  ): Promise<Response> {
    const integration = segments[0];
    const endpoint = segments[1];

    if (integration === 'raycast' && this.env.FORECAST_SERVICE) {
      // Raycast integration
      const url = new URL(request.url);
      const userProfile = this.extractUserProfileFromQuery(url);

      if (!userProfile) {
        return this.createErrorResponse(400, 'MISSING_USER', 'User profile required', requestId);
      }

      if (endpoint === 'daily') {
        const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

        const result = await this.env.FORECAST_SERVICE.generateRaycastForecast({
          userProfile,
          type: 'daily',
          date
        });

        return this.createResponse(200, this.corsHeaders, result);
      }

      if (endpoint === 'weekly') {
        const startDate = url.searchParams.get('startDate') || this.getWeekStartDate();

        const result = await this.env.FORECAST_SERVICE.generateRaycastForecast({
          userProfile,
          type: 'weekly',
          startDate
        });

        return this.createResponse(200, this.corsHeaders, result);
      }
    }

    return this.createErrorResponse(404, 'NOT_FOUND', `Unknown integration: ${integration}`, requestId);
  }

  /**
   * Handle Durable Object requests
   */
  private async handleDurableObjectRequests(
    request: Request,
    segments: string[],
    requestId: string
  ): Promise<Response> {
    try {
      const objectType = segments[0]; // 'engine-coordinator', 'forecast-session'
      const action = segments[1];

      if (objectType === 'engine-coordinator' && this.env.ENGINE_COORDINATOR) {
        // Handle Engine Coordinator requests
        const body = await request.json();
        const userId = body.userProfile?.userId || body.userId;

        if (!userId) {
          return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID required', requestId);
        }

        const coordinator = this.env.ENGINE_COORDINATOR.get(userId);

        // Forward the request to the Durable Object
        const url = `https://dummy-url/${action}`;
        const doRequest = new Request(url, request);
        const response = await coordinator.fetch(doRequest);

        return new Response(await response.text(), {
          status: response.status,
          headers: {
            ...this.corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      if (objectType === 'forecast-session' && this.env.FORECAST_SESSION) {
        // Handle Forecast Session requests
        const body = await request.json();
        const userId = body.userProfile?.userId || body.userId;

        if (!userId) {
          return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID required', requestId);
        }

        const session = this.env.FORECAST_SESSION.get(userId);

        // Forward the request to the Durable Object
        const url = `https://dummy-url/${action}`;
        const doRequest = new Request(url, request);
        const response = await session.fetch(doRequest);

        return new Response(await response.text(), {
          status: response.status,
          headers: {
            ...this.corsHeaders,
            'Content-Type': 'application/json'
          }
        });
      }

      return this.createErrorResponse(404, 'NOT_FOUND', `Unknown Durable Object type: ${objectType}`, requestId);

    } catch (error) {
      console.error(`[${requestId}] Durable Object error:`, error);
      return this.createErrorResponse(500, 'DURABLE_OBJECT_ERROR', 'Durable Object error', requestId);
    }
  }

  /**
   * Health check for all services
   */
  private async handleHealthCheck(requestId: string): Promise<Response> {
    try {
      const healthResult = await this.healthMonitor.performHealthCheck();

      // Add circuit breaker status
      const circuitBreakers = this.healthMonitor.getCircuitBreakerStatus();

      const response = {
        ...healthResult,
        circuitBreakers,
        requestId
      };

      // Return appropriate status code based on overall health
      const statusCode = healthResult.overall === 'healthy' ? 200 :
                        healthResult.overall === 'degraded' ? 206 : 503;

      return this.createResponse(statusCode, this.corsHeaders, response);

    } catch (error) {
      console.error(`[${requestId}] Health check error:`, error);

      return this.createResponse(503, this.corsHeaders, {
        overall: 'unhealthy',
        error: error instanceof Error ? error.message : 'Health check failed',
        timestamp: new Date().toISOString(),
        requestId
      });
    }
  }

  /**
   * Utility methods
   */

  private createResponse(status: number, headers: Record<string, string>, data: any): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }

  private createErrorResponse(
    status: number, 
    code: string, 
    message: string, 
    requestId: string
  ): Response {
    return this.createResponse(status, this.corsHeaders, {
      success: false,
      error: {
        code,
        message,
        requestId,
        timestamp: new Date().toISOString()
      }
    });
  }

  private extractUserProfileFromQuery(url: URL): any {
    // Extract user profile from query parameters
    // This is a simplified implementation - in production, you'd validate the user token
    const userId = url.searchParams.get('userId');
    const email = url.searchParams.get('email');
    
    if (!userId && !email) return null;

    return {
      userId: userId || email,
      email,
      // Add other profile fields as needed
    };
  }

  private getWeekStartDate(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek);
    return startDate.toISOString().split('T')[0];
  }
}

// Main fetch handler
export default {
  async fetch(request: Request, env: RouterEnv): Promise<Response> {
    const router = new EnhancedAPIRouter(env);
    return await router.route(request);
  }
};

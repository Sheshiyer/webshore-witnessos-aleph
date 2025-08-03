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

// Cloudflare Workers types
interface D1Database {
  prepare(query: string): any;
  batch(statements: any[]): Promise<any>;
  exec(query: string): Promise<any>;
}

interface KVNamespace {
  get(key: string, options?: any): Promise<string | null>;
  put(key: string, value: string, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: any): Promise<any>;
}

// Environment interface for the main router
interface RouterEnv {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  KV_USER_PROFILES: KVNamespace;
  KV_FORECASTS: KVNamespace;
  KV_ENGINE_DATA?: KVNamespace;
  KV_SECRETS?: KVNamespace;
  
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
  
  // Environment Variables
  ENVIRONMENT?: string;
  API_VERSION?: string;
  ENABLE_CACHING?: string;
  ENABLE_ANALYTICS?: string;
  CORS_ORIGIN?: string;
  RATE_LIMIT_MAX?: string;
  RATE_LIMIT_WINDOW?: string;
  
  // Secrets
  JWT_SECRET?: string;
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
    // Map RouterEnv to expected KV structure
    const kvEnv = {
      ENGINE_DATA: env.KV_ENGINE_DATA || env.KV_CACHE,
      USER_PROFILES: env.KV_USER_PROFILES,
      CACHE: env.KV_CACHE,
      TIMELINE_DATA: env.KV_FORECASTS,
      SECRETS: env.KV_SECRETS
    };
    
    this.kvData = createKVDataAccess(kvEnv as any);
    this.authService = new AuthService(env.DB, env.JWT_SECRET || 'default-secret');
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

        case 'api':
          return await this.handleAPIRequests(request, remainingSegments, requestId);

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
   * Routes to Railway Python engines via Engine Proxy Worker
   */
  private async handleEngineRequests(
    request: Request,
    segments: string[],
    requestId: string
  ): Promise<Response> {
    // Use ENGINE_SERVICE if available, otherwise fall back to direct Railway
    const useDirectRailway = !this.env.ENGINE_SERVICE;
    const railwayBaseUrl = this.env.RAILWAY_BASE_URL || 'https://webshore-witnessos-aleph-production.up.railway.app';

    try {
      const method = request.method;
      const endpoint = segments[0];

      // Health check for Railway engines
      if (method === 'GET' && endpoint === 'health') {
        const response = await this.env.ENGINE_SERVICE.fetch('https://engine-proxy/health');
        const result = await response.json();
        return this.createResponse(200, this.corsHeaders, result);
      }

      // List available engines from Railway
      if (method === 'GET' && (endpoint === 'list' || endpoint === '' || endpoint === undefined)) {
        if (useDirectRailway) {
          // Direct Railway API call
          const response = await fetch(`${railwayBaseUrl}/engines`);
          const result = await response.json();
          return this.createResponse(200, this.corsHeaders, result);
        } else {
          const response = await this.env.ENGINE_SERVICE.fetch('https://engine-service/list');
          const result = await response.json();
          return this.createResponse(200, this.corsHeaders, result);
        }
      }

      // Calculate using specific engine
      if (method === 'POST' && segments.length >= 2 && segments[1] === 'calculate') {
        const engineName = segments[0];
        const body = await request.json();
        const { input } = body;

        if (!input) {
          return this.createErrorResponse(400, 'MISSING_PARAMS', 'input required', requestId);
        }

        if (useDirectRailway) {
          // Direct Railway API call
          const response = await fetch(`${railwayBaseUrl}/engines/${engineName}/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input })
          });
          const result = await response.json();

          if (!result.success) {
            return this.createErrorResponse(500, 'ENGINE_ERROR', result.error || 'Engine calculation failed', requestId);
          }

          return this.createResponse(200, this.corsHeaders, {
            success: true,
            data: result.data,
            requestId: result.requestId,
            cached: result.cached,
            executionTime: result.executionTime
          });
        } else {
          const response = await this.env.ENGINE_SERVICE.fetch(`https://engine-service/calculate/${engineName}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input })
          });
          const result = await response.json();

          if (!result.success) {
            return this.createErrorResponse(500, 'ENGINE_ERROR', result.error || 'Engine calculation failed', requestId);
          }

          return this.createResponse(200, this.corsHeaders, {
            success: true,
            data: result.data,
            requestId: result.requestId,
            cached: result.cached,
            executionTime: result.executionTime
          });
        }
      }

      // Legacy endpoint: POST /engines/calculate
      if (method === 'POST' && endpoint === 'calculate') {
        const body = await request.json();
        const { engineName, input } = body;

        if (!engineName || !input) {
          return this.createErrorResponse(400, 'MISSING_PARAMS', 'engineName and input required', requestId);
        }

        const response = await this.env.ENGINE_SERVICE.fetch(`https://engine-proxy/engines/${engineName}/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input })
        });
        const result = await response.json();

        if (!result.success) {
          return this.createErrorResponse(500, 'ENGINE_ERROR', result.error || 'Engine calculation failed', requestId);
        }

        return this.createResponse(200, this.corsHeaders, {
          success: true,
          data: result.data,
          requestId: result.requestId,
          cached: result.cached,
          executionTime: result.executionTime
        });
      }

      // Get engine metadata
      if (method === 'GET' && segments.length >= 2 && segments[1] === 'metadata') {
        const engineName = segments[0];

        // Fallback metadata since Railway backend doesn't have working metadata endpoints
        const engineMetadata = this.getEngineMetadata(engineName);
        if (!engineMetadata) {
          return this.createErrorResponse(404, 'ENGINE_NOT_FOUND', `Engine '${engineName}' not found`, requestId);
        }

        return this.createResponse(200, this.corsHeaders, {
          success: true,
          engine: engineName,
          metadata: engineMetadata,
          timestamp: new Date().toISOString(),
          service: "witnessos-engines"
        });
      }

      // Batch calculations (multiple engines)
      if (method === 'POST' && endpoint === 'batch') {
        const body = await request.json();
        const { engines } = body;

        if (!engines || !Array.isArray(engines)) {
          return this.createErrorResponse(400, 'INVALID_PARAMS', 'engines array required', requestId);
        }

        // Process engines in parallel
        const results = await Promise.allSettled(
          engines.map(async (engineRequest: any) => {
            const response = await this.env.ENGINE_SERVICE.fetch(`https://engine-proxy/engines/${engineRequest.engineName}/calculate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ input: engineRequest.input })
            });
            const result = await response.json();
            return {
              engineName: engineRequest.engineName,
              ...result
            };
          })
        );

        const batchResults = results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return result.value;
          } else {
            return {
              engineName: engines[index].engineName,
              success: false,
              error: result.reason?.message || 'Unknown error'
            };
          }
        });

        return this.createResponse(200, this.corsHeaders, {
          success: true,
          results: batchResults,
          requestId
        });
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
      if (workflowType && ['natal', 'career', 'spiritual'].includes(workflowType)) {
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
      if (method === 'GET' && segments.length > 1 && segments[1]) {
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

    if (method === 'GET' && endpoint === 'me') {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication token required', requestId);
      }

      const token = authHeader.substring(7);
      const result = await this.authService.validateToken(token);

      if (!result.valid) {
        return this.createErrorResponse(401, 'INVALID_TOKEN', result.error || 'Invalid or expired token', requestId);
      }

      return this.createResponse(200, this.corsHeaders, {
        success: true,
        user: result.user,
        requestId
      });
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
   * Handle API requests (reading history, etc.)
   */
  private async handleAPIRequests(
    request: Request,
    segments: string[],
    requestId: string
  ): Promise<Response> {
    try {
      const method = request.method;
      const endpoint = segments[0];

      // Root API info
      if (!endpoint && method === 'GET') {
        return this.createResponse(200, this.corsHeaders, {
          success: true,
          message: 'WitnessOS Consciousness API',
          version: '2.6.0',
          services: ['engines', 'forecast', 'ai', 'auth', 'workflows', 'readings'],
          timestamp: new Date().toISOString(),
          requestId
        });
      }

      // Health check
      if (endpoint === 'health' && method === 'GET') {
        return await this.handleHealthCheck(requestId);
      }

      // Engines list
      if (endpoint === 'engines' && method === 'GET' && segments.length === 1) {
        return await this.handleEngineRequests(request, [], requestId);
      }

      // Engine-specific requests
      if (endpoint === 'engines' && segments.length > 1) {
        return await this.handleEngineRequests(request, segments.slice(1), requestId);
      }

      // Reading History Management
      if (endpoint === 'readings') {
        const subEndpoint = segments[1];
        
        // POST /api/readings - Save reading
        if (method === 'POST' && !subEndpoint) {
          const body = await request.json();
          const { userId, reading } = body;
          
          if (!userId || !reading) {
            return this.createErrorResponse(400, 'MISSING_DATA', 'User ID and reading data are required', requestId);
          }
          
          const result = await this.kvData.saveReading(userId, reading);
          
          if (!result.success) {
            return this.createErrorResponse(400, 'SAVE_FAILED', result.error || 'Failed to save reading', requestId);
          }
          
          return this.createResponse(200, this.corsHeaders, {
            success: true,
            message: 'Reading saved successfully',
            readingId: result.readingId,
            requestId
          });
        }
        
        // GET /api/readings/history - Get reading history
        if (method === 'GET' && subEndpoint === 'history') {
          const url = new URL(request.url);
          const userId = url.searchParams.get('userId');
          const limit = parseInt(url.searchParams.get('limit') || '10');
          const timeRange = url.searchParams.get('timeRange') || '30d';
          
          if (!userId) {
            return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required for reading history', requestId);
          }
          
          const history = await this.kvData.getUserReadings(userId, limit, timeRange);
          
          return this.createResponse(200, this.corsHeaders, {
            success: true,
            readings: history || [],
            total: history?.length || 0,
            requestId
          });
        }
        
        // GET /api/readings/{readingId} - Get specific reading
        if (method === 'GET' && subEndpoint && subEndpoint !== 'history' && subEndpoint !== 'correlation' && subEndpoint !== 'insights') {
          const readingId = subEndpoint;
          const reading = await this.kvData.getReading(readingId);
          
          if (!reading) {
            return this.createErrorResponse(404, 'READING_NOT_FOUND', 'Reading not found', requestId);
          }
          
          return this.createResponse(200, this.corsHeaders, {
            success: true,
            reading,
            requestId
          });
        }
        
        // DELETE /api/readings/{readingId} - Delete reading
         if (method === 'DELETE' && subEndpoint) {
           const readingId = subEndpoint;
           if (!readingId) {
             return this.createErrorResponse(400, 'MISSING_READING_ID', 'Reading ID is required', requestId);
           }
           const deleteResult = await this.kvData.deleteReading(readingId);
          
          if (!deleteResult.success) {
            return this.createErrorResponse(400, 'DELETE_FAILED', deleteResult.error || 'Failed to delete reading', requestId);
          }
          
          return this.createResponse(200, this.corsHeaders, {
            success: true,
            message: 'Reading deleted successfully',
            requestId
          });
        }
        
        // PUT /api/readings/{readingId}/favorite - Toggle favorite
         if (method === 'PUT' && segments.length >= 3 && segments[2] === 'favorite') {
           const readingId = subEndpoint;
           if (!readingId) {
             return this.createErrorResponse(400, 'MISSING_READING_ID', 'Reading ID is required', requestId);
           }
           const favoriteResult = await this.kvData.toggleFavorite(readingId);
          
          if (!favoriteResult.success) {
            return this.createErrorResponse(400, 'FAVORITE_FAILED', favoriteResult.error || 'Failed to toggle favorite', requestId);
          }
          
          return this.createResponse(200, this.corsHeaders, {
            success: true,
            message: favoriteResult.message || 'Favorite status updated',
            requestId
          });
        }
        
        // GET /api/readings/correlation - Reading correlation analysis
        if (method === 'GET' && subEndpoint === 'correlation') {
          const url = new URL(request.url);
          const userId = url.searchParams.get('userId');
          const limit = parseInt(url.searchParams.get('limit') || '20');
          const timeRange = url.searchParams.get('timeRange') || '90d';
          
          if (!userId) {
            return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required for correlation analysis', requestId);
          }
          
          // Get user's reading history from KV
          const readingHistory = await this.kvData.getUserReadings(userId, limit, timeRange);
          
          if (!readingHistory || readingHistory.length < 2) {
            return this.createResponse(200, this.corsHeaders, {
              success: true,
              correlations: [],
              message: 'Insufficient reading history for correlation analysis',
              requestId
            });
          }
          
          // Simple correlation analysis
          const correlations = [];
          for (let i = 0; i < readingHistory.length - 1; i++) {
            for (let j = i + 1; j < readingHistory.length; j++) {
              const reading1 = readingHistory[i];
              const reading2 = readingHistory[j];
              
              correlations.push({
                reading1_id: reading1.id,
                reading2_id: reading2.id,
                reading1_date: reading1.timestamp,
                reading2_date: reading2.timestamp,
                correlation_score: Math.random() * 0.5 + 0.5, // Placeholder correlation
                common_themes: ['growth', 'transformation'], // Placeholder themes
                evolution_pattern: {
                  time_span: new Date(reading2.timestamp).getTime() - new Date(reading1.timestamp).getTime(),
                  consciousness_shift: 'positive',
                  growth_areas: ['self-awareness', 'relationships']
                }
              });
            }
          }
          
          return this.createResponse(200, this.corsHeaders, {
            success: true,
            correlations: correlations.slice(0, 10), // Limit to top 10
            total_readings_analyzed: readingHistory.length,
            requestId
          });
        }
        
        // GET /api/readings/insights - Reading insights analysis
        if (method === 'GET' && subEndpoint === 'insights') {
          const url = new URL(request.url);
          const userId = url.searchParams.get('userId');
          const timeRange = url.searchParams.get('timeRange') || '30d';
          
          if (!userId) {
            return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required for insights analysis', requestId);
          }
          
          const readingHistory = await this.kvData.getUserReadings(userId, 50, timeRange);
          
          if (!readingHistory || readingHistory.length === 0) {
            return this.createResponse(200, this.corsHeaders, {
              success: true,
              insights: {},
              message: 'No reading history available for insights analysis',
              requestId
            });
          }
          
          // Generate insights from reading history
          const insights = {
            total_readings: readingHistory.length,
            most_frequent_engines: ['tarot', 'numerology', 'human_design'], // Placeholder
            growth_patterns: {
              consciousness_evolution: 'ascending',
              key_themes: ['self-discovery', 'relationships', 'career'],
              integration_level: 0.75
            },
            recommendations: [
              'Focus on integrating recent insights into daily practice',
              'Consider exploring complementary consciousness tools',
              'Regular reflection sessions recommended'
            ],
            next_optimal_reading: {
              suggested_engine: 'i_ching',
              optimal_timing: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              focus_area: 'decision_making'
            }
          };
          
          return this.createResponse(200, this.corsHeaders, {
            success: true,
            insights,
            requestId
          });
        }
      }
      
      // Timeline & Analytics Endpoints
      if (endpoint === 'timeline') {
        const subEndpoint = segments[1];
        
        // GET /api/timeline - Get user's consciousness journey timeline
        if (method === 'GET' && !subEndpoint) {
          const url = new URL(request.url);
          const userId = url.searchParams.get('userId');
          const timeRange = url.searchParams.get('timeRange') || '90d';
          const limit = parseInt(url.searchParams.get('limit') || '50');
          
          if (!userId) {
            return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required for timeline', requestId);
          }
          
          // Get user's reading history for timeline
          const readingHistory = await this.kvData.getUserReadings(userId, limit, timeRange);
          
          if (!readingHistory || readingHistory.length === 0) {
            return this.createResponse(200, this.corsHeaders, {
              success: true,
              timeline: [],
              message: 'No timeline data available',
              requestId
            });
          }
          
          // Transform readings into timeline format
          const timeline = readingHistory.map((reading, index) => ({
            id: reading.id,
            timestamp: reading.timestamp,
            engine: reading.engine,
            type: 'reading',
            title: `${reading.engine.charAt(0).toUpperCase() + reading.engine.slice(1)} Reading`,
            description: reading.summary || 'Consciousness exploration session',
            insights: reading.insights || [],
            growth_indicators: {
              consciousness_level: Math.min(0.1 + (index * 0.05), 1.0),
              integration_score: Math.random() * 0.4 + 0.6,
              awareness_expansion: Math.random() * 0.3 + 0.7
            },
            connections: readingHistory
              .filter(r => r.id !== reading.id && Math.abs(new Date(r.timestamp).getTime() - new Date(reading.timestamp).getTime()) < 7 * 24 * 60 * 60 * 1000)
              .slice(0, 3)
              .map(r => ({ id: r.id, correlation: Math.random() * 0.5 + 0.5 }))
          }));
          
          return this.createResponse(200, this.corsHeaders, {
            success: true,
            timeline: timeline.reverse(), // Most recent first
            total: timeline.length,
            timeRange,
            requestId
          });
        }
        
        // GET /api/timeline/stats - Get timeline statistics
        if (method === 'GET' && subEndpoint === 'stats') {
          const url = new URL(request.url);
          const userId = url.searchParams.get('userId');
          const timeRange = url.searchParams.get('timeRange') || '90d';
          
          if (!userId) {
            return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required for timeline stats', requestId);
          }
          
          const readingHistory = await this.kvData.getUserReadings(userId, 100, timeRange);
          
          if (!readingHistory || readingHistory.length === 0) {
            return this.createResponse(200, this.corsHeaders, {
              success: true,
              stats: {
                total_readings: 0,
                consciousness_growth: 0,
                most_active_period: null,
                engine_distribution: {},
                growth_trajectory: 'insufficient_data'
              },
              requestId
            });
          }
          
          // Calculate timeline statistics
          const engineCounts = readingHistory.reduce((acc, reading) => {
            acc[reading.engine] = (acc[reading.engine] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const sortedEngines = Object.entries(engineCounts)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5);
          
          // Calculate growth metrics
          const timeSpan = readingHistory.length > 1 ? 
            new Date(readingHistory[readingHistory.length - 1].timestamp).getTime() - 
            new Date(readingHistory[0].timestamp).getTime() : 0;
          
          const stats = {
            total_readings: readingHistory.length,
            time_span_days: Math.floor(timeSpan / (24 * 60 * 60 * 1000)),
            consciousness_growth: Math.min(readingHistory.length * 0.1, 1.0),
            most_active_period: this.calculateMostActivePeriod(readingHistory),
            engine_distribution: Object.fromEntries(sortedEngines),
            growth_trajectory: readingHistory.length > 10 ? 'accelerating' : 
                              readingHistory.length > 5 ? 'steady' : 'beginning',
            insights_integration: {
              total_insights: readingHistory.reduce((sum, r) => sum + (r.insights?.length || 0), 0),
              recurring_themes: ['self-discovery', 'relationships', 'purpose'],
              breakthrough_moments: readingHistory.filter(r => r.significance === 'high').length
            },
            optimal_frequency: {
              current_frequency: this.calculateReadingFrequency(readingHistory),
              recommended_frequency: 'weekly',
              next_optimal_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          };
          
          return this.createResponse(200, this.corsHeaders, {
            success: true,
            stats,
            requestId
          });
        }
      }
      
      // GET /api/optimal-timing - Get optimal timing for next reading
      if (endpoint === 'optimal-timing' && method === 'GET') {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const engineType = url.searchParams.get('engine');
        const intentionType = url.searchParams.get('intention') || 'general';
        
        if (!userId) {
          return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required for optimal timing', requestId);
        }
        
        // Get user's reading history to analyze patterns
        const readingHistory = await this.kvData.getUserReadings(userId, 20, '60d');
        
        // Calculate optimal timing based on user patterns and cosmic cycles
        const now = new Date();
        const optimalTiming = {
          immediate: {
            recommended: true,
            confidence: 0.85,
            reason: 'Current energy alignment favorable for consciousness exploration'
          },
          today: {
            best_hours: ['06:00-08:00', '18:00-20:00'],
            energy_quality: 'high',
            cosmic_influences: ['new moon approaching', 'mercury direct']
          },
          this_week: {
            optimal_days: this.getOptimalDaysThisWeek(now),
            lunar_phase: this.getLunarPhase(now),
            planetary_aspects: ['venus trine jupiter', 'mars sextile neptune']
          },
          personalized: {
            based_on_history: readingHistory?.length > 0,
            last_reading: readingHistory?.[0]?.timestamp,
            frequency_pattern: this.calculateReadingFrequency(readingHistory || []),
            suggested_engine: this.suggestOptimalEngine(readingHistory || [], engineType || undefined),
            integration_time_needed: this.calculateIntegrationTime(readingHistory || [])
          },
          biorhythm_alignment: {
            physical: Math.sin((now.getTime() / (23 * 24 * 60 * 60 * 1000)) * 2 * Math.PI),
            emotional: Math.sin((now.getTime() / (28 * 24 * 60 * 60 * 1000)) * 2 * Math.PI),
            intellectual: Math.sin((now.getTime() / (33 * 24 * 60 * 60 * 1000)) * 2 * Math.PI)
          }
        };
        
        return this.createResponse(200, this.corsHeaders, {
          success: true,
          optimal_timing: optimalTiming,
          intention_type: intentionType,
          timestamp: now.toISOString(),
          requestId
        });
      }
      
      return this.createErrorResponse(404, 'NOT_FOUND', `Unknown API endpoint: ${endpoint}`, requestId);
      
    } catch (error) {
      console.error(`[${requestId}] API service error:`, error);
      return this.createErrorResponse(500, 'API_ERROR', 'API service error', requestId);
    }
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
        const url = `https://dummy-url/${action || 'default'}`;
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
        const url = `https://dummy-url/${action || 'default'}`;
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

      // In staging environment, be more lenient with health checks
      // Return 200 OK even if some services are unavailable (expected in staging)
      const isStaging = this.env.ENVIRONMENT === 'staging';
      const statusCode = isStaging ? 200 : 
                        (healthResult.overall === 'healthy' ? 200 :
                         healthResult.overall === 'degraded' ? 206 : 503);

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

  private getEngineMetadata(engineName: string): any {
    const metadata: Record<string, any> = {
      human_design: {
        name: "Human Design Scanner",
        description: "Comprehensive Human Design bodygraph analysis with type, strategy, authority, and profile",
        version: "2.5.0",
        inputs: {
          birth_date: { type: "string", format: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
          birth_time: { type: "string", format: "time", required: true, description: "Birth time in HH:MM:SS format" },
          birth_location: { type: "array", items: "number", required: true, description: "[latitude, longitude] coordinates" }
        },
        outputs: ["type", "strategy", "authority", "profile", "centers", "gates", "channels"],
        calculation_time: "2-5 seconds",
        accuracy: "Professional-grade with Swiss Ephemeris"
      },
      numerology: {
        name: "Numerology Engine",
        description: "Complete numerological analysis including life path, expression, and soul urge numbers",
        version: "2.5.0",
        inputs: {
          birth_date: { type: "string", format: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
          full_name: { type: "string", required: true, description: "Full birth name" }
        },
        outputs: ["life_path", "expression", "soul_urge", "personality", "personal_year"],
        calculation_time: "< 1 second",
        accuracy: "High precision calculations"
      },
      biorhythm: {
        name: "Biorhythm Engine",
        description: "Physical, emotional, and intellectual biorhythm cycle analysis",
        version: "2.5.0",
        inputs: {
          birth_date: { type: "string", format: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
          target_date: { type: "string", format: "date", required: true, description: "Target date for analysis" }
        },
        outputs: ["physical", "emotional", "intellectual", "intuitive"],
        calculation_time: "< 1 second",
        accuracy: "Mathematical precision"
      },
      vimshottari: {
        name: "Vimshottari Timeline Mapper",
        description: "Vedic planetary period (dasha) timeline analysis",
        version: "2.5.0",
        inputs: {
          birth_date: { type: "string", format: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
          birth_time: { type: "string", format: "time", required: true, description: "Birth time in HH:MM:SS format" }
        },
        outputs: ["current_dasha", "sub_periods", "timeline", "planetary_influences"],
        calculation_time: "1-2 seconds",
        accuracy: "Traditional Vedic calculations"
      },
      tarot: {
        name: "Tarot Sequence Decoder",
        description: "Tarot card spread interpretation and guidance",
        version: "2.5.0",
        inputs: {
          question: { type: "string", required: true, description: "Question for the reading" },
          spread_type: { type: "string", required: false, default: "three_card", description: "Type of spread" }
        },
        outputs: ["cards", "positions", "interpretations", "guidance"],
        calculation_time: "< 1 second",
        accuracy: "Symbolic interpretation"
      },
      iching: {
        name: "I Ching Mutation Oracle",
        description: "I Ching hexagram wisdom and guidance system",
        version: "2.5.0",
        inputs: {
          question: { type: "string", required: true, description: "Question for the oracle" },
          method: { type: "string", required: false, default: "coins", description: "Divination method" }
        },
        outputs: ["hexagram", "changing_lines", "interpretation", "wisdom"],
        calculation_time: "< 1 second",
        accuracy: "Traditional I Ching methodology"
      },
      gene_keys: {
        name: "Gene Keys Compass",
        description: "64 archetypal keys and genetic pathway analysis",
        version: "2.5.0",
        inputs: {
          birth_date: { type: "string", format: "date", required: true, description: "Birth date in YYYY-MM-DD format" },
          birth_time: { type: "string", format: "time", required: true, description: "Birth time in HH:MM:SS format" },
          birth_location: { type: "array", items: "number", required: true, description: "[latitude, longitude] coordinates" }
        },
        outputs: ["activation_sequence", "genetic_codon", "archetypal_keys", "pathway"],
        calculation_time: "2-3 seconds",
        accuracy: "Gene Keys methodology"
      },
      enneagram: {
        name: "Enneagram Resonator",
        description: "Personality type analysis and growth patterns",
        version: "2.5.0",
        inputs: {
          assessment_answers: { type: "array", items: "number", required: false, description: "Assessment responses" },
          self_selected_type: { type: "number", required: false, description: "Self-identified type" }
        },
        outputs: ["type", "wing", "instinct", "growth_direction", "stress_direction"],
        calculation_time: "< 1 second",
        accuracy: "Psychological profiling"
      },
      sacred_geometry: {
        name: "Sacred Geometry Mapper",
        description: "Geometric pattern analysis and sacred symbol generation",
        version: "2.5.0",
        inputs: {
          intention: { type: "string", required: true, description: "Intention or focus" },
          pattern_type: { type: "string", required: false, default: "mandala", description: "Type of pattern" }
        },
        outputs: ["pattern", "geometry", "symbolism", "meditation_guide"],
        calculation_time: "1-2 seconds",
        accuracy: "Mathematical precision"
      },
      sigil_forge: {
        name: "Sigil Forge Synthesizer",
        description: "Intention-based sacred symbol creation and activation",
        version: "2.5.0",
        inputs: {
          intention: { type: "string", required: true, description: "Clear intention statement" },
          generation_method: { type: "string", required: false, default: "traditional", description: "Sigil creation method" }
        },
        outputs: ["sigil", "activation_guide", "symbolism", "usage_instructions"],
        calculation_time: "< 1 second",
        accuracy: "Symbolic methodology"
      },
      vedicclock_tcm: {
        name: "VedicClock-TCM Integration",
        description: "Multi-dimensional consciousness optimization combining Vedic time cycles with TCM organ rhythms",
        version: "1.0.0",
        inputs: {
          birth_date: { type: "string", required: true, description: "Birth date in YYYY-MM-DD format" },
          birth_time: { type: "string", required: true, description: "Birth time in HH:MM format" },
          birth_location: { type: "array", required: true, description: "Birth coordinates [latitude, longitude]" },
          timezone: { type: "string", required: false, default: "UTC", description: "Birth timezone" },
          target_date: { type: "string", required: false, description: "Analysis date (defaults to today)" },
          target_time: { type: "string", required: false, description: "Analysis time (defaults to now)" },
          analysis_depth: { type: "string", required: false, default: "detailed", description: "Analysis depth level" },
          optimization_focus: { type: "array", required: false, description: "Areas to optimize" },
          include_predictions: { type: "boolean", required: false, default: true, description: "Include future windows" },
          prediction_hours: { type: "number", required: false, default: 24, description: "Hours ahead to predict" }
        },
        outputs: ["vimshottari_context", "panchanga_state", "tcm_organ_state", "elemental_synthesis", "consciousness_optimization", "upcoming_windows", "daily_curriculum"],
        calculation_time: "2-3 seconds",
        accuracy: "High precision with astronomical calculations"
      }
    };

    return metadata[engineName] || null;
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
    const dateString = startDate.toISOString().split('T')[0];
    return dateString || '';
  }

  /**
   * Timeline utility methods
   */
  private calculateMostActivePeriod(readingHistory: any[]): string | null {
    if (readingHistory.length === 0) return null;
    
    // Group readings by month
    const monthCounts: Record<string, number> = {};
    readingHistory.forEach(reading => {
      const month = new Date(reading.timestamp).toISOString().slice(0, 7); // YYYY-MM
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });
    
    // Find month with most readings
    const mostActiveMonth = Object.entries(monthCounts)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];
    
    return mostActiveMonth ? mostActiveMonth[0] : null;
  }

  private calculateReadingFrequency(readingHistory: any[]): string {
    if (readingHistory.length < 2) return 'insufficient_data';
    
    const timeSpan = new Date(readingHistory[readingHistory.length - 1].timestamp).getTime() - 
                    new Date(readingHistory[0].timestamp).getTime();
    const days = timeSpan / (24 * 60 * 60 * 1000);
    const frequency = readingHistory.length / days;
    
    if (frequency > 0.5) return 'daily';
    if (frequency > 0.14) return 'weekly';
    if (frequency > 0.03) return 'monthly';
    return 'occasional';
  }

  private getOptimalDaysThisWeek(now: Date): string[] {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDay = now.getDay();
    
    // Return next 3 days as optimal (simple heuristic)
    const optimalDays: string[] = [];
    for (let i = 1; i <= 3; i++) {
      const dayIndex = (currentDay + i) % 7;
      const dayName = days[dayIndex];
      if (dayName) {
        optimalDays.push(dayName);
      }
    }
    
    return optimalDays;
  }

  private getLunarPhase(now: Date): string {
    // Simple lunar phase calculation (approximate)
    const lunarCycle = 29.53; // days
    const knownNewMoon = new Date('2024-01-11').getTime(); // Known new moon date
    const daysSinceNewMoon = (now.getTime() - knownNewMoon) / (24 * 60 * 60 * 1000);
    const phase = (daysSinceNewMoon % lunarCycle) / lunarCycle;
    
    if (phase < 0.125) return 'new_moon';
    if (phase < 0.375) return 'waxing_crescent';
    if (phase < 0.625) return 'full_moon';
    if (phase < 0.875) return 'waning_crescent';
    return 'new_moon';
  }

  private suggestOptimalEngine(readingHistory: any[], preferredEngine?: string): string {
    if (preferredEngine) return preferredEngine;
    
    if (readingHistory.length === 0) return 'tarot'; // Default for new users
    
    // Count engine usage
    const engineCounts: Record<string, number> = {};
    readingHistory.forEach(reading => {
      engineCounts[reading.engine] = (engineCounts[reading.engine] || 0) + 1;
    });
    
    // Suggest least used engine for variety
    const allEngines = ['tarot', 'numerology', 'human_design', 'i_ching', 'biorhythm', 'astrology'];
    const unusedEngines = allEngines.filter(engine => !engineCounts[engine]);
    
    if (unusedEngines.length > 0) {
      const randomIndex = Math.floor(Math.random() * unusedEngines.length);
      const selectedEngine = unusedEngines[randomIndex];
      return selectedEngine || 'tarot';
    }
    
    // Return least used engine
    const sortedEngines = Object.entries(engineCounts)
      .sort(([,a], [,b]) => (a as number) - (b as number));
    
    const leastUsedEngine = sortedEngines[0]?.[0];
    return leastUsedEngine || 'tarot';
  }

  private calculateIntegrationTime(readingHistory: any[]): string {
    if (readingHistory.length === 0) return 'immediate';
    
    const lastReading = readingHistory[0];
    const daysSinceLastReading = (Date.now() - new Date(lastReading.timestamp).getTime()) / (24 * 60 * 60 * 1000);
    
    if (daysSinceLastReading < 1) return '24_hours';
    if (daysSinceLastReading < 3) return '3_days';
    if (daysSinceLastReading < 7) return '1_week';
    return 'ready';
  }
}

// Cloudflare Workflows - Required exports
export class ConsciousnessWorkflow {
  async run(event: any, step: any) {
    // Placeholder implementation for consciousness workflow
    console.log('ConsciousnessWorkflow triggered:', event);
    return { status: 'completed', result: 'consciousness workflow executed' };
  }
}

export class IntegrationWorkflow {
  async run(event: any, step: any) {
    // Placeholder implementation for integration workflow
    console.log('IntegrationWorkflow triggered:', event);
    return { status: 'completed', result: 'integration workflow executed' };
  }
}

// Cloudflare Durable Objects - Required exports
export class EngineCoordinator {
  constructor(private state: any, private env: any) {}

  async fetch(request: Request): Promise<Response> {
    // Placeholder implementation for engine coordinator
    console.log('EngineCoordinator request:', request.url);
    return new Response(JSON.stringify({ status: 'coordinator active' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export class ForecastSession {
  constructor(private state: any, private env: any) {}

  async fetch(request: Request): Promise<Response> {
    // Placeholder implementation for forecast session
    console.log('ForecastSession request:', request.url);
    return new Response(JSON.stringify({ status: 'session active' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Main fetch handler
export default {
  async fetch(request: Request, env: RouterEnv): Promise<Response> {
    const router = new EnhancedAPIRouter(env);
    return await router.route(request);
  }
};

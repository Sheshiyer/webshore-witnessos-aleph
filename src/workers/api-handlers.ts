/**
 * WitnessOS API Handlers for Cloudflare Workers
 * 
 * Unified API endpoints for all 10 consciousness engines
 * Handles routing, validation, caching, and response formatting
 */

import { createKVDataAccess, CloudflareKVDataAccess } from '../lib/kv-data-access';
import { 
  getEngine, 
  listEngines, 
  calculateEngine,
  isEngineAvailable,
  getEngineMetadata,
  healthCheck
} from '../engines';
import type { EngineName } from '../types/engines';

// Request/Response Types
interface APIRequest {
  method: string;
  url: string;
  headers: Headers;
  body?: any;
}

interface APIResponse {
  status: number;
  headers: Record<string, string>;
  body: any;
}

interface EngineCalculationRequest {
  engine: EngineName;
  input: any;
  options?: {
    useCache?: boolean;
    userId?: string;
    saveProfile?: boolean;
  };
}

interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
  requestId?: string;
}

export class WitnessOSAPIHandler {
  private kvData: CloudflareKVDataAccess;
  private corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };

  constructor(kvBindings: {
    ENGINE_DATA: KVNamespace;
    USER_PROFILES: KVNamespace;
    CACHE: KVNamespace;
  }) {
    this.kvData = createKVDataAccess(kvBindings);
  }

  async handleRequest(request: Request, env: any): Promise<Response> {
    const requestId = crypto.randomUUID();
    
    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return this.createResponse(200, {}, null);
      }

      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;

      console.log(`[${requestId}] ${method} ${path}`);

      // Route to appropriate handler
      if (path === '/health') {
        return await this.handleHealthCheck(requestId);
      }

      if (path === '/engines') {
        return await this.handleEnginesList(requestId);
      }

      if (path.startsWith('/engines/') && path.endsWith('/metadata')) {
        const engineName = path.split('/')[2] as EngineName;
        return await this.handleEngineMetadata(engineName, requestId);
      }

      if (path.startsWith('/engines/') && path.endsWith('/calculate')) {
        const engineName = path.split('/')[2] as EngineName;
        return await this.handleEngineCalculation(engineName, request, requestId);
      }

      if (path.startsWith('/profiles/')) {
        return await this.handleUserProfiles(path, method, request, requestId);
      }

      if (path === '/cache/clear') {
        return await this.handleCacheClear(requestId);
      }

      // Not found
      return this.createErrorResponse(404, 'ENDPOINT_NOT_FOUND', 'API endpoint not found', requestId);

    } catch (error) {
      console.error(`[${requestId}] Unhandled error:`, error);
      return this.createErrorResponse(
        500, 
        'INTERNAL_SERVER_ERROR', 
        'An unexpected error occurred',
        requestId
      );
    }
  }

  // Health Check Handler
  private async handleHealthCheck(requestId: string): Promise<Response> {
    try {
      const [engineHealth, kvHealth] = await Promise.all([
        healthCheck(),
        this.kvData.healthCheck()
      ]);

      const health = {
        status: engineHealth.status === 'healthy' && kvHealth.status === 'healthy' ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        requestId,
        engines: {
          status: engineHealth.status,
          available: engineHealth.engines
        },
        storage: {
          status: kvHealth.status,
          details: kvHealth.details
        }
      };

      return this.createResponse(200, {}, health);
    } catch (error) {
      console.error(`[${requestId}] Health check failed:`, error);
      return this.createErrorResponse(503, 'HEALTH_CHECK_FAILED', 'Health check failed', requestId);
    }
  }

  // Engines List Handler
  private async handleEnginesList(requestId: string): Promise<Response> {
    try {
      const engines = listEngines();
      const engineList = engines.map(name => ({
        name,
        available: isEngineAvailable(name),
        endpoint: `/engines/${name}/calculate`
      }));

      return this.createResponse(200, {}, {
        engines: engineList,
        total: engines.length,
        timestamp: new Date().toISOString(),
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Failed to list engines:`, error);
      return this.createErrorResponse(500, 'ENGINES_LIST_FAILED', 'Failed to retrieve engines list', requestId);
    }
  }

  // Engine Metadata Handler
  private async handleEngineMetadata(engineName: EngineName, requestId: string): Promise<Response> {
    try {
      if (!isEngineAvailable(engineName)) {
        return this.createErrorResponse(404, 'ENGINE_NOT_FOUND', `Engine '${engineName}' not found`, requestId);
      }

      const metadata = getEngineMetadata(engineName);
      
      return this.createResponse(200, {}, {
        ...metadata,
        timestamp: new Date().toISOString(),
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Failed to get engine metadata for ${engineName}:`, error);
      return this.createErrorResponse(500, 'METADATA_FAILED', 'Failed to retrieve engine metadata', requestId);
    }
  }

  // Engine Calculation Handler
  private async handleEngineCalculation(
    engineName: EngineName, 
    request: Request, 
    requestId: string
  ): Promise<Response> {
    try {
      if (!isEngineAvailable(engineName)) {
        return this.createErrorResponse(404, 'ENGINE_NOT_FOUND', `Engine '${engineName}' not found`, requestId);
      }

      if (request.method !== 'POST') {
        return this.createErrorResponse(405, 'METHOD_NOT_ALLOWED', 'Only POST method allowed for calculations', requestId);
      }

      const requestData = await request.json() as EngineCalculationRequest;
      const { input, options = {} } = requestData;

      // Validate input
      if (!input) {
        return this.createErrorResponse(400, 'INVALID_INPUT', 'Input data required', requestId);
      }

      // Check cache if enabled
      let cachedResult = null;
      if (options.useCache !== false) {
        const inputHash = CloudflareKVDataAccess.createInputHash(input);
        cachedResult = await this.kvData.getCached(engineName, inputHash);
        
        if (cachedResult) {
          console.log(`[${requestId}] Cache hit for ${engineName}`);
          return this.createResponse(200, {}, {
            ...cachedResult.data,
            cached: true,
            cachedAt: cachedResult.cachedAt,
            requestId
          });
        }
      }

      // Calculate using engine
      console.log(`[${requestId}] Calculating ${engineName} with input:`, Object.keys(input));
      const result = await calculateEngine(engineName, input);

      // Cache result if enabled
      if (options.useCache !== false && result.confidence > 0.7) {
        const inputHash = CloudflareKVDataAccess.createInputHash(input);
        await this.kvData.setCached(engineName, inputHash, result);
      }

      // Save user profile if requested
      if (options.userId && options.saveProfile) {
        await this.kvData.setUserProfile(options.userId, engineName, {
          input,
          result,
          calculatedAt: new Date().toISOString()
        });
      }

      return this.createResponse(200, {}, {
        ...result,
        cached: false,
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Engine calculation failed for ${engineName}:`, error);
      
      if (error instanceof Error && error.message.includes('validation')) {
        return this.createErrorResponse(400, 'VALIDATION_ERROR', error.message, requestId);
      }
      
      return this.createErrorResponse(500, 'CALCULATION_FAILED', 'Engine calculation failed', requestId);
    }
  }

  // User Profiles Handler
  private async handleUserProfiles(
    path: string, 
    method: string, 
    request: Request, 
    requestId: string
  ): Promise<Response> {
    const pathParts = path.split('/');
    const userId = pathParts[2];
    const engineName = pathParts[3] as EngineName;

    if (!userId) {
      return this.createErrorResponse(400, 'INVALID_USER_ID', 'User ID required', requestId);
    }

    try {
      if (method === 'GET') {
        if (engineName) {
          // Get profile for specific engine
          const profile = await this.kvData.getUserProfile(userId, engineName);
          if (!profile) {
            return this.createErrorResponse(404, 'PROFILE_NOT_FOUND', 'User profile not found', requestId);
          }
          return this.createResponse(200, {}, { profile, requestId });
        } else {
          // List all profiles for user
          const profiles = await this.kvData.listUserProfiles(userId);
          return this.createResponse(200, {}, { profiles, total: profiles.length, requestId });
        }
      }

      if (method === 'DELETE') {
        if (engineName) {
          // Delete specific engine profile
          await this.kvData.clearUserProfiles(userId);
          return this.createResponse(200, {}, { message: 'Profile deleted', requestId });
        } else {
          // Delete all profiles for user
          await this.kvData.clearUserProfiles(userId);
          return this.createResponse(200, {}, { message: 'All profiles deleted', requestId });
        }
      }

      return this.createErrorResponse(405, 'METHOD_NOT_ALLOWED', 'Method not allowed', requestId);

    } catch (error) {
      console.error(`[${requestId}] User profile operation failed:`, error);
      return this.createErrorResponse(500, 'PROFILE_OPERATION_FAILED', 'Profile operation failed', requestId);
    }
  }

  // Cache Clear Handler
  private async handleCacheClear(requestId: string): Promise<Response> {
    try {
      await this.kvData.clearCache();
      return this.createResponse(200, {}, { 
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString(),
        requestId 
      });
    } catch (error) {
      console.error(`[${requestId}] Cache clear failed:`, error);
      return this.createErrorResponse(500, 'CACHE_CLEAR_FAILED', 'Failed to clear cache', requestId);
    }
  }

  // Response Helpers
  private createResponse(status: number, headers: Record<string, string>, body: any): Response {
    return new Response(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...this.corsHeaders,
        ...headers
      }
    });
  }

  private createErrorResponse(
    status: number, 
    error: string, 
    message: string, 
    requestId: string
  ): Response {
    const errorBody: ErrorResponse = {
      error,
      message,
      timestamp: new Date().toISOString(),
      requestId
    };

    return this.createResponse(status, {}, errorBody);
  }
}

// Batch calculation handler for multiple engines
export async function handleBatchCalculation(
  request: Request,
  kvBindings: any,
  requestId: string
): Promise<Response> {
  try {
    interface BatchRequest {
      calculations: Array<{
        engine: EngineName;
        input: any;
        options?: any;
      }>;
      options?: {
        parallel?: boolean;
        userId?: string;
      };
    }

    const batchData = await request.json() as BatchRequest;
    const { calculations, options = {} } = batchData;

    if (!calculations || !Array.isArray(calculations)) {
      return new Response(JSON.stringify({
        error: 'INVALID_BATCH_REQUEST',
        message: 'Calculations array required',
        requestId
      }), { status: 400 });
    }

    const handler = new WitnessOSAPIHandler(kvBindings);
    const results = [];

    if (options.parallel !== false) {
      // Parallel execution
      const promises = calculations.map(async (calc, index) => {
        try {
          const result = await calculateEngine(calc.engine, calc.input);
          return { index, success: true, result };
        } catch (error) {
          return { 
            index, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const batchResults = await Promise.all(promises);
      
      // Sort by original index
      batchResults.sort((a, b) => a.index - b.index);
      results.push(...batchResults);
    } else {
      // Sequential execution
      for (let i = 0; i < calculations.length; i++) {
        const calc = calculations[i];
        try {
          const result = await calculateEngine(calc.engine, calc.input);
          results.push({ index: i, success: true, result });
        } catch (error) {
          results.push({ 
            index: i, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
    }

    return new Response(JSON.stringify({
      results,
      total: calculations.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      executionMode: options.parallel !== false ? 'parallel' : 'sequential',
      timestamp: new Date().toISOString(),
      requestId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(`[${requestId}] Batch calculation failed:`, error);
    return new Response(JSON.stringify({
      error: 'BATCH_CALCULATION_FAILED',
      message: 'Batch calculation failed',
      requestId
    }), { status: 500 });
  }
} 
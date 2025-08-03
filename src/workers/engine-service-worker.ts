/**
 * Engine Service Worker for WitnessOS
 * 
 * Specialized Cloudflare Worker that handles all consciousness engine calculations
 * via RPC (Remote Procedure Call) interface. This service provides type-safe
 * inter-service communication for engine operations.
 */

import {
  getEngine,
  listEngines,
  calculateEngine,
  isEngineAvailable,
  getEngineMetadata,
  healthCheck
} from '../engines';
import type { EngineName } from '../types/engines';
import {
  DEFAULT_TEST_USER,
  getEngineTestInput,
  getAllEngineTestInputs,
  VALIDATION_METADATA
} from '../lib/validation-constants';
import { createKVDataAccess, CloudflareKVDataAccess } from '../lib/kv-data-access';
import { AuthService } from '../lib/auth';
import { WorkerEntrypoint } from 'cloudflare:workers';

// Cloudflare Workers types
declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1ExecResult>;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run(): Promise<D1Result>;
    all<T = unknown>(): Promise<D1Result<T>>;
    raw<T = unknown>(): Promise<T[]>;
  }

  interface D1Result<T = Record<string, unknown>> {
    results: T[];
    success: boolean;
    meta: {
      duration: number;
      size_after: number;
      rows_read: number;
      rows_written: number;
      last_row_id: number;
    };
  }

  interface D1ExecResult {
    count: number;
    duration: number;
  }

  interface KVNamespace {
    get(key: string, options?: { type?: 'text' | 'json' | 'arrayBuffer' | 'stream' }): Promise<any>;
    put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: { expirationTtl?: number; expiration?: number; metadata?: any }): Promise<void>;
    delete(key: string): Promise<void>;
    list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{ keys: { name: string; expiration?: number; metadata?: any }[]; list_complete: boolean; cursor?: string }>;
  }



  interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
  }
}

// Environment interface for this service
interface EngineServiceEnv {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  KV_USER_PROFILES: KVNamespace;
  ENGINE_DATA: KVNamespace;
  ENGINE_CACHE: KVNamespace;
  USER_PROFILES: KVNamespace;
  CACHE: KVNamespace;
  TIMELINE_DATA: KVNamespace;
  SECRETS?: KVNamespace;
  AI_SERVICE?: any; // RPC binding to AI service
  OPENROUTER_API_KEY?: string;
  JWT_SECRET?: string;
}

// RPC method parameter types
interface EngineCalculationParams {
  engineName: EngineName;
  input: any;
  options?: {
    useCache?: boolean;
    userId?: string;
    saveProfile?: boolean;
  };
}

interface EngineValidationParams {
  engineName: EngineName;
  input: any;
}

interface BatchCalculationParams {
  engines: Array<{
    engineName: EngineName;
    input: any;
  }>;
  options?: {
    useCache?: boolean;
    userId?: string;
    saveProfile?: boolean;
  };
}

// RPC response types
interface EngineResult {
  success: boolean;
  data?: any;
  error?: string | undefined;
  metadata?: {
    engineName: string;
    calculationTime: number;
    cached: boolean;
    timestamp: string;
  };
}

interface ValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  metadata?: any;
}

interface BatchResult {
  results: Array<{
    engineName: string;
    success: boolean;
    data?: any;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    cached: number;
  };
}

/**
 * Engine Service Worker - Standard Worker
 *
 * Provides specialized engine calculation services.
 * This worker handles all consciousness engine operations including
 * calculation, validation, metadata retrieval, and batch processing.
 */

/**
 * HTTP fetch handler for direct API access
 * CRITICAL: Preserves exact API endpoints from legacy system
 */
export class EngineService extends WorkerEntrypoint<EngineServiceEnv> {
  constructor(ctx: ExecutionContext, env: EngineServiceEnv) {
    super(ctx, env);
  }

  /**
   * HTTP fetch handler for direct API access
   * CRITICAL: Preserves exact API endpoints from legacy system
   */
  async fetch(request: Request): Promise<Response> {
    const kvData = createKVDataAccess(this.env);
    const authService = new AuthService(this.env.DB, this.env.JWT_SECRET || 'fallback-secret');
    const requestId = crypto.randomUUID();

    // CORS headers (copied exactly from legacy)
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    };

    try {
      // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
      }

      const url = new URL(request.url);
      const pathSegments = url.pathname.split('/').filter(Boolean);

      console.log(`[${requestId}] Engine Service HTTP: ${request.method} ${url.pathname}`);

      // Route to appropriate handler
      if (pathSegments.length === 0 || pathSegments[0] === 'health') {
        return await this.handleHealthCheck(requestId, corsHeaders);
      }

      if (pathSegments[0] === 'list') {
        return await this.handleEnginesList(requestId, corsHeaders);
      }

      if (pathSegments[0] === 'calculate' && pathSegments[1]) {
        const engineName = pathSegments[1] as EngineName;
        return await this.handleEngineCalculation(
          engineName,
          request,
          requestId,
          corsHeaders,
          authService,
          kvData
        );
      }

      if (pathSegments[0] === 'metadata' && pathSegments[1]) {
        const engineName = pathSegments[1] as EngineName;
        return await this.handleEngineMetadata(engineName, requestId, corsHeaders);
      }

      return this.createErrorResponse(404, 'NOT_FOUND', 'Unknown engine service endpoint', requestId, corsHeaders);

    } catch (error) {
      console.error(`[${requestId}] Engine Service error:`, error);
      return this.createErrorResponse(500, 'INTERNAL_ERROR', 'Engine service error', requestId, corsHeaders);
    }
  }

  /**
   * HTTP Handler Methods (MIGRATED FROM legacy api-handlers.ts)
   */

  /**
   * Handle engine health check - MIGRATED FROM api-handlers.ts health check logic
   */
  private async handleHealthCheck(requestId: string, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      const health = await healthCheck();

      return new Response(JSON.stringify({
        status: 'healthy',
        engines: health.engines,
        timestamp: new Date().toISOString(),
        requestId,
        service: 'engine-service'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      return this.createErrorResponse(500, 'HEALTH_CHECK_FAILED', 'Engine health check failed', requestId, corsHeaders);
    }
  }

  /**
   * Handle engines list request - MIGRATED FROM api-handlers.ts:210-212 handleEnginesList
   */
  private async handleEnginesList(requestId: string, corsHeaders: Record<string, string>): Promise<Response> {
    try {
      const engines = listEngines();
      const engineList = engines.map(engineName => ({
        name: engineName,
        available: isEngineAvailable(engineName),
        metadata: isEngineAvailable(engineName) ? getEngineMetadata(engineName) : null
      }));

      return new Response(JSON.stringify({
        success: true,
        engines: engineList,
        count: engines.length,
        timestamp: new Date().toISOString(),
        requestId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      console.error(`[${requestId}] Engine list error:`, error);
      return this.createErrorResponse(500, 'ENGINE_LIST_FAILED', 'Failed to list engines', requestId, corsHeaders);
    }
  }

  /**
   * Handle engine metadata request - MIGRATED FROM api-handlers.ts:214-217 handleEngineMetadata
   */
  private async handleEngineMetadata(
    engineName: EngineName,
    requestId: string,
    corsHeaders: Record<string, string>
  ): Promise<Response> {
    try {
      if (!isEngineAvailable(engineName)) {
        return this.createErrorResponse(404, 'ENGINE_NOT_FOUND', `Engine '${engineName}' not available`, requestId, corsHeaders);
      }

      const metadata = getEngineMetadata(engineName);

      return new Response(JSON.stringify({
        success: true,
        engine: engineName,
        metadata,
        timestamp: new Date().toISOString(),
        requestId
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    } catch (error) {
      console.error(`[${requestId}] Engine metadata error:`, error);
      return this.createErrorResponse(500, 'METADATA_FAILED', 'Failed to get engine metadata', requestId, corsHeaders);
    }
  }

  /**
   * Handle engine calculation request - MIGRATED FROM api-handlers.ts:219-222 handleEngineCalculation
   * CRITICAL: Preserves exact calculation logic without modifications
   */
  private async handleEngineCalculation(
    engineName: EngineName,
    request: Request,
    requestId: string,
    corsHeaders: Record<string, string>,
    authService: AuthService,
    kvData: CloudflareKVDataAccess
  ): Promise<Response> {
    try {
      // Validate engine availability
      if (!isEngineAvailable(engineName)) {
        return this.createErrorResponse(404, 'ENGINE_NOT_FOUND', `Engine '${engineName}' not available`, requestId, corsHeaders);
      }

      // Authentication (EXACT COPY from legacy api-handlers.ts:5294-5313)
      const authResult = await this.authenticateRequest(request, authService);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for engine calculation', requestId, corsHeaders);
      }

      // Get request body
      const body = await request.json();
      const { input, config } = body;

      if (!input) {
        return this.createErrorResponse(400, 'MISSING_INPUT', 'Engine input required', requestId, corsHeaders);
      }

      // Add user context to input (preserving legacy behavior)
      const enhancedInput = {
        ...input,
        userId: authResult.user.id?.toString(),
        sessionId: requestId,
        timestamp: new Date().toISOString()
      };

      console.log(`[${requestId}] Calculating ${engineName} engine for user ${authResult.user.id}`);

      // Execute engine calculation via Railway Python backend
      const startTime = Date.now();
      const result = await this.callRailwayEngine(engineName, enhancedInput, config);
      const calculationTime = Date.now() - startTime;

      // Log calculation for debugging (preserving legacy logging)
      console.log(`[${requestId}] ${engineName} calculation completed in ${calculationTime}ms, success: ${result.success}`);

      // Return result with exact format from legacy system
      return new Response(JSON.stringify({
        success: result.success,
        engine: engineName,
        data: result.data,
        error: result.error ? String(result.error) : undefined,
        metadata: {
          requestId,
          calculationTime,
          timestamp: result.timestamp,
          service: 'engine-service',
          version: '2.0'
        }
      }), {
        status: result.success ? 200 : 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });

    } catch (error) {
      console.error(`[${requestId}] Engine calculation error for ${engineName}:`, error);
      return this.createErrorResponse(500, 'CALCULATION_FAILED', `${engineName} calculation failed`, requestId, corsHeaders);
    }
  }

  /**
   * Authenticate request - EXACT COPY from api-handlers.ts:5294-5313
   * CRITICAL: No modifications to preserve authentication behavior
   */
  private async authenticateRequest(
    request: Request,
    authService: AuthService
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'Missing or invalid authorization token' };
      }

      const token = authHeader.slice(7);
      const validation = await authService.validateToken(token);

      if (!validation.valid || !validation.user) {
        return { success: false, error: validation.error || 'Invalid token' };
      }

      return { success: true, user: validation.user };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Call Railway Python engine backend directly
   */
  private async callRailwayEngine(engineName: string, input: any, config?: any): Promise<any> {
    try {
      const railwayUrl = 'https://webshore-witnessos-aleph-production.up.railway.app';
      const response = await fetch(`${railwayUrl}/engines/${engineName}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'WitnessOS-EngineService/1.0'
        },
        body: JSON.stringify({ input, config })
      });

      if (!response.ok) {
        throw new Error(`Railway API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Railway engine ${engineName} error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Railway engine calculation failed'
      };
    }
  }

  /**
   * Create error response - preserving legacy error format
   */
  private createErrorResponse(
    status: number,
    code: string,
    message: string,
    requestId: string,
    corsHeaders: Record<string, string>
  ): Response {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code,
        message,
        requestId,
        timestamp: new Date().toISOString(),
        service: 'engine-service'
      }
    }), {
      status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  /**
   * RPC Methods (Existing functionality preserved)
   */

  /**
   * Calculate a single consciousness engine
   *
   * @param params - Engine calculation parameters
   * @returns Promise<EngineResult> - Calculation result with metadata
   */
  async calculateEngine(params: EngineCalculationParams): Promise<EngineResult> {
    const startTime = Date.now();
    const { engineName, input, options = {} } = params;

    try {
      // Check if engine is available
      if (!isEngineAvailable(engineName)) {
        return {
          success: false,
          error: `Engine '${engineName}' is not available`,
          metadata: {
            engineName,
            calculationTime: Date.now() - startTime,
            cached: false,
            timestamp: new Date().toISOString()
          }
        };
      }

      // Check cache if enabled
      let cached = false;
      if (options.useCache && options.userId) {
        const cacheKey = `engine:${engineName}:${options.userId}:${JSON.stringify(input)}`;
        const cachedResult = await this.env.KV_CACHE.get(cacheKey);
        
        if (cachedResult) {
          cached = true;
          return {
            success: true,
            data: JSON.parse(cachedResult),
            metadata: {
              engineName,
              calculationTime: Date.now() - startTime,
              cached: true,
              timestamp: new Date().toISOString()
            }
          };
        }
      }

      // Perform calculation
      // CRITICAL: Pass D1 database for Swiss Ephemeris calculations
      const result = await calculateEngine(engineName, input, undefined, this.env.DB);

      // Cache result if enabled
      if (options.useCache && options.userId && result.success) {
        const cacheKey = `engine:${engineName}:${options.userId}:${JSON.stringify(input)}`;
        await this.env.KV_CACHE.put(
          cacheKey, 
          JSON.stringify(result.data),
          { expirationTtl: 3600 } // 1 hour cache
        );
      }

      // Save to user profile if requested
      if (options.saveProfile && options.userId && result.success) {
        await this.saveToUserProfile(options.userId, engineName, result.data);
      }

      return {
        success: result.success,
        data: result.data,
        ...(result.error && { error: String(result.error) }),
        metadata: {
          engineName,
          calculationTime: Date.now() - startTime,
          cached,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error(`Engine calculation error for ${engineName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown calculation error',
        metadata: {
          engineName,
          calculationTime: Date.now() - startTime,
          cached: false,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Validate engine input parameters
   * 
   * @param params - Validation parameters
   * @returns Promise<ValidationResult> - Validation result
   */
  async validateEngine(params: EngineValidationParams): Promise<ValidationResult> {
    const { engineName, input } = params;

    try {
      // Check if engine exists
      if (!isEngineAvailable(engineName)) {
        return {
          valid: false,
          errors: [`Engine '${engineName}' is not available`]
        };
      }

      // Get validation metadata for the engine
      const validationMeta = (VALIDATION_METADATA as any)[engineName];
      if (!validationMeta) {
        return {
          valid: false,
          errors: [`No validation rules found for engine '${engineName}'`]
        };
      }

      // Perform validation
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate required fields
      for (const field of validationMeta.required) {
        if (!input[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      }

      // Validate field types and formats
      for (const [field, rules] of Object.entries(validationMeta.fields || {})) {
        const fieldRules = rules as any;
        if (input[field] !== undefined) {
          // Type validation
          if (fieldRules.type && typeof input[field] !== fieldRules.type) {
            errors.push(`Field '${field}' must be of type ${fieldRules.type}`);
          }

          // Format validation (e.g., date format, email format)
          if (fieldRules.format && !this.validateFormat(input[field], fieldRules.format)) {
            errors.push(`Field '${field}' has invalid format. Expected: ${fieldRules.format}`);
          }

          // Range validation
          if (fieldRules.min !== undefined && input[field] < fieldRules.min) {
            errors.push(`Field '${field}' must be >= ${fieldRules.min}`);
          }
          if (fieldRules.max !== undefined && input[field] > fieldRules.max) {
            errors.push(`Field '${field}' must be <= ${fieldRules.max}`);
          }
        }
      }

      return {
        valid: errors.length === 0,
        ...(errors.length > 0 && { errors }),
        ...(warnings.length > 0 && { warnings }),
        metadata: validationMeta
      };

    } catch (error) {
      console.error(`Engine validation error for ${engineName}:`, error);
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : 'Unknown validation error']
      };
    }
  }

  /**
   * Get engine metadata and information
   * 
   * @param engineName - Name of the engine
   * @returns Promise<any> - Engine metadata
   */
  async getEngineMetadata(engineName: EngineName): Promise<any> {
    try {
      return await getEngineMetadata(engineName);
    } catch (error) {
      console.error(`Error getting metadata for ${engineName}:`, error);
      throw new Error(`Failed to get metadata for engine '${engineName}'`);
    }
  }

  /**
   * List all available engines
   * 
   * @returns Promise<any[]> - List of available engines with metadata
   */
  async listEngines(): Promise<any[]> {
    try {
      return await listEngines();
    } catch (error) {
      console.error('Error listing engines:', error);
      throw new Error('Failed to list available engines');
    }
  }

  /**
   * Batch calculate multiple engines
   * 
   * @param params - Batch calculation parameters
   * @returns Promise<BatchResult> - Batch calculation results
   */
  async batchCalculate(params: BatchCalculationParams): Promise<BatchResult> {
    const { engines, options = {} } = params;
    const results: BatchResult['results'] = [];
    let successful = 0;
    let failed = 0;
    let cached = 0;

    // Process engines in parallel
    const promises = engines.map(async ({ engineName, input }) => {
      const result = await this.calculateEngine({
        engineName,
        input,
        options
      });

      if (result.success) {
        successful++;
        if (result.metadata?.cached) cached++;
      } else {
        failed++;
      }

      return {
        engineName,
        success: result.success,
        data: result.data,
        ...(result.error && { error: String(result.error) })
      };
    });

    const calculationResults = await Promise.all(promises);
    results.push(...calculationResults);

    return {
      results,
      summary: {
        total: engines.length,
        successful,
        failed,
        cached
      }
    };
  }

  /**
   * Health check for the engine service
   * 
   * @returns Promise<any> - Health status
   */
  async healthCheck(): Promise<any> {
    try {
      return await healthCheck();
    } catch (error) {
      console.error('Engine service health check failed:', error);
      throw new Error('Engine service health check failed');
    }
  }

  /**
   * Get test input for engine validation
   * 
   * @param engineName - Name of the engine
   * @returns Promise<any> - Test input data
   */
  async getTestInput(engineName: EngineName): Promise<any> {
    try {
      return getEngineTestInput(engineName);
    } catch (error) {
      console.error(`Error getting test input for ${engineName}:`, error);
      throw new Error(`Failed to get test input for engine '${engineName}'`);
    }
  }

  /**
   * Private helper methods
   */

  private async saveToUserProfile(userId: string, engineName: string, data: any): Promise<void> {
    try {
      const profileKey = `profile:${userId}:${engineName}`;
      await this.env.KV_USER_PROFILES.put(profileKey, JSON.stringify({
        engineName,
        data,
        timestamp: new Date().toISOString(),
        userId
      }));
    } catch (error) {
      console.error(`Failed to save ${engineName} to user profile:`, error);
      // Don't throw - profile saving is not critical
    }
  }

  private validateFormat(value: any, format: string): boolean {
    switch (format) {
      case 'date':
        return !isNaN(Date.parse(value));
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'time':
        return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
      default:
        return true; // Unknown format, assume valid
    }
  }
}

// Export the service as default
export default EngineService;

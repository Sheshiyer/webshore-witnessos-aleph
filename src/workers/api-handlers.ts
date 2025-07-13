/**
 * WitnessOS API Handlers for Cloudflare Workers
 * 
 * Unified API endpoints for all 10 consciousness engines
 * Handles routing, validation, caching, and response formatting
 */

import { createKVDataAccess, CloudflareKVDataAccess } from '../lib/kv-data-access';
import { AuthService } from '../lib/auth';
import {
  getEngine,
  listEngines,
  calculateEngine,
  isEngineAvailable,
  getEngineMetadata,
  healthCheck
} from '../engines';
import type { EngineName } from '../types/engines';
import { createAIInterpreter, AIInterpretationConfig, AIInterpreter } from '../lib/ai-interpreter';
import {
  DEFAULT_TEST_USER,
  getEngineTestInput,
  getAllEngineTestInputs,
  VALIDATION_METADATA
} from '../lib/validation-constants';

// Type declarations for Cloudflare Workers
interface KVNamespace {
  get(key: string, options?: any): Promise<any>;
  put(key: string, value: string, options?: any): Promise<void>;
}

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
  private kvData: any; // CloudflareKVDataAccess - simplified for now
  private authService: AuthService;
  private aiInterpreter?: any; // Will be initialized if OpenRouter API key is available
  private corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  };

  constructor(kvBindings: any, db: any, jwtSecret: string, openRouterApiKey?: string) {
    console.log('🔧 Initializing WitnessOSAPIHandler');
    console.log('📊 Database provided:', !!db);
    console.log('🔑 JWT Secret provided:', !!jwtSecret);
    console.log('🤖 OpenRouter API Key provided:', !!openRouterApiKey);
    
    this.kvData = createKVDataAccess(kvBindings);
    this.authService = new AuthService(db, jwtSecret);
    
    // AI interpreter will be initialized lazily from KV secrets
    this.aiInterpreter = null;
    
    console.log('✅ WitnessOSAPIHandler initialized successfully');
  }

  /**
   * Initialize AI interpreter from KV secrets
   */
  private async initializeAIInterpreter(): Promise<AIInterpreter | null> {
    if (this.aiInterpreter) {
      return this.aiInterpreter;
    }

    try {
      this.aiInterpreter = await AIInterpreter.createFromSecrets(this.kvData);
      return this.aiInterpreter;
    } catch (error) {
      console.warn('⚠️ Failed to initialize AI interpreter from secrets:', error);
      return null;
    }
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

      if (path.startsWith('/engines/') && path.endsWith('/ai-enhanced')) {
        const engineName = path.split('/')[2] as EngineName;
        return await this.handleAIEnhancedCalculation(engineName, request, requestId);
      }

      if (path === '/ai/synthesis' && method === 'POST') {
        return await this.handleAISynthesis(request, requestId);
      }

      if (path === '/workflows/natal' && method === 'POST') {
        return await this.handleNatalWorkflow(request, requestId);
      }

      if (path === '/workflows/career' && method === 'POST') {
        return await this.handleCareerWorkflow(request, requestId);
      }

      if (path === '/workflows/spiritual' && method === 'POST') {
        return await this.handleSpiritualWorkflow(request, requestId);
      }

      // Validation endpoints for engine testing
      if (path === '/validate/engines' && method === 'GET') {
        return await this.handleValidateAllEngines(requestId);
      }

      if (path.startsWith('/validate/engines/') && method === 'GET') {
        const engineName = path.split('/')[3] as EngineName;
        return await this.handleValidateEngine(engineName, requestId);
      }

      if (path === '/validate/user' && method === 'GET') {
        return await this.handleValidateUser(requestId);
      }

      if (path === '/workflows/shadow' && method === 'POST') {
        return await this.handleShadowWorkflow(request, requestId);
      }

      if (path === '/workflows/relationships' && method === 'POST') {
        return await this.handleRelationshipWorkflow(request, requestId);
      }

      if (path === '/workflows/daily' && method === 'POST') {
        return await this.handleDailyWorkflow(request, requestId);
      }

      if (path === '/workflows/custom' && method === 'POST') {
        return await this.handleCustomWorkflow(request, requestId);
      }

      if (path.startsWith('/profiles/')) {
        return await this.handleUserProfiles(path, method, request, requestId);
      }

      // Consciousness Profile endpoints
      if (path === '/api/consciousness-profile' && method === 'POST') {
        return await this.handleUploadConsciousnessProfile(request, requestId);
      }

      if (path === '/api/consciousness-profile' && method === 'GET') {
        return await this.handleGetConsciousnessProfile(request, requestId);
      }

      if (path === '/api/consciousness-profile' && method === 'DELETE') {
        return await this.handleDeleteConsciousnessProfile(request, requestId);
      }

      if (path === '/cache/clear') {
        return await this.handleCacheClear(requestId);
      }

      // Authentication endpoints
      if (path === '/auth/register' && method === 'POST') {
        return await this.handleUserRegistration(request, requestId);
      }

      if (path === '/auth/login' && method === 'POST') {
        return await this.handleUserLogin(request, requestId);
      }

      if (path === '/auth/logout' && method === 'POST') {
        return await this.handleUserLogout(request, requestId);
      }

      if (path === '/auth/me' && method === 'GET') {
        return await this.handleGetCurrentUser(request, requestId);
      }

      if (path === '/auth/reset-password' && method === 'POST') {
        return await this.handlePasswordReset(request, requestId);
      }

      if (path === '/auth/request-reset' && method === 'POST') {
        return await this.handlePasswordResetRequest(request, requestId);
      }

      // Admin endpoints
      if (path.match(/^\/admin\/users\/[^\/]+$/) && method === 'DELETE') {
        const emailParam = path.split('/')[3];
        if (!emailParam) {
          return this.createErrorResponse(400, 'INVALID_EMAIL', 'Email parameter required', requestId);
        }
        const email = decodeURIComponent(emailParam);
        return await this.handleAdminDeleteUser(email, request, requestId);
      }

      // Correlation and insights endpoints
      if (path === '/api/readings/correlation' && method === 'GET') {
        return await this.handleReadingCorrelation(request, requestId);
      }

      if (path === '/api/readings/insights' && method === 'GET') {
        return await this.handleReadingInsights(request, requestId);
      }

      // Reading History Management
      if (path === '/api/readings' && method === 'POST') {
        return await this.handleSaveReading(request, requestId);
      }

      if (path === '/api/readings/history' && method === 'GET') {
        return await this.handleReadingHistory(request, requestId);
      }

      if (path.match(/^\/api\/readings\/[^\/]+$/) && method === 'GET') {
        const readingId = path.split('/')[3];
        if (readingId) {
          return await this.handleGetReading(readingId, requestId);
        }
      }

      if (path.match(/^\/api\/readings\/[^\/]+$/) && method === 'DELETE') {
        const readingId = path.split('/')[3];
        if (readingId) {
          return await this.handleDeleteReading(readingId, request, requestId);
        }
      }

      if (path.match(/^\/api\/readings\/[^\/]+\/favorite$/) && method === 'PUT') {
        const readingId = path.split('/')[3];
        if (readingId) {
          return await this.handleToggleFavorite(readingId, request, requestId);
        }
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

      // Calculate using engine with verbose logging
      console.log(`🚀 [${requestId}] Starting ${engineName} calculation`);
      console.log(`📥 [${requestId}] Input keys:`, Object.keys(input));
      console.log(`📊 [${requestId}] Input size:`, JSON.stringify(input).length, 'bytes');
      
      // Enable verbose logging for engines
      const engineConfig = {
        requestId,
        verboseLogging: true,
        debugMode: process.env.NODE_ENV === 'development',
        enableLogging: true
      };
      
      const calculationStart = Date.now();
      const result = await calculateEngine(engineName, input, engineConfig);
      const calculationTime = Date.now() - calculationStart;
      
      console.log(`⏱️ [${requestId}] ${engineName} calculation completed in ${calculationTime}ms`);
      console.log(`📤 [${requestId}] Result success:`, result.success);
      
      if (result.success && result.data) {
        console.log(`📋 [${requestId}] Output keys:`, Object.keys(result.data));
        console.log(`📊 [${requestId}] Output size:`, JSON.stringify(result.data).length, 'bytes');
        console.log(`🎯 [${requestId}] Confidence score:`, (result.data as any).confidenceScore);
      } else if (result.error) {
        console.error(`❌ [${requestId}] Engine error:`, result.error);
      }

      // Cache result if enabled
      if (options.useCache !== false && result.success && result.data && (result.data as any).confidenceScore > 0.7) {
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

  // AI-Enhanced Calculation Handler
  private async handleAIEnhancedCalculation(
    engineName: EngineName,
    request: Request,
    requestId: string
  ): Promise<Response> {
    const startTime = Date.now();
    
    // Initialize AI interpreter from KV secrets
    const aiInterpreter = await this.initializeAIInterpreter();
    if (!aiInterpreter) {
      console.log(`❌ [${requestId}] AI service not available for ${engineName}`);
      return this.createErrorResponse(503, 'AI_NOT_AVAILABLE', 'AI interpretation service not available', requestId);
    }

    try {
      const body = await request.json();
      const { input, options = {}, aiConfig = {} } = body;

      console.log(`🤖 [${requestId}] AI-Enhanced calculation for ${engineName}`);
      console.log(`📥 [${requestId}] Input keys:`, Object.keys(input));
      console.log(`📊 [${requestId}] Input size:`, JSON.stringify(input).length, 'bytes');
      console.log(`⚙️ [${requestId}] AI Config:`, {
        model: aiConfig.model || 'default',
        maxTokens: aiConfig.maxTokens || 'default',
        temperature: aiConfig.temperature || 'default',
        focusArea: aiConfig.focusArea || options.focusArea || 'general'
      });

      if (!input) {
        console.error(`❌ [${requestId}] Missing input data`);
        return this.createErrorResponse(400, 'MISSING_INPUT', 'Input data required', requestId);
      }

      // First perform the regular engine calculation with verbose logging
      const engineCalculationStart = Date.now();
      console.log(`🚀 [${requestId}] Starting base ${engineName} calculation`);
      
      const engineConfig = {
        requestId,
        verboseLogging: true,
        debugMode: process.env.NODE_ENV === 'development',
        enableLogging: true
      };
      
      const engineResult = await calculateEngine(engineName, input, engineConfig);
      const engineCalculationTime = Date.now() - engineCalculationStart;
      
      console.log(`⏱️ [${requestId}] Base calculation completed in ${engineCalculationTime}ms`);

      if (!engineResult.success) {
        console.error(`❌ [${requestId}] Engine calculation failed:`, engineResult.error);
        return this.createErrorResponse(500, 'ENGINE_CALCULATION_FAILED', 'Engine calculation failed', requestId);
      }

      console.log(`✅ [${requestId}] Base calculation successful, starting AI enhancement`);
      console.log(`📋 [${requestId}] Engine result keys:`, Object.keys(engineResult.data || {}));

      // Extract user context from input
      const userContext = {
        name: input.name || input.fullName,
        birthDate: input.birthDate,
        focusArea: aiConfig.focusArea || options.focusArea
      };
      
      console.log(`👤 [${requestId}] User context:`, {
        hasName: !!userContext.name,
        hasBirthDate: !!userContext.birthDate,
        focusArea: userContext.focusArea || 'general'
      });

      // Enhance with AI interpretation
      const aiEnhancementStart = Date.now();
      console.log(`🧠 [${requestId}] Starting AI interpretation`);
      
      if (!engineResult.data) {
        console.error(`❌ [${requestId}] Engine result data is missing`);
        return this.createErrorResponse(500, 'ENGINE_DATA_MISSING', 'Engine calculation returned no data', requestId);
      }

      const aiInterpretation = await aiInterpreter.enhanceReading(
        engineName,
        engineResult.data,
        {
          model: aiConfig.model,
          maxTokens: aiConfig.maxTokens,
          temperature: aiConfig.temperature,
          userContext
        }
      );
      
      const aiEnhancementTime = Date.now() - aiEnhancementStart;
      console.log(`🧠 [${requestId}] AI enhancement completed in ${aiEnhancementTime}ms`);
      console.log(`📤 [${requestId}] AI interpretation size:`, JSON.stringify(aiInterpretation).length, 'bytes');

      // Extract AI metadata for response
      const { modelUsed, attemptedModels, modelSwitches, ...interpretationData } = aiInterpretation;
      
      const response = {
        engine: engineName,
        calculation: engineResult,
        aiInterpretation: interpretationData,
        cached: false,
        requestId,
        timestamp: new Date().toISOString(),
        metadata: {
          timings: {
            engineCalculation: engineCalculationTime,
            aiEnhancement: aiEnhancementTime,
            total: Date.now() - startTime
          },
          ai: {
            modelUsed,
            attemptedModels,
            modelSwitches,
            timestamp: new Date().toISOString()
          }
        }
      };
      
      const totalTime = Date.now() - startTime;
      console.log(`🎯 [${requestId}] AI-enhanced calculation completed successfully in ${totalTime}ms`);
      console.log(`📊 [${requestId}] Total response size:`, JSON.stringify(response).length, 'bytes');

      return this.createResponse(200, {}, response);

    } catch (error) {
      const totalTime = Date.now() - startTime;
      console.error(`❌ [${requestId}] AI-enhanced calculation failed for ${engineName} after ${totalTime}ms:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return this.createErrorResponse(500, 'AI_CALCULATION_FAILED', 'AI-enhanced calculation failed', requestId);
    }
  }

  // AI Multi-Engine Synthesis Handler
  private async handleAISynthesis(request: Request, requestId: string): Promise<Response> {
    // Initialize AI interpreter from KV secrets
    const aiInterpreter = await this.initializeAIInterpreter();
    if (!aiInterpreter) {
      return this.createErrorResponse(503, 'AI_NOT_AVAILABLE', 'AI interpretation service not available', requestId);
    }

    try {
      const body = await request.json();
      const { readings, aiConfig = {} } = body;

      if (!readings || !Array.isArray(readings) || readings.length === 0) {
        return this.createErrorResponse(400, 'MISSING_READINGS', 'Readings array required', requestId);
      }

      console.log(`[${requestId}] AI synthesis for ${readings.length} readings`);

      // Validate readings structure
      const validReadings = readings.filter(r => r.engine && r.data);
      if (validReadings.length === 0) {
        return this.createErrorResponse(400, 'INVALID_READINGS', 'No valid readings provided', requestId);
      }

      // Extract user context
      const userContext = {
        name: aiConfig.name,
        birthDate: aiConfig.birthDate,
        focusArea: aiConfig.focusArea
      };

      // Generate AI synthesis
      const synthesis = await aiInterpreter.synthesizeMultipleReadings(
        validReadings,
        {
          model: aiConfig.model,
          maxTokens: aiConfig.maxTokens || 2000,
          temperature: aiConfig.temperature || 0.8,
          userContext
        }
      );

      // Extract AI metadata for response
      const { modelUsed, attemptedModels, modelSwitches, ...synthesisData } = synthesis;

      const response = {
        synthesis: synthesisData,
        readingsCount: validReadings.length,
        engines: validReadings.map(r => r.engine),
        requestId,
        timestamp: new Date().toISOString(),
        metadata: {
          ai: {
            modelUsed,
            attemptedModels,
            modelSwitches,
            timestamp: new Date().toISOString()
          }
        }
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] AI synthesis failed:`, error);
      return this.createErrorResponse(500, 'AI_SYNTHESIS_FAILED', 'AI synthesis failed', requestId);
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

  // Authentication Handlers
  private async handleUserRegistration(request: Request, requestId: string): Promise<Response> {
    try {
      console.log(`[${requestId}] Starting user registration`);
      
      // Parse request body
      let body;
      try {
        body = await request.json();
        console.log(`[${requestId}] Request body parsed:`, { 
          email: body.email ? 'provided' : 'missing',
          password: body.password ? 'provided' : 'missing',
          name: body.name ? 'provided' : 'missing'
        });
      } catch (parseError) {
        console.error(`[${requestId}] Failed to parse request body:`, parseError);
        return this.createErrorResponse(400, 'INVALID_JSON', 'Invalid JSON in request body', requestId);
      }

      const { email, password, name } = body;

      // Validate required fields
      if (!email || !password) {
        console.log(`[${requestId}] Missing required fields - email: ${!!email}, password: ${!!password}`);
        return this.createErrorResponse(400, 'MISSING_FIELDS', 'Email and password are required', requestId);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        console.log(`[${requestId}] Invalid email format: ${email}`);
        return this.createErrorResponse(400, 'INVALID_EMAIL', 'Invalid email format', requestId);
      }

      // Validate password length
      if (password.length < 6) {
        console.log(`[${requestId}] Password too short: ${password.length} characters`);
        return this.createErrorResponse(400, 'WEAK_PASSWORD', 'Password must be at least 6 characters long', requestId);
      }

      console.log(`[${requestId}] Calling authService.register for email: ${email}`);
      
      // Attempt registration
      const result = await this.authService.register(email, password, name);
      
      console.log(`[${requestId}] Registration result:`, {
        success: result.success,
        error: result.error,
        hasUser: !!result.user
      });
      
      if (!result.success) {
        console.error(`[${requestId}] Registration failed:`, result.error);
        return this.createErrorResponse(400, 'REGISTRATION_FAILED', result.error || 'Registration failed', requestId);
      }

      console.log(`[${requestId}] User registered successfully: ${email}`);
      return this.createResponse(201, {}, {
        message: 'User registered successfully',
        user: result.user,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Registration error:`, error);
      console.error(`[${requestId}] Error stack:`, error instanceof Error ? error.stack : 'No stack trace');
      return this.createErrorResponse(500, 'REGISTRATION_ERROR', 'Registration failed', requestId);
    }
  }

  private async handleUserLogin(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return this.createErrorResponse(400, 'MISSING_CREDENTIALS', 'Email and password are required', requestId);
      }

      const userAgent = request.headers.get('User-Agent');
      const deviceInfo = {
        userAgent,
        ip: request.headers.get('CF-Connecting-IP'),
        timestamp: new Date().toISOString()
      };

      const result = await this.authService.login(email, password, deviceInfo);
      
      if (!result.success) {
        return this.createErrorResponse(401, 'LOGIN_FAILED', result.error || 'Invalid credentials', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Login successful',
        token: result.token,
        user: result.user,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Login error:`, error);
      return this.createErrorResponse(500, 'LOGIN_ERROR', 'Login failed', requestId);
    }
  }

  private async handleUserLogout(request: Request, requestId: string): Promise<Response> {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'MISSING_TOKEN', 'Authorization token required', requestId);
      }

      const token = authHeader.slice(7);
      const result = await this.authService.logout(token);
      
      if (!result.success) {
        return this.createErrorResponse(400, 'LOGOUT_FAILED', result.error || 'Logout failed', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Logout successful',
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Logout error:`, error);
      return this.createErrorResponse(500, 'LOGOUT_ERROR', 'Logout failed', requestId);
    }
  }

  private async handleGetCurrentUser(request: Request, requestId: string): Promise<Response> {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'MISSING_TOKEN', 'Authorization token required', requestId);
      }

      const token = authHeader.slice(7);
      const result = await this.authService.validateToken(token);
      
      if (!result.valid) {
        return this.createErrorResponse(401, 'INVALID_TOKEN', result.error || 'Invalid token', requestId);
      }

      return this.createResponse(200, {}, {
        user: result.user,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Get current user error:`, error);
      return this.createErrorResponse(500, 'AUTH_ERROR', 'Authentication failed', requestId);
    }
  }

  private async handlePasswordResetRequest(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { email } = body;

      if (!email) {
        return this.createErrorResponse(400, 'MISSING_EMAIL', 'Email is required', requestId);
      }

      const result = await this.authService.generatePasswordResetToken(email);
      
      if (!result.success) {
        return this.createErrorResponse(400, 'RESET_REQUEST_FAILED', result.error || 'Failed to generate reset token', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Password reset token generated',
        token: result.token || 'Token generated but not returned for security',
        timestamp: new Date().toISOString(),
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Password reset request error:`, error);
      return this.createErrorResponse(500, 'RESET_REQUEST_FAILED', 'Password reset request failed', requestId);
    }
  }

  private async handlePasswordReset(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { email, newPassword, resetToken } = body;

      if (!email || !newPassword || !resetToken) {
        return this.createErrorResponse(400, 'MISSING_FIELDS', 'Email, new password, and reset token are required', requestId);
      }

      const result = await this.authService.resetPassword(resetToken, newPassword);
      
      if (!result) {
        return this.createErrorResponse(400, 'INVALID_TOKEN', 'Invalid or expired reset token', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Password reset successfully',
        timestamp: new Date().toISOString(),
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Password reset failed:`, error);
      return this.createErrorResponse(500, 'PASSWORD_RESET_FAILED', 'Password reset failed', requestId);
    }
  }

  private async handleAdminDeleteUser(email: string, request: Request, requestId: string): Promise<Response> {
    try {
      // Check admin authentication
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Admin authentication required', requestId);
      }

      const token = authHeader.slice(7);
      const adminValidation = await this.authService.validateAdminToken(token);
      
      if (!adminValidation.valid || !adminValidation.isAdmin) {
        return this.createErrorResponse(403, 'FORBIDDEN', 'Admin access required', requestId);
      }

      if (!email) {
        return this.createErrorResponse(400, 'MISSING_EMAIL', 'Email is required', requestId);
      }

      const result = await this.authService.deleteUser(email);
      
      if (!result.success) {
        return this.createErrorResponse(400, 'DELETE_FAILED', result.error || 'User deletion failed', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'User deleted successfully',
        email,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Admin delete user error:`, error);
      return this.createErrorResponse(500, 'DELETE_ERROR', 'User deletion failed', requestId);
    }
  }

  // Workflow Handlers
  private async handleNatalWorkflow(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { userProfile } = body;

      if (!userProfile || !userProfile.fullName || !userProfile.birthDate) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'Full name and birth date required for natal workflow', requestId);
      }

      // Execute natal workflow with core engines
      const calculations = [
        { engine: 'numerology' as const, input: { fullName: userProfile.fullName, birthDate: userProfile.birthDate, system: 'pythagorean' } },
        { engine: 'human_design' as const, input: { fullName: userProfile.fullName, birthDate: userProfile.birthDate, birthTime: userProfile.birthTime || '12:00', birthLocation: userProfile.birthLocation || [0, 0], timezone: userProfile.timezone || 'UTC' } },
        { engine: 'vimshottari' as const, input: { birthDate: userProfile.birthDate, birthTime: userProfile.birthTime || '12:00', birthLocation: userProfile.birthLocation || [0, 0] } }
      ];

      const results = await Promise.all(
        calculations.map(async calc => {
          try {
            const result = await calculateEngine(calc.engine, calc.input);
            return { engine: calc.engine, success: true, data: result };
          } catch (error) {
            return { engine: calc.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      const response = {
        workflowType: 'natal',
        results,
        synthesis: 'Complete natal consciousness profile combining numerology, human design, and karmic timing',
        requestId,
        timestamp: new Date().toISOString()
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Natal workflow failed:`, error);
      return this.createErrorResponse(500, 'NATAL_WORKFLOW_FAILED', 'Natal workflow calculation failed', requestId);
    }
  }

  private async handleCareerWorkflow(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { userProfile, focusArea } = body;

      if (!userProfile || !userProfile.fullName) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile required for career workflow', requestId);
      }

      // Execute career-focused workflow
      const calculations = [
        { engine: 'numerology' as const, input: { fullName: userProfile.fullName, birthDate: userProfile.birthDate, system: 'pythagorean' } },
        { engine: 'enneagram' as const, input: { identificationMethod: 'intuitive', selectedType: 1, includeWings: true, includeArrows: true, includeInstincts: true } },
        { engine: 'tarot' as const, input: { question: `What career path aligns with my highest potential?`, spreadType: 'three_card', focusArea: 'career' } }
      ];

      const results = await Promise.all(
        calculations.map(async calc => {
          try {
            const result = await calculateEngine(calc.engine, calc.input);
            return { engine: calc.engine, success: true, data: result };
          } catch (error) {
            return { engine: calc.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      const response = {
        workflowType: 'career',
        focusArea: focusArea || 'general',
        results,
        synthesis: 'Career guidance combining life path numerology, personality patterns, and intuitive guidance',
        requestId,
        timestamp: new Date().toISOString()
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Career workflow failed:`, error);
      return this.createErrorResponse(500, 'CAREER_WORKFLOW_FAILED', 'Career workflow calculation failed', requestId);
    }
  }

  private async handleSpiritualWorkflow(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { userProfile, intention } = body;

      if (!userProfile || !intention) {
        return this.createErrorResponse(400, 'MISSING_DATA', 'User profile and spiritual intention required', requestId);
      }

      // Execute spiritual development workflow
      const calculations = [
        { engine: 'gene_keys' as const, input: { birthDate: userProfile.birthDate, birthTime: userProfile.birthTime || '12:00', includeActivationSequence: true } },
        { engine: 'iching' as const, input: { question: `What is my spiritual path for growth with intention: ${intention}?`, method: 'coins', includeChangingLines: true } },
        { engine: 'sacred_geometry' as const, input: { intention, patternType: 'mandala', petalCount: 8, layerCount: 3, colorScheme: 'chakra', meditationFocus: true } }
      ];

      const results = await Promise.all(
        calculations.map(async calc => {
          try {
            const result = await calculateEngine(calc.engine, calc.input);
            return { engine: calc.engine, success: true, data: result };
          } catch (error) {
            return { engine: calc.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      const response = {
        workflowType: 'spiritual',
        intention,
        results,
        synthesis: 'Spiritual development guidance combining archetypal wisdom, I-Ching guidance, and sacred geometry',
        requestId,
        timestamp: new Date().toISOString()
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Spiritual workflow failed:`, error);
      return this.createErrorResponse(500, 'SPIRITUAL_WORKFLOW_FAILED', 'Spiritual workflow calculation failed', requestId);
    }
  }

  private async handleShadowWorkflow(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { userProfile } = body;

      if (!userProfile) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile required for shadow work workflow', requestId);
      }

      // Execute shadow work workflow
      const calculations = [
        { engine: 'enneagram' as const, input: { identificationMethod: 'self_select', selectedType: 4, includeWings: true, includeArrows: true, includeInstincts: true } },
        { engine: 'gene_keys' as const, input: { birthDate: userProfile.birthDate, birthTime: userProfile.birthTime || '12:00', includeActivationSequence: true } },
        { engine: 'tarot' as const, input: { question: 'What shadow aspects need integration for my highest growth?', spreadType: 'three_card', focusArea: 'shadow_work' } }
      ];

      const results = await Promise.all(
        calculations.map(async calc => {
          try {
            const result = await calculateEngine(calc.engine, calc.input);
            return { engine: calc.engine, success: true, data: result };
          } catch (error) {
            return { engine: calc.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      const response = {
        workflowType: 'shadow',
        results,
        synthesis: 'Shadow integration guidance combining personality patterns, archetypal shadows, and intuitive insight',
        requestId,
        timestamp: new Date().toISOString()
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Shadow workflow failed:`, error);
      return this.createErrorResponse(500, 'SHADOW_WORKFLOW_FAILED', 'Shadow workflow calculation failed', requestId);
    }
  }

  private async handleRelationshipWorkflow(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { userProfile, partnerProfile, focusArea } = body;

      if (!userProfile || !partnerProfile) {
        return this.createErrorResponse(400, 'MISSING_PROFILES', 'Both user and partner profiles required for relationship workflow', requestId);
      }

      // Execute relationship compatibility workflow
      const calculations = [
        { engine: 'numerology' as const, input: { fullName: userProfile.fullName, birthDate: userProfile.birthDate, system: 'pythagorean' } },
        { engine: 'enneagram' as const, input: { identificationMethod: 'self_select', selectedType: 2, includeWings: true, includeArrows: true, includeInstincts: true } },
        { engine: 'tarot' as const, input: { question: `What is the dynamic between ${userProfile.fullName} and ${partnerProfile.fullName}?`, spreadType: 'three_card', focusArea: 'relationships' } }
      ];

      const results = await Promise.all(
        calculations.map(async calc => {
          try {
            const result = await calculateEngine(calc.engine, calc.input);
            return { engine: calc.engine, success: true, data: result };
          } catch (error) {
            return { engine: calc.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      const response = {
        workflowType: 'relationships',
        focusArea: focusArea || 'compatibility',
        results,
        synthesis: 'Relationship dynamics analysis combining numerological compatibility, personality patterns, and intuitive guidance',
        requestId,
        timestamp: new Date().toISOString()
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Relationship workflow failed:`, error);
      return this.createErrorResponse(500, 'RELATIONSHIP_WORKFLOW_FAILED', 'Relationship workflow calculation failed', requestId);
    }
  }

  private async handleDailyWorkflow(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { userProfile, question } = body;

      if (!userProfile) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile required for daily guidance workflow', requestId);
      }

      const today = new Date().toISOString().split('T')[0];
      const dailyQuestion = question || `What guidance do I need for today, ${today}?`;

      // Execute daily guidance workflow
      const calculations = [
        { engine: 'biorhythm' as const, input: { birthDate: userProfile.birthDate, targetDate: today } },
        { engine: 'iching' as const, input: { question: dailyQuestion, method: 'random', includeChangingLines: true } },
        { engine: 'tarot' as const, input: { question: dailyQuestion, spreadType: 'single_card', focusArea: 'daily_guidance' } }
      ];

      const results = await Promise.all(
        calculations.map(async calc => {
          try {
            const result = await calculateEngine(calc.engine, calc.input);
            return { engine: calc.engine, success: true, data: result };
          } catch (error) {
            return { engine: calc.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      const response = {
        workflowType: 'daily',
        date: today,
        question: dailyQuestion,
        results,
        synthesis: 'Daily guidance combining biorhythm cycles, I-Ching wisdom, and tarot insight',
        requestId,
        timestamp: new Date().toISOString()
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Daily workflow failed:`, error);
      return this.createErrorResponse(500, 'DAILY_WORKFLOW_FAILED', 'Daily workflow calculation failed', requestId);
    }
  }

  private async handleCustomWorkflow(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { engines, userProfile, options = {} } = body;

      if (!engines || !Array.isArray(engines) || engines.length === 0) {
        return this.createErrorResponse(400, 'MISSING_ENGINES', 'Engines array required for custom workflow', requestId);
      }

      if (!userProfile) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile required for custom workflow', requestId);
      }

      // Execute custom engine combination
      const results = await Promise.all(
        engines.map(async (engineConfig: { engine: string; input: any }) => {
          try {
            const result = await calculateEngine(engineConfig.engine as any, {
              ...engineConfig.input,
              ...userProfile
            });
            return { engine: engineConfig.engine, success: true, data: result };
          } catch (error) {
            return { engine: engineConfig.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      const response = {
        workflowType: 'custom',
        engines: engines.map(e => e.engine),
        results,
        synthesis: `Custom consciousness analysis combining ${engines.length} selected engines`,
        options,
        requestId,
        timestamp: new Date().toISOString()
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Custom workflow failed:`, error);
      return this.createErrorResponse(500, 'CUSTOM_WORKFLOW_FAILED', 'Custom workflow calculation failed', requestId);
    }
  }

  // Correlation Analysis Handler
  private async handleReadingCorrelation(request: Request, requestId: string): Promise<Response> {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const timeRange = url.searchParams.get('timeRange') || '30d';

      if (!userId) {
        return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required for correlation analysis', requestId);
      }

      // Get user's reading history from KV
      const readingHistory = await this.kvData.getUserReadings(userId, limit, timeRange);
      
      if (!readingHistory || readingHistory.length < 2) {
        return this.createResponse(200, {}, {
          success: true,
          correlations: [],
          message: 'Insufficient reading history for correlation analysis',
          timestamp: new Date().toISOString(),
          requestId
        });
      }

      // Import and use the synthesizer for correlation analysis
      const { ResultSynthesizer } = await import('../integration/synthesizer');
      const synthesizer = new ResultSynthesizer();

      // Analyze correlations across readings
      const correlationResults = [];
      for (let i = 0; i < readingHistory.length - 1; i++) {
        for (let j = i + 1; j < readingHistory.length; j++) {
          const reading1 = readingHistory[i];
          const reading2 = readingHistory[j];
          
          // Create a combined result set for synthesis
          const combinedResults = {
            ...reading1.results,
            ...reading2.results
          };

          const synthesis = synthesizer.synthesizeReading(combinedResults);
          
          correlationResults.push({
            reading1_id: reading1.id,
            reading2_id: reading2.id,
            reading1_date: reading1.timestamp,
            reading2_date: reading2.timestamp,
            correlations: synthesis.correlations,
            correlation_strength: this.calculateCorrelationStrength(synthesis.correlations),
            shared_themes: synthesis.unifiedThemes,
            evolution_pattern: this.extractEvolutionPattern(reading1, reading2)
          });
        }
      }

      // Sort by correlation strength
      correlationResults.sort((a, b) => b.correlation_strength - a.correlation_strength);

      return this.createResponse(200, {}, {
        success: true,
        data: {
          correlations: correlationResults.slice(0, 20), // Top 20 correlations
          analysis_summary: {
            total_readings_analyzed: readingHistory.length,
            correlation_pairs: correlationResults.length,
            highest_correlation: correlationResults[0]?.correlation_strength || 0,
            dominant_patterns: this.extractDominantPatterns(correlationResults)
          }
        },
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - Date.now(), // Will be calculated properly
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Correlation analysis error:`, error);
      return this.createErrorResponse(500, 'CORRELATION_ERROR', 'Failed to analyze reading correlations', requestId);
    }
  }

  // Consciousness Insights Handler
  private async handleReadingInsights(request: Request, requestId: string): Promise<Response> {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const insightType = url.searchParams.get('type') || 'comprehensive';
      const timeRange = url.searchParams.get('timeRange') || '90d';

      if (!userId) {
        return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required for insights analysis', requestId);
      }

      // Get comprehensive user data
      const [userProfile, readingHistory, consciousnessProfile] = await Promise.all([
        this.kvData.getUserProfile(userId),
        this.kvData.getUserReadings(userId, 50, timeRange),
        this.kvData.getConsciousnessProfile(userId)
      ]);

      if (!readingHistory || readingHistory.length === 0) {
        return this.createResponse(200, {}, {
          success: true,
          insights: [],
          message: 'No reading history available for insights analysis',
          timestamp: new Date().toISOString(),
          requestId
        });
      }

      // Generate comprehensive consciousness field insights
      const insights = await this.generateConsciousnessInsights({
        userId,
        userProfile,
        readingHistory,
        consciousnessProfile,
        insightType,
        timeRange
      });

      return this.createResponse(200, {}, {
        success: true,
        data: insights,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - Date.now(), // Will be calculated properly
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Insights analysis error:`, error);
      return this.createErrorResponse(500, 'INSIGHTS_ERROR', 'Failed to generate consciousness insights', requestId);
    }
  }

  // Helper method for correlation strength calculation
  private calculateCorrelationStrength(correlations: any): number {
    if (!correlations) return 0;
    
    let strength = 0;
    
    // Numerical patterns contribute to strength
    if (correlations.numericalPatterns) {
      strength += correlations.numericalPatterns.length * 0.2;
    }
    
    // Archetypal resonance contributes significantly
    if (correlations.archetypalResonance) {
      strength += correlations.archetypalResonance.length * 0.3;
    }
    
    // Temporal alignments add strength
    if (correlations.temporalAlignments && correlations.temporalAlignments.current_cycles) {
      strength += correlations.temporalAlignments.current_cycles.length * 0.25;
    }
    
    // Energy signatures add to strength
    if (correlations.energySignatures && correlations.energySignatures.dominantElements) {
      strength += correlations.energySignatures.dominantElements.length * 0.25;
    }
    
    return Math.min(strength, 1.0); // Cap at 1.0
  }

  // Helper method to extract evolution patterns
  private extractEvolutionPattern(reading1: any, reading2: any): any {
    return {
      time_span: new Date(reading2.timestamp).getTime() - new Date(reading1.timestamp).getTime(),
      consciousness_shift: this.detectConsciousnessShift(reading1, reading2),
      growth_areas: this.identifyGrowthAreas(reading1, reading2),
      integration_progress: this.assessIntegrationProgress(reading1, reading2)
    };
  }

  // Helper method to extract dominant patterns
  private extractDominantPatterns(correlations: any[]): any[] {
    const patternMap = new Map();
    
    correlations.forEach(correlation => {
      correlation.shared_themes?.forEach((theme: string) => {
        patternMap.set(theme, (patternMap.get(theme) || 0) + 1);
      });
    });
    
    return Array.from(patternMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, frequency]) => ({ pattern, frequency }));
  }

  // Helper methods for consciousness analysis
  private detectConsciousnessShift(reading1: any, reading2: any): string {
    // Simplified consciousness shift detection
    return 'evolution_detected'; // Placeholder
  }

  private identifyGrowthAreas(reading1: any, reading2: any): string[] {
    // Simplified growth area identification
    return ['self_awareness', 'emotional_integration']; // Placeholder
  }

  private assessIntegrationProgress(reading1: any, reading2: any): number {
    // Simplified integration progress assessment
    return 0.75; // Placeholder
  }

  // Comprehensive consciousness insights generation
  private async generateConsciousnessInsights(params: {
    userId: string;
    userProfile: any;
    readingHistory: any[];
    consciousnessProfile: any;
    insightType: string;
    timeRange: string;
  }): Promise<any> {
    const { readingHistory, insightType } = params;
    
    // Import field analyzer functionality
    const { ResultSynthesizer } = await import('../integration/synthesizer');
    const synthesizer = new ResultSynthesizer();

    // Combine all reading results for comprehensive analysis
    const allResults = {};
    readingHistory.forEach(reading => {
      Object.assign(allResults, reading.results);
    });

    // Generate comprehensive synthesis
    const synthesis = synthesizer.synthesizeReading(allResults);

         const insights = {
       consciousness_field: {
         signature: synthesis.fieldSignature,
         coherence: synthesis.fieldSignature?.coherence || 0,
         dominant_frequency: synthesis.fieldSignature?.dominantFrequency || 'unknown',
         evolution_vector: synthesis.fieldSignature?.evolutionVector || 'unknown'
       },
       life_themes: {
         unified_themes: synthesis.unifiedThemes || [],
         archetypal_patterns: synthesis.correlations?.archetypalResonance || [],
         numerical_patterns: synthesis.correlations?.numericalPatterns || []
       },
       growth_guidance: {
         integration_points: synthesis.consciousnessMap?.integrationPoints || [],
         growth_edges: synthesis.consciousnessMap?.growthEdges || [],
         reality_patches: synthesis.realityPatches || []
       },
       timing_insights: {
         current_cycles: synthesis.correlations?.temporalAlignments?.currentCycles || [],
         optimal_timing: synthesis.correlations?.temporalAlignments?.optimalTiming || [],
         transition_periods: synthesis.correlations?.temporalAlignments?.transitionPeriods || []
       },
      relationship_patterns: {
        compatibility_indicators: this.extractRelationshipPatterns(allResults),
        communication_style: this.determineCommStyle(allResults),
        energy_exchange: this.analyzeEnergyExchange(allResults)
      }
    };

    return insights;
  }

  // Helper methods for relationship and energy analysis
  private extractRelationshipPatterns(results: any): any[] {
    return []; // Placeholder - would analyze Human Design, Numerology, etc.
  }

  private determineCommStyle(results: any): string {
    return 'collaborative'; // Placeholder
  }

  private analyzeEnergyExchange(results: any): any {
    return { type: 'balanced', flow: 'bidirectional' }; // Placeholder
  }

  // Consciousness Profile Management
  private async handleUploadConsciousnessProfile(request: Request, requestId: string): Promise<Response> {
    try {
      // 1. Authenticate user
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Missing or invalid authorization token', requestId);
      }
      const token = authHeader.slice(7);
      
      const validation = await this.authService.validateToken(token);
      if (!validation.valid || !validation.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', validation.error || 'Invalid token', requestId);
      }
      
      const userId = validation.user.id.toString();

      // 2. Parse the profile data from the request body
      const profileData = await request.json();

      // 3. Update the user profile in the database
      const result = await this.authService.updateUserProfile(userId, profileData);

      if (!result.success || !result.user) {
        return this.createErrorResponse(500, 'PROFILE_UPDATE_FAILED', result.error || 'Failed to update user profile', requestId);
      }

      // 4. Optionally, save the full profile to KV store if needed (e.g., for non-relational data)
      await this.kvData.put(`consciousness_profile:${userId}`, JSON.stringify(profileData));

      // 5. Return success response with the updated user data
      return this.createResponse(200, {}, {
        message: 'Consciousness profile uploaded successfully',
        user: result.user
      });

    } catch (error) {
      console.error(`[${requestId}] Error in handleUploadConsciousnessProfile:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to parse request body';
      return this.createErrorResponse(400, 'BAD_REQUEST', errorMessage, requestId);
    }
  }

  private async handleGetConsciousnessProfile(request: Request, requestId: string): Promise<Response> {
    try {
      // Authenticate user
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Missing or invalid authorization token', requestId);
      }
      const token = authHeader.slice(7);
      
      const validation = await this.authService.validateToken(token);
      if (!validation.valid || !validation.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', validation.error || 'Invalid token', requestId);
      }
      
      const userId = validation.user.id.toString();

      // Get the consciousness profile from the database
      const profile = await this.kvData.getConsciousnessProfile(userId);

      if (!profile) {
        return this.createErrorResponse(404, 'PROFILE_NOT_FOUND', 'No consciousness profile found for user', requestId);
      }

      return this.createResponse(200, {}, {
        success: true,
        data: profile,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Get consciousness profile error:`, error);
      return this.createErrorResponse(500, 'FETCH_FAILED', 'Failed to fetch consciousness profile', requestId);
    }
  }

  private async handleDeleteConsciousnessProfile(request: Request, requestId: string): Promise<Response> {
    try {
      // Check authentication
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', requestId);
      }

      const token = authHeader.slice(7);
      const result = await this.authService.validateToken(token);
      if (!result.valid || !result.user) {
        return this.createErrorResponse(401, 'INVALID_TOKEN', result.error || 'Invalid authentication token', requestId);
      }

      await this.kvData.deleteConsciousnessProfile(result.user.id);
      
      return this.createResponse(200, {}, {
        success: true,
        message: 'Consciousness profile deleted successfully',
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Delete consciousness profile error:`, error);
      return this.createErrorResponse(500, 'DELETE_FAILED', 'Failed to delete consciousness profile', requestId);
    }
  }

  // Reading History Management
  private async handleSaveReading(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { userId, reading } = body;

      if (!userId || !reading) {
        return this.createErrorResponse(400, 'MISSING_DATA', 'User ID and reading data are required', requestId);
      }

      const result = await this.kvData.saveReading(userId, reading);
      
      if (!result.success) {
        return this.createErrorResponse(400, 'SAVE_FAILED', result.error || 'Failed to save reading', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Reading saved successfully',
        readingId: result.readingId,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Save reading error:`, error);
      return this.createErrorResponse(500, 'SAVE_ERROR', 'Failed to save reading', requestId);
    }
  }

  private async handleReadingHistory(request: Request, requestId: string): Promise<Response> {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('userId');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const timeRange = url.searchParams.get('timeRange') || '30d';

      if (!userId) {
        return this.createErrorResponse(400, 'MISSING_USER_ID', 'User ID is required for reading history', requestId);
      }

      const history = await this.kvData.getUserReadings(userId, limit, timeRange);
      
      if (!history || history.length === 0) {
        return this.createResponse(200, {}, {
          success: true,
          readings: [],
          message: 'No reading history available',
          timestamp: new Date().toISOString(),
          requestId
        });
      }

      return this.createResponse(200, {}, {
        success: true,
        readings: history,
        total: history.length,
        timestamp: new Date().toISOString(),
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Get reading history error:`, error);
      return this.createErrorResponse(500, 'HISTORY_ERROR', 'Failed to retrieve reading history', requestId);
    }
  }

  private async handleGetReading(readingId: string, requestId: string): Promise<Response> {
    try {
      const reading = await this.kvData.getReading(readingId);
      
      if (!reading) {
        return this.createErrorResponse(404, 'READING_NOT_FOUND', 'Reading not found', requestId);
      }

      return this.createResponse(200, {}, {
        success: true,
        reading,
        timestamp: new Date().toISOString(),
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Get reading error:`, error);
      return this.createErrorResponse(500, 'READING_ERROR', 'Failed to retrieve reading', requestId);
    }
  }

  private async handleDeleteReading(readingId: string, request: Request, requestId: string): Promise<Response> {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'MISSING_TOKEN', 'Authorization token required', requestId);
      }

      const token = authHeader.slice(7);
      const result = await this.authService.validateToken(token);
      
      if (!result.valid) {
        return this.createErrorResponse(401, 'INVALID_TOKEN', result.error || 'Invalid token', requestId);
      }

      const deleteResult = await this.kvData.deleteReading(readingId);
      
      if (!deleteResult.success) {
        return this.createErrorResponse(400, 'DELETE_FAILED', deleteResult.error || 'Failed to delete reading', requestId);
      }

      return this.createResponse(200, {}, {
        message: 'Reading deleted successfully',
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Delete reading error:`, error);
      return this.createErrorResponse(500, 'DELETE_ERROR', 'Failed to delete reading', requestId);
    }
  }

  private async handleToggleFavorite(readingId: string, request: Request, requestId: string): Promise<Response> {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'MISSING_TOKEN', 'Authorization token required', requestId);
      }

      const token = authHeader.slice(7);
      const result = await this.authService.validateToken(token);
      
      if (!result.valid) {
        return this.createErrorResponse(401, 'INVALID_TOKEN', result.error || 'Invalid token', requestId);
      }

      const favoriteResult = await this.kvData.toggleFavorite(readingId);
      
      if (!favoriteResult.success) {
        return this.createErrorResponse(400, 'TOGGLE_FAILED', favoriteResult.error || 'Failed to toggle favorite', requestId);
      }

      return this.createResponse(200, {}, {
        message: favoriteResult.message,
        requestId
      });
    } catch (error) {
      console.error(`[${requestId}] Toggle favorite error:`, error);
      return this.createErrorResponse(500, 'TOGGLE_ERROR', 'Failed to toggle favorite', requestId);
    }
  }

  /**
   * Validate all engines with default test user data
   */
  private async handleValidateAllEngines(requestId: string): Promise<Response> {
    console.log(`[${requestId}] Validating all engines with default test user`);

    try {
      const results: Record<string, any> = {};
      const allInputs = getAllEngineTestInputs();

      // Test each engine
      for (const [engineName, input] of Object.entries(allInputs)) {
        try {
          console.log(`[${requestId}] Testing engine: ${engineName}`);
          const startTime = Date.now();

          const result = await calculateEngine(engineName as EngineName, input);
          const calculationTime = Date.now() - startTime;

          results[engineName] = {
            success: true,
            calculationTime,
            input,
            result,
            timestamp: new Date().toISOString()
          };

          console.log(`[${requestId}] ✅ ${engineName} completed in ${calculationTime}ms`);
        } catch (error) {
          console.error(`[${requestId}] ❌ ${engineName} failed:`, error);
          results[engineName] = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            input,
            timestamp: new Date().toISOString()
          };
        }
      }

      return this.createResponse(200, {}, {
        success: true,
        testUser: VALIDATION_METADATA.testUser,
        results,
        summary: {
          totalEngines: Object.keys(allInputs).length,
          successful: Object.values(results).filter(r => r.success).length,
          failed: Object.values(results).filter(r => !r.success).length,
          timestamp: new Date().toISOString()
        },
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Validation failed:`, error);
      return this.createResponse(500, {}, {
        success: false,
        error: error instanceof Error ? error.message : 'Validation failed',
        requestId
      });
    }
  }

  /**
   * Validate a specific engine with default test user data
   */
  private async handleValidateEngine(engineName: EngineName, requestId: string): Promise<Response> {
    console.log(`[${requestId}] Validating engine: ${engineName}`);

    try {
      const input = getEngineTestInput(engineName);
      const startTime = Date.now();

      const result = await calculateEngine(engineName, input);
      const calculationTime = Date.now() - startTime;

      return this.createResponse(200, {}, {
        success: true,
        engine: engineName,
        testUser: VALIDATION_METADATA.testUser,
        input,
        result,
        calculationTime,
        timestamp: new Date().toISOString(),
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Engine ${engineName} validation failed:`, error);
      return this.createResponse(500, {}, {
        success: false,
        engine: engineName,
        error: error instanceof Error ? error.message : 'Engine validation failed',
        requestId
      });
    }
  }

  /**
   * Get default test user information
   */
  private async handleValidateUser(requestId: string): Promise<Response> {
    console.log(`[${requestId}] Getting default test user information`);

    return this.createResponse(200, {}, {
      success: true,
      testUser: DEFAULT_TEST_USER,
      metadata: VALIDATION_METADATA,
      availableEngines: VALIDATION_METADATA.expectedEngines,
      requestId
    });
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

    // Skip handler for now - focus on engine calculations
    // const handler = new WitnessOSAPIHandler(kvBindings, null, '');
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
        if (!calc) continue;
        
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
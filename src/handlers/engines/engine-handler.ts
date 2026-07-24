/**
 * Engine Calculation Handler for WitnessOS API
 *
 * Handles engine calculations, AI-enhanced calculations, engine metadata,
 * and validation endpoints.
 */

import { BaseHandler, HandlerEnvironment } from '../base/base-handler';
import { calculateEngine, getEngine, listEngines, isEngineAvailable, getEngineMetadata } from '../../engines';
import type { EngineName } from '../../types/engines';
import { CloudflareKVDataAccess } from '../../lib/kv-data-access';

export interface EngineCalculationRequest {
  engine: EngineName;
  input: any;
  options?: {
    useCache?: boolean;
    userId?: string;
    saveProfile?: boolean;
  };
}

export interface EngineCalculationResponse {
  success: boolean;
  data?: any;
  error?: string;
  cached?: boolean;
  cachedAt?: string;
  requestId: string;
  metadata?: {
    calculationTime?: number;
    confidence?: number;
    engineName?: string;
  };
}

export class EngineHandler extends BaseHandler {
  constructor(env: HandlerEnvironment) {
    super(env);
  }

  /**
   * Main handler for engine endpoints
   */
  async handle(request: Request, requestId?: string): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    const corsResponse = this.handleCORS(request);
    if (corsResponse) return corsResponse;

    // Route to specific engine handlers
    if (path === '/engines') {
      return await this.handleEnginesList(requestId || this.generateRequestId());
    }

    if (path.startsWith('/engines/') && path.endsWith('/metadata')) {
      const engineName = path.split('/')[2] as EngineName;
      return await this.handleEngineMetadata(engineName, requestId || this.generateRequestId());
    }

    if (path.startsWith('/engines/') && path.endsWith('/calculate')) {
      const engineName = path.split('/')[2] as EngineName;
      return await this.handleEngineCalculation(engineName, request, requestId || this.generateRequestId());
    }

    if (path.startsWith('/engines/') && path.endsWith('/ai-enhanced')) {
      const engineName = path.split('/')[2] as EngineName;
      return await this.handleAIEnhancedCalculation(engineName, request, requestId || this.generateRequestId());
    }

    if (path === '/ai/synthesis' && method === 'POST') {
      return await this.handleAISynthesis(request, requestId || this.generateRequestId());
    }

    // Validation endpoints
    if (path === '/validate/engines' && method === 'GET') {
      return await this.handleValidateAllEngines(requestId || this.generateRequestId());
    }

    if (path.startsWith('/validate/engines/') && method === 'GET') {
      const engineName = path.split('/')[3] as EngineName;
      return await this.handleValidateEngine(engineName, requestId || this.generateRequestId());
    }

    return this.createErrorResponse(404, 'ENDPOINT_NOT_FOUND', 'Engine endpoint not found', requestId || this.generateRequestId());
  }

  /**
   * Handle engines list
   */
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

  /**
   * Handle engine metadata
   */
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

  /**
   * Handle engine calculation
   */
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

      // Check authentication and tier requirements for engine access
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for engine calculations', requestId);
      }

      const requestData = await this.parseJsonBody(request) as EngineCalculationRequest;
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
      console.log(`🚀 [${requestId}] Starting ${engineName} calculation`);
      console.log(`📥 [${requestId}] Input keys:`, Object.keys(input));
      console.log(`📊 [${requestId}] Input size:`, JSON.stringify(input).length, 'bytes');

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
      if (options.useCache !== false && result.success && result.data) {
        const inputHash = CloudflareKVDataAccess.createInputHash(input);
        const confidenceScore = (result.data as any).confidenceScore || (result.data as any).confidence || 0;

        try {
          await this.kvData.setCached(
            engineName,
            inputHash,
            result,
            undefined // Use default TTL
          );
          console.log(`✅ Engine ${engineName} result cached`);
        } catch (cacheError) {
          console.warn(`Failed to cache ${engineName} result:`, cacheError);
        }
      }

      // Save user profile if requested
      if (options.userId && options.saveProfile && authResult.user) {
        try {
          await this.kvData.setUserProfile(
            options.userId,
            engineName,
            {
              input,
              result,
              calculatedAt: new Date().toISOString()
            }
          );
          console.log(`✅ User profile saved for ${engineName}`);
        } catch (profileError) {
          console.warn(`Failed to save user profile for ${engineName}:`, profileError);
        }
      }

      // Create timeline entry
      if (options.userId && result.success && authResult.user) {
        await this.createTimelineEntry(
          options.userId,
          'engine_calculation',
          input,
          result
        );
      }

      return this.createResponse(200, {}, {
        ...result,
        cached: false,
        requestId,
        metadata: {
          calculationTime,
          confidence: (result.data as any)?.confidenceScore || 0,
          engineName
        }
      });

    } catch (error) {
      console.error(`[${requestId}] Engine calculation failed for ${engineName}:`, error);

      if (error instanceof Error && error.message.includes('validation')) {
        return this.createErrorResponse(400, 'VALIDATION_ERROR', error.message, requestId);
      }

      return this.createErrorResponse(500, 'CALCULATION_FAILED', 'Engine calculation failed', requestId);
    }
  }

  /**
   * Handle AI-enhanced calculation
   */
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
      const body = await this.parseJsonBody(request);
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

      // First perform the regular engine calculation
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

  /**
   * Handle AI synthesis
   */
  private async handleAISynthesis(request: Request, requestId: string): Promise<Response> {
    // Initialize AI interpreter from KV secrets
    const aiInterpreter = await this.initializeAIInterpreter();
    if (!aiInterpreter) {
      return this.createErrorResponse(503, 'AI_NOT_AVAILABLE', 'AI interpretation service not available', requestId);
    }

    try {
      const body = await this.parseJsonBody(request);
      const { readings, aiConfig = {}, useCache = true } = body;

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

      // Generate input hash for cache key
      const inputHash = this.generateSynthesisInputHash(validReadings, userContext, aiConfig);
      const cacheKey = `ai_synthesis:${inputHash}`;

      // Try to get cached result first
      let synthesis: any = null;
      let fromCache = false;

      if (useCache) {
        try {
          const cachedResult = await this.kvData.getCachedWithStats('ai_synthesis', inputHash);
          if (cachedResult) {
            synthesis = cachedResult;
            fromCache = true;
            console.log(`[${requestId}] ✅ AI synthesis cache HIT for hash: ${inputHash}`);
          } else {
            console.log(`[${requestId}] ❌ AI synthesis cache MISS for hash: ${inputHash}`);
          }
        } catch (cacheError) {
          console.warn(`[${requestId}] Cache lookup failed:`, cacheError);
        }
      }

      // Generate AI synthesis if not cached
      if (!synthesis) {
        console.log(`[${requestId}] Generating new AI synthesis...`);
        synthesis = await aiInterpreter.synthesizeMultipleReadings(
          validReadings,
          {
            model: aiConfig.model,
            maxTokens: aiConfig.maxTokens || 2000,
            temperature: aiConfig.temperature || 0.8,
            userContext
          }
        );

        // Cache the result if it has good confidence and caching is enabled
        if (useCache && synthesis && synthesis.confidence > 0.6) {
          try {
            await this.kvData.setCached(
              'ai_synthesis',
              inputHash,
              synthesis,
              1800 // 30 minutes TTL for AI synthesis
            );
            console.log(`[${requestId}] ✅ AI synthesis cached`);
          } catch (cacheError) {
            console.warn(`[${requestId}] Failed to cache AI synthesis:`, cacheError);
          }
        }
      }

      // Extract AI metadata for response
      const { modelUsed, attemptedModels, modelSwitches, circuitBreakerStats, ...synthesisData } = synthesis;

      const response = {
        synthesis: synthesisData,
        readingsCount: validReadings.length,
        engines: validReadings.map(r => r.engine),
        requestId,
        timestamp: new Date().toISOString(),
        fromCache,
        cacheKey: fromCache ? inputHash : undefined,
        metadata: {
          ai: {
            modelUsed,
            attemptedModels,
            modelSwitches,
            circuitBreakerStats,
            timestamp: new Date().toISOString()
          },
          cache: {
            enabled: useCache,
            hit: fromCache,
            key: inputHash
          }
        }
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] AI synthesis failed:`, error);
      return this.createErrorResponse(500, 'AI_SYNTHESIS_FAILED', 'AI synthesis failed', requestId);
    }
  }

  /**
   * Handle validate all engines
   */
  private async handleValidateAllEngines(requestId: string): Promise<Response> {
    console.log(`[${requestId}] Validating all engines`);

    try {
      const results: Record<string, any> = {};
      const allInputs = this.getAllEngineTestInputs();

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
        testUser: this.getValidationMetadata().testUser,
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
   * Handle validate specific engine
   */
  private async handleValidateEngine(engineName: EngineName, requestId: string): Promise<Response> {
    console.log(`[${requestId}] Validating engine: ${engineName}`);

    try {
      const input = this.getEngineTestInput(engineName);
      const startTime = Date.now();

      const result = await calculateEngine(engineName, input);
      const calculationTime = Date.now() - startTime;

      return this.createResponse(200, {}, {
        success: true,
        engine: engineName,
        testUser: this.getValidationMetadata().testUser,
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

  // Helper methods
  private async initializeAIInterpreter(): Promise<any | null> {
    if (this.aiInterpreter) {
      return this.aiInterpreter;
    }

    try {
      // Try to initialize from environment
      if (this.env.OPENROUTER_API_KEY) {
        // For now, return a placeholder - actual AI initialization would be more complex
        console.log('🤖 AI interpreter initialized from environment');
        this.aiInterpreter = { initialized: true } as any;
        return this.aiInterpreter;
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Failed to initialize AI interpreter:', error);
      return null;
    }
  }

  private generateSynthesisInputHash(readings: any[], userContext: any, aiConfig: any): string {
    const inputData = {
      engines: readings.map(r => r.engine).sort(),
      readingHashes: readings.map(r => {
        const dataStr = JSON.stringify(r.data, Object.keys(r.data).sort());
        return this.simpleHash(dataStr);
      }).sort(),
      userContext: {
        name: userContext.name ? 'personalized' : 'anonymous',
        birthDate: userContext.birthDate ? 'provided' : 'not_provided',
        focusArea: userContext.focusArea || 'general'
      },
      aiConfig: {
        model: aiConfig.model || 'default',
        temperature: aiConfig.temperature || 0.8,
        maxTokens: aiConfig.maxTokens || 2000
      }
    };

    const inputString = JSON.stringify(inputData, Object.keys(inputData).sort());
    return this.simpleHash(inputString);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private isBirthDataEngine(engineName: string): boolean {
    const birthDataEngines = ['human_design', 'vimshottari', 'numerology', 'biorhythm'];
    return birthDataEngines.includes(engineName);
  }

  private getAllEngineTestInputs(): Record<string, any> {
    return {
      numerology: { fullName: 'John Smith', birthDate: '1990-01-01', system: 'pythagorean' },
      biorhythm: { birth_date: '1990-01-01', target_date: new Date().toISOString().split('T')[0] },
      tarot: { question: 'What guidance do I need today?', spreadType: 'three_card' },
      iching: { question: 'What wisdom do I need today?', method: 'coins' }
    };
  }

  private getEngineTestInput(engineName: EngineName): any {
    const inputs = this.getAllEngineTestInputs();
    return inputs[engineName] || { test: true };
  }

  private getValidationMetadata(): any {
    return {
      testUser: {
        name: 'Test User',
        birthDate: '1990-01-01',
        birthTime: '12:00',
        location: 'Test City'
      },
      expectedEngines: ['numerology', 'biorhythm', 'tarot', 'iching']
    };
  }
}

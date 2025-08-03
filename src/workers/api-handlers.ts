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
  TimelineEntry,
  TimelineQuery,
  TimelineResponse,
  TimelineStats,
  TimelineEntryType
} from '../types/timeline';
import { PredictiveAnalytics } from '../lib/predictive-analytics';
import {
  DEFAULT_TEST_USER,
  getEngineTestInput,
  getAllEngineTestInputs,
  VALIDATION_METADATA
} from '../lib/validation-constants';
import type {
  DailyForecast,
  WeeklyForecast,
  ForecastBatchRequest,
  ForecastBatchResponse,
  EnergyProfile,
  ForecastGuidance,
  PredictiveInsights
} from '../types/forecast';
import { WeeklySynthesizer } from '../lib/weekly-synthesizer';

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

// Forecast API Types
interface DailyForecast {
  date: string;
  energyProfile: {
    biorhythm: any;
    overallEnergy: 'high' | 'medium' | 'low';
    criticalDays: string[];
    trend: string;
  };
  guidance: {
    iching: any;
    tarot: any;
    synthesis: string;
  };
  recommendations: {
    optimal_activities: string[];
    timing_suggestions: string[];
    awareness_points: string[];
  };
  raycastOptimized?: {
    summary: string;
    icon: string;
    subtitle: string;
    actions: string[];
  };
}

interface WeeklyForecast {
  week: {
    start: string;
    end: string;
    weekNumber: number;
  };
  dailyForecasts: DailyForecast[];
  weeklyThemes: {
    dominantEnergy: string;
    challenges: string[];
    opportunities: string[];
    overallGuidance: string;
  };
  engineInsights: {
    numerology?: any;
    biorhythm: any;
    vimshottari?: any;
  };
  raycastOptimized?: {
    weekSummary: string;
    dailyHighlights: string[];
    keyActions: string[];
  };
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

      // Phase 1 Monitoring Endpoints
      if (path === '/cache/stats' && method === 'GET') {
        return await this.handleCacheStats(requestId);
      }

      if (path === '/cache/invalidate' && method === 'POST') {
        return await this.handleCacheInvalidation(request, requestId);
      }

      if (path === '/cache/warm' && method === 'POST') {
        return await this.handleCacheWarming(request, requestId);
      }

      if (path === '/performance/database' && method === 'GET') {
        return await this.handleDatabasePerformance(requestId);
      }

      if (path === '/ai/circuit-breaker' && method === 'GET') {
        return await this.handleCircuitBreakerStats(requestId);
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

      // Daily & Weekly Forecast Endpoints
      if (path === '/forecast/daily' && method === 'GET') {
        return await this.handleDailyForecast(request, requestId);
      }

      if (path.startsWith('/forecast/daily/') && method === 'GET') {
        const date = path.split('/')[3];
        if (date) {
          return await this.handleDailyForecastByDate(request, requestId, date);
        }
        return this.createErrorResponse(400, 'MISSING_DATE', 'Date parameter required', requestId);
      }

      if (path === '/forecast/daily/batch' && method === 'POST') {
        return await this.handleDailyForecastBatch(request, requestId);
      }

      // Weekly Forecast Endpoints
      if (path === '/forecast/weekly' && method === 'GET') {
        return await this.handleWeeklyForecast(request, requestId);
      }

      if (path.startsWith('/forecast/weekly/') && method === 'GET') {
        const week = path.split('/')[3];
        if (week) {
          return await this.handleWeeklyForecastByWeek(request, requestId, week);
        }
        return this.createErrorResponse(400, 'MISSING_WEEK', 'Week parameter required', requestId);
      }

      if (path === '/forecast/weekly/batch' && method === 'POST') {
        return await this.handleWeeklyForecastBatch(request, requestId);
      }

      // Raycast Integration Endpoints
      if (path === '/integrations/raycast/daily' && method === 'GET') {
        return await this.handleRaycastDailyIntegration(request, requestId);
      }

      if (path === '/integrations/raycast/weekly' && method === 'GET') {
        return await this.handleRaycastWeeklyIntegration(request, requestId);
      }

      if (path === '/integrations/raycast/custom' && method === 'POST') {
        return await this.handleRaycastCustomIntegration(request, requestId);
      }

      // Specific Raycast API endpoints
      if (path === '/api/raycast/daily-forecast' && method === 'GET') {
        return await this.handleRaycastDailyForecast(request, requestId);
      }

      if (path === '/api/raycast/quick-reading' && method === 'POST') {
        return await this.handleRaycastQuickReading(request, requestId);
      }

      if (path === '/workflows/custom' && method === 'POST') {
        return await this.handleCustomWorkflow(request, requestId);
      }

      // Forecast API endpoints
      if (path === '/forecast/daily' && method === 'GET') {
        return await this.handleDailyForecast(request, requestId);
      }

      if (path.startsWith('/forecast/daily/') && method === 'GET') {
        const date = path.split('/')[3];
        return await this.handleDailyForecast(request, requestId, date);
      }

      if (path === '/forecast/daily/batch' && method === 'POST') {
        return await this.handleDailyForecastBatch(request, requestId);
      }

      if (path === '/forecast/weekly' && method === 'GET') {
        return await this.handleWeeklyForecast(request, requestId);
      }

      if (path.startsWith('/forecast/weekly/') && method === 'GET') {
        const week = path.split('/')[3];
        return await this.handleWeeklyForecast(request, requestId, week);
      }

      if (path === '/forecast/weekly/batch' && method === 'POST') {
        return await this.handleWeeklyForecastBatch(request, requestId);
      }

      // Raycast integration endpoints
      if (path === '/integrations/raycast/daily' && method === 'GET') {
        return await this.handleRaycastDailyIntegration(request, requestId);
      }

      if (path === '/integrations/raycast/weekly' && method === 'GET') {
        return await this.handleRaycastWeeklyIntegration(request, requestId);
      }

      if (path === '/integrations/raycast/custom' && method === 'POST') {
        return await this.handleRaycastCustomIntegration(request, requestId);
      }

      // Timeline API endpoints
      if (path === '/timeline' && method === 'GET') {
        return await this.handleGetTimeline(request, requestId);
      }

      if (path === '/timeline/recent' && method === 'GET') {
        return await this.handleGetRecentTimeline(request, requestId);
      }

      if (path.startsWith('/timeline/date/') && method === 'GET') {
        const date = path.split('/')[3];
        return await this.handleGetTimelineByDate(request, requestId, date);
      }

      if (path.startsWith('/timeline/type/') && method === 'GET') {
        const type = path.split('/')[3];
        return await this.handleGetTimelineByType(request, requestId, type);
      }

      if (path === '/timeline/stats' && method === 'GET') {
        return await this.handleGetTimelineStats(request, requestId);
      }

      // Predictive Analytics endpoints
      if (path === '/analytics/biorhythm' && method === 'GET') {
        return await this.handleGetBiorhythmAnalytics(request, requestId);
      }

      if (path === '/analytics/optimal-timing' && method === 'GET') {
        return await this.handleGetOptimalTiming(request, requestId);
      }

      if (path === '/analytics/energy-cycles' && method === 'GET') {
        return await this.handleGetEnergyCycles(request, requestId);
      }

      if (path === '/analytics/insights' && method === 'GET') {
        return await this.handleGetPredictiveInsights(request, requestId);
      }

      if (path === '/analytics/usage' && method === 'GET') {
        return await this.handleGetUsageAnalytics(request, requestId);
      }

      if (path.startsWith('/timeline/entry/') && method === 'PUT') {
        const entryId = path.split('/')[3];
        return await this.handleUpdateTimelineEntry(request, requestId, entryId);
      }

      if (path.startsWith('/timeline/entry/') && method === 'DELETE') {
        const entryId = path.split('/')[3];
        return await this.handleDeleteTimelineEntry(request, requestId, entryId);
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

      // Tiered Onboarding endpoints
      if (path === '/api/onboarding/tier1' && method === 'POST') {
        return await this.handleTier1Onboarding(request, requestId);
      }

      if (path === '/api/onboarding/tier2' && method === 'POST') {
        return await this.handleTier2Onboarding(request, requestId);
      }

      if (path === '/api/onboarding/tier3' && method === 'POST') {
        return await this.handleTier3Onboarding(request, requestId);
      }

      if (path === '/api/onboarding/status' && method === 'GET') {
        return await this.handleOnboardingStatus(request, requestId);
      }

      // User Profile Management endpoints
      if (path === '/api/user/profile/update' && method === 'PUT') {
        return await this.handleUpdateUserProfile(request, requestId);
      }

      if (path === '/api/user/preferences' && method === 'GET') {
        return await this.handleGetUserPreferences(request, requestId);
      }

      if (path === '/api/user/preferences' && method === 'PUT') {
        return await this.handleUpdateUserPreferences(request, requestId);
      }

      if (path === '/api/user/onboarding-status' && method === 'GET') {
        return await this.handleOnboardingStatus(request, requestId);
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

      // Check authentication and tier requirements for engine access
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        const validation = await this.authService.validateToken(token);

        if (validation.valid && validation.user) {
          // Check if user has completed required tiers for engine access
          const user = validation.user;
          const tier1Complete = Boolean(user.tier1_completed) || Boolean(user.name && user.email);

          // Check for tier 2 completion in preferences if database columns don't exist
          let tier2Complete = Boolean(user.tier2_completed) || Boolean(user.birth_date && user.birth_time && user.birth_latitude && user.birth_longitude);
          if (!tier2Complete && user.preferences) {
            try {
              const prefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
              tier2Complete = Boolean(prefs.tier2_completed || (prefs.birthData && prefs.birthData.birthDate && prefs.birthData.birthTime && prefs.birthData.birthLocation));
            } catch (e) {
              // Ignore JSON parse errors
            }
          }

          if (!tier1Complete || !tier2Complete) {
            return this.createErrorResponse(403, 'INSUFFICIENT_ONBOARDING',
              'Engines require completion of Tier 1 (basic profile) and Tier 2 (birth data) onboarding. Please complete your profile first.',
              requestId);
          }
        }
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

      // Cache result if enabled with enhanced intelligent caching
      if (options.useCache !== false && result.success && result.data) {
        const inputHash = CloudflareKVDataAccess.createInputHash(input);
        const confidenceScore = (result.data as any).confidenceScore || (result.data as any).confidence || 0;

        try {
          const cacheResult = await this.kvData.setCached(
            engineName,
            inputHash,
            result,
            undefined, // Use default TTL
            {
              confidenceScore,
              metadata: {
                engineName,
                calculatedAt: new Date().toISOString(),
                inputType: typeof input,
                resultSize: JSON.stringify(result).length
              }
            }
          );

          if (cacheResult.cached) {
            console.log(`✅ Engine ${engineName} result cached: ${cacheResult.reason}`);
          } else {
            console.log(`❌ Engine ${engineName} result not cached: ${cacheResult.reason}`);
          }
        } catch (cacheError) {
          console.warn(`Failed to cache ${engineName} result:`, cacheError);
        }
      }

      // Save user profile if requested with enhanced persistence
      if (options.userId && options.saveProfile) {
        try {
          const profileResult = await this.kvData.setUserProfile(
            options.userId,
            engineName,
            {
              input,
              result,
              calculatedAt: new Date().toISOString()
            },
            {
              priority: this.isBirthDataEngine(engineName) ? 'high' : 'normal',
              compress: JSON.stringify(result).length > 5000, // Compress large results
              metadata: {
                engineName,
                confidenceScore: (result.data as any)?.confidenceScore || 0,
                resultSize: JSON.stringify(result).length
              }
            }
          );

          console.log(`✅ User profile saved for ${engineName}: ${profileResult.size} bytes, compressed: ${profileResult.compressed}`);
        } catch (profileError) {
          console.warn(`Failed to save user profile for ${engineName}:`, profileError);
        }
      }

      // Create timeline entry if user is authenticated
      if (options.userId && result.success) {
        await this.createTimelineEntry(
          options.userId,
          'engine_calculation',
          input,
          result,
          {
            confidence: (result.data as any)?.confidenceScore || 0,
            cached: false,
            requestId,
            duration: calculationTime,
            source: 'api'
          },
          engineName
        );
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

      // Phase 1: AI Synthesis Caching Implementation
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
            const cacheResult = await this.kvData.setCached(
              'ai_synthesis',
              inputHash,
              synthesis,
              1800, // 30 minutes TTL for AI synthesis
              {
                confidenceScore: synthesis.confidence,
                metadata: {
                  engines: validReadings.map(r => r.engine),
                  readingsCount: validReadings.length,
                  userContext: userContext.name ? 'personalized' : 'generic',
                  timestamp: new Date().toISOString()
                }
              }
            );

            if (cacheResult.cached) {
              console.log(`[${requestId}] ✅ AI synthesis cached: ${cacheResult.reason}`);
            } else {
              console.log(`[${requestId}] ❌ AI synthesis not cached: ${cacheResult.reason}`);
            }
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

  // Phase 1: AI Synthesis Input Hash Generation
  private generateSynthesisInputHash(readings: any[], userContext: any, aiConfig: any): string {
    // Create a deterministic hash from the input combination
    const inputData = {
      engines: readings.map(r => r.engine).sort(), // Sort for consistency
      readingHashes: readings.map(r => {
        // Create a simple hash of the reading data
        const dataStr = JSON.stringify(r.data, Object.keys(r.data).sort());
        return this.simpleHash(dataStr);
      }).sort(),
      userContext: {
        name: userContext.name ? 'personalized' : 'anonymous', // Don't include actual name for privacy
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

  // Simple hash function for cache keys
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Enhanced Daily Forecast Generation
  private async generateEnhancedDailyForecast(
    userProfile: any,
    targetDate: string,
    requestId: string,
    raycastOptimized: boolean = false
  ): Promise<DailyForecast> {
    const dailyQuestion = `What guidance and energy insights do I need for ${targetDate}?`;

    // Execute enhanced daily forecast calculations with predictive analytics
    const calculations = [
      {
        engine: 'biorhythm' as const,
        input: {
          birth_date: userProfile.birthDate,
          target_date: targetDate,
          forecast_days: 7, // Extended forecast for trend analysis
          include_extended_cycles: true
        }
      },
      {
        engine: 'iching' as const,
        input: {
          question: dailyQuestion,
          method: 'random',
          includeChangingLines: true
        }
      },
      {
        engine: 'tarot' as const,
        input: {
          question: dailyQuestion,
          spreadType: 'single_card',
          focusArea: 'daily_guidance'
        }
      }
    ];

    const results = await Promise.all(
      calculations.map(async calc => {
        try {
          const result = await calculateEngine(calc.engine, calc.input);
          return { engine: calc.engine, success: true, data: result };
        } catch (error) {
          console.error(`[${requestId}] Engine ${calc.engine} failed:`, error);
          return { engine: calc.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    // Extract successful results
    const biorhythmResult = results.find(r => r.engine === 'biorhythm' && r.success)?.data;
    const ichingResult = results.find(r => r.engine === 'iching' && r.success)?.data;
    const tarotResult = results.find(r => r.engine === 'tarot' && r.success)?.data;

    // Analyze energy profile with predictive insights
    const energyProfile = this.analyzeEnhancedEnergyProfile(biorhythmResult, targetDate);

    // Generate predictive insights
    const predictiveInsights = await this.generatePredictiveInsights(biorhythmResult, targetDate, requestId);

    // Generate AI synthesis
    const synthesis = await this.generateEnhancedSynthesis(results, targetDate, requestId);

    // Create guidance object
    const guidance: ForecastGuidance = {
      iching: ichingResult ? {
              hexagram: ichingResult.data?.rawData?.hexagram || ichingResult.data?.hexagram,
              interpretation: ichingResult.data?.rawData?.interpretation || ichingResult.data?.formattedOutput,
              changingLines: ichingResult.data?.rawData?.changingLines || ichingResult.data?.changingLines
            } : undefined,
      tarot: tarotResult ? {
         card: tarotResult.data?.rawData?.card || tarotResult.data?.card,
              interpretation: tarotResult.data?.rawData?.interpretation || tarotResult.data?.formattedOutput,
        focusArea: 'daily_guidance'
      } : undefined,
      synthesis,
      keyThemes: this.extractKeyThemes(synthesis, ichingResult, tarotResult)
    };

    // Generate enhanced recommendations
    const recommendations = this.generateEnhancedRecommendations(energyProfile, guidance, predictiveInsights);

    const forecast: DailyForecast = {
      date: targetDate,
      energyProfile,
      guidance,
      recommendations,
      predictiveInsights
    };

    // Add Raycast optimization if requested
    if (raycastOptimized) {
      forecast.raycastOptimized = this.formatDailyForecastForRaycast(forecast);
    }

    return forecast;
  }

  private analyzeEnhancedEnergyProfile(biorhythmResult: any, targetDate: string): EnergyProfile {
    if (!biorhythmResult) {
      return {
        biorhythm: null,
        overallEnergy: 'medium',
        criticalDays: [],
        trend: 'stable'
      };
    }

    const overallEnergy = biorhythmResult.overall_energy || 0;
    let energyLevel: 'high' | 'medium' | 'low';

    if (overallEnergy > 50) {
      energyLevel = 'high';
    } else if (overallEnergy > 0) {
      energyLevel = 'medium';
    } else {
      energyLevel = 'low';
    }

    // Enhanced trend analysis
    const trend = this.analyzeBiorhythmTrend(biorhythmResult);

    // Optimal timing analysis
    const optimalTiming = this.calculateOptimalTiming(biorhythmResult, targetDate);

    return {
      biorhythm: {
        physical: biorhythmResult.cycles?.physical?.percentage || 0,
        emotional: biorhythmResult.cycles?.emotional?.percentage || 0,
        intellectual: biorhythmResult.cycles?.intellectual?.percentage || 0,
        overall_energy: overallEnergy
      },
      overallEnergy: energyLevel,
      criticalDays: biorhythmResult.critical_days_ahead || [],
      trend,
      optimalTiming
    };
  }

  private analyzeBiorhythmTrend(biorhythmResult: any): 'ascending' | 'descending' | 'stable' | 'volatile' {
    if (!biorhythmResult.forecast || !biorhythmResult.forecast.length) {
      return 'stable';
    }

    const forecast = biorhythmResult.forecast;
    const energyValues = forecast.map((day: any) => day.overall_energy);

    // Calculate trend direction
    const firstHalf = energyValues.slice(0, Math.floor(energyValues.length / 2));
    const secondHalf = energyValues.slice(Math.floor(energyValues.length / 2));

    const firstAvg = firstHalf.reduce((sum: number, val: number) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum: number, val: number) => sum + val, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;
    const volatility = this.calculateVolatility(energyValues);

    if (volatility > 30) return 'volatile';
    if (difference > 10) return 'ascending';
    if (difference < -10) return 'descending';
    return 'stable';
  }

  private calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateOptimalTiming(biorhythmResult: any, targetDate: string): EnergyProfile['optimalTiming'] {
    if (!biorhythmResult.cycles) return undefined;

    const { physical, emotional, intellectual } = biorhythmResult.cycles;

    // Determine peak energy time based on cycle phases
    let peakEnergy = 'morning';
    if (physical?.percentage > 70 && emotional?.percentage > 50) {
      peakEnergy = 'morning';
    } else if (intellectual?.percentage > 70) {
      peakEnergy = 'afternoon';
    } else if (emotional?.percentage > 50) {
      peakEnergy = 'evening';
    }

    // Generate optimal hours based on energy patterns
    const bestHours = this.generateOptimalHours(physical?.percentage || 0, emotional?.percentage || 0, intellectual?.percentage || 0);
    const avoidHours = this.generateAvoidHours(physical?.percentage || 0, emotional?.percentage || 0, intellectual?.percentage || 0);

    return {
      bestHours,
      avoidHours,
      peakEnergy
    };
  }

  private generateOptimalHours(physical: number, emotional: number, intellectual: number): string[] {
    const hours: string[] = [];

    if (physical > 50) hours.push('6:00-9:00', '18:00-20:00');
    if (intellectual > 50) hours.push('9:00-12:00', '14:00-17:00');
    if (emotional > 50) hours.push('19:00-22:00');

    return hours.length > 0 ? hours : ['9:00-12:00'];
  }

  private generateAvoidHours(physical: number, emotional: number, intellectual: number): string[] {
    const hours: string[] = [];

    if (physical < -30) hours.push('5:00-7:00', '22:00-24:00');
    if (intellectual < -30) hours.push('13:00-15:00');
    if (emotional < -30) hours.push('16:00-18:00');

    return hours;
  }

  // Helper method to determine if engine uses birth data (high priority for caching)
  private isBirthDataEngine(engineName: string): boolean {
    const birthDataEngines = ['human_design', 'vimshottari', 'numerology', 'biorhythm'];
    return birthDataEngines.includes(engineName);
  }

  // Phase 1 Monitoring Endpoints
  private async handleCacheStats(requestId: string): Promise<Response> {
    try {
      const cacheStats = await this.kvData.getCacheStats();

      const response = {
        success: true,
        stats: cacheStats,
        timestamp: new Date().toISOString(),
        requestId,
        phase1Status: {
          targetHitRate: 80,
          currentHitRate: cacheStats.hitRate,
          targetMet: cacheStats.hitRate >= 80
        }
      };

      return this.createResponse(200, {}, response);
    } catch (error) {
      console.error(`[${requestId}] Cache stats failed:`, error);
      return this.createErrorResponse(500, 'CACHE_STATS_FAILED', 'Failed to retrieve cache statistics', requestId);
    }
  }

  private async handleDatabasePerformance(requestId: string): Promise<Response> {
    try {
      // Test database performance with sample queries
      const performanceTests = [];

      // Test reading history query performance
      const readingHistoryStart = Date.now();
      try {
        await this.db.prepare('SELECT COUNT(*) FROM readings WHERE user_id = ? AND created_at > datetime("now", "-30 days")').bind(1).first();
        performanceTests.push({
          test: 'reading_history_query',
          duration: Date.now() - readingHistoryStart,
          target: 100,
          passed: (Date.now() - readingHistoryStart) < 100
        });
      } catch (error) {
        performanceTests.push({
          test: 'reading_history_query',
          duration: -1,
          target: 100,
          passed: false,
          error: error.message
        });
      }

      // Test user session lookup performance
      const sessionLookupStart = Date.now();
      try {
        await this.db.prepare('SELECT COUNT(*) FROM user_sessions WHERE expires_at > datetime("now")').bind().first();
        performanceTests.push({
          test: 'session_lookup_query',
          duration: Date.now() - sessionLookupStart,
          target: 50,
          passed: (Date.now() - sessionLookupStart) < 50
        });
      } catch (error) {
        performanceTests.push({
          test: 'session_lookup_query',
          duration: -1,
          target: 50,
          passed: false,
          error: error.message
        });
      }

      const response = {
        success: true,
        performanceTests,
        timestamp: new Date().toISOString(),
        requestId,
        phase1Status: {
          allTestsPassed: performanceTests.every(test => test.passed),
          averageQueryTime: performanceTests.reduce((sum, test) => sum + (test.duration > 0 ? test.duration : 0), 0) / performanceTests.filter(test => test.duration > 0).length
        }
      };

      return this.createResponse(200, {}, response);
    } catch (error) {
      console.error(`[${requestId}] Database performance test failed:`, error);
      return this.createErrorResponse(500, 'DB_PERFORMANCE_FAILED', 'Failed to test database performance', requestId);
    }
  }

  private async handleCircuitBreakerStats(requestId: string): Promise<Response> {
    try {
      // Initialize AI interpreter to get circuit breaker stats
      const aiInterpreter = await this.initializeAIInterpreter();

      if (!aiInterpreter) {
        return this.createErrorResponse(503, 'AI_NOT_AVAILABLE', 'AI interpreter not available', requestId);
      }

      // Get circuit breaker statistics (this would need to be exposed from AIInterpreter)
      const response = {
        success: true,
        circuitBreakerStats: {
          message: 'Circuit breaker monitoring active',
          failureThreshold: 5,
          recoveryTimeout: 60000,
          successThreshold: 3
        },
        timestamp: new Date().toISOString(),
        requestId,
        phase1Status: {
          targetFailureRate: 5,
          circuitBreakerActive: true
        }
      };

      return this.createResponse(200, {}, response);
    } catch (error) {
      console.error(`[${requestId}] Circuit breaker stats failed:`, error);
      return this.createErrorResponse(500, 'CIRCUIT_BREAKER_STATS_FAILED', 'Failed to retrieve circuit breaker statistics', requestId);
    }
  }

  // Enhanced Forecast Helper Methods
  private async generatePredictiveInsights(biorhythmResult: any, targetDate: string, requestId: string): Promise<PredictiveInsights | undefined> {
    if (!biorhythmResult || !biorhythmResult.forecast) return undefined;

    const forecast = biorhythmResult.forecast;
    const currentEnergy = biorhythmResult.overall_energy || 0;

    // Trend analysis
    const energyValues = forecast.map((day: any) => day.overall_energy);
    const trendDirection = this.calculateTrendDirection(energyValues);
    const confidence = this.calculateTrendConfidence(energyValues);

    // Critical periods identification
    const criticalPeriods = this.identifyCriticalPeriods(forecast, targetDate);

    // Optimal actions based on energy patterns
    const optimalActions = this.generateOptimalActions(biorhythmResult, targetDate);

    return {
      trendAnalysis: {
        direction: trendDirection,
        confidence,
        timeframe: '7 days'
      },
      criticalPeriods,
      optimalActions
    };
  }

  private calculateTrendDirection(energyValues: number[]): 'improving' | 'declining' | 'stable' {
    if (energyValues.length < 3) return 'stable';

    const firstThird = energyValues.slice(0, Math.floor(energyValues.length / 3));
    const lastThird = energyValues.slice(-Math.floor(energyValues.length / 3));

    const firstAvg = firstThird.reduce((sum, val) => sum + val, 0) / firstThird.length;
    const lastAvg = lastThird.reduce((sum, val) => sum + val, 0) / lastThird.length;

    const difference = lastAvg - firstAvg;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  private calculateTrendConfidence(energyValues: number[]): number {
    if (energyValues.length < 2) return 0.5;

    const volatility = this.calculateVolatility(energyValues);
    const maxVolatility = 50; // Assume max volatility of 50

    // Higher volatility = lower confidence
    return Math.max(0.3, Math.min(0.95, 1 - (volatility / maxVolatility)));
  }

  private identifyCriticalPeriods(forecast: any[], targetDate: string): PredictiveInsights['criticalPeriods'] {
    const periods: PredictiveInsights['criticalPeriods'] = [];
    const baseDate = new Date(targetDate);

    forecast.forEach((day, index) => {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + index);
      const dateStr = dayDate.toISOString().split('T')[0];

      // Identify critical days (very low or very high energy)
      if (day.overall_energy < -30) {
        periods.push({
          date: dateStr,
          type: 'challenge',
          description: 'Low energy period - focus on rest and recovery'
        });
      } else if (day.overall_energy > 70) {
        periods.push({
          date: dateStr,
          type: 'opportunity',
          description: 'High energy period - ideal for important tasks'
        });
      }

      // Identify transition points (significant energy changes)
      if (index > 0) {
        const energyChange = day.overall_energy - forecast[index - 1].overall_energy;
        if (Math.abs(energyChange) > 40) {
          periods.push({
            date: dateStr,
            type: 'transition',
            description: `Significant energy ${energyChange > 0 ? 'increase' : 'decrease'} - prepare for change`
          });
        }
      }
    });

    return periods;
  }

  private generateOptimalActions(biorhythmResult: any, targetDate: string): PredictiveInsights['optimalActions'] {
    const actions: PredictiveInsights['optimalActions'] = [];

    if (!biorhythmResult.cycles) return actions;

    const { physical, emotional, intellectual } = biorhythmResult.cycles;

    // Physical cycle recommendations
    if (physical?.percentage > 50) {
      actions.push({
        timing: 'morning',
        action: 'Schedule physical activities or exercise',
        reasoning: 'Physical cycle is in positive phase'
      });
    } else if (physical?.percentage < -30) {
      actions.push({
        timing: 'all day',
        action: 'Focus on rest and gentle activities',
        reasoning: 'Physical cycle is in critical phase'
      });
    }

    // Intellectual cycle recommendations
    if (intellectual?.percentage > 50) {
      actions.push({
        timing: 'mid-morning to afternoon',
        action: 'Tackle complex mental tasks and decision-making',
        reasoning: 'Intellectual cycle is at peak performance'
      });
    }

    // Emotional cycle recommendations
    if (emotional?.percentage > 50) {
      actions.push({
        timing: 'evening',
        action: 'Engage in social activities and creative pursuits',
        reasoning: 'Emotional cycle supports interpersonal connections'
      });
    } else if (emotional?.percentage < -30) {
      actions.push({
        timing: 'all day',
        action: 'Practice emotional self-care and avoid conflicts',
        reasoning: 'Emotional cycle is in sensitive phase'
      });
    }

    return actions;
  }

  private async generateEnhancedSynthesis(results: any[], targetDate: string, requestId: string): Promise<string> {
    // Try AI synthesis first
    if (this.aiInterpreter) {
      try {
        const validReadings = results.filter(r => r.success).map(r => ({
          engine: r.engine,
          data: r.data
        }));

        if (validReadings.length > 0) {
          const synthesis = await this.aiInterpreter.synthesizeMultipleReadings(
            validReadings,
            {
              model: 'anthropic/claude-3-haiku',
              maxTokens: 1200,
              temperature: 0.7,
              userContext: `Enhanced daily forecast synthesis for ${targetDate} with predictive insights`
            }
          );
          return synthesis.summary || synthesis.detailed_interpretation || 'Enhanced daily guidance synthesis generated';
        }
      } catch (error) {
        console.error(`[${requestId}] AI synthesis failed:`, error);
      }
    }

    // Fallback to enhanced basic synthesis
    const biorhythmResult = results.find(r => r.engine === 'biorhythm' && r.success)?.data;
    const ichingResult = results.find(r => r.engine === 'iching' && r.success)?.data;
    const tarotResult = results.find(r => r.engine === 'tarot' && r.success)?.data;

    let synthesis = `Enhanced Daily Forecast for ${targetDate}:\n\n`;

    if (biorhythmResult) {
      const energy = biorhythmResult.overall_energy;
      const energyDesc = energy > 50 ? 'High energy day with strong vitality' :
                        energy > 0 ? 'Moderate energy with balanced cycles' :
                        'Low energy day - focus on rest and reflection';
      synthesis += `🔋 Energy Profile: ${energyDesc}\n`;

      if (biorhythmResult.trend) {
        synthesis += `📈 Trend: ${biorhythmResult.trend} energy pattern\n`;
      }
    }

    if (ichingResult) {
      synthesis += `🔮 I-Ching Guidance: ${ichingResult.data?.rawData?.interpretation || ichingResult.data?.formattedOutput || 'Ancient wisdom for the day'}\n`;
    }

    if (tarotResult) {
      synthesis += `🃏 Tarot Insight: ${tarotResult.data?.rawData?.interpretation || tarotResult.data?.formattedOutput || 'Intuitive guidance for daily focus'}\n`;
    }

    synthesis += `\n✨ This enhanced forecast combines biorhythm cycles, ancient wisdom, and predictive analytics to provide comprehensive daily guidance.`;

    return synthesis;
  }

  private extractKeyThemes(synthesis: string, ichingResult: any, tarotResult: any): string[] {
    const themes: string[] = [];

    // Extract themes from synthesis
    const synthesisLower = synthesis.toLowerCase();
    if (synthesisLower.includes('energy')) themes.push('Energy Management');
    if (synthesisLower.includes('rest') || synthesisLower.includes('recovery')) themes.push('Rest & Recovery');
    if (synthesisLower.includes('creative') || synthesisLower.includes('creativity')) themes.push('Creativity');
    if (synthesisLower.includes('social') || synthesisLower.includes('relationship')) themes.push('Relationships');
    if (synthesisLower.includes('decision') || synthesisLower.includes('choice')) themes.push('Decision Making');
    if (synthesisLower.includes('physical') || synthesisLower.includes('exercise')) themes.push('Physical Activity');
    if (synthesisLower.includes('mental') || synthesisLower.includes('intellectual')) themes.push('Mental Focus');
    if (synthesisLower.includes('emotional') || synthesisLower.includes('feeling')) themes.push('Emotional Balance');

    // Add themes from I-Ching
    if (ichingResult?.themes) {
      themes.push(...ichingResult.themes);
    }

    // Add themes from Tarot
    if (tarotResult?.themes) {
      themes.push(...tarotResult.themes);
    }

    // Ensure we have at least some themes
    if (themes.length === 0) {
      themes.push('Daily Guidance', 'Personal Growth');
    }

    // Remove duplicates and limit to 5 themes
    return [...new Set(themes)].slice(0, 5);
  }

  private generateEnhancedRecommendations(
    energyProfile: EnergyProfile,
    guidance: ForecastGuidance,
    predictiveInsights?: PredictiveInsights
  ): string[] {
    const recommendations: string[] = [];

    // Energy-based recommendations
    switch (energyProfile.overallEnergy) {
      case 'high':
        recommendations.push('Take advantage of high energy for important tasks');
        recommendations.push('Schedule challenging activities during peak hours');
        break;
      case 'medium':
        recommendations.push('Maintain steady progress on ongoing projects');
        recommendations.push('Balance work with adequate rest periods');
        break;
      case 'low':
        recommendations.push('Focus on rest, reflection, and gentle activities');
        recommendations.push('Avoid making major decisions or commitments');
        break;
    }

    // Trend-based recommendations
    switch (energyProfile.trend) {
      case 'ascending':
        recommendations.push('Energy is building - prepare for increased activity');
        break;
      case 'descending':
        recommendations.push('Energy is declining - prioritize essential tasks');
        break;
      case 'volatile':
        recommendations.push('Energy is unstable - stay flexible and adaptable');
        break;
    }

    // Optimal timing recommendations
    if (energyProfile.optimalTiming) {
      if (energyProfile.optimalTiming.bestHours.length > 0) {
        recommendations.push(`Optimal productivity hours: ${energyProfile.optimalTiming.bestHours.join(', ')}`);
      }
      if (energyProfile.optimalTiming.avoidHours.length > 0) {
        recommendations.push(`Avoid demanding tasks during: ${energyProfile.optimalTiming.avoidHours.join(', ')}`);
      }
    }

    // Predictive insights recommendations
    if (predictiveInsights) {
      predictiveInsights.optimalActions.forEach(action => {
        recommendations.push(`${action.timing}: ${action.action}`);
      });
    }

    // Theme-based recommendations
    guidance.keyThemes.forEach(theme => {
      switch (theme.toLowerCase()) {
        case 'creativity':
          recommendations.push('Engage in creative activities and artistic expression');
          break;
        case 'relationships':
          recommendations.push('Focus on meaningful connections and communication');
          break;
        case 'decision making':
          recommendations.push('Take time for thoughtful decision-making processes');
          break;
      }
    });

    // Ensure we have a reasonable number of recommendations
    return recommendations.slice(0, 8);
  }

  // Daily Forecast Utility Methods
  private async getUserProfileForForecast(userId: string): Promise<any | null> {
    try {
      // Try to get user profile from KV storage first
      const profile = await this.kvData.getUserProfileOptimized(userId, 'numerology');
      if (profile && profile.input && profile.input.birthDate) {
        return {
          birthDate: profile.input.birthDate,
          birthTime: profile.input.birthTime,
          latitude: profile.input.latitude,
          longitude: profile.input.longitude,
          name: profile.input.name,
          preferences: profile.input.preferences
        };
      }

      // Fallback to database user data
      const user = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
      if (user && user.preferences) {
        const prefs = JSON.parse(user.preferences);
        if (prefs.birthDate) {
          return {
            birthDate: prefs.birthDate,
            birthTime: prefs.birthTime,
            latitude: prefs.latitude,
            longitude: prefs.longitude,
            name: user.name,
            preferences: prefs
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get user profile for forecast:', error);
      return null;
    }
  }

  private isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;

    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private generateDateRange(days: number): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  private analyzeBatchEnergyTrend(forecasts: DailyForecast[]): string {
    if (forecasts.length === 0) return 'stable';

    const energyLevels = forecasts.map(f => {
      switch (f.energyProfile.overallEnergy) {
        case 'high': return 3;
        case 'medium': return 2;
        case 'low': return 1;
        default: return 2;
      }
    });

    const firstHalf = energyLevels.slice(0, Math.floor(energyLevels.length / 2));
    const secondHalf = energyLevels.slice(Math.floor(energyLevels.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 0.3) return 'improving';
    if (difference < -0.3) return 'declining';
    return 'stable';
  }

  private extractBatchInsights(forecasts: DailyForecast[]): string[] {
    const insights: string[] = [];

    // Count energy levels
    const energyCounts = { high: 0, medium: 0, low: 0 };
    forecasts.forEach(f => energyCounts[f.energyProfile.overallEnergy]++);

    const totalDays = forecasts.length;

    if (energyCounts.high > totalDays * 0.5) {
      insights.push('High energy period ahead - excellent for major projects');
    } else if (energyCounts.low > totalDays * 0.5) {
      insights.push('Lower energy period - focus on rest and planning');
    } else {
      insights.push('Balanced energy period - steady progress expected');
    }

    // Analyze trends
    const trends = forecasts.map(f => f.energyProfile.trend);
    const ascendingCount = trends.filter(t => t === 'ascending').length;
    const descendingCount = trends.filter(t => t === 'descending').length;

    if (ascendingCount > descendingCount) {
      insights.push('Overall upward energy trend detected');
    } else if (descendingCount > ascendingCount) {
      insights.push('Energy levels may be declining - plan accordingly');
    }

    // Critical days analysis
    const criticalDays = forecasts.reduce((total, f) => total + f.energyProfile.criticalDays.length, 0);
    if (criticalDays > 0) {
      insights.push(`${criticalDays} critical energy days identified`);
    }

    // Key themes analysis
    const allThemes = forecasts.flatMap(f => f.guidance.keyThemes);
    const themeCount = allThemes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dominantTheme = Object.entries(themeCount).sort(([,a], [,b]) => b - a)[0];
    if (dominantTheme) {
      insights.push(`Dominant theme: ${dominantTheme[0]}`);
    }

    return insights.slice(0, 5);
  }

  private formatDailyForecastForRaycast(forecast: DailyForecast): any {
    const energyIcon = forecast.energyProfile.overallEnergy === 'high' ? '⚡' :
                      forecast.energyProfile.overallEnergy === 'medium' ? '🔋' : '🔋';

    const trendIcon = forecast.energyProfile.trend === 'ascending' ? '📈' :
                      forecast.energyProfile.trend === 'descending' ? '📉' : '➡️';

    return {
      title: `Daily Forecast - ${forecast.date}`,
      subtitle: `${energyIcon} ${forecast.energyProfile.overallEnergy.toUpperCase()} energy ${trendIcon}`,
      accessories: [
        { text: forecast.energyProfile.overallEnergy, icon: energyIcon },
        { text: forecast.energyProfile.trend, icon: trendIcon }
      ],
      detail: {
        markdown: this.generateRaycastMarkdown(forecast),
        metadata: {
          'Energy Level': forecast.energyProfile.overallEnergy,
          'Trend': forecast.energyProfile.trend,
          'Key Themes': forecast.guidance.keyThemes.join(', '),
          'Critical Days': forecast.energyProfile.criticalDays.length.toString()
        }
      },
      actions: [
        {
          title: 'View Full Forecast',
          icon: '📊',
          shortcut: { modifiers: ['cmd'], key: 'f' }
        },
        {
          title: 'Copy Recommendations',
          icon: '📋',
          shortcut: { modifiers: ['cmd'], key: 'c' }
        }
      ]
    };
  }

  private generateRaycastMarkdown(forecast: DailyForecast): string {
    let markdown = `# Daily Forecast - ${forecast.date}\n\n`;

    // Energy Profile
    markdown += `## ⚡ Energy Profile\n`;
    markdown += `- **Overall Energy:** ${forecast.energyProfile.overallEnergy.toUpperCase()}\n`;
    markdown += `- **Trend:** ${forecast.energyProfile.trend}\n`;

    if (forecast.energyProfile.biorhythm) {
      markdown += `- **Physical:** ${forecast.energyProfile.biorhythm.physical.toFixed(1)}%\n`;
      markdown += `- **Emotional:** ${forecast.energyProfile.biorhythm.emotional.toFixed(1)}%\n`;
      markdown += `- **Intellectual:** ${forecast.energyProfile.biorhythm.intellectual.toFixed(1)}%\n`;
    }

    if (forecast.energyProfile.optimalTiming) {
      markdown += `\n### 🕐 Optimal Timing\n`;
      markdown += `- **Peak Energy:** ${forecast.energyProfile.optimalTiming.peakEnergy}\n`;
      if (forecast.energyProfile.optimalTiming.bestHours.length > 0) {
        markdown += `- **Best Hours:** ${forecast.energyProfile.optimalTiming.bestHours.join(', ')}\n`;
      }
    }

    // Key Themes
    if (forecast.guidance.keyThemes.length > 0) {
      markdown += `\n## 🎯 Key Themes\n`;
      forecast.guidance.keyThemes.forEach(theme => {
        markdown += `- ${theme}\n`;
      });
    }

    // Recommendations
    if (forecast.recommendations.length > 0) {
      markdown += `\n## 💡 Recommendations\n`;
      forecast.recommendations.forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }

    // Guidance Synthesis
    markdown += `\n## 🔮 Guidance\n`;
    markdown += `${forecast.guidance.synthesis}\n`;

    // Predictive Insights
    if (forecast.predictiveInsights) {
      markdown += `\n## 📈 Predictive Insights\n`;
      markdown += `**Trend:** ${forecast.predictiveInsights.trendAnalysis.direction} (${(forecast.predictiveInsights.trendAnalysis.confidence * 100).toFixed(0)}% confidence)\n\n`;

      if (forecast.predictiveInsights.criticalPeriods.length > 0) {
        markdown += `**Critical Periods:**\n`;
        forecast.predictiveInsights.criticalPeriods.forEach(period => {
          markdown += `- ${period.date}: ${period.description}\n`;
        });
      }
    }

    return markdown;
  }

  // Weekly Forecast Generation and Utility Methods
  private async generateWeeklyForecast(
    dailyForecasts: DailyForecast[],
    userProfile: any,
    requestId: string,
    raycastOptimized: boolean = false
  ): Promise<WeeklyForecast> {
    return await WeeklySynthesizer.generateWeeklyForecast(
      dailyForecasts,
      userProfile,
      requestId,
      raycastOptimized
    );
  }

  private getCurrentWeekStart(): string {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Get Monday of current week
    return monday.toISOString().split('T')[0];
  }

  private generateWeekDates(weekStart: string): string[] {
    const dates: string[] = [];
    const startDate = new Date(weekStart);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
  }

  private generateWeekRange(weeksCount: number): string[] {
    const weeks: string[] = [];
    const today = new Date();

    for (let i = 0; i < weeksCount; i++) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + 1 + (i * 7)); // Monday of each week
      weeks.push(weekStart.toISOString().split('T')[0]);
    }

    return weeks;
  }

  private extractBatchWeeklyThemes(weeklyForecasts: WeeklyForecast[]): string[] {
    const allThemes = weeklyForecasts.flatMap(f => f.dominantThemes);
    const themeCount = allThemes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  private analyzeBatchWeeklyTrend(weeklyForecasts: WeeklyForecast[]): string {
    if (weeklyForecasts.length === 0) return 'stable';

    // Analyze energy patterns across weeks
    const weeklyEnergyScores = weeklyForecasts.map(forecast => {
      const dailyEnergies = forecast.dailyForecasts.map(daily => {
        switch (daily.energyProfile.overallEnergy) {
          case 'high': return 3;
          case 'medium': return 2;
          case 'low': return 1;
          default: return 2;
        }
      });
      return dailyEnergies.reduce((sum, energy) => sum + energy, 0) / dailyEnergies.length;
    });

    if (weeklyEnergyScores.length < 2) return 'stable';

    const firstHalf = weeklyEnergyScores.slice(0, Math.floor(weeklyEnergyScores.length / 2));
    const secondHalf = weeklyEnergyScores.slice(Math.floor(weeklyEnergyScores.length / 2));

    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;

    const difference = secondAvg - firstAvg;

    if (difference > 0.3) return 'improving energy trend across weeks';
    if (difference < -0.3) return 'declining energy trend across weeks';
    return 'stable energy pattern across weeks';
  }

  // Enhanced Daily Workflow Helper Methods
  private generateWorkflowRecommendations(energyProfile: any, ichingResult: any, tarotResult: any): string[] {
    const recommendations: string[] = [];

    // Energy-based recommendations
    switch (energyProfile.overallEnergy) {
      case 'high':
        recommendations.push('Take advantage of high energy for important tasks and goals');
        recommendations.push('Schedule challenging activities during peak energy hours');
        break;
      case 'medium':
        recommendations.push('Maintain steady progress on ongoing projects');
        recommendations.push('Balance productive work with adequate rest periods');
        break;
      case 'low':
        recommendations.push('Focus on rest, reflection, and gentle activities');
        recommendations.push('Avoid making major decisions or commitments today');
        break;
    }

    // I-Ching based recommendations
    if (ichingResult && ichingResult.data) {
      const hexagram = ichingResult.data.hexagram;
      if (hexagram && hexagram.name) {
        recommendations.push(`I-Ching guidance: Embody the energy of ${hexagram.name}`);
      }
      if (ichingResult.data.advice) {
        recommendations.push(`Ancient wisdom: ${ichingResult.data.advice}`);
      }
    }

    // Tarot based recommendations
    if (tarotResult && tarotResult.data) {
      const card = tarotResult.data.card;
      if (card && card.name) {
        recommendations.push(`Tarot insight: Channel the energy of ${card.name}`);
      }
      if (tarotResult.data.advice) {
        recommendations.push(`Intuitive guidance: ${tarotResult.data.advice}`);
      }
    }

    // Optimal timing recommendations
    if (energyProfile.optimalTiming) {
      if (energyProfile.optimalTiming.bestHours.length > 0) {
        recommendations.push(`Optimal productivity hours: ${energyProfile.optimalTiming.bestHours.join(', ')}`);
      }
      recommendations.push(`Peak energy period: ${energyProfile.optimalTiming.peakEnergy}`);
    }

    return recommendations.slice(0, 6); // Limit to 6 recommendations
  }

  private async generateBasicSynthesis(results: any[], date: string, requestId: string): Promise<string> {
    // Try AI synthesis first
    if (this.aiInterpreter) {
      try {
        const validReadings = results.filter(r => r.success).map(r => ({
          engine: r.engine,
          data: r.data
        }));

        if (validReadings.length > 0) {
          const synthesis = await this.aiInterpreter.synthesizeMultipleReadings(
            validReadings,
            {
              model: 'anthropic/claude-3-haiku',
              maxTokens: 800,
              temperature: 0.7,
              userContext: `Daily workflow synthesis for ${date}`
            }
          );
          return synthesis.summary || synthesis.detailed_interpretation || 'Daily guidance synthesis generated';
        }
      } catch (error) {
        console.error(`[${requestId}] AI synthesis failed:`, error);
      }
    }

    // Fallback to basic synthesis
    const biorhythmResult = results.find(r => r.engine === 'biorhythm' && r.success)?.data;
    const ichingResult = results.find(r => r.engine === 'iching' && r.success)?.data;
    const tarotResult = results.find(r => r.engine === 'tarot' && r.success)?.data;

    let synthesis = `Daily Workflow Guidance for ${date}:\n\n`;

    if (biorhythmResult) {
      const energy = biorhythmResult.overall_energy || 0;
      const energyDesc = energy > 50 ? 'High energy day with strong vitality' :
                        energy > 0 ? 'Moderate energy with balanced cycles' :
                        'Low energy day - focus on rest and reflection';
      synthesis += `🔋 Energy: ${energyDesc}\n`;
    }

    if (ichingResult && ichingResult.data) {
      synthesis += `🔮 I-Ching: ${ichingResult.data.interpretation || ichingResult.data.meaning || 'Ancient wisdom guidance'}\n`;
    }

    if (tarotResult && tarotResult.data) {
      synthesis += `🃏 Tarot: ${tarotResult.data.interpretation || tarotResult.data.meaning || 'Intuitive insight for the day'}\n`;
    }

    synthesis += `\n✨ This daily workflow combines biorhythm awareness, ancient wisdom, and intuitive guidance for holistic daily planning.`;

    return synthesis;
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
      const { userProfile, question, forecastMode = false, includePredictive = false } = body;

      if (!userProfile) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile required for daily guidance workflow', requestId);
      }

      const today = new Date().toISOString().split('T')[0];
      const dailyQuestion = question || `What guidance and energy insights do I need for today, ${today}?`;

      console.log(`[${requestId}] Enhanced daily workflow for ${today}, forecast mode: ${forecastMode}`);

      // Enhanced daily workflow with forecast logic
      const calculations = [
        {
          engine: 'biorhythm' as const,
          input: {
            birth_date: userProfile.birthDate,
            target_date: today,
            forecast_days: includePredictive ? 7 : 1, // Extended forecast for predictive insights
            include_extended_cycles: forecastMode,
            include_critical_days: forecastMode
          }
        },
        {
          engine: 'iching' as const,
          input: {
            question: dailyQuestion,
            method: 'random',
            includeChangingLines: true,
            include_interpretation: forecastMode
          }
        },
        {
          engine: 'tarot' as const,
          input: {
            question: dailyQuestion,
            spreadType: 'single_card',
            focusArea: 'daily_guidance',
            include_detailed_meaning: forecastMode
          }
        }
      ];

      const results = await Promise.all(
        calculations.map(async calc => {
          try {
            const result = await calculateEngine(calc.engine, calc.input);
            return { engine: calc.engine, success: true, data: result };
          } catch (error) {
            console.error(`[${requestId}] Engine ${calc.engine} failed:`, error);
            return { engine: calc.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
          }
        })
      );

      // Enhanced response with forecast-style features
      let response: any = {
        workflowType: 'daily',
        date: today,
        question: dailyQuestion,
        results,
        requestId,
        timestamp: new Date().toISOString()
      };

      if (forecastMode) {
        // Generate forecast-style response
        const biorhythmResult = results.find(r => r.engine === 'biorhythm' && r.success)?.data;
        const ichingResult = results.find(r => r.engine === 'iching' && r.success)?.data;
        const tarotResult = results.find(r => r.engine === 'tarot' && r.success)?.data;

        // Analyze energy profile
        const energyProfile = this.analyzeEnhancedEnergyProfile(biorhythmResult, today);

        // Generate enhanced synthesis
        const synthesis = await this.generateEnhancedSynthesis(results, today, requestId);

        // Extract key themes
        const keyThemes = this.extractKeyThemes(synthesis, ichingResult, tarotResult);

        // Generate recommendations
        const recommendations = this.generateWorkflowRecommendations(energyProfile, ichingResult, tarotResult);

        // Add forecast-style enhancements
        response.forecast = {
          energyProfile,
          guidance: {
            iching: ichingResult ? {
              hexagram: ichingResult.data?.rawData?.hexagram || ichingResult.data?.hexagram,
              interpretation: ichingResult.data?.rawData?.interpretation || ichingResult.data?.formattedOutput,
              changingLines: ichingResult.data?.rawData?.changingLines || ichingResult.data?.changingLines
            } : undefined,
            tarot: tarotResult ? {
              card: tarotResult.data?.rawData?.card || tarotResult.data?.card,
              interpretation: tarotResult.data?.rawData?.interpretation || tarotResult.data?.formattedOutput,
              focusArea: 'daily_guidance'
            } : undefined,
            synthesis,
            keyThemes
          },
          recommendations
        };

        // Add predictive insights if requested
        if (includePredictive && biorhythmResult) {
          response.forecast.predictiveInsights = await this.generatePredictiveInsights(biorhythmResult, today, requestId);
        }

        // Add trend analysis
        if (biorhythmResult) {
          response.forecast.trendAnalysis = {
            currentTrend: this.analyzeBiorhythmTrend(biorhythmResult),
            criticalDays: biorhythmResult.critical_days_ahead || [],
            optimalTiming: this.calculateOptimalTiming(biorhythmResult, today)
          };
        }
      } else {
        // Standard workflow response
        response.synthesis = await this.generateBasicSynthesis(results, today, requestId);
      }

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Enhanced daily workflow failed:`, error);
      return this.createErrorResponse(500, 'DAILY_WORKFLOW_FAILED', 'Enhanced daily workflow calculation failed', requestId);
    }
  }

  // Daily Forecast API Implementation
  private async handleDailyForecast(request: Request, requestId: string): Promise<Response> {
    try {
      const url = new URL(request.url);
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const raycastOptimized = url.searchParams.get('raycast') === 'true';

      // Get authenticated user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for daily forecast', requestId);
      }

      const user = authResult.user;
      console.log(`[${requestId}] Daily forecast for user ${user.id} on ${date}`);

      // Check cache first
      const cachedForecast = await this.kvData.getDailyForecastCache(user.id.toString(), date);
      if (cachedForecast) {
        console.log(`[${requestId}] Returning cached daily forecast`);
        return this.createResponse(200, {}, {
          forecast: cachedForecast,
          cached: true,
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Get user profile for forecast generation
      const userProfile = await this.getUserProfileForForecast(user.id.toString());
      if (!userProfile) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile required for forecast generation', requestId);
      }

      // Generate enhanced daily forecast
      const forecast = await this.generateEnhancedDailyForecast(userProfile, date, requestId, raycastOptimized);

      // Cache the forecast (6 hours TTL)
      await this.kvData.setDailyForecastCache(user.id.toString(), date, forecast);

      // Create timeline entry
      await this.createTimelineEntry(
        user.id.toString(),
        'forecast_daily',
        { date, userProfile },
        forecast,
        {
          confidence: 85,
          cached: false,
          requestId,
          source: 'api'
        }
      );

      return this.createResponse(200, {}, {
        forecast,
        cached: false,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Daily forecast failed:`, error);
      return this.createErrorResponse(500, 'DAILY_FORECAST_FAILED', 'Daily forecast generation failed', requestId);
    }
  }

  private async handleDailyForecastByDate(request: Request, requestId: string, date: string): Promise<Response> {
    try {
      // Validate date format
      if (!this.isValidDate(date)) {
        return this.createErrorResponse(400, 'INVALID_DATE', 'Invalid date format. Use YYYY-MM-DD', requestId);
      }

      // Create a new request with the date parameter
      const url = new URL(request.url);
      url.searchParams.set('date', date);
      const modifiedRequest = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      return await this.handleDailyForecast(modifiedRequest, requestId);

    } catch (error) {
      console.error(`[${requestId}] Daily forecast by date failed:`, error);
      return this.createErrorResponse(500, 'DAILY_FORECAST_FAILED', 'Daily forecast generation failed', requestId);
    }
  }

  private async handleDailyForecastBatch(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json() as ForecastBatchRequest;
      const { dates, days = 7, includeWeekly = false, raycastOptimized = false, userProfile } = body;

      if (!userProfile || !userProfile.birthDate) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile with birth date required for batch forecast', requestId);
      }

      // Get authenticated user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for batch forecast', requestId);
      }

      const user = authResult.user;
      console.log(`[${requestId}] Batch daily forecast for user ${user.id}`);

      // Generate date range
      const targetDates = dates || this.generateDateRange(days);

      // Generate daily forecasts in parallel
      const dailyForecasts = await Promise.all(
        targetDates.map(async (date) => {
          // Check cache first
          const cached = await this.kvData.getDailyForecastCache(user.id.toString(), date);
          if (cached) {
            return cached;
          }

          // Generate new forecast
          const forecast = await this.generateEnhancedDailyForecast(userProfile, date, requestId, raycastOptimized);

          // Cache it
          await this.kvData.setDailyForecastCache(user.id.toString(), date, forecast);

          return forecast;
        })
      );

      // Generate weekly forecast if requested
      let weeklyForecast: WeeklyForecast | undefined;
      if (includeWeekly) {
        weeklyForecast = await this.generateWeeklyForecast(dailyForecasts, userProfile, requestId);
      }

      const response: ForecastBatchResponse = {
        dailyForecasts,
        weeklyForecast,
        summary: {
          totalDays: dailyForecasts.length,
          energyTrend: this.analyzeBatchEnergyTrend(dailyForecasts),
          keyInsights: this.extractBatchInsights(dailyForecasts)
        },
        cached: false,
        requestId,
        timestamp: new Date().toISOString()
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Batch daily forecast failed:`, error);
      return this.createErrorResponse(500, 'BATCH_FORECAST_FAILED', 'Batch forecast generation failed', requestId);
    }
  }

  // Weekly Forecast API Implementation
  private async handleWeeklyForecast(request: Request, requestId: string): Promise<Response> {
    try {
      const url = new URL(request.url);
      const weekStart = url.searchParams.get('week') || this.getCurrentWeekStart();
      const raycastOptimized = url.searchParams.get('raycast') === 'true';

      // Get authenticated user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for weekly forecast', requestId);
      }

      const user = authResult.user;
      console.log(`[${requestId}] Weekly forecast for user ${user.id} starting ${weekStart}`);

      // Check cache first
      const cachedForecast = await this.kvData.getWeeklyForecastCache(user.id.toString(), weekStart);
      if (cachedForecast) {
        console.log(`[${requestId}] Returning cached weekly forecast`);
        return this.createResponse(200, {}, {
          forecast: cachedForecast,
          cached: true,
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Get user profile for forecast generation
      const userProfile = await this.getUserProfileForForecast(user.id.toString());
      if (!userProfile) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile required for forecast generation', requestId);
      }

      // Generate daily forecasts for the week
      const weekDates = this.generateWeekDates(weekStart);
      const dailyForecasts = await Promise.all(
        weekDates.map(async (date) => {
          // Check if daily forecast is cached
          const cached = await this.kvData.getDailyForecastCache(user.id.toString(), date);
          if (cached) {
            return cached;
          }

          // Generate new daily forecast
          return await this.generateEnhancedDailyForecast(userProfile, date, requestId, raycastOptimized);
        })
      );

      // Generate weekly synthesis
      const weeklyForecast = await this.generateWeeklyForecast(dailyForecasts, userProfile, requestId, raycastOptimized);

      // Cache the weekly forecast (24 hours TTL)
      await this.kvData.setWeeklyForecastCache(user.id.toString(), weekStart, weeklyForecast);

      // Create timeline entry
      await this.createTimelineEntry(
        user.id.toString(),
        'forecast_weekly',
        { weekStart, userProfile },
        weeklyForecast,
        {
          confidence: 80,
          cached: false,
          requestId,
          source: 'api'
        }
      );

      return this.createResponse(200, {}, {
        forecast: weeklyForecast,
        cached: false,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Weekly forecast failed:`, error);
      return this.createErrorResponse(500, 'WEEKLY_FORECAST_FAILED', 'Weekly forecast generation failed', requestId);
    }
  }

  private async handleWeeklyForecastByWeek(request: Request, requestId: string, week: string): Promise<Response> {
    try {
      // Validate week format (YYYY-MM-DD for Monday of the week)
      if (!this.isValidDate(week)) {
        return this.createErrorResponse(400, 'INVALID_WEEK', 'Invalid week format. Use YYYY-MM-DD for Monday of the week', requestId);
      }

      // Ensure the date is a Monday
      const weekDate = new Date(week);
      if (weekDate.getDay() !== 1) { // 1 = Monday
        // Adjust to the Monday of that week
        const monday = new Date(weekDate);
        monday.setDate(weekDate.getDate() - weekDate.getDay() + 1);
        week = monday.toISOString().split('T')[0];
      }

      // Create a new request with the week parameter
      const url = new URL(request.url);
      url.searchParams.set('week', week);
      const modifiedRequest = new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body
      });

      return await this.handleWeeklyForecast(modifiedRequest, requestId);

    } catch (error) {
      console.error(`[${requestId}] Weekly forecast by week failed:`, error);
      return this.createErrorResponse(500, 'WEEKLY_FORECAST_FAILED', 'Weekly forecast generation failed', requestId);
    }
  }

  private async handleWeeklyForecastBatch(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { weeks, weeksCount = 4, userProfile } = body;

      if (!userProfile || !userProfile.birthDate) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile with birth date required for batch weekly forecast', requestId);
      }

      // Get authenticated user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for batch weekly forecast', requestId);
      }

      const user = authResult.user;
      console.log(`[${requestId}] Batch weekly forecast for user ${user.id}`);

      // Generate week range
      const targetWeeks = weeks || this.generateWeekRange(weeksCount);

      // Generate weekly forecasts in parallel
      const weeklyForecasts = await Promise.all(
        targetWeeks.map(async (weekStart: string) => {
          // Check cache first
          const cached = await this.kvData.getWeeklyForecastCache(user.id.toString(), weekStart);
          if (cached) {
            return cached;
          }

          // Generate daily forecasts for the week
          const weekDates = this.generateWeekDates(weekStart);
          const dailyForecasts = await Promise.all(
            weekDates.map(date => this.generateEnhancedDailyForecast(userProfile, date, requestId))
          );

          // Generate weekly forecast
          const weeklyForecast = await this.generateWeeklyForecast(dailyForecasts, userProfile, requestId);

          // Cache it
          await this.kvData.setWeeklyForecastCache(user.id.toString(), weekStart, weeklyForecast);

          return weeklyForecast;
        })
      );

      const response = {
        weeklyForecasts,
        summary: {
          totalWeeks: weeklyForecasts.length,
          dominantThemes: this.extractBatchWeeklyThemes(weeklyForecasts),
          overallTrend: this.analyzeBatchWeeklyTrend(weeklyForecasts)
        },
        cached: false,
        requestId,
        timestamp: new Date().toISOString()
      };

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Batch weekly forecast failed:`, error);
      return this.createErrorResponse(500, 'BATCH_WEEKLY_FORECAST_FAILED', 'Batch weekly forecast generation failed', requestId);
    }
  }

  // Raycast Integration Endpoints
  private async handleRaycastDailyIntegration(request: Request, requestId: string): Promise<Response> {
    try {
      const url = new URL(request.url);
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];

      // Get authenticated user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for Raycast integration', requestId);
      }

      const user = authResult.user;
      console.log(`[${requestId}] Raycast daily integration for user ${user.id} on ${date}`);

      // Get user profile
      const userProfile = await this.getUserProfileForForecast(user.id.toString());
      if (!userProfile) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile required for Raycast integration', requestId);
      }

      // Generate Raycast-optimized daily forecast
      const forecast = await this.generateEnhancedDailyForecast(userProfile, date, requestId, true);

      // Format specifically for Raycast
      const raycastResponse = {
        success: true,
        data: forecast.raycastOptimized,
        metadata: {
          date,
          energyLevel: forecast.energyProfile.overallEnergy,
          trend: forecast.energyProfile.trend,
          keyThemes: forecast.guidance.keyThemes,
          requestId,
          timestamp: new Date().toISOString()
        }
      };

      return this.createResponse(200, {}, raycastResponse);

    } catch (error) {
      console.error(`[${requestId}] Raycast daily integration failed:`, error);
      return this.createErrorResponse(500, 'RAYCAST_DAILY_FAILED', 'Raycast daily integration failed', requestId);
    }
  }

  private async handleRaycastWeeklyIntegration(request: Request, requestId: string): Promise<Response> {
    try {
      const url = new URL(request.url);
      const weekStart = url.searchParams.get('week') || this.getCurrentWeekStart();

      // Get authenticated user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for Raycast integration', requestId);
      }

      const user = authResult.user;
      console.log(`[${requestId}] Raycast weekly integration for user ${user.id} starting ${weekStart}`);

      // Get user profile
      const userProfile = await this.getUserProfileForForecast(user.id.toString());
      if (!userProfile) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile required for Raycast integration', requestId);
      }

      // Generate daily forecasts for the week
      const weekDates = this.generateWeekDates(weekStart);
      const dailyForecasts = await Promise.all(
        weekDates.map(date => this.generateEnhancedDailyForecast(userProfile, date, requestId, true))
      );

      // Generate Raycast-optimized weekly forecast
      const weeklyForecast = await this.generateWeeklyForecast(dailyForecasts, userProfile, requestId, true);

      // Format specifically for Raycast
      const raycastResponse = {
        success: true,
        data: weeklyForecast.raycastOptimized,
        metadata: {
          weekStart,
          weekEnd: weeklyForecast.weekEnd,
          dominantThemes: weeklyForecast.dominantThemes,
          weeklyTheme: weeklyForecast.weeklyInsights.weeklyTheme,
          requestId,
          timestamp: new Date().toISOString()
        }
      };

      return this.createResponse(200, {}, raycastResponse);

    } catch (error) {
      console.error(`[${requestId}] Raycast weekly integration failed:`, error);
      return this.createErrorResponse(500, 'RAYCAST_WEEKLY_FAILED', 'Raycast weekly integration failed', requestId);
    }
  }

  private async handleRaycastCustomIntegration(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { type, parameters, userProfile } = body;

      if (!type) {
        return this.createErrorResponse(400, 'MISSING_TYPE', 'Integration type required', requestId);
      }

      // Get authenticated user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for Raycast integration', requestId);
      }

      const user = authResult.user;
      console.log(`[${requestId}] Raycast custom integration for user ${user.id}, type: ${type}`);

      let raycastResponse;

      switch (type) {
        case 'quick_daily':
          raycastResponse = await this.generateRaycastQuickDaily(user.id.toString(), parameters, requestId);
          break;
        case 'energy_check':
          raycastResponse = await this.generateRaycastEnergyCheck(user.id.toString(), parameters, requestId);
          break;
        case 'weekly_summary':
          raycastResponse = await this.generateRaycastWeeklySummary(user.id.toString(), parameters, requestId);
          break;
        case 'optimal_timing':
          raycastResponse = await this.generateRaycastOptimalTiming(user.id.toString(), parameters, requestId);
          break;
        default:
          return this.createErrorResponse(400, 'INVALID_TYPE', `Unsupported integration type: ${type}`, requestId);
      }

      return this.createResponse(200, {}, {
        success: true,
        data: raycastResponse,
        metadata: {
          type,
          requestId,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error(`[${requestId}] Raycast custom integration failed:`, error);
      return this.createErrorResponse(500, 'RAYCAST_CUSTOM_FAILED', 'Raycast custom integration failed', requestId);
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

  // Forecast API Handlers
  private async handleDailyForecast(request: Request, requestId: string, targetDate?: string): Promise<Response> {
    try {
      // Get user from authentication
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for forecast', requestId);
      }

      const user = authResult.user;
      const date = targetDate || new Date().toISOString().split('T')[0];

      // Check cache first
      const cachedForecast = await this.kvData.getDailyForecastCache(user.id.toString(), date);
      if (cachedForecast) {
        console.log(`[${requestId}] Daily forecast cache hit for ${date}`);
        return this.createResponse(200, {}, {
          forecast: cachedForecast.forecast,
          cached: true,
          cachedAt: cachedForecast.cachedAt,
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Get user profile for birth data
      const userProfile = await this.getUserProfileFromAuth(user);
      if (!userProfile) {
        return this.createErrorResponse(400, 'PROFILE_REQUIRED', 'User profile with birth data required for forecast', requestId);
      }

      // Generate daily forecast
      const forecast = await this.generateDailyForecast(userProfile, date, requestId);

      // Cache the forecast
      await this.kvData.setDailyForecastCache(user.id.toString(), date, forecast);

      // Create timeline entry
      await this.createTimelineEntry(
        user.id.toString(),
        'forecast_daily',
        { date, userProfile },
        forecast,
        {
          confidence: 85, // Daily forecasts have good confidence
          cached: false,
          requestId,
          source: 'api'
        }
      );

      return this.createResponse(200, {}, {
        forecast,
        cached: false,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Daily forecast failed:`, error);
      return this.createErrorResponse(500, 'DAILY_FORECAST_FAILED', 'Daily forecast generation failed', requestId);
    }
  }

  private async generateDailyForecast(userProfile: any, targetDate: string, requestId: string): Promise<DailyForecast> {
    const dailyQuestion = `What guidance and energy insights do I need for ${targetDate}?`;

    // Execute enhanced daily forecast calculations
    const calculations = [
      {
        engine: 'biorhythm' as const,
        input: {
          birthDate: userProfile.birthDate,
          targetDate: targetDate,
          forecast_days: 7,
          include_extended_cycles: true
        }
      },
      {
        engine: 'iching' as const,
        input: {
          question: dailyQuestion,
          method: 'random',
          includeChangingLines: true
        }
      },
      {
        engine: 'tarot' as const,
        input: {
          question: dailyQuestion,
          spreadType: 'single_card',
          focusArea: 'daily_guidance'
        }
      }
    ];

    const results = await Promise.all(
      calculations.map(async calc => {
        try {
          const result = await calculateEngine(calc.engine, calc.input);
          return { engine: calc.engine, success: true, data: result };
        } catch (error) {
          console.error(`[${requestId}] Engine ${calc.engine} failed:`, error);
          return { engine: calc.engine, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    // Extract successful results
    const biorhythmResult = results.find(r => r.engine === 'biorhythm' && r.success)?.data;
    const ichingResult = results.find(r => r.engine === 'iching' && r.success)?.data;
    const tarotResult = results.find(r => r.engine === 'tarot' && r.success)?.data;

    // Analyze energy profile
    const energyProfile = this.analyzeEnergyProfile(biorhythmResult, targetDate);

    // Generate synthesis
    const synthesis = await this.generateForecastSynthesis(biorhythmResult, ichingResult, tarotResult, targetDate, requestId);

    // Generate recommendations
    const recommendations = this.generateForecastRecommendations(biorhythmResult, ichingResult, tarotResult);

    return {
      date: targetDate,
      energyProfile,
      guidance: {
        iching: ichingResult,
        tarot: tarotResult,
        synthesis
      },
      recommendations
    };
  }

  private analyzeEnergyProfile(biorhythmResult: any, targetDate: string): DailyForecast['energyProfile'] {
    if (!biorhythmResult) {
      return {
        biorhythm: null,
        overallEnergy: 'medium',
        criticalDays: [],
        trend: 'stable'
      };
    }

    const overallEnergy = biorhythmResult.overall_energy;
    let energyLevel: 'high' | 'medium' | 'low';

    if (overallEnergy > 50) {
      energyLevel = 'high';
    } else if (overallEnergy > 0) {
      energyLevel = 'medium';
    } else {
      energyLevel = 'low';
    }

    return {
      biorhythm: biorhythmResult,
      overallEnergy: energyLevel,
      criticalDays: biorhythmResult.critical_days_ahead || [],
      trend: biorhythmResult.trend || 'stable'
    };
  }

  private async generateForecastSynthesis(
    biorhythmResult: any,
    ichingResult: any,
    tarotResult: any,
    targetDate: string,
    requestId: string
  ): Promise<string> {
    // If AI interpreter is available, use it for synthesis
    if (this.aiInterpreter) {
      try {
        const readings = [
          biorhythmResult && { engine: 'biorhythm' as const, data: biorhythmResult },
          ichingResult && { engine: 'iching' as const, data: ichingResult },
          tarotResult && { engine: 'tarot' as const, data: tarotResult }
        ].filter(Boolean);

        if (readings.length > 0) {
          const synthesis = await this.aiInterpreter.synthesizeMultipleReadings(
            readings,
            {
              model: 'anthropic/claude-3-haiku',
              maxTokens: 1000,
              temperature: 0.7,
              userContext: `Daily forecast synthesis for ${targetDate}`
            }
          );
          return synthesis.summary || synthesis.detailed_interpretation || 'Daily guidance synthesis generated';
        }
      } catch (error) {
        console.error(`[${requestId}] AI synthesis failed:`, error);
      }
    }

    // Fallback to basic synthesis
    let synthesis = `Daily guidance for ${targetDate}:\n\n`;

    if (biorhythmResult) {
      synthesis += `Energy Profile: ${biorhythmResult.overall_energy > 50 ? 'High energy day' : biorhythmResult.overall_energy > 0 ? 'Moderate energy' : 'Low energy, focus on rest'}.\n`;
    }

    if (ichingResult && (ichingResult.data?.rawData?.interpretation || ichingResult.data?.formattedOutput)) {
       const interpretation = ichingResult.data?.rawData?.interpretation || ichingResult.data?.formattedOutput;
       synthesis += `I-Ching Wisdom: ${typeof interpretation === 'object' ? interpretation.guidance || interpretation.judgment : interpretation}\n`;
    }

    if (tarotResult && (tarotResult.data?.rawData?.interpretation || tarotResult.data?.formattedOutput)) {
        const interpretation = tarotResult.data?.rawData?.interpretation || tarotResult.data?.formattedOutput;
        synthesis += `Tarot Insight: ${typeof interpretation === 'object' ? interpretation.overall_message || interpretation.detailed_interpretation : interpretation}`;
    }

    return synthesis;
  }

  private generateForecastRecommendations(
    biorhythmResult: any,
    ichingResult: any,
    tarotResult: any
  ): DailyForecast['recommendations'] {
    const recommendations: DailyForecast['recommendations'] = {
      optimal_activities: [],
      timing_suggestions: [],
      awareness_points: []
    };

    // Biorhythm-based recommendations
    if (biorhythmResult) {
      if (biorhythmResult.physical_percentage > 50) {
        recommendations.optimal_activities.push('Physical exercise', 'Active projects');
      }
      if (biorhythmResult.emotional_percentage > 50) {
        recommendations.optimal_activities.push('Social interactions', 'Creative expression');
      }
      if (biorhythmResult.intellectual_percentage > 50) {
        recommendations.optimal_activities.push('Learning', 'Problem-solving', 'Strategic planning');
      }

      if (biorhythmResult.critical_day) {
        recommendations.awareness_points.push('Critical day - proceed with extra caution');
      }

      // Add timing suggestions from biorhythm
      if (biorhythmResult.energy_optimization) {
        Object.entries(biorhythmResult.energy_optimization).forEach(([cycle, advice]) => {
          recommendations.timing_suggestions.push(`${cycle}: ${advice}`);
        });
      }
    }

    // Add I-Ching and Tarot recommendations if available
    if (ichingResult && ichingResult.recommendations) {
      recommendations.awareness_points.push(...ichingResult.recommendations);
    }

    if (tarotResult && tarotResult.recommendations) {
      recommendations.optimal_activities.push(...tarotResult.recommendations);
    }

    return recommendations;
  }

  private async handleDailyForecastBatch(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for batch forecast', requestId);
      }

      const body = await request.json();
      const { dates, days_ahead } = body;

      const user = authResult.user;
      const userProfile = await this.getUserProfileFromAuth(user);
      if (!userProfile) {
        return this.createErrorResponse(400, 'PROFILE_REQUIRED', 'User profile with birth data required for forecast', requestId);
      }

      let targetDates: string[] = [];

      if (dates && Array.isArray(dates)) {
        targetDates = dates;
      } else if (days_ahead && typeof days_ahead === 'number') {
        const today = new Date();
        for (let i = 0; i < Math.min(days_ahead, 30); i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          targetDates.push(date.toISOString().split('T')[0]);
        }
      } else {
        // Default to next 7 days
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          targetDates.push(date.toISOString().split('T')[0]);
        }
      }

      // Generate forecasts for all dates
      const forecasts = await Promise.all(
        targetDates.map(async (date) => {
          try {
            return await this.generateDailyForecast(userProfile, date, requestId);
          } catch (error) {
            console.error(`[${requestId}] Forecast failed for ${date}:`, error);
            return null;
          }
        })
      );

      const validForecasts = forecasts.filter(f => f !== null);

      return this.createResponse(200, {}, {
        forecasts: validForecasts,
        count: validForecasts.length,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Batch daily forecast failed:`, error);
      return this.createErrorResponse(500, 'BATCH_FORECAST_FAILED', 'Batch forecast generation failed', requestId);
    }
  }

  private async getUserProfileFromAuth(user: any): Promise<any> {
    // Try to get user profile from KV storage first
    try {
      const profile = await this.kvData.getUserProfile(user.id.toString(), 'profile');
      if (profile && profile.birthDate) {
        return profile;
      }
    } catch (error) {
      console.error('Failed to get user profile from KV:', error);
    }

    // Fallback: construct basic profile from user data
    // This assumes user has birth data in their account
    return {
      fullName: user.name,
      birthDate: user.birth_date || '1990-01-01', // Default fallback
      birthTime: user.birth_time || '12:00',
      birthLocation: user.birth_location || [0, 0]
    };
  }

  private async handleWeeklyForecast(request: Request, requestId: string, weekParam?: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for weekly forecast', requestId);
      }

      const user = authResult.user;

      // Parse week parameter or default to current week
      const { startDate, endDate, weekNumber } = this.parseWeekParameter(weekParam);
      const weekStart = startDate.toISOString().split('T')[0];

      // Check cache first
      const cachedForecast = await this.kvData.getWeeklyForecastCache(user.id.toString(), weekStart);
      if (cachedForecast) {
        console.log(`[${requestId}] Weekly forecast cache hit for ${weekStart}`);
        return this.createResponse(200, {}, {
          forecast: cachedForecast.forecast,
          cached: true,
          cachedAt: cachedForecast.cachedAt,
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const userProfile = await this.getUserProfileFromAuth(user);
      if (!userProfile) {
        return this.createErrorResponse(400, 'PROFILE_REQUIRED', 'User profile with birth data required for forecast', requestId);
      }

      // Generate weekly forecast
      const forecast = await this.generateWeeklyForecast(userProfile, startDate, endDate, weekNumber, requestId);

      // Cache the forecast
      await this.kvData.setWeeklyForecastCache(user.id.toString(), weekStart, forecast);

      // Create timeline entry
      await this.createTimelineEntry(
        user.id.toString(),
        'forecast_weekly',
        { weekStart, weekNumber, userProfile },
        forecast,
        {
          confidence: 80, // Weekly forecasts have good confidence
          cached: false,
          requestId,
          source: 'api'
        }
      );

      return this.createResponse(200, {}, {
        forecast,
        cached: false,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Weekly forecast failed:`, error);
      return this.createErrorResponse(500, 'WEEKLY_FORECAST_FAILED', 'Weekly forecast generation failed', requestId);
    }
  }

  private parseWeekParameter(weekParam?: string): { startDate: Date; endDate: Date; weekNumber: number } {
    const today = new Date();
    let startDate: Date;

    if (weekParam) {
      // Try to parse as YYYY-MM-DD format
      const parsedDate = new Date(weekParam);
      if (!isNaN(parsedDate.getTime())) {
        startDate = this.getWeekStart(parsedDate);
      } else {
        // Default to current week
        startDate = this.getWeekStart(today);
      }
    } else {
      startDate = this.getWeekStart(today);
    }

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const weekNumber = this.getWeekNumber(startDate);

    return { startDate, endDate, weekNumber };
  }

  private getWeekStart(date: Date): Date {
    const day = date.getDay();
    const diff = date.getDate() - day; // Adjust to get Monday as start of week
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  private async generateWeeklyForecast(
    userProfile: any,
    startDate: Date,
    endDate: Date,
    weekNumber: number,
    requestId: string
  ): Promise<WeeklyForecast> {
    // Generate daily forecasts for the week
    const dailyForecasts: DailyForecast[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      try {
        const dailyForecast = await this.generateDailyForecast(userProfile, dateString, requestId);
        dailyForecasts.push(dailyForecast);
      } catch (error) {
        console.error(`[${requestId}] Daily forecast failed for ${dateString}:`, error);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Analyze weekly themes
    const weeklyThemes = this.analyzeWeeklyThemes(dailyForecasts);

    // Generate engine insights for the week
    const engineInsights = await this.generateWeeklyEngineInsights(userProfile, startDate, endDate, requestId);

    return {
      week: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
        weekNumber
      },
      dailyForecasts,
      weeklyThemes,
      engineInsights
    };
  }

  private analyzeWeeklyThemes(dailyForecasts: DailyForecast[]): WeeklyForecast['weeklyThemes'] {
    const energyLevels = dailyForecasts.map(f => f.energyProfile.overallEnergy);
    const challenges: string[] = [];
    const opportunities: string[] = [];

    // Analyze energy patterns
    const highEnergyDays = energyLevels.filter(e => e === 'high').length;
    const lowEnergyDays = energyLevels.filter(e => e === 'low').length;

    let dominantEnergy: string;
    if (highEnergyDays > lowEnergyDays) {
      dominantEnergy = 'High energy week - excellent for major projects and initiatives';
    } else if (lowEnergyDays > highEnergyDays) {
      dominantEnergy = 'Restorative week - focus on rest, reflection, and gentle activities';
    } else {
      dominantEnergy = 'Balanced energy week - mix of active and contemplative periods';
    }

    // Extract challenges and opportunities from daily forecasts
    dailyForecasts.forEach((forecast, index) => {
      const dayName = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index];

      if (forecast.energyProfile.criticalDays.length > 0) {
        challenges.push(`${dayName}: Critical energy day - proceed with caution`);
      }

      if (forecast.energyProfile.overallEnergy === 'high') {
        opportunities.push(`${dayName}: High energy - optimal for important tasks`);
      }

      // Add specific recommendations
      forecast.recommendations.awareness_points.forEach(point => {
        if (!challenges.includes(point)) {
          challenges.push(`${dayName}: ${point}`);
        }
      });
    });

    const overallGuidance = this.generateWeeklyGuidance(dailyForecasts, dominantEnergy);

    return {
      dominantEnergy,
      challenges: challenges.slice(0, 5), // Limit to top 5
      opportunities: opportunities.slice(0, 5), // Limit to top 5
      overallGuidance
    };
  }

  private generateWeeklyGuidance(dailyForecasts: DailyForecast[], dominantEnergy: string): string {
    const totalDays = dailyForecasts.length;
    const highEnergyDays = dailyForecasts.filter(f => f.energyProfile.overallEnergy === 'high').length;
    const criticalDays = dailyForecasts.filter(f => f.energyProfile.criticalDays.length > 0).length;

    let guidance = `Weekly Overview: ${dominantEnergy}\n\n`;

    if (highEnergyDays >= totalDays * 0.6) {
      guidance += 'This is an excellent week for launching new projects, making important decisions, and tackling challenging tasks. ';
    } else if (highEnergyDays <= totalDays * 0.3) {
      guidance += 'This week favors introspection, planning, and gentle progress. Avoid overcommitting and focus on self-care. ';
    } else {
      guidance += 'A balanced week with opportunities for both action and reflection. Plan accordingly. ';
    }

    if (criticalDays > 0) {
      guidance += `Be especially mindful on ${criticalDays} day${criticalDays > 1 ? 's' : ''} with critical energy patterns.`;
    }

    return guidance;
  }

  private async generateWeeklyEngineInsights(
    userProfile: any,
    startDate: Date,
    endDate: Date,
    requestId: string
  ): Promise<WeeklyForecast['engineInsights']> {
    const insights: WeeklyForecast['engineInsights'] = {
      biorhythm: null
    };

    try {
      // Generate extended biorhythm analysis for the week
      const biorhythmResult = await calculateEngine('biorhythm', {
        birthDate: userProfile.birthDate,
        targetDate: startDate.toISOString().split('T')[0],
        forecast_days: 7,
        include_extended_cycles: true
      });

      insights.biorhythm = biorhythmResult;

      // Add numerology insights if available
      try {
        const numerologyResult = await calculateEngine('numerology', {
          fullName: userProfile.fullName,
          birthDate: userProfile.birthDate,
          system: 'pythagorean'
        });
        insights.numerology = numerologyResult;
      } catch (error) {
        console.error(`[${requestId}] Numerology calculation failed:`, error);
      }

      // Add Vimshottari insights if birth time available
      if (userProfile.birthTime && userProfile.birthLocation) {
        try {
          const vimshottariResult = await calculateEngine('vimshottari', {
            birthDate: userProfile.birthDate,
            birthTime: userProfile.birthTime,
            birthLocation: userProfile.birthLocation
          });
          insights.vimshottari = vimshottariResult;
        } catch (error) {
          console.error(`[${requestId}] Vimshottari calculation failed:`, error);
        }
      }

    } catch (error) {
      console.error(`[${requestId}] Weekly engine insights failed:`, error);
    }

    return insights;
  }

  private async handleWeeklyForecastBatch(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for batch weekly forecast', requestId);
      }

      const body = await request.json();
      const { weeks, weeks_ahead } = body;

      const user = authResult.user;
      const userProfile = await this.getUserProfileFromAuth(user);
      if (!userProfile) {
        return this.createErrorResponse(400, 'PROFILE_REQUIRED', 'User profile with birth data required for forecast', requestId);
      }

      let targetWeeks: string[] = [];

      if (weeks && Array.isArray(weeks)) {
        targetWeeks = weeks;
      } else if (weeks_ahead && typeof weeks_ahead === 'number') {
        const today = new Date();
        for (let i = 0; i < Math.min(weeks_ahead, 8); i++) {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() + (i * 7));
          targetWeeks.push(weekStart.toISOString().split('T')[0]);
        }
      } else {
        // Default to next 4 weeks
        const today = new Date();
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(today);
          weekStart.setDate(today.getDate() + (i * 7));
          targetWeeks.push(weekStart.toISOString().split('T')[0]);
        }
      }

      // Generate forecasts for all weeks
      const forecasts = await Promise.all(
        targetWeeks.map(async (weekStart) => {
          try {
            const { startDate, endDate, weekNumber } = this.parseWeekParameter(weekStart);
            return await this.generateWeeklyForecast(userProfile, startDate, endDate, weekNumber, requestId);
          } catch (error) {
            console.error(`[${requestId}] Weekly forecast failed for ${weekStart}:`, error);
            return null;
          }
        })
      );

      const validForecasts = forecasts.filter(f => f !== null);

      return this.createResponse(200, {}, {
        forecasts: validForecasts,
        count: validForecasts.length,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Batch weekly forecast failed:`, error);
      return this.createErrorResponse(500, 'BATCH_WEEKLY_FORECAST_FAILED', 'Batch weekly forecast generation failed', requestId);
    }
  }

  // Raycast Integration Handlers
  private async handleRaycastDailyIntegration(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for Raycast integration', requestId);
      }

      const url = new URL(request.url);
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const user = authResult.user;

      // Check Raycast-specific cache first
      const cachedRaycast = await this.kvData.getRaycastCache(user.id.toString(), 'daily', date);
      if (cachedRaycast) {
        console.log(`[${requestId}] Raycast daily cache hit for ${date}`);
        return this.createResponse(200, {}, {
          ...cachedRaycast.data,
          cached: true,
          cachedAt: cachedRaycast.cachedAt,
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const userProfile = await this.getUserProfileFromAuth(user);
      if (!userProfile) {
        return this.createErrorResponse(400, 'PROFILE_REQUIRED', 'User profile with birth data required for Raycast integration', requestId);
      }

      // Generate daily forecast
      const forecast = await this.generateDailyForecast(userProfile, date, requestId);

      // Add Raycast-specific formatting
      const raycastOptimized = this.formatForRaycast(forecast, 'daily');
      forecast.raycastOptimized = raycastOptimized;

      const response = {
        forecast,
        raycast: raycastOptimized,
        cached: false,
        requestId,
        timestamp: new Date().toISOString()
      };

      // Cache the Raycast response (shorter TTL for Raycast-specific data)
      await this.kvData.setRaycastCache(user.id.toString(), 'daily', date, response, 3600); // 1 hour

      // Create timeline entry for Raycast integration
      await this.createTimelineEntry(
        user.id.toString(),
        'raycast_integration',
        { date, type: 'daily' },
        response,
        {
          confidence: 85,
          cached: false,
          requestId,
          source: 'raycast'
        }
      );

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Raycast daily integration failed:`, error);
      return this.createErrorResponse(500, 'RAYCAST_INTEGRATION_FAILED', 'Raycast daily integration failed', requestId);
    }
  }

  private async handleRaycastWeeklyIntegration(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for Raycast integration', requestId);
      }

      const url = new URL(request.url);
      const week = url.searchParams.get('week');
      const user = authResult.user;

      // Parse week parameter
      const { startDate, endDate, weekNumber } = this.parseWeekParameter(week || undefined);
      const weekStart = startDate.toISOString().split('T')[0];

      // Check Raycast-specific cache first
      const cachedRaycast = await this.kvData.getRaycastCache(user.id.toString(), 'weekly', weekStart);
      if (cachedRaycast) {
        console.log(`[${requestId}] Raycast weekly cache hit for ${weekStart}`);
        return this.createResponse(200, {}, {
          ...cachedRaycast.data,
          cached: true,
          cachedAt: cachedRaycast.cachedAt,
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const userProfile = await this.getUserProfileFromAuth(user);
      if (!userProfile) {
        return this.createErrorResponse(400, 'PROFILE_REQUIRED', 'User profile with birth data required for Raycast integration', requestId);
      }

      // Generate weekly forecast
      const forecast = await this.generateWeeklyForecast(userProfile, startDate, endDate, weekNumber, requestId);

      // Add Raycast-specific formatting
      const raycastOptimized = this.formatWeeklyForRaycast(forecast);
      forecast.raycastOptimized = raycastOptimized;

      const response = {
        forecast,
        raycast: raycastOptimized,
        cached: false,
        requestId,
        timestamp: new Date().toISOString()
      };

      // Cache the Raycast response (longer TTL for weekly data)
      await this.kvData.setRaycastCache(user.id.toString(), 'weekly', weekStart, response, 6 * 3600); // 6 hours

      return this.createResponse(200, {}, response);

    } catch (error) {
      console.error(`[${requestId}] Raycast weekly integration failed:`, error);
      return this.createErrorResponse(500, 'RAYCAST_WEEKLY_INTEGRATION_FAILED', 'Raycast weekly integration failed', requestId);
    }
  }

  private async handleRaycastCustomIntegration(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for Raycast integration', requestId);
      }

      const body = await request.json();
      const { type, parameters } = body;

      const user = authResult.user;
      const userProfile = await this.getUserProfileFromAuth(user);
      if (!userProfile) {
        return this.createErrorResponse(400, 'PROFILE_REQUIRED', 'User profile with birth data required for Raycast integration', requestId);
      }

      let result: any;

      switch (type) {
        case 'daily_batch':
          const dates = parameters.dates || this.generateDateRange(parameters.days || 7);
          const dailyForecasts = await Promise.all(
            dates.map((date: string) => this.generateDailyForecast(userProfile, date, requestId))
          );
          result = {
            type: 'daily_batch',
            forecasts: dailyForecasts.map(f => ({
              ...f,
              raycastOptimized: this.formatForRaycast(f, 'daily')
            }))
          };
          break;

        case 'energy_summary':
          const summaryDate = parameters.date || new Date().toISOString().split('T')[0];
          const energyForecast = await this.generateDailyForecast(userProfile, summaryDate, requestId);
          result = {
            type: 'energy_summary',
            date: summaryDate,
            energy: energyForecast.energyProfile,
            raycastOptimized: this.formatEnergyForRaycast(energyForecast.energyProfile)
          };
          break;

        default:
          return this.createErrorResponse(400, 'INVALID_TYPE', 'Invalid custom integration type', requestId);
      }

      return this.createResponse(200, {}, {
        result,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Raycast custom integration failed:`, error);
      return this.createErrorResponse(500, 'RAYCAST_CUSTOM_INTEGRATION_FAILED', 'Raycast custom integration failed', requestId);
    }
  }

  // Raycast Formatting Helpers
  private formatForRaycast(forecast: DailyForecast, type: 'daily'): DailyForecast['raycastOptimized'] {
    const energyIcon = this.getEnergyIcon(forecast.energyProfile.overallEnergy);
    const energyColor = this.getEnergyColor(forecast.energyProfile.overallEnergy);

    let summary = `${energyIcon} ${forecast.energyProfile.overallEnergy.toUpperCase()} energy`;
    if (forecast.energyProfile.criticalDays.length > 0) {
      summary += ' ⚠️ Critical day';
    }

    const subtitle = forecast.guidance.synthesis.split('\n')[0].substring(0, 100) + '...';

    const actions = [
      'View detailed guidance',
      'Copy daily summary',
      'View biorhythm details'
    ];

    // Add specific actions based on recommendations
    if (forecast.recommendations.optimal_activities.length > 0) {
      actions.push('View optimal activities');
    }

    return {
      summary,
      icon: energyIcon,
      subtitle,
      actions
    };
  }

  private formatWeeklyForRaycast(forecast: WeeklyForecast): WeeklyForecast['raycastOptimized'] {
    const weekSummary = `Week ${forecast.week.weekNumber}: ${forecast.weeklyThemes.dominantEnergy}`;

    const dailyHighlights = forecast.dailyForecasts.map((daily, index) => {
      const dayName = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index];
      const energyIcon = this.getEnergyIcon(daily.energyProfile.overallEnergy);
      return `${dayName}: ${energyIcon} ${daily.energyProfile.overallEnergy}`;
    });

    const keyActions = [
      'View daily breakdown',
      'Copy weekly summary',
      'View energy patterns'
    ];

    // Add specific actions based on opportunities
    if (forecast.weeklyThemes.opportunities.length > 0) {
      keyActions.push('View opportunities');
    }

    return {
      weekSummary,
      dailyHighlights,
      keyActions
    };
  }

  private formatEnergyForRaycast(energyProfile: DailyForecast['energyProfile']): any {
    const icon = this.getEnergyIcon(energyProfile.overallEnergy);
    const color = this.getEnergyColor(energyProfile.overallEnergy);

    return {
      icon,
      color,
      level: energyProfile.overallEnergy,
      trend: energyProfile.trend,
      critical: energyProfile.criticalDays.length > 0,
      summary: `${icon} ${energyProfile.overallEnergy.toUpperCase()} energy - ${energyProfile.trend} trend`
    };
  }

  private getEnergyIcon(energy: 'high' | 'medium' | 'low'): string {
    switch (energy) {
      case 'high': return '⚡';
      case 'medium': return '🔋';
      case 'low': return '🔋';
      default: return '🔋';
    }
  }

  private getEnergyColor(energy: 'high' | 'medium' | 'low'): string {
    switch (energy) {
      case 'high': return 'green';
      case 'medium': return 'yellow';
      case 'low': return 'red';
      default: return 'gray';
    }
  }

  private generateDateRange(days: number): string[] {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i < Math.min(days, 30); i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }

    return dates;
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
      const requestBody = await request.json();
      const profileData = requestBody.profile || requestBody; // Handle both {profile: ...} and direct profile

      console.log(`[${requestId}] Uploading consciousness profile for user ${userId}`);

      // 3. Store the full consciousness profile in the consciousness_profiles table
      try {
        // Convert userId to integer for database operations
        const userIdInt = parseInt(userId, 10);

        // Safely stringify the profile data
        const profileDataString = JSON.stringify(profileData);
        console.log(`[${requestId}] Profile data length: ${profileDataString.length} characters`);

        // First, deactivate any existing profiles
        await this.db.prepare('UPDATE consciousness_profiles SET is_active = 0 WHERE user_id = ?').bind(userIdInt).run();

        // Insert the new profile
        const insertResult = await this.db.prepare(`
          INSERT INTO consciousness_profiles (user_id, profile_data, created_at, updated_at, is_active)
          VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
        `).bind(userIdInt, profileDataString).run();

        console.log(`[${requestId}] Consciousness profile stored in database, insert result:`, insertResult.success);
      } catch (dbError) {
        console.error(`[${requestId}] Database error storing consciousness profile:`, dbError);
        // Continue with the flow even if database storage fails, but log the error
        console.log(`[${requestId}] Continuing with user profile update despite database error`);
      }

      // 4. Update the user record to mark onboarding as complete
      const updateData = {
        personalData: profileData.personalData,
        preferences: profileData.preferences,
        hasCompletedOnboarding: true // Always set this to true when profile is uploaded
      };

      const result = await this.authService.updateUserProfile(userId, updateData);

      if (!result.success || !result.user) {
        console.error(`[${requestId}] Failed to update user profile:`, result.error);
        return this.createErrorResponse(500, 'PROFILE_UPDATE_FAILED', result.error || 'Failed to update user profile', requestId);
      }

      // 5. Also save to KV store for quick access using the correct key format
      await this.kvData.setConsciousnessProfile(userId, profileData);

      console.log(`[${requestId}] Consciousness profile upload completed successfully`);

      // 6. Return success response with the updated user data
      return this.createResponse(200, {}, {
        success: true,
        message: 'Consciousness profile uploaded successfully',
        user: result.user,
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Error in handleUploadConsciousnessProfile:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process consciousness profile';
      return this.createErrorResponse(500, 'UPLOAD_FAILED', errorMessage, requestId);
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

  // Tiered Onboarding Handlers

  private async handleTier1Onboarding(request: Request, requestId: string): Promise<Response> {
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
      const requestBody = await request.json();
      const { fullName } = requestBody;

      if (!fullName) {
        return this.createErrorResponse(400, 'MISSING_DATA', 'Full name is required for Tier 1 onboarding', requestId);
      }

      console.log(`[${requestId}] Processing Tier 1 onboarding for user ${userId}`);

      // Update user with Tier 1 data
      const result = await this.authService.updateUserProfile(userId, {
        tier1Data: { fullName }
      });

      if (!result.success || !result.user) {
        console.error(`[${requestId}] Failed to update Tier 1 data:`, result.error);
        return this.createErrorResponse(500, 'UPDATE_FAILED', result.error || 'Failed to update Tier 1 data', requestId);
      }

      console.log(`[${requestId}] Tier 1 onboarding completed successfully`);

      return this.createResponse(200, {}, {
        success: true,
        message: 'Tier 1 onboarding completed successfully',
        user: result.user,
        tier: 1,
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Error in handleTier1Onboarding:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process Tier 1 onboarding';
      return this.createErrorResponse(500, 'TIER1_FAILED', errorMessage, requestId);
    }
  }

  private async handleTier2Onboarding(request: Request, requestId: string): Promise<Response> {
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
      const requestBody = await request.json();
      const { birthDate, birthTime, latitude, longitude, timezone } = requestBody;

      if (!birthDate || !birthTime || latitude === undefined || longitude === undefined) {
        return this.createErrorResponse(400, 'MISSING_DATA', 'Birth date, time, and location coordinates are required for Tier 2 onboarding', requestId);
      }

      console.log(`[${requestId}] Processing Tier 2 onboarding for user ${userId}`);

      // Update user with Tier 2 data
      const result = await this.authService.updateUserProfile(userId, {
        tier2Data: {
          birthDate,
          birthTime,
          birthLocation: [latitude, longitude],
          timezone: timezone || 'UTC'
        }
      });

      if (!result.success || !result.user) {
        console.error(`[${requestId}] Failed to update Tier 2 data:`, result.error);
        return this.createErrorResponse(500, 'UPDATE_FAILED', result.error || 'Failed to update Tier 2 data', requestId);
      }

      console.log(`[${requestId}] Tier 2 onboarding completed successfully`);

      return this.createResponse(200, {}, {
        success: true,
        message: 'Tier 2 onboarding completed successfully',
        user: result.user,
        tier: 2,
        enginesUnlocked: true, // Engines are now available
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Error in handleTier2Onboarding:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process Tier 2 onboarding';
      return this.createErrorResponse(500, 'TIER2_FAILED', errorMessage, requestId);
    }
  }

  private async handleTier3Onboarding(request: Request, requestId: string): Promise<Response> {
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
      const requestBody = await request.json();
      const { preferences } = requestBody;

      if (!preferences) {
        return this.createErrorResponse(400, 'MISSING_DATA', 'Preferences are required for Tier 3 onboarding', requestId);
      }

      console.log(`[${requestId}] Processing Tier 3 onboarding for user ${userId}`);

      // Update user with Tier 3 data and mark full onboarding as complete
      const result = await this.authService.updateUserProfile(userId, {
        tier3Data: preferences,
        hasCompletedOnboarding: true
      });

      if (!result.success || !result.user) {
        console.error(`[${requestId}] Failed to update Tier 3 data:`, result.error);
        return this.createErrorResponse(500, 'UPDATE_FAILED', result.error || 'Failed to update Tier 3 data', requestId);
      }

      console.log(`[${requestId}] Tier 3 onboarding completed successfully - Full onboarding complete`);

      return this.createResponse(200, {}, {
        success: true,
        message: 'Tier 3 onboarding completed successfully - Full onboarding complete',
        user: result.user,
        tier: 3,
        onboardingComplete: true,
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Error in handleTier3Onboarding:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process Tier 3 onboarding';
      return this.createErrorResponse(500, 'TIER3_FAILED', errorMessage, requestId);
    }
  }

  private async handleOnboardingStatus(request: Request, requestId: string): Promise<Response> {
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

      const user = validation.user;

      // Calculate onboarding status (fallback to legacy checks if new fields don't exist)
      const tier1Complete = Boolean(user.tier1_completed) || Boolean(user.name && user.email);

      // Check for tier 2 completion in preferences if database columns don't exist
      let tier2Complete = Boolean(user.tier2_completed) || Boolean(user.birth_date && user.birth_time && user.birth_latitude && user.birth_longitude);
      if (!tier2Complete && user.preferences) {
        try {
          const prefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
          tier2Complete = Boolean(prefs.tier2_completed || (prefs.birthData && prefs.birthData.birthDate && prefs.birthData.birthTime && prefs.birthData.birthLocation));
        } catch (e) {
          // Ignore JSON parse errors
        }
      }

      const tier3Complete = Boolean(user.tier3_completed) || Boolean(user.has_completed_onboarding);

      const currentTier = tier3Complete ? 3 : tier2Complete ? 2 : tier1Complete ? 1 : 0;
      const enginesAvailable = tier1Complete && tier2Complete;
      const onboardingComplete = tier1Complete && tier2Complete && tier3Complete;

      return this.createResponse(200, {}, {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier1_completed: tier1Complete,
          tier2_completed: tier2Complete,
          tier3_completed: tier3Complete,
          has_completed_onboarding: onboardingComplete,
          birth_date: user.birth_date,
          birth_time: user.birth_time,
          birth_latitude: user.birth_latitude,
          birth_longitude: user.birth_longitude,
          birth_timezone: user.birth_timezone,
          preferences: user.preferences
        },
        onboardingStatus: {
          currentTier,
          tier1Complete,
          tier2Complete,
          tier3Complete,
          enginesAvailable,
          onboardingComplete,
          nextStep: onboardingComplete ? null :
                   !tier1Complete ? 'Complete basic profile (name)' :
                   !tier2Complete ? 'Add birth information (date, time, location)' :
                   !tier3Complete ? 'Set preferences and complete setup' : null
        },
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Error in handleOnboardingStatus:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get onboarding status';
      return this.createErrorResponse(500, 'STATUS_FAILED', errorMessage, requestId);
    }
  }

  // User Profile Management Handlers
  private async handleUpdateUserProfile(request: Request, requestId: string): Promise<Response> {
    try {
      // Authenticate user
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Missing or invalid authorization token', requestId);
      }

      const token = authHeader.substring(7);
      const validation = await this.authService.validateToken(token);
      if (!validation.valid || !validation.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', validation.error || 'Invalid token', requestId);
      }

      const userId = validation.user.id.toString();
      const requestBody = await request.json();
      const { profileData } = requestBody;

      if (!profileData) {
        return this.createErrorResponse(400, 'MISSING_DATA', 'Profile data is required', requestId);
      }

      console.log(`[${requestId}] Updating user profile for user ${userId}`);

      // Update user profile using auth service
      const result = await this.authService.updateUserProfile(userId, profileData);

      if (!result.success || !result.user) {
        console.error(`[${requestId}] Failed to update user profile:`, result.error);
        return this.createErrorResponse(500, 'UPDATE_FAILED', result.error || 'Failed to update user profile', requestId);
      }

      console.log(`[${requestId}] User profile updated successfully`);

      return this.createResponse(200, {}, {
        success: true,
        message: 'User profile updated successfully',
        user: result.user,
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Error in handleUpdateUserProfile:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user profile';
      return this.createErrorResponse(500, 'PROFILE_UPDATE_FAILED', errorMessage, requestId);
    }
  }

  private async handleGetUserPreferences(request: Request, requestId: string): Promise<Response> {
    try {
      // Authenticate user
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Missing or invalid authorization token', requestId);
      }

      const token = authHeader.substring(7);
      const validation = await this.authService.validateToken(token);
      if (!validation.valid || !validation.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', validation.error || 'Invalid token', requestId);
      }

      const user = validation.user;

      // Parse preferences from user data
      let preferences = {};
      if (user.preferences) {
        try {
          preferences = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
        } catch (e) {
          console.warn(`[${requestId}] Failed to parse user preferences:`, e);
          preferences = {};
        }
      }

      return this.createResponse(200, {}, {
        success: true,
        preferences,
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Error in handleGetUserPreferences:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get user preferences';
      return this.createErrorResponse(500, 'PREFERENCES_FETCH_FAILED', errorMessage, requestId);
    }
  }

  private async handleUpdateUserPreferences(request: Request, requestId: string): Promise<Response> {
    try {
      // Authenticate user
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Missing or invalid authorization token', requestId);
      }

      const token = authHeader.substring(7);
      const validation = await this.authService.validateToken(token);
      if (!validation.valid || !validation.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', validation.error || 'Invalid token', requestId);
      }

      const userId = validation.user.id.toString();
      const requestBody = await request.json();
      const { preferences } = requestBody;

      if (!preferences) {
        return this.createErrorResponse(400, 'MISSING_DATA', 'Preferences data is required', requestId);
      }

      console.log(`[${requestId}] Updating user preferences for user ${userId}`);

      // Update user preferences using auth service
      const result = await this.authService.updateUserProfile(userId, {
        preferences: preferences
      });

      if (!result.success || !result.user) {
        console.error(`[${requestId}] Failed to update user preferences:`, result.error);
        return this.createErrorResponse(500, 'UPDATE_FAILED', result.error || 'Failed to update user preferences', requestId);
      }

      console.log(`[${requestId}] User preferences updated successfully`);

      return this.createResponse(200, {}, {
        success: true,
        message: 'User preferences updated successfully',
        preferences: result.user.preferences,
        requestId
      });

    } catch (error) {
      console.error(`[${requestId}] Error in handleUpdateUserPreferences:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user preferences';
      return this.createErrorResponse(500, 'PREFERENCES_UPDATE_FAILED', errorMessage, requestId);
    }
  }

  // Authentication Helper
  private async authenticateRequest(request: Request): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'Missing or invalid authorization token' };
      }

      const token = authHeader.slice(7);
      const validation = await this.authService.validateToken(token);

      if (!validation.valid || !validation.user) {
        return { success: false, error: validation.error || 'Invalid token' };
      }

      return { success: true, user: validation.user };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  // Timeline API Handlers
  private async handleGetTimeline(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for timeline access', requestId);
      }

      const url = new URL(request.url);
      const startDate = url.searchParams.get('startDate') || undefined;
      const endDate = url.searchParams.get('endDate') || undefined;
      const type = url.searchParams.get('type') as TimelineEntryType || undefined;
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const query: TimelineQuery = {
        userId: authResult.user.id.toString(),
        startDate,
        endDate,
        type,
        limit,
        offset
      };

      const timeline = await this.kvData.getTimelineEntries(query);

      return this.createResponse(200, {}, {
        timeline,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Get timeline failed:`, error);
      return this.createErrorResponse(500, 'TIMELINE_FETCH_FAILED', 'Failed to fetch timeline', requestId);
    }
  }

  private async handleGetRecentTimeline(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for timeline access', requestId);
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const query: TimelineQuery = {
        userId: authResult.user.id.toString(),
        startDate: thirtyDaysAgo.toISOString().split('T')[0],
        limit: 100
      };

      const timeline = await this.kvData.getTimelineEntries(query);

      return this.createResponse(200, {}, {
        timeline,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Get recent timeline failed:`, error);
      return this.createErrorResponse(500, 'RECENT_TIMELINE_FETCH_FAILED', 'Failed to fetch recent timeline', requestId);
    }
  }

  private async handleGetTimelineByDate(request: Request, requestId: string, date: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for timeline access', requestId);
      }

      const query: TimelineQuery = {
        userId: authResult.user.id.toString(),
        startDate: date,
        endDate: date,
        limit: 100
      };

      const timeline = await this.kvData.getTimelineEntries(query);

      return this.createResponse(200, {}, {
        timeline,
        date,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Get timeline by date failed:`, error);
      return this.createErrorResponse(500, 'TIMELINE_DATE_FETCH_FAILED', 'Failed to fetch timeline for date', requestId);
    }
  }

  private async handleGetTimelineByType(request: Request, requestId: string, type: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for timeline access', requestId);
      }

      const query: TimelineQuery = {
        userId: authResult.user.id.toString(),
        type: type as TimelineEntryType,
        limit: 100
      };

      const timeline = await this.kvData.getTimelineEntries(query);

      return this.createResponse(200, {}, {
        timeline,
        type,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Get timeline by type failed:`, error);
      return this.createErrorResponse(500, 'TIMELINE_TYPE_FETCH_FAILED', 'Failed to fetch timeline by type', requestId);
    }
  }

  private async handleGetTimelineStats(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for timeline stats', requestId);
      }

      const stats = await this.kvData.getTimelineStats(authResult.user.id.toString());

      return this.createResponse(200, {}, {
        stats,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Get timeline stats failed:`, error);
      return this.createErrorResponse(500, 'TIMELINE_STATS_FAILED', 'Failed to fetch timeline stats', requestId);
    }
  }

  // Predictive Analytics Handlers
  private async handleGetBiorhythmAnalytics(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for biorhythm analytics', requestId);
      }

      const userProfile = await this.getUserProfileFromAuth(authResult.user);
      if (!userProfile || !userProfile.dateOfBirth) {
        return this.createErrorResponse(400, 'BIRTH_DATE_REQUIRED', 'Birth date required for biorhythm analytics', requestId);
      }

      const url = new URL(request.url);
      const days = parseInt(url.searchParams.get('days') || '30');

      const analytics = new PredictiveAnalytics(new Date(userProfile.dateOfBirth));
      const biorhythmTrends = analytics.calculateBiorhythmTrends(days);

      return this.createResponse(200, {}, {
        biorhythmTrends,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Biorhythm analytics failed:`, error);
      return this.createErrorResponse(500, 'BIORHYTHM_ANALYTICS_FAILED', 'Failed to generate biorhythm analytics', requestId);
    }
  }

  private async handleGetOptimalTiming(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for optimal timing', requestId);
      }

      const userProfile = await this.getUserProfileFromAuth(authResult.user);
      if (!userProfile || !userProfile.dateOfBirth) {
        return this.createErrorResponse(400, 'BIRTH_DATE_REQUIRED', 'Birth date required for optimal timing', requestId);
      }

      const analytics = new PredictiveAnalytics(new Date(userProfile.dateOfBirth));
      const biorhythmTrends = analytics.calculateBiorhythmTrends();
      const optimalTimings = analytics.generateOptimalTimings(biorhythmTrends);

      return this.createResponse(200, {}, {
        optimalTimings,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Optimal timing failed:`, error);
      return this.createErrorResponse(500, 'OPTIMAL_TIMING_FAILED', 'Failed to generate optimal timing', requestId);
    }
  }

  private async handleGetEnergyCycles(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for energy cycles', requestId);
      }

      const userProfile = await this.getUserProfileFromAuth(authResult.user);
      if (!userProfile || !userProfile.dateOfBirth) {
        return this.createErrorResponse(400, 'BIRTH_DATE_REQUIRED', 'Birth date required for energy cycles', requestId);
      }

      // Get user's timeline entries for analysis
      const timelineQuery: TimelineQuery = {
        userId: authResult.user.id.toString(),
        limit: 1000
      };
      const timelineResponse = await this.kvData.getTimelineEntries(timelineQuery);

      const analytics = new PredictiveAnalytics(new Date(userProfile.dateOfBirth));
      const energyCycles = analytics.analyzeEnergyCycles(timelineResponse.entries);

      return this.createResponse(200, {}, {
        energyCycles,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Energy cycles failed:`, error);
      return this.createErrorResponse(500, 'ENERGY_CYCLES_FAILED', 'Failed to analyze energy cycles', requestId);
    }
  }

  private async handleGetPredictiveInsights(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for predictive insights', requestId);
      }

      const userProfile = await this.getUserProfileFromAuth(authResult.user);
      if (!userProfile || !userProfile.dateOfBirth) {
        return this.createErrorResponse(400, 'BIRTH_DATE_REQUIRED', 'Birth date required for predictive insights', requestId);
      }

      // Get user's timeline entries for analysis
      const timelineQuery: TimelineQuery = {
        userId: authResult.user.id.toString(),
        limit: 1000
      };
      const timelineResponse = await this.kvData.getTimelineEntries(timelineQuery);

      const analytics = new PredictiveAnalytics(new Date(userProfile.dateOfBirth));
      const insights = analytics.generatePredictiveInsights(timelineResponse.entries);

      return this.createResponse(200, {}, {
        insights,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Predictive insights failed:`, error);
      return this.createErrorResponse(500, 'PREDICTIVE_INSIGHTS_FAILED', 'Failed to generate predictive insights', requestId);
    }
  }

  private async handleGetUsageAnalytics(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for usage analytics', requestId);
      }

      const url = new URL(request.url);
      const timeRange = url.searchParams.get('timeRange') || '30d';
      const includeEngineBreakdown = url.searchParams.get('includeEngineBreakdown') === 'true';

      // Get cache statistics
      const cacheStats = await this.kvData.getCacheStats();

      // Get user's reading history for usage patterns
      const userId = authResult.user.id.toString();
      const readingHistory = await this.kvData.getUserReadings(userId, 100, timeRange);

      // Analyze usage patterns
      const usageAnalytics = {
        timeRange,
        totalReadings: readingHistory.length,
        cachePerformance: {
          hitRate: cacheStats.hitRate,
          totalRequests: cacheStats.totalRequests,
          totalHits: cacheStats.totalHits,
          totalMisses: cacheStats.totalMisses
        },
        engineUsage: {},
        activityPattern: this.analyzeActivityPattern(readingHistory),
        performanceMetrics: {
          averageResponseTime: this.calculateAverageResponseTime(readingHistory),
          peakUsageHours: this.identifyPeakUsageHours(readingHistory),
          mostUsedEngines: this.getMostUsedEngines(readingHistory)
        }
      };

      // Add engine breakdown if requested
      if (includeEngineBreakdown) {
        usageAnalytics.engineUsage = this.analyzeEngineUsage(readingHistory);
        usageAnalytics.cachePerformance.engineStats = cacheStats.engineStats;
      }

      return this.createResponse(200, {}, {
        success: true,
        data: usageAnalytics,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Usage analytics failed:`, error);
      return this.createErrorResponse(500, 'USAGE_ANALYTICS_FAILED', 'Failed to generate usage analytics', requestId);
    }
  }

  // Usage Analytics Helper Methods
  private analyzeActivityPattern(readings: any[]): any {
    const hourlyActivity = new Array(24).fill(0);
    const dailyActivity = new Array(7).fill(0);

    readings.forEach(reading => {
      const date = new Date(reading.timestamp || reading.createdAt);
      const hour = date.getHours();
      const day = date.getDay();

      hourlyActivity[hour]++;
      dailyActivity[day]++;
    });

    return {
      hourlyDistribution: hourlyActivity,
      dailyDistribution: dailyActivity,
      peakHour: hourlyActivity.indexOf(Math.max(...hourlyActivity)),
      peakDay: dailyActivity.indexOf(Math.max(...dailyActivity))
    };
  }

  private calculateAverageResponseTime(readings: any[]): number {
    const responseTimes = readings
      .map(r => r.results?.metadata?.calculationTime || r.results?.calculationTime)
      .filter(time => typeof time === 'number');

    if (responseTimes.length === 0) return 0;
    return responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
  }

  private identifyPeakUsageHours(readings: any[]): number[] {
    const hourlyCount = new Array(24).fill(0);

    readings.forEach(reading => {
      const hour = new Date(reading.timestamp || reading.createdAt).getHours();
      hourlyCount[hour]++;
    });

    const maxCount = Math.max(...hourlyCount);
    return hourlyCount
      .map((count, hour) => ({ hour, count }))
      .filter(item => item.count >= maxCount * 0.8) // Top 80% of peak usage
      .map(item => item.hour);
  }

  private getMostUsedEngines(readings: any[]): Array<{ engine: string; count: number; percentage: number }> {
    const engineCounts: Record<string, number> = {};

    readings.forEach(reading => {
      if (reading.engines && Array.isArray(reading.engines)) {
        reading.engines.forEach((engine: string) => {
          engineCounts[engine] = (engineCounts[engine] || 0) + 1;
        });
      }
    });

    const total = Object.values(engineCounts).reduce((sum, count) => sum + count, 0);

    return Object.entries(engineCounts)
      .map(([engine, count]) => ({
        engine,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 engines
  }

  private analyzeEngineUsage(readings: any[]): Record<string, any> {
    const engineStats: Record<string, any> = {};

    readings.forEach(reading => {
      if (reading.engines && Array.isArray(reading.engines)) {
        reading.engines.forEach((engine: string) => {
          if (!engineStats[engine]) {
            engineStats[engine] = {
              totalUsage: 0,
              averageResponseTime: 0,
              successRate: 0,
              lastUsed: null,
              responseTimes: []
            };
          }

          engineStats[engine].totalUsage++;
          engineStats[engine].lastUsed = reading.timestamp || reading.createdAt;

          // Track response times if available
          const responseTime = reading.results?.metadata?.calculationTime || reading.results?.calculationTime;
          if (typeof responseTime === 'number') {
            engineStats[engine].responseTimes.push(responseTime);
          }
        });
      }
    });

    // Calculate averages and success rates
    Object.keys(engineStats).forEach(engine => {
      const stats = engineStats[engine];
      if (stats.responseTimes.length > 0) {
        stats.averageResponseTime = stats.responseTimes.reduce((sum: number, time: number) => sum + time, 0) / stats.responseTimes.length;
        stats.successRate = 100; // Assume success if we have response times
      }
      delete stats.responseTimes; // Remove raw data from response
    });

    return engineStats;
  }

  // Cache Management Handlers
  private async handleCacheInvalidation(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { type, target } = body;

      if (!type) {
        return this.createErrorResponse(400, 'MISSING_TYPE', 'Cache invalidation type is required (engine, user, all)', requestId);
      }

      let result: any = {};

      switch (type) {
        case 'engine':
          if (!target) {
            return this.createErrorResponse(400, 'MISSING_TARGET', 'Engine name is required for engine cache invalidation', requestId);
          }
          await this.kvData.invalidateEngineCache(target);
          result = { message: `Cache invalidated for engine: ${target}` };
          break;

        case 'user':
          if (!target) {
            return this.createErrorResponse(400, 'MISSING_TARGET', 'User ID is required for user cache invalidation', requestId);
          }
          await this.kvData.invalidateUserCache(target);
          result = { message: `Cache invalidated for user: ${target}` };
          break;

        case 'all':
          await this.kvData.clearCache();
          result = { message: 'All cache cleared' };
          break;

        default:
          return this.createErrorResponse(400, 'INVALID_TYPE', 'Invalid cache invalidation type. Use: engine, user, or all', requestId);
      }

      return this.createResponse(200, {}, {
        success: true,
        ...result,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Cache invalidation failed:`, error);
      return this.createErrorResponse(500, 'CACHE_INVALIDATION_FAILED', 'Failed to invalidate cache', requestId);
    }
  }

  private async handleCacheWarming(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await request.json();
      const { type, target, options = {} } = body;

      if (!type) {
        return this.createErrorResponse(400, 'MISSING_TYPE', 'Cache warming type is required (engine, user, forecast)', requestId);
      }

      let result: any = {};

      switch (type) {
        case 'engine':
          if (!target) {
            return this.createErrorResponse(400, 'MISSING_TARGET', 'Engine name is required for engine cache warming', requestId);
          }

          // Get common inputs for the engine
          const commonInputs = this.getCommonEngineInputs(target);
          const engineResult = await this.kvData.warmEngineCache(target, commonInputs);
          result = {
            message: `Cache warmed for engine: ${target}`,
            warmed: engineResult.warmed,
            failed: engineResult.failed
          };
          break;

        case 'user':
          if (!target) {
            return this.createErrorResponse(400, 'MISSING_TARGET', 'User ID is required for user cache warming', requestId);
          }

          const days = options.days || 7;
          const userResult = await this.kvData.warmUserForecastCache(target, days);
          result = {
            message: `Forecast cache warmed for user: ${target}`,
            days,
            warmed: userResult.warmed,
            failed: userResult.failed
          };
          break;

        case 'forecast':
          // Warm forecast cache for multiple users or system-wide
          const userIds = options.userIds || [];
          const forecastDays = options.days || 7;

          if (userIds.length === 0) {
            return this.createErrorResponse(400, 'MISSING_USER_IDS', 'User IDs array is required for forecast cache warming', requestId);
          }

          const forecastResults = await Promise.all(
            userIds.map((userId: string) => this.kvData.warmUserForecastCache(userId, forecastDays))
          );

          const totalWarmed = forecastResults.reduce((sum, r) => sum + r.warmed, 0);
          const totalFailed = forecastResults.reduce((sum, r) => sum + r.failed, 0);

          result = {
            message: `Forecast cache warmed for ${userIds.length} users`,
            users: userIds.length,
            days: forecastDays,
            totalWarmed,
            totalFailed
          };
          break;

        default:
          return this.createErrorResponse(400, 'INVALID_TYPE', 'Invalid cache warming type. Use: engine, user, or forecast', requestId);
      }

      return this.createResponse(200, {}, {
        success: true,
        ...result,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Cache warming failed:`, error);
      return this.createErrorResponse(500, 'CACHE_WARMING_FAILED', 'Failed to warm cache', requestId);
    }
  }

  // Helper method to get common inputs for engine cache warming
  private getCommonEngineInputs(engineName: string): any[] {
    const commonInputs: Record<string, any[]> = {
      numerology: [
        { fullName: 'John Smith', birthDate: '1990-01-01', system: 'pythagorean' },
        { fullName: 'Jane Doe', birthDate: '1985-06-15', system: 'pythagorean' },
        { fullName: 'Michael Johnson', birthDate: '1992-12-25', system: 'chaldean' }
      ],
      biorhythm: [
        { birth_date: '1990-01-01', target_date: new Date().toISOString().split('T')[0] },
        { birth_date: '1985-06-15', target_date: new Date().toISOString().split('T')[0] },
        { birth_date: '1992-12-25', target_date: new Date().toISOString().split('T')[0] }
      ],
      tarot: [
        { question: 'What guidance do I need today?', spreadType: 'three_card' },
        { question: 'What should I focus on?', spreadType: 'single_card' },
        { question: 'How can I improve my relationships?', spreadType: 'three_card' }
      ],
      iching: [
        { question: 'What wisdom do I need today?', method: 'coins' },
        { question: 'How should I approach this situation?', method: 'yarrow' },
        { question: 'What is the best path forward?', method: 'coins' }
      ]
    };

    return commonInputs[engineName] || [];
  }

  // Specific Raycast API Handlers
  private async handleRaycastDailyForecast(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for Raycast daily forecast', requestId);
      }

      const url = new URL(request.url);
      const date = url.searchParams.get('date') || new Date().toISOString().split('T')[0];
      const user = authResult.user;

      // Check Raycast-specific cache first
      const cachedRaycast = await this.kvData.getRaycastCache(user.id.toString(), 'daily-forecast', date);
      if (cachedRaycast) {
        console.log(`[${requestId}] Raycast daily forecast cache hit for ${date}`);
        return this.createResponse(200, {}, {
          ...cachedRaycast.data,
          cached: true,
          cachedAt: cachedRaycast.cachedAt,
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      const userProfile = await this.getUserProfileFromAuth(user);
      if (!userProfile) {
        return this.createErrorResponse(400, 'PROFILE_REQUIRED', 'User profile with birth data required for Raycast daily forecast', requestId);
      }

      // Generate daily forecast optimized for Raycast
      const forecast = await this.generateEnhancedDailyForecast(userProfile, date, requestId, true);

      // Create Raycast-specific response format
      const raycastResponse = {
        success: true,
        date,
        forecast: {
          energyLevel: forecast.energyProfile.overallEnergy,
          trend: forecast.energyProfile.trend,
          summary: forecast.guidance.synthesis.split('\n')[0].substring(0, 100) + '...',
          keyThemes: forecast.guidance.keyThemes,
          recommendations: forecast.recommendations.slice(0, 3),
          criticalDays: forecast.energyProfile.criticalDays.length > 0,
          biorhythm: forecast.energyProfile.biorhythm ? {
            physical: Math.round(forecast.energyProfile.biorhythm.physical),
            emotional: Math.round(forecast.energyProfile.biorhythm.emotional),
            intellectual: Math.round(forecast.energyProfile.biorhythm.intellectual)
          } : null
        },
        raycast: forecast.raycastOptimized,
        metadata: {
          confidence: 85,
          cached: false,
          requestId,
          source: 'raycast-api',
          timestamp: new Date().toISOString()
        }
      };

      // Cache the Raycast response (2 hours TTL for daily forecasts)
      await this.kvData.setRaycastCache(user.id.toString(), 'daily-forecast', date, raycastResponse, 2 * 3600);

      // Create timeline entry
      await this.createTimelineEntry(
        user.id.toString(),
        'raycast_integration',
        { date, type: 'daily-forecast' },
        raycastResponse,
        {
          confidence: 85,
          cached: false,
          requestId,
          source: 'raycast-api'
        }
      );

      return this.createResponse(200, {}, raycastResponse);

    } catch (error) {
      console.error(`[${requestId}] Raycast daily forecast failed:`, error);
      return this.createErrorResponse(500, 'RAYCAST_DAILY_FORECAST_FAILED', 'Raycast daily forecast failed', requestId);
    }
  }

  private async handleRaycastQuickReading(request: Request, requestId: string): Promise<Response> {
    try {
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'AUTHENTICATION_REQUIRED', 'Authentication required for Raycast quick reading', requestId);
      }

      const body = await request.json();
      const { question, engines = ['tarot', 'iching'], includeAI = true } = body;

      if (!question) {
        return this.createErrorResponse(400, 'MISSING_QUESTION', 'Question is required for quick reading', requestId);
      }

      const user = authResult.user;
      const userProfile = await this.getUserProfileFromAuth(user);

      // Generate cache key for quick reading
      const quickReadingHash = this.generateInputHash({ question, engines, userId: user.id });
      const cachedReading = await this.kvData.getRaycastCache(user.id.toString(), 'quick-reading', quickReadingHash);

      if (cachedReading) {
        console.log(`[${requestId}] Raycast quick reading cache hit`);
        return this.createResponse(200, {}, {
          ...cachedReading.data,
          cached: true,
          cachedAt: cachedReading.cachedAt,
          requestId,
          timestamp: new Date().toISOString()
        });
      }

      // Execute quick reading with selected engines
      const engineResults = await Promise.all(
        engines.map(async (engineName: string) => {
          try {
            const input = this.prepareQuickReadingInput(engineName, question, userProfile);
            const result = await this.calculateEngine(engineName as any, input, { useCache: true, userId: user.id.toString() });

            return {
              engine: engineName,
              success: result.success,
              data: result.success ? result.data : null,
              error: result.success ? null : result.error
            };
          } catch (error) {
            return {
              engine: engineName,
              success: false,
              data: null,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        })
      );

      // Filter successful results
      const successfulResults = engineResults.filter(r => r.success);

      let aiInterpretation = null;
      if (includeAI && successfulResults.length > 0) {
        try {
          const aiInterpreter = await this.initializeAIInterpreter();
          if (aiInterpreter) {
            aiInterpretation = await aiInterpreter.synthesizeMultipleReadings(
              successfulResults,
              {
                question,
                focusArea: 'quick_guidance',
                userContext: userProfile ? { name: userProfile.name } : undefined
              }
            );
          }
        } catch (aiError) {
          console.warn(`[${requestId}] AI interpretation failed for quick reading:`, aiError);
        }
      }

      // Create Raycast-optimized response
      const raycastResponse = {
        success: true,
        question,
        engines: engines,
        results: successfulResults.map(r => ({
          engine: r.engine,
          summary: this.extractEngineSummary(r.data),
          keyInsight: this.extractKeyInsight(r.data),
          confidence: r.data?.confidenceScore || r.data?.confidence || 75
        })),
        aiSynthesis: aiInterpretation ? {
          summary: aiInterpretation.summary || aiInterpretation.synthesis,
          keyMessage: aiInterpretation.keyMessage || aiInterpretation.guidance,
          confidence: aiInterpretation.confidence || 80
        } : null,
        raycast: {
          title: `Quick Reading: ${question.substring(0, 50)}...`,
          subtitle: `${successfulResults.length} engines • ${aiInterpretation ? 'AI Enhanced' : 'Direct Reading'}`,
          summary: aiInterpretation?.summary || successfulResults[0]?.data?.formattedOutput?.substring(0, 100) + '...' || 'Reading complete',
          actions: [
            'View Full Reading',
            'Save to History',
            'Share Reading',
            'Ask Follow-up'
          ]
        },
        metadata: {
          totalEngines: engines.length,
          successfulEngines: successfulResults.length,
          hasAI: !!aiInterpretation,
          confidence: aiInterpretation?.confidence || (successfulResults.length > 0 ? 75 : 0),
          cached: false,
          requestId,
          source: 'raycast-api',
          timestamp: new Date().toISOString()
        }
      };

      // Cache the quick reading (30 minutes TTL)
      await this.kvData.setRaycastCache(user.id.toString(), 'quick-reading', quickReadingHash, raycastResponse, 30 * 60);

      // Save reading to history
      await this.kvData.saveReading(user.id.toString(), {
        type: 'quick_reading',
        question,
        engines,
        results: successfulResults,
        aiInterpretation,
        timestamp: new Date().toISOString(),
        source: 'raycast-api'
      });

      // Create timeline entry
      await this.createTimelineEntry(
        user.id.toString(),
        'engine_calculation',
        { question, engines },
        raycastResponse,
        {
          confidence: raycastResponse.metadata.confidence,
          cached: false,
          requestId,
          source: 'raycast-api'
        }
      );

      return this.createResponse(200, {}, raycastResponse);

    } catch (error) {
      console.error(`[${requestId}] Raycast quick reading failed:`, error);
      return this.createErrorResponse(500, 'RAYCAST_QUICK_READING_FAILED', 'Raycast quick reading failed', requestId);
    }
  }

  // Helper methods for Raycast quick reading
  private prepareQuickReadingInput(engineName: string, question: string, userProfile: any): any {
    const baseInput = { question };

    switch (engineName) {
      case 'tarot':
        return {
          ...baseInput,
          spreadType: 'single_card',
          focusArea: 'general'
        };
      case 'iching':
        return {
          ...baseInput,
          method: 'coins',
          includeChangingLines: false
        };
      case 'numerology':
        return userProfile ? {
          fullName: userProfile.name || userProfile.fullName,
          birthDate: userProfile.birthDate,
          system: 'pythagorean'
        } : baseInput;
      case 'biorhythm':
        return userProfile ? {
          birth_date: userProfile.birthDate,
          target_date: new Date().toISOString().split('T')[0]
        } : baseInput;
      default:
        return baseInput;
    }
  }

  private extractEngineSummary(engineData: any): string {
    if (!engineData) return 'No data available';

    return engineData.formattedOutput?.substring(0, 150) + '...' ||
           engineData.summary ||
           engineData.interpretation ||
           'Reading complete';
  }

  private extractKeyInsight(engineData: any): string {
    if (!engineData) return 'No insight available';

    return engineData.keyInsight ||
           engineData.guidance ||
           engineData.recommendations?.[0] ||
           engineData.formattedOutput?.split('\n')[0] ||
           'Insight generated';
  }

  private generateInputHash(input: any): string {
    const inputString = JSON.stringify(input, Object.keys(input).sort());
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Helper method to create timeline entries for forecasts and calculations
  private async createTimelineEntry(
    userId: string,
    type: TimelineEntryType,
    input: any,
    result: any,
    metadata: Partial<TimelineEntry['metadata']>,
    engineName?: string,
    workflowType?: string
  ): Promise<void> {
    try {
      const entry: TimelineEntry = {
        id: crypto.randomUUID(),
        userId,
        timestamp: new Date().toISOString(),
        type,
        engineName,
        workflowType,
        input,
        result,
        metadata: {
          confidence: metadata.confidence || 0,
          cached: metadata.cached || false,
          requestId: metadata.requestId || '',
          accuracy: metadata.accuracy,
          tags: metadata.tags || [],
          duration: metadata.duration,
          modelUsed: metadata.modelUsed,
          cacheHit: metadata.cacheHit,
          source: metadata.source || 'api'
        }
      };

      await this.kvData.createTimelineEntry(entry);
    } catch (error) {
      console.error('Failed to create timeline entry:', error);
      // Don't throw - timeline creation shouldn't break the main flow
    }
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
/**
 * Base Handler for WitnessOS API
 * 
 * Provides common functionality for all API handlers including
 * authentication, response formatting, error handling, and shared utilities.
 */

import { createKVDataAccess, CloudflareKVDataAccess } from '../../lib/kv-data-access';
import { AuthService } from '../../lib/auth';
import { createAIInterpreter, AIInterpreter } from '../../lib/ai-interpreter';

export interface HandlerEnvironment {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  KV_USER_PROFILES: KVNamespace;
  KV_FORECASTS: KVNamespace;
  OPENROUTER_API_KEY?: string;
  [key: string]: any;
}

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export interface HandlerResponse {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: any;
}

/**
 * Base class for all API handlers
 * Provides common functionality and utilities
 */
export abstract class BaseHandler {
  protected db: D1Database;
  protected kvData: CloudflareKVDataAccess;
  protected auth: AuthService;
  protected aiInterpreter?: AIInterpreter;

  constructor(protected env: HandlerEnvironment) {
    this.db = env.DB;
    this.kvData = createKVDataAccess(env);
    this.auth = new AuthService(env.DB);
    this.initializeAI();
  }

  /**
   * Initialize AI interpreter if API key is available
   */
  private async initializeAI(): Promise<void> {
    try {
      if (this.env.OPENROUTER_API_KEY) {
        this.aiInterpreter = await createAIInterpreter({
          apiKey: this.env.OPENROUTER_API_KEY,
          model: 'anthropic/claude-3-haiku',
          fallbackModel1: 'meta-llama/llama-3.1-8b-instruct:free',
          fallbackModel2: 'microsoft/wizardlm-2-8x22b'
        });
      }
    } catch (error) {
      console.error('Failed to initialize AI interpreter:', error);
    }
  }

  /**
   * Abstract method that each handler must implement
   */
  abstract handle(request: Request, requestId?: string): Promise<Response>;

  /**
   * Authenticate request and return user information
   */
  protected async authenticateRequest(request: Request): Promise<AuthResult> {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { success: false, error: 'Missing or invalid authorization header' };
      }

      const token = authHeader.substring(7);
      const result = await this.auth.validateSession(token);
      
      if (!result.success || !result.user) {
        return { success: false, error: 'Invalid or expired token' };
      }

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Create standardized success response
   */
  protected createResponse(
    status: number = 200,
    headers: Record<string, string> = {},
    data: any = null
  ): Response {
    const responseHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    };

    return new Response(JSON.stringify(data), {
      status,
      headers: responseHeaders
    });
  }

  /**
   * Create standardized error response
   */
  protected createErrorResponse(
    status: number,
    code: string,
    message: string,
    requestId: string,
    details?: any
  ): Response {
    const errorResponse = {
      success: false,
      error: {
        code,
        message,
        details,
        requestId,
        timestamp: new Date().toISOString()
      }
    };

    return this.createResponse(status, {}, errorResponse);
  }

  /**
   * Generate unique request ID
   */
  protected generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Validate request method
   */
  protected validateMethod(request: Request, allowedMethods: string[]): boolean {
    return allowedMethods.includes(request.method);
  }

  /**
   * Parse and validate JSON body
   */
  protected async parseJsonBody(request: Request): Promise<any> {
    try {
      const contentType = request.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Content-Type must be application/json');
      }

      const body = await request.json();
      return body;
    } catch (error) {
      throw new Error('Invalid JSON body');
    }
  }

  /**
   * Extract path parameters from URL
   */
  protected extractPathParams(url: URL, basePath: string): string[] {
    const fullPath = url.pathname;
    const basePathIndex = fullPath.indexOf(basePath);
    
    if (basePathIndex === -1) {
      return [];
    }

    const remainingPath = fullPath.substring(basePathIndex + basePath.length);
    return remainingPath.split('/').filter(segment => segment.length > 0);
  }

  /**
   * Extract query parameters
   */
  protected extractQueryParams(url: URL): Record<string, string> {
    const params: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  protected isValidDate(dateString: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Create timeline entry for user actions
   */
  protected async createTimelineEntry(
    userId: string,
    type: string,
    input: any,
    result: any,
    metadata: any = {}
  ): Promise<void> {
    try {
      const entry = {
        id: this.generateRequestId(),
        userId,
        type,
        input,
        result,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: 'api'
        },
        createdAt: new Date().toISOString()
      };

      // Store in database
      await this.db.prepare(`
        INSERT INTO reading_history (user_id, reading_id, reading_type, input_data, results, accessed_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        userId,
        entry.id,
        type,
        JSON.stringify(input),
        JSON.stringify(result),
        entry.createdAt
      ).run();

    } catch (error) {
      console.error('Failed to create timeline entry:', error);
      // Don't throw - timeline creation shouldn't break the main flow
    }
  }

  /**
   * Log request for debugging and monitoring
   */
  protected logRequest(request: Request, requestId: string, additionalData?: any): void {
    const logData = {
      requestId,
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('User-Agent'),
      ...additionalData
    };

    console.log(`[${requestId}] ${request.method} ${request.url}`, logData);
  }

  /**
   * Handle CORS preflight requests
   */
  protected handleCORS(request: Request): Response | null {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    return null;
  }

  /**
   * Rate limiting check (basic implementation)
   */
  protected async checkRateLimit(userId: string, action: string): Promise<boolean> {
    try {
      const key = `rate_limit:${userId}:${action}`;
      const current = await this.kvData.cache.get(key);
      const limit = 100; // requests per hour
      const window = 3600; // 1 hour in seconds

      if (!current) {
        await this.kvData.cache.put(key, '1', { expirationTtl: window });
        return true;
      }

      const count = parseInt(current);
      if (count >= limit) {
        return false;
      }

      await this.kvData.cache.put(key, (count + 1).toString(), { expirationTtl: window });
      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow request if rate limiting fails
    }
  }
}

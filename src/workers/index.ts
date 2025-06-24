/**
 * WitnessOS Cloudflare Workers Main Entry Point
 * 
 * Serves as the unified backend for all 10 consciousness engines
 * Handles routing, authentication, rate limiting, and error handling
 */

import { WitnessOSAPIHandler, handleBatchCalculation } from './api-handlers';

// Worker Environment Interface
interface WorkerEnvironment {
  // KV Namespaces
  ENGINE_DATA: KVNamespace;
  USER_PROFILES: KVNamespace;
  CACHE: KVNamespace;
  
  // Environment Variables
  ENVIRONMENT: string;
  API_VERSION: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_MAX: string;
  RATE_LIMIT_WINDOW: string;
  
  // Optional Secrets
  ADMIN_API_KEY?: string;
  WEBHOOK_SECRET?: string;
}

// Rate Limiting
interface RateLimitState {
  count: number;
  resetTime: number;
}

class RateLimiter {
  constructor(private maxRequests = 100, private windowMs = 60000) {} // 100 requests per minute default

  async checkRateLimit(clientId: string, kv: KVNamespace): Promise<{ allowed: boolean; remainingRequests: number; resetTime: number }> {
    const key = `rate_limit:${clientId}`;
    const now = Date.now();
    
    try {
      const stateData = await kv.get(key, { type: 'json' }) as RateLimitState | null;
      
      if (!stateData || now > stateData.resetTime) {
        // First request or window expired
        const newState: RateLimitState = {
          count: 1,
          resetTime: now + this.windowMs
        };
        
        await kv.put(key, JSON.stringify(newState), { expirationTtl: Math.ceil(this.windowMs / 1000) });
        
        return {
          allowed: true,
          remainingRequests: this.maxRequests - 1,
          resetTime: newState.resetTime
        };
      }
      
      if (stateData.count >= this.maxRequests) {
        return {
          allowed: false,
          remainingRequests: 0,
          resetTime: stateData.resetTime
        };
      }
      
      // Increment count
      const updatedState: RateLimitState = {
        count: stateData.count + 1,
        resetTime: stateData.resetTime
      };
      
      await kv.put(key, JSON.stringify(updatedState), { expirationTtl: Math.ceil((stateData.resetTime - now) / 1000) });
      
      return {
        allowed: true,
        remainingRequests: this.maxRequests - updatedState.count,
        resetTime: stateData.resetTime
      };
      
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request
      return {
        allowed: true,
        remainingRequests: this.maxRequests,
        resetTime: now + this.windowMs
      };
    }
  }
}

// Authentication Helper
function getClientId(request: Request): string {
  // Try to get client ID from various sources
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7); // Remove 'Bearer ' prefix
  }
  
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  const cfConnectingIP = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
  
  // Fallback to IP + User-Agent hash
  return `${cfConnectingIP}_${btoa(userAgent).slice(0, 8)}`;
}

// Error Response Helper
function createErrorResponse(status: number, error: string, message: string, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({
    error,
    message,
    timestamp: new Date().toISOString(),
    status
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    }
  });
}

// Main Worker Export
export default {
  async fetch(request: Request, env: WorkerEnvironment, ctx: ExecutionContext): Promise<Response> {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    const url = new URL(request.url);
    
    console.log(`[${requestId}] ${request.method} ${url.pathname} - Start`);
    
    try {
      // CORS Preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': env.CORS_ORIGIN || '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
            'Access-Control-Max-Age': '86400'
          }
        });
      }

      // Rate Limiting
      const clientId = getClientId(request);
      const rateLimiter = new RateLimiter(
        parseInt(env.RATE_LIMIT_MAX || '100'),
        parseInt(env.RATE_LIMIT_WINDOW || '60000')
      );
      
      const rateLimit = await rateLimiter.checkRateLimit(clientId, env.CACHE);
      
      if (!rateLimit.allowed) {
        return createErrorResponse(
          429, 
          'RATE_LIMIT_EXCEEDED', 
          'Too many requests',
          {
            'X-RateLimit-Limit': env.RATE_LIMIT_MAX || '100',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        );
      }

      // Initialize API Handler
      const apiHandler = new WitnessOSAPIHandler({
        ENGINE_DATA: env.ENGINE_DATA,
        USER_PROFILES: env.USER_PROFILES,
        CACHE: env.CACHE
      });

      let response: Response;

      // Special Routes
      if (url.pathname === '/') {
        // Root endpoint - API info
        response = new Response(JSON.stringify({
          name: 'WitnessOS Consciousness API',
          version: env.API_VERSION || '1.0.0',
          environment: env.ENVIRONMENT || 'production',
          engines: 10,
          endpoints: {
            health: '/health',
            engines: '/engines',
            calculate: '/engines/{engine}/calculate',
            batch: '/batch',
            profiles: '/profiles/{userId}',
            cache: '/cache/clear'
          },
          documentation: 'https://docs.witnessOS.com/api',
          status: 'operational',
          requestId
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      } else if (url.pathname === '/batch') {
        // Batch calculations
        response = await handleBatchCalculation(request, {
          ENGINE_DATA: env.ENGINE_DATA,
          USER_PROFILES: env.USER_PROFILES,
          CACHE: env.CACHE
        }, requestId);
      } else {
        // Regular API routes
        response = await apiHandler.handleRequest(request, env);
      }

      // Add rate limit headers to successful responses
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-RateLimit-Limit', env.RATE_LIMIT_MAX || '100');
      newHeaders.set('X-RateLimit-Remaining', rateLimit.remainingRequests.toString());
      newHeaders.set('X-RateLimit-Reset', new Date(rateLimit.resetTime).toISOString());
      newHeaders.set('X-Request-ID', requestId);
      newHeaders.set('X-Response-Time', `${Date.now() - startTime}ms`);

      const finalResponse = new Response(response.body, {
        status: response.status,
        headers: newHeaders
      });

      const duration = Date.now() - startTime;
      console.log(`[${requestId}] ${request.method} ${url.pathname} - ${response.status} (${duration}ms)`);

      return finalResponse;

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[${requestId}] Unhandled worker error (${duration}ms):`, error);
      
      return createErrorResponse(
        500,
        'INTERNAL_SERVER_ERROR',
        'An unexpected error occurred',
        {
          'X-Request-ID': requestId,
          'X-Response-Time': `${duration}ms`
        }
      );
    }
  },

  // Scheduled event handler for maintenance tasks
  async scheduled(event: ScheduledEvent, env: WorkerEnvironment, ctx: ExecutionContext): Promise<void> {
    console.log('Running scheduled maintenance task:', event.cron);
    
    try {
      const apiHandler = new WitnessOSAPIHandler({
        ENGINE_DATA: env.ENGINE_DATA,
        USER_PROFILES: env.USER_PROFILES,
        CACHE: env.CACHE
      });

      // Perform cache cleanup
      await apiHandler['kvData'].clearCache();
      console.log('Cache cleanup completed');

      // Health check logging
      const health = await apiHandler['kvData'].healthCheck();
      console.log('Health check result:', health);

    } catch (error) {
      console.error('Scheduled task failed:', error);
    }
  }
};

// Export types for other modules
export type { WorkerEnvironment };
export { RateLimiter, getClientId, createErrorResponse }; 
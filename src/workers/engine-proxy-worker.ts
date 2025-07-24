/**
 * Engine Proxy Worker for WitnessOS
 * 
 * Cloudflare Worker that proxies requests to Railway-hosted Python engines
 * with retry logic, caching, and error handling for the hybrid architecture.
 */

import type { EngineName } from '../types/engines';

// Railway API configuration
const RAILWAY_BASE_URL = 'https://webshore-witnessos-aleph-production.up.railway.app';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const REQUEST_TIMEOUT_MS = 30000;
const CACHE_TTL_SECONDS = 300; // 5 minutes

// Cloudflare Workers types
interface KVNamespace {
  get(key: string, options?: any): Promise<string | null>;
  put(key: string, value: string, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: any): Promise<any>;
}

interface EngineProxyEnv {
  KV_CACHE: KVNamespace;
  KV_ENGINE_DATA?: KVNamespace;
  RAILWAY_API_KEY?: string;
  ENVIRONMENT?: string;
}

interface EngineRequest {
  engine: EngineName;
  input: any;
  requestId?: string;
}

interface EngineResponse {
  success: boolean;
  data?: any;
  error?: string;
  requestId?: string;
  cached?: boolean;
  executionTime?: number;
}

interface RetryConfig {
  maxRetries: number;
  delayMs: number;
  backoffMultiplier: number;
}

/**
 * Engine Proxy Worker Class
 * Handles communication with Railway Python engines
 */
export class EngineProxyWorker {
  constructor(private env: EngineProxyEnv) {}
  
  /**
   * Calculate using a specific engine on Railway
   */
  async calculate(request: EngineRequest): Promise<EngineResponse> {
    const startTime = Date.now();
    const requestId = request.requestId || this.generateRequestId();
    
    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request.engine, request.input);
      const cached = await this.getCachedResult(cacheKey);
      
      if (cached) {
        return {
          success: true,
          data: cached,
          requestId,
          cached: true,
          executionTime: Date.now() - startTime
        };
      }
      
      // Make request to Railway with retry logic
      const result = await this.makeRequestWithRetry(
        request.engine,
        request.input,
        {
          maxRetries: MAX_RETRIES,
          delayMs: RETRY_DELAY_MS,
          backoffMultiplier: 2
        }
      );
      
      // Cache successful results
      if (result.success && result.data) {
        await this.cacheResult(cacheKey, result.data);
      }
      
      return {
        ...result,
        requestId,
        cached: false,
        executionTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error(`[${requestId}] Engine proxy error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
        executionTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Health check for Railway engines
   */
  async healthCheck(): Promise<EngineResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    try {
      const response = await this.fetchWithTimeout(
        `${RAILWAY_BASE_URL}/health`,
        {
          method: 'GET',
          headers: this.getHeaders()
        },
        REQUEST_TIMEOUT_MS
      );
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data,
        requestId,
        executionTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error(`[${requestId}] Health check error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Health check failed',
        requestId,
        executionTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * List available engines from Railway
   */
  async listEngines(): Promise<EngineResponse> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    try {
      const response = await this.fetchWithTimeout(
        `${RAILWAY_BASE_URL}/engines`,
        {
          method: 'GET',
          headers: this.getHeaders()
        },
        REQUEST_TIMEOUT_MS
      );
      
      if (!response.ok) {
        throw new Error(`List engines failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        success: true,
        data,
        requestId,
        executionTime: Date.now() - startTime
      };
      
    } catch (error) {
      console.error(`[${requestId}] List engines error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list engines',
        requestId,
        executionTime: Date.now() - startTime
      };
    }
  }
  
  /**
   * Make HTTP request with retry logic
   */
  private async makeRequestWithRetry(
    engine: EngineName,
    input: any,
    config: RetryConfig
  ): Promise<EngineResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(
          `${RAILWAY_BASE_URL}/engines/${engine}/calculate`,
          {
            method: 'POST',
            headers: {
              ...this.getHeaders(),
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input })
          },
          REQUEST_TIMEOUT_MS
        );
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        return {
          success: true,
          data
        };
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          break;
        }
        
        // Wait before retry (with exponential backoff)
        if (attempt < config.maxRetries) {
          const delay = config.delayMs * Math.pow(config.backoffMultiplier, attempt);
          await this.sleep(delay);
        }
      }
    }
    
    return {
      success: false,
      error: lastError?.message || 'Request failed after retries'
    };
  }
  
  /**
   * Fetch with timeout
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeoutMs: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      
      throw error;
    }
  }
  
  /**
   * Get HTTP headers for Railway requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': 'WitnessOS-Cloudflare-Proxy/1.0',
      'Accept': 'application/json'
    };
    
    if (this.env.RAILWAY_API_KEY) {
      headers['Authorization'] = `Bearer ${this.env.RAILWAY_API_KEY}`;
    }
    
    return headers;
  }
  
  /**
   * Generate cache key for engine requests
   */
  private generateCacheKey(engine: EngineName, input: any): string {
    const inputHash = this.hashObject(input);
    return `engine:${engine}:${inputHash}`;
  }
  
  /**
   * Get cached result
   */
  private async getCachedResult(cacheKey: string): Promise<any | null> {
    try {
      const cached = await this.env.KV_CACHE.get(cacheKey, 'json');
      return cached;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }
  
  /**
   * Cache result
   */
  private async cacheResult(cacheKey: string, data: any): Promise<void> {
    try {
      await this.env.KV_CACHE.put(
        cacheKey,
        JSON.stringify(data),
        { expirationTtl: CACHE_TTL_SECONDS }
      );
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }
  
  /**
   * Simple object hash for cache keys
   */
  private hashObject(obj: any): string {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    let hash = 0;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }
  
  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}



/**
 * Utility functions for engine proxy
 */
export const EngineProxyUtils = {
  /**
   * Test Railway connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${RAILWAY_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'User-Agent': 'WitnessOS-Test/1.0'
        }
      });
      
      return response.ok;
    } catch {
      return false;
    }
  },
  
  /**
   * Get Railway service info
   */
  async getServiceInfo(): Promise<any> {
    try {
      const response = await fetch(`${RAILWAY_BASE_URL}/`, {
        method: 'GET',
        headers: {
          'User-Agent': 'WitnessOS-Test/1.0'
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      return null;
    } catch {
      return null;
    }
  }
};

/**
 * Main fetch handler for Cloudflare Worker
 */
export default {
  async fetch(request: Request, env: EngineProxyEnv): Promise<Response> {
    const proxy = new EngineProxyWorker(env);
    
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      const method = request.method;
      
      // CORS preflight
      if (method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
          }
        });
      }
      
      // Health check
      if (path === '/health' && method === 'GET') {
        const result = await proxy.healthCheck();
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // List engines
      if ((path === '/engines' || path === '/engines/') && method === 'GET') {
        const result = await proxy.listEngines();
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Calculate engine
      if (path.startsWith('/engines/') && path.endsWith('/calculate') && method === 'POST') {
        const pathParts = path.split('/');
        const engine = pathParts[2] as EngineName;
        
        if (!engine) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Engine name required'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        const body = await request.json();
        const { input } = body;
        
        if (!input) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Input required'
          }), {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
        
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const result = await proxy.calculate({ engine, input, requestId });
        
        return new Response(JSON.stringify(result), {
          status: result.success ? 200 : 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // Default 404
      return new Response(JSON.stringify({
        success: false,
        error: 'Not found'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
      
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Internal server error'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
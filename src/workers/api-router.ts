/**
 * API Router for WitnessOS
 * 
 * Main request router that orchestrates modular handlers.
 * Replaces the monolithic api-handlers.ts approach with a clean,
 * maintainable routing system.
 */

import { BaseHandler, HandlerEnvironment } from '../handlers/base/base-handler';
import { ForecastHandler } from '../handlers/forecast-handler';

// Import other handlers as they're created
// import { EngineHandler } from '../handlers/engine-handler';
// import { AuthHandler } from '../handlers/auth-handler';
// import { IntegrationHandler } from '../handlers/integration-handler';

export class APIRouter {
  private handlers: Map<string, BaseHandler> = new Map();
  private env: HandlerEnvironment;

  constructor(env: HandlerEnvironment) {
    this.env = env;
    this.initializeHandlers();
  }

  /**
   * Initialize all handlers
   */
  private initializeHandlers(): void {
    try {
      // Initialize forecast handler
      this.handlers.set('forecast', new ForecastHandler(this.env));
      
      // TODO: Initialize other handlers as they're migrated
      // this.handlers.set('engine', new EngineHandler(this.env));
      // this.handlers.set('auth', new AuthHandler(this.env));
      // this.handlers.set('integration', new IntegrationHandler(this.env));
      
      console.log(`✅ Initialized ${this.handlers.size} API handlers`);
    } catch (error) {
      console.error('Failed to initialize handlers:', error);
      throw error;
    }
  }

  /**
   * Main routing method
   */
  async route(request: Request): Promise<Response> {
    const requestId = this.generateRequestId();
    
    try {
      const url = new URL(request.url);
      const pathSegments = url.pathname.split('/').filter(Boolean);
      
      // Log request
      console.log(`[${requestId}] ${request.method} ${url.pathname}`);

      // Handle health check
      if (pathSegments.length === 2 && pathSegments[0] === 'api' && pathSegments[1] === 'health') {
        return this.handleHealthCheck(requestId);
      }

      // Route to appropriate handler
      if (pathSegments.length >= 2 && pathSegments[0] === 'api') {
        const handlerName = pathSegments[1];
        const handler = this.handlers.get(handlerName);
        
        if (handler) {
          return await handler.handle(request, requestId);
        }
        
        // Fallback to legacy handler for non-migrated endpoints
        return await this.handleLegacyEndpoint(request, requestId, handlerName);
      }

      // Default 404 response
      return this.createNotFoundResponse(requestId);

    } catch (error) {
      console.error(`[${requestId}] Router error:`, error);
      return this.createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error', requestId);
    }
  }

  /**
   * Handle health check endpoint
   */
  private handleHealthCheck(requestId: string): Response {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      handlers: Array.from(this.handlers.keys()),
      requestId
    };

    return this.createResponse(200, {}, healthData);
  }

  /**
   * Handle legacy endpoints that haven't been migrated yet
   */
  private async handleLegacyEndpoint(
    request: Request, 
    requestId: string, 
    handlerName: string
  ): Promise<Response> {
    // Import the legacy handler dynamically to avoid loading it unless needed
    try {
      const { WitnessOSAPIHandler } = await import('./api-handlers');
      const legacyHandler = new WitnessOSAPIHandler(this.env);
      
      console.log(`[${requestId}] Routing to legacy handler for: ${handlerName}`);
      return await legacyHandler.handleRequest(request);
      
    } catch (error) {
      console.error(`[${requestId}] Legacy handler failed:`, error);
      return this.createErrorResponse(500, 'LEGACY_HANDLER_ERROR', 'Legacy handler failed', requestId);
    }
  }

  /**
   * Create 404 response
   */
  private createNotFoundResponse(requestId: string): Response {
    return this.createErrorResponse(404, 'NOT_FOUND', 'Endpoint not found', requestId);
  }

  /**
   * Create standardized response
   */
  private createResponse(
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
  private createErrorResponse(
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
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get handler statistics
   */
  getHandlerStats(): Record<string, any> {
    return {
      totalHandlers: this.handlers.size,
      handlers: Array.from(this.handlers.keys()),
      initialized: true,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Factory function to create and configure the API router
 */
export function createAPIRouter(env: HandlerEnvironment): APIRouter {
  return new APIRouter(env);
}

/**
 * Main entry point for Cloudflare Worker
 */
export default {
  async fetch(request: Request, env: HandlerEnvironment): Promise<Response> {
    try {
      const router = createAPIRouter(env);
      return await router.route(request);
    } catch (error) {
      console.error('Worker error:', error);
      
      return new Response(JSON.stringify({
        success: false,
        error: {
          code: 'WORKER_ERROR',
          message: 'Worker initialization failed',
          timestamp: new Date().toISOString()
        }
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

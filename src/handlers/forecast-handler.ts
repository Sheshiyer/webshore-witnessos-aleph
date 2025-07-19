/**
 * Forecast Handler for WitnessOS API
 * 
 * Handles daily and weekly forecast endpoints with Raycast integration support.
 * Separated from main API handlers for better maintainability and testing.
 */

import { BaseHandler, HandlerEnvironment } from './base/base-handler';
import { ForecastService } from '../services/forecast-service';
import type { 
  DailyForecast, 
  WeeklyForecast, 
  ForecastBatchRequest, 
  ForecastBatchResponse 
} from '../types/forecast';

export class ForecastHandler extends BaseHandler {
  private forecastService: ForecastService;

  constructor(env: HandlerEnvironment) {
    super(env);
    this.forecastService = new ForecastService(this.kvData, this.aiInterpreter);
  }

  /**
   * Main handler method - routes forecast requests
   */
  async handle(request: Request, requestId?: string): Promise<Response> {
    const id = requestId || this.generateRequestId();
    this.logRequest(request, id);

    // Handle CORS preflight
    const corsResponse = this.handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const pathSegments = this.extractPathParams(url, '/api/forecast');

    try {
      // Route to specific forecast endpoint
      if (pathSegments.length === 0) {
        return this.createErrorResponse(400, 'INVALID_PATH', 'Forecast endpoint required', id);
      }

      const endpoint = pathSegments[0];
      
      switch (endpoint) {
        case 'daily':
          return await this.handleDailyForecastRoutes(request, pathSegments.slice(1), id);
        case 'weekly':
          return await this.handleWeeklyForecastRoutes(request, pathSegments.slice(1), id);
        default:
          return this.createErrorResponse(404, 'ENDPOINT_NOT_FOUND', `Forecast endpoint '${endpoint}' not found`, id);
      }

    } catch (error) {
      console.error(`[${id}] Forecast handler error:`, error);
      return this.createErrorResponse(500, 'INTERNAL_ERROR', 'Internal server error', id);
    }
  }

  /**
   * Handle daily forecast routes
   */
  private async handleDailyForecastRoutes(
    request: Request, 
    pathSegments: string[], 
    requestId: string
  ): Promise<Response> {
    const method = request.method;
    
    if (method === 'GET') {
      if (pathSegments.length === 0) {
        // GET /forecast/daily
        return await this.handleDailyForecast(request, requestId);
      } else if (pathSegments.length === 1) {
        // GET /forecast/daily/{date}
        const date = pathSegments[0];
        return await this.handleDailyForecastByDate(request, requestId, date);
      }
    } else if (method === 'POST' && pathSegments.length === 1 && pathSegments[0] === 'batch') {
      // POST /forecast/daily/batch
      return await this.handleDailyForecastBatch(request, requestId);
    }

    return this.createErrorResponse(404, 'ROUTE_NOT_FOUND', 'Daily forecast route not found', requestId);
  }

  /**
   * Handle weekly forecast routes
   */
  private async handleWeeklyForecastRoutes(
    request: Request, 
    pathSegments: string[], 
    requestId: string
  ): Promise<Response> {
    const method = request.method;
    
    if (method === 'GET') {
      if (pathSegments.length === 0) {
        // GET /forecast/weekly
        return await this.handleWeeklyForecast(request, requestId);
      } else if (pathSegments.length === 1) {
        // GET /forecast/weekly/{week}
        const week = pathSegments[0];
        return await this.handleWeeklyForecastByWeek(request, requestId, week);
      }
    } else if (method === 'POST' && pathSegments.length === 1 && pathSegments[0] === 'batch') {
      // POST /forecast/weekly/batch
      return await this.handleWeeklyForecastBatch(request, requestId);
    }

    return this.createErrorResponse(404, 'ROUTE_NOT_FOUND', 'Weekly forecast route not found', requestId);
  }

  /**
   * Get daily forecast for today or specified date
   */
  private async handleDailyForecast(request: Request, requestId: string): Promise<Response> {
    try {
      // Authenticate user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', requestId);
      }

      const url = new URL(request.url);
      const queryParams = this.extractQueryParams(url);
      const date = queryParams.date || new Date().toISOString().split('T')[0];
      const raycastOptimized = queryParams.raycast === 'true';

      // Validate date format
      if (!this.isValidDate(date)) {
        return this.createErrorResponse(400, 'INVALID_DATE', 'Invalid date format. Use YYYY-MM-DD', requestId);
      }

      // Check rate limiting
      const rateLimitOk = await this.checkRateLimit(authResult.user.id.toString(), 'daily_forecast');
      if (!rateLimitOk) {
        return this.createErrorResponse(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests', requestId);
      }

      // Generate forecast
      const forecast = await this.forecastService.generateDailyForecast(
        authResult.user.id.toString(),
        date,
        { raycastOptimized, requestId }
      );

      // Create timeline entry
      await this.createTimelineEntry(
        authResult.user.id.toString(),
        'forecast_daily',
        { date, raycastOptimized },
        forecast,
        { requestId, source: 'api' }
      );

      return this.createResponse(200, {}, {
        success: true,
        forecast,
        cached: forecast.cached || false,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Daily forecast failed:`, error);
      return this.createErrorResponse(500, 'FORECAST_FAILED', 'Daily forecast generation failed', requestId);
    }
  }

  /**
   * Get daily forecast for specific date
   */
  private async handleDailyForecastByDate(
    request: Request, 
    requestId: string, 
    date: string
  ): Promise<Response> {
    // Validate date format
    if (!this.isValidDate(date)) {
      return this.createErrorResponse(400, 'INVALID_DATE', 'Invalid date format. Use YYYY-MM-DD', requestId);
    }

    // Create new request with date parameter
    const url = new URL(request.url);
    url.searchParams.set('date', date);
    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    return await this.handleDailyForecast(modifiedRequest, requestId);
  }

  /**
   * Handle batch daily forecast requests
   */
  private async handleDailyForecastBatch(request: Request, requestId: string): Promise<Response> {
    try {
      // Validate method
      if (!this.validateMethod(request, ['POST'])) {
        return this.createErrorResponse(405, 'METHOD_NOT_ALLOWED', 'Only POST method allowed', requestId);
      }

      // Authenticate user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', requestId);
      }

      // Parse request body
      const body = await this.parseJsonBody(request) as ForecastBatchRequest;
      
      if (!body.userProfile || !body.userProfile.birthDate) {
        return this.createErrorResponse(400, 'MISSING_PROFILE', 'User profile with birth date required', requestId);
      }

      // Check rate limiting
      const rateLimitOk = await this.checkRateLimit(authResult.user.id.toString(), 'batch_forecast');
      if (!rateLimitOk) {
        return this.createErrorResponse(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests', requestId);
      }

      // Generate batch forecasts
      const batchResponse = await this.forecastService.generateDailyForecastBatch(
        authResult.user.id.toString(),
        body,
        { requestId }
      );

      return this.createResponse(200, {}, batchResponse);

    } catch (error) {
      console.error(`[${requestId}] Batch daily forecast failed:`, error);
      return this.createErrorResponse(500, 'BATCH_FORECAST_FAILED', 'Batch forecast generation failed', requestId);
    }
  }

  /**
   * Get weekly forecast
   */
  private async handleWeeklyForecast(request: Request, requestId: string): Promise<Response> {
    try {
      // Authenticate user
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required', requestId);
      }

      const url = new URL(request.url);
      const queryParams = this.extractQueryParams(url);
      const weekStart = queryParams.week || this.getCurrentWeekStart();
      const raycastOptimized = queryParams.raycast === 'true';

      // Generate weekly forecast
      const forecast = await this.forecastService.generateWeeklyForecast(
        authResult.user.id.toString(),
        weekStart,
        { raycastOptimized, requestId }
      );

      return this.createResponse(200, {}, {
        success: true,
        forecast,
        cached: forecast.cached || false,
        requestId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error(`[${requestId}] Weekly forecast failed:`, error);
      return this.createErrorResponse(500, 'WEEKLY_FORECAST_FAILED', 'Weekly forecast generation failed', requestId);
    }
  }

  /**
   * Get weekly forecast for specific week
   */
  private async handleWeeklyForecastByWeek(
    request: Request, 
    requestId: string, 
    week: string
  ): Promise<Response> {
    // Validate week format
    if (!this.isValidDate(week)) {
      return this.createErrorResponse(400, 'INVALID_WEEK', 'Invalid week format. Use YYYY-MM-DD for Monday', requestId);
    }

    // Ensure the date is a Monday
    const weekDate = new Date(week);
    if (weekDate.getDay() !== 1) { // 1 = Monday
      const monday = new Date(weekDate);
      monday.setDate(weekDate.getDate() - weekDate.getDay() + 1);
      week = monday.toISOString().split('T')[0];
    }

    // Create new request with week parameter
    const url = new URL(request.url);
    url.searchParams.set('week', week);
    const modifiedRequest = new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    return await this.handleWeeklyForecast(modifiedRequest, requestId);
  }

  /**
   * Handle batch weekly forecast requests
   */
  private async handleWeeklyForecastBatch(request: Request, requestId: string): Promise<Response> {
    try {
      // Implementation similar to daily batch but for weekly forecasts
      // ... (implementation details)
      
      return this.createErrorResponse(501, 'NOT_IMPLEMENTED', 'Weekly batch forecast not yet implemented', requestId);
    } catch (error) {
      console.error(`[${requestId}] Batch weekly forecast failed:`, error);
      return this.createErrorResponse(500, 'BATCH_WEEKLY_FORECAST_FAILED', 'Batch weekly forecast failed', requestId);
    }
  }

  /**
   * Get current week start (Monday)
   */
  private getCurrentWeekStart(): string {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  }
}

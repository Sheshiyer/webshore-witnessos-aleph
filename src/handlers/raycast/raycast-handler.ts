/**
 * Raycast Integration Handler for WitnessOS API
 *
 * Handles Raycast extension requests including daily forecasts,
 * quick readings, and Raycast-specific response formatting.
 */

import { BaseHandler, HandlerEnvironment } from '../base/base-handler';
import { calculateEngine } from '../../engines';
import type { EngineName } from '../../types/engines';

export interface RaycastRequest {
  userProfile?: {
    userId: string;
    fullName?: string;
    birthDate?: string;
    birthTime?: string;
    birthLocation?: string;
    birthLatitude?: number;
    birthLongitude?: number;
  };
  preferences?: {
    engines?: string[];
    format?: 'markdown' | 'json';
    includeActions?: boolean;
    maxLength?: number;
  };
}

export interface RaycastResponse {
  success: boolean;
  data?: any;
  formatted?: string;
  actions?: Array<{
    title: string;
    url: string;
    icon?: string;
  }>;
  metadata?: {
    source: 'raycast';
    timestamp: string;
    executionTime: number;
  };
}

export class RaycastHandler extends BaseHandler {
  constructor(env: HandlerEnvironment) {
    super(env);
  }

  /**
   * Main handler for Raycast endpoints
   */
  async handle(request: Request, requestId?: string): Promise<Response> {
    const reqId = requestId || this.generateRequestId();

    // Handle CORS preflight
    const corsResponse = this.handleCORS(request);
    if (corsResponse) return corsResponse;

    // Only allow POST method
    if (request.method !== 'POST') {
      return this.createErrorResponse(405, 'METHOD_NOT_ALLOWED', 'Only POST method allowed for Raycast endpoints', reqId);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Route to specific Raycast handlers
      if (path === '/raycast/daily-forecast') {
        return await this.handleDailyForecast(request, reqId);
      }

      if (path === '/raycast/quick-reading') {
        return await this.handleQuickReading(request, reqId);
      }

      if (path === '/raycast/daily-guidance') {
        return await this.handleDailyGuidance(request, reqId);
      }

      return this.createErrorResponse(404, 'ENDPOINT_NOT_FOUND', 'Raycast endpoint not found', reqId);

    } catch (error) {
      console.error(`[${reqId}] Raycast handler error:`, error);
      return this.createErrorResponse(500, 'HANDLER_ERROR', 'Raycast handler failed', reqId);
    }
  }

  /**
   * Handle daily forecast requests
   */
  private async handleDailyForecast(request: Request, requestId: string): Promise<Response> {
    try {
      // Authenticate request
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for daily forecast', requestId);
      }

      // Parse request body
      const requestData = await this.parseJsonBody(request) as RaycastRequest;
      const userProfile = requestData.userProfile || { userId: '', fullName: '' };
      const preferences = requestData.preferences || {};

      // Default engines for daily forecast
      const engines = preferences.engines || ['biorhythm', 'numerology'];
      const today = new Date().toISOString().split('T')[0];

      // Calculate forecasts for each engine
      const forecasts = await Promise.all(
        engines.map(async (engineName) => {
          try {
            const input = this.prepareEngineInput(engineName, userProfile, { targetDate: today });
            const result = await calculateEngine(engineName as EngineName, input, {
              requestId,
              verboseLogging: false
            });

            return {
              engine: engineName,
              success: result.success,
              data: result.data,
              error: typeof result.error === 'string' ? result.error : 'Calculation failed'
            };
          } catch (error) {
            return {
              engine: engineName,
              success: false,
              data: null,
              error: error instanceof Error ? error.message : 'Calculation failed'
            };
          }
        })
      );

      // Format response for Raycast
      const formattedResponse = this.formatDailyForecast(forecasts, userProfile, preferences);

      // Create timeline entry
      await this.createTimelineEntry(
        userProfile.userId || authResult.user.id,
        'daily_forecast',
        { engines, date: today },
        { forecasts },
        { source: 'raycast', requestId }
      );

      return this.createResponse(200, {}, {
        success: true,
        data: {
          forecasts,
          date: today,
          user: userProfile.fullName || 'User'
        },
        formatted: formattedResponse,
        actions: this.generateForecastActions(forecasts),
        metadata: {
          source: 'raycast',
          timestamp: new Date().toISOString(),
          executionTime: Date.now(),
          requestId
        }
      });

    } catch (error) {
      console.error(`[${requestId}] Daily forecast error:`, error);
      return this.createErrorResponse(500, 'FORECAST_FAILED', 'Daily forecast generation failed', requestId);
    }
  }

  /**
   * Handle quick reading requests
   */
  private async handleQuickReading(request: Request, requestId: string): Promise<Response> {
    try {
      // Authenticate request
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for quick reading', requestId);
      }

      // Parse request body
      const requestData = await this.parseJsonBody(request) as RaycastRequest & {
        engine: string;
        question?: string;
        customParams?: Record<string, any>;
      };

      const { engine, question, customParams = {}, userProfile = { userId: '', fullName: '' } } = requestData;

      if (!engine) {
        return this.createErrorResponse(400, 'MISSING_ENGINE', 'Engine name is required', requestId);
      }

      // Prepare input for the engine
      const input = this.prepareEngineInput(engine, userProfile, { question, ...customParams });

      // Calculate using the specified engine
      const result = await calculateEngine(engine as EngineName, input, {
        requestId,
        verboseLogging: false
      });

      if (!result.success) {
        return this.createErrorResponse(500, 'CALCULATION_FAILED', result.error || 'Engine calculation failed', requestId);
      }

      // Format response for Raycast
      const formattedResponse = this.formatQuickReading(engine, result.data, userProfile);

      // Create timeline entry
      await this.createTimelineEntry(
        userProfile.userId || authResult.user.id,
        'quick_reading',
        { engine, input },
        result,
        { source: 'raycast', requestId }
      );

      return this.createResponse(200, {}, {
        success: true,
        data: {
          engine,
          result: result.data,
          input
        },
        formatted: formattedResponse,
        actions: this.generateReadingActions(engine, result.data),
        metadata: {
          source: 'raycast',
          timestamp: new Date().toISOString(),
          executionTime: Date.now(),
          requestId
        }
      });

    } catch (error) {
      console.error(`[${requestId}] Quick reading error:`, error);
      return this.createErrorResponse(500, 'READING_FAILED', 'Quick reading failed', requestId);
    }
  }

  /**
   * Handle daily guidance requests
   */
  private async handleDailyGuidance(request: Request, requestId: string): Promise<Response> {
    try {
      // Authenticate request
      const authResult = await this.authenticateRequest(request);
      if (!authResult.success || !authResult.user) {
        return this.createErrorResponse(401, 'UNAUTHORIZED', 'Authentication required for daily guidance', requestId);
      }

      // Parse request body
      const requestData = await this.parseJsonBody(request) as RaycastRequest & {
        engines?: string[];
        focusArea?: string;
      };

      const userProfile = requestData.userProfile || { userId: '', fullName: '' };
      const engines = requestData.engines || ['numerology', 'iching'];
      const focusArea = requestData.focusArea || 'general';

      // Calculate guidance from multiple engines
      const guidanceResults = await Promise.all(
        engines.map(async (engineName) => {
          try {
            const input = this.prepareEngineInput(engineName, userProfile, { focusArea });
            const result = await calculateEngine(engineName as EngineName, input, {
              requestId,
              verboseLogging: false
            });

            return {
              engine: engineName,
              success: result.success,
              data: result.data,
              error: result.error
            };
          } catch (error) {
            return {
              engine: engineName,
              success: false,
              data: null,
              error: error instanceof Error ? error.message : 'Calculation failed'
            };
          }
        })
      );

      // Generate comprehensive guidance
      const guidance = this.generateComprehensiveGuidance(guidanceResults, focusArea, userProfile);

      // Create timeline entry
      await this.createTimelineEntry(
        userProfile.userId || authResult.user.id,
        'daily_guidance',
        { engines, focusArea },
        { guidanceResults, guidance },
        { source: 'raycast', requestId }
      );

      return this.createResponse(200, {}, {
        success: true,
        data: {
          guidance,
          engines: guidanceResults,
          focusArea,
          date: new Date().toISOString().split('T')[0]
        },
        formatted: guidance.formatted,
        actions: this.generateGuidanceActions(guidance),
        metadata: {
          source: 'raycast',
          timestamp: new Date().toISOString(),
          executionTime: Date.now(),
          requestId
        }
      });

    } catch (error) {
      console.error(`[${requestId}] Daily guidance error:`, error);
      return this.createErrorResponse(500, 'GUIDANCE_FAILED', 'Daily guidance generation failed', requestId);
    }
  }

  /**
   * Prepare input for engine calculation
   */
  private prepareEngineInput(
    engineName: string,
    userProfile: any,
    customParams: Record<string, any> = {}
  ): any {
    const baseInput = {
      birth_date: userProfile.birthDate,
      birth_time: userProfile.birthTime,
      birth_location: userProfile.birthLocation,
      full_name: userProfile.fullName
    };

    switch (engineName) {
      case 'numerology':
        return {
          full_name: userProfile.fullName || 'Unknown',
          birth_date: userProfile.birthDate
        };

      case 'biorhythm':
        return {
          birth_date: userProfile.birthDate,
          target_date: customParams.targetDate || new Date().toISOString().split('T')[0]
        };

      case 'iching':
        return {
          question: customParams.question || `Guidance for ${userProfile.fullName || 'this person'}`,
          method: 'random'
        };

      case 'tarot':
        return {
          question: customParams.question,
          spreadType: customParams.spreadType || 'single_card'
        };

      default:
        return { ...baseInput, ...customParams };
    }
  }

  /**
   * Format daily forecast for Raycast
   */
  private formatDailyForecast(
    forecasts: any[],
    userProfile: any,
    preferences: any
  ): string {
    const format = preferences.format || 'markdown';
    const userName = userProfile.fullName || 'User';

    if (format === 'json') {
      return JSON.stringify({ forecasts, user: userName }, null, 2);
    }

    let output = `# 🌅 Daily Forecast for ${userName}\n\n`;
    output += `**Date:** ${new Date().toLocaleDateString()}\n\n`;

    forecasts.forEach(forecast => {
      if (forecast.success) {
        output += `## ${forecast.engine.toUpperCase()}\n`;
        output += this.formatEngineResult(forecast.engine, forecast.data);
        output += '\n\n';
      } else {
        output += `## ${forecast.engine.toUpperCase()} ⚠️\n`;
        output += `Error: ${forecast.error}\n\n`;
      }
    });

    return output;
  }

  /**
   * Format quick reading for Raycast
   */
  private formatQuickReading(engine: string, data: any, userProfile: any): string {
    const userName = userProfile.fullName || 'User';

    let output = `# 🔮 ${engine.toUpperCase()} Reading for ${userName}\n\n`;
    output += this.formatEngineResult(engine, data);
    output += '\n\n---\n';
    output += `*Generated on ${new Date().toLocaleString()}*`;

    return output;
  }

  /**
   * Generate comprehensive guidance from multiple engines
   */
  private generateComprehensiveGuidance(
    results: any[],
    focusArea: string,
    userProfile: any
  ): any {
    const successfulResults = results.filter(r => r.success);
    const userName = userProfile.fullName || 'User';

    let guidance = `# 🌟 Daily Guidance for ${userName}\n\n`;
    guidance += `**Focus Area:** ${focusArea}\n\n`;

    if (successfulResults.length === 0) {
      guidance += 'Unable to generate guidance at this time.\n\n';
    } else {
      guidance += `**Key Insights:**\n`;
      successfulResults.forEach(result => {
        guidance += `- ${result.engine}: ${this.extractKeyInsight(result.engine, result.data)}\n`;
      });
      guidance += '\n';

      guidance += `**Recommendations:**\n`;
      successfulResults.forEach(result => {
        guidance += `- ${this.extractRecommendation(result.engine, result.data)}\n`;
      });
    }

    return {
      formatted: guidance,
      insights: successfulResults.map(r => ({
        engine: r.engine,
        insight: this.extractKeyInsight(r.engine, r.data)
      })),
      recommendations: successfulResults.map(r => ({
        engine: r.engine,
        recommendation: this.extractRecommendation(r.engine, r.data)
      }))
    };
  }

  /**
   * Format engine result for display
   */
  private formatEngineResult(engine: string, data: any): string {
    switch (engine) {
      case 'numerology':
        return `Life Path: ${data.lifePath || 'N/A'}, Expression: ${data.expression || 'N/A'}`;

      case 'biorhythm':
        return `Physical: ${data.physical_percentage?.toFixed(1) || 'N/A'}%, ` +
               `Emotional: ${data.emotional_percentage?.toFixed(1) || 'N/A'}%, ` +
               `Intellectual: ${data.intellectual_percentage?.toFixed(1) || 'N/A'}%`;

      case 'iching':
        return `Hexagram: ${data.primaryHexagram?.name || 'N/A'} - ${data.primaryHexagram?.judgment || ''}`;

      case 'tarot':
        const cards = data.drawnCards || [];
        return `Cards: ${cards.map((c: any) => c.card?.name).join(', ') || 'None'}`;

      default:
        return JSON.stringify(data).substring(0, 200) + '...';
    }
  }

  /**
   * Extract key insight from engine result
   */
  private extractKeyInsight(engine: string, data: any): string {
    switch (engine) {
      case 'numerology':
        return `Life Path ${data.lifePath} indicates ${data.interpretations?.life_path || 'personal growth'}`;

      case 'iching':
        return data.primaryHexagram?.judgment || 'Ancient wisdom guidance';

      case 'tarot':
        const cards = data.drawnCards || [];
        return cards.length > 0 ? cards[0].interpretation || 'Card guidance' : 'Card reading';

      default:
        return 'Consciousness insight available';
    }
  }

  /**
   * Extract recommendation from engine result
   */
  private extractRecommendation(engine: string, data: any): string {
    switch (engine) {
      case 'numerology':
        return 'Focus on personal development and life purpose';

      case 'iching':
        return data.primaryHexagram?.advice || 'Follow the path of wisdom';

      case 'tarot':
        return 'Trust your intuition and inner guidance';

      default:
        return 'Continue your consciousness journey';
    }
  }

  /**
   * Generate forecast actions for Raycast
   */
  private generateForecastActions(forecasts: any[]): Array<{ title: string; url: string; icon?: string }> {
    const actions = [];

    if (forecasts.some(f => f.engine === 'biorhythm')) {
      actions.push({
        title: 'View Full Biorhythm Chart',
        url: '/biorhythm',
        icon: '📊'
      });
    }

    if (forecasts.some(f => f.engine === 'numerology')) {
      actions.push({
        title: 'Explore Numerology Profile',
        url: '/numerology',
        icon: '🔢'
      });
    }

    actions.push({
      title: 'Get Daily Guidance',
      url: '/guidance',
      icon: '🌟'
    });

    return actions;
  }

  /**
   * Generate reading actions for Raycast
   */
  private generateReadingActions(engine: string, data: any): Array<{ title: string; url: string; icon?: string }> {
    const actions = [];

    switch (engine) {
      case 'tarot':
        actions.push({
          title: 'Draw Another Card',
          url: '/tarot',
          icon: '🃏'
        });
        break;

      case 'iching':
        actions.push({
          title: 'Consult I Ching Again',
          url: '/iching',
          icon: '☯️'
        });
        break;

      case 'numerology':
        actions.push({
          title: 'View Full Numerology Report',
          url: '/numerology',
          icon: '🔢'
        });
        break;
    }

    actions.push({
      title: 'Save to History',
      url: '/history',
      icon: '💾'
    });

    return actions;
  }

  /**
   * Generate guidance actions for Raycast
   */
  private generateGuidanceActions(guidance: any): Array<{ title: string; url: string; icon?: string }> {
    return [
      {
        title: 'Explore Consciousness Engines',
        url: '/engines',
        icon: '🧠'
      },
      {
        title: 'View Reading History',
        url: '/history',
        icon: '📚'
      },
      {
        title: 'Get Tomorrow\'s Guidance',
        url: '/guidance?tomorrow=true',
        icon: '🔮'
      }
    ];
  }
}

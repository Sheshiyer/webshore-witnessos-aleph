/**
 * Forecast Handler for WitnessOS API
 *
 * Handles daily and weekly forecast generation, batch processing,
 * and forecast-related analytics.
 */

import { BaseHandler, HandlerEnvironment } from '../base/base-handler';
import { calculateEngine } from '../../engines';
import { CloudflareKVDataAccess } from '../../lib/kv-data-access';

export interface ForecastBatchRequest {
  dates?: string[];
  days?: number;
  includeWeekly?: boolean;
  raycastOptimized?: boolean;
  userProfile?: any;
}

export interface ForecastBatchResponse {
  dailyForecasts?: any[];
  weeklyForecast?: any;
  summary?: {
    totalDays?: number;
    energyTrend?: string;
    keyInsights?: string[];
  };
  cached?: boolean;
  requestId: string;
  timestamp: string;
}

export interface DailyForecast {
  date: string;
  energyProfile: {
    biorhythm?: any;
    overallEnergy: 'high' | 'medium' | 'low';
    criticalDays: any[];
    trend: string;
    optimalTiming?: {
      bestHours: string[];
      avoidHours: string[];
      peakEnergy: string;
    };
  };
  guidance: {
    iching?: {
      hexagram?: any;
      interpretation?: string;
      changingLines?: any;
    };
    tarot?: {
      card?: any;
      interpretation?: string;
      focusArea?: string;
    };
    synthesis: string;
    keyThemes: string[];
  };
  recommendations: string[];
  predictiveInsights?: {
    trendAnalysis: {
      direction: string;
      confidence: number;
      timeframe: string;
    };
    criticalPeriods: Array<{
      date: string;
      type: string;
      description: string;
    }>;
    optimalActions: Array<{
      timing: string;
      action: string;
      reasoning: string;
    }>;
  };
  raycastOptimized?: any;
}

export interface WeeklyForecast {
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
    biorhythm?: any;
    numerology?: any;
    vimshottari?: any;
  };
  raycastOptimized?: any;
}

export class ForecastHandler extends BaseHandler {
  constructor(env: HandlerEnvironment) {
    super(env);
  }

  /**
   * Main handler for forecast endpoints
   */
  async handle(request: Request, requestId?: string): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    const corsResponse = this.handleCORS(request);
    if (corsResponse) return corsResponse;

    // Route to specific forecast handlers
    if (path === '/forecast/daily' && method === 'GET') {
      return await this.handleDailyForecast(request, requestId || this.generateRequestId());
    }

    if (path.startsWith('/forecast/daily/') && method === 'GET') {
      const date = path.split('/')[3];
      if (date) {
        return await this.handleDailyForecastByDate(request, requestId || this.generateRequestId(), date);
      }
      return this.createErrorResponse(400, 'MISSING_DATE', 'Date parameter required', requestId || this.generateRequestId());
    }

    if (path === '/forecast/daily/batch' && method === 'POST') {
      return await this.handleDailyForecastBatch(request, requestId || this.generateRequestId());
    }

    if (path === '/forecast/weekly' && method === 'GET') {
      return await this.handleWeeklyForecast(request, requestId || this.generateRequestId());
    }

    if (path.startsWith('/forecast/weekly/') && method === 'GET') {
      const week = path.split('/')[3];
      if (week) {
        return await this.handleWeeklyForecastByWeek(request, requestId || this.generateRequestId(), week);
      }
      return this.createErrorResponse(400, 'MISSING_WEEK', 'Week parameter required', requestId || this.generateRequestId());
    }

    if (path === '/forecast/weekly/batch' && method === 'POST') {
      return await this.handleWeeklyForecastBatch(request, requestId || this.generateRequestId());
    }

    return this.createErrorResponse(404, 'ENDPOINT_NOT_FOUND', 'Forecast endpoint not found', requestId || this.generateRequestId());
  }

  /**
   * Handle daily forecast
   */
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

  /**
   * Handle daily forecast by specific date
   */
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

  /**
   * Handle daily forecast batch
   */
  private async handleDailyForecastBatch(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await this.parseJsonBody(request) as ForecastBatchRequest;
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

  /**
   * Handle weekly forecast
   */
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

  /**
   * Handle weekly forecast by specific week
   */
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

  /**
   * Handle weekly forecast batch
   */
  private async handleWeeklyForecastBatch(request: Request, requestId: string): Promise<Response> {
    try {
      const body = await this.parseJsonBody(request);
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

  // Helper methods for forecast generation
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
    const guidance = {
      iching: ichingResult ? {
        hexagram: ichingResult.data?.rawData?.hexagram || ichingResult.data?.hexagram,
        interpretation: String(ichingResult.data?.rawData?.interpretation || ichingResult.data?.formattedOutput || ''),
        changingLines: ichingResult.data?.rawData?.changingLines || ichingResult.data?.changingLines
      } : undefined,
      tarot: tarotResult ? {
        card: tarotResult.data?.rawData?.card || tarotResult.data?.card,
        interpretation: String(tarotResult.data?.rawData?.interpretation || tarotResult.data?.formattedOutput || ''),
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
      ...(predictiveInsights && { predictiveInsights })
    };

    // Add Raycast optimization if requested
    if (raycastOptimized) {
      forecast.raycastOptimized = this.formatDailyForecastForRaycast(forecast);
    }

    return forecast;
  }

  private analyzeEnhancedEnergyProfile(biorhythmResult: any, targetDate: string): DailyForecast['energyProfile'] {
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
      ...(optimalTiming && { optimalTiming })
    };
  }

  private analyzeBiorhythmTrend(biorhythmResult: any): string {
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

  private calculateOptimalTiming(biorhythmResult: any, targetDate: string): DailyForecast['energyProfile']['optimalTiming'] {
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

  private async generatePredictiveInsights(biorhythmResult: any, targetDate: string, requestId: string): Promise<DailyForecast['predictiveInsights'] | undefined> {
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

  private calculateTrendDirection(energyValues: number[]): string {
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

  private identifyCriticalPeriods(forecast: any[], targetDate: string): DailyForecast['predictiveInsights']['criticalPeriods'] {
    const periods: DailyForecast['predictiveInsights']['criticalPeriods'] = [];
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

  private generateOptimalActions(biorhythmResult: any, targetDate: string): DailyForecast['predictiveInsights']['optimalActions'] {
    const actions: DailyForecast['predictiveInsights']['optimalActions'] = [];

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
          const synthesis = await this.aiInterpreter.enhanceReading(
            'biorhythm', // Primary engine for synthesis
            validReadings[0].data, // Use first successful result
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
    energyProfile: DailyForecast['energyProfile'],
    guidance: DailyForecast['guidance'],
    predictiveInsights?: DailyForecast['predictiveInsights']
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

  private async generateWeeklyForecast(
    dailyForecasts: DailyForecast[],
    userProfile: any,
    requestId: string,
    raycastOptimized: boolean = false
  ): Promise<WeeklyForecast> {
    // Analyze weekly themes
    const weeklyThemes = this.analyzeWeeklyThemes(dailyForecasts);

    // Generate engine insights for the week
    const engineInsights = await this.generateWeeklyEngineInsights(userProfile, requestId);

    const weeklyForecast: WeeklyForecast = {
      week: {
        start: dailyForecasts[0]?.date || '',
        end: dailyForecasts[dailyForecasts.length - 1]?.date || '',
        weekNumber: this.getWeekNumber(new Date(dailyForecasts[0]?.date || ''))
      },
      dailyForecasts,
      weeklyThemes,
      engineInsights
    };

    // Add Raycast optimization if requested
    if (raycastOptimized) {
      weeklyForecast.raycastOptimized = this.formatWeeklyForRaycast(weeklyForecast);
    }

    return weeklyForecast;
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
      forecast.recommendations.forEach(rec => {
        if (rec.includes('rest') || rec.includes('gentle') || rec.includes('avoid')) {
          challenges.push(`${dayName}: ${rec}`);
        } else if (rec.includes('important') || rec.includes('challenging') || rec.includes('optimal')) {
          opportunities.push(`${dayName}: ${rec}`);
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

  private async generateWeeklyEngineInsights(userProfile: any, requestId: string): Promise<WeeklyForecast['engineInsights']> {
    const insights: WeeklyForecast['engineInsights'] = {
      biorhythm: null
    };

    try {
      // Generate extended biorhythm analysis for the week
      const biorhythmResult = await calculateEngine('biorhythm', {
        birthDate: userProfile.birthDate,
        targetDate: new Date().toISOString().split('T')[0],
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

  // Utility methods
  private async getUserProfileForForecast(userId: string): Promise<any | null> {
    try {
      // Try to get user profile from KV storage first
      const profile = await this.kvData.getUserProfile(userId, 'numerology');
      if (profile && profile.input && profile.input.birthDate) {
        return {
          birthDate: profile.input.birthDate,
          birthTime: profile.input.birthTime || undefined,
          latitude: profile.input.latitude || undefined,
          longitude: profile.input.longitude || undefined,
          name: profile.input.name || 'Anonymous',
          preferences: profile.input.preferences || {}
        };
      }

      // Fallback to database user data
      const user = await this.db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
      if (user && user.preferences) {
        const prefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
        if (prefs && prefs.birthDate) {
          return {
            birthDate: prefs.birthDate,
            birthTime: prefs.birthTime || undefined,
            latitude: prefs.latitude || undefined,
            longitude: prefs.longitude || undefined,
            name: user.name || 'Anonymous',
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

  private getCurrentWeekStart(): string {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Get Monday of current week
    return monday.toISOString().split('T')[0];
  }

  private getWeekNumber(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  private analyzeBatchEnergyTrend(dailyForecasts: DailyForecast[]): string {
    if (dailyForecasts.length === 0) return 'stable';

    const energyLevels = dailyForecasts.map(f => {
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

  private extractBatchInsights(dailyForecasts: DailyForecast[]): string[] {
    const insights: string[] = [];

    // Count energy levels
    const energyCounts = { high: 0, medium: 0, low: 0 };
    dailyForecasts.forEach(f => energyCounts[f.energyProfile.overallEnergy]++);

    const totalDays = dailyForecasts.length;

    if (energyCounts.high > totalDays * 0.5) {
      insights.push('High energy period ahead - excellent for major projects');
    } else if (energyCounts.low > totalDays * 0.5) {
      insights.push('Lower energy period - focus on rest and planning');
    } else {
      insights.push('Balanced energy period - steady progress expected');
    }

    // Analyze trends
    const trends = dailyForecasts.map(f => f.energyProfile.trend);
    const ascendingCount = trends.filter(t => t === 'ascending').length;
    const descendingCount = trends.filter(t => t === 'descending').length;

    if (ascendingCount > descendingCount) {
      insights.push('Overall upward energy trend detected');
    } else if (descendingCount > ascendingCount) {
      insights.push('Energy levels may be declining - plan accordingly');
    }

    // Critical days analysis
    const criticalDays = dailyForecasts.reduce((total, f) => total + f.energyProfile.criticalDays.length, 0);
    if (criticalDays > 0) {
      insights.push(`${criticalDays} critical energy days identified`);
    }

    // Key themes analysis
    const allThemes = dailyForecasts.flatMap(f => f.guidance.keyThemes);
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

  private extractBatchWeeklyThemes(weeklyForecasts: WeeklyForecast[]): string[] {
    const allThemes = weeklyForecasts.flatMap(f => f.weeklyThemes.dominantEnergy.split(' - ')[0]);
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

  private formatWeeklyForRaycast(forecast: WeeklyForecast): any {
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

  private getEnergyIcon(energy: 'high' | 'medium' | 'low'): string {
    switch (energy) {
      case 'high': return '⚡';
      case 'medium': return '🔋';
      case 'low': return '🔋';
      default: return '🔋';
    }
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

      if (forecast.predictiveInsights.criticalPeriods && forecast.predictiveInsights.criticalPeriods.length > 0) {
        markdown += `**Critical Periods:**\n`;
        forecast.predictiveInsights.criticalPeriods.forEach((period: { date: string; description: string }) => {
          markdown += `- ${period.date}: ${period.description}\n`;
        });
      }
    }

    return markdown;
  }
}

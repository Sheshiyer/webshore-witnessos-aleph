/**
 * Forecast Service Worker for WitnessOS
 * 
 * Specialized Cloudflare Worker that handles all forecast generation
 * including daily forecasts, weekly forecasts, and Raycast integrations
 * via RPC (Remote Procedure Call) interface.
 */

import { WorkerEntrypoint } from 'cloudflare:workers';
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
import { PredictiveAnalytics } from '../lib/predictive-analytics';

// Environment interface for this service
interface ForecastServiceEnv {
  DB: D1Database;
  KV_CACHE: KVNamespace;
  KV_FORECASTS: KVNamespace;
  ENGINE_SERVICE: any; // RPC binding to engine service
  AI_SERVICE?: any; // RPC binding to AI service
  OPENROUTER_API_KEY?: string;
}

// RPC method parameter types
interface DailyForecastParams {
  userProfile: any;
  date: string;
  options?: {
    includePredictive?: boolean;
    useCache?: boolean;
    forecastMode?: boolean;
  };
}

interface WeeklyForecastParams {
  userProfile: any;
  startDate: string;
  options?: {
    includePredictive?: boolean;
    useCache?: boolean;
  };
}

interface RaycastForecastParams {
  userProfile: any;
  type: 'daily' | 'weekly';
  date?: string;
  startDate?: string;
}

// RPC response types
interface ForecastResult {
  success: boolean;
  data?: DailyForecast | WeeklyForecast;
  error?: string;
  metadata?: {
    generationTime: number;
    cached: boolean;
    timestamp: string;
    engines: string[];
  };
}

/**
 * Forecast Service Worker - RPC Entrypoint
 * 
 * Provides specialized forecast generation services via RPC interface.
 * This worker handles daily/weekly forecasts, predictive analytics,
 * and external integrations like Raycast.
 */
export class ForecastService extends WorkerEntrypoint<ForecastServiceEnv> {
  private weeklySynthesizer: WeeklySynthesizer;
  private predictiveAnalytics: PredictiveAnalytics;

  constructor(state: any, env: ForecastServiceEnv) {
    super(state, env);
    this.weeklySynthesizer = new WeeklySynthesizer();
    this.predictiveAnalytics = new PredictiveAnalytics();
  }

  /**
   * Required fetch handler (not used for RPC)
   */
  async fetch(): Promise<Response> {
    return new Response('Forecast Service - Use RPC methods', { status: 404 });
  }

  /**
   * Generate daily forecast for a user
   * 
   * @param params - Daily forecast parameters
   * @returns Promise<ForecastResult> - Daily forecast result
   */
  async generateDailyForecast(params: DailyForecastParams): Promise<ForecastResult> {
    const startTime = Date.now();
    const { userProfile, date, options = {} } = params;

    try {
      // Check cache if enabled
      if (options.useCache) {
        const cacheKey = `daily_forecast:${userProfile.userId}:${date}`;
        const cached = await this.env.KV_FORECASTS.get(cacheKey);
        
        if (cached) {
          return {
            success: true,
            data: JSON.parse(cached),
            metadata: {
              generationTime: Date.now() - startTime,
              cached: true,
              timestamp: new Date().toISOString(),
              engines: ['cached']
            }
          };
        }
      }

      // Generate daily question
      const dailyQuestion = `What guidance and insights are available for ${userProfile.fullName || 'this person'} on ${date}?`;

      // Calculate required engines via RPC
      const engineCalculations = await Promise.allSettled([
        this.env.ENGINE_SERVICE.calculateEngine({
          engineName: 'biorhythm',
          input: {
            birth_date: userProfile.birthDate,
            target_date: date,
            forecast_days: options.includePredictive ? 7 : 1,
            include_extended_cycles: options.forecastMode,
            include_critical_days: options.forecastMode
          }
        }),
        this.env.ENGINE_SERVICE.calculateEngine({
          engineName: 'iching',
          input: {
            question: dailyQuestion,
            method: 'random',
            includeChangingLines: true,
            include_interpretation: options.forecastMode
          }
        }),
        this.env.ENGINE_SERVICE.calculateEngine({
          engineName: 'tarot',
          input: {
            question: dailyQuestion,
            spreadType: 'single_card',
            focusArea: 'daily_guidance',
            include_detailed_meaning: options.forecastMode
          }
        })
      ]);

      // Extract successful results
      const biorhythmResult = this.extractEngineResult(engineCalculations[0], 'biorhythm');
      const ichingResult = this.extractEngineResult(engineCalculations[1], 'iching');
      const tarotResult = this.extractEngineResult(engineCalculations[2], 'tarot');

      // Analyze energy profile
      const energyProfile = this.analyzeEnergyProfile(biorhythmResult, date);

      // Generate predictive insights if requested
      let predictiveInsights: PredictiveInsights | undefined;
      if (options.includePredictive && biorhythmResult) {
        predictiveInsights = await this.generatePredictiveInsights(biorhythmResult, date);
      }

      // Generate AI synthesis if AI service is available
      let synthesis = 'Daily guidance synthesis not available';
      if (this.env.AI_SERVICE) {
        try {
          synthesis = await this.env.AI_SERVICE.synthesizeForecast({
            biorhythm: biorhythmResult,
            iching: ichingResult,
            tarot: tarotResult,
            date,
            type: 'daily'
          });
        } catch (error) {
          console.warn('AI synthesis failed, using fallback:', error);
        }
      }

      // Generate recommendations
      const recommendations = this.generateDailyRecommendations(
        energyProfile,
        ichingResult,
        tarotResult
      );

      // Construct daily forecast
      const dailyForecast: DailyForecast = {
        date,
        energyProfile,
        guidance: {
          iching: ichingResult,
          tarot: tarotResult,
          synthesis
        },
        recommendations,
        predictiveInsights,
        metadata: {
          generatedAt: new Date().toISOString(),
          engines: ['biorhythm', 'iching', 'tarot'],
          version: '2.0'
        }
      };

      // Cache result if enabled
      if (options.useCache) {
        const cacheKey = `daily_forecast:${userProfile.userId}:${date}`;
        await this.env.KV_FORECASTS.put(
          cacheKey,
          JSON.stringify(dailyForecast),
          { expirationTtl: 86400 } // 24 hours
        );
      }

      return {
        success: true,
        data: dailyForecast,
        metadata: {
          generationTime: Date.now() - startTime,
          cached: false,
          timestamp: new Date().toISOString(),
          engines: ['biorhythm', 'iching', 'tarot']
        }
      };

    } catch (error) {
      console.error('Daily forecast generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown forecast error',
        metadata: {
          generationTime: Date.now() - startTime,
          cached: false,
          timestamp: new Date().toISOString(),
          engines: []
        }
      };
    }
  }

  /**
   * Generate weekly forecast for a user
   * 
   * @param params - Weekly forecast parameters
   * @returns Promise<ForecastResult> - Weekly forecast result
   */
  async generateWeeklyForecast(params: WeeklyForecastParams): Promise<ForecastResult> {
    const startTime = Date.now();
    const { userProfile, startDate, options = {} } = params;

    try {
      // Check cache if enabled
      if (options.useCache) {
        const cacheKey = `weekly_forecast:${userProfile.userId}:${startDate}`;
        const cached = await this.env.KV_FORECASTS.get(cacheKey);
        
        if (cached) {
          return {
            success: true,
            data: JSON.parse(cached),
            metadata: {
              generationTime: Date.now() - startTime,
              cached: true,
              timestamp: new Date().toISOString(),
              engines: ['cached']
            }
          };
        }
      }

      // Generate daily forecasts for the week
      const weekDates = this.generateWeekDates(startDate);
      const dailyForecasts: DailyForecast[] = [];

      for (const date of weekDates) {
        const dailyResult = await this.generateDailyForecast({
          userProfile,
          date,
          options: { ...options, useCache: false } // Don't double-cache
        });

        if (dailyResult.success && dailyResult.data) {
          dailyForecasts.push(dailyResult.data as DailyForecast);
        }
      }

      // Synthesize weekly forecast
      const weeklyForecast = await this.weeklySynthesizer.synthesizeWeek(
        dailyForecasts,
        startDate,
        userProfile
      );

      // Cache result if enabled
      if (options.useCache) {
        const cacheKey = `weekly_forecast:${userProfile.userId}:${startDate}`;
        await this.env.KV_FORECASTS.put(
          cacheKey,
          JSON.stringify(weeklyForecast),
          { expirationTtl: 604800 } // 7 days
        );
      }

      return {
        success: true,
        data: weeklyForecast,
        metadata: {
          generationTime: Date.now() - startTime,
          cached: false,
          timestamp: new Date().toISOString(),
          engines: ['biorhythm', 'iching', 'tarot', 'weekly_synthesis']
        }
      };

    } catch (error) {
      console.error('Weekly forecast generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown weekly forecast error',
        metadata: {
          generationTime: Date.now() - startTime,
          cached: false,
          timestamp: new Date().toISOString(),
          engines: []
        }
      };
    }
  }

  /**
   * Generate Raycast-formatted forecast
   * 
   * @param params - Raycast forecast parameters
   * @returns Promise<any> - Raycast-formatted forecast
   */
  async generateRaycastForecast(params: RaycastForecastParams): Promise<any> {
    const { userProfile, type, date, startDate } = params;

    try {
      let forecastResult: ForecastResult;

      if (type === 'daily' && date) {
        forecastResult = await this.generateDailyForecast({
          userProfile,
          date,
          options: { useCache: true, includePredictive: true }
        });
      } else if (type === 'weekly' && startDate) {
        forecastResult = await this.generateWeeklyForecast({
          userProfile,
          startDate,
          options: { useCache: true, includePredictive: true }
        });
      } else {
        throw new Error('Invalid Raycast forecast parameters');
      }

      if (!forecastResult.success || !forecastResult.data) {
        throw new Error(forecastResult.error || 'Forecast generation failed');
      }

      // Format for Raycast
      return this.formatForRaycast(forecastResult.data, type);

    } catch (error) {
      console.error('Raycast forecast generation error:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */

  private extractEngineResult(result: PromiseSettledResult<any>, engineName: string): any {
    if (result.status === 'fulfilled' && result.value?.success) {
      return result.value.data;
    }
    console.warn(`Engine ${engineName} calculation failed:`, 
      result.status === 'rejected' ? result.reason : result.value?.error);
    return null;
  }

  private analyzeEnergyProfile(biorhythmResult: any, date: string): EnergyProfile {
    if (!biorhythmResult) {
      return {
        overallEnergy: 'medium',
        criticalDays: [],
        trend: 'stable'
      };
    }

    // Analyze biorhythm data for energy profile
    const physical = biorhythmResult.physical || 0;
    const emotional = biorhythmResult.emotional || 0;
    const intellectual = biorhythmResult.intellectual || 0;

    const average = (physical + emotional + intellectual) / 3;
    
    let overallEnergy: 'high' | 'medium' | 'low';
    if (average > 0.5) overallEnergy = 'high';
    else if (average > -0.5) overallEnergy = 'medium';
    else overallEnergy = 'low';

    return {
      overallEnergy,
      criticalDays: biorhythmResult.criticalDays || [],
      trend: this.analyzeTrend(biorhythmResult),
      physical,
      emotional,
      intellectual
    };
  }

  private analyzeTrend(biorhythmResult: any): string {
    // Simple trend analysis based on biorhythm data
    if (!biorhythmResult.forecast) return 'stable';
    
    const current = biorhythmResult.physical + biorhythmResult.emotional + biorhythmResult.intellectual;
    const tomorrow = biorhythmResult.forecast[0]?.physical + 
                    biorhythmResult.forecast[0]?.emotional + 
                    biorhythmResult.forecast[0]?.intellectual;
    
    if (tomorrow > current + 0.3) return 'rising';
    if (tomorrow < current - 0.3) return 'declining';
    return 'stable';
  }

  private generateDailyRecommendations(
    energyProfile: EnergyProfile,
    ichingResult: any,
    tarotResult: any
  ): any {
    const recommendations = {
      optimal_activities: [] as string[],
      timing_suggestions: [] as string[],
      awareness_points: [] as string[]
    };

    // Energy-based recommendations
    if (energyProfile.overallEnergy === 'high') {
      recommendations.optimal_activities.push('Take on challenging projects', 'Physical exercise', 'Creative endeavors');
      recommendations.timing_suggestions.push('Morning hours are optimal', 'Schedule important meetings');
    } else if (energyProfile.overallEnergy === 'low') {
      recommendations.optimal_activities.push('Rest and recovery', 'Gentle activities', 'Reflection and planning');
      recommendations.timing_suggestions.push('Avoid major decisions', 'Focus on self-care');
    }

    // I Ching-based recommendations
    if (ichingResult?.hexagram) {
      recommendations.awareness_points.push(`I Ching guidance: ${ichingResult.data?.rawData?.interpretation || ichingResult.data?.formattedOutput || 'Reflect on current situation'}`);
    }

    // Tarot-based recommendations
    if (tarotResult?.card) {
      recommendations.awareness_points.push(`Tarot insight: ${tarotResult.data?.rawData?.meaning || tarotResult.data?.formattedOutput || 'Trust your intuition'}`);
    }

    return recommendations;
  }

  private async generatePredictiveInsights(biorhythmResult: any, date: string): Promise<PredictiveInsights> {
    return await this.predictiveAnalytics.generateInsights(biorhythmResult, date);
  }

  private generateWeekDates(startDate: string): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  }

  private formatForRaycast(forecast: DailyForecast | WeeklyForecast, type: 'daily' | 'weekly'): any {
    // Format forecast data for Raycast extension
    if (type === 'daily') {
      const daily = forecast as DailyForecast;
      return {
        title: `Daily Forecast - ${daily.date}`,
        subtitle: `Energy: ${daily.energyProfile.overallEnergy}`,
        accessories: [
          { text: daily.energyProfile.trend }
        ],
        actions: [
          {
            title: 'View Details',
            url: `https://witnessos.com/forecast/daily/${daily.date}`
          }
        ]
      };
    } else {
      const weekly = forecast as WeeklyForecast;
      return {
        title: `Weekly Forecast - ${weekly.startDate}`,
        subtitle: `Theme: ${weekly.weeklyTheme || 'Balanced growth'}`,
        accessories: [
          { text: `${weekly.dailyForecasts.length} days` }
        ],
        actions: [
          {
            title: 'View Details',
            url: `https://witnessos.com/forecast/weekly/${weekly.startDate}`
          }
        ]
      };
    }
  }
}

// Export the service as default
export default ForecastService;

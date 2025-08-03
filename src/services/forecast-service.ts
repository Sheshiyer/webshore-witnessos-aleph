/**
 * Forecast Service for WitnessOS
 * 
 * Business logic for generating daily and weekly forecasts.
 * Separated from HTTP handlers for better testability and reusability.
 */

import { CloudflareKVDataAccess } from '../lib/kv-data-access';
import { AIInterpreter } from '../lib/ai-interpreter';
import { WeeklySynthesizer } from '../lib/weekly-synthesizer';
import { PredictiveAnalyzer } from '../lib/predictive-analyzer';
import { calculateEngine } from '../engines';
import type { 
  DailyForecast, 
  WeeklyForecast, 
  ForecastBatchRequest, 
  ForecastBatchResponse,
  EnergyProfile,
  ForecastGuidance,
  PredictiveInsights
} from '../types/forecast';

export interface ForecastOptions {
  raycastOptimized?: boolean;
  requestId?: string;
  includeCache?: boolean;
}

export class ForecastService {
  constructor(
    private kvData: CloudflareKVDataAccess,
    private aiInterpreter?: AIInterpreter
  ) {}

  /**
   * Generate enhanced daily forecast
   */
  async generateDailyForecast(
    userId: string,
    date: string,
    options: ForecastOptions = {}
  ): Promise<DailyForecast & { cached?: boolean }> {
    const { raycastOptimized = false, requestId = 'unknown', includeCache = true } = options;

    // Check cache first
    if (includeCache) {
      const cachedForecast = await this.kvData.getDailyForecastCache(userId, date);
      if (cachedForecast) {
        console.log(`[${requestId}] Daily forecast cache HIT for ${userId}:${date}`);
        return { ...cachedForecast, cached: true };
      }
    }

    console.log(`[${requestId}] Generating new daily forecast for ${userId}:${date}`);

    // Get user profile
    const userProfile = await this.getUserProfileForForecast(userId);
    if (!userProfile) {
      throw new Error('User profile required for forecast generation');
    }

    // Generate forecast
    const forecast = await this.generateEnhancedDailyForecast(
      userProfile, 
      date, 
      requestId, 
      raycastOptimized
    );

    // Cache the result
    if (includeCache) {
      try {
        await this.kvData.setDailyForecastCache(userId, date, forecast);
        console.log(`[${requestId}] Daily forecast cached for ${userId}:${date}`);
      } catch (error) {
        console.warn(`[${requestId}] Failed to cache daily forecast:`, error);
      }
    }

    return { ...forecast, cached: false };
  }

  /**
   * Generate weekly forecast
   */
  async generateWeeklyForecast(
    userId: string,
    weekStart: string,
    options: ForecastOptions = {}
  ): Promise<WeeklyForecast & { cached?: boolean }> {
    const { raycastOptimized = false, requestId = 'unknown', includeCache = true } = options;

    // Check cache first
    if (includeCache) {
      const cachedForecast = await this.kvData.getWeeklyForecastCache(userId, weekStart);
      if (cachedForecast) {
        console.log(`[${requestId}] Weekly forecast cache HIT for ${userId}:${weekStart}`);
        return { ...cachedForecast, cached: true };
      }
    }

    console.log(`[${requestId}] Generating new weekly forecast for ${userId}:${weekStart}`);

    // Get user profile
    const userProfile = await this.getUserProfileForForecast(userId);
    if (!userProfile) {
      throw new Error('User profile required for forecast generation');
    }

    // Generate daily forecasts for the week
    const weekDates = this.generateWeekDates(weekStart);
    const dailyForecasts = await Promise.all(
      weekDates.map(async (date) => {
        // Check if daily forecast is cached
        const cached = await this.kvData.getDailyForecastCache(userId, date);
        if (cached) {
          return cached;
        }

        // Generate new daily forecast
        return await this.generateEnhancedDailyForecast(userProfile, date, requestId, raycastOptimized);
      })
    );

    // Generate weekly synthesis
    const weeklyForecast = await WeeklySynthesizer.generateWeeklyForecast(
      dailyForecasts,
      userProfile,
      requestId,
      raycastOptimized
    );

    // Cache the result
    if (includeCache) {
      try {
        await this.kvData.setWeeklyForecastCache(userId, weekStart, weeklyForecast);
        console.log(`[${requestId}] Weekly forecast cached for ${userId}:${weekStart}`);
      } catch (error) {
        console.warn(`[${requestId}] Failed to cache weekly forecast:`, error);
      }
    }

    return { ...weeklyForecast, cached: false };
  }

  /**
   * Generate batch daily forecasts
   */
  async generateDailyForecastBatch(
    userId: string,
    request: ForecastBatchRequest,
    options: ForecastOptions = {}
  ): Promise<ForecastBatchResponse> {
    const { requestId = 'unknown' } = options;
    const { dates, days = 7, includeWeekly = false, raycastOptimized = false, userProfile } = request;

    // Generate date range
    const targetDates = dates || this.generateDateRange(days || 7);
    
    // Generate daily forecasts in parallel
    const dailyForecasts = await Promise.all(
      targetDates.map(async (date) => {
        // Check cache first
        const cached = await this.kvData.getDailyForecastCache(userId, date);
        if (cached) {
          return cached;
        }

        // Generate new forecast
        const forecast = await this.generateEnhancedDailyForecast(userProfile, date, requestId, raycastOptimized);
        
        // Cache it
        await this.kvData.setDailyForecastCache(userId, date, forecast);
        
        return forecast;
      })
    );

    // Generate weekly forecast if requested
    let weeklyForecast: WeeklyForecast | undefined;
    if (includeWeekly) {
      weeklyForecast = await WeeklySynthesizer.generateWeeklyForecast(
        dailyForecasts, 
        userProfile, 
        requestId,
        raycastOptimized
      );
    }

    return {
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
  }

  /**
   * Generate enhanced daily forecast with all features
   */
  private async generateEnhancedDailyForecast(
    userProfile: any,
    targetDate: string,
    requestId: string,
    raycastOptimized: boolean = false
  ): Promise<DailyForecast> {
    const dailyQuestion = `What guidance and energy insights do I need for ${targetDate}?`;

    // Execute enhanced daily forecast calculations
    const calculations = [
      {
        engine: 'biorhythm' as const,
        input: {
          birth_date: userProfile.birthDate,
          target_date: targetDate,
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
    
    // Generate predictive insights
    const predictiveInsights = biorhythmResult ? 
      await PredictiveAnalyzer.generatePredictiveInsights(biorhythmResult as any, targetDate) : 
      undefined;

    // Generate AI synthesis
    const synthesis = await this.generateSynthesis(results, targetDate, requestId);

    // Create guidance object
    const guidance: ForecastGuidance = {
      iching: ichingResult ? {
        hexagram: ichingResult.data?.rawData?.hexagram || ichingResult.data?.hexagram,
        interpretation: String(ichingResult.data?.rawData?.interpretation || ichingResult.data?.formattedOutput || ''),
        changingLines: Array.isArray(ichingResult.data?.rawData?.changingLines) ? ichingResult.data.rawData.changingLines : 
                      Array.isArray(ichingResult.data?.changingLines) ? ichingResult.data.changingLines : undefined
      } : undefined,
      tarot: tarotResult ? {
        card: tarotResult.data?.rawData?.card || tarotResult.data?.card,
        interpretation: String(tarotResult.data?.rawData?.interpretation || tarotResult.data?.formattedOutput || ''),
        focusArea: 'daily_guidance'
      } : undefined,
      synthesis,
      keyThemes: this.extractKeyThemes(synthesis, ichingResult, tarotResult)
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(energyProfile, guidance, predictiveInsights);

    const forecast: DailyForecast = {
      date: targetDate,
      energyProfile,
      guidance,
      recommendations,
      ...(predictiveInsights && { predictiveInsights })
    };

    // Add Raycast optimization if requested
    if (raycastOptimized) {
      const { RaycastFormatter } = await import('../lib/raycast-formatter');
      forecast.raycastOptimized = RaycastFormatter.formatDailyForecast(forecast);
    }

    return forecast;
  }

  // Helper methods (simplified versions of the original implementations)
  private async getUserProfileForForecast(userId: string): Promise<any | null> {
    try {
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
      return null;
    } catch (error) {
      console.error('Failed to get user profile for forecast:', error);
      return null;
    }
  }

  private analyzeEnergyProfile(biorhythmResult: any, targetDate: string): EnergyProfile {
    // Simplified energy profile analysis
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

    return {
      biorhythm: {
        physical: biorhythmResult.cycles?.physical?.percentage || 0,
        emotional: biorhythmResult.cycles?.emotional?.percentage || 0,
        intellectual: biorhythmResult.cycles?.intellectual?.percentage || 0,
        overall_energy: overallEnergy
      },
      overallEnergy: energyLevel,
      criticalDays: biorhythmResult.critical_days_ahead || [],
      trend: 'stable' // Simplified for this example
    };
  }

  private async generateSynthesis(results: any[], targetDate: string, requestId: string): Promise<string> {
    // Try AI synthesis if available
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
              userContext: {
                focusArea: 'daily_forecast'
              }
            }
          );
          return synthesis.enhancedInterpretation || 'AI synthesis generated';
        }
      } catch (error) {
        console.error(`[${requestId}] AI synthesis failed:`, error);
      }
    }

    // Fallback to basic synthesis
    return `Daily forecast for ${targetDate} combining biorhythm cycles, ancient wisdom, and predictive insights.`;
  }

  private extractKeyThemes(synthesis: string, ichingResult: any, tarotResult: any): string[] {
    // Simplified theme extraction
    const themes: string[] = ['Daily Guidance'];
    
    if (synthesis.toLowerCase().includes('energy')) themes.push('Energy Management');
    if (synthesis.toLowerCase().includes('creative')) themes.push('Creativity');
    if (synthesis.toLowerCase().includes('relationship')) themes.push('Relationships');
    
    return themes.slice(0, 5);
  }

  private generateRecommendations(
    energyProfile: EnergyProfile,
    guidance: ForecastGuidance,
    predictiveInsights?: PredictiveInsights
  ): string[] {
    const recommendations: string[] = [];

    // Energy-based recommendations
    switch (energyProfile.overallEnergy) {
      case 'high':
        recommendations.push('Take advantage of high energy for important tasks');
        break;
      case 'medium':
        recommendations.push('Maintain steady progress on ongoing projects');
        break;
      case 'low':
        recommendations.push('Focus on rest and gentle activities');
        break;
    }

    // Add predictive insights recommendations
    if (predictiveInsights) {
      predictiveInsights.optimalActions.forEach(action => {
        recommendations.push(`${action.timing}: ${action.action}`);
      });
    }

    return recommendations.slice(0, 6);
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
    // Simplified batch analysis
    const energyLevels = forecasts.map(f => f.energyProfile.overallEnergy);
    const highCount = energyLevels.filter(e => e === 'high').length;
    const lowCount = energyLevels.filter(e => e === 'low').length;
    
    if (highCount > lowCount) return 'improving';
    if (lowCount > highCount) return 'declining';
    return 'stable';
  }

  private extractBatchInsights(forecasts: DailyForecast[]): string[] {
    const insights: string[] = [];
    const totalDays = forecasts.length;
    const highEnergyDays = forecasts.filter(f => f.energyProfile.overallEnergy === 'high').length;
    
    if (highEnergyDays > totalDays * 0.5) {
      insights.push('High energy period ahead - excellent for major projects');
    } else {
      insights.push('Balanced energy period - steady progress expected');
    }
    
    return insights;
  }
}

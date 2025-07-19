/**
 * Predictive Analytics Engine for WitnessOS
 * 
 * Provides biorhythm trend predictions, optimal timing suggestions,
 * and energy cycle forecasting with multi-day analysis capabilities.
 */

import type { PredictiveInsights } from '../types/forecast';

export interface BiorhythmForecastData {
  overall_energy: number;
  cycles: {
    physical: { percentage: number; phase: string };
    emotional: { percentage: number; phase: string };
    intellectual: { percentage: number; phase: string };
  };
  forecast: Array<{
    date: string;
    overall_energy: number;
    physical: number;
    emotional: number;
    intellectual: number;
  }>;
  critical_days_ahead: string[];
}

export class PredictiveAnalyzer {
  /**
   * Generate comprehensive predictive insights from biorhythm data
   */
  static async generatePredictiveInsights(
    biorhythmData: BiorhythmForecastData,
    targetDate: string,
    analysisWindow: number = 7
  ): Promise<PredictiveInsights> {
    if (!biorhythmData || !biorhythmData.forecast) {
      throw new Error('Invalid biorhythm data for predictive analysis');
    }

    // Analyze energy trends
    const trendAnalysis = this.analyzeTrendDirection(biorhythmData.forecast, analysisWindow);
    
    // Identify critical periods
    const criticalPeriods = this.identifyCriticalPeriods(biorhythmData, targetDate);
    
    // Generate optimal actions
    const optimalActions = this.generateOptimalActions(biorhythmData, targetDate);

    return {
      trendAnalysis,
      criticalPeriods,
      optimalActions
    };
  }

  /**
   * Analyze biorhythm trend direction with confidence scoring
   */
  private static analyzeTrendDirection(
    forecast: BiorhythmForecastData['forecast'],
    window: number
  ): PredictiveInsights['trendAnalysis'] {
    if (forecast.length < 3) {
      return {
        direction: 'stable',
        confidence: 0.5,
        timeframe: `${window} days`
      };
    }

    // Calculate trend using linear regression
    const energyValues = forecast.slice(0, window).map(day => day.overall_energy);
    const trend = this.calculateLinearTrend(energyValues);
    
    // Determine direction
    let direction: 'improving' | 'declining' | 'stable';
    if (trend.slope > 2) {
      direction = 'improving';
    } else if (trend.slope < -2) {
      direction = 'declining';
    } else {
      direction = 'stable';
    }

    // Calculate confidence based on R-squared and consistency
    const confidence = Math.min(0.95, Math.max(0.3, trend.rSquared * 0.8 + 0.2));

    return {
      direction,
      confidence,
      timeframe: `${window} days`
    };
  }

  /**
   * Calculate linear trend using least squares regression
   */
  private static calculateLinearTrend(values: number[]): { slope: number; rSquared: number } {
    const n = values.length;
    if (n < 2) return { slope: 0, rSquared: 0 };

    const xValues = Array.from({ length: n }, (_, i) => i);
    const xMean = xValues.reduce((sum, x) => sum + x, 0) / n;
    const yMean = values.reduce((sum, y) => sum + y, 0) / n;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < n; i++) {
      const xDiff = xValues[i] - xMean;
      const yDiff = values[i] - yMean;
      numerator += xDiff * yDiff;
      denominatorX += xDiff * xDiff;
      denominatorY += yDiff * yDiff;
    }

    const slope = denominatorX === 0 ? 0 : numerator / denominatorX;
    const rSquared = denominatorX === 0 || denominatorY === 0 ? 0 : 
                     (numerator * numerator) / (denominatorX * denominatorY);

    return { slope, rSquared };
  }

  /**
   * Identify critical periods in the forecast
   */
  private static identifyCriticalPeriods(
    biorhythmData: BiorhythmForecastData,
    targetDate: string
  ): PredictiveInsights['criticalPeriods'] {
    const periods: PredictiveInsights['criticalPeriods'] = [];
    const baseDate = new Date(targetDate);

    // Process forecast data
    biorhythmData.forecast.forEach((day, index) => {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + index);
      const dateStr = dayDate.toISOString().split('T')[0];

      // Identify very low energy periods
      if (day.overall_energy < -40) {
        periods.push({
          date: dateStr,
          type: 'challenge',
          description: 'Critical low energy period - prioritize rest and self-care'
        });
      }

      // Identify very high energy periods
      if (day.overall_energy > 80) {
        periods.push({
          date: dateStr,
          type: 'opportunity',
          description: 'Peak energy period - ideal for important goals and challenges'
        });
      }

      // Identify significant energy transitions
      if (index > 0) {
        const energyChange = day.overall_energy - biorhythmData.forecast[index - 1].overall_energy;
        if (Math.abs(energyChange) > 50) {
          periods.push({
            date: dateStr,
            type: 'transition',
            description: `Major energy ${energyChange > 0 ? 'surge' : 'drop'} - prepare for significant change`
          });
        }
      }

      // Identify cycle intersections (when multiple cycles are at critical points)
      const criticalCycles = [
        day.physical < -30 || day.physical > 80,
        day.emotional < -30 || day.emotional > 80,
        day.intellectual < -30 || day.intellectual > 80
      ].filter(Boolean).length;

      if (criticalCycles >= 2) {
        periods.push({
          date: dateStr,
          type: 'transition',
          description: `Multiple biorhythm cycles at critical points - heightened sensitivity`
        });
      }
    });

    // Add known critical days from biorhythm calculation
    if (biorhythmData.critical_days_ahead) {
      biorhythmData.critical_days_ahead.forEach(criticalDate => {
        if (!periods.find(p => p.date === criticalDate)) {
          periods.push({
            date: criticalDate,
            type: 'challenge',
            description: 'Biorhythm critical day - exercise extra caution and self-awareness'
          });
        }
      });
    }

    return periods.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Generate optimal actions based on biorhythm patterns
   */
  private static generateOptimalActions(
    biorhythmData: BiorhythmForecastData,
    targetDate: string
  ): PredictiveInsights['optimalActions'] {
    const actions: PredictiveInsights['optimalActions'] = [];
    const cycles = biorhythmData.cycles;

    if (!cycles) return actions;

    // Physical cycle recommendations
    if (cycles.physical.percentage > 60) {
      actions.push({
        timing: 'morning (6:00-10:00)',
        action: 'Schedule intensive physical activities, exercise, or manual tasks',
        reasoning: 'Physical cycle is in high positive phase, supporting strength and endurance'
      });
    } else if (cycles.physical.percentage < -40) {
      actions.push({
        timing: 'all day',
        action: 'Minimize physical exertion, focus on rest and gentle movement',
        reasoning: 'Physical cycle is in critical low phase, requiring recovery'
      });
    }

    // Emotional cycle recommendations
    if (cycles.emotional.percentage > 60) {
      actions.push({
        timing: 'afternoon/evening (14:00-20:00)',
        action: 'Engage in social activities, creative pursuits, and relationship building',
        reasoning: 'Emotional cycle supports interpersonal connections and creative expression'
      });
    } else if (cycles.emotional.percentage < -40) {
      actions.push({
        timing: 'all day',
        action: 'Practice emotional self-care, avoid conflicts, seek solitude if needed',
        reasoning: 'Emotional cycle is sensitive, requiring gentle handling of feelings'
      });
    }

    // Intellectual cycle recommendations
    if (cycles.intellectual.percentage > 60) {
      actions.push({
        timing: 'mid-morning to afternoon (9:00-15:00)',
        action: 'Tackle complex mental tasks, make important decisions, engage in learning',
        reasoning: 'Intellectual cycle is at peak, supporting clear thinking and analysis'
      });
    } else if (cycles.intellectual.percentage < -40) {
      actions.push({
        timing: 'all day',
        action: 'Avoid major decisions, focus on routine tasks, practice mindfulness',
        reasoning: 'Intellectual cycle is low, potentially affecting judgment and concentration'
      });
    }

    // Multi-day trend recommendations
    const forecast = biorhythmData.forecast;
    if (forecast && forecast.length >= 3) {
      const energyTrend = this.calculateLinearTrend(forecast.slice(0, 7).map(d => d.overall_energy));
      
      if (energyTrend.slope > 5) {
        actions.push({
          timing: 'this week',
          action: 'Plan progressively more challenging activities as energy builds',
          reasoning: 'Energy trend is strongly ascending over the coming days'
        });
      } else if (energyTrend.slope < -5) {
        actions.push({
          timing: 'this week',
          action: 'Front-load important tasks, prepare for lower energy period',
          reasoning: 'Energy trend is declining, suggesting need for strategic planning'
        });
      }
    }

    return actions.slice(0, 6); // Limit to most important actions
  }

  /**
   * Calculate optimal timing windows for different activities
   */
  static calculateOptimalTimingWindows(
    biorhythmData: BiorhythmForecastData,
    activityType: 'physical' | 'mental' | 'creative' | 'social'
  ): { bestDays: string[]; bestHours: string[]; avoidDays: string[] } {
    const result = {
      bestDays: [] as string[],
      bestHours: [] as string[],
      avoidDays: [] as string[]
    };

    if (!biorhythmData.forecast) return result;

    const baseDate = new Date();
    
    biorhythmData.forecast.forEach((day, index) => {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + index);
      const dateStr = dayDate.toISOString().split('T')[0];

      let suitabilityScore = 0;

      switch (activityType) {
        case 'physical':
          suitabilityScore = day.physical;
          break;
        case 'mental':
          suitabilityScore = day.intellectual;
          break;
        case 'creative':
          suitabilityScore = (day.emotional + day.intellectual) / 2;
          break;
        case 'social':
          suitabilityScore = day.emotional;
          break;
      }

      if (suitabilityScore > 50) {
        result.bestDays.push(dateStr);
      } else if (suitabilityScore < -30) {
        result.avoidDays.push(dateStr);
      }
    });

    // Generate optimal hours based on activity type and current cycles
    const cycles = biorhythmData.cycles;
    if (cycles) {
      switch (activityType) {
        case 'physical':
          if (cycles.physical.percentage > 30) {
            result.bestHours = ['6:00-9:00', '17:00-19:00'];
          }
          break;
        case 'mental':
          if (cycles.intellectual.percentage > 30) {
            result.bestHours = ['9:00-12:00', '14:00-16:00'];
          }
          break;
        case 'creative':
          if (cycles.emotional.percentage > 30) {
            result.bestHours = ['10:00-12:00', '19:00-21:00'];
          }
          break;
        case 'social':
          if (cycles.emotional.percentage > 30) {
            result.bestHours = ['16:00-20:00'];
          }
          break;
      }
    }

    return result;
  }

  /**
   * Generate energy cycle forecast summary
   */
  static generateForecastSummary(biorhythmData: BiorhythmForecastData): string {
    if (!biorhythmData.forecast || biorhythmData.forecast.length === 0) {
      return 'Insufficient data for forecast summary';
    }

    const forecast = biorhythmData.forecast;
    const avgEnergy = forecast.reduce((sum, day) => sum + day.overall_energy, 0) / forecast.length;
    
    let summary = `Energy Forecast Summary (${forecast.length} days):\n\n`;
    
    if (avgEnergy > 40) {
      summary += '🔥 Overall high energy period with strong vitality and momentum\n';
    } else if (avgEnergy > 0) {
      summary += '⚡ Balanced energy period with moderate activity levels\n';
    } else {
      summary += '🔋 Lower energy period requiring rest and gentle activities\n';
    }

    // Identify the best and worst days
    const sortedDays = [...forecast].sort((a, b) => b.overall_energy - a.overall_energy);
    const bestDay = sortedDays[0];
    const worstDay = sortedDays[sortedDays.length - 1];

    if (bestDay && worstDay) {
      summary += `\n📈 Peak energy: ${bestDay.date} (${bestDay.overall_energy.toFixed(0)}%)`;
      summary += `\n📉 Lowest energy: ${worstDay.date} (${worstDay.overall_energy.toFixed(0)}%)`;
    }

    // Critical days warning
    if (biorhythmData.critical_days_ahead && biorhythmData.critical_days_ahead.length > 0) {
      summary += `\n⚠️ Critical days ahead: ${biorhythmData.critical_days_ahead.length}`;
    }

    return summary;
  }
}

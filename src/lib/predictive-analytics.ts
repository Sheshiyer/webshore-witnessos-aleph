// Predictive Analytics for WitnessOS
// Provides biorhythm trends, optimal timing, and energy cycle forecasting

import { TimelineEntry, TimelineStats } from '../types/timeline';

export interface BiorhythmTrend {
  cycle: 'physical' | 'emotional' | 'intellectual';
  currentPhase: 'high' | 'low' | 'critical' | 'rising' | 'falling';
  nextCritical: string; // ISO date
  nextPeak: string; // ISO date
  strength: number; // 0-100
  trend: 'improving' | 'declining' | 'stable';
  forecast: BiorhythmForecast[];
}

export interface BiorhythmForecast {
  date: string;
  physical: number;
  emotional: number;
  intellectual: number;
  overall: number;
}

export interface OptimalTiming {
  activity: string;
  bestDates: string[];
  worstDates: string[];
  confidence: number;
  reasoning: string;
}

export interface EnergyCycleForecast {
  period: 'daily' | 'weekly' | 'monthly';
  energyLevels: EnergyLevel[];
  patterns: EnergyPattern[];
  recommendations: string[];
}

export interface EnergyLevel {
  date: string;
  level: number; // 0-100
  type: 'physical' | 'mental' | 'spiritual' | 'overall';
  confidence: number;
}

export interface EnergyPattern {
  pattern: string;
  frequency: number;
  strength: number;
  description: string;
  nextOccurrence: string;
}

export interface PredictiveInsights {
  biorhythmTrends: BiorhythmTrend[];
  optimalTimings: OptimalTiming[];
  energyCycles: EnergyCycleForecast;
  recommendations: PredictiveRecommendation[];
  confidence: number;
}

export interface PredictiveRecommendation {
  type: 'timing' | 'activity' | 'energy' | 'caution';
  title: string;
  description: string;
  date: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

export class PredictiveAnalytics {
  constructor(private birthDate: Date) {}

  // Calculate biorhythm trends based on birth date
  calculateBiorhythmTrends(days: number = 30): BiorhythmTrend[] {
    const today = new Date();
    const daysSinceBirth = Math.floor((today.getTime() - this.birthDate.getTime()) / (1000 * 60 * 60 * 24));

    const cycles = [
      { name: 'physical' as const, period: 23 },
      { name: 'emotional' as const, period: 28 },
      { name: 'intellectual' as const, period: 33 }
    ];

    return cycles.map(cycle => {
      const currentValue = Math.sin(2 * Math.PI * daysSinceBirth / cycle.period);
      const phase = this.getBiorhythmPhase(currentValue, daysSinceBirth, cycle.period);
      
      // Calculate next critical and peak dates
      const nextCritical = this.getNextBiorhythmEvent(daysSinceBirth, cycle.period, 'critical');
      const nextPeak = this.getNextBiorhythmEvent(daysSinceBirth, cycle.period, 'peak');

      // Generate forecast
      const forecast: BiorhythmForecast[] = [];
      for (let i = 0; i < days; i++) {
        const futureDay = daysSinceBirth + i;
        const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        
        const physical = Math.sin(2 * Math.PI * futureDay / 23) * 100;
        const emotional = Math.sin(2 * Math.PI * futureDay / 28) * 100;
        const intellectual = Math.sin(2 * Math.PI * futureDay / 33) * 100;
        const overall = (physical + emotional + intellectual) / 3;

        forecast.push({
          date: date.toISOString().split('T')[0],
          physical: Math.round(physical),
          emotional: Math.round(emotional),
          intellectual: Math.round(intellectual),
          overall: Math.round(overall)
        });
      }

      return {
        cycle: cycle.name,
        currentPhase: phase,
        nextCritical: nextCritical.toISOString().split('T')[0],
        nextPeak: nextPeak.toISOString().split('T')[0],
        strength: Math.round(Math.abs(currentValue) * 100),
        trend: this.getBiorhythmTrend(daysSinceBirth, cycle.period),
        forecast
      };
    });
  }

  // Generate optimal timing suggestions
  generateOptimalTimings(biorhythmTrends: BiorhythmTrend[]): OptimalTiming[] {
    const activities = [
      { name: 'Physical Exercise', cycles: ['physical'], weight: 0.8 },
      { name: 'Creative Work', cycles: ['emotional', 'intellectual'], weight: 0.6 },
      { name: 'Important Decisions', cycles: ['intellectual'], weight: 0.9 },
      { name: 'Social Activities', cycles: ['emotional'], weight: 0.7 },
      { name: 'Learning New Skills', cycles: ['intellectual'], weight: 0.8 },
      { name: 'Meditation/Reflection', cycles: ['emotional'], weight: 0.5 }
    ];

    return activities.map(activity => {
      const relevantTrends = biorhythmTrends.filter(trend => 
        activity.cycles.includes(trend.cycle)
      );

      const bestDates: string[] = [];
      const worstDates: string[] = [];

      // Analyze forecast data to find optimal dates
      if (relevantTrends.length > 0) {
        const forecast = relevantTrends[0].forecast;
        
        forecast.forEach(day => {
          const relevantScores = activity.cycles.map(cycle => {
            switch (cycle) {
              case 'physical': return day.physical;
              case 'emotional': return day.emotional;
              case 'intellectual': return day.intellectual;
              default: return day.overall;
            }
          });

          const avgScore = relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length;
          
          if (avgScore > 50) {
            bestDates.push(day.date);
          } else if (avgScore < -50) {
            worstDates.push(day.date);
          }
        });
      }

      return {
        activity: activity.name,
        bestDates: bestDates.slice(0, 5), // Top 5 best dates
        worstDates: worstDates.slice(0, 3), // Top 3 worst dates
        confidence: activity.weight * 100,
        reasoning: this.generateTimingReasoning(activity, relevantTrends)
      };
    });
  }

  // Analyze energy cycles from timeline data
  analyzeEnergyCycles(timelineEntries: TimelineEntry[]): EnergyCycleForecast {
    const energyLevels = this.extractEnergyLevels(timelineEntries);
    const patterns = this.identifyEnergyPatterns(energyLevels);
    const recommendations = this.generateEnergyRecommendations(patterns);

    return {
      period: 'weekly',
      energyLevels,
      patterns,
      recommendations
    };
  }

  // Generate comprehensive predictive insights
  generatePredictiveInsights(timelineEntries: TimelineEntry[]): PredictiveInsights {
    const biorhythmTrends = this.calculateBiorhythmTrends();
    const optimalTimings = this.generateOptimalTimings(biorhythmTrends);
    const energyCycles = this.analyzeEnergyCycles(timelineEntries);
    const recommendations = this.generatePredictiveRecommendations(
      biorhythmTrends, 
      optimalTimings, 
      energyCycles
    );

    return {
      biorhythmTrends,
      optimalTimings,
      energyCycles,
      recommendations,
      confidence: this.calculateOverallConfidence(biorhythmTrends, energyCycles)
    };
  }

  private getBiorhythmPhase(value: number, daysSinceBirth: number, period: number): BiorhythmTrend['currentPhase'] {
    const derivative = Math.cos(2 * Math.PI * daysSinceBirth / period);
    
    if (Math.abs(value) < 0.1) return 'critical';
    if (Math.abs(value) > 0.9) return value > 0 ? 'high' : 'low';
    return derivative > 0 ? 'rising' : 'falling';
  }

  private getNextBiorhythmEvent(daysSinceBirth: number, period: number, eventType: 'critical' | 'peak'): Date {
    const today = new Date();
    const targetValue = eventType === 'critical' ? 0 : 1;
    
    // Simple approximation - find next occurrence
    for (let i = 1; i <= period; i++) {
      const futureDay = daysSinceBirth + i;
      const value = Math.sin(2 * Math.PI * futureDay / period);
      
      if (eventType === 'critical' && Math.abs(value) < 0.1) {
        return new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      } else if (eventType === 'peak' && value > 0.9) {
        return new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      }
    }
    
    return new Date(today.getTime() + period * 24 * 60 * 60 * 1000);
  }

  private getBiorhythmTrend(daysSinceBirth: number, period: number): 'improving' | 'declining' | 'stable' {
    const current = Math.sin(2 * Math.PI * daysSinceBirth / period);
    const yesterday = Math.sin(2 * Math.PI * (daysSinceBirth - 1) / period);
    
    const diff = current - yesterday;
    if (Math.abs(diff) < 0.01) return 'stable';
    return diff > 0 ? 'improving' : 'declining';
  }

  private generateTimingReasoning(activity: any, trends: BiorhythmTrend[]): string {
    const activeCycles = trends.map(t => t.cycle).join(' and ');
    const avgStrength = trends.reduce((sum, t) => sum + t.strength, 0) / trends.length;
    
    return `${activity.name} is best performed when your ${activeCycles} cycle${trends.length > 1 ? 's are' : ' is'} strong. Current average strength: ${Math.round(avgStrength)}%`;
  }

  private extractEnergyLevels(timelineEntries: TimelineEntry[]): EnergyLevel[] {
    // Analyze timeline entries to extract energy patterns
    const energyLevels: EnergyLevel[] = [];
    
    timelineEntries.forEach(entry => {
      const date = entry.timestamp.split('T')[0];
      const confidence = entry.metadata.confidence;
      
      // Estimate energy level based on activity type and confidence
      let level = 50; // baseline
      
      if (entry.type === 'forecast_daily') level += 10;
      if (entry.type === 'engine_calculation') level += confidence * 0.3;
      if (entry.metadata.cached) level -= 5; // cached requests might indicate lower engagement
      
      energyLevels.push({
        date,
        level: Math.max(0, Math.min(100, level)),
        type: 'overall',
        confidence: confidence
      });
    });
    
    return energyLevels;
  }

  private identifyEnergyPatterns(energyLevels: EnergyLevel[]): EnergyPattern[] {
    // Simple pattern identification - could be enhanced with ML
    return [
      {
        pattern: 'Weekly Cycle',
        frequency: 7,
        strength: 0.6,
        description: 'Energy tends to be higher mid-week',
        nextOccurrence: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];
  }

  private generateEnergyRecommendations(patterns: EnergyPattern[]): string[] {
    return [
      'Schedule important tasks during your high-energy periods',
      'Use low-energy times for reflection and planning',
      'Maintain consistent sleep and exercise routines to stabilize energy cycles'
    ];
  }

  private generatePredictiveRecommendations(
    biorhythmTrends: BiorhythmTrend[],
    optimalTimings: OptimalTiming[],
    energyCycles: EnergyCycleForecast
  ): PredictiveRecommendation[] {
    const recommendations: PredictiveRecommendation[] = [];
    
    // Add biorhythm-based recommendations
    biorhythmTrends.forEach(trend => {
      if (trend.currentPhase === 'critical') {
        recommendations.push({
          type: 'caution',
          title: `${trend.cycle} Critical Phase`,
          description: `Your ${trend.cycle} biorhythm is in a critical phase. Exercise extra caution and avoid major decisions.`,
          date: new Date().toISOString().split('T')[0],
          confidence: 80,
          priority: 'high'
        });
      }
    });
    
    // Add timing recommendations
    optimalTimings.forEach(timing => {
      if (timing.bestDates.length > 0) {
        recommendations.push({
          type: 'timing',
          title: `Optimal Time for ${timing.activity}`,
          description: `Best dates for ${timing.activity}: ${timing.bestDates.slice(0, 3).join(', ')}`,
          date: timing.bestDates[0],
          confidence: timing.confidence,
          priority: 'medium'
        });
      }
    });
    
    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  private calculateOverallConfidence(biorhythmTrends: BiorhythmTrend[], energyCycles: EnergyCycleForecast): number {
    const biorhythmConfidence = biorhythmTrends.reduce((sum, trend) => sum + trend.strength, 0) / biorhythmTrends.length;
    const energyConfidence = energyCycles.energyLevels.reduce((sum, level) => sum + level.confidence, 0) / energyCycles.energyLevels.length;
    
    return Math.round((biorhythmConfidence + energyConfidence) / 2);
  }
}

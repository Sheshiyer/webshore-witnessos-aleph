/**
 * Weekly Synthesis Engine for WitnessOS
 * 
 * Aggregates daily insights into weekly themes and patterns,
 * providing comprehensive weekly forecasts with dominant energy
 * identification and guidance synthesis.
 */

import type { 
  DailyForecast, 
  WeeklyForecast, 
  WeeklyInsights,
  EnergyProfile 
} from '../types/forecast';

export class WeeklySynthesizer {
  /**
   * Generate comprehensive weekly forecast from daily forecasts
   */
  static async generateWeeklyForecast(
    dailyForecasts: DailyForecast[],
    userProfile: any,
    requestId: string,
    raycastOptimized: boolean = false
  ): Promise<WeeklyForecast> {
    if (dailyForecasts.length === 0) {
      throw new Error('No daily forecasts provided for weekly synthesis');
    }

    // Sort daily forecasts by date
    const sortedForecasts = dailyForecasts.sort((a, b) => a.date.localeCompare(b.date));
    
    const weekStart = sortedForecasts[0].date;
    const weekEnd = sortedForecasts[sortedForecasts.length - 1].date;

    // Generate weekly insights
    const weeklyInsights = this.generateWeeklyInsights(sortedForecasts);
    
    // Extract dominant themes
    const dominantThemes = this.extractDominantThemes(sortedForecasts);
    
    // Identify challenges and opportunities
    const challenges = this.identifyWeeklyChallenges(sortedForecasts);
    const opportunities = this.identifyWeeklyOpportunities(sortedForecasts);

    const weeklyForecast: WeeklyForecast = {
      weekStart,
      weekEnd,
      dominantThemes,
      dailyForecasts: sortedForecasts,
      weeklyInsights,
      challenges,
      opportunities
    };

    // Add Raycast optimization if requested
    if (raycastOptimized) {
      weeklyForecast.raycastOptimized = this.formatWeeklyForecastForRaycast(weeklyForecast);
    }

    return weeklyForecast;
  }

  /**
   * Generate comprehensive weekly insights from daily forecasts
   */
  private static generateWeeklyInsights(dailyForecasts: DailyForecast[]): WeeklyInsights {
    // Analyze dominant energy pattern
    const energyPattern = this.analyzeDominantEnergyPattern(dailyForecasts);
    
    // Identify key transitions
    const keyTransitions = this.identifyKeyTransitions(dailyForecasts);
    
    // Generate weekly theme
    const weeklyTheme = this.generateWeeklyTheme(dailyForecasts);
    
    // Extract focus areas
    const focusAreas = this.extractWeeklyFocusAreas(dailyForecasts);
    
    // Create energy flow map
    const energyFlow = this.createEnergyFlowMap(dailyForecasts);

    return {
      dominantEnergyPattern: energyPattern,
      keyTransitions,
      weeklyTheme,
      focusAreas,
      energyFlow
    };
  }

  /**
   * Analyze the dominant energy pattern across the week
   */
  private static analyzeDominantEnergyPattern(dailyForecasts: DailyForecast[]): string {
    const energyLevels = dailyForecasts.map(f => f.energyProfile.overallEnergy);
    const trends = dailyForecasts.map(f => f.energyProfile.trend);
    
    // Count energy levels
    const energyCounts = { high: 0, medium: 0, low: 0 };
    energyLevels.forEach(level => energyCounts[level]++);
    
    // Count trends
    const trendCounts = { ascending: 0, descending: 0, stable: 0, volatile: 0 };
    trends.forEach(trend => trendCounts[trend]++);
    
    // Determine dominant pattern
    const dominantEnergy = Object.entries(energyCounts).sort(([,a], [,b]) => b - a)[0][0];
    const dominantTrend = Object.entries(trendCounts).sort(([,a], [,b]) => b - a)[0][0];
    
    // Generate pattern description
    if (dominantEnergy === 'high' && dominantTrend === 'ascending') {
      return 'High-energy ascending week with building momentum';
    } else if (dominantEnergy === 'high' && dominantTrend === 'stable') {
      return 'Consistently high energy week with steady performance';
    } else if (dominantEnergy === 'low' && dominantTrend === 'descending') {
      return 'Low-energy declining week requiring rest and recovery';
    } else if (dominantTrend === 'volatile') {
      return 'Volatile energy week with significant fluctuations';
    } else if (dominantEnergy === 'medium') {
      return 'Balanced energy week with moderate, steady progress';
    } else {
      return `${dominantEnergy.charAt(0).toUpperCase() + dominantEnergy.slice(1)} energy week with ${dominantTrend} trend`;
    }
  }

  /**
   * Identify key energy transitions throughout the week
   */
  private static identifyKeyTransitions(dailyForecasts: DailyForecast[]): string[] {
    const transitions: string[] = [];
    
    for (let i = 1; i < dailyForecasts.length; i++) {
      const prevDay = dailyForecasts[i - 1];
      const currentDay = dailyForecasts[i];
      
      // Energy level transitions
      if (prevDay.energyProfile.overallEnergy !== currentDay.energyProfile.overallEnergy) {
        const dayName = this.getDayName(currentDay.date);
        transitions.push(`${dayName}: Energy shifts from ${prevDay.energyProfile.overallEnergy} to ${currentDay.energyProfile.overallEnergy}`);
      }
      
      // Trend transitions
      if (prevDay.energyProfile.trend !== currentDay.energyProfile.trend) {
        const dayName = this.getDayName(currentDay.date);
        transitions.push(`${dayName}: Trend changes from ${prevDay.energyProfile.trend} to ${currentDay.energyProfile.trend}`);
      }
      
      // Critical day transitions
      if (currentDay.energyProfile.criticalDays.length > 0) {
        const dayName = this.getDayName(currentDay.date);
        transitions.push(`${dayName}: Critical energy period begins`);
      }
    }
    
    return transitions.slice(0, 5); // Limit to most significant transitions
  }

  /**
   * Generate overarching weekly theme
   */
  private static generateWeeklyTheme(dailyForecasts: DailyForecast[]): string {
    // Collect all themes from daily forecasts
    const allThemes = dailyForecasts.flatMap(f => f.guidance.keyThemes);
    
    // Count theme frequency
    const themeCount = allThemes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Get top themes
    const topThemes = Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme);
    
    // Generate theme based on patterns
    if (topThemes.includes('Energy Management') && topThemes.includes('Physical Activity')) {
      return 'Physical Vitality & Energy Optimization';
    } else if (topThemes.includes('Creativity') && topThemes.includes('Mental Focus')) {
      return 'Creative Innovation & Intellectual Growth';
    } else if (topThemes.includes('Relationships') && topThemes.includes('Emotional Balance')) {
      return 'Emotional Harmony & Social Connection';
    } else if (topThemes.includes('Decision Making') && topThemes.includes('Mental Focus')) {
      return 'Strategic Planning & Clear Thinking';
    } else if (topThemes.length > 0) {
      return `${topThemes[0]} & Personal Development`;
    } else {
      return 'Balanced Growth & Self-Discovery';
    }
  }

  /**
   * Extract weekly focus areas from daily themes
   */
  private static extractWeeklyFocusAreas(dailyForecasts: DailyForecast[]): string[] {
    const allThemes = dailyForecasts.flatMap(f => f.guidance.keyThemes);
    const uniqueThemes = [...new Set(allThemes)];
    
    // Prioritize themes by frequency and importance
    const themeCount = allThemes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const prioritizedThemes = uniqueThemes
      .sort((a, b) => (themeCount[b] || 0) - (themeCount[a] || 0))
      .slice(0, 4);
    
    return prioritizedThemes.length > 0 ? prioritizedThemes : ['Personal Growth', 'Daily Balance'];
  }

  /**
   * Create energy flow map for the week
   */
  private static createEnergyFlowMap(dailyForecasts: DailyForecast[]): WeeklyInsights['energyFlow'] {
    return dailyForecasts.map(forecast => {
      const dayName = this.getDayName(forecast.date);
      const primaryTheme = forecast.guidance.keyThemes[0] || 'Balance';
      
      return {
        day: dayName,
        energy: forecast.energyProfile.overallEnergy,
        focus: primaryTheme
      };
    });
  }

  /**
   * Extract dominant themes across all daily forecasts
   */
  private static extractDominantThemes(dailyForecasts: DailyForecast[]): string[] {
    const allThemes = dailyForecasts.flatMap(f => f.guidance.keyThemes);
    const themeCount = allThemes.reduce((acc, theme) => {
      acc[theme] = (acc[theme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(themeCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme]) => theme);
  }

  /**
   * Identify weekly challenges from daily forecasts
   */
  private static identifyWeeklyChallenges(dailyForecasts: DailyForecast[]): string[] {
    const challenges: string[] = [];
    
    // Low energy periods
    const lowEnergyDays = dailyForecasts.filter(f => f.energyProfile.overallEnergy === 'low');
    if (lowEnergyDays.length >= 3) {
      challenges.push('Extended low energy period requiring careful energy management');
    }
    
    // Volatile energy patterns
    const volatileDays = dailyForecasts.filter(f => f.energyProfile.trend === 'volatile');
    if (volatileDays.length >= 2) {
      challenges.push('Unstable energy patterns requiring flexibility and adaptation');
    }
    
    // Critical days
    const totalCriticalDays = dailyForecasts.reduce((sum, f) => sum + f.energyProfile.criticalDays.length, 0);
    if (totalCriticalDays >= 3) {
      challenges.push('Multiple critical energy periods requiring extra self-care');
    }
    
    // Declining trends
    const decliningDays = dailyForecasts.filter(f => f.energyProfile.trend === 'descending');
    if (decliningDays.length >= 4) {
      challenges.push('Overall declining energy trend - focus on recovery and renewal');
    }
    
    return challenges.slice(0, 3);
  }

  /**
   * Identify weekly opportunities from daily forecasts
   */
  private static identifyWeeklyOpportunities(dailyForecasts: DailyForecast[]): string[] {
    const opportunities: string[] = [];
    
    // High energy periods
    const highEnergyDays = dailyForecasts.filter(f => f.energyProfile.overallEnergy === 'high');
    if (highEnergyDays.length >= 2) {
      const days = highEnergyDays.map(f => this.getDayName(f.date)).join(', ');
      opportunities.push(`High energy days (${days}) ideal for important projects and goals`);
    }
    
    // Ascending trends
    const ascendingDays = dailyForecasts.filter(f => f.energyProfile.trend === 'ascending');
    if (ascendingDays.length >= 3) {
      opportunities.push('Building energy momentum - excellent time for new initiatives');
    }
    
    // Optimal timing opportunities
    const optimalTimingDays = dailyForecasts.filter(f => f.energyProfile.optimalTiming?.bestHours.length > 0);
    if (optimalTimingDays.length >= 4) {
      opportunities.push('Multiple days with clear optimal timing for peak performance');
    }
    
    // Creative and intellectual themes
    const creativeThemes = dailyForecasts.filter(f => 
      f.guidance.keyThemes.some(theme => 
        theme.toLowerCase().includes('creative') || 
        theme.toLowerCase().includes('mental') ||
        theme.toLowerCase().includes('intellectual')
      )
    );
    if (creativeThemes.length >= 3) {
      opportunities.push('Strong creative and intellectual energy for innovation and learning');
    }
    
    return opportunities.slice(0, 3);
  }

  /**
   * Format weekly forecast for Raycast integration
   */
  private static formatWeeklyForecastForRaycast(forecast: WeeklyForecast): any {
    const weekRange = `${forecast.weekStart} - ${forecast.weekEnd}`;
    const dominantTheme = forecast.weeklyInsights.weeklyTheme;
    
    return {
      title: `Weekly Forecast - ${weekRange}`,
      subtitle: dominantTheme,
      accessories: [
        { text: forecast.dominantThemes[0] || 'Growth', icon: '🎯' },
        { text: `${forecast.dailyForecasts.length} days`, icon: '📅' }
      ],
      detail: {
        markdown: this.generateWeeklyRaycastMarkdown(forecast),
        metadata: {
          'Week Range': weekRange,
          'Weekly Theme': dominantTheme,
          'Dominant Themes': forecast.dominantThemes.join(', '),
          'Challenges': forecast.challenges.length.toString(),
          'Opportunities': forecast.opportunities.length.toString()
        }
      },
      actions: [
        {
          title: 'View Daily Breakdown',
          icon: '📊',
          shortcut: { modifiers: ['cmd'], key: 'd' }
        },
        {
          title: 'Copy Weekly Summary',
          icon: '📋',
          shortcut: { modifiers: ['cmd'], key: 'c' }
        }
      ],
      sections: this.generateWeeklyRaycastSections(forecast)
    };
  }

  /**
   * Generate Raycast markdown for weekly forecast
   */
  private static generateWeeklyRaycastMarkdown(forecast: WeeklyForecast): string {
    let markdown = `# Weekly Forecast - ${forecast.weekStart} to ${forecast.weekEnd}\n\n`;
    
    // Weekly theme
    markdown += `## 🎯 Weekly Theme\n${forecast.weeklyInsights.weeklyTheme}\n\n`;
    
    // Dominant themes
    if (forecast.dominantThemes.length > 0) {
      markdown += `## 🌟 Dominant Themes\n`;
      forecast.dominantThemes.forEach(theme => {
        markdown += `- ${theme}\n`;
      });
      markdown += '\n';
    }
    
    // Energy flow
    markdown += `## ⚡ Energy Flow\n`;
    forecast.weeklyInsights.energyFlow.forEach(flow => {
      const energyIcon = flow.energy === 'high' ? '🔥' : flow.energy === 'medium' ? '⚡' : '🔋';
      markdown += `- **${flow.day}:** ${energyIcon} ${flow.energy.toUpperCase()} - ${flow.focus}\n`;
    });
    markdown += '\n';
    
    // Opportunities
    if (forecast.opportunities.length > 0) {
      markdown += `## 🚀 Opportunities\n`;
      forecast.opportunities.forEach(opp => {
        markdown += `- ${opp}\n`;
      });
      markdown += '\n';
    }
    
    // Challenges
    if (forecast.challenges.length > 0) {
      markdown += `## ⚠️ Challenges\n`;
      forecast.challenges.forEach(challenge => {
        markdown += `- ${challenge}\n`;
      });
      markdown += '\n';
    }
    
    // Key transitions
    if (forecast.weeklyInsights.keyTransitions.length > 0) {
      markdown += `## 🔄 Key Transitions\n`;
      forecast.weeklyInsights.keyTransitions.forEach(transition => {
        markdown += `- ${transition}\n`;
      });
    }
    
    return markdown;
  }

  /**
   * Generate Raycast sections for weekly forecast
   */
  private static generateWeeklyRaycastSections(forecast: WeeklyForecast): any[] {
    const sections = [];
    
    // Daily breakdown section
    sections.push({
      title: 'Daily Breakdown',
      items: forecast.dailyForecasts.map(daily => ({
        title: this.getDayName(daily.date),
        subtitle: `${daily.energyProfile.overallEnergy.toUpperCase()} energy - ${daily.guidance.keyThemes[0] || 'Balance'}`,
        accessories: [
          { text: daily.energyProfile.overallEnergy, icon: daily.energyProfile.overallEnergy === 'high' ? '🔥' : '⚡' }
        ]
      }))
    });
    
    return sections;
  }

  /**
   * Get day name from date string
   */
  private static getDayName(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
}

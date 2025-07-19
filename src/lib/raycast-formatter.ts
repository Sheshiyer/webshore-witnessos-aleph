/**
 * Raycast Response Formatter for WitnessOS
 * 
 * Formats API responses specifically for Raycast UI requirements,
 * providing concise summaries, rich detail views, and copy-friendly text.
 */

import type { 
  DailyForecast, 
  WeeklyForecast,
  RaycastDailyFormat,
  RaycastWeeklyFormat,
  RaycastAccessory,
  RaycastDetail,
  RaycastAction,
  RaycastSection
} from '../types/forecast';

export class RaycastFormatter {
  /**
   * Format daily forecast for Raycast UI
   */
  static formatDailyForecast(forecast: DailyForecast): RaycastDailyFormat {
    const energyIcon = this.getEnergyIcon(forecast.energyProfile.overallEnergy);
    const trendIcon = this.getTrendIcon(forecast.energyProfile.trend);
    
    return {
      title: `Daily Forecast - ${this.formatDate(forecast.date)}`,
      subtitle: `${energyIcon} ${forecast.energyProfile.overallEnergy.toUpperCase()} energy ${trendIcon}`,
      accessories: [
        { 
          text: forecast.energyProfile.overallEnergy, 
          icon: energyIcon,
          tooltip: `Energy level: ${forecast.energyProfile.overallEnergy}`
        },
        { 
          text: forecast.energyProfile.trend, 
          icon: trendIcon,
          tooltip: `Energy trend: ${forecast.energyProfile.trend}`
        }
      ],
      detail: {
        markdown: this.generateDailyMarkdown(forecast),
        metadata: {
          'Energy Level': forecast.energyProfile.overallEnergy,
          'Trend': forecast.energyProfile.trend,
          'Key Themes': forecast.guidance.keyThemes?.join(', ') || 'N/A',
          'Critical Days': forecast.energyProfile.criticalDays.length.toString(),
          'Recommendations': forecast.recommendations.length.toString()
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
        },
        {
          title: 'Share Forecast',
          icon: '📤',
          shortcut: { modifiers: ['cmd', 'shift'], key: 's' }
        }
      ]
    };
  }

  /**
   * Format weekly forecast for Raycast UI
   */
  static formatWeeklyForecast(forecast: WeeklyForecast): RaycastWeeklyFormat {
    const weekRange = `${this.formatDate(forecast.weekStart)} - ${this.formatDate(forecast.weekEnd)}`;
    const dominantTheme = forecast.weeklyInsights.weeklyTheme;
    
    return {
      title: `Weekly Forecast - ${weekRange}`,
      subtitle: dominantTheme,
      accessories: [
        { 
          text: forecast.dominantThemes[0] || 'Growth', 
          icon: '🎯',
          tooltip: 'Primary theme'
        },
        { 
          text: `${forecast.dailyForecasts.length} days`, 
          icon: '📅',
          tooltip: 'Forecast period'
        }
      ],
      detail: {
        markdown: this.generateWeeklyMarkdown(forecast),
        metadata: {
          'Week Range': weekRange,
          'Weekly Theme': dominantTheme,
          'Dominant Themes': forecast.dominantThemes.join(', '),
          'Challenges': forecast.challenges.length.toString(),
          'Opportunities': forecast.opportunities.length.toString(),
          'Energy Pattern': forecast.weeklyInsights.dominantEnergyPattern
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
        },
        {
          title: 'Export to Calendar',
          icon: '📅',
          shortcut: { modifiers: ['cmd', 'shift'], key: 'e' }
        }
      ],
      sections: this.generateWeeklySections(forecast)
    };
  }

  /**
   * Generate quick daily summary for Raycast
   */
  static generateQuickDaily(forecast: DailyForecast): any {
    const energyIcon = this.getEnergyIcon(forecast.energyProfile.overallEnergy);
    
    return {
      title: `Today's Energy: ${forecast.energyProfile.overallEnergy.toUpperCase()}`,
      subtitle: forecast.recommendations[0] || 'Focus on balance and well-being',
      accessories: [
        { text: forecast.energyProfile.overallEnergy, icon: energyIcon }
      ],
      detail: {
        markdown: `# Quick Daily Check\n\n${forecast.guidance.synthesis}\n\n## Top Recommendation\n${forecast.recommendations[0] || 'Stay balanced and mindful'}`
      },
      actions: [
        {
          title: 'Full Forecast',
          icon: '📊'
        },
        {
          title: 'Copy Summary',
          icon: '📋'
        }
      ]
    };
  }

  /**
   * Generate energy check summary for Raycast
   */
  static generateEnergyCheck(forecast: DailyForecast): any {
    const energyIcon = this.getEnergyIcon(forecast.energyProfile.overallEnergy);
    const biorhythm = forecast.energyProfile.biorhythm;
    
    let energyBreakdown = 'Energy data not available';
    if (biorhythm) {
      energyBreakdown = `Physical: ${biorhythm.physical.toFixed(0)}% | Emotional: ${biorhythm.emotional.toFixed(0)}% | Mental: ${biorhythm.intellectual.toFixed(0)}%`;
    }
    
    return {
      title: `Energy Check: ${forecast.energyProfile.overallEnergy.toUpperCase()}`,
      subtitle: energyBreakdown,
      accessories: [
        { text: forecast.energyProfile.overallEnergy, icon: energyIcon },
        { text: forecast.energyProfile.trend, icon: this.getTrendIcon(forecast.energyProfile.trend) }
      ],
      detail: {
        markdown: this.generateEnergyMarkdown(forecast)
      },
      actions: [
        {
          title: 'Optimal Timing',
          icon: '⏰'
        },
        {
          title: 'Energy Tips',
          icon: '💡'
        }
      ]
    };
  }

  /**
   * Generate optimal timing summary for Raycast
   */
  static generateOptimalTiming(forecast: DailyForecast): any {
    const timing = forecast.energyProfile.optimalTiming;
    
    if (!timing) {
      return {
        title: 'Optimal Timing',
        subtitle: 'Timing data not available',
        detail: {
          markdown: '# Optimal Timing\n\nTiming analysis not available for this forecast.'
        }
      };
    }
    
    return {
      title: `Peak Energy: ${timing.peakEnergy}`,
      subtitle: `Best hours: ${timing.bestHours.join(', ')}`,
      accessories: [
        { text: timing.peakEnergy, icon: '⏰' }
      ],
      detail: {
        markdown: this.generateTimingMarkdown(timing)
      },
      actions: [
        {
          title: 'Set Reminders',
          icon: '⏰'
        },
        {
          title: 'Copy Schedule',
          icon: '📋'
        }
      ]
    };
  }

  // Private helper methods
  private static getEnergyIcon(energy: string): string {
    switch (energy) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🔋';
      default: return '⚡';
    }
  }

  private static getTrendIcon(trend: string): string {
    switch (trend) {
      case 'ascending': return '📈';
      case 'descending': return '📉';
      case 'volatile': return '📊';
      case 'stable': return '➡️';
      default: return '➡️';
    }
  }

  private static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  private static generateDailyMarkdown(forecast: DailyForecast): string {
    let markdown = `# Daily Forecast - ${this.formatDate(forecast.date)}\n\n`;
    
    // Energy Profile
    markdown += `## ⚡ Energy Profile\n`;
    markdown += `- **Overall Energy:** ${forecast.energyProfile.overallEnergy.toUpperCase()}\n`;
    markdown += `- **Trend:** ${forecast.energyProfile.trend}\n`;
    
    if (forecast.energyProfile.biorhythm) {
      markdown += `- **Physical:** ${forecast.energyProfile.biorhythm.physical.toFixed(1)}%\n`;
      markdown += `- **Emotional:** ${forecast.energyProfile.biorhythm.emotional.toFixed(1)}%\n`;
      markdown += `- **Mental:** ${forecast.energyProfile.biorhythm.intellectual.toFixed(1)}%\n`;
    }
    
    // Optimal Timing
    if (forecast.energyProfile.optimalTiming) {
      markdown += `\n### 🕐 Optimal Timing\n`;
      markdown += `- **Peak Energy:** ${forecast.energyProfile.optimalTiming.peakEnergy}\n`;
      if (forecast.energyProfile.optimalTiming.bestHours.length > 0) {
        markdown += `- **Best Hours:** ${forecast.energyProfile.optimalTiming.bestHours.join(', ')}\n`;
      }
    }
    
    // Key Themes
    if (forecast.guidance.keyThemes && forecast.guidance.keyThemes.length > 0) {
      markdown += `\n## 🎯 Key Themes\n`;
      forecast.guidance.keyThemes.forEach(theme => {
        markdown += `- ${theme}\n`;
      });
    }
    
    // Recommendations
    if (forecast.recommendations.length > 0) {
      markdown += `\n## 💡 Recommendations\n`;
      forecast.recommendations.slice(0, 5).forEach(rec => {
        markdown += `- ${rec}\n`;
      });
    }
    
    // Guidance
    markdown += `\n## 🔮 Guidance\n`;
    markdown += `${forecast.guidance.synthesis}\n`;
    
    return markdown;
  }

  private static generateWeeklyMarkdown(forecast: WeeklyForecast): string {
    const weekRange = `${this.formatDate(forecast.weekStart)} - ${this.formatDate(forecast.weekEnd)}`;
    let markdown = `# Weekly Forecast - ${weekRange}\n\n`;
    
    // Weekly Theme
    markdown += `## 🎯 Weekly Theme\n${forecast.weeklyInsights.weeklyTheme}\n\n`;
    
    // Dominant Themes
    if (forecast.dominantThemes.length > 0) {
      markdown += `## 🌟 Dominant Themes\n`;
      forecast.dominantThemes.forEach(theme => {
        markdown += `- ${theme}\n`;
      });
      markdown += '\n';
    }
    
    // Energy Flow
    markdown += `## ⚡ Energy Flow\n`;
    forecast.weeklyInsights.energyFlow.forEach(flow => {
      const energyIcon = this.getEnergyIcon(flow.energy);
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
    }
    
    return markdown;
  }

  private static generateWeeklySections(forecast: WeeklyForecast): RaycastSection[] {
    const sections: RaycastSection[] = [];
    
    // Daily breakdown section
    sections.push({
      title: 'Daily Breakdown',
      items: forecast.dailyForecasts.map(daily => ({
        title: this.getDayName(daily.date),
        subtitle: `${daily.energyProfile.overallEnergy.toUpperCase()} energy - ${daily.guidance.keyThemes?.[0] || 'Balance'}`,
        accessories: [
          { 
            text: daily.energyProfile.overallEnergy, 
            icon: this.getEnergyIcon(daily.energyProfile.overallEnergy) 
          }
        ]
      }))
    });
    
    return sections;
  }

  private static generateEnergyMarkdown(forecast: DailyForecast): string {
    let markdown = `# Energy Check - ${this.formatDate(forecast.date)}\n\n`;
    
    const biorhythm = forecast.energyProfile.biorhythm;
    if (biorhythm) {
      markdown += `## 📊 Biorhythm Cycles\n`;
      markdown += `- **Physical:** ${biorhythm.physical.toFixed(1)}%\n`;
      markdown += `- **Emotional:** ${biorhythm.emotional.toFixed(1)}%\n`;
      markdown += `- **Mental:** ${biorhythm.intellectual.toFixed(1)}%\n`;
      markdown += `- **Overall:** ${biorhythm.overall_energy.toFixed(1)}%\n\n`;
    }
    
    markdown += `## 📈 Energy Trend\n`;
    markdown += `Current trend: **${forecast.energyProfile.trend}**\n\n`;
    
    if (forecast.energyProfile.optimalTiming) {
      markdown += `## ⏰ Optimal Timing\n`;
      markdown += `- **Peak Energy:** ${forecast.energyProfile.optimalTiming.peakEnergy}\n`;
      if (forecast.energyProfile.optimalTiming.bestHours.length > 0) {
        markdown += `- **Best Hours:** ${forecast.energyProfile.optimalTiming.bestHours.join(', ')}\n`;
      }
      if (forecast.energyProfile.optimalTiming.avoidHours.length > 0) {
        markdown += `- **Avoid:** ${forecast.energyProfile.optimalTiming.avoidHours.join(', ')}\n`;
      }
    }
    
    return markdown;
  }

  private static generateTimingMarkdown(timing: any): string {
    let markdown = `# Optimal Timing\n\n`;
    
    markdown += `## 🌅 Peak Energy Period\n`;
    markdown += `**${timing.peakEnergy}** is your optimal time for peak performance.\n\n`;
    
    if (timing.bestHours.length > 0) {
      markdown += `## ⏰ Best Hours\n`;
      timing.bestHours.forEach((hour: string) => {
        markdown += `- ${hour}\n`;
      });
      markdown += '\n';
    }
    
    if (timing.avoidHours.length > 0) {
      markdown += `## ⚠️ Hours to Avoid\n`;
      timing.avoidHours.forEach((hour: string) => {
        markdown += `- ${hour}\n`;
      });
    }
    
    return markdown;
  }

  private static getDayName(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  }
}

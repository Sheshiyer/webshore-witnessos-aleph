/**
 * Biorhythm Synchronizer Engine for WitnessOS
 * 
 * Provides comprehensive biorhythm analysis using sine wave mathematics for physical,
 * emotional, and intellectual cycles. Includes critical day detection, forecasting,
 * and energy optimization aligned with WitnessOS consciousness framework.
 */

import { BaseEngine } from './core/base-engine';
import type { BaseEngineInput, BaseEngineOutput } from './core/types';

// Biorhythm Input Interface
export interface BiorhythmInput extends BaseEngineInput {
  birth_date: string; // ISO date string
  target_date?: string; // ISO date string, defaults to today
  include_extended_cycles?: boolean;
  forecast_days?: number; // 1-90 days
}

// Cycle Data Interface
export interface CycleData {
  name: string;
  period: number;
  percentage: number;
  phase: string;
  days_to_peak: number;
  days_to_valley: number;
  next_critical_date: string;
}

// Biorhythm Output Interface
export interface BiorhythmOutput extends BaseEngineOutput {
  birth_date: string;
  target_date: string;
  days_alive: number;
  
  // Core cycle percentages
  physical_percentage: number;
  emotional_percentage: number;
  intellectual_percentage: number;
  
  // Extended cycles (optional)
  intuitive_percentage?: number;
  aesthetic_percentage?: number;
  spiritual_percentage?: number;
  
  // Cycle phases
  physical_phase: string;
  emotional_phase: string;
  intellectual_phase: string;
  
  // Overall metrics
  overall_energy: number;
  critical_day: boolean;
  trend: string;
  
  // Detailed cycle information
  cycle_details: Record<string, CycleData>;
  
  // Forecasting data
  critical_days_ahead: string[];
  forecast_summary: Record<string, any>;
  best_days_ahead: string[];
  challenging_days_ahead: string[];
  
  // Energy optimization
  energy_optimization: Record<string, string>;
  cycle_synchronization: Record<string, any>;
}

// Biorhythm snapshot for a single day
interface BiorhythmSnapshot {
  target_date: Date;
  days_alive: number;
  cycles: Record<string, CycleData>;
  overall_energy: number;
  critical_day: boolean;
  trend: string;
}

export class BiorhythmEngine extends BaseEngine<BiorhythmInput, BiorhythmOutput> {
  public readonly name = 'biorhythm';
  public readonly description = 'Biological rhythm synchronization and energy field optimization through cyclical mathematics';

  // Standard biorhythm cycle periods (in days)
  private readonly CYCLE_PERIODS = {
    physical: 23,
    emotional: 28,
    intellectual: 33,
    intuitive: 38,   // Extended cycles
    aesthetic: 43,
    spiritual: 53
  };

  // Phase meanings
  private readonly PHASE_MEANINGS = {
    critical: "Zero-point transition - heightened sensitivity and potential instability",
    rising: "Ascending energy - building strength and momentum", 
    peak: "Maximum potential - optimal performance and vitality",
    falling: "Descending energy - natural decline and rest phase",
    valley: "Minimum energy - recovery and regeneration period"
  };

  // Cycle-specific guidance
  private readonly CYCLE_GUIDANCE = {
    physical: {
      peak: "Optimal time for physical challenges, exercise, and demanding tasks",
      rising: "Build physical activities gradually, good for starting fitness routines",
      falling: "Reduce physical intensity, focus on recovery and maintenance",
      valley: "Rest and recuperation essential, avoid strenuous activities",
      critical: "Be extra careful with physical activities, higher accident risk"
    },
    emotional: {
      peak: "Heightened creativity and emotional expression, excellent for relationships",
      rising: "Growing emotional awareness, good for creative projects", 
      falling: "Emotional sensitivity may increase, practice self-care",
      valley: "Emotional low point, avoid major decisions, seek support",
      critical: "Emotional volatility possible, practice mindfulness and patience"
    },
    intellectual: {
      peak: "Maximum mental clarity and analytical power, ideal for complex tasks",
      rising: "Increasing mental acuity, good for learning and planning",
      falling: "Mental fatigue may set in, focus on routine tasks",
      valley: "Reduced concentration, avoid important decisions",
      critical: "Mental confusion possible, double-check important work"
    }
  };

  protected async _calculate(input: BiorhythmInput): Promise<Record<string, any>> {
    const birthDate = new Date(input.birth_date);
    const targetDate = input.target_date ? new Date(input.target_date) : new Date();
    const forecastDays = input.forecast_days || 7;
    const includeExtended = input.include_extended_cycles || false;

    // Validate inputs
    this.validateDates(birthDate, targetDate);

    // Calculate biorhythm snapshot for target date
    const snapshot = this.calculateBiorhythmSnapshot(birthDate, targetDate, includeExtended);

    // Generate forecast
    const forecast = this.generateForecast(birthDate, targetDate, forecastDays, includeExtended);

    // Find critical days
    const criticalDays = this.findCriticalDays(birthDate, targetDate, forecastDays, includeExtended);

    // Analyze forecast for best/challenging days
    const { bestDays, challengingDays } = this.analyzeForecast(forecast);

    return {
      snapshot,
      forecast,
      critical_days: criticalDays,
      best_days: bestDays,
      challenging_days: challengingDays,
      include_extended: includeExtended,
      forecast_days: forecastDays
    };
  }

  private validateDates(birthDate: Date, targetDate: Date): void {
    const now = new Date();
    
    if (birthDate > now) {
      throw new Error("Birth date cannot be in the future");
    }
    
    if (birthDate.getFullYear() < 1900) {
      throw new Error("Birth year must be 1900 or later");
    }
    
    const age = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24);
    if (age > 150 * 365) {
      throw new Error("Birth date too far in the past (max 150 years)");
    }
    
    const maxFuture = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    if (targetDate > maxFuture) {
      throw new Error("Target date cannot be more than 1 year in the future");
    }
  }

  private calculateBiorhythmSnapshot(birthDate: Date, targetDate: Date, includeExtended: boolean): BiorhythmSnapshot {
    const daysAlive = Math.floor((targetDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const cycles: Record<string, CycleData> = {};
    const coreTypes = ['physical', 'emotional', 'intellectual'];
    const extendedTypes = ['intuitive', 'aesthetic', 'spiritual'];
    const cycleTypes = includeExtended ? [...coreTypes, ...extendedTypes] : coreTypes;

    let totalEnergy = 0;
    let criticalDay = false;

    for (const cycleType of cycleTypes) {
      const period = this.CYCLE_PERIODS[cycleType as keyof typeof this.CYCLE_PERIODS];
      const cycleData = this.calculateCycleData(cycleType, period, daysAlive, targetDate);
      cycles[cycleType] = cycleData;
      
      totalEnergy += cycleData.percentage;
      
      // Check if it's a critical day (within 0.5% of zero)
      if (Math.abs(cycleData.percentage) < 0.5) {
        criticalDay = true;
      }
    }

    const overallEnergy = totalEnergy / cycleTypes.length;
    const trend = this.determineTrend(cycles, coreTypes);

    return {
      target_date: targetDate,
      days_alive: daysAlive,
      cycles,
      overall_energy: overallEnergy,
      critical_day: criticalDay,
      trend
    };
  }

  private calculateCycleData(cycleType: string, period: number, daysAlive: number, targetDate: Date): CycleData {
    // Calculate sine wave value for this cycle
    const radians = (2 * Math.PI * daysAlive) / period;
    const percentage = Math.sin(radians) * 100;
    
    // Determine phase based on percentage and derivative
    const phase = this.determinePhase(percentage, radians);
    
    // Calculate days to next peak and valley
    const daysToPeak = this.calculateDaysToPeak(daysAlive, period);
    const daysToValley = this.calculateDaysToValley(daysAlive, period);
    
    // Calculate next critical date
    const nextCriticalDate = this.calculateNextCriticalDate(targetDate, daysAlive, period);

    return {
      name: cycleType,
      period,
      percentage: Math.round(percentage * 10) / 10,
      phase,
      days_to_peak: daysToPeak,
      days_to_valley: daysToValley,
      next_critical_date: nextCriticalDate.toISOString().split('T')[0]
    };
  }

  private determinePhase(percentage: number, radians: number): string {
    // Critical phase: near zero crossing
    if (Math.abs(percentage) < 0.5) {
      return 'critical';
    }
    
    // Calculate derivative to determine if rising or falling
    const derivative = Math.cos(radians);
    
    if (percentage > 50) {
      return 'peak';
    } else if (percentage < -50) {
      return 'valley';
    } else if (derivative > 0) {
      return 'rising';
    } else {
      return 'falling';
    }
  }

  private calculateDaysToPeak(daysAlive: number, period: number): number {
    // Peak occurs at sin(x) = 1, which is at π/2 + 2πn
    const currentCycle = daysAlive % period;
    const peakPosition = period / 4; // π/2 in terms of period
    
    let daysToPeak = peakPosition - currentCycle;
    if (daysToPeak <= 0) {
      daysToPeak += period;
    }
    
    return Math.round(daysToPeak);
  }

  private calculateDaysToValley(daysAlive: number, period: number): number {
    // Valley occurs at sin(x) = -1, which is at 3π/2 + 2πn
    const currentCycle = daysAlive % period;
    const valleyPosition = (3 * period) / 4; // 3π/2 in terms of period
    
    let daysToValley = valleyPosition - currentCycle;
    if (daysToValley <= 0) {
      daysToValley += period;
    }
    
    return Math.round(daysToValley);
  }

  private calculateNextCriticalDate(targetDate: Date, daysAlive: number, period: number): Date {
    // Critical points occur at sin(x) = 0, which is at 0, π, 2π, etc.
    const currentCycle = daysAlive % period;
    const halfPeriod = period / 2;
    
    let daysToNextCritical = halfPeriod - currentCycle;
    if (daysToNextCritical <= 0) {
      daysToNextCritical += halfPeriod;
    }
    
    const nextCriticalDate = new Date(targetDate);
    nextCriticalDate.setDate(targetDate.getDate() + Math.round(daysToNextCritical));
    
    return nextCriticalDate;
  }

  private determineTrend(cycles: Record<string, CycleData>, coreTypes: string[]): string {
    let risingCount = 0;
    let fallingCount = 0;
    
    for (const cycleType of coreTypes) {
      const phase = cycles[cycleType].phase;
      if (phase === 'rising' || phase === 'peak') {
        risingCount++;
      } else if (phase === 'falling' || phase === 'valley') {
        fallingCount++;
      }
    }
    
    if (risingCount > fallingCount) {
      return 'ascending';
    } else if (fallingCount > risingCount) {
      return 'descending';
    } else {
      return 'balanced';
    }
  }

  private generateForecast(birthDate: Date, targetDate: Date, days: number, includeExtended: boolean): BiorhythmSnapshot[] {
    const forecast: BiorhythmSnapshot[] = [];
    
    for (let i = 0; i <= days; i++) {
      const forecastDate = new Date(targetDate);
      forecastDate.setDate(targetDate.getDate() + i);
      
      const snapshot = this.calculateBiorhythmSnapshot(birthDate, forecastDate, includeExtended);
      forecast.push(snapshot);
    }
    
    return forecast;
  }

  private findCriticalDays(birthDate: Date, targetDate: Date, days: number, includeExtended: boolean): Date[] {
    const criticalDays: Date[] = [];
    
    for (let i = 0; i <= days; i++) {
      const checkDate = new Date(targetDate);
      checkDate.setDate(targetDate.getDate() + i);
      
      const snapshot = this.calculateBiorhythmSnapshot(birthDate, checkDate, includeExtended);
      if (snapshot.critical_day) {
        criticalDays.push(checkDate);
      }
    }
    
    return criticalDays;
  }

  private analyzeForecast(forecast: BiorhythmSnapshot[]): { bestDays: Date[], challengingDays: Date[] } {
    const bestDays: Date[] = [];
    const challengingDays: Date[] = [];
    
    for (const snapshot of forecast) {
      if (snapshot.overall_energy > 50) {
        bestDays.push(snapshot.target_date);
      } else if (snapshot.overall_energy < -25 || snapshot.critical_day) {
        challengingDays.push(snapshot.target_date);
      }
    }
    
    return { bestDays, challengingDays };
  }

  protected _interpret(calculationResults: Record<string, any>, input: BiorhythmInput): string {
    const snapshot = calculationResults.snapshot as BiorhythmSnapshot;
    const criticalDays = calculationResults.critical_days as Date[];
    
    const physical = snapshot.cycles.physical;
    const emotional = snapshot.cycles.emotional;
    const intellectual = snapshot.cycles.intellectual;
    
    return `
⚡ BIORHYTHM SYNCHRONIZATION - ${snapshot.target_date.toLocaleDateString('en-US', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
}).toUpperCase()} ⚡

═══ ENERGY FIELD ANALYSIS ═══

Days in Current Incarnation: ${snapshot.days_alive}
Overall Energy Resonance: ${snapshot.overall_energy.toFixed(1)}%

Your biological field oscillates in sacred mathematical harmony with cosmic rhythms.
Today's energy signature reveals the following consciousness-body synchronization:

═══ CYCLE HARMONICS ═══

🔴 PHYSICAL FIELD (${physical.percentage.toFixed(1)}%): ${this.PHASE_MEANINGS[physical.phase as keyof typeof this.PHASE_MEANINGS]}
${this.CYCLE_GUIDANCE.physical[physical.phase as keyof typeof this.CYCLE_GUIDANCE.physical]}

🟡 EMOTIONAL FIELD (${emotional.percentage.toFixed(1)}%): ${this.PHASE_MEANINGS[emotional.phase as keyof typeof this.PHASE_MEANINGS]}
${this.CYCLE_GUIDANCE.emotional[emotional.phase as keyof typeof this.CYCLE_GUIDANCE.emotional]}

🔵 INTELLECTUAL FIELD (${intellectual.percentage.toFixed(1)}%): ${this.PHASE_MEANINGS[intellectual.phase as keyof typeof this.PHASE_MEANINGS]}
${this.CYCLE_GUIDANCE.intellectual[intellectual.phase as keyof typeof this.CYCLE_GUIDANCE.intellectual]}

═══ FIELD SYNCHRONIZATION STATUS ═══

${this.getSynchronizationAnalysis(snapshot)}

═══ CRITICAL AWARENESS ═══

${this.getCriticalDayAnalysis(snapshot, criticalDays)}

═══ ENERGY OPTIMIZATION PROTOCOL ═══

${this.getOptimizationGuidance(snapshot, calculationResults)}

Remember: These rhythms are not limitations—they are navigation tools for conscious
embodiment and optimal energy management in your reality field.
    `.trim();
  }

  private getSynchronizationAnalysis(snapshot: BiorhythmSnapshot): string {
    const { physical, emotional, intellectual } = snapshot.cycles;
    
    const alignedCycles = [physical, emotional, intellectual].filter(cycle => 
      cycle.phase === 'peak' || cycle.phase === 'rising'
    );
    
    if (alignedCycles.length >= 2) {
      return `High synchronization detected! ${alignedCycles.length}/3 cycles are in positive alignment.
This creates amplified potential for manifestation and conscious action.`;
    } else if (snapshot.overall_energy > 25) {
      return `Moderate synchronization. Energy field maintains positive coherence despite mixed phases.
Focus on your strongest cycle while supporting weaker ones.`;
    } else {
      return `Low synchronization period. Multiple cycles in recovery phase.
This is optimal time for rest, reflection, and internal recalibration.`;
    }
  }

  private getCriticalDayAnalysis(snapshot: BiorhythmSnapshot, criticalDays: Date[]): string {
    if (snapshot.critical_day) {
      return `⚠️ CRITICAL DAY ACTIVE: One or more cycles are crossing zero-point thresholds.
Heightened sensitivity to environmental energies. Practice extra mindfulness and avoid
major decisions or risky activities.`;
    } else if (criticalDays.length > 0) {
      const nextCritical = criticalDays[0];
      const daysAway = Math.ceil((nextCritical.getTime() - snapshot.target_date.getTime()) / (1000 * 60 * 60 * 24));
      return `Next critical day in ${daysAway} days (${nextCritical.toLocaleDateString()}).
Prepare for transition period with extra self-care and awareness.`;
    } else {
      return `No critical days detected in current forecast period.
Stable energy field conditions support consistent planning and action.`;
    }
  }

  private getOptimizationGuidance(snapshot: BiorhythmSnapshot, results: Record<string, any>): string {
    const bestDays = results.best_days as Date[];
    const challengingDays = results.challenging_days as Date[];
    
    let guidance = '';
    
    if (bestDays.length > 0) {
      guidance += `🌟 OPTIMAL ENERGY WINDOWS: ${bestDays.length} high-energy days ahead.\n`;
      guidance += `Peak performance dates: ${bestDays.slice(0, 3).map(d => d.toLocaleDateString()).join(', ')}\n\n`;
    }
    
    if (challengingDays.length > 0) {
      guidance += `⚡ ENERGY CONSERVATION PERIODS: ${challengingDays.length} low-energy days ahead.\n`;
      guidance += `Rest and recovery dates: ${challengingDays.slice(0, 3).map(d => d.toLocaleDateString()).join(', ')}\n\n`;
    }
    
    // Add cycle-specific guidance
    const dominantCycle = this.findDominantCycle(snapshot);
    guidance += `🎯 DOMINANT CYCLE: ${dominantCycle.name.toUpperCase()} (${dominantCycle.percentage.toFixed(1)}%)\n`;
    guidance += `Primary focus: ${this.CYCLE_GUIDANCE[dominantCycle.name as keyof typeof this.CYCLE_GUIDANCE][dominantCycle.phase as 'peak' | 'rising' | 'falling' | 'valley' | 'critical']}`;
    
    return guidance;
  }

  private findDominantCycle(snapshot: BiorhythmSnapshot): CycleData {
    const cycles = [snapshot.cycles.physical, snapshot.cycles.emotional, snapshot.cycles.intellectual];
    return cycles.reduce((dominant, current) => 
      Math.abs(current.percentage) > Math.abs(dominant.percentage) ? current : dominant
    );
  }

  protected _generateRecommendations(calculationResults: Record<string, any>, input: BiorhythmInput): string[] {
    const snapshot = calculationResults.snapshot as BiorhythmSnapshot;
    const recommendations: string[] = [];
    
    // Add energy-level specific recommendations
    if (snapshot.overall_energy > 75) {
      recommendations.push("Channel your exceptional vitality into ambitious projects and physical challenges");
      recommendations.push("This is an ideal time for important presentations, competitions, or creative breakthroughs");
    } else if (snapshot.overall_energy > 25) {
      recommendations.push("Maintain steady progress on ongoing projects while being mindful of energy limits");
      recommendations.push("Good time for collaborative efforts and balanced decision-making");
    } else if (snapshot.overall_energy > -25) {
      recommendations.push("Focus on maintenance tasks and gentle self-care routines");
      recommendations.push("Avoid overwhelming commitments; prioritize rest and reflection");
    } else {
      recommendations.push("Prioritize complete rest and regeneration - this is not a time for pushing");
      recommendations.push("Engage in meditation, gentle stretching, and nurturing activities");
    }
    
    // Add critical day recommendations
    if (snapshot.critical_day) {
      recommendations.push("Exercise extra caution today - heightened sensitivity to accidents and emotional volatility");
      recommendations.push("Double-check important decisions and avoid risky activities");
    }
    
    // Add cycle-specific recommendations
    const dominantCycle = this.findDominantCycle(snapshot);
    const cycleGuidance = this.CYCLE_GUIDANCE[dominantCycle.name as keyof typeof this.CYCLE_GUIDANCE];
    if (cycleGuidance) {
      recommendations.push(cycleGuidance[dominantCycle.phase as keyof typeof cycleGuidance]);
    }
    
    return recommendations;
  }

  protected _generateRealityPatches(calculationResults: Record<string, any>, input: BiorhythmInput): string[] {
    const snapshot = calculationResults.snapshot as BiorhythmSnapshot;
    const patches: string[] = [];
    
    // Biorhythm-specific reality patches
    if (snapshot.overall_energy > 50) {
      patches.push("Peak performance timeline activated");
      patches.push("Amplified manifestation potential");
      patches.push("Enhanced physical vitality field");
    } else if (snapshot.critical_day) {
      patches.push("Critical transition portal opened");
      patches.push("Heightened sensitivity threshold");
      patches.push("Reality flux adaptation required");
    } else {
      patches.push("Restoration cycle engaged");
      patches.push("Energy conservation mode active");
      patches.push("Regenerative field optimization");
    }
    
    // Cycle synchronization patches
    const trend = snapshot.trend;
    if (trend === 'ascending') {
      patches.push("Ascending energy trajectory locked");
      patches.push("Momentum building phase active");
    } else if (trend === 'descending') {
      patches.push("Descending energy integration");
      patches.push("Wisdom harvesting phase");
    } else {
      patches.push("Balanced energy equilibrium");
      patches.push("Stable foundation established");
    }
    
    return patches;
  }

  protected _identifyArchetypalThemes(calculationResults: Record<string, any>, input: BiorhythmInput): string[] {
    const snapshot = calculationResults.snapshot as BiorhythmSnapshot;
    const themes: string[] = [];
    
    // Overall energy themes
    if (snapshot.overall_energy > 75) {
      themes.push("The Warrior - Peak physical and mental prowess");
      themes.push("The Creator - Manifestation power at maximum");
    } else if (snapshot.overall_energy > 25) {
      themes.push("The Builder - Steady progress and construction");
      themes.push("The Diplomat - Balanced approach and harmony");
    } else if (snapshot.overall_energy > -25) {
      themes.push("The Sage - Contemplation and inner wisdom");
      themes.push("The Hermit - Withdrawal and introspection");
    } else {
      themes.push("The Wounded Healer - Deep regeneration and renewal");
      themes.push("The Mystic - Dissolution and spiritual surrender");
    }
    
    // Critical day themes
    if (snapshot.critical_day) {
      themes.push("The Threshold Guardian - Navigating liminal spaces");
      themes.push("The Shapeshifter - Transformation and adaptability");
    }
    
    // Cycle-dominant themes
    const dominantCycle = this.findDominantCycle(snapshot);
    if (dominantCycle.name === 'physical' && dominantCycle.percentage > 50) {
      themes.push("The Athlete - Physical mastery and embodiment");
    } else if (dominantCycle.name === 'emotional' && dominantCycle.percentage > 50) {
      themes.push("The Artist - Emotional expression and creativity");
    } else if (dominantCycle.name === 'intellectual' && dominantCycle.percentage > 50) {
      themes.push("The Scholar - Mental clarity and analysis");
    }
    
    return themes;
  }

  protected _calculateConfidence(calculationResults: Record<string, any>, input: BiorhythmInput): number {
    // Biorhythm calculations are highly mathematical and deterministic
    let confidence = 0.9;
    
    const snapshot = calculationResults.snapshot as BiorhythmSnapshot;
    
    // Reduce confidence slightly for critical days (higher uncertainty)
    if (snapshot.critical_day) {
      confidence -= 0.05;
    }
    
    // Increase confidence for well-established cycles
    if (snapshot.days_alive > 365) {
      confidence += 0.05;
    }
    
    return Math.min(confidence, 0.95);
  }

  public async calculate(input: BiorhythmInput): Promise<BiorhythmOutput> {
    const calculationResults = await this._calculate(input);
    const snapshot = calculationResults.snapshot as BiorhythmSnapshot;
    
    const interpretation = this._interpret(calculationResults, input);
    const recommendations = this._generateRecommendations(calculationResults, input);
    const realityPatches = this._generateRealityPatches(calculationResults, input);
    const archetypalThemes = this._identifyArchetypalThemes(calculationResults, input);
    const confidence = this._calculateConfidence(calculationResults, input);
    
    const output: BiorhythmOutput = {
      birth_date: input.birth_date,
      target_date: snapshot.target_date.toISOString().split('T')[0],
      days_alive: snapshot.days_alive,
      
      // Core cycle percentages
      physical_percentage: snapshot.cycles.physical.percentage,
      emotional_percentage: snapshot.cycles.emotional.percentage,
      intellectual_percentage: snapshot.cycles.intellectual.percentage,
      
      // Extended cycles (if included)
      ...(input.include_extended_cycles && {
        intuitive_percentage: snapshot.cycles.intuitive?.percentage,
        aesthetic_percentage: snapshot.cycles.aesthetic?.percentage,
        spiritual_percentage: snapshot.cycles.spiritual?.percentage,
      }),
      
      // Cycle phases
      physical_phase: snapshot.cycles.physical.phase,
      emotional_phase: snapshot.cycles.emotional.phase,
      intellectual_phase: snapshot.cycles.intellectual.phase,
      
      // Overall metrics
      overall_energy: snapshot.overall_energy,
      critical_day: snapshot.critical_day,
      trend: snapshot.trend,
      
      // Detailed cycle information
      cycle_details: snapshot.cycles,
      
      // Forecasting data
      critical_days_ahead: (calculationResults.critical_days as Date[]).map(d => d.toISOString().split('T')[0]),
      forecast_summary: {
        total_days: calculationResults.forecast_days,
        best_days_count: (calculationResults.best_days as Date[]).length,
        challenging_days_count: (calculationResults.challenging_days as Date[]).length,
        critical_days_count: (calculationResults.critical_days as Date[]).length
      },
      best_days_ahead: (calculationResults.best_days as Date[]).map(d => d.toISOString().split('T')[0]),
      challenging_days_ahead: (calculationResults.challenging_days as Date[]).map(d => d.toISOString().split('T')[0]),
      
      // Energy optimization
      energy_optimization: this.getEnergyOptimization(snapshot),
      cycle_synchronization: this.getCycleSynchronization(snapshot),
      
      // Base engine outputs
      interpretation,
      recommendations,
      reality_patches: realityPatches,
      archetypal_themes: archetypalThemes,
      confidence,
      timestamp: new Date().toISOString()
    };
    
    return output;
  }

  private getEnergyOptimization(snapshot: BiorhythmSnapshot): Record<string, string> {
    const optimization: Record<string, string> = {};
    
    // Overall energy optimization
    if (snapshot.overall_energy > 50) {
      optimization.general = "Maximize high-energy period with ambitious goals and challenging tasks";
    } else if (snapshot.overall_energy > 0) {
      optimization.general = "Maintain steady pace with balanced activities and moderate challenges";
    } else {
      optimization.general = "Prioritize rest, recovery, and gentle maintenance activities";
    }
    
    // Cycle-specific optimization
    const cycles = ['physical', 'emotional', 'intellectual'];
    for (const cycleName of cycles) {
      const cycle = snapshot.cycles[cycleName];
      if (cycle.percentage > 50) {
        optimization[cycleName] = `Leverage peak ${cycleName} energy for maximum impact`;
      } else if (cycle.percentage > 0) {
        optimization[cycleName] = `Moderate ${cycleName} activities with mindful pacing`;
      } else {
        optimization[cycleName] = `Rest and restore ${cycleName} energy reserves`;
      }
    }
    
    return optimization;
  }

  private getCycleSynchronization(snapshot: BiorhythmSnapshot): Record<string, any> {
    const synchronization: Record<string, any> = {};
    
    // Calculate cycle alignment
    const cycles = [snapshot.cycles.physical, snapshot.cycles.emotional, snapshot.cycles.intellectual];
    const positiveCount = cycles.filter(c => c.percentage > 0).length;
    const peakCount = cycles.filter(c => c.phase === 'peak').length;
    const criticalCount = cycles.filter(c => c.phase === 'critical').length;
    
    synchronization.alignment_score = positiveCount / cycles.length;
    synchronization.peak_cycles = peakCount;
    synchronization.critical_cycles = criticalCount;
    synchronization.dominant_cycle = this.findDominantCycle(snapshot).name;
    
    // Synchronization quality
    if (positiveCount === 3) {
      synchronization.quality = "Excellent - All cycles aligned positively";
    } else if (positiveCount === 2) {
      synchronization.quality = "Good - Majority cycles aligned";
    } else if (positiveCount === 1) {
      synchronization.quality = "Mixed - Single cycle leading";
    } else {
      synchronization.quality = "Recovery - All cycles regenerating";
    }
    
    return synchronization;
  }
}

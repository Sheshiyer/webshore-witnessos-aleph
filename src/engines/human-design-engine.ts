/**
 * Human Design Engine - TypeScript Implementation
 *
 * This module implements the Human Design incarnation cross calculation,
 * gate mapping, offsets, design time and solar arc calculation logic,
 * based on detailed research and verification.
 *
 * Key Concepts:
 * - Inputs: birth date/time, location, timezone
 * - Calculate planetary longitudes (Sun, Earth) at birth and design time
 * - Design time is calculated using 88 degrees solar arc before birth
 * - Zodiac divided into 64 gates, each 5.625 degrees
 * - Official Human Design gate sequence used for mapping gates
 * - Apply rotation offset to align calculated gates with expected gates
 * - Generate detailed chart data and interpretations
 */

import { HumanDesignCalculator, HumanDesignChart } from './calculators/human-design-calculator';
import { BaseEngine } from './core/base-engine';
import type { BaseEngineInput, BaseEngineOutput, CalculationResult } from './core/types';

export interface HumanDesignInput extends BaseEngineInput {
  fullName: string;
  birthDate: string; // ISO format YYYY-MM-DD
  birthTime: string; // HH:MM format
  birthLocation: [number, number]; // [latitude, longitude]
  timezone?: string;
}

export interface HumanDesignOutput extends BaseEngineOutput {
  type: string;
  strategy: string;
  authority: string;
  profile: {
    line1: number;
    line2: number;
    description: string;
  };
  centers: Record<string, {
    name: string;
    defined: boolean;
    gates: number[];
    channels: number[];
  }>;
  definedChannels: Array<{
    number: number;
    name: string;
    gates: [number, number];
    defined: boolean;
  }>;
  incarnationCross: {
    name: string;
    gates: [number, number, number, number];
    description: string;
  };
  personalityGates: Record<string, any>;
  designGates: Record<string, any>;
  definition: string;
}

export class HumanDesignEngine extends BaseEngine<HumanDesignInput, HumanDesignOutput> {
  private calculator: HumanDesignCalculator;

  constructor(name: string = 'human_design', description: string = 'Human Design chart calculation', config: any = {}) {
    super(name, description, config);
    this.calculator = new HumanDesignCalculator();
  }

  async calculate(input: HumanDesignInput): Promise<CalculationResult<HumanDesignOutput>> {
    const startTime = Date.now();

    try {
      // Validate input
      if (!this.validateInput(input)) {
        throw new Error('Invalid input data');
      }

      // Perform calculation
      const output = await this.performCalculation(input);
      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: output,
        processingTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      return {
        success: false,
        error: this.createError(
          'CALCULATION_FAILED',
          error instanceof Error ? error.message : 'Unknown error'
        ),
        processingTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  protected validateInput(input: HumanDesignInput): boolean {
    return !!(input.fullName && input.birthDate && input.birthTime && input.birthLocation);
  }

  protected async performCalculation(input: HumanDesignInput): Promise<HumanDesignOutput> {
    try {
      // Parse birth date and time
      const birthDate = new Date(`${input.birthDate}T${input.birthTime}:00`);

      if (isNaN(birthDate.getTime())) {
        throw new Error('Invalid birth date or time format');
      }

      // Validate coordinates
      const [latitude, longitude] = input.birthLocation;
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error('Invalid birth location coordinates');
      }

      // Calculate Human Design chart
      const chart = this.calculator.calculateChart(birthDate, input.birthLocation);

      // Format output
      const output: HumanDesignOutput = {
        engineName: this.name,
        calculationTime: Date.now(),
        confidenceScore: 0.95, // High confidence for astronomical calculations
        formattedOutput: this.formatHumanDesignOutput(chart, input),
        recommendations: this.generateHDRecommendations(chart),
        realityPatches: this.generateHDRealityPatches(chart),
        archetypalThemes: this.extractArchetypalThemes(chart),
        timestamp: new Date().toISOString(),

        // Human Design specific data
        type: chart.type,
        strategy: chart.strategy,
        authority: chart.authority,
        profile: chart.profile,
        centers: chart.centers,
        definedChannels: chart.definedChannels,
        incarnationCross: chart.incarnationCross,
        personalityGates: chart.personalityGates,
        designGates: chart.designGates,
        definition: chart.definition
      };

      return output;

    } catch (error) {
      throw new Error(`Human Design calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private formatHumanDesignOutput(chart: HumanDesignChart, input: HumanDesignInput): string {
    const definedCenters = Object.values(chart.centers).filter(center => center.defined);
    const undefinedCenters = Object.values(chart.centers).filter(center => !center.defined);

    return `🧬 HUMAN DESIGN CHART - ${input.fullName.toUpperCase()} 🧬

═══ CORE DESIGN ═══

Type: ${chart.type}
Strategy: ${chart.strategy}
Authority: ${chart.authority}
Profile: ${chart.profile.line1}/${chart.profile.line2} - ${chart.profile.description}
Definition: ${chart.definition}

═══ DEFINED CENTERS (${definedCenters.length}/9) ═══

${definedCenters.map(center =>
  `• ${center.name}: ${center.gates.length} active gates [${center.gates.join(', ')}]`
).join('\n')}

═══ UNDEFINED CENTERS (${undefinedCenters.length}/9) ═══

${undefinedCenters.map(center =>
  `• ${center.name}: Open for conditioning and wisdom`
).join('\n')}

═══ DEFINED CHANNELS (${chart.definedChannels.length}) ═══

${chart.definedChannels.map(channel =>
  `• Channel ${channel.number}: ${channel.name} (Gates ${channel.gates[0]}-${channel.gates[1]})`
).join('\n')}

═══ INCARNATION CROSS ═══

${chart.incarnationCross.name}
Gates: ${chart.incarnationCross.gates.join(' - ')}
${chart.incarnationCross.description}

═══ BIRTH DATA ═══

Date: ${input.birthDate} at ${input.birthTime}
Location: ${input.birthLocation[0].toFixed(6)}, ${input.birthLocation[1].toFixed(6)}
Timezone: ${input.timezone || 'UTC'}

Your Human Design chart reveals your unique energetic blueprint and decision-making strategy.`;
  }

  private generateHDRecommendations(chart: HumanDesignChart): string[] {
    const recommendations = [
      `Follow your ${chart.type} strategy: ${chart.strategy}`,
      `Trust your ${chart.authority} authority for decision-making`,
      `Embrace your ${chart.profile.line1}/${chart.profile.line2} profile theme`
    ];

    // Add type-specific recommendations
    switch (chart.type) {
      case 'Manifestor':
        recommendations.push('Inform others before taking action to reduce resistance');
        break;
      case 'Generator':
        recommendations.push('Wait for things to respond to before committing your energy');
        break;
      case 'Manifesting Generator':
        recommendations.push('Follow your gut response and inform others of your decisions');
        break;
      case 'Projector':
        recommendations.push('Wait for invitations and recognition before sharing your gifts');
        break;
      case 'Reflector':
        recommendations.push('Take time (lunar cycle) to make important decisions');
        break;
    }

    return recommendations;
  }

  private generateHDRealityPatches(chart: HumanDesignChart): string[] {
    return [
      `Install: ${chart.type} energy management protocol`,
      `Patch: ${chart.authority} decision-making system`,
      `Upgrade: ${chart.definition} definition integration module`,
      `Activate: Incarnation Cross ${chart.incarnationCross.name} purpose alignment`
    ];
  }

  private extractArchetypalThemes(chart: HumanDesignChart): string[] {
    const themes = [
      `${chart.type} archetype - ${chart.strategy}`,
      `${chart.authority} decision-making pattern`,
      `${chart.profile.line1}/${chart.profile.line2} life theme`
    ];

    // Add themes based on defined centers
    const definedCenters = Object.values(chart.centers).filter(center => center.defined);
    if (definedCenters.length > 0) {
      themes.push(`Defined energy centers: ${definedCenters.map(c => c.name).join(', ')}`);
    }

    return themes;
  }

  protected generateInterpretation(results: Record<string, unknown>, input: HumanDesignInput): string {
    return this.formatHumanDesignOutput(results as any, input);
  }

  protected generateRecommendations(results: Record<string, unknown>, input: HumanDesignInput): string[] {
    return this.generateHDRecommendations(results as any);
  }

  protected generateRealityPatches(results: Record<string, unknown>, input: HumanDesignInput): string[] {
    return this.generateHDRealityPatches(results as any);
  }

  protected identifyArchetypalThemes(results: Record<string, unknown>, input: HumanDesignInput): string[] {
    return this.extractArchetypalThemes(results as any);
  }

  protected calculateConfidence(results: Record<string, unknown>, input: HumanDesignInput): number {
    return 0.95; // High confidence for astronomical calculations
  }
}
/**
 * Numerology Engine for WitnessOS
 * 
 * TypeScript implementation of the numerology engine
 * Extracted from Python implementation with core business logic preserved
 */

import { BaseEngine } from './core/base-engine';
import type { CalculationResult } from './core/types';
import { isEngineInput } from './core/types';
import { NumerologyCalculator } from './calculators/numerology-calculator';
import type { NumerologyInput, NumerologyOutput } from '@/types/engines';

export class NumerologyEngine extends BaseEngine<NumerologyInput, NumerologyOutput> {
  private pythagoreanCalculator: NumerologyCalculator;
  private chaldeanCalculator: NumerologyCalculator;
  private lifePathMeanings: Record<number, string> = {};
  private personalYearMeanings: Record<number, string> = {};
  private masterMeanings: Record<number, string> = {};

  constructor(config = {}) {
    super('numerology', 'Soul-number matrix extraction and vibrational signature analysis through sacred numerology', config);
    
    this.pythagoreanCalculator = new NumerologyCalculator('pythagorean');
    this.chaldeanCalculator = new NumerologyCalculator('chaldean');
    
    this.loadInterpretations();
  }

  async calculate(input: NumerologyInput): Promise<CalculationResult<NumerologyOutput>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: this.createError('INVALID_INPUT', 'Invalid numerology input data'),
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }
      
      // Perform calculation
      const calculationResults = await this.performCalculation(input);
      
      // Generate interpretation and other outputs
      const interpretation = this.generateInterpretation(calculationResults, input);
      const recommendations = this.generateRecommendations(calculationResults, input);
      const realityPatches = this.generateRealityPatches(calculationResults, input);
      const archetypalThemes = this.identifyArchetypalThemes(calculationResults, input);
      const confidenceScore = this.calculateConfidence(calculationResults, input);

      // Build output with proper type assertions
      const coreNumbers = calculationResults.coreNumbers as Record<string, number>;
      const bridgeNumbers = calculationResults.bridgeNumbers as Record<string, number>;
      
      const output: NumerologyOutput = {
        engineName: this.engineName,
        calculationTime: Date.now() - startTime,
        confidenceScore,
        formattedOutput: interpretation,
        recommendations,
        realityPatches,
        archetypalThemes,
        timestamp: new Date().toISOString(),
        rawData: calculationResults,
        
        // Numerology specific fields with null checks
        lifePath: coreNumbers.lifePath || 0,
        expression: coreNumbers.expression || 0,
        soulUrge: coreNumbers.soulUrge || 0,
        personality: coreNumbers.personality || 0,
        maturity: coreNumbers.maturity || 0,
        personalYear: (calculationResults.personalYear as number) || new Date().getFullYear(),
        lifeExpressionBridge: bridgeNumbers.lifeExpressionBridge || 0,
        soulPersonalityBridge: bridgeNumbers.soulPersonalityBridge || 0,
        masterNumbers: calculationResults.masterNumbers as number[] || [],
        karmicDebt: calculationResults.karmicDebt as number[] || [],
        numerologySystem: input.system,
        calculationYear: input.currentYear || new Date().getFullYear(),
        nameBreakdown: calculationResults.nameBreakdown as Record<string, unknown> || {},
        coreMeanings: this.getCoreMeanings(calculationResults),
        yearlyGuidance: this.getYearlyGuidance((calculationResults.personalYear as number) || new Date().getFullYear()),
        lifePurpose: this.getLifePurpose(coreNumbers.lifePath || 0),
        compatibilityNotes: this.getCompatibilityNotes(calculationResults),
        favorablePeriods: this.getFavorablePeriods(calculationResults),
        challengePeriods: this.getChallengePeriods(calculationResults)
      };

      return {
        success: true,
        data: output,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.log('error', 'Numerology calculation failed', error);
      return {
        success: false,
        error: this.createError('CALCULATION_ERROR', `Numerology calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`),
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  protected validateInput(input: NumerologyInput): boolean {
    return isEngineInput<NumerologyInput>(input, ['fullName', 'birthDate']);
  }

  protected async performCalculation(input: NumerologyInput): Promise<Record<string, unknown>> {
    const calculator = input.system === 'chaldean' ? this.chaldeanCalculator : this.pythagoreanCalculator;
    
    const result = calculator.calculateCompleteProfile(
      input.fullName,
      input.birthDate,
      input.currentYear
    );
    
    // Convert to Record<string, unknown> for base engine compatibility
    return result as Record<string, unknown>;
  }

  protected generateInterpretation(results: Record<string, unknown>, _input: NumerologyInput): string {
    const core = results.coreNumbers as Record<string, number>;
    const lifePath = core.lifePath || 0;
    const expression = core.expression || 0;
    const soulUrge = core.soulUrge || 0;
    const personality = core.personality || 0;
    const personalYear = results.personalYear as number || new Date().getFullYear();

    return `🔢 NUMEROLOGY FIELD EXTRACTION - ${_input.fullName.toUpperCase()} 🔢

═══ SOUL-NUMBER MATRIX ═══

Life Path ${lifePath}: ${this.lifePathMeanings[lifePath] || "Unique vibrational signature"}

Your soul chose this incarnation to master the archetypal frequency of ${lifePath}. This is not your personality—this is your soul's curriculum for conscious evolution.

Expression ${expression}: Your outer manifestation carries the vibrational signature of ${expression}, indicating how your soul-essence translates into worldly expression.

Soul Urge ${soulUrge}: Your inner compass resonates at frequency ${soulUrge}, revealing what truly motivates your deepest self.

Personality ${personality}: Others perceive your field signature as ${personality}, the energetic mask through which you interface with consensus reality.

═══ CURRENT FIELD STATE ═══

Personal Year ${personalYear}: ${this.personalYearMeanings[personalYear] || "Unique temporal frequency"}

This year's vibrational theme optimizes your field for ${this.personalYearMeanings[personalYear] || "unique experiences"}.

═══ ARCHETYPAL RESONANCE ═══

${this.getArchetypalAnalysis(core, results)}

═══ FIELD OPTIMIZATION NOTES ═══

${this.getOptimizationGuidance(core, personalYear, results)}

Remember: These are not predictions—they are pattern recognitions for conscious navigation of your reality field.`.trim();
  }

  protected generateRecommendations(results: Record<string, unknown>, _input: NumerologyInput): string[] {
    const core = results.coreNumbers as Record<string, number>;
    const personalYear = results.personalYear as number || new Date().getFullYear();
    const recommendations: string[] = [];

    // Life Path specific recommendations
    const lifePath = core.lifePath || 0;
    if (lifePath === 1) {
      recommendations.push("Practice leadership in small situations to build confidence");
    } else if (lifePath === 7) {
      recommendations.push("Dedicate time daily to meditation or contemplative practice");
    } else if (lifePath === 8) {
      recommendations.push("Set clear financial and career goals for this incarnation");
    }

    // Personal Year recommendations
    if (personalYear === 1) {
      recommendations.push("Start that project you've been contemplating");
    } else if (personalYear === 5) {
      recommendations.push("Embrace change and new experiences this year");
    } else if (personalYear === 9) {
      recommendations.push("Complete unfinished projects and release old patterns");
    }

    // Master number recommendations
    if ((results.masterNumbers as number[] || []).includes(11)) {
      recommendations.push("Keep a dream journal to track intuitive messages");
    }

    // General recommendations
    recommendations.push(
      `Meditate on your Life Path number ${lifePath} during morning breathwork`,
      "Notice how your name affects others' responses to your energy field",
      "Experiment with different name variations in different contexts"
    );

    return recommendations;
  }

  protected generateRealityPatches(results: Record<string, unknown>, _input: NumerologyInput): string[] {
    const patches = [
      "Install: Numerological field coherence protocol",
      "Activate: Soul-number resonance matrix",
      "Enable: Archetypal frequency alignment",
      "Deploy: Reality field optimization suite"
    ];

    const core = results.coreNumbers as Record<string, number>;
    const lifePath = core.lifePath || 0;

    // Add life path specific patches
    if (lifePath === 1) {
      patches.push("Load: Leadership archetype activation");
    } else if (lifePath === 7) {
      patches.push("Load: Mystical perception enhancement");
    } else if (lifePath === 9) {
      patches.push("Load: Universal compassion expansion");
    }

    return patches;
  }

  protected identifyArchetypalThemes(results: Record<string, unknown>, _input: NumerologyInput): string[] {
    const themes: string[] = [];
    const core = results.coreNumbers as Record<string, number>;
    
    // Life Path themes
    const lifePath = core.lifePath || 0;
    if (lifePath === 1) {
      themes.push("The Pioneer", "The Leader", "The Individualist");
    } else if (lifePath === 2) {
      themes.push("The Mediator", "The Diplomat", "The Harmonizer");
    } else if (lifePath === 3) {
      themes.push("The Communicator", "The Artist", "The Joy-Bringer");
    } else if (lifePath === 4) {
      themes.push("The Builder", "The Organizer", "The Stabilizer");
    } else if (lifePath === 5) {
      themes.push("The Adventurer", "The Freedom-Seeker", "The Explorer");
    } else if (lifePath === 6) {
      themes.push("The Nurturer", "The Caregiver", "The Harmonizer");
    } else if (lifePath === 7) {
      themes.push("The Mystic", "The Seeker", "The Analyst");
    } else if (lifePath === 8) {
      themes.push("The Achiever", "The Executive", "The Power-Broker");
    } else if (lifePath === 9) {
      themes.push("The Humanitarian", "The Universalist", "The Completion");
    }

    // Master number themes
    if ((results.masterNumbers as number[] || []).includes(11)) {
      themes.push("The Intuitive", "The Visionary", "The Spiritual Messenger");
    }
    if ((results.masterNumbers as number[] || []).includes(22)) {
      themes.push("The Master Builder", "The Manifestor", "The Practical Visionary");
    }

    return themes;
  }

  protected calculateConfidence(results: Record<string, unknown>, _input: NumerologyInput): number {
    let confidence = 0.85; // Base confidence

    // Increase confidence based on data quality
    const core = results.coreNumbers as Record<string, number>;
    if (core.lifePath && core.expression && core.soulUrge && core.personality) {
      confidence += 0.1;
    }

    if (results.personalYear) {
      confidence += 0.05;
    }

    // Decrease confidence for edge cases
    if ((results.masterNumbers as number[] || []).length > 0) {
      confidence -= 0.05; // Master numbers are complex
    }

    return Math.min(confidence, 0.95);
  }

  private loadInterpretations(): void {
    // Life Path meanings
    this.lifePathMeanings = {
      1: "Leadership and independence - pioneering new paths",
      2: "Cooperation and balance - building bridges between people",
      3: "Creativity and self-expression - bringing joy and inspiration",
      4: "Stability and organization - building solid foundations",
      5: "Freedom and adventure - embracing change and new experiences",
      6: "Nurturing and responsibility - caring for others and community",
      7: "Spirituality and analysis - seeking deeper understanding",
      8: "Achievement and power - manifesting material success",
      9: "Humanitarianism and completion - serving the greater good"
    };

    // Personal Year meanings
    this.personalYearMeanings = {
      1: "New beginnings and fresh starts",
      2: "Partnerships and cooperation",
      3: "Creativity and self-expression",
      4: "Building foundations and stability",
      5: "Change and adventure",
      6: "Family and responsibility",
      7: "Spiritual growth and introspection",
      8: "Achievement and material success",
      9: "Completion and letting go"
    };

    // Master number meanings
    this.masterMeanings = {
      11: "Intuitive illumination and spiritual insight",
      22: "Master building and practical manifestation",
      33: "Master teacher and spiritual service"
    };
  }

  private getArchetypalAnalysis(coreNumbers: Record<string, number>, fullResults: Record<string, unknown>): string {
    const lifePath = coreNumbers.lifePath || 0;
    const expression = coreNumbers.expression || 0;
    const soulUrge = coreNumbers.soulUrge || 0;
    
    let analysis = `Your archetypal field resonates with:\n`;
    
    // Life Path archetype
    analysis += `• Life Path ${lifePath}: ${this.lifePathMeanings[lifePath] || "Unique soul curriculum"}\n`;
    
    // Expression archetype
    analysis += `• Expression ${expression}: How you manifest in the world\n`;
    
    // Soul Urge archetype
    analysis += `• Soul Urge ${soulUrge}: Your deepest motivations and desires\n`;
    
    // Master number analysis
    const masterNumbers = fullResults.masterNumbers as number[] || [];
    if (masterNumbers.length > 0) {
      analysis += `• Master Numbers: ${masterNumbers.map(n => `${n} (${this.masterMeanings[n] || "Enhanced spiritual frequency"})`).join(', ')}\n`;
    }
    
    return analysis;
  }

  private getOptimizationGuidance(coreNumbers: Record<string, number>, personalYear: number, fullResults: Record<string, unknown>): string {
    const lifePath = coreNumbers.lifePath || 0;
    
    let guidance = `Field optimization recommendations:\n`;
    
    // Life Path specific guidance
    if (lifePath === 1) {
      guidance += `• Embrace your natural leadership abilities\n`;
      guidance += `• Take initiative in areas that matter to you\n`;
    } else if (lifePath === 7) {
      guidance += `• Dedicate time to meditation and spiritual practice\n`;
      guidance += `• Trust your intuitive insights\n`;
    }
    
    // Personal Year guidance
    guidance += `• This Personal Year ${personalYear} calls for: ${this.personalYearMeanings[personalYear] || "unique focus"}\n`;
    
    // Master number guidance
    const masterNumbers = fullResults.masterNumbers as number[] || [];
    if (masterNumbers.includes(11)) {
      guidance += `• Pay attention to your dreams and intuitive messages\n`;
      guidance += `• Your spiritual insights are amplified this year\n`;
    }
    
    return guidance;
  }

  private getCoreMeanings(results: Record<string, unknown>): Record<string, string> {
    const core = results.coreNumbers as Record<string, number>;
    return {
      lifePath: this.lifePathMeanings[core.lifePath || 0] || "Unique soul curriculum",
      expression: "Your outer manifestation signature",
      soulUrge: "Your deepest inner motivations",
      personality: "How others perceive your energy field"
    };
  }

  private getYearlyGuidance(personalYear: number): string {
    return this.personalYearMeanings[personalYear] || "Unique temporal frequency for this year";
  }

  private getLifePurpose(lifePath: number): string {
    return this.lifePathMeanings[lifePath] || "Your unique soul mission";
  }

  private getCompatibilityNotes(results: Record<string, unknown>): string[] {
    const core = results.coreNumbers as Record<string, number>;
    const lifePath = core.lifePath || 0;
    
    const notes = [
      "Your energy field naturally harmonizes with complementary frequencies",
      "Pay attention to how others respond to your vibrational signature"
    ];
    
    if (lifePath === 2 || lifePath === 6) {
      notes.push("You have natural diplomatic and nurturing abilities");
    } else if (lifePath === 1 || lifePath === 8) {
      notes.push("Your leadership energy can inspire others to action");
    }
    
    return notes;
  }

  private getFavorablePeriods(results: Record<string, unknown>): string[] {
    const personalYear = results.personalYear as number || new Date().getFullYear();
    
    const periods = [
      "Morning hours for spiritual practice",
      "Full moon phases for manifestation work",
      "Your birthday month for new beginnings"
    ];
    
    if (personalYear === 1) {
      periods.push("The entire year is favorable for starting new projects");
    } else if (personalYear === 5) {
      periods.push("Travel and adventure periods are especially beneficial");
    }
    
    return periods;
  }

  private getChallengePeriods(results: Record<string, unknown>): string[] {
    const personalYear = results.personalYear as number || new Date().getFullYear();
    
    const challenges = [
      "Mercury retrograde periods may require extra patience",
      "Eclipse seasons can amplify emotional processing"
    ];
    
    if (personalYear === 9) {
      challenges.push("This year may bring completion of old cycles");
    }
    
    return challenges;
  }

  protected getSupportedSystems(): string[] {
    return ['pythagorean', 'chaldean'];
  }

  protected getInputSchema(): Record<string, unknown> {
    return {
      fullName: { type: 'string', required: true, description: 'Full name for numerology calculation' },
      birthDate: { type: 'string', required: true, description: 'Birth date in YYYY-MM-DD format' },
      system: { type: 'string', required: false, default: 'pythagorean', enum: ['pythagorean', 'chaldean'] },
      currentYear: { type: 'number', required: false, description: 'Current year for personal year calculation' }
    };
  }

  protected getOutputSchema(): Record<string, unknown> {
    return {
      lifePath: { type: 'number', description: 'Life Path number (1-9 or master numbers)' },
      expression: { type: 'number', description: 'Expression number' },
      soulUrge: { type: 'number', description: 'Soul Urge number' },
      personality: { type: 'number', description: 'Personality number' },
      personalYear: { type: 'number', description: 'Current personal year' },
      masterNumbers: { type: 'array', description: 'Master numbers in the chart' },
      recommendations: { type: 'array', description: 'Personalized recommendations' },
      realityPatches: { type: 'array', description: 'Reality optimization suggestions' }
    };
  }
} 
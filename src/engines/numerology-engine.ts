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
import { NumerologyCalculator } from './calculators/numerology-calculator';
import type { NumerologyInput, NumerologyOutput } from '@/types/engines';
import { AIInterpretationWrapper } from './ai-interpretation-wrapper';

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
    try {
      // Validate input
      if (!input.birth_date || !input.full_name) {
        throw new Error('Birth date and full name are required');
      }

      // Parse birth date
      const birthDate = new Date(input.birth_date);
      const currentYear = new Date().getFullYear();

      // Calculate complete numerology profile using existing calculator
      const calculator = new NumerologyCalculator('pythagorean');
      const profile = calculator.calculateCompleteProfile(input.full_name, input.birth_date, currentYear);

      // Extract core numbers
      const lifePathNumber = profile.coreNumbers.lifePath;
      const expressionNumber = profile.coreNumbers.expression;
      const soulUrgeNumber = profile.coreNumbers.soulUrge;
      const personalityNumber = profile.coreNumbers.personality;
      const maturityNumber = profile.coreNumbers.maturity;
      const personalYearNumber = profile.personalYear;

      // Extract bridge numbers
      const bridgeNumbers = {
        life_path_expression: profile.bridgeNumbers.lifeExpressionBridge,
        soul_urge_personality: profile.bridgeNumbers.soulPersonalityBridge,
        life_path_soul_urge: Math.abs(lifePathNumber - soulUrgeNumber),
        expression_personality: Math.abs(expressionNumber - personalityNumber)
      };

      // Extract master numbers and karmic debt
      const masterNumbers = profile.masterNumbers;
      const karmicDebtNumbers = profile.karmicDebt;

      // Generate interpretations
      const interpretations = this.generateInterpretations({
        lifePathNumber,
        expressionNumber,
        soulUrgeNumber,
        personalityNumber,
        maturityNumber,
        personalYearNumber,
        masterNumbers,
        karmicDebtNumbers
      });

      const result: NumerologyOutput = {
        life_path_number: lifePathNumber,
        expression_number: expressionNumber,
        soul_urge_number: soulUrgeNumber,
        personality_number: personalityNumber,
        maturity_number: maturityNumber,
        personal_year_number: personalYearNumber,
        bridge_numbers: bridgeNumbers,
        master_numbers: masterNumbers,
        karmic_debt_numbers: karmicDebtNumbers,
        interpretations,
        system_used: 'pythagorean',
        calculation_date: new Date().toISOString(),
        birth_date: input.birth_date,
        full_name: input.full_name
      };

      return {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        processingTime: 0
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        processingTime: 0
      };
    }
  }

  private validateInput(input: NumerologyInput): boolean {
    return !!(input.birth_date && input.full_name && input.birth_location);
  }

  private generateInterpretations(numbers: any): Record<string, string> {
    return {
      life_path: this.getLifePathInterpretation(numbers.lifePathNumber),
      expression: this.getExpressionInterpretation(numbers.expressionNumber),
      soul_urge: this.getSoulUrgeInterpretation(numbers.soulUrgeNumber),
      personality: this.getPersonalityInterpretation(numbers.personalityNumber),
      maturity: this.getMaturityInterpretation(numbers.maturityNumber),
      personal_year: this.getPersonalYearInterpretation(numbers.personalYearNumber)
    };
  }

  private getLifePathInterpretation(number: number): string {
    const interpretations: Record<number, string> = {
      1: "Natural leader with pioneering spirit and independence. You're here to initiate and create new paths.",
      2: "Cooperative peacemaker with diplomatic skills. You're here to bring harmony and support others.",
      3: "Creative communicator with artistic talents. You're here to inspire and express joy.",
      4: "Practical builder with strong work ethic. You're here to create stability and lasting foundations.",
      5: "Freedom-loving adventurer with versatile nature. You're here to experience and share diversity.",
      6: "Nurturing caretaker with healing abilities. You're here to serve and create harmony in relationships.",
      7: "Spiritual seeker with analytical mind. You're here to seek truth and develop inner wisdom.",
      8: "Material master with business acumen. You're here to achieve success and manage resources.",
      9: "Humanitarian teacher with universal love. You're here to serve humanity and complete cycles.",
      11: "Intuitive visionary with spiritual insights. You're here to inspire and illuminate others.",
      22: "Master builder with practical idealism. You're here to manifest dreams into reality.",
      33: "Master teacher with healing compassion. You're here to uplift humanity through service."
    };
    return interpretations[number] || `Life path ${number} represents a unique spiritual journey.`;
  }

  private getExpressionInterpretation(number: number): string {
    const interpretations: Record<number, string> = {
      1: "Express your leadership and originality. Your talents lie in pioneering and innovation.",
      2: "Express your cooperation and sensitivity. Your talents lie in diplomacy and partnership.",
      3: "Express your creativity and communication. Your talents lie in artistic and social endeavors.",
      4: "Express your practicality and organization. Your talents lie in building and systematic work.",
      5: "Express your freedom and versatility. Your talents lie in adventure and progressive thinking.",
      6: "Express your nurturing and responsibility. Your talents lie in healing and family matters.",
      7: "Express your wisdom and analysis. Your talents lie in research and spiritual pursuits.",
      8: "Express your ambition and material mastery. Your talents lie in business and achievement.",
      9: "Express your compassion and universal service. Your talents lie in humanitarian work.",
      11: "Express your intuition and inspiration. Your talents lie in spiritual leadership.",
      22: "Express your master building abilities. Your talents lie in large-scale manifestation.",
      33: "Express your master teaching gifts. Your talents lie in healing and uplifting others."
    };
    return interpretations[number] || `Expression ${number} represents unique talents and abilities.`;
  }

  private getSoulUrgeInterpretation(number: number): string {
    const interpretations: Record<number, string> = {
      1: "Your soul desires independence and leadership. You're motivated by the need to be first and original.",
      2: "Your soul desires harmony and cooperation. You're motivated by the need for peace and partnership.",
      3: "Your soul desires creative expression and joy. You're motivated by the need to communicate and inspire.",
      4: "Your soul desires security and order. You're motivated by the need to build and organize.",
      5: "Your soul desires freedom and adventure. You're motivated by the need for variety and experience.",
      6: "Your soul desires love and service. You're motivated by the need to nurture and heal.",
      7: "Your soul desires wisdom and understanding. You're motivated by the need for truth and spirituality.",
      8: "Your soul desires success and recognition. You're motivated by the need for achievement and power.",
      9: "Your soul desires universal love and service. You're motivated by the need to help humanity.",
      11: "Your soul desires spiritual illumination. You're motivated by the need to inspire and enlighten.",
      22: "Your soul desires to build something lasting. You're motivated by the need to manifest ideals.",
      33: "Your soul desires to heal and teach. You're motivated by the need to serve and uplift."
    };
    return interpretations[number] || `Soul urge ${number} represents deep inner motivations.`;
  }

  private getPersonalityInterpretation(number: number): string {
    const interpretations: Record<number, string> = {
      1: "Others see you as confident, independent, and pioneering. You project leadership and originality.",
      2: "Others see you as gentle, cooperative, and diplomatic. You project harmony and sensitivity.",
      3: "Others see you as creative, charming, and expressive. You project joy and artistic flair.",
      4: "Others see you as reliable, practical, and organized. You project stability and trustworthiness.",
      5: "Others see you as dynamic, adventurous, and progressive. You project freedom and versatility.",
      6: "Others see you as caring, responsible, and nurturing. You project warmth and healing energy.",
      7: "Others see you as mysterious, wise, and analytical. You project depth and spiritual insight.",
      8: "Others see you as successful, ambitious, and authoritative. You project power and material mastery.",
      9: "Others see you as compassionate, generous, and humanitarian. You project universal love.",
      11: "Others see you as intuitive, inspiring, and spiritually aware. You project higher consciousness.",
      22: "Others see you as capable, visionary, and practical idealist. You project master builder energy.",
      33: "Others see you as healing, teaching, and compassionate. You project master teacher presence."
    };
    return interpretations[number] || `Personality ${number} represents how others perceive you.`;
  }

  private getMaturityInterpretation(number: number): string {
    return `Your maturity number ${number} represents the synthesis of your life path and expression, showing how you'll integrate your life lessons and talents as you mature.`;
  }

  private getPersonalYearInterpretation(number: number): string {
    const interpretations: Record<number, string> = {
      1: "A year of new beginnings, leadership, and independence. Time to start fresh and take initiative.",
      2: "A year of cooperation, patience, and relationships. Time to work with others and develop partnerships.",
      3: "A year of creativity, communication, and self-expression. Time to share your talents and enjoy life.",
      4: "A year of hard work, organization, and building foundations. Time to focus on practical matters.",
      5: "A year of freedom, change, and adventure. Time to explore new opportunities and expand horizons.",
      6: "A year of responsibility, family, and service. Time to focus on home, relationships, and healing.",
      7: "A year of introspection, study, and spiritual growth. Time to seek wisdom and inner development.",
      8: "A year of achievement, recognition, and material success. Time to focus on career and finances.",
      9: "A year of completion, humanitarian service, and letting go. Time to finish projects and serve others."
    };
    return interpretations[number] || `Personal year ${number} brings unique opportunities and challenges.`;
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
    return result as Record<string, unknown>;
  }

  protected generateInterpretation(results: Record<string, unknown>, _input: NumerologyInput): string {
    // Placeholder original interpretation logic
    return "Original interpretation text";
  }

  async _interpret(results: Record<string, unknown>, _input: NumerologyInput): Promise<string> {
    const baseInterpretation = this.generateInterpretation(results, _input);
    const enhanced = await AIInterpretationWrapper.enhanceInterpretation(baseInterpretation, this.engineName);
    return enhanced;
  }

  protected generateRecommendations(results: Record<string, unknown>, _input: NumerologyInput): string[] {
    // Placeholder recommendations
    return [];
  }

  protected generateRealityPatches(results: Record<string, unknown>, _input: NumerologyInput): string[] {
    // Placeholder reality patches
    return [];
  }

  protected identifyArchetypalThemes(results: Record<string, unknown>, _input: NumerologyInput): string[] {
    // Placeholder archetypal themes
    return [];
  }

  protected calculateConfidence(results: Record<string, unknown>, _input: NumerologyInput): number {
    // Placeholder confidence calculation
    return 1.0;
  }

  private loadInterpretations(): void {
    // Placeholder method to load meanings etc.
    this.lifePathMeanings = {};
    this.personalYearMeanings = {};
    this.masterMeanings = {};
  }
}
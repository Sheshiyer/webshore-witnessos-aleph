/**
 * I-Ching Mutation Oracle Engine for WitnessOS
 * 
 * Provides I-Ching hexagram readings using traditional divination methods.
 * Supports coin toss, yarrow stalk, and random generation with changing lines.
 * 
 * Ported from Python reference implementation
 */

import { BaseEngineInput, BaseEngineOutput, QuestionInput, CalculationResult } from './core/types';

// I-Ching specific types
export interface IChingInput extends QuestionInput {
  method?: 'coins' | 'yarrow' | 'random' | undefined;
  focusArea?: string | undefined;
  includeChangingLines?: boolean;
  [key: string]: unknown; // Add index signature to satisfy BaseEngineInput constraint
}

export interface Trigram {
  name: string;
  chinese: string;
  binary: string;
  element: string;
  attribute: string;
  family: string;
  direction: string;
  season: string;
  meaning: string;
}

export interface Hexagram {
  number: number;
  name: string;
  chinese: string;
  trigrams: [string, string];
  binary: string;
  keywords: string[];
  judgment: string;
  image: string;
  meaning: string;
  divination: string;
  changingLines: Record<string, string>;
}

export interface HexagramLine {
  position: number; // 1-6, bottom to top
  value: number; // 6, 7, 8, or 9
  type: 'yin' | 'yang';
  changing: boolean;
  interpretation?: string;
}

export interface IChingReading {
  primaryHexagram: Hexagram;
  primaryLines: HexagramLine[];
  mutationHexagram?: Hexagram | undefined;
  mutationLines?: HexagramLine[] | undefined;
  changingLines: number[];
  methodUsed: string;
}

export interface IChingOutput extends BaseEngineOutput {
  reading: IChingReading;
  interpretation: string;
  changingLineInterpretations?: string[] | undefined;
  [key: string]: unknown; // Add index signature to satisfy BaseEngineOutput constraint
}

// Hexagram data - core set for implementation
const HEXAGRAM_DATA: Record<number, Hexagram> = {
  1: {
    number: 1,
    name: "The Creative",
    chinese: "乾 (Qián)",
    trigrams: ["Heaven", "Heaven"],
    binary: "111111",
    keywords: ["creativity", "strength", "leadership", "initiative"],
    judgment: "The Creative works sublime success, furthering through perseverance.",
    image: "The movement of heaven is full of power. Thus the superior man makes himself strong and untiring.",
    meaning: "Pure creative energy, the power of the heavens, leadership and initiative. This hexagram represents the masculine principle, strength, and the ability to create and lead.",
    divination: "Great success is possible through persistent effort. Take the lead and act with confidence.",
    changingLines: {
      "1": "Hidden dragon. Do not act.",
      "2": "Dragon appearing in the field. It furthers one to see the great man.",
      "3": "All day long the superior man is creatively active. At nightfall his mind is still beset with cares. Danger. No blame.",
      "4": "Wavering flight over the depths. No blame.",
      "5": "Flying dragon in the heavens. It furthers one to see the great man.",
      "6": "Arrogant dragon will have cause to repent."
    }
  },
  2: {
    number: 2,
    name: "The Receptive",
    chinese: "坤 (Kūn)",
    trigrams: ["Earth", "Earth"],
    binary: "000000",
    keywords: ["receptivity", "yielding", "nurturing", "devotion"],
    judgment: "The Receptive brings about sublime success, furthering through the perseverance of a mare.",
    image: "The earth's condition is receptive devotion. Thus the superior man who has breadth of character carries the outer world.",
    meaning: "Pure receptive energy, the power of the earth, yielding and nurturing. This hexagram represents the feminine principle, devotion, and the ability to support and nurture.",
    divination: "Success comes through receptivity and cooperation. Support others and allow things to unfold naturally.",
    changingLines: {
      "1": "When there is hoarfrost underfoot, solid ice is not far off.",
      "2": "Straight, square, great. Without purpose, yet nothing remains unfurthered.",
      "3": "Hidden lines. One is able to remain persevering. If by chance you are in the service of a king, seek not works but bring to completion.",
      "4": "A tied-up sack. No blame, no praise.",
      "5": "A yellow lower garment brings supreme good fortune.",
      "6": "Dragons fight in the meadow. Their blood is black and yellow."
    }
  },
  3: {
    number: 3,
    name: "Difficulty at the Beginning",
    chinese: "屯 (Zhūn)",
    trigrams: ["Water", "Thunder"],
    binary: "010001",
    keywords: ["difficulty", "birth", "struggle", "perseverance"],
    judgment: "Difficulty at the Beginning works sublime success, furthering through perseverance.",
    image: "Clouds and thunder: the image of Difficulty at the Beginning. Thus the superior man brings order out of confusion.",
    meaning: "Initial difficulties that must be overcome. Like birth pangs, these struggles are necessary for new growth and development.",
    divination: "Persist through initial difficulties. What seems chaotic now will lead to order and success.",
    changingLines: {
      "1": "Hesitation and hindrance. It furthers one to remain persevering. It furthers one to appoint helpers.",
      "2": "Difficulties pile up. Horse and wagon part. He is not a robber; he wants to woo when the time comes.",
      "3": "Whoever hunts deer without the forester only loses his way in the forest.",
      "4": "Horse and wagon part. Strive for union. To go brings good fortune. Everything acts to further.",
      "5": "Difficulties in blessing. A little perseverance brings good fortune. Great perseverance brings misfortune.",
      "6": "Horse and wagon part. Bloody tears flow."
    }
  }
};

// Trigram definitions
const TRIGRAM_DATA: Record<string, Trigram> = {
  "Heaven": {
    name: "Heaven",
    chinese: "乾 (Qián)",
    binary: "111",
    element: "Metal",
    attribute: "Strong",
    family: "Father",
    direction: "Northwest",
    season: "Late Autumn",
    meaning: "Creative force, leadership, strength"
  },
  "Earth": {
    name: "Earth",
    chinese: "坤 (Kūn)",
    binary: "000",
    element: "Earth",
    attribute: "Yielding",
    family: "Mother",
    direction: "Southwest",
    season: "Late Summer",
    meaning: "Receptive force, nurturing, support"
  },
  "Thunder": {
    name: "Thunder",
    chinese: "震 (Zhèn)",
    binary: "001",
    element: "Wood",
    attribute: "Arousing",
    family: "First Son",
    direction: "East",
    season: "Spring",
    meaning: "Movement, awakening, shock"
  },
  "Water": {
    name: "Water",
    chinese: "坎 (Kǎn)",
    binary: "010",
    element: "Water",
    attribute: "Dangerous",
    family: "Second Son",
    direction: "North",
    season: "Winter",
    meaning: "Danger, depth, flowing"
  }
};

/**
 * I-Ching Mutation Oracle Engine
 */
export class IChingEngine {
  public readonly engineName = "I-Ching Mutation Oracle";
  public readonly description = "Performs I-Ching hexagram readings using traditional divination methods with changing lines and mutation analysis";

  /**
   * Calculate I-Ching reading
   */
  async calculate(input: IChingInput): Promise<CalculationResult<IChingOutput>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      const validatedInput = this.validateInput(input);
      
      // Generate hexagram lines using specified method
      const lineValues = this.generateHexagramLines(
        validatedInput.method || 'coins',
        validatedInput.question || ''
      );
      
      // Create primary hexagram
      const primaryNumber = this.linesToHexagramNumber(lineValues);
      const primaryHexagram = this.getHexagramByNumber(primaryNumber);
      const primaryLines = this.createHexagramLines(lineValues);
      
      // Identify changing lines
      const changingLines = lineValues
        .map((value, index) => value === 6 || value === 9 ? index + 1 : -1)
        .filter(pos => pos !== -1);
      
      // Create mutation hexagram if there are changing lines
      let mutationHexagram: Hexagram | undefined;
      let mutationLines: HexagramLine[] | undefined;
      
             if (changingLines.length > 0) {
         const mutationLineValues = this.createMutationHexagram(lineValues);
         const mutationNumber = this.linesToHexagramNumber(mutationLineValues);
         mutationHexagram = this.getHexagramByNumber(mutationNumber);
         mutationLines = this.createHexagramLines(mutationLineValues);
       } else {
         mutationHexagram = undefined;
         mutationLines = undefined;
       }
      
      // Create reading
      const reading: IChingReading = {
        primaryHexagram,
        primaryLines,
        mutationHexagram,
        mutationLines,
        changingLines,
        methodUsed: validatedInput.method || 'coins'
      };
      
      // Generate interpretation
      const interpretation = this.generateInterpretation(reading, validatedInput.question || '');
      const changingLineInterpretations = changingLines.length > 0 
        ? this.interpretChangingLines(primaryHexagram, changingLines)
        : undefined;
      
      // Create output
      const output: IChingOutput = {
        engineName: this.engineName,
        calculationTime: Date.now() - startTime,
        confidenceScore: 0.9,
        formattedOutput: interpretation,
        recommendations: this.generateRecommendations(reading),
        realityPatches: this.generateRealityPatches(reading),
        archetypalThemes: this.generateArchetypalThemes(reading),
        timestamp: new Date().toISOString(),
        reading,
        interpretation,
        changingLineInterpretations,
        rawData: {
          reading,
          interpretation,
          changingLineInterpretations,
          methodUsed: validatedInput.method || 'coins'
        }
      };
      
      return {
        success: true,
        data: output,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'ICHING_CALCULATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error in I-Ching calculation',
          context: { input },
          suggestions: [
            'Verify your question is clearly stated',
            'Try a different divination method',
            'Ensure proper focus and intention'
          ],
          timestamp: new Date().toISOString()
        },
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  private validateInput(input: IChingInput): IChingInput {
    const validMethods: Array<'coins' | 'yarrow' | 'random'> = ['coins', 'yarrow', 'random'];
    
    return {
      question: input.question || '',
      method: (validMethods.includes(input.method as any) ? input.method : 'coins') as 'coins' | 'yarrow' | 'random',
      focusArea: input.focusArea,
      includeChangingLines: input.includeChangingLines !== false
    };
  }

  private generateHexagramLines(method: string, question: string): number[] {
    const lines: number[] = [];
    
    // Create deterministic seed from question for reproducible results
    let seed = 12345;
    if (question) {
      for (let i = 0; i < question.length; i++) {
        seed = (seed * 31 + question.charCodeAt(i)) % 2147483647;
      }
    }
    
    // Generate 6 lines using the specified method
    for (let i = 0; i < 6; i++) {
      seed = (seed * 16807) % 2147483647;
      
      switch (method) {
        case 'coins':
          lines.push(this.generateCoinLine(seed));
          break;
        case 'yarrow':
          lines.push(this.generateYarrowLine(seed));
          break;
        default:
          lines.push(this.generateRandomLine(seed));
          break;
      }
    }
    
    return lines;
  }

  private generateCoinLine(seed: number): number {
    // Three coin tosses: Heads = 3, Tails = 2
    // 6 = Old Yin (3 tails), 7 = Young Yang (2 tails, 1 head)
    // 8 = Young Yin (1 tail, 2 heads), 9 = Old Yang (3 heads)
    const tosses = [
      (seed % 2) + 2,
      ((seed >> 1) % 2) + 2,
      ((seed >> 2) % 2) + 2
    ];
    
    return tosses.reduce((sum, toss) => sum + toss, 0);
  }

  private generateYarrowLine(seed: number): number {
    // Simplified yarrow stalk method approximation
    const probability = (seed % 100) / 100;
    
    if (probability < 0.0625) return 6; // Old Yin (1/16)
    if (probability < 0.1875) return 9; // Old Yang (3/16)
    if (probability < 0.5625) return 7; // Young Yang (6/16)
    return 8; // Young Yin (6/16)
  }

  private generateRandomLine(seed: number): number {
    const values = [6, 7, 8, 9];
    const index = seed % 4;
    const value = values[index];
    if (value === undefined) {
      throw new Error('Invalid random line generation');
    }
    return value;
  }

  private linesToHexagramNumber(lines: number[]): number {
    // Convert line values to binary (odd = 1, even = 0)
    const binaryLines = lines.map(line => line % 2 === 1 ? 1 : 0);
    
    // Create binary string (bottom line first, so reverse for standard binary)
    const binaryString = binaryLines.reverse().join('');
    
    // Convert to decimal and map to hexagram number
    const decimalValue = parseInt(binaryString, 2);
    
    // Simple mapping - map to available hexagrams (1-3 for now)
    const mappedValue = (decimalValue % 3) + 1;
    return mappedValue;
  }

  private getHexagramByNumber(number: number): Hexagram {
    // Ensure number is within valid range of available hexagrams
    const validNumbers = Object.keys(HEXAGRAM_DATA).map(n => parseInt(n));
    if (!validNumbers.includes(number)) {
      const safeIndex = number % validNumbers.length;
      number = validNumbers[safeIndex] || 1;
    }
    
    const hexagram = HEXAGRAM_DATA[number];
    if (!hexagram) {
      // Fallback to hexagram 1 if not found
      const fallback = HEXAGRAM_DATA[1];
      if (!fallback) {
        throw new Error('Critical error: No hexagram data available');
      }
      return fallback;
    }
    
    return hexagram;
  }

  private createHexagramLines(lineValues: number[]): HexagramLine[] {
    return lineValues.map((value, index) => ({
      position: index + 1,
      value,
      type: value % 2 === 1 ? 'yang' : 'yin',
      changing: value === 6 || value === 9
    }));
  }

  private createMutationHexagram(originalLines: number[]): number[] {
    return originalLines.map(line => {
      if (line === 6) return 7; // Old Yin becomes Young Yang
      if (line === 9) return 8; // Old Yang becomes Young Yin
      return line; // No change for young lines
    });
  }

  private interpretChangingLines(hexagram: Hexagram, changingPositions: number[]): string[] {
    return changingPositions.map(position => {
      const lineText = hexagram.changingLines[position.toString()];
      return lineText 
        ? `Line ${position}: ${lineText}`
        : `Line ${position}: Transformation and change at this level`;
    });
  }

  private generateInterpretation(reading: IChingReading, question: string): string {
    let interpretation = `Primary Hexagram: ${reading.primaryHexagram.name}\n\n`;
    interpretation += `Core Meaning: ${reading.primaryHexagram.meaning}\n\n`;
    interpretation += `Judgment: ${reading.primaryHexagram.judgment}\n\n`;
    interpretation += `Image: ${reading.primaryHexagram.image}\n\n`;
    interpretation += `Divination: ${reading.primaryHexagram.divination}\n\n`;
    
    if (reading.changingLines.length > 0) {
      interpretation += `Changing Lines (positions ${reading.changingLines.join(', ')}):\n`;
      const changingInterpretations = this.interpretChangingLines(
        reading.primaryHexagram,
        reading.changingLines
      );
      for (const lineInterp of changingInterpretations) {
        interpretation += `  ${lineInterp}\n`;
      }
      interpretation += '\n';
      
      if (reading.mutationHexagram) {
        interpretation += `Mutation Hexagram: ${reading.mutationHexagram.name}\n`;
        interpretation += `Future Tendency: ${reading.mutationHexagram.divination}\n\n`;
      }
    }
    
    interpretation += `Guidance for your question about '${question}': `;
    interpretation += 'The I-Ching suggests careful consideration of the present moment ';
    interpretation += 'while remaining open to the natural flow of change.';
    
    return interpretation;
  }

  private generateRecommendations(reading: IChingReading): string[] {
    const recommendations: string[] = [];
    
    // Base recommendations from primary hexagram
    recommendations.push(`Embrace the energy of ${reading.primaryHexagram.name}`);
    recommendations.push(`Focus on ${reading.primaryHexagram.keywords.join(', ')}`);
    
    // Changing line recommendations
    if (reading.changingLines.length > 0) {
      recommendations.push('Pay special attention to areas of change and transformation');
      recommendations.push('Balance present wisdom with future possibilities');
    } else {
      recommendations.push('Maintain stability and work with current energies');
    }
    
    // Method-specific recommendations
    switch (reading.methodUsed) {
      case 'coins':
        recommendations.push('Trust in simple wisdom and direct guidance');
        break;
      case 'yarrow':
        recommendations.push('Honor traditional wisdom and deep contemplation');
        break;
      default:
        recommendations.push('Stay open to unexpected insights and synchronicities');
    }
    
    return recommendations;
  }

  private generateRealityPatches(reading: IChingReading): string[] {
    const patches: string[] = [];
    
    // Primary hexagram patches
    patches.push(`Reality resonates with ${reading.primaryHexagram.name} energy`);
    patches.push(`Quantum field aligned with ${reading.primaryHexagram.trigrams.join('-')} pattern`);
    
    // Changing line patches
    if (reading.changingLines.length > 0) {
      patches.push(`${reading.changingLines.length} transformation portal(s) active`);
      patches.push('Timeline probability flux detected');
    }
    
    return patches;
  }

  private generateArchetypalThemes(reading: IChingReading): string[] {
    const themes: string[] = [];
    
    // Extract themes from trigrams
    for (const trigram of reading.primaryHexagram.trigrams) {
      if (TRIGRAM_DATA[trigram]) {
        themes.push(`${trigram} archetype: ${TRIGRAM_DATA[trigram].meaning}`);
      }
    }
    
    // Add hexagram-specific themes
    themes.push(`Hexagram archetype: ${reading.primaryHexagram.meaning}`);
    
    // Mutation themes
    if (reading.mutationHexagram) {
      themes.push(`Transformation archetype: ${reading.mutationHexagram.name}`);
    }
    
    return themes;
  }
}

// Create and export default instance
export const ichingEngine = new IChingEngine();
export default ichingEngine; 
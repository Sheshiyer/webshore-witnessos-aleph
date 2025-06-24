/**
 * Numerology Calculator
 * 
 * Core numerology calculation logic extracted from Python implementation
 * Handles Pythagorean and Chaldean numerology systems
 */

export interface NumerologyCalculationInput {
  fullName: string;
  birthDate: string;
  currentYear?: number;
  system: 'pythagorean' | 'chaldean';
}

export interface NumerologyCalculationResult {
  coreNumbers: {
    lifePath: number;
    expression: number;
    soulUrge: number;
    personality: number;
    maturity: number;
  };
  personalYear: number;
  bridgeNumbers: {
    lifeExpressionBridge: number;
    soulPersonalityBridge: number;
  };
  masterNumbers: number[];
  karmicDebt: number[];
  nameBreakdown: Record<string, unknown>;
  [key: string]: unknown; // Add index signature for compatibility
}

export class NumerologyCalculator {
  private system: 'pythagorean' | 'chaldean';

  constructor(system: 'pythagorean' | 'chaldean' = 'pythagorean') {
    this.system = system;
  }

  /**
   * Calculate complete numerology profile
   */
  calculateCompleteProfile(
    fullName: string,
    birthDate: string,
    currentYear?: number
  ): NumerologyCalculationResult {
    const year = currentYear || new Date().getFullYear();
    const birthDateObj = new Date(birthDate);

    // Calculate core numbers
    const lifePath = this.calculateLifePath(birthDateObj);
    const expression = this.calculateExpression(fullName);
    const soulUrge = this.calculateSoulUrge(fullName);
    const personality = this.calculatePersonality(fullName);
    const maturity = this.calculateMaturity(lifePath, expression);
    const personalYear = this.calculatePersonalYear(birthDateObj, year);

    // Calculate bridge numbers
    const lifeExpressionBridge = Math.abs(lifePath - expression);
    const soulPersonalityBridge = Math.abs(soulUrge - personality);

    // Identify master numbers and karmic debt
    const masterNumbers = this.identifyMasterNumbers([lifePath, expression, soulUrge, personality]);
    const karmicDebt = this.identifyKarmicDebt(fullName);

    // Name breakdown
    const nameBreakdown = this.analyzeName(fullName);

    return {
      coreNumbers: {
        lifePath,
        expression,
        soulUrge,
        personality,
        maturity
      },
      personalYear,
      bridgeNumbers: {
        lifeExpressionBridge,
        soulPersonalityBridge
      },
      masterNumbers,
      karmicDebt,
      nameBreakdown
    };
  }

  /**
   * Calculate Life Path number from birth date
   */
  private calculateLifePath(birthDate: Date): number {
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = birthDate.getFullYear();

    const daySum = this.reduceToSingleDigit(day);
    const monthSum = this.reduceToSingleDigit(month);
    const yearSum = this.reduceToSingleDigit(year);

    const total = daySum + monthSum + yearSum;
    return this.reduceToSingleDigit(total, true); // Allow master numbers
  }

  /**
   * Calculate Expression (Destiny) number from full name
   */
  calculateExpression(fullName: string): number {
    const nameValue = this.calculateNameValue(fullName);
    return this.reduceToSingleDigit(nameValue, true);
  }

  /**
   * Calculate Soul Urge (Heart's Desire) number from vowels
   */
  calculateSoulUrge(fullName: string): number {
    const vowels = fullName.toLowerCase().match(/[aeiou]/g) || [];
    const vowelValue = vowels.reduce((sum, vowel) => {
      return sum + this.getLetterValue(vowel);
    }, 0);
    return this.reduceToSingleDigit(vowelValue, true);
  }

  /**
   * Calculate Personality number from consonants
   */
  calculatePersonality(fullName: string): number {
    const consonants = fullName.toLowerCase().match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
    const consonantValue = consonants.reduce((sum, consonant) => {
      return sum + this.getLetterValue(consonant);
    }, 0);
    return this.reduceToSingleDigit(consonantValue, true);
  }

  /**
   * Calculate Maturity number
   */
  private calculateMaturity(lifePath: number, expression: number): number {
    return this.reduceToSingleDigit(lifePath + expression, true);
  }

  /**
   * Calculate Personal Year number
   */
  private calculatePersonalYear(birthDate: Date, currentYear: number): number {
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = currentYear;

    const daySum = this.reduceToSingleDigit(day);
    const monthSum = this.reduceToSingleDigit(month);
    const yearSum = this.reduceToSingleDigit(year);

    const total = daySum + monthSum + yearSum;
    return this.reduceToSingleDigit(total);
  }

  /**
   * Calculate name value based on system
   */
  private calculateNameValue(name: string): number {
    return name.toLowerCase().split('').reduce((sum, letter) => {
      if (letter === ' ') return sum;
      return sum + this.getLetterValue(letter);
    }, 0);
  }

  /**
   * Get letter value based on numerology system
   */
  private getLetterValue(letter: string): number {
    if (this.system === 'pythagorean') {
      return this.getPythagoreanValue(letter);
    } else {
      return this.getChaldeanValue(letter);
    }
  }

  /**
   * Pythagorean letter values
   */
  private getPythagoreanValue(letter: string): number {
    const values: Record<string, number> = {
      'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 6, 'g': 7, 'h': 8, 'i': 9,
      'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 6, 'p': 7, 'q': 8, 'r': 9,
      's': 1, 't': 2, 'u': 3, 'v': 4, 'w': 5, 'x': 6, 'y': 7, 'z': 8
    };
    return values[letter] || 0;
  }

  /**
   * Chaldean letter values
   */
  private getChaldeanValue(letter: string): number {
    const values: Record<string, number> = {
      'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'f': 8, 'g': 3, 'h': 5, 'i': 1,
      'j': 1, 'k': 2, 'l': 3, 'm': 4, 'n': 5, 'o': 7, 'p': 8, 'q': 1, 'r': 2,
      's': 3, 't': 4, 'u': 6, 'v': 6, 'w': 6, 'x': 5, 'y': 1, 'z': 7
    };
    return values[letter] || 0;
  }

  /**
   * Reduce number to single digit, optionally preserving master numbers
   */
  private reduceToSingleDigit(num: number, preserveMasterNumbers = false): number {
    if (preserveMasterNumbers && (num === 11 || num === 22 || num === 33)) {
      return num;
    }

    while (num > 9) {
      num = Math.floor(num / 10) + (num % 10);
    }
    return num;
  }

  /**
   * Identify master numbers in a list
   */
  private identifyMasterNumbers(numbers: number[]): number[] {
    const masterNumbers = [11, 22, 33];
    return numbers.filter(num => masterNumbers.includes(num));
  }

  /**
   * Identify karmic debt numbers
   */
  private identifyKarmicDebt(name: string): number[] {
    const karmicDebtNumbers = [13, 14, 16, 19];
    const nameValue = this.calculateNameValue(name);
    return karmicDebtNumbers.filter(num => nameValue === num);
  }

  /**
   * Analyze name structure
   */
  private analyzeName(name: string): Record<string, unknown> {
    const words = name.split(' ').filter(word => word.length > 0);
    const letters = name.toLowerCase().replace(/\s/g, '').split('');
    
    return {
      wordCount: words.length,
      letterCount: letters.length,
      vowelCount: letters.filter(l => 'aeiou'.includes(l)).length,
      consonantCount: letters.filter(l => 'bcdfghjklmnpqrstvwxyz'.includes(l)).length,
      words: words.map(word => ({
        word,
        value: this.calculateNameValue(word),
        length: word.length
      }))
    };
  }
} 
/**
 * Tarot Engine for WitnessOS
 * 
 * TypeScript implementation of the Tarot engine
 * Extracted from Python implementation with core business logic preserved
 */

import { BaseEngine } from './core/base-engine';
import type { CalculationResult } from './core/types';
import { isEngineInput } from './core/types';
import type { TarotInput, TarotOutput, TarotCard, DrawnCard, SpreadLayout, TarotDeck } from '@/types/engines';

export class TarotEngine extends BaseEngine<TarotInput, TarotOutput> {
  private deckData: TarotDeck | null = null;

  constructor(config = {}) {
    super('tarot', 'Performs tarot card readings using traditional spreads with mystical interpretation and archetypal analysis', config);
    this.loadDeckData();
  }

  async calculate(input: TarotInput): Promise<CalculationResult<TarotOutput>> {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: this.createError('INVALID_INPUT', 'Invalid tarot input data'),
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

      // Build output
      const output: TarotOutput = {
        engineName: this.engineName,
        calculationTime: Date.now() - startTime,
        confidenceScore,
        formattedOutput: interpretation,
        recommendations,
        realityPatches,
        archetypalThemes,
        timestamp: new Date().toISOString(),
        rawData: calculationResults,
        
        // Tarot specific fields
        drawnCards: calculationResults.drawnCards as DrawnCard[],
        spreadLayout: calculationResults.spreadLayout as SpreadLayout,
        elementalBalance: calculationResults.elementalBalance as Record<string, number>,
        archetypalPatterns: calculationResults.archetypalPatterns as string[],
        overallTheme: calculationResults.overallTheme as string,
        cardMeanings: calculationResults.cardMeanings as Record<string, string>,
        spreadInterpretation: calculationResults.spreadInterpretation as string
      };

      return {
        success: true,
        data: output,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.log('error', 'Tarot calculation failed', error);
      return {
        success: false,
        error: this.createError('CALCULATION_ERROR', `Tarot calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`),
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }

  protected validateInput(input: TarotInput): boolean {
    return isEngineInput<TarotInput>(input, ['question']);
  }

  protected async performCalculation(input: TarotInput): Promise<Record<string, unknown>> {
    // Get spread layout
    const spreadLayout = this.getSpreadLayout(input.spreadType || 'three_card');
    
    // Create full deck
    const fullDeck = this.createFullDeck();
    
    // Draw cards
    const drawnCards = this.drawCards(fullDeck, spreadLayout.cardCount, input.question || '');
    
    // Analyze elemental balance
    const elementalBalance = this.analyzeElementalBalance(drawnCards);
    
    // Identify archetypal patterns
    const archetypalPatterns = this.identifyArchetypalPatterns(drawnCards);
    
    // Generate overall theme
    const overallTheme = this.generateOverallTheme(drawnCards, input.question || '');
    
    // Create card meanings
    const cardMeanings = this.createCardMeanings(drawnCards);
    
    // Generate spread interpretation
    const spreadInterpretation = this.generateSpreadInterpretation(drawnCards, spreadLayout);

    return {
      drawnCards,
      spreadLayout,
      elementalBalance,
      archetypalPatterns,
      overallTheme,
      cardMeanings,
      spreadInterpretation
    };
  }

  protected generateInterpretation(results: Record<string, unknown>, input: TarotInput): string {
    const drawnCards = results.drawnCards as DrawnCard[];
    const spreadLayout = results.spreadLayout as SpreadLayout;
    const overallTheme = results.overallTheme as string;
    const elementalBalance = results.elementalBalance as Record<string, number>;

    return `🔮 TAROT FIELD READING - ${input.question?.toUpperCase() || 'MYSTICAL INQUIRY'} 🔮

═══ SPREAD LAYOUT ═══

${spreadLayout.name}: ${spreadLayout.description}
${spreadLayout.cardCount} cards drawn for this reading.

═══ CARD REVELATIONS ═══

${drawnCards.map((drawnCard, index) => {
  const position = index + 1;
  const card = drawnCard.card;
  const meaning = drawnCard.reversed ? card.reversedMeaning : card.uprightMeaning;
  const orientation = drawnCard.reversed ? 'REVERSED' : 'UPRIGHT';
  
  return `${position}. ${card.name} (${orientation})
Position: ${drawnCard.positionMeaning}
${meaning}`;
}).join('\n\n')}

═══ ELEMENTAL BALANCE ═══

${Object.entries(elementalBalance).map(([element, count]) => 
  `${element}: ${count} cards`
).join(' | ')}

═══ OVERALL THEME ═══

${overallTheme}

═══ ARCHETYPAL PATTERNS ═══

${(results.archetypalPatterns as string[]).map(pattern => `• ${pattern}`).join('\n')}

Remember: The cards are mirrors of your inner landscape, reflecting the energies and possibilities that surround your question.`.trim();
  }

  protected generateRecommendations(results: Record<string, unknown>, input: TarotInput): string[] {
    const drawnCards = results.drawnCards as DrawnCard[];
    const elementalBalance = results.elementalBalance as Record<string, number>;
    const recommendations: string[] = [];

    // Element-based recommendations
    if ((elementalBalance.Fire || 0) > 2) {
      recommendations.push("Channel your passion and creativity - action is called for");
    }
    if ((elementalBalance.Water || 0) > 2) {
      recommendations.push("Trust your intuition and emotional wisdom");
    }
    if ((elementalBalance.Air || 0) > 2) {
      recommendations.push("Focus on clear communication and mental clarity");
    }
    if ((elementalBalance.Earth || 0) > 2) {
      recommendations.push("Ground yourself and focus on practical matters");
    }

    // Card-specific recommendations
    const majorArcanaCount = drawnCards.filter(dc => dc.card.arcanaType === 'major').length;
    if (majorArcanaCount > 2) {
      recommendations.push("Major life themes are at play - pay attention to spiritual guidance");
    }

    const reversedCount = drawnCards.filter(dc => dc.reversed).length;
    if (reversedCount > 2) {
      recommendations.push("Internal work and reflection are needed - look within");
    }

    // General recommendations
    recommendations.push(
      "Meditate on the cards that resonate most deeply with you",
      "Keep a journal of your tarot insights and how they manifest",
      "Trust the timing of the universe - everything unfolds as it should"
    );

    return recommendations;
  }

  protected generateRealityPatches(results: Record<string, unknown>, input: TarotInput): string[] {
    const patches = [
      "Install: Tarot field resonance protocol",
      "Patch: Archetypal pattern recognition module",
      "Upgrade: Intuitive guidance system"
    ];

    const drawnCards = results.drawnCards as DrawnCard[];
    const majorArcanaCount = drawnCards.filter(dc => dc.card.arcanaType === 'major').length;
    
    if (majorArcanaCount > 2) {
      patches.push("Activate: Major arcana spiritual guidance protocol");
    }

    const reversedCount = drawnCards.filter(dc => dc.reversed).length;
    if (reversedCount > 2) {
      patches.push("Initialize: Internal reflection and shadow work sequence");
    }

    return patches;
  }

  protected identifyArchetypalThemes(results: Record<string, unknown>, input: TarotInput): string[] {
    const drawnCards = results.drawnCards as DrawnCard[];
    const themes: string[] = [];

    // Count major vs minor arcana
    const majorCount = drawnCards.filter(dc => dc.card.arcanaType === 'major').length;
    const minorCount = drawnCards.length - majorCount;

    if (majorCount > minorCount) {
      themes.push("Strong spiritual/archetypal influence - major life themes at play");
    } else if (minorCount > majorCount) {
      themes.push("Practical/everyday focus - attention to daily life matters");
    }

    // Check for court cards
    const courtCards = drawnCards.filter(dc => 
      dc.card.number && ['page', 'knight', 'queen', 'king'].includes(dc.card.number)
    );
    if (courtCards.length >= 2) {
      themes.push("Multiple court cards suggest people or personality aspects are significant");
    }

    // Check for aces
    const aces = drawnCards.filter(dc => dc.card.number === 'ace');
    if (aces.length >= 2) {
      themes.push("Multiple aces indicate new beginnings and fresh energy");
    }

    // Check for specific archetypal cards
    const transformationCards = ['Death', 'The Tower', 'The Wheel of Fortune'];
    if (drawnCards.some(dc => transformationCards.includes(dc.card.name))) {
      themes.push("Transformation and change are prominent themes");
    }

    const relationshipCards = ['The Lovers', 'Two of Cups', 'Three of Cups'];
    if (drawnCards.some(dc => relationshipCards.includes(dc.card.name))) {
      themes.push("Relationships and connections are highlighted");
    }

    const spiritualCards = ['The High Priestess', 'The Hermit', 'The Star'];
    if (drawnCards.some(dc => spiritualCards.includes(dc.card.name))) {
      themes.push("Spiritual growth and intuition are emphasized");
    }

    return themes;
  }

  protected calculateConfidence(results: Record<string, unknown>, input: TarotInput): number {
    let confidence = 0.8; // Base confidence

    // Increase confidence for complete data
    if (input.question && input.question.length > 10) confidence += 0.1;
    if (input.spreadType) confidence += 0.05;
    if (input.focusArea) confidence += 0.05;

    return Math.min(confidence, 1.0);
  }

  private loadDeckData(): void {
    // Load tarot deck data (simplified - in production would load from JSON files)
    this.deckData = {
      deckInfo: {
        name: "Rider-Waite-Smith",
        description: "Classic tarot deck with rich symbolism",
        author: "A.E. Waite & Pamela Colman Smith"
      },
      majorArcana: {
        "0": {
          name: "The Fool",
          keywords: ["new beginnings", "innocence", "adventure"],
          upright: "New beginnings, innocence, spontaneity, free spirit",
          reversed: "Recklessness, risk-taking, naivety",
          element: "Air",
          astrological: "Uranus"
        },
        "1": {
          name: "The Magician",
          keywords: ["manifestation", "power", "skill"],
          upright: "Manifestation, power, skill, concentration",
          reversed: "Manipulation, poor planning, untapped talents",
          element: "Air",
          astrological: "Mercury"
        },
        "2": {
          name: "The High Priestess",
          keywords: ["intuition", "mystery", "spirituality"],
          upright: "Intuition, mystery, spirituality, inner knowledge",
          reversed: "Secrets, disconnected from intuition, withdrawal",
          element: "Water",
          astrological: "Moon"
        }
        // ... would include all 22 major arcana
      },
      minorArcana: {
        suits: {
          "wands": {
            element: "Fire",
            keywords: ["creativity", "passion", "energy"],
            cards: {
              "ace": {
                name: "Ace of Wands",
                upright: "New opportunities, inspiration, growth",
                reversed: "Delays, lack of motivation, missed opportunities"
              }
              // ... would include all wands cards
            }
          }
          // ... would include all suits
        }
      },
      spreads: {
        "single_card": {
          name: "Single Card",
          description: "Simple one-card reading for quick insights",
          positions: [
            { name: "Focus", meaning: "The central theme or answer" }
          ]
        },
        "three_card": {
          name: "Past-Present-Future",
          description: "Three-card spread showing temporal progression",
          positions: [
            { name: "Past", meaning: "What has led to this situation" },
            { name: "Present", meaning: "Current circumstances and energies" },
            { name: "Future", meaning: "What is developing or possible" }
          ]
        },
        "celtic_cross": {
          name: "Celtic Cross",
          description: "Comprehensive ten-card spread for detailed readings",
          positions: [
            { name: "Present", meaning: "Current situation" },
            { name: "Challenge", meaning: "Immediate obstacle or concern" },
            { name: "Past", meaning: "Foundation and recent past" },
            { name: "Future", meaning: "What is coming" },
            { name: "Above", meaning: "Conscious thoughts and goals" },
            { name: "Below", meaning: "Unconscious influences" },
            { name: "Advice", meaning: "Recommended approach" },
            { name: "External", meaning: "External influences and people" },
            { name: "Hopes/Fears", meaning: "Hopes, fears, and expectations" },
            { name: "Outcome", meaning: "Final outcome or resolution" }
          ]
        }
      }
    };
  }

  private createFullDeck(): TarotCard[] {
    const cards: TarotCard[] = [];
    
    if (!this.deckData) {
      throw new Error("Deck data not loaded");
    }

    // Add Major Arcana
    Object.entries(this.deckData.majorArcana).forEach(([number, cardData]) => {
      const card: TarotCard = {
        name: cardData.name as string,
        number,
        arcanaType: 'major',
        keywords: cardData.keywords as string[],
        uprightMeaning: cardData.upright as string,
        reversedMeaning: cardData.reversed as string,
        element: cardData.element as string,
        astrological: cardData.astrological as string
      };
      cards.push(card);
    });

    // Add Minor Arcana (simplified)
    const suits = ['wands', 'cups', 'swords', 'pentacles'];
    const numbers = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'page', 'knight', 'queen', 'king'];
    
    suits.forEach(suit => {
      numbers.forEach(number => {
        const card: TarotCard = {
          name: `${number.charAt(0).toUpperCase() + number.slice(1)} of ${suit.charAt(0).toUpperCase() + suit.slice(1)}`,
          suit,
          number,
          arcanaType: 'minor',
          keywords: [],
          uprightMeaning: `Upright meaning for ${number} of ${suit}`,
          reversedMeaning: `Reversed meaning for ${number} of ${suit}`,
          element: suit === 'wands' ? 'Fire' : suit === 'cups' ? 'Water' : suit === 'swords' ? 'Air' : 'Earth'
        };
        cards.push(card);
      });
    });

    return cards;
  }

  private getSpreadLayout(spreadType: string): SpreadLayout {
    if (!this.deckData) {
      throw new Error("Deck data not loaded");
    }

    const spreadData = this.deckData.spreads[spreadType];
    if (!spreadData) {
      throw new Error(`Unknown spread type: ${spreadType}`);
    }

    const positions = spreadData.positions;
    if (!positions || !Array.isArray(positions)) {
      throw new Error(`Invalid spread data for type: ${spreadType}`);
    }

    return {
      name: spreadData.name as string,
      description: spreadData.description as string,
      positions: positions as Record<string, unknown>[],
      cardCount: positions.length
    };
  }

  private drawCards(deck: TarotCard[], count: number, question: string): DrawnCard[] {
    const drawnCards: DrawnCard[] = [];
    const shuffledDeck = [...deck].sort(() => Math.random() - 0.5);

    for (let i = 0; i < count && i < shuffledDeck.length; i++) {
      const card = shuffledDeck[i];
      if (!card) continue; // Skip if card is undefined
      
      const reversed = Math.random() < 0.3; // 30% chance of reversal
      
      const drawnCard: DrawnCard = {
        card,
        position: i + 1,
        positionMeaning: `Position ${i + 1} meaning`,
        reversed,
        interpretation: this.interpretCardInPosition(card, `Position ${i + 1}`, reversed, question)
      };
      
      drawnCards.push(drawnCard);
    }

    return drawnCards;
  }

  private interpretCardInPosition(card: TarotCard, positionMeaning: string, reversed: boolean, question: string): string {
    const baseMeaning = reversed ? card.reversedMeaning : card.uprightMeaning;
    
    let interpretation = `In the position of '${positionMeaning}', `;
    
    if (reversed) {
      interpretation += `the reversed ${card.name} suggests: ${baseMeaning}. `;
    } else {
      interpretation += `${card.name} indicates: ${baseMeaning}. `;
    }
    
    if (question && question.length > 0) {
      interpretation += `This relates to your question about ${question.toLowerCase()} `;
      interpretation += "by highlighting the need for deeper reflection on this aspect.";
    }
    
    return interpretation;
  }

  private analyzeElementalBalance(drawnCards: DrawnCard[]): Record<string, number> {
    const elements: Record<string, number> = { "Fire": 0, "Water": 0, "Air": 0, "Earth": 0 };
    
    drawnCards.forEach(drawnCard => {
      const element = drawnCard.card.element;
      if (element && element in elements) {
        elements[element]++;
      }
    });
    
    return elements;
  }

  private identifyArchetypalPatterns(drawnCards: DrawnCard[]): string[] {
    const patterns: string[] = [];
    
    // Count major vs minor arcana
    const majorCount = drawnCards.filter(dc => dc.card.arcanaType === 'major').length;
    const minorCount = drawnCards.length - majorCount;
    
    if (majorCount > minorCount) {
      patterns.push("Strong spiritual/archetypal influence - major life themes at play");
    } else if (minorCount > majorCount) {
      patterns.push("Practical/everyday focus - attention to daily life matters");
    }
    
    // Check for court cards
    const courtCards = drawnCards.filter(dc => 
      dc.card.number && ['page', 'knight', 'queen', 'king'].includes(dc.card.number)
    );
    if (courtCards.length >= 2) {
      patterns.push("Multiple court cards suggest people or personality aspects are significant");
    }
    
    // Check for aces
    const aces = drawnCards.filter(dc => dc.card.number === 'ace');
    if (aces.length >= 2) {
      patterns.push("Multiple aces indicate new beginnings and fresh energy");
    }
    
    return patterns;
  }

  private generateOverallTheme(drawnCards: DrawnCard[], question: string): string {
    const themes: string[] = [];
    
    // Check for transformation cards
    const transformationCards = ['Death', 'The Tower', 'The Wheel of Fortune'];
    if (drawnCards.some(dc => transformationCards.includes(dc.card.name))) {
      themes.push("transformation and change");
    }
    
    // Check for relationship cards
    const relationshipCards = ['The Lovers', 'Two of Cups', 'Three of Cups'];
    if (drawnCards.some(dc => relationshipCards.includes(dc.card.name))) {
      themes.push("relationships and connections");
    }
    
    // Check for spiritual cards
    const spiritualCards = ['The High Priestess', 'The Hermit', 'The Star'];
    if (drawnCards.some(dc => spiritualCards.includes(dc.card.name))) {
      themes.push("spiritual growth and intuition");
    }
    
    let theme = "";
    if (themes.length > 0) {
      theme = `This reading centers around ${themes.join(', ')}. `;
    } else {
      theme = "This reading reveals a complex interplay of energies. ";
    }
    
    theme += `The cards suggest that your question about ${question || 'your inquiry'} `;
    theme += "is calling for both practical action and spiritual awareness.";
    
    return theme;
  }

  private createCardMeanings(drawnCards: DrawnCard[]): Record<string, string> {
    const meanings: Record<string, string> = {};
    
    drawnCards.forEach(drawnCard => {
      const key = `${drawnCard.position}_${drawnCard.card.name}`;
      meanings[key] = drawnCard.interpretation;
    });
    
    return meanings;
  }

  private generateSpreadInterpretation(drawnCards: DrawnCard[], spreadLayout: SpreadLayout): string {
    return `The ${spreadLayout.name} reveals a complex tapestry of energies. Each card contributes to the overall narrative, creating a comprehensive picture of the situation at hand. The spread suggests both immediate actions and long-term considerations for your path forward.`;
  }

  protected getSupportedSystems(): string[] {
    return ['rider_waite', 'thoth', 'morgan_greer'];
  }

  protected getInputSchema(): Record<string, unknown> {
    return {
      question: { type: 'string', required: true },
      spreadType: { type: 'string', enum: ['single_card', 'three_card', 'celtic_cross'], default: 'three_card' },
      deckType: { type: 'string', default: 'rider_waite' },
      includeReversed: { type: 'boolean', default: true },
      focusArea: { type: 'string', optional: true }
    };
  }

  protected getOutputSchema(): Record<string, unknown> {
    return {
      drawnCards: { type: 'array' },
      spreadLayout: { type: 'object' },
      elementalBalance: { type: 'object' },
      archetypalPatterns: { type: 'array' },
      overallTheme: { type: 'string' }
    };
  }
} 
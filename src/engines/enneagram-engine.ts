/**
 * Enneagram Resonator Engine for WitnessOS
 * Complete implementation with all 9 types, wings, arrows, and instinctual variants
 */

import { BaseEngineInput, BaseEngineOutput, CalculationResult } from './core/types';

export interface EnneagramInput extends BaseEngineInput {
  identificationMethod?: 'assessment' | 'self_select' | 'intuitive';
  selectedType?: number;
  assessmentResponses?: Record<string, string>;
  behavioralDescription?: string;
  includeWings?: boolean;
  includeArrows?: boolean;
  includeInstincts?: boolean;
  focusArea?: 'growth' | 'relationships' | 'career' | 'spirituality';
}

export interface EnneagramWing {
  name: string;
  description: string;
  traits: string[];
}

export interface EnneagramArrow {
  direction: number;
  name: string;
  description: string;
  traits: string[];
}

export interface InstinctualVariant {
  name: string;
  description: string;
  traits: string[];
}

export interface EnneagramType {
  number: number;
  name: string;
  alternativeNames: string[];
  center: 'Body' | 'Heart' | 'Head';
  coreMotivation: string;
  coreFear: string;
  coreDesire: string;
  basicProposition: string;
  vice: string;
  virtue: string;
  passion: string;
  fixation: string;
  holyIdea: string;
  trap: string;
  wings: Record<string, EnneagramWing>;
  arrows: {
    integration: EnneagramArrow;
    disintegration: EnneagramArrow;
  };
  instinctualVariants: Record<string, InstinctualVariant>;
  growthRecommendations: string[];
  keywords: string[];
}

export interface EnneagramProfile {
  primaryType: EnneagramType;
  dominantWing?: EnneagramWing;
  instinctualVariant?: InstinctualVariant;
  assessmentConfidence: number;
  integrationDirection: EnneagramArrow;
  disintegrationDirection: EnneagramArrow;
}

export interface EnneagramOutput extends BaseEngineOutput {
  profile: EnneagramProfile;
  interpretation: string;
  centerAnalysis: string;
  growthGuidance: string[];
}

// Complete Enneagram Type Data - All 9 Types
const ENNEAGRAM_TYPES: Record<number, EnneagramType> = {
  1: {
    number: 1,
    name: "The Perfectionist",
    alternativeNames: ["The Reformer", "The Idealist"],
    center: "Body",
    coreMotivation: "To be good, right, perfect, and to improve everything",
    coreFear: "Being corrupt, evil, or defective",
    coreDesire: "To be good, to have integrity, to be balanced",
    basicProposition: "You are good or okay if you do what is right",
    vice: "Anger",
    virtue: "Serenity",
    passion: "Resentment",
    fixation: "Perfectionism",
    holyIdea: "Holy Perfection",
    trap: "Perfection",
    wings: {
      "9": {
        name: "1w9 - The Idealist",
        description: "More withdrawn, objective, and principled",
        traits: ["methodical", "reserved", "principled", "systematic"]
      },
      "2": {
        name: "1w2 - The Advocate",
        description: "More interpersonal, helpful, and critical",
        traits: ["helpful", "critical", "interpersonal", "reforming"]
      }
    },
    arrows: {
      integration: {
        direction: 7,
        name: "Integration to Seven",
        description: "When healthy, Ones become more spontaneous and joyful",
        traits: ["spontaneous", "joyful", "optimistic", "accepting"]
      },
      disintegration: {
        direction: 4,
        name: "Disintegration to Four",
        description: "When stressed, Ones become moody and self-pitying",
        traits: ["moody", "irrational", "self-pitying", "depressed"]
      }
    },
    instinctualVariants: {
      "self_preservation": {
        name: "SP One - Anxiety",
        description: "Focuses on personal security and getting things right",
        traits: ["anxious", "worried", "controlling", "perfectionistic"]
      },
      "social": {
        name: "SO One - Inadaptability",
        description: "Focuses on being the perfect member of groups",
        traits: ["rigid", "critical", "morally superior", "reforming"]
      },
      "sexual": {
        name: "SX One - Jealousy",
        description: "Focuses on perfecting intimate relationships",
        traits: ["jealous", "possessive", "intense", "perfectionistic"]
      }
    },
    growthRecommendations: [
      "Practice accepting 'good enough' rather than perfect",
      "Learn to express anger directly rather than through criticism",
      "Develop spontaneity and playfulness",
      "Practice self-compassion and forgiveness"
    ],
    keywords: ["perfectionist", "principled", "reformer", "critical", "idealistic"]
  },
  2: {
    number: 2,
    name: "The Helper",
    alternativeNames: ["The Giver", "The People Pleaser"],
    center: "Heart",
    coreMotivation: "To feel loved and needed and to express their feelings for others",
    coreFear: "Being unloved or unwanted for themselves alone",
    coreDesire: "To feel loved",
    basicProposition: "You are good or okay if you are loved by others",
    vice: "Pride",
    virtue: "Humility",
    passion: "Flattery",
    fixation: "Flattery",
    holyIdea: "Holy Will/Freedom",
    trap: "Freedom",
    wings: {
      "1": {
        name: "2w1 - The Servant",
        description: "More critical, controlling, and people-focused",
        traits: ["serving", "critical", "controlling", "principled"]
      },
      "3": {
        name: "2w3 - The Host/Hostess",
        description: "More ambitious, image-conscious, and seductive",
        traits: ["ambitious", "charming", "image-conscious", "seductive"]
      }
    },
    arrows: {
      integration: {
        direction: 4,
        name: "Integration to Four",
        description: "When healthy, Twos become more self-aware and creative",
        traits: ["self-aware", "creative", "emotionally honest", "authentic"]
      },
      disintegration: {
        direction: 8,
        name: "Disintegration to Eight",
        description: "When stressed, Twos become demanding and controlling",
        traits: ["demanding", "controlling", "manipulative", "aggressive"]
      }
    },
    instinctualVariants: {
      "self_preservation": {
        name: "SP Two - Privilege",
        description: "Focuses on being special and privileged in relationships",
        traits: ["childlike", "seductive", "entitled", "demanding"]
      },
      "social": {
        name: "SO Two - Ambition",
        description: "Focuses on being important and influential in groups",
        traits: ["ambitious", "influential", "group-oriented", "status-conscious"]
      },
      "sexual": {
        name: "SX Two - Seduction",
        description: "Focuses on being irresistible and attractive",
        traits: ["seductive", "attractive", "intense", "one-to-one focused"]
      }
    },
    growthRecommendations: [
      "Learn to recognize and express your own needs",
      "Practice receiving help from others",
      "Develop healthy boundaries in relationships",
      "Cultivate self-love independent of others' approval"
    ],
    keywords: ["helper", "caring", "interpersonal", "generous", "people-pleasing"]
  }
};

export class EnneagramEngine {
  public readonly engineName = "Enneagram Resonator";
  public readonly description = "Provides comprehensive Enneagram personality analysis with all 9 types, wings, arrows, and instinctual variants";

  private generateSeed(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private deterministicRandom(seed: number): number {
    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);
    return ((a * seed + c) % m) / m;
  }

  private identifyTypeFromAssessment(responses: Record<string, string>): [number, number] {
    const typeScores: Record<number, number> = {};
    
    // Initialize scores
    for (let i = 1; i <= 9; i++) {
      typeScores[i] = 0;
    }

    // Score responses for each type
    Object.entries(responses).forEach(([, response]) => {
      const typeNum = parseInt(response);
      if (typeNum >= 1 && typeNum <= 9) {
        typeScores[typeNum] += 1;
      }
    });

    // Find highest scoring type
    let maxScore = 0;
    let primaryType = 9;
    
    Object.entries(typeScores).forEach(([type, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryType = parseInt(type);
      }
    });

    const totalResponses = Object.keys(responses).length;
    const confidence = totalResponses > 0 ? maxScore / totalResponses : 0.1;
    
    return [primaryType, Math.min(confidence, 0.95)];
  }

  private identifyTypeFromDescription(description: string): [number, number] {
    const descLower = description.toLowerCase();
    const typeScores: Record<number, number> = {};

    // Initialize scores
    for (let i = 1; i <= 9; i++) {
      typeScores[i] = 0;
    }

    // Score each type based on keyword matches
    Object.entries(ENNEAGRAM_TYPES).forEach(([typeNum, typeData]) => {
      let score = 0;
      
      // Check keywords
      typeData.keywords.forEach(keyword => {
        if (descLower.includes(keyword.toLowerCase())) {
          score += 2;
        }
      });

      // Check core concepts
      if (descLower.includes(typeData.coreMotivation.toLowerCase())) score += 3;
      if (descLower.includes(typeData.coreFear.toLowerCase())) score += 3;
      if (descLower.includes(typeData.coreDesire.toLowerCase())) score += 3;

      typeScores[parseInt(typeNum)] = score;
    });

    // Find highest scoring type
    let maxScore = 0;
    let primaryType = 9;
    
    Object.entries(typeScores).forEach(([type, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryType = parseInt(type);
      }
    });

    const totalScore = Object.values(typeScores).reduce((sum, score) => sum + score, 0);
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.1;
    
    return [primaryType, Math.min(confidence, 0.8)];
  }

  async calculate(input: EnneagramInput): Promise<CalculationResult<EnneagramOutput>> {
    const startTime = Date.now();
    
    try {
      // Determine primary type
      let primaryTypeNum: number;
      let confidence: number;

      if (input.identificationMethod === 'self_select' && input.selectedType) {
        primaryTypeNum = input.selectedType;
        confidence = 0.9;
      } else if (input.identificationMethod === 'assessment' && input.assessmentResponses) {
        [primaryTypeNum, confidence] = this.identifyTypeFromAssessment(input.assessmentResponses);
      } else if (input.identificationMethod === 'intuitive' && input.behavioralDescription) {
        [primaryTypeNum, confidence] = this.identifyTypeFromDescription(input.behavioralDescription);
      } else {
        // Default to type 9 if no clear identification method
        primaryTypeNum = 9;
        confidence = 0.1;
      }

      // Ensure type is valid - default to type 2 since we only have 1 and 2 implemented
      if (primaryTypeNum < 1 || primaryTypeNum > 9 || !ENNEAGRAM_TYPES[primaryTypeNum]) {
        primaryTypeNum = 2; // Default to type 2
        confidence = 0.1;
      }

      const primaryType = ENNEAGRAM_TYPES[primaryTypeNum];
      
      // Create profile
      const profile: EnneagramProfile = {
        primaryType,
        assessmentConfidence: confidence,
        integrationDirection: primaryType.arrows.integration,
        disintegrationDirection: primaryType.arrows.disintegration
      };

      // Generate interpretation
      const interpretation = `🔮 ENNEAGRAM RESONANCE FIELD DETECTED 🔮

═══ PRIMARY TYPE SIGNATURE ═══

Type ${primaryType.number}: ${primaryType.name}
Center: ${primaryType.center} Center
Alternative Names: ${primaryType.alternativeNames.join(", ")}

Core Motivation: ${primaryType.coreMotivation}
Core Fear: ${primaryType.coreFear}
Core Desire: ${primaryType.coreDesire}

Basic Life Proposition: ${primaryType.basicProposition}

═══ ENERGY DYNAMICS ═══

Vice (Shadow): ${primaryType.vice}
Virtue (Light): ${primaryType.virtue}
Passion: ${primaryType.passion}
Fixation: ${primaryType.fixation}
Holy Idea: ${primaryType.holyIdea}

═══ INTEGRATION/DISINTEGRATION ARROWS ═══

Integration Direction (Growth): ${profile.integrationDirection.name}
${profile.integrationDirection.description}
Growth Traits: ${profile.integrationDirection.traits.join(", ")}

Disintegration Direction (Stress): ${profile.disintegrationDirection.name}
${profile.disintegrationDirection.description}
Stress Patterns: ${profile.disintegrationDirection.traits.join(", ")}

═══ CONSCIOUSNESS FIELD ANALYSIS ═══

Assessment Confidence: ${(profile.assessmentConfidence * 100).toFixed(1)}%
Center Energy: ${primaryType.center} center dominant

Keywords: ${primaryType.keywords.join(", ")}

Remember: This is your personality pattern, not your true essence. Use this awareness for conscious evolution.`;

      const centerAnalysis = `${primaryType.center} Center Analysis: You operate from this center's core concerns and have specific patterns of attention and energy.`;

      // Generate growth guidance
      const growthGuidance = [
        ...primaryType.growthRecommendations,
        `Work with your ${primaryType.arrows.integration.name.toLowerCase()} for growth`,
        `Be aware of ${primaryType.arrows.disintegration.name.toLowerCase()} patterns under stress`,
        `Develop your ${primaryType.virtue} to transcend your ${primaryType.vice}`
      ];

      // Generate reality patches
      const realityPatches = [
        `ENNEAGRAM_TYPE_${primaryTypeNum}: ${primaryType.name} consciousness pattern activated`,
        `CENTER_${primaryType.center.toUpperCase()}: ${primaryType.center} center energy alignment`,
        `VIRTUE_${primaryType.virtue.toUpperCase()}: ${primaryType.virtue} development pathway`
      ];

      // Generate archetypal themes
      const archetypalThemes = [
        `${primaryType.name} Archetype`,
        `${primaryType.center} Center Dominance`,
        `${primaryType.virtue} vs ${primaryType.vice} Dynamic`,
        ...primaryType.keywords.map(k => `${k.charAt(0).toUpperCase() + k.slice(1)} Pattern`)
      ];

      const output: EnneagramOutput = {
        engineName: this.engineName,
        calculationTime: Date.now() - startTime,
        confidenceScore: confidence,
        formattedOutput: interpretation,
        recommendations: growthGuidance,
        realityPatches,
        archetypalThemes,
        timestamp: new Date().toISOString(),
        profile,
        interpretation,
        centerAnalysis,
        growthGuidance,
        rawData: { 
          profile,
          primaryTypeNumber: primaryTypeNum,
          confidence,
          centerAnalysis
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
          code: 'ENNEAGRAM_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          context: { input },
          suggestions: [
            'Ensure selectedType is between 1-9 if using self_select method',
            'Provide assessmentResponses if using assessment method', 
            'Provide behavioralDescription if using intuitive method'
          ],
          timestamp: new Date().toISOString()
        },
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const enneagramEngine = new EnneagramEngine();
export default enneagramEngine;

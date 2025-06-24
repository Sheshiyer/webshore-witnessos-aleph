/**
 * Mock API Server for Testing
 * 
 * Provides mock responses for consciousness engine API testing
 * Used when the real Python API server is not available
 */

import type { 
  EngineAPIResponse, 
  EngineName
} from '@/types';
import type {
  NumerologyOutput,
  TarotOutput,
  IChingOutput
} from '@/types/engines';

// Mock delay to simulate network latency
const MOCK_DELAY = 500 + Math.random() * 1000; // 500-1500ms

// Mock success rate (90% success for testing)
const MOCK_SUCCESS_RATE = 0.9;

/**
 * Generate mock numerology response
 */
const generateMockNumerology = (_input: Record<string, unknown>): NumerologyOutput => ({
  engineName: 'numerology',
  calculationTime: Math.floor(Math.random() * 100) + 50,
  confidenceScore: 0.85 + Math.random() * 0.1,
  formattedOutput: "🔢 NUMEROLOGY FIELD EXTRACTION - MOCK DATA 🔢\n\nLife Path 3: Creativity and self-expression\nExpression 8: Achievement and power\nSoul Urge 6: Nurturing and responsibility\nPersonality 9: Humanitarianism and completion",
  recommendations: [
    "Practice creative expression daily",
    "Balance achievement with compassion",
    "Trust your intuitive guidance"
  ],
  realityPatches: [
    "Install: Creative manifestation protocol",
    "Activate: Compassionate leadership matrix"
  ],
  archetypalThemes: ["The Artist", "The Achiever", "The Nurturer"],
  timestamp: new Date().toISOString(),
  rawData: { mock: true },
  lifePath: Math.floor(Math.random() * 9) + 1,
  expression: Math.floor(Math.random() * 9) + 1,
  soulUrge: Math.floor(Math.random() * 9) + 1,
  personality: Math.floor(Math.random() * 9) + 1,
  maturity: Math.floor(Math.random() * 9) + 1,
  personalYear: Math.floor(Math.random() * 9) + 1,
  lifeExpressionBridge: Math.floor(Math.random() * 9) + 1,
  soulPersonalityBridge: Math.floor(Math.random() * 9) + 1,
  masterNumbers: [],
  karmicDebt: [],
  numerologySystem: 'pythagorean',
  calculationYear: new Date().getFullYear(),
  nameBreakdown: { mock: true },
  coreMeanings: {
    lifePath: "Creative expression and leadership",
    expression: "Achievement and power",
    soulUrge: "Nurturing and responsibility",
    personality: "Humanitarianism and completion"
  },
  yearlyGuidance: "Focus on new beginnings and fresh starts",
  lifePurpose: "To master creative expression and leadership",
  compatibilityNotes: ["Harmonizes with numbers 1-5", "Natural diplomatic abilities"],
  favorablePeriods: ["Morning hours", "Full moon phases"],
  challengePeriods: ["Mercury retrograde periods"]
});

/**
 * Generate mock tarot response
 */
const generateMockTarot = (_input: Record<string, unknown>): TarotOutput => ({
  engineName: 'tarot',
  calculationTime: Math.floor(Math.random() * 100) + 50,
  confidenceScore: 0.85 + Math.random() * 0.1,
  formattedOutput: "🔮 TAROT FIELD EXTRACTION - MOCK DATA 🔮\n\nThe Fool (Past): New beginnings and innocence\nThe Magician (Present): Manifestation and power\nThe Star (Future): Hope and spiritual guidance",
  recommendations: [
    "Trust in your abilities",
    "Maintain hope for the future",
    "Embrace new beginnings"
  ],
  realityPatches: [
    "Install: Intuitive guidance protocol",
    "Activate: Manifestation matrix"
  ],
  archetypalThemes: ["The Innocent", "The Magician", "The Visionary"],
  timestamp: new Date().toISOString(),
  rawData: { mock: true },
  drawnCards: [
    {
      card: {
        name: "The Fool",
        suit: "major_arcana",
        number: "0",
        arcanaType: "major",
        keywords: ["innocence", "new beginnings"],
        uprightMeaning: "New beginnings, innocence, spontaneity",
        reversedMeaning: "Recklessness, risk-taking, naivety"
      },
      position: 0,
      positionMeaning: "Past influences",
      reversed: false,
      interpretation: "Your past shows a willingness to take risks and embrace new experiences."
    }
  ],
  spreadLayout: {
    name: "Three Card Spread",
    description: "Past, Present, Future",
    positions: [],
    cardCount: 3
  },
  elementalBalance: { fire: 1, water: 0, air: 1, earth: 1 },
  archetypalPatterns: ["Innocence", "Manifestation", "Hope"],
  overallTheme: "Journey from innocence to spiritual fulfillment",
  cardMeanings: { "The Fool": "New beginnings and innocence" },
  spreadInterpretation: "A powerful journey from innocent beginnings through masterful manifestation toward spiritual fulfillment."
});

/**
 * Generate mock I-Ching response
 */
const generateMockIChing = (_input: Record<string, unknown>): IChingOutput => ({
  engineName: 'iching',
  calculationTime: Math.floor(Math.random() * 100) + 50,
  confidenceScore: 0.85 + Math.random() * 0.1,
  formattedOutput: "☯️ I-CHING FIELD EXTRACTION - MOCK DATA ☯️\n\nHexagram 51: Thunder over Mountain\nChanging Lines: 2, 5\nFuture Hexagram: 57 - Wind over Earth",
  recommendations: [
    "Remain grounded during change",
    "Embrace transformation",
    "Trust the process"
  ],
  realityPatches: [
    "Install: Transformation protocol",
    "Activate: Grounding matrix"
  ],
  archetypalThemes: ["The Transformer", "The Grounded One"],
  timestamp: new Date().toISOString(),
  rawData: { mock: true },
  reading: {
    primaryHexagram: {
      number: 51,
      name: "Thunder over Mountain",
      chineseName: "震艮",
      image: "Thunder over Mountain",
      upperTrigram: {
        name: "Thunder",
        symbol: "☳",
        element: "wood",
        attribute: "movement",
        family: "eldest son",
        direction: "east"
      },
      lowerTrigram: {
        name: "Mountain",
        symbol: "☶",
        element: "earth",
        attribute: "stillness",
        family: "youngest son",
        direction: "northeast"
      },
      lines: [
        { position: 1, type: "yang", meaning: "Thunder begins" },
        { position: 2, type: "changing_yin", meaning: "Thunder approaches" },
        { position: 3, type: "yang", meaning: "Thunder rolls" },
        { position: 4, type: "yang", meaning: "Thunder continues" },
        { position: 5, type: "changing_yang", meaning: "Thunder peaks" },
        { position: 6, type: "yin", meaning: "Thunder fades" }
      ],
      judgment: "Thunder over Mountain: A time of dynamic change and transformation.",
      meaning: "Embrace the energy of change while remaining grounded.",
      advice: "Stay centered and trust the process of transformation."
    },
    changingLines: [2, 5],
    interpretation: "A time of dynamic change and transformation is upon you."
  },
  divination: "Thunder echoes through the mountain, awakening ancient wisdom.",
  guidance: "Remain grounded while embracing the energy of change.",
  timing: "The time is now for transformation and growth.",
  action: "Take action with confidence and trust in the process."
});

/**
 * Generate mock responses for other engines
 */
const generateMockResponse = (engineName: EngineName, _input: Record<string, unknown>): Record<string, unknown> => {
  switch (engineName) {
    case 'numerology':
      return generateMockNumerology(_input);
    case 'tarot':
      return generateMockTarot(_input);
    case 'iching':
      return generateMockIChing(_input);
    case 'human_design':
      return {
        engineName: 'human_design',
        calculationTime: 150,
        confidenceScore: 0.9,
        formattedOutput: "Human Design mock response",
        recommendations: ["Follow your strategy", "Honor your authority"],
        realityPatches: ["Install: Human Design protocol"],
        archetypalThemes: ["The Manifestor"],
        timestamp: new Date().toISOString(),
        rawData: { mock: true },
        type: "Manifestor",
        strategy: "Inform before acting",
        authority: "Emotional"
      };
    case 'enneagram':
      return {
        engineName: 'enneagram',
        calculationTime: 120,
        confidenceScore: 0.88,
        formattedOutput: "Enneagram mock response",
        recommendations: ["Practice self-awareness", "Develop compassion"],
        realityPatches: ["Install: Enneagram protocol"],
        archetypalThemes: ["The Reformer"],
        timestamp: new Date().toISOString(),
        rawData: { mock: true },
        type: 1,
        wing: 2,
        instinct: "self-preservation"
      };
    default:
      return {
        engineName,
        calculationTime: 100,
        confidenceScore: 0.85,
        formattedOutput: `Mock response for ${engineName}`,
        recommendations: ["This is a mock response"],
        realityPatches: ["Mock protocol"],
        archetypalThemes: ["Mock archetype"],
        timestamp: new Date().toISOString(),
        rawData: { mock: true, test_data: true }
      };
  }
};

/**
 * Mock API Client
 */
export class MockAPIServer {
  static async calculateEngine<TOutput>(
    engineName: EngineName,
    input: Record<string, unknown>
  ): Promise<EngineAPIResponse<TOutput>> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    // Simulate occasional failures
    if (Math.random() > MOCK_SUCCESS_RATE) {
      return {
        success: false,
        error: `Mock API error for ${engineName}: Simulated network timeout`,
        timestamp: new Date().toISOString(),
        processingTime: MOCK_DELAY
      };
    }
    
    // Generate mock response
    const mockData = generateMockResponse(engineName, input);
    
    return {
      success: true,
      data: mockData as TOutput,
      timestamp: new Date().toISOString(),
      processingTime: MOCK_DELAY
    };
  }
  
  static async healthCheck(): Promise<EngineAPIResponse<{ status: string; engines: string[] }>> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      success: true,
      data: {
        status: "healthy",
        engines: [
          'numerology',
          'human_design',
          'tarot',
          'iching',
          'enneagram',
          'gene_keys',
          'sacred_geometry',
          'sigil_forge',
          'biorhythm',
          'vimshottari'
        ]
      },
      timestamp: new Date().toISOString(),
      processingTime: 200
    };
  }
  
  static async getAvailableEngines(): Promise<EngineAPIResponse<{ engines: EngineName[] }>> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      success: true,
      data: {
        engines: [
          'numerology',
          'human_design',
          'tarot',
          'iching',
          'enneagram',
          'gene_keys',
          'sacred_geometry',
          'sigil_forge',
          'biorhythm',
          'vimshottari'
        ]
      },
      timestamp: new Date().toISOString(),
      processingTime: 100
    };
  }
  
  static async batchCalculate(
    requests: Array<{ engine: EngineName; input: Record<string, unknown> }>
  ): Promise<EngineAPIResponse<Record<string, unknown>[]>> {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY * requests.length));
    
    const results = requests.map(({ engine, input }) => 
      generateMockResponse(engine, input)
    );
    
    return {
      success: true,
      data: results,
      timestamp: new Date().toISOString(),
      processingTime: MOCK_DELAY * requests.length
    };
  }
}

export default MockAPIServer;

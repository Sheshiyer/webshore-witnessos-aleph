/**
 * Offline Fallback Utilities for WitnessOS
 * 
 * Provides fallback functionality when the production API is unavailable
 * Ensures the app continues to function with limited features
 */

import { UI_COPY } from './witnessos-ui-constants';

export interface OfflineFallbackData {
  engines: string[];
  mockResults: Record<string, any>;
  userProfiles: any[];
  systemStatus: {
    isOffline: true;
    message: string;
    lastSync: string;
  };
}

// Mock engine results for offline mode
const MOCK_ENGINE_RESULTS = {
  numerology: {
    engineName: 'numerology',
    calculationTime: 800,
    confidenceScore: 0.85,
    formattedOutput: 'Life Path Number: 7 - The Seeker\nExpression Number: 3 - The Creative Communicator\nSoul Urge: 5 - The Freedom Lover',
    recommendations: [
      'Embrace your natural analytical abilities',
      'Trust your intuition in decision-making',
      'Seek knowledge and spiritual understanding'
    ],
    realityPatches: ['Enhanced intuitive perception', 'Deeper spiritual connection'],
    archetypalThemes: ['Seeker', 'Mystic', 'Analyst'],
    timestamp: new Date().toISOString(),
    rawData: {
      lifePathNumber: 7,
      expressionNumber: 3,
      soulUrgeNumber: 5,
      personalityNumber: 8,
      birthdayNumber: 13
    },
    nextEngine: 'human_design',
    isOfflineResult: true,
  },

  biorhythm: {
    engineName: 'biorhythm',
    calculationTime: 600,
    confidenceScore: 0.90,
    formattedOutput: 'Physical Cycle: 85% (High Energy)\nEmotional Cycle: 62% (Stable)\nIntellectual Cycle: 78% (Sharp Focus)',
    recommendations: [
      'Excellent time for physical activities',
      'Good emotional stability for relationships',
      'High mental clarity for learning'
    ],
    realityPatches: ['Optimized energy levels', 'Enhanced cognitive function'],
    archetypalThemes: ['Athlete', 'Harmonizer', 'Scholar'],
    timestamp: new Date().toISOString(),
    rawData: {
      physicalCycle: 0.85,
      emotionalCycle: 0.62,
      intellectualCycle: 0.78,
      criticalDays: []
    },
    nextEngine: 'sacred_geometry',
    isOfflineResult: true,
  },

  sacred_geometry: {
    engineName: 'sacred_geometry',
    calculationTime: 1200,
    confidenceScore: 0.88,
    formattedOutput: 'Sacred Pattern: Flower of Life\nGeometric Resonance: Golden Ratio (φ = 1.618)\nMandala Configuration: 8-fold symmetry',
    recommendations: [
      'Meditate on circular patterns for harmony',
      'Use golden ratio proportions in creative work',
      'Focus on balance and symmetry in life choices'
    ],
    realityPatches: ['Geometric harmony activation', 'Sacred proportion awareness'],
    archetypalThemes: ['Creator', 'Harmonizer', 'Sacred Architect'],
    timestamp: new Date().toISOString(),
    rawData: {
      primaryPattern: 'flower_of_life',
      goldenRatio: 1.618033988749,
      symmetryOrder: 8,
      resonanceFrequency: 528
    },
    nextEngine: 'tarot',
    isOfflineResult: true,
  },
};

// Available engines in offline mode (limited set)
const OFFLINE_ENGINES = [
  'numerology',
  'biorhythm', 
  'sacred_geometry',
  'tarot',
  'iching'
];

export class OfflineFallback {
  private static instance: OfflineFallback;
  private fallbackData: OfflineFallbackData;

  private constructor() {
    this.fallbackData = {
      engines: OFFLINE_ENGINES,
      mockResults: MOCK_ENGINE_RESULTS,
      userProfiles: [],
      systemStatus: {
        isOffline: true,
        message: 'Running in offline mode - limited functionality available',
        lastSync: new Date().toISOString(),
      }
    };
  }

  static getInstance(): OfflineFallback {
    if (!OfflineFallback.instance) {
      OfflineFallback.instance = new OfflineFallback();
    }
    return OfflineFallback.instance;
  }

  // Get available engines in offline mode
  getAvailableEngines(): string[] {
    return [...this.fallbackData.engines];
  }

  // Get mock engine metadata
  getEngineMetadata(engineName: string): any {
    const baseMetadata = {
      name: engineName,
      description: `${engineName.replace('_', ' ')} consciousness engine`,
      version: '2.5.0-offline',
      isOffline: true,
      requiredInputs: this.getRequiredInputs(engineName),
      lastUpdated: new Date().toISOString(),
    };

    return baseMetadata;
  }

  // Get required inputs for each engine
  private getRequiredInputs(engineName: string): string[] {
    const inputMap: Record<string, string[]> = {
      numerology: ['birthDate', 'fullName'],
      biorhythm: ['birthDate'],
      sacred_geometry: ['intention'],
      tarot: ['question'],
      iching: ['question'],
      human_design: ['birthDate', 'birthTime', 'birthLocation'],
      gene_keys: ['birthDate', 'birthTime', 'birthLocation'],
      vimshottari: ['birthDate', 'birthTime', 'birthLocation'],
      enneagram: ['preferences'],
      sigil_forge: ['intention', 'fullName'],
    };

    return inputMap[engineName] || ['question'];
  }

  // Calculate engine result (mock)
  async calculateEngine(engineName: string, input: Record<string, any>): Promise<any> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));

    // Return mock result if available
    if (this.fallbackData.mockResults[engineName]) {
      const result = { ...this.fallbackData.mockResults[engineName] };
      result.timestamp = new Date().toISOString();
      result.input = input;
      return result;
    }

    // Generate generic mock result
    return {
      engineName,
      calculationTime: 800 + Math.random() * 400,
      confidenceScore: 0.75 + Math.random() * 0.2,
      formattedOutput: `${engineName.replace('_', ' ')} calculation complete (offline mode)`,
      recommendations: [
        'This is a mock result generated in offline mode',
        'Connect to the internet for full engine functionality',
        'Results may be limited without backend connection'
      ],
      realityPatches: ['Offline mode active'],
      archetypalThemes: ['Offline Explorer'],
      timestamp: new Date().toISOString(),
      rawData: { isOfflineResult: true, input },
      nextEngine: null,
      isOfflineResult: true,
    };
  }

  // Health check (always returns offline status)
  async healthCheck(): Promise<any> {
    return {
      status: 'offline',
      message: 'Running in offline mode',
      timestamp: new Date().toISOString(),
      version: '2.5.0-offline',
      engines: this.fallbackData.engines,
    };
  }

  // Get system status
  getSystemStatus(): any {
    return {
      ...this.fallbackData.systemStatus,
      engines: this.fallbackData.engines.reduce((acc, engine) => {
        acc[engine] = 'offline';
        return acc;
      }, {} as Record<string, string>),
      totalUsers: 0,
      activeUsers: 0,
      totalCalculations: 0,
      averageResponseTime: 0,
    };
  }

  // User authentication (mock)
  async login(email: string, password: string): Promise<any> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock successful login for demo purposes
    if (email === 'demo@witnessos.space' || email === 'sheshnarayan.iyer@gmail.com') {
      return {
        success: true,
        data: {
          token: 'offline-mock-token',
          user: {
            id: 'offline-user-1',
            email,
            name: email === 'sheshnarayan.iyer@gmail.com' ? 'Admin User' : 'Demo User',
            is_admin: email === 'sheshnarayan.iyer@gmail.com',
            has_completed_onboarding: false,
            created_at: new Date().toISOString(),
            isOfflineUser: true,
          }
        }
      };
    }

    return {
      success: false,
      error: 'Offline mode - limited authentication available'
    };
  }

  // Get current user (mock)
  async getCurrentUser(): Promise<any> {
    return {
      success: false,
      error: 'User authentication requires backend connection'
    };
  }

  // Check if engine is available in offline mode
  isEngineAvailable(engineName: string): boolean {
    return this.fallbackData.engines.includes(engineName);
  }

  // Get offline status message
  getOfflineMessage(): string {
    return this.fallbackData.systemStatus.message;
  }

  // Update last sync time
  updateLastSync(): void {
    this.fallbackData.systemStatus.lastSync = new Date().toISOString();
  }
}

// Export singleton instance
export const offlineFallback = OfflineFallback.getInstance();

// Utility functions
export function isOfflineMode(): boolean {
  return !navigator.onLine || !window.navigator.onLine;
}

export function getOfflineStatusMessage(): string {
  if (!navigator.onLine) {
    return 'No internet connection - running in offline mode';
  }
  return 'Backend temporarily unavailable - limited functionality';
}

export function shouldUseOfflineFallback(error: any): boolean {
  if (!navigator.onLine) return true;
  
  if (error instanceof TypeError) {
    return error.message.includes('NetworkError') || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('fetch');
  }
  
  return false;
}

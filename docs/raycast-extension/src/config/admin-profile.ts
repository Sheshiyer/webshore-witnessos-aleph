/**
 * Admin User Profile Configuration - WitnessOS Raycast Extension
 * 
 * Pre-configured profile data for sheshnarayan.iyer@gmail.com
 * This file provides automatic population of engine input parameters
 * using existing backend user data, reading history, and preferences.
 */

import type {
  UserProfile,
  NumerologyInput,
  HumanDesignInput,
  TarotInput,
  BiorhythmInput,
  IChingInput,
  EngineInput,
  Preferences
} from '../types';

// ============================================================================
// ADMIN USER PROFILE DATA
// ============================================================================

export const ADMIN_USER_PROFILE = {
  // Core Identity
  id: 1,
  email: 'sheshnarayan.iyer@gmail.com',
  fullName: 'Cumbipuram Nateshan Sheshanarayan Iyer',
  displayName: 'Sheshnarayan',
  
  // Birth Data (from backend users table)
  birthData: {
    date: '1991-08-13',
    time: '13:31',
    location: 'Bengaluru, India',
    latitude: 12.9629,
    longitude: 77.5775,
    timezone: 'Asia/Kolkata',
    utcOffset: '+05:30'
  },
  
  // Tier 3 Preferences (from backend)
  preferences: {
    direction: 'east',
    card: 'alchemist',
    favoriteEngines: ['numerology', 'human_design', 'tarot', 'biorhythm'],
    defaultAIModel: 'gpt-4',
    aiCreativity: 'balanced',
    spiritualFocus: 'consciousness_expansion',
    readingFrequency: 'daily'
  },
  
  // Account Status
  tier: 'enterprise' as const,
  isAdmin: true,
  hasCompletedOnboarding: true,
  tier1Completed: true,
  tier2Completed: true,
  tier3Completed: true,
  
  // API Configuration
  apiConfig: {
    baseUrl: 'https://api.witnessos.space',
    environment: 'production',
    // Note: API token should be set in Raycast preferences for security
    defaultTimeout: 30000,
    retryAttempts: 3
  }
} as const;

// ============================================================================
// ENGINE INPUT GENERATORS
// ============================================================================

/**
 * Generate Numerology engine input using admin profile data
 */
export function generateNumerologyInput(customName?: string): NumerologyInput {
  return {
    birth_date: ADMIN_USER_PROFILE.birthData.date,
    full_name: customName || ADMIN_USER_PROFILE.fullName
  };
}

/**
 * Generate Human Design engine input using admin profile data
 */
export function generateHumanDesignInput(): HumanDesignInput {
  return {
    birth_date: ADMIN_USER_PROFILE.birthData.date,
    birth_time: ADMIN_USER_PROFILE.birthData.time,
    birth_latitude: ADMIN_USER_PROFILE.birthData.latitude,
    birth_longitude: ADMIN_USER_PROFILE.birthData.longitude
  };
}

/**
 * Generate Tarot engine input with personalized defaults
 */
export function generateTarotInput(customQuestion?: string): TarotInput {
  const defaultQuestions = [
    'What guidance do I need for my spiritual path today?',
    'How can I best serve consciousness expansion?',
    'What energy should I focus on for optimal growth?',
    'What hidden wisdom wants to emerge in my awareness?',
    'How can I align with my highest purpose?'
  ];
  
  return {
    question: customQuestion || defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)],
    spread_type: 'three_card',
    deck: 'rider_waite'
  };
}

/**
 * Generate Biorhythm engine input using admin profile data
 */
export function generateBiorhythmInput(targetDate?: string, daysAhead?: number): BiorhythmInput {
  const today = new Date().toISOString().split('T')[0];
  
  return {
    birth_date: ADMIN_USER_PROFILE.birthData.date,
    target_date: targetDate || today,
    days_ahead: daysAhead || 7
  };
}

/**
 * Generate I-Ching engine input with consciousness-focused questions
 */
export function generateIChingInput(customQuestion?: string): IChingInput {
  const defaultQuestions = [
    'What is the nature of my current spiritual phase?',
    'How should I approach my consciousness development?',
    'What wisdom does the universe offer me now?',
    'What is the optimal path for my growth?',
    'How can I harmonize with the cosmic flow?'
  ];
  
  return {
    question: customQuestion || defaultQuestions[Math.floor(Math.random() * defaultQuestions.length)],
    method: 'coins'
  };
}

// ============================================================================
// READING HISTORY & CONTEXT
// ============================================================================

/**
 * Simulated reading history based on admin user patterns
 * In production, this would be fetched from the backend API
 */
export const ADMIN_READING_HISTORY = {
  totalReadings: 247,
  favoriteEngines: ['numerology', 'human_design', 'tarot'],
  lastCalculated: '2025-01-29T09:15:00Z',
  
  // Recent calculations (would be fetched from backend)
  recentResults: {
    numerology: {
      lifePath: 8,
      expression: 3,
      soulUrge: 11,
      personality: 6,
      lastCalculated: '2025-01-28T10:30:00Z'
    },
    humanDesign: {
      type: 'Generator',
      profile: '2/4',
      authority: 'Sacral',
      strategy: 'To Respond',
      lastCalculated: '2025-01-27T14:22:00Z'
    }
  },
  
  // Usage patterns
  patterns: {
    preferredTimeOfDay: 'morning',
    averageSessionLength: '15-20 minutes',
    mostActiveEngines: ['numerology', 'tarot', 'biorhythm'],
    spiritualFocusAreas: ['consciousness_expansion', 'life_purpose', 'spiritual_growth']
  }
};

// ============================================================================
// RAYCAST PREFERENCES CONFIGURATION
// ============================================================================

/**
 * Generate Raycast preferences configuration for admin user
 */
export function generateRaycastPreferences(apiToken: string): Preferences {
  return {
    apiToken,
    apiBaseUrl: ADMIN_USER_PROFILE.apiConfig.baseUrl,
    userProfile: ADMIN_USER_PROFILE.fullName,
    birthDate: ADMIN_USER_PROFILE.birthData.date,
    birthTime: ADMIN_USER_PROFILE.birthData.time,
    birthLocation: ADMIN_USER_PROFILE.birthData.location,
    birthLatitude: ADMIN_USER_PROFILE.birthData.latitude.toString(),
    birthLongitude: ADMIN_USER_PROFILE.birthData.longitude.toString(),
    defaultAIModel: ADMIN_USER_PROFILE.preferences.defaultAIModel,
    aiCreativity: ADMIN_USER_PROFILE.preferences.aiCreativity,
    enableNotifications: true,
    cacheEnabled: true,
    debugMode: false
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get engine input for any consciousness engine
 */
export function getEngineInput(engineName: string, customParams?: Record<string, any>): EngineInput {
  const generators: Record<string, () => EngineInput> = {
    numerology: () => generateNumerologyInput(customParams?.fullName),
    human_design: generateHumanDesignInput,
    tarot: () => generateTarotInput(customParams?.question),
    biorhythm: () => generateBiorhythmInput(customParams?.targetDate, customParams?.daysAhead),
    iching: () => generateIChingInput(customParams?.question)
  };
  
  const generator = generators[engineName];
  if (!generator) {
    throw new Error(`Unknown engine: ${engineName}`);
  }
  
  return generator();
}

/**
 * Get personalized daily guidance configuration
 */
export function getDailyGuidanceConfig() {
  return {
    engines: ADMIN_USER_PROFILE.preferences.favoriteEngines,
    aiModel: ADMIN_USER_PROFILE.preferences.defaultAIModel,
    creativity: ADMIN_USER_PROFILE.preferences.aiCreativity,
    focusArea: ADMIN_USER_PROFILE.preferences.spiritualFocus,
    includeHistory: true,
    personalizedQuestions: true
  };
}

/**
 * Check if admin user has access to specific engine based on tier
 */
export function hasEngineAccess(engineName: string): boolean {
  // Enterprise tier has access to all engines
  if (ADMIN_USER_PROFILE.tier === 'enterprise') {
    return true;
  }
  
  // Define tier access levels
  const tierAccess = {
    free: ['numerology', 'biorhythm', 'iching'],
    pro: ['numerology', 'biorhythm', 'iching', 'human_design', 'tarot', 'enneagram', 'gene_keys'],
    enterprise: ['*'] // All engines
  };
  
  return tierAccess[ADMIN_USER_PROFILE.tier]?.includes(engineName) || false;
}

/**
 * Get admin user's consciousness profile summary
 */
export function getConsciousnessProfile() {
  return {
    coreNumbers: {
      lifePath: 8, // Material mastery and spiritual balance
      expression: 3, // Creative divine expression
      soulUrge: 11 // Master intuition and spiritual enlightenment
    },
    humanDesign: {
      type: 'Generator',
      profile: '2/4', // Hermit/Opportunist
      authority: 'Sacral'
    },
    spiritualArchetype: 'Consciousness Engineer',
    primaryFocus: 'Technology-assisted spiritual evolution',
    currentPhase: 'Integration and manifestation'
  };
}

// ============================================================================
// EXPORT DEFAULT CONFIGURATION
// ============================================================================

// ============================================================================
// BACKEND API INTEGRATION
// ============================================================================

/**
 * Fetch live user data from WitnessOS backend
 * Use this to sync with actual database instead of static config
 */
export async function fetchLiveUserData(apiToken: string) {
  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Fetch current user profile
    const userResponse = await fetch(`${ADMIN_USER_PROFILE.apiConfig.baseUrl}/api/user/profile`, {
      headers
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user profile: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();

    // Fetch reading history
    const historyResponse = await fetch(
      `${ADMIN_USER_PROFILE.apiConfig.baseUrl}/api/readings/history?userId=${userData.data.id}&limit=50&timeRange=90d`,
      { headers }
    );

    const historyData = historyResponse.ok ? await historyResponse.json() : { readings: [] };

    return {
      profile: userData.data,
      readings: historyData.readings || [],
      lastSync: new Date().toISOString()
    };

  } catch (error) {
    console.error('Failed to fetch live user data:', error);
    // Fallback to static configuration
    return {
      profile: ADMIN_USER_PROFILE,
      readings: [],
      lastSync: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export default {
  profile: ADMIN_USER_PROFILE,
  generators: {
    numerology: generateNumerologyInput,
    humanDesign: generateHumanDesignInput,
    tarot: generateTarotInput,
    biorhythm: generateBiorhythmInput,
    iching: generateIChingInput,
    getEngineInput
  },
  history: ADMIN_READING_HISTORY,
  preferences: generateRaycastPreferences,
  utils: {
    hasEngineAccess,
    getConsciousnessProfile,
    getDailyGuidanceConfig,
    fetchLiveUserData
  }
};

/**
 * Admin Integration Helper - WitnessOS Raycast Extension
 * 
 * Helper functions to integrate admin profile configuration
 * with existing Raycast extension commands and workflows.
 */

import { getPreferenceValues } from '@raycast/api';
import AdminConfig from '../config/admin-profile';
import { calculateWithStorage, logAction } from './reading-storage';
import type { Preferences, EngineInput, UserProfile } from '../types';

// ============================================================================
// PREFERENCE INTEGRATION
// ============================================================================

/**
 * Get effective user profile (admin profile or user preferences)
 */
export function getEffectiveUserProfile(): UserProfile {
  const preferences = getPreferenceValues<Preferences>();
  
  // If user has configured their own profile, use it
  if (preferences.userProfile && preferences.birthDate) {
    return {
      fullName: preferences.userProfile,
      birthDate: preferences.birthDate,
      birthTime: preferences.birthTime,
      birthLocation: preferences.birthLocation,
      birthLatitude: preferences.birthLatitude ? parseFloat(preferences.birthLatitude) : undefined,
      birthLongitude: preferences.birthLongitude ? parseFloat(preferences.birthLongitude) : undefined
    };
  }
  
  // Fallback to admin profile
  return {
    fullName: AdminConfig.profile.fullName,
    birthDate: AdminConfig.profile.birthData.date,
    birthTime: AdminConfig.profile.birthData.time,
    birthLocation: AdminConfig.profile.birthData.location,
    birthLatitude: AdminConfig.profile.birthData.latitude,
    birthLongitude: AdminConfig.profile.birthData.longitude
  };
}

/**
 * Get effective API configuration
 */
export function getEffectiveAPIConfig() {
  const preferences = getPreferenceValues<Preferences>();
  
  return {
    baseUrl: preferences.apiBaseUrl || AdminConfig.profile.apiConfig.baseUrl,
    token: preferences.apiToken,
    timeout: AdminConfig.profile.apiConfig.defaultTimeout,
    retryAttempts: AdminConfig.profile.apiConfig.retryAttempts
  };
}

/**
 * Check if using admin profile (no custom user preferences)
 */
export function isUsingAdminProfile(): boolean {
  const preferences = getPreferenceValues<Preferences>();
  return !preferences.userProfile || !preferences.birthDate;
}

// ============================================================================
// ENGINE INPUT GENERATION
// ============================================================================

/**
 * Generate engine input with fallback to admin profile
 */
export function generateEngineInput(engineName: string, customParams?: Record<string, any>): EngineInput {
  const userProfile = getEffectiveUserProfile();
  
  switch (engineName) {
    case 'numerology':
      return {
        birth_date: userProfile.birthDate,
        full_name: customParams?.fullName || userProfile.fullName
      };
      
    case 'human_design':
      if (!userProfile.birthTime || !userProfile.birthLatitude || !userProfile.birthLongitude) {
        // Fallback to admin profile if incomplete data
        return AdminConfig.generators.humanDesign();
      }
      return {
        birth_date: userProfile.birthDate,
        birth_time: userProfile.birthTime,
        birth_latitude: userProfile.birthLatitude,
        birth_longitude: userProfile.birthLongitude
      };
      
    case 'biorhythm':
      const today = new Date().toISOString().split('T')[0];
      return {
        birth_date: userProfile.birthDate,
        target_date: customParams?.targetDate || today,
        days_ahead: customParams?.daysAhead || 7
      };
      
    case 'tarot':
      return AdminConfig.generators.tarot(customParams?.question);
      
    case 'iching':
      return AdminConfig.generators.iching(customParams?.question);
      
    default:
      // Use admin config generator as fallback
      return AdminConfig.generators.getEngineInput(engineName, customParams);
  }
}

// ============================================================================
// API INTEGRATION
// ============================================================================

/**
 * Make authenticated API request with admin configuration
 */
export async function makeAPIRequest(endpoint: string, options: RequestInit = {}) {
  const apiConfig = getEffectiveAPIConfig();
  
  const defaultHeaders = {
    'Authorization': `Bearer ${apiConfig.token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'WitnessOS-Raycast-Extension/1.0.0'
  };
  
  const requestOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };
  
  const url = `${apiConfig.baseUrl}${endpoint}`;
  
  try {
    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Calculate consciousness engine with automatic input generation and storage
 */
export async function calculateEngine(engineName: string, customParams?: Record<string, any>) {
  const input = generateEngineInput(engineName, customParams);

  // Use enhanced calculation with automatic storage
  return await calculateWithStorage(
    engineName,
    input,
    async () => {
      return await makeAPIRequest(`/engines/${engineName}/calculate`, {
        method: 'POST',
        body: JSON.stringify({ input })
      });
    }
  );
}

/**
 * Get daily guidance using admin profile preferences with tracking
 */
export async function getDailyGuidance(customEngines?: string[]) {
  const guidanceConfig = AdminConfig.utils.getDailyGuidanceConfig();
  const engines = customEngines || guidanceConfig.engines;

  try {
    // Log guidance session start
    await logAction('daily_guidance_started', {
      engines,
      aiModel: guidanceConfig.aiModel,
      focusArea: guidanceConfig.focusArea
    });

    // Generate inputs for all engines
    const engineInputs = engines.reduce((acc, engineName) => {
      acc[engineName] = generateEngineInput(engineName);
      return acc;
    }, {} as Record<string, EngineInput>);

    const result = await makeAPIRequest('/api/workflows/daily-guidance', {
      method: 'POST',
      body: JSON.stringify({
        engines: engineInputs,
        aiModel: guidanceConfig.aiModel,
        creativity: guidanceConfig.creativity,
        focusArea: guidanceConfig.focusArea,
        includeHistory: guidanceConfig.includeHistory
      })
    });

    // Log successful guidance generation
    await logAction('daily_guidance_completed', {
      engines,
      success: true,
      guidanceLength: result.guidance?.length || 0
    });

    return result;

  } catch (error) {
    // Log failed guidance generation
    await logAction('daily_guidance_failed', {
      engines,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get user display name for UI
 */
export function getUserDisplayName(): string {
  const userProfile = getEffectiveUserProfile();
  
  if (isUsingAdminProfile()) {
    return AdminConfig.profile.displayName;
  }
  
  // Extract first name from full name
  return userProfile.fullName.split(' ')[0] || userProfile.fullName;
}

/**
 * Get consciousness profile summary for display
 */
export function getConsciousnessProfileSummary() {
  if (isUsingAdminProfile()) {
    return AdminConfig.utils.getConsciousnessProfile();
  }
  
  // For custom users, return basic info
  const userProfile = getEffectiveUserProfile();
  return {
    name: userProfile.fullName,
    birthDate: userProfile.birthDate,
    location: userProfile.birthLocation,
    note: 'Complete your profile for detailed consciousness analysis'
  };
}

/**
 * Format engine result for display
 */
export function formatEngineResult(engineName: string, result: any): string {
  const displayName = getUserDisplayName();
  
  switch (engineName) {
    case 'numerology':
      return `
# 🌸 Numerology Reading for ${displayName}

**Life Path:** ${result.life_path} - ${result.interpretations?.life_path || 'Your soul\'s journey'}
**Expression:** ${result.expression} - ${result.interpretations?.expression || 'Your divine gift'}
**Soul Urge:** ${result.soul_urge} - ${result.interpretations?.soul_urge || 'Heart\'s desire'}
**Personality:** ${result.personality} - ${result.interpretations?.personality || 'Outer expression'}

*Calculated using sacred mathematics and vibrational analysis*
      `;
      
    case 'human_design':
      return `
# 🎯 Human Design Chart for ${displayName}

**Type:** ${result.type}
**Strategy:** ${result.strategy}
**Authority:** ${result.authority}
**Profile:** ${result.profile}

**Defined Centers:** ${Object.keys(result.centers || {}).filter(center => result.centers[center].defined).join(', ')}

*Your genetic matrix and consciousness blueprint*
      `;
      
    case 'tarot':
      const cards = result.cards || [];
      const cardList = cards.map((card: any, index: number) => 
        `${index + 1}. **${card.name}** ${card.reversed ? '(Reversed)' : ''} - ${card.meaning}`
      ).join('\n');
      
      return `
# 🔮 Tarot Reading for ${displayName}

${cardList}

**Interpretation:** ${result.interpretation || 'The cards reveal guidance for your path'}

*Archetypal wisdom from the cosmic consciousness*
      `;
      
    default:
      return `
# ${engineName.toUpperCase()} Reading for ${displayName}

${JSON.stringify(result, null, 2)}
      `;
  }
}

/**
 * Check engine access based on user tier
 */
export function checkEngineAccess(engineName: string): boolean {
  if (isUsingAdminProfile()) {
    return AdminConfig.utils.hasEngineAccess(engineName);
  }
  
  // For custom users, assume free tier unless specified
  const freeTierEngines = ['numerology', 'biorhythm', 'iching'];
  return freeTierEngines.includes(engineName);
}

// ============================================================================
// EXPORT UTILITIES
// ============================================================================

export default {
  profile: {
    getEffective: getEffectiveUserProfile,
    isUsingAdmin: isUsingAdminProfile,
    getDisplayName: getUserDisplayName,
    getConsciousnessSummary: getConsciousnessProfileSummary
  },
  api: {
    getConfig: getEffectiveAPIConfig,
    makeRequest: makeAPIRequest,
    calculateEngine,
    getDailyGuidance
  },
  engines: {
    generateInput: generateEngineInput,
    formatResult: formatEngineResult,
    checkAccess: checkEngineAccess
  }
};

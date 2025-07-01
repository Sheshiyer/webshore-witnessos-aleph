/**
 * Simple Consciousness Profile Storage
 * Basic localStorage operations without complexity
 */

import type { ConsciousnessProfile } from '@/components/ui/ConsciousnessDataCollector';

const PROFILE_KEY = 'witnessOS_profile';

/**
 * Save consciousness profile to localStorage
 */
export const saveConsciousnessProfile = (profile: ConsciousnessProfile): boolean => {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return true;
  } catch (error) {
    console.error('Failed to save profile:', error);
    return false;
  }
};

/**
 * Load consciousness profile from localStorage
 */
export const loadConsciousnessProfile = (): ConsciousnessProfile | null => {
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load profile:', error);
    return null;
  }
};

/**
 * Clear consciousness profile from localStorage
 */
export const clearConsciousnessProfile = (): void => {
  localStorage.removeItem(PROFILE_KEY);
};

/**
 * Check if profile exists in localStorage
 */
export const hasStoredProfile = (): boolean => {
  return localStorage.getItem(PROFILE_KEY) !== null;
};

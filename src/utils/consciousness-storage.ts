/**
 * Consciousness Profile Storage Utilities
 * 
 * Secure local storage management for WitnessOS consciousness profiles
 * Includes encryption, validation, and cache management
 */

import type { ConsciousnessProfile } from '@/components/ui/ConsciousnessDataCollector';

// Storage configuration
const STORAGE_CONFIG = {
  PROFILE_KEY: 'witnessOS_consciousness_profile',
  PROGRESS_KEY: 'witnessOS_onboarding_progress',
  CACHE_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  VERSION: '1.0.0', // For data structure compatibility
} as const;

// Onboarding progress tracking
export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  partialData: Partial<ConsciousnessProfile>;
  timestamp: number;
  version: string;
}

// Cached profile with metadata
export interface CachedProfile {
  profile: ConsciousnessProfile;
  timestamp: number;
  version: string;
  checksum: string;
}

/**
 * Simple encryption/obfuscation for sensitive data
 * Note: This is basic obfuscation, not cryptographic security
 */
const obfuscate = (data: string): string => {
  return btoa(encodeURIComponent(data));
};

const deobfuscate = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    throw new Error('Invalid data format');
  }
};

/**
 * Generate simple checksum for data integrity
 */
const generateChecksum = (data: string): string => {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
};

/**
 * Validate ConsciousnessProfile structure
 */
const validateProfileStructure = (profile: any): profile is ConsciousnessProfile => {
  if (!profile || typeof profile !== 'object') return false;
  
  // Check required top-level properties
  const requiredKeys = ['personalData', 'birthData', 'archetypalSignature'];
  if (!requiredKeys.every(key => key in profile)) return false;
  
  // Validate personalData
  if (!profile.personalData || typeof profile.personalData !== 'object') return false;
  if (!profile.personalData.fullName || typeof profile.personalData.fullName !== 'string') return false;
  
  // Validate birthData
  if (!profile.birthData || typeof profile.birthData !== 'object') return false;
  if (!profile.birthData.birthDate) return false;
  
  // Validate archetypalSignature
  if (!profile.archetypalSignature || typeof profile.archetypalSignature !== 'object') return false;
  if (!profile.archetypalSignature.humanDesignType || !profile.archetypalSignature.enneagramType) return false;
  
  return true;
};

/**
 * Check if localStorage is available
 */
const isStorageAvailable = (): boolean => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Save consciousness profile to localStorage
 */
export const saveConsciousnessProfile = (profile: ConsciousnessProfile): boolean => {
  if (!isStorageAvailable()) {
    console.warn('localStorage not available');
    return false;
  }
  
  try {
    const cachedProfile: CachedProfile = {
      profile,
      timestamp: Date.now(),
      version: STORAGE_CONFIG.VERSION,
      checksum: generateChecksum(JSON.stringify(profile)),
    };
    
    const serialized = JSON.stringify(cachedProfile);
    const obfuscated = obfuscate(serialized);
    
    localStorage.setItem(STORAGE_CONFIG.PROFILE_KEY, obfuscated);
    
    // Clear any existing progress since profile is complete
    localStorage.removeItem(STORAGE_CONFIG.PROGRESS_KEY);
    
    console.log('Consciousness profile saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save consciousness profile:', error);
    return false;
  }
};

/**
 * Load consciousness profile from localStorage
 */
export const loadConsciousnessProfile = (): ConsciousnessProfile | null => {
  if (!isStorageAvailable()) {
    return null;
  }
  
  try {
    const obfuscated = localStorage.getItem(STORAGE_CONFIG.PROFILE_KEY);
    if (!obfuscated) {
      return null;
    }
    
    const serialized = deobfuscate(obfuscated);
    const cachedProfile: CachedProfile = JSON.parse(serialized);
    
    // Check cache expiration
    const now = Date.now();
    const age = now - cachedProfile.timestamp;
    if (age > STORAGE_CONFIG.CACHE_DURATION) {
      console.log('Cached profile expired, clearing storage');
      clearConsciousnessProfile();
      return null;
    }
    
    // Validate version compatibility
    if (cachedProfile.version !== STORAGE_CONFIG.VERSION) {
      console.log('Profile version mismatch, clearing storage');
      clearConsciousnessProfile();
      return null;
    }
    
    // Validate data integrity
    const currentChecksum = generateChecksum(JSON.stringify(cachedProfile.profile));
    if (currentChecksum !== cachedProfile.checksum) {
      console.warn('Profile data integrity check failed, clearing storage');
      clearConsciousnessProfile();
      return null;
    }
    
    // Validate profile structure
    if (!validateProfileStructure(cachedProfile.profile)) {
      console.warn('Invalid profile structure, clearing storage');
      clearConsciousnessProfile();
      return null;
    }
    
    console.log('Consciousness profile loaded successfully');
    return cachedProfile.profile;
  } catch (error) {
    console.error('Failed to load consciousness profile:', error);
    clearConsciousnessProfile();
    return null;
  }
};

/**
 * Save onboarding progress incrementally
 */
export const saveOnboardingProgress = (progress: OnboardingProgress): boolean => {
  if (!isStorageAvailable()) {
    return false;
  }
  
  try {
    const progressWithMeta = {
      ...progress,
      timestamp: Date.now(),
      version: STORAGE_CONFIG.VERSION,
    };
    
    const serialized = JSON.stringify(progressWithMeta);
    const obfuscated = obfuscate(serialized);
    
    localStorage.setItem(STORAGE_CONFIG.PROGRESS_KEY, obfuscated);
    return true;
  } catch (error) {
    console.error('Failed to save onboarding progress:', error);
    return false;
  }
};

/**
 * Load onboarding progress
 */
export const loadOnboardingProgress = (): OnboardingProgress | null => {
  if (!isStorageAvailable()) {
    return null;
  }
  
  try {
    const obfuscated = localStorage.getItem(STORAGE_CONFIG.PROGRESS_KEY);
    if (!obfuscated) {
      return null;
    }
    
    const serialized = deobfuscate(obfuscated);
    const progress: OnboardingProgress = JSON.parse(serialized);
    
    // Check progress expiration (shorter than profile cache)
    const now = Date.now();
    const age = now - progress.timestamp;
    const progressExpiration = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    if (age > progressExpiration) {
      clearOnboardingProgress();
      return null;
    }
    
    // Validate version compatibility
    if (progress.version !== STORAGE_CONFIG.VERSION) {
      clearOnboardingProgress();
      return null;
    }
    
    return progress;
  } catch (error) {
    console.error('Failed to load onboarding progress:', error);
    clearOnboardingProgress();
    return null;
  }
};

/**
 * Clear consciousness profile from localStorage
 */
export const clearConsciousnessProfile = (): void => {
  if (!isStorageAvailable()) {
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_CONFIG.PROFILE_KEY);
    console.log('Consciousness profile cleared');
  } catch (error) {
    console.error('Failed to clear consciousness profile:', error);
  }
};

/**
 * Clear onboarding progress from localStorage
 */
export const clearOnboardingProgress = (): void => {
  if (!isStorageAvailable()) {
    return;
  }
  
  try {
    localStorage.removeItem(STORAGE_CONFIG.PROGRESS_KEY);
    console.log('Onboarding progress cleared');
  } catch (error) {
    console.error('Failed to clear onboarding progress:', error);
  }
};

/**
 * Clear all WitnessOS data from localStorage
 */
export const clearAllWitnessOSData = (): void => {
  clearConsciousnessProfile();
  clearOnboardingProgress();
  console.log('All WitnessOS data cleared');
};

/**
 * Get cache information for debugging
 */
export const getCacheInfo = () => {
  if (!isStorageAvailable()) {
    return { available: false };
  }
  
  const profileExists = !!localStorage.getItem(STORAGE_CONFIG.PROFILE_KEY);
  const progressExists = !!localStorage.getItem(STORAGE_CONFIG.PROGRESS_KEY);
  
  let profileAge = 0;
  let progressAge = 0;
  
  if (profileExists) {
    try {
      const obfuscated = localStorage.getItem(STORAGE_CONFIG.PROFILE_KEY)!;
      const serialized = deobfuscate(obfuscated);
      const cached: CachedProfile = JSON.parse(serialized);
      profileAge = Date.now() - cached.timestamp;
    } catch {
      // Ignore errors for debug info
    }
  }
  
  if (progressExists) {
    try {
      const obfuscated = localStorage.getItem(STORAGE_CONFIG.PROGRESS_KEY)!;
      const serialized = deobfuscate(obfuscated);
      const progress: OnboardingProgress = JSON.parse(serialized);
      progressAge = Date.now() - progress.timestamp;
    } catch {
      // Ignore errors for debug info
    }
  }
  
  return {
    available: true,
    profile: {
      exists: profileExists,
      age: profileAge,
      expired: profileAge > STORAGE_CONFIG.CACHE_DURATION,
    },
    progress: {
      exists: progressExists,
      age: progressAge,
      expired: progressAge > (7 * 24 * 60 * 60 * 1000),
    },
    version: STORAGE_CONFIG.VERSION,
  };
};

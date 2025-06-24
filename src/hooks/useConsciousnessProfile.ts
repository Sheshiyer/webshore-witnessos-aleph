/**
 * Consciousness Profile Hook
 *
 * React hook for managing consciousness profile state with localStorage persistence
 * Handles loading, saving, and progressive persistence of onboarding data
 */

'use client';

import type { ConsciousnessProfile } from '@/components/ui/ConsciousnessDataCollector';
import {
  clearAllWitnessOSData,
  clearConsciousnessProfile,
  clearOnboardingProgress,
  getCacheInfo,
  loadConsciousnessProfile,
  loadOnboardingProgress,
  type OnboardingProgress,
  saveConsciousnessProfile,
  saveOnboardingProgress,
} from '@/utils/consciousness-storage';
import { useCallback, useEffect, useState } from 'react';

export interface ConsciousnessProfileState {
  // Profile data
  profile: ConsciousnessProfile | null;
  isLoaded: boolean;
  isLoading: boolean;

  // Onboarding state
  hasCompletedOnboarding: boolean;
  onboardingProgress: OnboardingProgress | null;

  // Cache information
  cacheInfo: ReturnType<typeof getCacheInfo>;

  // Actions
  saveProfile: (profile: ConsciousnessProfile) => boolean;
  updateProgress: (progress: OnboardingProgress) => boolean;
  clearProfile: () => void;
  clearProgress: () => void;
  clearAllData: () => void;
  refreshCacheInfo: () => void;

  // Validation
  isProfileValid: boolean;
  profileAge: number;
}

/**
 * Hook for managing consciousness profile with localStorage persistence
 */
export const useConsciousnessProfile = (): ConsciousnessProfileState => {
  const [profile, setProfile] = useState<ConsciousnessProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingProgress, setOnboardingProgress] = useState<OnboardingProgress | null>(null);
  const [cacheInfo, setCacheInfo] = useState(() => getCacheInfo());

  /**
   * Load profile and progress from localStorage on mount
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      try {
        // Load cached profile
        const cachedProfile = loadConsciousnessProfile();
        if (cachedProfile) {
          setProfile(cachedProfile);
          console.log('Loaded cached consciousness profile');
        }

        // Load onboarding progress (only if no complete profile)
        if (!cachedProfile) {
          const progress = loadOnboardingProgress();
          if (progress) {
            setOnboardingProgress(progress);
            console.log('Loaded onboarding progress');
          }
        }

        // Update cache info
        setCacheInfo(getCacheInfo());
      } catch (error) {
        console.error('Error loading consciousness data:', error);
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Save complete consciousness profile
   */
  const saveProfile = useCallback((newProfile: ConsciousnessProfile): boolean => {
    const success = saveConsciousnessProfile(newProfile);
    if (success) {
      setProfile(newProfile);
      setOnboardingProgress(null); // Clear progress since profile is complete
      setCacheInfo(getCacheInfo());
    }
    return success;
  }, []);

  /**
   * Update onboarding progress incrementally
   */
  const updateProgress = useCallback((progress: OnboardingProgress): boolean => {
    const success = saveOnboardingProgress(progress);
    if (success) {
      setOnboardingProgress(progress);
      setCacheInfo(getCacheInfo());
    }
    return success;
  }, []);

  /**
   * Clear consciousness profile
   */
  const clearProfile = useCallback(() => {
    clearConsciousnessProfile();
    setProfile(null);
    setCacheInfo(getCacheInfo());
  }, []);

  /**
   * Clear onboarding progress
   */
  const clearProgress = useCallback(() => {
    clearOnboardingProgress();
    setOnboardingProgress(null);
    setCacheInfo(getCacheInfo());
  }, []);

  /**
   * Clear all WitnessOS data
   */
  const clearAllData = useCallback(() => {
    clearAllWitnessOSData();
    setProfile(null);
    setOnboardingProgress(null);
    setCacheInfo(getCacheInfo());
  }, []);

  /**
   * Refresh cache information
   */
  const refreshCacheInfo = useCallback(() => {
    setCacheInfo(getCacheInfo());
  }, []);

  // Computed values
  const hasCompletedOnboarding = !!profile;
  const isProfileValid =
    !!profile && cacheInfo.available && cacheInfo.profile?.exists && !cacheInfo.profile?.expired;
  const profileAge = cacheInfo.profile?.age || 0;

  return {
    // Profile data
    profile,
    isLoaded,
    isLoading,

    // Onboarding state
    hasCompletedOnboarding,
    onboardingProgress,

    // Cache information
    cacheInfo,

    // Actions
    saveProfile,
    updateProgress,
    clearProfile,
    clearProgress,
    clearAllData,
    refreshCacheInfo,

    // Validation
    isProfileValid,
    profileAge,
  };
};

/**
 * Helper hook for onboarding flow management
 */
export const useOnboardingFlow = () => {
  const profileState = useConsciousnessProfile();

  /**
   * Determine if onboarding should be skipped
   */
  const shouldSkipOnboarding = useCallback((): boolean => {
    return profileState.isLoaded && profileState.isProfileValid;
  }, [profileState.isLoaded, profileState.isProfileValid]);

  /**
   * Get initial onboarding step based on progress
   */
  const getInitialStep = useCallback((): number => {
    if (profileState.onboardingProgress) {
      return profileState.onboardingProgress.currentStep;
    }
    return 0;
  }, [profileState.onboardingProgress]);

  /**
   * Get partial data for resuming onboarding
   */
  const getPartialData = useCallback((): Partial<ConsciousnessProfile> | null => {
    return profileState.onboardingProgress?.partialData || null;
  }, [profileState.onboardingProgress]);

  /**
   * Save step completion
   */
  const saveStepCompletion = useCallback(
    (
      step: number,
      totalSteps: number,
      stepName: string,
      partialData: Partial<ConsciousnessProfile>
    ): boolean => {
      const progress: OnboardingProgress = {
        currentStep: step,
        totalSteps,
        completedSteps: [
          ...(profileState.onboardingProgress?.completedSteps || []),
          stepName,
        ].filter((step, index, array) => array.indexOf(step) === index), // Remove duplicates
        partialData,
        timestamp: Date.now(),
        version: '1.0.0',
      };

      return profileState.updateProgress(progress);
    },
    [profileState]
  );

  /**
   * Complete onboarding with final profile
   */
  const completeOnboarding = useCallback(
    (profile: ConsciousnessProfile): boolean => {
      const success = profileState.saveProfile(profile);
      if (success) {
        // Clear progress since onboarding is complete
        profileState.clearProgress();
      }
      return success;
    },
    [profileState]
  );

  return {
    ...profileState,
    shouldSkipOnboarding,
    getInitialStep,
    getPartialData,
    saveStepCompletion,
    completeOnboarding,
  };
};

export default useConsciousnessProfile;

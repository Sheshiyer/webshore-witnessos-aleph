/**
 * Simple Consciousness Profile Hook
 * Basic profile management with localStorage and cloud sync
 */

'use client';

import type { ConsciousnessProfile } from '@/components/ui/ConsciousnessDataCollector';
import {
  saveConsciousnessProfile,
  loadConsciousnessProfile,
  clearConsciousnessProfile,
  hasStoredProfile,
} from '@/utils/consciousness-storage';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/utils/api-client';

export interface ConsciousnessProfileState {
  // Profile data
  profile: ConsciousnessProfile | null;
  isLoaded: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;

  // Cloud sync state
  isSyncing: boolean;
  syncError: string | null;

  // Actions
  saveProfile: (profile: ConsciousnessProfile) => boolean;
  clearProfile: () => void;
  uploadToCloud: (profileToUpload?: ConsciousnessProfile) => Promise<boolean>;
  downloadFromCloud: () => Promise<boolean>;
}

/**
 * Simple hook for managing consciousness profile
 */
export const useConsciousnessProfile = (): ConsciousnessProfileState => {
  const [profile, setProfile] = useState<ConsciousnessProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();

  // Determine if onboarding is complete from the authoritative user object
  const hasCompletedOnboarding = useMemo(() => !!user?.has_completed_onboarding, [user]);

  /**
   * Load profile from localStorage on mount
   */
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        const storedProfile = loadConsciousnessProfile();
        if (storedProfile) {
          setProfile(storedProfile);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setIsLoaded(true);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  /**
   * Save profile to localStorage
   */
  const saveProfile = useCallback((newProfile: ConsciousnessProfile): boolean => {
    const success = saveConsciousnessProfile(newProfile);
    if (success) {
      setProfile(newProfile);
    }
    return success;
  }, []);

  /**
   * Clear profile from localStorage
   */
  const clearProfile = useCallback(() => {
    clearConsciousnessProfile();
    setProfile(null);
  }, []);

  /**
   * Upload profile to cloud
   */
  const uploadToCloud = useCallback(async (profileToUpload?: ConsciousnessProfile): Promise<boolean> => {
    if (!isAuthenticated) {
      setSyncError('Authentication required');
      return false;
    }

    const targetProfile = profileToUpload || profile;
    if (!targetProfile) {
      setSyncError('No profile to upload');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      console.log('🔄 Uploading consciousness profile to cloud...');
      const response = await apiClient.uploadConsciousnessProfile(targetProfile);

      if (response.success) {
        console.log('✅ Consciousness profile uploaded successfully');

        // Trigger a user data refresh to get the updated has_completed_onboarding flag
        // This will cause the auth context to re-fetch user data
        window.dispatchEvent(new CustomEvent('auth:refresh-user'));

        return true;
      } else {
        console.error('❌ Upload failed:', response.error);
        setSyncError(response.error || 'Upload failed');
        return false;
      }
    } catch (error) {
      console.error('Upload error:', error);
      setSyncError(error instanceof Error ? error.message : 'Upload failed');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, profile]);

  /**
   * Download profile from cloud
   */
  const downloadFromCloud = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      setSyncError('Authentication required');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const response = await apiClient.downloadConsciousnessProfile();
      if (response.success && response.data) {
        const cloudProfile = response.data;
        saveConsciousnessProfile(cloudProfile);
        setProfile(cloudProfile);
        return true;
      } else {
        setSyncError('Download failed');
        return false;
      }
    } catch (error) {
      console.error('Download error:', error);
      setSyncError(error instanceof Error ? error.message : 'Download failed');
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated]);

  return {
    profile,
    isLoaded,
    isLoading,
    hasCompletedOnboarding,
    isSyncing,
    syncError,
    saveProfile,
    clearProfile,
    uploadToCloud,
    downloadFromCloud,
  };
};

/**
 * Simple onboarding flow helper
 */
export const useOnboardingFlow = () => {
  const { profile, isLoaded } = useConsciousnessProfile();
  const { user } = useAuth();

  // The single source of truth for onboarding completion
  const isOnboardingComplete = useMemo(() => !!user?.has_completed_onboarding, [user]);

  return {
    isOnboardingComplete,
    hasStoredProfile: () => hasStoredProfile(),
    isDataLoaded: isLoaded,
  };
};

/**
 * Consciousness Engine Auto-Save Hook
 * 
 * Provides automatic saving of consciousness engine calculation results
 * to the cloud storage when users are authenticated.
 */

import { useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReadingHistory } from './useReadingHistory';
import type { BaseEngineOutput } from '@/engines/core/types';
import type { EngineName } from '@/types/engines';

export interface AutoSaveOptions {
  enabled?: boolean;
  debounceMs?: number;
  includeInput?: boolean;
  customMetadata?: Record<string, any>;
}

export interface AutoSaveResult {
  success: boolean;
  readingId?: string | undefined;
  error?: string | undefined;
  skipped?: boolean | undefined;
  reason?: string | undefined;
}

export function useConsciousnessEngineAutoSave(options: AutoSaveOptions = {}) {
  const {
    enabled = true,
    debounceMs = 2000,
    includeInput = true,
    customMetadata = {}
  } = options;

  const { isAuthenticated, user } = useAuth();
  const { autoSaveReading, isAutoSaving, autoSaveError, autoSaveCount } = useReadingHistory({
    enableAutoSave: enabled
  });

  // Debounce mechanism to prevent rapid-fire saves
  const debounceTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const lastSaveAttempts = useRef<Map<string, number>>(new Map());

  /**
   * Auto-save consciousness engine results with intelligent debouncing
   */
  const saveEngineResult = useCallback(async (
    engineName: EngineName,
    engineOutput: BaseEngineOutput,
    inputData?: any,
    metadata?: Record<string, any>
  ): Promise<AutoSaveResult> => {
    // Check if auto-save is enabled and user is authenticated
    if (!enabled) {
      return { 
        success: false, 
        skipped: true, 
        reason: 'Auto-save disabled' 
      };
    }

    if (!isAuthenticated || !user) {
      return { 
        success: false, 
        skipped: true, 
        reason: 'User not authenticated' 
      };
    }

    // Create a unique key for this engine result
    const resultKey = `${engineName}-${engineOutput.timestamp}`;
    
    // Check if we recently attempted to save this result
    const lastAttempt = lastSaveAttempts.current.get(resultKey);
    const now = Date.now();
    
    if (lastAttempt && (now - lastAttempt) < debounceMs) {
      console.log(`⏱️ Debouncing auto-save for ${engineName} (${now - lastAttempt}ms ago)`);
      return { 
        success: false, 
        skipped: true, 
        reason: 'Debounced - too recent' 
      };
    }

    // Clear any existing timeout for this engine
    const existingTimeout = debounceTimeouts.current.get(engineName);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set up debounced save
    return new Promise((resolve) => {
      const timeoutId = setTimeout(async () => {
        try {
          // Record this save attempt
          lastSaveAttempts.current.set(resultKey, now);
          
          console.log(`🔄 Auto-saving ${engineName} result...`);
          
          // Prepare enhanced metadata
          const enhancedMetadata = {
            ...customMetadata,
            ...metadata,
            autoSaveTimestamp: new Date().toISOString(),
            engineVersion: engineOutput.engineName,
            confidenceScore: engineOutput.confidenceScore,
            calculationTime: engineOutput.calculationTime,
            archetypalThemes: engineOutput.archetypalThemes,
            realityPatches: engineOutput.realityPatches,
            userId: user.id,
            sessionId: `consciousness-${Date.now()}`
          };

          // Attempt auto-save
          const result = await autoSaveReading(
            engineName,
            engineOutput,
            includeInput ? inputData : undefined,
            enhancedMetadata
          );

          if (result.success) {
            console.log(`✅ Successfully auto-saved ${engineName} reading`);
            resolve({
              success: true,
              readingId: result.readingId || undefined
            });
          } else {
            console.warn(`⚠️ Auto-save failed for ${engineName}:`, result.error);
            resolve({
              success: false,
              error: result.error || 'Unknown auto-save error'
            });
          }

        } catch (error) {
          console.error(`❌ Auto-save error for ${engineName}:`, error);
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        } finally {
          // Clean up timeout reference
          debounceTimeouts.current.delete(engineName);
        }
      }, debounceMs);

      // Store timeout reference
      debounceTimeouts.current.set(engineName, timeoutId);
    });
  }, [enabled, isAuthenticated, user, debounceMs, includeInput, customMetadata, autoSaveReading]);

  /**
   * Save multiple engine results from a comprehensive reading
   */
  const saveComprehensiveReading = useCallback(async (
    engineResults: Record<EngineName, BaseEngineOutput>,
    inputData?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<Record<EngineName, AutoSaveResult>> => {
    const results: Record<string, AutoSaveResult> = {};

    // Save each engine result
    const savePromises = Object.entries(engineResults).map(async ([engineName, output]) => {
      const engineInputData = inputData?.[engineName];
      const result = await saveEngineResult(
        engineName as EngineName,
        output,
        engineInputData,
        {
          ...metadata,
          comprehensiveReading: true,
          totalEngines: Object.keys(engineResults).length
        }
      );
      results[engineName] = result;
    });

    await Promise.all(savePromises);
    return results;
  }, [saveEngineResult]);

  /**
   * Clear all pending auto-save operations
   */
  const clearPendingAutoSaves = useCallback(() => {
    debounceTimeouts.current.forEach((timeout) => {
      clearTimeout(timeout);
    });
    debounceTimeouts.current.clear();
    lastSaveAttempts.current.clear();
    console.log('🧹 Cleared all pending auto-save operations');
  }, []);

  /**
   * Get auto-save statistics
   */
  const getAutoSaveStats = useCallback(() => {
    return {
      totalSaved: autoSaveCount,
      pendingOperations: debounceTimeouts.current.size,
      lastError: autoSaveError,
      isCurrentlySaving: isAutoSaving,
      isEnabled: enabled && isAuthenticated
    };
  }, [autoSaveCount, autoSaveError, isAutoSaving, enabled, isAuthenticated]);

  return {
    // Core auto-save functions
    saveEngineResult,
    saveComprehensiveReading,
    clearPendingAutoSaves,

    // Status and statistics
    isAutoSaving,
    autoSaveError,
    autoSaveCount,
    getAutoSaveStats,

    // Configuration
    isEnabled: enabled && isAuthenticated,
    debounceMs
  };
} 
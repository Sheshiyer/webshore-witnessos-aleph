/**
 * Reading History Management Hook
 * 
 * Provides comprehensive reading history functionality for the frontend
 * including saving, retrieving, deleting, and favoriting readings.
 * Enhanced with auto-save functionality for consciousness engine results.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { BaseEngineOutput } from '@/engines/core/types';
import type { EngineName } from '@/types/engines';

export interface Reading {
  id: string;
  userId: string;
  timestamp: string;
  type: string;
  results: any;
  engines: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface ReadingHistoryState {
  readings: Reading[];
  loading: boolean;
  error: string | null;
  total: number;
}

export interface UseReadingHistoryOptions {
  userId?: string;
  limit?: number;
  timeRange?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableAutoSave?: boolean;
}

export interface AutoSaveState {
  isAutoSaving: boolean;
  lastAutoSave: string | null;
  autoSaveError: string | null;
  autoSaveCount: number;
}

export function useReadingHistory(options: UseReadingHistoryOptions = {}) {
  const { 
    userId, 
    limit = 10, 
    timeRange = '30d', 
    autoRefresh = false, 
    refreshInterval = 30000,
    enableAutoSave = true 
  } = options;
  
  const { isAuthenticated, user } = useAuth();
  const effectiveUserId = userId || user?.id || '';
  
  const [state, setState] = useState<ReadingHistoryState>({
    readings: [],
    loading: false,
    error: null,
    total: 0
  });

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    isAutoSaving: false,
    lastAutoSave: null,
    autoSaveError: null,
    autoSaveCount: 0
  });

  // Get API base URL from environment
  const getApiUrl = useCallback(() => {
    if (typeof window !== 'undefined') {
      return process.env.NODE_ENV === 'production' 
        ? 'https://api.witnessos.space'
        : 'https://witnessos-backend.sheshnarayan-iyer.workers.dev';
    }
    return 'https://witnessos-backend.sheshnarayan-iyer.workers.dev';
  }, []);

  // Auto-save reading results from consciousness engines
  const autoSaveReading = useCallback(async (
    engineName: EngineName,
    engineOutput: BaseEngineOutput,
    inputData?: any,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; readingId?: string; error?: string }> => {
    if (!enableAutoSave || !isAuthenticated || !effectiveUserId) {
      console.log('⚠️ Auto-save skipped: not authenticated or disabled');
      return { success: false, error: 'Auto-save not available' };
    }

    setAutoSaveState(prev => ({ 
      ...prev, 
      isAutoSaving: true, 
      autoSaveError: null 
    }));

    try {
      console.log(`☁️✨ Auto-saving ${engineName} reading...`);

      const reading = {
        type: `${engineName}_reading`,
        results: {
          engineName,
          output: engineOutput,
          input: inputData,
          metadata: {
            ...metadata,
            autoSaved: true,
            calculationTime: engineOutput.calculationTime,
            confidenceScore: engineOutput.confidenceScore,
            timestamp: engineOutput.timestamp
          }
        },
        engines: [engineName],
        notes: `Auto-saved ${engineName} reading - ${engineOutput.archetypalThemes?.join(', ') || 'Consciousness exploration'}`
      };

      const response = await fetch(`${getApiUrl()}/api/readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('witnessOS_token')}`
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          reading
        })
      });

      if (!response.ok) {
        throw new Error(`Auto-save failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      setAutoSaveState(prev => ({
        ...prev,
        isAutoSaving: false,
        lastAutoSave: new Date().toISOString(),
        autoSaveCount: prev.autoSaveCount + 1,
        autoSaveError: null
      }));

      // Refresh reading history in background
      setTimeout(() => {
        refreshReadings();
      }, 1000);

      console.log(`✨ ${engineName} reading auto-saved successfully`);
      return { success: true, readingId: result.readingId };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Auto-save failed';
      
      setAutoSaveState(prev => ({
        ...prev,
        isAutoSaving: false,
        autoSaveError: errorMessage
      }));

      console.error(`❌ Auto-save error for ${engineName}:`, error);
      return { success: false, error: errorMessage };
    }
  }, [enableAutoSave, isAuthenticated, effectiveUserId, getApiUrl]);

  // Save a new reading (manual save)
  const saveReading = useCallback(async (reading: Omit<Reading, 'id' | 'userId' | 'timestamp' | 'favorite' | 'createdAt' | 'updatedAt'>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${getApiUrl()}/api/readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('witnessOS_token')}`
        },
        body: JSON.stringify({
          userId: effectiveUserId,
          reading
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save reading: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Refresh the reading history
      await refreshReadings();
      
      return { success: true, readingId: result.readingId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save reading';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  }, [effectiveUserId, getApiUrl]);

  // Get reading history
  const refreshReadings = useCallback(async () => {
    if (!effectiveUserId) return [];
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const url = new URL(`${getApiUrl()}/api/readings/history`);
      url.searchParams.set('userId', effectiveUserId);
      url.searchParams.set('limit', limit.toString());
      url.searchParams.set('timeRange', timeRange);

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('witnessOS_token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch readings: ${response.statusText}`);
      }

      const data = await response.json();
      
      setState(prev => ({
        ...prev,
        readings: data.readings || [],
        total: data.total || 0,
        loading: false,
        error: null
      }));

      return data.readings || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch readings';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        loading: false,
        readings: [],
        total: 0
      }));
      return [];
    }
  }, [effectiveUserId, limit, timeRange, getApiUrl]);

  // Get a specific reading
  const getReading = useCallback(async (readingId: string): Promise<Reading | null> => {
    try {
      const response = await fetch(`${getApiUrl()}/api/readings/${readingId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('witnessOS_token')}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch reading: ${response.statusText}`);
      }

      const data = await response.json();
      return data.reading;
    } catch (error) {
      console.error('Failed to get reading:', error);
      return null;
    }
  }, [getApiUrl]);

  // Delete a reading
  const deleteReading = useCallback(async (readingId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${getApiUrl()}/api/readings/${readingId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('witnessOS_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete reading: ${response.statusText}`);
      }

      // Remove from local state
      setState(prev => ({
        ...prev,
        readings: prev.readings.filter(r => r.id !== readingId),
        total: Math.max(0, prev.total - 1),
        loading: false
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete reading';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  }, [getApiUrl]);

  // Toggle favorite status
  const toggleFavorite = useCallback(async (readingId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await fetch(`${getApiUrl()}/api/readings/${readingId}/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('witnessOS_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle favorite: ${response.statusText}`);
      }

      const result = await response.json();

      // Update local state
      setState(prev => ({
        ...prev,
        readings: prev.readings.map(r => 
          r.id === readingId ? { ...r, favorite: result.favorite } : r
        ),
        loading: false
      }));

      return { success: true, favorite: result.favorite };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle favorite';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      return { success: false, error: errorMessage };
    }
  }, [getApiUrl]);

  // Search readings
  const searchReadings = useCallback((query: string): Reading[] => {
    if (!query.trim()) return state.readings;
    
    const searchTerm = query.toLowerCase();
    return state.readings.filter(reading => 
      reading.type.toLowerCase().includes(searchTerm) ||
      reading.engines.some(engine => engine.toLowerCase().includes(searchTerm)) ||
      reading.notes?.toLowerCase().includes(searchTerm) ||
      JSON.stringify(reading.results).toLowerCase().includes(searchTerm)
    );
  }, [state.readings]);

  // Get favorite readings
  const getFavoriteReadings = useCallback((): Reading[] => {
    return state.readings.filter(reading => reading.favorite);
  }, [state.readings]);

  // Get readings by engine
  const getReadingsByEngine = useCallback((engineName: string): Reading[] => {
    return state.readings.filter(reading => reading.engines.includes(engineName));
  }, [state.readings]);

  // Get reading statistics
  const getStatistics = useCallback(() => {
    const readings = state.readings;
    const favorites = readings.filter(r => r.favorite).length;
    const recentActivity = readings.filter(r => {
      const readingDate = new Date(r.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return readingDate >= weekAgo;
    }).length;

    const byEngine = readings.reduce((acc, reading) => {
      reading.engines.forEach(engine => {
        acc[engine] = (acc[engine] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      total: readings.length,
      favorites,
      recentActivity,
      byEngine,
      autoSaveCount: autoSaveState.autoSaveCount
    };
  }, [state.readings, autoSaveState.autoSaveCount]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && effectiveUserId) {
      const interval = setInterval(refreshReadings, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, refreshReadings, effectiveUserId]);

  // Initial load effect
  useEffect(() => {
    if (effectiveUserId) {
      refreshReadings();
    }
  }, [effectiveUserId, refreshReadings]);

  // Computed properties
  const hasReadings = state.readings.length > 0;
  const isEmpty = !hasReadings && !state.loading;
  const favoriteCount = state.readings.filter(r => r.favorite).length;

  return {
    // Reading state
    readings: state.readings,
    loading: state.loading,
    error: state.error,
    total: state.total,
    hasReadings,
    isEmpty,
    favoriteCount,

    // Auto-save state
    isAutoSaving: autoSaveState.isAutoSaving,
    lastAutoSave: autoSaveState.lastAutoSave,
    autoSaveError: autoSaveState.autoSaveError,
    autoSaveCount: autoSaveState.autoSaveCount,

    // Reading operations
    saveReading,
    autoSaveReading,
    deleteReading,
    toggleFavorite,
    refreshReadings,
    getReading,

    // Search and filtering
    searchReadings,
    getFavoriteReadings,
    getReadingsByEngine,
    getStatistics
  };
} 
/**
 * Reading Storage & Persistence - WitnessOS Raycast Extension
 * 
 * Handles automatic storage of consciousness engine calculations,
 * reading history retrieval, and user activity tracking.
 */

import { getPreferenceValues } from '@raycast/api';
import AdminConfig from '../config/admin-profile';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ReadingRecord {
  id?: string;
  userId: number;
  engineName: string;
  inputParameters: Record<string, any>;
  result: any;
  metadata: {
    source: 'raycast_extension';
    timestamp: string;
    executionTime: number;
    version: string;
  };
}

export interface UserAction {
  userId: number;
  action: string;
  source: 'raycast_extension';
  metadata: {
    engineName?: string;
    executionTime?: number;
    success: boolean;
    timestamp: string;
    [key: string]: any;
  };
}

export interface ReadingHistoryOptions {
  limit?: number;
  timeRange?: string;
  engine?: string;
  includeMetadata?: boolean;
}

export interface UsageStatistics {
  totalReadings: number;
  engineBreakdown: Record<string, number>;
  averageExecutionTime: number;
  successRate: number;
  mostActiveDay: string;
  streakDays: number;
  favoriteEngines: string[];
  peakUsageHours: number[];
}

// ============================================================================
// READING STORAGE FUNCTIONS
// ============================================================================

/**
 * Store a consciousness engine reading result
 */
export async function storeReading(reading: Omit<ReadingRecord, 'id' | 'userId'>): Promise<string> {
  const preferences = getPreferenceValues();
  const userId = AdminConfig.profile.id;

  try {
    const response = await fetch(`${preferences.apiBaseUrl}/api/readings/store`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${preferences.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        ...reading
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to store reading: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`Storage failed: ${data.error?.message || 'Unknown error'}`);
    }

    return data.data.readingId;

  } catch (error) {
    console.error('Reading storage failed:', error);
    
    // Store locally as fallback
    await storeReadingLocally(reading);
    
    // Re-throw for caller to handle
    throw error;
  }
}

/**
 * Get reading history from backend
 */
export async function getReadingHistory(options: ReadingHistoryOptions = {}): Promise<ReadingRecord[]> {
  const preferences = getPreferenceValues();
  const userId = AdminConfig.profile.id;

  const params = new URLSearchParams({
    userId: userId.toString(),
    limit: (options.limit || 50).toString(),
    timeRange: options.timeRange || '30d',
    ...(options.engine && { engine: options.engine }),
    ...(options.includeMetadata && { includeMetadata: 'true' })
  });

  try {
    const response = await fetch(`${preferences.apiBaseUrl}/api/readings/history?${params}`, {
      headers: {
        'Authorization': `Bearer ${preferences.apiToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch reading history: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(`History fetch failed: ${data.error?.message || 'Unknown error'}`);
    }

    return data.data.readings;

  } catch (error) {
    console.error('Reading history fetch failed:', error);
    
    // Fallback to local storage
    return await getLocalReadingHistory(options);
  }
}

/**
 * Get specific reading by ID
 */
export async function getReading(readingId: string): Promise<ReadingRecord | null> {
  const preferences = getPreferenceValues();

  try {
    const response = await fetch(`${preferences.apiBaseUrl}/api/readings/${readingId}`, {
      headers: {
        'Authorization': `Bearer ${preferences.apiToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch reading: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data.reading : null;

  } catch (error) {
    console.error('Reading fetch failed:', error);
    return null;
  }
}

/**
 * Get reading statistics
 */
export async function getReadingStatistics(timeRange: string = '30d'): Promise<UsageStatistics | null> {
  const preferences = getPreferenceValues();
  const userId = AdminConfig.profile.id;

  try {
    const response = await fetch(`${preferences.apiBaseUrl}/api/readings/stats?userId=${userId}&timeRange=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${preferences.apiToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch statistics: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;

  } catch (error) {
    console.error('Statistics fetch failed:', error);
    return null;
  }
}

// ============================================================================
// USER ACTION TRACKING
// ============================================================================

/**
 * Log user action for analytics
 */
export async function logAction(action: string, metadata: Record<string, any> = {}): Promise<void> {
  const preferences = getPreferenceValues();
  const userId = AdminConfig.profile.id;

  const actionData: UserAction = {
    userId,
    action,
    source: 'raycast_extension',
    metadata: {
      ...metadata,
      success: metadata.success !== false, // Default to true unless explicitly false
      timestamp: new Date().toISOString()
    }
  };

  try {
    const response = await fetch(`${preferences.apiBaseUrl}/api/analytics/action`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${preferences.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(actionData)
    });

    if (!response.ok) {
      console.warn(`Action logging failed: ${response.status} ${response.statusText}`);
    }

  } catch (error) {
    console.warn('Action logging failed:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

/**
 * Get user activity statistics
 */
export async function getUserActivityStats(timeRange: string = '30d'): Promise<any> {
  const preferences = getPreferenceValues();
  const userId = AdminConfig.profile.id;

  try {
    const response = await fetch(`${preferences.apiBaseUrl}/api/analytics/user-stats?userId=${userId}&timeRange=${timeRange}`, {
      headers: {
        'Authorization': `Bearer ${preferences.apiToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user stats: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.success ? data.data : null;

  } catch (error) {
    console.error('User stats fetch failed:', error);
    return null;
  }
}

// ============================================================================
// LOCAL STORAGE FALLBACKS
// ============================================================================

const LOCAL_STORAGE_KEY = 'witnessos_readings';
const LOCAL_ACTIONS_KEY = 'witnessos_actions';

/**
 * Store reading locally as fallback
 */
async function storeReadingLocally(reading: Omit<ReadingRecord, 'id' | 'userId'>): Promise<void> {
  try {
    const existingReadings = await getLocalReadings();
    const newReading: ReadingRecord = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: AdminConfig.profile.id,
      ...reading
    };

    existingReadings.push(newReading);
    
    // Keep only last 100 readings locally
    const trimmedReadings = existingReadings.slice(-100);
    
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(trimmedReadings));
    
  } catch (error) {
    console.error('Local storage failed:', error);
  }
}

/**
 * Get readings from local storage
 */
async function getLocalReadings(): Promise<ReadingRecord[]> {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Local storage read failed:', error);
    return [];
  }
}

/**
 * Get reading history from local storage
 */
async function getLocalReadingHistory(options: ReadingHistoryOptions): Promise<ReadingRecord[]> {
  const readings = await getLocalReadings();
  
  let filtered = readings;
  
  // Filter by engine if specified
  if (options.engine) {
    filtered = filtered.filter(r => r.engineName === options.engine);
  }
  
  // Apply limit
  if (options.limit) {
    filtered = filtered.slice(-options.limit);
  }
  
  return filtered.reverse(); // Most recent first
}

// ============================================================================
// ENHANCED CALCULATION WITH STORAGE
// ============================================================================

/**
 * Perform calculation with automatic storage and tracking
 */
export async function calculateWithStorage(
  engineName: string,
  inputParameters: Record<string, any>,
  calculateFunction: () => Promise<any>
): Promise<{ result: any; readingId?: string }> {
  
  const startTime = Date.now();
  
  try {
    // Log calculation start
    await logAction('calculation_started', {
      engineName,
      inputParameters: Object.keys(inputParameters)
    });

    // Perform calculation
    const result = await calculateFunction();
    const executionTime = Date.now() - startTime;

    // Store reading
    let readingId: string | undefined;
    try {
      readingId = await storeReading({
        engineName,
        inputParameters,
        result,
        metadata: {
          source: 'raycast_extension',
          timestamp: new Date().toISOString(),
          executionTime,
          version: '1.0.0'
        }
      });
    } catch (storageError) {
      console.warn('Reading storage failed, continuing without storage:', storageError);
    }

    // Log successful calculation
    await logAction('calculation_completed', {
      engineName,
      executionTime,
      success: true,
      readingId
    });

    return { result, readingId };

  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    // Log failed calculation
    await logAction('calculation_failed', {
      engineName,
      executionTime,
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
 * Clear local storage (for testing/debugging)
 */
export async function clearLocalStorage(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(LOCAL_ACTIONS_KEY);
  } catch (error) {
    console.error('Failed to clear local storage:', error);
  }
}

/**
 * Sync local readings to backend (when connection is restored)
 */
export async function syncLocalReadings(): Promise<number> {
  const localReadings = await getLocalReadings();
  const localOnlyReadings = localReadings.filter(r => r.id?.startsWith('local_'));
  
  let syncedCount = 0;
  
  for (const reading of localOnlyReadings) {
    try {
      await storeReading({
        engineName: reading.engineName,
        inputParameters: reading.inputParameters,
        result: reading.result,
        metadata: reading.metadata
      });
      syncedCount++;
    } catch (error) {
      console.warn('Failed to sync reading:', reading.id, error);
    }
  }
  
  return syncedCount;
}

/**
 * Get reading summary for display
 */
export function formatReadingSummary(reading: ReadingRecord): string {
  const date = new Date(reading.metadata.timestamp).toLocaleDateString();
  const time = new Date(reading.metadata.timestamp).toLocaleTimeString();
  const engine = reading.engineName.replace('_', ' ').toUpperCase();
  
  return `${engine} - ${date} at ${time} (${reading.metadata.executionTime}ms)`;
}

/**
 * Export all functions for easy import
 */
export default {
  // Storage functions
  storeReading,
  getReadingHistory,
  getReading,
  getReadingStatistics,
  
  // Action tracking
  logAction,
  getUserActivityStats,
  
  // Enhanced calculation
  calculateWithStorage,
  
  // Utilities
  clearLocalStorage,
  syncLocalReadings,
  formatReadingSummary
};

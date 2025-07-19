/**
 * Cloudflare Workers KV Data Access Layer
 * 
 * Implements the KV operations interface for engine data management
 * in the Cloudflare Workers environment.
 */

import { KVOperations, KVKeyGenerator, CACHE_TTL_CONFIG } from './kv-schema';
import {
  TimelineEntry,
  TimelineQuery,
  TimelineResponse,
  TimelineStats,
  TimelineIndex,
  TimelineEntryType
} from '../types/timeline';

// KV Namespace interface (Cloudflare Workers global)
interface KVNamespace {
  get(key: string, options?: { type?: 'json' | 'text' | 'arrayBuffer' | 'stream' }): Promise<any>;
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string; limit?: number; cursor?: string }): Promise<{
    keys: Array<{ name: string; expiration?: number; metadata?: any }>;
    list_complete: boolean;
    cursor?: string;
  }>;
}

export class CloudflareKVDataAccess implements KVOperations {
  constructor(
    private engineData: KVNamespace,
    private userProfiles: KVNamespace,
    private cache: KVNamespace,
    private timelineData: KVNamespace,
    private secrets?: KVNamespace
  ) {}

  // Engine Data Operations
  async getEngineData<T = any>(engineName: string, dataType: string): Promise<T | null> {
    const key = KVKeyGenerator.engineData(engineName, dataType);
    try {
      const data = await this.engineData.get(key, { type: 'json' });
      return data as T;
    } catch (error) {
      console.error(`Failed to get engine data ${key}:`, error);
      return null;
    }
  }

  async setEngineData<T = any>(engineName: string, dataType: string, data: T): Promise<void> {
    const key = KVKeyGenerator.engineData(engineName, dataType);
    try {
      await this.engineData.put(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Failed to set engine data ${key}:`, error);
      throw error;
    }
  }

  // User Profile Operations
  async getUserProfile(userId: string, engineName: string, timestamp?: string): Promise<any | null> {
    let key: string;
    
    if (timestamp) {
      key = KVKeyGenerator.userProfile(userId, engineName, timestamp);
    } else {
      // Get the most recent profile
      const prefix = `user:${userId}:${engineName}:`;
      const list = await this.userProfiles.list({ prefix, limit: 1 });
      if (!list.keys.length) return null;
      const keyName = list.keys[0]?.name;
      if (!keyName) return null;
      key = keyName;
    }

    try {
      const data = await this.userProfiles.get(key, { type: 'json' });
      return data;
    } catch (error) {
      console.error(`Failed to get user profile ${key}:`, error);
      return null;
    }
  }

  async setUserProfile(
    userId: string,
    engineName: string,
    data: any,
    options: {
      priority?: 'high' | 'normal' | 'low';
      compress?: boolean;
      metadata?: any;
    } = {}
  ): Promise<{ timestamp: string; size: number; compressed: boolean }> {
    const timestamp = new Date().toISOString();
    const key = KVKeyGenerator.userProfile(userId, engineName, timestamp);
    const { priority = 'normal', compress = false, metadata } = options;

    try {
      // Phase 1: User Profile Persistence Enhancement
      // Optimize for birth data and preference storage with <50ms access time

      const profileData = {
        ...data,
        userId,
        engineName,
        timestamp,
        createdAt: timestamp,
        priority,
        metadata: {
          ...metadata,
          version: '1.1',
          optimized: true,
          accessPattern: this.determineAccessPattern(engineName, data)
        }
      };

      // Compress large profile data if requested or if data is large
      let serializedData = JSON.stringify(profileData);
      let isCompressed = false;

      if (compress || serializedData.length > 10000) { // 10KB threshold
        try {
          // Simple compression by removing whitespace and optimizing structure
          serializedData = JSON.stringify(profileData, null, 0);
          isCompressed = true;
        } catch (compressionError) {
          console.warn('Profile compression failed, using uncompressed data:', compressionError);
        }
      }

      // Set TTL based on priority and data type
      let ttl = CACHE_TTL_CONFIG.user_profiles;
      if (priority === 'high' || this.isBirthData(data)) {
        ttl = CACHE_TTL_CONFIG.user_profiles * 2; // Double TTL for important data
      } else if (priority === 'low') {
        ttl = Math.floor(CACHE_TTL_CONFIG.user_profiles * 0.5); // Half TTL for low priority
      }

      await this.userProfiles.put(
        key,
        serializedData,
        { expirationTtl: ttl }
      );

      // Also store a quick-access version for frequently accessed profiles
      if (this.isFrequentlyAccessed(engineName)) {
        const quickAccessKey = `quick:${userId}:${engineName}`;
        const quickData = {
          timestamp,
          key,
          summary: this.createProfileSummary(data),
          lastAccessed: timestamp
        };

        await this.userProfiles.put(
          quickAccessKey,
          JSON.stringify(quickData),
          { expirationTtl: 3600 } // 1 hour for quick access
        );
      }

      return {
        timestamp,
        size: serializedData.length,
        compressed: isCompressed
      };
    } catch (error) {
      console.error(`Failed to set user profile ${key}:`, error);
      throw error;
    }
  }

  // Helper methods for profile optimization
  private determineAccessPattern(engineName: string, data: any): string {
    // Determine likely access pattern based on engine and data type
    if (this.isBirthData(data)) return 'frequent';
    if (['numerology', 'biorhythm'].includes(engineName)) return 'frequent';
    if (['human_design', 'vimshottari'].includes(engineName)) return 'moderate';
    return 'infrequent';
  }

  private isBirthData(data: any): boolean {
    return !!(data.birthDate || data.birthTime || data.birthLocation ||
              data.latitude || data.longitude || data.timezone);
  }

  private isFrequentlyAccessed(engineName: string): boolean {
    const frequentEngines = ['numerology', 'biorhythm', 'human_design', 'tarot'];
    return frequentEngines.includes(engineName);
  }

  private createProfileSummary(data: any): any {
    // Create a lightweight summary for quick access
    const summary: any = {};

    if (data.birthDate) summary.birthDate = data.birthDate;
    if (data.birthTime) summary.birthTime = data.birthTime;
    if (data.latitude) summary.latitude = data.latitude;
    if (data.longitude) summary.longitude = data.longitude;
    if (data.name) summary.name = data.name;
    if (data.preferences) summary.preferences = data.preferences;

    return summary;
  }

  // Enhanced getUserProfile with quick access optimization
  async getUserProfileOptimized(userId: string, engineName: string, timestamp?: string): Promise<any | null> {
    try {
      // Try quick access first for frequently accessed engines
      if (!timestamp && this.isFrequentlyAccessed(engineName)) {
        const quickAccessKey = `quick:${userId}:${engineName}`;
        const quickData = await this.userProfiles.get(quickAccessKey, { type: 'json' });

        if (quickData) {
          // Update last accessed time
          quickData.lastAccessed = new Date().toISOString();
          await this.userProfiles.put(
            quickAccessKey,
            JSON.stringify(quickData),
            { expirationTtl: 3600 }
          );

          // Get full profile using the stored key
          const fullProfile = await this.userProfiles.get(quickData.key, { type: 'json' });
          return fullProfile;
        }
      }

      // Fall back to standard getUserProfile
      return await this.getUserProfile(userId, engineName, timestamp);
    } catch (error) {
      console.error(`Failed to get optimized user profile:`, error);
      return await this.getUserProfile(userId, engineName, timestamp);
    }
  }

  async listUserProfiles(userId: string): Promise<string[]> {
    const prefix = `user:${userId}:`;
    const keys: string[] = [];
    let cursor: string | undefined;

    try {
      do {
        const list = await this.userProfiles.list({ 
          prefix, 
          limit: 1000,
          ...(cursor && { cursor })
        });
        
        keys.push(...list.keys.map(k => k.name));
        cursor = list.cursor;
      } while (cursor);

      return keys;
    } catch (error) {
      console.error(`Failed to list user profiles for ${userId}:`, error);
      return [];
    }
  }

  // Cache Operations
  async getCached<T = any>(engineName: string, inputHash: string): Promise<T | null> {
    const key = KVKeyGenerator.cache(engineName, inputHash);

    try {
      const data = await this.cache.get(key, { type: 'json' });
      return data as T;
    } catch (error) {
      console.error(`Failed to get cached data ${key}:`, error);
      return null;
    }
  }

  async setCached<T = any>(
    engineName: string,
    inputHash: string,
    data: T,
    ttl: number = CACHE_TTL_CONFIG.default,
    options: {
      confidenceScore?: number;
      forceCache?: boolean;
      metadata?: any;
    } = {}
  ): Promise<{ cached: boolean; reason?: string }> {
    const key = KVKeyGenerator.cache(engineName, inputHash);
    const { confidenceScore, forceCache = false, metadata } = options;

    try {
      // Phase 1: Intelligent Caching Strategy - Confidence-based caching
      const CONFIDENCE_THRESHOLD = 0.7;

      // Check if we should cache based on confidence score
      if (!forceCache && confidenceScore !== undefined && confidenceScore < CONFIDENCE_THRESHOLD) {
        return {
          cached: false,
          reason: `Confidence score ${confidenceScore} below threshold ${CONFIDENCE_THRESHOLD}`
        };
      }

      // Determine TTL based on engine complexity and confidence
      let adjustedTtl = ttl;
      if (confidenceScore !== undefined) {
        // Higher confidence = longer cache time
        const confidenceMultiplier = Math.max(0.5, Math.min(2.0, confidenceScore * 2));
        adjustedTtl = Math.floor(ttl * confidenceMultiplier);
      }

      // Apply engine-specific TTL from CACHE_STRATEGY
      const engineComplexityTtl = this.getEngineComplexityTtl(engineName);
      if (engineComplexityTtl) {
        adjustedTtl = Math.min(adjustedTtl, engineComplexityTtl);
      }

      const cacheData = {
        data,
        engineName,
        inputHash,
        cachedAt: new Date().toISOString(),
        confidenceScore,
        ttl: adjustedTtl,
        metadata: {
          ...metadata,
          cacheVersion: '1.1',
          intelligentCaching: true
        }
      };

      await this.cache.put(
        key,
        JSON.stringify(cacheData),
        { expirationTtl: adjustedTtl }
      );

      return {
        cached: true,
        reason: `Cached with confidence ${confidenceScore || 'N/A'}, TTL: ${adjustedTtl}s`
      };

    } catch (error) {
      console.error(`Failed to set cache ${key}:`, error);
      throw error;
    }
  }

  // Helper method to get engine-specific TTL based on complexity
  private getEngineComplexityTtl(engineName: string): number | null {
    const complexityMap: Record<string, number> = {
      // Simple engines (1 hour)
      'numerology': 3600,
      'biorhythm': 3600,

      // Medium complexity (30 minutes)
      'tarot': 1800,
      'iching': 1800,
      'enneagram': 1800,
      'sacred_geometry': 1800,

      // Complex engines (15 minutes)
      'human_design': 900,
      'vimshottari': 900,
      'gene_keys': 900,
      'sigil_forge': 900
    };

    return complexityMap[engineName] || null;
  }

  // Phase 1: Cache Performance Monitoring and Optimization
  async getCacheStats(): Promise<{
    hitRate: number;
    totalRequests: number;
    totalHits: number;
    totalMisses: number;
    engineStats: Record<string, { hits: number; misses: number; hitRate: number }>;
  }> {
    try {
      // Get cache statistics from a special stats key
      const statsKey = 'cache:stats:global';
      const stats = await this.cache.get(statsKey, { type: 'json' }) || {
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        engineStats: {}
      };

      const hitRate = stats.totalRequests > 0 ? (stats.totalHits / stats.totalRequests) * 100 : 0;

      // Calculate per-engine hit rates
      const engineStats: Record<string, { hits: number; misses: number; hitRate: number }> = {};
      for (const [engine, data] of Object.entries(stats.engineStats || {})) {
        const engineData = data as { hits: number; misses: number };
        const total = engineData.hits + engineData.misses;
        engineStats[engine] = {
          ...engineData,
          hitRate: total > 0 ? (engineData.hits / total) * 100 : 0
        };
      }

      return {
        hitRate,
        totalRequests: stats.totalRequests,
        totalHits: stats.totalHits,
        totalMisses: stats.totalMisses,
        engineStats
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return {
        hitRate: 0,
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        engineStats: {}
      };
    }
  }

  async recordCacheHit(engineName: string): Promise<void> {
    try {
      const statsKey = 'cache:stats:global';
      const stats = await this.cache.get(statsKey, { type: 'json' }) || {
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        engineStats: {}
      };

      stats.totalRequests++;
      stats.totalHits++;

      if (!stats.engineStats[engineName]) {
        stats.engineStats[engineName] = { hits: 0, misses: 0 };
      }
      stats.engineStats[engineName].hits++;

      await this.cache.put(statsKey, JSON.stringify(stats), { expirationTtl: 86400 * 7 }); // 7 days
    } catch (error) {
      console.error('Failed to record cache hit:', error);
    }
  }

  async recordCacheMiss(engineName: string): Promise<void> {
    try {
      const statsKey = 'cache:stats:global';
      const stats = await this.cache.get(statsKey, { type: 'json' }) || {
        totalRequests: 0,
        totalHits: 0,
        totalMisses: 0,
        engineStats: {}
      };

      stats.totalRequests++;
      stats.totalMisses++;

      if (!stats.engineStats[engineName]) {
        stats.engineStats[engineName] = { hits: 0, misses: 0 };
      }
      stats.engineStats[engineName].misses++;

      await this.cache.put(statsKey, JSON.stringify(stats), { expirationTtl: 86400 * 7 }); // 7 days
    } catch (error) {
      console.error('Failed to record cache miss:', error);
    }
  }

  // Enhanced getCached with hit/miss tracking
  async getCachedWithStats<T = any>(engineName: string, inputHash: string): Promise<T | null> {
    const result = await this.getCached<T>(engineName, inputHash);

    if (result !== null) {
      await this.recordCacheHit(engineName);
    } else {
      await this.recordCacheMiss(engineName);
    }

    return result;
  }

  // Enhanced Forecast-specific Cache Operations
  async getDailyForecastCache(userId: string, date: string): Promise<any | null> {
    const key = `forecast:daily:${userId}:${date}`;
    try {
      const cached = await this.cache.get(key, { type: 'json' });
      return cached;
    } catch (error) {
      console.error(`Failed to get daily forecast cache ${key}:`, error);
      return null;
    }
  }

  async setDailyForecastCache(userId: string, date: string, forecast: any): Promise<void> {
    const key = `forecast:daily:${userId}:${date}`;
    const ttl = 6 * 3600; // 6 hours TTL for daily forecasts

    try {
      const cacheData = {
        forecast,
        userId,
        date,
        type: 'daily',
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttl * 1000).toISOString()
      };

      await this.cache.put(key, JSON.stringify(cacheData), { expirationTtl: ttl });
    } catch (error) {
      console.error(`Failed to set daily forecast cache ${key}:`, error);
      throw error;
    }
  }

  async getWeeklyForecastCache(userId: string, weekStart: string): Promise<any | null> {
    const key = `forecast:weekly:${userId}:${weekStart}`;
    try {
      const cached = await this.cache.get(key, { type: 'json' });
      return cached;
    } catch (error) {
      console.error(`Failed to get weekly forecast cache ${key}:`, error);
      return null;
    }
  }

  async setWeeklyForecastCache(userId: string, weekStart: string, forecast: any): Promise<void> {
    const key = `forecast:weekly:${userId}:${weekStart}`;
    const ttl = 24 * 3600; // 24 hours TTL for weekly forecasts

    try {
      const cacheData = {
        forecast,
        userId,
        weekStart,
        type: 'weekly',
        cachedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + ttl * 1000).toISOString()
      };

      await this.cache.put(key, JSON.stringify(cacheData), { expirationTtl: ttl });
    } catch (error) {
      console.error(`Failed to set weekly forecast cache ${key}:`, error);
      throw error;
    }
  }

  // Forecast cache cleanup and management
  async clearUserForecastCache(userId: string): Promise<void> {
    try {
      // Note: KV doesn't support prefix deletion, so we'd need to track keys
      // For now, we'll let them expire naturally
      console.log(`Forecast cache for user ${userId} will expire naturally`);
    } catch (error) {
      console.error(`Failed to clear forecast cache for user ${userId}:`, error);
    }
  }

  async getRaycastCache(userId: string, type: string, identifier: string): Promise<any | null> {
    const key = `raycast:${type}:${userId}:${identifier}`;

    try {
      const data = await this.cache.get(key, { type: 'json' });
      return data;
    } catch (error) {
      console.error(`Failed to get Raycast cache ${key}:`, error);
      return null;
    }
  }

  async setRaycastCache(userId: string, type: string, identifier: string, data: any, ttl: number = 3600): Promise<void> {
    const key = `raycast:${type}:${userId}:${identifier}`;

    try {
      const cacheData = {
        data,
        userId,
        type,
        identifier,
        cachedAt: new Date().toISOString()
      };

      await this.cache.put(
        key,
        JSON.stringify(cacheData),
        { expirationTtl: ttl }
      );
    } catch (error) {
      console.error(`Failed to set Raycast cache ${key}:`, error);
      throw error;
    }
  }

  // Bulk Operations
  async bulkSetEngineData(engineName: string, dataMap: Record<string, any>): Promise<void> {
    const promises = Object.entries(dataMap).map(([dataType, data]) =>
      this.setEngineData(engineName, dataType, data)
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      console.error(`Failed to bulk set engine data for ${engineName}:`, error);
      throw error;
    }
  }

  // Consciousness Profile Operations
  async getConsciousnessProfile(userId: string): Promise<any | null> {
    const key = `consciousness:${userId}:profile`;
    
    try {
      const data = await this.userProfiles.get(key, { type: 'json' });
      return data;
    } catch (error) {
      console.error(`Failed to get consciousness profile for ${userId}:`, error);
      return null;
    }
  }

  async setConsciousnessProfile(userId: string, profile: any): Promise<string> {
    const timestamp = new Date().toISOString();
    const key = `consciousness:${userId}:profile`;
    
    try {
      const profileData = {
        ...profile,
        userId,
        timestamp,
        updatedAt: timestamp,
        version: '1.0.0'
      };
      
      await this.userProfiles.put(
        key, 
        JSON.stringify(profileData),
        { expirationTtl: CACHE_TTL_CONFIG.user_profiles }
      );
      
      return timestamp;
    } catch (error) {
      console.error(`Failed to set consciousness profile for ${userId}:`, error);
      throw error;
    }
  }

  async deleteConsciousnessProfile(userId: string): Promise<void> {
    const key = `consciousness:${userId}:profile`;
    
    try {
      await this.userProfiles.delete(key);
    } catch (error) {
      console.error(`Failed to delete consciousness profile for ${userId}:`, error);
      throw error;
    }
  }

  // Maintenance Operations
  async listEngineDataKeys(engineName: string): Promise<string[]> {
    const prefix = `engine:${engineName}:`;
    const keys: string[] = [];
    let cursor: string | undefined;

    try {
      do {
        const list = await this.engineData.list({ 
          prefix, 
          limit: 1000,
          ...(cursor && { cursor })
        });
        
        keys.push(...list.keys.map(k => k.name));
        cursor = list.cursor;
      } while (cursor);

      return keys;
    } catch (error) {
      console.error(`Failed to list engine data keys for ${engineName}:`, error);
      return [];
    }
  }

  async deleteEngineData(engineName: string, dataType: string): Promise<void> {
    const key = KVKeyGenerator.engineData(engineName, dataType);
    
    try {
      await this.engineData.delete(key);
    } catch (error) {
      console.error(`Failed to delete engine data ${key}:`, error);
      throw error;
    }
  }

  async clearUserProfiles(userId: string): Promise<void> {
    const keys = await this.listUserProfiles(userId);
    
    const deletePromises = keys.map(key => 
      this.userProfiles.delete(key).catch(error => 
        console.error(`Failed to delete user profile ${key}:`, error)
      )
    );

    await Promise.all(deletePromises);
  }

  async clearCache(): Promise<void> {
    const prefix = 'cache:';
    let cursor: string | undefined;

    try {
      do {
        const list = await this.cache.list({ 
          prefix, 
          limit: 1000,
          ...(cursor && { cursor })
        });
        
        const deletePromises = list.keys.map(key => 
          this.cache.delete(key.name).catch(error =>
            console.error(`Failed to delete cache ${key.name}:`, error)
          )
        );
        
        await Promise.all(deletePromises);
        cursor = list.cursor;
      } while (cursor);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  // Reading History Operations
  async saveReading(userId: string, reading: any): Promise<{ success: boolean; readingId?: string; error?: string }> {
    try {
      const readingId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const key = `reading:${userId}:${readingId}`;
      
      const readingData = {
        id: readingId,
        userId,
        timestamp,
        ...reading,
        favorite: false,
        createdAt: timestamp,
        updatedAt: timestamp
      };

      await this.userProfiles.put(
        key,
        JSON.stringify(readingData),
        { expirationTtl: CACHE_TTL_CONFIG.user_profiles }
      );

      return { success: true, readingId };
    } catch (error) {
      console.error(`Failed to save reading for user ${userId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getReading(readingId: string): Promise<any | null> {
    try {
      // Search for the reading across all user namespaces
      // This is a simplified approach - in production you'd want to include userId in the request
      const prefix = 'reading:';
      const list = await this.userProfiles.list({ prefix, limit: 1000 });
      
      for (const key of list.keys) {
        if (key.name.includes(readingId)) {
          const data = await this.userProfiles.get(key.name, { type: 'json' });
          if (data && data.id === readingId) {
            return data;
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to get reading ${readingId}:`, error);
      return null;
    }
  }

  async getUserReadings(userId: string, limit: number = 10, timeRange: string = '30d'): Promise<any[]> {
    try {
      const prefix = `reading:${userId}:`;
      const readings: any[] = [];
      let cursor: string | undefined;

      // Calculate time threshold
      const now = new Date();
      const timeThreshold = new Date();
      if (timeRange.endsWith('d')) {
        const days = parseInt(timeRange.slice(0, -1));
        timeThreshold.setDate(now.getDate() - days);
      } else if (timeRange.endsWith('m')) {
        const months = parseInt(timeRange.slice(0, -1));
        timeThreshold.setMonth(now.getMonth() - months);
      }

      do {
        const list = await this.userProfiles.list({ 
          prefix, 
          limit: Math.min(limit * 2, 1000), // Get more than needed to filter
          ...(cursor && { cursor })
        });

        for (const key of list.keys) {
          if (readings.length >= limit) break;
          
          const data = await this.userProfiles.get(key.name, { type: 'json' });
          if (data && data.timestamp) {
            const readingDate = new Date(data.timestamp);
            if (readingDate >= timeThreshold) {
              readings.push(data);
            }
          }
        }

        cursor = list.cursor;
      } while (cursor && readings.length < limit);

      // Sort by timestamp (newest first) and limit
      return readings
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);

    } catch (error) {
      console.error(`Failed to get user readings for ${userId}:`, error);
      return [];
    }
  }

  async deleteReading(readingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find and delete the reading
      const prefix = 'reading:';
      const list = await this.userProfiles.list({ prefix, limit: 1000 });
      
      for (const key of list.keys) {
        if (key.name.includes(readingId)) {
          const data = await this.userProfiles.get(key.name, { type: 'json' });
          if (data && data.id === readingId) {
            await this.userProfiles.delete(key.name);
            return { success: true };
          }
        }
      }
      
      return { success: false, error: 'Reading not found' };
    } catch (error) {
      console.error(`Failed to delete reading ${readingId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async toggleFavorite(readingId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Find the reading
      const prefix = 'reading:';
      const list = await this.userProfiles.list({ prefix, limit: 1000 });
      
      for (const key of list.keys) {
        if (key.name.includes(readingId)) {
          const data = await this.userProfiles.get(key.name, { type: 'json' });
          if (data && data.id === readingId) {
            // Toggle favorite status
            const updatedData = {
              ...data,
              favorite: !data.favorite,
              updatedAt: new Date().toISOString()
            };
            
            await this.userProfiles.put(
              key.name,
              JSON.stringify(updatedData),
              { expirationTtl: CACHE_TTL_CONFIG.user_profiles }
            );
            
            return { 
              success: true, 
              message: updatedData.favorite ? 'Reading marked as favorite' : 'Reading removed from favorites'
            };
          }
        }
      }
      
      return { success: false, error: 'Reading not found' };
    } catch (error) {
      console.error(`Failed to toggle favorite for reading ${readingId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Utility Methods
  async healthCheck(): Promise<{ status: string; details: Record<string, any> }> {
    const checks = {
      engineData: false,
      userProfiles: false,
      cache: false
    };

    try {
      // Test engine data access
      await this.engineData.list({ limit: 1 });
      checks.engineData = true;
    } catch (error) {
      console.error('Engine data KV health check failed:', error);
    }

    try {
      // Test user profiles access
      await this.userProfiles.list({ limit: 1 });
      checks.userProfiles = true;
    } catch (error) {
      console.error('User profiles KV health check failed:', error);
    }

    try {
      // Test cache access
      await this.cache.list({ limit: 1 });
      checks.cache = true;
    } catch (error) {
      console.error('Cache KV health check failed:', error);
    }

    const allHealthy = Object.values(checks).every(Boolean);

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      details: {
        ...checks,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Secret Management Operations
  async getSecret(key: string): Promise<string | null> {
    if (!this.secrets) {
      console.warn('Secrets KV namespace not available');
      return null;
    }
    
    try {
      const secret = await this.secrets.get(key, { type: 'text' });
      return secret;
    } catch (error) {
      console.error(`Failed to get secret ${key}:`, error);
      return null;
    }
  }

  async setSecret(key: string, value: string): Promise<void> {
    if (!this.secrets) {
      throw new Error('Secrets KV namespace not available');
    }
    
    try {
      await this.secrets.put(key, value);
    } catch (error) {
      console.error(`Failed to set secret ${key}:`, error);
      throw error;
    }
  }

  async deleteSecret(key: string): Promise<void> {
    if (!this.secrets) {
      throw new Error('Secrets KV namespace not available');
    }
    
    try {
      await this.secrets.delete(key);
    } catch (error) {
      console.error(`Failed to delete secret ${key}:`, error);
      throw error;
    }
  }

  // Helper method to create input hash for caching
  static createInputHash(input: any): string {
    const inputString = typeof input === 'string' ? input : JSON.stringify(input);
    
    // Simple hash function for demonstration
    // In production, consider using a more robust hashing algorithm
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // Timeline Data Operations
  async createTimelineEntry(entry: TimelineEntry): Promise<void> {
    const key = `timeline:${entry.userId}:${entry.timestamp}:${entry.id}`;

    try {
      await this.timelineData.put(key, JSON.stringify(entry));

      // Update daily index
      await this.updateTimelineIndex(entry.userId, entry.timestamp.split('T')[0], entry.id, 'add');

    } catch (error) {
      console.error(`Failed to create timeline entry ${key}:`, error);
      throw error;
    }
  }

  async getTimelineEntry(userId: string, entryId: string): Promise<TimelineEntry | null> {
    try {
      // First try to find by scanning user's entries (less efficient but works)
      const entries = await this.getTimelineEntries({ userId, limit: 1000 });
      return entries.entries.find(e => e.id === entryId) || null;
    } catch (error) {
      console.error(`Failed to get timeline entry ${entryId}:`, error);
      return null;
    }
  }

  async updateTimelineEntry(entry: TimelineEntry): Promise<void> {
    const key = `timeline:${entry.userId}:${entry.timestamp}:${entry.id}`;

    try {
      await this.timelineData.put(key, JSON.stringify(entry));
    } catch (error) {
      console.error(`Failed to update timeline entry ${key}:`, error);
      throw error;
    }
  }

  async deleteTimelineEntry(userId: string, entryId: string, timestamp: string): Promise<void> {
    const key = `timeline:${userId}:${timestamp}:${entryId}`;

    try {
      await this.timelineData.delete(key);

      // Update daily index
      await this.updateTimelineIndex(userId, timestamp.split('T')[0], entryId, 'remove');

    } catch (error) {
      console.error(`Failed to delete timeline entry ${key}:`, error);
      throw error;
    }
  }

  async getTimelineEntries(query: TimelineQuery): Promise<TimelineResponse> {
    const { userId, startDate, endDate, type, limit = 50, offset = 0, sortOrder = 'desc' } = query;

    try {
      const prefix = `timeline:${userId}:`;
      const allKeys: string[] = [];
      let cursor: string | undefined;

      // Get all keys for the user
      do {
        const result = await this.timelineData.list({
          prefix,
          limit: 1000,
          cursor
        });

        allKeys.push(...result.keys.map(k => k.name));
        cursor = result.cursor;
      } while (cursor);

      // Filter keys by date range if specified
      let filteredKeys = allKeys;
      if (startDate || endDate) {
        filteredKeys = allKeys.filter(key => {
          const keyParts = key.split(':');
          const keyDate = keyParts[2]?.split('T')[0];
          if (!keyDate) return false;

          if (startDate && keyDate < startDate) return false;
          if (endDate && keyDate > endDate) return false;
          return true;
        });
      }

      // Sort keys by timestamp
      filteredKeys.sort((a, b) => {
        const timestampA = a.split(':')[2];
        const timestampB = b.split(':')[2];
        return sortOrder === 'desc'
          ? timestampB.localeCompare(timestampA)
          : timestampA.localeCompare(timestampB);
      });

      // Apply pagination
      const paginatedKeys = filteredKeys.slice(offset, offset + limit);

      // Fetch entries
      const entries: TimelineEntry[] = [];
      for (const key of paginatedKeys) {
        try {
          const data = await this.timelineData.get(key, { type: 'json' });
          if (data) {
            const entry = data as TimelineEntry;

            // Apply type filter
            if (type && entry.type !== type) continue;

            entries.push(entry);
          }
        } catch (error) {
          console.error(`Failed to get timeline entry ${key}:`, error);
        }
      }

      return {
        entries,
        total: filteredKeys.length,
        hasMore: offset + limit < filteredKeys.length,
        nextOffset: offset + limit < filteredKeys.length ? offset + limit : undefined
      };

    } catch (error) {
      console.error(`Failed to get timeline entries for user ${userId}:`, error);
      return { entries: [], total: 0, hasMore: false };
    }
  }

  async getTimelineStats(userId: string): Promise<TimelineStats> {
    try {
      const entries = await this.getTimelineEntries({ userId, limit: 10000 });

      const stats: TimelineStats = {
        totalEntries: entries.total,
        entriesByType: {} as Record<TimelineEntryType, number>,
        entriesByEngine: {},
        averageConfidence: 0,
        averageAccuracy: 0,
        mostUsedEngine: '',
        mostUsedWorkflow: '',
        streakDays: 0,
        firstEntry: '',
        lastEntry: ''
      };

      if (entries.entries.length === 0) {
        return stats;
      }

      // Calculate statistics
      let totalConfidence = 0;
      let totalAccuracy = 0;
      let accuracyCount = 0;
      const engineCounts: Record<string, number> = {};
      const workflowCounts: Record<string, number> = {};
      const typeCounts: Record<string, number> = {};

      entries.entries.forEach(entry => {
        // Type counts
        typeCounts[entry.type] = (typeCounts[entry.type] || 0) + 1;

        // Engine counts
        if (entry.engineName) {
          engineCounts[entry.engineName] = (engineCounts[entry.engineName] || 0) + 1;
        }

        // Workflow counts
        if (entry.workflowType) {
          workflowCounts[entry.workflowType] = (workflowCounts[entry.workflowType] || 0) + 1;
        }

        // Confidence
        totalConfidence += entry.metadata.confidence;

        // Accuracy
        if (entry.metadata.accuracy !== undefined) {
          totalAccuracy += entry.metadata.accuracy;
          accuracyCount++;
        }
      });

      stats.entriesByType = typeCounts as Record<TimelineEntryType, number>;
      stats.entriesByEngine = engineCounts;
      stats.averageConfidence = totalConfidence / entries.entries.length;
      stats.averageAccuracy = accuracyCount > 0 ? totalAccuracy / accuracyCount : undefined;

      // Most used engine and workflow
      stats.mostUsedEngine = Object.keys(engineCounts).reduce((a, b) =>
        engineCounts[a] > engineCounts[b] ? a : b, '');
      stats.mostUsedWorkflow = Object.keys(workflowCounts).reduce((a, b) =>
        workflowCounts[a] > workflowCounts[b] ? a : b, '');

      // First and last entries
      const sortedEntries = entries.entries.sort((a, b) =>
        a.timestamp.localeCompare(b.timestamp));
      stats.firstEntry = sortedEntries[0]?.timestamp.split('T')[0] || '';
      stats.lastEntry = sortedEntries[sortedEntries.length - 1]?.timestamp.split('T')[0] || '';

      // Calculate streak days
      stats.streakDays = this.calculateStreakDays(entries.entries);

      return stats;
    } catch (error) {
      console.error(`Failed to get timeline stats for user ${userId}:`, error);
      throw error;
    }
  }

  private async updateTimelineIndex(userId: string, date: string, entryId: string, operation: 'add' | 'remove'): Promise<void> {
    const indexKey = `timeline_index:${userId}:${date}`;

    try {
      let index: TimelineIndex = await this.timelineData.get(indexKey, { type: 'json' }) || {
        userId,
        date,
        entryIds: [],
        entryCount: 0,
        types: [],
        engines: []
      };

      if (operation === 'add') {
        if (!index.entryIds.includes(entryId)) {
          index.entryIds.push(entryId);
          index.entryCount++;
        }
      } else {
        index.entryIds = index.entryIds.filter(id => id !== entryId);
        index.entryCount = index.entryIds.length;
      }

      await this.timelineData.put(indexKey, JSON.stringify(index));
    } catch (error) {
      console.error(`Failed to update timeline index ${indexKey}:`, error);
    }
  }

  private calculateStreakDays(entries: TimelineEntry[]): number {
    if (entries.length === 0) return 0;

    const dates = [...new Set(entries.map(e => e.timestamp.split('T')[0]))].sort();
    let streak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = new Date(dates[i - 1]);
      const currDate = new Date(dates[i]);
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return streak;
  }
}

// Factory function for creating KV data access in Workers environment
export function createKVDataAccess(bindings: {
  ENGINE_DATA: KVNamespace;
  USER_PROFILES: KVNamespace;
  CACHE: KVNamespace;
  TIMELINE_DATA: KVNamespace;
  SECRETS?: KVNamespace;
}): CloudflareKVDataAccess {
  return new CloudflareKVDataAccess(
    bindings.ENGINE_DATA,
    bindings.USER_PROFILES,
    bindings.CACHE,
    bindings.TIMELINE_DATA,
    bindings.SECRETS
  );
}
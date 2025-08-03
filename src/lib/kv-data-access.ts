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
  ): Promise<string> {
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

      return timestamp;
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
        const listOptions: any = {
          prefix, 
          limit: 1000
        };
        if (cursor) {
          listOptions.cursor = cursor;
        }
        
        const list = await this.userProfiles.list(listOptions);
        
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
    ttl: number = CACHE_TTL_CONFIG.default
  ): Promise<void> {
    const key = KVKeyGenerator.cache(engineName, inputHash);

    try {
      await this.cache.put(key, JSON.stringify(data), { expirationTtl: ttl });

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
        const listOptions: any = {
          prefix, 
          limit: 1000
        };
        if (cursor) {
          listOptions.cursor = cursor;
        }
        
        const list = await this.engineData.list(listOptions);
        
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
        const listOptions: any = {
          prefix,
          limit: 1000
        };
        if (cursor) {
          listOptions.cursor = cursor;
        }

        const list = await this.cache.list(listOptions);

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

  // Cache Invalidation Methods
  async invalidateEngineCache(engineName: string): Promise<void> {
    const prefix = `cache:${engineName}:`;
    let cursor: string | undefined;
    let deletedCount = 0;

    try {
      do {
        const listOptions: any = {
          prefix,
          limit: 1000
        };
        if (cursor) {
          listOptions.cursor = cursor;
        }

        const list = await this.cache.list(listOptions);

        const deletePromises = list.keys.map(key =>
          this.cache.delete(key.name).catch(error =>
            console.error(`Failed to delete cache ${key.name}:`, error)
          )
        );

        await Promise.all(deletePromises);
        deletedCount += list.keys.length;
        cursor = list.cursor;
      } while (cursor);

      console.log(`Invalidated ${deletedCount} cache entries for engine: ${engineName}`);
    } catch (error) {
      console.error(`Failed to invalidate cache for engine ${engineName}:`, error);
      throw error;
    }
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const prefixes = [`forecast:daily:${userId}:`, `forecast:weekly:${userId}:`, `raycast:`, `user_profile:${userId}:`];
    let totalDeleted = 0;

    try {
      for (const prefix of prefixes) {
        let cursor: string | undefined;

        do {
          const listOptions: any = {
            prefix,
            limit: 1000
          };
          if (cursor) {
            listOptions.cursor = cursor;
          }

          const list = await this.cache.list(listOptions);

          // Filter for user-specific keys
          const userKeys = list.keys.filter(key =>
            key.name.includes(userId) || key.name.startsWith(prefix)
          );

          const deletePromises = userKeys.map(key =>
            this.cache.delete(key.name).catch(error =>
              console.error(`Failed to delete cache ${key.name}:`, error)
            )
          );

          await Promise.all(deletePromises);
          totalDeleted += userKeys.length;
          cursor = list.cursor;
        } while (cursor);
      }

      console.log(`Invalidated ${totalDeleted} cache entries for user: ${userId}`);
    } catch (error) {
      console.error(`Failed to invalidate cache for user ${userId}:`, error);
      throw error;
    }
  }

  // Cache Warming Methods
  async warmEngineCache(engineName: string, commonInputs: any[]): Promise<{ warmed: number; failed: number }> {
    let warmed = 0;
    let failed = 0;

    try {
      // Import engine calculation function
      const { calculateEngine } = await import('../engines');

      for (const input of commonInputs) {
        try {
          // Calculate and cache the result
          const result = await calculateEngine(engineName as any, input);

          if (result.success) {
            // Generate input hash for caching
            const inputHash = this.generateInputHash(input);
            await this.setCached(engineName, inputHash, result, this.getEngineComplexityTtl(engineName) || CACHE_TTL_CONFIG.default);
            warmed++;
          } else {
            failed++;
          }
        } catch (error) {
          console.error(`Failed to warm cache for ${engineName} with input:`, input, error);
          failed++;
        }
      }

      console.log(`Cache warming for ${engineName}: ${warmed} warmed, ${failed} failed`);
      return { warmed, failed };
    } catch (error) {
      console.error(`Failed to warm cache for engine ${engineName}:`, error);
      return { warmed, failed: commonInputs.length };
    }
  }

  async warmUserForecastCache(userId: string, days: number = 7): Promise<{ warmed: number; failed: number }> {
    let warmed = 0;
    let failed = 0;

    try {
      // Get user profile for forecast generation
      const userProfile = await this.getUserProfileOptimized(userId, 'numerology');
      if (!userProfile || !userProfile.input?.birthDate) {
        console.warn(`Cannot warm forecast cache for user ${userId}: missing birth data`);
        return { warmed: 0, failed: days };
      }

      // Import forecast generation
      const { generateDailyForecast } = await import('../handlers/forecast-handler');

      // Generate forecasts for the next N days
      for (let i = 0; i < days; i++) {
        try {
          const targetDate = new Date();
          targetDate.setDate(targetDate.getDate() + i);
          const dateString = targetDate.toISOString().split('T')[0];

          // Check if already cached
          const existing = await this.getDailyForecastCache(userId, dateString);
          if (existing) {
            warmed++; // Already warmed
            continue;
          }

          // Generate and cache forecast
          const forecast = await generateDailyForecast(userProfile, dateString, `cache-warm-${Date.now()}`);
          await this.setDailyForecastCache(userId, dateString, forecast);
          warmed++;
        } catch (error) {
          console.error(`Failed to warm forecast cache for user ${userId}, day ${i}:`, error);
          failed++;
        }
      }

      console.log(`Forecast cache warming for user ${userId}: ${warmed} warmed, ${failed} failed`);
      return { warmed, failed };
    } catch (error) {
      console.error(`Failed to warm forecast cache for user ${userId}:`, error);
      return { warmed: 0, failed: days };
    }
  }

  // Cache Utility Methods
  private generateInputHash(input: any): string {
    // Simple hash generation for input data
    const inputString = JSON.stringify(input, Object.keys(input).sort());
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
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
      if (entry.timestamp) {
        await this.updateTimelineIndex(entry.userId, entry.timestamp.split('T')[0], entry.id, 'add');
      }

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
      if (timestamp) {
        await this.updateTimelineIndex(userId, timestamp.split('T')[0], entryId, 'remove');
      }

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
        const listOptions: any = {
          prefix,
          limit: 1000
        };
        if (cursor) {
          listOptions.cursor = cursor;
        }
        
        const result = await this.timelineData.list(listOptions);

        allKeys.push(...result.keys.map(k => k.name));
        cursor = result.cursor || undefined;
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
        const timestampA = a.split(':')[2] || '';
        const timestampB = b.split(':')[2] || '';
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

      const hasMore = offset + limit < filteredKeys.length;
      const response: TimelineResponse = {
        entries,
        total: filteredKeys.length,
        hasMore
      };
      if (hasMore) {
        response.nextOffset = offset + limit;
      }
      return response;

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
      if (accuracyCount > 0) {
        stats.averageAccuracy = totalAccuracy / accuracyCount;
      }

      // Most used engine and workflow
      const engineKeys = Object.keys(engineCounts);
      const workflowKeys = Object.keys(workflowCounts);
      stats.mostUsedEngine = engineKeys.length > 0 ? engineKeys.reduce((a, b) => {
        const countA = engineCounts[a] || 0;
        const countB = engineCounts[b] || 0;
        return countA > countB ? a : b;
      }) : '';
      stats.mostUsedWorkflow = workflowKeys.length > 0 ? workflowKeys.reduce((a, b) => {
        const countA = workflowCounts[a] || 0;
        const countB = workflowCounts[b] || 0;
        return countA > countB ? a : b;
      }) : '';

      // First and last entries
      const sortedEntries = entries.entries.sort((a, b) =>
        (a.timestamp || '').localeCompare(b.timestamp || ''));
      const firstEntry = sortedEntries[0];
      const lastEntry = sortedEntries[sortedEntries.length - 1];
      stats.firstEntry = (firstEntry && firstEntry.timestamp) ? firstEntry.timestamp.split('T')[0] : '';
      stats.lastEntry = (lastEntry && lastEntry.timestamp) ? lastEntry.timestamp.split('T')[0] : '';

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

    const dateSet = new Set(entries.map(e => e.timestamp?.split('T')[0]).filter(Boolean));
    const dates = Array.from(dateSet).sort();
    if (dates.length === 0) return 0;
    
    let streak = 1;
    let currentStreak = 1;

    for (let i = 1; i < dates.length; i++) {
      const prevDateStr = dates[i - 1];
      const currDateStr = dates[i];
      if (!prevDateStr || !currDateStr) continue;
      
      const prevDate = new Date(prevDateStr);
      const currDate = new Date(currDateStr);
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

  // Reading History Management Methods
  async saveReading(userId: string, reading: any): Promise<{ success: boolean; readingId?: string; error?: string }> {
    try {
      // Generate reading ID if not provided
      if (!reading.id) {
        reading.id = `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      // Add metadata
      reading.userId = userId;
      reading.timestamp = reading.timestamp || new Date().toISOString();
      reading.createdAt = reading.createdAt || new Date().toISOString();
      reading.updatedAt = new Date().toISOString();
      
      const key = `reading:${userId}:${reading.id}`;
      const userKey = `user_readings:${userId}`;
      
      // Save the reading
      await this.userProfiles.put(key, JSON.stringify(reading));
      
      // Update user's reading list
      const userReadings = await this.userProfiles.get(userKey, { type: 'json' }) || [];
      const readingList = Array.isArray(userReadings) ? userReadings : [];
      
      // Add reading ID if not already present
      if (!readingList.includes(reading.id)) {
        readingList.unshift(reading.id); // Add to beginning for chronological order
        
        // Keep only last 1000 readings to prevent unlimited growth
        if (readingList.length > 1000) {
          readingList.splice(1000);
        }
        
        await this.userProfiles.put(userKey, JSON.stringify(readingList));
      }
      
      return { success: true, readingId: reading.id };
    } catch (error) {
      console.error(`Failed to save reading for user ${userId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getUserReadings(userId: string, limit: number = 10, timeRange: string = '30d'): Promise<any[]> {
    const userKey = `user_readings:${userId}`;
    
    try {
      const readingIds = await this.userProfiles.get(userKey, { type: 'json' }) || [];
      const readingList = Array.isArray(readingIds) ? readingIds : [];
      
      // Apply limit
      const limitedIds = readingList.slice(0, limit);
      
      // Fetch reading details
      const readings = [];
      for (const readingId of limitedIds) {
        try {
          const readingKey = `reading:${userId}:${readingId}`;
          const reading = await this.userProfiles.get(readingKey, { type: 'json' });
          if (reading) {
            // Apply time range filter if specified
            if (timeRange && reading.timestamp) {
              const readingDate = new Date(reading.timestamp);
              const cutoffDate = this.getTimeRangeCutoff(timeRange);
              if (readingDate < cutoffDate) {
                continue;
              }
            }
            readings.push(reading);
          }
        } catch (error) {
          console.error(`Failed to get reading ${readingId}:`, error);
        }
      }
      
      return readings;
    } catch (error) {
      console.error(`Failed to get user readings for ${userId}:`, error);
      return [];
    }
  }

  async getReading(readingId: string): Promise<any | null> {
    try {
      // Since we don't have userId in this method signature, we need to search
      // This is less efficient but matches the expected API
      const prefix = 'reading:';
      let cursor: string | undefined;
      
      do {
        const listOptions: any = {
          prefix,
          limit: 1000
        };
        if (cursor) {
          listOptions.cursor = cursor;
        }
        
        const result = await this.userProfiles.list(listOptions);
        
        for (const key of result.keys) {
          if (key.name.endsWith(`:${readingId}`)) {
            const reading = await this.userProfiles.get(key.name, { type: 'json' });
            return reading || null;
          }
        }
        
        cursor = result.cursor;
      } while (cursor);
      
      return null;
    } catch (error) {
      console.error(`Failed to get reading ${readingId}:`, error);
      return null;
    }
  }

  async deleteReading(readingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find the reading first to get userId
      const reading = await this.getReading(readingId);
      if (!reading) {
        return { success: false, error: 'Reading not found' };
      }
      
      const userId = reading.userId;
      const key = `reading:${userId}:${readingId}`;
      const userKey = `user_readings:${userId}`;
      
      // Delete the reading
      await this.userProfiles.delete(key);
      
      // Remove from user's reading list
      const userReadings = await this.userProfiles.get(userKey, { type: 'json' }) || [];
      const readingList = Array.isArray(userReadings) ? userReadings : [];
      
      const updatedList = readingList.filter(id => id !== readingId);
      await this.userProfiles.put(userKey, JSON.stringify(updatedList));
      
      return { success: true };
    } catch (error) {
      console.error(`Failed to delete reading ${readingId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async toggleFavorite(readingId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Find the reading first to get userId
      const reading = await this.getReading(readingId);
      if (!reading) {
        return { success: false, error: 'Reading not found' };
      }
      
      const userId = reading.userId;
      const key = `reading:${userId}:${readingId}`;
      
      // Toggle favorite status
      reading.isFavorite = !reading.isFavorite;
      reading.updatedAt = new Date().toISOString();
      
      await this.userProfiles.put(key, JSON.stringify(reading));
      
      const message = reading.isFavorite ? 'Reading added to favorites' : 'Reading removed from favorites';
      return { success: true, message };
    } catch (error) {
      console.error(`Failed to toggle favorite for reading ${readingId}:`, error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  private getTimeRangeCutoff(timeRange: string): Date {
    const now = new Date();
    const match = timeRange.match(/(\d+)([dwmy])/);
    
    if (!match || !match[1] || !match[2]) {
      // Default to 30 days if invalid format
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'd': // days
        return new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
      case 'w': // weeks
        return new Date(now.getTime() - value * 7 * 24 * 60 * 60 * 1000);
      case 'm': // months (approximate)
        return new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
      case 'y': // years (approximate)
        return new Date(now.getTime() - value * 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
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
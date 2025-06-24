/**
 * Cloudflare Workers KV Data Access Layer
 * 
 * Implements the KV operations interface for engine data management
 * in the Cloudflare Workers environment.
 */

import { KVOperations, KVKeyGenerator, CACHE_TTL_CONFIG } from './kv-schema';

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
    private cache: KVNamespace
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
      key = list.keys[0]?.name;
      if (!key) return null;
    }

    try {
      const data = await this.userProfiles.get(key, { type: 'json' });
      return data;
    } catch (error) {
      console.error(`Failed to get user profile ${key}:`, error);
      return null;
    }
  }

  async setUserProfile(userId: string, engineName: string, data: any): Promise<string> {
    const timestamp = new Date().toISOString();
    const key = KVKeyGenerator.userProfile(userId, engineName, timestamp);
    
    try {
      const profileData = {
        ...data,
        userId,
        engineName,
        timestamp,
        createdAt: timestamp
      };
      
      await this.userProfiles.put(
        key, 
        JSON.stringify(profileData),
        { expirationTtl: CACHE_TTL_CONFIG.user_profiles }
      );
      
      return timestamp;
    } catch (error) {
      console.error(`Failed to set user profile ${key}:`, error);
      throw error;
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
    ttl: number = CACHE_TTL_CONFIG.default
  ): Promise<void> {
    const key = KVKeyGenerator.cache(engineName, inputHash);
    
    try {
      const cacheData = {
        data,
        engineName,
        inputHash,
        cachedAt: new Date().toISOString()
      };

      await this.cache.put(
        key, 
        JSON.stringify(cacheData),
        { expirationTtl: ttl }
      );
    } catch (error) {
      console.error(`Failed to set cache ${key}:`, error);
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

  // Helper method to create input hash for caching
  static createInputHash(input: any): string {
    const inputString = typeof input === 'string' ? input : JSON.stringify(input);
    
    // Simple hash function for deterministic hashing
    let hash = 0;
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }
}

// Factory function for creating KV data access in Workers environment
export function createKVDataAccess(bindings: {
  ENGINE_DATA: KVNamespace;
  USER_PROFILES: KVNamespace;
  CACHE: KVNamespace;
}): CloudflareKVDataAccess {
  return new CloudflareKVDataAccess(
    bindings.ENGINE_DATA,
    bindings.USER_PROFILES,
    bindings.CACHE
  );
} 
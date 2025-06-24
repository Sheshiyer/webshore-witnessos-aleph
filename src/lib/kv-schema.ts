/**
 * Cloudflare Workers KV Schema Design for WitnessOS Engine Data
 * 
 * This file defines the schema structure for storing engine data
 * in Cloudflare Workers KV for optimal performance and organization.
 */

// KV Namespace Structure:
// - engine_data: Static engine reference data (JSON files)
// - user_profiles: User calculation results and preferences
// - cache: Temporary calculation cache for performance

export interface KVSchema {
  // Engine Data Keys Pattern: "engine:{engine_name}:{data_type}"
  // Examples:
  // - "engine:human_design:gates"
  // - "engine:tarot:major_arcana"
  // - "engine:iching:hexagrams"
  
  // User Profile Keys Pattern: "user:{user_id}:{engine_name}:{timestamp}"
  // Examples:
  // - "user:abc123:numerology:2025-01-15T10:30:00Z"
  // - "user:abc123:human_design:2025-01-15T10:30:00Z"
  
  // Cache Keys Pattern: "cache:{engine_name}:{input_hash}"
  // Examples:
  // - "cache:numerology:a1b2c3d4e5f6"
  // - "cache:tarot:f6e5d4c3b2a1"
}

// Engine Data Structure Definitions
export interface EngineDataConfig {
  human_design: {
    gates: any[];
    channels: any[];
    centers: any[];
    types: any[];
    profiles: any[];
    authorities: any[];
    definitions: any[];
    variables: any[];
    lines: any[];
    incarnation_crosses: any[];
    planetary_activations: any[];
    circuitry: any[];
  };
  
  tarot: {
    major_arcana: any[];
    rider_waite: any[];
  };
  
  iching: {
    hexagrams: any[];
    hexagrams_complete: any[];
  };
  
  gene_keys: {
    archetypes: any[];
  };
  
  astrology: {
    planets: any[];
    nakshatras: any[];
    dasha_periods: any[];
  };
  
  enneagram: {
    types: any[];
  };
  
  sacred_geometry: {
    symbols: any[];
    templates: any[];
  };
  
  // Numerology, Biorhythm, Sigil Forge have minimal static data
  numerology: Record<string, never>;
  biorhythm: Record<string, never>;
  sigil_forge: Record<string, never>;
}

// KV Operations Interface
export interface KVOperations {
  // Engine Data Operations
  getEngineData<T = any>(engineName: string, dataType: string): Promise<T | null>;
  setEngineData<T = any>(engineName: string, dataType: string, data: T): Promise<void>;
  
  // User Profile Operations
  getUserProfile(userId: string, engineName: string, timestamp?: string): Promise<any | null>;
  setUserProfile(userId: string, engineName: string, data: any): Promise<string>;
  listUserProfiles(userId: string): Promise<string[]>;
  
  // Cache Operations
  getCached<T = any>(engineName: string, inputHash: string): Promise<T | null>;
  setCached<T = any>(engineName: string, inputHash: string, data: T, ttl?: number): Promise<void>;
  
  // Bulk Operations
  bulkSetEngineData(engineName: string, dataMap: Record<string, any>): Promise<void>;
  
  // Maintenance Operations
  listEngineDataKeys(engineName: string): Promise<string[]>;
  deleteEngineData(engineName: string, dataType: string): Promise<void>;
  clearUserProfiles(userId: string): Promise<void>;
  clearCache(): Promise<void>;
}

// KV Key Generators
export class KVKeyGenerator {
  static engineData(engineName: string, dataType: string): string {
    return `engine:${engineName}:${dataType}`;
  }
  
  static userProfile(userId: string, engineName: string, timestamp?: string): string {
    const ts = timestamp || new Date().toISOString();
    return `user:${userId}:${engineName}:${ts}`;
  }
  
  static cache(engineName: string, inputHash: string): string {
    return `cache:${engineName}:${inputHash}`;
  }
  
  static listPrefix(prefix: string): string {
    return `${prefix}:`;
  }
}

// Data Migration Mapping
export const DATA_MIGRATION_MAP = {
  human_design: [
    'gates', 'channels', 'centers', 'types', 'profiles', 
    'authorities', 'definitions', 'variables', 'lines',
    'incarnation_crosses', 'planetary_activations', 'circuitry'
  ],
  tarot: ['major_arcana', 'rider_waite'],
  iching: ['hexagrams', 'hexagrams_complete'],
  gene_keys: ['archetypes'],
  astrology: ['planets', 'nakshatras', 'dasha_periods'],
  enneagram: ['types'],
  sacred_geometry: ['symbols', 'templates'],
  numerology: [], // No static data files
  biorhythm: [], // No static data files
  sigil_forge: [] // No static data files
} as const;

// Cache TTL Configuration (in seconds)
export const CACHE_TTL_CONFIG = {
  default: 3600, // 1 hour
  engine_data: -1, // Never expire (static data)
  user_profiles: 86400 * 30, // 30 days
  calculations: 3600, // 1 hour
  complex_calculations: 7200 // 2 hours for heavy calculations
} as const;

// KV Namespace Bindings (for Workers environment)
export interface WorkerKVBindings {
  ENGINE_DATA: KVNamespace;
  USER_PROFILES: KVNamespace;
  CACHE: KVNamespace;
} 
/**
 * WitnessOS Engine Registry
 * 
 * Minimal TypeScript engine registry for hybrid architecture
 * All consciousness engines now run on Python/Railway backend
 * This file maintains type compatibility and core utilities only
 */

export * from './core/types';
export * from './core/base-engine';
export * from './consciousness-simulator';
export * from './ai-interpretation-wrapper';

import { BaseEngine } from './core/base-engine';
import type { BaseEngineInput, CalculationResult, BaseEngineOutput } from './core/types';
import type { EngineName } from '../types/engines';

// Cloudflare D1 Database type
type D1Database = any;

// Minimal engine registry - all engines now run on Python backend
// This is kept for type compatibility and fallback scenarios only
const ENGINE_CLASSES = {} as const;

// No pre-instantiated engines in hybrid architecture
const ENGINE_INSTANCES_STATIC = {} as const;

// Cache for engine instances (minimal usage)
const ENGINE_INSTANCES = new Map<EngineName, any>();

/**
 * Get an engine instance by name
 * NOTE: In hybrid architecture, this should rarely be used
 * All calculations go through Cloudflare Workers -> Python engines
 * @param engineName - Name of the engine to get
 * @param db - Optional D1 database (not used in hybrid architecture)
 */
export function getEngine(engineName: EngineName, db?: D1Database): any {
  throw new Error(`Engine ${engineName} not available in TypeScript - use Python backend via Cloudflare Workers`);
}

/**
 * List all available engine names
 * NOTE: This returns the canonical list but engines run on Python backend
 */
export function listEngines(): EngineName[] {
  return [
    'numerology',
    'human_design',
    'tarot',
    'iching',
    'enneagram',
    'sacred_geometry',
    'vimshottari',
    'gene_keys',
    'sigil_forge',
    'biorhythm'
  ];
}

/**
 * Calculate using a specific engine with optional config
 * NOTE: In hybrid architecture, this should route to Cloudflare Workers
 */
export async function calculateEngine(
  engineName: EngineName,
  input: BaseEngineInput,
  config?: any,
  db?: D1Database
): Promise<CalculationResult<BaseEngineOutput>> {
  throw new Error(`Engine calculations must go through Cloudflare Workers -> Python backend. Use /engines/${engineName} API endpoint.`);
}

/**
 * Check if an engine is available
 * NOTE: All engines are available via Python backend
 */
export function isEngineAvailable(engineName: string): engineName is EngineName {
  const availableEngines = listEngines();
  return availableEngines.includes(engineName as EngineName);
}

/**
 * Get engine metadata
 * NOTE: Metadata is now served by Python backend
 */
export function getEngineMetadata(engineName: EngineName) {
  const metadata = ENGINE_METADATA[engineName];
  if (!metadata) {
    throw new Error(`No metadata available for engine: ${engineName}`);
  }
  return metadata;
}

/**
 * Health check for all engines
 * NOTE: In hybrid architecture, this checks Python backend health
 */
export async function healthCheck(): Promise<{ status: string; engines: string[] }> {
  const engines = listEngines();
  
  return {
    status: 'hybrid', // All engines run on Python backend
    engines: engines
  };
}

// Available engines list for API compatibility
export const AVAILABLE_ENGINES: EngineName[] = [
  'numerology',
  'human_design',
  'tarot',
  'iching',
  'enneagram',
  'sacred_geometry',
  'vimshottari',
  'gene_keys',
  'sigil_forge',
  'biorhythm'
];

// Engine metadata for discovery (kept for API compatibility)
export const ENGINE_METADATA = {
  'numerology': {
    name: 'Numerology',
    description: 'Life path and karmic analysis through numbers',
    category: 'foundational',
    difficulty: 'beginner',
    backend: 'python'
  },
  'human_design': {
    name: 'Human Design',
    description: 'Type, strategy, and authority mapping',
    category: 'foundational',
    difficulty: 'intermediate',
    backend: 'python'
  },
  'tarot': {
    name: 'Tarot',
    description: 'Archetypal guidance and symbolic insight',
    category: 'divination',
    difficulty: 'beginner',
    backend: 'python'
  },
  'iching': {
    name: 'I-Ching',
    description: 'Ancient wisdom and hexagram guidance',
    category: 'divination',
    difficulty: 'intermediate',
    backend: 'python'
  },
  'enneagram': {
    name: 'Enneagram',
    description: 'Personality types and growth patterns',
    category: 'psychology',
    difficulty: 'intermediate',
    backend: 'python'
  },
  'sacred_geometry': {
    name: 'Sacred Geometry',
    description: 'Pattern recognition and sacred ratios',
    category: 'mystical',
    difficulty: 'advanced',
    backend: 'python'
  },
  'vimshottari': {
    name: 'Vimshottari Dasha',
    description: 'Vedic planetary periods and timing',
    category: 'astrology',
    difficulty: 'advanced',
    backend: 'python'
  },
  'gene_keys': {
    name: 'Gene Keys',
    description: 'Archetypal pathworking and transformation',
    category: 'mystical',
    difficulty: 'advanced',
    backend: 'python'
  },
  'sigil_forge': {
    name: 'Sigil Forge',
    description: 'Intention manifestation and symbol creation',
    category: 'manifestation',
    difficulty: 'intermediate',
    backend: 'python'
  },
  'biorhythm': {
    name: 'Biorhythm',
    description: 'Biological cycle analysis and critical days',
    category: 'foundational',
    difficulty: 'beginner',
    backend: 'python'
  }
} as const;
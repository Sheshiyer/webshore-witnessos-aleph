/**
 * WitnessOS Engine Registry
 * 
 * Central registry for all TypeScript consciousness engines
 * Replaces Python FastAPI backend with pure TypeScript implementation
 */

export * from './core/types';
export * from './core/base-engine';
export * from './numerology-engine';
export * from './human-design-engine';
export * from './tarot-engine';
export * from './biorhythm-engine';
export * from './vimshottari-engine';
export * from './gene-keys-engine';
export * from './sigil-forge-engine';
export * from './nadabrahman-engine';
export * from './biofield-viewer-engine';

import { NumerologyEngine } from './numerology-engine';
import { HumanDesignEngine } from './human-design-engine';
import { BaseEngine } from './core/base-engine';
import type { BaseEngineInput, CalculationResult, BaseEngineOutput } from './core/types';
import type { EngineName } from '@/types/engines';
import { TarotEngine } from './tarot-engine';
import { ichingEngine } from './iching-engine';
import { enneagramEngine } from './enneagram-engine';
import { sacredGeometryEngine } from './sacred-geometry-engine';
import { BiorhythmEngine } from './biorhythm-engine';
import { VimshottariEngine } from './vimshottari-engine';
import { GeneKeysEngine } from './gene-keys-engine';
import { SigilForgeEngine } from './sigil-forge-engine';
import { NadaBrahmanEngine } from './nadabrahman-engine';

// Engine registry with proper typing
const ENGINE_CLASSES = {
  numerology: NumerologyEngine,
  human_design: HumanDesignEngine,
  tarot: TarotEngine,
  gene_keys: GeneKeysEngine,
  sigil_forge: SigilForgeEngine,
  biorhythm: BiorhythmEngine,
  vimshottari: VimshottariEngine,
  nadabrahman: NadaBrahmanEngine,
} as const;

// Pre-instantiated engines that don't follow BaseEngine pattern
const ENGINE_INSTANCES_STATIC = {
  iching: ichingEngine,
  enneagram: enneagramEngine,
  sacred_geometry: sacredGeometryEngine,
} as const;

// Cache for engine instances
const ENGINE_INSTANCES = new Map<EngineName, any>();

/**
 * Get an engine instance by name
 */
export function getEngine(engineName: EngineName): any {
  if (!ENGINE_INSTANCES.has(engineName)) {
    // Check if it's a pre-instantiated engine
    if (engineName in ENGINE_INSTANCES_STATIC) {
      const instance = ENGINE_INSTANCES_STATIC[engineName as keyof typeof ENGINE_INSTANCES_STATIC];
      ENGINE_INSTANCES.set(engineName, instance);
      return instance;
    }
    
         // Otherwise create new instance from class
     const EngineClass = ENGINE_CLASSES[engineName as keyof typeof ENGINE_CLASSES];
     if (!EngineClass) {
       throw new Error(`Unknown engine: ${engineName}`);
     }
     
     // Create instance with proper constructor parameters
     let instance: any;
     switch (engineName) {
       case 'numerology':
         instance = new EngineClass('numerology', 'Calculates numerological patterns and life path analysis', {});
         break;
       case 'human_design':
         instance = new EngineClass('human_design', 'Calculates complete Human Design charts with personality/design activations', {});
         break;
       case 'tarot':
         instance = new EngineClass('tarot', 'Performs tarot card readings using traditional spreads', {});
         break;
       case 'gene_keys':
         instance = new EngineClass('gene_keys', 'Provides Gene Keys archetypal analysis and pathworking guidance', {});
         break;
       case 'sigil_forge':
         instance = new EngineClass('sigil_forge', 'Creates sigils for manifestation and intention setting', {});
         break;
       case 'biorhythm':
         instance = new EngineClass('biorhythm', 'Calculates biorhythm cycles and critical days', {});
         break;
       case 'vimshottari':
         instance = new EngineClass('vimshottari', 'Calculates Vimshottari Dasha periods and karmic timing', {});
         break;
       case 'nadabrahman':
         instance = new EngineClass('nadabrahman', 'Bio-responsive raga synthesis and consciousness training', {});
         break;
       case 'biofield-viewer':
         instance = new EngineClass('biofield-viewer', 'Energetic signature capture and analysis', {});
         break;
       default:
         instance = new EngineClass(engineName, `${engineName} consciousness engine`, {});
     }
     
     ENGINE_INSTANCES.set(engineName, instance);
     return instance;
  }
  return ENGINE_INSTANCES.get(engineName)!;
}

/**
 * List all available engine names
 */
export function listEngines(): EngineName[] {
  const classEngines = Object.keys(ENGINE_CLASSES) as EngineName[];
  const staticEngines = Object.keys(ENGINE_INSTANCES_STATIC) as EngineName[];
  return [...classEngines, ...staticEngines];
}

/**
 * Calculate using a specific engine
 */
export async function calculateEngine(
  engineName: EngineName,
  input: BaseEngineInput
): Promise<CalculationResult<BaseEngineOutput>> {
  const engine = getEngine(engineName);
  return engine.calculate(input as any);
}

/**
 * Check if an engine is available
 */
export function isEngineAvailable(engineName: string): engineName is EngineName {
  return engineName in ENGINE_CLASSES || engineName in ENGINE_INSTANCES_STATIC;
}

/**
 * Get engine metadata
 */
export function getEngineMetadata(engineName: EngineName) {
  const engine = getEngine(engineName);
  return engine.getMetadata();
}

/**
 * Health check for all engines
 */
export async function healthCheck(): Promise<{ status: string; engines: string[] }> {
  const engines = listEngines();
  const availableEngines = engines.filter(engineName => {
    try {
      getEngine(engineName);
      return true;
    } catch {
      return false;
    }
  });

  return {
    status: availableEngines.length === engines.length ? 'healthy' : 'degraded',
    engines: availableEngines
  };
}

// Engine registry
export const engineRegistry = {
  numerology: NumerologyEngine,
  'human-design': HumanDesignEngine,
  tarot: TarotEngine,
  iching: ichingEngine,
  enneagram: enneagramEngine,
  sacred_geometry: sacredGeometryEngine,
};

// Consciousness Engine Types
export type EngineName = 
  | 'numerology'
  | 'human-design'
  | 'tarot'
  | 'iching'
  | 'enneagram'
  | 'sacred-geometry'
  | 'vimshottari'
  | 'gene-keys'
  | 'sigil-forge'
  | 'nadabrahman'
  | 'biofield-viewer';

export const AVAILABLE_ENGINES: EngineName[] = [
  'numerology',
  'human-design', 
  'tarot',
  'iching',
  'enneagram',
  'sacred-geometry',
  'vimshottari',
  'gene-keys',
  'sigil-forge',
  'nadabrahman',
  'biofield-viewer'
];

// Engine metadata for discovery
export const ENGINE_METADATA = {
  'numerology': {
    name: 'Numerology',
    description: 'Life path and karmic analysis through numbers',
    category: 'foundational',
    difficulty: 'beginner'
  },
  'human-design': {
    name: 'Human Design',
    description: 'Type, strategy, and authority mapping',
    category: 'foundational',
    difficulty: 'intermediate'
  },
  'tarot': {
    name: 'Tarot',
    description: 'Archetypal guidance and symbolic insight',
    category: 'divination',
    difficulty: 'beginner'
  },
  'iching': {
    name: 'I-Ching',
    description: 'Ancient wisdom and hexagram guidance',
    category: 'divination',
    difficulty: 'intermediate'
  },
  'enneagram': {
    name: 'Enneagram',
    description: 'Personality types and growth patterns',
    category: 'psychology',
    difficulty: 'intermediate'
  },
  'sacred-geometry': {
    name: 'Sacred Geometry',
    description: 'Pattern recognition and sacred ratios',
    category: 'mystical',
    difficulty: 'advanced'
  },
  'vimshottari': {
    name: 'Vimshottari Dasha',
    description: 'Vedic planetary periods and timing',
    category: 'astrology',
    difficulty: 'advanced'
  },
  'gene-keys': {
    name: 'Gene Keys',
    description: 'Archetypal pathworking and transformation',
    category: 'mystical',
    difficulty: 'advanced'
  },
  'sigil-forge': {
    name: 'Sigil Forge',
    description: 'Intention manifestation and symbol creation',
    category: 'manifestation',
    difficulty: 'intermediate'
  },
  'nadabrahman': {
    name: 'NadaBrahman',
    description: 'Bio-responsive raga synthesis',
    category: 'sound',
    difficulty: 'advanced'
  },
  'biofield-viewer': {
    name: 'Biofield Viewer',
    description: 'Energetic signature capture and analysis',
    category: 'biofield',
    difficulty: 'foundational'
  }
} as const; 
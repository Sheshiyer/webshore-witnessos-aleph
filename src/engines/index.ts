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

// Engine registry with proper typing
const ENGINE_CLASSES = {
  numerology: NumerologyEngine,
  human_design: HumanDesignEngine,
  tarot: TarotEngine,
  // TODO: Add other engines as they're implemented
      iching: ichingEngine,
        enneagram: enneagramEngine,
    gene_keys: GeneKeysEngine,
    sacred_geometry: sacredGeometryEngine,
  sigil_forge: SigilForgeEngine,
  biorhythm: BiorhythmEngine,
  vimshottari: VimshottariEngine,
} as const;

// Cache for engine instances
const ENGINE_INSTANCES = new Map<EngineName, BaseEngine<any, any>>();

/**
 * Get an engine instance by name
 */
export function getEngine(engineName: EngineName): BaseEngine<any, any> {
  if (!ENGINE_INSTANCES.has(engineName)) {
    const EngineClass = ENGINE_CLASSES[engineName];
    if (!EngineClass) {
      throw new Error(`Unknown engine: ${engineName}`);
    }
    ENGINE_INSTANCES.set(engineName, new EngineClass());
  }
  return ENGINE_INSTANCES.get(engineName)!;
}

/**
 * List all available engine names
 */
export function listEngines(): EngineName[] {
  return Object.keys(ENGINE_CLASSES) as EngineName[];
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
  return engineName in ENGINE_CLASSES;
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
}; 
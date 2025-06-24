/**
 * WitnessOS Webshore Type Definitions Index
 *
 * Central export point for all consciousness-aware TypeScript types
 * Maintains mystical-technical balance and strict type safety
 */

// Core consciousness types
export * from './consciousness';

// Engine-specific types
export * from './engines';

// Three.js and 3D types
export * from './three';

// Import types for type guards
import type {
  BaseEngineOutput,
  ConsciousnessState,
  BreathState,
  DiscoveryEvent,
  SacredGeometry,
  ConsciousnessField,
  BreathPattern,
  DiscoveryLayer,
} from './consciousness';

// Type guards for runtime type checking
export const isEngineOutput = (obj: unknown): obj is BaseEngineOutput => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'engineName' in obj &&
    typeof (obj as Record<string, unknown>).engineName === 'string' &&
    'calculationTime' in obj &&
    typeof (obj as Record<string, unknown>).calculationTime === 'number' &&
    'confidenceScore' in obj &&
    typeof (obj as Record<string, unknown>).confidenceScore === 'number' &&
    'formattedOutput' in obj &&
    typeof (obj as Record<string, unknown>).formattedOutput === 'string' &&
    'recommendations' in obj &&
    Array.isArray((obj as Record<string, unknown>).recommendations) &&
    'realityPatches' in obj &&
    Array.isArray((obj as Record<string, unknown>).realityPatches) &&
    'archetypalThemes' in obj &&
    Array.isArray((obj as Record<string, unknown>).archetypalThemes)
  );
};

export const isConsciousnessState = (obj: unknown): obj is ConsciousnessState => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'awarenessLevel' in obj &&
    typeof (obj as Record<string, unknown>).awarenessLevel === 'number' &&
    'integrationPoints' in obj &&
    Array.isArray((obj as Record<string, unknown>).integrationPoints) &&
    'expansionVectors' in obj &&
    Array.isArray((obj as Record<string, unknown>).expansionVectors) &&
    'shadowTerritories' in obj &&
    Array.isArray((obj as Record<string, unknown>).shadowTerritories) &&
    'lightFrequencies' in obj &&
    Array.isArray((obj as Record<string, unknown>).lightFrequencies)
  );
};

export const isBreathState = (obj: unknown): obj is BreathState => {
  const o = obj as Record<string, unknown>;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'pattern' in obj &&
    typeof o.pattern === 'object' &&
    o.pattern !== null &&
    'coherence' in obj &&
    typeof o.coherence === 'number' &&
    'synchronization' in obj &&
    typeof o.synchronization === 'number'
  );
};

export const isDiscoveryEvent = (obj: unknown): obj is DiscoveryEvent => {
  const o = obj as Record<string, unknown>;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof o.id === 'string' &&
    'type' in obj &&
    ['easter_egg', 'documentation', 'achievement', 'revelation'].includes(o.type as string) &&
    'title' in obj &&
    typeof o.title === 'string' &&
    'layer' in obj &&
    typeof o.layer === 'number' &&
    'unlocked' in obj &&
    typeof o.unlocked === 'boolean'
  );
};

export const isSacredGeometry = (obj: unknown): obj is SacredGeometry => {
  const o = obj as Record<string, unknown>;
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'pattern' in obj &&
    typeof o.pattern === 'string' &&
    'dimensions' in obj &&
    Array.isArray(o.dimensions) &&
    'goldenRatio' in obj &&
    typeof o.goldenRatio === 'boolean' &&
    'fibonacciSequence' in obj &&
    Array.isArray(o.fibonacciSequence)
  );
};

// Utility functions for type conversion
export const createConsciousnessField = (
  signature: string,
  vibration: number = 0.5,
  coherence: number = 0.5
): ConsciousnessField => ({
  signature,
  vibration,
  coherence,
  timestamp: new Date().toISOString(),
});

export const createBreathPattern = (
  inhale: number = 4,
  hold: number = 4,
  exhale: number = 4,
  pause: number = 4,
  rhythm: number = 60
): BreathPattern => {
  const totalCycle = inhale + hold + exhale + pause;
  return {
    inhaleCount: inhale,
    holdCount: hold,
    exhaleCount: exhale,
    pauseCount: pause,
    rhythm,
    totalCycle,
    frequency: 1.0 / totalCycle
  };
};

export const createDiscoveryLayer = (
  id: number,
  name: string,
  description: string,
  unlocked: boolean = false,
  progress: number = 0
): DiscoveryLayer => ({
  id,
  name,
  description,
  unlocked,
  progress,
});

// Constants for consciousness calculations
export const CONSCIOUSNESS_CONSTANTS = {
  GOLDEN_RATIO: 1.618033988749,
  FIBONACCI_SEQUENCE: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610],
  SACRED_FREQUENCIES: {
    SOLFEGGIO: [174, 285, 396, 417, 528, 639, 741, 852, 963],
    CHAKRA: [256, 288, 320, 341.3, 384, 426.7, 480, 512],
    PLANETARY: [194.18, 210.42, 221.23, 229.22, 241.56, 272.2, 295.7, 315.8],
  },
  BREATH_PATTERNS: {
    COHERENT: { inhale: 5, hold: 0, exhale: 5, pause: 0 },
    BOX: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
    TRIANGLE: { inhale: 4, hold: 4, exhale: 4, pause: 0 },
    EXTENDED: { inhale: 4, hold: 7, exhale: 8, pause: 0 },
  },
  DISCOVERY_LAYERS: {
    PORTAL: 0,
    AWAKENING: 1,
    RECOGNITION: 2,
    INTEGRATION: 3,
  },
} as const;

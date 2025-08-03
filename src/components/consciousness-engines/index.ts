/**
 * Consciousness Engines Export Index
 *
 * Centralized exports for all 10 WitnessOS consciousness engine 3D visualizations
 * Each engine provides specialized consciousness calculations with fractal 3D experiences
 */

// Core engine components
import BiorhythmEngineComponent from './BiorhythmEngine';
import BreathDetectionComponent from './BreathDetection';
import EnneagramEngineComponent from './EnneagramEngine';
import GeneKeysEngineComponent from './GeneKeysEngine';
import HumanDesignEngineComponent from './HumanDesignEngine';
import IChingEngineComponent from './IChingEngine';
import NumerologyEngineComponent from './NumerologyEngine';
import SacredGeometryEngineComponent from './SacredGeometryEngine';
import SigilForgeEngineComponent from './SigilForgeEngine';
import TarotEngineComponent from './TarotEngine';
import VimshottariEngineComponent from './VimshottariEngine';
import VedicClockTCMEngineComponent from './VedicClockTCMEngine';
import { NadaBrahmanEngine as NadaBrahmanEngineComponent } from './NadaBrahmanEngine';

// Re-export with consistent names
export {
  BiorhythmEngineComponent as BiorhythmEngine,
  BreathDetectionComponent as BreathDetection,
  EnneagramEngineComponent as EnneagramEngine,
  GeneKeysEngineComponent as GeneKeysEngine,
  HumanDesignEngineComponent as HumanDesignEngine,
  IChingEngineComponent as IChingEngine,
  NumerologyEngineComponent as NumerologyEngine,
  SacredGeometryEngineComponent as SacredGeometryEngine,
  SigilForgeEngineComponent as SigilForgeEngine,
  TarotEngineComponent as TarotEngine,
  VimshottariEngineComponent as VimshottariEngine,
  VedicClockTCMEngineComponent as VedicClockTCMEngine,
  NadaBrahmanEngineComponent as NadaBrahmanEngine,
};

// Engine type definitions for easy reference
export type EngineComponent =
  | 'numerology'
  | 'biorhythm'
  | 'human_design'
  | 'vimshottari'
  | 'tarot'
  | 'iching'
  | 'gene_keys'
  | 'enneagram'
  | 'sacred_geometry'
  | 'sigil_forge'
  | 'vedicclock_tcm';

// Engine metadata for discovery layer integration
export const ENGINE_METADATA = {
  numerology: {
    name: 'Numerology Field Extractor',
    description: 'Sacred number geometry with fractal life path spirals',
    layer: 2, // Recognition layer
    color: '#FFD700',
    frequency: 528,
    element: 'spirit',
  },
  biorhythm: {
    name: 'Biorhythm Synchronizer',
    description: "Temporal wave visualization using Nishitsuji's wave equations",
    layer: 1, // Awakening layer
    color: '#FF6B6B',
    frequency: 396,
    element: 'time',
  },
  human_design: {
    name: 'Human Design Scanner',
    description: 'Gate-based fractal spatial layouts and energy center mandalas',
    layer: 3, // Integration layer
    color: '#4ECDC4',
    frequency: 741,
    element: 'consciousness',
  },
  vimshottari: {
    name: 'Vimshottari Timeline Mapper',
    description: 'Timeline spiral navigation with fractal time dilation effects',
    layer: 2, // Recognition layer
    color: '#45B7D1',
    frequency: 852,
    element: 'time',
  },
  tarot: {
    name: 'Tarot Sequence Decoder',
    description: 'Card-based symbolic environments with archetypal fractal signatures',
    layer: 2, // Recognition layer
    color: '#9370DB',
    frequency: 639,
    element: 'archetype',
  },
  iching: {
    name: 'I-Ching Mutation Oracle',
    description: 'Hexagram transformation spaces using wave interference patterns',
    layer: 2, // Recognition layer
    color: '#32CD32',
    frequency: 417,
    element: 'change',
  },
  gene_keys: {
    name: 'Gene Keys Compass',
    description: 'Codon-based consciousness mapping with DNA fractal structures',
    layer: 3, // Integration layer
    color: '#FF69B4',
    frequency: 963,
    element: 'evolution',
  },
  enneagram: {
    name: 'Enneagram Resonator',
    description: '9-point personality space with center-specific fractal patterns',
    layer: 3, // Integration layer
    color: '#FFA500',
    frequency: 174,
    element: 'personality',
  },
  sacred_geometry: {
    name: 'Sacred Geometry Mapper',
    description: 'Interactive fractal pattern exploration with infinite zoom',
    layer: 1, // Awakening layer
    color: '#FFFFFF',
    frequency: 528,
    element: 'geometry',
  },
  sigil_forge: {
    name: 'Sigil Forge Synthesizer',
    description: 'Symbol creation using minimal GLSL fractal generation',
    layer: 3, // Integration layer
    color: '#DDA0DD',
    frequency: 285,
    element: 'intention',
  },
  vedicclock_tcm: {
    name: 'VedicClock-TCM Integration',
    description: 'Multi-dimensional consciousness optimization combining Vedic time cycles with TCM organ rhythms',
    layer: 3, // Integration layer - advanced consciousness technology
    color: '#8B4513', // Earth-tone for grounding
    frequency: 432, // Sacred frequency for consciousness integration
    element: 'time',
  },
} as const;

// Helper function to get engines by discovery layer
export const getEnginesByLayer = (layer: number): EngineComponent[] => {
  return Object.entries(ENGINE_METADATA)
    .filter(([_, metadata]) => metadata.layer === layer)
    .map(([engine, _]) => engine as EngineComponent);
};

// Helper function to get engine metadata
export const getEngineMetadata = (engine: EngineComponent) => {
  return ENGINE_METADATA[engine];
};

// Engine component mapping for dynamic loading
export const ENGINE_COMPONENTS = {
  numerology: NumerologyEngineComponent,
  biorhythm: BiorhythmEngineComponent,
  human_design: HumanDesignEngineComponent,
  vimshottari: VimshottariEngineComponent,
  tarot: TarotEngineComponent,
  iching: IChingEngineComponent,
  gene_keys: GeneKeysEngineComponent,
  enneagram: EnneagramEngineComponent,
  sacred_geometry: SacredGeometryEngineComponent,
  sigil_forge: SigilForgeEngineComponent,
  vedicclock_tcm: VedicClockTCMEngineComponent,
} as const;

// Discovery layer engine distribution
export const LAYER_ENGINES = {
  0: [], // Portal layer - no engines, just entry
  1: ['sacred_geometry', 'biorhythm'], // Awakening - foundational patterns
  2: ['numerology', 'vimshottari', 'tarot', 'iching'], // Recognition - system understanding
  3: ['human_design', 'gene_keys', 'enneagram', 'sigil_forge', 'vedicclock_tcm'], // Integration - personal mastery
} as const;

// Consciousness frequency mapping for engine harmonics
export const ENGINE_FREQUENCIES = Object.fromEntries(
  Object.entries(ENGINE_METADATA).map(([engine, metadata]) => [engine, metadata.frequency])
);

// Engine element groupings for thematic organization
export const ENGINE_ELEMENTS = {
  spirit: ['numerology', 'sacred_geometry'],
  time: ['biorhythm', 'vimshottari', 'vedicclock_tcm'],
  consciousness: ['human_design'],
  archetype: ['tarot'],
  change: ['iching'],
  evolution: ['gene_keys'],
  personality: ['enneagram'],
  intention: ['sigil_forge'],
} as const;

export default {
  // Components
  NumerologyEngine: NumerologyEngineComponent,
  BiorhythmEngine: BiorhythmEngineComponent,
  HumanDesignEngine: HumanDesignEngineComponent,
  VimshottariEngine: VimshottariEngineComponent,
  TarotEngine: TarotEngineComponent,
  IChingEngine: IChingEngineComponent,
  GeneKeysEngine: GeneKeysEngineComponent,
  EnneagramEngine: EnneagramEngineComponent,
  SacredGeometryEngine: SacredGeometryEngineComponent,
  SigilForgeEngine: SigilForgeEngineComponent,
  VedicClockTCMEngine: VedicClockTCMEngineComponent,
  BreathDetection: BreathDetectionComponent,

  // Metadata
  ENGINE_METADATA,
  ENGINE_COMPONENTS,
  LAYER_ENGINES,
  ENGINE_FREQUENCIES,
  ENGINE_ELEMENTS,

  // Utilities
  getEnginesByLayer,
  getEngineMetadata,
};

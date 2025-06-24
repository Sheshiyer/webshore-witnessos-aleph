/**
 * Three.js and React Three Fiber Types for WitnessOS Webshore
 *
 * Consciousness-aware 3D types for procedural generation and sacred geometry
 */

import { Vector3, Euler, Color, Material, BufferGeometry } from 'three';
import type { BreathPattern, BreathState, ConsciousnessState } from './consciousness';

// Note: React Three Fiber type extensions will be added when components are implemented

// Sacred geometry types
export interface PlatonicSolid {
  type: 'tetrahedron' | 'cube' | 'octahedron' | 'dodecahedron' | 'icosahedron';
  vertices: Vector3[];
  faces: number[][];
  edges: [number, number][];
  dualSolid: PlatonicSolid['type'];
}

export interface GoldenRatioGeometry {
  ratio: number; // φ = 1.618...
  spiralPoints: Vector3[];
  rectangles: Rectangle3D[];
  pentagonVertices: Vector3[];
}

export interface FibonacciSequence {
  sequence: number[];
  spiralRadius: number[];
  spiralAngles: number[];
  points3D: Vector3[];
}

export interface SacredPattern {
  name: string;
  type: 'mandala' | 'yantra' | 'merkaba' | 'flower_of_life' | 'sri_yantra';
  centerPoint: Vector3;
  radius: number;
  layers: number;
  symmetry: number;
  vertices: Vector3[];
  connections: [number, number][];
}

// Consciousness-responsive geometry
export interface ConsciousnessGeometry extends BufferGeometry {
  consciousnessLevel: number; // 0.0 - 1.0
  archetypalInfluence: string[];
  breathSynchronization: boolean;
  updateFromConsciousness(state: ConsciousnessState): void;
  generateFromNumerology(data: NumerologyData): void;
  morphToArchetype(archetype: string, duration: number): void;
}

export interface NumerologyData {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
}

// ConsciousnessState imported from consciousness.ts

// Sacred materials and shaders
export interface SacredMaterial extends Material {
  consciousnessLevel: number;
  archetypalColor: Color;
  breathPulse: boolean;
  goldenRatioInfluence: number;
  lightFrequency: number;
  updateFromBreath(breathState: BreathState): void;
}

// BreathState imported from consciousness.ts

export interface ConsciousnessShader {
  vertexShader: string;
  fragmentShader: string;
  uniforms: {
    time: { value: number };
    consciousness: { value: number };
    breath: { value: number };
    archetype: { value: Vector3 };
    goldenRatio: { value: number };
    lightFrequency: { value: number };
  };
}

// Animation and interaction types
export interface BreathAnimator {
  breathPattern: BreathPattern;
  targetObjects: string[]; // object IDs
  animationType: 'scale' | 'rotation' | 'position' | 'material' | 'all';
  intensity: number; // 0.0 - 1.0
  synchronization: number; // 0.0 - 1.0
  start(): void;
  stop(): void;
  updatePattern(pattern: BreathPattern): void;
}

// BreathPattern imported from consciousness.ts

export interface ConsciousnessAnimation {
  id: string;
  type: 'archetypal_shift' | 'consciousness_expansion' | 'sacred_rotation' | 'golden_spiral';
  duration: number; // seconds
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'consciousness';
  loop: boolean;
  breathSync: boolean;
  parameters: Record<string, unknown>;
}

// Procedural generation types
export interface ProceduralGenerator {
  seed: string;
  complexity: number; // 0.0 - 1.0
  variation: number; // 0.0 - 1.0
  consciousnessInfluence: number; // 0.0 - 1.0
  generateGeometry(type: GeometryType): ConsciousnessGeometry;
  generateMaterial(archetype: string): SacredMaterial;
  generatePattern(pattern: SacredPattern['type']): SacredPattern;
}

export type GeometryType =
  | 'portal_chamber'
  | 'consciousness_mandala'
  | 'archetypal_temple'
  | 'sacred_garden'
  | 'numerology_spiral'
  | 'human_design_bodygraph'
  | 'tarot_spread_layout'
  | 'iching_hexagram'
  | 'enneagram_circle';

// Scene composition types
export interface ConsciousnessScene {
  id: string;
  name: string;
  layer: number; // 0-3 discovery layers
  centerPoint: Vector3;
  boundingRadius: number;
  geometries: ConsciousnessGeometry[];
  materials: SacredMaterial[];
  animations: ConsciousnessAnimation[];
  lighting: ConsciousnessLighting;
  audio: SpatialAudio;
}

export interface ConsciousnessLighting {
  ambient: {
    color: Color;
    intensity: number;
    consciousnessResponsive: boolean;
  };
  directional: {
    color: Color;
    intensity: number;
    position: Vector3;
    breathSync: boolean;
  };
  point: {
    color: Color;
    intensity: number;
    position: Vector3;
    distance: number;
    archetypalInfluence: string;
  }[];
}

export interface SpatialAudio {
  binauralBeats: {
    frequency: number; // Hz
    beatFrequency: number; // Hz
    volume: number; // 0.0 - 1.0
    consciousnessSync: boolean;
  };
  ambientSounds: {
    url: string;
    volume: number;
    loop: boolean;
    spatialPosition: Vector3;
    maxDistance: number;
  }[];
  breathSounds: {
    inhale: string;
    exhale: string;
    volume: number;
    breathSync: boolean;
  };
}

// Interaction and navigation types
export interface ConsciousnessCamera {
  position: Vector3;
  target: Vector3;
  fov: number;
  near: number;
  far: number;
  breathInfluence: number; // 0.0 - 1.0
  consciousnessZoom: boolean;
  archetypalFilter: string[];
}

export interface SacredNavigation {
  currentLayer: number; // 0-3
  availableLayers: number[];
  compassDirection: Vector3;
  magneticField: number;
  consciousnessBeacon: Vector3[];
  spatialMemory: SpatialMemoryPoint[];
}

export interface SpatialMemoryPoint {
  id: string;
  position: Vector3;
  significance: number; // 0.0 - 1.0
  archetype: string;
  discovered: boolean;
  timestamp: string;
}

// Performance optimization types
export interface LODConfiguration {
  distances: number[]; // LOD switch distances
  geometryComplexity: number[]; // complexity levels 0.0 - 1.0
  materialQuality: number[]; // quality levels 0.0 - 1.0
  animationDetail: number[]; // animation detail levels 0.0 - 1.0
  consciousnessAdaptive: boolean;
}

export interface PerformanceMetrics {
  fps: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  memoryUsage: number; // MB
  gpuMemory: number; // MB
  consciousnessLoad: number; // 0.0 - 1.0
}

// Utility types
export interface Rectangle3D {
  topLeft: Vector3;
  topRight: Vector3;
  bottomLeft: Vector3;
  bottomRight: Vector3;
  center: Vector3;
  width: number;
  height: number;
}

export interface Transform3D {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
}

// Export all types - removed to avoid conflicts, using individual exports above

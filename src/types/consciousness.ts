/**
 * Core Consciousness Types for WitnessOS Webshore
 *
 * TypeScript interfaces matching Python data models from WitnessOS engines
 * Maintains mystical-technical balance and consciousness terminology
 */

// Base consciousness field types
export interface ConsciousnessField {
  signature: string;
  vibration: number;
  coherence: number;
  timestamp: string;
}

export interface ArchetypalPattern {
  archetype: string;
  strength: number; // 0.0 - 1.0
  description: string;
  guidance?: string;
}

export interface TimelineEvent {
  dateRange: [string, string]; // ISO date strings
  eventType: string;
  description: string;
  probability: number; // 0.0 - 1.0
  preparation?: string;
}

// Base engine input/output interfaces
export interface BaseEngineInput {
  userId?: string;
  sessionId?: string;
  timestamp?: string;
}

export interface BaseEngineOutput {
  engineName: string;
  calculationTime: number;
  confidenceScore: number; // 0.0 - 1.0
  timestamp: string;

  // Core data
  rawData: Record<string, unknown>;
  formattedOutput: string;
  recommendations: string[];

  // WitnessOS consciousness fields
  fieldSignature?: string;
  realityPatches: string[];
  archetypalThemes: string[];
}

// Birth data interface for astrological engines
export interface BirthData {
  birthDate: string; // ISO date
  birthTime: string; // HH:MM format
  birthLocation: [number, number]; // [latitude, longitude]
  timezone: string;
  // Backward compatibility properties
  date: string; // alias for birthDate
  time: string; // alias for birthTime
  location: [number, number]; // alias for birthLocation
}

// Personal data interface
export interface PersonalData {
  fullName: string;
  preferredName?: string;
  birthDate: string;
  // Backward compatibility properties
  name: string; // alias for fullName
}

// Question-based input interface
export interface QuestionInput {
  question: string;
  context?: string;
  focusArea?: string;
}

// Calculation result interface
export interface CalculationResult {
  value: number | string;
  interpretation: string;
  significance: number; // 0.0 - 1.0
  guidance?: string;
}

// Sacred geometry types
export interface SacredGeometry {
  pattern: string;
  dimensions: number[];
  goldenRatio: boolean;
  fibonacciSequence: number[];
  platonicSolid?: string;
}

// Consciousness state types
export interface ConsciousnessState {
  awarenessLevel: number; // 0.0 - 1.0
  integrationPoints: string[];
  expansionVectors: string[];
  shadowTerritories: string[];
  lightFrequencies: string[];
}

// Breath synchronization types
export interface BreathPattern {
  inhaleCount: number;
  holdCount: number;
  exhaleCount: number;
  pauseCount: number;
  rhythm: number; // BPM
  totalCycle: number; // Total cycle time in seconds
  frequency: number; // Hz
}

export interface BreathState {
  pattern: BreathPattern;
  phase: 'inhale' | 'hold' | 'exhale' | 'pause';
  intensity: number; // 0.0 - 1.0
  rhythm: number; // BPM
  coherence: number; // 0.0 - 1.0
  synchronization: number; // 0.0 - 1.0
  timestamp: string;
}

// Discovery mechanics types
export interface DiscoveryLayer {
  id: number; // 0-3
  name: string;
  description: string;
  unlocked: boolean;
  progress: number; // 0.0 - 1.0
}

export interface DiscoveryEvent {
  id: string;
  type: 'easter_egg' | 'documentation' | 'achievement' | 'revelation';
  title: string;
  description: string;
  layer: number;
  unlocked: boolean;
  timestamp?: string;
}

// Spatial navigation types
export interface SpatialSignature {
  coordinates: [number, number, number]; // x, y, z
  orientation: [number, number, number]; // rotation
  scale: number;
  resonance: number; // 0.0 - 1.0
}

export interface ConsciousnessCompass {
  direction: [number, number, number]; // normalized vector
  magneticField: number;
  trueNorth: [number, number, number];
  deviation: number;
}

// 3D Scene types for React Three Fiber
export interface Scene3D {
  id: string;
  name: string;
  geometry: SacredGeometry;
  materials: Material3D[];
  lighting: Lighting3D;
  animations: Animation3D[];
}

export interface Material3D {
  id: string;
  type: 'consciousness' | 'sacred' | 'archetypal' | 'temporal';
  properties: Record<string, unknown>;
  shaders?: string[];
}

export interface Lighting3D {
  ambient: number; // 0.0 - 1.0
  directional: [number, number, number]; // direction vector
  color: string; // hex color
  intensity: number; // 0.0 - 1.0
  breathSync: boolean;
}

export interface Animation3D {
  id: string;
  type: 'breath' | 'consciousness' | 'archetypal' | 'temporal';
  duration: number; // seconds
  easing: string;
  loop: boolean;
  breathSynchronized: boolean;
}

// Procedural generation types
export interface ProceduralConfig {
  seed: string;
  complexity: number; // 0.0 - 1.0
  variation: number; // 0.0 - 1.0
  consciousnessInfluence: number; // 0.0 - 1.0
}

export interface GenerationResult {
  geometry: SacredGeometry;
  materials: Material3D[];
  metadata: Record<string, unknown>;
  signature: string;
}

// API integration types
export interface EngineAPIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  processingTime: number;
}

export interface APIEndpoint {
  engine: string;
  method: 'GET' | 'POST';
  path: string;
  requiresAuth: boolean;
}

// Error handling types
export interface ConsciousnessError {
  code: string;
  message: string;
  context?: Record<string, unknown>;
  suggestions?: string[];
  timestamp: string;
}

// Export all types - removed to avoid conflicts, using individual exports above

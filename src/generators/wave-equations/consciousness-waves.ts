/**
 * Consciousness Wave Equations for WitnessOS Webshore
 * 
 * Mathematical wave functions for consciousness visualization
 * Inspired by Yohei Nishitsuji's "Everything is a Wave" philosophy
 */

import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import type { BreathPattern, BreathState, ConsciousnessState } from '@/types';

const { SACRED_MATHEMATICS, CONSCIOUSNESS_FREQUENCIES, BREATH_PATTERNS } = CONSCIOUSNESS_CONSTANTS;

/**
 * Core wave equation: y = A * sin(2π * f * t + φ) * e^(-d * t)
 * Where: A = amplitude, f = frequency, t = time, φ = phase, d = decay
 */
export class ConsciousnessWave {
  constructor(
    public amplitude: number = 1.0,
    public frequency: number = 1.0,
    public phase: number = 0.0,
    public decay: number = 0.0
  ) {}

  /**
   * Calculate wave value at given time
   */
  valueAt(time: number): number {
    const omega = SACRED_MATHEMATICS.TAU * this.frequency;
    const decayFactor = Math.exp(-this.decay * time);
    return this.amplitude * Math.sin(omega * time + this.phase) * decayFactor;
  }

  /**
   * Calculate wave derivative (velocity) at given time
   */
  derivativeAt(time: number): number {
    const omega = SACRED_MATHEMATICS.TAU * this.frequency;
    const decayFactor = Math.exp(-this.decay * time);
    const sinComponent = Math.sin(omega * time + this.phase);
    const cosComponent = Math.cos(omega * time + this.phase);
    
    return this.amplitude * decayFactor * (
      omega * cosComponent - this.decay * sinComponent
    );
  }

  /**
   * Modulate wave with another wave (consciousness interference)
   */
  modulateWith(other: ConsciousnessWave, time: number): number {
    return this.valueAt(time) * other.valueAt(time);
  }
}

/**
 * Breath wave generator based on physiological patterns
 */
export class BreathWave {
  private wave: ConsciousnessWave;
  private pattern: BreathPattern;
  private startTime: number;

  constructor(pattern: BreathPattern = BREATH_PATTERNS.COHERENT) {
    this.pattern = pattern;
    this.wave = new ConsciousnessWave(
      1.0,
      1.0 / pattern.totalCycle, // Convert cycle time to frequency
      0.0,
      0.0
    );
    this.startTime = Date.now() / 1000;
  }

  /**
   * Get current breath state and phase
   */
  getCurrentState(): BreathState {
    const currentTime = Date.now() / 1000 - this.startTime;
    const cyclePosition = (currentTime % this.pattern.totalCycle) / this.pattern.totalCycle;
    
    let phase: BreathState['phase'];
    let intensity: number;
    
    // Determine breath phase based on cycle position
    const inhaleEnd = this.pattern.inhaleCount / this.pattern.totalCycle;
    const holdEnd = inhaleEnd + (this.pattern.holdCount / this.pattern.totalCycle);
    const exhaleEnd = holdEnd + (this.pattern.exhaleCount / this.pattern.totalCycle);
    
    if (cyclePosition < inhaleEnd) {
      phase = 'inhale';
      intensity = cyclePosition / inhaleEnd;
    } else if (cyclePosition < holdEnd) {
      phase = 'hold';
      intensity = 1.0;
    } else if (cyclePosition < exhaleEnd) {
      phase = 'exhale';
      intensity = 1.0 - ((cyclePosition - holdEnd) / (exhaleEnd - holdEnd));
    } else {
      phase = 'pause';
      intensity = 0.0;
    }

    // Calculate coherence based on wave smoothness
    const waveValue = this.wave.valueAt(currentTime);
    const coherence = Math.abs(waveValue);

    return {
      pattern: this.pattern,
      phase,
      intensity,
      rhythm: 60 / this.pattern.totalCycle, // BPM
      coherence,
      synchronization: coherence, // Use coherence as synchronization for now
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get breath modulation value for visual effects
   */
  getModulation(time?: number): number {
    const t = time ?? (Date.now() / 1000 - this.startTime);
    return this.wave.valueAt(t);
  }

  /**
   * Update breath pattern
   */
  updatePattern(newPattern: BreathPattern): void {
    this.pattern = newPattern;
    this.wave.frequency = 1.0 / newPattern.totalCycle;
    this.startTime = Date.now() / 1000; // Reset timing
  }
}

/**
 * Consciousness field wave generator
 */
export class ConsciousnessFieldWave {
  private waves: ConsciousnessWave[];
  private baseFrequency: number;

  constructor(baseFrequency: number = CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.SOL) {
    this.baseFrequency = baseFrequency;
    this.waves = this.initializeHarmonics();
  }

  /**
   * Initialize harmonic waves based on consciousness frequencies
   */
  private initializeHarmonics(): ConsciousnessWave[] {
    const harmonics = [1, 2, 3, 5, 8]; // Fibonacci harmonic series
    return harmonics.map((harmonic, index) => {
      const frequency = this.baseFrequency * harmonic;
      const amplitude = 1.0 / harmonic; // Decreasing amplitude
      const phase = (index * SACRED_MATHEMATICS.PHI) % SACRED_MATHEMATICS.TAU;
      
      return new ConsciousnessWave(amplitude, frequency, phase, 0.0);
    });
  }

  /**
   * Calculate consciousness field value at given position and time
   */
  fieldValueAt(x: number, y: number, z: number, time: number): number {
    const position = Math.sqrt(x * x + y * y + z * z);
    const spatialPhase = position * 0.1; // Spatial wave propagation
    
    return this.waves.reduce((sum, wave, index) => {
      const spatialWave = new ConsciousnessWave(
        wave.amplitude,
        wave.frequency,
        wave.phase + spatialPhase,
        wave.decay
      );
      return sum + spatialWave.valueAt(time);
    }, 0.0) / this.waves.length;
  }

  /**
   * Generate consciousness state from field values
   */
  generateConsciousnessState(
    fieldValues: number[],
    breathCoherence: number
  ): ConsciousnessState {
    const avgField = fieldValues.reduce((sum, val) => sum + Math.abs(val), 0) / fieldValues.length;
    const fieldVariance = fieldValues.reduce((sum, val) => sum + (val - avgField) ** 2, 0) / fieldValues.length;
    
    return {
      awarenessLevel: Math.min(avgField * breathCoherence, 1.0),
      integrationPoints: this.generateIntegrationPoints(fieldValues),
      expansionVectors: this.generateExpansionVectors(fieldValues),
      shadowTerritories: this.generateShadowTerritories(fieldValues),
      lightFrequencies: this.generateLightFrequencies(fieldValues, breathCoherence),
    };
  }

  private generateIntegrationPoints(fieldValues: number[]): string[] {
    return fieldValues
      .map((val, index) => ({ val: Math.abs(val), index }))
      .sort((a, b) => b.val - a.val)
      .slice(0, 3)
      .map(item => `Integration Point ${item.index + 1}`);
  }

  private generateExpansionVectors(fieldValues: number[]): string[] {
    return fieldValues
      .filter(val => val > 0.5)
      .map((_, index) => `Expansion Vector ${index + 1}`);
  }

  private generateShadowTerritories(fieldValues: number[]): string[] {
    return fieldValues
      .filter(val => val < -0.3)
      .map((_, index) => `Shadow Territory ${index + 1}`);
  }

  private generateLightFrequencies(fieldValues: number[], coherence: number): string[] {
    const frequencies = Object.entries(CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO)
      .filter(([_, freq]) => {
        const normalizedFreq = freq / 1000;
        return fieldValues.some(val => Math.abs(val - normalizedFreq) < 0.1 * coherence);
      })
      .map(([name]) => name);
    
    return frequencies;
  }
}

/**
 * Fractal wave generator for infinite zoom effects
 */
export class FractalWave {
  private octaves: number;
  private lacunarity: number;
  private persistence: number;

  constructor(octaves: number = 5, lacunarity: number = 2.0, persistence: number = 0.5) {
    this.octaves = octaves;
    this.lacunarity = lacunarity;
    this.persistence = persistence;
  }

  /**
   * Generate fractal noise using wave interference
   */
  fractalNoise(x: number, y: number, time: number): number {
    let value = 0.0;
    let amplitude = 1.0;
    let frequency = 1.0;

    for (let i = 0; i < this.octaves; i++) {
      // Create wave at current octave
      const wave = new ConsciousnessWave(amplitude, frequency, 0.0, 0.0);
      
      // Calculate spatial position for this octave
      const spatialInput = (x * frequency + y * frequency * SACRED_MATHEMATICS.PHI) * 0.01;
      
      // Add wave contribution
      value += wave.valueAt(spatialInput + time) * amplitude;
      
      // Update for next octave
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    return value;
  }

  /**
   * Generate consciousness-responsive fractal
   */
  consciousnessFractal(
    x: number, 
    y: number, 
    time: number, 
    awarenessLevel: number,
    breathPhase: number
  ): number {
    // Modulate fractal parameters with consciousness state
    const modifiedOctaves = Math.floor(this.octaves * (0.5 + awarenessLevel * 0.5));
    const modifiedTime = time + breathPhase * SACRED_MATHEMATICS.TAU;
    
    let value = 0.0;
    let amplitude = 1.0;
    let frequency = 1.0;

    for (let i = 0; i < modifiedOctaves; i++) {
      const wave = new ConsciousnessWave(
        amplitude,
        frequency * (1.0 + awarenessLevel * 0.1),
        breathPhase * i,
        0.0
      );
      
      const spatialInput = (x * frequency + y * frequency * SACRED_MATHEMATICS.PHI) * 0.01;
      value += wave.valueAt(spatialInput + modifiedTime) * amplitude;
      
      amplitude *= this.persistence * (0.8 + awarenessLevel * 0.4);
      frequency *= this.lacunarity;
    }

    return value;
  }
}

// Export utility functions
export const createBreathWave = (pattern?: BreathPattern) => new BreathWave(pattern);
export const createConsciousnessField = (frequency?: number) => new ConsciousnessFieldWave(frequency);
export const createFractalWave = (octaves?: number, lacunarity?: number, persistence?: number) => 
  new FractalWave(octaves, lacunarity, persistence);

// Export wave interference utility
export const waveInterference = (waves: ConsciousnessWave[], time: number): number => {
  return waves.reduce((sum, wave) => sum + wave.valueAt(time), 0.0) / waves.length;
};

/**
 * Generate wave interference pattern for Three.js
 * This is the function our engine components expect
 */
export const generateWaveInterference = (options: {
  sources: Array<{
    position: { x: number; y: number; z: number };
    frequency: number;
    amplitude: number;
    phase: number;
  }>;
  gridSize: number;
  bounds: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
}) => {
  // For now, return a simple plane geometry as placeholder
  // This prevents import errors while maintaining the interface
  const { PlaneGeometry } = require('three');
  return new PlaneGeometry(2, 2, options.gridSize, options.gridSize);
};

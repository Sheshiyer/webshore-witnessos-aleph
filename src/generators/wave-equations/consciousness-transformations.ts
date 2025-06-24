/**
 * Consciousness Wave Transformations for WitnessOS Webshore
 *
 * User data → fractal geometry transformation algorithms
 * Numerology → fractal iteration mapping with wave interference
 * "Everything is a Wave" philosophy implementation
 */

import type { SacredGeometry } from '@/generators/sacred-geometry/platonic-solids';
import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { Vector3 } from 'three';
import {
  BreathWave,
  ConsciousnessFieldWave,
  ConsciousnessWave,
  FractalWave,
} from './consciousness-waves';

const { SACRED_MATHEMATICS, CONSCIOUSNESS_FREQUENCIES } = CONSCIOUSNESS_CONSTANTS;

/**
 * User data interface for wave transformations
 */
export interface UserWaveData {
  birthDate: Date;
  birthTime?: string;
  birthLocation?: { latitude: number; longitude: number };
  name?: string;
  lifePathNumber?: number;
  humanDesignType?: string;
  enneagramType?: number;
}

/**
 * Wave transformation result
 */
export interface WaveTransformation {
  baseFrequency: number;
  harmonics: number[];
  amplitude: number;
  phase: number;
  modulation: number;
  interference: number[];
  resonance: number;
}

/**
 * Consciousness wave transformation engine
 */
export class ConsciousnessWaveTransformer {
  private fieldWave: ConsciousnessFieldWave;
  private fractalWave: FractalWave;
  private breathWave: BreathWave;

  constructor() {
    this.fieldWave = new ConsciousnessFieldWave();
    this.fractalWave = new FractalWave();
    this.breathWave = new BreathWave();
  }

  /**
   * Transform user data into wave characteristics
   */
  transformUserData(userData: UserWaveData): WaveTransformation {
    const lifePathNumber =
      userData.lifePathNumber ?? this.calculateLifePathNumber(userData.birthDate);
    const nameFrequency = userData.name ? this.calculateNameFrequency(userData.name) : 528;
    const birthFrequency = this.calculateBirthFrequency(userData.birthDate);

    // Base frequency from life path number
    const baseFrequency = this.getLifePathFrequency(lifePathNumber);

    // Harmonics based on birth data
    const harmonics = this.generateHarmonics(baseFrequency, userData);

    // Amplitude from consciousness level
    const amplitude = this.calculateAmplitude(userData);

    // Phase from birth time
    const phase = this.calculatePhase(userData.birthDate, userData.birthTime);

    // Modulation from location
    const modulation = this.calculateLocationModulation(userData.birthLocation);

    // Interference patterns
    const interference = this.calculateInterference(baseFrequency, nameFrequency, birthFrequency);

    // Resonance with consciousness frequencies
    const resonance = this.calculateResonance(baseFrequency, harmonics);

    return {
      baseFrequency,
      harmonics,
      amplitude,
      phase,
      modulation,
      interference,
      resonance,
    };
  }

  /**
   * Apply wave transformation to sacred geometry
   */
  applyWaveTransformation(
    geometry: SacredGeometry,
    transformation: WaveTransformation,
    consciousness: ConsciousnessState,
    breath: BreathState,
    time: number = 0
  ): SacredGeometry {
    const breathPhase = this.getBreathPhase(breath);
    const awarenessModulation = consciousness.awarenessLevel * transformation.amplitude;

    // Transform vertices using wave equations
    const transformedVertices = geometry.vertices.map((vertex, index) => {
      const vertexPhase = (index / geometry.vertices.length) * SACRED_MATHEMATICS.TAU;
      const waveDisplacement = this.calculateWaveDisplacement(
        vertex,
        transformation,
        awarenessModulation,
        breathPhase + vertexPhase,
        time
      );

      return vertex.clone().add(waveDisplacement);
    });

    return {
      ...geometry,
      vertices: transformedVertices,
      radius: geometry.radius * (1.0 + awarenessModulation * 0.3),
    };
  }

  /**
   * Generate fractal zoom portal system
   */
  generateFractalPortal(
    centerPosition: Vector3,
    transformation: WaveTransformation,
    consciousness: ConsciousnessState,
    breath: BreathState,
    zoomLevel: number = 1.0
  ): Array<{ position: Vector3; scale: number; rotation: number; intensity: number }> {
    const portals: Array<{
      position: Vector3;
      scale: number;
      rotation: number;
      intensity: number;
    }> = [];
    const portalCount = Math.floor(3 + consciousness.awarenessLevel * 7); // 3-10 portals

    for (let i = 0; i < portalCount; i++) {
      const angle = (i / portalCount) * SACRED_MATHEMATICS.TAU;
      const radius = 2.0 + Math.sin(transformation.phase + angle) * 1.0;

      // Portal position using wave interference
      const waveX = Math.cos(angle) * radius;
      const waveY = Math.sin(angle) * radius;
      const waveZ = Math.sin(angle * SACRED_MATHEMATICS.PHI + transformation.phase) * 0.5;

      const position = centerPosition.clone().add(new Vector3(waveX, waveY, waveZ));

      // Scale based on fractal zoom and consciousness
      const scale = (0.3 + consciousness.awarenessLevel * 0.7) / Math.pow(zoomLevel, 0.5);

      // Rotation from wave harmonics
      const harmonicIndex = i % transformation.harmonics.length;
      const harmonic = transformation.harmonics[harmonicIndex];
      const rotation = (harmonic || 0) * 0.01;

      // Intensity from wave interference
      const interferenceIndex = i % transformation.interference.length;
      const interference = transformation.interference[interferenceIndex];
      const intensity = (interference || 0) * consciousness.awarenessLevel;

      portals.push({ position, scale, rotation, intensity });
    }

    return portals;
  }

  /**
   * Create consciousness field visualization
   */
  generateConsciousnessField(
    dimensions: { width: number; height: number; depth: number },
    transformation: WaveTransformation,
    consciousness: ConsciousnessState,
    breath: BreathState,
    time: number = 0
  ): Float32Array {
    const { width, height, depth } = dimensions;
    const field = new Float32Array(width * height * depth);
    const breathPhase = this.getBreathPhase(breath);

    for (let z = 0; z < depth; z++) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const fx = (x / width - 0.5) * 4.0;
          const fy = (y / height - 0.5) * 4.0;
          const fz = (z / depth - 0.5) * 4.0;

          // Calculate field value using wave interference
          const fieldValue = this.fieldWave.fieldValueAt(fx, fy, fz, time + breathPhase);

          // Apply transformation modulation
          const modulated = fieldValue * transformation.amplitude * consciousness.awarenessLevel;

          // Add fractal noise
          const fractalNoise = this.fractalWave.consciousnessFractal(
            fx,
            fy,
            time,
            consciousness.awarenessLevel,
            breathPhase
          );

          const finalValue = (modulated + fractalNoise * 0.3) * breath.coherence;
          field[z * width * height + y * width + x] = finalValue;
        }
      }
    }

    return field;
  }

  /**
   * Calculate life path number from birth date
   */
  private calculateLifePathNumber(birthDate: Date): number {
    const dateString = birthDate.toISOString().slice(0, 10).replace(/-/g, '');
    let sum = 0;

    for (const digit of dateString) {
      sum += parseInt(digit, 10);
    }

    // Reduce to single digit (except master numbers 11, 22, 33)
    while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
      sum = sum
        .toString()
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }

    return sum;
  }

  /**
   * Calculate name frequency using numerology
   */
  private calculateNameFrequency(name: string): number {
    const letterValues: Record<string, number> = {
      A: 1,
      B: 2,
      C: 3,
      D: 4,
      E: 5,
      F: 6,
      G: 7,
      H: 8,
      I: 9,
      J: 1,
      K: 2,
      L: 3,
      M: 4,
      N: 5,
      O: 6,
      P: 7,
      Q: 8,
      R: 9,
      S: 1,
      T: 2,
      U: 3,
      V: 4,
      W: 5,
      X: 6,
      Y: 7,
      Z: 8,
    };

    let sum = 0;
    for (const char of name.toUpperCase()) {
      sum += letterValues[char] || 0;
    }

    // Convert to frequency (base 528 Hz)
    return 528 + (sum % 12) * 44; // 528-1056 Hz range
  }

  /**
   * Calculate birth frequency from date
   */
  private calculateBirthFrequency(birthDate: Date): number {
    const dayOfYear = Math.floor(
      (birthDate.getTime() - new Date(birthDate.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return 396 + (dayOfYear % 7) * 33; // Solfeggio frequency range
  }

  /**
   * Get frequency for life path number
   */
  private getLifePathFrequency(lifePathNumber: number): number {
    const frequencies: Record<number, number> = {
      1: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.UT, // 396 Hz
      2: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.RE, // 417 Hz
      3: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.MI, // 528 Hz
      4: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.FA, // 639 Hz
      5: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.SOL, // 741 Hz
      6: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.LA, // 852 Hz
      7: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.SI, // 963 Hz
      8: CONSCIOUSNESS_FREQUENCIES.CHAKRA.ROOT, // 194.18 Hz
      9: CONSCIOUSNESS_FREQUENCIES.CHAKRA.CROWN, // 963 Hz
      11: CONSCIOUSNESS_FREQUENCIES.PLANETARY.EARTH, // 194.18 Hz
      22: CONSCIOUSNESS_FREQUENCIES.PLANETARY.MOON, // 210.42 Hz
      33: CONSCIOUSNESS_FREQUENCIES.PLANETARY.EARTH, // 194.18 Hz (fallback)
    };

    return frequencies[lifePathNumber] || CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.MI;
  }

  /**
   * Generate harmonics based on user data
   */
  private generateHarmonics(baseFrequency: number, userData: UserWaveData): number[] {
    const harmonics = [baseFrequency];
    const fibSequence = SACRED_MATHEMATICS.FIBONACCI.slice(0, 8);

    for (let i = 1; i < 6; i++) {
      const fibValue = fibSequence[i];
      const fibBase = fibSequence[0];
      if (fibValue !== undefined && fibBase !== undefined && fibBase !== 0) {
        const harmonic = (baseFrequency * fibValue) / fibBase;
        harmonics.push(harmonic);
      }
    }

    return harmonics;
  }

  /**
   * Calculate amplitude from user data
   */
  private calculateAmplitude(userData: UserWaveData): number {
    let amplitude = 0.5; // Base amplitude

    // Modulate based on available data
    if (userData.birthTime) amplitude += 0.2;
    if (userData.birthLocation) amplitude += 0.2;
    if (userData.name) amplitude += 0.1;

    return Math.min(1.0, amplitude);
  }

  /**
   * Calculate phase from birth data
   */
  private calculatePhase(birthDate: Date, birthTime?: string): number {
    let phase = (birthDate.getMonth() / 12) * SACRED_MATHEMATICS.TAU;

    if (birthTime) {
      const timeParts = birthTime.split(':').map(Number);
      const hours = timeParts[0];
      const minutes = timeParts[1];
      if (hours !== undefined && minutes !== undefined) {
        const timePhase = ((hours * 60 + minutes) / 1440) * SACRED_MATHEMATICS.TAU;
        phase += timePhase;
      }
    }

    return phase % SACRED_MATHEMATICS.TAU;
  }

  /**
   * Calculate location modulation
   */
  private calculateLocationModulation(location?: { latitude: number; longitude: number }): number {
    if (!location) return 1.0;

    const latModulation = Math.sin((location.latitude / 90) * SACRED_MATHEMATICS.PI) * 0.1;
    const lonModulation = Math.cos((location.longitude / 180) * SACRED_MATHEMATICS.PI) * 0.1;

    return 1.0 + latModulation + lonModulation;
  }

  /**
   * Calculate wave interference patterns
   */
  private calculateInterference(baseFreq: number, nameFreq: number, birthFreq: number): number[] {
    const interference = [];

    // Beat frequencies
    interference.push(Math.abs(baseFreq - nameFreq));
    interference.push(Math.abs(baseFreq - birthFreq));
    interference.push(Math.abs(nameFreq - birthFreq));

    // Harmonic interference
    interference.push((baseFreq + nameFreq) / 2);
    interference.push((baseFreq + birthFreq) / 2);

    return interference;
  }

  /**
   * Calculate resonance with consciousness frequencies
   */
  private calculateResonance(baseFrequency: number, harmonics: number[]): number {
    const consciousnessFreqs = Object.values(CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO);
    let maxResonance = 0;

    for (const harmonic of harmonics) {
      for (const consFreq of consciousnessFreqs) {
        const resonance = 1.0 / (1.0 + Math.abs(harmonic - consFreq) / consFreq);
        maxResonance = Math.max(maxResonance, resonance);
      }
    }

    return maxResonance;
  }

  /**
   * Calculate wave displacement for vertex
   */
  private calculateWaveDisplacement(
    vertex: Vector3,
    transformation: WaveTransformation,
    awarenessModulation: number,
    breathPhase: number,
    time: number
  ): Vector3 {
    const position = vertex.length();
    const angle = Math.atan2(vertex.y, vertex.x);

    // Primary wave
    const primaryWave = new ConsciousnessWave(
      transformation.amplitude * awarenessModulation,
      transformation.baseFrequency * 0.001,
      transformation.phase + breathPhase,
      0.0
    );

    const primaryDisplacement = primaryWave.valueAt(time + position * 0.1);

    // Harmonic waves
    let harmonicDisplacement = 0;
    transformation.harmonics.forEach((harmonic, index) => {
      const harmonicWave = new ConsciousnessWave(
        (transformation.amplitude * 0.3) / (index + 1),
        harmonic * 0.001,
        transformation.phase + angle,
        0.0
      );
      harmonicDisplacement += harmonicWave.valueAt(time + position * 0.05);
    });

    const totalDisplacement = (primaryDisplacement + harmonicDisplacement * 0.5) * 0.1;
    const direction = vertex.clone().normalize();

    return direction.multiplyScalar(totalDisplacement);
  }

  /**
   * Get breath phase value
   */
  private getBreathPhase(breath: BreathState): number {
    switch (breath.phase) {
      case 'inhale':
        return breath.intensity * SACRED_MATHEMATICS.PI;
      case 'hold':
        return SACRED_MATHEMATICS.PI;
      case 'exhale':
        return SACRED_MATHEMATICS.PI + (1 - breath.intensity) * SACRED_MATHEMATICS.PI;
      case 'pause':
        return 0;
      default:
        return 0;
    }
  }
}

// Export factory function
export const createConsciousnessWaveTransformer = () => new ConsciousnessWaveTransformer();

// Export utility functions
export const transformUserDataToWaves = (userData: UserWaveData) => {
  const transformer = new ConsciousnessWaveTransformer();
  return transformer.transformUserData(userData);
};

export const applyWaveTransformationToGeometry = (
  geometry: SacredGeometry,
  transformation: WaveTransformation,
  consciousness: ConsciousnessState,
  breath: BreathState,
  time?: number
) => {
  const transformer = new ConsciousnessWaveTransformer();
  return transformer.applyWaveTransformation(geometry, transformation, consciousness, breath, time);
};

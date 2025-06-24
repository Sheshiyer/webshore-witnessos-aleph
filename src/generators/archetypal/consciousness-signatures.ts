/**
 * Archetypal Consciousness Signatures for WitnessOS Webshore
 *
 * Fractal signatures for Human Design types, Enneagram centers, and other archetypal patterns
 * Each archetype gets unique fractal characteristics and wave interference patterns
 */

import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { Vector3 } from 'three';
import {
  SacredGeometry,
  createCube,
  createDodecahedron,
  createIcosahedron,
  createOctahedron,
  createTetrahedron,
} from '../sacred-geometry/platonic-solids';

const { SACRED_MATHEMATICS, CONSCIOUSNESS_FREQUENCIES } = CONSCIOUSNESS_CONSTANTS;

/**
 * Human Design Type Signatures
 */
export interface HumanDesignSignature {
  type: 'manifestor' | 'generator' | 'manifesting-generator' | 'projector' | 'reflector';
  baseGeometry: SacredGeometry;
  fractalPattern: 'mandelbrot' | 'julia' | 'dragon' | 'sierpinski';
  waveFrequency: number;
  colorSignature: [number, number, number]; // RGB
  breathModulation: number;
  awarenessAmplification: number;
}

/**
 * Enneagram Center Signatures
 */
export interface EnneagramSignature {
  center: 'body' | 'heart' | 'head';
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  baseGeometry: SacredGeometry;
  fractalDepth: number;
  resonanceFrequency: number;
  integrationVector: Vector3;
  disintegrationVector: Vector3;
  colorHarmony: [number, number, number];
}

/**
 * Human Design archetypal fractal signatures
 */
export class HumanDesignFractals {
  /**
   * Generate fractal signature for Human Design type
   */
  static getTypeSignature(type: string, consciousness: ConsciousnessState): HumanDesignSignature {
    switch (type.toLowerCase()) {
      case 'manifestor':
        return {
          type: 'manifestor',
          baseGeometry: createTetrahedron(1.0, consciousness), // Fire element - initiation
          fractalPattern: 'mandelbrot',
          waveFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.UT, // 396 Hz - liberation
          colorSignature: [1.0, 0.3, 0.2], // Red-orange - action
          breathModulation: 1.2,
          awarenessAmplification: 1.5,
        };

      case 'generator':
        return {
          type: 'generator',
          baseGeometry: createCube(1.0, consciousness), // Earth element - stability
          fractalPattern: 'julia',
          waveFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.RE, // 417 Hz - change
          colorSignature: [0.8, 0.6, 0.2], // Golden - life force
          breathModulation: 1.0,
          awarenessAmplification: 1.0,
        };

      case 'manifesting-generator':
        return {
          type: 'manifesting-generator',
          baseGeometry: createOctahedron(1.0, consciousness), // Air element - movement
          fractalPattern: 'dragon',
          waveFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.MI, // 528 Hz - transformation
          colorSignature: [0.9, 0.4, 0.6], // Pink-red - dynamic energy
          breathModulation: 1.3,
          awarenessAmplification: 1.2,
        };

      case 'projector':
        return {
          type: 'projector',
          baseGeometry: createDodecahedron(1.0, consciousness), // Ether element - guidance
          fractalPattern: 'sierpinski',
          waveFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.FA, // 639 Hz - connection
          colorSignature: [0.4, 0.7, 0.9], // Blue - wisdom
          breathModulation: 0.8,
          awarenessAmplification: 1.8,
        };

      case 'reflector':
        return {
          type: 'reflector',
          baseGeometry: createIcosahedron(1.0, consciousness), // Water element - reflection
          fractalPattern: 'julia',
          waveFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.SOL, // 741 Hz - intuition
          colorSignature: [0.6, 0.9, 0.7], // Green-blue - mirror
          breathModulation: 0.6,
          awarenessAmplification: 2.0,
        };

      default:
        return this.getTypeSignature('generator', consciousness);
    }
  }

  /**
   * Generate consciousness-modulated fractal geometry for HD type
   */
  static generateTypeFractal(
    signature: HumanDesignSignature,
    consciousness: ConsciousnessState,
    breath: BreathState,
    time: number = 0
  ): SacredGeometry {
    const breathPhase = this.getBreathPhase(breath);
    const timeModulation = Math.sin(time * signature.waveFrequency * 0.001) * 0.1;
    const awarenessModulation = consciousness.awarenessLevel * signature.awarenessAmplification;

    // Apply fractal transformation to base geometry
    const modifiedVertices = signature.baseGeometry.vertices.map((vertex, index) => {
      const vertexPhase = (index / signature.baseGeometry.vertices.length) * SACRED_MATHEMATICS.TAU;
      const fractalDisplacement = this.calculateFractalDisplacement(
        vertex,
        signature.fractalPattern,
        awarenessModulation,
        breathPhase + vertexPhase,
        timeModulation
      );

      return vertex.clone().add(fractalDisplacement);
    });

    return {
      ...signature.baseGeometry,
      vertices: modifiedVertices,
      radius: signature.baseGeometry.radius * (1.0 + awarenessModulation * 0.2),
    };
  }

  /**
   * Calculate fractal displacement for vertex
   */
  private static calculateFractalDisplacement(
    vertex: Vector3,
    pattern: string,
    awareness: number,
    breathPhase: number,
    timeModulation: number
  ): Vector3 {
    const scale = 0.1 * awareness;
    const x = vertex.x + timeModulation;
    const y = vertex.y + Math.sin(breathPhase) * 0.05;
    const z = vertex.z + Math.cos(breathPhase) * 0.05;

    switch (pattern) {
      case 'mandelbrot':
        return this.mandelbrotDisplacement(x, y, z, scale);
      case 'julia':
        return this.juliaDisplacement(x, y, z, scale);
      case 'dragon':
        return this.dragonDisplacement(x, y, z, scale, breathPhase);
      case 'sierpinski':
        return this.sierpinskiDisplacement(x, y, z, scale);
      default:
        return new Vector3(0, 0, 0);
    }
  }

  private static mandelbrotDisplacement(x: number, y: number, z: number, scale: number): Vector3 {
    let zx = x,
      zy = y;
    let iterations = 0;
    const maxIter = 8;

    while (iterations < maxIter && zx * zx + zy * zy < 4) {
      const temp = zx * zx - zy * zy + x;
      zy = 2 * zx * zy + y;
      zx = temp;
      iterations++;
    }

    const displacement = (iterations / maxIter) * scale;
    return new Vector3(
      displacement * Math.cos(z),
      displacement * Math.sin(z),
      displacement * Math.sin(x + y)
    );
  }

  private static juliaDisplacement(x: number, y: number, z: number, scale: number): Vector3 {
    const c = { x: -0.7269, y: 0.1889 };
    let zx = x,
      zy = y;
    let iterations = 0;
    const maxIter = 8;

    while (iterations < maxIter && zx * zx + zy * zy < 4) {
      const temp = zx * zx - zy * zy + c.x;
      zy = 2 * zx * zy + c.y;
      zx = temp;
      iterations++;
    }

    const displacement = (iterations / maxIter) * scale;
    return new Vector3(
      displacement * Math.sin(z * SACRED_MATHEMATICS.PHI),
      displacement * Math.cos(z * SACRED_MATHEMATICS.PHI),
      displacement * Math.sin((x + y) * SACRED_MATHEMATICS.PHI_INVERSE)
    );
  }

  private static dragonDisplacement(
    x: number,
    y: number,
    z: number,
    scale: number,
    phase: number
  ): Vector3 {
    const dragonAngle = Math.atan2(y, x) + phase;
    const radius = Math.sqrt(x * x + y * y);
    const displacement = scale * Math.sin(dragonAngle * 4 + z);

    return new Vector3(
      displacement * Math.cos(dragonAngle + phase),
      displacement * Math.sin(dragonAngle + phase),
      displacement * Math.sin(radius + phase)
    );
  }

  private static sierpinskiDisplacement(x: number, y: number, z: number, scale: number): Vector3 {
    // Sierpinski-inspired displacement using recursive subdivision
    const level = 3;
    let displacement = 0;
    let currentScale = scale;

    for (let i = 0; i < level; i++) {
      const triangleX = Math.floor(x * Math.pow(2, i)) % 2;
      const triangleY = Math.floor(y * Math.pow(2, i)) % 2;
      const triangleZ = Math.floor(z * Math.pow(2, i)) % 2;

      if ((triangleX + triangleY + triangleZ) % 2 === 1) {
        displacement += currentScale;
      }
      currentScale *= 0.5;
    }

    return new Vector3(
      displacement * Math.cos(x + y),
      displacement * Math.sin(y + z),
      displacement * Math.sin(z + x)
    );
  }

  private static getBreathPhase(breath: BreathState): number {
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

/**
 * Enneagram archetypal fractal signatures
 */
export class EnneagramFractals {
  /**
   * Generate fractal signature for Enneagram type
   */
  static getTypeSignature(type: number, consciousness: ConsciousnessState): EnneagramSignature {
    const baseSignatures: Record<number, Partial<EnneagramSignature>> = {
      1: {
        // The Perfectionist
        center: 'body',
        baseGeometry: createCube(1.0, consciousness),
        fractalDepth: 4,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.UT,
        colorHarmony: [0.8, 0.2, 0.2], // Red - anger/perfection
      },
      2: {
        // The Helper
        center: 'heart',
        baseGeometry: createOctahedron(1.0, consciousness),
        fractalDepth: 3,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.RE,
        colorHarmony: [0.9, 0.6, 0.3], // Orange - pride/love
      },
      3: {
        // The Achiever
        center: 'heart',
        baseGeometry: createTetrahedron(1.0, consciousness),
        fractalDepth: 5,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.MI,
        colorHarmony: [0.9, 0.9, 0.2], // Yellow - deceit/hope
      },
      4: {
        // The Individualist
        center: 'heart',
        baseGeometry: createIcosahedron(1.0, consciousness),
        fractalDepth: 6,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.FA,
        colorHarmony: [0.6, 0.3, 0.9], // Purple - envy/originality
      },
      5: {
        // The Investigator
        center: 'head',
        baseGeometry: createDodecahedron(1.0, consciousness),
        fractalDepth: 7,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.SOL,
        colorHarmony: [0.2, 0.6, 0.8], // Blue - avarice/understanding
      },
      6: {
        // The Loyalist
        center: 'head',
        baseGeometry: createOctahedron(1.0, consciousness),
        fractalDepth: 3,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.LA,
        colorHarmony: [0.4, 0.8, 0.4], // Green - fear/faith
      },
      7: {
        // The Enthusiast
        center: 'head',
        baseGeometry: createTetrahedron(1.0, consciousness),
        fractalDepth: 8,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.SI,
        colorHarmony: [0.9, 0.9, 0.9], // White - gluttony/sobriety
      },
      8: {
        // The Challenger
        center: 'body',
        baseGeometry: createCube(1.0, consciousness),
        fractalDepth: 4,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.CHAKRA.ROOT,
        colorHarmony: [0.1, 0.1, 0.1], // Black - lust/innocence
      },
      9: {
        // The Peacemaker
        center: 'body',
        baseGeometry: createIcosahedron(1.0, consciousness),
        fractalDepth: 2,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.CHAKRA.CROWN,
        colorHarmony: [0.7, 0.9, 0.7], // Light green - sloth/action
      },
    };

    const base = baseSignatures[type] || baseSignatures[9];

    if (!base) {
      throw new Error(`Base signature not found for type ${type}`);
    }

    return {
      center: base.center || 'body',
      number: type as any,
      baseGeometry:
        base.baseGeometry ||
        ({
          vertices: [],
          faces: [],
          edges: [],
          center: new Vector3(),
          radius: 1,
        } as SacredGeometry),
      fractalDepth: base.fractalDepth || 3,
      resonanceFrequency: base.resonanceFrequency || 528,
      integrationVector: this.getIntegrationVector(type),
      disintegrationVector: this.getDisintegrationVector(type),
      colorHarmony: base.colorHarmony || [0.5, 0.5, 0.5],
    };
  }

  private static getIntegrationVector(type: number): Vector3 {
    const integrationMap: Record<number, Vector3> = {
      1: new Vector3(0.7, 0.7, 0), // 1 → 7
      2: new Vector3(0.4, 0.4, 0.8), // 2 → 4
      3: new Vector3(0.6, 0.6, 0.6), // 3 → 6
      4: new Vector3(0.1, 0.9, 0.1), // 4 → 1
      5: new Vector3(0.8, 0.8, 0.2), // 5 → 8
      6: new Vector3(0.9, 0.9, 0.9), // 6 → 9
      7: new Vector3(0.5, 0.5, 1.0), // 7 → 5
      8: new Vector3(0.2, 0.8, 0.2), // 8 → 2
      9: new Vector3(0.3, 0.9, 0.3), // 9 → 3
    };

    return integrationMap[type] || new Vector3(0.5, 0.5, 0.5);
  }

  private static getDisintegrationVector(type: number): Vector3 {
    const disintegrationMap: Record<number, Vector3> = {
      1: new Vector3(0.4, 0.4, 0.4), // 1 → 4
      2: new Vector3(0.8, 0.2, 0.2), // 2 → 8
      3: new Vector3(0.9, 0.9, 0.9), // 3 → 9
      4: new Vector3(0.2, 0.8, 0.8), // 4 → 2
      5: new Vector3(0.7, 0.7, 0.1), // 5 → 7
      6: new Vector3(0.3, 0.9, 0.3), // 6 → 3
      7: new Vector3(0.1, 0.9, 0.1), // 7 → 1
      8: new Vector3(0.5, 0.5, 1.0), // 8 → 5
      9: new Vector3(0.6, 0.6, 0.6), // 9 → 6
    };

    return disintegrationMap[type] || new Vector3(0.5, 0.5, 0.5);
  }
}

// Export factory functions
export const createHumanDesignFractal = (
  type: string,
  consciousness: ConsciousnessState,
  breath: BreathState,
  time?: number
) => {
  const signature = HumanDesignFractals.getTypeSignature(type, consciousness);
  return HumanDesignFractals.generateTypeFractal(signature, consciousness, breath, time);
};

export const createEnneagramFractal = (type: number, consciousness: ConsciousnessState) => {
  return EnneagramFractals.getTypeSignature(type, consciousness);
};

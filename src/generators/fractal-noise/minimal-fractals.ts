/**
 * Minimal Fractal Generators for WitnessOS Webshore
 *
 * Inspired by Yohei Nishitsuji's 267-character shader challenge
 * "The more realistic the outcome, the harder it becomes to distinguish from reality"
 */

import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';

const { SACRED_MATHEMATICS, FRACTAL_PARAMETERS } = CONSCIOUSNESS_CONSTANTS;

/**
 * Minimal noise function inspired by Nishitsuji's custom noise
 * Equivalent to his: abs(dot(sin(p.yzx*s),cos(p.xzz*s))/s*.6)
 */
export const minimalNoise = (x: number, y: number, z: number, scale: number = 1.0): number => {
  const sx = scale * x;
  const sy = scale * y;
  const sz = scale * z;

  // Nishitsuji's pattern: sin(p.yzx*s) dot cos(p.xzz*s)
  const sinVec = [Math.sin(sy), Math.sin(sz), Math.sin(sx)];
  const cosVec = [Math.cos(sx), Math.cos(sz), Math.cos(sz)];

  const dot =
    (sinVec[0] ?? 0) * (cosVec[0] ?? 0) +
    (sinVec[1] ?? 0) * (cosVec[1] ?? 0) +
    (sinVec[2] ?? 0) * (cosVec[2] ?? 0);
  return Math.abs((dot / scale) * 0.6);
};

/**
 * Consciousness-responsive noise with awareness modulation
 */
export const consciousnessNoise = (
  x: number,
  y: number,
  z: number,
  awarenessLevel: number,
  time: number = 0
): number => {
  let noise = 0.0;
  let scale = 1.0;
  const modifiedTime = time + awarenessLevel * SACRED_MATHEMATICS.TAU;

  // Fractal octaves based on awareness level
  const octaves = Math.floor(3 + awarenessLevel * 5);

  for (let i = 0; i < octaves; i++) {
    const timeOffset = modifiedTime * 0.1;
    noise +=
      minimalNoise(
        x + timeOffset,
        y + timeOffset * SACRED_MATHEMATICS.PHI,
        z + timeOffset * SACRED_MATHEMATICS.PHI_INVERSE,
        scale
      ) / scale;
    scale *= 2.0;
  }

  return noise * awarenessLevel;
};

/**
 * Mandelbrot-inspired fractal for portal effects
 * Based on Nishitsuji's "Emptiness, your infinity"
 */
export class MandalaMandelbrot {
  private maxIterations: number;
  private escapeRadius: number;

  constructor(maxIterations: number = 64, escapeRadius: number = 2.0) {
    this.maxIterations = maxIterations;
    this.escapeRadius = escapeRadius;
  }

  /**
   * Calculate Mandelbrot iterations with consciousness modulation
   */
  calculate(
    x: number,
    y: number,
    consciousnessLevel: number = 0.5,
    breathPhase: number = 0.0
  ): number {
    // Consciousness-modulated parameters
    const cx = x + Math.cos(breathPhase) * 0.01 * consciousnessLevel;
    const cy = y + Math.sin(breathPhase) * 0.01 * consciousnessLevel;

    let zx = 0.0;
    let zy = 0.0;
    let iterations = 0;

    while (
      iterations < this.maxIterations &&
      zx * zx + zy * zy < this.escapeRadius * this.escapeRadius
    ) {
      const temp = zx * zx - zy * zy + cx;
      zy = 2.0 * zx * zy + cy;
      zx = temp;
      iterations++;
    }

    // Smooth coloring with consciousness influence
    if (iterations < this.maxIterations) {
      const smoothed = iterations + 1 - Math.log2(Math.log2(zx * zx + zy * zy));
      return (smoothed / this.maxIterations) * consciousnessLevel;
    }

    return consciousnessLevel;
  }

  /**
   * Generate portal fractal field
   */
  generatePortalField(
    width: number,
    height: number,
    zoom: number = 1.0,
    centerX: number = -0.7269,
    centerY: number = 0.1889,
    consciousness: ConsciousnessState,
    breath: BreathState
  ): Float32Array {
    const field = new Float32Array(width * height);
    const breathPhase =
      breath.phase === 'inhale'
        ? breath.intensity * SACRED_MATHEMATICS.PI
        : breath.phase === 'exhale'
          ? (1 - breath.intensity) * SACRED_MATHEMATICS.PI
          : 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const fx = ((x / width - 0.5) * 4.0) / zoom + centerX;
        const fy = ((y / height - 0.5) * 4.0) / zoom + centerY;

        const value = this.calculate(fx, fy, consciousness.awarenessLevel, breathPhase);
        field[y * width + x] = value;
      }
    }

    return field;
  }
}

/**
 * Sacred geometry fractal generator
 */
export class SacredFractal {
  /**
   * Generate golden spiral points
   */
  static goldenSpiral(
    points: number,
    scale: number = 1.0,
    consciousness: number = 0.5
  ): Array<[number, number]> {
    const result: Array<[number, number]> = [];
    const goldenAngle = SACRED_MATHEMATICS.TAU / (SACRED_MATHEMATICS.PHI * SACRED_MATHEMATICS.PHI);

    for (let i = 0; i < points; i++) {
      const angle = i * goldenAngle * (1.0 + consciousness * 0.1);
      const radius = Math.sqrt(i) * scale * (0.5 + consciousness * 0.5);

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      result.push([x, y]);
    }

    return result;
  }

  /**
   * Generate Fibonacci tree structure
   */
  static fibonacciTree(
    depth: number,
    consciousness: number = 0.5,
    breathPhase: number = 0.0
  ): Array<{ x: number; y: number; level: number; angle: number }> {
    const nodes: Array<{ x: number; y: number; level: number; angle: number }> = [];
    const fibSequence = SACRED_MATHEMATICS.FIBONACCI.slice(0, depth);

    const generateBranch = (x: number, y: number, angle: number, level: number, length: number) => {
      if (level >= depth) return;

      nodes.push({ x, y, level, angle });

      const fibRatio =
        (fibSequence[level] ?? 1) / (fibSequence[Math.min(level + 1, fibSequence.length - 1)] ?? 1);
      const branchAngle =
        angle + (SACRED_MATHEMATICS.PHI - 1) * SACRED_MATHEMATICS.PI * consciousness;
      const modifiedLength = length * fibRatio * (0.8 + consciousness * 0.4);

      // Breath modulation
      const breathOffset = Math.sin(breathPhase + level * 0.5) * 0.1 * consciousness;

      const newX = x + Math.cos(branchAngle + breathOffset) * modifiedLength;
      const newY = y + Math.sin(branchAngle + breathOffset) * modifiedLength;

      generateBranch(
        newX,
        newY,
        branchAngle + SACRED_MATHEMATICS.PENTAGRAM_ANGLE,
        level + 1,
        modifiedLength
      );
      generateBranch(
        newX,
        newY,
        branchAngle - SACRED_MATHEMATICS.PENTAGRAM_ANGLE,
        level + 1,
        modifiedLength
      );
    };

    generateBranch(0, 0, SACRED_MATHEMATICS.PI / 2, 0, 1.0);
    return nodes;
  }

  /**
   * Generate consciousness mandala pattern
   */
  static consciousnessMandala(
    radius: number,
    layers: number,
    consciousness: ConsciousnessState,
    breath: BreathState
  ): Array<{ x: number; y: number; intensity: number; layer: number }> {
    const points: Array<{ x: number; y: number; intensity: number; layer: number }> = [];
    const breathModulation = breath.coherence * Math.sin(breath.intensity * SACRED_MATHEMATICS.TAU);

    for (let layer = 0; layer < layers; layer++) {
      const layerRadius = (radius * (layer + 1)) / layers;
      const pointsInLayer = Math.floor(8 * (layer + 1) * (1 + consciousness.awarenessLevel));

      for (let i = 0; i < pointsInLayer; i++) {
        const angle = (i / pointsInLayer) * SACRED_MATHEMATICS.TAU;
        const modifiedAngle = angle + breathModulation * 0.1;
        const modifiedRadius = layerRadius * (0.9 + consciousness.awarenessLevel * 0.2);

        const x = Math.cos(modifiedAngle) * modifiedRadius;
        const y = Math.sin(modifiedAngle) * modifiedRadius;

        // Intensity based on consciousness integration
        const intensity =
          consciousness.awarenessLevel * (1.0 - layer / layers) * (0.8 + breath.coherence * 0.4);

        points.push({ x, y, intensity, layer });
      }
    }

    return points;
  }
}

/**
 * Minimal shader-style functions for 267-character optimization
 */
export class MinimalShaderFunctions {
  /**
   * HSV to RGB conversion (minimal implementation)
   */
  static hsv(h: number, s: number, v: number): [number, number, number] {
    const c = v * s;
    const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
    const m = v - c;

    let r = 0,
      g = 0,
      b = 0;

    if (h < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 2 / 6) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 3 / 6) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 4 / 6) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 5 / 6) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    return [r + m, g + m, b + m];
  }

  /**
   * Smooth step function
   */
  static smoothstep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }

  /**
   * Mix/lerp function
   */
  static mix(a: number, b: number, t: number): number {
    return a * (1 - t) + b * t;
  }

  /**
   * Fractal Brownian Motion (minimal)
   */
  static fbm(x: number, y: number, octaves: number = 4): number {
    let value = 0.0;
    let amplitude = 0.5;
    let frequency = 1.0;

    for (let i = 0; i < octaves; i++) {
      value += minimalNoise(x * frequency, y * frequency, 0, 1.0) * amplitude;
      amplitude *= 0.5;
      frequency *= 2.0;
    }

    return value;
  }
}

// Export factory functions
export const createMandalaMandelbrot = (iterations?: number, escape?: number) =>
  new MandalaMandelbrot(iterations, escape);

/**
 * Create fractal geometry for Three.js
 * This is the function our engine components expect
 */
export const createFractalGeometry = (options: {
  type: string;
  iterations: number;
  scale: number;
  complexity: number;
  seed: number;
}) => {
  // For now, return a simple sphere geometry as placeholder
  // This prevents import errors while maintaining the interface
  const { BufferGeometry, SphereGeometry } = require('three');
  return new SphereGeometry(options.scale * 0.5, 8, 8);
};

export const generateConsciousnessField = (
  width: number,
  height: number,
  consciousness: ConsciousnessState,
  breath: BreathState,
  time: number = 0
): Float32Array => {
  const field = new Float32Array(width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const fx = (x / width - 0.5) * 2.0;
      const fy = (y / height - 0.5) * 2.0;

      const noise = consciousnessNoise(fx, fy, time, consciousness.awarenessLevel, time);
      const breathMod = Math.sin(breath.intensity * SACRED_MATHEMATICS.TAU) * breath.coherence;

      field[y * width + x] = noise * (0.8 + breathMod * 0.4);
    }
  }

  return field;
};

/**
 * Archetypal Fractal Shader Manager for WitnessOS Webshore
 *
 * TypeScript wrapper for GLSL archetypal fractal shaders
 * Manages Human Design and Enneagram fractal signatures
 */

import type {
  EnneagramSignature,
  HumanDesignSignature,
} from '@/generators/archetypal/consciousness-signatures';
import type { BreathState, ConsciousnessState } from '@/types';
import { ShaderMaterial, Uniform } from 'three';
// Define shader inline to avoid .glsl import issues
const archetypalFractalShader = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform float consciousness;
    uniform float breathPhase;
    uniform float coherence;
    uniform vec2 resolution;
    uniform vec3 archetypalColor;
    uniform int fractalType;
    uniform int humanDesignType;
    uniform int enneagramType;
    uniform float awarenessAmplification;
    uniform float waveFrequency;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vec2 uv = (vUv - 0.5) * 2.0;
      float intensity = consciousness * 0.5 + 0.5;
      vec3 color = archetypalColor * intensity;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

export interface ArchetypalFractalUniforms {
  time: { value: number };
  consciousness: { value: number };
  breathPhase: { value: number };
  coherence: { value: number };
  resolution: { value: [number, number] };
  archetypalColor: { value: [number, number, number] };
  fractalType: { value: number };
  humanDesignType: { value: number };
  enneagramType: { value: number };
  awarenessAmplification: { value: number };
  waveFrequency: { value: number };
}

/**
 * Fractal type enumeration
 */
export enum FractalType {
  MANDELBROT = 0,
  JULIA = 1,
  DRAGON = 2,
  SIERPINSKI = 3,
}

/**
 * Human Design type enumeration
 */
export enum HumanDesignType {
  MANIFESTOR = 0,
  GENERATOR = 1,
  MANIFESTING_GENERATOR = 2,
  PROJECTOR = 3,
  REFLECTOR = 4,
}

/**
 * Archetypal fractal shader material manager
 */
export class ArchetypalFractalMaterial {
  private material: ShaderMaterial;
  private uniforms: ArchetypalFractalUniforms;
  private startTime: number;

  constructor(
    fractalType: FractalType = FractalType.MANDELBROT,
    humanDesignType: HumanDesignType = HumanDesignType.GENERATOR,
    enneagramType: number = 9
  ) {
    this.startTime = Date.now();

    // Create deep copy of default uniforms
    this.uniforms = this.createUniforms();

    // Set initial values
    this.uniforms.fractalType.value = fractalType;
    this.uniforms.humanDesignType.value = humanDesignType;
    this.uniforms.enneagramType.value = Math.max(1, Math.min(9, enneagramType));

    // Create shader material
    this.material = new ShaderMaterial({
      vertexShader: archetypalFractalShader.vertexShader,
      fragmentShader: archetypalFractalShader.fragmentShader,
      uniforms: this.uniforms as { [uniform: string]: any },
      transparent: true,
      side: 2, // DoubleSide
    });
  }

  /**
   * Create uniforms with proper Three.js Uniform objects
   */
  private createUniforms(): ArchetypalFractalUniforms {
    return {
      time: new Uniform(0.0),
      consciousness: new Uniform(0.5),
      breathPhase: new Uniform(0.0),
      coherence: new Uniform(0.5),
      resolution: new Uniform([1920, 1080]),
      archetypalColor: new Uniform([0.6, 0.3, 0.9]),
      fractalType: new Uniform(0),
      humanDesignType: new Uniform(1),
      enneagramType: new Uniform(9),
      awarenessAmplification: new Uniform(1.0),
      waveFrequency: new Uniform(528.0),
    } as ArchetypalFractalUniforms;
  }

  /**
   * Update shader with consciousness state
   */
  updateConsciousness(consciousness: ConsciousnessState): void {
    this.uniforms.consciousness.value = consciousness.awarenessLevel;

    // Update archetypal color based on consciousness
    const baseColor = this.getArchetypalColor(consciousness);
    this.uniforms.archetypalColor.value = baseColor;
  }

  /**
   * Update shader with breath state
   */
  updateBreath(breath: BreathState): void {
    this.uniforms.breathPhase.value = this.getBreathPhase(breath);
    this.uniforms.coherence.value = breath.coherence;
  }

  /**
   * Update shader with Human Design signature
   */
  updateHumanDesignSignature(signature: HumanDesignSignature): void {
    const typeMap: Record<string, HumanDesignType> = {
      manifestor: HumanDesignType.MANIFESTOR,
      generator: HumanDesignType.GENERATOR,
      'manifesting-generator': HumanDesignType.MANIFESTING_GENERATOR,
      projector: HumanDesignType.PROJECTOR,
      reflector: HumanDesignType.REFLECTOR,
    };

    this.uniforms.humanDesignType.value = typeMap[signature.type] ?? HumanDesignType.GENERATOR;
    this.uniforms.awarenessAmplification.value = signature.awarenessAmplification;
    this.uniforms.waveFrequency.value = signature.waveFrequency;
    this.uniforms.archetypalColor.value = signature.colorSignature;

    // Set fractal type based on signature
    const fractalMap: Record<string, FractalType> = {
      mandelbrot: FractalType.MANDELBROT,
      julia: FractalType.JULIA,
      dragon: FractalType.DRAGON,
      sierpinski: FractalType.SIERPINSKI,
    };

    this.uniforms.fractalType.value =
      fractalMap[signature.fractalPattern] ?? FractalType.MANDELBROT;
  }

  /**
   * Update shader with Enneagram signature
   */
  updateEnneagramSignature(signature: EnneagramSignature): void {
    this.uniforms.enneagramType.value = signature.number;
    this.uniforms.waveFrequency.value = signature.resonanceFrequency;

    // Mix archetypal color with Enneagram harmony
    const currentColor = this.uniforms.archetypalColor.value;
    const mixedColor: [number, number, number] = [
      currentColor[0] * 0.7 + signature.colorHarmony[0] * 0.3,
      currentColor[1] * 0.7 + signature.colorHarmony[1] * 0.3,
      currentColor[2] * 0.7 + signature.colorHarmony[2] * 0.3,
    ];
    this.uniforms.archetypalColor.value = mixedColor;
  }

  /**
   * Update time-based animations
   */
  updateTime(): void {
    const currentTime = (Date.now() - this.startTime) / 1000;
    this.uniforms.time.value = currentTime;
  }

  /**
   * Set resolution for responsive rendering
   */
  setResolution(width: number, height: number): void {
    this.uniforms.resolution.value = [width, height];
  }

  /**
   * Set fractal type
   */
  setFractalType(type: FractalType): void {
    this.uniforms.fractalType.value = type;
  }

  /**
   * Set Human Design type
   */
  setHumanDesignType(type: HumanDesignType): void {
    this.uniforms.humanDesignType.value = type;
  }

  /**
   * Set Enneagram type
   */
  setEnneagramType(type: number): void {
    this.uniforms.enneagramType.value = Math.max(1, Math.min(9, type));
  }

  /**
   * Get the Three.js material
   */
  getMaterial(): ShaderMaterial {
    return this.material;
  }

  /**
   * Get archetypal color based on consciousness state
   */
  private getArchetypalColor(consciousness: ConsciousnessState): [number, number, number] {
    const awareness = consciousness.awarenessLevel;

    // Base color shifts with awareness level
    const hue = 0.6 + awareness * 0.3; // Purple to blue-green
    const saturation = 0.7 + awareness * 0.3;
    const value = 0.5 + awareness * 0.5;

    // Convert HSV to RGB
    const c = value * saturation;
    const x = c * (1 - Math.abs(((hue * 6) % 2) - 1));
    const m = value - c;

    let r = 0,
      g = 0,
      b = 0;

    if (hue < 1 / 6) {
      r = c;
      g = x;
      b = 0;
    } else if (hue < 2 / 6) {
      r = x;
      g = c;
      b = 0;
    } else if (hue < 3 / 6) {
      r = 0;
      g = c;
      b = x;
    } else if (hue < 4 / 6) {
      r = 0;
      g = x;
      b = c;
    } else if (hue < 5 / 6) {
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
   * Convert breath state to phase value
   */
  private getBreathPhase(breath: BreathState): number {
    const PI = Math.PI;

    switch (breath.phase) {
      case 'inhale':
        return breath.intensity * PI;
      case 'hold':
        return PI;
      case 'exhale':
        return PI + (1 - breath.intensity) * PI;
      case 'pause':
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.material.dispose();
  }
}

/**
 * Factory function for creating archetypal fractal materials
 */
export const createArchetypalFractalMaterial = (
  fractalType?: FractalType,
  humanDesignType?: HumanDesignType,
  enneagramType?: number
): ArchetypalFractalMaterial => {
  return new ArchetypalFractalMaterial(fractalType, humanDesignType, enneagramType);
};

/**
 * Utility function to get fractal type from string
 */
export const getFractalTypeFromString = (type: string): FractalType => {
  const typeMap: Record<string, FractalType> = {
    mandelbrot: FractalType.MANDELBROT,
    julia: FractalType.JULIA,
    dragon: FractalType.DRAGON,
    sierpinski: FractalType.SIERPINSKI,
  };

  return typeMap[type.toLowerCase()] ?? FractalType.MANDELBROT;
};

/**
 * Utility function to get Human Design type from string
 */
export const getHumanDesignTypeFromString = (type: string): HumanDesignType => {
  const typeMap: Record<string, HumanDesignType> = {
    manifestor: HumanDesignType.MANIFESTOR,
    generator: HumanDesignType.GENERATOR,
    'manifesting-generator': HumanDesignType.MANIFESTING_GENERATOR,
    projector: HumanDesignType.PROJECTOR,
    reflector: HumanDesignType.REFLECTOR,
  };

  return typeMap[type.toLowerCase()] ?? HumanDesignType.GENERATOR;
};

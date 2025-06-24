/**
 * Performance Optimization System for WitnessOS Webshore
 *
 * Level of Detail (LOD) system using fractal mathematics
 * Mobile WebGL optimization with 267-character GLSL techniques
 */

import type { SacredGeometry } from '@/generators/sacred-geometry/platonic-solids';
import type { ConsciousnessState } from '@/types';
import { Camera, Object3D, Vector3 } from 'three';

/**
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  geometryMemory: number;
  textureMemory: number;
  isLowPerformance: boolean;
}

/**
 * LOD level configuration
 */
export interface LODLevel {
  distance: number;
  fractalDepth: number;
  subdivisionLevels: number;
  shaderComplexity: 'minimal' | 'standard' | 'enhanced';
  particleCount: number;
  updateFrequency: number; // Hz
}

/**
 * Device capability detection
 */
export interface DeviceCapabilities {
  isMobile: boolean;
  isLowEnd: boolean;
  maxTextureSize: number;
  maxVertexUniforms: number;
  maxFragmentUniforms: number;
  supportsFloatTextures: boolean;
  supportsInstancedArrays: boolean;
  webglVersion: 1 | 2;
}

/**
 * Performance optimization manager
 */
export class PerformanceOptimizer {
  private metrics: PerformanceMetrics;
  private capabilities: DeviceCapabilities;
  private lodLevels: LODLevel[];
  private frameTimeHistory: number[] = [];
  private lastFrameTime: number = 0;
  private adaptiveQuality: number = 1.0;

  constructor() {
    this.capabilities = this.detectDeviceCapabilities();
    this.lodLevels = this.createLODLevels();
    this.metrics = this.initializeMetrics();
  }

  /**
   * Detect device capabilities for optimization
   */
  private detectDeviceCapabilities(): DeviceCapabilities {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

    if (!gl) {
      throw new Error('WebGL not supported');
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    const maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    // Detect low-end devices
    const isLowEnd =
      isMobile &&
      (maxTextureSize < 2048 ||
        maxVertexUniforms < 128 ||
        maxFragmentUniforms < 16 ||
        navigator.hardwareConcurrency < 4);

    return {
      isMobile,
      isLowEnd,
      maxTextureSize,
      maxVertexUniforms,
      maxFragmentUniforms,
      supportsFloatTextures: !!gl.getExtension('OES_texture_float'),
      supportsInstancedArrays: !!gl.getExtension('ANGLE_instanced_arrays'),
      webglVersion: gl instanceof WebGL2RenderingContext ? 2 : 1,
    };
  }

  /**
   * Create LOD levels based on device capabilities
   */
  private createLODLevels(): LODLevel[] {
    const baseLevels: LODLevel[] = [
      {
        distance: 0,
        fractalDepth: 6,
        subdivisionLevels: 4,
        shaderComplexity: 'enhanced',
        particleCount: 1000,
        updateFrequency: 60,
      },
      {
        distance: 10,
        fractalDepth: 4,
        subdivisionLevels: 3,
        shaderComplexity: 'standard',
        particleCount: 500,
        updateFrequency: 30,
      },
      {
        distance: 25,
        fractalDepth: 2,
        subdivisionLevels: 2,
        shaderComplexity: 'minimal',
        particleCount: 100,
        updateFrequency: 15,
      },
      {
        distance: 50,
        fractalDepth: 1,
        subdivisionLevels: 1,
        shaderComplexity: 'minimal',
        particleCount: 50,
        updateFrequency: 10,
      },
    ];

    // Adjust for device capabilities
    if (this.capabilities.isLowEnd) {
      return baseLevels.map(level => ({
        ...level,
        fractalDepth: Math.max(1, level.fractalDepth - 2),
        subdivisionLevels: Math.max(1, level.subdivisionLevels - 1),
        particleCount: Math.floor(level.particleCount * 0.3),
        updateFrequency: Math.max(5, level.updateFrequency * 0.5),
      }));
    }

    if (this.capabilities.isMobile) {
      return baseLevels.map(level => ({
        ...level,
        fractalDepth: Math.max(1, level.fractalDepth - 1),
        particleCount: Math.floor(level.particleCount * 0.6),
        updateFrequency: Math.max(10, level.updateFrequency * 0.75),
      }));
    }

    return baseLevels;
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      fps: 60,
      frameTime: 16.67,
      drawCalls: 0,
      triangles: 0,
      geometryMemory: 0,
      textureMemory: 0,
      isLowPerformance: false,
    };
  }

  /**
   * Update performance metrics
   */
  updateMetrics(frameTime: number, drawCalls: number, triangles: number): void {
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > 60) {
      this.frameTimeHistory.shift();
    }

    const avgFrameTime =
      this.frameTimeHistory.reduce((sum, time) => sum + time, 0) / this.frameTimeHistory.length;

    this.metrics = {
      fps: 1000 / avgFrameTime,
      frameTime: avgFrameTime,
      drawCalls,
      triangles,
      geometryMemory: this.estimateGeometryMemory(triangles),
      textureMemory: this.estimateTextureMemory(),
      isLowPerformance: avgFrameTime > 33.33, // Below 30 FPS
    };

    // Adaptive quality adjustment
    this.updateAdaptiveQuality();
  }

  /**
   * Update adaptive quality based on performance
   */
  private updateAdaptiveQuality(): void {
    const targetFrameTime = 16.67; // 60 FPS
    const currentFrameTime = this.metrics.frameTime;

    if (currentFrameTime > targetFrameTime * 1.5) {
      // Performance is poor, reduce quality
      this.adaptiveQuality = Math.max(0.3, this.adaptiveQuality - 0.05);
    } else if (currentFrameTime < targetFrameTime * 0.8) {
      // Performance is good, can increase quality
      this.adaptiveQuality = Math.min(1.0, this.adaptiveQuality + 0.02);
    }
  }

  /**
   * Get LOD level for object based on distance and performance
   */
  getLODLevel(object: Object3D, camera: Camera): LODLevel {
    const distance = camera.position.distanceTo(object.position);
    const qualityModifier = this.adaptiveQuality;

    // Find appropriate LOD level
    let selectedLevel: LODLevel = this.lodLevels[this.lodLevels.length - 1]!; // Default to lowest quality

    for (const level of this.lodLevels) {
      if (distance <= level.distance * qualityModifier) {
        selectedLevel = level;
        break;
      }
    }

    // Further reduce quality if performance is poor
    if (this.metrics.isLowPerformance) {
      return {
        distance: selectedLevel.distance,
        fractalDepth: Math.max(1, selectedLevel.fractalDepth - 1),
        subdivisionLevels: Math.max(1, selectedLevel.subdivisionLevels - 1),
        shaderComplexity: 'minimal' as const,
        particleCount: Math.floor(selectedLevel.particleCount * 0.5),
        updateFrequency: Math.max(5, selectedLevel.updateFrequency * 0.5),
      };
    }

    return selectedLevel;
  }

  /**
   * Optimize sacred geometry based on LOD level
   */
  optimizeGeometry(
    geometry: SacredGeometry,
    lodLevel: LODLevel,
    _consciousness: ConsciousnessState
  ): SacredGeometry {
    // Reduce vertex count based on LOD
    const vertexReduction = 1.0 - (lodLevel.fractalDepth / 6.0) * 0.5;
    const targetVertexCount = Math.floor(geometry.vertices.length * vertexReduction);

    if (geometry.vertices.length <= targetVertexCount) {
      return geometry;
    }

    // Simplify geometry by removing vertices
    const step = Math.ceil(geometry.vertices.length / targetVertexCount);
    const optimizedVertices = geometry.vertices.filter((_, index) => index % step === 0);

    // Rebuild faces for simplified geometry
    const optimizedFaces = this.rebuildFaces(optimizedVertices, geometry.faces, step);

    return {
      ...geometry,
      vertices: optimizedVertices,
      faces: optimizedFaces,
    };
  }

  /**
   * Get shader complexity based on LOD and device capabilities
   */
  getShaderComplexity(lodLevel: LODLevel): 'minimal' | 'standard' | 'enhanced' {
    if (this.capabilities.isLowEnd || this.metrics.isLowPerformance) {
      return 'minimal';
    }

    if (this.capabilities.isMobile && lodLevel.shaderComplexity === 'enhanced') {
      return 'standard';
    }

    return lodLevel.shaderComplexity;
  }

  /**
   * Calculate optimal update frequency for animations
   */
  getUpdateFrequency(lodLevel: LODLevel): number {
    const baseFrequency = lodLevel.updateFrequency;
    const performanceModifier = this.adaptiveQuality;

    return Math.max(5, Math.floor(baseFrequency * performanceModifier));
  }

  /**
   * Check if consciousness effects should be reduced
   */
  shouldReduceConsciousnessEffects(): boolean {
    return (
      this.capabilities.isLowEnd || this.metrics.isLowPerformance || this.adaptiveQuality < 0.6
    );
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get device capabilities
   */
  getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get current adaptive quality level
   */
  getAdaptiveQuality(): number {
    return this.adaptiveQuality;
  }

  /**
   * Estimate geometry memory usage
   */
  private estimateGeometryMemory(triangles: number): number {
    // Rough estimate: vertices (3 floats * 4 bytes) + indices (3 ints * 4 bytes)
    return triangles * 3 * (3 * 4 + 4);
  }

  /**
   * Estimate texture memory usage
   */
  private estimateTextureMemory(): number {
    // This would need to be tracked externally in a real implementation
    return 0;
  }

  /**
   * Rebuild faces after vertex reduction
   */
  private rebuildFaces(vertices: Vector3[], originalFaces: number[][], step: number): number[][] {
    const indexMap = new Map<number, number>();
    vertices.forEach((_, newIndex) => {
      indexMap.set(newIndex * step, newIndex);
    });

    return originalFaces
      .map(face =>
        face.map(vertexIndex => indexMap.get(vertexIndex)).filter(index => index !== undefined)
      )
      .filter(face => face.length >= 3) as number[][];
  }
}

// Export singleton instance
export const performanceOptimizer = new PerformanceOptimizer();

// Export utility functions
export const getOptimalLOD = (object: Object3D, camera: Camera) =>
  performanceOptimizer.getLODLevel(object, camera);

export const optimizeForDevice = (
  geometry: SacredGeometry,
  consciousness: ConsciousnessState,
  camera: Camera,
  object: Object3D
) => {
  const lodLevel = performanceOptimizer.getLODLevel(object, camera);
  return performanceOptimizer.optimizeGeometry(geometry, lodLevel, consciousness);
};

export const shouldUseMinimalShaders = () =>
  performanceOptimizer.shouldReduceConsciousnessEffects();

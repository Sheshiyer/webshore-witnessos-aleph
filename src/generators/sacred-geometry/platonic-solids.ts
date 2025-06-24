/**
 * Sacred Geometry Generators for WitnessOS Webshore
 *
 * Platonic solids and sacred patterns with fractal subdivision
 * Mathematical foundation for consciousness visualization
 */

import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { Vector3 } from 'three';

const { SACRED_MATHEMATICS } = CONSCIOUSNESS_CONSTANTS;

/**
 * Base interface for sacred geometry
 */
export interface SacredGeometry {
  vertices: Vector3[];
  faces: number[][];
  edges: [number, number][];
  center: Vector3;
  radius: number;
  dualSolid?: SacredGeometry | undefined;
}

/**
 * Platonic solid generator with consciousness modulation
 */
export class PlatonicSolidGenerator {
  /**
   * Generate tetrahedron (4 faces, fire element)
   */
  static tetrahedron(radius: number = 1.0, consciousness?: ConsciousnessState): SacredGeometry {
    const a = radius * Math.sqrt(8 / 9);
    const b = radius * Math.sqrt(2 / 9);
    const c = radius * Math.sqrt(2 / 3);

    // Consciousness modulation
    const modulation = consciousness ? 1.0 + consciousness.awarenessLevel * 0.1 : 1.0;

    const vertices = [
      new Vector3(0, radius * modulation, 0),
      new Vector3(-a * modulation, -b * modulation, 0),
      new Vector3(a * modulation, -b * modulation, 0),
      new Vector3(0, -b * modulation, c * modulation),
    ];

    const faces = [
      [0, 1, 2],
      [0, 2, 3],
      [0, 3, 1],
      [1, 3, 2],
    ];

    const edges: [number, number][] = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [1, 3],
      [2, 3],
    ];

    return {
      vertices,
      faces,
      edges,
      center: new Vector3(0, 0, 0),
      radius: radius * modulation,
    };
  }

  /**
   * Generate cube (6 faces, earth element)
   */
  static cube(radius: number = 1.0, consciousness?: ConsciousnessState): SacredGeometry {
    const s = radius / Math.sqrt(3);
    const modulation = consciousness ? 1.0 + consciousness.awarenessLevel * 0.1 : 1.0;
    const ms = s * modulation;

    const vertices = [
      new Vector3(-ms, -ms, -ms),
      new Vector3(ms, -ms, -ms),
      new Vector3(ms, ms, -ms),
      new Vector3(-ms, ms, -ms),
      new Vector3(-ms, -ms, ms),
      new Vector3(ms, -ms, ms),
      new Vector3(ms, ms, ms),
      new Vector3(-ms, ms, ms),
    ];

    const faces = [
      [0, 1, 2, 3],
      [4, 7, 6, 5],
      [0, 4, 5, 1],
      [2, 6, 7, 3],
      [0, 3, 7, 4],
      [1, 5, 6, 2],
    ];

    const edges: [number, number][] = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ];

    return {
      vertices,
      faces,
      edges,
      center: new Vector3(0, 0, 0),
      radius: radius * modulation,
    };
  }

  /**
   * Generate octahedron (8 faces, air element)
   */
  static octahedron(radius: number = 1.0, consciousness?: ConsciousnessState): SacredGeometry {
    const modulation = consciousness ? 1.0 + consciousness.awarenessLevel * 0.1 : 1.0;
    const r = radius * modulation;

    const vertices = [
      new Vector3(r, 0, 0),
      new Vector3(-r, 0, 0),
      new Vector3(0, r, 0),
      new Vector3(0, -r, 0),
      new Vector3(0, 0, r),
      new Vector3(0, 0, -r),
    ];

    const faces = [
      [0, 2, 4],
      [0, 4, 3],
      [0, 3, 5],
      [0, 5, 2],
      [1, 4, 2],
      [1, 3, 4],
      [1, 5, 3],
      [1, 2, 5],
    ];

    const edges: [number, number][] = [
      [0, 2],
      [0, 3],
      [0, 4],
      [0, 5],
      [1, 2],
      [1, 3],
      [1, 4],
      [1, 5],
      [2, 4],
      [2, 5],
      [3, 4],
      [3, 5],
    ];

    return {
      vertices,
      faces,
      edges,
      center: new Vector3(0, 0, 0),
      radius: radius * modulation,
      dualSolid: PlatonicSolidGenerator.cube(radius, consciousness),
    };
  }

  /**
   * Generate dodecahedron (12 faces, ether element)
   */
  static dodecahedron(radius: number = 1.0, consciousness?: ConsciousnessState): SacredGeometry {
    const phi = SACRED_MATHEMATICS.PHI;
    const modulation = consciousness ? 1.0 + consciousness.awarenessLevel * 0.1 : 1.0;
    const scale = (radius * modulation) / Math.sqrt(3);

    const vertices = [
      // Cube vertices
      new Vector3(scale, scale, scale),
      new Vector3(scale, scale, -scale),
      new Vector3(scale, -scale, scale),
      new Vector3(scale, -scale, -scale),
      new Vector3(-scale, scale, scale),
      new Vector3(-scale, scale, -scale),
      new Vector3(-scale, -scale, scale),
      new Vector3(-scale, -scale, -scale),

      // Golden ratio rectangles
      new Vector3(0, scale * phi, scale / phi),
      new Vector3(0, scale * phi, -scale / phi),
      new Vector3(0, -scale * phi, scale / phi),
      new Vector3(0, -scale * phi, -scale / phi),
      new Vector3(scale / phi, 0, scale * phi),
      new Vector3(scale / phi, 0, -scale * phi),
      new Vector3(-scale / phi, 0, scale * phi),
      new Vector3(-scale / phi, 0, -scale * phi),
      new Vector3(scale * phi, scale / phi, 0),
      new Vector3(scale * phi, -scale / phi, 0),
      new Vector3(-scale * phi, scale / phi, 0),
      new Vector3(-scale * phi, -scale / phi, 0),
    ];

    // Simplified face definition for dodecahedron
    const faces = [
      [0, 16, 17, 2, 12],
      [1, 13, 3, 17, 16],
      [4, 14, 6, 19, 18],
      [5, 18, 19, 7, 15],
      [8, 9, 1, 16, 0],
      [10, 2, 17, 3, 11],
      [12, 2, 10, 6, 14],
      [13, 15, 7, 11, 3],
      [4, 8, 0, 12, 14],
      [5, 15, 13, 1, 9],
      [6, 10, 11, 7, 19],
      [8, 4, 18, 5, 9],
    ];

    const edges: [number, number][] = [];
    faces.forEach(face => {
      for (let i = 0; i < face.length; i++) {
        const next = (i + 1) % face.length;
        const currentVertex = face[i];
        const nextVertex = face[next];
        if (currentVertex !== undefined && nextVertex !== undefined) {
          edges.push([currentVertex, nextVertex]);
        }
      }
    });

    return {
      vertices,
      faces,
      edges,
      center: new Vector3(0, 0, 0),
      radius: radius * modulation,
      // Removed dualSolid to prevent infinite recursion
    };
  }

  /**
   * Generate icosahedron (20 faces, water element)
   */
  static icosahedron(radius: number = 1.0, consciousness?: ConsciousnessState): SacredGeometry {
    const phi = SACRED_MATHEMATICS.PHI;
    const modulation = consciousness ? 1.0 + consciousness.awarenessLevel * 0.1 : 1.0;
    const scale = (radius * modulation) / Math.sqrt(phi * phi + 1);

    const vertices = [
      new Vector3(0, scale, scale * phi),
      new Vector3(0, scale, -scale * phi),
      new Vector3(0, -scale, scale * phi),
      new Vector3(0, -scale, -scale * phi),
      new Vector3(scale, scale * phi, 0),
      new Vector3(scale, -scale * phi, 0),
      new Vector3(-scale, scale * phi, 0),
      new Vector3(-scale, -scale * phi, 0),
      new Vector3(scale * phi, 0, scale),
      new Vector3(scale * phi, 0, -scale),
      new Vector3(-scale * phi, 0, scale),
      new Vector3(-scale * phi, 0, -scale),
    ];

    const faces = [
      [0, 2, 8],
      [0, 8, 4],
      [0, 4, 6],
      [0, 6, 10],
      [0, 10, 2],
      [3, 1, 11],
      [3, 11, 7],
      [3, 7, 5],
      [3, 5, 9],
      [3, 9, 1],
      [2, 5, 8],
      [8, 5, 9],
      [8, 9, 4],
      [4, 9, 1],
      [4, 1, 6],
      [6, 1, 11],
      [6, 11, 10],
      [10, 11, 7],
      [10, 7, 2],
      [2, 7, 5],
    ];

    const edges: [number, number][] = [];
    faces.forEach(face => {
      for (let i = 0; i < face.length; i++) {
        const next = (i + 1) % face.length;
        const currentVertex = face[i];
        const nextVertex = face[next];
        if (currentVertex !== undefined && nextVertex !== undefined) {
          edges.push([currentVertex, nextVertex]);
        }
      }
    });

    return {
      vertices,
      faces,
      edges,
      center: new Vector3(0, 0, 0),
      radius: radius * modulation,
      // Removed dualSolid to prevent infinite recursion
    };
  }
}

/**
 * Enhanced Fractal subdivision for infinite detail with Nishitsuji-inspired optimization
 */
export class FractalSubdivision {
  /**
   * Subdivide geometry with consciousness-based detail level and fractal enhancement
   */
  static subdivide(
    geometry: SacredGeometry,
    levels: number,
    consciousness?: ConsciousnessState
  ): SacredGeometry {
    let currentGeometry = { ...geometry };
    const detailModulation = consciousness ? consciousness.awarenessLevel : 0.5;
    const actualLevels = Math.floor(levels * (0.5 + detailModulation * 0.5));

    for (let level = 0; level < actualLevels; level++) {
      currentGeometry = this.subdivideOnce(currentGeometry, level, consciousness);
    }

    return currentGeometry;
  }

  /**
   * Fractal-enhanced subdivision with golden ratio scaling
   */
  static fractalSubdivide(
    geometry: SacredGeometry,
    levels: number,
    consciousness?: ConsciousnessState,
    fractalType: 'mandelbrot' | 'julia' | 'dragon' | 'sierpinski' = 'mandelbrot'
  ): SacredGeometry {
    let currentGeometry = { ...geometry };
    const awarenessLevel = consciousness?.awarenessLevel ?? 0.5;

    for (let level = 0; level < levels; level++) {
      currentGeometry = this.applyFractalPattern(
        currentGeometry,
        level,
        fractalType,
        awarenessLevel
      );
    }

    return currentGeometry;
  }

  /**
   * Apply specific fractal patterns to geometry
   */
  private static applyFractalPattern(
    geometry: SacredGeometry,
    level: number,
    fractalType: string,
    awarenessLevel: number
  ): SacredGeometry {
    const newVertices = [...geometry.vertices];
    const fractalScale = Math.pow(SACRED_MATHEMATICS.PHI_INVERSE, level) * awarenessLevel;

    switch (fractalType) {
      case 'mandelbrot':
        return this.applyMandelbrotPattern(geometry, fractalScale, level);
      case 'julia':
        return this.applyJuliaPattern(geometry, fractalScale, level);
      case 'dragon':
        return this.applyDragonPattern(geometry, fractalScale, level);
      case 'sierpinski':
        return this.applySierpinskiPattern(geometry, fractalScale, level);
      default:
        return this.subdivideOnce(geometry, level);
    }
  }

  /**
   * Apply Mandelbrot-inspired vertex displacement
   */
  private static applyMandelbrotPattern(
    geometry: SacredGeometry,
    scale: number,
    level: number
  ): SacredGeometry {
    const newVertices = geometry.vertices.map(vertex => {
      const x = vertex.x * scale;
      const y = vertex.y * scale;

      // Simplified Mandelbrot iteration
      let zx = x,
        zy = y;
      let iterations = 0;
      const maxIter = 8 + level * 2;

      while (iterations < maxIter && zx * zx + zy * zy < 4) {
        const temp = zx * zx - zy * zy + x;
        zy = 2 * zx * zy + y;
        zx = temp;
        iterations++;
      }

      const displacement = (iterations / maxIter) * scale * 0.1;
      const direction = vertex.clone().normalize();

      return vertex.clone().add(direction.multiplyScalar(displacement));
    });

    return {
      ...geometry,
      vertices: newVertices,
    };
  }

  /**
   * Apply Julia set pattern
   */
  private static applyJuliaPattern(
    geometry: SacredGeometry,
    scale: number,
    level: number
  ): SacredGeometry {
    const c = { x: -0.7269, y: 0.1889 }; // Interesting Julia constant

    const newVertices = geometry.vertices.map(vertex => {
      let zx = vertex.x * scale;
      let zy = vertex.y * scale;
      let iterations = 0;
      const maxIter = 8 + level * 2;

      while (iterations < maxIter && zx * zx + zy * zy < 4) {
        const temp = zx * zx - zy * zy + c.x;
        zy = 2 * zx * zy + c.y;
        zx = temp;
        iterations++;
      }

      const displacement = (iterations / maxIter) * scale * 0.15;
      const direction = vertex.clone().normalize();

      return vertex.clone().add(direction.multiplyScalar(displacement));
    });

    return {
      ...geometry,
      vertices: newVertices,
    };
  }

  /**
   * Apply Dragon curve pattern
   */
  private static applyDragonPattern(
    geometry: SacredGeometry,
    scale: number,
    level: number
  ): SacredGeometry {
    const newVertices = geometry.vertices.map((vertex, index) => {
      const angle = (index / geometry.vertices.length) * SACRED_MATHEMATICS.TAU;
      const dragonAngle = angle + Math.sin(level * SACRED_MATHEMATICS.PHI) * scale;

      const displacement = scale * 0.1 * Math.sin(dragonAngle * 4);
      const direction = new Vector3(
        Math.cos(dragonAngle),
        Math.sin(dragonAngle),
        Math.sin(dragonAngle * SACRED_MATHEMATICS.PHI)
      ).normalize();

      return vertex.clone().add(direction.multiplyScalar(displacement));
    });

    return {
      ...geometry,
      vertices: newVertices,
    };
  }

  /**
   * Apply Sierpinski triangle pattern
   */
  private static applySierpinskiPattern(
    geometry: SacredGeometry,
    scale: number,
    level: number
  ): SacredGeometry {
    const newVertices = [...geometry.vertices];
    const newFaces: number[][] = [];

    // Sierpinski subdivision: replace each triangle with 3 smaller triangles
    for (const face of geometry.faces) {
      if (face.length === 3) {
        const [a, b, c] = face;
        if (a === undefined || b === undefined || c === undefined) {
          continue;
        }

        const va = geometry.vertices[a];
        const vb = geometry.vertices[b];
        const vc = geometry.vertices[c];

        if (!va || !vb || !vc) {
          continue;
        }

        // Create midpoints
        const mab = va.clone().add(vb).multiplyScalar(0.5);
        const mbc = vb.clone().add(vc).multiplyScalar(0.5);
        const mca = vc.clone().add(va).multiplyScalar(0.5);

        const idxAB = newVertices.length;
        const idxBC = newVertices.length + 1;
        const idxCA = newVertices.length + 2;

        newVertices.push(mab, mbc, mca);

        // Create 3 new triangles (omitting center for Sierpinski effect)
        newFaces.push([a, idxAB, idxCA]);
        newFaces.push([idxAB, b, idxBC]);
        newFaces.push([idxCA, idxBC, c]);
      } else {
        newFaces.push(face);
      }
    }

    return {
      ...geometry,
      vertices: newVertices,
      faces: newFaces,
    };
  }

  private static subdivideOnce(
    geometry: SacredGeometry,
    level: number,
    consciousness?: ConsciousnessState
  ): SacredGeometry {
    const newVertices = [...geometry.vertices];
    const newFaces: number[][] = [];
    const edgeMap = new Map<string, number>();

    // Create midpoint vertices
    geometry.faces.forEach(face => {
      const newFace: number[] = [];

      for (let i = 0; i < face.length; i++) {
        const v1 = face[i];
        const v2 = face[(i + 1) % face.length];

        if (v1 === undefined || v2 === undefined) {
          continue;
        }

        const edgeKey = `${Math.min(v1, v2)}-${Math.max(v1, v2)}`;

        newFace.push(v1);

        if (!edgeMap.has(edgeKey)) {
          const vertex1 = geometry.vertices[v1];
          const vertex2 = geometry.vertices[v2];
          if (!vertex1 || !vertex2) continue;

          const midpoint = vertex1.clone().add(vertex2).multiplyScalar(0.5);

          // Consciousness-based displacement
          if (consciousness) {
            const displacement = midpoint
              .clone()
              .normalize()
              .multiplyScalar(
                consciousness.awarenessLevel * 0.1 * Math.sin(level * SACRED_MATHEMATICS.PHI)
              );
            midpoint.add(displacement);
          }

          edgeMap.set(edgeKey, newVertices.length);
          newVertices.push(midpoint);
        }

        newFace.push(edgeMap.get(edgeKey)!);
      }

      newFaces.push(newFace);
    });

    // Update edges
    const newEdges: [number, number][] = [];
    newFaces.forEach(face => {
      for (let i = 0; i < face.length; i++) {
        const next = (i + 1) % face.length;
        const currentVertex = face[i];
        const nextVertex = face[next];
        if (currentVertex !== undefined && nextVertex !== undefined) {
          newEdges.push([currentVertex, nextVertex]);
        }
      }
    });

    return {
      vertices: newVertices,
      faces: newFaces,
      edges: newEdges,
      center: geometry.center.clone(),
      radius: geometry.radius,
      dualSolid: geometry.dualSolid ?? undefined,
    };
  }
}

/**
 * Breath-responsive geometry modulation
 */
export class BreathGeometry {
  /**
   * Modulate geometry vertices based on breath state
   */
  static modulateWithBreath(
    geometry: SacredGeometry,
    breath: BreathState,
    intensity: number = 0.1
  ): SacredGeometry {
    const breathPhase = this.getBreathPhase(breath);
    const modulation = Math.sin(breathPhase) * intensity * breath.coherence;

    const modulatedVertices = geometry.vertices.map(vertex => {
      const distance = vertex.length();
      const direction = vertex.clone().normalize();
      const newDistance = distance * (1.0 + modulation);
      return direction.multiplyScalar(newDistance);
    });

    return {
      ...geometry,
      vertices: modulatedVertices,
      radius: geometry.radius * (1.0 + modulation),
    };
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

// Export factory functions
export const createTetrahedron = (radius?: number, consciousness?: ConsciousnessState) =>
  PlatonicSolidGenerator.tetrahedron(radius, consciousness);

export const createCube = (radius?: number, consciousness?: ConsciousnessState) =>
  PlatonicSolidGenerator.cube(radius, consciousness);

export const createOctahedron = (radius?: number, consciousness?: ConsciousnessState) =>
  PlatonicSolidGenerator.octahedron(radius, consciousness);

export const createDodecahedron = (radius?: number, consciousness?: ConsciousnessState) =>
  PlatonicSolidGenerator.dodecahedron(radius, consciousness);

export const createIcosahedron = (radius?: number, consciousness?: ConsciousnessState) =>
  PlatonicSolidGenerator.icosahedron(radius, consciousness);

export const subdivideFractally = (
  geometry: SacredGeometry,
  levels: number,
  consciousness?: ConsciousnessState
) => FractalSubdivision.subdivide(geometry, levels, consciousness);

export const fractalSubdivide = (
  geometry: SacredGeometry,
  levels: number,
  consciousness?: ConsciousnessState,
  fractalType?: 'mandelbrot' | 'julia' | 'dragon' | 'sierpinski'
) => FractalSubdivision.fractalSubdivide(geometry, levels, consciousness, fractalType);

export const modulateWithBreath = (
  geometry: SacredGeometry,
  breath: BreathState,
  intensity?: number
) => BreathGeometry.modulateWithBreath(geometry, breath, intensity);

// Enhanced factory functions with fractal capabilities
export const createFractalTetrahedron = (
  radius?: number,
  consciousness?: ConsciousnessState,
  fractalLevels: number = 2,
  fractalType?: 'mandelbrot' | 'julia' | 'dragon' | 'sierpinski'
) => {
  const base = PlatonicSolidGenerator.tetrahedron(radius, consciousness);
  return fractalType
    ? FractalSubdivision.fractalSubdivide(base, fractalLevels, consciousness, fractalType)
    : FractalSubdivision.subdivide(base, fractalLevels, consciousness);
};

export const createFractalCube = (
  radius?: number,
  consciousness?: ConsciousnessState,
  fractalLevels: number = 2,
  fractalType?: 'mandelbrot' | 'julia' | 'dragon' | 'sierpinski'
) => {
  const base = PlatonicSolidGenerator.cube(radius, consciousness);
  return fractalType
    ? FractalSubdivision.fractalSubdivide(base, fractalLevels, consciousness, fractalType)
    : FractalSubdivision.subdivide(base, fractalLevels, consciousness);
};

export const createFractalOctahedron = (
  radius?: number,
  consciousness?: ConsciousnessState,
  fractalLevels: number = 2,
  fractalType?: 'mandelbrot' | 'julia' | 'dragon' | 'sierpinski'
) => {
  const base = PlatonicSolidGenerator.octahedron(radius, consciousness);
  return fractalType
    ? FractalSubdivision.fractalSubdivide(base, fractalLevels, consciousness, fractalType)
    : FractalSubdivision.subdivide(base, fractalLevels, consciousness);
};

export const createFractalDodecahedron = (
  radius?: number,
  consciousness?: ConsciousnessState,
  fractalLevels: number = 2,
  fractalType?: 'mandelbrot' | 'julia' | 'dragon' | 'sierpinski'
) => {
  const base = PlatonicSolidGenerator.dodecahedron(radius, consciousness);
  return fractalType
    ? FractalSubdivision.fractalSubdivide(base, fractalLevels, consciousness, fractalType)
    : FractalSubdivision.subdivide(base, fractalLevels, consciousness);
};

export const createFractalIcosahedron = (
  radius?: number,
  consciousness?: ConsciousnessState,
  fractalLevels: number = 2,
  fractalType?: 'mandelbrot' | 'julia' | 'dragon' | 'sierpinski'
) => {
  const base = PlatonicSolidGenerator.icosahedron(radius, consciousness);
  return fractalType
    ? FractalSubdivision.fractalSubdivide(base, fractalLevels, consciousness, fractalType)
    : FractalSubdivision.subdivide(base, fractalLevels, consciousness);
};

/**
 * Generate true octagonal chamber geometry with golden ratio proportions
 */
export const createOctagonalChamber = (
  radius: number = 5,
  consciousness?: ConsciousnessState,
  nested: boolean = true
): SacredGeometry => {
  const modulation = consciousness ? 1.0 + consciousness.awarenessLevel * 0.1 : 1.0;
  const phi = SACRED_MATHEMATICS.PHI;

  // Create octagonal vertices using golden ratio proportions
  const vertices: Vector3[] = [];
  const faces: number[][] = [];
  const edges: [number, number][] = [];

  // Outer octagon vertices
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const x = Math.cos(angle) * radius * modulation;
    const y = Math.sin(angle) * radius * modulation;
    vertices.push(new Vector3(x, y, 0));
  }

  if (nested) {
    // Inner octagon with golden ratio scaling
    const innerRadius = radius / phi;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + Math.PI / 8; // Rotated 22.5 degrees
      const x = Math.cos(angle) * innerRadius * modulation;
      const y = Math.sin(angle) * innerRadius * modulation;
      vertices.push(new Vector3(x, y, 0));
    }

    // Center point
    vertices.push(new Vector3(0, 0, 0));

    // Create faces connecting outer to inner octagon
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      // Outer to inner triangles
      faces.push([i, next, i + 8]);
      faces.push([next, ((next + 1) % 8) + 8, i + 8]);

      // Inner to center triangles
      faces.push([i + 8, ((i + 1) % 8) + 8, 16]);
    }

    // Create edges
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      // Outer octagon edges
      edges.push([i, next]);
      // Inner octagon edges
      edges.push([i + 8, ((i + 1) % 8) + 8]);
      // Connecting edges
      edges.push([i, i + 8]);
      // Center edges
      edges.push([i + 8, 16]);
    }
  } else {
    // Simple octagon
    for (let i = 0; i < 8; i++) {
      const next = (i + 1) % 8;
      edges.push([i, next]);
    }
  }

  return {
    vertices,
    faces,
    edges,
    center: new Vector3(0, 0, 0),
    radius: radius * modulation,
  };
};

/**
 * Generate sacred geometry for Three.js
 * This is the function our engine components expect
 */
export const generateSacredGeometry = (options: {
  type: string;
  radius?: number;
  petals?: number;
  layers?: number;
  triangles?: number;
  complexity?: number;
}) => {
  // For now, return a simple ring geometry as placeholder
  // This prevents import errors while maintaining the interface
  const { RingGeometry } = require('three');
  return new RingGeometry(options.radius || 1, (options.radius || 1) * 1.2, 16);
};

/**
 * Create platonic solid for Three.js
 * This is the function our engine components expect
 */
export const createPlatonicSolid = (type: string, radius: number = 1) => {
  const {
    SphereGeometry,
    BoxGeometry,
    OctahedronGeometry,
    IcosahedronGeometry,
    DodecahedronGeometry,
  } = require('three');

  switch (type) {
    case 'tetrahedron':
      return new OctahedronGeometry(radius);
    case 'cube':
      return new BoxGeometry(radius, radius, radius);
    case 'octahedron':
      return new OctahedronGeometry(radius);
    case 'dodecahedron':
      return new DodecahedronGeometry(radius);
    case 'icosahedron':
      return new IcosahedronGeometry(radius);
    default:
      return new SphereGeometry(radius, 8, 8);
  }
};

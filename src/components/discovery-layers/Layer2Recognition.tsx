/**
 * Layer 2: Recognition - System Understanding Spaces
 *
 * Deep learning layer with spiral geometry and pattern recognition
 * Advanced consciousness system understanding through fractal exploration
 */

'use client';

import {
  createFractalIcosahedron,
  createFractalOctahedron,
  createFractalTetrahedron,
} from '@/generators/sacred-geometry/platonic-solids';
import { createConsciousnessWaveTransformer } from '@/generators/wave-equations/consciousness-transformations';
import {
  createArchetypalFractalMaterial,
  FractalType,
} from '@/shaders/fractals/archetypal-fractals';
import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import { BufferAttribute, BufferGeometry, Color, Group, Mesh, Vector3 } from 'three';
import type { DiscoveryProgress } from './DiscoveryLayerSystem';

const { SACRED_MATHEMATICS, CONSCIOUSNESS_FREQUENCIES } = CONSCIOUSNESS_CONSTANTS;

interface Layer2RecognitionProps {
  consciousness: ConsciousnessState;
  breath: BreathState;
  progress: DiscoveryProgress;
  onArtifactDiscovered?: (artifact: any) => void;
  onPatternRecognized?: (pattern: string, confidence: number) => void;
  isActive: boolean;
}

interface SystemUnderstandingSpace {
  id: string;
  name: string;
  position: Vector3;
  systemType: 'numerology' | 'human-design' | 'enneagram' | 'tarot' | 'iching';
  fractalSignature: FractalType;
  understandingLevel: number; // 0-1
  patterns: Array<{
    id: string;
    name: string;
    discovered: boolean;
    confidence: number;
  }>;
}

/**
 * Layer 2: Recognition Component
 */
export const Layer2Recognition: React.FC<Layer2RecognitionProps> = ({
  consciousness,
  breath,
  progress,
  onArtifactDiscovered,
  onPatternRecognized,
  isActive,
}) => {
  const groupRef = useRef<Group>(null);
  const spiralPathRef = useRef<Group>(null);
  const systemSpacesRef = useRef<Group>(null);

  // System understanding spaces
  const [systemSpaces, setSystemSpaces] = useState<SystemUnderstandingSpace[]>([
    {
      id: 'numerology-space',
      name: 'Numerology Understanding',
      position: new Vector3(12, 0, 0),
      systemType: 'numerology',
      fractalSignature: FractalType.MANDELBROT,
      understandingLevel: 0,
      patterns: [
        { id: 'life-path', name: 'Life Path Numbers', discovered: false, confidence: 0 },
        { id: 'expression', name: 'Expression Numbers', discovered: false, confidence: 0 },
        { id: 'soul-urge', name: 'Soul Urge Numbers', discovered: false, confidence: 0 },
      ],
    },
    {
      id: 'human-design-space',
      name: 'Human Design Understanding',
      position: new Vector3(8.5, 0, 8.5),
      systemType: 'human-design',
      fractalSignature: FractalType.JULIA,
      understandingLevel: 0,
      patterns: [
        { id: 'energy-types', name: 'Energy Types', discovered: false, confidence: 0 },
        { id: 'centers', name: 'Energy Centers', discovered: false, confidence: 0 },
        { id: 'gates-channels', name: 'Gates & Channels', discovered: false, confidence: 0 },
      ],
    },
    {
      id: 'enneagram-space',
      name: 'Enneagram Understanding',
      position: new Vector3(0, 0, 12),
      systemType: 'enneagram',
      fractalSignature: FractalType.SIERPINSKI,
      understandingLevel: 0,
      patterns: [
        { id: 'nine-types', name: 'Nine Personality Types', discovered: false, confidence: 0 },
        { id: 'centers', name: 'Three Centers', discovered: false, confidence: 0 },
        { id: 'integration', name: 'Integration Paths', discovered: false, confidence: 0 },
      ],
    },
    {
      id: 'tarot-space',
      name: 'Tarot Understanding',
      position: new Vector3(-8.5, 0, 8.5),
      systemType: 'tarot',
      fractalSignature: FractalType.DRAGON,
      understandingLevel: 0,
      patterns: [
        { id: 'major-arcana', name: 'Major Arcana', discovered: false, confidence: 0 },
        { id: 'minor-arcana', name: 'Minor Arcana', discovered: false, confidence: 0 },
        { id: 'spreads', name: 'Card Spreads', discovered: false, confidence: 0 },
      ],
    },
    {
      id: 'iching-space',
      name: 'I-Ching Understanding',
      position: new Vector3(-12, 0, 0),
      systemType: 'iching',
      fractalSignature: FractalType.MANDELBROT,
      understandingLevel: 0,
      patterns: [
        { id: 'hexagrams', name: '64 Hexagrams', discovered: false, confidence: 0 },
        { id: 'trigrams', name: '8 Trigrams', discovered: false, confidence: 0 },
        { id: 'changes', name: 'Line Changes', discovered: false, confidence: 0 },
      ],
    },
  ]);

  // Wave transformer for pattern analysis
  const waveTransformer = useMemo(() => createConsciousnessWaveTransformer(), []);

  // Spiral path geometry
  const spiralPath = useMemo(() => {
    const points = [];
    const particleCount = performanceOptimizer.shouldReduceConsciousnessEffects() ? 300 : 1000;

    for (let i = 0; i < particleCount; i++) {
      const t = (i / particleCount) * SACRED_MATHEMATICS.TAU * 8; // 8 spiral turns
      const radius = (i / particleCount) * 25; // Expand to 25 units
      const height = Math.sin(t * 0.5) * 3; // Vertical wave

      const x = Math.cos(t) * radius;
      const y = height;
      const z = Math.sin(t) * radius;

      points.push(x, y, z);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(new Float32Array(points), 3));

    return geometry;
  }, []);

  // Pattern recognition particles
  const patternParticles = useMemo(() => {
    const particleCount = performanceOptimizer.shouldReduceConsciousnessEffects() ? 150 : 500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    systemSpaces.forEach((space, spaceIndex) => {
      const particlesPerSpace = Math.floor(particleCount / systemSpaces.length);
      const startIndex = spaceIndex * particlesPerSpace;

      for (let i = 0; i < particlesPerSpace; i++) {
        const index = startIndex + i;
        const i3 = index * 3;

        // Distribute particles around system space
        const angle = (i / particlesPerSpace) * SACRED_MATHEMATICS.TAU;
        const radius = 1 + Math.random() * 2;
        const height = (Math.random() - 0.5) * 2;

        positions[i3] = space.position.x + Math.cos(angle) * radius;
        positions[i3 + 1] = space.position.y + height;
        positions[i3 + 2] = space.position.z + Math.sin(angle) * radius;

        // System-specific colors
        const systemColors = {
          numerology: new Color(0xff6600), // Orange
          'human-design': new Color(0x0066ff), // Blue
          enneagram: new Color(0x66ff00), // Green
          tarot: new Color(0xff0066), // Magenta
          iching: new Color(0xffff00), // Yellow
        };

        const color = systemColors[space.systemType];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }
    });

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    return geometry;
  }, [systemSpaces]);

  /**
   * Analyze pattern recognition based on consciousness level
   */
  const analyzePatternRecognition = (spaceId: string, interactionStrength: number) => {
    const spaceIndex = systemSpaces.findIndex(s => s.id === spaceId);
    if (spaceIndex === -1) return;

    const space = systemSpaces[spaceIndex];
    if (!space) return;

    const recognitionThreshold = 0.6 + consciousness.awarenessLevel * 0.3;

    if (interactionStrength > recognitionThreshold) {
      // Update understanding level
      const newUnderstandingLevel = Math.min(1.0, space.understandingLevel + 0.1);

      // Check for pattern discoveries
      space.patterns.forEach((pattern, patternIndex) => {
        if (!pattern.discovered && Math.random() < consciousness.awarenessLevel) {
          const confidence = consciousness.awarenessLevel * interactionStrength;

          setSystemSpaces(prev =>
            prev.map((s, i) =>
              i === spaceIndex
                ? {
                    ...s,
                    understandingLevel: newUnderstandingLevel,
                    patterns: s.patterns.map((p, pi) =>
                      pi === patternIndex ? { ...p, discovered: true, confidence } : p
                    ),
                  }
                : s
            )
          );

          onPatternRecognized?.(pattern.name, confidence);

          onArtifactDiscovered?.({
            type: 'pattern-recognition',
            system: space.systemType,
            pattern: pattern.name,
            confidence,
            layer: 2,
            position: space.position,
            timestamp: Date.now(),
          });
        }
      });
    }
  };

  /**
   * Get system space geometry based on type
   */
  const getSystemGeometry = (systemType: string, consciousness: ConsciousnessState) => {
    const lodLevel = performanceOptimizer.getLODLevel(
      { position: new Vector3() } as any,
      { position: new Vector3(0, 0, 10) } as any
    );
    const complexity = Math.max(1, lodLevel.fractalDepth);

    switch (systemType) {
      case 'numerology':
        return createFractalTetrahedron(2, consciousness, complexity, 'mandelbrot');
      case 'human-design':
        return createFractalOctahedron(2, consciousness, complexity, 'julia');
      case 'enneagram':
        return createFractalIcosahedron(2, consciousness, complexity, 'sierpinski');
      case 'tarot':
        return createFractalTetrahedron(2, consciousness, complexity, 'dragon');
      case 'iching':
        return createFractalOctahedron(2, consciousness, complexity, 'mandelbrot');
      default:
        return createFractalTetrahedron(2, consciousness, complexity, 'mandelbrot');
    }
  };

  // Animation loop
  useFrame((state, delta) => {
    if (!isActive || !groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Animate spiral path
    if (spiralPathRef.current) {
      spiralPathRef.current.rotation.y += delta * 0.1 * consciousness.awarenessLevel;
    }

    // Animate system spaces
    systemSpaces.forEach((space, index) => {
      const spaceMesh = systemSpacesRef.current?.children[index] as Mesh;
      if (spaceMesh) {
        // Rotation based on understanding level
        const rotationSpeed = 0.1 + space.understandingLevel * 0.3;
        spaceMesh.rotation.y += delta * rotationSpeed;
        spaceMesh.rotation.x += delta * rotationSpeed * 0.5;

        // Scale pulsing based on consciousness
        const pulse = 1.0 + Math.sin(time * 2 + index) * 0.1 * consciousness.awarenessLevel;
        spaceMesh.scale.setScalar(pulse);

        // Height oscillation based on breath
        const breathOffset =
          Math.sin(time + index * SACRED_MATHEMATICS.PHI) * breath.coherence * 0.5;
        spaceMesh.position.y = space.position.y + breathOffset;
      }
    });

    // Animate pattern particles
    if (patternParticles.attributes.position) {
      const positions = patternParticles.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        // Ensure we have valid indices
        if (i + 2 >= positions.length) break;

        const particleIndex = i / 3;

        // Orbital motion around system spaces
        const angle = time * 0.5 + particleIndex * 0.1;
        const orbitRadius = 0.5 + Math.sin(time + particleIndex) * 0.2;

        positions[i] = (positions[i] || 0) + Math.cos(angle) * orbitRadius * delta * 0.1;
        positions[i + 2] = (positions[i + 2] || 0) + Math.sin(angle) * orbitRadius * delta * 0.1;

        // Vertical wave motion
        positions[i + 1] =
          (positions[i + 1] || 0) + Math.sin(time * 2 + particleIndex * 0.5) * delta * 0.05;
      }
      patternParticles.attributes.position.needsUpdate = true;
    }

    // Simulate pattern recognition based on consciousness level
    if (consciousness.awarenessLevel > 0.5 && Math.random() < 0.01) {
      const randomSpace = systemSpaces[Math.floor(Math.random() * systemSpaces.length)];
      if (randomSpace) {
        analyzePatternRecognition(randomSpace.id, consciousness.awarenessLevel);
      }
    }
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Spiral Path */}
      <group ref={spiralPathRef}>
        <lineSegments geometry={spiralPath}>
          <lineBasicMaterial
            color={0x9966ff}
            transparent
            opacity={0.4 + consciousness.awarenessLevel * 0.4}
          />
        </lineSegments>
      </group>

      {/* System Understanding Spaces */}
      <group ref={systemSpacesRef}>
        {systemSpaces.map((space, index) => (
          <group key={space.id} position={space.position.toArray()}>
            <mesh onClick={() => analyzePatternRecognition(space.id, 1.0)}>
              <primitive object={getSystemGeometry(space.systemType, consciousness)} />
              <primitive
                object={createArchetypalFractalMaterial(
                  space.fractalSignature,
                  undefined,
                  undefined
                ).getMaterial()}
              />
            </mesh>

            {/* Understanding level indicator */}
            <mesh position={[0, 3, 0]}>
              <cylinderGeometry args={[0.1, 0.1, space.understandingLevel * 2, 8]} />
              <meshBasicMaterial
                color={
                  space.understandingLevel > 0.7
                    ? 0x00ff00
                    : space.understandingLevel > 0.4
                      ? 0xffaa00
                      : 0xff0000
                }
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Pattern discovery indicators */}
            {space.patterns.map(
              (pattern, patternIndex) =>
                pattern.discovered && (
                  <mesh
                    key={pattern.id}
                    position={[
                      Math.cos((patternIndex * SACRED_MATHEMATICS.TAU) / 3) * 1.5,
                      1,
                      Math.sin((patternIndex * SACRED_MATHEMATICS.TAU) / 3) * 1.5,
                    ]}
                  >
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color={0x00ffff} transparent opacity={pattern.confidence} />
                  </mesh>
                )
            )}
          </group>
        ))}
      </group>

      {/* Pattern Recognition Particles */}
      <points geometry={patternParticles}>
        <pointsMaterial
          size={0.04}
          vertexColors
          transparent
          opacity={0.7 + consciousness.awarenessLevel * 0.3}
          sizeAttenuation
        />
      </points>

      {/* Recognition field boundary */}
      <mesh position={[0, -0.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[23, 25, 64]} />
        <meshBasicMaterial
          color={0x6644aa}
          transparent
          opacity={0.2 + consciousness.awarenessLevel * 0.3}
          wireframe
        />
      </mesh>

      {/* Ambient recognition lighting */}
      <pointLight
        position={[0, 8, 0]}
        intensity={0.6 + consciousness.awarenessLevel * 0.6}
        color={0x9966ff}
        distance={30}
        decay={2}
      />
    </group>
  );
};

export default Layer2Recognition;

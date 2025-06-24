/**
 * Layer 3: Integration - Archetype Temples and Mastery Areas
 *
 * Mastery layer with mandala geometry and archetype integration
 * Advanced consciousness mastery through archetypal temple exploration
 */

'use client';

import {
  createEnneagramFractal,
  createHumanDesignFractal,
} from '@/generators/archetypal/consciousness-signatures';
import {
  createFractalDodecahedron,
  createFractalIcosahedron,
} from '@/generators/sacred-geometry/platonic-solids';
import {
  createArchetypalFractalMaterial,
  FractalType,
  getHumanDesignTypeFromString,
} from '@/shaders/fractals/archetypal-fractals';
import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import { BufferAttribute, BufferGeometry, Color, Group, Vector3 } from 'three';
import type { DiscoveryProgress } from './DiscoveryLayerSystem';

const { SACRED_MATHEMATICS, CONSCIOUSNESS_FREQUENCIES } = CONSCIOUSNESS_CONSTANTS;

interface Layer3IntegrationProps {
  consciousness: ConsciousnessState;
  breath: BreathState;
  progress: DiscoveryProgress;
  onArtifactDiscovered?: (artifact: any) => void;
  onArchetypeMastered?: (archetype: string, masteryLevel: number) => void;
  isActive: boolean;
  userArchetypes?: {
    humanDesignType?: string;
    enneagramType?: number;
  };
}

interface ArchetypeTemple {
  id: string;
  name: string;
  position: Vector3;
  archetypeType: 'human-design' | 'enneagram' | 'tarot-major' | 'planetary' | 'elemental';
  specificType: string | number;
  masteryLevel: number; // 0-1
  fractalSignature: FractalType;
  resonanceFrequency: number;
  activated: boolean;
  masteryArtifacts: Array<{
    id: string;
    name: string;
    discovered: boolean;
    masteryContribution: number;
  }>;
}

/**
 * Layer 3: Integration Component
 */
export const Layer3Integration: React.FC<Layer3IntegrationProps> = ({
  consciousness,
  breath,
  progress,
  onArtifactDiscovered,
  onArchetypeMastered,
  isActive,
  userArchetypes = {},
}) => {
  const groupRef = useRef<Group>(null);
  const mandalaRef = useRef<Group>(null);
  const templesRef = useRef<Group>(null);

  // Archetype temples
  const [archetypeTemples, setArchetypeTemples] = useState<ArchetypeTemple[]>([
    {
      id: 'manifestor-temple',
      name: 'Manifestor Temple',
      position: new Vector3(20, 0, 20),
      archetypeType: 'human-design',
      specificType: 'manifestor',
      masteryLevel: 0,
      fractalSignature: FractalType.MANDELBROT,
      resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.UT,
      activated: false,
      masteryArtifacts: [
        {
          id: 'initiation-mastery',
          name: 'Initiation Mastery',
          discovered: false,
          masteryContribution: 0.3,
        },
        {
          id: 'impact-mastery',
          name: 'Impact Mastery',
          discovered: false,
          masteryContribution: 0.4,
        },
        {
          id: 'independence-mastery',
          name: 'Independence Mastery',
          discovered: false,
          masteryContribution: 0.3,
        },
      ],
    },
    {
      id: 'generator-temple',
      name: 'Generator Temple',
      position: new Vector3(20, 0, 0),
      archetypeType: 'human-design',
      specificType: 'generator',
      masteryLevel: 0,
      fractalSignature: FractalType.JULIA,
      resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.RE,
      activated: false,
      masteryArtifacts: [
        {
          id: 'response-mastery',
          name: 'Response Mastery',
          discovered: false,
          masteryContribution: 0.4,
        },
        {
          id: 'satisfaction-mastery',
          name: 'Satisfaction Mastery',
          discovered: false,
          masteryContribution: 0.3,
        },
        {
          id: 'sustainability-mastery',
          name: 'Sustainability Mastery',
          discovered: false,
          masteryContribution: 0.3,
        },
      ],
    },
    {
      id: 'projector-temple',
      name: 'Projector Temple',
      position: new Vector3(20, 0, -20),
      archetypeType: 'human-design',
      specificType: 'projector',
      masteryLevel: 0,
      fractalSignature: FractalType.SIERPINSKI,
      resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.FA,
      activated: false,
      masteryArtifacts: [
        {
          id: 'recognition-mastery',
          name: 'Recognition Mastery',
          discovered: false,
          masteryContribution: 0.3,
        },
        {
          id: 'guidance-mastery',
          name: 'Guidance Mastery',
          discovered: false,
          masteryContribution: 0.4,
        },
        {
          id: 'efficiency-mastery',
          name: 'Efficiency Mastery',
          discovered: false,
          masteryContribution: 0.3,
        },
      ],
    },
    {
      id: 'reflector-temple',
      name: 'Reflector Temple',
      position: new Vector3(0, 0, 20),
      archetypeType: 'human-design',
      specificType: 'reflector',
      masteryLevel: 0,
      fractalSignature: FractalType.DRAGON,
      resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.SOLFEGGIO.SOL,
      activated: false,
      masteryArtifacts: [
        {
          id: 'reflection-mastery',
          name: 'Reflection Mastery',
          discovered: false,
          masteryContribution: 0.3,
        },
        {
          id: 'lunar-mastery',
          name: 'Lunar Cycle Mastery',
          discovered: false,
          masteryContribution: 0.4,
        },
        {
          id: 'community-mastery',
          name: 'Community Mastery',
          discovered: false,
          masteryContribution: 0.3,
        },
      ],
    },
    // Enneagram temples
    {
      id: 'enneagram-1-temple',
      name: 'Perfectionist Temple',
      position: new Vector3(-20, 0, 20),
      archetypeType: 'enneagram',
      specificType: 1,
      masteryLevel: 0,
      fractalSignature: FractalType.MANDELBROT,
      resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.CHAKRA.ROOT,
      activated: false,
      masteryArtifacts: [
        {
          id: 'perfection-mastery',
          name: 'Perfection Mastery',
          discovered: false,
          masteryContribution: 0.5,
        },
        {
          id: 'integrity-mastery',
          name: 'Integrity Mastery',
          discovered: false,
          masteryContribution: 0.5,
        },
      ],
    },
    {
      id: 'enneagram-9-temple',
      name: 'Peacemaker Temple',
      position: new Vector3(-20, 0, -20),
      archetypeType: 'enneagram',
      specificType: 9,
      masteryLevel: 0,
      fractalSignature: FractalType.JULIA,
      resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.CHAKRA.CROWN,
      activated: false,
      masteryArtifacts: [
        {
          id: 'harmony-mastery',
          name: 'Harmony Mastery',
          discovered: false,
          masteryContribution: 0.5,
        },
        { id: 'unity-mastery', name: 'Unity Mastery', discovered: false, masteryContribution: 0.5 },
      ],
    },
  ]);

  // Central mandala geometry
  const mandalaGeometry = useMemo(() => {
    const lodLevel = performanceOptimizer.getLODLevel(
      { position: new Vector3() } as any,
      { position: new Vector3(0, 0, 10) } as any
    );
    const complexity = Math.max(3, lodLevel.fractalDepth);

    return createFractalDodecahedron(8, consciousness, complexity, 'mandelbrot');
  }, [consciousness]);

  // Mastery particle field
  const masteryParticles = useMemo(() => {
    const particleCount = performanceOptimizer.shouldReduceConsciousnessEffects() ? 400 : 1200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Mandala pattern distribution
      const layer = Math.floor(i / (particleCount / 8)); // 8 layers
      const angleStep = SACRED_MATHEMATICS.TAU / (particleCount / 8);
      const angle = (i % (particleCount / 8)) * angleStep;
      const radius = 5 + layer * 4;
      const height = Math.sin(angle * 4 + layer) * 2;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Mastery colors - gold to white gradient
      const masteryLevel = consciousness.awarenessLevel;
      const color = new Color().setHSL(0.15, 0.8 - masteryLevel * 0.3, 0.5 + masteryLevel * 0.5);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    return geometry;
  }, [consciousness.awarenessLevel]);

  /**
   * Activate archetype temple
   */
  const activateTemple = (templeId: string) => {
    const templeIndex = archetypeTemples.findIndex(t => t.id === templeId);
    if (templeIndex === -1) return;

    const temple = archetypeTemples[templeIndex];
    if (!temple || temple.activated) return;

    // Check if consciousness level is sufficient
    const requiredConsciousness = 0.7 + templeIndex * 0.05;
    if (consciousness.awarenessLevel < requiredConsciousness) return;

    setArchetypeTemples(prev =>
      prev.map((t, i) => (i === templeIndex ? { ...t, activated: true } : t))
    );

    onArtifactDiscovered?.({
      type: 'temple-activation',
      temple: temple.name,
      archetype: temple.specificType,
      layer: 3,
      position: temple.position,
      timestamp: Date.now(),
    });
  };

  /**
   * Discover mastery artifact
   */
  const discoverMasteryArtifact = (templeId: string, artifactId: string) => {
    const templeIndex = archetypeTemples.findIndex(t => t.id === templeId);
    if (templeIndex === -1) return;

    const temple = archetypeTemples[templeIndex];
    if (!temple) return;

    const artifactIndex = temple.masteryArtifacts.findIndex(a => a.id === artifactId);
    if (artifactIndex === -1) return;

    const artifact = temple.masteryArtifacts[artifactIndex];
    if (!artifact || artifact.discovered) return;

    // Update temple mastery
    const newMasteryLevel = temple.masteryLevel + artifact.masteryContribution;

    setArchetypeTemples(prev =>
      prev.map((t, i) =>
        i === templeIndex
          ? {
              ...t,
              masteryLevel: newMasteryLevel,
              masteryArtifacts: t.masteryArtifacts.map((a, ai) =>
                ai === artifactIndex ? { ...a, discovered: true } : a
              ),
            }
          : t
      )
    );

    onArchetypeMastered?.(temple.name, newMasteryLevel);

    onArtifactDiscovered?.({
      type: 'mastery-artifact',
      temple: temple.name,
      artifact: artifact.name,
      masteryLevel: newMasteryLevel,
      layer: 3,
      position: temple.position,
      timestamp: Date.now(),
    });
  };

  /**
   * Get temple geometry based on archetype
   */
  const getTempleGeometry = (temple: ArchetypeTemple) => {
    const lodLevel = performanceOptimizer.getLODLevel(
      { position: new Vector3() } as any,
      { position: new Vector3(0, 0, 10) } as any
    );
    const complexity = Math.max(2, Math.floor(lodLevel.fractalDepth * temple.masteryLevel + 1));

    if (temple.archetypeType === 'human-design') {
      return createHumanDesignFractal(
        temple.specificType as string,
        consciousness,
        breath,
        Date.now()
      );
    } else if (temple.archetypeType === 'enneagram') {
      return createEnneagramFractal(temple.specificType as number, consciousness);
    }

    return createFractalIcosahedron(3, consciousness, complexity, 'mandelbrot');
  };

  // Animation loop
  useFrame((state, delta) => {
    if (!isActive || !groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Rotate central mandala
    if (mandalaRef.current) {
      const rotationSpeed = 0.05 + consciousness.awarenessLevel * 0.1;
      mandalaRef.current.rotation.y += delta * rotationSpeed;
      mandalaRef.current.rotation.x += delta * rotationSpeed * 0.3;

      // Breath-synchronized scaling
      const breathScale = 1.0 + Math.sin(breath.intensity * Math.PI) * 0.1 * breath.coherence;
      mandalaRef.current.scale.setScalar(breathScale);
    }

    // Animate temples
    archetypeTemples.forEach((temple, index) => {
      const templeMesh = templesRef.current?.children[index] as Group;
      if (templeMesh) {
        // Rotation based on mastery level
        const rotationSpeed = 0.1 + temple.masteryLevel * 0.3;
        templeMesh.rotation.y += delta * rotationSpeed;

        // Height oscillation based on activation
        if (temple.activated) {
          const heightOffset = Math.sin(time * 2 + index * SACRED_MATHEMATICS.PHI) * 0.5;
          templeMesh.position.y = temple.position.y + heightOffset;
        }

        // Scale based on mastery level
        const masteryScale = 0.8 + temple.masteryLevel * 0.4;
        templeMesh.scale.setScalar(masteryScale);
      }
    });

    // Animate mastery particles
    if (masteryParticles.attributes.position) {
      const positionAttribute = masteryParticles.attributes.position;
      if (!positionAttribute || !positionAttribute.array) return;

      const positions = positionAttribute.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        // Ensure we have valid indices
        if (i + 2 >= positions.length) break;

        const particleIndex = i / 3;

        // Mandala rotation
        const angle = time * 0.1 + particleIndex * 0.01;
        const x = positions[i] || 0;
        const z = positions[i + 2] || 0;
        const currentRadius = Math.sqrt(x * x + z * z);

        positions[i] = Math.cos(angle) * currentRadius;
        positions[i + 2] = Math.sin(angle) * currentRadius;

        // Vertical wave motion
        positions[i + 1] =
          (positions[i + 1] || 0) + Math.sin(time + particleIndex * 0.1) * delta * 0.02;
      }
      positionAttribute.needsUpdate = true;
    }

    // Auto-discover artifacts based on consciousness level
    if (consciousness.awarenessLevel > 0.8 && Math.random() < 0.005) {
      const activeTemples = archetypeTemples.filter(t => t.activated);
      if (activeTemples.length > 0) {
        const randomTemple = activeTemples[Math.floor(Math.random() * activeTemples.length)];
        if (randomTemple) {
          const undiscoveredArtifacts = randomTemple.masteryArtifacts.filter(a => !a.discovered);
          if (undiscoveredArtifacts.length > 0) {
            const randomArtifact =
              undiscoveredArtifacts[Math.floor(Math.random() * undiscoveredArtifacts.length)];
            if (randomArtifact) {
              discoverMasteryArtifact(randomTemple.id, randomArtifact.id);
            }
          }
        }
      }
    }
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Central Mandala */}
      <group ref={mandalaRef}>
        <mesh>
          <primitive object={mandalaGeometry} />
          <primitive
            object={createArchetypalFractalMaterial(
              FractalType.MANDELBROT,
              undefined,
              undefined
            ).getMaterial()}
          />
        </mesh>
      </group>

      {/* Archetype Temples */}
      <group ref={templesRef}>
        {archetypeTemples.map((temple, index) => (
          <group key={temple.id} position={temple.position.toArray()}>
            <mesh onClick={() => activateTemple(temple.id)}>
              <cylinderGeometry args={[4, 4, 6, 8]} />
              <meshBasicMaterial
                color={temple.activated ? 0xffd700 : 0x666666}
                transparent
                opacity={0.3 + temple.masteryLevel * 0.5}
                wireframe
              />
            </mesh>

            {/* Temple core */}
            {temple.activated && (
              <mesh position={[0, 0, 0]}>
                <primitive object={getTempleGeometry(temple)} />
                <primitive
                  object={createArchetypalFractalMaterial(
                    temple.fractalSignature,
                    temple.archetypeType === 'human-design'
                      ? getHumanDesignTypeFromString(temple.specificType as string)
                      : undefined,
                    temple.archetypeType === 'enneagram'
                      ? (temple.specificType as number)
                      : undefined
                  ).getMaterial()}
                />
              </mesh>
            )}

            {/* Mastery level indicator */}
            <mesh position={[0, 4, 0]}>
              <cylinderGeometry args={[0.2, 0.2, temple.masteryLevel * 3, 8]} />
              <meshBasicMaterial
                color={
                  temple.masteryLevel > 0.8
                    ? 0xffffff
                    : temple.masteryLevel > 0.5
                      ? 0xffd700
                      : 0xffaa00
                }
                transparent
                opacity={0.9}
              />
            </mesh>

            {/* Mastery artifacts */}
            {temple.masteryArtifacts.map(
              (artifact, artifactIndex) =>
                artifact.discovered && (
                  <mesh
                    key={artifact.id}
                    position={[
                      Math.cos(
                        (artifactIndex * SACRED_MATHEMATICS.TAU) / temple.masteryArtifacts.length
                      ) * 2,
                      2,
                      Math.sin(
                        (artifactIndex * SACRED_MATHEMATICS.TAU) / temple.masteryArtifacts.length
                      ) * 2,
                    ]}
                  >
                    <sphereGeometry args={[0.2, 8, 8]} />
                    <meshBasicMaterial color={0x00ffff} transparent opacity={0.8} />
                  </mesh>
                )
            )}
          </group>
        ))}
      </group>

      {/* Mastery Particle Field */}
      <points geometry={masteryParticles}>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={0.8 + consciousness.awarenessLevel * 0.2}
          sizeAttenuation
        />
      </points>

      {/* Integration field boundary */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[38, 40, 64]} />
        <meshBasicMaterial
          color={0xffd700}
          transparent
          opacity={0.3 + consciousness.awarenessLevel * 0.4}
          wireframe
        />
      </mesh>

      {/* Mastery lighting */}
      <pointLight
        position={[0, 10, 0]}
        intensity={0.8 + consciousness.awarenessLevel * 0.8}
        color={0xffd700}
        distance={50}
        decay={2}
      />
    </group>
  );
};

export default Layer3Integration;

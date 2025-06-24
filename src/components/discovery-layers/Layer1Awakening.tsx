/**
 * Layer 1: Awakening - Symbol Garden and Compass Plaza
 *
 * Initial exploration layer with sacred symbol discovery
 * Circular geometry with consciousness-responsive symbol garden
 */

'use client';

import {
  createFractalDodecahedron,
  createFractalIcosahedron,
} from '@/generators/sacred-geometry/platonic-solids';
import {
  createArchetypalFractalMaterial,
  FractalType,
} from '@/shaders/fractals/archetypal-fractals';
import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import { BufferAttribute, BufferGeometry, Color, Group, Mesh, Points, Vector3 } from 'three';
import type { DiscoveryProgress } from './DiscoveryLayerSystem';

const { SACRED_MATHEMATICS, DISCOVERY_LAYERS } = CONSCIOUSNESS_CONSTANTS;

interface Layer1AwakeningProps {
  consciousness: ConsciousnessState;
  breath: BreathState;
  progress: DiscoveryProgress;
  onArtifactDiscovered?: (artifact: any) => void;
  onSymbolActivated?: (symbol: string, position: Vector3) => void;
  isActive: boolean;
}

interface SymbolGarden {
  symbols: Array<{
    id: string;
    name: string;
    position: Vector3;
    rotation: Vector3;
    scale: number;
    discovered: boolean;
    activated: boolean;
    fractalType: FractalType;
    resonanceFrequency: number;
  }>;
}

/**
 * Layer 1: Awakening Component
 */
export const Layer1Awakening: React.FC<Layer1AwakeningProps> = ({
  consciousness,
  breath,
  progress,
  onArtifactDiscovered,
  onSymbolActivated,
  isActive,
}) => {
  const groupRef = useRef<Group>(null);
  const compassRef = useRef<Mesh>(null);
  const symbolGardenRef = useRef<Group>(null);

  // Symbol garden state
  const [symbolGarden, setSymbolGarden] = useState<SymbolGarden>({
    symbols: [],
  });

  // Initialize symbol garden
  const initializeSymbolGarden = useMemo(() => {
    const symbols = [
      {
        id: 'pentagram',
        name: 'Pentagram',
        position: new Vector3(8, 0, 8),
        rotation: new Vector3(0, 0, 0),
        scale: 1.0,
        discovered: false,
        activated: false,
        fractalType: FractalType.MANDELBROT,
        resonanceFrequency: 528, // Love frequency
      },
      {
        id: 'vesica-piscis',
        name: 'Vesica Piscis',
        position: new Vector3(-8, 0, 8),
        rotation: new Vector3(0, Math.PI / 4, 0),
        scale: 1.2,
        discovered: false,
        activated: false,
        fractalType: FractalType.JULIA,
        resonanceFrequency: 639, // Connection frequency
      },
      {
        id: 'flower-of-life',
        name: 'Flower of Life',
        position: new Vector3(0, 0, 12),
        rotation: new Vector3(0, 0, 0),
        scale: 1.5,
        discovered: false,
        activated: false,
        fractalType: FractalType.SIERPINSKI,
        resonanceFrequency: 741, // Intuition frequency
      },
      {
        id: 'merkaba',
        name: 'Merkaba',
        position: new Vector3(8, 0, -8),
        rotation: new Vector3(0, Math.PI / 6, 0),
        scale: 1.1,
        discovered: false,
        activated: false,
        fractalType: FractalType.DRAGON,
        resonanceFrequency: 852, // Spiritual order frequency
      },
      {
        id: 'sri-yantra',
        name: 'Sri Yantra',
        position: new Vector3(-8, 0, -8),
        rotation: new Vector3(0, -Math.PI / 4, 0),
        scale: 1.3,
        discovered: false,
        activated: false,
        fractalType: FractalType.MANDELBROT,
        resonanceFrequency: 963, // Divine connection frequency
      },
    ];

    setSymbolGarden({ symbols });
    return symbols;
  }, []);

  // Compass plaza geometry
  const compassGeometry = useMemo(() => {
    const lodLevel = performanceOptimizer.getLODLevel(
      { position: new Vector3() } as any,
      { position: new Vector3(0, 0, 10) } as any
    );
    const complexity = Math.max(2, lodLevel.fractalDepth);

    return createFractalDodecahedron(3, consciousness, complexity, 'mandelbrot');
  }, [consciousness]);

  // Symbol garden particle field
  const gardenParticles = useMemo(() => {
    const particleCount = performanceOptimizer.shouldReduceConsciousnessEffects() ? 200 : 800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Distribute particles in circular garden pattern
      const angle = (i / particleCount) * SACRED_MATHEMATICS.TAU * 3; // Triple spiral
      const radius = Math.sqrt(i / particleCount) * 15;
      const height = Math.sin(angle * 2) * 2 + Math.random() * 1;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Garden colors - greens and golds
      const hue = 0.3 + Math.random() * 0.2; // Green to yellow-green
      const color = new Color().setHSL(hue, 0.7, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    return geometry;
  }, []);

  // Compass plaza rings
  const compassRings = useMemo(() => {
    const rings = [];
    for (let i = 0; i < 4; i++) {
      rings.push({
        innerRadius: 4 + i * 2,
        outerRadius: 4.5 + i * 2,
        segments: 8 + i * 8,
        opacity: 0.3 - i * 0.05,
      });
    }
    return rings;
  }, []);

  /**
   * Check for symbol discovery
   */
  const checkSymbolDiscovery = (cameraPosition: Vector3) => {
    symbolGarden.symbols.forEach((symbol, index) => {
      if (!symbol.discovered) {
        const distance = cameraPosition.distanceTo(symbol.position);

        // Discovery threshold based on consciousness level
        const discoveryRange = 3 + consciousness.awarenessLevel * 2;

        if (distance < discoveryRange) {
          // Discover symbol
          setSymbolGarden(prev => ({
            symbols: prev.symbols.map((s, i) => (i === index ? { ...s, discovered: true } : s)),
          }));

          // Trigger artifact discovery
          onArtifactDiscovered?.({
            type: 'sacred-symbol',
            name: symbol.name,
            layer: 1,
            position: symbol.position,
            resonanceFrequency: symbol.resonanceFrequency,
            timestamp: Date.now(),
          });
        }
      }
    });
  };

  /**
   * Activate symbol through interaction
   */
  const activateSymbol = (symbolId: string, interactionPosition: Vector3) => {
    const symbolIndex = symbolGarden.symbols.findIndex(s => s.id === symbolId);
    if (symbolIndex === -1) return;

    const symbol = symbolGarden.symbols[symbolIndex];
    if (!symbol || !symbol.discovered || symbol.activated) return;

    // Check if interaction is close enough
    const distance = interactionPosition.distanceTo(symbol.position);
    if (distance < 2) {
      setSymbolGarden(prev => ({
        symbols: prev.symbols.map((s, i) => (i === symbolIndex ? { ...s, activated: true } : s)),
      }));

      onSymbolActivated?.(symbol.name, symbol.position);
    }
  };

  // Animation loop
  useFrame((state, delta) => {
    if (!isActive || !groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Rotate compass based on consciousness level
    if (compassRef.current) {
      const rotationSpeed = 0.1 + consciousness.awarenessLevel * 0.2;
      compassRef.current.rotation.y += delta * rotationSpeed;

      // Breath-synchronized vertical movement
      const breathOffset = Math.sin(breath.intensity * Math.PI) * 0.1 * breath.coherence;
      compassRef.current.position.y = breathOffset;
    }

    // Animate symbol garden particles
    if (symbolGardenRef.current) {
      const children = symbolGardenRef.current.children;
      children.forEach((child, index) => {
        if (child instanceof Points && child.geometry.attributes.position) {
          const positionAttribute = child.geometry.attributes.position;
          if (!positionAttribute || !positionAttribute.array) return;

          const positions = positionAttribute.array as Float32Array;

          for (let i = 0; i < positions.length - 2; i += 3) {
            // Ensure we have valid indices
            if (i + 2 >= positions.length) break;

            // Gentle floating motion
            const particleIndex = i / 3;
            const floatOffset = Math.sin(time + particleIndex * 0.1) * 0.02;
            positions[i + 1] = (positions[i + 1] || 0) + floatOffset * delta;

            // Spiral motion around symbols
            const angle = time * 0.1 + particleIndex * 0.01;
            positions[i] = (positions[i] || 0) + Math.cos(angle) * delta * 0.01;
            positions[i + 2] = (positions[i + 2] || 0) + Math.sin(angle) * delta * 0.01;
          }

          positionAttribute.needsUpdate = true;
        }
      });
    }

    // Animate discovered symbols
    symbolGarden.symbols.forEach((symbol, index) => {
      if (symbol.discovered) {
        const symbolMesh = groupRef.current?.children.find(
          child => child.userData.symbolId === symbol.id
        ) as Mesh;

        if (symbolMesh) {
          // Gentle pulsing based on consciousness
          const pulse = 1.0 + Math.sin(time * 2 + index) * 0.1 * consciousness.awarenessLevel;
          symbolMesh.scale.setScalar(symbol.scale * pulse);

          // Rotation based on resonance frequency
          const rotationSpeed = symbol.resonanceFrequency * 0.0001;
          symbolMesh.rotation.y += delta * rotationSpeed;

          if (symbol.activated) {
            // Enhanced glow for activated symbols
            const material = symbolMesh.material as any;
            if (material.uniforms) {
              material.uniforms.consciousness.value = consciousness.awarenessLevel * 1.5;
            }
          }
        }
      }
    });

    // Check for symbol discoveries (would need camera position from parent)
    // checkSymbolDiscovery(state.camera.position);
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Compass Plaza Center */}
      <mesh ref={compassRef} position={[0, 0, 0]}>
        <primitive object={compassGeometry} />
        <primitive object={createArchetypalFractalMaterial(FractalType.MANDELBROT).getMaterial()} />
      </mesh>

      {/* Compass Plaza Rings */}
      {compassRings.map((ring, index) => (
        <mesh key={index} position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring.innerRadius, ring.outerRadius, ring.segments]} />
          <meshBasicMaterial
            color={0x4a9eff}
            transparent
            opacity={ring.opacity * consciousness.awarenessLevel}
            wireframe
          />
        </mesh>
      ))}

      {/* Symbol Garden Particles */}
      <group ref={symbolGardenRef}>
        <points geometry={gardenParticles}>
          <pointsMaterial
            size={0.03}
            vertexColors
            transparent
            opacity={0.6 + consciousness.awarenessLevel * 0.4}
            sizeAttenuation
          />
        </points>
      </group>

      {/* Sacred Symbols */}
      {symbolGarden.symbols.map((symbol, index) => (
        <group key={symbol.id} position={symbol.position.toArray()}>
          {symbol.discovered && (
            <mesh
              userData={{ symbolId: symbol.id }}
              rotation={symbol.rotation.toArray()}
              onClick={e =>
                activateSymbol(symbol.id, new Vector3().setFromMatrixPosition(e.object.matrixWorld))
              }
            >
              {symbol.name === 'pentagram' && <cylinderGeometry args={[1, 1, 0.1, 5]} />}
              {symbol.name === 'vesica-piscis' && (
                <primitive object={createFractalIcosahedron(1, consciousness, 2, 'julia')} />
              )}
              {symbol.name === 'flower-of-life' && (
                <primitive object={createFractalDodecahedron(1, consciousness, 3, 'sierpinski')} />
              )}
              {symbol.name === 'merkaba' && (
                <primitive object={createFractalIcosahedron(1, consciousness, 2, 'dragon')} />
              )}
              {symbol.name === 'sri-yantra' && (
                <primitive object={createFractalDodecahedron(1, consciousness, 4, 'mandelbrot')} />
              )}

              <primitive
                object={createArchetypalFractalMaterial(
                  symbol.fractalType,
                  undefined,
                  undefined
                ).getMaterial()}
              />
            </mesh>
          )}

          {/* Discovery indicator */}
          {!symbol.discovered && consciousness.awarenessLevel > 0.2 && (
            <mesh position={[0, 2, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial
                color={0xffaa00}
                transparent
                opacity={0.5 + Math.sin(Date.now() * 0.005) * 0.3}
              />
            </mesh>
          )}

          {/* Activation glow */}
          {symbol.activated && (
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[2, 16, 16]} />
              <meshBasicMaterial color={0x9966ff} transparent opacity={0.1} wireframe />
            </mesh>
          )}
        </group>
      ))}

      {/* Garden boundary */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[14, 15, 64]} />
        <meshBasicMaterial
          color={0x228833}
          transparent
          opacity={0.3 + consciousness.awarenessLevel * 0.2}
        />
      </mesh>

      {/* Ambient garden lighting */}
      <pointLight
        position={[0, 5, 0]}
        intensity={0.5 + consciousness.awarenessLevel * 0.5}
        color={0x88ff88}
        distance={20}
        decay={2}
      />
    </group>
  );
};

export default Layer1Awakening;

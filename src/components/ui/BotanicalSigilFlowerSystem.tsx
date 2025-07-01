/**
 * Botanical Sigil-Flower System
 *
 * Phase 4.1 - CRITICAL Missing Component
 * Creates botanical sigil-flower system with archetypal hues
 * Integrates sacred geometry with botanical metaphors for consciousness exploration
 */

'use client';

import type { ConsciousnessState } from '@/types';
import { SACRED_MATHEMATICS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface BotanicalSigilFlowerSystemProps {
  position?: [number, number, number];
  size?: number;
  consciousness: ConsciousnessState;
  onSigilCreated?: (sigil: SigilFlower) => void;
  archetypalMode?: boolean;
}

interface SigilFlower {
  id: string;
  position: THREE.Vector3;
  petals: number;
  color: THREE.Color;
  archetype: string;
  consciousness: number;
  geometry: THREE.BufferGeometry;
  bloomPhase: number;
  dataInfusion: DataInfusedPetal[];
  rootSystem: RootVisualization;
  crystallineThoughtform: boolean;
  growthPhase: 'seed' | 'sprout' | 'bloom' | 'crystalline';
}

interface DataInfusedPetal {
  id: string;
  dataType: 'numerology' | 'astrology' | 'consciousness' | 'sacred-geometry';
  value: any;
  color: THREE.Color;
  gemLikeEffect: boolean;
  crystallineIntensity: number;
}

interface RootVisualization {
  depth: number;
  branches: THREE.Vector3[];
  earthToneColors: THREE.Color[];
  subconscious: boolean;
  growthAnimation: number;
}

interface ArchetypalHue {
  name: string;
  color: THREE.Color;
  frequency: number;
  meaning: string;
}

export const BotanicalSigilFlowerSystem: React.FC<BotanicalSigilFlowerSystemProps> = ({
  position = [0, 0, 0],
  size = 3,
  consciousness,
  onSigilCreated,
  archetypalMode = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [sigilFlowers, setSigilFlowers] = useState<SigilFlower[]>([]);
  const [selectedArchetype, setSelectedArchetype] = useState<string>('wisdom');
  // Use passed consciousness prop instead of hook
  const consciousnessLevel = consciousness.awarenessLevel;

  // Archetypal hues based on consciousness frequencies
  const archetypalHues = useMemo<ArchetypalHue[]>(
    () => [
      {
        name: 'wisdom',
        color: new THREE.Color('#4A90E2'),
        frequency: 528,
        meaning: 'Deep knowing and insight',
      },
      {
        name: 'love',
        color: new THREE.Color('#E91E63'),
        frequency: 639,
        meaning: 'Heart connection and compassion',
      },
      {
        name: 'transformation',
        color: new THREE.Color('#9C27B0'),
        frequency: 741,
        meaning: 'Change and evolution',
      },
      {
        name: 'healing',
        color: new THREE.Color('#4CAF50'),
        frequency: 417,
        meaning: 'Restoration and renewal',
      },
      {
        name: 'intuition',
        color: new THREE.Color('#673AB7'),
        frequency: 852,
        meaning: 'Inner guidance and perception',
      },
      {
        name: 'creativity',
        color: new THREE.Color('#FF9800'),
        frequency: 285,
        meaning: 'Expression and innovation',
      },
      {
        name: 'grounding',
        color: new THREE.Color('#795548'),
        frequency: 396,
        meaning: 'Stability and presence',
      },
      {
        name: 'clarity',
        color: new THREE.Color('#00BCD4'),
        frequency: 963,
        meaning: 'Clear vision and understanding',
      },
      // New unique archetypal hues for discovered symbols
      {
        name: 'infinity',
        color: new THREE.Color('#FFD700'),
        frequency: 1111,
        meaning: 'Eternal consciousness flow',
      },
      {
        name: 'spiral',
        color: new THREE.Color('#FF6B6B'),
        frequency: 888,
        meaning: 'Evolutionary growth pattern',
      },
      {
        name: 'pentagram',
        color: new THREE.Color('#4ECDC4'),
        frequency: 777,
        meaning: 'Sacred geometric protection',
      },
      {
        name: 'vesica-piscis',
        color: new THREE.Color('#45B7D1'),
        frequency: 666,
        meaning: 'Divine intersection',
      },
      {
        name: 'flower-of-life',
        color: new THREE.Color('#96CEB4'),
        frequency: 555,
        meaning: 'Universal creation pattern',
      },
      {
        name: 'merkaba',
        color: new THREE.Color('#FFEAA7'),
        frequency: 444,
        meaning: 'Light body activation',
      },
      {
        name: 'torus',
        color: new THREE.Color('#DDA0DD'),
        frequency: 333,
        meaning: 'Energy field dynamics',
      },
      {
        name: 'fibonacci',
        color: new THREE.Color('#98D8C8'),
        frequency: 222,
        meaning: 'Natural growth sequence',
      },
    ],
    []
  );

  // Create botanical sigil geometry
  const createSigilFlowerGeometry = useMemo(() => {
    return (petals: number, archetype: string, consciousness: number): THREE.BufferGeometry => {
      const phi = SACRED_MATHEMATICS.PHI;
      const vertices: number[] = [];
      const indices: number[] = [];

      // Center point
      vertices.push(0, 0, 0);

      // Create petals using golden ratio proportions
      for (let i = 0; i < petals; i++) {
        const angle = (i * Math.PI * 2) / petals;
        const petalAngle = Math.PI / petals;

        // Outer petal points
        for (let j = 0; j <= 10; j++) {
          const t = j / 10;
          const petalRadius = Math.sin(t * Math.PI) * (0.5 + consciousness * 0.3);
          const currentAngle = angle + (t - 0.5) * petalAngle;

          // Apply golden ratio scaling
          const radius = petalRadius * (1 + t / phi);
          const x = Math.cos(currentAngle) * radius;
          const y = Math.sin(currentAngle) * radius;
          const z = Math.sin(t * Math.PI) * 0.1 * consciousness;

          vertices.push(x, y, z);
        }

        // Create triangular faces for each petal
        const centerIndex = 0;
        const petalStartIndex = 1 + i * 11;

        for (let j = 0; j < 10; j++) {
          const current = petalStartIndex + j;
          const next = petalStartIndex + j + 1;

          // Triangle from center to petal edge
          indices.push(centerIndex, current, next);
        }
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      return geometry;
    };
  }, []);

  // Earth tone colors for root system visualization
  const earthToneColors = useMemo(
    () => [
      new THREE.Color('#8B4513'), // Saddle brown
      new THREE.Color('#A0522D'), // Sienna
      new THREE.Color('#CD853F'), // Peru
      new THREE.Color('#D2691E'), // Chocolate
      new THREE.Color('#F4A460'), // Sandy brown
      new THREE.Color('#DEB887'), // Burlywood
      new THREE.Color('#BC8F8F'), // Rosy brown
      new THREE.Color('#696969'), // Dim gray
    ],
    []
  );

  // Generate data-infused petals based on consciousness data
  const generateDataInfusedPetals = (
    archetype: string,
    consciousness: number
  ): DataInfusedPetal[] => {
    const petals: DataInfusedPetal[] = [];
    const dataTypes: DataInfusedPetal['dataType'][] = [
      'numerology',
      'astrology',
      'consciousness',
      'sacred-geometry',
    ];

    dataTypes.forEach((dataType, index) => {
      const crystallineIntensity = consciousness * (0.5 + Math.random() * 0.5);
      const gemLikeEffect = crystallineIntensity > 0.7;

      petals.push({
        id: `petal-${dataType}-${Date.now()}-${index}`,
        dataType,
        value: generateDataValue(dataType, consciousness),
        color:
          archetypalHues.find(h => h.name === archetype)?.color.clone() ||
          new THREE.Color('#4A90E2'),
        gemLikeEffect,
        crystallineIntensity,
      });
    });

    return petals;
  };

  // Generate data value based on type
  const generateDataValue = (dataType: DataInfusedPetal['dataType'], consciousness: number) => {
    switch (dataType) {
      case 'numerology':
        return Math.floor(1 + consciousness * 9); // Life path number 1-9
      case 'astrology':
        return [
          'Aries',
          'Taurus',
          'Gemini',
          'Cancer',
          'Leo',
          'Virgo',
          'Libra',
          'Scorpio',
          'Sagittarius',
          'Capricorn',
          'Aquarius',
          'Pisces',
        ][Math.floor(consciousness * 12)];
      case 'consciousness':
        return consciousness.toFixed(3);
      case 'sacred-geometry':
        return ['Triangle', 'Square', 'Pentagon', 'Hexagon', 'Octagon', 'Circle'][
          Math.floor(consciousness * 6)
        ];
      default:
        return consciousness;
    }
  };

  // Generate root system visualization
  const generateRootSystem = (
    position: THREE.Vector3,
    consciousness: number
  ): RootVisualization => {
    const branches: THREE.Vector3[] = [];
    const branchCount = Math.floor(3 + consciousness * 5); // 3-8 branches

    for (let i = 0; i < branchCount; i++) {
      const angle = (i * Math.PI * 2) / branchCount;
      const depth = 0.5 + consciousness * 1.5; // Root depth
      const x = Math.cos(angle) * (0.3 + Math.random() * 0.4);
      const y = -depth * (0.5 + Math.random() * 0.5);
      const z = Math.sin(angle) * (0.3 + Math.random() * 0.4);

      branches.push(new THREE.Vector3(x, y, z));
    }

    return {
      depth: 0.5 + consciousness * 1.5,
      branches,
      earthToneColors: earthToneColors.slice(0, branchCount),
      subconscious: consciousness > 0.6,
      growthAnimation: 0,
    };
  };

  // Generate sigil flower based on consciousness state with enhanced features
  const generateSigilFlower = (archetype: string, position: THREE.Vector3): SigilFlower => {
    const archetypalHue = archetypalHues.find(h => h.name === archetype) || archetypalHues[0];
    const petals = Math.floor(5 + consciousnessLevel * 8); // 5-13 petals based on consciousness
    const geometry = createSigilFlowerGeometry(petals, archetype, consciousnessLevel);
    const dataInfusion = generateDataInfusedPetals(archetype, consciousnessLevel);
    const rootSystem = generateRootSystem(position, consciousnessLevel);
    const crystallineThoughtform = consciousnessLevel > 0.8;

    // Determine growth phase based on consciousness level
    let growthPhase: SigilFlower['growthPhase'] = 'seed';
    if (consciousnessLevel > 0.25) growthPhase = 'sprout';
    if (consciousnessLevel > 0.5) growthPhase = 'bloom';
    if (consciousnessLevel > 0.8) growthPhase = 'crystalline';

    const sigilFlower: SigilFlower = {
      id: `sigil-${Date.now()}-${Math.random()}`,
      position: position.clone(),
      petals,
      color: archetypalHue.color.clone(),
      archetype,
      consciousness: consciousnessLevel,
      geometry,
      bloomPhase: 0,
      dataInfusion,
      rootSystem,
      crystallineThoughtform,
      growthPhase,
    };

    return sigilFlower;
  };

  // Create sigil flower at position
  const createSigilFlower = (worldPosition: THREE.Vector3) => {
    const newSigil = generateSigilFlower(selectedArchetype, worldPosition);
    setSigilFlowers(prev => [...prev, newSigil]);

    if (onSigilCreated) {
      onSigilCreated(newSigil);
    }
  };

  // Botanical sigil shader material
  const sigilMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        consciousnessLevel: { value: consciousnessLevel },
        archetypalColor: {
          value:
            archetypalHues.find(h => h.name === selectedArchetype)?.color ||
            new THREE.Color('#4A90E2'),
        },
        bloomPhase: { value: 0 },
      },
      vertexShader: `
        uniform float time;
        uniform float consciousnessLevel;
        uniform float bloomPhase;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vBloomIntensity;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Calculate bloom intensity
          vBloomIntensity = bloomPhase * consciousnessLevel;
          
          // Botanical growth transformation
          vec3 pos = position;
          
          // Petal unfurling effect
          float petalUnfurl = sin(bloomPhase * 3.14159) * consciousnessLevel;
          pos *= 1.0 + petalUnfurl * 0.5;
          
          // Gentle swaying motion
          pos.x += sin(time * 2.0 + pos.y * 3.0) * 0.05 * consciousnessLevel;
          pos.y += cos(time * 1.5 + pos.x * 2.0) * 0.03 * consciousnessLevel;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 archetypalColor;
        uniform float consciousnessLevel;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vBloomIntensity;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Create petal pattern
          float angle = atan(vUv.y - center.y, vUv.x - center.x);
          float petalPattern = sin(angle * 5.0 + time) * 0.5 + 0.5;
          
          // Botanical texture
          float botanicalNoise = sin(dist * 20.0 + time * 2.0) * 0.1 + 0.9;
          
          // Color based on archetype and consciousness
          vec3 color = archetypalColor;
          color = mix(color, vec3(1.0, 1.0, 1.0), vBloomIntensity * 0.3);
          color *= petalPattern * botanicalNoise;
          
          // Add consciousness glow
          float glow = 1.0 - smoothstep(0.0, 0.8, dist);
          color += glow * archetypalColor * consciousnessLevel * 0.5;
          
          // Transparency based on distance from center
          float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
          alpha *= 0.8 + vBloomIntensity * 0.2;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [selectedArchetype, consciousnessLevel, archetypalHues]);

  // Enhanced animation loop with growth-from-subconscious-soil system
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Update shader uniforms
    sigilMaterial.uniforms.time.value = time;
    sigilMaterial.uniforms.consciousnessLevel.value = consciousnessLevel;

    // Update sigil flowers with enhanced growth animation
    setSigilFlowers(prev =>
      prev.map(sigil => {
        // Growth phase progression
        let newGrowthPhase = sigil.growthPhase;
        const growthProgress = sigil.bloomPhase;

        if (growthProgress > 0.2 && newGrowthPhase === 'seed') newGrowthPhase = 'sprout';
        if (growthProgress > 0.5 && newGrowthPhase === 'sprout') newGrowthPhase = 'bloom';
        if (growthProgress > 0.8 && newGrowthPhase === 'bloom' && sigil.crystallineThoughtform) {
          newGrowthPhase = 'crystalline';
        }

        // Root system growth animation
        const updatedRootSystem = {
          ...sigil.rootSystem,
          growthAnimation: Math.min(sigil.rootSystem.growthAnimation + delta * 0.3, 1.0),
        };

        // Subconscious soil emergence animation
        const subconscious = sigil.rootSystem.subconscious && growthProgress > 0.3;

        return {
          ...sigil,
          bloomPhase: Math.min(sigil.bloomPhase + delta * 0.5, 1.0),
          growthPhase: newGrowthPhase,
          rootSystem: {
            ...updatedRootSystem,
            subconscious,
          },
          // Data infusion crystallization
          dataInfusion: sigil.dataInfusion.map(petal => ({
            ...petal,
            crystallineIntensity: Math.min(
              petal.crystallineIntensity + delta * 0.2 * consciousnessLevel,
              1.0
            ),
            gemLikeEffect: petal.crystallineIntensity > 0.7 || newGrowthPhase === 'crystalline',
          })),
        };
      })
    );

    // Animate group with consciousness-responsive rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1 * consciousnessLevel;

      // Subtle breathing motion for the entire garden
      const breathingScale = 1.0 + Math.sin(time * 2.0) * 0.02 * consciousnessLevel;
      groupRef.current.scale.setScalar(breathingScale);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Archetypal Hue Selector */}
      <group position={[-size * 0.8, size * 0.6, 0]}>
        {archetypalHues.map((hue, index) => {
          const angle = (index * Math.PI * 2) / archetypalHues.length;
          const radius = 0.3;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isSelected = hue.name === selectedArchetype;

          return (
            <mesh
              key={hue.name}
              position={[x, y, 0]}
              onClick={() => setSelectedArchetype(hue.name)}
              scale={isSelected ? [1.2, 1.2, 1.2] : [1, 1, 1]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color={hue.color} transparent opacity={isSelected ? 1.0 : 0.6} />
            </mesh>
          );
        })}
      </group>

      {/* Enhanced Sigil Flowers with Data Infusion and Root Systems */}
      {sigilFlowers.map(sigil => (
        <group key={sigil.id} position={sigil.position.toArray()}>
          {/* Root System Visualization */}
          {sigil.rootSystem.branches.map((branch, branchIndex) => (
            <group key={`root-${branchIndex}`}>
              {/* Root branch */}
              <mesh position={branch.toArray()}>
                <cylinderGeometry args={[0.01, 0.02, branch.length(), 6]} />
                <meshBasicMaterial
                  color={sigil.rootSystem.earthToneColors[branchIndex] || earthToneColors[0]}
                  transparent
                  opacity={0.7}
                />
              </mesh>

              {/* Subconscious soil particles */}
              {sigil.rootSystem.subconscious &&
                Array.from({ length: 3 }, (_, particleIndex) => {
                  const offset = new THREE.Vector3(
                    (Math.random() - 0.5) * 0.2,
                    (Math.random() - 0.5) * 0.1,
                    (Math.random() - 0.5) * 0.2
                  );

                  return (
                    <mesh
                      key={`soil-${particleIndex}`}
                      position={branch.clone().add(offset).toArray()}
                    >
                      <sphereGeometry args={[0.005, 4, 4]} />
                      <meshBasicMaterial
                        color={earthToneColors[particleIndex % earthToneColors.length]}
                        transparent
                        opacity={0.5}
                      />
                    </mesh>
                  );
                })}
            </group>
          ))}

          {/* Main Flower */}
          <mesh geometry={sigil.geometry}>
            <primitive object={sigilMaterial.clone()} />
          </mesh>

          {/* Data-Infused Petals with Gem-like Effects */}
          {sigil.dataInfusion.map((petal, petalIndex) => {
            const angle = (petalIndex * Math.PI * 2) / sigil.dataInfusion.length;
            const radius = 0.4 + sigil.bloomPhase * 0.2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = 0.05;

            return (
              <group key={petal.id} position={[x, y, z]}>
                {/* Gem-like petal effect for crystalline thoughtforms */}
                {petal.gemLikeEffect && (
                  <mesh>
                    <octahedronGeometry args={[0.03, 0]} />
                    <meshPhysicalMaterial
                      color={petal.color}
                      metalness={0.1}
                      roughness={0.1}
                      transmission={0.9}
                      thickness={0.5}
                      transparent
                      opacity={0.8}
                    />
                  </mesh>
                )}

                {/* Data visualization particle */}
                <mesh>
                  <sphereGeometry args={[0.015, 8, 8]} />
                  <meshBasicMaterial
                    color={petal.color}
                    transparent
                    opacity={0.7 + petal.crystallineIntensity * 0.3}
                  />
                </mesh>

                {/* Data type indicator */}
                <mesh position={[0, 0.05, 0]}>
                  <planeGeometry args={[0.02, 0.01]} />
                  <meshBasicMaterial color={petal.color} transparent opacity={0.6} />
                </mesh>
              </group>
            );
          })}

          {/* Growth Phase Indicators */}
          {sigil.growthPhase === 'crystalline' && (
            <group>
              {/* Crystalline aura */}
              <mesh>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshBasicMaterial color={sigil.color} transparent opacity={0.1} wireframe />
              </mesh>

              {/* Crystalline particles */}
              {Array.from({ length: 12 }, (_, i) => {
                const angle = (i * Math.PI * 2) / 12;
                const radius = 0.9;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                const z = Math.sin(angle * 3) * 0.2;

                return (
                  <mesh key={`crystal-${i}`} position={[x, y, z]}>
                    <octahedronGeometry args={[0.02, 0]} />
                    <meshPhysicalMaterial
                      color={sigil.color}
                      metalness={0.2}
                      roughness={0.1}
                      transmission={0.8}
                      transparent
                      opacity={0.9}
                    />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* Consciousness particles around flower */}
          {Array.from({ length: sigil.petals }, (_, i) => {
            const angle = (i * Math.PI * 2) / sigil.petals;
            const radius = 0.6 + sigil.bloomPhase * 0.3;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = Math.sin(angle * 3) * 0.1;

            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.01, 4, 4]} />
                <meshBasicMaterial
                  color={sigil.color}
                  transparent
                  opacity={0.6 + Math.sin(Date.now() * 0.001 + i) * 0.3}
                />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Garden bed */}
      <mesh position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[size, 32]} />
        <meshBasicMaterial color='#2E7D32' transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Interactive creation area */}
      <mesh
        position={[0, 0, 0.01]}
        onClick={event => {
          const worldPosition = new THREE.Vector3();
          worldPosition.setFromMatrixPosition(event.object.matrixWorld);
          createSigilFlower(worldPosition);
        }}
      >
        <planeGeometry args={[size * 2, size * 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Archetypal frequency indicators */}
      <group position={[size * 0.8, 0, 0]}>
        {archetypalHues.map((hue, index) => (
          <mesh key={hue.name} position={[0, index * 0.2 - archetypalHues.length * 0.1, 0]}>
            <boxGeometry args={[0.02, 0.02, hue.frequency / 1000]} />
            <meshBasicMaterial color={hue.color} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default BotanicalSigilFlowerSystem;

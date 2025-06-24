/**
 * Sacred Geometry Engine 3D Visualization Component
 *
 * Interactive fractal pattern exploration with infinite zoom
 * Displays sacred geometric patterns as consciousness-responsive 3D structures
 */

'use client';

import { createFractalGeometry } from '@/generators/fractal-noise';
import { createPlatonicSolid, generateSacredGeometry } from '@/generators/sacred-geometry';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { PersonalData } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import { Color, Euler, Group, Vector3 } from 'three';

interface SacredGeometryEngineProps {
  personalData: PersonalData;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onCalculationComplete?: (result: any) => void;
}

interface SacredPattern {
  name: string;
  geometry: any;
  position: Vector3;
  rotation: Euler;
  scale: number;
  color: Color;
  significance: string;
  frequency: number;
}

interface GeometricHarmonic {
  ratio: number;
  frequency: number;
  color: Color;
  amplitude: number;
}

const SACRED_PATTERNS = [
  'flower_of_life',
  'metatrons_cube',
  'sri_yantra',
  'vesica_piscis',
  'golden_spiral',
  'platonic_solids',
  'merkaba',
  'torus',
  'seed_of_life',
];

const PLATONIC_SOLIDS = [
  { name: 'tetrahedron', element: 'fire', color: new Color('#FF4500') },
  { name: 'cube', element: 'earth', color: new Color('#8B4513') },
  { name: 'octahedron', element: 'air', color: new Color('#87CEEB') },
  { name: 'dodecahedron', element: 'ether', color: new Color('#9370DB') },
  { name: 'icosahedron', element: 'water', color: new Color('#4169E1') },
];

const GOLDEN_RATIO = 1.618033988749;

export const SacredGeometryEngine: React.FC<SacredGeometryEngineProps> = ({
  personalData,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  onCalculationComplete,
}) => {
  const groupRef = useRef<Group>(null);
  const { calculateSacredGeometry, state } = useWitnessOSAPI();
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Calculate Sacred Geometry patterns
  useEffect(() => {
    if (personalData && visible) {
      calculateSacredGeometry({
        name: personalData.name,
        birth_date: personalData.birthDate,
        include_numerology: true,
        include_harmonics: true,
        pattern_types: SACRED_PATTERNS,
        consciousness_level: consciousnessLevel,
      })
        .then(result => {
          if (result.success && onCalculationComplete) {
            onCalculationComplete(result.data);
          }
        })
        .catch(console.error);
    }
  }, [personalData, visible, calculateSacredGeometry, onCalculationComplete, consciousnessLevel]);

  // Generate sacred patterns based on personal data
  const { patterns, harmonics, centerGeometry } = useMemo(() => {
    if (!state.data) {
      return { patterns: [], harmonics: [], centerGeometry: null };
    }

    const geometryData = state.data as any; // Type assertion for engine-specific data

    // Create sacred patterns
    const patternList: SacredPattern[] = [];

    // Flower of Life
    const flowerGeometry = generateSacredGeometry({
      type: 'flower_of_life',
      radius: 1,
      petals: 19,
      layers: 3,
    });
    patternList.push({
      name: 'Flower of Life',
      geometry: flowerGeometry,
      position: new Vector3(0, 0, 0),
      rotation: new Euler(0, 0, 0),
      scale: 1,
      color: new Color('#FFD700'),
      significance: 'Universal creation pattern',
      frequency: 528, // Love frequency
    });

    // Metatron's Cube
    const metatronGeometry = generateSacredGeometry({
      type: 'metatrons_cube',
      radius: 1.5,
      complexity: 3,
    });
    patternList.push({
      name: "Metatron's Cube",
      geometry: metatronGeometry,
      position: new Vector3(0, 0, 0.5),
      rotation: new Euler(0, 0, Math.PI / 6),
      scale: 0.8,
      color: new Color('#9370DB'),
      significance: 'Archangelic blueprint',
      frequency: 741, // Consciousness expansion
    });

    // Sri Yantra
    const sriYantraGeometry = generateSacredGeometry({
      type: 'sri_yantra',
      triangles: 9,
      radius: 1.2,
    });
    patternList.push({
      name: 'Sri Yantra',
      geometry: sriYantraGeometry,
      position: new Vector3(0, 0, -0.5),
      rotation: new Euler(0, 0, 0),
      scale: 0.9,
      color: new Color('#FF6B6B'),
      significance: 'Divine feminine geometry',
      frequency: 432, // Natural harmony
    });

    // Platonic Solids arrangement
    PLATONIC_SOLIDS.forEach((solid, index) => {
      const angle = (index / PLATONIC_SOLIDS.length) * Math.PI * 2;
      const radius = 2.5;
      const solidGeometry = createPlatonicSolid(solid.name, 0.3);

      patternList.push({
        name: solid.name,
        geometry: solidGeometry,
        position: new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
        rotation: new Euler(0, 0, 0),
        scale: 0.5,
        color: solid.color,
        significance: `${solid.element} element`,
        frequency: 396 + index * 111, // Solfeggio progression
      });
    });

    // Generate harmonics based on personal data
    const harmonicList: GeometricHarmonic[] = [];
    if (geometryData?.harmonics) {
      geometryData.harmonics.forEach((harmonic: any, index: number) => {
        harmonicList.push({
          ratio: harmonic.ratio || GOLDEN_RATIO,
          frequency: harmonic.frequency || 528,
          color: new Color().setHSL((index * 0.618) % 1, 0.7, 0.6),
          amplitude: harmonic.amplitude || 1,
        });
      });
    }

    // Create center fractal geometry
    const centerFractal = createFractalGeometry({
      type: 'mandala',
      iterations: 5,
      scale: 0.8,
      complexity: Math.floor(consciousnessLevel * 8) + 1,
      seed: personalData.name?.charCodeAt(0) || 42,
    });

    return { patterns: patternList, harmonics: harmonicList, centerGeometry: centerFractal };
  }, [state.data, consciousnessLevel, personalData.name]);

  // Animate sacred geometry patterns
  useFrame((state, delta) => {
    if (groupRef.current && visible) {
      const time = state.clock.elapsedTime;

      // Rotate entire group based on golden ratio
      groupRef.current.rotation.y += delta * 0.01 * GOLDEN_RATIO * consciousnessLevel;

      // Breath synchronization
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.05;
      groupRef.current.scale.setScalar(scale * breathScale);

      // Animate individual patterns
      groupRef.current.children.forEach((child, index) => {
        if (child.userData.pattern) {
          const pattern = child.userData.pattern as SacredPattern;

          // Rotate based on pattern frequency
          child.rotation.z += delta * (pattern.frequency / 1000) * consciousnessLevel;

          // Harmonic scaling
          const harmonicScale = 1 + Math.sin((time * pattern.frequency) / 100) * 0.1;
          child.scale.setScalar(pattern.scale * harmonicScale);

          // Consciousness-responsive glow
          if ('material' in child && child.material) {
            const material = child.material as any;
            if (material.emissiveIntensity !== undefined) {
              material.emissiveIntensity = 0.1 + consciousnessLevel * 0.3;
            }
          }
        }
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Sacred Patterns */}
      {patterns.map((pattern, index) => (
        <mesh
          key={pattern.name}
          geometry={pattern.geometry}
          position={pattern.position.toArray()}
          rotation={pattern.rotation.toArray()}
          scale={pattern.scale}
          userData={{ pattern }}
        >
          <meshStandardMaterial
            color={pattern.color}
            transparent
            opacity={0.7}
            emissive={pattern.color}
            emissiveIntensity={0.1}
            wireframe={index % 2 === 0}
          />
        </mesh>
      ))}

      {/* Center Fractal Mandala */}
      {centerGeometry && (
        <mesh geometry={centerGeometry}>
          <meshStandardMaterial
            color='#ffffff'
            transparent
            opacity={0.8}
            emissive='#ffffff'
            emissiveIntensity={consciousnessLevel * 0.2}
            wireframe
          />
        </mesh>
      )}

      {/* Harmonic Resonance Rings */}
      {harmonics.map((harmonic, index) => (
        <mesh key={`harmonic-${index}`} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry
            args={[harmonic.ratio * (index + 1) * 0.5, harmonic.ratio * (index + 1) * 0.5 + 0.05, 32]}
          />
          <meshBasicMaterial color={harmonic.color} transparent opacity={0.3 + harmonic.amplitude * 0.2} />
        </mesh>
      ))}

      {/* Golden Ratio Spiral */}
      <group>
        {Array.from({ length: 8 }, (_, i) => {
          const radius = Math.pow(GOLDEN_RATIO, i) * 0.1;
          const angle = i * Math.PI * 0.618;
          return (
            <mesh
              key={`spiral-${i}`}
              position={[Math.cos(angle) * radius, Math.sin(angle) * radius, i * 0.1]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color='#FFD700' emissive='#FFD700' emissiveIntensity={0.2} />
            </mesh>
          );
        })}
      </group>

      {/* Consciousness Field Visualization */}
      <mesh>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.02 + consciousnessLevel * 0.03} wireframe />
      </mesh>

      {/* Loading indicator */}
      {state.loading && (
        <mesh>
          <torusGeometry args={[2, 0.1, 8, 32]} />
          <meshBasicMaterial color='#FFD700' transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default SacredGeometryEngine;

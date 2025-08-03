/**
 * Enneagram Engine 3D Visualization Component
 *
 * 9-point personality space with center-specific fractal patterns
 * Displays Enneagram type as interactive 3D personality constellation
 */

'use client';

import { createFractalGeometry } from '@/generators/fractal-noise';
import { generateSacredGeometry } from '@/generators/sacred-geometry';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useConsciousnessEngineAutoSave } from '@/hooks/useConsciousnessEngineAutoSave';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { PersonalData } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Color, Group, Vector3 } from 'three';

interface EnneagramEngineProps {
  personalData: PersonalData;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onCalculationComplete?: (result: unknown) => void;
}

interface EnneagramType {
  number: number;
  name: string;
  center: 'body' | 'heart' | 'head';
  position: Vector3;
  color: Color;
  wing1?: number;
  wing2?: number;
  arrow: number;
  stress: number;
  security: number;
  strength: number;
}

interface EnneagramCenter {
  name: 'body' | 'heart' | 'head';
  types: number[];
  color: Color;
  position: Vector3;
  element: string;
}

const ENNEAGRAM_TYPES: Omit<EnneagramType, 'strength'>[] = [
  {
    number: 1,
    name: 'Perfectionist',
    center: 'body',
    position: new Vector3(0, 2, 0),
    color: new Color('#FF4444'),
    wing1: 9,
    wing2: 2,
    arrow: 7,
    stress: 4,
    security: 7,
  },
  {
    number: 2,
    name: 'Helper',
    center: 'heart',
    position: new Vector3(1.5, 1, 0),
    color: new Color('#FF8844'),
    wing1: 1,
    wing2: 3,
    arrow: 8,
    stress: 8,
    security: 4,
  },
  {
    number: 3,
    name: 'Achiever',
    center: 'heart',
    position: new Vector3(2, 0, 0),
    color: new Color('#FFAA44'),
    wing1: 2,
    wing2: 4,
    arrow: 9,
    stress: 9,
    security: 6,
  },
  {
    number: 4,
    name: 'Individualist',
    center: 'heart',
    position: new Vector3(1.5, -1, 0),
    color: new Color('#FFDD44'),
    wing1: 3,
    wing2: 5,
    arrow: 1,
    stress: 2,
    security: 1,
  },
  {
    number: 5,
    name: 'Investigator',
    center: 'head',
    position: new Vector3(0, -2, 0),
    color: new Color('#AAFF44'),
    wing1: 4,
    wing2: 6,
    arrow: 8,
    stress: 7,
    security: 8,
  },
  {
    number: 6,
    name: 'Loyalist',
    center: 'head',
    position: new Vector3(-1.5, -1, 0),
    color: new Color('#44FF44'),
    wing1: 5,
    wing2: 7,
    arrow: 9,
    stress: 3,
    security: 9,
  },
  {
    number: 7,
    name: 'Enthusiast',
    center: 'head',
    position: new Vector3(-2, 0, 0),
    color: new Color('#44FFAA'),
    wing1: 6,
    wing2: 8,
    arrow: 5,
    stress: 1,
    security: 5,
  },
  {
    number: 8,
    name: 'Challenger',
    center: 'body',
    position: new Vector3(-1.5, 1, 0),
    color: new Color('#44AAFF'),
    wing1: 7,
    wing2: 9,
    arrow: 2,
    stress: 5,
    security: 2,
  },
  {
    number: 9,
    name: 'Peacemaker',
    center: 'body',
    position: new Vector3(0, 2, 0),
    color: new Color('#4444FF'),
    wing1: 8,
    wing2: 1,
    arrow: 3,
    stress: 6,
    security: 3,
  },
];

const ENNEAGRAM_CENTERS: EnneagramCenter[] = [
  {
    name: 'body',
    types: [1, 8, 9],
    color: new Color('#FF6B6B'),
    position: new Vector3(0, 1, 0),
    element: 'earth',
  },
  {
    name: 'heart',
    types: [2, 3, 4],
    color: new Color('#4ECDC4'),
    position: new Vector3(1.5, -0.5, 0),
    element: 'water',
  },
  {
    name: 'head',
    types: [5, 6, 7],
    color: new Color('#45B7D1'),
    position: new Vector3(-1.5, -0.5, 0),
    element: 'air',
  },
];

export const EnneagramEngine: React.FC<EnneagramEngineProps> = ({
  personalData,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  onCalculationComplete,
}) => {
  const groupRef = useRef<Group>(null);
  const { calculateEnneagram, state } = useWitnessOSAPI();
  const { breathPhase, consciousnessLevel } = useConsciousness();
  
  // Auto-save hook for consciousness readings
  const { saveEngineResult, isAutoSaving, autoSaveCount } = useConsciousnessEngineAutoSave();

  // Calculate Enneagram profile
  useEffect(() => {
    if (personalData && visible) {
      const enneagramInput = {
        name: personalData.name,
        birth_date: personalData.birthDate,
        include_wings: true,
        include_instincts: true,
        include_centers: true,
        include_arrows: true,
      };
      
      calculateEnneagram(enneagramInput)
        .then(result => {
          if (result.success) {
            // Auto-save the reading
            saveEngineResult(
              'enneagram',
              result.data,
              enneagramInput,
              {
                personalData,
                includeWings: true,
                includeInstincts: true,
                includeCenters: true,
                includeArrows: true,
                consciousnessLevel,
              }
            );
            
            if (onCalculationComplete) {
              onCalculationComplete(result.data);
            }
          }
        })
        .catch(console.error);
    }
  }, [personalData, visible, calculateEnneagram, onCalculationComplete, consciousnessLevel, saveEngineResult]);

  // Process Enneagram data into 3D personality space
  const { primaryType, wings, arrows, typeStrengths, centerGeometries } = useMemo(() => {
    if (!state.data) {
      return {
        primaryType: null,
        wings: [],
        arrows: [],
        typeStrengths: new Map(),
        centerGeometries: [],
      };
    }

    const enneagramData = state.data as Record<string, unknown>; // Type assertion for engine-specific data

    // Find primary type
    const primaryTypeNum = enneagramData?.primary_type || 1;
    const primary = ENNEAGRAM_TYPES.find(t => t.number === primaryTypeNum);

    // Calculate type strengths from scores
    const strengths = new Map<number, number>();
    if (enneagramData?.type_scores) {
      Object.entries(enneagramData.type_scores as Record<string, number>).forEach(([type, score]) => {
        strengths.set(parseInt(type), score);
      });
    }

    // Add strength to primary type
    const primaryWithStrength: EnneagramType | null = primary
      ? {
          ...primary,
          strength: strengths.get(primary.number) || 1.0,
        }
      : null;

    // Calculate wings
    const wingTypes: EnneagramType[] = [];
    if (primary && enneagramData?.wings && Array.isArray(enneagramData.wings)) {
      enneagramData.wings.forEach((wingNum: number) => {
        const wingType = ENNEAGRAM_TYPES.find(t => t.number === wingNum);
        if (wingType) {
          wingTypes.push({
            ...wingType,
            strength: strengths.get(wingType.number) || 0.5,
          });
        }
      });
    }

    // Calculate arrows (integration/disintegration)
    const arrowTypes: Array<{ type: EnneagramType; direction: 'integration' | 'disintegration' }> = [];
    if (primary) {
      const integrationNum = primary.security;
      const disintegrationNum = primary.stress;

      const integrationType = ENNEAGRAM_TYPES.find(t => t.number === integrationNum);
      const disintegrationType = ENNEAGRAM_TYPES.find(t => t.number === disintegrationNum);

      if (integrationType) {
        arrowTypes.push({
          type: { ...integrationType, strength: consciousnessLevel },
          direction: 'integration',
        });
      }

      if (disintegrationType) {
        arrowTypes.push({
          type: { ...disintegrationType, strength: 1 - consciousnessLevel },
          direction: 'disintegration',
        });
      }
    }

    // Generate center geometries
    const centerGeos = ENNEAGRAM_CENTERS.map(center => {
      return generateSacredGeometry({
        type: center.element === 'earth' ? 'cube' : center.element === 'water' ? 'icosahedron' : 'octahedron',
        radius: 0.5,
        complexity: center.types.length,
      });
    });

    return {
      primaryType: primaryWithStrength,
      wings: wingTypes,
      arrows: arrowTypes,
      typeStrengths: strengths,
      centerGeometries: centerGeos,
    };
  }, [state.data, consciousnessLevel]);

  // Generate fractal patterns for each type
  const typeFractals = useMemo(() => {
    const fractals = new Map<number, THREE.BufferGeometry>();

    ENNEAGRAM_TYPES.forEach(type => {
      const strength = typeStrengths.get(type.number) || 0.1;
      if (strength > 0.2) {
        // Only generate fractals for significant types
        const fractal = createFractalGeometry({
          type: type.center === 'body' ? 'mandelbrot' : type.center === 'heart' ? 'julia' : 'sierpinski',
          iterations: Math.floor(strength * 5) + 2,
          scale: 0.3,
          complexity: type.number,
          seed: type.name.charCodeAt(0),
        });
        fractals.set(type.number, fractal);
      }
    });

    return fractals;
  }, [typeStrengths]);

  // Animate the Enneagram
  useFrame((state, delta) => {
    if (groupRef.current && visible) {
      const time = state.clock.elapsedTime;

      // Rotate the entire enneagram slowly
      groupRef.current.rotation.y += delta * 0.03 * consciousnessLevel;

      // Breath synchronization
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.04;
      groupRef.current.scale.setScalar(scale * breathScale);

      // Animate type nodes
      groupRef.current.children.forEach(child => {
        if (child.userData.enneagramType) {
          const type = child.userData.enneagramType as EnneagramType;

          // Pulse based on type strength
          const pulse = 1 + Math.sin(time * type.strength * 2) * 0.1;
          child.scale.setScalar(pulse);

          // Consciousness-responsive glow
          if ('material' in child && child.material) {
            const material = child.material as THREE.MeshStandardMaterial;
            if (material.emissiveIntensity !== undefined) {
              material.emissiveIntensity = 0.1 + type.strength * consciousnessLevel * 0.3;
            }
          }
        }
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Enneagram Circle */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 3.0, 64]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.2} />
      </mesh>

      {/* All Nine Types */}
      {ENNEAGRAM_TYPES.map(type => {
        const strength = typeStrengths.get(type.number) || 0.1;
        const isPrimary = primaryType?.number === type.number;
        const isWing = wings.some(w => w.number === type.number);
        // const isArrow = arrows.some(a => a.type.number === type.number);

        return (
          <group
            key={type.number}
            position={type.position.toArray()}
            userData={{ enneagramType: { ...type, strength } }}
          >
            {/* Type sphere */}
            <mesh>
              <sphereGeometry args={[isPrimary ? 0.25 : isWing ? 0.15 : 0.1, 16, 16]} />
              <meshStandardMaterial
                color={type.color}
                emissive={type.color}
                emissiveIntensity={isPrimary ? 0.3 : isWing ? 0.2 : 0.1}
                transparent
                opacity={isPrimary ? 1.0 : isWing ? 0.8 : 0.5}
              />
            </mesh>

            {/* Type number */}
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[0.1, 0.1, 0.1]} />
              <meshStandardMaterial color={type.color} />
            </mesh>

            {/* Fractal pattern for significant types */}
            {typeFractals.has(type.number) && typeFractals.get(type.number) && (
              <mesh geometry={typeFractals.get(type.number)!} scale={[0.5, 0.5, 0.5]}>
                <meshStandardMaterial color={type.color} transparent opacity={0.4} wireframe />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Center Triangles */}
      {ENNEAGRAM_CENTERS.map((center, index) => (
        <group key={center.name} position={center.position.toArray()}>
          {/* Center geometry */}
          <mesh geometry={centerGeometries[index]}>
            <meshStandardMaterial color={center.color} transparent opacity={0.3} wireframe />
          </mesh>

          {/* Center indicator */}
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={center.color} emissive={center.color} emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}

      {/* Wing Connections */}
      {primaryType &&
        wings.map(wing => {
          const direction = wing.position.clone().sub(primaryType.position);
          const length = direction.length();
          const midpoint = primaryType.position.clone().add(direction.clone().multiplyScalar(0.5));

          return (
            <mesh key={`wing-${wing.number}`} position={midpoint.toArray()} scale={[length, 0.02, 0.02]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color={wing.color} transparent opacity={0.6} />
            </mesh>
          );
        })}

      {/* Arrow Connections */}
      {primaryType &&
        arrows.map(arrow => {
          const direction = arrow.type.position.clone().sub(primaryType.position);
          const length = direction.length();
          const midpoint = primaryType.position.clone().add(direction.clone().multiplyScalar(0.5));

          return (
            <group key={`arrow-${arrow.type.number}`}>
              {/* Arrow line */}
              <mesh position={midpoint.toArray()} scale={[length, 0.03, 0.03]}>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial
                  color={arrow.direction === 'integration' ? '#00FF00' : '#FF0000'}
                  transparent
                  opacity={0.7}
                />
              </mesh>

              {/* Arrow head */}
              <mesh position={arrow.type.position.toArray()}>
                <coneGeometry args={[0.05, 0.1, 4]} />
                <meshStandardMaterial color={arrow.direction === 'integration' ? '#00FF00' : '#FF0000'} />
              </mesh>
            </group>
          );
        })}

      {/* Inner Triangle (3-6-9) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.4, 1.45, 3]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.1} />
      </mesh>

      {/* Loading indicator */}
      {state.loading && (
        <mesh>
          <torusGeometry args={[2.5, 0.1, 8, 32]} />
          <meshBasicMaterial color='#4ECDC4' transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default EnneagramEngine;

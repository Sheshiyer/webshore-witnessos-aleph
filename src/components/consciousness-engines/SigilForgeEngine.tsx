/**
 * Sigil Forge Engine 3D Visualization Component
 *
 * Symbol creation using minimal GLSL fractal generation
 * Displays personalized sigils as interactive 3D consciousness symbols
 */

'use client';

import { createFractalGeometry } from '@/generators/fractal-noise';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useConsciousnessEngineAutoSave } from '@/hooks/useConsciousnessEngineAutoSave';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { QuestionInput } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import { BufferGeometry, Color, Float32BufferAttribute, Group, Vector3 } from 'three';

interface SigilForgeEngineProps {
  intention: QuestionInput;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onCalculationComplete?: (result: any) => void;
}

interface SigilElement {
  type: 'line' | 'curve' | 'circle' | 'triangle' | 'spiral';
  points: Vector3[];
  color: Color;
  thickness: number;
  energy: number;
  frequency: number;
}

interface SigilLayer {
  name: string;
  elements: SigilElement[];
  opacity: number;
  rotation: number;
  scale: number;
}

const SIGIL_COLORS = [
  new Color('#FF6B6B'), // Passion/Desire
  new Color('#4ECDC4'), // Healing/Peace
  new Color('#45B7D1'), // Wisdom/Knowledge
  new Color('#96CEB4'), // Growth/Abundance
  new Color('#FFEAA7'), // Joy/Creativity
  new Color('#DDA0DD'), // Spirituality/Intuition
  new Color('#F7DC6F'), // Success/Achievement
  new Color('#85C1E9'), // Communication/Expression
];

export const SigilForgeEngine: React.FC<SigilForgeEngineProps> = ({
  intention,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  onCalculationComplete,
}) => {
  const groupRef = useRef<Group>(null);
  const { calculateSigilForge, state } = useWitnessOSAPI();
  const { breathPhase, consciousnessLevel } = useConsciousness();
  
  // Auto-save hook for consciousness readings
  const { saveEngineResult, isAutoSaving, autoSaveCount } = useConsciousnessEngineAutoSave();

  // Calculate Sigil design
  useEffect(() => {
    if (intention && visible) {
      const sigilInput = {
        intention: intention.question,
        method: 'chaos_magic',
        include_numerology: true,
        include_sacred_geometry: true,
        complexity_level: Math.floor(consciousnessLevel * 5) + 1,
        style: 'fractal_minimalist',
      };
      
      calculateSigilForge(sigilInput)
        .then(result => {
          if (result.success) {
            // Auto-save the reading
            saveEngineResult(
              'sigil_forge',
              result.data,
              sigilInput,
              {
                complexityLevel: sigilInput.complexity_level,
                method: sigilInput.method,
                style: sigilInput.style,
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
  }, [intention, visible, calculateSigilForge, onCalculationComplete, consciousnessLevel, saveEngineResult]);

  // Generate sigil geometry from intention text
  const generateSigilFromText = (text: string): SigilLayer[] => {
    const layers: SigilLayer[] = [];
    const cleanText = text.replace(/[aeiou\s]/gi, '').toUpperCase();
    const uniqueChars = [...new Set(cleanText.split(''))];

    // Base layer - main sigil structure
    const baseElements: SigilElement[] = [];
    uniqueChars.forEach((char, index) => {
      const charCode = char.charCodeAt(0);
      const angle = (index / uniqueChars.length) * Math.PI * 2;
      const radius = 1 + (charCode % 50) / 100;

      // Create line element for each character
      const startPoint = new Vector3(0, 0, 0);
      const endPoint = new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, (charCode % 20) / 100);

      baseElements.push({
        type: 'line',
        points: [startPoint, endPoint],
        color: SIGIL_COLORS[charCode % SIGIL_COLORS.length] || new Color('#FFFFFF'),
        thickness: 0.02 + (charCode % 10) / 500,
        energy: (charCode % 100) / 100,
        frequency: 200 + (charCode % 600),
      });
    });

    layers.push({
      name: 'base',
      elements: baseElements,
      opacity: 0.8,
      rotation: 0,
      scale: 1,
    });

    // Sacred geometry layer
    const sacredElements: SigilElement[] = [];
    const centerPoints: Vector3[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      centerPoints.push(new Vector3(Math.cos(angle) * 0.5, Math.sin(angle) * 0.5, 0));
    }

    sacredElements.push({
      type: 'circle',
      points: centerPoints,
      color: new Color('#FFFFFF'),
      thickness: 0.01,
      energy: 0.7,
      frequency: 528, // Love frequency
    });

    layers.push({
      name: 'sacred',
      elements: sacredElements,
      opacity: 0.4,
      rotation: Math.PI / 6,
      scale: 0.8,
    });

    // Fractal enhancement layer
    const fractalElements: SigilElement[] = [];
    uniqueChars.slice(0, 3).forEach((char, index) => {
      const charCode = char.charCodeAt(0);
      const spiralPoints: Vector3[] = [];

      for (let i = 0; i < 20; i++) {
        const t = i / 20;
        const angle = t * Math.PI * 4;
        const radius = t * 0.3;
        spiralPoints.push(new Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, t * 0.2));
      }

      fractalElements.push({
        type: 'spiral',
        points: spiralPoints,
        color: SIGIL_COLORS[(charCode + index) % SIGIL_COLORS.length] || new Color('#FFFFFF'),
        thickness: 0.005,
        energy: 0.5,
        frequency: 396 + index * 111,
      });
    });

    layers.push({
      name: 'fractal',
      elements: fractalElements,
      opacity: 0.6,
      rotation: -Math.PI / 4,
      scale: 1.2,
    });

    return layers;
  };

  // Process sigil data into 3D structure
  const { sigilLayers, sigilGeometry, activationField } = useMemo(() => {
    let layers: SigilLayer[] = [];

    const sigilData = state.data as any; // Type assertion for engine-specific data
    if (sigilData?.sigil_structure) {
      // Use API data if available
      layers = sigilData.sigil_structure.layers || [];
    } else if (intention.question) {
      // Generate from intention text
      layers = generateSigilFromText(intention.question);
    }

    // Create combined geometry
    const geometry = new BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];
    let vertexIndex = 0;

    layers.forEach(layer => {
      layer.elements.forEach(element => {
        element.points.forEach(point => {
          positions.push(point.x, point.y, point.z);
          colors.push(element.color.r, element.color.g, element.color.b);

          if (positions.length >= 6) {
            // At least 2 points
            indices.push(vertexIndex - 1, vertexIndex);
          }
          vertexIndex++;
        });
      });
    });

    if (positions.length > 0) {
      geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
      geometry.setIndex(indices);
    }

    // Create activation field fractal
    const activationFractal = createFractalGeometry({
      type: 'mandala',
      iterations: 4,
      scale: 1.5,
      complexity: intention.question?.length || 10,
      seed: intention.question?.charCodeAt(0) || 42,
    });

    return { sigilLayers: layers, sigilGeometry: geometry, activationField: activationFractal };
  }, [state.data, intention.question]);

  // Animate the sigil
  useFrame((state, delta) => {
    if (groupRef.current && visible) {
      const time = state.clock.elapsedTime;

      // Rotate sigil based on consciousness level
      groupRef.current.rotation.z += delta * 0.1 * consciousnessLevel;

      // Breath synchronization
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.06;
      groupRef.current.scale.setScalar(scale * breathScale);

      // Animate layers
      groupRef.current.children.forEach((child, index) => {
        if (child.userData.layer) {
          const layer = child.userData.layer as SigilLayer;

          // Layer-specific rotation
          child.rotation.z += delta * (0.02 + index * 0.01) * consciousnessLevel;

          // Consciousness-responsive opacity
          if ('material' in child && child.material) {
            const material = child.material as any;
            if (material.opacity !== undefined) {
              material.opacity = layer.opacity * (0.5 + consciousnessLevel * 0.5);
            }
          }
        }
      });
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Main Sigil Structure */}
      {sigilLayers.map((layer, index) => (
        <group key={layer.name} rotation={[0, 0, layer.rotation]} scale={layer.scale} userData={{ layer }}>
          {layer.elements.map((element, elemIndex) => {
            if (element.type === 'line' && element.points.length >= 2) {
              const start = element.points[0];
              const end = element.points[1];
              if (!start || !end) return null;

              const direction = end.clone().sub(start);
              const length = direction.length();
              const midpoint = start.clone().add(direction.clone().multiplyScalar(0.5));

              return (
                <mesh
                  key={`${layer.name}-line-${elemIndex}`}
                  position={midpoint.toArray()}
                  scale={[length, element.thickness, element.thickness]}
                >
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial
                    color={element.color}
                    emissive={element.color}
                    emissiveIntensity={element.energy * consciousnessLevel}
                    transparent
                    opacity={layer.opacity}
                  />
                </mesh>
              );
            }

            if (element.type === 'circle') {
              return (
                <mesh key={`${layer.name}-circle-${elemIndex}`} rotation={[Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.4, 0.5, 16]} />
                  <meshStandardMaterial color={element.color} transparent opacity={layer.opacity} />
                </mesh>
              );
            }

            return null;
          })}
        </group>
      ))}

      {/* Combined Sigil Geometry */}
      {sigilGeometry && (
        <lineSegments geometry={sigilGeometry}>
          <lineBasicMaterial vertexColors transparent opacity={0.8} />
        </lineSegments>
      )}

      {/* Activation Field */}
      {activationField && (
        <mesh geometry={activationField} scale={[2, 2, 0.1]} position={[0, 0, -0.5]}>
          <meshStandardMaterial
            color='#FFFFFF'
            transparent
            opacity={0.1 + consciousnessLevel * 0.2}
            wireframe
          />
        </mesh>
      )}

      {/* Energy Nodes */}
      {sigilLayers[0]?.elements.map(
        (element, index) =>
          element.points.length > 0 &&
          element.points[0] && (
            <mesh key={`node-${index}`} position={element.points[0].toArray()}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshStandardMaterial
                color={element.color}
                emissive={element.color}
                emissiveIntensity={element.energy * consciousnessLevel}
              />
            </mesh>
          )
      )}

      {/* Intention Manifestation Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 2.0, 32]} />
        <meshBasicMaterial color='#FFFFFF' transparent opacity={0.05 + consciousnessLevel * 0.1} />
      </mesh>

      {/* Central Focus Point */}
      <mesh>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial
          color='#FFFFFF'
          emissive='#FFFFFF'
          emissiveIntensity={consciousnessLevel * 0.5}
        />
      </mesh>

      {/* Loading indicator */}
      {state.loading && (
        <mesh>
          <torusGeometry args={[1.5, 0.1, 8, 32]} />
          <meshBasicMaterial color='#DDA0DD' transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default SigilForgeEngine;

/**
 * I-Ching Engine 3D Visualization Component
 *
 * Hexagram transformation spaces using wave interference patterns
 * Displays I-Ching hexagrams as dynamic 3D transformation geometries
 */

'use client';

import { generateWaveInterference } from '@/generators/wave-equations';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { QuestionInput } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import { BufferGeometry, Color, Float32BufferAttribute, Group, Vector3 } from 'three';

interface IChingEngineProps {
  question: QuestionInput;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onCalculationComplete?: (result: any) => void;
}

interface Hexagram {
  number: number;
  name: string;
  lines: boolean[]; // true = yang (solid), false = yin (broken)
  trigrams: {
    upper: Trigram;
    lower: Trigram;
  };
  changing: boolean[];
  futureHexagram?: Hexagram;
}

interface Trigram {
  name: string;
  element: string;
  attribute: string;
  lines: boolean[];
  color: Color;
}

const TRIGRAMS: Record<string, Trigram> = {
  qian: {
    name: 'Heaven',
    element: 'metal',
    attribute: 'creative',
    lines: [true, true, true],
    color: new Color('#FFD700'),
  },
  kun: {
    name: 'Earth',
    element: 'earth',
    attribute: 'receptive',
    lines: [false, false, false],
    color: new Color('#8B4513'),
  },
  zhen: {
    name: 'Thunder',
    element: 'wood',
    attribute: 'arousing',
    lines: [false, false, true],
    color: new Color('#32CD32'),
  },
  xun: {
    name: 'Wind',
    element: 'wood',
    attribute: 'gentle',
    lines: [true, false, false],
    color: new Color('#90EE90'),
  },
  kan: {
    name: 'Water',
    element: 'water',
    attribute: 'abysmal',
    lines: [false, true, false],
    color: new Color('#4169E1'),
  },
  li: {
    name: 'Fire',
    element: 'fire',
    attribute: 'clinging',
    lines: [true, false, true],
    color: new Color('#FF4500'),
  },
  gen: {
    name: 'Mountain',
    element: 'earth',
    attribute: 'keeping still',
    lines: [true, true, false],
    color: new Color('#A0522D'),
  },
  dui: {
    name: 'Lake',
    element: 'metal',
    attribute: 'joyous',
    lines: [false, true, true],
    color: new Color('#87CEEB'),
  },
};

export const IChingEngine: React.FC<IChingEngineProps> = ({
  question,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  onCalculationComplete,
}) => {
  const groupRef = useRef<Group>(null);
  const { calculateIChing, state } = useWitnessOSAPI();
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Calculate I-Ching reading
  useEffect(() => {
    if (question && visible) {
      calculateIChing({
        question: question.question,
        method: 'three_coins',
        include_changing_lines: true,
        include_interpretation: true,
        focus_area: (question.context as any)?.focus_area || 'general',
      })
        .then(result => {
          if (result.success && onCalculationComplete) {
            onCalculationComplete(result.data);
          }
        })
        .catch(console.error);
    }
  }, [question, visible, calculateIChing, onCalculationComplete]);

  // Process I-Ching data into 3D hexagram structures
  const { currentHexagram, futureHexagram, transformationLines } = useMemo(() => {
    if (!state.data) {
      return { currentHexagram: null, futureHexagram: null, transformationLines: [] };
    }

    const ichingData = state.data as any; // Type assertion for engine-specific data

    // Create current hexagram
    const current: Hexagram | null = ichingData?.hexagram
      ? {
          number: ichingData.hexagram.number,
          name: ichingData.hexagram.name,
          lines: ichingData.hexagram.lines || [true, true, true, true, true, true],
          trigrams: {
            upper:
              (ichingData.hexagram.upper_trigram &&
                TRIGRAMS[ichingData.hexagram.upper_trigram as keyof typeof TRIGRAMS]) ||
              TRIGRAMS.qian,
            lower:
              (ichingData.hexagram.lower_trigram &&
                TRIGRAMS[ichingData.hexagram.lower_trigram as keyof typeof TRIGRAMS]) ||
              TRIGRAMS.kun,
          },
          changing: ichingData.changing_lines || [],
        }
      : null;

    // Create future hexagram if there are changing lines
    const future: Hexagram | null = ichingData?.future_hexagram
      ? {
          number: ichingData.future_hexagram.number,
          name: ichingData.future_hexagram.name,
          lines: ichingData.future_hexagram.lines || [true, true, true, true, true, true],
          trigrams: {
            upper:
              (ichingData.future_hexagram.upper_trigram &&
                TRIGRAMS[ichingData.future_hexagram.upper_trigram as keyof typeof TRIGRAMS]) ||
              TRIGRAMS.qian,
            lower:
              (ichingData.future_hexagram.lower_trigram &&
                TRIGRAMS[ichingData.future_hexagram.lower_trigram as keyof typeof TRIGRAMS]) ||
              TRIGRAMS.kun,
          },
          changing: [],
        }
      : null;

    // Create transformation visualization data
    const transformations: Array<{ from: Vector3; to: Vector3; intensity: number }> = [];
    if (current && future) {
      current.changing.forEach((isChanging, index) => {
        if (isChanging) {
          const fromY = (index - 2.5) * 0.5;
          const toY = fromY;
          transformations.push({
            from: new Vector3(-1, fromY, 0),
            to: new Vector3(1, toY, 0),
            intensity: 0.8,
          });
        }
      });
    }

    return {
      currentHexagram: current,
      futureHexagram: future,
      transformationLines: transformations,
    };
  }, [state.data]);

  // Generate hexagram line geometry
  const createHexagramGeometry = (hexagram: Hexagram, xOffset: number = 0) => {
    const geometry = new BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    hexagram.lines.forEach((isYang, index) => {
      const y = (index - 2.5) * 0.5; // Center the lines vertically
      const lineColor = hexagram.changing[index]
        ? new Color('#FF6B6B') // Changing line color
        : isYang
          ? new Color('#FFFFFF')
          : new Color('#888888'); // Yang/Yin colors

      if (isYang) {
        // Solid line (Yang)
        positions.push(xOffset - 0.8, y, 0, xOffset + 0.8, y, 0);
        colors.push(lineColor.r, lineColor.g, lineColor.b, lineColor.r, lineColor.g, lineColor.b);
        indices.push(positions.length / 3 - 2, positions.length / 3 - 1);
      } else {
        // Broken line (Yin)
        positions.push(xOffset - 0.8, y, 0, xOffset - 0.1, y, 0);
        positions.push(xOffset + 0.1, y, 0, xOffset + 0.8, y, 0);
        colors.push(
          lineColor.r,
          lineColor.g,
          lineColor.b,
          lineColor.r,
          lineColor.g,
          lineColor.b,
          lineColor.r,
          lineColor.g,
          lineColor.b,
          lineColor.r,
          lineColor.g,
          lineColor.b
        );
        indices.push(
          positions.length / 3 - 4,
          positions.length / 3 - 3,
          positions.length / 3 - 2,
          positions.length / 3 - 1
        );
      }
    });

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);

    return geometry;
  };

  // Generate wave interference pattern for transformation
  const transformationGeometry = useMemo(() => {
    if (transformationLines.length === 0) return null;

    return generateWaveInterference({
      sources: transformationLines.map(t => ({
        position: t.from,
        frequency: 2.0,
        amplitude: t.intensity,
        phase: 0,
      })),
      gridSize: 32,
      bounds: { min: new Vector3(-2, -2, -1), max: new Vector3(2, 2, 1) },
    });
  }, [transformationLines]);

  // Animate the I-Ching visualization
  useFrame((state, delta) => {
    if (groupRef.current && visible) {
      // Gentle rotation based on consciousness level
      groupRef.current.rotation.y += delta * 0.03 * consciousnessLevel;

      // Breath synchronization
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.02;
      groupRef.current.scale.setScalar(scale * breathScale);

      // Animate transformation waves
      if (transformationGeometry) {
        const time = state.clock.elapsedTime;
        groupRef.current.children.forEach(child => {
          if (child.userData.isTransformation && 'material' in child) {
            const material = child.material as any;
            if (material.uniforms) {
              material.uniforms.time.value = time;
              material.uniforms.breathPhase.value = breathPhase;
            }
          }
        });
      }
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Current Hexagram */}
      {currentHexagram && (
        <group position={[-2, 0, 0]}>
          {/* Hexagram lines */}
          <lineSegments geometry={createHexagramGeometry(currentHexagram, 0)}>
            <lineBasicMaterial vertexColors transparent opacity={0.9} />
          </lineSegments>

          {/* Upper trigram indicator */}
          <mesh position={[0, 2, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color={currentHexagram.trigrams.upper.color}
              emissive={currentHexagram.trigrams.upper.color}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Lower trigram indicator */}
          <mesh position={[0, -2, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color={currentHexagram.trigrams.lower.color}
              emissive={currentHexagram.trigrams.lower.color}
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* Hexagram frame */}
          <mesh>
            <boxGeometry args={[2, 3.5, 0.1]} />
            <meshStandardMaterial color='#ffffff' transparent opacity={0.1} wireframe />
          </mesh>
        </group>
      )}

      {/* Future Hexagram */}
      {futureHexagram && (
        <group position={[2, 0, 0]}>
          {/* Hexagram lines */}
          <lineSegments geometry={createHexagramGeometry(futureHexagram, 0)}>
            <lineBasicMaterial vertexColors transparent opacity={0.7} />
          </lineSegments>

          {/* Future hexagram frame */}
          <mesh>
            <boxGeometry args={[2, 3.5, 0.1]} />
            <meshStandardMaterial color='#ffffff' transparent opacity={0.05} wireframe />
          </mesh>
        </group>
      )}

      {/* Transformation Wave Field */}
      {transformationGeometry && (
        <mesh geometry={transformationGeometry} userData={{ isTransformation: true }}>
          <shaderMaterial
            uniforms={{
              time: { value: 0 },
              breathPhase: { value: breathPhase },
              consciousnessLevel: { value: consciousnessLevel },
            }}
            vertexShader={`
              uniform float time;
              uniform float breathPhase;
              varying vec3 vPosition;
              
              void main() {
                vPosition = position;
                vec3 pos = position;
                
                // Wave transformation effect
                float wave = sin(pos.x * 2.0 + time) * sin(pos.y * 2.0 + time) * 0.1;
                pos.z += wave * (1.0 + sin(breathPhase * 6.28) * 0.3);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
              }
            `}
            fragmentShader={`
              uniform float consciousnessLevel;
              varying vec3 vPosition;
              
              void main() {
                float intensity = sin(vPosition.x * 4.0) * sin(vPosition.y * 4.0);
                vec3 color = mix(vec3(0.2, 0.4, 0.8), vec3(0.8, 0.4, 0.2), intensity);
                float alpha = 0.3 + consciousnessLevel * 0.2;
                gl_FragColor = vec4(color, alpha);
              }
            `}
            transparent
          />
        </mesh>
      )}

      {/* Yin-Yang symbol at center */}
      <group>
        <mesh>
          <ringGeometry args={[0.8, 1.0, 32]} />
          <meshBasicMaterial color='#ffffff' transparent opacity={0.1} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.8, 32]} />
          <meshBasicMaterial color='#000000' transparent opacity={0.05} />
        </mesh>
      </group>

      {/* Loading indicator */}
      {state.loading && (
        <mesh>
          <torusGeometry args={[1.5, 0.1, 8, 32]} />
          <meshBasicMaterial color='#4169E1' transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
};

export default IChingEngine;

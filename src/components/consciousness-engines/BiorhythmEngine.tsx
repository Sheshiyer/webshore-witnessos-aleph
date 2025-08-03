/**
 * Biorhythm Engine 3D Visualization Component
 *
 * Temporal wave visualization using Nishitsuji's wave equations
 * Displays physical, emotional, and intellectual cycles as fractal waves
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { BirthData } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { BufferGeometry, Color, Float32BufferAttribute, Mesh } from 'three';

interface BiorhythmEngineProps {
  birthData: BirthData;
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  onCalculationComplete?: (result: unknown) => void;
}

interface BiorhythmCycle {
  name: string;
  period: number; // days
  color: Color;
  amplitude: number;
  phase: number;
}

const BIORHYTHM_CYCLES: BiorhythmCycle[] = [
  { name: 'Physical', period: 23, color: new Color('#ff4444'), amplitude: 1.0, phase: 0 },
  { name: 'Emotional', period: 28, color: new Color('#44ff44'), amplitude: 0.8, phase: 0 },
  { name: 'Intellectual', period: 33, color: new Color('#4444ff'), amplitude: 0.9, phase: 0 },
];

export const BiorhythmEngine: React.FC<BiorhythmEngineProps> = ({
  birthData,
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  onCalculationComplete,
}) => {
  const meshRef = useRef<Mesh>(null);
  const { calculateBiorhythm, state } = useWitnessOSAPI();
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Calculate biorhythm data
  useEffect(() => {
    if (birthData && visible) {
      calculateBiorhythm({
        birth_date: birthData.date,
        birth_time: birthData.time,
        birth_location: birthData.location,
        current_date: new Date().toISOString().split('T')[0],
        cycles: ['physical', 'emotional', 'intellectual'],
      })
        .then(result => {
          if (result.success && onCalculationComplete) {
            onCalculationComplete(result.data);
          }
        })
        .catch(console.error);
    }
  }, [birthData, visible, calculateBiorhythm, onCalculationComplete]);

  // Generate wave geometry based on biorhythm calculations
  const waveGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const segments = 200;
    const timeRange = 60; // days

    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    BIORHYTHM_CYCLES.forEach((cycle, cycleIndex) => {
      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * timeRange;

        // Calculate biorhythm value using sine wave
        const radians = (2 * Math.PI * t) / cycle.period;
        const value = Math.sin(radians + cycle.phase) * cycle.amplitude;

        // Create 3D wave positions
        const x = (t / timeRange - 0.5) * 10; // Spread over 10 units
        const y = value * 2; // Amplitude scaling
        const z = cycleIndex * 0.5 - 1; // Separate cycles in Z

        positions.push(x, y, z);

        // Apply cycle color
        colors.push(cycle.color.r, cycle.color.g, cycle.color.b);

        // Create line indices
        if (i < segments) {
          const baseIndex = cycleIndex * (segments + 1) + i;
          indices.push(baseIndex, baseIndex + 1);
        }
      }
    });

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);

    return geometry;
  }, []);

  // Animate waves with breath synchronization
  useFrame((state, delta) => {
    if (meshRef.current && visible) {
      // Rotate based on consciousness level
      meshRef.current.rotation.y += delta * 0.1 * consciousnessLevel;

      // Pulse with breath
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.1;
      meshRef.current.scale.setScalar(scale * breathScale);

      // Update wave animation
      const time = state.clock.elapsedTime;
      if (meshRef.current.material && 'uniforms' in meshRef.current.material) {
        const material = meshRef.current.material as THREE.ShaderMaterial;
        if (material.uniforms && material.uniforms.time) {
          material.uniforms.time.value = time;
        }
      }
    }
  });

  // Wave shader material
  const waveMaterial = useMemo(
    () => ({
      vertexShader: `
      attribute vec3 color;
      varying vec3 vColor;
      uniform float time;
      uniform float breathPhase;
      
      void main() {
        vColor = color;
        
        vec3 pos = position;
        
        // Add breath-synchronized wave modulation
        float wave = sin(pos.x * 2.0 + time * 2.0) * 0.1;
        pos.y += wave * (1.0 + sin(breathPhase * 6.28) * 0.3);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
      fragmentShader: `
      varying vec3 vColor;
      uniform float consciousnessLevel;
      
      void main() {
        // Consciousness-responsive glow
        float glow = 0.5 + consciousnessLevel * 0.5;
        gl_FragColor = vec4(vColor * glow, 0.8);
      }
    `,
      uniforms: {
        time: { value: 0 },
        breathPhase: { value: breathPhase },
        consciousnessLevel: { value: consciousnessLevel },
      },
      transparent: true,
      vertexColors: true,
    }),
    [breathPhase, consciousnessLevel]
  );

  if (!visible) return null;

  return (
    <group position={position}>
      {/* Main biorhythm wave visualization */}
      <lineSegments ref={meshRef} geometry={waveGeometry}>
        <shaderMaterial {...waveMaterial} />
      </lineSegments>

      {/* Cycle labels and indicators */}
      {BIORHYTHM_CYCLES.map((cycle, index) => (
        <group key={cycle.name} position={[0, 0, index * 0.5 - 1]}>
          {/* Cycle indicator sphere */}
          <mesh position={[5, 0, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshBasicMaterial color={cycle.color} />
          </mesh>

          {/* Cycle name text (placeholder for future text implementation) */}
          <mesh position={[5.5, 0, 0]}>
            <boxGeometry args={[0.02, 0.02, 0.02]} />
            <meshBasicMaterial color={cycle.color} />
          </mesh>
        </group>
      ))}

      {/* Current day indicator */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
        <meshBasicMaterial color='#ffffff' transparent opacity={0.5} />
      </mesh>

      {/* Loading indicator */}
      {state.loading && (
        <mesh>
          <ringGeometry args={[0.8, 1.0, 8]} />
          <meshBasicMaterial color='#ffffff' transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

export default BiorhythmEngine;

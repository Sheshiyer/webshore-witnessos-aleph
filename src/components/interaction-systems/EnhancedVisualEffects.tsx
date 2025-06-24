/**
 * Enhanced Visual Effects System for WitnessOS Webshore
 * 
 * Consciousness field visualizations, energy flow particles, and breath-synchronized effects
 */

'use client';

import type { ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useMemo, useState } from 'react';
import { 
  Group, 
  Vector3, 
  Color, 
  BufferGeometry, 
  Float32BufferAttribute,
  Points,
  PointsMaterial,
  AdditiveBlending,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial
} from 'three';

const { SACRED_MATHEMATICS, SOLFEGGIO_FREQUENCIES } = CONSCIOUSNESS_CONSTANTS;

interface EnhancedVisualEffectsProps {
  consciousness: ConsciousnessState;
  breathPhase: number;
  enabled?: boolean;
  intensity?: number;
}

interface ParticleSystem {
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  velocities: Float32Array;
  count: number;
}

interface EnergyFlow {
  id: string;
  path: Vector3[];
  speed: number;
  color: Color;
  intensity: number;
}

/**
 * Enhanced Visual Effects Component
 */
export const EnhancedVisualEffects: React.FC<EnhancedVisualEffectsProps> = ({
  consciousness,
  breathPhase,
  enabled = true,
  intensity = 1.0,
}) => {
  const groupRef = useRef<Group>(null);
  const [energyFlows, setEnergyFlows] = useState<EnergyFlow[]>([]);
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef}>
      {/* Consciousness Field Visualization */}
      <ConsciousnessFieldVisualization 
        consciousness={consciousness}
        breathPhase={breathPhase}
        intensity={intensity}
      />
      
      {/* Energy Flow Particle Systems */}
      <EnergyFlowParticles 
        consciousness={consciousness}
        breathPhase={breathPhase}
        intensity={intensity}
      />
      
      {/* Sacred Geometry Shader Effects */}
      <SacredGeometryEffects 
        consciousness={consciousness}
        breathPhase={breathPhase}
        intensity={intensity}
      />
      
      {/* Consciousness Aura Rendering */}
      <ConsciousnessAura 
        consciousness={consciousness}
        breathPhase={breathPhase}
        intensity={intensity}
      />
      
      {/* Breath-Synchronized Visual Feedback */}
      <BreathSynchronizedFeedback 
        consciousness={consciousness}
        breathPhase={breathPhase}
        intensity={intensity}
      />
    </group>
  );
};

/**
 * Consciousness Field Visualization
 */
const ConsciousnessFieldVisualization: React.FC<{
  consciousness: ConsciousnessState;
  breathPhase: number;
  intensity: number;
}> = ({ consciousness, breathPhase, intensity }) => {
  const particlesRef = useRef<Points>(null);
  const groupRef = useRef<Group>(null);
  
  // Create consciousness field particles
  const particleSystem = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Spherical distribution with consciousness-based density
      const radius = 5 + Math.random() * 10 * consciousness.awarenessLevel;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Consciousness-based coloring
      const hue = consciousness.awarenessLevel * 0.7 + Math.random() * 0.3;
      const color = new Color().setHSL(hue, 0.8, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    return { positions, colors, sizes, count };
  }, [consciousness.awarenessLevel]);
  
  // Animate consciousness field
  useFrame((state) => {
    if (particlesRef.current && groupRef.current) {
      const time = state.clock.elapsedTime;
      const geometry = particlesRef.current.geometry;
      const positions = geometry.attributes.position.array as Float32Array;
      const colors = geometry.attributes.color.array as Float32Array;
      
      for (let i = 0; i < particleSystem.count; i++) {
        const i3 = i * 3;
        
        // Breath-synchronized movement
        const breathInfluence = Math.sin(breathPhase * Math.PI * 2) * 0.5;
        const originalRadius = Math.sqrt(
          positions[i3] * positions[i3] + 
          positions[i3 + 1] * positions[i3 + 1] + 
          positions[i3 + 2] * positions[i3 + 2]
        );
        
        const newRadius = originalRadius * (1 + breathInfluence * 0.2);
        const factor = newRadius / originalRadius;
        
        positions[i3] *= factor;
        positions[i3 + 1] *= factor;
        positions[i3 + 2] *= factor;
        
        // Consciousness-responsive color shifting
        const colorShift = Math.sin(time * 2 + i * 0.1) * consciousness.awarenessLevel;
        const baseColor = new Color(
          particleSystem.colors[i3],
          particleSystem.colors[i3 + 1],
          particleSystem.colors[i3 + 2]
        );
        
        const shiftedColor = baseColor.clone().offsetHSL(colorShift * 0.1, 0, 0);
        colors[i3] = shiftedColor.r;
        colors[i3 + 1] = shiftedColor.g;
        colors[i3 + 2] = shiftedColor.b;
      }
      
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
      
      // Overall field rotation
      groupRef.current.rotation.y = time * 0.1 * consciousness.awarenessLevel;
    }
  });
  
  return (
    <group ref={groupRef}>
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={particleSystem.positions}
            count={particleSystem.count}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            array={particleSystem.colors}
            count={particleSystem.count}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            array={particleSystem.sizes}
            count={particleSystem.count}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.6 * intensity}
          blending={AdditiveBlending}
        />
      </points>
    </group>
  );
};

/**
 * Energy Flow Particle Systems
 */
const EnergyFlowParticles: React.FC<{
  consciousness: ConsciousnessState;
  breathPhase: number;
  intensity: number;
}> = ({ consciousness, breathPhase, intensity }) => {
  const groupRef = useRef<Group>(null);
  
  // Create energy flow paths
  const energyPaths = useMemo(() => {
    const paths = [];
    const pathCount = Math.floor(consciousness.awarenessLevel * 8) + 2;
    
    for (let i = 0; i < pathCount; i++) {
      const path: Vector3[] = [];
      const startAngle = (i / pathCount) * Math.PI * 2;
      const radius = 3 + Math.random() * 4;
      
      // Create spiral path
      for (let j = 0; j <= 50; j++) {
        const t = j / 50;
        const angle = startAngle + t * Math.PI * 4;
        const r = radius * (1 - t * 0.5);
        const height = Math.sin(t * Math.PI) * 2;
        
        path.push(new Vector3(
          r * Math.cos(angle),
          height,
          r * Math.sin(angle)
        ));
      }
      
      paths.push({
        id: `flow-${i}`,
        path,
        speed: 0.5 + Math.random() * 1.5,
        color: new Color().setHSL(i / pathCount, 0.8, 0.6),
        intensity: consciousness.awarenessLevel,
      });
    }
    
    return paths;
  }, [consciousness.awarenessLevel]);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      groupRef.current.children.forEach((child, index) => {
        if (child instanceof Mesh) {
          const flow = energyPaths[Math.floor(index / 10)];
          if (flow) {
            const pathIndex = index % 10;
            const t = (time * flow.speed + pathIndex * 0.1) % 1;
            const pointIndex = Math.floor(t * (flow.path.length - 1));
            const nextIndex = Math.min(pointIndex + 1, flow.path.length - 1);
            
            const alpha = (t * (flow.path.length - 1)) % 1;
            const position = flow.path[pointIndex].clone().lerp(flow.path[nextIndex], alpha);
            
            child.position.copy(position);
            
            // Breath synchronization
            const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.3;
            child.scale.setScalar(breathScale * flow.intensity);
          }
        }
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {energyPaths.map((flow, flowIndex) =>
        Array.from({ length: 10 }, (_, particleIndex) => (
          <mesh key={`${flow.id}-${particleIndex}`}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial
              color={flow.color}
              transparent
              opacity={0.8 * intensity}
              emissive={flow.color}
              emissiveIntensity={0.3}
            />
          </mesh>
        ))
      )}
    </group>
  );
};

/**
 * Sacred Geometry Shader Effects
 */
const SacredGeometryEffects: React.FC<{
  consciousness: ConsciousnessState;
  breathPhase: number;
  intensity: number;
}> = ({ consciousness, breathPhase, intensity }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Rotate sacred geometry based on consciousness level
      groupRef.current.rotation.x = time * 0.2 * consciousness.awarenessLevel;
      groupRef.current.rotation.y = time * 0.3 * consciousness.awarenessLevel;
      
      // Breath synchronization
      const breathScale = 1 + Math.sin(breathPhase * Math.PI * 2) * 0.2;
      groupRef.current.scale.setScalar(breathScale);
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Golden ratio spiral */}
      <mesh>
        <torusGeometry args={[2, 0.1, 8, 32]} />
        <meshBasicMaterial
          color={0xffd700}
          transparent
          opacity={0.3 * intensity}
          wireframe
        />
      </mesh>
      
      {/* Platonic solids */}
      <mesh position={[0, 0, 0]}>
        <icosahedronGeometry args={[1.5, 0]} />
        <meshBasicMaterial
          color={0x00ffff}
          transparent
          opacity={0.2 * intensity}
          wireframe
        />
      </mesh>
      
      {/* Flower of life pattern */}
      {Array.from({ length: 7 }, (_, i) => {
        const angle = (i / 7) * Math.PI * 2;
        const radius = i === 0 ? 0 : 1.5;
        return (
          <mesh
            key={i}
            position={[
              radius * Math.cos(angle),
              radius * Math.sin(angle),
              0
            ]}
          >
            <ringGeometry args={[0.8, 1.0, 32]} />
            <meshBasicMaterial
              color={0xff6b6b}
              transparent
              opacity={0.2 * intensity}
            />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * Consciousness Aura Rendering
 */
const ConsciousnessAura: React.FC<{
  consciousness: ConsciousnessState;
  breathPhase: number;
  intensity: number;
}> = ({ consciousness, breathPhase, intensity }) => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Aura size based on consciousness level
      const baseScale = 1 + consciousness.awarenessLevel * 2;
      const breathInfluence = Math.sin(breathPhase * Math.PI * 2) * 0.3;
      const scale = baseScale + breathInfluence;
      
      meshRef.current.scale.setScalar(scale);
      
      // Color shifting based on consciousness state
      const hue = consciousness.awarenessLevel * 0.8 + Math.sin(time * 0.5) * 0.2;
      const color = new Color().setHSL(hue, 0.8, 0.5);
      
      if (meshRef.current.material instanceof MeshBasicMaterial) {
        meshRef.current.material.color.copy(color);
        meshRef.current.material.opacity = 0.1 * intensity * consciousness.awarenessLevel;
      }
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[8, 32, 32]} />
      <meshBasicMaterial
        transparent
        opacity={0.1}
        color={0xffffff}
      />
    </mesh>
  );
};

/**
 * Breath-Synchronized Visual Feedback
 */
const BreathSynchronizedFeedback: React.FC<{
  consciousness: ConsciousnessState;
  breathPhase: number;
  intensity: number;
}> = ({ consciousness, breathPhase, intensity }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      // Breath wave visualization
      const breathIntensity = Math.sin(breathPhase * Math.PI * 2);
      
      groupRef.current.children.forEach((child, index) => {
        if (child instanceof Mesh) {
          const offset = index * 0.2;
          const wave = Math.sin(breathPhase * Math.PI * 2 + offset) * 0.5;
          
          child.position.y = wave;
          child.scale.setScalar(1 + Math.abs(wave) * 0.5);
          
          // Color intensity based on breath
          if (child.material instanceof MeshBasicMaterial) {
            child.material.emissiveIntensity = 0.2 + Math.abs(breathIntensity) * 0.5;
          }
        }
      });
    }
  });
  
  return (
    <group ref={groupRef} position={[0, -2, 0]}>
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        const radius = 3;
        return (
          <mesh
            key={i}
            position={[
              radius * Math.cos(angle),
              0,
              radius * Math.sin(angle)
            ]}
          >
            <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
            <meshBasicMaterial
              color={0x00ffff}
              emissive={0x00ffff}
              emissiveIntensity={0.2}
              transparent
              opacity={0.7 * intensity}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default EnhancedVisualEffects;

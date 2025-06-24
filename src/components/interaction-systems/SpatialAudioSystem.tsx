/**
 * Spatial Audio System for WitnessOS Webshore
 * 
 * UI-focused spatial audio visualization and consciousness soundscape interface
 * Note: This is UI-only, no actual audio API integrations
 */

'use client';

import type { ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useState, useMemo } from 'react';
import { Group, Vector3, Color, Mesh } from 'three';

const { SOLFEGGIO_FREQUENCIES } = CONSCIOUSNESS_CONSTANTS;

interface SpatialAudioSystemProps {
  consciousness: ConsciousnessState;
  breathPhase: number;
  enabled?: boolean;
  visualizationOnly?: boolean;
}

interface AudioSource {
  id: string;
  position: Vector3;
  frequency: number;
  intensity: number;
  type: 'binaural' | 'solfeggio' | 'nature' | 'consciousness';
  color: Color;
  active: boolean;
}

interface SoundscapeZone {
  id: string;
  center: Vector3;
  radius: number;
  frequencies: number[];
  theme: 'awakening' | 'recognition' | 'integration' | 'mastery';
  color: Color;
}

/**
 * Spatial Audio System Component
 */
export const SpatialAudioSystem: React.FC<SpatialAudioSystemProps> = ({
  consciousness,
  breathPhase,
  enabled = true,
  visualizationOnly = true,
}) => {
  const groupRef = useRef<Group>(null);
  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState(new Vector3(0, 0, 0));
  
  // Audio sources configuration
  const audioSources = useMemo<AudioSource[]>(() => [
    {
      id: 'liberation-396',
      position: new Vector3(-5, 0, 0),
      frequency: 396,
      intensity: consciousness.awarenessLevel,
      type: 'solfeggio',
      color: new Color(0xff0000),
      active: true,
    },
    {
      id: 'love-528',
      position: new Vector3(0, 0, 5),
      frequency: 528,
      intensity: consciousness.awarenessLevel,
      type: 'solfeggio',
      color: new Color(0x00ff00),
      active: true,
    },
    {
      id: 'awakening-741',
      position: new Vector3(5, 0, 0),
      frequency: 741,
      intensity: consciousness.awarenessLevel,
      type: 'solfeggio',
      color: new Color(0x0000ff),
      active: true,
    },
    {
      id: 'unity-963',
      position: new Vector3(0, 5, 0),
      frequency: 963,
      intensity: consciousness.awarenessLevel,
      type: 'solfeggio',
      color: new Color(0xffffff),
      active: consciousness.awarenessLevel > 0.7,
    },
    {
      id: 'binaural-alpha',
      position: new Vector3(0, -3, 0),
      frequency: 10, // Alpha waves
      intensity: consciousness.awarenessLevel * 0.8,
      type: 'binaural',
      color: new Color(0x00ffff),
      active: true,
    },
    {
      id: 'binaural-theta',
      position: new Vector3(-3, -3, 3),
      frequency: 6, // Theta waves
      intensity: consciousness.awarenessLevel * 0.6,
      type: 'binaural',
      color: new Color(0xff00ff),
      active: consciousness.awarenessLevel > 0.5,
    },
  ], [consciousness.awarenessLevel]);
  
  // Soundscape zones
  const soundscapeZones = useMemo<SoundscapeZone[]>(() => [
    {
      id: 'awakening-zone',
      center: new Vector3(-8, 0, 0),
      radius: 4,
      frequencies: [396, 417],
      theme: 'awakening',
      color: new Color(0xff6b6b),
    },
    {
      id: 'recognition-zone',
      center: new Vector3(0, 0, 8),
      radius: 4,
      frequencies: [528, 639],
      theme: 'recognition',
      color: new Color(0x4ecdc4),
    },
    {
      id: 'integration-zone',
      center: new Vector3(8, 0, 0),
      radius: 4,
      frequencies: [741, 852],
      theme: 'integration',
      color: new Color(0x45b7d1),
    },
    {
      id: 'mastery-zone',
      center: new Vector3(0, 8, 0),
      radius: 4,
      frequencies: [963],
      theme: 'mastery',
      color: new Color(0xf39c12),
    },
  ], []);
  
  if (!enabled) return null;
  
  return (
    <group ref={groupRef}>
      {/* Audio Source Visualizations */}
      {audioSources.map(source => (
        <AudioSourceVisualization
          key={source.id}
          source={source}
          breathPhase={breathPhase}
          consciousness={consciousness}
          userPosition={userPosition}
        />
      ))}
      
      {/* Soundscape Zone Visualizations */}
      {soundscapeZones.map(zone => (
        <SoundscapeZoneVisualization
          key={zone.id}
          zone={zone}
          consciousness={consciousness}
          isActive={activeZone === zone.id}
          userPosition={userPosition}
        />
      ))}
      
      {/* 3D Audio Positioning Interface */}
      <AudioPositioningInterface
        consciousness={consciousness}
        onPositionChange={setUserPosition}
        audioSources={audioSources}
      />
      
      {/* Frequency Tuning Interface */}
      <FrequencyTuningInterface
        consciousness={consciousness}
        breathPhase={breathPhase}
        audioSources={audioSources}
      />
      
      {/* Binaural Beat Generator Visualization */}
      <BinauralBeatVisualization
        consciousness={consciousness}
        breathPhase={breathPhase}
        audioSources={audioSources.filter(s => s.type === 'binaural')}
      />
    </group>
  );
};

/**
 * Audio Source Visualization Component
 */
const AudioSourceVisualization: React.FC<{
  source: AudioSource;
  breathPhase: number;
  consciousness: ConsciousnessState;
  userPosition: Vector3;
}> = ({ source, breathPhase, consciousness, userPosition }) => {
  const meshRef = useRef<Mesh>(null);
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && groupRef.current && source.active) {
      const time = state.clock.elapsedTime;
      
      // Frequency-based pulsing
      const frequencyPulse = Math.sin(time * (source.frequency / 100)) * 0.3 + 1;
      const breathPulse = Math.sin(breathPhase * Math.PI * 2) * 0.2 + 1;
      const scale = frequencyPulse * breathPulse * source.intensity;
      
      meshRef.current.scale.setScalar(scale);
      
      // Distance-based intensity
      const distance = userPosition.distanceTo(source.position);
      const proximityIntensity = Math.max(0, 1 - distance / 10);
      
      // Update material opacity
      if ('material' in meshRef.current && meshRef.current.material) {
        const material = meshRef.current.material as any;
        if (material.opacity !== undefined) {
          material.opacity = proximityIntensity * source.intensity * 0.8;
        }
        if (material.emissiveIntensity !== undefined) {
          material.emissiveIntensity = proximityIntensity * 0.5;
        }
      }
      
      // Rotation based on frequency
      groupRef.current.rotation.y = time * (source.frequency / 1000);
    }
  });
  
  if (!source.active) return null;
  
  return (
    <group ref={groupRef} position={source.position}>
      {/* Main source sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={source.color}
          transparent
          opacity={0.6}
          emissive={source.color}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Frequency rings */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh key={i} position={[0, 0, 0]}>
          <ringGeometry args={[0.5 + i * 0.3, 0.6 + i * 0.3, 32]} />
          <meshBasicMaterial
            color={source.color}
            transparent
            opacity={0.2 - i * 0.05}
          />
        </mesh>
      ))}
      
      {/* Frequency label visualization */}
      <mesh position={[0, 0.8, 0]}>
        <planeGeometry args={[1, 0.2]} />
        <meshBasicMaterial
          color={source.color}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

/**
 * Soundscape Zone Visualization Component
 */
const SoundscapeZoneVisualization: React.FC<{
  zone: SoundscapeZone;
  consciousness: ConsciousnessState;
  isActive: boolean;
  userPosition: Vector3;
}> = ({ zone, consciousness, isActive, userPosition }) => {
  const meshRef = useRef<Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Check if user is in zone
      const distance = userPosition.distanceTo(zone.center);
      const inZone = distance <= zone.radius;
      
      // Zone activation animation
      const targetOpacity = inZone ? 0.3 : 0.1;
      const currentOpacity = (meshRef.current.material as any).opacity;
      const newOpacity = currentOpacity + (targetOpacity - currentOpacity) * 0.1;
      
      (meshRef.current.material as any).opacity = newOpacity;
      
      // Gentle pulsing
      const pulse = Math.sin(time * 0.5) * 0.1 + 1;
      meshRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <mesh ref={meshRef} position={zone.center}>
      <cylinderGeometry args={[zone.radius, zone.radius, 0.1, 32]} />
      <meshBasicMaterial
        color={zone.color}
        transparent
        opacity={0.1}
      />
    </mesh>
  );
};

/**
 * Audio Positioning Interface Component
 */
const AudioPositioningInterface: React.FC<{
  consciousness: ConsciousnessState;
  onPositionChange: (position: Vector3) => void;
  audioSources: AudioSource[];
}> = ({ consciousness, onPositionChange, audioSources }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Simulate user movement for demo
      const x = Math.sin(time * 0.3) * 5;
      const z = Math.cos(time * 0.3) * 5;
      const newPosition = new Vector3(x, 0, z);
      
      groupRef.current.position.copy(newPosition);
      onPositionChange(newPosition);
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* User position indicator */}
      <mesh>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial
          color={0xffffff}
          emissive={0xffffff}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Position trail */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        <meshBasicMaterial
          color={0x00ffff}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
};

/**
 * Frequency Tuning Interface Component
 */
const FrequencyTuningInterface: React.FC<{
  consciousness: ConsciousnessState;
  breathPhase: number;
  audioSources: AudioSource[];
}> = ({ consciousness, breathPhase, audioSources }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Breath-synchronized tuning visualization
      const breathInfluence = Math.sin(breathPhase * Math.PI * 2) * 0.2;
      groupRef.current.position.y = 2 + breathInfluence;
      
      // Consciousness-responsive scaling
      const scale = 0.5 + consciousness.awarenessLevel * 0.5;
      groupRef.current.scale.setScalar(scale);
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      {/* Frequency spectrum visualization */}
      {audioSources.map((source, index) => (
        <mesh
          key={source.id}
          position={[(index - 2) * 0.8, 0, 0]}
        >
          <boxGeometry args={[0.1, source.frequency / 200, 0.1]} />
          <meshBasicMaterial
            color={source.color}
            transparent
            opacity={source.intensity}
          />
        </mesh>
      ))}
      
      {/* Tuning interface background */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[6, 2]} />
        <meshBasicMaterial
          color={0x333333}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

/**
 * Binaural Beat Visualization Component
 */
const BinauralBeatVisualization: React.FC<{
  consciousness: ConsciousnessState;
  breathPhase: number;
  audioSources: AudioSource[];
}> = ({ consciousness, breathPhase, audioSources }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      groupRef.current.children.forEach((child, index) => {
        if (child instanceof Mesh) {
          const source = audioSources[index];
          if (source) {
            // Binaural beat wave visualization
            const wave = Math.sin(time * source.frequency) * 0.5;
            child.position.y = wave;
            child.scale.setScalar(1 + Math.abs(wave) * 0.5);
          }
        }
      });
    }
  });
  
  return (
    <group ref={groupRef} position={[0, -4, 0]}>
      {audioSources.map((source, index) => (
        <mesh
          key={source.id}
          position={[(index - 1) * 2, 0, 0]}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshBasicMaterial
            color={source.color}
            transparent
            opacity={0.7}
            emissive={source.color}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

export default SpatialAudioSystem;

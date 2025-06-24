/**
 * Gesture Visualization Components for Advanced Gesture Recognition
 * 
 * Trail visualization, gesture feedback, and training interface components
 */

'use client';

import type { ConsciousnessState } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useMemo } from 'react';
import { 
  Group, 
  Vector2, 
  Vector3, 
  Color, 
  BufferGeometry, 
  Float32BufferAttribute,
  LineBasicMaterial,
  Line
} from 'three';

interface TouchTrail {
  id: number;
  points: Vector2[];
  startTime: number;
  color: Color;
  intensity: number;
}

interface GestureTemplate {
  name: string;
  points: Vector2[];
  tolerance: number;
  consciousnessLevel: number;
  action: string;
  color: Color;
  frequency: number;
}

interface TrainingProgress {
  gesture: string;
  accuracy: number;
  attempts: number;
  mastery: number;
}

/**
 * Trail Visualization Component
 */
export const TrailVisualization: React.FC<{ trail: TouchTrail }> = ({ trail }) => {
  const lineRef = useRef<Line>(null);
  const groupRef = useRef<Group>(null);
  
  // Create line geometry from trail points
  const geometry = useMemo(() => {
    if (trail.points.length < 2) return null;
    
    const geometry = new BufferGeometry();
    const positions: number[] = [];
    const colors: number[] = [];
    
    trail.points.forEach((point, index) => {
      positions.push(point.x * 5, point.y * 5, 0.1);
      
      // Fade color along trail
      const alpha = index / trail.points.length;
      const color = trail.color.clone();
      color.multiplyScalar(alpha * trail.intensity);
      colors.push(color.r, color.g, color.b);
    });
    
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    
    return geometry;
  }, [trail.points, trail.color, trail.intensity]);
  
  // Animate trail
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      const age = (Date.now() - trail.startTime) / 1000;
      
      // Pulse effect
      const pulse = 1 + Math.sin(time * 10) * 0.1;
      groupRef.current.scale.setScalar(pulse);
      
      // Fade out over time
      const opacity = Math.max(0, 1 - age / 3);
      if (lineRef.current?.material) {
        (lineRef.current.material as LineBasicMaterial).opacity = opacity;
      }
    }
  });
  
  if (!geometry) return null;
  
  return (
    <group ref={groupRef}>
      <line ref={lineRef} geometry={geometry}>
        <lineBasicMaterial 
          vertexColors 
          transparent 
          opacity={0.8}
          linewidth={3}
        />
      </line>
      
      {/* Trail particles */}
      {trail.points.slice(-5).map((point, index) => (
        <mesh 
          key={index}
          position={[point.x * 5, point.y * 5, 0.15]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial 
            color={trail.color}
            transparent
            opacity={trail.intensity * (index / 5)}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Gesture Visualization Component
 */
export const GestureVisualization: React.FC<{
  gestureType: string;
  templates: GestureTemplate[];
}> = ({ gestureType, templates }) => {
  const groupRef = useRef<Group>(null);
  
  const template = templates.find(t => t.name === gestureType);
  if (!template) return null;
  
  // Create geometry from template points
  const geometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const positions: number[] = [];
    
    template.points.forEach(point => {
      positions.push(point.x * 8, point.y * 8, 0.2);
    });
    
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return geometry;
  }, [template.points]);
  
  // Animate recognition feedback
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Pulsing scale
      const scale = 1 + Math.sin(time * 8) * 0.2;
      groupRef.current.scale.setScalar(scale);
      
      // Rotation based on gesture type
      if (gestureType.includes('spiral')) {
        groupRef.current.rotation.z = time * 2;
      } else if (gestureType.includes('infinity')) {
        groupRef.current.rotation.z = Math.sin(time * 3) * 0.5;
      }
    }
  });
  
  return (
    <group ref={groupRef}>
      {/* Template outline */}
      <line geometry={geometry}>
        <lineBasicMaterial 
          color={template.color}
          transparent
          opacity={0.6}
          linewidth={4}
        />
      </line>
      
      {/* Sacred geometry overlay */}
      <mesh position={[0, 0, 0.1]}>
        <ringGeometry args={[0.8, 1.0, 32]} />
        <meshBasicMaterial 
          color={template.color}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Frequency visualization */}
      <FrequencyVisualization 
        frequency={template.frequency}
        color={template.color}
      />
    </group>
  );
};

/**
 * Frequency Visualization Component
 */
export const FrequencyVisualization: React.FC<{
  frequency: number;
  color: Color;
}> = ({ frequency, color }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Frequency-based animation
      const normalizedFreq = frequency / 1000; // Normalize to 0-1 range
      const waveSpeed = normalizedFreq * 10;
      
      groupRef.current.children.forEach((child, index) => {
        const offset = index * 0.2;
        const wave = Math.sin(time * waveSpeed + offset) * 0.1;
        child.position.y = wave;
        
        // Color intensity based on wave
        if ('material' in child && child.material) {
          const material = child.material as any;
          if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = 0.2 + Math.abs(wave) * 2;
          }
        }
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[(i - 3.5) * 0.3, 0, 0.3]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Training Interface Component
 */
export const TrainingInterface: React.FC<{
  trainingData: Map<string, TrainingProgress>;
  consciousness: ConsciousnessState;
}> = ({ trainingData, consciousness }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.1;
      
      // Consciousness-responsive opacity
      groupRef.current.children.forEach(child => {
        if ('material' in child && child.material) {
          const material = child.material as any;
          if (material.opacity !== undefined) {
            material.opacity = 0.3 + consciousness.awarenessLevel * 0.4;
          }
        }
      });
    }
  });
  
  return (
    <group ref={groupRef} position={[0, 3, 0]}>
      {/* Training progress display */}
      {Array.from(trainingData.entries()).map(([gesture, progress], index) => (
        <group key={gesture} position={[(index - 2) * 1.5, 0, 0]}>
          {/* Progress ring */}
          <mesh>
            <ringGeometry args={[0.3, 0.35, 32, 1, 0, progress.mastery * Math.PI * 2]} />
            <meshBasicMaterial 
              color={progress.mastery > 0.8 ? 0x00ff00 : progress.mastery > 0.5 ? 0xffff00 : 0xff0000}
              transparent
              opacity={0.6}
            />
          </mesh>
          
          {/* Gesture icon */}
          <mesh position={[0, 0, 0.1]}>
            <circleGeometry args={[0.2, 16]} />
            <meshBasicMaterial 
              color={0xffffff}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Mastery indicator */}
          <mesh position={[0, -0.6, 0]}>
            <boxGeometry args={[progress.mastery * 0.8, 0.1, 0.05]} />
            <meshBasicMaterial 
              color={progress.mastery > 0.8 ? 0x00ff00 : progress.mastery > 0.5 ? 0xffff00 : 0xff0000}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      ))}
      
      {/* Training instructions */}
      <mesh position={[0, -1.5, 0]}>
        <planeGeometry args={[4, 0.5]} />
        <meshBasicMaterial 
          color={0x333333}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

/**
 * Gesture Confidence Indicator
 */
export const GestureConfidenceIndicator: React.FC<{
  confidence: number;
  position: Vector3;
}> = ({ confidence, position }) => {
  const meshRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      
      // Pulse based on confidence
      const pulse = 1 + Math.sin(time * 10) * confidence * 0.3;
      meshRef.current.scale.setScalar(pulse);
      
      // Color based on confidence
      const color = new Color().setHSL(confidence * 0.3, 1, 0.5);
      meshRef.current.material.color.copy(color);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshBasicMaterial 
        transparent
        opacity={confidence}
      />
    </mesh>
  );
};

export default {
  TrailVisualization,
  GestureVisualization,
  FrequencyVisualization,
  TrainingInterface,
  GestureConfidenceIndicator,
};

/**
 * Phase 4 Integration Component
 * 
 * Integrates all Phase 4 missing components:
 * - Botanical Sigil-Flower System with archetypal hues
 * - Split Circle System Interface for data visualization
 * 
 * This component completes Phase 4 requirements
 */

'use client';

import BotanicalSigilFlowerSystem from '@/components/ui/BotanicalSigilFlowerSystem';
import SplitCircleSystemInterface from '@/components/ui/SplitCircleSystemInterface';
import { useConsciousness } from '@/hooks/useConsciousness';
import type { ConsciousnessState } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useState } from 'react';
import * as THREE from 'three';

interface Phase4IntegrationProps {
  position?: [number, number, number];
  size?: number;
  consciousness: ConsciousnessState;
  mode?: 'botanical' | 'data' | 'integrated';
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
}

interface CircleSegment {
  id: string;
  startAngle: number;
  endAngle: number;
  value: number;
  color: THREE.Color;
  label: string;
  data: unknown;
}

export const Phase4Integration: React.FC<Phase4IntegrationProps> = ({
  position = [0, 0, 0],
  size = 4,
  consciousness,
  mode = 'integrated',
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [createdSigils, setCreatedSigils] = useState<SigilFlower[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<CircleSegment | null>(null);
  const [transitionPhase, setTransitionPhase] = useState(0);
  const { consciousnessLevel } = useConsciousness();

  // Consciousness data for visualization
  const consciousnessData = {
    awareness: consciousnessLevel * 100,
    intuition: Math.sin(Date.now() * 0.001) * 50 + 50,
    creativity: Math.cos(Date.now() * 0.0015) * 40 + 60,
    wisdom: consciousnessLevel * 80 + 20,
    compassion: Math.sin(Date.now() * 0.0008) * 30 + 70,
    clarity: consciousnessLevel * 90 + 10,
    balance: Math.cos(Date.now() * 0.0012) * 35 + 65,
    presence: consciousnessLevel * 85 + 15,
  };

  // Handle sigil creation
  const handleSigilCreated = (sigil: SigilFlower) => {
    setCreatedSigils(prev => [...prev, sigil]);
    console.log('New sigil created:', sigil.archetype, 'consciousness:', sigil.consciousness);
  };

  // Handle segment selection
  const handleSegmentClick = (segment: CircleSegment) => {
    setSelectedSegment(segment);
    console.log('Segment selected:', segment.label, 'value:', segment.value);
  };

  // Animation loop
  useFrame((state, delta) => {
    // Update transition phase for mode switching
    setTransitionPhase(prev => Math.min(prev + delta * 0.5, 1.0));

    // Animate group
    if (groupRef.current) {
      // Gentle rotation based on consciousness level
      groupRef.current.rotation.y += delta * 0.05 * consciousnessLevel;
      
      // Breathing scale effect
      const breathScale = 1.0 + Math.sin(state.clock.getElapsedTime() * 2) * 0.02;
      groupRef.current.scale.setScalar(breathScale);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Botanical Mode or Integrated */}
      {(mode === 'botanical' || mode === 'integrated') && (
        <group position={mode === 'integrated' ? [-size * 0.3, 0, 0] : [0, 0, 0]}>
          <BotanicalSigilFlowerSystem
            position={[0, 0, 0]}
            size={mode === 'integrated' ? size * 0.6 : size}
            consciousness={consciousness}
            onSigilCreated={handleSigilCreated}
            archetypalMode={true}
          />
          
          {/* Botanical mode indicator */}
          {mode === 'botanical' && (
            <mesh position={[0, size * 0.8, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#4CAF50" />
            </mesh>
          )}
        </group>
      )}

      {/* Data Visualization Mode or Integrated */}
      {(mode === 'data' || mode === 'integrated') && (
        <group position={mode === 'integrated' ? [size * 0.3, 0, 0] : [0, 0, 0]}>
          <SplitCircleSystemInterface
            position={[0, 0, 0]}
            radius={mode === 'integrated' ? size * 0.4 : size * 0.6}
            consciousness={consciousness}
            data={consciousnessData}
            onSegmentClick={handleSegmentClick}
            animated={true}
          />
          
          {/* Data mode indicator */}
          {mode === 'data' && (
            <mesh position={[0, size * 0.8, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#2196F3" />
            </mesh>
          )}
        </group>
      )}

      {/* Integration Connections (only in integrated mode) */}
      {mode === 'integrated' && (
        <group>
          {/* Connection line between botanical and data systems */}
          <mesh position={[0, 0, 0.05]}>
            <cylinderGeometry args={[0.01, 0.01, size * 0.6]} />
            <meshBasicMaterial 
              color="#FFD700"
              transparent
              opacity={0.6 + consciousnessLevel * 0.4}
            />
          </mesh>
          
          {/* Data flow particles */}
          {Array.from({ length: 8 }, (_, i) => {
            const t = (Date.now() * 0.001 + i * 0.5) % 1;
            const x = (t - 0.5) * size * 0.6;
            const y = Math.sin(t * Math.PI * 4) * 0.1;
            const z = 0.1;
            
            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.01, 4, 4]} />
                <meshBasicMaterial 
                  color="#FFD700"
                  transparent
                  opacity={0.8}
                />
              </mesh>
            );
          })}
          
          {/* Central integration hub */}
          <mesh position={[0, 0, 0.1]}>
            <octahedronGeometry args={[0.1]} />
            <meshBasicMaterial 
              color="#E91E63"
              transparent
              opacity={0.8 + Math.sin(Date.now() * 0.002) * 0.2}
            />
          </mesh>
        </group>
      )}

      {/* Status Display */}
      <group position={[0, -size * 0.8, 0]}>
        {/* Created sigils count */}
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.02, 0.02, createdSigils.length * 0.05]} />
          <meshBasicMaterial color="#4CAF50" transparent opacity={0.7} />
        </mesh>
        
        {/* Selected segment indicator */}
        {selectedSegment && (
          <mesh position={[0.3, 0, 0]}>
            <boxGeometry args={[0.02, 0.02, selectedSegment.value / 100]} />
            <meshBasicMaterial color="#2196F3" transparent opacity={0.7} />
          </mesh>
        )}
        
        {/* Consciousness level indicator */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.02, 0.02, consciousnessLevel]} />
          <meshBasicMaterial 
            color="#E6E6FA"
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Phase 4 completion indicator */}
      <group position={[0, size * 0.9, 0]}>
        <mesh>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial 
            color="#00E676"
            transparent
            opacity={0.9}
          />
        </mesh>
        
        {/* Completion particles */}
        {Array.from({ length: 6 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 6;
          const radius = 0.15;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const z = Math.sin(Date.now() * 0.001 + i) * 0.05;
          
          return (
            <mesh key={i} position={[x, y, z]}>
              <sphereGeometry args={[0.01, 4, 4]} />
              <meshBasicMaterial 
                color="#00E676"
                transparent
                opacity={0.8 + Math.sin(Date.now() * 0.001 + i) * 0.2}
              />
            </mesh>
          );
        })}
      </group>

      {/* Ambient lighting for Phase 4 */}
      <ambientLight intensity={0.3 + consciousnessLevel * 0.2} />
      <pointLight 
        position={[0, 0, 2]} 
        intensity={0.6 + transitionPhase * 0.4}
        color="#E6E6FA"
        distance={size * 2}
      />
    </group>
  );
};

export default Phase4Integration;

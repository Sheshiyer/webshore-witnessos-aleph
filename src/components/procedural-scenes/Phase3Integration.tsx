/**
 * Phase 3 Integration Component
 * 
 * Combines all Phase 3 moodboard enhancements:
 * - Panel 1: Octagonal Portal Cave with Breathing Sun
 * - Panel 2: Dual Spiral Vortex Breath System  
 * - Panel 3: Spiral Eclipse Initiation Sequence
 * 
 * This component orchestrates the complete Phase 3 experience
 */

'use client';

import BreathingSun from '@/components/procedural-scenes/BreathingSun';
import DualSpiralVortex from '@/components/procedural-scenes/DualSpiralVortex';
import SpiralEclipseInitiation from '@/components/procedural-scenes/SpiralEclipseInitiation';
import { useConsciousness } from '@/hooks/useConsciousness';
import type { BreathState, ConsciousnessState } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface Phase3IntegrationProps {
  position?: [number, number, number];
  size?: number;
  breathState: BreathState;
  consciousness: ConsciousnessState;
  autoProgress?: boolean;
}

export const Phase3Integration: React.FC<Phase3IntegrationProps> = ({
  position = [0, 0, 0],
  size = 5,
  breathState,
  consciousness,
  autoProgress = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [currentPhase, setCurrentPhase] = useState<'portal' | 'vortex' | 'initiation'>('portal');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [initiationActive, setInitiationActive] = useState(false);
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Phase progression logic
  useEffect(() => {
    if (!autoProgress) return;

    const progressInterval = setInterval(() => {
      setPhaseProgress(prev => {
        const next = prev + 0.005; // Slow progression
        
        // Phase transitions based on consciousness level and breath coherence
        const breathCoherence = Math.abs(Math.sin(breathPhase * Math.PI * 2));
        const readyForNext = consciousnessLevel > 0.3 && breathCoherence > 0.6;
        
        if (next >= 1.0 && readyForNext) {
          // Progress to next phase
          if (currentPhase === 'portal') {
            setCurrentPhase('vortex');
            return 0;
          } else if (currentPhase === 'vortex') {
            setCurrentPhase('initiation');
            setInitiationActive(true);
            return 0;
          }
          return 1.0;
        }
        
        return next;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [autoProgress, currentPhase, consciousnessLevel, breathPhase]);

  // Handle initiation completion
  const handleInitiationComplete = () => {
    console.log('Phase 3 Initiation Complete - Ready for Phase 4');
    // Could trigger Phase 4 transition here
  };

  // Animation loop
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Gentle rotation based on consciousness level
      groupRef.current.rotation.y += delta * 0.1 * consciousnessLevel;
      
      // Phase-based positioning
      const phaseOffset = phaseProgress * 0.5;
      groupRef.current.position.z = Math.sin(state.clock.getElapsedTime() * 0.5) * phaseOffset;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Phase 1: Octagonal Portal Cave with Breathing Sun */}
      {(currentPhase === 'portal' || currentPhase === 'vortex') && (
        <group position={[0, 0, 0]}>
          <BreathingSun
            position={[0, 0, 0]}
            baseRadius={size * 0.2}
            breathState={breathState}
            consciousness={consciousness}
            warmEarthTones={true}
          />
          
          {/* Portal enhancement indicators */}
          <mesh>
            <ringGeometry args={[size * 0.8, size * 1.0, 8]} />
            <meshBasicMaterial 
              color="#8B4513" // Saddle brown for earth tones
              transparent
              opacity={0.3 + phaseProgress * 0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}

      {/* Phase 2: Dual Spiral Vortex Breath System */}
      {(currentPhase === 'vortex' || currentPhase === 'initiation') && (
        <group position={[0, 0, currentPhase === 'vortex' ? 0 : -2]}>
          <DualSpiralVortex
            position={[0, 0, 0]}
            size={size * 0.6}
            breathState={breathState}
            consciousness={consciousness}
            discoveryMode={true}
          />
          
          {/* Vortex transition effects */}
          {currentPhase === 'vortex' && (
            <mesh>
              <torusGeometry args={[size * 0.7, size * 0.1, 16, 32]} />
              <meshBasicMaterial 
                color="#4A90E2" // Discovery blue
                transparent
                opacity={0.4 + Math.sin(Date.now() * 0.001) * 0.2}
              />
            </mesh>
          )}
        </group>
      )}

      {/* Phase 3: Spiral Eclipse Initiation Sequence */}
      {currentPhase === 'initiation' && (
        <group position={[0, 0, 2]}>
          <SpiralEclipseInitiation
            position={[0, 0, 0]}
            size={size * 0.8}
            breathState={breathState}
            consciousness={consciousness}
            initiationActive={initiationActive}
            onInitiationComplete={handleInitiationComplete}
          />
        </group>
      )}

      {/* Phase progression indicators */}
      <group position={[0, -size * 1.2, 0]}>
        {/* Portal phase indicator */}
        <mesh position={[-size * 0.4, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color={currentPhase === 'portal' ? "#FFD700" : "#8B4513"}
            transparent
            opacity={currentPhase === 'portal' ? 1.0 : 0.5}
          />
        </mesh>
        
        {/* Vortex phase indicator */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color={currentPhase === 'vortex' ? "#4A90E2" : "#6A5ACD"}
            transparent
            opacity={currentPhase === 'vortex' ? 1.0 : 0.5}
          />
        </mesh>
        
        {/* Initiation phase indicator */}
        <mesh position={[size * 0.4, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color={currentPhase === 'initiation' ? "#FFD700" : "#1A1A1A"}
            transparent
            opacity={currentPhase === 'initiation' ? 1.0 : 0.5}
          />
        </mesh>
        
        {/* Progress line */}
        <mesh>
          <boxGeometry args={[size * 0.8 * phaseProgress, 0.01, 0.01]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Consciousness level indicator */}
      <group position={[size * 1.2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, size * consciousnessLevel, 8]} />
          <meshBasicMaterial 
            color="#E6E6FA" // Lavender for consciousness
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Consciousness particles */}
        {Array.from({ length: Math.floor(consciousnessLevel * 10) }, (_, i) => (
          <mesh key={i} position={[0, (i - 5) * 0.1, 0]}>
            <sphereGeometry args={[0.01, 4, 4]} />
            <meshBasicMaterial 
              color="#DDA0DD" // Plum
              transparent
              opacity={0.8 + Math.sin(Date.now() * 0.001 + i) * 0.2}
            />
          </mesh>
        ))}
      </group>

      {/* Breath coherence indicator */}
      <group position={[-size * 1.2, 0, 0]}>
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          const radius = 0.3;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const breathIntensity = Math.sin(breathPhase * Math.PI * 2 + i * 0.5) * 0.5 + 0.5;
          
          return (
            <mesh key={i} position={[x, y, 0]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial 
                color="#FF6347" // Tomato for breath
                transparent
                opacity={breathIntensity}
              />
            </mesh>
          );
        })}
      </group>

      {/* Ambient lighting for the entire phase */}
      <ambientLight intensity={0.2 + consciousnessLevel * 0.3} />
      <pointLight 
        position={[0, 0, 5]} 
        intensity={0.5 + phaseProgress * 0.5}
        color={
          currentPhase === 'portal' ? "#FF6B35" :
          currentPhase === 'vortex' ? "#4A90E2" :
          "#FFD700"
        }
        distance={size * 3}
      />
    </group>
  );
};

export default Phase3Integration;

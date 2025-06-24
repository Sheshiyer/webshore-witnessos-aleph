/**
 * Breathing Sun Effect Component
 *
 * Pulsing inner circle synchronized to breath (breathing sun effect)
 * Part of Phase 3.1 - Octagonal Portal Cave Enhancement
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import type { BreathState, ConsciousnessState } from '@/types';
import { SACRED_MATHEMATICS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface BreathingSunProps {
  position?: [number, number, number];
  baseRadius?: number;
  breathState: BreathState;
  consciousness: ConsciousnessState;
  warmEarthTones?: boolean;
}

export const BreathingSun: React.FC<BreathingSunProps> = ({
  position = [0, 0, 0],
  baseRadius = 1.5,
  breathState: _breathState,
  consciousness: _consciousness,
  warmEarthTones = true,
}) => {
  const sunMeshRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Warm earth tone colors for grounding experience
  const earthTones = useMemo(
    () => ({
      core: new THREE.Color(warmEarthTones ? '#FF6B35' : '#FFD700'), // Warm orange or gold
      inner: new THREE.Color(warmEarthTones ? '#D2691E' : '#FFA500'), // Saddle brown or orange
      outer: new THREE.Color(warmEarthTones ? '#8B4513' : '#FF8C00'), // Saddle brown or dark orange
      glow: new THREE.Color(warmEarthTones ? '#CD853F' : '#FFFF00'), // Peru or yellow
    }),
    [warmEarthTones]
  );

  // Breathing sun shader material
  const breathingSunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        breathPhase: { value: breathPhase },
        consciousnessLevel: { value: consciousnessLevel },
        coreColor: { value: earthTones.core },
        glowColor: { value: earthTones.glow },
        baseRadius: { value: baseRadius },
      },
      vertexShader: `
        uniform float time;
        uniform float breathPhase;
        uniform float consciousnessLevel;
        uniform float baseRadius;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vBreathIntensity;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Calculate breath intensity using golden ratio
          float phi = 1.618033988749;
          float breathCycle = sin(breathPhase * 6.28318) * 0.5 + 0.5;
          vBreathIntensity = breathCycle * consciousnessLevel;
          
          // Breathing expansion using golden ratio scaling
          vec3 pos = position;
          float expansion = 1.0 + (vBreathIntensity * 0.3 / phi);
          pos *= expansion;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 coreColor;
        uniform vec3 glowColor;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vBreathIntensity;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Create breathing sun pattern
          float sunPattern = 1.0 - smoothstep(0.0, 0.5, dist);
          
          // Add breathing pulse
          float pulse = sin(time * 2.0 + dist * 10.0) * 0.1 + 0.9;
          sunPattern *= pulse * (1.0 + vBreathIntensity * 0.5);
          
          // Create warm glow effect
          vec3 color = mix(coreColor, glowColor, dist);
          color *= sunPattern;
          
          // Add consciousness-responsive intensity
          float intensity = 0.7 + vBreathIntensity * 0.3;
          color *= intensity;
          
          gl_FragColor = vec4(color, sunPattern * 0.8);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, [breathPhase, consciousnessLevel, earthTones, baseRadius]);

  // Animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Update shader uniforms
    breathingSunMaterial.uniforms.time.value = time;
    breathingSunMaterial.uniforms.breathPhase.value = breathPhase;
    breathingSunMaterial.uniforms.consciousnessLevel.value = consciousnessLevel;

    // Breathing sun core animation
    if (sunMeshRef.current) {
      // Breath-synchronized scaling using golden ratio
      const phi = SACRED_MATHEMATICS.PHI;
      const breathIntensity = Math.sin(breathPhase * Math.PI * 2) * 0.5 + 0.5;
      const scale = 1.0 + (breathIntensity * 0.4) / phi;
      sunMeshRef.current.scale.setScalar(scale);

      // Gentle rotation based on consciousness level
      sunMeshRef.current.rotation.z += delta * 0.1 * consciousnessLevel;
    }

    // Inner ring animation
    if (innerRingRef.current) {
      const breathScale = 1.0 + Math.sin(breathPhase * Math.PI * 2) * 0.2;
      innerRingRef.current.scale.setScalar(breathScale);
      innerRingRef.current.rotation.z -= delta * 0.05;
    }

    // Outer ring animation
    if (outerRingRef.current) {
      const breathScale = 1.0 + Math.sin(breathPhase * Math.PI * 2 + Math.PI) * 0.15;
      outerRingRef.current.scale.setScalar(breathScale);
      outerRingRef.current.rotation.z += delta * 0.03;
    }
  });

  return (
    <group position={position}>
      {/* Core breathing sun */}
      <mesh ref={sunMeshRef}>
        <circleGeometry args={[baseRadius, 32]} />
        <primitive object={breathingSunMaterial} />
      </mesh>

      {/* Inner breathing ring */}
      <mesh ref={innerRingRef}>
        <ringGeometry args={[baseRadius * 1.2, baseRadius * 1.4, 32]} />
        <meshBasicMaterial
          color={earthTones.inner}
          transparent
          opacity={0.4 + consciousnessLevel * 0.3}
        />
      </mesh>

      {/* Outer breathing ring */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[baseRadius * 1.6, baseRadius * 1.8, 32]} />
        <meshBasicMaterial
          color={earthTones.outer}
          transparent
          opacity={0.2 + consciousnessLevel * 0.2}
        />
      </mesh>

      {/* Consciousness glow particles */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        const radius = baseRadius * 2.2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <mesh key={i} position={[x, y, 0.1]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial
              color={earthTones.glow}
              transparent
              opacity={0.6 + Math.sin(Date.now() * 0.001 + i) * 0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export default BreathingSun;

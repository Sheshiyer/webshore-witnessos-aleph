/**
 * Dual Spiral Vortex Breath System
 *
 * Phase 3.2 - Moodboard Panel 2: Dual Spiral Vortex Breath System
 * - Create dual spiral vortex visualizations for breath modulation
 * - Implement blue-violet color scheme for discovery states
 * - Add floral geometry emergence from fractals during breath cycles
 * - Build symbolic blooming animations triggered by breath coherence
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import type { BreathState, ConsciousnessState } from '@/types';
import { SACRED_MATHEMATICS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface DualSpiralVortexProps {
  position?: [number, number, number];
  size?: number;
  breathState: BreathState;
  consciousness: ConsciousnessState;
  discoveryMode?: boolean;
}

export const DualSpiralVortex: React.FC<DualSpiralVortexProps> = ({
  position = [0, 0, 0],
  size = 2,
  breathState: _breathState,
  consciousness: _consciousness,
  discoveryMode = true,
}) => {
  const leftSpiralRef = useRef<THREE.Group>(null);
  const rightSpiralRef = useRef<THREE.Group>(null);
  const floralGeometryRef = useRef<THREE.Group>(null);
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Blue-violet color scheme for discovery states
  const discoveryColors = useMemo(
    () => ({
      primary: new THREE.Color(discoveryMode ? '#4A90E2' : '#8A2BE2'), // Blue or Blue-violet
      secondary: new THREE.Color(discoveryMode ? '#6A5ACD' : '#9370DB'), // Slate blue or Medium slate blue
      accent: new THREE.Color(discoveryMode ? '#7B68EE' : '#BA55D3'), // Medium slate blue or Medium orchid
      floral: new THREE.Color(discoveryMode ? '#9932CC' : '#DA70D6'), // Dark orchid or Orchid
      glow: new THREE.Color(discoveryMode ? '#E6E6FA' : '#DDA0DD'), // Lavender or Plum
    }),
    [discoveryMode]
  );

  // Create spiral geometry
  const createSpiralGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const phi = SACRED_MATHEMATICS.PHI;

    // Generate golden spiral points
    for (let i = 0; i <= 100; i++) {
      const t = i * 0.1;
      const radius = t * 0.1;
      const angle = t * phi;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = t * 0.05 - 2.5; // Spiral upward

      points.push(new THREE.Vector3(x, y, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  // Create floral geometry that emerges during breath cycles
  const createFloralGeometry = useMemo(() => {
    const petals: THREE.BufferGeometry[] = [];
    const petalCount = 8;

    for (let i = 0; i < petalCount; i++) {
      const angle = (i * Math.PI * 2) / petalCount;
      const points: THREE.Vector3[] = [];

      // Create petal shape using parametric equations
      for (let j = 0; j <= 20; j++) {
        const t = j / 20;
        const petalRadius = Math.sin(t * Math.PI) * 0.5;
        const x = Math.cos(angle) * petalRadius * (1 + t * 0.5);
        const y = Math.sin(angle) * petalRadius * (1 + t * 0.5);
        const z = Math.sin(t * Math.PI) * 0.2;

        points.push(new THREE.Vector3(x, y, z));
      }

      petals.push(new THREE.BufferGeometry().setFromPoints(points));
    }

    return petals;
  }, []);

  // Dual spiral vortex shader material
  const vortexMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        breathPhase: { value: breathPhase },
        consciousnessLevel: { value: consciousnessLevel },
        primaryColor: { value: discoveryColors.primary },
        secondaryColor: { value: discoveryColors.secondary },
        glowColor: { value: discoveryColors.glow },
      },
      vertexShader: `
        uniform float time;
        uniform float breathPhase;
        uniform float consciousnessLevel;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vVortexIntensity;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Calculate vortex intensity based on breath and consciousness
          float breathCycle = sin(breathPhase * 6.28318) * 0.5 + 0.5;
          vVortexIntensity = breathCycle * consciousnessLevel;
          
          // Spiral transformation
          vec3 pos = position;
          float spiralAngle = time + length(pos.xy) * 2.0;
          float spiralRadius = length(pos.xy);
          
          pos.x = cos(spiralAngle) * spiralRadius;
          pos.y = sin(spiralAngle) * spiralRadius;
          pos.z += sin(time + spiralRadius * 5.0) * 0.1 * vVortexIntensity;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 primaryColor;
        uniform vec3 secondaryColor;
        uniform vec3 glowColor;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vVortexIntensity;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Create vortex pattern
          float angle = atan(vUv.y - center.y, vUv.x - center.x);
          float spiral = sin(angle * 3.0 + dist * 10.0 - time * 2.0);
          
          // Blend colors based on vortex intensity
          vec3 color = mix(primaryColor, secondaryColor, spiral * 0.5 + 0.5);
          color = mix(color, glowColor, vVortexIntensity * 0.3);
          
          // Add breathing pulse
          float pulse = 1.0 + sin(time * 3.0 + dist * 8.0) * 0.2 * vVortexIntensity;
          color *= pulse;
          
          // Create transparency based on distance from center
          float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
          alpha *= 0.7 + vVortexIntensity * 0.3;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, [breathPhase, consciousnessLevel, discoveryColors]);

  // Animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Update shader uniforms
    vortexMaterial.uniforms.time.value = time;
    vortexMaterial.uniforms.breathPhase.value = breathPhase;
    vortexMaterial.uniforms.consciousnessLevel.value = consciousnessLevel;

    // Animate left spiral (clockwise)
    if (leftSpiralRef.current) {
      leftSpiralRef.current.rotation.z += delta * 0.5 * (1 + consciousnessLevel);
      const breathScale = 1.0 + Math.sin(breathPhase * Math.PI * 2) * 0.3;
      leftSpiralRef.current.scale.setScalar(breathScale);
    }

    // Animate right spiral (counter-clockwise)
    if (rightSpiralRef.current) {
      rightSpiralRef.current.rotation.z -= delta * 0.5 * (1 + consciousnessLevel);
      const breathScale = 1.0 + Math.sin(breathPhase * Math.PI * 2 + Math.PI) * 0.3;
      rightSpiralRef.current.scale.setScalar(breathScale);
    }

    // Animate floral geometry emergence
    if (floralGeometryRef.current) {
      // Floral blooming triggered by breath coherence
      const breathCoherence = Math.abs(Math.sin(breathPhase * Math.PI * 2));
      const bloomScale = breathCoherence * consciousnessLevel;

      floralGeometryRef.current.scale.setScalar(bloomScale);
      floralGeometryRef.current.rotation.y += delta * 0.2;

      // Make petals visible during high coherence
      floralGeometryRef.current.visible = breathCoherence > 0.7;
    }
  });

  return (
    <group position={position}>
      {/* Left Spiral Vortex */}
      <group ref={leftSpiralRef} position={[-size * 0.3, 0, 0]}>
        <line>
          <primitive object={createSpiralGeometry} />
          <lineBasicMaterial color={discoveryColors.primary} linewidth={2} />
        </line>

        {/* Spiral particles */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const radius = size * 0.4;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <mesh key={i} position={[x, y, Math.sin(angle * 3) * 0.2]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color={discoveryColors.accent} transparent opacity={0.8} />
            </mesh>
          );
        })}
      </group>

      {/* Right Spiral Vortex */}
      <group ref={rightSpiralRef} position={[size * 0.3, 0, 0]}>
        <line>
          <primitive object={createSpiralGeometry} />
          <lineBasicMaterial color={discoveryColors.secondary} linewidth={2} />
        </line>

        {/* Spiral particles */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 12;
          const radius = size * 0.4;
          const x = Math.cos(-angle) * radius; // Counter-clockwise
          const y = Math.sin(-angle) * radius;

          return (
            <mesh key={i} position={[x, y, Math.sin(-angle * 3) * 0.2]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial color={discoveryColors.accent} transparent opacity={0.8} />
            </mesh>
          );
        })}
      </group>

      {/* Floral Geometry Emergence */}
      <group ref={floralGeometryRef} position={[0, 0, 0.5]}>
        {createFloralGeometry.map((petal, index) => (
          <line key={index}>
            <primitive object={petal} />
            <lineBasicMaterial
              color={discoveryColors.floral}
              transparent
              opacity={0.6 + Math.sin(Date.now() * 0.001 + index) * 0.2}
            />
          </line>
        ))}

        {/* Central bloom */}
        <mesh>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshBasicMaterial color={discoveryColors.glow} transparent opacity={0.8} />
        </mesh>
      </group>

      {/* Vortex interaction field */}
      <mesh>
        <planeGeometry args={[size * 2, size * 2]} />
        <primitive object={vortexMaterial} />
      </mesh>
    </group>
  );
};

export default DualSpiralVortex;

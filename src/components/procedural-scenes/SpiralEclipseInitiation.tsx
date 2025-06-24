/**
 * Spiral Eclipse Initiation Sequence
 *
 * Phase 3.3 - Moodboard Panel 3: Spiral Eclipse Initiation Sequence
 * - Create silhouette-based initiation cinematics
 * - Implement golden spiral navigation compass
 * - Add ambient glow effects for personal power awakening
 * - Build witness perspective mode transitions
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import type { BreathState, ConsciousnessState } from '@/types';
import { SACRED_MATHEMATICS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface SpiralEclipseInitiationProps {
  position?: [number, number, number];
  size?: number;
  breathState: BreathState;
  consciousness: ConsciousnessState;
  initiationActive?: boolean;
  onInitiationComplete?: () => void;
}

export const SpiralEclipseInitiation: React.FC<SpiralEclipseInitiationProps> = ({
  position = [0, 0, 0],
  size = 3,
  breathState: _breathState,
  consciousness: _consciousness,
  initiationActive = false,
  onInitiationComplete,
}) => {
  const eclipseRef = useRef<THREE.Group>(null);
  const spiralCompassRef = useRef<THREE.Group>(null);
  const silhouetteRef = useRef<THREE.Mesh>(null);
  const ambientGlowRef = useRef<THREE.PointLight>(null);

  const [initiationPhase, setInitiationPhase] = useState(0); // 0-1 progress
  const [witnessMode, setWitnessMode] = useState(false);
  const { breathPhase, consciousnessLevel } = useConsciousness();

  // Initiation sequence colors
  const initiationColors = useMemo(
    () => ({
      eclipse: new THREE.Color('#1A1A1A'), // Deep shadow
      spiral: new THREE.Color('#FFD700'), // Golden spiral
      glow: new THREE.Color('#FFA500'), // Ambient orange glow
      witness: new THREE.Color('#E6E6FA'), // Lavender for witness mode
      power: new THREE.Color('#FF6347'), // Tomato for personal power
    }),
    []
  );

  // Create golden spiral navigation compass
  const createSpiralCompass = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const phi = SACRED_MATHEMATICS.PHI;

    // Generate golden spiral for compass
    for (let i = 0; i <= 200; i++) {
      const t = i * 0.05;
      const radius = t * 0.02;
      const angle = t * phi;

      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = 0;

      points.push(new THREE.Vector3(x, y, z));
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, []);

  // Create silhouette geometry for initiation cinematics
  const createSilhouetteGeometry = useMemo(() => {
    // Create a human-like silhouette using simple shapes
    const silhouetteGeometry = new THREE.RingGeometry(size * 0.8, size * 1.0, 32);
    return silhouetteGeometry;
  }, [size]);

  // Eclipse shader material
  const eclipseMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        initiationPhase: { value: initiationPhase },
        breathPhase: { value: breathPhase },
        consciousnessLevel: { value: consciousnessLevel },
        eclipseColor: { value: initiationColors.eclipse },
        spiralColor: { value: initiationColors.spiral },
        glowColor: { value: initiationColors.glow },
        witnessMode: { value: witnessMode ? 1.0 : 0.0 },
      },
      vertexShader: `
        uniform float time;
        uniform float initiationPhase;
        uniform float breathPhase;
        uniform float consciousnessLevel;
        uniform float witnessMode;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vInitiationIntensity;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Calculate initiation intensity
          float breathCycle = sin(breathPhase * 6.28318) * 0.5 + 0.5;
          vInitiationIntensity = initiationPhase * breathCycle * consciousnessLevel;
          
          // Eclipse transformation
          vec3 pos = position;
          
          // Witness mode elevation
          if (witnessMode > 0.5) {
            pos.z += sin(time + length(pos.xy) * 3.0) * 0.2;
          }
          
          // Initiation scaling
          pos *= 1.0 + vInitiationIntensity * 0.5;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float initiationPhase;
        uniform vec3 eclipseColor;
        uniform vec3 spiralColor;
        uniform vec3 glowColor;
        uniform float witnessMode;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vInitiationIntensity;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Create eclipse effect
          float eclipse = 1.0 - smoothstep(0.3, 0.5, dist);
          eclipse *= (1.0 - smoothstep(0.1, 0.3, dist));
          
          // Add spiral pattern
          float angle = atan(vUv.y - center.y, vUv.x - center.x);
          float spiral = sin(angle * 5.0 + dist * 20.0 - time * 2.0);
          
          // Blend colors based on initiation phase
          vec3 color = mix(eclipseColor, spiralColor, spiral * 0.5 + 0.5);
          
          // Add witness mode glow
          if (witnessMode > 0.5) {
            color = mix(color, glowColor, 0.3);
          }
          
          // Apply initiation intensity
          color *= 0.5 + vInitiationIntensity * 0.5;
          
          // Create transparency
          float alpha = eclipse * (0.6 + vInitiationIntensity * 0.4);
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
  }, [initiationPhase, breathPhase, consciousnessLevel, witnessMode, initiationColors]);

  // Initiation sequence logic
  useEffect(() => {
    if (initiationActive) {
      const interval = setInterval(() => {
        setInitiationPhase(prev => {
          const next = prev + 0.01;
          if (next >= 1.0) {
            setWitnessMode(true);
            if (onInitiationComplete) {
              onInitiationComplete();
            }
            return 1.0;
          }
          return next;
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [initiationActive, onInitiationComplete]);

  // Animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Update shader uniforms
    eclipseMaterial.uniforms.time.value = time;
    eclipseMaterial.uniforms.initiationPhase.value = initiationPhase;
    eclipseMaterial.uniforms.breathPhase.value = breathPhase;
    eclipseMaterial.uniforms.consciousnessLevel.value = consciousnessLevel;
    eclipseMaterial.uniforms.witnessMode.value = witnessMode ? 1.0 : 0.0;

    // Animate eclipse
    if (eclipseRef.current) {
      eclipseRef.current.rotation.z += delta * 0.1 * (1 + initiationPhase);

      // Eclipse scaling during initiation
      const eclipseScale = 1.0 + initiationPhase * 0.5;
      eclipseRef.current.scale.setScalar(eclipseScale);
    }

    // Animate spiral compass
    if (spiralCompassRef.current) {
      spiralCompassRef.current.rotation.z += delta * 0.3 * (1 + consciousnessLevel);

      // Compass breathing
      const breathScale = 1.0 + Math.sin(breathPhase * Math.PI * 2) * 0.2;
      spiralCompassRef.current.scale.setScalar(breathScale);
    }

    // Animate silhouette
    if (silhouetteRef.current) {
      // Silhouette emergence during initiation
      const silhouetteOpacity = initiationPhase * 0.8;
      (silhouetteRef.current.material as THREE.MeshBasicMaterial).opacity = silhouetteOpacity;

      // Witness mode elevation
      if (witnessMode) {
        silhouetteRef.current.position.z = Math.sin(time * 0.5) * 0.3;
      }
    }

    // Animate ambient glow
    if (ambientGlowRef.current) {
      // Personal power awakening glow
      const glowIntensity = 0.5 + initiationPhase * 1.5 + Math.sin(time * 2.0) * 0.3;
      ambientGlowRef.current.intensity = glowIntensity;

      // Witness mode color shift
      if (witnessMode) {
        ambientGlowRef.current.color = initiationColors.witness;
      } else {
        ambientGlowRef.current.color = initiationColors.power;
      }
    }
  });

  return (
    <group position={position}>
      {/* Eclipse Core */}
      <group ref={eclipseRef}>
        <mesh>
          <circleGeometry args={[size, 64]} />
          <primitive object={eclipseMaterial} />
        </mesh>
      </group>

      {/* Golden Spiral Navigation Compass */}
      <group ref={spiralCompassRef} position={[0, 0, 0.1]}>
        <line>
          <primitive object={createSpiralCompass} />
          <lineBasicMaterial
            color={initiationColors.spiral}
            transparent
            opacity={0.7 + initiationPhase * 0.3}
            linewidth={2}
          />
        </line>

        {/* Compass cardinal points */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          const radius = size * 0.9;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <mesh key={i} position={[x, y, 0]}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial
                color={initiationColors.spiral}
                transparent
                opacity={0.8 + Math.sin(Date.now() * 0.001 + i) * 0.2}
              />
            </mesh>
          );
        })}
      </group>

      {/* Silhouette for Initiation Cinematics */}
      <mesh ref={silhouetteRef} position={[0, 0, -0.1]}>
        <primitive object={createSilhouetteGeometry} />
        <meshBasicMaterial color={initiationColors.eclipse} transparent opacity={0} />
      </mesh>

      {/* Ambient Glow for Personal Power Awakening */}
      <pointLight
        ref={ambientGlowRef}
        position={[0, 0, 2]}
        intensity={0.5}
        color={initiationColors.power}
        distance={size * 4}
      />

      {/* Witness Perspective Indicators */}
      {witnessMode && (
        <group>
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * Math.PI * 2) / 12;
            const radius = size * 1.5;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const z = Math.sin(angle * 3) * 0.5;

            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial
                  color={initiationColors.witness}
                  transparent
                  opacity={0.6 + Math.sin(Date.now() * 0.001 + i * 0.5) * 0.3}
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

export default SpiralEclipseInitiation;

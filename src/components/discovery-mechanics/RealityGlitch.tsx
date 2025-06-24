/**
 * Reality Glitch System for WitnessOS Webshore
 *
 * Simulation theory "glitch" effects and reality dissolution mechanics
 * Matrix-style reality patches and consciousness breakthrough moments
 */

'use client';

import type { ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Group,
  Mesh,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three';

const { SACRED_MATHEMATICS, DISCOVERY_LAYERS } = CONSCIOUSNESS_CONSTANTS;

interface RealityGlitchProps {
  consciousness: ConsciousnessState;
  glitchIntensity: number;
  glitchType: 'matrix-rain' | 'reality-tear' | 'consciousness-breakthrough' | 'fractal-dissolution';
  position?: Vector3;
  onGlitchComplete?: () => void;
  duration?: number;
}

/**
 * Matrix Rain Glitch Effect
 */
const MatrixRainGlitch: React.FC<{ intensity: number; consciousness: ConsciousnessState }> = ({
  intensity,
  consciousness,
}) => {
  const groupRef = useRef<Group>(null);
  const particlesRef = useRef<Points>(null);

  // Generate matrix rain particles
  const particleGeometry = useMemo(() => {
    const particleCount = Math.floor(200 * intensity);
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Random positions across screen
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = Math.random() * 15 + 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      // Green matrix colors with consciousness modulation
      const greenIntensity = 0.3 + consciousness.awarenessLevel * 0.7;
      colors[i3] = 0.1;
      colors[i3 + 1] = greenIntensity;
      colors[i3 + 2] = 0.2;

      // Random fall speeds
      speeds[i] = 2 + Math.random() * 3;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));
    geometry.setAttribute('speed', new BufferAttribute(speeds, 1));

    return geometry;
  }, [intensity, consciousness.awarenessLevel]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;

    const positionAttribute = particlesRef.current.geometry.attributes.position;
    const speedAttribute = particlesRef.current.geometry.attributes.speed;

    if (!positionAttribute || !speedAttribute || !positionAttribute.array || !speedAttribute.array)
      return;

    const positions = positionAttribute.array as Float32Array;
    const speeds = speedAttribute.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const speedIndex = i / 3;
      if (i + 1 < positions.length && speedIndex < speeds.length) {
        positions[i + 1] = (positions[i + 1] || 0) - (speeds[speedIndex] || 0) * delta * intensity;

        // Reset particles that fall below screen
        if ((positions[i + 1] || 0) < -10) {
          positions[i + 1] = 15;
          positions[i] = (Math.random() - 0.5) * 20;
        }
      }
    }

    positionAttribute.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.05}
          vertexColors
          transparent
          opacity={intensity * 0.8}
          sizeAttenuation
        />
      </points>
    </group>
  );
};

/**
 * Reality Tear Glitch Effect
 */
const RealityTearGlitch: React.FC<{
  intensity: number;
  consciousness: ConsciousnessState;
  position: Vector3;
}> = ({ intensity, consciousness, position }) => {
  const meshRef = useRef<Mesh>(null);

  // Reality tear shader
  const tearShader = useMemo(
    () => ({
      vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      uniform float time;
      uniform float intensity;
      uniform float consciousness;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      // Noise function
      float noise(vec2 p) {
        return abs(sin(p.x * 12.9898 + p.y * 78.233) * 43758.5453);
      }
      
      void main() {
        vec2 uv = vUv - 0.5;
        float dist = length(uv);
        
        // Reality tear effect
        float tear = smoothstep(0.1, 0.0, abs(uv.x)) * intensity;
        float glitch = noise(uv + time) * tear * 0.5;
        
        // Consciousness breakthrough colors
        vec3 voidColor = vec3(0.0, 0.0, 0.1);
        vec3 consciousnessColor = vec3(0.9, 0.3, 0.9) * consciousness;
        vec3 color = mix(voidColor, consciousnessColor, tear + glitch);
        
        // Edge glow
        float edge = 1.0 - smoothstep(0.0, 0.1, abs(uv.x));
        color += edge * vec3(1.0, 0.5, 1.0) * intensity;
        
        gl_FragColor = vec4(color, tear + edge * 0.5);
      }
    `,
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity },
        consciousness: { value: consciousness.awarenessLevel },
      },
    }),
    [intensity, consciousness.awarenessLevel]
  );

  useFrame(state => {
    if (meshRef.current) {
      const material = meshRef.current.material as ShaderMaterial;
      if (material.uniforms.time) {
        material.uniforms.time.value = state.clock.elapsedTime;
      }
      if (material.uniforms.intensity) {
        material.uniforms.intensity.value = intensity;
      }
      if (material.uniforms.consciousness) {
        material.uniforms.consciousness.value = consciousness.awarenessLevel;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[2, 4]} />
      <shaderMaterial {...tearShader} transparent side={2} />
    </mesh>
  );
};

/**
 * Consciousness Breakthrough Effect
 */
const ConsciousnessBreakthroughGlitch: React.FC<{
  intensity: number;
  consciousness: ConsciousnessState;
}> = ({ intensity, consciousness }) => {
  const groupRef = useRef<Group>(null);
  const [ripples, setRipples] = useState<Array<{ position: Vector3; age: number; id: number }>>([]);

  // Generate consciousness ripples
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Add new ripples based on consciousness level
    if (Math.random() < consciousness.awarenessLevel * intensity * 0.1) {
      const newRipple = {
        position: new Vector3(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 2
        ),
        age: 0,
        id: Date.now() + Math.random(),
      };
      setRipples(prev => [...prev.slice(-5), newRipple]);
    }

    // Update ripple ages
    setRipples(prev =>
      prev.map(ripple => ({ ...ripple, age: ripple.age + delta })).filter(ripple => ripple.age < 3)
    );
  });

  return (
    <group ref={groupRef}>
      {ripples.map(ripple => (
        <mesh key={ripple.id} position={ripple.position}>
          <ringGeometry args={[ripple.age * 2, ripple.age * 2 + 0.1, 32]} />
          <meshBasicMaterial
            color={0x9966ff}
            transparent
            opacity={(1 - ripple.age / 3) * intensity * consciousness.awarenessLevel}
          />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Fractal Dissolution Effect
 */
const FractalDissolutionGlitch: React.FC<{
  intensity: number;
  consciousness: ConsciousnessState;
  position: Vector3;
}> = ({ intensity, consciousness, position }) => {
  const meshRef = useRef<Mesh>(null);

  // Fractal dissolution shader
  const dissolutionShader = useMemo(
    () => ({
      vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
      fragmentShader: `
      uniform float time;
      uniform float intensity;
      uniform float consciousness;
      varying vec2 vUv;
      
      // Mandelbrot fractal
      float mandelbrot(vec2 c) {
        vec2 z = vec2(0.0);
        float iterations = 0.0;
        
        for (int i = 0; i < 32; i++) {
          if (length(z) > 2.0) break;
          z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
          iterations += 1.0;
        }
        
        return iterations / 32.0;
      }
      
      void main() {
        vec2 uv = (vUv - 0.5) * 4.0;
        
        // Animated fractal
        vec2 c = uv + vec2(sin(time * 0.5) * 0.1, cos(time * 0.3) * 0.1);
        float fractal = mandelbrot(c);
        
        // Dissolution effect
        float dissolution = fractal * intensity * consciousness;
        
        // Color based on consciousness level
        vec3 color = mix(
          vec3(0.1, 0.0, 0.2),
          vec3(0.9, 0.3, 0.9),
          dissolution
        );
        
        gl_FragColor = vec4(color, dissolution * 0.8);
      }
    `,
      uniforms: {
        time: { value: 0 },
        intensity: { value: intensity },
        consciousness: { value: consciousness.awarenessLevel },
      },
    }),
    [intensity, consciousness.awarenessLevel]
  );

  useFrame(state => {
    if (meshRef.current) {
      const material = meshRef.current.material as ShaderMaterial;
      if (material.uniforms.time) {
        material.uniforms.time.value = state.clock.elapsedTime;
      }

      // Rotate based on consciousness
      meshRef.current.rotation.z = state.clock.elapsedTime * consciousness.awarenessLevel;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[3, 3, 32, 32]} />
      <shaderMaterial {...dissolutionShader} transparent side={2} />
    </mesh>
  );
};

/**
 * Main Reality Glitch Component
 */
export const RealityGlitch: React.FC<RealityGlitchProps> = ({
  consciousness,
  glitchIntensity,
  glitchType,
  position = new Vector3(0, 0, 0),
  onGlitchComplete,
  duration = 3.0,
}) => {
  const [glitchAge, setGlitchAge] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useFrame((state, delta) => {
    if (!isActive) return;

    setGlitchAge(prev => prev + delta);

    if (glitchAge > duration) {
      setIsActive(false);
      onGlitchComplete?.();
    }
  });

  if (!isActive || glitchIntensity <= 0) return null;

  const currentIntensity = glitchIntensity * (1 - glitchAge / duration);

  return (
    <group>
      {glitchType === 'matrix-rain' && (
        <MatrixRainGlitch intensity={currentIntensity} consciousness={consciousness} />
      )}

      {glitchType === 'reality-tear' && (
        <RealityTearGlitch
          intensity={currentIntensity}
          consciousness={consciousness}
          position={position}
        />
      )}

      {glitchType === 'consciousness-breakthrough' && (
        <ConsciousnessBreakthroughGlitch
          intensity={currentIntensity}
          consciousness={consciousness}
        />
      )}

      {glitchType === 'fractal-dissolution' && (
        <FractalDissolutionGlitch
          intensity={currentIntensity}
          consciousness={consciousness}
          position={position}
        />
      )}
    </group>
  );
};

export default RealityGlitch;

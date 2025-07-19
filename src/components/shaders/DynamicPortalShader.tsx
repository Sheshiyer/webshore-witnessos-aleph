/**
 * Dynamic Portal Shader - Full Viewport Raymarching Background
 * 
 * Replaces geometric wireframe with fluid, dynamic shader-based background
 * Uses compact raymarching with noise-based portal effects
 */

'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial, Vector2 } from 'three';

interface DynamicPortalShaderProps {
  intensity?: number;
  speed?: number;
  color1?: [number, number, number];
  color2?: [number, number, number];
  color3?: [number, number, number];
}

export const DynamicPortalShader: React.FC<DynamicPortalShaderProps> = ({
  intensity = 1.0,
  speed = 1.0,
  color1 = [0.05, 0.05, 0.05], // Dark Gray
  color2 = [0.1, 0.15, 0.2], // Subtle Blue Tint
  color3 = [0.2, 0.25, 0.3], // Accent Gray
}) => {
  const meshRef = useRef<any>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  // Shader material with the compact raymarching code
  const shaderMaterial = useMemo(() => {
    return new ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new Vector2(window.innerWidth, window.innerHeight) },
        u_intensity: { value: intensity },
        u_speed: { value: speed },
        u_color1: { value: color1 },
        u_color2: { value: color2 },
        u_color3: { value: color3 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float u_time;
        uniform vec2 u_resolution;
        uniform float u_intensity;
        uniform float u_speed;
        uniform vec3 u_color1;
        uniform vec3 u_color2;
        uniform vec3 u_color3;

        varying vec2 vUv;

        // High-quality noise function for grain effect
        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        // Film grain noise
        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        // Fractal noise for texture
        float fbm(vec2 st) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 0.0;
          for (int i = 0; i < 6; i++) {
            value += amplitude * noise(st);
            st *= 2.0;
            amplitude *= 0.5;
          }
          return value;
        }

        void main() {
          // Convert to screen coordinates
          vec2 FC = vUv * u_resolution;
          vec2 r = u_resolution;
          float t = u_time * u_speed;
          vec4 o = vec4(0.0);

          // EXACT original effect - retain this completely
          vec2 p = (FC.xy * 2.0 - r) / r.y;
          vec2 l = vec2(0.0);
          vec2 v = p * (1.0 - (l += abs(0.7 - dot(p, p)))) / 0.2;

          for (float i = 1.0; i <= 8.0; i++) {
            o += (sin(v.xyyx) + 1.0) * abs(v.x - v.y) * 0.2;
            v += cos(v.yx * i + vec2(0.0, i) + t) / i + 0.7;
          }

          o = tanh(exp(p.y * vec4(1.0, -1.0, -2.0, 0.0)) * exp(-4.0 * l.x) / o);

          // Create the flowing energy effect like the reference
          vec3 deepBlue = vec3(0.0, 0.2, 0.6);      // Deep blue base
          vec3 brightBlue = vec3(0.0, 0.6, 1.0);    // Bright cyan blue
          vec3 orange = vec3(1.0, 0.4, 0.0);        // Orange energy streams
          vec3 white = vec3(1.0, 0.9, 0.8);         // Hot white cores
          vec3 black = vec3(0.0, 0.0, 0.0);         // Pure black background

          // Get energy levels from the original effect
          float energy = length(o.xyz);
          float flow = o.x * 0.5 + 0.5;

          // Create edge-to-edge circular mask
          float dist = length(p);
          float circleMask = 1.0 - smoothstep(0.0, 1.0, dist);

          // Base: black background with energy streams
          vec3 color = black;

          // Add flowing energy where the original effect creates patterns
          if (energy > 0.1) {
            // Blue energy streams
            color = mix(color, deepBlue, smoothstep(0.1, 0.4, energy) * 0.8);
            color = mix(color, brightBlue, smoothstep(0.3, 0.6, energy) * 0.6);

            // Orange energy streams where intensity is highest
            color = mix(color, orange, smoothstep(0.5, 0.8, energy) * 0.7);

            // White hot cores at peak energy
            color = mix(color, white, smoothstep(0.7, 1.0, energy) * 0.4);
          }

          // Apply the circular mask to create edge-to-edge effect
          color *= circleMask;

          // Premium grain texture (subtle on the energy, not the black)
          vec2 grainCoord = vUv * u_resolution * 0.8;
          float grain = fbm(grainCoord + t * 0.05) * 0.03;
          float fineGrain = random(vUv * u_resolution + t * 0.1) * 0.01;

          // Apply grain only where there's energy
          color += (grain + fineGrain) * energy * 0.5;

          // Enhance the glow effect
          float glow = 1.0 / (1.0 + dist * dist * 0.5);
          color += glow * 0.1 * brightBlue * energy;

          // Apply intensity
          color *= u_intensity;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      transparent: true,
    });
  }, [intensity, speed, color1, color2, color3]);

  // Update time uniform
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_time.value = state.clock.elapsedTime;
    }
  });

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.u_resolution.value.set(
          window.innerWidth,
          window.innerHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <mesh ref={meshRef} scale={[2, 2, 1]}>
      <planeGeometry args={[2, 2]} />
      <primitive object={shaderMaterial} ref={materialRef} />
    </mesh>
  );
};

export default DynamicPortalShader;

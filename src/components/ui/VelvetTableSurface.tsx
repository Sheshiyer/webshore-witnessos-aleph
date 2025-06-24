/**
 * Velvet Table Surface with Physics-Based Cloth Simulation
 * 
 * Creates a realistic velvet table surface with fabric texture and cloth deformation
 * for the cyberpunk tarot card interface. Cards interact with the cloth surface
 * creating realistic physics-based deformation effects.
 */

'use client';

import { useFrame } from '@react-three/fiber';
import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface VelvetTableSurfaceProps {
  position?: [number, number, number];
  size?: [number, number];
  segments?: [number, number];
  cardPositions?: Array<{ x: number; y: number; weight: number }>;
  clothColor?: string;
  roughness?: number;
  metalness?: number;
  enablePhysics?: boolean;
}

export const VelvetTableSurface: React.FC<VelvetTableSurfaceProps> = ({
  position = [0, -0.1, 0],
  size = [8, 6],
  segments = [32, 24],
  cardPositions = [],
  clothColor = '#2D1B69', // Deep purple velvet
  roughness = 0.9,
  metalness = 0.1,
  enablePhysics = true,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const geometryRef = useRef<THREE.PlaneGeometry>(null);
  const originalPositions = useRef<Float32Array | null>(null);
  const velocities = useRef<Float32Array | null>(null);
  const forces = useRef<Float32Array | null>(null);

  // Create cloth geometry with physics simulation
  const { geometry, material } = useMemo(() => {
    // Create plane geometry for cloth
    const geo = new THREE.PlaneGeometry(size[0], size[1], segments[0], segments[1]);
    geo.rotateX(-Math.PI / 2); // Make it horizontal

    // Store original positions for physics simulation
    const positions = geo.attributes.position.array as Float32Array;
    originalPositions.current = new Float32Array(positions);
    velocities.current = new Float32Array(positions.length).fill(0);
    forces.current = new Float32Array(positions.length).fill(0);

    // Create velvet material with fabric texture
    const mat = new THREE.MeshPhysicalMaterial({
      color: clothColor,
      roughness: roughness,
      metalness: metalness,
      clearcoat: 0.1,
      clearcoatRoughness: 0.8,
      transmission: 0,
      thickness: 0.1,
      ior: 1.4,
      // Add subtle fabric-like normal map effect
      normalScale: new THREE.Vector2(0.3, 0.3),
    });

    // Create procedural fabric normal map
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    
    // Create fabric weave pattern
    const imageData = ctx.createImageData(512, 512);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const x = (i / 4) % 512;
      const y = Math.floor((i / 4) / 512);
      
      // Create weave pattern
      const weaveX = Math.sin(x * 0.1) * 0.5 + 0.5;
      const weaveY = Math.sin(y * 0.1) * 0.5 + 0.5;
      const weave = (weaveX * weaveY) * 0.3 + 0.7;
      
      // Add fabric fiber noise
      const noise = (Math.random() - 0.5) * 0.1;
      const value = Math.max(0, Math.min(255, (weave + noise) * 255));
      
      imageData.data[i] = value;     // R
      imageData.data[i + 1] = value; // G
      imageData.data[i + 2] = 255;   // B (normal map blue channel)
      imageData.data[i + 3] = 255;   // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const normalTexture = new THREE.CanvasTexture(canvas);
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.repeat.set(4, 3);
    mat.normalMap = normalTexture;

    return { geometry: geo, material: mat };
  }, [size, segments, clothColor, roughness, metalness]);

  // Physics simulation for cloth deformation
  useFrame((state, delta) => {
    if (!enablePhysics || !meshRef.current || !geometryRef.current) return;
    if (!originalPositions.current || !velocities.current || !forces.current) return;

    const positions = geometryRef.current.attributes.position.array as Float32Array;
    const segmentsX = segments[0] + 1;
    const segmentsY = segments[1] + 1;
    
    // Reset forces
    forces.current.fill(0);

    // Apply card weight forces
    cardPositions.forEach(card => {
      // Convert card position to cloth grid coordinates
      const gridX = Math.round(((card.x + size[0] / 2) / size[0]) * segments[0]);
      const gridY = Math.round(((card.y + size[1] / 2) / size[1]) * segments[1]);
      
      // Apply force in a radius around the card position
      const radius = 3;
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          const x = gridX + dx;
          const y = gridY + dy;
          
          if (x >= 0 && x < segmentsX && y >= 0 && y < segmentsY) {
            const index = (y * segmentsX + x) * 3 + 1; // Y component
            const distance = Math.sqrt(dx * dx + dy * dy);
            const falloff = Math.max(0, 1 - distance / radius);
            
            // Apply downward force based on card weight and distance
            forces.current[index] -= card.weight * falloff * 0.02;
          }
        }
      }
    });

    // Apply spring forces to restore original shape
    for (let i = 1; i < positions.length; i += 3) { // Y components only
      const restoreForce = (originalPositions.current[i] - positions[i]) * 0.1;
      forces.current[i] += restoreForce;
      
      // Add damping
      velocities.current[i] *= 0.95;
    }

    // Update velocities and positions
    const timeStep = Math.min(delta, 1/60); // Cap timestep for stability
    for (let i = 1; i < positions.length; i += 3) { // Y components only
      velocities.current[i] += forces.current[i] * timeStep;
      positions[i] += velocities.current[i] * timeStep;
    }

    // Update geometry
    geometryRef.current.attributes.position.needsUpdate = true;
    geometryRef.current.computeVertexNormals();
  });

  // Update geometry reference when geometry changes
  useEffect(() => {
    if (meshRef.current) {
      geometryRef.current = meshRef.current.geometry as THREE.PlaneGeometry;
    }
  }, [geometry]);

  return (
    <group position={position}>
      {/* Main velvet cloth surface */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        receiveShadow
        castShadow
      />
      
      {/* Subtle ambient lighting for velvet effect */}
      <ambientLight intensity={0.2} color={clothColor} />
      
      {/* Rim lighting to enhance velvet appearance */}
      <pointLight
        position={[0, 2, 0]}
        intensity={0.3}
        color="#8B5CF6"
        distance={10}
        decay={2}
      />
      
      {/* Table edge/border */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[size[0] + 0.2, 0.1, size[1] + 0.2]} />
        <meshStandardMaterial
          color="#1A0B2E"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      
      {/* Subtle table legs (just hints) */}
      {[-1, 1].map(x => 
        [-1, 1].map(y => (
          <mesh
            key={`leg-${x}-${y}`}
            position={[x * (size[0] / 2 - 0.3), -0.5, y * (size[1] / 2 - 0.3)]}
          >
            <cylinderGeometry args={[0.05, 0.08, 1, 8]} />
            <meshStandardMaterial
              color="#0F0A1A"
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        ))
      ).flat()}
    </group>
  );
};

export default VelvetTableSurface;

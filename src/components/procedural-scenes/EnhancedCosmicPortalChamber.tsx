/**
 * Enhanced Cosmic Portal Chamber
 * 
 * Sophisticated consciousness-themed portal chamber replacing the "pink blob" with
 * sacred geometry, dynamic effects, and breath-synchronized transformations.
 * Uses built-in Three.js geometries for maximum compatibility.
 */

'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, Color } from 'three';
import { useConsciousness } from '@/hooks/useConsciousness';

interface EnhancedCosmicPortalChamberProps {
  position?: [number, number, number];
  scale?: number;
  visible?: boolean;
  consciousnessLevel?: number;
  archetypalDirection?: 'north' | 'east' | 'south' | 'west';
  breathSynchronized?: boolean;
  interactive?: boolean;
  onPortalActivation?: () => void;
}

// Sacred geometry constants
const PORTAL_CONSTANTS = {
  CHAMBER_RADIUS: 3,
  PORTAL_RADIUS: 1.2,
  ARCHETYPAL_COLORS: {
    north: new Color('#4A90E2'), // Blue - Wisdom/Knowledge
    east: new Color('#F5A623'),  // Gold - Illumination/Dawn
    south: new Color('#D0021B'), // Red - Passion/Fire
    west: new Color('#7ED321'),  // Green - Growth/Earth
  },
  CONSCIOUSNESS_THRESHOLDS: {
    DORMANT: 0.2,
    AWAKENING: 0.4,
    RECOGNITION: 0.6,
    INTEGRATION: 0.8,
    TRANSCENDENCE: 1.0,
  }
};

export const EnhancedCosmicPortalChamber: React.FC<EnhancedCosmicPortalChamberProps> = ({
  position = [0, 0, 0],
  scale = 1,
  visible = true,
  consciousnessLevel: propConsciousnessLevel,
  archetypalDirection = 'north',
  breathSynchronized = true,
  interactive = true,
  onPortalActivation,
}) => {
  const groupRef = useRef<Group>(null);
  const portalCoreRef = useRef<Group>(null);
  const orbitingElementsRef = useRef<Group>(null);
  
  const { consciousness, breathState } = useConsciousness();
  
  // Use prop consciousness level or hook consciousness level
  const currentConsciousnessLevel = propConsciousnessLevel ?? consciousness.awarenessLevel;
  
  // Get archetypal color
  const archetypalColor = PORTAL_CONSTANTS.ARCHETYPAL_COLORS[archetypalDirection];

  // Generate sacred geometry based on consciousness level
  const sacredGeometry = useMemo(() => {
    const geometries = [];
    
    // Base geometry: Dodecahedron (12 faces, represents completion)
    if (currentConsciousnessLevel >= PORTAL_CONSTANTS.CONSCIOUSNESS_THRESHOLDS.DORMANT) {
      geometries.push({
        type: 'dodecahedron',
        args: [0.8, 0] as const,
        color: archetypalColor.clone().multiplyScalar(0.6),
        position: new Vector3(0, 0, 0),
        rotation: { x: 0, y: 0, z: 0 },
        opacity: 0.3,
      });
    }

    // Awakening: Icosahedron (20 faces, represents transformation)
    if (currentConsciousnessLevel >= PORTAL_CONSTANTS.CONSCIOUSNESS_THRESHOLDS.AWAKENING) {
      geometries.push({
        type: 'icosahedron',
        args: [1.0, 0] as const,
        color: archetypalColor.clone().multiplyScalar(0.8),
        position: new Vector3(0, 0, 0),
        rotation: { x: 0, y: Math.PI / 4, z: 0 },
        opacity: 0.4,
      });
    }

    // Recognition: Tetrahedron (4 faces, represents fire/spirit)
    if (currentConsciousnessLevel >= PORTAL_CONSTANTS.CONSCIOUSNESS_THRESHOLDS.RECOGNITION) {
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        geometries.push({
          type: 'tetrahedron',
          args: [0.4, 0] as const,
          color: archetypalColor.clone().lerp(new Color('#FFFFFF'), 0.3),
          position: new Vector3(
            Math.cos(angle) * 1.5,
            Math.sin(angle * 2) * 0.3,
            Math.sin(angle) * 1.5
          ),
          rotation: { x: angle, y: angle * 1.618, z: angle * 0.618 },
          opacity: 0.6,
        });
      }
    }

    // Integration: Octahedron (8 faces, represents air/mind)
    if (currentConsciousnessLevel >= PORTAL_CONSTANTS.CONSCIOUSNESS_THRESHOLDS.INTEGRATION) {
      geometries.push({
        type: 'octahedron',
        args: [1.2, 0] as const,
        color: archetypalColor.clone().lerp(new Color('#FFFFFF'), 0.5),
        position: new Vector3(0, 0, 0),
        rotation: { x: Math.PI / 6, y: Math.PI / 6, z: Math.PI / 6 },
        opacity: 0.7,
      });
    }

    // Transcendence: Cube (6 faces, represents earth/matter)
    if (currentConsciousnessLevel >= PORTAL_CONSTANTS.CONSCIOUSNESS_THRESHOLDS.TRANSCENDENCE) {
      geometries.push({
        type: 'box',
        args: [0.6, 0.6, 0.6] as const,
        color: new Color('#FFFFFF'),
        position: new Vector3(0, 0, 0),
        rotation: { x: Math.PI / 4, y: Math.PI / 4, z: Math.PI / 4 },
        opacity: 0.9,
      });
    }

    return geometries;
  }, [currentConsciousnessLevel, archetypalColor]);

  // Generate orbiting elements
  const orbitingElements = useMemo(() => {
    const elements = [];
    const elementCount = Math.floor(currentConsciousnessLevel * 8) + 4;
    
    for (let i = 0; i < elementCount; i++) {
      const angle = (i / elementCount) * Math.PI * 2;
      const radius = 2 + Math.sin(angle * 3) * 0.5;
      const height = Math.sin(angle * 2) * 1;
      
      elements.push({
        id: i,
        position: new Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        color: archetypalColor.clone().lerp(new Color('#FFFFFF'), i / elementCount),
        size: 0.1 + (currentConsciousnessLevel * 0.1),
        orbitSpeed: 0.5 + i * 0.1,
        pulsePhase: i * 0.5,
      });
    }
    
    return elements;
  }, [currentConsciousnessLevel, archetypalColor]);

  // Animation loop
  useFrame((state, delta) => {
    if (!groupRef.current || !visible) return;
    
    const time = state.clock.elapsedTime;
    
    // Breath synchronization
    const breathMultiplier = breathSynchronized ? 
      (breathState.phase === 'inhale' ? 1 + Math.sin(time * 3) * 0.1 : 1 + Math.cos(time * 2) * 0.05) : 1;
    
    // Portal core rotation and scaling
    if (portalCoreRef.current) {
      portalCoreRef.current.rotation.y += delta * 0.5 * currentConsciousnessLevel;
      portalCoreRef.current.rotation.x += delta * 0.3 * currentConsciousnessLevel;
      portalCoreRef.current.scale.setScalar(scale * breathMultiplier);
      
      // Animate sacred geometry
      portalCoreRef.current.children.forEach((child, index) => {
        if (child.userData.geometryType) {
          const rotationSpeed = 0.5 + index * 0.2;
          child.rotation.x += delta * rotationSpeed * currentConsciousnessLevel;
          child.rotation.y += delta * rotationSpeed * 0.7 * currentConsciousnessLevel;
          child.rotation.z += delta * rotationSpeed * 0.3 * currentConsciousnessLevel;
          
          // Consciousness-based scaling
          const pulseScale = 1 + Math.sin(time * 2 + index) * 0.1 * currentConsciousnessLevel;
          child.scale.setScalar(pulseScale);
          
          // Update material properties
          if ('material' in child && child.material) {
            const material = child.material as any;
            if (material.emissiveIntensity !== undefined) {
              material.emissiveIntensity = 0.2 + currentConsciousnessLevel * 0.5 + Math.sin(time * 3 + index) * 0.1;
            }
            if (material.opacity !== undefined) {
              material.opacity = (child.userData.baseOpacity || 0.5) + Math.sin(time + index) * 0.1;
            }
          }
        }
      });
    }
    
    // Orbiting elements animation
    if (orbitingElementsRef.current) {
      orbitingElementsRef.current.children.forEach((child, index) => {
        const element = orbitingElements[index];
        if (element) {
          // Orbit around the portal
          const orbitAngle = time * element.orbitSpeed + element.pulsePhase;
          const orbitRadius = 2 + Math.sin(time + element.pulsePhase) * 0.5;
          
          child.position.set(
            Math.cos(orbitAngle) * orbitRadius,
            element.position.y + Math.sin(time * 2 + element.pulsePhase) * 0.3,
            Math.sin(orbitAngle) * orbitRadius
          );
          
          // Pulse effect
          const pulseScale = 1 + Math.sin(time * 3 + element.pulsePhase) * 0.3;
          child.scale.setScalar(pulseScale);
          
          // Update material
          if ('material' in child && child.material) {
            const material = child.material as any;
            if (material.emissiveIntensity !== undefined) {
              material.emissiveIntensity = 0.5 + Math.sin(time * 2 + element.pulsePhase) * 0.3;
            }
          }
        }
      });
    }
    
    // Overall group breathing effect
    if (breathSynchronized) {
      groupRef.current.scale.setScalar(scale * breathMultiplier);
    }
  });

  // Handle portal activation
  const handlePortalClick = (event: any) => {
    event.stopPropagation();
    if (interactive && onPortalActivation) {
      onPortalActivation();
    }
  };

  if (!visible) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Portal Core - Sacred Geometry */}
      <group ref={portalCoreRef} onClick={interactive ? handlePortalClick : undefined}>
        {sacredGeometry.map((geom, index) => {
          const GeometryComponent = geom.type === 'dodecahedron' ? 'dodecahedronGeometry' :
                                   geom.type === 'icosahedron' ? 'icosahedronGeometry' :
                                   geom.type === 'tetrahedron' ? 'tetrahedronGeometry' :
                                   geom.type === 'octahedron' ? 'octahedronGeometry' :
                                   'boxGeometry';
          
          return (
            <mesh
              key={`${geom.type}-${index}`}
              position={geom.position.toArray()}
              rotation={[geom.rotation.x, geom.rotation.y, geom.rotation.z]}
              userData={{ geometryType: geom.type, baseOpacity: geom.opacity }}
            >
              {React.createElement(GeometryComponent, { args: geom.args })}
              <meshStandardMaterial
                color={geom.color}
                emissive={geom.color}
                emissiveIntensity={0.3}
                transparent
                opacity={geom.opacity}
                wireframe={false}
              />
            </mesh>
          );
        })}
      </group>

      {/* Orbiting Elements */}
      <group ref={orbitingElementsRef}>
        {orbitingElements.map((element) => (
          <mesh key={`orbit-${element.id}`} position={element.position.toArray()}>
            <sphereGeometry args={[element.size, 16, 16]} />
            <meshStandardMaterial
              color={element.color}
              emissive={element.color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>

      {/* Chamber Energy Ring */}
      <mesh>
        <torusGeometry args={[PORTAL_CONSTANTS.CHAMBER_RADIUS, 0.1, 16, 100]} />
        <meshStandardMaterial
          color={archetypalColor}
          emissive={archetypalColor}
          emissiveIntensity={0.3 + currentConsciousnessLevel * 0.4}
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Inner Portal Ring */}
      <mesh>
        <torusGeometry args={[PORTAL_CONSTANTS.PORTAL_RADIUS, 0.05, 12, 64]} />
        <meshStandardMaterial
          color={archetypalColor.clone().lerp(new Color('#FFFFFF'), 0.5)}
          emissive={archetypalColor.clone().lerp(new Color('#FFFFFF'), 0.5)}
          emissiveIntensity={0.7 + currentConsciousnessLevel * 0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Ambient Portal Lighting */}
      <ambientLight
        intensity={0.3 + currentConsciousnessLevel * 0.4}
        color={archetypalColor}
      />
      
      {/* Point lights for dramatic illumination */}
      <pointLight
        position={[0, 2, 0]}
        intensity={0.8 + currentConsciousnessLevel * 0.7}
        color={archetypalColor}
        distance={6}
        decay={2}
      />
      
      <pointLight
        position={[0, -2, 0]}
        intensity={0.5 + currentConsciousnessLevel * 0.5}
        color={archetypalColor.clone().lerp(new Color('#FFFFFF'), 0.3)}
        distance={4}
        decay={2}
      />
      
      {/* Directional light for archetypal emphasis */}
      <directionalLight
        position={archetypalDirection === 'north' ? [0, 0, 5] :
                 archetypalDirection === 'east' ? [5, 0, 0] :
                 archetypalDirection === 'south' ? [0, 0, -5] :
                 [-5, 0, 0]}
        intensity={0.4 + currentConsciousnessLevel * 0.3}
        color={archetypalColor}
      />
    </group>
  );
}; 
/**
 * Portal Chamber - Enhanced Entry Experience Component
 *
 * Fractal-enhanced consciousness entry point with breath synchronization
 * Infinite zoom portals with archetypal fractal signatures
 * Inspired by Nishitsuji's "Everything is a Wave" philosophy
 */

'use client';

import BreathingSun from '@/components/procedural-scenes/BreathingSun';
import { modulateWithBreath } from '@/generators/sacred-geometry/platonic-solids';
import {
  createConsciousnessWaveTransformer,
  transformUserDataToWaves,
} from '@/generators/wave-equations/consciousness-transformations';
import {
  createBreathWave,
  createConsciousnessField,
} from '@/generators/wave-equations/consciousness-waves';
import {
  createArchetypalFractalMaterial,
  FractalType,
  getHumanDesignTypeFromString,
} from '@/shaders/fractals/archetypal-fractals';
import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Mesh,
  PlaneGeometry,
  Points,
  ShaderMaterial,
  Vector3,
} from 'three';

const { ARCHETYPAL_COLORS, DISCOVERY_LAYERS } = CONSCIOUSNESS_CONSTANTS;

interface PortalChamberProps {
  consciousness: ConsciousnessState;
  onBreathStateChange?: (breathState: BreathState) => void;
  onConsciousnessUpdate?: (consciousness: ConsciousnessState) => void;
  onPortalEnter?: () => void;
  archetypalColor?: [number, number, number];
  size?: number;
  humanDesignType?: string;
  enneagramType?: number;
  enableInfiniteZoom?: boolean;
  enableBreathDetection?: boolean;
  fractalType?: FractalType;
  userData?: {
    birthDate?: Date;
    birthTime?: string;
    name?: string;
  };
}

export const PortalChamber: React.FC<PortalChamberProps> = ({
  consciousness,
  onBreathStateChange,
  onConsciousnessUpdate,
  onPortalEnter,
  archetypalColor = [0.6, 0.3, 0.9], // Default purple
  size = 10,
  humanDesignType = 'generator',
  enneagramType = 9,
  enableInfiniteZoom = true,
  enableBreathDetection = true,
  fractalType = FractalType.MANDELBROT,
  userData,
}) => {
  // Refs for Three.js objects
  const portalMeshRef = useRef<Mesh>(null);
  const chamberMeshRef = useRef<Mesh>(null);
  const shaderMaterialRef = useRef<ShaderMaterial>(null);
  const portalGroupRef = useRef<Group>(null);
  const particlesRef = useRef<Points>(null);

  // State for infinite zoom and portal activation
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [portalActivated, setPortalActivated] = useState(false);

  // Enhanced generators
  const breathWave = useMemo(() => createBreathWave(), []);
  const waveTransformer = useMemo(() => createConsciousnessWaveTransformer(), []);
  const consciousnessField = useMemo(() => createConsciousnessField(), []);

  // Enhanced archetypal fractal material
  const archetypalMaterial = useMemo(() => {
    const hdType = getHumanDesignTypeFromString(humanDesignType);
    const material = createArchetypalFractalMaterial(fractalType, hdType, enneagramType);
    return material;
  }, [fractalType, humanDesignType, enneagramType]);

  // User wave transformation
  const userWaveTransformation = useMemo(() => {
    if (!userData) return null;
    return transformUserDataToWaves({
      birthDate: userData.birthDate || new Date(),
      birthTime: userData.birthTime || '12:00',
      name: userData.name || 'Anonymous',
      humanDesignType,
      enneagramType,
    });
  }, [userData, humanDesignType, enneagramType]);

  // Enhanced octagonal chamber geometry with golden ratio proportions
  const chamberGeometry = useMemo(() => {
    // Import the function dynamically to avoid auto-formatting issues
    const { createOctagonalChamber } = require('@/generators/sacred-geometry/platonic-solids');

    // Create true octagonal chamber with nested geometry and golden ratio proportions
    const baseOctagonalChamber = createOctagonalChamber(
      size,
      consciousness,
      true // Enable nested geometry for golden ratio proportions
    );

    return modulateWithBreath(baseOctagonalChamber, breathWave.getCurrentState(), 0.1);
  }, [size, consciousness]);

  // Enhanced portal geometry with fractal subdivision
  const portalGeometry = useMemo(() => {
    const geometry = new PlaneGeometry(size * 0.8, size * 0.8, 64, 64);

    // Create octagonal portal shape with fractal edges
    const positionAttribute = geometry.attributes.position;
    if (!positionAttribute) return geometry;

    const positions = positionAttribute.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i] ?? 0;
      const y = positions[i + 1] ?? 0;
      const distance = Math.sqrt(x * x + y * y);

      // Octagonal mask with fractal modulation
      const angle = Math.atan2(y, x);
      const octagonRadius = (size * 0.35) / Math.cos((angle % (Math.PI / 4)) - Math.PI / 8);
      const fractalModulation =
        Math.sin(angle * 8 + distance * 2) * 0.1 * consciousness.awarenessLevel;

      if (distance > octagonRadius + fractalModulation) {
        positions[i + 2] = -10; // Push vertices behind for portal effect
      }
    }

    if (geometry.attributes.position) {
      geometry.attributes.position.needsUpdate = true;
    }
    return geometry;
  }, [size, consciousness]);

  // Consciousness particle field
  const particleGeometry = useMemo(() => {
    const particleCount = performanceOptimizer.shouldReduceConsciousnessEffects() ? 300 : 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Distribute particles in fractal spiral pattern
      const angle = (i / particleCount) * Math.PI * 8; // Golden spiral
      const radius = Math.sqrt(i / particleCount) * size * 0.8;
      const height = (Math.random() - 0.5) * size * 0.6;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = height;
      positions[i3 + 2] = Math.sin(angle) * radius;

      // Archetypal colors
      const baseColor = new Color(...archetypalColor);
      const hue = (baseColor.getHSL({} as any).h + Math.random() * 0.2 - 0.1) % 1;
      const color = new Color().setHSL(hue, 0.8, 0.6);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setAttribute('color', new BufferAttribute(colors, 3));

    return geometry;
  }, [size, archetypalColor]);

  // Enhanced animation loop with infinite zoom and archetypal fractals
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const breathState = breathWave.getCurrentState();

    // Update archetypal fractal material
    archetypalMaterial.updateTime();
    archetypalMaterial.updateConsciousness(consciousness);
    archetypalMaterial.updateBreath(breathState);

    // Infinite zoom effect based on breath coherence
    if (enableInfiniteZoom && breathState.coherence > 0.7) {
      const zoomSpeed = breathState.coherence * 0.02;
      setZoomLevel(prev => prev + zoomSpeed * delta);

      // Portal activation threshold
      if (breathState.coherence > 0.8 && !portalActivated) {
        setPortalActivated(true);
        onPortalEnter?.();
      }
    }

    // Apply zoom transformation to portal group
    if (portalGroupRef.current && enableInfiniteZoom) {
      const zoomScale = 1.0 + Math.log(zoomLevel) * 0.1;
      portalGroupRef.current.scale.setScalar(zoomScale);

      // Fractal zoom rotation
      portalGroupRef.current.rotation.z = time * 0.1 * zoomLevel * 0.1;
    }

    // Enhanced portal animation with fractal modulation
    if (portalMeshRef.current) {
      const breathModulation = Math.sin(getBreathPhase(breathState)) * 0.1;
      const fractalRotation = time * 0.1 + breathModulation;
      portalMeshRef.current.rotation.z = fractalRotation;

      // Breath-synchronized scaling with fractal enhancement
      const baseScale = 1.0 + breathModulation * 0.2;
      const fractalScale = baseScale * (1.0 + consciousness.awarenessLevel * 0.1);
      portalMeshRef.current.scale.setScalar(fractalScale);
    }

    // Enhanced chamber animation with wave modulation
    if (chamberMeshRef.current) {
      const breathIntensity = breathState.intensity * breathState.coherence;
      const waveModulation = userWaveTransformation
        ? Math.sin(time * userWaveTransformation.baseFrequency * 0.001) * 0.02
        : 0;

      const chamberScale = 1.0 + breathIntensity * 0.05 + waveModulation;
      chamberMeshRef.current.scale.setScalar(chamberScale);

      // Archetypal rotation based on Human Design type
      const rotationSpeed =
        humanDesignType === 'manifestor' ? 0.08 : humanDesignType === 'projector' ? 0.03 : 0.05;
      chamberMeshRef.current.rotation.y = time * rotationSpeed;
    }

    // Animate consciousness particles
    if (particlesRef.current?.geometry.attributes.position) {
      const positionAttribute = particlesRef.current.geometry.attributes.position;
      const positions = positionAttribute.array as Float32Array;
      const breathPhase = getBreathPhase(breathState);

      for (let i = 0; i < positions.length; i += 3) {
        // Spiral motion synchronized with breath and consciousness
        const particleIndex = i / 3;
        const angle = time * 0.5 + particleIndex * 0.01;
        const breathModulation =
          Math.sin(breathPhase + particleIndex * 0.1) * breathState.coherence;

        // Update particle positions with wave interference
        if (i < positions.length) {
          positions[i] = (positions[i] || 0) + Math.cos(angle) * delta * 0.1 * breathModulation;
        }
        if (i + 2 < positions.length) {
          positions[i + 2] =
            (positions[i + 2] || 0) + Math.sin(angle) * delta * 0.1 * breathModulation;
        }

        // Vertical oscillation with consciousness modulation
        const verticalWave = Math.sin(time + particleIndex * 0.1) * consciousness.awarenessLevel;
        if (i + 1 < positions.length) {
          positions[i + 1] = (positions[i + 1] || 0) + verticalWave * delta * 0.05;
        }
      }
      positionAttribute.needsUpdate = true;
    }

    // Performance monitoring and adaptive quality
    const triangleCount =
      (portalGeometry.attributes.position?.count ?? 0) +
      (particlesRef.current?.geometry.attributes.position?.count ?? 0);
    performanceOptimizer.updateMetrics(delta * 1000, 3, triangleCount);

    // Notify parent components
    if (onBreathStateChange) {
      onBreathStateChange(breathState);
    }

    // Update consciousness based on interaction
    if (onConsciousnessUpdate) {
      const updatedConsciousness: ConsciousnessState = {
        ...consciousness,
        awarenessLevel: Math.min(consciousness.awarenessLevel + breathState.coherence * 0.001, 1.0),
      };
      onConsciousnessUpdate(updatedConsciousness);
    }
  });

  // Convert chamber geometry to Three.js vertices
  const chamberVertices = useMemo(() => {
    return chamberGeometry.vertices.map(v => new Vector3(v.x, v.y, v.z));
  }, [chamberGeometry]);

  // Create chamber wireframe
  const chamberWireframe = useMemo(() => {
    const positions: number[] = [];

    chamberGeometry.edges.forEach(([start, end]) => {
      const startVertex = chamberVertices[start];
      const endVertex = chamberVertices[end];

      if (startVertex && endVertex) {
        positions.push(
          startVertex.x,
          startVertex.y,
          startVertex.z,
          endVertex.x,
          endVertex.y,
          endVertex.z
        );
      }
    });

    return new Float32Array(positions);
  }, [chamberGeometry, chamberVertices]);

  return (
    <group ref={portalGroupRef}>
      {/* True Octagonal Chamber with Golden Ratio Proportions - Phase 3.1 Complete */}
      <lineSegments ref={chamberMeshRef}>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            args={[chamberWireframe, 3]}
            count={chamberWireframe.length / 3}
            array={chamberWireframe}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color={archetypalColor}
          transparent
          opacity={0.3 + consciousness.awarenessLevel * 0.4}
        />
      </lineSegments>

      {/* Enhanced Central Portal with Archetypal Fractals */}
      <mesh ref={portalMeshRef} geometry={portalGeometry}>
        <primitive object={archetypalMaterial.getMaterial()} />
      </mesh>

      {/* Consciousness Particle Field */}
      <points ref={particlesRef} geometry={particleGeometry}>
        <pointsMaterial
          size={0.02}
          vertexColors
          transparent
          opacity={0.8 + consciousness.awarenessLevel * 0.2}
          sizeAttenuation
        />
      </points>

      {/* Infinite Zoom Portal Rings */}
      {enableInfiniteZoom &&
        Array.from({ length: 3 }, (_, i) => (
          <mesh
            key={i}
            position={[0, 0, -i * 2 - 1]}
            rotation={[0, 0, (Date.now() * 0.001 + i) * 0.5]}
          >
            <ringGeometry args={[size * 0.4 + i * 0.2, size * 0.5 + i * 0.2, 8]} />
            <meshBasicMaterial
              color={archetypalColor}
              transparent
              opacity={0.2 * (1 - i * 0.3) * consciousness.awarenessLevel}
              wireframe
            />
          </mesh>
        ))}

      {/* Ambient Consciousness Field */}
      <ambientLight
        intensity={0.2 + consciousness.awarenessLevel * 0.3}
        color={`rgb(${Math.floor(archetypalColor[0] * 255)}, ${Math.floor(archetypalColor[1] * 255)}, ${Math.floor(archetypalColor[2] * 255)})`}
      />

      {/* Directional Light with Breath Sync */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5 + Math.sin(Date.now() * 0.001) * 0.2}
        color={`rgb(${Math.floor(archetypalColor[0] * 255)}, ${Math.floor(archetypalColor[1] * 255)}, ${Math.floor(archetypalColor[2] * 255)})`}
      />

      {/* Point Lights for Sacred Geometry */}
      {chamberVertices.slice(0, 4).map((vertex, index) => (
        <pointLight
          key={index}
          position={[vertex.x * 0.8, vertex.y * 0.8, vertex.z * 0.8]}
          intensity={0.1 + consciousness.awarenessLevel * 0.2}
          color={`rgb(${Math.floor(archetypalColor[0] * 255)}, ${Math.floor(archetypalColor[1] * 255)}, ${Math.floor(archetypalColor[2] * 255)})`}
          distance={size * 2}
        />
      ))}

      {/* Breathing Sun Effect - Phase 3.1 Enhancement */}
      <BreathingSun
        position={[0, 0, -0.5]}
        baseRadius={size * 0.15}
        breathState={breathWave.getCurrentState()}
        consciousness={consciousness}
        warmEarthTones={true}
      />
    </group>
  );
};

// Helper function to convert breath state to shader phase
const getBreathPhase = (breathState: BreathState): number => {
  const { phase, intensity } = breathState;

  switch (phase) {
    case 'inhale':
      return intensity * Math.PI;
    case 'hold':
      return Math.PI;
    case 'exhale':
      return Math.PI + (1 - intensity) * Math.PI;
    case 'pause':
      return 0;
    default:
      return 0;
  }
};

// Portal Chamber with different archetypal configurations
export const GeneratorPortalChamber: React.FC<
  Omit<PortalChamberProps, 'archetypalColor'>
> = props => (
  <PortalChamber {...props} archetypalColor={ARCHETYPAL_COLORS.HUMAN_DESIGN.GENERATOR} />
);

export const ProjectorPortalChamber: React.FC<
  Omit<PortalChamberProps, 'archetypalColor'>
> = props => (
  <PortalChamber {...props} archetypalColor={ARCHETYPAL_COLORS.HUMAN_DESIGN.PROJECTOR} />
);

export const ManifestorPortalChamber: React.FC<
  Omit<PortalChamberProps, 'archetypalColor'>
> = props => (
  <PortalChamber {...props} archetypalColor={ARCHETYPAL_COLORS.HUMAN_DESIGN.MANIFESTOR} />
);

export const ReflectorPortalChamber: React.FC<
  Omit<PortalChamberProps, 'archetypalColor'>
> = props => (
  <PortalChamber {...props} archetypalColor={ARCHETYPAL_COLORS.HUMAN_DESIGN.REFLECTOR} />
);

export default PortalChamber;

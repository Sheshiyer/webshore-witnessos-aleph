/**
 * Split Circle System Interface
 *
 * Phase 4.2 - CRITICAL Missing Component
 * Creates split circle system interface for data visualization
 * Displays consciousness data in sacred geometric circular patterns
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import type { ConsciousnessState } from '@/types';
import { SACRED_MATHEMATICS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

interface SplitCircleSystemInterfaceProps {
  position?: [number, number, number];
  radius?: number;
  consciousness: ConsciousnessState;
  data?: Record<string, number>;
  onSegmentClick?: (segment: CircleSegment) => void;
  animated?: boolean;
  binaryDualityMode?: boolean;
  lightningVeinsEnabled?: boolean;
  eyeOfStormCenter?: boolean;
  mindMapVisualization?: boolean;
  innerOuterCoherence?: boolean;
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

interface DataVisualization {
  segments: CircleSegment[];
  centerValue: number;
  totalValue: number;
}

interface LightningVein {
  id: string;
  startPosition: THREE.Vector3;
  endPosition: THREE.Vector3;
  intensity: number;
  pulsePhase: number;
  dataFlow: number;
}

interface BinaryDuality {
  innerWorld: Record<string, number>;
  outerWorld: Record<string, number>;
  coherence: number;
  balance: number;
}

interface MindMapNode {
  id: string;
  position: THREE.Vector3;
  value: number;
  connections: string[];
  dataType: string;
  color: THREE.Color;
}

export const SplitCircleSystemInterface: React.FC<SplitCircleSystemInterfaceProps> = ({
  position = [0, 0, 0],
  radius = 2,
  consciousness,
  data = {},
  onSegmentClick,
  animated = true,
  binaryDualityMode = false,
  lightningVeinsEnabled = true,
  eyeOfStormCenter = true,
  mindMapVisualization = false,
  innerOuterCoherence = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.1);
  const [lightningVeins, setLightningVeins] = useState<LightningVein[]>([]);
  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([]);
  const { consciousnessLevel } = useConsciousness();

  // Default consciousness data if none provided
  const defaultData = useMemo(
    () => ({
      awareness: consciousnessLevel * 100,
      intuition: Math.sin(Date.now() * 0.001) * 50 + 50,
      creativity: Math.cos(Date.now() * 0.0015) * 40 + 60,
      wisdom: consciousnessLevel * 80 + 20,
      compassion: Math.sin(Date.now() * 0.0008) * 30 + 70,
      clarity: consciousnessLevel * 90 + 10,
      balance: Math.cos(Date.now() * 0.0012) * 35 + 65,
      presence: consciousnessLevel * 85 + 15,
    }),
    [consciousnessLevel]
  );

  const visualizationData = useMemo(() => ({ ...defaultData, ...data }), [defaultData, data]);

  // Binary duality data processing
  const binaryDualityData = useMemo((): BinaryDuality => {
    const keys = Object.keys(visualizationData);
    const midpoint = Math.floor(keys.length / 2);

    const innerWorld: Record<string, number> = {};
    const outerWorld: Record<string, number> = {};

    keys.forEach((key, index) => {
      if (index < midpoint) {
        innerWorld[key] = visualizationData[key];
      } else {
        outerWorld[key] = visualizationData[key];
      }
    });

    const innerSum = Object.values(innerWorld).reduce((sum, val) => sum + val, 0);
    const outerSum = Object.values(outerWorld).reduce((sum, val) => sum + val, 0);
    const coherence = 1 - Math.abs(innerSum - outerSum) / (innerSum + outerSum);
    const balance = Math.min(innerSum, outerSum) / Math.max(innerSum, outerSum);

    return { innerWorld, outerWorld, coherence, balance };
  }, [visualizationData]);

  // Generate lightning veins for information pulses
  const generateLightningVeins = useMemo((): LightningVein[] => {
    if (!lightningVeinsEnabled) return [];

    const veins: LightningVein[] = [];
    const segments = Object.entries(visualizationData);

    segments.forEach(([key, value], index) => {
      const angle = (index * Math.PI * 2) / segments.length;
      const startRadius = radius * 0.3;
      const endRadius = radius * 0.9;

      const startPosition = new THREE.Vector3(
        Math.cos(angle) * startRadius,
        Math.sin(angle) * startRadius,
        0
      );

      const endPosition = new THREE.Vector3(
        Math.cos(angle) * endRadius,
        Math.sin(angle) * endRadius,
        0.1
      );

      veins.push({
        id: `vein-${key}`,
        startPosition,
        endPosition,
        intensity: value / 100,
        pulsePhase: Math.random() * Math.PI * 2,
        dataFlow: value,
      });
    });

    return veins;
  }, [visualizationData, lightningVeinsEnabled, radius]);

  // Generate mind map nodes
  const generateMindMapNodes = useMemo((): MindMapNode[] => {
    if (!mindMapVisualization) return [];

    const nodes: MindMapNode[] = [];
    const entries = Object.entries(visualizationData);

    entries.forEach(([key, value], index) => {
      const angle = (index * Math.PI * 2) / entries.length;
      const nodeRadius = radius * (0.5 + value / 200); // Variable radius based on value

      const position = new THREE.Vector3(
        Math.cos(angle) * nodeRadius,
        Math.sin(angle) * nodeRadius,
        Math.sin(index) * 0.2
      );

      // Create connections to adjacent nodes
      const connections: string[] = [];
      if (index > 0) connections.push(`node-${entries[index - 1][0]}`);
      if (index < entries.length - 1) connections.push(`node-${entries[index + 1][0]}`);

      nodes.push({
        id: `node-${key}`,
        position,
        value,
        connections,
        dataType: key,
        color: new THREE.Color().setHSL(index / entries.length, 0.7, 0.6),
      });
    });

    return nodes;
  }, [visualizationData, mindMapVisualization, radius]);

  // Create split circle visualization
  const createSplitCircleVisualization = useMemo((): DataVisualization => {
    const entries = Object.entries(visualizationData);
    const totalValue = entries.reduce((sum, [, value]) => sum + value, 0);
    const phi = SACRED_MATHEMATICS.PHI;

    // Color palette based on golden ratio
    const colors = [
      new THREE.Color('#FF6B35'), // Warm orange
      new THREE.Color('#4ECDC4'), // Teal
      new THREE.Color('#45B7D1'), // Blue
      new THREE.Color('#96CEB4'), // Mint
      new THREE.Color('#FFEAA7'), // Yellow
      new THREE.Color('#DDA0DD'), // Plum
      new THREE.Color('#98D8C8'), // Mint green
      new THREE.Color('#F7DC6F'), // Light yellow
    ];

    let currentAngle = 0;
    const segments: CircleSegment[] = entries.map(([label, value], index) => {
      const normalizedValue = value / totalValue;
      const segmentAngle = normalizedValue * Math.PI * 2;

      // Apply golden ratio spacing
      const adjustedAngle = segmentAngle * (1 + 1 / phi);

      const segment: CircleSegment = {
        id: `segment-${label}`,
        startAngle: currentAngle,
        endAngle: currentAngle + adjustedAngle,
        value,
        color: colors[index % colors.length],
        label,
        data: { normalizedValue, originalValue: value },
      };

      currentAngle += adjustedAngle;
      return segment;
    });

    return {
      segments,
      centerValue: totalValue / entries.length,
      totalValue,
    };
  }, [visualizationData]);

  // Create segment geometry
  const createSegmentGeometry = (
    segment: CircleSegment,
    innerRadius: number,
    outerRadius: number
  ): THREE.BufferGeometry => {
    const geometry = new THREE.RingGeometry(
      innerRadius,
      outerRadius,
      Math.max(8, Math.floor((segment.endAngle - segment.startAngle) * 16)),
      1,
      segment.startAngle,
      segment.endAngle - segment.startAngle
    );

    return geometry;
  };

  // Split circle shader material
  const splitCircleMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        consciousnessLevel: { value: consciousnessLevel },
        segmentColor: { value: new THREE.Color('#4ECDC4') },
        selected: { value: 0.0 },
        value: { value: 0.5 },
      },
      vertexShader: `
        uniform float time;
        uniform float consciousnessLevel;
        uniform float selected;
        uniform float value;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vIntensity;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          // Calculate intensity based on value and consciousness
          vIntensity = value * consciousnessLevel * (1.0 + selected * 0.5);
          
          // Pulsing effect for selected segments
          vec3 pos = position;
          if (selected > 0.5) {
            float pulse = sin(time * 4.0) * 0.05 + 1.0;
            pos *= pulse;
          }
          
          // Consciousness-based elevation
          pos.z += vIntensity * 0.1;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 segmentColor;
        uniform float selected;
        uniform float consciousnessLevel;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        varying float vIntensity;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          
          // Create radial pattern
          float radialPattern = sin(dist * 20.0 + time * 2.0) * 0.1 + 0.9;
          
          // Color based on intensity and selection
          vec3 color = segmentColor;
          if (selected > 0.5) {
            color = mix(color, vec3(1.0, 1.0, 1.0), 0.3);
          }
          
          // Apply intensity and pattern
          color *= vIntensity * radialPattern;
          
          // Add consciousness glow
          float glow = 1.0 - smoothstep(0.0, 1.0, dist);
          color += glow * segmentColor * consciousnessLevel * 0.2;
          
          // Transparency based on distance and intensity
          float alpha = (1.0 - smoothstep(0.0, 1.0, dist)) * vIntensity;
          alpha = max(alpha, 0.3); // Minimum visibility
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [consciousnessLevel]);

  // Handle segment interaction
  const handleSegmentClick = (segment: CircleSegment) => {
    setSelectedSegment(segment.id === selectedSegment ? null : segment.id);
    if (onSegmentClick) {
      onSegmentClick(segment);
    }
  };

  // Animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Update shader uniforms for all materials
    splitCircleMaterial.uniforms.time.value = time;
    splitCircleMaterial.uniforms.consciousnessLevel.value = consciousnessLevel;

    // Animate group rotation
    if (groupRef.current && animated) {
      groupRef.current.rotation.z += delta * rotationSpeed * consciousnessLevel;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Split Circle Segments */}
      {createSplitCircleVisualization.segments.map(segment => {
        const innerRadius = radius * 0.3;
        const outerRadius = radius * (0.6 + (segment.value / 100) * 0.4);
        const segmentGeometry = createSegmentGeometry(segment, innerRadius, outerRadius);
        const isSelected = segment.id === selectedSegment;

        // Create material for this segment
        const segmentMaterial = splitCircleMaterial.clone();
        segmentMaterial.uniforms.segmentColor.value = segment.color;
        segmentMaterial.uniforms.selected.value = isSelected ? 1.0 : 0.0;
        segmentMaterial.uniforms.value.value = segment.value / 100;

        return (
          <group key={segment.id}>
            {/* Main segment */}
            <mesh
              geometry={segmentGeometry}
              material={segmentMaterial}
              onClick={() => handleSegmentClick(segment)}
              onPointerOver={() => setRotationSpeed(0.05)}
              onPointerOut={() => setRotationSpeed(0.1)}
            />

            {/* Segment label */}
            <group
              position={[
                Math.cos((segment.startAngle + segment.endAngle) / 2) * (radius * 0.8),
                Math.sin((segment.startAngle + segment.endAngle) / 2) * (radius * 0.8),
                0.1,
              ]}
            >
              <mesh>
                <sphereGeometry args={[0.02, 8, 8]} />
                <meshBasicMaterial color={segment.color} />
              </mesh>
            </group>

            {/* Value indicator */}
            {isSelected && (
              <group
                position={[
                  Math.cos((segment.startAngle + segment.endAngle) / 2) * (radius * 1.1),
                  Math.sin((segment.startAngle + segment.endAngle) / 2) * (radius * 1.1),
                  0.2,
                ]}
              >
                <mesh>
                  <boxGeometry args={[0.1, 0.02, segment.value / 100]} />
                  <meshBasicMaterial color={segment.color} transparent opacity={0.8} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}

      {/* Center circle */}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[radius * 0.25, 32]} />
        <meshBasicMaterial color='#FFFFFF' transparent opacity={0.8 + consciousnessLevel * 0.2} />
      </mesh>

      {/* Center value indicator */}
      <mesh position={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.02, 0.02, createSplitCircleVisualization.centerValue / 100]} />
        <meshBasicMaterial color='#FFD700' transparent opacity={0.9} />
      </mesh>

      {/* Consciousness level ring */}
      <mesh position={[0, 0, -0.05]}>
        <ringGeometry args={[radius * 1.1, radius * 1.15, 64]} />
        <meshBasicMaterial color='#E6E6FA' transparent opacity={consciousnessLevel * 0.5} />
      </mesh>

      {/* Data flow particles */}
      {createSplitCircleVisualization.segments.map(segment => {
        const particleCount = Math.floor(segment.value / 20);
        return Array.from({ length: particleCount }, (_, i) => {
          const angle =
            segment.startAngle + (segment.endAngle - segment.startAngle) * (i / particleCount);
          const particleRadius = radius * (0.4 + Math.sin(Date.now() * 0.001 + i) * 0.2);
          const x = Math.cos(angle) * particleRadius;
          const y = Math.sin(angle) * particleRadius;
          const z = Math.sin(Date.now() * 0.001 + i * 0.5) * 0.1;

          return (
            <mesh key={`${segment.id}-particle-${i}`} position={[x, y, z]}>
              <sphereGeometry args={[0.005, 4, 4]} />
              <meshBasicMaterial
                color={segment.color}
                transparent
                opacity={0.6 + Math.sin(Date.now() * 0.001 + i) * 0.3}
              />
            </mesh>
          );
        });
      })}

      {/* Binary Duality Visualization */}
      {binaryDualityMode && (
        <group>
          {/* Inner World (Left Half) */}
          <mesh position={[-radius * 0.5, 0, 0.02]} rotation={[0, 0, Math.PI / 2]}>
            <ringGeometry args={[radius * 0.2, radius * 0.8, 32, 1, 0, Math.PI]} />
            <meshBasicMaterial
              color='#4A90E2'
              transparent
              opacity={0.3 + binaryDualityData.coherence * 0.4}
            />
          </mesh>

          {/* Outer World (Right Half) */}
          <mesh position={[radius * 0.5, 0, 0.02]} rotation={[0, 0, -Math.PI / 2]}>
            <ringGeometry args={[radius * 0.2, radius * 0.8, 32, 1, 0, Math.PI]} />
            <meshBasicMaterial
              color='#E91E63'
              transparent
              opacity={0.3 + binaryDualityData.balance * 0.4}
            />
          </mesh>

          {/* Duality Balance Indicator */}
          <mesh position={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.01, 0.01, binaryDualityData.balance * 0.5]} />
            <meshBasicMaterial color='#FFD700' />
          </mesh>
        </group>
      )}

      {/* Lightning Vein Information Pulses */}
      {lightningVeinsEnabled &&
        generateLightningVeins.map(vein => {
          const pulseIntensity = Math.sin(Date.now() * 0.003 + vein.pulsePhase) * 0.5 + 0.5;

          return (
            <group key={vein.id}>
              {/* Lightning vein line */}
              <mesh>
                <cylinderGeometry
                  args={[
                    0.002 * vein.intensity,
                    0.005 * vein.intensity,
                    vein.startPosition.distanceTo(vein.endPosition),
                    6,
                  ]}
                />
                <meshBasicMaterial
                  color='#00FFFF'
                  transparent
                  opacity={0.6 + pulseIntensity * 0.4}
                />
              </mesh>

              {/* Data pulse particle */}
              <mesh
                position={[
                  THREE.MathUtils.lerp(vein.startPosition.x, vein.endPosition.x, pulseIntensity),
                  THREE.MathUtils.lerp(vein.startPosition.y, vein.endPosition.y, pulseIntensity),
                  THREE.MathUtils.lerp(vein.startPosition.z, vein.endPosition.z, pulseIntensity),
                ]}
              >
                <sphereGeometry args={[0.01 * vein.intensity, 6, 6]} />
                <meshBasicMaterial color='#FFFFFF' transparent opacity={pulseIntensity} />
              </mesh>
            </group>
          );
        })}

      {/* Eye of the Storm Navigation Center */}
      {eyeOfStormCenter && (
        <group position={[0, 0, 0.1]}>
          {/* Storm eye center */}
          <mesh>
            <torusGeometry args={[radius * 0.15, radius * 0.05, 8, 16]} />
            <meshBasicMaterial
              color='#9C27B0'
              transparent
              opacity={0.7 + Math.sin(Date.now() * 0.002) * 0.3}
            />
          </mesh>

          {/* Swirling energy */}
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i * Math.PI * 2) / 8 + Date.now() * 0.001;
            const spiralRadius = radius * 0.12;
            const x = Math.cos(angle) * spiralRadius;
            const y = Math.sin(angle) * spiralRadius;

            return (
              <mesh key={i} position={[x, y, 0.02]}>
                <sphereGeometry args={[0.005, 4, 4]} />
                <meshBasicMaterial color='#FFFFFF' transparent opacity={0.8} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Mind Map Visualization */}
      {mindMapVisualization &&
        generateMindMapNodes.map(node => (
          <group key={node.id} position={node.position.toArray()}>
            {/* Node */}
            <mesh>
              <sphereGeometry args={[0.03 + node.value / 200, 8, 8]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.8} />
            </mesh>

            {/* Node connections */}
            {node.connections.map(connectionId => {
              const connectedNode = generateMindMapNodes.find(n => n.id === connectionId);
              if (!connectedNode) return null;

              const distance = node.position.distanceTo(connectedNode.position);
              const midpoint = node.position
                .clone()
                .add(connectedNode.position)
                .multiplyScalar(0.5);

              return (
                <mesh key={connectionId} position={midpoint.toArray()}>
                  <cylinderGeometry args={[0.001, 0.001, distance, 4]} />
                  <meshBasicMaterial color={node.color} transparent opacity={0.4} />
                </mesh>
              );
            })}

            {/* Data type label */}
            <mesh position={[0, 0.05, 0]}>
              <planeGeometry args={[0.02, 0.01]} />
              <meshBasicMaterial color={node.color} transparent opacity={0.6} />
            </mesh>
          </group>
        ))}

      {/* Inner/Outer World Coherence Display */}
      {innerOuterCoherence && (
        <group position={[0, 0, 0.2]}>
          {/* Coherence ring */}
          <mesh>
            <torusGeometry args={[radius * 1.2, radius * 0.02, 8, 32]} />
            <meshBasicMaterial
              color='#00BCD4'
              transparent
              opacity={binaryDualityData.coherence * 0.8}
            />
          </mesh>

          {/* Coherence indicators */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = (i * Math.PI * 2) / 12;
            const coherenceRadius = radius * 1.2;
            const x = Math.cos(angle) * coherenceRadius;
            const y = Math.sin(angle) * coherenceRadius;
            const intensity = binaryDualityData.coherence;

            return (
              <mesh key={i} position={[x, y, 0]}>
                <sphereGeometry args={[0.01 * intensity, 4, 4]} />
                <meshBasicMaterial color='#FFFFFF' transparent opacity={intensity} />
              </mesh>
            );
          })}
        </group>
      )}

      {/* Interactive overlay */}
      <mesh position={[0, 0, 0.01]}>
        <circleGeometry args={[radius * 1.2, 64]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default SplitCircleSystemInterface;

/**
 * Cosmic Portal Temple Component
 *
 * Phase 5 Critical Component: 3D visualization of cosmic portal temples
 * Uses the Cosmic Portal Temple Foundation Library for architecture
 */

'use client';

import {
  createFractalOctahedron,
  createFractalTetrahedron,
} from '@/generators/sacred-geometry/platonic-solids';
import {
  CosmicPortalTemplate,
  TEMPLE_TEMPLATES,
  templeManager,
  TempleState,
} from '@/lib/cosmic-portal-temple';
import type { BreathState, ConsciousnessState } from '@/types';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CylinderGeometry,
  Group,
  RingGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3,
} from 'three';

// Phase 5.5 Panel 9 interfaces
interface InfiniteLibrary {
  id: string;
  gatewayPortal: LibraryGateway;
  sourceMemoryPool: SourceMemoryPool;
  knowledgeStreams: KnowledgeStream[];
  accessLevel: number; // 0-1, based on consciousness
}

interface LibraryGateway {
  id: string;
  position: Vector3;
  activated: boolean;
  requiredConsciousness: number;
  gatewayType: 'akashic' | 'collective' | 'cosmic' | 'source';
  visualSignature: GatewayVisuals;
}

interface GatewayVisuals {
  color: Color;
  particleCount: number;
  energyField: boolean;
  portalSize: number;
}

interface SourceMemoryPool {
  id: string;
  memoryNodes: MemoryNode[];
  poolDepth: number;
  accessibleMemories: string[];
  resonanceFrequency: number;
}

interface MemoryNode {
  id: string;
  position: Vector3;
  memoryType: 'personal' | 'collective' | 'archetypal' | 'cosmic' | 'source';
  content: string;
  accessLevel: number;
  activated: boolean;
}

interface KnowledgeStream {
  id: string;
  streamType: 'wisdom' | 'insight' | 'revelation' | 'understanding';
  flowPath: Vector3[];
  intensity: number;
  color: Color;
}

interface TreeWithinOrb {
  id: string;
  orbGeometry: OrbStructure;
  treeStructure: FractalTree;
  knowledgeSystem: KnowledgeSystem;
  growthStage: 'seed' | 'sapling' | 'mature' | 'ancient' | 'cosmic';
}

interface OrbStructure {
  radius: number;
  transparency: number;
  energyField: boolean;
  resonanceRings: ResonanceRing[];
}

interface ResonanceRing {
  id: string;
  radius: number;
  frequency: number;
  color: Color;
  activated: boolean;
}

interface FractalTree {
  trunk: TreeBranch;
  branches: TreeBranch[];
  leaves: KnowledgeLeaf[];
  rootSystem: TreeRoot[];
}

interface TreeBranch {
  id: string;
  startPosition: Vector3;
  endPosition: Vector3;
  thickness: number;
  knowledgeCapacity: number;
  attachedKnowledge: string[];
}

interface KnowledgeLeaf {
  id: string;
  position: Vector3;
  knowledgeType: string;
  wisdom: string;
  activated: boolean;
  color: Color;
}

interface TreeRoot {
  id: string;
  position: Vector3;
  depth: number;
  sourceConnection: boolean;
  memoryAccess: string[];
}

interface KnowledgeSystem {
  totalKnowledge: number;
  accessibleKnowledge: number;
  wisdomLevel: number;
  insightGeneration: boolean;
  revelationCapacity: number;
}

interface CosmicPortalTempleProps {
  consciousness: ConsciousnessState;
  breath: BreathState;
  position?: [number, number, number];
  templateId?: keyof typeof TEMPLE_TEMPLATES;
  customTemplate?: CosmicPortalTemplate;
  onPortalActivated?: (portalId: string) => void;
  onTempleEntered?: (templeId: string) => void;
  isActive?: boolean;
  // Phase 5.5 Panel 9 enhancements
  infiniteLibraryEnabled?: boolean;
  treeWithinOrbEnabled?: boolean;
  collectiveWisdomEnabled?: boolean;
  endgameModulesEnabled?: boolean;
  communityFieldEnabled?: boolean;
}

export const CosmicPortalTemple: React.FC<CosmicPortalTempleProps> = ({
  consciousness,
  breath,
  position = [0, 0, 0],
  templateId = 'MEDITATION_SANCTUARY',
  customTemplate,
  onPortalActivated,
  onTempleEntered,
  isActive = true,
  // Phase 5.5 Panel 9 enhancements
  infiniteLibraryEnabled = true,
  treeWithinOrbEnabled = true,
  collectiveWisdomEnabled = true,
  endgameModulesEnabled = true,
  communityFieldEnabled = true,
}) => {
  const groupRef = useRef<Group>(null);
  const [templeState, setTempleState] = useState<TempleState | null>(null);
  const [hoveredPortal, setHoveredPortal] = useState<string | null>(null);

  // Phase 5.5 state
  const [infiniteLibrary, setInfiniteLibrary] = useState<InfiniteLibrary | null>(null);
  const [treeWithinOrb, setTreeWithinOrb] = useState<TreeWithinOrb | null>(null);
  const [knowledgeStreams, setKnowledgeStreams] = useState<KnowledgeStream[]>([]);

  // Get temple template
  const temple = useMemo(() => {
    return customTemplate || TEMPLE_TEMPLATES[templateId];
  }, [customTemplate, templateId]);

  // Initialize temple in manager
  useEffect(() => {
    templeManager.registerTemple(temple);
  }, [temple]);

  // Generate Infinite Library with Gateway to Source Memory Pool
  const generateInfiniteLibrary = useMemo((): InfiniteLibrary | null => {
    if (!infiniteLibraryEnabled) return null;

    const gatewayTypes: LibraryGateway['gatewayType'][] = [
      'akashic',
      'collective',
      'cosmic',
      'source',
    ];
    const selectedGatewayType =
      gatewayTypes[Math.floor(consciousness.awarenessLevel * gatewayTypes.length)];

    const gatewayPortal: LibraryGateway = {
      id: 'infinite-library-gateway',
      position: new Vector3(0, temple.geometry.dimensions.height + 3, 0),
      activated: consciousness.awarenessLevel > 0.7,
      requiredConsciousness: 0.7,
      gatewayType: selectedGatewayType,
      visualSignature: {
        color: new Color().setHSL(0.6, 0.8, 0.7),
        particleCount: Math.floor(50 + consciousness.awarenessLevel * 100),
        energyField: true,
        portalSize: 2.0 + consciousness.awarenessLevel * 2.0,
      },
    };

    // Generate memory nodes for the source memory pool
    const memoryNodes: MemoryNode[] = [];
    const memoryTypes: MemoryNode['memoryType'][] = [
      'personal',
      'collective',
      'archetypal',
      'cosmic',
      'source',
    ];

    for (let i = 0; i < 20; i++) {
      const angle = (i * Math.PI * 2) / 20;
      const radius = 5 + (i % 4) * 2;
      const height = 2 + Math.sin(i) * 3;

      memoryNodes.push({
        id: `memory-node-${i}`,
        position: new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius),
        memoryType: memoryTypes[i % memoryTypes.length],
        content: `Sacred knowledge ${i + 1}`,
        accessLevel: Math.min(1.0, consciousness.awarenessLevel + i * 0.05),
        activated: consciousness.awarenessLevel > i * 0.05,
      });
    }

    const sourceMemoryPool: SourceMemoryPool = {
      id: 'source-memory-pool',
      memoryNodes,
      poolDepth: consciousness.awarenessLevel * 10,
      accessibleMemories: memoryNodes.filter(node => node.activated).map(node => node.id),
      resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.GAMMA + consciousness.awarenessLevel * 200,
    };

    // Generate knowledge streams
    const knowledgeStreams: KnowledgeStream[] = [];
    const streamTypes: KnowledgeStream['streamType'][] = [
      'wisdom',
      'insight',
      'revelation',
      'understanding',
    ];

    streamTypes.forEach((streamType, index) => {
      const flowPath: Vector3[] = [];
      const streamRadius = 3 + index;

      // Create spiral flow path
      for (let t = 0; t < Math.PI * 4; t += 0.2) {
        flowPath.push(new Vector3(Math.cos(t) * streamRadius, t * 0.5, Math.sin(t) * streamRadius));
      }

      knowledgeStreams.push({
        id: `knowledge-stream-${streamType}`,
        streamType,
        flowPath,
        intensity: consciousness.awarenessLevel * (0.5 + Math.random() * 0.5),
        color: new Color().setHSL(index / streamTypes.length, 0.8, 0.6),
      });
    });

    return {
      id: 'infinite-library',
      gatewayPortal,
      sourceMemoryPool,
      knowledgeStreams,
      accessLevel: consciousness.awarenessLevel,
    };
  }, [infiniteLibraryEnabled, consciousness.awarenessLevel, temple.geometry.dimensions.height]);

  // Generate Tree-within-Orb Fractal Knowledge System
  const generateTreeWithinOrb = useMemo((): TreeWithinOrb | null => {
    if (!treeWithinOrbEnabled) return null;

    // Determine growth stage based on consciousness level
    let growthStage: TreeWithinOrb['growthStage'] = 'seed';
    if (consciousness.awarenessLevel > 0.2) growthStage = 'sapling';
    if (consciousness.awarenessLevel > 0.4) growthStage = 'mature';
    if (consciousness.awarenessLevel > 0.7) growthStage = 'ancient';
    if (consciousness.awarenessLevel > 0.9) growthStage = 'cosmic';

    // Generate orb structure with resonance rings
    const resonanceRings: ResonanceRing[] = [];
    const ringCount = Math.floor(2 + consciousness.awarenessLevel * 5); // 2-7 rings

    for (let i = 0; i < ringCount; i++) {
      resonanceRings.push({
        id: `resonance-ring-${i}`,
        radius: 2 + i * 0.5,
        frequency: CONSCIOUSNESS_FREQUENCIES.GAMMA + i * 100,
        color: new Color().setHSL(i / ringCount, 0.7, 0.6),
        activated: consciousness.awarenessLevel > i * 0.15,
      });
    }

    const orbGeometry: OrbStructure = {
      radius: 3 + consciousness.awarenessLevel * 2,
      transparency: 0.8 - consciousness.awarenessLevel * 0.3,
      energyField: consciousness.awarenessLevel > 0.5,
      resonanceRings,
    };

    // Generate fractal tree structure
    const branchCount = Math.floor(3 + consciousness.awarenessLevel * 8); // 3-11 branches
    const branches: TreeBranch[] = [];

    for (let i = 0; i < branchCount; i++) {
      const angle = (i * Math.PI * 2) / branchCount;
      const length = 1 + consciousness.awarenessLevel * 2;

      branches.push({
        id: `tree-branch-${i}`,
        startPosition: new Vector3(0, 0, 0),
        endPosition: new Vector3(Math.cos(angle) * length, length * 0.8, Math.sin(angle) * length),
        thickness: 0.05 + consciousness.awarenessLevel * 0.1,
        knowledgeCapacity: Math.floor(5 + consciousness.awarenessLevel * 10),
        attachedKnowledge: [`knowledge-${i}-1`, `knowledge-${i}-2`],
      });
    }

    // Generate knowledge leaves
    const leaves: KnowledgeLeaf[] = [];
    const leafCount = Math.floor(10 + consciousness.awarenessLevel * 20); // 10-30 leaves

    for (let i = 0; i < leafCount; i++) {
      const branchIndex = i % branches.length;
      const branch = branches[branchIndex];
      const leafPosition = branch.endPosition
        .clone()
        .add(
          new Vector3((Math.random() - 0.5) * 0.5, Math.random() * 0.3, (Math.random() - 0.5) * 0.5)
        );

      leaves.push({
        id: `knowledge-leaf-${i}`,
        position: leafPosition,
        knowledgeType: ['wisdom', 'insight', 'understanding', 'revelation'][i % 4],
        wisdom: `Sacred wisdom ${i + 1}`,
        activated: consciousness.awarenessLevel > i * 0.03,
        color: new Color().setHSL(i / leafCount, 0.8, 0.6),
      });
    }

    // Generate root system
    const rootSystem: TreeRoot[] = [];
    const rootCount = Math.floor(5 + consciousness.awarenessLevel * 8); // 5-13 roots

    for (let i = 0; i < rootCount; i++) {
      const angle = (i * Math.PI * 2) / rootCount;
      const depth = 1 + consciousness.awarenessLevel * 2;

      rootSystem.push({
        id: `tree-root-${i}`,
        position: new Vector3(Math.cos(angle) * 0.8, -depth, Math.sin(angle) * 0.8),
        depth,
        sourceConnection: consciousness.awarenessLevel > 0.8,
        memoryAccess: [`memory-${i}-1`, `memory-${i}-2`],
      });
    }

    const treeStructure: FractalTree = {
      trunk: {
        id: 'main-trunk',
        startPosition: new Vector3(0, -1, 0),
        endPosition: new Vector3(0, 2, 0),
        thickness: 0.2 + consciousness.awarenessLevel * 0.1,
        knowledgeCapacity: Math.floor(20 + consciousness.awarenessLevel * 30),
        attachedKnowledge: ['core-wisdom-1', 'core-wisdom-2', 'core-wisdom-3'],
      },
      branches,
      leaves,
      rootSystem,
    };

    const knowledgeSystem: KnowledgeSystem = {
      totalKnowledge: leafCount + branchCount * 2,
      accessibleKnowledge: Math.floor((leafCount + branchCount * 2) * consciousness.awarenessLevel),
      wisdomLevel: consciousness.awarenessLevel,
      insightGeneration: consciousness.awarenessLevel > 0.6,
      revelationCapacity: Math.floor(consciousness.awarenessLevel * 10),
    };

    return {
      id: 'tree-within-orb',
      orbGeometry,
      treeStructure,
      knowledgeSystem,
      growthStage,
    };
  }, [treeWithinOrbEnabled, consciousness.awarenessLevel]);

  // Update temple state
  useFrame(() => {
    if (!isActive) return;

    const updatedState = templeManager.updateTempleState(temple.id, consciousness, breath);
    setTempleState(updatedState);
  });

  // Create temple base geometry
  const createTempleBase = () => {
    const { geometry } = temple;
    const { radius, height } = geometry.dimensions;

    switch (geometry.baseShape) {
      case 'octagonal':
        return createFractalOctahedron(
          radius,
          consciousness,
          geometry.fractalComplexity,
          'mandelbrot'
        );
      case 'circular':
        return {
          vertices: [],
          faces: [],
          edges: [],
          center: new Vector3(0, 0, 0),
          radius,
        };
      case 'spiral':
        return createFractalTetrahedron(radius, consciousness, geometry.fractalComplexity, 'julia');
      case 'merkaba':
        return createFractalOctahedron(radius, consciousness, geometry.fractalComplexity, 'dragon');
      default:
        return createFractalOctahedron(radius, consciousness, 2, 'mandelbrot');
    }
  };

  // Create portal geometry
  const createPortalGeometry = (portalConfig: any) => {
    const isActive = templeState?.activePortals.includes(portalConfig.id) || false;
    const scale = isActive ? 1.2 : 0.8;

    return createFractalTetrahedron(portalConfig.size * scale, consciousness, 2, 'julia');
  };

  // Animate temple elements
  useFrame((state, delta) => {
    if (!groupRef.current || !isActive || !templeState) return;

    const time = state.clock.elapsedTime;

    // Temple breathing effect
    if (temple.geometry.breathSynchronization) {
      const breathScale =
        breath.phase === 'inhale'
          ? 1 + breath.intensity * 0.05
          : breath.phase === 'exhale'
            ? 1 - breath.intensity * 0.03
            : 1;
      groupRef.current.scale.setScalar(breathScale);
    }

    // Consciousness-responsive glow
    groupRef.current.children.forEach((child, index) => {
      if (child.userData.type === 'portal') {
        // Portal rotation and glow
        child.rotation.y += delta * 0.5;

        if ('material' in child && child.material) {
          const material = child.material as any;
          if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = templeState.activated ? 0.3 : 0.1;
          }
        }
      }

      if (child.userData.type === 'energy-field') {
        // Energy field pulsing
        const fieldId = child.userData.fieldId;
        const fieldState = templeState.energyFieldStates.find(f => f.id === fieldId);

        if (fieldState?.active) {
          const pulse = 1 + Math.sin(time * 3) * 0.1 * fieldState.currentIntensity;
          child.scale.setScalar(pulse);
        }
      }
    });

    // Temple rotation based on consciousness
    groupRef.current.rotation.y += delta * 0.02 * consciousness.awarenessLevel;
  });

  if (!isActive || !templeState) return null;

  const templeBase = createTempleBase();

  return (
    <group ref={groupRef} position={position}>
      {/* Temple Base Structure */}
      <mesh userData={{ type: 'temple-base' }}>
        <bufferGeometry>
          <bufferAttribute
            attach='attributes-position'
            count={templeBase.vertices.length}
            array={new Float32Array(templeBase.vertices.flatMap(v => [v.x, v.y, v.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <meshStandardMaterial
          color={templeState.activated ? '#4a90e2' : '#2c3e50'}
          emissive={templeState.activated ? '#1e3a8a' : '#000000'}
          emissiveIntensity={templeState.activated ? 0.2 : 0}
          transparent
          opacity={0.8}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Temple Foundation */}
      <mesh position={[0, -1, 0]}>
        <CylinderGeometry
          args={[
            temple.geometry.dimensions.radius * 1.2,
            temple.geometry.dimensions.radius * 1.2,
            0.5,
            16,
          ]}
        />
        <meshStandardMaterial color='#34495e' roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Portals */}
      {temple.portals.map((portal, index) => {
        const portalGeometry = createPortalGeometry(portal);
        const isPortalActive = templeState.activePortals.includes(portal.id);

        return (
          <mesh
            key={portal.id}
            position={portal.position.toArray()}
            scale={portal.size}
            userData={{ type: 'portal', portalId: portal.id }}
            onClick={() => {
              if (isPortalActive) {
                onPortalActivated?.(portal.id);
              }
            }}
            onPointerEnter={() => setHoveredPortal(portal.id)}
            onPointerLeave={() => setHoveredPortal(null)}
          >
            <bufferGeometry>
              <bufferAttribute
                attach='attributes-position'
                count={portalGeometry.vertices.length}
                array={new Float32Array(portalGeometry.vertices.flatMap(v => [v.x, v.y, v.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <meshStandardMaterial
              color={portal.visualSignature.color}
              emissive={portal.visualSignature.color}
              emissiveIntensity={isPortalActive ? 0.4 : 0.1}
              transparent
              opacity={isPortalActive ? 0.9 : 0.5}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>
        );
      })}

      {/* Energy Fields */}
      {temple.energyFields.map((field, index) => {
        const fieldState = templeState.energyFieldStates.find(f => f.id === field.id);

        return (
          fieldState?.active && (
            <mesh
              key={field.id}
              position={field.center.toArray()}
              userData={{ type: 'energy-field', fieldId: field.id }}
            >
              <SphereGeometry args={[field.radius, 16, 16]} />
              <meshBasicMaterial
                color={
                  field.type === 'healing'
                    ? '#00ff88'
                    : field.type === 'amplifying'
                      ? '#ff6b6b'
                      : field.type === 'transformative'
                        ? '#9370db'
                        : '#87ceeb'
                }
                transparent
                opacity={0.1 * fieldState.currentIntensity}
                wireframe
              />
            </mesh>
          )
        );
      })}

      {/* Sacred Elements */}
      {temple.sacredElements.map((element, index) => (
        <group key={element.id} position={element.position.toArray()}>
          {element.type === 'altar' && (
            <mesh>
              <CylinderGeometry args={[1, 1.2, 0.5, 8]} />
              <meshStandardMaterial color='#8b4513' roughness={0.7} />
            </mesh>
          )}

          {element.type === 'pillar' && (
            <mesh>
              <CylinderGeometry args={[0.3, 0.3, 4, 8]} />
              <meshStandardMaterial color='#dcdcdc' roughness={0.4} metalness={0.6} />
            </mesh>
          )}

          {element.type === 'crystal' && (
            <mesh>
              <SphereGeometry args={[0.5, 8, 8]} />
              <meshStandardMaterial
                color='#e6e6fa'
                transparent
                opacity={0.8}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          )}

          {element.type === 'flame' && (
            <mesh>
              <SphereGeometry args={[0.3, 6, 6]} />
              <meshBasicMaterial color='#ff4500' emissive='#ff4500' emissiveIntensity={0.5} />
            </mesh>
          )}
        </group>
      ))}

      {/* Temple Activation Indicator */}
      {templeState.activated && (
        <mesh position={[0, temple.geometry.dimensions.height + 2, 0]}>
          <RingGeometry args={[2, 2.5, 16]} />
          <meshBasicMaterial
            color='#ffd700'
            emissive='#ffd700'
            emissiveIntensity={0.3}
            transparent
            opacity={0.7}
          />
        </mesh>
      )}

      {/* Phase 5.5 Panel 9 Enhancements */}

      {/* Infinite Library Gateway to Source Memory Pool */}
      {infiniteLibraryEnabled && generateInfiniteLibrary && (
        <group>
          {/* Library Gateway Portal */}
          <group position={generateInfiniteLibrary.gatewayPortal.position.toArray()}>
            {/* Gateway portal */}
            <mesh>
              <torusGeometry
                args={[
                  generateInfiniteLibrary.gatewayPortal.visualSignature.portalSize,
                  0.2,
                  8,
                  16,
                ]}
              />
              <meshBasicMaterial
                color={generateInfiniteLibrary.gatewayPortal.visualSignature.color}
                emissive={generateInfiniteLibrary.gatewayPortal.visualSignature.color}
                emissiveIntensity={generateInfiniteLibrary.gatewayPortal.activated ? 0.5 : 0.2}
                transparent
                opacity={0.8}
              />
            </mesh>

            {/* Gateway energy field */}
            {generateInfiniteLibrary.gatewayPortal.visualSignature.energyField && (
              <mesh>
                <sphereGeometry
                  args={[
                    generateInfiniteLibrary.gatewayPortal.visualSignature.portalSize * 1.5,
                    16,
                    16,
                  ]}
                />
                <meshBasicMaterial
                  color={generateInfiniteLibrary.gatewayPortal.visualSignature.color}
                  transparent
                  opacity={0.1}
                  wireframe
                />
              </mesh>
            )}

            {/* Gateway particles */}
            {Array.from(
              { length: generateInfiniteLibrary.gatewayPortal.visualSignature.particleCount },
              (_, i) => {
                const angle =
                  (i * Math.PI * 2) /
                  generateInfiniteLibrary.gatewayPortal.visualSignature.particleCount;
                const radius =
                  generateInfiniteLibrary.gatewayPortal.visualSignature.portalSize *
                  (0.8 + Math.sin(Date.now() * 0.001 + i) * 0.3);

                return (
                  <mesh
                    key={i}
                    position={[
                      Math.cos(angle) * radius,
                      Math.sin(angle * 3) * 0.2,
                      Math.sin(angle) * radius,
                    ]}
                  >
                    <sphereGeometry args={[0.02, 4, 4]} />
                    <meshBasicMaterial
                      color={generateInfiniteLibrary.gatewayPortal.visualSignature.color}
                      transparent
                      opacity={0.8}
                    />
                  </mesh>
                );
              }
            )}
          </group>

          {/* Source Memory Pool */}
          {generateInfiniteLibrary.sourceMemoryPool.memoryNodes.map(node => (
            <group key={node.id} position={node.position.toArray()}>
              <mesh>
                <sphereGeometry args={[0.1 + node.accessLevel * 0.1, 8, 8]} />
                <meshBasicMaterial
                  color={
                    node.memoryType === 'personal'
                      ? '#FFD700'
                      : node.memoryType === 'collective'
                        ? '#87CEEB'
                        : node.memoryType === 'archetypal'
                          ? '#DDA0DD'
                          : node.memoryType === 'cosmic'
                            ? '#FF69B4'
                            : '#F0F8FF'
                  }
                  transparent
                  opacity={node.activated ? 0.8 : 0.3}
                />
              </mesh>

              {/* Memory access indicator */}
              {node.activated && (
                <mesh position={[0, 0.2, 0]}>
                  <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
                  <meshBasicMaterial color='#FFFFFF' emissive='#FFFFFF' emissiveIntensity={0.3} />
                </mesh>
              )}
            </group>
          ))}

          {/* Knowledge Streams */}
          {generateInfiniteLibrary.knowledgeStreams.map(stream => (
            <group key={stream.id}>
              {stream.flowPath.map((point, index) => (
                <mesh key={index} position={point.toArray()}>
                  <sphereGeometry args={[0.03 * stream.intensity, 4, 4]} />
                  <meshBasicMaterial
                    color={stream.color}
                    transparent
                    opacity={0.6 + Math.sin(Date.now() * 0.001 + index * 0.1) * 0.4}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* Tree-within-Orb Fractal Knowledge System */}
      {treeWithinOrbEnabled && generateTreeWithinOrb && (
        <group position={[0, temple.geometry.dimensions.height * 0.3, 0]}>
          {/* Orb Structure */}
          <mesh>
            <sphereGeometry args={[generateTreeWithinOrb.orbGeometry.radius, 32, 32]} />
            <meshBasicMaterial
              color='#87CEEB'
              transparent
              opacity={generateTreeWithinOrb.orbGeometry.transparency}
              wireframe
            />
          </mesh>

          {/* Resonance Rings */}
          {generateTreeWithinOrb.orbGeometry.resonanceRings.map(ring => (
            <mesh key={ring.id} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[ring.radius, 0.05, 8, 16]} />
              <meshBasicMaterial
                color={ring.color}
                transparent
                opacity={ring.activated ? 0.7 : 0.3}
              />
            </mesh>
          ))}

          {/* Orb Energy Field */}
          {generateTreeWithinOrb.orbGeometry.energyField && (
            <mesh>
              <sphereGeometry args={[generateTreeWithinOrb.orbGeometry.radius * 1.2, 16, 16]} />
              <meshBasicMaterial color='#4169E1' transparent opacity={0.05} />
            </mesh>
          )}

          {/* Fractal Tree Structure */}
          {/* Tree trunk */}
          <mesh
            position={generateTreeWithinOrb.treeStructure.trunk.startPosition.toArray()}
            rotation={[0, 0, 0]}
          >
            <cylinderGeometry
              args={[
                generateTreeWithinOrb.treeStructure.trunk.thickness,
                generateTreeWithinOrb.treeStructure.trunk.thickness * 0.8,
                generateTreeWithinOrb.treeStructure.trunk.endPosition.y -
                  generateTreeWithinOrb.treeStructure.trunk.startPosition.y,
                8,
              ]}
            />
            <meshStandardMaterial color='#8B4513' />
          </mesh>

          {/* Tree branches */}
          {generateTreeWithinOrb.treeStructure.branches.map(branch => {
            const direction = branch.endPosition.clone().sub(branch.startPosition);
            const length = direction.length();
            const midpoint = branch.startPosition
              .clone()
              .add(branch.endPosition)
              .multiplyScalar(0.5);

            return (
              <mesh key={branch.id} position={midpoint.toArray()}>
                <cylinderGeometry args={[branch.thickness, branch.thickness * 0.7, length, 6]} />
                <meshStandardMaterial color='#A0522D' />
              </mesh>
            );
          })}

          {/* Knowledge leaves */}
          {generateTreeWithinOrb.treeStructure.leaves.map(leaf => (
            <group key={leaf.id} position={leaf.position.toArray()}>
              <mesh>
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshBasicMaterial
                  color={leaf.color}
                  transparent
                  opacity={leaf.activated ? 0.8 : 0.4}
                />
              </mesh>

              {/* Knowledge activation glow */}
              {leaf.activated && (
                <mesh>
                  <sphereGeometry args={[0.1, 8, 8]} />
                  <meshBasicMaterial color={leaf.color} transparent opacity={0.2} />
                </mesh>
              )}
            </group>
          ))}

          {/* Tree root system */}
          {generateTreeWithinOrb.treeStructure.rootSystem.map(root => (
            <group key={root.id} position={root.position.toArray()}>
              <mesh>
                <cylinderGeometry args={[0.02, 0.03, root.depth, 6]} />
                <meshStandardMaterial color='#654321' />
              </mesh>

              {/* Source connection indicator */}
              {root.sourceConnection && (
                <mesh position={[0, -root.depth * 0.5, 0]}>
                  <sphereGeometry args={[0.05, 6, 6]} />
                  <meshBasicMaterial color='#FFD700' emissive='#FFD700' emissiveIntensity={0.3} />
                </mesh>
              )}
            </group>
          ))}

          {/* Growth stage indicator */}
          <mesh position={[0, generateTreeWithinOrb.orbGeometry.radius + 0.5, 0]}>
            <planeGeometry args={[0.5, 0.2]} />
            <meshBasicMaterial
              color={
                generateTreeWithinOrb.growthStage === 'seed'
                  ? '#8B4513'
                  : generateTreeWithinOrb.growthStage === 'sapling'
                    ? '#32CD32'
                    : generateTreeWithinOrb.growthStage === 'mature'
                      ? '#228B22'
                      : generateTreeWithinOrb.growthStage === 'ancient'
                        ? '#006400'
                        : '#FFD700'
              }
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}

      {/* Consciousness Resonance Visualization */}
      <mesh position={[0, temple.geometry.dimensions.height / 2, 0]}>
        <TorusGeometry args={[temple.geometry.dimensions.radius * 0.8, 0.1, 8, 16]} />
        <meshBasicMaterial
          color='#87ceeb'
          transparent
          opacity={consciousness.awarenessLevel * 0.5}
        />
      </mesh>
    </group>
  );
};

export default CosmicPortalTemple;

/**
 * Submerged Symbolic Forest Practice Terrain
 *
 * Phase 5 Critical Component: Mystical underwater forest with sacred symbols
 * Provides practice terrain for consciousness exploration with breath-synchronized trees
 */

'use client';

import {
  createFractalOctahedron,
  createFractalTetrahedron,
} from '@/generators/sacred-geometry/platonic-solids';
import { FractalType } from '@/shaders/fractals/archetypal-fractals';
import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef, useState } from 'react';
import { Color, CylinderGeometry, Group, PlaneGeometry, Vector3 } from 'three';

const { SACRED_MATHEMATICS, CONSCIOUSNESS_FREQUENCIES } = CONSCIOUSNESS_CONSTANTS;

interface SubmergedSymbolicForestProps {
  consciousness: ConsciousnessState;
  breath: BreathState;
  position?: [number, number, number];
  size?: number;
  treeCount?: number;
  symbolCount?: number;
  onSymbolInteraction?: (symbolId: string, position: Vector3) => void;
  onPracticeAreaEntered?: (areaId: string) => void;
  isActive?: boolean;
  // Phase 5.3 Panel 7 enhancements
  darknessTheme?: boolean;
  luminousTreesEnabled?: boolean;
  mountainBackdropEnabled?: boolean;
  biorhythmDojoEnabled?: boolean;
  archetypeEvolutionEnabled?: boolean;
  practiceMode?: 'meditation' | 'breathwork' | 'visualization' | 'movement' | 'mastery';
}

interface ForestTree {
  id: string;
  position: Vector3;
  height: number;
  radius: number;
  breathSyncIntensity: number;
  fractalType: FractalType;
  symbolAttached?: string;
  // Phase 5.3 enhancements
  luminousIntensity: number;
  memoryGrowthLevel: number;
  multidimensionalLayers: number;
  biorhythmSync: boolean;
  archetypeResonance: string;
}

interface LuminousTree extends ForestTree {
  lightColor: Color;
  pulseFrequency: number;
  memoryNodes: MemoryNode[];
  dimensionalLayers: DimensionalLayer[];
}

interface MemoryNode {
  id: string;
  position: Vector3;
  memoryType: 'personal' | 'collective' | 'archetypal' | 'cosmic';
  intensity: number;
  connections: string[];
  activated: boolean;
}

interface DimensionalLayer {
  id: string;
  depth: number;
  opacity: number;
  fractalComplexity: number;
  resonanceFrequency: number;
}

interface MountainBackdrop {
  peaks: MountainPeak[];
  layeredMemory: SpatialMemoryLayer[];
  verticality: number;
}

interface MountainPeak {
  id: string;
  position: Vector3;
  height: number;
  width: number;
  memoryIntensity: number;
  archetypeAssociation: string;
}

interface SpatialMemoryLayer {
  id: string;
  altitude: number;
  memoryDensity: number;
  archetypeFrequency: number;
  visibility: number;
}

interface BiorhythmDojoTerrain {
  zones: DojoZone[];
  rhythmVisualization: RhythmPattern[];
  practiceAreas: EnhancedPracticeArea[];
}

interface DojoZone {
  id: string;
  center: Vector3;
  radius: number;
  biorhythmType: 'physical' | 'emotional' | 'intellectual' | 'spiritual';
  intensity: number;
  color: Color;
}

interface RhythmPattern {
  id: string;
  waveform: Vector3[];
  frequency: number;
  amplitude: number;
  phase: number;
}

interface EnhancedPracticeArea extends PracticeArea {
  masteryLevel: number;
  soloRitualSpace: boolean;
  quietMasteryIntensity: number;
  archetypeEvolution: ArchetypeEvolution;
}

interface ArchetypeEvolution {
  currentArchetype: string;
  evolutionProgress: number;
  nextArchetype: string;
  transformationNodes: TransformationNode[];
  evolutionVisualization: EvolutionVisualization;
}

interface TransformationNode {
  id: string;
  position: Vector3;
  archetypeFrom: string;
  archetypeTo: string;
  progress: number;
  activated: boolean;
}

interface EvolutionVisualization {
  spiralPath: Vector3[];
  colorGradient: Color[];
  particleSystem: EvolutionParticle[];
}

interface EvolutionParticle {
  id: string;
  position: Vector3;
  velocity: Vector3;
  color: Color;
  lifespan: number;
  archetypeEnergy: number;
}

interface SacredSymbol {
  id: string;
  type: 'pentagram' | 'flower-of-life' | 'vesica-piscis' | 'merkaba' | 'sri-yantra';
  position: Vector3;
  scale: number;
  activated: boolean;
  resonanceFrequency: number;
  color: Color;
}

interface PracticeArea {
  id: string;
  name: string;
  center: Vector3;
  radius: number;
  practiceType: 'meditation' | 'breathwork' | 'visualization' | 'movement';
  unlocked: boolean;
}

export const SubmergedSymbolicForest: React.FC<SubmergedSymbolicForestProps> = ({
  consciousness,
  breath,
  position = [0, 0, 0],
  size = 20,
  treeCount = 12,
  symbolCount = 8,
  onSymbolInteraction,
  onPracticeAreaEntered,
  isActive = true,
  // Phase 5.3 Panel 7 enhancements
  darknessTheme = false,
  luminousTreesEnabled = true,
  mountainBackdropEnabled = true,
  biorhythmDojoEnabled = true,
  archetypeEvolutionEnabled = true,
  practiceMode = 'meditation',
}) => {
  const groupRef = useRef<Group>(null);
  const [hoveredSymbol, setHoveredSymbol] = useState<string | null>(null);
  const [activePracticeArea, setActivePracticeArea] = useState<string | null>(null);

  // Phase 5.3 state
  const [luminousTrees, setLuminousTrees] = useState<LuminousTree[]>([]);
  const [mountainBackdrop, setMountainBackdrop] = useState<MountainBackdrop | null>(null);
  const [biorhythmDojo, setBiorhythmDojo] = useState<BiorhythmDojoTerrain | null>(null);
  const [archetypeEvolution, setArchetypeEvolution] = useState<ArchetypeEvolution | null>(null);

  // Generate forest trees with breath synchronization
  const forestTrees = useMemo(() => {
    const trees: ForestTree[] = [];
    const goldenAngle = SACRED_MATHEMATICS.PHI * Math.PI * 2;

    for (let i = 0; i < treeCount; i++) {
      const angle = i * goldenAngle;
      const radius = size * 0.8 * Math.sqrt(i / treeCount); // Spiral distribution

      const archetypes = [
        'warrior',
        'sage',
        'lover',
        'innocent',
        'explorer',
        'creator',
        'ruler',
        'magician',
        'caregiver',
        'jester',
        'rebel',
        'hero',
      ];

      trees.push({
        id: `tree-${i}`,
        position: new Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
        height: 3 + Math.random() * 4, // 3-7 units tall
        radius: 0.2 + Math.random() * 0.3, // 0.2-0.5 units radius
        breathSyncIntensity: 0.3 + Math.random() * 0.4, // 0.3-0.7 intensity
        fractalType: [FractalType.MANDELBROT, FractalType.JULIA, FractalType.DRAGON][i % 3],
        symbolAttached: i % 3 === 0 ? `symbol-${Math.floor(i / 3)}` : undefined,
        // Phase 5.3 enhancements
        luminousIntensity: consciousness.awarenessLevel * (0.5 + Math.random() * 0.5),
        memoryGrowthLevel: Math.min(1.0, consciousness.awarenessLevel + i * 0.1),
        multidimensionalLayers: Math.floor(2 + consciousness.awarenessLevel * 3), // 2-5 layers
        biorhythmSync: biorhythmDojoEnabled && Math.random() > 0.3,
        archetypeResonance: archetypes[i % archetypes.length],
      });
    }

    return trees;
  }, [treeCount, size, consciousness.awarenessLevel, biorhythmDojoEnabled]);

  // Generate luminous trees with multi-dimensional memory growth
  const generateLuminousTrees = useMemo((): LuminousTree[] => {
    if (!luminousTreesEnabled) return [];

    return forestTrees.map(tree => {
      const memoryNodes: MemoryNode[] = [];
      const dimensionalLayers: DimensionalLayer[] = [];

      // Generate memory nodes for each tree
      for (let i = 0; i < tree.multidimensionalLayers; i++) {
        const nodeAngle = (i * Math.PI * 2) / tree.multidimensionalLayers;
        const nodeRadius = tree.radius * (1 + i * 0.3);
        const nodeHeight = tree.height * (0.3 + i * 0.2);

        memoryNodes.push({
          id: `memory-${tree.id}-${i}`,
          position: new Vector3(
            tree.position.x + Math.cos(nodeAngle) * nodeRadius,
            nodeHeight,
            tree.position.z + Math.sin(nodeAngle) * nodeRadius
          ),
          memoryType: ['personal', 'collective', 'archetypal', 'cosmic'][
            i % 4
          ] as MemoryNode['memoryType'],
          intensity: tree.memoryGrowthLevel * (0.5 + Math.random() * 0.5),
          connections: i > 0 ? [`memory-${tree.id}-${i - 1}`] : [],
          activated: tree.memoryGrowthLevel > 0.5,
        });

        // Generate dimensional layers
        dimensionalLayers.push({
          id: `layer-${tree.id}-${i}`,
          depth: i * 0.5,
          opacity: 0.8 - i * 0.15,
          fractalComplexity: Math.min(5, 2 + i),
          resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.GAMMA + i * 20,
        });
      }

      const luminousTree: LuminousTree = {
        ...tree,
        lightColor: new Color().setHSL((tree.position.x + tree.position.z) / (size * 2), 0.7, 0.6),
        pulseFrequency: 0.5 + tree.luminousIntensity * 1.5,
        memoryNodes,
        dimensionalLayers,
      };

      return luminousTree;
    });
  }, [forestTrees, luminousTreesEnabled, size]);

  // Generate sacred symbols
  const sacredSymbols = useMemo(() => {
    const symbols: SacredSymbol[] = [];
    const symbolTypes: SacredSymbol['type'][] = [
      'pentagram',
      'flower-of-life',
      'vesica-piscis',
      'merkaba',
      'sri-yantra',
    ];

    for (let i = 0; i < symbolCount; i++) {
      const angle = (i / symbolCount) * Math.PI * 2;
      const radius = size * 0.6;

      symbols.push({
        id: `symbol-${i}`,
        type: symbolTypes[i % symbolTypes.length],
        position: new Vector3(
          Math.cos(angle) * radius,
          2 + Math.random() * 2, // Floating 2-4 units above ground
          Math.sin(angle) * radius
        ),
        scale: 0.8 + Math.random() * 0.4, // 0.8-1.2 scale
        activated: false,
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.GAMMA + i * 10, // Unique frequencies
        color: new Color().setHSL(i / symbolCount, 0.8, 0.6), // Rainbow distribution
      });
    }

    return symbols;
  }, [symbolCount, size]);

  // Generate practice areas
  const practiceAreas = useMemo(() => {
    const areas: PracticeArea[] = [
      {
        id: 'meditation-grove',
        name: 'Meditation Grove',
        center: new Vector3(0, 0, 0),
        radius: 3,
        practiceType: 'meditation',
        unlocked: consciousness.awarenessLevel > 0.2,
      },
      {
        id: 'breath-clearing',
        name: 'Breath Clearing',
        center: new Vector3(size * 0.4, 0, 0),
        radius: 2.5,
        practiceType: 'breathwork',
        unlocked: consciousness.awarenessLevel > 0.4,
      },
      {
        id: 'vision-pool',
        name: 'Vision Pool',
        center: new Vector3(-size * 0.4, 0, 0),
        radius: 2.5,
        practiceType: 'visualization',
        unlocked: consciousness.awarenessLevel > 0.6,
      },
      {
        id: 'movement-spiral',
        name: 'Movement Spiral',
        center: new Vector3(0, 0, size * 0.4),
        radius: 4,
        practiceType: 'movement',
        unlocked: consciousness.awarenessLevel > 0.8,
      },
    ];

    return areas;
  }, [size, consciousness.awarenessLevel]);

  // Generate mountain backdrop with layered spatial memory
  const generateMountainBackdrop = useMemo((): MountainBackdrop | null => {
    if (!mountainBackdropEnabled) return null;

    const peaks: MountainPeak[] = [];
    const layeredMemory: SpatialMemoryLayer[] = [];
    const archetypes = ['warrior', 'sage', 'lover', 'innocent', 'explorer', 'creator'];

    // Generate mountain peaks in a circle around the forest
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8;
      const distance = size * 2.5; // Mountains in the distance
      const height = 15 + Math.random() * 10; // 15-25 units tall

      peaks.push({
        id: `peak-${i}`,
        position: new Vector3(Math.cos(angle) * distance, height / 2, Math.sin(angle) * distance),
        height,
        width: 8 + Math.random() * 4, // 8-12 units wide
        memoryIntensity: consciousness.awarenessLevel * (0.3 + Math.random() * 0.7),
        archetypeAssociation: archetypes[i % archetypes.length],
      });
    }

    // Generate layered spatial memory at different altitudes
    for (let layer = 0; layer < 5; layer++) {
      layeredMemory.push({
        id: `memory-layer-${layer}`,
        altitude: 5 + layer * 3, // 5, 8, 11, 14, 17 units high
        memoryDensity: 1.0 - layer * 0.15, // Decreasing density with altitude
        archetypeFrequency: CONSCIOUSNESS_FREQUENCIES.GAMMA + layer * 50,
        visibility: consciousness.awarenessLevel > layer * 0.2 ? 1.0 : 0.3,
      });
    }

    return {
      peaks,
      layeredMemory,
      verticality: consciousness.awarenessLevel * 2.0, // Verticality increases with consciousness
    };
  }, [mountainBackdropEnabled, size, consciousness.awarenessLevel]);

  // Generate biorhythm dojo terrain
  const generateBiorhythmDojo = useMemo((): BiorhythmDojoTerrain | null => {
    if (!biorhythmDojoEnabled) return null;

    const zones: DojoZone[] = [];
    const rhythmVisualization: RhythmPattern[] = [];
    const enhancedPracticeAreas: EnhancedPracticeArea[] = [];

    // Create biorhythm zones
    const biorhythmTypes: DojoZone['biorhythmType'][] = [
      'physical',
      'emotional',
      'intellectual',
      'spiritual',
    ];
    biorhythmTypes.forEach((type, index) => {
      const angle = (index * Math.PI * 2) / biorhythmTypes.length;
      const radius = size * 0.3;

      zones.push({
        id: `biorhythm-${type}`,
        center: new Vector3(Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius),
        radius: 2.5,
        biorhythmType: type,
        intensity: consciousness.awarenessLevel * (0.5 + Math.random() * 0.5),
        color: new Color().setHSL(index / biorhythmTypes.length, 0.8, 0.6),
      });
    });

    // Generate rhythm patterns
    for (let i = 0; i < 4; i++) {
      const waveform: Vector3[] = [];
      const frequency = 0.5 + i * 0.3; // Different frequencies for each pattern
      const amplitude = 1.0 + i * 0.5;

      // Generate sine wave points
      for (let t = 0; t < Math.PI * 4; t += 0.1) {
        waveform.push(
          new Vector3(
            t - Math.PI * 2,
            Math.sin(t * frequency) * amplitude,
            Math.cos(t * frequency * 0.5) * amplitude * 0.5
          )
        );
      }

      rhythmVisualization.push({
        id: `rhythm-${i}`,
        waveform,
        frequency,
        amplitude,
        phase: i * Math.PI * 0.5,
      });
    }

    // Enhance practice areas with mastery and solo ritual spaces
    enhancedPracticeAreas.push(
      ...practiceAreas.map(area => ({
        ...area,
        masteryLevel: consciousness.awarenessLevel,
        soloRitualSpace: practiceMode === 'mastery',
        quietMasteryIntensity: darknessTheme ? 1.0 : 0.5,
        archetypeEvolution: {
          currentArchetype: 'seeker',
          evolutionProgress: consciousness.awarenessLevel,
          nextArchetype: consciousness.awarenessLevel > 0.8 ? 'master' : 'practitioner',
          transformationNodes: [],
          evolutionVisualization: {
            spiralPath: [],
            colorGradient: [],
            particleSystem: [],
          },
        },
      }))
    );

    return {
      zones,
      rhythmVisualization,
      practiceAreas: enhancedPracticeAreas,
    };
  }, [
    biorhythmDojoEnabled,
    size,
    consciousness.awarenessLevel,
    practiceAreas,
    practiceMode,
    darknessTheme,
  ]);

  // Create tree geometry with breath modulation
  const createTreeGeometry = (tree: ForestTree) => {
    const breathModulation =
      breath.phase === 'inhale'
        ? 1 + breath.intensity * tree.breathSyncIntensity * 0.2
        : breath.phase === 'exhale'
          ? 1 - breath.intensity * tree.breathSyncIntensity * 0.1
          : 1;

    // Trunk
    const trunkGeometry = new CylinderGeometry(
      tree.radius * 0.8,
      tree.radius,
      tree.height * breathModulation,
      8
    );

    // Canopy (fractal-based)
    const lodLevel = performanceOptimizer.getLODLevel(
      { position: tree.position } as any,
      { position: new Vector3(0, 0, 0) } as any
    );

    const canopyBase = createFractalTetrahedron(
      tree.radius * 2 * breathModulation,
      consciousness,
      Math.max(1, lodLevel.fractalDepth),
      'mandelbrot'
    );

    return { trunkGeometry, canopyBase };
  };

  // Create symbol geometry
  const createSymbolGeometry = (symbol: SacredSymbol) => {
    const baseGeometry = createFractalOctahedron(symbol.scale, consciousness, 2, 'julia');

    return baseGeometry;
  };

  // Animate forest elements
  useFrame((state, delta) => {
    if (!groupRef.current || !isActive) return;

    const time = state.clock.elapsedTime;

    // Animate trees with breath synchronization
    groupRef.current.children.forEach((child, index) => {
      if (child.userData.type === 'tree') {
        const tree = forestTrees[index];
        if (tree) {
          // Gentle swaying
          child.rotation.z = Math.sin(time * 0.5 + index) * 0.05 * tree.breathSyncIntensity;

          // Breath-synchronized scaling
          const breathScale = breath.phase === 'inhale' ? 1 + breath.intensity * 0.05 : 1;
          child.scale.setScalar(breathScale);
        }
      }

      if (child.userData.type === 'symbol') {
        // Floating animation
        child.position.y += Math.sin(time * 2 + index) * 0.01;

        // Gentle rotation
        child.rotation.y += delta * 0.2;

        // Consciousness-responsive glow
        if ('material' in child && child.material) {
          const material = child.material as any;
          if (material.uniforms) {
            material.uniforms.consciousnessLevel.value = consciousness.awarenessLevel;
            material.uniforms.time.value = time;
          }
        }
      }
    });

    // Submerged atmosphere effect
    groupRef.current.rotation.y += delta * 0.01; // Very slow rotation
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Submerged atmosphere - underwater effect */}
      <mesh position={[0, -1, 0]}>
        <PlaneGeometry args={[size * 2, size * 2]} />
        <meshStandardMaterial
          color='#1e3a5f'
          transparent
          opacity={0.3}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Forest floor with sacred geometry pattern */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <PlaneGeometry args={[size * 1.5, size * 1.5, 32, 32]} />
        <meshStandardMaterial color='#2d5a3d' roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Forest Trees */}
      {forestTrees.map((tree, index) => {
        const { trunkGeometry, canopyBase } = createTreeGeometry(tree);

        return (
          <group key={tree.id} position={tree.position.toArray()} userData={{ type: 'tree' }}>
            {/* Tree trunk */}
            <mesh geometry={trunkGeometry}>
              <meshStandardMaterial color='#4a3728' roughness={0.9} metalness={0.1} />
            </mesh>

            {/* Tree canopy (fractal) */}
            <mesh position={[0, tree.height * 0.7, 0]}>
              <bufferGeometry>
                <bufferAttribute
                  attach='attributes-position'
                  count={canopyBase.vertices.length}
                  array={new Float32Array(canopyBase.vertices.flatMap(v => [v.x, v.y, v.z]))}
                  itemSize={3}
                />
              </bufferGeometry>
              <meshStandardMaterial
                color='#2d5a3d'
                transparent
                opacity={0.8}
                roughness={0.6}
                metalness={0.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* Sacred Symbols */}
      {sacredSymbols.map((symbol, index) => {
        const symbolGeometry = createSymbolGeometry(symbol);

        return (
          <mesh
            key={symbol.id}
            position={symbol.position.toArray()}
            scale={symbol.scale}
            userData={{ type: 'symbol', symbolId: symbol.id }}
            onClick={() => onSymbolInteraction?.(symbol.id, symbol.position)}
            onPointerEnter={() => setHoveredSymbol(symbol.id)}
            onPointerLeave={() => setHoveredSymbol(null)}
          >
            <bufferGeometry>
              <bufferAttribute
                attach='attributes-position'
                count={symbolGeometry.vertices.length}
                array={new Float32Array(symbolGeometry.vertices.flatMap(v => [v.x, v.y, v.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <meshStandardMaterial
              color={symbol.color}
              emissive={symbol.color}
              emissiveIntensity={hoveredSymbol === symbol.id ? 0.3 : 0.1}
              transparent
              opacity={0.8}
              roughness={0.2}
              metalness={0.7}
            />
          </mesh>
        );
      })}

      {/* Practice Areas */}
      {practiceAreas.map(
        area =>
          area.unlocked && (
            <group key={area.id} position={area.center.toArray()}>
              {/* Practice area indicator */}
              <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[area.radius * 0.8, area.radius, 16]} />
                <meshBasicMaterial
                  color={activePracticeArea === area.id ? '#ffd700' : '#87ceeb'}
                  transparent
                  opacity={0.4}
                  side={2} // DoubleSide
                />
              </mesh>

              {/* Practice area energy field */}
              <mesh>
                <sphereGeometry args={[area.radius, 16, 16]} />
                <meshBasicMaterial color='#87ceeb' transparent opacity={0.1} wireframe />
              </mesh>
            </group>
          )
      )}

      {/* Phase 5.3 Panel 7 Enhancements */}

      {/* Luminous Trees with Multi-dimensional Memory Growth */}
      {luminousTreesEnabled &&
        generateLuminousTrees.map(luminousTree => (
          <group key={`luminous-${luminousTree.id}`} position={luminousTree.position.toArray()}>
            {/* Luminous tree aura */}
            <mesh>
              <sphereGeometry args={[luminousTree.radius * 3, 16, 16]} />
              <meshBasicMaterial
                color={luminousTree.lightColor}
                transparent
                opacity={0.1 + luminousTree.luminousIntensity * 0.2}
                wireframe
              />
            </mesh>

            {/* Memory nodes */}
            {luminousTree.memoryNodes.map(node => (
              <group key={node.id} position={node.position.toArray()}>
                <mesh>
                  <sphereGeometry args={[0.05 + node.intensity * 0.1, 8, 8]} />
                  <meshBasicMaterial
                    color={
                      node.memoryType === 'personal'
                        ? '#FFD700'
                        : node.memoryType === 'collective'
                          ? '#87CEEB'
                          : node.memoryType === 'archetypal'
                            ? '#DDA0DD'
                            : '#F0F8FF'
                    }
                    transparent
                    opacity={node.activated ? 0.8 : 0.4}
                  />
                </mesh>

                {/* Memory connections */}
                {node.connections.map(connectionId => {
                  const connectedNode = luminousTree.memoryNodes.find(n => n.id === connectionId);
                  if (!connectedNode) return null;

                  const distance = node.position.distanceTo(connectedNode.position);
                  const midpoint = node.position
                    .clone()
                    .add(connectedNode.position)
                    .multiplyScalar(0.5);

                  return (
                    <mesh key={connectionId} position={midpoint.toArray()}>
                      <cylinderGeometry args={[0.002, 0.002, distance, 4]} />
                      <meshBasicMaterial
                        color={luminousTree.lightColor}
                        transparent
                        opacity={0.6}
                      />
                    </mesh>
                  );
                })}
              </group>
            ))}

            {/* Dimensional layers */}
            {luminousTree.dimensionalLayers.map(layer => (
              <mesh key={layer.id} position={[0, layer.depth, 0]}>
                <torusGeometry
                  args={[luminousTree.radius * (1 + layer.depth), luminousTree.radius * 0.1, 8, 16]}
                />
                <meshBasicMaterial
                  color={luminousTree.lightColor}
                  transparent
                  opacity={layer.opacity * luminousTree.luminousIntensity}
                />
              </mesh>
            ))}
          </group>
        ))}

      {/* Mountain Backdrop with Layered Spatial Memory */}
      {mountainBackdropEnabled && generateMountainBackdrop && (
        <group>
          {/* Mountain peaks */}
          {generateMountainBackdrop.peaks.map(peak => (
            <group key={peak.id} position={peak.position.toArray()}>
              {/* Mountain geometry */}
              <mesh>
                <coneGeometry args={[peak.width, peak.height, 8]} />
                <meshStandardMaterial
                  color={darknessTheme ? '#2F2F2F' : '#8B7355'}
                  transparent
                  opacity={0.7 + peak.memoryIntensity * 0.3}
                />
              </mesh>

              {/* Memory intensity glow */}
              <mesh>
                <sphereGeometry args={[peak.width * 1.2, 16, 16]} />
                <meshBasicMaterial
                  color={
                    peak.archetypeAssociation === 'warrior'
                      ? '#FF4500'
                      : peak.archetypeAssociation === 'sage'
                        ? '#4169E1'
                        : peak.archetypeAssociation === 'lover'
                          ? '#FF69B4'
                          : peak.archetypeAssociation === 'innocent'
                            ? '#F0F8FF'
                            : peak.archetypeAssociation === 'explorer'
                              ? '#32CD32'
                              : '#FFD700'
                  }
                  transparent
                  opacity={peak.memoryIntensity * 0.2}
                  wireframe
                />
              </mesh>
            </group>
          ))}

          {/* Layered spatial memory */}
          {generateMountainBackdrop.layeredMemory.map(layer => (
            <mesh key={layer.id} position={[0, layer.altitude, 0]}>
              <torusGeometry args={[size * 2, size * 0.1, 8, 32]} />
              <meshBasicMaterial
                color='#87CEEB'
                transparent
                opacity={layer.visibility * layer.memoryDensity * 0.1}
                wireframe
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Biorhythm Dojo Terrain */}
      {biorhythmDojoEnabled && generateBiorhythmDojo && (
        <group>
          {/* Biorhythm zones */}
          {generateBiorhythmDojo.zones.map(zone => (
            <group key={zone.id} position={zone.center.toArray()}>
              {/* Zone indicator */}
              <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[zone.radius * 0.8, zone.radius, 16]} />
                <meshBasicMaterial
                  color={zone.color}
                  transparent
                  opacity={0.3 + zone.intensity * 0.4}
                />
              </mesh>

              {/* Biorhythm pulse */}
              <mesh>
                <sphereGeometry args={[zone.radius * 1.2, 16, 16]} />
                <meshBasicMaterial
                  color={zone.color}
                  transparent
                  opacity={0.1 + Math.sin(Date.now() * 0.001 * zone.intensity) * 0.1}
                  wireframe
                />
              </mesh>
            </group>
          ))}

          {/* Rhythm visualization */}
          {generateBiorhythmDojo.rhythmVisualization.map(rhythm => (
            <group key={rhythm.id}>
              {rhythm.waveform.map((point, index) => (
                <mesh key={index} position={point.toArray()}>
                  <sphereGeometry args={[0.02, 4, 4]} />
                  <meshBasicMaterial
                    color='#00FFFF'
                    transparent
                    opacity={
                      0.6 + Math.sin(Date.now() * 0.001 * rhythm.frequency + rhythm.phase) * 0.4
                    }
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {/* Darkness Theme for Quiet Mastery */}
      {darknessTheme && (
        <group>
          {/* Dark atmosphere overlay */}
          <mesh position={[0, 5, 0]}>
            <sphereGeometry args={[size * 3, 32, 32]} />
            <meshBasicMaterial
              color='#000000'
              transparent
              opacity={0.4}
              side={1} // BackSide
            />
          </mesh>

          {/* Solo ritual space indicators */}
          {practiceMode === 'mastery' &&
            Array.from({ length: 4 }, (_, i) => {
              const angle = (i * Math.PI * 2) / 4;
              const radius = size * 0.8;

              return (
                <mesh key={i} position={[Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius]}>
                  <cylinderGeometry args={[0.1, 0.1, 0.5, 8]} />
                  <meshBasicMaterial color='#4B0082' emissive='#4B0082' emissiveIntensity={0.3} />
                </mesh>
              );
            })}
        </group>
      )}

      {/* Enhanced Ambient Lighting */}
      <ambientLight
        intensity={darknessTheme ? 0.2 : 0.4}
        color={darknessTheme ? '#2F2F4F' : '#4a90e2'}
      />
      <pointLight
        position={[0, 10, 0]}
        intensity={darknessTheme ? 0.3 : 0.6}
        color={darknessTheme ? '#483D8B' : '#87ceeb'}
        distance={size * 2}
        decay={2}
      />

      {/* Luminous tree lighting */}
      {luminousTreesEnabled &&
        generateLuminousTrees
          .slice(0, 3)
          .map(tree => (
            <pointLight
              key={`light-${tree.id}`}
              position={[tree.position.x, tree.height, tree.position.z]}
              intensity={tree.luminousIntensity * 0.5}
              color={tree.lightColor}
              distance={tree.radius * 8}
              decay={2}
            />
          ))}
    </group>
  );
};

export default SubmergedSymbolicForest;

/**
 * Sigil Blossoms Breath-Tree Workshop Interface
 *
 * Phase 5 Critical Component: Interactive breath-synchronized tree with sigil blossoms
 * Workshop interface for creating and activating personal sigils through breath work
 */

'use client';

import { createFractalOctahedron } from '@/generators/sacred-geometry/platonic-solids';
import { FractalType } from '@/shaders/fractals/archetypal-fractals';
import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { useFrame } from '@react-three/fiber';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Color, CylinderGeometry, Group, SphereGeometry, TorusGeometry, Vector3 } from 'three';

const { SACRED_MATHEMATICS, CONSCIOUSNESS_FREQUENCIES } = CONSCIOUSNESS_CONSTANTS;

interface SigilBlossomBreathTreeProps {
  consciousness: ConsciousnessState;
  breath: BreathState;
  position?: [number, number, number];
  size?: number;
  maxBlossoms?: number;
  onSigilCreated?: (sigil: SigilBlossom) => void;
  onSigilActivated?: (sigilId: string) => void;
  onWorkshopCompleted?: (completedSigils: SigilBlossom[]) => void;
  isActive?: boolean;
  // Phase 5.4 Panel 8 enhancements
  gestureCreationEnabled?: boolean;
  emotionalNuanceEnabled?: boolean;
  breathRhythmSyncEnabled?: boolean;
  symbolicRevelationEnabled?: boolean;
  emotionMappingEnabled?: boolean;
}

interface SigilBlossom {
  id: string;
  intention: string;
  position: Vector3;
  scale: number;
  color: Color;
  activated: boolean;
  breathEnergy: number; // 0-1, accumulated through breath work
  creationTime: number;
  fractalSignature: FractalType;
  resonanceFrequency: number;
  // Phase 5.4 enhancements
  gestureSignature?: GestureSignature;
  emotionalNuance?: EmotionalNuance;
  breathRhythm?: BreathRhythm;
  symbolicRevelation?: SymbolicRevelation;
  emotionMapping?: EmotionMapping;
}

interface GestureSignature {
  gestureType: 'swipe' | 'circle' | 'spiral' | 'infinity' | 'pentagram' | 'custom';
  gesturePoints: Vector3[];
  gestureEnergy: number;
  creationGesture: boolean;
}

interface EmotionalNuance {
  primaryEmotion: 'joy' | 'love' | 'peace' | 'power' | 'wisdom' | 'transformation';
  intensity: number; // 0-1
  glyphSymbol: '!' | '?' | '○' | '△' | '□' | '◇' | '☆' | '♡';
  emotionalResonance: number;
  nuanceColor: Color;
}

interface BreathRhythm {
  rhythmPattern: number[]; // Array of breath intervals
  synchronization: number; // 0-1, how well synced with breath
  rhythmFrequency: number;
  breathHarmonics: number[];
  treeResonance: number;
}

interface SymbolicRevelation {
  revelationStage: 'seed' | 'growth' | 'bloom' | 'revelation' | 'integration';
  symbolsRevealed: string[];
  revelationProgress: number; // 0-1
  feedbackLoop: RevelationFeedback[];
  mysticalInsight: string;
}

interface RevelationFeedback {
  timestamp: number;
  feedbackType: 'visual' | 'energetic' | 'symbolic' | 'intuitive';
  intensity: number;
  message: string;
}

interface EmotionMapping {
  botanicalMetaphor: 'rose' | 'lotus' | 'oak' | 'willow' | 'cedar' | 'bamboo' | 'ivy' | 'fern';
  emotionalSpectrum: EmotionalSpectrum;
  mappingVisualization: MappingVisualization;
  resonanceField: ResonanceField;
}

interface EmotionalSpectrum {
  primary: string;
  secondary: string[];
  intensity: number;
  harmony: number;
  dissonance: number;
}

interface MappingVisualization {
  colorGradient: Color[];
  particleSystem: EmotionParticle[];
  energyField: Vector3[];
  botanicalForm: string;
}

interface EmotionParticle {
  id: string;
  position: Vector3;
  velocity: Vector3;
  emotion: string;
  intensity: number;
  lifespan: number;
}

interface ResonanceField {
  fieldStrength: number;
  fieldRadius: number;
  harmonicFrequencies: number[];
  fieldColor: Color;
}

interface BreathTreeBranch {
  id: string;
  startPosition: Vector3;
  endPosition: Vector3;
  thickness: number;
  breathSensitivity: number;
  blossomCapacity: number;
  attachedBlossoms: string[];
}

export const SigilBlossomBreathTree: React.FC<SigilBlossomBreathTreeProps> = ({
  consciousness,
  breath,
  position = [0, 0, 0],
  size = 8,
  maxBlossoms = 12,
  onSigilCreated,
  onSigilActivated,
  onWorkshopCompleted,
  isActive = true,
  // Phase 5.4 Panel 8 enhancements
  gestureCreationEnabled = true,
  emotionalNuanceEnabled = true,
  breathRhythmSyncEnabled = true,
  symbolicRevelationEnabled = true,
  emotionMappingEnabled = true,
}) => {
  const groupRef = useRef<Group>(null);
  const [sigilBlossoms, setSigilBlossoms] = useState<SigilBlossom[]>([]);
  const [selectedBlossom, setSelectedBlossom] = useState<string | null>(null);
  const [breathAccumulation, setBreathAccumulation] = useState(0);
  const [workshopMode, setWorkshopMode] = useState<'creating' | 'activating' | 'completed'>(
    'creating'
  );

  // Phase 5.4 state
  const [gestureBuffer, setGestureBuffer] = useState<Vector3[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionalNuance | null>(null);
  const [breathRhythmPattern, setBreathRhythmPattern] = useState<number[]>([]);
  const [revelationFeedback, setRevelationFeedback] = useState<RevelationFeedback[]>([]);
  const [emotionParticles, setEmotionParticles] = useState<EmotionParticle[]>([]);

  // Generate breath-tree structure
  const breathTreeBranches = useMemo(() => {
    const branches: BreathTreeBranch[] = [];
    const trunkHeight = size;
    const branchCount = 8;

    // Main trunk
    branches.push({
      id: 'trunk',
      startPosition: new Vector3(0, 0, 0),
      endPosition: new Vector3(0, trunkHeight * 0.6, 0),
      thickness: 0.3,
      breathSensitivity: 0.8,
      blossomCapacity: 0,
      attachedBlossoms: [],
    });

    // Primary branches (golden spiral distribution)
    for (let i = 0; i < branchCount; i++) {
      const angle = i * SACRED_MATHEMATICS.PHI * Math.PI * 2;
      const height = trunkHeight * 0.4 + (i / branchCount) * trunkHeight * 0.4;
      const radius = size * 0.6 * (1 - (i / branchCount) * 0.5);

      const startPos = new Vector3(0, height, 0);
      const endPos = new Vector3(
        Math.cos(angle) * radius,
        height + size * 0.3,
        Math.sin(angle) * radius
      );

      branches.push({
        id: `branch-${i}`,
        startPosition: startPos,
        endPosition: endPos,
        thickness: 0.15 - (i / branchCount) * 0.05,
        breathSensitivity: 0.6 + (i / branchCount) * 0.3,
        blossomCapacity: 2,
        attachedBlossoms: [],
      });
    }

    return branches;
  }, [size]);

  // Create new sigil blossom
  const createSigilBlossom = useCallback(
    (intention: string, branchId: string) => {
      if (sigilBlossoms.length >= maxBlossoms) return;

      const branch = breathTreeBranches.find(b => b.id === branchId);
      if (!branch || branch.attachedBlossoms.length >= branch.blossomCapacity) return;

      const blossomPosition = new Vector3().lerpVectors(
        branch.startPosition,
        branch.endPosition,
        0.7 + Math.random() * 0.3
      );

      // Generate Phase 5.4 enhancements
      const gestureSignature: GestureSignature | undefined = gestureCreationEnabled
        ? {
            gestureType: gestureBuffer.length > 0 ? 'custom' : 'circle',
            gesturePoints: gestureBuffer.length > 0 ? [...gestureBuffer] : [],
            gestureEnergy: consciousness.awarenessLevel * 0.8,
            creationGesture: true,
          }
        : undefined;

      const emotions = ['joy', 'love', 'peace', 'power', 'wisdom', 'transformation'] as const;
      const glyphs = ['!', '?', '○', '△', '□', '◇', '☆', '♡'] as const;
      const emotionalNuance: EmotionalNuance | undefined = emotionalNuanceEnabled
        ? {
            primaryEmotion: emotions[Math.floor(Math.random() * emotions.length)],
            intensity: consciousness.awarenessLevel * (0.5 + Math.random() * 0.5),
            glyphSymbol: glyphs[Math.floor(Math.random() * glyphs.length)],
            emotionalResonance: breath.coherence * consciousness.awarenessLevel,
            nuanceColor: new Color().setHSL(Math.random(), 0.9, 0.7),
          }
        : undefined;

      const breathRhythm: BreathRhythm | undefined = breathRhythmSyncEnabled
        ? {
            rhythmPattern: [...breathRhythmPattern],
            synchronization: breath.coherence,
            rhythmFrequency: breath.intensity * 2.0,
            breathHarmonics: [1.0, 1.618, 2.0, 2.618], // Golden ratio harmonics
            treeResonance: consciousness.awarenessLevel,
          }
        : undefined;

      const symbolicRevelation: SymbolicRevelation | undefined = symbolicRevelationEnabled
        ? {
            revelationStage: 'seed',
            symbolsRevealed: [],
            revelationProgress: 0,
            feedbackLoop: [],
            mysticalInsight: `Sigil ${sigilBlossoms.length + 1}: ${intention}`,
          }
        : undefined;

      const botanicalMetaphors = [
        'rose',
        'lotus',
        'oak',
        'willow',
        'cedar',
        'bamboo',
        'ivy',
        'fern',
      ] as const;
      const emotionMapping: EmotionMapping | undefined = emotionMappingEnabled
        ? {
            botanicalMetaphor:
              botanicalMetaphors[Math.floor(Math.random() * botanicalMetaphors.length)],
            emotionalSpectrum: {
              primary: emotionalNuance?.primaryEmotion || 'peace',
              secondary: ['harmony', 'growth', 'transformation'],
              intensity: consciousness.awarenessLevel,
              harmony: breath.coherence,
              dissonance: 1 - breath.coherence,
            },
            mappingVisualization: {
              colorGradient: [
                new Color().setHSL(0.3, 0.8, 0.6),
                new Color().setHSL(0.6, 0.8, 0.6),
                new Color().setHSL(0.9, 0.8, 0.6),
              ],
              particleSystem: [],
              energyField: [],
              botanicalForm: 'spiral',
            },
            resonanceField: {
              fieldStrength: consciousness.awarenessLevel,
              fieldRadius: 2.0 + consciousness.awarenessLevel * 3.0,
              harmonicFrequencies: [432, 528, 639, 741, 852],
              fieldColor: new Color().setHSL(Math.random(), 0.7, 0.5),
            },
          }
        : undefined;

      const newBlossom: SigilBlossom = {
        id: `sigil-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        intention,
        position: blossomPosition,
        scale: 0.5 + Math.random() * 0.3,
        color: emotionalNuance?.nuanceColor || new Color().setHSL(Math.random(), 0.8, 0.6),
        activated: false,
        breathEnergy: 0,
        creationTime: Date.now(),
        fractalSignature: [FractalType.MANDELBROT, FractalType.JULIA, FractalType.DRAGON][
          Math.floor(Math.random() * 3)
        ],
        resonanceFrequency: CONSCIOUSNESS_FREQUENCIES.GAMMA + Math.random() * 100,
        // Phase 5.4 enhancements
        gestureSignature,
        emotionalNuance,
        breathRhythm,
        symbolicRevelation,
        emotionMapping,
      };

      setSigilBlossoms(prev => [...prev, newBlossom]);

      // Update branch
      const updatedBranches = breathTreeBranches.map(b =>
        b.id === branchId ? { ...b, attachedBlossoms: [...b.attachedBlossoms, newBlossom.id] } : b
      );

      onSigilCreated?.(newBlossom);
      return newBlossom;
    },
    [sigilBlossoms.length, maxBlossoms, breathTreeBranches, onSigilCreated]
  );

  // Activate sigil through breath work
  const activateSigil = useCallback(
    (sigilId: string) => {
      setSigilBlossoms(prev =>
        prev.map(blossom =>
          blossom.id === sigilId ? { ...blossom, activated: true, breathEnergy: 1.0 } : blossom
        )
      );

      onSigilActivated?.(sigilId);

      // Check if workshop is completed
      const activatedCount = sigilBlossoms.filter(b => b.activated).length + 1;
      if (activatedCount >= sigilBlossoms.length && sigilBlossoms.length > 0) {
        setWorkshopMode('completed');
        onWorkshopCompleted?.(sigilBlossoms);
      }
    },
    [sigilBlossoms, onSigilActivated, onWorkshopCompleted]
  );

  // Create tree branch geometry
  const createBranchGeometry = (branch: BreathTreeBranch) => {
    const direction = new Vector3().subVectors(branch.endPosition, branch.startPosition);
    const length = direction.length();

    // Breath modulation
    const breathModulation =
      breath.phase === 'inhale'
        ? 1 + breath.intensity * branch.breathSensitivity * 0.1
        : breath.phase === 'exhale'
          ? 1 - breath.intensity * branch.breathSensitivity * 0.05
          : 1;

    const geometry = new CylinderGeometry(
      branch.thickness * 0.7 * breathModulation,
      branch.thickness * breathModulation,
      length,
      8
    );

    return geometry;
  };

  // Create sigil blossom geometry
  const createBlossomGeometry = (blossom: SigilBlossom) => {
    const lodLevel = performanceOptimizer.getLODLevel(
      { position: blossom.position } as any,
      { position: new Vector3(0, 0, 0) } as any
    );

    // Breath-enhanced scale
    const breathScale = breath.phase === 'inhale' ? 1 + breath.intensity * 0.2 : 1;

    const baseGeometry = createFractalOctahedron(
      blossom.scale * breathScale,
      consciousness,
      Math.max(1, lodLevel.fractalDepth),
      'julia'
    );

    return baseGeometry;
  };

  // Animate tree and blossoms
  useFrame((state, delta) => {
    if (!groupRef.current || !isActive) return;

    const time = state.clock.elapsedTime;

    // Accumulate breath energy
    if (breath.phase === 'inhale' && breath.intensity > 0.5) {
      setBreathAccumulation(prev => Math.min(1.0, prev + delta * 0.1));
    }

    // Animate tree branches
    groupRef.current.children.forEach((child, index) => {
      if (child.userData.type === 'branch') {
        const branch = breathTreeBranches[index];
        if (branch) {
          // Gentle swaying based on breath
          child.rotation.z = Math.sin(time * 0.5 + index) * 0.02 * branch.breathSensitivity;

          // Breath synchronization
          const breathScale = breath.phase === 'inhale' ? 1 + breath.intensity * 0.03 : 1;
          child.scale.setScalar(breathScale);
        }
      }

      if (child.userData.type === 'blossom') {
        const blossomId = child.userData.blossomId;
        const blossom = sigilBlossoms.find(b => b.id === blossomId);

        if (blossom) {
          // Floating animation
          child.position.y += Math.sin(time * 3 + index) * 0.005;

          // Rotation based on activation state
          child.rotation.y += delta * (blossom.activated ? 0.5 : 0.1);

          // Pulsing based on breath energy
          const pulseScale = 1 + Math.sin(time * 4) * 0.1 * blossom.breathEnergy;
          child.scale.setScalar(pulseScale);

          // Update breath energy for selected blossom
          if (selectedBlossom === blossomId && breath.coherence > 0.7) {
            setSigilBlossoms(prev =>
              prev.map(b =>
                b.id === blossomId
                  ? { ...b, breathEnergy: Math.min(1.0, b.breathEnergy + delta * 0.2) }
                  : b
              )
            );

            // Auto-activate when fully charged
            if (blossom.breathEnergy >= 1.0 && !blossom.activated) {
              activateSigil(blossomId);
            }
          }
        }
      }
    });

    // Tree root breathing effect
    groupRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.01);
  });

  if (!isActive) return null;

  return (
    <group ref={groupRef} position={position}>
      {/* Tree Branches */}
      {breathTreeBranches.map((branch, index) => {
        const geometry = createBranchGeometry(branch);
        const midPoint = new Vector3().lerpVectors(branch.startPosition, branch.endPosition, 0.5);
        const direction = new Vector3().subVectors(branch.endPosition, branch.startPosition);

        return (
          <mesh
            key={branch.id}
            position={midPoint.toArray()}
            lookAt={branch.endPosition}
            geometry={geometry}
            userData={{ type: 'branch', branchId: branch.id }}
            onClick={() => {
              // Create new sigil on branch click
              if (workshopMode === 'creating') {
                const intention = `Intention ${sigilBlossoms.length + 1}`;
                createSigilBlossom(intention, branch.id);
              }
            }}
          >
            <meshStandardMaterial color='#4a3728' roughness={0.8} metalness={0.1} />
          </mesh>
        );
      })}

      {/* Sigil Blossoms */}
      {sigilBlossoms.map((blossom, index) => {
        const blossomGeometry = createBlossomGeometry(blossom);

        return (
          <mesh
            key={blossom.id}
            position={blossom.position.toArray()}
            scale={blossom.scale}
            userData={{ type: 'blossom', blossomId: blossom.id }}
            onClick={() => setSelectedBlossom(blossom.id)}
            onPointerEnter={() => setSelectedBlossom(blossom.id)}
          >
            <bufferGeometry>
              <bufferAttribute
                attach='attributes-position'
                count={blossomGeometry.vertices.length}
                array={new Float32Array(blossomGeometry.vertices.flatMap(v => [v.x, v.y, v.z]))}
                itemSize={3}
              />
            </bufferGeometry>
            <meshStandardMaterial
              color={blossom.color}
              emissive={blossom.color}
              emissiveIntensity={blossom.activated ? 0.4 : 0.1}
              transparent
              opacity={0.8 + blossom.breathEnergy * 0.2}
              roughness={0.2}
              metalness={0.6}
            />
          </mesh>
        );
      })}

      {/* Tree Root System */}
      <mesh position={[0, -0.5, 0]}>
        <TorusGeometry args={[size * 0.8, 0.2, 8, 16]} />
        <meshStandardMaterial color='#2d1810' transparent opacity={0.6} roughness={0.9} />
      </mesh>

      {/* Breath Energy Visualization */}
      {breathAccumulation > 0 && (
        <mesh position={[0, size * 0.8, 0]}>
          <SphereGeometry args={[breathAccumulation * 2, 16, 16]} />
          <meshBasicMaterial
            color='#87ceeb'
            transparent
            opacity={0.3 * breathAccumulation}
            wireframe
          />
        </mesh>
      )}

      {/* Phase 5.4 Panel 8 Enhancements */}

      {/* Emotional Nuance Glyphs */}
      {emotionalNuanceEnabled &&
        sigilBlossoms.map(
          blossom =>
            blossom.emotionalNuance && (
              <group
                key={`glyph-${blossom.id}`}
                position={[blossom.position.x, blossom.position.y + 0.5, blossom.position.z]}
              >
                {/* Glyph symbol visualization */}
                <mesh>
                  <planeGeometry args={[0.2, 0.2]} />
                  <meshBasicMaterial
                    color={blossom.emotionalNuance.nuanceColor}
                    transparent
                    opacity={0.8 + blossom.emotionalNuance.intensity * 0.2}
                  />
                </mesh>

                {/* Emotional resonance field */}
                <mesh>
                  <sphereGeometry args={[blossom.emotionalNuance.emotionalResonance * 0.5, 8, 8]} />
                  <meshBasicMaterial
                    color={blossom.emotionalNuance.nuanceColor}
                    transparent
                    opacity={0.1}
                    wireframe
                  />
                </mesh>
              </group>
            )
        )}

      {/* Breath Rhythm Synchronization Visualization */}
      {breathRhythmSyncEnabled && breathRhythmPattern.length > 0 && (
        <group>
          {/* Rhythm pattern visualization */}
          {breathRhythmPattern.map((interval, index) => {
            const angle = (index * Math.PI * 2) / breathRhythmPattern.length;
            const radius = size * 0.6;

            return (
              <mesh
                key={`rhythm-${index}`}
                position={[Math.cos(angle) * radius, interval * 2, Math.sin(angle) * radius]}
              >
                <sphereGeometry args={[0.05, 6, 6]} />
                <meshBasicMaterial
                  color='#00FFFF'
                  transparent
                  opacity={0.7 + Math.sin(Date.now() * 0.001 * interval) * 0.3}
                />
              </mesh>
            );
          })}

          {/* Tree-of-breath rhythm synchronization */}
          <mesh position={[0, size * 0.5, 0]}>
            <torusGeometry args={[size * 0.4, 0.05, 8, 16]} />
            <meshBasicMaterial color='#87CEEB' transparent opacity={0.5 + breath.coherence * 0.5} />
          </mesh>
        </group>
      )}

      {/* Symbolic Revelation Feedback Loop */}
      {symbolicRevelationEnabled && revelationFeedback.length > 0 && (
        <group>
          {revelationFeedback.map((feedback, index) => (
            <group
              key={`feedback-${index}`}
              position={[
                Math.sin(index) * size * 0.3,
                size * 0.8 + index * 0.2,
                Math.cos(index) * size * 0.3,
              ]}
            >
              {/* Feedback visualization */}
              <mesh>
                <octahedronGeometry args={[0.1 + feedback.intensity * 0.1, 0]} />
                <meshBasicMaterial
                  color={
                    feedback.feedbackType === 'visual'
                      ? '#FFD700'
                      : feedback.feedbackType === 'energetic'
                        ? '#FF69B4'
                        : feedback.feedbackType === 'symbolic'
                          ? '#9370DB'
                          : '#87CEEB'
                  }
                  transparent
                  opacity={feedback.intensity}
                />
              </mesh>

              {/* Feedback pulse */}
              <mesh>
                <sphereGeometry args={[0.3 + feedback.intensity * 0.2, 8, 8]} />
                <meshBasicMaterial
                  color='#FFFFFF'
                  transparent
                  opacity={0.1 + Math.sin(Date.now() * 0.002) * 0.1}
                  wireframe
                />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* Emotion Mapping with Botanical Metaphors */}
      {emotionMappingEnabled && emotionParticles.length > 0 && (
        <group>
          {emotionParticles.map(particle => (
            <mesh key={particle.id} position={particle.position.toArray()}>
              <sphereGeometry args={[0.02 + particle.intensity * 0.03, 4, 4]} />
              <meshBasicMaterial
                color={
                  particle.emotion === 'joy'
                    ? '#FFD700'
                    : particle.emotion === 'love'
                      ? '#FF69B4'
                      : particle.emotion === 'peace'
                        ? '#87CEEB'
                        : particle.emotion === 'power'
                          ? '#FF4500'
                          : particle.emotion === 'wisdom'
                            ? '#9370DB'
                            : '#32CD32'
                }
                transparent
                opacity={particle.intensity * (particle.lifespan / 1000)}
              />
            </mesh>
          ))}

          {/* Botanical metaphor visualization */}
          {sigilBlossoms.map(
            blossom =>
              blossom.emotionMapping && (
                <group key={`botanical-${blossom.id}`} position={blossom.position.toArray()}>
                  {/* Resonance field */}
                  <mesh>
                    <sphereGeometry
                      args={[blossom.emotionMapping.resonanceField.fieldRadius, 16, 16]}
                    />
                    <meshBasicMaterial
                      color={blossom.emotionMapping.resonanceField.fieldColor}
                      transparent
                      opacity={blossom.emotionMapping.resonanceField.fieldStrength * 0.1}
                      wireframe
                    />
                  </mesh>

                  {/* Botanical form indicator */}
                  <mesh position={[0, 0.3, 0]}>
                    <torusGeometry args={[0.2, 0.05, 6, 12]} />
                    <meshBasicMaterial
                      color={
                        blossom.emotionMapping.emotionalSpectrum.harmony > 0.5
                          ? '#32CD32'
                          : '#FF6B6B'
                      }
                      transparent
                      opacity={blossom.emotionMapping.emotionalSpectrum.intensity}
                    />
                  </mesh>
                </group>
              )
          )}
        </group>
      )}

      {/* Gesture Creation Visualization */}
      {gestureCreationEnabled && gestureBuffer.length > 0 && (
        <group>
          {gestureBuffer.map((point, index) => (
            <mesh key={`gesture-${index}`} position={point.toArray()}>
              <sphereGeometry args={[0.03, 6, 6]} />
              <meshBasicMaterial
                color='#FFFFFF'
                transparent
                opacity={0.8 - (index / gestureBuffer.length) * 0.6}
              />
            </mesh>
          ))}

          {/* Gesture trail */}
          {gestureBuffer.length > 1 &&
            gestureBuffer.map((point, index) => {
              if (index === 0) return null;
              const prevPoint = gestureBuffer[index - 1];
              const midpoint = point.clone().add(prevPoint).multiplyScalar(0.5);
              const distance = point.distanceTo(prevPoint);

              return (
                <mesh key={`trail-${index}`} position={midpoint.toArray()}>
                  <cylinderGeometry args={[0.005, 0.005, distance, 4]} />
                  <meshBasicMaterial color='#FFFFFF' transparent opacity={0.5} />
                </mesh>
              );
            })}
        </group>
      )}

      {/* Workshop completion effect */}
      {workshopMode === 'completed' && (
        <mesh>
          <SphereGeometry args={[size * 1.5, 32, 32]} />
          <meshBasicMaterial color='#ffd700' transparent opacity={0.1} wireframe />
        </mesh>
      )}
    </group>
  );
};

export default SigilBlossomBreathTree;

/**
 * Sigil Workshop Scene Component
 * Complete scene wrapper for the Sigil Blossom Breath Tree workshop
 */
export const SigilWorkshopScene: React.FC<{
  consciousness: ConsciousnessState;
  breath: BreathState;
  onWorkshopCompleted?: (sigils: SigilBlossom[]) => void;
}> = ({ consciousness, breath, onWorkshopCompleted }) => {
  const [completedSigils, setCompletedSigils] = useState<SigilBlossom[]>([]);
  const [workshopProgress, setWorkshopProgress] = useState(0);

  const handleSigilCreated = useCallback((sigil: SigilBlossom) => {
    console.log('Sigil created:', sigil.intention);
    setWorkshopProgress(prev => prev + 0.2);
  }, []);

  const handleSigilActivated = useCallback((sigilId: string) => {
    console.log('Sigil activated:', sigilId);
    setWorkshopProgress(prev => prev + 0.3);
  }, []);

  const handleWorkshopCompleted = useCallback(
    (sigils: SigilBlossom[]) => {
      setCompletedSigils(sigils);
      setWorkshopProgress(1.0);
      onWorkshopCompleted?.(sigils);
    },
    [onWorkshopCompleted]
  );

  return (
    <group>
      <SigilBlossomBreathTree
        consciousness={consciousness}
        breath={breath}
        position={[0, 0, 0]}
        size={10}
        maxBlossoms={8}
        onSigilCreated={handleSigilCreated}
        onSigilActivated={handleSigilActivated}
        onWorkshopCompleted={handleWorkshopCompleted}
        isActive={true}
        // Phase 5.4 Panel 8 enhancements
        gestureCreationEnabled={true}
        emotionalNuanceEnabled={true}
        breathRhythmSyncEnabled={true}
        symbolicRevelationEnabled={true}
        emotionMappingEnabled={true}
      />

      {/* Workshop progress indicator */}
      <mesh position={[0, 12, 0]}>
        <ringGeometry args={[2, 2.2, 32]} />
        <meshBasicMaterial color='#ffd700' transparent opacity={workshopProgress} />
      </mesh>
    </group>
  );
};

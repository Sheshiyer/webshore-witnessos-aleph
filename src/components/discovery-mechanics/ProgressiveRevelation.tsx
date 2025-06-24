/**
 * Progressive Revelation System for WitnessOS Webshore
 *
 * Discovery triggers based on user interaction and consciousness level
 * Easter egg placement algorithms and achievement tracking
 */

'use client';

import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Group, Vector3 } from 'three';
import type { DiscoveryLayer, DiscoveryProgress } from '../discovery-layers/DiscoveryLayerSystem';

const { DISCOVERY_LAYERS, SACRED_MATHEMATICS } = CONSCIOUSNESS_CONSTANTS;

interface ProgressiveRevelationProps {
  consciousness: ConsciousnessState;
  breath: BreathState;
  progress: DiscoveryProgress;
  currentLayer: DiscoveryLayer;
  onEasterEggDiscovered?: (easterEgg: EasterEgg) => void;
  onAchievementUnlocked?: (achievement: Achievement) => void;
  onDocumentationRevealed?: (documentation: DocumentationArtifact) => void;
  enabled?: boolean;
}

interface EasterEgg {
  id: string;
  name: string;
  type:
    | 'hidden-symbol'
    | 'secret-sequence'
    | 'consciousness-threshold'
    | 'time-based'
    | 'interaction-combo';
  layer: DiscoveryLayer;
  position: Vector3;
  discoveryCondition: {
    consciousnessLevel?: number;
    breathCoherence?: number;
    timeSpent?: number;
    interactionSequence?: string[];
    hiddenSymbol?: string;
  };
  discovered: boolean;
  reward: {
    consciousnessBoost: number;
    documentationUnlock?: string;
    specialEffect?: string;
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'discovery' | 'mastery' | 'exploration' | 'consciousness' | 'breath' | 'interaction';
  unlockCondition: {
    artifactsDiscovered?: number;
    layersCompleted?: number;
    consciousnessLevel?: number;
    breathMastery?: number;
    timeSpent?: number;
    easterEggsFound?: number;
  };
  unlocked: boolean;
  reward: {
    title: string;
    consciousnessBoost: number;
    specialAbility?: string;
  };
}

interface DocumentationArtifact {
  id: string;
  title: string;
  content: string;
  category: 'system-guide' | 'consciousness-theory' | 'fractal-mathematics' | 'archetypal-wisdom';
  unlockCondition: {
    layer: DiscoveryLayer;
    consciousnessLevel: number;
    specificTrigger?: string;
  };
  revealed: boolean;
}

/**
 * Progressive Revelation System Component
 */
export const ProgressiveRevelation: React.FC<ProgressiveRevelationProps> = ({
  consciousness,
  breath,
  progress,
  currentLayer,
  onEasterEggDiscovered,
  onAchievementUnlocked,
  onDocumentationRevealed,
  enabled = true,
}) => {
  const groupRef = useRef<Group>(null);

  // Easter eggs state
  const [easterEggs, setEasterEggs] = useState<EasterEgg[]>([
    {
      id: 'hidden-infinity',
      name: 'Hidden Infinity Symbol',
      type: 'hidden-symbol',
      layer: 1,
      position: new Vector3(5, 0, 5),
      discoveryCondition: {
        consciousnessLevel: 0.4,
        hiddenSymbol: 'infinity',
      },
      discovered: false,
      reward: {
        consciousnessBoost: 0.05,
        documentationUnlock: 'infinity-mathematics',
        specialEffect: 'infinity-portal',
      },
    },
    {
      id: 'breath-master',
      name: 'Breath Master Sequence',
      type: 'consciousness-threshold',
      layer: 0,
      position: new Vector3(0, 0, 0),
      discoveryCondition: {
        breathCoherence: 0.9,
        timeSpent: 300, // 5 minutes
      },
      discovered: false,
      reward: {
        consciousnessBoost: 0.1,
        documentationUnlock: 'advanced-breathing',
        specialEffect: 'breath-aura',
      },
    },
    {
      id: 'fractal-zoom-secret',
      name: 'Fractal Zoom Secret',
      type: 'interaction-combo',
      layer: 2,
      position: new Vector3(0, 0, 15),
      discoveryCondition: {
        consciousnessLevel: 0.7,
        interactionSequence: ['zoom-in', 'spiral-gesture', 'zoom-out'],
      },
      discovered: false,
      reward: {
        consciousnessBoost: 0.08,
        documentationUnlock: 'fractal-infinity',
        specialEffect: 'fractal-cascade',
      },
    },
    {
      id: 'archetype-synthesis',
      name: 'Archetype Synthesis',
      type: 'consciousness-threshold',
      layer: 3,
      position: new Vector3(0, 0, 0),
      discoveryCondition: {
        consciousnessLevel: 0.95,
      },
      discovered: false,
      reward: {
        consciousnessBoost: 0.05,
        documentationUnlock: 'consciousness-mastery',
        specialEffect: 'unity-field',
      },
    },
  ]);

  // Achievements state
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first-discovery',
      name: 'First Discovery',
      description: 'Discover your first artifact',
      category: 'discovery',
      unlockCondition: { artifactsDiscovered: 1 },
      unlocked: false,
      reward: {
        title: 'Explorer',
        consciousnessBoost: 0.02,
      },
    },
    {
      id: 'breath-initiate',
      name: 'Breath Initiate',
      description: 'Achieve 70% breath coherence',
      category: 'breath',
      unlockCondition: { breathMastery: 0.7 },
      unlocked: false,
      reward: {
        title: 'Breath Walker',
        consciousnessBoost: 0.03,
        specialAbility: 'enhanced-breath-detection',
      },
    },
    {
      id: 'layer-master',
      name: 'Layer Master',
      description: 'Complete all 4 discovery layers',
      category: 'mastery',
      unlockCondition: { layersCompleted: 4 },
      unlocked: false,
      reward: {
        title: 'Consciousness Navigator',
        consciousnessBoost: 0.1,
        specialAbility: 'layer-teleportation',
      },
    },
    {
      id: 'consciousness-awakening',
      name: 'Consciousness Awakening',
      description: 'Reach 80% consciousness level',
      category: 'consciousness',
      unlockCondition: { consciousnessLevel: 0.8 },
      unlocked: false,
      reward: {
        title: 'Awakened One',
        consciousnessBoost: 0.05,
        specialAbility: 'reality-perception',
      },
    },
    {
      id: 'easter-egg-hunter',
      name: 'Easter Egg Hunter',
      description: 'Discover 3 easter eggs',
      category: 'exploration',
      unlockCondition: { easterEggsFound: 3 },
      unlocked: false,
      reward: {
        title: 'Secret Keeper',
        consciousnessBoost: 0.07,
        specialAbility: 'hidden-sight',
      },
    },
  ]);

  // Documentation artifacts state
  const [documentationArtifacts, setDocumentationArtifacts] = useState<DocumentationArtifact[]>([
    {
      id: 'basic-navigation',
      title: 'Basic Navigation Guide',
      content: 'Learn to navigate the consciousness layers using breath and intention...',
      category: 'system-guide',
      unlockCondition: { layer: 0, consciousnessLevel: 0.1 },
      revealed: false,
    },
    {
      id: 'sacred-geometry-intro',
      title: 'Sacred Geometry Introduction',
      content: 'Understanding the mathematical foundations of consciousness visualization...',
      category: 'fractal-mathematics',
      unlockCondition: { layer: 1, consciousnessLevel: 0.3 },
      revealed: false,
    },
    {
      id: 'archetypal-wisdom',
      title: 'Archetypal Wisdom Compendium',
      content: 'Deep insights into Human Design and Enneagram integration...',
      category: 'archetypal-wisdom',
      unlockCondition: { layer: 2, consciousnessLevel: 0.6 },
      revealed: false,
    },
    {
      id: 'consciousness-theory',
      title: 'Advanced Consciousness Theory',
      content: 'The science and mysticism of consciousness exploration...',
      category: 'consciousness-theory',
      unlockCondition: { layer: 3, consciousnessLevel: 0.8 },
      revealed: false,
    },
  ]);

  // Interaction tracking
  const [interactionHistory, setInteractionHistory] = useState<string[]>([]);
  const [timeSpentInLayer, setTimeSpentInLayer] = useState<Record<DiscoveryLayer, number>>({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  });

  /**
   * Easter egg placement algorithm
   */
  const generateEasterEggPositions = useMemo(() => {
    const positions: Vector3[] = [];

    // Golden ratio spiral placement
    for (let i = 0; i < easterEggs.length; i++) {
      const angle = i * SACRED_MATHEMATICS.PHI * SACRED_MATHEMATICS.TAU;
      const radius = Math.sqrt(i + 1) * 3;
      const height = Math.sin(i * SACRED_MATHEMATICS.PHI) * 2;

      positions.push(new Vector3(Math.cos(angle) * radius, height, Math.sin(angle) * radius));
    }

    return positions;
  }, [easterEggs.length]);

  /**
   * Check easter egg discovery conditions
   */
  const checkEasterEggDiscovery = useCallback(
    (eggId: string, userPosition?: Vector3) => {
      const eggIndex = easterEggs.findIndex(egg => egg.id === eggId);
      if (eggIndex === -1) return;

      const egg = easterEggs[eggIndex];
      if (!egg || egg.discovered || egg.layer !== currentLayer) return;

      const condition = egg.discoveryCondition;
      let conditionMet = true;

      // Check consciousness level
      if (
        condition.consciousnessLevel &&
        consciousness.awarenessLevel < condition.consciousnessLevel
      ) {
        conditionMet = false;
      }

      // Check breath coherence
      if (condition.breathCoherence && breath.coherence < condition.breathCoherence) {
        conditionMet = false;
      }

      // Check time spent
      if (condition.timeSpent && timeSpentInLayer[currentLayer] < condition.timeSpent) {
        conditionMet = false;
      }

      // Check interaction sequence
      if (condition.interactionSequence) {
        const recentInteractions = interactionHistory.slice(-condition.interactionSequence.length);
        if (!arraysEqual(recentInteractions, condition.interactionSequence)) {
          conditionMet = false;
        }
      }

      // Check proximity for hidden symbols
      if (condition.hiddenSymbol && userPosition) {
        const distance = userPosition.distanceTo(egg.position);
        if (distance > 2) {
          conditionMet = false;
        }
      }

      if (conditionMet) {
        // Discover easter egg
        setEasterEggs(prev =>
          prev.map((e, i) => (i === eggIndex ? { ...e, discovered: true } : e))
        );

        onEasterEggDiscovered?.(egg);

        // Unlock documentation if specified
        if (egg.reward.documentationUnlock) {
          revealDocumentation(egg.reward.documentationUnlock);
        }
      }
    },
    [
      easterEggs,
      currentLayer,
      consciousness.awarenessLevel,
      breath.coherence,
      timeSpentInLayer,
      interactionHistory,
      onEasterEggDiscovered,
    ]
  );

  /**
   * Check achievement unlock conditions
   */
  const checkAchievementUnlock = useCallback(
    (achievementId: string) => {
      const achievementIndex = achievements.findIndex(ach => ach.id === achievementId);
      if (achievementIndex === -1) return;

      const achievement = achievements[achievementIndex];
      if (!achievement || achievement.unlocked) return;

      const condition = achievement.unlockCondition;
      let conditionMet = true;

      // Check various conditions
      if (
        condition.artifactsDiscovered &&
        progress.totalArtifacts < condition.artifactsDiscovered
      ) {
        conditionMet = false;
      }

      if (
        condition.consciousnessLevel &&
        consciousness.awarenessLevel < condition.consciousnessLevel
      ) {
        conditionMet = false;
      }

      if (condition.breathMastery && breath.coherence < condition.breathMastery) {
        conditionMet = false;
      }

      if (condition.easterEggsFound) {
        const discoveredEggs = easterEggs.filter(egg => egg.discovered).length;
        if (discoveredEggs < condition.easterEggsFound) {
          conditionMet = false;
        }
      }

      if (conditionMet) {
        setAchievements(prev =>
          prev.map((a, i) => (i === achievementIndex ? { ...a, unlocked: true } : a))
        );

        onAchievementUnlocked?.(achievement);
      }
    },
    [
      achievements,
      progress.totalArtifacts,
      consciousness.awarenessLevel,
      breath.coherence,
      easterEggs,
      onAchievementUnlocked,
    ]
  );

  /**
   * Reveal documentation artifact
   */
  const revealDocumentation = useCallback(
    (documentationId: string) => {
      const docIndex = documentationArtifacts.findIndex(doc => doc.id === documentationId);
      if (docIndex === -1) return;

      const doc = documentationArtifacts[docIndex];
      if (!doc || doc.revealed) return;

      setDocumentationArtifacts(prev =>
        prev.map((d, i) => (i === docIndex ? { ...d, revealed: true } : d))
      );

      onDocumentationRevealed?.(doc);
    },
    [documentationArtifacts, onDocumentationRevealed]
  );

  /**
   * Add interaction to history
   */
  const addInteraction = useCallback((interaction: string) => {
    setInteractionHistory(prev => [...prev.slice(-10), interaction]); // Keep last 10 interactions
  }, []);

  /**
   * Array equality check
   */
  const arraysEqual = (a: any[], b: any[]): boolean => {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  };

  // Update time spent in current layer
  useFrame((state, delta) => {
    if (!enabled) return;

    setTimeSpentInLayer(prev => ({
      ...prev,
      [currentLayer]: prev[currentLayer] + delta,
    }));

    // Periodically check for discoveries
    if (Math.random() < 0.01) {
      // 1% chance per frame
      // Check all easter eggs
      easterEggs.forEach(egg => {
        if (!egg.discovered) {
          checkEasterEggDiscovery(egg.id);
        }
      });

      // Check all achievements
      achievements.forEach(achievement => {
        if (!achievement.unlocked) {
          checkAchievementUnlock(achievement.id);
        }
      });

      // Check documentation reveals
      documentationArtifacts.forEach(doc => {
        if (
          !doc.revealed &&
          doc.unlockCondition.layer <= currentLayer &&
          consciousness.awarenessLevel >= doc.unlockCondition.consciousnessLevel
        ) {
          revealDocumentation(doc.id);
        }
      });
    }
  });

  if (!enabled) return null;

  return (
    <group ref={groupRef}>
      {/* Easter Egg Indicators (only visible when close to discovery) */}
      {easterEggs.map(
        (egg, index) =>
          !egg.discovered &&
          egg.layer === currentLayer && (
            <group
              key={egg.id}
              position={generateEasterEggPositions[index]?.toArray() || [0, 0, 0]}
            >
              {/* Subtle hint indicator */}
              {consciousness.awarenessLevel >
                (egg.discoveryCondition.consciousnessLevel || 0) - 0.1 && (
                <mesh>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshBasicMaterial
                    color={0xffaa00}
                    transparent
                    opacity={0.3 + Math.sin(Date.now() * 0.005) * 0.2}
                  />
                </mesh>
              )}
            </group>
          )
      )}

      {/* Achievement Progress Indicators */}
      {achievements.map(
        (achievement, index) =>
          !achievement.unlocked && (
            <mesh
              key={achievement.id}
              position={[
                Math.cos((index * SACRED_MATHEMATICS.TAU) / achievements.length) * 50,
                10,
                Math.sin((index * SACRED_MATHEMATICS.TAU) / achievements.length) * 50,
              ]}
              visible={consciousness.awarenessLevel > 0.5}
            >
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshBasicMaterial color={0x00aaff} transparent opacity={0.4} />
            </mesh>
          )
      )}
    </group>
  );
};

export default ProgressiveRevelation;

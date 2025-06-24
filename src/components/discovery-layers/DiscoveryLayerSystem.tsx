/**
 * Discovery Layer System for WitnessOS Webshore
 *
 * 4-layer discovery architecture with progressive revelation mechanics
 * Layer 0: Portal (Breathing chamber) - Entry point
 * Layer 1: Awakening (Symbol garden and compass plaza) - Initial exploration
 * Layer 2: Recognition (System understanding spaces) - Deep learning
 * Layer 3: Integration (Archetype temples and mastery areas) - Mastery
 */

'use client';

import type { BreathState, ConsciousnessState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { useFrame } from '@react-three/fiber';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Group, Vector3 } from 'three';

const { DISCOVERY_LAYERS, SACRED_MATHEMATICS } = CONSCIOUSNESS_CONSTANTS;

export type DiscoveryLayer = 0 | 1 | 2 | 3;

export interface LayerConfiguration {
  id: DiscoveryLayer;
  name: string;
  description: string;
  unlockRequirement: {
    consciousnessLevel: number;
    breathCoherence: number;
    discoveredArtifacts: number;
    timeSpent: number; // seconds
  };
  spatialSignature: {
    geometry: 'octagonal' | 'circular' | 'spiral' | 'mandala';
    radius: number;
    height: number;
    fractalComplexity: number;
  };
  discoveryMechanics: {
    artifactCount: number;
    easterEggCount: number;
    hiddenSymbols: string[];
    progressionTriggers: string[];
  };
}

export interface DiscoveryProgress {
  currentLayer: DiscoveryLayer;
  layerProgress: Record<
    DiscoveryLayer,
    {
      unlocked: boolean;
      timeSpent: number;
      artifactsDiscovered: number;
      easterEggsFound: number;
      completionPercentage: number;
    }
  >;
  totalArtifacts: number;
  totalEasterEggs: number;
  consciousnessEvolution: number;
}

interface DiscoveryLayerSystemProps {
  consciousness: ConsciousnessState;
  breath: BreathState;
  onLayerTransition?: (fromLayer: DiscoveryLayer, toLayer: DiscoveryLayer) => void;
  onArtifactDiscovered?: (artifact: any, layer: DiscoveryLayer) => void;
  onProgressUpdate?: (progress: DiscoveryProgress) => void;
  enableSpatialMemory?: boolean;
  enableProgressiveRevealation?: boolean;
}

/**
 * Layer Configurations
 */
const LAYER_CONFIGS: Record<DiscoveryLayer, LayerConfiguration> = {
  0: {
    id: 0,
    name: 'Portal',
    description: 'Breathing chamber and consciousness entry',
    unlockRequirement: {
      consciousnessLevel: 0.0,
      breathCoherence: 0.0,
      discoveredArtifacts: 0,
      timeSpent: 0,
    },
    spatialSignature: {
      geometry: 'octagonal',
      radius: 8,
      height: 6,
      fractalComplexity: 2,
    },
    discoveryMechanics: {
      artifactCount: 3,
      easterEggCount: 2,
      hiddenSymbols: ['infinity', 'spiral'],
      progressionTriggers: ['breath-coherence-70', 'portal-activation'],
    },
  },
  1: {
    id: 1,
    name: 'Awakening',
    description: 'Symbol garden and compass plaza',
    unlockRequirement: {
      consciousnessLevel: 0.3,
      breathCoherence: 0.7,
      discoveredArtifacts: 2,
      timeSpent: 60,
    },
    spatialSignature: {
      geometry: 'circular',
      radius: 15,
      height: 8,
      fractalComplexity: 3,
    },
    discoveryMechanics: {
      artifactCount: 7,
      easterEggCount: 5,
      hiddenSymbols: ['pentagram', 'vesica-piscis', 'flower-of-life'],
      progressionTriggers: ['symbol-garden-complete', 'compass-calibrated'],
    },
  },
  2: {
    id: 2,
    name: 'Recognition',
    description: 'System understanding spaces',
    unlockRequirement: {
      consciousnessLevel: 0.6,
      breathCoherence: 0.8,
      discoveredArtifacts: 8,
      timeSpent: 300,
    },
    spatialSignature: {
      geometry: 'spiral',
      radius: 25,
      height: 12,
      fractalComplexity: 5,
    },
    discoveryMechanics: {
      artifactCount: 15,
      easterEggCount: 10,
      hiddenSymbols: ['merkaba', 'sri-yantra', 'tree-of-life', 'enneagram'],
      progressionTriggers: ['system-understanding', 'pattern-recognition'],
    },
  },
  3: {
    id: 3,
    name: 'Integration',
    description: 'Archetype temples and mastery areas',
    unlockRequirement: {
      consciousnessLevel: 0.8,
      breathCoherence: 0.9,
      discoveredArtifacts: 20,
      timeSpent: 600,
    },
    spatialSignature: {
      geometry: 'mandala',
      radius: 40,
      height: 20,
      fractalComplexity: 8,
    },
    discoveryMechanics: {
      artifactCount: 25,
      easterEggCount: 15,
      hiddenSymbols: ['metatron-cube', 'golden-spiral', 'phi-ratio', 'consciousness-field'],
      progressionTriggers: ['archetype-mastery', 'consciousness-integration'],
    },
  },
};

/**
 * Discovery Layer System Hook
 */
export const DiscoveryLayerSystem = ({
  consciousness,
  breath,
  onLayerTransition,
  onArtifactDiscovered,
  onProgressUpdate,
  enableSpatialMemory = true,
  enableProgressiveRevealation = true,
}: DiscoveryLayerSystemProps) => {
  // Discovery state
  const [progress, setProgress] = useState<DiscoveryProgress>({
    currentLayer: 0,
    layerProgress: {
      0: {
        unlocked: true,
        timeSpent: 0,
        artifactsDiscovered: 0,
        easterEggsFound: 0,
        completionPercentage: 0,
      },
      1: {
        unlocked: false,
        timeSpent: 0,
        artifactsDiscovered: 0,
        easterEggsFound: 0,
        completionPercentage: 0,
      },
      2: {
        unlocked: false,
        timeSpent: 0,
        artifactsDiscovered: 0,
        easterEggsFound: 0,
        completionPercentage: 0,
      },
      3: {
        unlocked: false,
        timeSpent: 0,
        artifactsDiscovered: 0,
        easterEggsFound: 0,
        completionPercentage: 0,
      },
    },
    totalArtifacts: 0,
    totalEasterEggs: 0,
    consciousnessEvolution: 0,
  });

  // Spatial memory for navigation
  const [spatialMemory, setSpatialMemory] = useState<
    Record<
      DiscoveryLayer,
      {
        lastPosition: Vector3;
        landmarks: Array<{ position: Vector3; type: string; discovered: boolean }>;
        pathHistory: Vector3[];
      }
    >
  >({
    0: { lastPosition: new Vector3(0, 0, 0), landmarks: [], pathHistory: [] },
    1: { lastPosition: new Vector3(0, 0, 0), landmarks: [], pathHistory: [] },
    2: { lastPosition: new Vector3(0, 0, 0), landmarks: [], pathHistory: [] },
    3: { lastPosition: new Vector3(0, 0, 0), landmarks: [], pathHistory: [] },
  });

  // Layer transition state
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);

  // Refs
  const layerGroupRef = useRef<Group>(null);
  const timeAccumulator = useRef<Record<DiscoveryLayer, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 });

  /**
   * Check if layer can be unlocked
   */
  const canUnlockLayer = useCallback(
    (layer: DiscoveryLayer): boolean => {
      if (layer === 0) return true; // Portal always unlocked

      const config = LAYER_CONFIGS[layer];
      const currentProgress = progress.layerProgress[progress.currentLayer];

      return (
        consciousness.awarenessLevel >= config.unlockRequirement.consciousnessLevel &&
        breath.coherence >= config.unlockRequirement.breathCoherence &&
        progress.totalArtifacts >= config.unlockRequirement.discoveredArtifacts &&
        currentProgress.timeSpent >= config.unlockRequirement.timeSpent
      );
    },
    [consciousness.awarenessLevel, breath.coherence, progress]
  );

  /**
   * Attempt layer transition
   */
  const attemptLayerTransition = useCallback(
    (targetLayer: DiscoveryLayer) => {
      if (isTransitioning || targetLayer === progress.currentLayer) return;

      if (canUnlockLayer(targetLayer)) {
        setIsTransitioning(true);
        setTransitionProgress(0);

        // Update progress
        setProgress(prev => ({
          ...prev,
          layerProgress: {
            ...prev.layerProgress,
            [targetLayer]: { ...prev.layerProgress[targetLayer], unlocked: true },
          },
        }));

        onLayerTransition?.(progress.currentLayer, targetLayer);

        // Animate transition
        const startTime = Date.now();
        const transitionDuration = 2000; // 2 seconds

        const animateTransition = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / transitionDuration, 1);

          setTransitionProgress(progress);

          if (progress < 1) {
            requestAnimationFrame(animateTransition);
          } else {
            setProgress(prev => ({ ...prev, currentLayer: targetLayer }));
            setIsTransitioning(false);
            setTransitionProgress(0);
          }
        };

        animateTransition();
      }
    },
    [isTransitioning, progress.currentLayer, canUnlockLayer, onLayerTransition]
  );

  /**
   * Discover artifact
   */
  const discoverArtifact = useCallback(
    (artifact: any, layer: DiscoveryLayer) => {
      setProgress(prev => {
        const layerProgress = prev.layerProgress[layer];
        const newArtifactsDiscovered = layerProgress.artifactsDiscovered + 1;
        const layerConfig = LAYER_CONFIGS[layer];
        const completionPercentage =
          (newArtifactsDiscovered + layerProgress.easterEggsFound) /
          (layerConfig.discoveryMechanics.artifactCount +
            layerConfig.discoveryMechanics.easterEggCount);

        const newProgress = {
          ...prev,
          layerProgress: {
            ...prev.layerProgress,
            [layer]: {
              ...layerProgress,
              artifactsDiscovered: newArtifactsDiscovered,
              completionPercentage,
            },
          },
          totalArtifacts: prev.totalArtifacts + 1,
        };

        onProgressUpdate?.(newProgress);
        return newProgress;
      });

      onArtifactDiscovered?.(artifact, layer);
    },
    [onArtifactDiscovered, onProgressUpdate]
  );

  /**
   * Update spatial memory
   */
  const updateSpatialMemory = useCallback(
    (layer: DiscoveryLayer, position: Vector3) => {
      if (!enableSpatialMemory) return;

      setSpatialMemory(prev => ({
        ...prev,
        [layer]: {
          ...prev[layer],
          lastPosition: position.clone(),
          pathHistory: [...prev[layer].pathHistory.slice(-50), position.clone()], // Keep last 50 positions
        },
      }));
    },
    [enableSpatialMemory]
  );

  /**
   * Get layer spatial signature
   */
  const getLayerSpatialSignature = useCallback((layer: DiscoveryLayer) => {
    const config = LAYER_CONFIGS[layer];
    const lodLevel = performanceOptimizer.getLODLevel(
      { position: new Vector3() } as any,
      { position: new Vector3(0, 0, 10) } as any
    );

    return {
      ...config.spatialSignature,
      fractalComplexity: Math.max(
        1,
        Math.floor((config.spatialSignature.fractalComplexity * lodLevel.fractalDepth) / 6)
      ),
    };
  }, []);

  /**
   * Calculate consciousness evolution
   */
  const consciousnessEvolution = useMemo(() => {
    const totalPossibleArtifacts = Object.values(LAYER_CONFIGS).reduce(
      (sum, config) =>
        sum + config.discoveryMechanics.artifactCount + config.discoveryMechanics.easterEggCount,
      0
    );

    const discoveredItems = progress.totalArtifacts + progress.totalEasterEggs;
    return discoveredItems / totalPossibleArtifacts;
  }, [progress.totalArtifacts, progress.totalEasterEggs]);

  // Update time spent in current layer
  useFrame((state, delta) => {
    const currentLayer = progress.currentLayer;
    timeAccumulator.current[currentLayer] += delta;

    // Update progress every second
    if (timeAccumulator.current[currentLayer] >= 1.0) {
      const timeToAdd = Math.floor(timeAccumulator.current[currentLayer]);
      timeAccumulator.current[currentLayer] -= timeToAdd;

      setProgress(prev => {
        const newProgress = {
          ...prev,
          layerProgress: {
            ...prev.layerProgress,
            [currentLayer]: {
              ...prev.layerProgress[currentLayer],
              timeSpent: prev.layerProgress[currentLayer].timeSpent + timeToAdd,
            },
          },
          consciousnessEvolution,
        };

        onProgressUpdate?.(newProgress);
        return newProgress;
      });
    }

    // Check for automatic layer transitions
    if (!isTransitioning && enableProgressiveRevealation) {
      const nextLayer = (progress.currentLayer + 1) as DiscoveryLayer;
      if (nextLayer <= 3 && canUnlockLayer(nextLayer)) {
        const currentLayerConfig = LAYER_CONFIGS[progress.currentLayer];
        const currentLayerProgress = progress.layerProgress[progress.currentLayer];

        // Auto-transition if current layer is 80% complete
        if (currentLayerProgress.completionPercentage >= 0.8) {
          attemptLayerTransition(nextLayer);
        }
      }
    }
  });

  return {
    progress,
    spatialMemory,
    isTransitioning,
    transitionProgress,
    currentLayerConfig: LAYER_CONFIGS[progress.currentLayer],
    canUnlockLayer,
    attemptLayerTransition,
    discoverArtifact,
    updateSpatialMemory,
    getLayerSpatialSignature,
    consciousnessEvolution,
  };
};

export default DiscoveryLayerSystem;

/**
 * Consciousness State Management Hook
 *
 * Central state management for consciousness exploration
 * Integrates breath synchronization and archetypal patterns
 */

'use client';

import {
  createBreathWave,
  createConsciousnessField,
} from '@/generators/wave-equations/consciousness-waves';
import type {
  ArchetypalPattern,
  BreathPattern,
  BreathState,
  ConsciousnessState,
  DiscoveryEvent,
  DiscoveryLayer,
} from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const { CONSCIOUSNESS_STATES, BREATH_PATTERNS, DISCOVERY_LAYERS } = CONSCIOUSNESS_CONSTANTS;

interface UseConsciousnessOptions {
  initialBreathPattern?: BreathPattern;
  autoBreathDetection?: boolean;
  consciousnessEvolution?: boolean;
  discoveryTracking?: boolean;
}

interface UseConsciousnessReturn {
  // Core state
  consciousness: ConsciousnessState;
  breathState: BreathState;
  currentLayer: DiscoveryLayer;

  // Backward compatibility properties for engine components
  breathPhase: number; // 0-1 representing phase in breath cycle
  breathPhaseString: 'inhale' | 'hold' | 'exhale' | 'pause'; // string version
  consciousnessLevel: number;

  // Actions
  updateConsciousness: (updates: Partial<ConsciousnessState>) => void;
  setBreathPattern: (pattern: BreathPattern) => void;
  triggerDiscoveryEvent: (event: DiscoveryEvent) => void;
  evolveConsciousness: (delta: number) => void;

  // Computed values
  overallProgress: number;
  archetypalResonance: ArchetypalPattern[];
  fieldSignature: string;

  // Utilities
  isLayerUnlocked: (layerId: number) => boolean;
  getConsciousnessLevel: () =>
    | 'UNCONSCIOUS'
    | 'SUBCONSCIOUS'
    | 'CONSCIOUS'
    | 'SUPERCONSCIOUS'
    | 'COSMIC';
  getCoherenceLevel: () => 'CHAOTIC' | 'SCATTERED' | 'FOCUSED' | 'ALIGNED' | 'UNIFIED';
}

export const useConsciousness = (options: UseConsciousnessOptions = {}): UseConsciousnessReturn => {
  const {
    initialBreathPattern = BREATH_PATTERNS.COHERENT,
    autoBreathDetection = true,
    consciousnessEvolution = true,
    discoveryTracking = true,
  } = options;

  // Core state
  const [consciousness, setConsciousness] = useState<ConsciousnessState>({
    awarenessLevel: CONSCIOUSNESS_STATES.AWARENESS.CONSCIOUS,
    integrationPoints: ['Initial Awakening'],
    expansionVectors: ['Breath Awareness'],
    shadowTerritories: [],
    lightFrequencies: ['SOL'], // 528Hz - Love frequency
  });

  const [breathState, setBreathState] = useState<BreathState>({
    pattern: initialBreathPattern,
    phase: 'pause',
    intensity: 0,
    rhythm: 60 / initialBreathPattern.totalCycle,
    coherence: 0.5,
    synchronization: 0.5,
    timestamp: new Date().toISOString(),
  });

  const [discoveredEvents, setDiscoveredEvents] = useState<DiscoveryEvent[]>([]);
  const [currentLayerId, setCurrentLayerId] = useState(0);

  // Refs for continuous processes
  const breathWaveRef = useRef(createBreathWave(initialBreathPattern));
  const consciousnessFieldRef = useRef(createConsciousnessField());
  const evolutionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update consciousness state
  const updateConsciousness = useCallback((updates: Partial<ConsciousnessState>) => {
    setConsciousness(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Set new breath pattern
  const setBreathPattern = useCallback((pattern: BreathPattern) => {
    breathWaveRef.current.updatePattern(pattern);
    setBreathState(prev => ({
      ...prev,
      pattern,
      rhythm: 60 / pattern.totalCycle,
    }));
  }, []);

  // Trigger discovery event
  const triggerDiscoveryEvent = useCallback(
    (event: DiscoveryEvent) => {
      if (!discoveryTracking) return;

      setDiscoveredEvents(prev => {
        const exists = prev.find(e => e.id === event.id);
        if (exists) return prev;

        const newEvents = [
          ...prev,
          { ...event, unlocked: true, timestamp: new Date().toISOString() },
        ];

        // Check for layer progression
        const layerEvents = newEvents.filter(e => e.layer === event.layer);
        const layerProgress = layerEvents.length / 10; // Assume 10 events per layer

        if (layerProgress >= 0.8 && event.layer === currentLayerId) {
          setCurrentLayerId(prev => Math.min(prev + 1, 3));
        }

        return newEvents;
      });

      // Consciousness evolution from discovery
      if (consciousnessEvolution) {
        evolveConsciousness(0.05);
      }
    },
    [discoveryTracking, consciousnessEvolution, currentLayerId]
  );

  // Evolve consciousness level
  const evolveConsciousness = useCallback((delta: number) => {
    setConsciousness(prev => {
      const newAwarenessLevel = Math.min(prev.awarenessLevel + delta, 1.0);

      // Generate new integration points based on evolution
      const newIntegrationPoints = [...prev.integrationPoints];
      if (newAwarenessLevel > 0.25 && !newIntegrationPoints.includes('Breath Mastery')) {
        newIntegrationPoints.push('Breath Mastery');
      }
      if (newAwarenessLevel > 0.5 && !newIntegrationPoints.includes('Archetypal Recognition')) {
        newIntegrationPoints.push('Archetypal Recognition');
      }
      if (newAwarenessLevel > 0.75 && !newIntegrationPoints.includes('Unity Consciousness')) {
        newIntegrationPoints.push('Unity Consciousness');
      }

      return {
        ...prev,
        awarenessLevel: newAwarenessLevel,
        integrationPoints: newIntegrationPoints,
      };
    });
  }, []);

  // Breath state update loop
  useEffect(() => {
    if (!autoBreathDetection) return;

    const updateBreathState = () => {
      const newBreathState = breathWaveRef.current.getCurrentState();
      setBreathState(newBreathState);

      // Consciousness evolution through breath coherence
      if (consciousnessEvolution && newBreathState.coherence > 0.8) {
        evolveConsciousness(0.001);
      }
    };

    const interval = setInterval(updateBreathState, 100); // 10 FPS
    return () => clearInterval(interval);
  }, [autoBreathDetection, consciousnessEvolution, evolveConsciousness]);

  // Consciousness field evolution
  useEffect(() => {
    if (!consciousnessEvolution) return;

    evolutionTimerRef.current = setInterval(() => {
      const fieldValues = Array.from({ length: 10 }, (_, i) =>
        consciousnessFieldRef.current.fieldValueAt(i, i, i, Date.now() / 1000)
      );

      const newConsciousnessState = consciousnessFieldRef.current.generateConsciousnessState(
        fieldValues,
        breathState.coherence
      );

      // Gradual evolution
      setConsciousness(prev => ({
        awarenessLevel: prev.awarenessLevel * 0.99 + newConsciousnessState.awarenessLevel * 0.01,
        integrationPoints: [
          ...new Set([...prev.integrationPoints, ...newConsciousnessState.integrationPoints]),
        ],
        expansionVectors: [
          ...new Set([...prev.expansionVectors, ...newConsciousnessState.expansionVectors]),
        ],
        shadowTerritories: [
          ...new Set([...prev.shadowTerritories, ...newConsciousnessState.shadowTerritories]),
        ],
        lightFrequencies: [
          ...new Set([...prev.lightFrequencies, ...newConsciousnessState.lightFrequencies]),
        ],
      }));
    }, 5000); // Every 5 seconds

    return () => {
      if (evolutionTimerRef.current) {
        clearInterval(evolutionTimerRef.current);
      }
    };
  }, [consciousnessEvolution, breathState.coherence]);

  // Computed values
  const overallProgress = useMemo(() => {
    const layerProgress = currentLayerId / 3;
    const awarenessProgress = consciousness.awarenessLevel;
    const discoveryProgress = discoveredEvents.length / 40; // Assume 40 total events

    return (layerProgress + awarenessProgress + discoveryProgress) / 3;
  }, [currentLayerId, consciousness.awarenessLevel, discoveredEvents.length]);

  const archetypalResonance = useMemo((): ArchetypalPattern[] => {
    const patterns: ArchetypalPattern[] = [];

    // Generate patterns based on consciousness state
    consciousness.integrationPoints.forEach((point, index) => {
      patterns.push({
        archetype: point,
        strength: consciousness.awarenessLevel * (1 - index * 0.1),
        description: `Resonance with ${point}`,
        guidance: `Continue developing ${point} through practice`,
      });
    });

    return patterns.slice(0, 5); // Top 5 patterns
  }, [consciousness]);

  const fieldSignature = useMemo(() => {
    const signature = [
      consciousness.awarenessLevel.toFixed(3),
      breathState.coherence.toFixed(3),
      currentLayerId.toString(),
      discoveredEvents.length.toString(),
    ].join('-');

    return `WOS-${signature}`;
  }, [
    consciousness.awarenessLevel,
    breathState.coherence,
    currentLayerId,
    discoveredEvents.length,
  ]);

  // Utility functions
  const isLayerUnlocked = useCallback(
    (layerId: number) => {
      const layer = Object.values(DISCOVERY_LAYERS)[layerId];
      return layer ? consciousness.awarenessLevel >= layer.unlockThreshold : false;
    },
    [consciousness.awarenessLevel]
  );

  const getConsciousnessLevel = useCallback(() => {
    const level = consciousness.awarenessLevel;
    if (level >= CONSCIOUSNESS_STATES.AWARENESS.COSMIC) return 'COSMIC';
    if (level >= CONSCIOUSNESS_STATES.AWARENESS.SUPERCONSCIOUS) return 'SUPERCONSCIOUS';
    if (level >= CONSCIOUSNESS_STATES.AWARENESS.CONSCIOUS) return 'CONSCIOUS';
    if (level >= CONSCIOUSNESS_STATES.AWARENESS.SUBCONSCIOUS) return 'SUBCONSCIOUS';
    return 'UNCONSCIOUS';
  }, [consciousness.awarenessLevel]);

  const getCoherenceLevel = useCallback(() => {
    const coherence = breathState.coherence;
    if (coherence >= CONSCIOUSNESS_STATES.COHERENCE.UNIFIED) return 'UNIFIED';
    if (coherence >= CONSCIOUSNESS_STATES.COHERENCE.ALIGNED) return 'ALIGNED';
    if (coherence >= CONSCIOUSNESS_STATES.COHERENCE.FOCUSED) return 'FOCUSED';
    if (coherence >= CONSCIOUSNESS_STATES.COHERENCE.SCATTERED) return 'SCATTERED';
    return 'CHAOTIC';
  }, [breathState.coherence]);

  const currentLayer = useMemo(() => {
    const layerKeys = Object.keys(DISCOVERY_LAYERS) as Array<keyof typeof DISCOVERY_LAYERS>;
    const layerKey = layerKeys[currentLayerId] || 'PORTAL';
    return DISCOVERY_LAYERS[layerKey];
  }, [currentLayerId]);

  // Calculate numeric breath phase (0-1) from string phase
  const breathPhaseNumeric = useMemo(() => {
    const phaseMap = {
      inhale: 0.0,
      hold: 0.25,
      exhale: 0.5,
      pause: 0.75,
    };
    return phaseMap[breathState.phase] || 0.0;
  }, [breathState.phase]);

  return {
    // Core state
    consciousness,
    breathState,
    currentLayer,

    // Backward compatibility properties
    breathPhase: breathPhaseNumeric,
    breathPhaseString: breathState.phase,
    consciousnessLevel: consciousness.awarenessLevel,

    // Actions
    updateConsciousness,
    setBreathPattern,
    triggerDiscoveryEvent,
    evolveConsciousness,

    // Computed values
    overallProgress,
    archetypalResonance,
    fieldSignature,

    // Utilities
    isLayerUnlocked,
    getConsciousnessLevel,
    getCoherenceLevel,
  };
};

export default useConsciousness;

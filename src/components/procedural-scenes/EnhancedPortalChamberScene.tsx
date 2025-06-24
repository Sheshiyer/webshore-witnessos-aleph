/**
 * Enhanced Portal Chamber Scene with Discovery Layer Integration
 *
 * Integrates all consciousness layers with debug navigation support
 * Provides seamless switching between Portal, Awakening, Recognition, and Integration layers
 */

'use client';

import { DiscoveryLayerSystem } from '@/components/discovery-layers/DiscoveryLayerSystem';
import { Layer1Awakening } from '@/components/discovery-layers/Layer1Awakening';
import { Layer2Recognition } from '@/components/discovery-layers/Layer2Recognition';
import { Layer3Integration } from '@/components/discovery-layers/Layer3Integration';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import { FractalType } from '@/shaders/fractals/archetypal-fractals';
import type { BreathState, ConsciousnessState } from '@/types';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useCallback, useEffect, useState } from 'react';
import { BreathDetection } from '../consciousness-engines/BreathDetection';
import { useDebug } from '../debug';
import { PortalChamber } from './PortalChamber';

interface EnhancedPortalChamberSceneProps {
  humanDesignType?: string;
  enneagramType?: number;
  fractalType?: FractalType;
  enableBreathDetection?: boolean;
  enableInfiniteZoom?: boolean;
  enablePerformanceStats?: boolean;
  userData?: {
    birthDate?: Date;
    birthTime?: string;
    name?: string;
  };
  onPortalEnter?: () => void;
  onConsciousnessEvolution?: (consciousness: ConsciousnessState) => void;
  onLayerTransition?: (layer: number) => void;
}

/**
 * Internal Portal Chamber Scene Component (with debug context)
 */
const PortalChamberSceneInternal: React.FC<EnhancedPortalChamberSceneProps> = ({
  humanDesignType = 'generator',
  enneagramType = 9,
  fractalType = FractalType.MANDELBROT,
  enableBreathDetection = true,
  enableInfiniteZoom = true,
  enablePerformanceStats = false,
  userData,
  onPortalEnter,
  onConsciousnessEvolution,
  onLayerTransition,
}) => {
  // Consciousness and breath state
  const { consciousness, updateConsciousness } = useConsciousness();
  const { isConnected } = useWitnessOSAPI();
  const {
    debugState,
    updateConsciousness: updateDebugConsciousness,
    updateBreath,
    updatePerformance,
  } = useDebug();

  // Local state
  const [breathState, setBreathState] = useState<BreathState>({
    pattern: {
      inhaleCount: 4,
      holdCount: 4,
      exhaleCount: 4,
      pauseCount: 4,
      totalCycle: 16,
      rhythm: 15,
      frequency: 0.25,
    },
    phase: 'pause',
    intensity: 0,
    rhythm: 15,
    coherence: 0,
    synchronization: 0,
    timestamp: new Date().toISOString(),
  });

  const [portalActivated, setPortalActivated] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);
  const [discoveryProgress, setDiscoveryProgress] = useState({
    currentLayer: debugState.currentLayer,
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
    overallCompletion: 0,
  });

  // Sync debug layer with discovery progress
  useEffect(() => {
    if (debugState.isEnabled && debugState.overrides.forceLayer !== undefined) {
      setDiscoveryProgress(prev => ({
        ...prev,
        currentLayer: debugState.currentLayer,
        layerProgress: {
          ...prev.layerProgress,
          [debugState.currentLayer]: {
            ...prev.layerProgress[debugState.currentLayer as keyof typeof prev.layerProgress],
            unlocked: true,
          },
        },
      }));
    }
  }, [debugState.currentLayer, debugState.isEnabled, debugState.overrides.forceLayer]);

  /**
   * Handle breath state changes from detection
   */
  const handleBreathStateChange = useCallback(
    (newBreathState: BreathState) => {
      // Apply mock data override if enabled
      const finalBreathState = debugState.overrides.mockBreathData
        ? {
            ...newBreathState,
            coherence: Math.min(1.0, newBreathState.coherence + 0.3),
            intensity: Math.min(1.0, newBreathState.intensity + 0.2),
          }
        : newBreathState;

      setBreathState(finalBreathState);
      updateBreath(finalBreathState);

      // Update consciousness based on breath coherence
      if (finalBreathState.coherence > 0.6) {
        const awarenessIncrease = finalBreathState.coherence * 0.002;
        const newConsciousness = {
          ...consciousness,
          awarenessLevel: Math.min(1.0, consciousness.awarenessLevel + awarenessIncrease),
        };
        updateConsciousness(newConsciousness);
        updateDebugConsciousness(newConsciousness);
      }
    },
    [
      updateConsciousness,
      updateDebugConsciousness,
      updateBreath,
      consciousness,
      debugState.overrides.mockBreathData,
    ]
  );

  /**
   * Handle consciousness updates
   */
  const handleConsciousnessUpdate = useCallback(
    (newConsciousness: ConsciousnessState) => {
      updateConsciousness(newConsciousness);
      updateDebugConsciousness(newConsciousness);
      onConsciousnessEvolution?.(newConsciousness);
    },
    [updateConsciousness, updateDebugConsciousness, onConsciousnessEvolution]
  );

  /**
   * Handle portal activation
   */
  const handlePortalEnter = useCallback(() => {
    setPortalActivated(true);
    onPortalEnter?.();
  }, [onPortalEnter]);

  /**
   * Handle layer transitions
   */
  const handleLayerTransition = useCallback(
    (layer: number) => {
      setDiscoveryProgress(prev => ({
        ...prev,
        currentLayer: layer,
      }));
      onLayerTransition?.(layer);
    },
    [onLayerTransition]
  );

  /**
   * Handle artifact discoveries
   */
  const handleArtifactDiscovered = useCallback((artifact: any) => {
    console.log('Artifact discovered:', artifact);
    setDiscoveryProgress(prev => ({
      ...prev,
      totalArtifacts: prev.totalArtifacts + 1,
      layerProgress: {
        ...prev.layerProgress,
        [artifact.layer]: {
          ...prev.layerProgress[artifact.layer as keyof typeof prev.layerProgress],
          artifactsDiscovered:
            prev.layerProgress[artifact.layer as keyof typeof prev.layerProgress]
              .artifactsDiscovered + 1,
        },
      },
    }));
  }, []);

  /**
   * Get archetypal color based on Human Design type
   */
  const getArchetypalColor = (): [number, number, number] => {
    const typeColors: Record<string, [number, number, number]> = {
      manifestor: [1.0, 0.3, 0.2],
      generator: [0.8, 0.6, 0.2],
      'manifesting-generator': [0.9, 0.4, 0.6],
      projector: [0.4, 0.7, 0.9],
      reflector: [0.6, 0.9, 0.7],
    };

    return (
      typeColors[humanDesignType.toLowerCase() as keyof typeof typeColors] || typeColors.generator
    );
  };

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      const metrics = performanceOptimizer.getMetrics();
      updatePerformance({
        fps: metrics.fps,
        frameTime: metrics.frameTime,
        triangleCount: 0, // Will be updated by individual components
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [updatePerformance]);

  const currentLayer = debugState.isEnabled
    ? debugState.currentLayer
    : discoveryProgress.currentLayer;
  const connectionStatus = isConnected ? 'Connected' : 'Disconnected';

  return (
    <div className='relative w-full h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black overflow-hidden'>
      {/* Main 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{
          antialias: !performanceOptimizer.getCapabilities().isLowEnd,
          alpha: true,
          powerPreference: performanceOptimizer.getCapabilities().isLowEnd
            ? 'low-power'
            : 'high-performance',
        }}
      >
        {/* Camera Controls */}
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={75} />
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxDistance={15}
          minDistance={3}
          maxPolarAngle={Math.PI / 1.8}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Layer 0: Portal Chamber */}
        {currentLayer === 0 && (
          <PortalChamber
            consciousness={consciousness}
            onBreathStateChange={handleBreathStateChange}
            onConsciousnessUpdate={handleConsciousnessUpdate}
            onPortalEnter={handlePortalEnter}
            archetypalColor={getArchetypalColor()}
            size={8}
            humanDesignType={humanDesignType}
            enneagramType={enneagramType}
            enableInfiniteZoom={enableInfiniteZoom}
            enableBreathDetection={enableBreathDetection}
            fractalType={fractalType}
            userData={userData || {}}
          />
        )}

        {/* Layer 1: Awakening */}
        {currentLayer === 1 && (
          <Layer1Awakening
            consciousness={consciousness}
            breath={breathState}
            progress={discoveryProgress}
            onArtifactDiscovered={handleArtifactDiscovered}
            onSymbolActivated={symbol => console.log('Symbol activated:', symbol)}
            isActive={true}
          />
        )}

        {/* Layer 2: Recognition */}
        {currentLayer === 2 && (
          <Layer2Recognition
            consciousness={consciousness}
            breath={breathState}
            progress={discoveryProgress}
            onArtifactDiscovered={handleArtifactDiscovered}
            onPatternRecognized={(pattern, confidence) =>
              console.log('Pattern recognized:', pattern, confidence)
            }
            isActive={true}
          />
        )}

        {/* Layer 3: Integration */}
        {currentLayer === 3 && (
          <Layer3Integration
            consciousness={consciousness}
            breath={breathState}
            progress={discoveryProgress}
            onArtifactDiscovered={handleArtifactDiscovered}
            onArchetypeMastered={archetype => console.log('Archetype mastered:', archetype)}
            isActive={true}
            userArchetypes={{
              humanDesign: humanDesignType,
              enneagram: enneagramType,
            }}
          />
        )}

        {/* Breath Detection Visualization */}
        {enableBreathDetection && (
          <BreathDetection
            onBreathStateChange={handleBreathStateChange}
            enabled={enableBreathDetection}
            sensitivity={0.7}
            calibrationMode={showCalibration}
            visualFeedback={true}
          />
        )}

        {/* Environmental Lighting */}
        <ambientLight intensity={0.2} color={0x4a4a6a} />
        <pointLight
          position={[0, 5, 5]}
          intensity={0.8}
          color={getArchetypalColor()}
          distance={20}
          decay={2}
        />

        {/* Fog for Depth */}
        <fog attach='fog' args={['#1a1a2e', 8, 25]} />

        {/* Performance Stats */}
        {enablePerformanceStats && <Stats />}
      </Canvas>

      {/* Discovery Layer System (for non-debug mode) */}
      {!debugState.isEnabled && (
        <DiscoveryLayerSystem
          consciousness={consciousness}
          breath={breathState}
          onLayerTransition={handleLayerTransition}
          onArtifactDiscovered={handleArtifactDiscovered}
          onProgressUpdate={progress => setDiscoveryProgress(progress)}
          enableSpatialMemory={true}
          enableProgressiveRevealation={true}
        />
      )}

      {/* UI Overlay */}
      <div className='absolute inset-0 pointer-events-none'>
        {/* Top Status Bar */}
        <div className='absolute top-4 left-4 text-white/80 font-mono text-sm space-y-1'>
          <div className='flex items-center space-x-2'>
            <div
              className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
            />
            <span>WitnessOS: {connectionStatus}</span>
          </div>
          <div>Consciousness: {(consciousness.awarenessLevel * 100).toFixed(1)}%</div>
          <div>
            Breath: {breathState.phase} ({(breathState.coherence * 100).toFixed(1)}%)
          </div>
          <div>Current Layer: {currentLayer}</div>
          {debugState.isEnabled && (
            <div className='text-cyan-400 animate-pulse'>Debug Mode Active</div>
          )}
        </div>

        {/* Layer Information */}
        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-white/70 max-w-md'>
          <p className='text-lg mb-2 font-light'>
            Layer {currentLayer}:{' '}
            {currentLayer === 0
              ? 'Portal Chamber'
              : currentLayer === 1
                ? 'Awakening Garden'
                : currentLayer === 2
                  ? 'Recognition Spaces'
                  : 'Integration Temples'}
          </p>
          <p className='text-sm opacity-80'>
            {debugState.isEnabled
              ? 'Use Ctrl+D to toggle debug panel, or click the debug button'
              : 'Your consciousness guides the experience'}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Enhanced Portal Chamber Scene with Debug Provider
 * Wraps the internal component with debug context only when needed
 */
export const EnhancedPortalChamberScene: React.FC<EnhancedPortalChamberSceneProps> = props => {
  // Dynamic import for debug components to avoid SSR issues
  const DebugProvider = require('@/components/debug').DebugProvider;
  const DebugNavigationPanel = require('@/components/debug').DebugNavigationPanel;
  const DebugToggleButton = require('@/components/debug').DebugToggleButton;

  return (
    <DebugProvider>
      <PortalChamberSceneInternal {...props} />
      {/* Debug components only load in portal */}
      <DebugNavigationPanel />
      <DebugToggleButton />
    </DebugProvider>
  );
};

export default EnhancedPortalChamberScene;

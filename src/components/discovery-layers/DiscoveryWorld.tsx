/**
 * Discovery World - Complete 4-Layer Discovery System
 *
 * Integrates all discovery layers with seamless transitions
 * Progressive revelation mechanics and spatial navigation
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { BreathState } from '@/types';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useCallback, useMemo, useState } from 'react';
import { Vector3 } from 'three';
import { PortalChamberScene } from '../procedural-scenes/PortalChamberScene';
import {
  DiscoveryLayerSystem,
  type DiscoveryLayer,
  type DiscoveryProgress,
} from './DiscoveryLayerSystem';
import { Layer1Awakening } from './Layer1Awakening';
import { Layer2Recognition } from './Layer2Recognition';
import { Layer3Integration } from './Layer3Integration';

interface DiscoveryWorldProps {
  humanDesignType?: string;
  enneagramType?: number;
  enableProgressiveRevealation?: boolean;
  enableSpatialMemory?: boolean;
  enablePerformanceStats?: boolean;
  userData?: {
    birthDate?: Date;
    birthTime?: string;
    name?: string;
  };
  onDiscoveryComplete?: (layer: DiscoveryLayer) => void;
  onConsciousnessEvolution?: (evolution: number) => void;
}

/**
 * Discovery World Component
 */
export const DiscoveryWorld: React.FC<DiscoveryWorldProps> = ({
  humanDesignType = 'generator',
  enneagramType = 9,
  enableProgressiveRevealation = true,
  enableSpatialMemory = true,
  enablePerformanceStats = false,
  userData,
  onDiscoveryComplete,
  onConsciousnessEvolution,
}) => {
  // Consciousness and breath state
  const { consciousness, updateConsciousness } = useConsciousness();
  const { isConnected } = useWitnessOSAPI();
  const connectionStatus = isConnected ? 'Connected' : 'Disconnected';

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

  const [discoveryAchievements, setDiscoveryAchievements] = useState<
    Array<{
      id: string;
      type: string;
      layer: DiscoveryLayer;
      timestamp: number;
      data: any;
    }>
  >([]);

  // Initialize discovery layer system
  const discoverySystem = DiscoveryLayerSystem({
    consciousness,
    breath: breathState,
    onLayerTransition: handleLayerTransition,
    onArtifactDiscovered: handleArtifactDiscovered,
    onProgressUpdate: handleProgressUpdate,
    enableSpatialMemory,
    enableProgressiveRevealation,
  });

  /**
   * Handle layer transitions
   */
  function handleLayerTransition(fromLayer: DiscoveryLayer, toLayer: DiscoveryLayer) {
    console.log(`Transitioning from Layer ${fromLayer} to Layer ${toLayer}`);

    // Update camera position for layer transition
    const layerPositions: Record<DiscoveryLayer, Vector3> = {
      0: new Vector3(0, 0, 8), // Portal chamber
      1: new Vector3(0, 5, 15), // Awakening - elevated view
      2: new Vector3(0, 10, 25), // Recognition - higher perspective
      3: new Vector3(0, 15, 40), // Integration - master view
    };

    // Smooth camera transition would be handled by camera controls
    onDiscoveryComplete?.(toLayer);
  }

  /**
   * Handle artifact discoveries
   */
  function handleArtifactDiscovered(artifact: any, layer: DiscoveryLayer) {
    const achievement = {
      id: `${layer}-${artifact.type}-${Date.now()}`,
      type: artifact.type,
      layer,
      timestamp: Date.now(),
      data: artifact,
    };

    setDiscoveryAchievements(prev => [...prev, achievement]);

    // Update consciousness based on discovery
    const consciousnessBoost = 0.01 + layer * 0.005; // Higher layers give more boost
    updateConsciousness({
      awarenessLevel: Math.min(1.0, consciousness.awarenessLevel + consciousnessBoost),
    });
  }

  /**
   * Handle progress updates
   */
  function handleProgressUpdate(progress: DiscoveryProgress) {
    onConsciousnessEvolution?.(progress.consciousnessEvolution);
  }

  /**
   * Handle breath state changes
   */
  const handleBreathStateChange = useCallback(
    (newBreathState: BreathState) => {
      setBreathState(newBreathState);

      // Update consciousness based on breath coherence
      if (newBreathState.coherence > 0.6) {
        const awarenessIncrease = newBreathState.coherence * 0.001;
        updateConsciousness({
          awarenessLevel: Math.min(1.0, consciousness.awarenessLevel + awarenessIncrease),
        });
      }
    },
    [updateConsciousness]
  );

  /**
   * Get camera position based on current layer
   */
  const getCameraPosition = useMemo(() => {
    const layerPositions: Record<DiscoveryLayer, Vector3> = {
      0: new Vector3(0, 2, 8),
      1: new Vector3(0, 8, 20),
      2: new Vector3(0, 15, 35),
      3: new Vector3(0, 25, 50),
    };

    return (
      layerPositions[discoverySystem?.progress.currentLayer as DiscoveryLayer] || layerPositions[0]
    );
  }, [discoverySystem.progress.currentLayer]);

  /**
   * Get performance metrics
   */
  const performanceMetrics = performanceOptimizer.getMetrics();
  const deviceCapabilities = performanceOptimizer.getCapabilities();

  return (
    <div className='relative w-full h-screen bg-gradient-to-b from-black via-indigo-950 to-purple-950 overflow-hidden'>
      {/* Main 3D Discovery World */}
      <Canvas
        camera={{ position: getCameraPosition.toArray(), fov: 75 }}
        gl={{
          antialias: !deviceCapabilities.isLowEnd,
          alpha: true,
          powerPreference: deviceCapabilities.isLowEnd ? 'low-power' : 'high-performance',
        }}
      >
        {/* Camera Controls */}
        <PerspectiveCamera makeDefault position={getCameraPosition.toArray()} fov={75} />
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          maxDistance={100}
          minDistance={5}
          maxPolarAngle={Math.PI / 1.5}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Layer 0: Portal Chamber (Always Active) */}
        <PortalChamberScene
          humanDesignType={humanDesignType}
          enneagramType={enneagramType}
          enableBreathDetection={true}
          enableInfiniteZoom={true}
          userData={userData || {}}
          onPortalEnter={() => discoverySystem.attemptLayerTransition(1)}
          onConsciousnessEvolution={consciousness =>
            onConsciousnessEvolution?.(consciousness.awarenessLevel)
          }
        />

        {/* Layer 1: Awakening */}
        {discoverySystem.progress.layerProgress[1].unlocked && (
          <Layer1Awakening
            consciousness={consciousness}
            breath={breathState}
            progress={discoverySystem.progress}
            onArtifactDiscovered={artifact => handleArtifactDiscovered(artifact, 1)}
            onSymbolActivated={(symbol, position) => {
              handleArtifactDiscovered(
                {
                  type: 'symbol-activation',
                  symbol,
                  position,
                },
                1
              );
            }}
            isActive={discoverySystem.progress.currentLayer >= 1}
          />
        )}

        {/* Layer 2: Recognition */}
        {discoverySystem.progress.layerProgress[2].unlocked && (
          <Layer2Recognition
            consciousness={consciousness}
            breath={breathState}
            progress={discoverySystem.progress}
            onArtifactDiscovered={artifact => handleArtifactDiscovered(artifact, 2)}
            onPatternRecognized={(pattern, confidence) => {
              handleArtifactDiscovered(
                {
                  type: 'pattern-recognition',
                  pattern,
                  confidence,
                },
                2
              );
            }}
            isActive={discoverySystem.progress.currentLayer >= 2}
          />
        )}

        {/* Layer 3: Integration */}
        {discoverySystem.progress.layerProgress[3].unlocked && (
          <Layer3Integration
            consciousness={consciousness}
            breath={breathState}
            progress={discoverySystem.progress}
            onArtifactDiscovered={artifact => handleArtifactDiscovered(artifact, 3)}
            onArchetypeMastered={(archetype, masteryLevel) => {
              handleArtifactDiscovered(
                {
                  type: 'archetype-mastery',
                  archetype,
                  masteryLevel,
                },
                3
              );
            }}
            isActive={discoverySystem.progress.currentLayer >= 3}
            userArchetypes={{ humanDesignType, enneagramType }}
          />
        )}

        {/* Environmental Lighting */}
        <ambientLight intensity={0.3} color={0x4a4a6a} />
        <directionalLight position={[10, 20, 10]} intensity={0.6} color={0xffffff} castShadow />

        {/* Layer-specific lighting */}
        {discoverySystem.progress.currentLayer >= 1 && (
          <pointLight position={[0, 10, 0]} intensity={0.4} color={0x88ff88} distance={30} />
        )}

        {discoverySystem.progress.currentLayer >= 2 && (
          <pointLight position={[0, 15, 0]} intensity={0.5} color={0x9966ff} distance={40} />
        )}

        {discoverySystem.progress.currentLayer >= 3 && (
          <pointLight position={[0, 20, 0]} intensity={0.6} color={0xffd700} distance={60} />
        )}

        {/* Fog for depth */}
        <fog attach='fog' args={['#1a1a2e', 20, 100]} />
      </Canvas>

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
          <div>
            Layer: {discoverySystem.progress.currentLayer} -{' '}
            {discoverySystem.currentLayerConfig.name}
          </div>
          <div>Consciousness: {(consciousness.awarenessLevel * 100).toFixed(1)}%</div>
          <div>Evolution: {(discoverySystem.consciousnessEvolution * 100).toFixed(1)}%</div>
          <div>Artifacts: {discoverySystem.progress.totalArtifacts}</div>
        </div>

        {/* Layer Progress */}
        <div className='absolute top-4 right-4 text-white/70 font-mono text-xs space-y-2'>
          {Object.entries(discoverySystem.progress.layerProgress).map(([layer, progress]) => (
            <div key={layer} className='flex items-center space-x-2'>
              <span className='w-16'>Layer {layer}:</span>
              <div className='w-20 h-2 bg-white/20 rounded'>
                <div
                  className='h-full bg-gradient-to-r from-purple-400 to-gold-400 rounded'
                  style={{ width: `${progress.completionPercentage * 100}%` }}
                />
              </div>
              <span>{(progress.completionPercentage * 100).toFixed(0)}%</span>
              {progress.unlocked && <span className='text-green-400'>✓</span>}
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        {enablePerformanceStats && (
          <div className='absolute bottom-4 right-4 text-white/60 font-mono text-xs space-y-1'>
            <div>FPS: {performanceMetrics.fps.toFixed(1)}</div>
            <div>Quality: {(performanceOptimizer.getAdaptiveQuality() * 100).toFixed(0)}%</div>
            <div>Triangles: {performanceMetrics.triangles}</div>
          </div>
        )}

        {/* Discovery Notifications */}
        <div className='absolute bottom-4 left-4 space-y-2'>
          {discoveryAchievements.slice(-3).map(achievement => (
            <div
              key={achievement.id}
              className='bg-purple-900/80 text-white px-3 py-2 rounded text-sm animate-fade-in'
            >
              <div className='font-semibold'>Discovery!</div>
              <div>
                Layer {achievement.layer}: {achievement.data.name || achievement.type}
              </div>
            </div>
          ))}
        </div>

        {/* Layer Transition Indicator */}
        {discoverySystem.isTransitioning && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/50'>
            <div className='text-white text-center'>
              <div className='text-2xl mb-4'>Transitioning...</div>
              <div className='w-64 h-2 bg-white/20 rounded'>
                <div
                  className='h-full bg-gradient-to-r from-purple-400 to-gold-400 rounded transition-all duration-300'
                  style={{ width: `${discoverySystem.transitionProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryWorld;

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
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Group, Mesh, Color } from 'three';
import { BreathDetection } from '../consciousness-engines/BreathDetection';
import { useDebug } from '../debug';

// Import sophisticated UI components (simplified versions for now)
import { ReadingHistoryDashboard } from '../ui/ReadingHistoryDashboard';
import type { DiscoveryLayer } from '../discovery-layers/DiscoveryLayerSystem';

// Simple Portal Chamber replacement component
const SimplePortalChamber: React.FC<{
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
  userData?: Record<string, any>;
}> = ({
  consciousness,
  archetypalColor = [0.6, 0.3, 0.9],
  size = 8,
}) => {
  const groupRef = useRef<Group>(null);
  const portalRef = useRef<Mesh>(null);
  const outerRingRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    const awarenessLevel = consciousness.awarenessLevel;
    
    // Rotate the portal
    if (portalRef.current) {
      portalRef.current.rotation.z += delta * 0.5;
      portalRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1 * awarenessLevel);
    }
    
    // Rotate outer ring in opposite direction
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= delta * 0.3;
      outerRingRef.current.scale.setScalar(1 + Math.cos(time * 1.5) * 0.05 * awarenessLevel);
    }
    
    // Overall group rotation
    groupRef.current.rotation.y += delta * 0.2;
  });

  const portalColor = new Color(archetypalColor[0], archetypalColor[1], archetypalColor[2]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Outer ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[size * 0.4, size * 0.05, 16, 32]} />
        <meshStandardMaterial 
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Inner portal */}
      <mesh ref={portalRef}>
        <ringGeometry args={[size * 0.1, size * 0.3, 32]} />
        <meshStandardMaterial 
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Central core */}
      <mesh>
        <sphereGeometry args={[size * 0.05, 16, 16]} />
        <meshStandardMaterial 
          color="#FFFFFF"
          emissive="#FFFFFF"
          emissiveIntensity={1.0}
        />
      </mesh>
      
      {/* Consciousness-based particles */}
      {Array.from({ length: Math.floor(consciousness.awarenessLevel * 20) + 5 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = size * 0.2 + Math.sin(i) * size * 0.1;
        return (
          <mesh 
            key={i}
            position={[
              Math.cos(angle) * radius,
              Math.sin(i * 0.5) * size * 0.1,
              Math.sin(angle) * radius
            ]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial 
              color={portalColor}
              emissive={portalColor}
              emissiveIntensity={0.8}
              transparent
              opacity={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
};

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
    currentLayer: 0 as DiscoveryLayer,
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
    consciousnessEvolution: consciousness.awarenessLevel,
  });

  // UI Panel States
  const [showReadingHistory, setShowReadingHistory] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showBotanicalInterface, setShowBotanicalInterface] = useState(false);
  const [showSplitCircleNav, setShowSplitCircleNav] = useState(false);

  // Sync debug layer with discovery progress
  useEffect(() => {
    if (debugState.isEnabled && debugState.overrides.forceLayer !== undefined) {
      setDiscoveryProgress(prev => ({
        ...prev,
        currentLayer: debugState.currentLayer as any,
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
    (newLayer: number) => {
      setDiscoveryProgress(prev => ({
        ...prev,
        currentLayer: newLayer as any,
        layerProgress: {
          ...prev.layerProgress,
          [newLayer]: {
            ...prev.layerProgress[newLayer as keyof typeof prev.layerProgress],
            unlocked: true,
          },
        },
      }));
      onLayerTransition?.(newLayer);
    },
    [onLayerTransition]
  );

  /**
   * Handle artifact discovery
   */
  const handleArtifactDiscovered = useCallback((artifact: any) => {
    console.log('Artifact discovered:', artifact);
    setDiscoveryProgress(prev => ({
      ...prev,
      totalArtifacts: prev.totalArtifacts + 1,
    }));
  }, []);

  /**
   * Get archetypal color based on Human Design type
   */
  const getArchetypalColor = (): [number, number, number] => {
    const typeColors: Record<string, [number, number, number]> = {
      manifestor: [1.0, 0.3, 0.2], // Red-orange
      generator: [0.8, 0.6, 0.2], // Golden
      'manifesting-generator': [0.9, 0.4, 0.6], // Pink-red
      projector: [0.4, 0.7, 0.9], // Blue
      reflector: [0.6, 0.9, 0.7], // Green-blue
    };

    return typeColors[humanDesignType.toLowerCase()] || typeColors.generator as [number, number, number];
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

        {/* Layer 0: Simple Portal Chamber (replaces pink blob) */}
        {currentLayer === 0 && (
          <SimplePortalChamber
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
              humanDesignType: humanDesignType,
              enneagramType: enneagramType,
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
          color={getArchetypalColor() || [0.8, 0.6, 0.2]}
          distance={20}
          decay={2}
        />

        {/* Fog for Depth */}
        <fog attach='fog' args={['#1a1a2e', 8, 25]} />

        {/* Performance Stats */}
        {enablePerformanceStats && <Stats />}
      </Canvas>

      {/* Sophisticated UI Overlay System */}
      <div className='absolute inset-0 pointer-events-none'>
        {/* Floating Action Buttons - Portal Chamber Controls */}
        <div className='absolute top-4 right-4 space-y-3 pointer-events-auto'>
          {/* Reading History */}
          <button
            onClick={() => setShowReadingHistory(!showReadingHistory)}
            className='w-12 h-12 bg-gradient-to-br from-purple-600/90 to-indigo-600/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform backdrop-blur-sm border border-white/20 shadow-lg'
            title='Reading History'
          >
            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </button>
          
          {/* Timeline Visualization */}
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className='w-12 h-12 bg-gradient-to-br from-emerald-600/90 to-teal-600/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform backdrop-blur-sm border border-white/20 shadow-lg'
            title='Consciousness Timeline'
          >
            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' />
            </svg>
          </button>
          
          {/* Botanical Sigil Interface */}
          <button
            onClick={() => setShowBotanicalInterface(!showBotanicalInterface)}
            className='w-12 h-12 bg-gradient-to-br from-rose-600/90 to-pink-600/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform backdrop-blur-sm border border-white/20 shadow-lg'
            title='Sacred Geometry'
          >
            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' />
            </svg>
          </button>
          
          {/* Split Circle Navigation */}
          <button
            onClick={() => setShowSplitCircleNav(!showSplitCircleNav)}
            className='w-12 h-12 bg-gradient-to-br from-amber-600/90 to-orange-600/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform backdrop-blur-sm border border-white/20 shadow-lg'
            title='Advanced Navigation'
          >
            <svg className='w-6 h-6 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7' />
            </svg>
          </button>
        </div>

        {/* Reading History Panel */}
        {showReadingHistory && (
          <div className='absolute top-4 left-4 w-96 h-96 pointer-events-auto'>
            <ReadingHistoryDashboard 
              userId={userData?.name || 'anonymous'}
            />
          </div>
        )}

        {/* Timeline Visualization Panel */}
        {showTimeline && (
          <div className='absolute top-1/2 left-4 transform -translate-y-1/2 w-80 h-80 pointer-events-auto bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 p-4'>
            <div className='text-white'>
              <h3 className='text-lg font-semibold mb-3 text-emerald-400'>Consciousness Timeline</h3>
              <div className='space-y-2'>
                <div className='flex items-center justify-between p-2 bg-emerald-900/30 rounded'>
                  <span className='text-sm'>Reading #1</span>
                  <span className='text-xs text-emerald-300'>2 days ago</span>
                </div>
                <div className='flex items-center justify-between p-2 bg-emerald-900/30 rounded'>
                  <span className='text-sm'>Consciousness Expansion</span>
                  <span className='text-xs text-emerald-300'>1 week ago</span>
                </div>
                <div className='flex items-center justify-between p-2 bg-emerald-900/30 rounded'>
                  <span className='text-sm'>Reading #2</span>
                  <span className='text-xs text-emerald-300'>2 weeks ago</span>
                </div>
              </div>
              <div className='mt-4 text-xs text-gray-400'>
                3D timeline visualization coming soon...
              </div>
            </div>
          </div>
        )}

        {/* Botanical Sigil Interface Panel */}
        {showBotanicalInterface && (
          <div className='absolute bottom-4 left-4 w-96 h-96 pointer-events-auto bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 p-4'>
            <div className='text-white'>
              <h3 className='text-lg font-semibold mb-3 text-rose-400'>Sacred Geometry</h3>
              <div className='grid grid-cols-2 gap-3'>
                <button className='p-3 bg-rose-900/30 rounded hover:bg-rose-900/50 transition-colors'>
                  <div className='text-2xl mb-1'>🌸</div>
                  <div className='text-xs'>Wisdom</div>
                </button>
                <button className='p-3 bg-rose-900/30 rounded hover:bg-rose-900/50 transition-colors'>
                  <div className='text-2xl mb-1'>💜</div>
                  <div className='text-xs'>Love</div>
                </button>
                <button className='p-3 bg-rose-900/30 rounded hover:bg-rose-900/50 transition-colors'>
                  <div className='text-2xl mb-1'>🔮</div>
                  <div className='text-xs'>Transformation</div>
                </button>
                <button className='p-3 bg-rose-900/30 rounded hover:bg-rose-900/50 transition-colors'>
                  <div className='text-2xl mb-1'>🌿</div>
                  <div className='text-xs'>Healing</div>
                </button>
              </div>
              <div className='mt-4 text-xs text-gray-400'>
                Botanical sigil system coming soon...
              </div>
            </div>
          </div>
        )}

        {/* Split Circle Navigation Panel */}
        {showSplitCircleNav && (
          <div className='absolute top-1/2 right-4 transform -translate-y-1/2 w-80 h-80 pointer-events-auto bg-black/80 backdrop-blur-sm rounded-lg border border-white/20 p-4'>
            <div className='text-white'>
              <h3 className='text-lg font-semibold mb-3 text-amber-400'>Advanced Navigation</h3>
              <div className='space-y-3'>
                <button className='w-full p-3 bg-amber-900/30 rounded hover:bg-amber-900/50 transition-colors text-left'>
                  <div className='font-medium'>Portal Chamber</div>
                  <div className='text-xs text-amber-300'>Current Location</div>
                </button>
                <button className='w-full p-3 bg-amber-900/30 rounded hover:bg-amber-900/50 transition-colors text-left'>
                  <div className='font-medium'>Awakening Garden</div>
                  <div className='text-xs text-amber-300'>Layer 1</div>
                </button>
                <button className='w-full p-3 bg-amber-900/30 rounded hover:bg-amber-900/50 transition-colors text-left'>
                  <div className='font-medium'>Recognition Spaces</div>
                  <div className='text-xs text-amber-300'>Layer 2</div>
                </button>
                <button className='w-full p-3 bg-amber-900/30 rounded hover:bg-amber-900/50 transition-colors text-left'>
                  <div className='font-medium'>Integration Temples</div>
                  <div className='text-xs text-amber-300'>Layer 3</div>
                </button>
              </div>
              <div className='mt-4 text-xs text-gray-400'>
                Sacred geometry navigation coming soon...
              </div>
            </div>
          </div>
        )}

        {/* Minimal Layer Information (only for users, not debug) */}
        {!debugState.isEnabled && (
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
            <p className='text-sm opacity-80'>Your consciousness guides the experience</p>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Enhanced Portal Chamber Scene with Unified Debug System
 * Wraps the internal component with debug context and clean unified debug UI
 */
export const EnhancedPortalChamberScene: React.FC<EnhancedPortalChamberSceneProps> = props => {
  // Dynamic import for debug components to avoid SSR issues
  const DebugProvider = require('@/components/debug').DebugProvider;
  const UnifiedDebugSystem = require('@/components/debug').UnifiedDebugSystem;

  return (
    <DebugProvider>
      <PortalChamberSceneInternal {...props} />
      {/* Single unified debug system replaces all scattered debug components */}
      <UnifiedDebugSystem />
    </DebugProvider>
  );
};

export default EnhancedPortalChamberScene;

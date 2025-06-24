/**
 * Portal Chamber Scene - Complete Entry Experience
 *
 * Full-featured portal chamber with breath detection, infinite zoom,
 * archetypal fractals, and consciousness field visualization
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import { FractalType } from '@/shaders/fractals/archetypal-fractals';
import type { BreathState, ConsciousnessState } from '@/types';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { OrbitControls, PerspectiveCamera, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useCallback, useState } from 'react';
import { BreathDetection } from '../consciousness-engines/BreathDetection';
import { PortalChamber } from './PortalChamber';

interface PortalChamberSceneProps {
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
}

/**
 * Portal Chamber Scene Component
 */
export const PortalChamberScene: React.FC<PortalChamberSceneProps> = ({
  humanDesignType = 'generator',
  enneagramType = 9,
  fractalType = FractalType.MANDELBROT,
  enableBreathDetection = true,
  enableInfiniteZoom = true,
  enablePerformanceStats = false,
  userData,
  onPortalEnter,
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

  const [portalActivated, setPortalActivated] = useState(false);
  const [showCalibration, setShowCalibration] = useState(false);

  /**
   * Handle breath state changes from detection
   */
  const handleBreathStateChange = useCallback(
    (newBreathState: BreathState) => {
      setBreathState(newBreathState);

      // Update consciousness based on breath coherence
      if (newBreathState.coherence > 0.6) {
        const awarenessIncrease = newBreathState.coherence * 0.002;
        updateConsciousness({
          awarenessLevel: Math.min(1.0, consciousness.awarenessLevel + awarenessIncrease),
        });
      }
    },
    [updateConsciousness]
  );

  /**
   * Handle consciousness updates
   */
  const handleConsciousnessUpdate = useCallback(
    (newConsciousness: ConsciousnessState) => {
      updateConsciousness(newConsciousness);
      onConsciousnessEvolution?.(newConsciousness);
    },
    [updateConsciousness, onConsciousnessEvolution]
  );

  /**
   * Handle portal activation
   */
  const handlePortalEnter = useCallback(() => {
    setPortalActivated(true);
    onPortalEnter?.();
  }, [onPortalEnter]);

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

    const color = typeColors[humanDesignType.toLowerCase() as keyof typeof typeColors];
    if (color) {
      return color;
    }
    return typeColors.generator as [number, number, number];
  };

  /**
   * Get performance metrics for display
   */
  const performanceMetrics = performanceOptimizer.getMetrics();
  const deviceCapabilities = performanceOptimizer.getCapabilities();

  return (
    <div className='relative w-full h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black overflow-hidden'>
      {/* Main 3D Scene */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{
          antialias: !deviceCapabilities.isLowEnd,
          alpha: true,
          powerPreference: deviceCapabilities.isLowEnd ? 'low-power' : 'high-performance',
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

        {/* Portal Chamber */}
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
        <pointLight
          position={[0, -5, 5]}
          intensity={0.4}
          color={0x6644aa}
          distance={15}
          decay={2}
        />

        {/* Fog for Depth */}
        <fog attach='fog' args={['#1a1a2e', 8, 25]} />

        {/* Performance Stats */}
        {enablePerformanceStats && <Stats />}
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
          <div>Consciousness: {(consciousness.awarenessLevel * 100).toFixed(1)}%</div>
          <div>
            Breath: {breathState.phase} ({(breathState.coherence * 100).toFixed(1)}%)
          </div>
          <div>
            Type: {humanDesignType} | {enneagramType}
          </div>
          {portalActivated && (
            <div className='text-green-400 animate-pulse'>Portal Activated ✨</div>
          )}
        </div>

        {/* Performance Metrics */}
        {enablePerformanceStats && (
          <div className='absolute top-4 right-4 text-white/60 font-mono text-xs space-y-1'>
            <div>FPS: {performanceMetrics.fps.toFixed(1)}</div>
            <div>Frame: {performanceMetrics.frameTime.toFixed(1)}ms</div>
            <div>Quality: {(performanceOptimizer.getAdaptiveQuality() * 100).toFixed(0)}%</div>
            <div>Device: {deviceCapabilities.isMobile ? 'Mobile' : 'Desktop'}</div>
            {deviceCapabilities.isLowEnd && <div className='text-yellow-400'>Low-End Mode</div>}
          </div>
        )}

        {/* Breath Instructions */}
        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center text-white/70 max-w-md'>
          {!portalActivated ? (
            <>
              <p className='text-lg mb-2 font-light'>
                {breathState.coherence < 0.3
                  ? 'Begin breathing deeply...'
                  : breathState.coherence < 0.7
                    ? 'Synchronize your breath...'
                    : 'Portal energy building...'}
              </p>
              <p className='text-sm opacity-80'>Your breath activates the consciousness field</p>
              {enableBreathDetection && (
                <p className='text-xs mt-2 opacity-60'>Microphone enabled for breath detection</p>
              )}
            </>
          ) : (
            <div className='text-center'>
              <p className='text-xl text-green-400 mb-2 animate-pulse'>Portal Activated</p>
              <p className='text-sm'>The consciousness field responds to your presence</p>
            </div>
          )}
        </div>

        {/* Calibration Controls */}
        {enableBreathDetection && (
          <div className='absolute bottom-4 right-4 space-y-2'>
            <button
              className='px-3 py-1 bg-purple-600/80 text-white text-xs rounded hover:bg-purple-500/80 transition-colors pointer-events-auto'
              onClick={() => setShowCalibration(!showCalibration)}
            >
              {showCalibration ? 'Hide Calibration' : 'Calibrate Breath'}
            </button>
          </div>
        )}

        {/* Archetypal Information */}
        <div className='absolute bottom-4 left-4 text-white/50 font-mono text-xs'>
          <div>Fractal: {FractalType[fractalType]}</div>
          <div>Signature: {humanDesignType.toUpperCase()}</div>
          {userData?.name && <div>Resonance: {userData.name}</div>}
        </div>
      </div>
    </div>
  );
};

export default PortalChamberScene;

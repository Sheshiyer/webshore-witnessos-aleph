/**
 * Submerged Forest Scene Component
 *
 * Phase 5 Critical Component: Complete scene wrapper for the Submerged Symbolic Forest
 * Integrates with consciousness engines and discovery layer system
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { BreathState } from '@/types';
import { performanceOptimizer } from '@/utils/performance-optimization';
import { OrbitControls, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useCallback, useEffect, useState } from 'react';
import { Vector3 } from 'three';
import { BreathDetection } from '../consciousness-engines/BreathDetection';
import SubmergedSymbolicForest from './SubmergedSymbolicForest';

interface SubmergedForestSceneProps {
  enableBreathDetection?: boolean;
  enablePerformanceStats?: boolean;
  onSymbolActivated?: (symbolId: string, symbolType: string) => void;
  onPracticeCompleted?: (practiceType: string, duration: number) => void;
  onConsciousnessEvolution?: (newLevel: number) => void;
  userData?: any;
}

interface SymbolInteraction {
  symbolId: string;
  timestamp: number;
  position: Vector3;
  consciousnessLevel: number;
}

interface PracticeSession {
  areaId: string;
  startTime: number;
  duration: number;
  breathCoherence: number;
  consciousnessGrowth: number;
}

export const SubmergedForestScene: React.FC<SubmergedForestSceneProps> = ({
  enableBreathDetection = true,
  enablePerformanceStats = false,
  onSymbolActivated,
  onPracticeCompleted,
  onConsciousnessEvolution,
  userData,
}) => {
  // Consciousness and breath state
  const { consciousness, updateConsciousness } = useConsciousness();
  const { isConnected, calculateSacredGeometry } = useWitnessOSAPI();

  // Scene state
  const [breathState, setBreathState] = useState<BreathState>({
    phase: 'neutral',
    intensity: 0,
    coherence: 0,
    timestamp: Date.now(),
  });

  const [symbolInteractions, setSymbolInteractions] = useState<SymbolInteraction[]>([]);
  const [activePracticeSession, setActivePracticeSession] = useState<PracticeSession | null>(null);
  const [sceneLoaded, setSceneLoaded] = useState(false);

  // Handle breath state changes
  const handleBreathStateChange = useCallback(
    (newBreathState: BreathState) => {
      setBreathState(newBreathState);

      // Update consciousness based on breath coherence
      if (newBreathState.coherence > 0.7) {
        updateConsciousness({
          awarenessLevel: Math.min(1.0, consciousness.awarenessLevel + 0.001),
          coherenceLevel: newBreathState.coherence,
          breathSynchronization: newBreathState.intensity,
        });
      }
    },
    [consciousness.awarenessLevel, updateConsciousness]
  );

  // Handle symbol interactions
  const handleSymbolInteraction = useCallback(
    async (symbolId: string, position: Vector3) => {
      const interaction: SymbolInteraction = {
        symbolId,
        timestamp: Date.now(),
        position,
        consciousnessLevel: consciousness.awarenessLevel,
      };

      setSymbolInteractions(prev => [...prev, interaction]);

      // Calculate sacred geometry for this symbol
      try {
        const result = await calculateSacredGeometry({
          symbolType: symbolId,
          consciousnessLevel: consciousness.awarenessLevel,
          breathCoherence: breathState.coherence,
          position: { x: position.x, y: position.y, z: position.z },
        });

        if (result.success) {
          // Trigger consciousness evolution
          const newLevel = Math.min(1.0, consciousness.awarenessLevel + 0.05);
          updateConsciousness({
            awarenessLevel: newLevel,
            coherenceLevel: consciousness.coherenceLevel + 0.02,
          });

          onSymbolActivated?.(symbolId, result.data?.symbolType || 'unknown');
          onConsciousnessEvolution?.(newLevel);
        }
      } catch (error) {
        console.warn('Symbol interaction calculation failed:', error);
      }
    },
    [
      consciousness,
      breathState.coherence,
      calculateSacredGeometry,
      updateConsciousness,
      onSymbolActivated,
      onConsciousnessEvolution,
    ]
  );

  // Handle practice area entry
  const handlePracticeAreaEntered = useCallback(
    (areaId: string) => {
      if (activePracticeSession?.areaId === areaId) return;

      // End previous session
      if (activePracticeSession) {
        const duration = Date.now() - activePracticeSession.startTime;
        onPracticeCompleted?.(activePracticeSession.areaId, duration);
      }

      // Start new session
      const newSession: PracticeSession = {
        areaId,
        startTime: Date.now(),
        duration: 0,
        breathCoherence: breathState.coherence,
        consciousnessGrowth: 0,
      };

      setActivePracticeSession(newSession);
    },
    [activePracticeSession, breathState.coherence, onPracticeCompleted]
  );

  // Update practice session
  useEffect(() => {
    if (!activePracticeSession) return;

    const interval = setInterval(() => {
      setActivePracticeSession(prev => {
        if (!prev) return null;

        const duration = Date.now() - prev.startTime;
        const consciousnessGrowth = breathState.coherence > 0.6 ? 0.001 : 0;

        // Update consciousness during practice
        if (consciousnessGrowth > 0) {
          updateConsciousness({
            awarenessLevel: Math.min(1.0, consciousness.awarenessLevel + consciousnessGrowth),
            coherenceLevel: Math.min(1.0, consciousness.coherenceLevel + consciousnessGrowth * 0.5),
          });
        }

        return {
          ...prev,
          duration,
          breathCoherence: breathState.coherence,
          consciousnessGrowth: prev.consciousnessGrowth + consciousnessGrowth,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activePracticeSession, breathState.coherence, consciousness, updateConsciousness]);

  // Scene initialization
  useEffect(() => {
    const timer = setTimeout(() => setSceneLoaded(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='w-full h-screen bg-gradient-to-b from-blue-950 via-teal-950 to-green-950'>
      {/* Breath Detection */}
      {enableBreathDetection && (
        <BreathDetection
          onBreathStateChange={handleBreathStateChange}
          consciousness={consciousness}
          isActive={sceneLoaded}
        />
      )}

      {/* Scene Info Overlay */}
      <div className='absolute top-4 left-4 z-10 bg-black/70 p-4 rounded-lg text-white max-w-sm'>
        <h2 className='text-xl font-bold mb-2 text-cyan-300'>Submerged Symbolic Forest</h2>
        <p className='text-sm text-gray-300 mb-3'>
          Practice terrain for consciousness exploration. Interact with sacred symbols and enter
          practice areas.
        </p>

        <div className='space-y-2 text-xs'>
          <div className='flex justify-between'>
            <span>Consciousness:</span>
            <span className='text-cyan-400'>
              {(consciousness.awarenessLevel * 100).toFixed(1)}%
            </span>
          </div>
          <div className='flex justify-between'>
            <span>Breath Coherence:</span>
            <span className='text-green-400'>{(breathState.coherence * 100).toFixed(1)}%</span>
          </div>
          <div className='flex justify-between'>
            <span>Symbols Activated:</span>
            <span className='text-purple-400'>{symbolInteractions.length}</span>
          </div>
          <div className='flex justify-between'>
            <span>API Status:</span>
            <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        {activePracticeSession && (
          <div className='mt-3 p-2 bg-blue-900/50 rounded'>
            <div className='text-sm font-medium text-blue-300'>Active Practice</div>
            <div className='text-xs text-gray-300'>
              {activePracticeSession.areaId} - {Math.floor(activePracticeSession.duration / 1000)}s
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className='absolute bottom-4 right-4 z-10 bg-black/70 p-4 rounded-lg text-white max-w-md'>
        <h3 className='font-bold text-cyan-300 mb-2'>Practice Instructions</h3>
        <ul className='text-sm text-gray-300 space-y-1'>
          <li>• Click sacred symbols to activate them</li>
          <li>• Enter glowing practice areas for meditation</li>
          <li>• Synchronize your breath for deeper experiences</li>
          <li>• Higher consciousness unlocks new areas</li>
        </ul>
      </div>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 8, 12], fov: 75 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0a1a2a');
          performanceOptimizer.optimizeRenderer(gl);
        }}
      >
        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={30}
          minDistance={5}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.3} color='#4a90e2' />
        <directionalLight position={[10, 10, 5]} intensity={0.5} color='#87ceeb' castShadow />
        <pointLight position={[0, 15, 0]} intensity={0.4} color='#20b2aa' distance={40} decay={2} />

        {/* Submerged Symbolic Forest with Phase 5.3 Panel 7 Enhancements */}
        <SubmergedSymbolicForest
          consciousness={consciousness}
          breath={breathState}
          position={[0, 0, 0]}
          size={25}
          treeCount={15}
          symbolCount={10}
          onSymbolInteraction={handleSymbolInteraction}
          onPracticeAreaEntered={handlePracticeAreaEntered}
          isActive={sceneLoaded}
          // Phase 5.3 Panel 7 enhancements
          darknessTheme={consciousness.awarenessLevel > 0.7} // Enable darkness theme for advanced practitioners
          luminousTreesEnabled={true}
          mountainBackdropEnabled={true}
          biorhythmDojoEnabled={true}
          archetypeEvolutionEnabled={true}
          practiceMode={consciousness.awarenessLevel > 0.8 ? 'mastery' : 'meditation'}
        />

        {/* Performance Stats */}
        {enablePerformanceStats && <Stats />}
      </Canvas>

      {/* Loading Overlay */}
      {!sceneLoaded && (
        <div className='absolute inset-0 bg-black/80 flex items-center justify-center z-20'>
          <div className='text-center text-white'>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400 mx-auto mb-4'></div>
            <p className='text-xl'>Generating Submerged Forest...</p>
            <p className='text-sm text-gray-400 mt-2'>Preparing consciousness practice terrain</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmergedForestScene;

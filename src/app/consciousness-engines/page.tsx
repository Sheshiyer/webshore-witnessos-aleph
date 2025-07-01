/**
 * Consciousness Engines Page
 * 
 * Dedicated interface for consciousness-based engine unlocking and interaction
 * Implements "Consciousness as Technology, Breath as Interface" paradigm
 */

'use client';

import { ConsciousnessEnginePortal } from '@/components/consciousness-engines/ConsciousnessEnginePortal';
import { BreathDetection } from '@/components/consciousness-engines/BreathDetection';
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';
import { useConsciousnessEngineIntegration } from '@/hooks/useConsciousnessEngineIntegration';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useState, useCallback, useEffect } from 'react';
import type { BreathState } from '@/types';

function BreathVisualization({ breathState }: { breathState: BreathState }) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <OrbitControls enableZoom={false} enablePan={false} />
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} />
      
      <Suspense fallback={null}>
        <BreathDetection
          onBreathStateChange={() => {}}
          enabled={true}
          visualFeedback={true}
          calibrationMode={true}
        />
      </Suspense>
    </Canvas>
  );
}

export default function ConsciousnessEnginesPage() {
  const { profile } = useConsciousnessProfile();
  const { adminUnlockAll, unlockedEngines, engineUnlockStatus, isAdminMode } = useConsciousnessEngineIntegration();
  
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

  const [showDataIntegrationToast, setShowDataIntegrationToast] = useState(true);

  // Debug logging for admin override
  useEffect(() => {
    console.log('🔍 Consciousness Engines Page Debug:', {
      adminUnlockAll,
      isAdminMode,
      unlockedEnginesCount: unlockedEngines.length,
      engineUnlockStatus: Object.entries(engineUnlockStatus).map(([engine, status]) => ({
        engine,
        isUnlocked: status.isUnlocked,
        progress: status.progressToUnlock,
        condition: status.unlockCondition
      }))
    });
  }, [adminUnlockAll, isAdminMode, unlockedEngines, engineUnlockStatus]);

  const handleBreathStateChange = useCallback((newBreathState: BreathState) => {
    setBreathState(newBreathState);
  }, []);

  const handleEngineSelect = useCallback((engine: string) => {
    console.log('Engine selected for detailed view:', engine);
    // Could navigate to specific engine page or show modal
  }, []);

  const dismissDataIntegrationToast = useCallback(() => {
    setShowDataIntegrationToast(false);
  }, []);

  return (
    <div className="w-full h-screen flex bg-black">
      
      {/* Smart Data Integration Toast - Dismissible */}
      {profile && showDataIntegrationToast && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-900/90 backdrop-blur-sm border border-blue-500/50 rounded-lg p-4 text-white max-w-md">
          <button
            onClick={dismissDataIntegrationToast}
            className="absolute top-2 right-2 text-blue-300 hover:text-white text-lg leading-none"
          >
            ×
          </button>
          <div className="text-blue-300 font-semibold mb-2">🎯 Smart Data Integration</div>
          <div className="text-sm pr-6">
            Your onboarding data is automatically used for engine calculations!<br/>
            <span className="text-blue-400">
              {profile.personalData?.fullName} • {profile.birthData?.birthDate}
            </span>
          </div>
        </div>
      )}

      {/* Left Panel - 3D Breath Visualization */}
      <div className="w-1/3 h-full">
        <div className="w-full h-full bg-gradient-to-b from-indigo-950 to-black">
          <BreathVisualization breathState={breathState} />
        </div>
      </div>

      {/* Right Panel - Consciousness Engine Portal */}
      <div className="flex-1 h-full">
        <ConsciousnessEnginePortal
          enableBreathTrigger={false}
          showUnlockProgress={true}
          onEngineSelect={handleEngineSelect}
        />
      </div>
    </div>
  );
} 
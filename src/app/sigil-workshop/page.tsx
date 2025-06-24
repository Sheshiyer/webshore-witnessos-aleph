/**
 * Sigil Workshop Test Page
 * 
 * Phase 5 Critical Component Testing: Sigil Blossoms Breath-Tree Workshop Interface
 */

'use client';

import { useConsciousness } from '@/hooks/useConsciousness';
import type { BreathState } from '@/types';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useState, useCallback } from 'react';
import { BreathDetection } from '@/components/consciousness-engines/BreathDetection';
import { SigilWorkshopScene } from '@/components/procedural-scenes/SigilBlossomBreathTree';

export default function SigilWorkshopPage() {
  const { consciousness, updateConsciousness } = useConsciousness();
  const [breathState, setBreathState] = useState<BreathState>({
    phase: 'neutral',
    intensity: 0,
    coherence: 0,
    timestamp: Date.now(),
  });
  const [workshopCompleted, setWorkshopCompleted] = useState(false);
  const [completedSigils, setCompletedSigils] = useState<any[]>([]);

  const handleBreathStateChange = useCallback((newBreathState: BreathState) => {
    setBreathState(newBreathState);
    
    // Update consciousness based on breath coherence
    if (newBreathState.coherence > 0.7) {
      updateConsciousness({
        awarenessLevel: Math.min(1.0, consciousness.awarenessLevel + 0.001),
        coherenceLevel: newBreathState.coherence,
        breathSynchronization: newBreathState.intensity,
      });
    }
  }, [consciousness.awarenessLevel, updateConsciousness]);

  const handleWorkshopCompleted = useCallback((sigils: any[]) => {
    setCompletedSigils(sigils);
    setWorkshopCompleted(true);
    console.log('Workshop completed with sigils:', sigils);
  }, []);

  return (
    <div className="w-full h-screen bg-gradient-to-b from-purple-950 via-indigo-950 to-black">
      {/* Breath Detection */}
      <BreathDetection
        onBreathStateChange={handleBreathStateChange}
        consciousness={consciousness}
        isActive={true}
      />

      {/* Workshop Info Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 p-4 rounded-lg text-white max-w-sm">
        <h2 className="text-xl font-bold mb-2 text-purple-300">Sigil Blossom Workshop</h2>
        <p className="text-sm text-gray-300 mb-3">
          Create and activate personal sigils through breath work. Click branches to create sigils, then breathe to activate them.
        </p>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span>Consciousness:</span>
            <span className="text-purple-400">{(consciousness.awarenessLevel * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Breath Coherence:</span>
            <span className="text-green-400">{(breathState.coherence * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span>Breath Phase:</span>
            <span className="text-blue-400">{breathState.phase}</span>
          </div>
          <div className="flex justify-between">
            <span>Sigils Created:</span>
            <span className="text-yellow-400">{completedSigils.length}</span>
          </div>
        </div>
        
        {workshopCompleted && (
          <div className="mt-3 p-2 bg-purple-900/50 rounded">
            <div className="text-sm font-medium text-purple-300">Workshop Complete!</div>
            <div className="text-xs text-gray-300">
              All sigils activated successfully
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 z-10 bg-black/70 p-4 rounded-lg text-white max-w-md">
        <h3 className="font-bold text-purple-300 mb-2">Workshop Instructions</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Click tree branches to create new sigil blossoms</li>
          <li>• Click sigil blossoms to select them</li>
          <li>• Breathe deeply with high coherence to charge sigils</li>
          <li>• Activated sigils glow brighter and spin faster</li>
          <li>• Complete all sigils to finish the workshop</li>
        </ul>
        
        <div className="mt-3 text-xs text-gray-400">
          <p>Tip: Maintain breath coherence above 70% for faster sigil activation</p>
        </div>
      </div>

      {/* 3D Scene */}
      <Canvas
        camera={{ position: [0, 8, 12], fov: 75 }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1a0d2e');
        }}
      >
        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxDistance={25}
          minDistance={5}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 5, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.4} color="#8a2be2" />
        <directionalLight
          position={[10, 15, 5]}
          intensity={0.6}
          color="#dda0dd"
          castShadow
        />
        <pointLight
          position={[0, 20, 0]}
          intensity={0.5}
          color="#9370db"
          distance={30}
          decay={2}
        />

        {/* Sigil Workshop Scene */}
        <SigilWorkshopScene
          consciousness={consciousness}
          breath={breathState}
          onWorkshopCompleted={handleWorkshopCompleted}
        />

        {/* Workshop completion effect */}
        {workshopCompleted && (
          <mesh>
            <sphereGeometry args={[20, 32, 32]} />
            <meshBasicMaterial 
              color="#ffd700"
              transparent
              opacity={0.05}
              wireframe
            />
          </mesh>
        )}
      </Canvas>

      {/* Workshop completion overlay */}
      {workshopCompleted && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-purple-900/90 p-8 rounded-lg text-center text-white max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-yellow-300">Workshop Complete!</h2>
            <p className="text-gray-300 mb-4">
              You have successfully created and activated {completedSigils.length} sigil blossoms through breath work.
            </p>
            <div className="space-y-2 text-sm">
              {completedSigils.map((sigil, index) => (
                <div key={sigil.id} className="flex justify-between">
                  <span>Sigil {index + 1}:</span>
                  <span className="text-yellow-400">{sigil.intention}</span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setWorkshopCompleted(false)}
              className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Submerged Forest Test Page
 * 
 * Phase 5 Critical Component Testing: Submerged Symbolic Forest Practice Terrain
 */

'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import the scene to avoid SSR issues
const SubmergedForestScene = dynamic(
  () => import('@/components/procedural-scenes/SubmergedForestScene'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-screen bg-gradient-to-b from-blue-950 via-teal-950 to-green-950 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading Submerged Forest...</p>
          <p className="text-sm text-gray-400 mt-2">Initializing consciousness practice terrain</p>
        </div>
      </div>
    )
  }
);

export default function SubmergedForestPage() {
  const handleSymbolActivated = (symbolId: string, symbolType: string) => {
    console.log('Symbol activated:', { symbolId, symbolType });
  };

  const handlePracticeCompleted = (practiceType: string, duration: number) => {
    console.log('Practice completed:', { practiceType, duration });
  };

  const handleConsciousnessEvolution = (newLevel: number) => {
    console.log('Consciousness evolved to:', newLevel);
  };

  return (
    <div className="w-full h-screen">
      <SubmergedForestScene 
        enableBreathDetection={true}
        enablePerformanceStats={true}
        onSymbolActivated={handleSymbolActivated}
        onPracticeCompleted={handlePracticeCompleted}
        onConsciousnessEvolution={handleConsciousnessEvolution}
      />
    </div>
  );
}

/**
 * Engines Hub Page
 * 
 * Main landing page for all 13 WitnessOS consciousness engines
 * Provides comprehensive engine selection and navigation
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';
import EngineNavigationHub from '@/components/navigation/EngineNavigationHub';
import type { EngineName } from '@/types/engines';

export default function EnginesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const profileState = useConsciousnessProfile();

  const handleEngineSelect = (engine: EngineName) => {
    console.log('🧠 Navigating to engine:', engine);
    router.push(`/engines/${engine}`);
  };

  // Redirect to home if not authenticated
  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  // Show loading if profile is still loading
  if (profileState.isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🧠</div>
          <div className="text-cyan-300 text-xl font-mono">Loading Consciousness Engines...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Background Shader Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cyan-300 mb-4">
            🧠 WitnessOS Consciousness Engines
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Access all 13 consciousness engines for comprehensive personal optimization. 
            Each engine provides unique insights into different aspects of consciousness and reality.
          </p>
        </div>

        {/* Engine Navigation Hub */}
        <EngineNavigationHub
          userTier={3}
          unlockedEngines={[
            'numerology', 'human_design', 'tarot', 'iching', 'enneagram',
            'sacred_geometry', 'biorhythm', 'vimshottari', 'gene_keys',
            'sigil_forge', 'vedicclock_tcm', 'face_reading', 'biofield'
          ]}
          onEngineSelect={handleEngineSelect}
          showCategories={true}
        />

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gray-600/80 hover:bg-gray-500/80 text-white rounded-lg font-mono text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

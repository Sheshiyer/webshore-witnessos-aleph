/**
 * Dynamic Engine Page
 * 
 * Renders individual consciousness engine interfaces
 * Supports all 13 WitnessOS consciousness engines
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';
import type { EngineName } from '@/types/engines';

// Import all engine components
import NumerologyEngine from '@/components/consciousness-engines/NumerologyEngine';
import HumanDesignEngine from '@/components/consciousness-engines/HumanDesignEngine';
import TarotEngine from '@/components/consciousness-engines/TarotEngine';
import IChingEngine from '@/components/consciousness-engines/IChingEngine';
import EnneagramEngine from '@/components/consciousness-engines/EnneagramEngine';
import SacredGeometryEngine from '@/components/consciousness-engines/SacredGeometryEngine';
import BiorhythmEngine from '@/components/consciousness-engines/BiorhythmEngine';
import VimshottariEngine from '@/components/consciousness-engines/VimshottariEngine';
import GeneKeysEngine from '@/components/consciousness-engines/GeneKeysEngine';
import SigilForgeEngine from '@/components/consciousness-engines/SigilForgeEngine';
import VedicClockTCMEngine from '@/components/consciousness-engines/VedicClockTCMEngine';
import FaceReadingEngine from '@/components/consciousness-engines/FaceReadingEngine';
import BiofieldEngine from '@/components/consciousness-engines/BiofieldEngine';

// Engine component mapping
const ENGINE_COMPONENTS = {
  numerology: NumerologyEngine,
  human_design: HumanDesignEngine,
  tarot: TarotEngine,
  iching: IChingEngine,
  enneagram: EnneagramEngine,
  sacred_geometry: SacredGeometryEngine,
  biorhythm: BiorhythmEngine,
  vimshottari: VimshottariEngine,
  gene_keys: GeneKeysEngine,
  sigil_forge: SigilForgeEngine,
  vedicclock_tcm: VedicClockTCMEngine,
  face_reading: FaceReadingEngine,
  biofield: BiofieldEngine,
} as const;

// Engine metadata
const ENGINE_METADATA = {
  numerology: { name: 'Numerology', icon: '🔢', description: 'Sacred number analysis and life path insights' },
  human_design: { name: 'Human Design', icon: '👤', description: 'Bodygraph analysis and type determination' },
  tarot: { name: 'Tarot', icon: '🃏', description: 'Archetypal card guidance and wisdom' },
  iching: { name: 'I Ching', icon: '☯️', description: 'Ancient Chinese divination and timing' },
  enneagram: { name: 'Enneagram', icon: '🎭', description: 'Personality type system and growth' },
  sacred_geometry: { name: 'Sacred Geometry', icon: '🔺', description: 'Universal pattern analysis' },
  biorhythm: { name: 'Biorhythm', icon: '📊', description: 'Natural cycle tracking and optimization' },
  vimshottari: { name: 'Vimshottari Dasha', icon: '⏰', description: 'Vedic planetary period analysis' },
  gene_keys: { name: 'Gene Keys', icon: '🧬', description: 'Archetypal transformation system' },
  sigil_forge: { name: 'Sigil Forge', icon: '🔮', description: 'Intention manifestation symbols' },
  vedicclock_tcm: { name: 'VedicClock-TCM', icon: '🌅', description: 'Multi-dimensional time optimization' },
  face_reading: { name: 'Face Reading', icon: '🎭', description: 'Constitutional analysis via physiognomy' },
  biofield: { name: 'Biofield Analysis', icon: '⚡', description: 'Advanced PIP energy field assessment' },
} as const;

interface EnginePageProps {
  params: {
    engineName: string;
  };
}

export default function EnginePage({ params }: EnginePageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const profileState = useConsciousnessProfile();
  
  const engineName = params.engineName as EngineName;
  const EngineComponent = ENGINE_COMPONENTS[engineName];
  const engineMetadata = ENGINE_METADATA[engineName];

  // Check if engine exists
  if (!EngineComponent || !engineMetadata) {
    notFound();
  }

  // Redirect to home if not authenticated (temporarily disabled for API testing)
  // if (!isAuthenticated) {
  //   router.push('/');
  //   return null;
  // }

  // Show loading if profile is still loading
  if (profileState.isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">{engineMetadata.icon}</div>
          <div className="text-cyan-300 text-xl font-mono">Loading {engineMetadata.name}...</div>
        </div>
      </div>
    );
  }

  const handleCalculationComplete = (result: any) => {
    console.log(`✅ ${engineMetadata.name} calculation complete:`, result);
    // Could add result storage, notifications, etc.
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Background Shader Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
      
      {/* Navigation Header */}
      <div className="relative z-10 border-b border-cyan-400/30 bg-black/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/engines')}
                className="px-4 py-2 bg-gray-600/80 hover:bg-gray-500/80 text-white rounded-lg font-mono text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              >
                ← Engines
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-600/80 hover:bg-gray-500/80 text-white rounded-lg font-mono text-sm transition-all duration-200 hover:scale-105 active:scale-95"
              >
                🏠 Home
              </button>
            </div>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-cyan-300 flex items-center space-x-2">
                <span>{engineMetadata.icon}</span>
                <span>{engineMetadata.name}</span>
              </h1>
              <p className="text-gray-400 text-sm">{engineMetadata.description}</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400 font-mono">
                User: {profileState.profile?.personalData?.fullName?.split(' ')[0] || 'Witness'}
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Engine Interface */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <EngineComponent
          question={{ question: `Analyze using ${engineMetadata.name} engine` }}
          onCalculationComplete={handleCalculationComplete}
          // Additional props for specific engines (using test data for API testing)
          fullName={profileState.profile?.personalData?.fullName || 'Test User'}
          birthDate={profileState.profile?.birthData?.birthDate || '1991-08-13'}
          intention={{ question: "Manifest consciousness expansion" }}
          birthData={profileState.profile?.birthData || {
            birthDate: '',
            birthTime: '',
            birthLocation: [0, 0],
            timezone: 'UTC',
            date: '',
            time: '',
            location: [0, 0]
          }}
          personalData={profileState.profile?.personalData || {
            fullName: '',
            preferredName: '',
            birthDate: '',
            name: ''
          }}
        />
      </div>
    </div>
  );
}

// Note: generateStaticParams removed for static export compatibility
// All engine routes are handled dynamically on the client side

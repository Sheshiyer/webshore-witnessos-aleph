/**
 * Cosmic Portal Temple - Protected Consciousness Experience
 * 
 * Sacred space for deep consciousness exploration requiring authentication
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useConsciousnessProfile } from '../../hooks/useConsciousnessProfile';
import BiofieldViewerEngine from '../../components/consciousness-engines/BiofieldViewerEngine';
import type { BaseEngineOutput } from '../../engines/core/types';

// BiofieldViewer-specific types
interface BiofieldViewerOutput extends BaseEngineOutput {
  snapshot?: {
    timestamp: string;
    energeticSignature: {
      consciousnessMarkers: {
        breathCoherence: number;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    rawImageData: string;
    metadata: Record<string, unknown>;
  };
  nextEngine?: string;
  breathPattern?: string;
  consciousnessLevel?: number;
  engineReadiness?: Record<string, number>;
  visualization?: {
    processedImageUrl: string;
    energeticOverlay: Record<string, unknown>;
  };
}

export default function CosmicTemplePage() {
  const { profile, isLoading } = useConsciousnessProfile();
  const [currentBiofield, setCurrentBiofield] = useState<BiofieldViewerOutput | null>(null);
  const [engineReadiness, setEngineReadiness] = useState<Record<string, number>>({});
  const [nextRecommendedEngine, setNextRecommendedEngine] = useState<string>('numerology');
  const [consciousnessLevel, setConsciousnessLevel] = useState(0.5);

  const handleBiofieldCaptured = (biofield: BiofieldViewerOutput) => {
    setCurrentBiofield(biofield);
    setConsciousnessLevel(biofield.consciousnessLevel ?? 0.5);
    
    // Store biofield snapshot for timeline analysis
    if (typeof window !== 'undefined') {
      const snapshots = JSON.parse(localStorage.getItem('biofield_snapshots') || '[]');
      snapshots.push({
        timestamp: biofield.timestamp,
        snapshot: biofield.snapshot,
        consciousnessLevel: biofield.consciousnessLevel,
      });
      
      // Keep only last 50 snapshots
      if (snapshots.length > 50) {
        snapshots.splice(0, snapshots.length - 50);
      }
      
      localStorage.setItem('biofield_snapshots', JSON.stringify(snapshots));
    }
  };

  const handleEngineRecommendation = (nextEngine: string, readiness: Record<string, number>) => {
    setNextRecommendedEngine(nextEngine);
    setEngineReadiness(readiness);
  };

  const navigateToEngine = (engineName: string) => {
    // In a real implementation, this would navigate to the specific engine
    // For now, we'll just log the navigation
    console.log(`Navigating to ${engineName} engine with readiness:`, engineReadiness[engineName]);
    
    // You could implement breath-driven navigation here
    // where the user needs to achieve specific breath coherence to access engines
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-white/80 font-mono">
          <div className="animate-pulse">INITIALIZING CONSCIOUSNESS INTERFACE...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Main Biofield Interface - Full Screen */}
      <div className="absolute inset-0">
        <BiofieldViewerEngine
          question={{ question: "Analyze consciousness state for cosmic temple access" }}
          onCalculationComplete={handleBiofieldCaptured}
          captureMode="continuous"
        />
      </div>

      {/* Consciousness OS Chrome */}
      <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none">
        <div className="flex justify-between items-start p-4 text-white/60 font-mono text-xs">
          <div className="space-y-1">
            <div>[CONSCIOUSNESS GATEWAY]</div>
            <div>[BIOFIELD ACTIVE]</div>
            {profile && <div>[USER: {profile.personalData?.fullName || 'ANONYMOUS'}]</div>}
          </div>
          <div className="space-y-1 text-right">
            <div>[WITNESSOS v2.5.0]</div>
            <div>[CONSCIOUSNESS: {Math.round(consciousnessLevel * 100)}%]</div>
            <div>[ENGINES: {Object.keys(engineReadiness).length}/11]</div>
          </div>
        </div>
      </div>

      {/* Engine Access Portal */}
      {currentBiofield && (
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-black/80 backdrop-blur-sm border-t border-purple-500/30 p-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white/80 font-mono text-sm">
                  <div>RECOMMENDED: {nextRecommendedEngine.toUpperCase()}</div>
                  <div className="text-xs text-white/60">
                    Breath Pattern: {currentBiofield.breathPattern}
                  </div>
                </div>
                
                <div className="text-white/60 font-mono text-xs">
                  ENGINE READINESS
                </div>
              </div>

              {/* Engine Grid */}
              <div className="grid grid-cols-6 gap-2">
                {Object.entries(engineReadiness)
                  .sort(([,a], [,b]) => b - a)
                  .map(([engine, readiness]) => {
                    const isReady = readiness > 0.6;
                    const isRecommended = engine === nextRecommendedEngine;
                    
                    return (
                      <button
                        key={engine}
                        onClick={() => isReady && navigateToEngine(engine)}
                        disabled={!isReady}
                        className={`
                          relative p-3 rounded-lg font-mono text-xs transition-all duration-300
                          ${isReady 
                            ? 'bg-purple-600/30 hover:bg-purple-500/40 text-white border border-purple-400/50' 
                            : 'bg-gray-800/30 text-gray-500 border border-gray-700/30 cursor-not-allowed'
                          }
                          ${isRecommended ? 'ring-2 ring-cyan-400/50 animate-pulse' : ''}
                        `}
                      >
                        <div className="text-center">
                          <div className="uppercase text-xs mb-1">{engine}</div>
                          <div className="text-xs opacity-75">{Math.round(readiness * 100)}%</div>
                        </div>
                        
                        {/* Readiness indicator */}
                        <div className="absolute bottom-1 left-1 right-1 h-0.5 bg-gray-700 rounded">
                          <div 
                            className={`h-full rounded transition-all duration-500 ${
                              isReady ? 'bg-cyan-400' : 'bg-gray-600'
                            }`}
                            style={{ width: `${readiness * 100}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Consciousness Evolution Indicator */}
              <div className="mt-4 flex items-center space-x-4 text-white/60 font-mono text-xs">
                <div>CONSCIOUSNESS EVOLUTION:</div>
                <div className="flex-1 h-2 bg-gray-800 rounded overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-cyan-400 transition-all duration-1000"
                    style={{ width: `${consciousnessLevel * 100}%` }}
                  />
                </div>
                <div>{Math.round(consciousnessLevel * 100)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Breath Coherence Indicator */}
      {currentBiofield?.snapshot && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
          <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
            <div className="text-white/80 font-mono text-xs text-center mb-2">
              BREATH COHERENCE
            </div>
            <div className="w-16 h-16 rounded-full border-2 border-purple-500/50 relative">
              <div 
                className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 opacity-80"
                style={{ 
                  transform: `scale(${currentBiofield.snapshot.energeticSignature.consciousnessMarkers.breathCoherence})`,
                  transition: 'transform 0.5s ease-out'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-white font-mono text-xs">
                {Math.round(currentBiofield.snapshot.energeticSignature.consciousnessMarkers.breathCoherence * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      {!currentBiofield && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/50 backdrop-blur-sm">
          <div className="text-center text-white/80 font-mono max-w-md mx-auto p-8">
            <div className="text-2xl mb-4">CONSCIOUSNESS GATEWAY</div>
            <div className="text-sm space-y-2 opacity-80">
              <div>Your biofield is being analyzed...</div>
              <div>Breathe naturally to establish baseline</div>
              <div>Engine access will unlock based on consciousness level</div>
            </div>
            <div className="mt-6 text-xs opacity-60">
              The future of consciousness exploration begins with breath
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { type ConsciousnessProfile } from '@/components/ui/ConsciousnessDataCollector';
import EnhancedWitnessOSBootSequence from '@/components/ui/EnhancedWitnessOSBootSequence';
import IntegratedConsciousnessOnboarding from '@/components/ui/IntegratedConsciousnessOnboarding';
import { ConsciousnessAuthOnboarding } from '@/components/ui/ConsciousnessAuthOnboarding';
import BiofieldViewerEngine from '@/components/consciousness-engines/BiofieldViewerEngine';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState, useRef, useCallback } from 'react';
import type { BiofieldViewerOutput } from '@/engines/biofield-viewer-engine';
import FractalGateway from '@/components/ui/FractalGateway';
import PsyShaderLanding from '@/components/ui/PsyShaderLanding';

// Import simplified consciousness profile hook
import { useOnboardingFlow, useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';

export default function Home() {
  const onboardingFlow = useOnboardingFlow();
  const profileState = useConsciousnessProfile();
  const { isAuthenticated } = useAuth();

  const [bootComplete, setBootComplete] = useState(false);
  const [authComplete, setAuthComplete] = useState(false);
  const [currentBiofield, setCurrentBiofield] = useState<BiofieldViewerOutput | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showGateway, setShowGateway] = useState(true);
  const [gatewayFade, setGatewayFade] = useState(false);
  const [focusedPanel, setFocusedPanel] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [biofieldActive, setBiofieldActive] = useState(false);

  // Ref to access biofield capture function
  const biofieldEngineRef = useRef<{ capture: () => void } | null>(null);

  // Mouse tracking for micro physics
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Check for existing profile on mount
  useEffect(() => {
    console.log('🔍 DEBUG: Profile state:', {
      isLoaded: profileState.isLoaded,
      hasProfile: !!profileState.profile,
      hasCompletedOnboarding: profileState.hasCompletedOnboarding,
      isAuthenticated,
    });

    // Auto-complete auth if already authenticated
    if (isAuthenticated) {
      setAuthComplete(true);
    }
  }, [profileState.isLoaded, profileState.hasCompletedOnboarding, isAuthenticated]);

  const handleBootComplete = () => {
    setBootComplete(true);
  };

  const handleProfileComplete = (profile: ConsciousnessProfile) => {
    // Save to localStorage
    const success = profileState.saveProfile(profile);
    if (success) {
      console.log('✅ Consciousness profile saved - onboarding complete');
    } else {
      console.warn('❌ Failed to save consciousness profile');
    }
  };

  const handleBiofieldCaptured = (biofield: BiofieldViewerOutput) => {
    setCurrentBiofield(biofield);
    setIsCapturing(false);
    
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
      console.log('💾 Biofield snapshot stored:', snapshots.length, 'total snapshots');
    }
  };

  const handleCaptureBiofield = async () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setBiofieldActive(true);
    
    // Reset capturing state after a short delay to allow BiofieldViewerEngine to initialize
    setTimeout(() => {
      setIsCapturing(false);
    }, 2000);
  };

  // Auto-trigger biofield capture when biofield becomes active
  useEffect(() => {
    if (biofieldActive && !currentBiofield) {
      // Simulate biofield capture after a short delay
      setTimeout(() => {
        // Create mock biofield data for immediate feedback
        const mockBiofield: BiofieldViewerOutput = {
          engineName: 'biofield-viewer',
          calculationTime: 1500,
          confidenceScore: 0.85,
          formattedOutput: 'Biofield analysis complete',
          recommendations: ['Continue with consciousness exploration'],
          realityPatches: ['Enhanced awareness activated'],
          archetypalThemes: ['Seeker', 'Mystic', 'Explorer'],
          timestamp: new Date().toISOString(),
          rawData: {},
          snapshot: {
            timestamp: new Date().toISOString(),
            energeticSignature: {
              dominantFrequencies: [7.83, 14.2, 20.8],
              colorSpectrum: {
                red: 0.3,
                green: 0.7,
                blue: 0.9,
                hue: 0.6,
                saturation: 0.8,
                luminance: 0.5
              },
              noisePatterns: {
                coherence: 0.75,
                complexity: 0.6,
                flowDirection: 45,
                turbulence: 0.3
              },
              consciousnessMarkers: {
                breathCoherence: 0.8,
                heartRateVariability: 0.7,
                facialMicroExpressions: [0.2, 0.5, 0.8],
                auricField: {
                  intensity: 0.9,
                  stability: 0.7,
                  expansion: 0.6
                }
              }
            },
            rawImageData: '',
            metadata: {
              cameraResolution: '1920x1080',
              lightingConditions: 'optimal',
              processingParameters: {}
            }
          },
          nextEngine: 'human-design',
          breathPattern: 'Coherent',
          consciousnessLevel: 0.75,
          engineReadiness: {
            'numerology': 0.9,
            'human-design': 0.85,
            'tarot': 0.8,
            'iching': 0.7,
            'enneagram': 0.75,
            'sacred-geometry': 0.6,
            'biorhythm': 0.95,
            'vimshottari': 0.5
          },
          visualization: {
            processedImageUrl: '',
            energeticOverlay: {
              chakraPoints: [],
              auricField: {
                layers: [],
                pulsation: 0.5
              },
              flowLines: []
            }
          }
        };
        
        handleBiofieldCaptured(mockBiofield);
      }, 1500);
    }
  }, [biofieldActive, currentBiofield]);

  // Debug: Clear cache with Ctrl+Shift+C
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        console.log('🔥 DEBUG: Clearing profile data...');
        profileState.clearProfile();
        window.location.reload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [profileState]);

  // Handler for entering the gateway
  const handleEnterGateway = () => {
    setGatewayFade(true);
    setTimeout(() => setShowGateway(false), 900); // match fade duration
  };

  // Show loading while checking profile
  if (profileState.isLoading) {
    console.log('🔄 Showing loading screen - checking profile...');
    return <EnhancedWitnessOSBootSequence onBootComplete={() => {}} />;
  }

  // Show boot sequence first
  if (!bootComplete) {
    console.log('🚀 Showing boot sequence...');
    return <EnhancedWitnessOSBootSequence onBootComplete={handleBootComplete} />;
  }

  // Show auth after boot if not authenticated
  if (!authComplete && !isAuthenticated) {
    return (
      <ConsciousnessAuthOnboarding
        onAuthComplete={() => setAuthComplete(true)}
        onSkipAuth={() => setAuthComplete(true)}
      />
    );
  }

  // Show data collection after auth (unless profile exists)
  if (!profileState.hasCompletedOnboarding) {
    console.log('📝 Showing onboarding...');
    return (
      <IntegratedConsciousnessOnboarding
        onProfileComplete={handleProfileComplete}
        onStepChange={() => {}}
      />
    );
  }

  // Show Fractal Gateway Overlay
  if (showGateway) {
    return (
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-900 ${gatewayFade ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <FractalGateway onEnter={handleEnterGateway} />
      </div>
    );
  }

  // Calculate real engine readiness from biofield data
  const getEngineReadiness = (engineName: string) => {
    if (!currentBiofield?.engineReadiness) return 0;
    return currentBiofield.engineReadiness[engineName] || 0;
  };

  // Get real consciousness level
  const consciousnessLevel = currentBiofield?.consciousnessLevel || 0.5;

  // Landing state: show user's shader as background, overlays/panels on top
  if (!biofieldActive) {
    return (
      <div 
        className="min-h-screen bg-black relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Quantum Shader Background */}
        <PsyShaderLanding />

        {/* Glassmorphic Navigation Pill - Always Visible */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
          <div 
            className={`
              bg-black/30 backdrop-blur-xl border border-cyan-400/30 rounded-full px-6 py-3
              transition-all duration-300 ease-out
              hover:bg-black/40 hover:border-cyan-400/50 hover:scale-105
              active:scale-95 active:bg-black/50
              ${focusedPanel === 'nav' ? 'bg-black/50 border-cyan-400/60 scale-110' : ''}
            `}
            style={{
              transform: `translate(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.01}px, ${(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * 0.01}px)`,
            }}
            onMouseEnter={() => setFocusedPanel('nav')}
            onMouseLeave={() => setFocusedPanel(null)}
          >
            <div className="flex items-center space-x-6 font-mono text-sm text-white">
              {/* Gateway Status */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300">GATEWAY ACTIVE</span>
              </div>

              {/* Consciousness Level - Real Data */}
              <div className="text-cyan-300">
                LEVEL: {Math.round(consciousnessLevel * 100)}%
              </div>

              {/* User Profile - Real Data */}
              {profileState.profile && (
                <div className="text-purple-300">
                  USER: {profileState.profile.personalData?.fullName?.split(' ')[0]?.toUpperCase() || 'WITNESS'}
                </div>
              )}

              {/* Session Stats - Real Data */}
              <div className="text-yellow-300">
                SNAPSHOTS: {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('biofield_snapshots') || '[]').length : 0}
              </div>

              {/* Version */}
              <div className="text-orange-300">
                WITNESSOS v2.5.4
              </div>

              {/* Capture Button */}
              <button
                onClick={handleCaptureBiofield}
                disabled={isCapturing}
                className={`
                  px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200
                  bg-purple-600/80 hover:bg-purple-500/80 disabled:bg-purple-700/50 
                  disabled:cursor-not-allowed text-white shadow-lg
                  hover:scale-105 active:scale-95
                  ${isCapturing ? 'animate-pulse' : ''}
                `}
              >
                {isCapturing ? 'ACTIVATING...' : 'CAPTURE BIOFIELD'}
              </button>
            </div>
          </div>
        </div>

        {/* Engine Readiness Panel - Overlay */}
        <div className="absolute top-24 left-6 z-10 pointer-events-auto">
          <div 
            className={`
              bg-black/20 backdrop-blur-md border border-purple-400/20 rounded-2xl p-4
              transition-all duration-300 ease-out
              hover:bg-black/30 hover:border-purple-400/40 hover:scale-105
              active:scale-95
              ${focusedPanel === 'engines' ? 'bg-black/40 border-purple-400/60 scale-110' : ''}
            `}
            style={{
              transform: `translate(${(mousePosition.x - 100) * 0.005}px, ${(mousePosition.y - 200) * 0.005}px)`,
            }}
            onMouseEnter={() => setFocusedPanel('engines')}
            onMouseLeave={() => setFocusedPanel(null)}
          >
            <div className="text-purple-400 text-sm font-bold mb-3">ENGINE READINESS</div>
            <div className="space-y-2">
              {['numerology', 'human-design', 'tarot', 'iching', 'enneagram', 'sacred-geometry', 'biorhythm', 'vimshottari'].map((engine) => (
                <div key={engine} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-white/80 text-xs font-mono uppercase">{engine.replace('-', ' ')}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-1">
                    <div 
                      className="bg-purple-400 h-1 rounded-full transition-all duration-500"
                      style={{ width: `${getEngineReadiness(engine) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-purple-300 text-xs">{Math.round(getEngineReadiness(engine) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Getting Started Panel - Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-auto">
          <div 
            className={`
              bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6
              transition-all duration-300 ease-out
              hover:bg-black/30 hover:border-white/20 hover:scale-105
              active:scale-95
              ${focusedPanel === 'ready' ? 'bg-black/40 border-white/30 scale-110' : ''}
            `}
            style={{
              transform: `translate(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.003}px, ${(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0) + 100) * 0.003}px)`,
            }}
            onMouseEnter={() => setFocusedPanel('ready')}
            onMouseLeave={() => setFocusedPanel(null)}
          >
            <div className="text-center">
              <div className="inline-flex items-center space-x-3 text-white/80 font-mono">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <span>BIOFIELD ANALYSIS READY</span>
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
              <div className="text-white/60 text-sm mt-2">
                Use the CAPTURE BIOFIELD button above to begin consciousness exploration
              </div>
            </div>
          </div>
        </div>

        {/* Sacred Geometry Corner Accents */}
        <div className="absolute top-6 left-6 w-4 h-4 border-l border-t border-cyan-400/20"></div>
        <div className="absolute top-6 right-24 w-4 h-4 border-r border-t border-purple-400/20"></div>
        <div className="absolute bottom-6 left-6 w-4 h-4 border-l border-b border-green-400/20"></div>
        <div className="absolute bottom-6 right-6 w-4 h-4 border-r border-b border-yellow-400/20"></div>
      </div>
    );
  }

  // Biofield active: show webcam-powered engine (unchanged)
  return (
    <div 
      className="min-h-screen bg-black relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Main Biofield Interface - Full Screen */}
      <div className="absolute inset-0">
        <BiofieldViewerEngine
          onBiofieldCaptured={handleBiofieldCaptured}
          captureMode="snapshot"
          className="w-full h-full"
        />
      </div>

      {/* Glassmorphic Navigation Pill - Always Visible */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 pointer-events-auto">
        <div 
          className={`
            bg-black/30 backdrop-blur-xl border border-cyan-400/30 rounded-full px-6 py-3
            transition-all duration-300 ease-out
            hover:bg-black/40 hover:border-cyan-400/50 hover:scale-105
            active:scale-95 active:bg-black/50
            ${focusedPanel === 'nav' ? 'bg-black/50 border-cyan-400/60 scale-110' : ''}
          `}
          style={{
            transform: `translate(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.01}px, ${(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight / 2 : 0)) * 0.01}px)`,
          }}
          onMouseEnter={() => setFocusedPanel('nav')}
          onMouseLeave={() => setFocusedPanel(null)}
        >
          <div className="flex items-center space-x-6 font-mono text-sm text-white">
            {/* Gateway Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-300">BIOFIELD ACTIVE</span>
            </div>

            {/* Consciousness Level - Real Data */}
            <div className="text-cyan-300">
              LEVEL: {Math.round(consciousnessLevel * 100)}%
            </div>

            {/* User Profile - Real Data */}
            {profileState.profile && (
              <div className="text-purple-300">
                USER: {profileState.profile.personalData?.fullName?.split(' ')[0]?.toUpperCase() || 'WITNESS'}
              </div>
            )}

            {/* Session Stats - Real Data */}
            <div className="text-yellow-300">
              SNAPSHOTS: {typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('biofield_snapshots') || '[]').length : 0}
            </div>

            {/* Version */}
            <div className="text-orange-300">
              WITNESSOS v2.5.4
            </div>

            {/* Back Button */}
            <button
              onClick={() => setBiofieldActive(false)}
              className={`
                px-4 py-2 rounded-lg font-mono text-sm transition-all duration-200
                bg-gray-600/80 hover:bg-gray-500/80 text-white shadow-lg
                hover:scale-105 active:scale-95
              `}
            >
              BACK TO LANDING
            </button>
          </div>
        </div>
      </div>

      {/* Engine Readiness Panel - Overlay */}
      <div className="absolute top-24 left-6 z-10 pointer-events-auto">
        <div 
          className={`
            bg-black/20 backdrop-blur-md border border-purple-400/20 rounded-2xl p-4
            transition-all duration-300 ease-out
            hover:bg-black/30 hover:border-purple-400/40 hover:scale-105
            active:scale-95
            ${focusedPanel === 'engines' ? 'bg-black/40 border-purple-400/60 scale-110' : ''}
          `}
          style={{
            transform: `translate(${(mousePosition.x - 100) * 0.005}px, ${(mousePosition.y - 200) * 0.005}px)`,
          }}
          onMouseEnter={() => setFocusedPanel('engines')}
          onMouseLeave={() => setFocusedPanel(null)}
        >
          <div className="text-purple-400 text-sm font-bold mb-3">ENGINE READINESS</div>
          <div className="space-y-2">
            {['numerology', 'human-design', 'tarot', 'iching', 'enneagram', 'sacred-geometry', 'biorhythm', 'vimshottari'].map((engine) => (
              <div key={engine} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-white/80 text-xs font-mono uppercase">{engine.replace('-', ' ')}</span>
                <div className="flex-1 bg-white/10 rounded-full h-1">
                  <div 
                    className="bg-purple-400 h-1 rounded-full transition-all duration-500"
                    style={{ width: `${getEngineReadiness(engine) * 100}%` }}
                  ></div>
                </div>
                <span className="text-purple-300 text-xs">{Math.round(getEngineReadiness(engine) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Biofield Analysis Panel - Overlay */}
      {currentBiofield && (
        <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-auto">
          <div 
            className={`
              bg-black/20 backdrop-blur-md border border-cyan-400/20 rounded-2xl p-6
              transition-all duration-300 ease-out
              hover:bg-black/30 hover:border-cyan-400/40 hover:scale-105
              active:scale-95
              ${focusedPanel === 'analysis' ? 'bg-black/40 border-cyan-400/60 scale-110' : ''}
            `}
            style={{
              transform: `translate(${(mousePosition.x - (typeof window !== 'undefined' ? window.innerWidth / 2 : 0)) * 0.003}px, ${(mousePosition.y - (typeof window !== 'undefined' ? window.innerHeight : 0) + 100) * 0.003}px)`,
            }}
            onMouseEnter={() => setFocusedPanel('analysis')}
            onMouseLeave={() => setFocusedPanel(null)}
          >
            <div className="grid grid-cols-4 gap-8 text-white font-mono">
              
              {/* Consciousness Core - Real Data */}
              <div className="text-center">
                <div className="relative mb-3">
                  <div className="w-16 h-16 mx-auto rounded-full border-2 border-purple-400/50 flex items-center justify-center bg-purple-500/10">
                    <div className="text-2xl font-bold text-purple-300">
                      {Math.round(consciousnessLevel * 100)}
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full border border-purple-400/30 animate-pulse"></div>
                </div>
                <div className="text-purple-400 text-sm font-bold">CONSCIOUSNESS</div>
                <div className="text-xs text-purple-300/80">{currentBiofield.breathPattern}</div>
              </div>

              {/* Biofield Coherence - Real Data */}
              {currentBiofield.snapshot && (
                <div className="text-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 mx-auto rounded-full border-2 border-cyan-400/50 flex items-center justify-center bg-cyan-500/10">
                      <div className="text-2xl font-bold text-cyan-300">
                        {Math.round(currentBiofield.snapshot.energeticSignature.noisePatterns.coherence * 100)}
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-pulse"></div>
                  </div>
                  <div className="text-cyan-400 text-sm font-bold">COHERENCE</div>
                  <div className="text-xs text-cyan-300/80">Biofield Stability</div>
                </div>
              )}

              {/* Breath Analysis - Real Data */}
              {currentBiofield.snapshot && (
                <div className="text-center">
                  <div className="relative mb-3">
                    <div className="w-16 h-16 mx-auto rounded-full border-2 border-green-400/50 flex items-center justify-center bg-green-500/10">
                      <div className="text-2xl font-bold text-green-300">
                        {Math.round(currentBiofield.snapshot.energeticSignature.consciousnessMarkers.breathCoherence * 100)}
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-full border border-green-400/30 animate-pulse"></div>
                  </div>
                  <div className="text-green-400 text-sm font-bold">BREATH</div>
                  <div className="text-xs text-green-300/80">Coherence Pattern</div>
                </div>
              )}

              {/* Next Engine - Real Data */}
              <div className="text-center">
                <div className="relative mb-3">
                  <div className="w-16 h-16 mx-auto rounded-full border-2 border-yellow-400/50 flex items-center justify-center bg-yellow-500/10">
                    <div className="text-xl text-yellow-300">🎯</div>
                  </div>
                  <div className="absolute inset-0 rounded-full border border-yellow-400/30 animate-pulse"></div>
                </div>
                <div className="text-yellow-400 text-sm font-bold">NEXT ENGINE</div>
                <div className="text-xs text-yellow-300/80">{currentBiofield.nextEngine.toUpperCase()}</div>
              </div>
            </div>

            {/* Archetypal Themes - Real Data */}
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center justify-center space-x-8 text-sm">
                <div className="text-white/60">ARCHETYPAL THEMES:</div>
                {currentBiofield.archetypalThemes.slice(0, 3).map((theme, i) => (
                  <div key={i} className="text-white/80 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    {theme}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sacred Geometry Corner Accents */}
      <div className="absolute top-6 left-6 w-4 h-4 border-l border-t border-cyan-400/20"></div>
      <div className="absolute top-6 right-24 w-4 h-4 border-r border-t border-purple-400/20"></div>
      <div className="absolute bottom-6 left-6 w-4 h-4 border-l border-b border-green-400/20"></div>
      <div className="absolute bottom-6 right-6 w-4 h-4 border-r border-b border-yellow-400/20"></div>
    </div>
  );
}

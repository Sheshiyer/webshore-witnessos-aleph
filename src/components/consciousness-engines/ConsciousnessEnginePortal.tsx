/**
 * Consciousness Engine Portal Component
 * 
 * Visual interface for consciousness-based engine unlocking
 * Implements "Consciousness as Technology, Breath as Interface" paradigm
 */

'use client';

import { useConsciousnessEngineIntegration } from '@/hooks/useConsciousnessEngineIntegration';
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';
import { BreathDetection } from './BreathDetection';
import React, { useState, useCallback, useEffect } from 'react';

interface ConsciousnessEnginePortalProps {
  onEngineSelect?: (engine: string) => void;
  enableBreathTrigger?: boolean;
  showUnlockProgress?: boolean;
}

interface EngineInputData {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  name?: string;
  question?: string;
}

export const ConsciousnessEnginePortal: React.FC<ConsciousnessEnginePortalProps> = ({
  onEngineSelect,
  enableBreathTrigger = true,
  showUnlockProgress = true,
}) => {
  const {
    consciousness,
    breathState,
    unlockedEngines,
    engineUnlockStatus,
    totalBreathCycles,
    calculateEngine,
    isCalculating,
    lastCalculation,
    progressToNextEngine,
    nextEngineToUnlock,
    currentLayer,
    triggerBreathCalculation,
    isBreathTriggeredMode,
    setBreathTriggeredMode,
    getTotalReadings,
    getConsciousnessGrowthRate,
    adminUnlockAll,
    isAdminMode,
  } = useConsciousnessEngineIntegration();

  const [selectedEngine, setSelectedEngine] = useState<string | null>(null);
  const [engineInputData, setEngineInputData] = useState<EngineInputData>({});
  const [showEngineDetails, setShowEngineDetails] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Get stored profile data
  const { profile } = useConsciousnessProfile();

  // Debug logging for admin override state
  useEffect(() => {
    console.log('🔍 Engine Portal State Debug:', {
      adminUnlockAll,
      isAdminMode,
      unlockedEnginesCount: unlockedEngines.length,
      unlockedEngines,
      engineUnlockStatusSample: Object.entries(engineUnlockStatus).slice(0, 3).map(([engine, status]) => ({
        engine,
        isUnlocked: status.isUnlocked,
        unlockCondition: status.unlockCondition
      }))
    });

    // Force refresh if admin override is active but engines aren't showing as unlocked
    if (adminUnlockAll && unlockedEngines.length < 10) {
      console.log('⚠️ Admin override active but not all engines unlocked, forcing refresh...');
      setTimeout(() => setForceRefresh(prev => prev + 1), 100);
    }
  }, [adminUnlockAll, isAdminMode, unlockedEngines, engineUnlockStatus]);

  // Listen for admin override changes and force refresh
  useEffect(() => {
    const handleAdminOverrideChange = (event: CustomEvent) => {
      console.log('🔄 Engine Portal: Admin override changed', event.detail);
      setForceRefresh(prev => prev + 1);
    };

    const handleForceRefresh = () => {
      console.log('🔄 Engine Portal: Force refresh triggered');
      setForceRefresh(prev => prev + 1);
    };

    window.addEventListener('adminOverrideChanged', handleAdminOverrideChange as EventListener);
    window.addEventListener('forceEngineRefresh', handleForceRefresh);

    return () => {
      window.removeEventListener('adminOverrideChanged', handleAdminOverrideChange as EventListener);
      window.removeEventListener('forceEngineRefresh', handleForceRefresh);
    };
  }, []);

  // Force refresh when adminUnlockAll changes
  useEffect(() => {
    console.log('🔄 Engine Portal: Admin unlock status changed to', adminUnlockAll);
    setForceRefresh(prev => prev + 1);
  }, [adminUnlockAll]);

  // Auto-populate engine inputs from profile data
  useEffect(() => {
    if (profile) {
      setEngineInputData({
        birthDate: profile.birthData?.birthDate || profile.personalData?.birthDate || '',
        birthTime: profile.birthData?.birthTime || '',
        birthPlace: profile.location ? `${profile.location.city}, ${profile.location.country}` : '',
        name: profile.personalData?.fullName || profile.personalData?.name || '',
        question: '', // This will be filled by user for engines that need it
      });
    }
  }, [profile]);

  // Engine metadata for display
  const ENGINE_DISPLAY_INFO = {
    numerology: {
      name: 'Numerology',
      description: 'Sacred number consciousness mapping',
      icon: '🔢',
      color: '#FFD700',
      requiredInputs: ['birthDate', 'name'],
    },
    biorhythm: {
      name: 'Biorhythm',
      description: 'Life cycle wave analysis',
      icon: '🌊',
      color: '#FF6B6B',
      requiredInputs: ['birthDate'],
    },
    tarot: {
      name: 'Tarot',
      description: 'Archetypal consciousness reading',
      icon: '🃏',
      color: '#9370DB',
      requiredInputs: ['question'],
    },
    human_design: {
      name: 'Human Design',
      description: 'Energy type and strategy analysis',
      icon: '⚡',
      color: '#4ECDC4',
      requiredInputs: ['birthDate', 'birthTime', 'birthPlace'],
    },
    iching: {
      name: 'I Ching',
      description: 'Hexagram transformation wisdom',
      icon: '☯️',
      color: '#32CD32',
      requiredInputs: ['question'],
    },
    gene_keys: {
      name: 'Gene Keys',
      description: 'DNA consciousness activation',
      icon: '🧬',
      color: '#FF69B4',
      requiredInputs: ['birthDate', 'birthTime', 'birthPlace'],
    },
    vimshottari: {
      name: 'Vimshottari',
      description: 'Vedic timing and karma cycles',
      icon: '🕉️',
      color: '#45B7D1',
      requiredInputs: ['birthDate', 'birthTime', 'birthPlace'],
    },
    sacred_geometry: {
      name: 'Sacred Geometry',
      description: 'Geometric consciousness patterns',
      icon: '🔯',
      color: '#96CEB4',
      requiredInputs: ['question'],
    },
    sigil_forge: {
      name: 'Sigil Forge',
      description: 'Sacred symbol creation',
      icon: '🔮',
      color: '#DDA0DD',
      requiredInputs: ['question', 'name'],
    },
    enneagram: {
      name: 'Enneagram',
      description: 'Personality archetype mapping',
      icon: '🎭',
      color: '#F0E68C',
      requiredInputs: ['name'],
    },
  };

  // Handle engine calculation
  const handleEngineCalculation = useCallback(async (engine: string) => {
    // Check if engine is unlocked (including admin override)
    const status = engineUnlockStatus[engine as keyof typeof engineUnlockStatus];
    if (!status?.isUnlocked) {
      alert(`Engine ${engine} not unlocked yet. Continue breathing and building consciousness.`);
      return;
    }

    const displayInfo = ENGINE_DISPLAY_INFO[engine as keyof typeof ENGINE_DISPLAY_INFO];
    const missingInputs = displayInfo.requiredInputs.filter(input => !engineInputData[input as keyof EngineInputData]);

    if (missingInputs.length > 0) {
      alert(`Please provide: ${missingInputs.join(', ')}`);
      return;
    }

    try {
      const result = await calculateEngine({
        engine: engine as any,
        inputData: engineInputData,
        consciousnessContext: {
          awarenessLevel: consciousness.awarenessLevel,
          coherenceLevel: breathState.coherence,
          breathPhase: breathState.phase,
          integrationPoints: consciousness.integrationPoints,
        },
      });

      console.log('Engine calculation result:', result);
      onEngineSelect?.(engine);
    } catch (error) {
      console.error('Engine calculation failed:', error);
      alert(`Calculation failed: ${error}`);
    }
  }, [engineUnlockStatus, engineInputData, calculateEngine, consciousness, breathState, onEngineSelect]);

  // Handle breath state change for breath-triggered mode
  const handleBreathStateChange = useCallback((newBreathState: any) => {
    if (isBreathTriggeredMode && selectedEngine && newBreathState.phase === 'pause' && newBreathState.coherence > 0.7) {
      triggerBreathCalculation(selectedEngine as any, engineInputData);
    }
  }, [isBreathTriggeredMode, selectedEngine, triggerBreathCalculation, engineInputData]);

  // Calculate consciousness display
  const consciousnessDisplay = consciousness.awarenessLevel < 0.3 
    ? { name: 'Emerging', color: '#FF6B6B', icon: '🌱' }
    : consciousness.awarenessLevel < 0.6 
    ? { name: 'Awakening', color: '#FFD700', icon: '🌅' }
    : consciousness.awarenessLevel < 0.8 
    ? { name: 'Expanding', color: '#32CD32', icon: '🌟' }
    : { name: 'Transcendent', color: '#9370DB', icon: '✨' };

  // Calculate coherence display
  const coherenceDisplay = breathState.coherence < 0.3 
    ? { name: 'Chaotic', color: '#FF6B6B', icon: '🌪️' }
    : breathState.coherence < 0.6 
    ? { name: 'Stabilizing', color: '#FFD700', icon: '🌊' }
    : breathState.coherence < 0.8 
    ? { name: 'Coherent', color: '#32CD32', icon: '💎' }
    : { name: 'Crystalline', color: '#9370DB', icon: '🔮' };

  return (
    <div className="consciousness-engine-portal w-full h-full bg-gradient-to-b from-indigo-950 via-purple-950 to-black text-white p-6">
      {/* Header - Consciousness Status */}
      <div className="header mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Consciousness Engine Portal</h1>
          <div className="flex items-center space-x-4">
            <div className="consciousness-status text-sm">
              <div className="flex items-center space-x-2">
                <span>{consciousnessDisplay.icon}</span>
                <span style={{ color: consciousnessDisplay.color }}>
                  {consciousnessDisplay.name} ({(consciousness.awarenessLevel * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="coherence-status text-sm">
              <div className="flex items-center space-x-2">
                <span>🌬️</span>
                <span style={{ color: coherenceDisplay.color }}>
                  {coherenceDisplay.name} ({(breathState.coherence * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
            {adminUnlockAll && (
              <div className="admin-status text-sm">
                <div className="flex items-center space-x-2 bg-yellow-600/20 px-2 py-1 rounded border border-yellow-400/30">
                  <span>⚡</span>
                  <span className="text-yellow-300">Admin Override</span>
                </div>
              </div>
            )}
            {/* Debug Toggle */}
            {isAdminMode && (
              <button
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className={`text-xs px-2 py-1 rounded ${
                  showDebugInfo 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                🔍 {showDebugInfo ? 'Debug ON' : 'Debug'}
              </button>
            )}
          </div>
        </div>

        {/* Debug Info */}
        {showDebugInfo && (
          <div className="debug-info mb-4 p-3 bg-black/50 rounded border border-gray-600 text-xs">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="font-semibold text-yellow-300">Admin State:</div>
                <div>Admin Mode: {isAdminMode ? '✅' : '❌'}</div>
                <div>Unlock All: {adminUnlockAll ? '✅' : '❌'}</div>
                <div>Force Refresh: {forceRefresh}</div>
              </div>
              <div>
                <div className="font-semibold text-green-300">Unlock Status:</div>
                <div>Unlocked: {unlockedEngines.length}/10</div>
                <div>Next: {nextEngineToUnlock || 'None'}</div>
                <div>Progress: {(progressToNextEngine * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="font-semibold text-blue-300">Consciousness:</div>
                <div>Level: {(consciousness.awarenessLevel * 100).toFixed(0)}%</div>
                <div>Coherence: {(breathState.coherence * 100).toFixed(0)}%</div>
                <div>Cycles: {totalBreathCycles}</div>
              </div>
            </div>
            {adminUnlockAll && (
              <div className="mt-2 p-2 bg-yellow-900/30 rounded border border-yellow-500/30">
                <div className="text-yellow-300 font-semibold">⚡ ADMIN OVERRIDE FORCING ALL ENGINES UNLOCKED</div>
              </div>
            )}
          </div>
        )}

        {/* Progress Stats */}
        <div className="stats grid grid-cols-4 gap-4 text-sm">
          <div className="stat bg-white/10 rounded p-3">
            <div className="font-semibold">Breath Cycles</div>
            <div className="text-xl">{totalBreathCycles}</div>
          </div>
          <div className="stat bg-white/10 rounded p-3">
            <div className="font-semibold">Unlocked Engines</div>
            <div className="text-xl">{unlockedEngines.length}/10</div>
          </div>
          <div className="stat bg-white/10 rounded p-3">
            <div className="font-semibold">Total Readings</div>
            <div className="text-xl">{getTotalReadings()}</div>
          </div>
          <div className="stat bg-white/10 rounded p-3">
            <div className="font-semibold">Current Layer</div>
            <div className="text-xl">{currentLayer}</div>
          </div>
        </div>
      </div>

      {/* Breath Detection */}
      {enableBreathTrigger && (
        <div className="breath-section mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Breath Interface</h2>
            <button
              onClick={() => setBreathTriggeredMode(!isBreathTriggeredMode)}
              className={`px-3 py-1 rounded text-sm ${
                isBreathTriggeredMode 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {isBreathTriggeredMode ? 'Breath Mode ON' : 'Breath Mode OFF'}
            </button>
          </div>
          <div className="h-16 bg-black/30 rounded">
            {/* BreathDetection component would render here in 3D context */}
            <div className="flex items-center justify-center h-full text-gray-400">
              Breath detection active - {breathState.phase} phase
            </div>
          </div>
        </div>
      )}

      {/* Engine Grid */}
      <div className="engines-section">
        <h2 className="text-lg font-semibold mb-4">Consciousness Engines</h2>
        
        {/* Next Engine to Unlock - Only show if not admin override */}
        {nextEngineToUnlock && !adminUnlockAll && (
          <div className="next-unlock mb-4 p-4 bg-amber-900/30 rounded border border-amber-500/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-amber-400">Next to Unlock: {nextEngineToUnlock}</div>
                <div className="text-sm text-amber-300">
                  {engineUnlockStatus[nextEngineToUnlock]?.nextThreshold}
                </div>
              </div>
              <div className="progress-circle">
                <div className="text-2xl text-amber-400">
                  {(progressToNextEngine * 100).toFixed(0)}%
                </div>
              </div>
            </div>
            <div className="progress-bar mt-2 bg-amber-900/50 rounded-full h-2">
              <div 
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressToNextEngine * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Admin Override Notice */}
        {adminUnlockAll && (
          <div className="admin-notice mb-4 p-4 bg-gradient-to-r from-yellow-900/30 to-green-900/30 rounded border border-yellow-400/50">
            <div className="flex items-center space-x-2 text-yellow-300">
              <span className="text-xl">⚡</span>
              <span className="font-bold">ADMIN OVERRIDE ACTIVE</span>
            </div>
            <div className="text-sm text-yellow-200 mt-1">
              All 10 consciousness engines are unlocked for testing and development
            </div>
          </div>
        )}

        {/* Engine Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" key={`engine-grid-${forceRefresh}-${adminUnlockAll}`}>
          {Object.entries(ENGINE_DISPLAY_INFO).map(([engineKey, info]) => {
            const status = engineUnlockStatus[engineKey as keyof typeof engineUnlockStatus];
            // Force admin override - if admin unlock all is enabled, override the status
            const isUnlocked = adminUnlockAll ? true : (status?.isUnlocked || false);
            const isSelected = selectedEngine === engineKey;

            // Debug log for each engine when debug mode is on
            if (showDebugInfo) {
              console.log(`🔍 Engine ${engineKey}:`, { 
                isUnlocked, 
                adminUnlockAll,
                statusIsUnlocked: status?.isUnlocked,
                finalIsUnlocked: isUnlocked,
                unlockCondition: status?.unlockCondition
              });
            }

            return (
              <div
                key={`${engineKey}-${forceRefresh}-${adminUnlockAll ? 'admin' : 'normal'}`}
                className={`engine-card p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                  isUnlocked
                    ? isSelected
                      ? 'border-white bg-white/20'
                      : 'border-green-500/50 bg-green-900/20 hover:bg-green-900/40'
                    : 'border-gray-600/50 bg-gray-900/20 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => {
                  if (isUnlocked) {
                    setSelectedEngine(isSelected ? null : engineKey);
                  }
                }}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{info.icon}</div>
                  <div className="font-semibold text-sm" style={{ color: isUnlocked ? info.color : '#666' }}>
                    {info.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {info.description}
                  </div>
                  
                  {!isUnlocked && status && (
                    <div className="mt-2">
                      <div className="text-xs text-red-400">
                        {(status.progressToUnlock * 100).toFixed(0)}% unlocked
                      </div>
                      <div className="progress-bar mt-1 bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-red-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${status.progressToUnlock * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {isUnlocked && (
                    <div className="mt-2">
                      <div className="text-xs text-green-400 font-semibold">
                        ✓ {adminUnlockAll ? 'Admin Unlocked' : 'Unlocked'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Engine Input Form */}
        {selectedEngine && (
          <div className="engine-input mt-6 p-4 bg-white/10 rounded-lg">
            <h3 className="font-semibold mb-3">
              {ENGINE_DISPLAY_INFO[selectedEngine as keyof typeof ENGINE_DISPLAY_INFO].name} Input
            </h3>
            
            {/* Auto-populated data notice */}
            {profile && (
              <div className="mb-4 p-3 bg-green-900/20 border border-green-500/50 rounded text-sm">
                <div className="flex items-center space-x-2 text-green-400">
                  <span>✓</span>
                  <span>Using your onboarding profile data</span>
                </div>
                <div className="text-green-300 text-xs mt-1">
                  {profile.personalData?.fullName} • {profile.birthData?.birthDate} • {profile.location?.city}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {ENGINE_DISPLAY_INFO[selectedEngine as keyof typeof ENGINE_DISPLAY_INFO].requiredInputs.map(input => {
                const isAutoFilled = Boolean(profile && ['birthDate', 'birthTime', 'birthPlace', 'name'].includes(input));
                
                return (
                  <div key={input}>
                    <label className="block text-sm font-medium mb-1 capitalize">
                      {input.replace(/([A-Z])/g, ' $1').trim()}
                      {isAutoFilled && <span className="text-green-400 ml-1">✓</span>}
                    </label>
                    <input
                      type={input.includes('Date') ? 'date' : input.includes('Time') ? 'time' : 'text'}
                      value={engineInputData[input as keyof EngineInputData] || ''}
                      onChange={(e) => setEngineInputData(prev => ({ ...prev, [input]: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded text-white ${
                        isAutoFilled 
                          ? 'bg-green-900/20 border-green-500/50' 
                          : 'bg-black/30 border-gray-600'
                      }`}
                      placeholder={input === 'question' ? 'Ask your question...' : `Enter ${input}`}
                      disabled={isAutoFilled && input !== 'question'}
                    />
                    {isAutoFilled && input !== 'question' && (
                      <div className="text-xs text-green-400 mt-1">
                        Auto-filled from your profile
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => handleEngineCalculation(selectedEngine)}
                disabled={isCalculating}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded font-semibold"
              >
                {isCalculating ? 'Calculating...' : 'Calculate'}
              </button>
              
              {isBreathTriggeredMode && (
                <div className="text-sm text-amber-400">
                  🌬️ Breath-triggered mode active
                </div>
              )}
            </div>
          </div>
        )}

        {/* Last Calculation Result */}
        {lastCalculation && (
          <div className="last-result mt-6 p-4 bg-green-900/20 border border-green-500/50 rounded-lg">
            <h3 className="font-semibold text-green-400 mb-2">Latest Reading</h3>
            <div className="text-sm">
              <div><strong>Engine:</strong> {lastCalculation.engine}</div>
              <div><strong>Consciousness Gain:</strong> +{(lastCalculation.consciousnessEnhancement.awarenessGain * 100).toFixed(2)}%</div>
              <div><strong>Time:</strong> {new Date(lastCalculation.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
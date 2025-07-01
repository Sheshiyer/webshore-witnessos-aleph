'use client';

import React, { useState } from 'react';
import { useConsciousnessEngineIntegration } from '@/hooks/useConsciousnessEngineIntegration';
import { useAuth } from '@/contexts/AuthContext';
import { useConsciousness } from '@/hooks/useConsciousness';

interface AdminDebugPanelProps {
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export default function AdminDebugPanel({ 
  isVisible = false, 
  onToggleVisibility 
}: AdminDebugPanelProps) {
  const { user } = useAuth();
  const { consciousness, breathState } = useConsciousness();
  const {
    isAdminMode,
    toggleAdminMode,
    isDebugMode,
    toggleDebugMode,
    adminUnlockAll,
    toggleAdminUnlockAll,
    unlockedEngines,
    engineUnlockStatus,
    totalBreathCycles,
    isBreathTriggeredMode,
    setBreathTriggeredMode,
    getTotalReadings,
    getConsciousnessGrowthRate,
  } = useConsciousnessEngineIntegration();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const isAdmin = user?.email === 'sheshnarayan.iyer@gmail.com';

  if (!isAdmin) {
    return null; // Don't show panel for non-admin users
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggleVisibility}
        className="fixed top-4 right-4 z-50 bg-purple-600/80 hover:bg-purple-500/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-purple-400/30 transition-all duration-200 shadow-lg"
        title="Toggle Admin Debug Panel"
      >
        🔧 Admin
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed top-16 right-4 z-40 w-96 max-h-[80vh] overflow-y-auto bg-black/90 backdrop-blur-md border border-purple-400/30 rounded-xl p-6 text-white shadow-2xl">
          
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-purple-300 mb-2">
              🔑 Admin Debug Panel
            </h2>
            <p className="text-sm text-gray-400">
              Welcome, {user?.name || 'Admin'} ({user?.email})
            </p>
          </div>

          {/* Admin Controls */}
          <div className="space-y-4">
            
            {/* Mode Toggles */}
            <div className="bg-purple-900/30 rounded-lg p-4">
              <h3 className="font-semibold text-purple-200 mb-3">Mode Controls</h3>
              
              <div className="space-y-3">
                {/* Admin Mode Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admin Mode</span>
                  <button
                    onClick={toggleAdminMode}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      isAdminMode ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        isAdminMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Debug Mode Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Debug Mode</span>
                  <button
                    onClick={toggleDebugMode}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      isDebugMode ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        isDebugMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Unlock All Engines Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Unlock All Engines</span>
                  <button
                    onClick={toggleAdminUnlockAll}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      adminUnlockAll ? 'bg-yellow-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        adminUnlockAll ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Breath Triggered Mode Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Breath Triggered</span>
                  <button
                    onClick={() => setBreathTriggeredMode(!isBreathTriggeredMode)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                      isBreathTriggeredMode ? 'bg-cyan-500' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                        isBreathTriggeredMode ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Status Overview */}
            <div className="bg-blue-900/30 rounded-lg p-4">
              <button
                onClick={() => toggleSection('status')}
                className="w-full flex items-center justify-between text-blue-200 font-semibold"
              >
                <span>System Status</span>
                <span>{expandedSection === 'status' ? '▼' : '▶'}</span>
              </button>
              
              {expandedSection === 'status' && (
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Consciousness Level:</span>
                    <span className="text-green-300">{(consciousness.awarenessLevel * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Breath Coherence:</span>
                    <span className="text-cyan-300">{(breathState.coherence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Breath Cycles:</span>
                    <span className="text-purple-300">{totalBreathCycles}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Readings:</span>
                    <span className="text-yellow-300">{getTotalReadings()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Growth Rate:</span>
                    <span className="text-orange-300">{(getConsciousnessGrowthRate() * 100).toFixed(2)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Engine Status */}
            <div className="bg-green-900/30 rounded-lg p-4">
              <button
                onClick={() => toggleSection('engines')}
                className="w-full flex items-center justify-between text-green-200 font-semibold"
              >
                <span>Engine Status ({unlockedEngines.length}/10)</span>
                <span>{expandedSection === 'engines' ? '▼' : '▶'}</span>
              </button>
              
              {expandedSection === 'engines' && (
                <div className="mt-3 space-y-2 text-xs">
                  {Object.entries(engineUnlockStatus).map(([engine, status]) => (
                    <div key={engine} className="flex items-center justify-between">
                      <span className="capitalize">{engine.replace('_', ' ')}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              status.isUnlocked ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${status.progressToUnlock * 100}%` }}
                          />
                        </div>
                        <span className={status.isUnlocked ? 'text-green-400' : 'text-yellow-400'}>
                          {status.isUnlocked ? '✓' : '○'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-red-900/30 rounded-lg p-4">
              <h3 className="font-semibold text-red-200 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-2 px-4 rounded text-sm transition-colors"
                >
                  🗑️ Clear All Data & Reload
                </button>
                
                <button
                  onClick={() => {
                    console.log('🔍 Debug Info:', {
                      user,
                      consciousness,
                      breathState,
                      unlockedEngines,
                      totalBreathCycles,
                      isAdminMode,
                      adminUnlockAll,
                    });
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 px-4 rounded text-sm transition-colors"
                >
                  📊 Log Debug Info
                </button>
              </div>
            </div>

            {/* Admin Override Notice */}
            {adminUnlockAll && (
              <div className="bg-yellow-900/50 border border-yellow-400/30 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-yellow-200">
                  <span>⚡</span>
                  <span className="text-sm font-medium">Admin Override Active</span>
                </div>
                <p className="text-xs text-yellow-300/80 mt-1">
                  All 10 consciousness engines are unlocked for testing
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
} 
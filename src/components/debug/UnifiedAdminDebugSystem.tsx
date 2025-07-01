'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { BiofieldViewerOutput } from '@/engines/biofield-viewer-engine';

interface UnifiedAdminDebugSystemProps {
  isVisible?: boolean;
  onToggleVisibility?: () => void;
}

export default function UnifiedAdminDebugSystem({ 
  isVisible = false, 
  onToggleVisibility 
}: UnifiedAdminDebugSystemProps) {
  const { user } = useAuth();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [biofieldSnapshots, setBiofieldSnapshots] = useState<any[]>([]);
  const [adminMode, setAdminMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [overrideStatus, setOverrideStatus] = useState(false);

  const isAdmin = user?.email === 'sheshnarayan.iyer@gmail.com';

  // Load biofield snapshots from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const snapshots = JSON.parse(localStorage.getItem('biofield_snapshots') || '[]');
      setBiofieldSnapshots(snapshots);
    }
  }, [isVisible]);

  // Auto-refresh snapshots every 5 seconds when panel is open
  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        if (typeof window !== 'undefined') {
          const snapshots = JSON.parse(localStorage.getItem('biofield_snapshots') || '[]');
          setBiofieldSnapshots(snapshots);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isAdmin) {
    return null;
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const clearBiofieldHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('biofield_snapshots');
      setBiofieldSnapshots([]);
      console.log('🗑️ Biofield history cleared');
    }
  };

  const exportBiofieldData = () => {
    if (biofieldSnapshots.length === 0) return;
    
    const dataStr = JSON.stringify(biofieldSnapshots, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `biofield-snapshots-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getConsciousnessEvolution = () => {
    if (biofieldSnapshots.length < 2) return 0;
    const recent = biofieldSnapshots.slice(-5);
    const avg = recent.reduce((sum, snap) => sum + snap.consciousnessLevel, 0) / recent.length;
    return avg;
  };

  const getSessionTime = () => {
    if (biofieldSnapshots.length === 0) return 0;
    const first = new Date(biofieldSnapshots[0].timestamp);
    const last = new Date(biofieldSnapshots[biofieldSnapshots.length - 1].timestamp);
    return Math.round((last.getTime() - first.getTime()) / (1000 * 60)); // minutes
  };

  return (
    <>
      {/* Consciousness Admin Toggle */}
      <button
        onClick={onToggleVisibility}
        className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-600/90 to-cyan-600/90 hover:from-purple-500/90 hover:to-cyan-500/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-purple-400/30 transition-all duration-200 shadow-lg font-mono text-sm"
        title="Consciousness Admin Control Center"
      >
        ⚡ Admin
      </button>

      {/* Admin Control Center */}
      {isVisible && (
        <div className="fixed inset-4 z-40 bg-black/95 backdrop-blur-md border border-purple-400/30 rounded-xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900/50 to-cyan-900/50 p-6 border-b border-purple-400/20">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1 font-mono">
                  ⚡ Admin Control Center
                </h1>
                <p className="text-purple-200 text-sm">
                  Welcome, Admin {user?.name || 'Cumbipuram Nateshan Sheshnarayan'} - Full System Access
                </p>
              </div>
              <button
                onClick={onToggleVisibility}
                className="text-white/60 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            <div className="mt-4 text-xs text-cyan-300 font-mono">
              Session expires in: 16h 28m
            </div>
          </div>

          <div className="flex h-[calc(100vh-200px)]">
            
            {/* Left Panel - Controls */}
            <div className="w-1/3 p-6 border-r border-purple-400/20 overflow-y-auto">
              
              {/* Admin Controls */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-lg p-4 border border-yellow-400/30 mb-6">
                <h3 className="text-yellow-300 font-bold mb-4 flex items-center">
                  ⚡ Admin Controls
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">🔑 Admin Mode</div>
                      <div className="text-xs text-gray-400">Full system override</div>
                    </div>
                    <button
                      onClick={() => setAdminMode(!adminMode)}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        adminMode ? 'bg-green-500 shadow-green-500/50 shadow-lg' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                        adminMode ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">🔍 Debug Mode</div>
                      <div className="text-xs text-gray-400">Enhanced logging</div>
                    </div>
                    <button
                      onClick={() => setDebugMode(!debugMode)}
                      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
                        debugMode ? 'bg-blue-500 shadow-blue-500/50 shadow-lg' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform duration-300 ${
                        debugMode ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-3 gap-2 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">3</div>
                    <div className="text-xs text-gray-300">Engines Unlocked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">✓</div>
                    <div className="text-xs text-gray-300">Admin Mode</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">🔒</div>
                    <div className="text-xs text-gray-300">Override Status</div>
                  </div>
                </div>
              </div>

              {/* Consciousness Spaces */}
              <div className="space-y-3">
                <h3 className="text-cyan-300 font-bold flex items-center">
                  🌟 Consciousness Spaces
                </h3>
                
                {[
                  { name: 'Consciousness Engines', desc: 'Engine unlock and testing interface', icon: '🧠', color: 'purple' },
                  { name: 'Cosmic Temple', desc: 'Sacred portal for deep consciousness exploration', icon: '🏛️', color: 'blue' },
                  { name: 'Submerged Forest', desc: 'Symbolic forest practice terrain', icon: '🌲', color: 'green' },
                  { name: 'Sigil Workshop', desc: 'Breath-tree sigil creation atelier', icon: '🌸', color: 'pink' },
                  { name: 'Engine Laboratory', desc: 'Consciousness engine testing & calibration', icon: '🔬', color: 'teal' },
                ].map((space, i) => (
                  <div key={i} className={`bg-${space.color}-900/30 border border-${space.color}-400/30 rounded-lg p-3 cursor-pointer hover:bg-${space.color}-800/40 transition-colors`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{space.icon}</span>
                      <div>
                        <div className="text-white font-medium">{space.name}</div>
                        <div className="text-xs text-gray-400">{space.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button className="w-full bg-blue-600/80 hover:bg-blue-500/80 text-white py-3 rounded-lg font-medium transition-colors">
                  🏠 Return to Onboarding
                </button>
                <button className="w-full bg-red-600/80 hover:bg-red-500/80 text-white py-3 rounded-lg font-medium transition-colors">
                  📤 Admin Logout
                </button>
              </div>
            </div>

            {/* Right Panel - Biofield Analytics */}
            <div className="flex-1 p-6 overflow-y-auto">
              
              {/* Biofield Session Overview */}
              <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-lg p-6 border border-cyan-400/30 mb-6">
                <h3 className="text-cyan-300 font-bold mb-4 flex items-center">
                  📊 Biofield Session Analytics
                </h3>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-400">{biofieldSnapshots.length}</div>
                    <div className="text-sm text-gray-300">Snapshots</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400">{Math.round(getConsciousnessEvolution() * 100)}%</div>
                    <div className="text-sm text-gray-300">Consciousness</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400">{getSessionTime()}m</div>
                    <div className="text-sm text-gray-300">Session Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-400">
                      {biofieldSnapshots.length > 0 ? '🟢' : '🔴'}
                    </div>
                    <div className="text-sm text-gray-300">Status</div>
                  </div>
                </div>

                {/* Biofield Controls */}
                <div className="flex space-x-3">
                  <button
                    onClick={exportBiofieldData}
                    disabled={biofieldSnapshots.length === 0}
                    className="px-4 py-2 bg-green-600/80 hover:bg-green-500/80 disabled:bg-gray-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    📥 Export Data
                  </button>
                  <button
                    onClick={clearBiofieldHistory}
                    disabled={biofieldSnapshots.length === 0}
                    className="px-4 py-2 bg-red-600/80 hover:bg-red-500/80 disabled:bg-gray-600/50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    🗑️ Clear History
                  </button>
                </div>
              </div>

              {/* Recent Biofield Snapshots */}
              <div className="bg-purple-900/30 rounded-lg p-6 border border-purple-400/30">
                <h3 className="text-purple-300 font-bold mb-4 flex items-center">
                  📸 Recent Biofield Snapshots
                </h3>
                
                {biofieldSnapshots.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">
                    <div className="text-4xl mb-2">🌊</div>
                    <div>No biofield snapshots captured yet</div>
                    <div className="text-sm mt-2">Return to the main interface to capture your first biofield</div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {biofieldSnapshots.slice(-10).reverse().map((snapshot, i) => (
                      <div key={i} className="bg-black/30 rounded-lg p-4 border border-purple-400/20">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-white font-medium">
                            Snapshot #{biofieldSnapshots.length - i}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(snapshot.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-400">Consciousness</div>
                            <div className="text-cyan-300 font-bold">
                              {Math.round(snapshot.consciousnessLevel * 100)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Coherence</div>
                            <div className="text-green-300 font-bold">
                              {snapshot.snapshot?.energeticSignature?.noisePatterns?.coherence 
                                ? Math.round(snapshot.snapshot.energeticSignature.noisePatterns.coherence * 100) + '%'
                                : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-400">Breath</div>
                            <div className="text-purple-300 font-bold">
                              {snapshot.snapshot?.energeticSignature?.consciousnessMarkers?.breathCoherence
                                ? Math.round(snapshot.snapshot.energeticSignature.consciousnessMarkers.breathCoherence * 100) + '%'
                                : 'N/A'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
/**
 * Unified Debug System for WitnessOS Webshore
 * 
 * Single consolidated debug interface that replaces multiple scattered debug components
 * Includes backend connection, navigation panel, and all debug features in one clean UI
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/utils/api-client';
import { useDebug } from './DebugContext';

interface ConnectionStatus {
  backend: 'connected' | 'disconnected' | 'testing';
  auth: 'connected' | 'disconnected' | 'not-authenticated';
  engines: 'connected' | 'disconnected' | 'testing';
  lastTest: string;
  error: string | undefined;
  fallbackMode: boolean;
}

interface LayerInfo {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const LAYER_INFO: LayerInfo[] = [
  {
    id: 0,
    name: 'Portal',
    description: 'Breathing chamber and consciousness entry',
    icon: '🌀',
    color: 'from-purple-600 to-indigo-600',
  },
  {
    id: 1,
    name: 'Awakening',
    description: 'Symbol garden and compass plaza',
    icon: '🧭',
    color: 'from-green-600 to-teal-600',
  },
  {
    id: 2,
    name: 'Recognition',
    description: 'System understanding spaces',
    icon: '🔍',
    color: 'from-blue-600 to-cyan-600',
  },
  {
    id: 3,
    name: 'Integration',
    description: 'Archetype temples and mastery',
    icon: '⚡',
    color: 'from-orange-600 to-red-600',
  },
];

export const UnifiedDebugSystem: React.FC = () => {
  const { debugState, setCurrentLayer, togglePanel, setOverride, resetDebugState, updateConsciousness, updateBreath, updatePerformance } = useDebug();
  
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    backend: 'testing',
    auth: 'not-authenticated',
    engines: 'testing',
    lastTest: 'Never',
    error: undefined,
    fallbackMode: false,
  });
  
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeTab, setActiveTab] = useState<'status' | 'layers' | 'connection' | 'overrides'>('status');

  // Test backend connection
  const testConnection = useCallback(async () => {
    setConnectionStatus(prev => ({ ...prev, backend: 'testing', error: undefined }));

    try {
      const result = await apiClient.testConnection();
      const currentTime = new Date().toLocaleTimeString();
      
      setConnectionStatus(prev => ({
        ...prev,
        backend: result.success ? 'connected' : 'disconnected',
        auth: result.authenticated ? 'connected' : 'not-authenticated',
        lastTest: currentTime,
        error: result.error,
        fallbackMode: apiClient.isInFallbackMode(),
      }));
    } catch (error) {
      const currentTime = new Date().toLocaleTimeString();
      setConnectionStatus(prev => ({
        ...prev,
        backend: 'disconnected',
        auth: 'disconnected',
        lastTest: currentTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackMode: apiClient.isInFallbackMode(),
      }));
    }
  }, []);

  // Auto-test connection periodically
  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, 30000); // Test every 30 seconds
    return () => clearInterval(interval);
  }, [testConnection]);

  // Only show in development
  if (process.env.NODE_ENV === 'production' || !debugState.isEnabled) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      case 'testing': return 'text-yellow-400';
      case 'not-authenticated': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed top-4 left-4 z-50">
      {/* Minimized Status Bar */}
      {isMinimized && (
        <div 
          className="bg-black/90 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 cursor-pointer transition-all duration-300 hover:bg-black/95"
          onClick={() => setIsMinimized(false)}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${connectionStatus.backend === 'connected' ? 'bg-green-400' : connectionStatus.backend === 'testing' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-cyan-400 font-mono text-sm">WitnessOS</span>
            <span className={getStatusColor(connectionStatus.backend)}>
              {connectionStatus.backend === 'connected' ? 'Connected' : connectionStatus.backend === 'testing' ? 'Testing...' : 'Disconnected'}
            </span>
            {connectionStatus.fallbackMode && (
              <div className="text-cyan-400 text-xs animate-pulse">FALLBACK</div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-1 text-xs">
            <span className="text-gray-400">
              Consciousness: <span className="text-green-400">
                {debugState.debugInfo.consciousness ? `${(debugState.debugInfo.consciousness.awarenessLevel * 100).toFixed(1)}%` : 'N/A'}
              </span>
            </span>
            <span className="text-gray-400">
              Breath: <span className="text-blue-400">
                {debugState.debugInfo.breath ? debugState.debugInfo.breath.phase : 'pause'} ({debugState.debugInfo.breath ? `${(debugState.debugInfo.breath.coherence * 100).toFixed(1)}%` : '0.0%'})
              </span>
            </span>
            <span className="text-gray-400">
              Current Layer: <span className="text-purple-400">{debugState.currentLayer}</span>
            </span>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            Debug Mode: Active | Click to expand
          </div>
        </div>
      )}

      {/* Expanded Debug Panel */}
      {!isMinimized && (
        <div className="bg-black/90 backdrop-blur-md border border-cyan-500/30 rounded-lg w-96 max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.backend === 'connected' ? 'bg-green-400' : connectionStatus.backend === 'testing' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'}`} />
              <span className="text-cyan-400 font-mono text-sm font-bold">WITNESS_DEBUG_CONSOLE</span>
            </div>
            <button 
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ─
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-cyan-500/20">
            {[
              { id: 'status', label: 'Status', icon: '📊' },
              { id: 'layers', label: 'Layers', icon: '🌀' },
              { id: 'connection', label: 'Backend', icon: '🔗' },
              { id: 'overrides', label: 'Controls', icon: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 p-3 text-xs font-mono transition-colors ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {/* Status Tab */}
            {activeTab === 'status' && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-gray-400 mb-2">CONSCIOUSNESS_METRICS</div>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Awareness Level:</span>
                      <span className="text-green-400">
                        {debugState.debugInfo.consciousness ? `${(debugState.debugInfo.consciousness.awarenessLevel * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Breath Coherence:</span>
                      <span className="text-blue-400">
                        {debugState.debugInfo.breath ? `${(debugState.debugInfo.breath.coherence * 100).toFixed(1)}%` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Breath Phase:</span>
                      <span className="text-blue-400">
                        {debugState.debugInfo.breath ? debugState.debugInfo.breath.phase : 'pause'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Layer:</span>
                      <span className="text-purple-400">{debugState.currentLayer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time in Layer:</span>
                      <span className="text-cyan-400">
                        {formatTime(debugState.debugInfo.layerMetrics.timeSpent)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">FPS:</span>
                      <span className="text-yellow-400">
                        {debugState.debugInfo.performance.fps.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Layers Tab */}
            {activeTab === 'layers' && (
              <div className="space-y-4">
                <div className="text-xs text-gray-400 mb-3">LAYER_NAVIGATION</div>
                <div className="grid grid-cols-2 gap-2">
                  {LAYER_INFO.map(layer => (
                    <button
                      key={layer.id}
                      onClick={() => setCurrentLayer(layer.id as any)}
                      className={`
                        relative p-3 rounded-md border transition-all duration-200
                        ${
                          debugState.currentLayer === layer.id
                            ? 'border-cyan-400 bg-cyan-400/10 text-cyan-400'
                            : 'border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{layer.icon}</span>
                        <div className="text-left">
                          <div className="text-xs font-mono font-bold">L{layer.id}</div>
                          <div className="text-xs">{layer.name}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Connection Tab */}
            {activeTab === 'connection' && (
              <div className="space-y-4">
                <div className="text-xs text-gray-400 mb-3">BACKEND_STATUS</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Backend:</span>
                    <span className={getStatusColor(connectionStatus.backend)}>
                      {connectionStatus.backend === 'connected' ? 'Connected' : connectionStatus.backend === 'testing' ? 'Testing...' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Authentication:</span>
                    <span className={getStatusColor(connectionStatus.auth)}>
                      {connectionStatus.auth === 'connected' ? 'Authenticated' : connectionStatus.auth === 'not-authenticated' ? 'Not Auth' : 'Disconnected'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Test:</span>
                    <span className="text-cyan-400">{connectionStatus.lastTest}</span>
                  </div>
                  {connectionStatus.fallbackMode && (
                    <div className="text-yellow-400 text-xs">⚠️ Running in fallback mode</div>
                  )}
                  {connectionStatus.error && (
                    <div className="text-red-400 text-xs mt-2">
                      Error: {connectionStatus.error}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={testConnection}
                    className="w-full px-3 py-2 bg-blue-600/20 border border-blue-600/50 text-blue-400 rounded-md hover:bg-blue-600/30 transition-colors text-xs"
                  >
                    Test Connection
                  </button>
                  <button
                    onClick={() => apiClient.setFallbackMode(!apiClient.isInFallbackMode())}
                    className="w-full px-3 py-2 bg-yellow-600/20 border border-yellow-600/50 text-yellow-400 rounded-md hover:bg-yellow-600/30 transition-colors text-xs"
                  >
                    {apiClient.isInFallbackMode() ? 'Disable' : 'Enable'} Fallback Mode
                  </button>
                </div>
              </div>
            )}

            {/* Overrides Tab */}
            {activeTab === 'overrides' && (
              <div className="space-y-4">
                <div className="text-xs text-gray-400 mb-3">DEBUG_CONTROLS</div>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={debugState.overrides.skipOnboarding || false}
                      onChange={e => setOverride('skipOnboarding', e.target.checked)}
                      className="w-3 h-3 text-cyan-400 bg-transparent border border-gray-600 rounded focus:ring-cyan-400"
                    />
                    <span className="text-gray-300">Skip Onboarding</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={debugState.overrides.mockBreathData || false}
                      onChange={e => setOverride('mockBreathData', e.target.checked)}
                      className="w-3 h-3 text-cyan-400 bg-transparent border border-gray-600 rounded focus:ring-cyan-400"
                    />
                    <span className="text-gray-300">Mock Breath Data</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs">
                    <input
                      type="checkbox"
                      checked={debugState.overrides.enhancedVisuals || false}
                      onChange={e => setOverride('enhancedVisuals', e.target.checked)}
                      className="w-3 h-3 text-cyan-400 bg-transparent border border-gray-600 rounded focus:ring-cyan-400"
                    />
                    <span className="text-gray-300">Enhanced Visuals</span>
                  </label>
                </div>
                
                <div className="border-t border-gray-600 pt-3 space-y-2">
                  <button
                    onClick={resetDebugState}
                    className="w-full px-3 py-2 bg-red-600/20 border border-red-600/50 text-red-400 rounded-md hover:bg-red-600/30 transition-colors text-xs"
                  >
                    Reset Debug State
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-cyan-500/20 text-xs text-gray-500">
            <div>Ctrl+D: Toggle | 0-3: Switch Layers | Esc: Close</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedDebugSystem; 
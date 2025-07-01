/**
 * Backend Connection Test Component
 * 
 * Real-time monitoring of backend connectivity with automatic fallback mode
 * Development-only diagnostic tool for WitnessOS API integration
 */

'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';

interface ConnectionStatus {
  backend: 'connected' | 'disconnected' | 'testing';
  auth: 'connected' | 'disconnected' | 'not-authenticated';
  engines: 'connected' | 'disconnected' | 'testing';
  lastTest: string;
  error: string | undefined;
  fallbackMode: boolean;
}

export const BackendConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    backend: 'testing',
    auth: 'not-authenticated',
    engines: 'testing',
    lastTest: 'Never',
    error: undefined,
    fallbackMode: false,
  });
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [autoTest, setAutoTest] = useState(true);

  const testBackendConnection = async () => {
    setStatus(prev => ({ 
      ...prev, 
      backend: 'testing',
      error: undefined 
    }));

    try {
      const result = await apiClient.testConnection();
      const currentTime = new Date().toLocaleTimeString();
      
      if (result.success) {
        setStatus(prev => ({
          ...prev,
          backend: 'connected',
          auth: result.authenticated ? 'connected' : 'not-authenticated',
          lastTest: currentTime,
          fallbackMode: apiClient.isInFallbackMode(),
        }));
        
        // If connection is successful, disable fallback mode
        if (apiClient.isInFallbackMode()) {
          apiClient.setFallbackMode(false);
        }
      } else {
        setStatus(prev => ({
          ...prev,
          backend: 'disconnected',
          auth: 'disconnected',
          lastTest: currentTime,
          error: result.error,
          fallbackMode: apiClient.isInFallbackMode(),
        }));
        
        // Auto-enable fallback mode on connection failure
        if (!apiClient.isInFallbackMode()) {
          apiClient.setFallbackMode(true);
          console.log('🔄 Auto-enabled fallback mode due to backend connection failure');
        }
      }
    } catch (error) {
      const currentTime = new Date().toLocaleTimeString();
      setStatus(prev => ({
        ...prev,
        backend: 'disconnected',
        auth: 'disconnected',
        lastTest: currentTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackMode: apiClient.isInFallbackMode(),
      }));
      
      // Auto-enable fallback mode on connection error
      if (!apiClient.isInFallbackMode()) {
        apiClient.setFallbackMode(true);
        console.log('🔄 Auto-enabled fallback mode due to connection error');
      }
    }
  };

  const testEngineEndpoints = async () => {
    setStatus(prev => ({ ...prev, engines: 'testing' }));
    
    try {
      // Test a simple engine calculation
      const result = await apiClient.calculateEngine('numerology', {
        fullName: 'Test User',
        birthDate: '1990-01-01',
        system: 'pythagorean',
      });
      
      setStatus(prev => ({
        ...prev,
        engines: result.success ? 'connected' : 'disconnected',
        fallbackMode: apiClient.isInFallbackMode(),
      }));
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        engines: 'disconnected',
        fallbackMode: apiClient.isInFallbackMode(),
      }));
    }
  };

  const toggleFallbackMode = () => {
    const newFallbackMode = !apiClient.isInFallbackMode();
    apiClient.setFallbackMode(newFallbackMode);
    setStatus(prev => ({
      ...prev,
      fallbackMode: newFallbackMode,
    }));
  };

  // Auto-test on mount and periodically if enabled
  useEffect(() => {
    testBackendConnection();
    
    if (autoTest) {
      const interval = setInterval(testBackendConnection, 10000); // Test every 10 seconds
      return () => clearInterval(interval);
    }
  }, [autoTest]);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const getStatusColor = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-red-400';
      case 'testing': return 'text-yellow-400';
      case 'not-authenticated': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (connectionStatus: string) => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
      case 'testing': return 'Testing...';
      case 'not-authenticated': return 'Not Authenticated';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Compact Status Indicator */}
      <div 
        className="bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg p-3 cursor-pointer transition-all duration-300 hover:bg-black/90"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="text-white/80 font-mono text-sm">Backend Connection Test</div>
          <div className={`w-2 h-2 rounded-full ${status.backend === 'connected' ? 'bg-green-400' : status.backend === 'testing' ? 'bg-yellow-400' : 'bg-red-400'}`} />
          {status.fallbackMode && (
            <div className="text-cyan-400 text-xs animate-pulse">FALLBACK</div>
          )}
        </div>
      </div>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="mt-2 bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg p-4 min-w-80">
          <div className="space-y-3">
            {/* Connection Status */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Backend:</span>
                <span className={`text-sm font-mono ${getStatusColor(status.backend)}`}>
                  {getStatusText(status.backend)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Auth:</span>
                <span className={`text-sm font-mono ${getStatusColor(status.auth)}`}>
                  {getStatusText(status.auth)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Engines:</span>
                <span className={`text-sm font-mono ${getStatusColor(status.engines)}`}>
                  {getStatusText(status.engines)}
                </span>
              </div>
            </div>

            {/* Fallback Mode Status */}
            <div className="border-t border-white/10 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm">Fallback Mode:</span>
                <button
                  onClick={toggleFallbackMode}
                  className={`px-2 py-1 rounded text-xs font-mono transition-all ${
                    status.fallbackMode 
                      ? 'bg-cyan-400/20 text-cyan-400 border border-cyan-400/30' 
                      : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                  }`}
                >
                  {status.fallbackMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
              {status.fallbackMode && (
                <div className="text-cyan-400/70 text-xs mt-1">
                  Using mock data - backend disconnected
                </div>
              )}
            </div>

            {/* Error Display */}
            {status.error && (
              <div className="border-t border-white/10 pt-3">
                <div className="text-red-400 text-xs">Error: {status.error}</div>
              </div>
            )}

            {/* Controls */}
            <div className="border-t border-white/10 pt-3 space-y-2">
              <div className="text-white/50 text-xs">Last test: {status.lastTest}</div>
              
              <div className="flex space-x-2">
                <button
                  onClick={testBackendConnection}
                  className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 px-3 py-1 rounded text-xs transition-all"
                  disabled={status.backend === 'testing'}
                >
                  🔄 Test Connection
                </button>
                
                <button
                  onClick={testEngineEndpoints}
                  className="flex-1 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/30 text-purple-400 px-3 py-1 rounded text-xs transition-all"
                  disabled={status.engines === 'testing'}
                >
                  🔧 Test Engines
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs text-white/70">
                  <input
                    type="checkbox"
                    checked={autoTest}
                    onChange={(e) => setAutoTest(e.target.checked)}
                    className="w-3 h-3"
                  />
                  <span>Auto-test (10s)</span>
                </label>
                
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-white/50 hover:text-white/80 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendConnectionTest; 
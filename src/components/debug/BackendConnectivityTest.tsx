/**
 * Backend Connectivity Test Component
 * 
 * Tests connectivity to the Railway backend and displays results
 * Helps debug API integration issues
 */

'use client';

import React, { useState, useEffect } from 'react';
import { testBackendConnectivity } from '@/utils/api-client';
import { apiClient } from '@/utils/api-client';

interface ConnectivityTestProps {
  isVisible?: boolean;
  autoTest?: boolean;
}

export const BackendConnectivityTest: React.FC<ConnectivityTestProps> = ({
  isVisible = false,
  autoTest = true
}) => {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [engineTestResult, setEngineTestResult] = useState<any>(null);

  const runConnectivityTest = async () => {
    setIsLoading(true);
    try {
      const result = await testBackendConnectivity();
      setTestResult(result);
      console.log('🧪 Connectivity test result:', result);
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Test failed with exception',
        details: { error: String(error) }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runEngineTest = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing numerology engine...');
      const result = await apiClient.calculateEngine('numerology', {
        birth_date: '1991-08-13',
        full_name: 'Test User'
      });
      setEngineTestResult(result);
      console.log('🧪 Engine test result:', result);
    } catch (error) {
      setEngineTestResult({
        success: false,
        error: String(error)
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoTest && isVisible) {
      runConnectivityTest();
    }
  }, [autoTest, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 backdrop-blur-sm border border-cyan-400/30 rounded-lg p-4 max-w-md">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-cyan-300 mb-2">
          🧪 Backend Connectivity Test
        </h3>
        
        <div className="space-y-2">
          <button
            onClick={runConnectivityTest}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-blue-600/80 hover:bg-blue-500/80 disabled:bg-blue-700/50 text-white rounded text-sm transition-colors"
          >
            {isLoading ? 'Testing...' : 'Test Connectivity'}
          </button>
          
          <button
            onClick={runEngineTest}
            disabled={isLoading}
            className="w-full px-3 py-2 bg-purple-600/80 hover:bg-purple-500/80 disabled:bg-purple-700/50 text-white rounded text-sm transition-colors"
          >
            {isLoading ? 'Testing...' : 'Test Engine API'}
          </button>
        </div>
      </div>

      {/* Connectivity Test Results */}
      {testResult && (
        <div className="mb-4 p-3 bg-gray-900/50 rounded border border-gray-600/30">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Connectivity Test:</h4>
          <div className={`text-xs ${testResult.success ? 'text-green-400' : 'text-red-400'}`}>
            <div className="mb-1">
              {testResult.success ? '✅' : '❌'} {testResult.message}
            </div>
            {testResult.details && (
              <div className="text-gray-400 font-mono">
                <div>Status: {testResult.details.status}</div>
                {testResult.details.data && (
                  <div>Response: {testResult.details.data.substring(0, 100)}...</div>
                )}
                {testResult.details.error && (
                  <div>Error: {testResult.details.error.substring(0, 100)}...</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engine Test Results */}
      {engineTestResult && (
        <div className="mb-4 p-3 bg-gray-900/50 rounded border border-gray-600/30">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Engine Test:</h4>
          <div className={`text-xs ${engineTestResult.success ? 'text-green-400' : 'text-red-400'}`}>
            <div className="mb-1">
              {engineTestResult.success ? '✅' : '❌'} 
              {engineTestResult.success ? 'Engine API working' : 'Engine API failed'}
            </div>
            {engineTestResult.data && (
              <div className="text-gray-400 font-mono">
                <div>Engine: {engineTestResult.data.engine_name}</div>
                <div>Time: {engineTestResult.data.calculation_time}s</div>
                <div>Confidence: {engineTestResult.data.confidence_score}</div>
              </div>
            )}
            {engineTestResult.error && (
              <div className="text-red-400 font-mono">
                Error: {engineTestResult.error.substring(0, 100)}...
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-400 text-center">
        Backend: Railway Production
      </div>
    </div>
  );
};

export default BackendConnectivityTest;

/**
 * API Connection Test Component
 * 
 * Debug component to test API connectivity and diagnose CORS/network issues
 * Only shows for admin users in development
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiHealthChecker, testAPIConnection, getAPIStatus, type HealthCheckResult } from '@/utils/api-health-checker';
import { apiClient } from '@/utils/api-client';

interface APIConnectionTestProps {
  isVisible?: boolean;
}

export default function APIConnectionTest({ isVisible = false }: APIConnectionTestProps) {
  const { user } = useAuth();
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null);
  const [comprehensiveResult, setComprehensiveResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const isAdmin = user?.email === 'sheshnarayan.iyer@gmail.com';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Don't render for non-admin users or in production
  if (!isAdmin || !isDevelopment || !isVisible) {
    return null;
  }

  // Test basic health check
  const testHealthCheck = async () => {
    setIsLoading(true);
    try {
      const result = await testAPIConnection();
      setHealthResult(result);
      console.log('Health check result:', result);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test comprehensive API status
  const testComprehensiveStatus = async () => {
    setIsLoading(true);
    try {
      const result = await getAPIStatus();
      setComprehensiveResult(result);
      console.log('Comprehensive status:', result);
    } catch (error) {
      console.error('Comprehensive test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test specific API endpoints
  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    setIsLoading(true);
    try {
      const options: any = { method };
      if (body) {
        options.body = JSON.stringify(body);
      }

      const result = await apiClient.makeRequest(endpoint, options);
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: result.success,
          data: result.data,
          error: result.error,
          timestamp: new Date().toISOString(),
        }
      }));
      console.log(`${endpoint} test result:`, result);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [endpoint]: {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        }
      }));
      console.error(`${endpoint} test failed:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all results
  const clearResults = () => {
    setHealthResult(null);
    setComprehensiveResult(null);
    setTestResults({});
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 w-96 max-h-96 overflow-y-auto bg-black/90 backdrop-blur-md border border-cyan-400/30 rounded-xl p-4 text-white text-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-cyan-300">🔧 API Connection Test</h3>
        <button
          onClick={clearResults}
          className="text-gray-400 hover:text-white text-xs"
        >
          Clear
        </button>
      </div>

      {/* Test Buttons */}
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={testHealthCheck}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Health Check
          </button>
          
          <button
            onClick={testComprehensiveStatus}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Full Status
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => testEndpoint('/engines')}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Test /engines
          </button>
          
          <button
            onClick={() => testEndpoint('/auth/me')}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-500 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs transition-colors"
          >
            Test /auth/me
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center text-cyan-400 mb-2">
          Testing connection...
        </div>
      )}

      {/* Health Check Results */}
      {healthResult && (
        <div className="mb-4 p-2 bg-gray-900/50 rounded">
          <div className="font-semibold text-cyan-300 mb-1">Health Check:</div>
          <div className={`text-xs ${healthResult.isReachable ? 'text-green-400' : 'text-red-400'}`}>
            Status: {healthResult.status}
          </div>
          <div className="text-xs text-gray-300">
            Response Time: {healthResult.responseTime}ms
          </div>
          {healthResult.error && (
            <div className="text-xs text-red-400 mt-1">
              Error: {healthResult.error}
            </div>
          )}
        </div>
      )}

      {/* Comprehensive Results */}
      {comprehensiveResult && (
        <div className="mb-4 p-2 bg-gray-900/50 rounded">
          <div className="font-semibold text-cyan-300 mb-1">Overall Status:</div>
          <div className={`text-xs mb-2 ${
            comprehensiveResult.overall === 'healthy' ? 'text-green-400' :
            comprehensiveResult.overall === 'partial' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {comprehensiveResult.overall.toUpperCase()}
          </div>
          
          {comprehensiveResult.recommendations.length > 0 && (
            <div className="text-xs text-gray-300">
              <div className="font-semibold mb-1">Recommendations:</div>
              {comprehensiveResult.recommendations.map((rec: string, i: number) => (
                <div key={i} className="text-xs">• {rec}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Endpoint Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="space-y-2">
          <div className="font-semibold text-cyan-300">Endpoint Tests:</div>
          {Object.entries(testResults).map(([endpoint, result]: [string, any]) => (
            <div key={endpoint} className="p-2 bg-gray-900/50 rounded">
              <div className="font-semibold text-xs">{endpoint}</div>
              <div className={`text-xs ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                {result.success ? 'SUCCESS' : 'FAILED'}
              </div>
              {result.error && (
                <div className="text-xs text-red-400 mt-1">
                  {result.error}
                </div>
              )}
              <div className="text-xs text-gray-400">
                {new Date(result.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current API URL */}
      <div className="mt-4 pt-2 border-t border-gray-700 text-xs text-gray-400">
        API: {process.env.NEXT_PUBLIC_API_URL || 'https://api.witnessos.space'}
      </div>
    </div>
  );
}

// Hook to toggle the test component
export function useAPIConnectionTest() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+T to toggle API test
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isVisible,
    toggle: () => setIsVisible(prev => !prev),
    show: () => setIsVisible(true),
    hide: () => setIsVisible(false),
  };
}

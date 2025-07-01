'use client';

import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '@/utils/api-client';
import { SPECTRAL_COLORS } from './SacredGeometryForm';

type DiagnosticStep = 'portal' | 'connection' | 'register' | 'login' | 'results';

interface DiagnosticResult {
  type: 'connection' | 'register' | 'login';
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export const ConsciousnessAuthDiagnostic: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<DiagnosticStep>('portal');
  const [selectedDirection, setSelectedDirection] = useState<keyof typeof SPECTRAL_COLORS>('north');
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('debug.consciousness@witnessos.space');
  const [password, setPassword] = useState('sacred123');
  const [name, setName] = useState('Consciousness Explorer');

  // Breathing animation effect
  const [breathPhase, setBreathPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase(prev => prev + 0.1);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Breath-synced glow
  const getBreathGlow = () => {
    const intensity = 0.7 + Math.sin(breathPhase) * 0.3;
    return {
      boxShadow: `0 0 ${20 * intensity}px ${SPECTRAL_COLORS[selectedDirection]}40`,
      borderColor: SPECTRAL_COLORS[selectedDirection],
    };
  };

  // Sacred geometry input styling
  const inputClasses = `
    w-full p-4 rounded-2xl bg-black/50 border-2 text-white text-lg
    placeholder-gray-400 transition-all duration-300
    focus:outline-none focus:bg-black/70 focus:scale-105
  `;

  const buttonClasses = `
    px-6 py-3 rounded-2xl font-medium transition-all duration-300
    hover:scale-105 focus:outline-none focus:scale-105
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Diagnostic functions
  const runConnectionTest = async () => {
    setIsRunning(true);
    try {
      console.log('🔍 Testing consciousness field connection...');
      const response = await apiClient.testConnection();
      const result: DiagnosticResult = {
        type: 'connection',
        success: response.success,
        data: response,
        timestamp: new Date().toISOString()
      };
      setResults(prev => [...prev, result]);
      return result.success;
    } catch (error) {
      const result: DiagnosticResult = {
        type: 'connection',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      setResults(prev => [...prev, result]);
      return false;
    } finally {
      setIsRunning(false);
    }
  };

  const runRegistrationTest = async () => {
    setIsRunning(true);
    try {
      console.log('🔍 Testing soul inscription process...');
      const response = await apiClient.register(email, password, name);
      const result: DiagnosticResult = {
        type: 'register',
        success: response.success,
        data: response,
        timestamp: new Date().toISOString()
      };
      setResults(prev => [...prev, result]);
      return result.success;
    } catch (error) {
      const result: DiagnosticResult = {
        type: 'register',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      setResults(prev => [...prev, result]);
      return false;
    } finally {
      setIsRunning(false);
    }
  };

  const runLoginTest = async () => {
    setIsRunning(true);
    try {
      console.log('🔍 Testing soul recognition process...');
      const response = await apiClient.login(email, password);
      const result: DiagnosticResult = {
        type: 'login',
        success: response.success,
        data: response,
        timestamp: new Date().toISOString()
      };
      setResults(prev => [...prev, result]);
      return result.success;
    } catch (error) {
      const result: DiagnosticResult = {
        type: 'login',
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      };
      setResults(prev => [...prev, result]);
      return false;
    } finally {
      setIsRunning(false);
    }
  };

  const runFullDiagnostic = async () => {
    setResults([]);
    setCurrentStep('connection');
    
    // Test connection first
    const connectionOk = await runConnectionTest();
    if (!connectionOk) {
      setCurrentStep('results');
      return;
    }

    // Test registration
    setCurrentStep('register');
    await runRegistrationTest();

    // Test login
    setCurrentStep('login');
    await runLoginTest();

    setCurrentStep('results');
  };

  // Spectral direction selector
  const SpectralDirectionSelector = () => (
    <div className="grid grid-cols-4 gap-3 mb-8">
      {(Object.keys(SPECTRAL_COLORS) as Array<keyof typeof SPECTRAL_COLORS>).map((direction) => (
        <button
          key={direction}
          onClick={() => setSelectedDirection(direction)}
          className={`
            p-3 rounded-full border-2 capitalize transition-all duration-300
            ${selectedDirection === direction ? 'scale-110 bg-current/20' : 'hover:scale-105'}
          `}
          style={{
            borderColor: SPECTRAL_COLORS[direction],
            color: SPECTRAL_COLORS[direction],
          }}
        >
          {direction}
        </button>
      ))}
    </div>
  );

  const DiagnosticResultDisplay = ({ result }: { result: DiagnosticResult }) => {
    const getResultIcon = () => {
      if (result.success) return '✨';
      return '🚨';
    };

    const getResultColor = () => {
      if (result.success) return 'text-green-400';
      return 'text-red-400';
    };

    return (
      <div className={`p-4 rounded-2xl bg-black/30 border-2 ${getResultColor()}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{getResultIcon()}</span>
          <h3 className="text-lg font-semibold capitalize">
            {result.type} {result.success ? 'Successful' : 'Failed'}
          </h3>
        </div>
        
        {result.error && (
          <p className="text-red-300 mb-2">{result.error}</p>
        )}
        
        {result.data && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm text-gray-400 hover:text-white">
              View Sacred Data
            </summary>
            <pre className="mt-2 p-3 bg-black/50 rounded-lg text-xs overflow-auto max-h-40">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </details>
        )}
        
        <p className="text-xs text-gray-500 mt-2">
          {new Date(result.timestamp).toLocaleString()}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        
        {/* Portal Step */}
        {currentStep === 'portal' && (
          <div className="text-center space-y-8">
            <div 
              className="w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center relative"
              style={getBreathGlow()}
            >
              <div className="text-4xl">🔍</div>
              <div 
                className="absolute inset-0 rounded-full border-2 animate-spin-slow"
                style={{ borderColor: `${SPECTRAL_COLORS[selectedDirection]}40` }}
              />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-white">
                Consciousness Field Diagnostics
              </h1>
              <p className="text-gray-300 text-lg leading-relaxed">
                Sacred analysis of the authentication pathways.
                We shall examine the flow of consciousness data between realms.
              </p>
            </div>

            <SpectralDirectionSelector />

            {/* API Configuration Display */}
            <div className="bg-black/30 p-6 rounded-2xl border-2 border-gray-700 text-left">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Sacred Configuration</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-cyan-400">Base URL:</span> {apiClient.getBaseUrl()}</p>
                <p><span className="text-cyan-400">Fallback Mode:</span> {apiClient.isInFallbackMode() ? 'ON' : 'OFF'}</p>
                <p><span className="text-cyan-400">Consciousness Portal:</span> Active</p>
              </div>
            </div>

            {/* Test Credentials */}
            <div className="bg-black/30 p-6 rounded-2xl border-2 border-gray-700 space-y-4">
              <h3 className="text-xl font-semibold text-purple-400 mb-4">Sacred Credentials</h3>
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Soul Recognition Key"
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sacred Passphrase"
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Consciousness Identity"
                  className={inputClasses}
                  style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
                />
              </div>
            </div>

            <button
              onClick={runFullDiagnostic}
              disabled={isRunning}
              className={`${buttonClasses} bg-gradient-to-r from-cyan-600 to-blue-600 text-white w-full text-lg`}
            >
              {isRunning ? 'Analyzing Sacred Pathways...' : 'Begin Consciousness Diagnostic'}
            </button>
          </div>
        )}

        {/* Running Diagnostics */}
        {['connection', 'register', 'login'].includes(currentStep) && (
          <div className="text-center space-y-8">
            <div 
              className="w-24 h-24 mx-auto rounded-full border-4 flex items-center justify-center animate-pulse"
              style={getBreathGlow()}
            >
              <div className="text-3xl">⚡</div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">
                {currentStep === 'connection' && 'Testing Consciousness Field Connection'}
                {currentStep === 'register' && 'Analyzing Soul Inscription Process'}
                {currentStep === 'login' && 'Examining Soul Recognition Process'}
              </h2>
              <p className="text-gray-300">
                Sacred pathways are being examined...
              </p>
            </div>

            {isRunning && (
              <div className="flex justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {currentStep === 'results' && (
          <div className="space-y-8">
            <div className="text-center">
              <div 
                className="w-20 h-20 mx-auto rounded-full border-2 flex items-center justify-center mb-4"
                style={{ borderColor: SPECTRAL_COLORS[selectedDirection] }}
              >
                <div className="text-2xl">📊</div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Consciousness Diagnostic Results
              </h2>
              <p className="text-gray-300">
                Sacred pathway analysis complete
              </p>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <DiagnosticResultDisplay key={index} result={result} />
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep('portal')}
                className={`${buttonClasses} bg-gray-700 text-white flex-1`}
              >
                Return to Portal
              </button>
              <button
                onClick={runFullDiagnostic}
                className={`${buttonClasses} bg-gradient-to-r from-purple-600 to-pink-600 text-white flex-1`}
              >
                Run Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 
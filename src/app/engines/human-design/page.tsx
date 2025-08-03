'use client';

import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useAuth } from '@/contexts/AuthContext';
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import { HumanDesignEngine } from '@/components/consciousness-engines';
import type { HumanDesignInput, HumanDesignOutput } from '@/types/engines';

export default function HumanDesignPage() {
  const { user, isLoading } = useAuth();
  const { profile, isLoading: profileLoading } = useConsciousnessProfile();
  const { calculateHumanDesign, state, isConnected } = useWitnessOSAPI();
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<HumanDesignOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const [input, setInput] = useState<HumanDesignInput>({
    fullName: profile?.personalData?.name || '',
    birthDate: profile?.birthData?.birthDate || '',
    birthTime: profile?.birthData?.birthTime || '12:00',
    birthLocation: profile?.birthData?.birthLocation || [0, 0],
    timezone: profile?.birthData?.timezone || 'UTC',
    include_design_calculation: true,
    detailed_gates: true
  });

  // Update input when profile loads
  useEffect(() => {
    if (profile) {
      setInput(prev => ({
        ...prev,
        fullName: profile.personalData?.name || '',
        birthDate: profile.birthData?.birthDate || '',
        birthTime: profile.birthData?.birthTime || '12:00',
        birthLocation: profile.birthData?.birthLocation || [0, 0],
        timezone: profile.birthData?.timezone || 'UTC'
      }));
    }
  }, [profile]);

  const handleCalculate = async () => {
    if (!input.birthDate || !input.birthTime) {
      setError('Birth date and time are required for Human Design calculations');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await calculateHumanDesign(input);
      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || 'Calculation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsCalculating(false);
    }
  };

  const onCalculationComplete = (result: unknown) => {
    setResult(result as HumanDesignOutput);
    setIsCalculating(false);
  };

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading Human Design Engine...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Please log in to access the Human Design Engine</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold">Human Design Engine</h1>
              <p className="text-gray-400">Genetic matrix and life strategy visualization</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400">
              User: {profile?.personalData?.name || user?.email || 'Anonymous'}
            </div>
            <div className={`px-3 py-1 rounded-full text-xs ${
              isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="absolute top-24 left-6 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-4 w-80">
        <h3 className="text-lg font-semibold mb-4">Human Design Controls</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={input.fullName}
              onChange={(e) => setInput(prev => ({ ...prev, fullName: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Birth Date</label>
            <input
              type="date"
              value={input.birthDate}
              onChange={(e) => setInput(prev => ({ ...prev, birthDate: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Birth Time</label>
            <input
              type="time"
              value={input.birthTime}
              onChange={(e) => setInput(prev => ({ ...prev, birthTime: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">Latitude</label>
              <input
                type="number"
                step="0.0001"
                value={input.birthLocation[0]}
                onChange={(e) => setInput(prev => ({ 
                  ...prev, 
                  birthLocation: [parseFloat(e.target.value) || 0, prev.birthLocation[1]] 
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="Latitude"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Longitude</label>
              <input
                type="number"
                step="0.0001"
                value={input.birthLocation[1]}
                onChange={(e) => setInput(prev => ({ 
                  ...prev, 
                  birthLocation: [prev.birthLocation[0], parseFloat(e.target.value) || 0] 
                }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="Longitude"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <input
              type="text"
              value={input.timezone}
              onChange={(e) => setInput(prev => ({ ...prev, timezone: e.target.value }))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="e.g., America/New_York"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={Boolean(input.include_design_calculation)}
                onChange={(e) => setInput(prev => ({ ...prev, include_design_calculation: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm">Include Design Calculation</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={Boolean(input.detailed_gates)}
                onChange={(e) => setInput(prev => ({ ...prev, detailed_gates: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm">Detailed Gates</span>
            </label>
          </div>
          
          <button
            onClick={handleCalculate}
            disabled={isCalculating || !input.birthDate || !input.birthTime}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isCalculating ? 'Calculating...' : 'Calculate Human Design'}
          </button>
          
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="absolute top-24 right-6 z-20 bg-black/80 backdrop-blur-sm rounded-lg p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Human Design Results</h3>
          
          <div className="space-y-3">
            <div>
              <div className="text-sm font-medium text-gray-300">Type</div>
              <div className="text-white">{result.chart?.typeInfo?.typeName || 'Unknown'}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-300">Strategy</div>
              <div className="text-white">{result.chart?.typeInfo?.strategy || 'Unknown'}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-300">Authority</div>
              <div className="text-white">{result.chart?.typeInfo?.authority || 'Unknown'}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-300">Profile</div>
              <div className="text-white">{result.chart?.profile?.profileName || 'Unknown'}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-300">Incarnation Cross</div>
              <div className="text-white">{result.chart?.incarnationCross ? 'Available' : 'Unknown'}</div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-300">Analysis</div>
              <div className="text-sm text-gray-400">
                {typeof result.formatted_output === 'string' ? result.formatted_output : 'No detailed analysis available'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Visualization */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full">
          <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <HumanDesignEngine
                birthData={{
                  birthDate: input.birthDate,
                  birthTime: input.birthTime,
                  birthLocation: input.birthLocation,
                  timezone: input.timezone,
                  date: input.birthDate,
                  time: input.birthTime,
                  location: input.birthLocation
                }}
                position={[0, 0, 0]}
                scale={1}
                visible={true}
                onCalculationComplete={onCalculationComplete}
              />
          </Canvas>
        </div>
      </div>

      {/* Loading Overlay */}
      {isCalculating && (
        <div className="absolute inset-0 z-30 bg-black/50 flex items-center justify-center">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div className="text-white">Calculating Human Design...</div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import { BiorhythmEngine } from '@/components/consciousness-engines';
import type { BiorhythmInput, BiorhythmOutput } from '@/types/engines';

export default function BiorhythmPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { profile } = useConsciousnessProfile();
  const { calculateBiorhythm } = useWitnessOSAPI();
  const router = useRouter();
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<BiorhythmOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleCalculation = async () => {
    if (!profile?.personalData?.name || !profile?.birthData?.birthDate) {
      setError('Please complete your consciousness profile first.');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const personalData = {
        fullName: profile.personalData.name || user?.email || 'Anonymous',
        name: profile.personalData.name || user?.email || 'Anonymous',
        birthDate: profile.birthData.birthDate || '1990-01-01',
      };

      const response = await calculateBiorhythm({
        personalData,
        targetDate: selectedDate,
        cycles: ['physical', 'emotional', 'intellectual', 'intuitive']
      });

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Calculation failed');
      }
    } catch (err) {
      setError('An error occurred during calculation');
      console.error('Biorhythm calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-green-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile?.personalData?.name || !profile?.birthData?.birthDate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
          <p className="text-white/70 mb-6">
            Please complete your consciousness profile to access the Biorhythm Engine.
          </p>
          <button
            onClick={() => router.push('/cosmic-temple')}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
          >
            Return to Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-teal-900 to-blue-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-400 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 rounded-lg border border-green-500/30 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Portal</span>
          </button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Biorhythm Engine</h1>
            <p className="text-white/70">Explore your natural cycles and energy patterns</p>
          </div>

          <div className="flex items-center space-x-2 text-white/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Layer 2 • Harmony</span>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="absolute top-24 left-6 z-10 bg-black/80 backdrop-blur-sm p-6 rounded-lg text-white max-w-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Cycle Analysis
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Birth Date</label>
            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70">
              {profile?.birthData?.birthDate || 'Not set'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cycles to Analyze</label>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Physical (23 days)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                <span>Emotional (28 days)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Intellectual (33 days)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span>Intuitive (38 days)</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleCalculation}
            disabled={isCalculating}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
          >
            {isCalculating ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Calculate Biorhythms
              </div>
            )}
          </button>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results Panel */}
      {result && (
        <div className="absolute top-24 right-6 z-10 bg-black/80 backdrop-blur-sm p-6 rounded-lg text-white max-w-md">
          <h3 className="text-lg font-semibold mb-4">Biorhythm Analysis</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white/5 rounded-lg">
              <div className="font-medium mb-2">Current State</div>
              <div className="text-white/70">
                Analysis for {selectedDate}
              </div>
            </div>
            
            {result.cycles && (
              <div className="space-y-2">
                {Object.entries(result.cycles).map(([cycle, data]: [string, any]) => (
                  <div key={cycle} className="p-2 bg-white/5 rounded">
                    <div className="flex justify-between items-center">
                      <span className="capitalize font-medium">{cycle}</span>
                      <span className={`text-sm ${
                        data.value > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {data.value > 0 ? '+' : ''}{(data.value * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          data.value > 0 ? 'bg-green-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${Math.abs(data.value) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D Visualization */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full">
          <BiorhythmEngine
            birthData={{
              birthDate: profile?.birthData?.birthDate || '1990-01-01',
              birthTime: profile?.birthData?.birthTime || '12:00',
              birthLocation: profile?.birthData?.birthLocation || [0, 0],
              timezone: profile?.birthData?.timezone || 'UTC',
              date: profile?.birthData?.birthDate || '1990-01-01',
              time: profile?.birthData?.birthTime || '12:00',
              location: profile?.birthData?.birthLocation || [0, 0]
            }}
            position={[0, 0, 0]}
            scale={1}
            visible={true}
            onCalculationComplete={(result) => {
              setResult(result as BiorhythmOutput);
            }}
          />
        </div>
      </div>
    </div>
  );
}
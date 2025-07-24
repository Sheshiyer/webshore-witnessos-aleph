'use client';

import React, { useState, useEffect, useRef } from 'react';
// Simple card components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);
import type { BaseEngineInput, BaseEngineOutput } from '@/engines/core/types';

// NadaBrahman-specific types
interface NadaBrahmanInput extends BaseEngineInput {
  heartRateVariability: number;
  breathPattern: {
    rate: number;
    depth: number;
    coherence: number;
  };
  stressLevel: number;
  energyLevel: number;
  consciousnessLevel: number;
  mousePosition?: { x: number; y: number };
  trainingMode: 'awareness' | 'influence' | 'mastery';
  timeOfDay: string;
}

interface NadaBrahmanOutput extends BaseEngineOutput {
  ragaRecommendation?: string;
  harmonicAnalysis?: Record<string, unknown>;
  biometricMapping?: Record<string, unknown>;
  ragaName?: string;
  ragaFamily?: string;
  baseFrequency?: number;
  tempo?: number;
  duration?: number;
  biometricSync?: boolean;
  spatialAudio?: boolean;
  coherenceLevel?: number;
  heartCoherence?: number;
  breathCoherence?: number;
  masteryProgress?: number;
  heartRhythm?: {
    instrument?: string;
    intensity?: number;
    pattern?: number[];
  };
  breathMelody?: {
    instrument?: string;
    expression?: number;
    phrase?: string[];
  };
  currentPhase?: string;
  achievements?: string[];
  nextSteps?: string[];
  biologicalPatterns?: string[];
  consciousnessObservations?: string[];
}

interface Props {
  onCalculation: (input: NadaBrahmanInput) => Promise<NadaBrahmanOutput>;
  isCalculating: boolean;
  result: NadaBrahmanOutput | null;
}

export function NadaBrahmanEngine({ onCalculation, isCalculating, result }: Props) {
  // Biometric state
  const [heartRateVariability, setHeartRateVariability] = useState<number>(0.5);
  const [breathPattern, setBreathPattern] = useState({
    rate: 12,
    depth: 0.7,
    coherence: 0.5
  });
  const [stressLevel, setStressLevel] = useState<number>(0.5);
  const [energyLevel, setEnergyLevel] = useState<number>(0.5);
  const [consciousnessLevel, setConsciousnessLevel] = useState<number>(0.5);
  
  // Interaction state
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | undefined>();
  const interactionAreaRef = useRef<HTMLDivElement>(null);
  
  // Training state
  const [trainingMode, setTrainingMode] = useState<'awareness' | 'influence' | 'mastery'>('awareness');
  const [timeOfDay, setTimeOfDay] = useState<string>('evening');
  
  // Auto-calculate on state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleCalculate();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [heartRateVariability, breathPattern, stressLevel, energyLevel, consciousnessLevel, trainingMode, mousePosition]);

  // Handle mouse movement for spatial audio
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactionAreaRef.current) {
      const rect = interactionAreaRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }
  };

  const handleCalculate = async () => {
    if (isCalculating) return;
    
    const input: NadaBrahmanInput = {
      heartRateVariability,
      breathPattern,
      stressLevel,
      energyLevel,
      consciousnessLevel,
      ...(mousePosition && { mousePosition }),
      trainingMode,
      timeOfDay,
      userId: 'demo-user',
      sessionId: 'demo-session',
      timestamp: new Date().toISOString()
    };
    
    await onCalculation(input);
  };

  const getCurrentTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  useEffect(() => {
    setTimeOfDay(getCurrentTimeOfDay());
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-orange-900/20 to-yellow-900/20 border-orange-600/30">
        <CardHeader>
          <CardTitle className="text-2xl text-orange-300 flex items-center gap-3">
            🎵 NadaBrahman - Bio-Responsive Raga Synthesis
            <span className="text-sm text-orange-400 font-normal">
              नादब्रह्मन् - Conscious Sound Programming
            </span>
          </CardTitle>
          <p className="text-orange-200/80">
            Transform your biological signals into authentic ragas. Train to recognize your body as a living musical instrument and achieve "Hormay" (biological harmony).
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Controls */}
        <div className="space-y-4">
          {/* Training Mode */}
          <Card className="bg-gray-900/50 border-orange-600/20">
            <CardHeader>
              <CardTitle className="text-lg text-orange-300">🧘 Consciousness Training</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">Training Phase</label>
                <select
                  value={trainingMode}
                  onChange={(e) => setTrainingMode(e.target.value as 'awareness' | 'influence' | 'mastery')}
                  className="w-full bg-gray-800 border border-orange-600/30 rounded-md px-3 py-2 text-orange-100"
                >
                  <option value="awareness">Awareness - Recognize Body Rhythms</option>
                  <option value="influence">Influence - Conscious Control</option>
                  <option value="mastery">Mastery - Biological Harmony</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">Time of Day</label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                  className="w-full bg-gray-800 border border-orange-600/30 rounded-md px-3 py-2 text-orange-100"
                >
                  <option value="morning">Morning - Awakening Ragas</option>
                  <option value="afternoon">Afternoon - Active Ragas</option>
                  <option value="evening">Evening - Devotional Ragas</option>
                  <option value="night">Night - Peaceful Ragas</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Biometric Controls */}
          <Card className="bg-gray-900/50 border-orange-600/20">
            <CardHeader>
              <CardTitle className="text-lg text-orange-300">💓 Biological Orchestra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Heart Rate Variability: {Math.round(heartRateVariability * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={heartRateVariability}
                  onChange={(e) => setHeartRateVariability(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
                />
                <p className="text-xs text-orange-300/70 mt-1">
                  Heart → Tabla (Rhythm Foundation)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Breath Coherence: {Math.round(breathPattern.coherence * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={breathPattern.coherence}
                  onChange={(e) => setBreathPattern(prev => ({ ...prev, coherence: parseFloat(e.target.value) }))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
                />
                <p className="text-xs text-orange-300/70 mt-1">
                  Breath → Bansuri (Melodic Lead)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Consciousness Level: {Math.round(consciousnessLevel * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={consciousnessLevel}
                  onChange={(e) => setConsciousnessLevel(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
                />
                <p className="text-xs text-orange-300/70 mt-1">
                  Awareness → Sitar (Complex Ornaments)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Stress Level: {Math.round(stressLevel * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-orange-200 mb-2">
                  Energy Level: {Math.round(energyLevel * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-orange"
                />
              </div>
            </CardContent>
          </Card>

          {/* Interactive Sound Area */}
          <Card className="bg-gray-900/50 border-orange-600/20">
            <CardHeader>
              <CardTitle className="text-lg text-orange-300">🎼 Interactive Sound Field</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={interactionAreaRef}
                onMouseMove={handleMouseMove}
                className="w-full h-32 bg-gradient-to-br from-orange-900/20 to-yellow-900/20 border border-orange-600/30 rounded-lg cursor-crosshair relative overflow-hidden"
              >
                <div className="absolute inset-0 flex items-center justify-center text-orange-300/60 text-sm">
                  Move mouse to generate spatial raga
                </div>
                {mousePosition && (
                  <div
                    className="absolute w-4 h-4 bg-orange-400 rounded-full transform -translate-x-2 -translate-y-2 animate-pulse"
                    style={{
                      left: `${mousePosition.x}%`,
                      top: `${mousePosition.y}%`
                    }}
                  />
                )}
              </div>
              <p className="text-xs text-orange-300/70 mt-2">
                Mouse position affects frequency and spatial audio positioning
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Results */}
        <div className="space-y-4">
          {result && (
            <>
              {/* Current Raga */}
              <Card className="bg-gray-900/50 border-orange-600/20">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-300">🎵 Current Raga</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-orange-200">{result.ragaName || 'Unknown Raga'}</div>
                    <div className="text-sm text-orange-300/80">
                      Family: {result.ragaFamily || 'Unknown'} • {Math.round(result.baseFrequency || 440)}Hz • {result.tempo || 120} BPM
                    </div>
                    <div className="text-sm text-orange-300/60">
                      Duration: {(result.duration || 0).toFixed(1)}s • 
                      {result.biometricSync ? ' Biometric Sync' : ' Static'} • 
                      {result.spatialAudio ? ' Spatial Audio' : ' Mono'}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hormay State */}
              <Card className="bg-gray-900/50 border-orange-600/20">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-300">
                    🏺 Hormay State (Biological Harmony)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-200">Overall Coherence</span>
                      <span className="text-xl font-bold text-orange-300">
                        {Math.round((result.coherenceLevel || 0) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-600 to-yellow-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(result.coherenceLevel || 0) * 100}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-orange-300/80">Heart:</span>
                        <span className="text-orange-200">{Math.round((result.heartCoherence || 0) * 100)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-300/80">Breath:</span>
                        <span className="text-orange-200">{Math.round((result.breathCoherence || 0) * 100)}%</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-orange-300/80">
                      Training Progress: {Math.round((result.masteryProgress || 0) * 100)}%
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Biological Orchestra */}
              <Card className="bg-gray-900/50 border-orange-600/20">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-300">🎺 Biological Orchestra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="border-l-2 border-orange-600/50 pl-3">
                      <div className="font-medium text-orange-200">
                        {result.heartRhythm?.instrument || 'Unknown'} (Heart Rhythm)
                      </div>
                      <div className="text-sm text-orange-300/70">
                        Intensity: {Math.round((result.heartRhythm?.intensity || 0) * 100)}% • 
                        Pattern: [{(result.heartRhythm?.pattern || []).slice(0, 4).map((p: any) => p.toFixed(1)).join(', ')}...]
                      </div>
                    </div>
                    
                    <div className="border-l-2 border-orange-600/50 pl-3">
                      <div className="font-medium text-orange-200">
                        {result.breathMelody?.instrument || 'Unknown'} (Breath Melody)
                      </div>
                      <div className="text-sm text-orange-300/70">
                        Expression: {Math.round((result.breathMelody?.expression || 0) * 100)}% • 
                        Phrase: [{(result.breathMelody?.phrase || []).slice(0, 4).join(', ')}...]
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Training Feedback */}
              <Card className="bg-gray-900/50 border-orange-600/20">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-300">🎯 Training Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-orange-200 mb-1">Current Phase</div>
                      <div className="text-orange-300/80 capitalize">{result.currentPhase}</div>
                    </div>
                    
                    {(result.achievements?.length || 0) > 0 && (
                      <div>
                        <div className="text-sm font-medium text-orange-200 mb-1">Achievements</div>
                        <ul className="space-y-1">
                          {(result.achievements || []).map((achievement, i) => (
                            <li key={i} className="text-sm text-green-400 flex items-center gap-2">
                              ✓ {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-sm font-medium text-orange-200 mb-1">Next Steps</div>
                      <ul className="space-y-1">
                        {(result.nextSteps || []).slice(0, 3).map((step, i) => (
                          <li key={i} className="text-sm text-orange-300/80 flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Insights */}
              {((result.biologicalPatterns?.length || 0) > 0 || (result.consciousnessObservations?.length || 0) > 0) && (
                <Card className="bg-gray-900/50 border-orange-600/20">
                  <CardHeader>
                    <CardTitle className="text-lg text-orange-300">🔍 Consciousness Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      {(result.biologicalPatterns || []).map((pattern, i) => (
                        <div key={i} className="text-orange-300/80">• {pattern}</div>
                      ))}
                      {(result.consciousnessObservations || []).map((observation, i) => (
                        <div key={i} className="text-orange-300/80">• {observation}</div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {isCalculating && (
            <Card className="bg-gray-900/50 border-orange-600/20">
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-orange-300 animate-pulse">
                  🎵 Generating biological raga synthesis...
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style jsx>{`
        .slider-orange::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          box-shadow: 0 0 6px rgba(249, 115, 22, 0.5);
        }
        .slider-orange::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #f97316;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 6px rgba(249, 115, 22, 0.5);
        }
      `}</style>
    </div>
  );
}
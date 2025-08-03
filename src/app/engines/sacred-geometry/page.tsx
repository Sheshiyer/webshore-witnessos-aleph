/**
 * Sacred Geometry Engine - Individual Page
 * 
 * Dedicated interface for the Sacred Geometry Mapper consciousness engine
 * Provides interactive fractal pattern exploration with infinite zoom capabilities
 */

'use client';

import { SacredGeometryEngine } from '@/components/consciousness-engines';
import { useAuth } from '@/contexts/AuthContext';
import { useConsciousnessProfile } from '@/hooks/useConsciousnessProfile';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface SacredGeometryResult {
  patterns: {
    name: string;
    geometry: string;
    frequency: number;
    significance: string;
  }[];
  resonance_score: number;
  consciousness_layer: number;
  fractal_depth: number;
  sacred_ratios: {
    golden_ratio: number;
    phi_spiral: number;
    fibonacci_sequence: number[];
  };
}

export default function SacredGeometryPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { profile } = useConsciousnessProfile();
  const { calculateSacredGeometry } = useWitnessOSAPI();
  const router = useRouter();
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<SacredGeometryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fractalDepth, setFractalDepth] = useState(3);
  const [selectedPattern, setSelectedPattern] = useState<string>('flower_of_life');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleCalculation = async () => {
    if (!profile) {
      setError('Consciousness profile not available');
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

      const response = await calculateSacredGeometry({
        personalData,
        pattern_type: selectedPattern,
        fractal_depth: fractalDepth,
        include_ratios: true,
      });

      if (response.success) {
        setResult(response.data);
      } else {
        setError(response.error || 'Calculation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleEngineCalculation = (engineResult: any) => {
    console.log('Sacred Geometry Engine calculation:', engineResult);
    if (engineResult) {
      setResult(engineResult);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading consciousness interface...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-purple-950 to-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Return to Portal</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">
              Sacred Geometry Mapper
            </h1>
            <p className="text-white/70">
              Interactive fractal pattern exploration with infinite zoom
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-white/60">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Layer 1 • Awakening</span>
          </div>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="absolute top-24 left-6 z-10 bg-black/80 backdrop-blur-sm p-6 rounded-lg text-white max-w-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Pattern Configuration
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sacred Pattern</label>
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="w-full bg-gray-800 text-white p-2 rounded border border-gray-600 focus:border-purple-500"
            >
              <option value="flower_of_life">Flower of Life</option>
              <option value="metatrons_cube">Metatron's Cube</option>
              <option value="sri_yantra">Sri Yantra</option>
              <option value="golden_spiral">Golden Spiral</option>
              <option value="platonic_solids">Platonic Solids</option>
              <option value="mandala">Sacred Mandala</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Fractal Depth: {fractalDepth}
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={fractalDepth}
              onChange={(e) => setFractalDepth(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <button
            onClick={handleCalculation}
            disabled={isCalculating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {isCalculating ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mapping Geometry...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Sacred Patterns
              </div>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results Panel */}
      {result && (
        <div className="absolute top-24 right-6 z-10 bg-black/80 backdrop-blur-sm p-6 rounded-lg text-white max-w-sm max-h-96 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Sacred Geometry Analysis</h3>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-purple-300 mb-2">Resonance Score</h4>
              <div className="text-2xl font-bold">{result.resonance_score}%</div>
            </div>
            
            <div>
              <h4 className="font-medium text-purple-300 mb-2">Consciousness Layer</h4>
              <div className="text-lg">{result.consciousness_layer}</div>
            </div>
            
            <div>
              <h4 className="font-medium text-purple-300 mb-2">Sacred Ratios</h4>
              <div className="text-sm space-y-1">
                <div>Golden Ratio: {result.sacred_ratios?.golden_ratio?.toFixed(6)}</div>
                <div>Phi Spiral: {result.sacred_ratios?.phi_spiral?.toFixed(6)}</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-purple-300 mb-2">Detected Patterns</h4>
              <div className="space-y-2">
                {result.patterns?.map((pattern, index) => (
                  <div key={index} className="bg-gray-800/50 p-2 rounded text-sm">
                    <div className="font-medium">{pattern.name}</div>
                    <div className="text-gray-300 text-xs">{pattern.significance}</div>
                    <div className="text-purple-300 text-xs">{pattern.frequency}Hz</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3D Sacred Geometry Engine */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        className="w-full h-full"
      >
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.8}
          rotateSpeed={0.4}
        />
        
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#9333ea" />
        
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        
        <Suspense fallback={null}>
          <SacredGeometryEngine
            personalData={{
              fullName: profile?.personalData?.name || user?.email || 'Anonymous',
              name: profile?.personalData?.name || user?.email || 'Anonymous',
              birthDate: profile?.birthData?.birthDate || '1990-01-01',
            }}
            position={[0, 0, 0]}
            scale={1}
            visible={true}
            onCalculationComplete={handleEngineCalculation}
          />
        </Suspense>
      </Canvas>
      
      {/* Footer Info */}
      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-sm p-4 rounded-lg text-white max-w-md">
        <div className="text-sm space-y-1">
          <div className="font-medium">Sacred Geometry • 528Hz • Geometry Element</div>
          <div className="text-gray-300">
            Explore the fundamental patterns that underlie all creation through interactive fractal geometries.
          </div>
        </div>
      </div>
    </div>
  );
}
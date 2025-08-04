/**
 * Numerology Engine Component
 *
 * Integrates Python numerology calculations with fractal visualization
 * Displays sacred number patterns with breath synchronization
 */

'use client';

import { SacredFractal } from '@/generators/fractal-noise/minimal-fractals';
import { useConsciousness } from '@/hooks/useConsciousness';
import { useConsciousnessEngineAutoSave } from '@/hooks/useConsciousnessEngineAutoSave';
import { useWitnessOSAPI } from '@/hooks/useWitnessOSAPI';
import type { BreathState, ConsciousnessState, NumerologyInput, NumerologyOutput } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { AutoSaveStatusIndicator } from '@/components/ui/AutoSaveStatusIndicator';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import React, { useEffect, useMemo, useState } from 'react';

const { SACRED_MATHEMATICS, ARCHETYPAL_COLORS } = CONSCIOUSNESS_CONSTANTS;

interface NumerologyEngineProps {
  fullName: string;
  birthDate: string;
  onResultChange?: (result: NumerologyOutput | null) => void;
  interactive?: boolean;
  size?: number;
}

interface NumerologyVisualizationProps {
  result: NumerologyOutput;
  consciousness: ConsciousnessState;
  breathState: BreathState;
  size: number;
}

// Sacred number visualization component
const NumerologyVisualization: React.FC<NumerologyVisualizationProps> = ({
  result,
  consciousness,
  breathState,
  size,
}) => {
  // Generate sacred spiral based on life path number
  const lifePathSpiral = useMemo(() => {
    const points = result.lifePath * 8; // More points for higher numbers
    return SacredFractal.goldenSpiral(points, size * 0.3, consciousness.awarenessLevel);
  }, [result.lifePath, size, consciousness.awarenessLevel]);

  // Generate expression number mandala
  const expressionMandala = useMemo(() => {
    const layers = Math.min(result.expression, 9);
    return SacredFractal.consciousnessMandala(size * 0.5, layers, consciousness, breathState);
  }, [result.expression, size, consciousness, breathState]);

  // Color based on numerology system and consciousness
  const numerologyColor = useMemo(() => {
    const hue = (result.lifePath * SACRED_MATHEMATICS.PHI) % 1.0;
    const saturation = 0.7 + consciousness.awarenessLevel * 0.3;
    const lightness = 0.5 + breathState.coherence * 0.3;

    return [
      Math.sin(hue * SACRED_MATHEMATICS.TAU) * 0.5 + 0.5,
      Math.sin((hue + 0.33) * SACRED_MATHEMATICS.TAU) * 0.5 + 0.5,
      Math.sin((hue + 0.66) * SACRED_MATHEMATICS.TAU) * 0.5 + 0.5,
    ] as [number, number, number];
  }, [result.lifePath, consciousness.awarenessLevel, breathState.coherence]);

  return (
    <group>
      {/* Life Path Spiral */}
      <group>
        {lifePathSpiral.map(([x, y], index) => (
          <mesh key={`spiral-${index}`} position={[x, y, 0]}>
            <sphereGeometry args={[0.05 + (index / lifePathSpiral.length) * 0.1]} />
            <meshStandardMaterial
              color={numerologyColor}
              emissive={numerologyColor}
              emissiveIntensity={0.2 + breathState.intensity * 0.3}
              transparent
              opacity={0.7 + consciousness.awarenessLevel * 0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Expression Mandala */}
      <group rotation={[0, 0, breathState.intensity * Math.PI * 0.1]}>
        {expressionMandala.map(({ x, y, intensity, layer }, index) => (
          <mesh key={`mandala-${index}`} position={[x, y, layer * 0.1]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial
              color={numerologyColor}
              emissive={numerologyColor}
              emissiveIntensity={intensity * breathState.coherence}
              transparent
              opacity={intensity}
            />
          </mesh>
        ))}
      </group>

      {/* Core Numbers Display */}
      <group position={[0, 0, 1]}>
        {/* Life Path Number */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.1]} />
          <meshStandardMaterial color={numerologyColor} emissive={numerologyColor} emissiveIntensity={0.5} />
        </mesh>

        {/* Expression Number */}
        <mesh position={[0.6, 0, 0]}>
          <octahedronGeometry args={[0.15]} />
          <meshStandardMaterial color={numerologyColor} emissive={numerologyColor} emissiveIntensity={0.3} />
        </mesh>

        {/* Soul Urge Number */}
        <mesh position={[-0.6, 0, 0]}>
          <tetrahedronGeometry args={[0.15]} />
          <meshStandardMaterial color={numerologyColor} emissive={numerologyColor} emissiveIntensity={0.3} />
        </mesh>
      </group>

      {/* Ambient lighting based on consciousness */}
      <ambientLight intensity={0.3 + consciousness.awarenessLevel * 0.4} color={numerologyColor} />

      {/* Point lights for sacred geometry */}
      <pointLight
        position={[2, 2, 2]}
        intensity={0.5 + breathState.coherence * 0.5}
        color={numerologyColor}
        distance={size * 2}
      />
    </group>
  );
};

export const NumerologyEngine: React.FC<NumerologyEngineProps> = ({
  fullName,
  birthDate,
  onResultChange,
  interactive = true,
  size = 5,
}) => {
  const [result, setResult] = useState<NumerologyOutput | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Auto-save hook for consciousness readings
  const { saveEngineResult, isAutoSaving, autoSaveCount } = useConsciousnessEngineAutoSave();

  // Hooks
  const { calculateNumerology, state: apiState } = useWitnessOSAPI({
    onSuccess: data => {
      console.log('🔍 Raw Numerology Response:', data);
      console.log('🔍 Response Keys:', Object.keys(data || {}));
      const numerologyResult = data as NumerologyOutput;
      setResult(numerologyResult);
      
      // Auto-save the reading
      saveEngineResult(
        'numerology',
        numerologyResult,
        { fullName, birthDate },
        {
          system: 'pythagorean',
          currentYear: new Date().getFullYear(),
          consciousnessLevel: consciousness.awarenessLevel,
        }
      );
      
      if (onResultChange) {
        onResultChange(numerologyResult);
      }
    },
    onError: error => {
      console.error('Numerology calculation error:', error);
      setResult(null);
      if (onResultChange) {
        onResultChange(null);
      }
    },
  });

  const { consciousness, breathState, evolveConsciousness } = useConsciousness({
    consciousnessEvolution: true,
    discoveryTracking: true,
  });

  // Calculate numerology when inputs change
  useEffect(() => {
    if (fullName && birthDate && !isCalculating) {
      setIsCalculating(true);

      const input: NumerologyInput = {
        fullName,
        name: fullName, // Backward compatibility alias
        birthDate,
        system: 'pythagorean',
        currentYear: new Date().getFullYear(),
        userId: 'webshore-user',
        sessionId: `numerology-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      calculateNumerology(input)
        .then(() => {
          // Evolve consciousness through calculation
          evolveConsciousness(0.02);
        })
        .catch(error => {
          console.error('Failed to calculate numerology:', error);
        })
        .finally(() => {
          setIsCalculating(false);
        });
    }
  }, [fullName, birthDate, calculateNumerology, evolveConsciousness, isCalculating]);

  // Loading state
  if (isCalculating || apiState.loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4'></div>
          <p className='text-purple-300'>Calculating sacred numbers...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (apiState.error) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center text-red-400'>
          <p className='mb-2'>Calculation Error</p>
          <p className='text-sm opacity-75'>{apiState.error.message}</p>
          {apiState.error.suggestions && (
            <ul className='text-xs mt-2 opacity-60'>
              {apiState.error.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // No result state
  if (!result) {
    return (
      <div className='flex items-center justify-center h-64'>
        <p className='text-purple-300'>Enter your name and birth date to begin...</p>
      </div>
    );
  }

  return (
    <div className='w-full h-full relative'>
      {/* Auto-save status indicator */}
      <AutoSaveStatusIndicator position="top-right" showWhenIdle={true} />
      
      {/* 3D Visualization */}
      <div className='h-96 w-full'>
        <Canvas camera={{ position: [0, 0, size * 1.5], fov: 60 }}>
          <NumerologyVisualization
            result={result}
            consciousness={consciousness}
            breathState={breathState}
            size={size}
          />
          {interactive && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />}
        </Canvas>
      </div>

      {/* Results Display */}
      <div className='mt-4 p-4 bg-black/20 rounded-lg'>
        <h3 className='text-lg font-semibold text-purple-300 mb-3'>Sacred Numbers</h3>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
          <div>
            <span className='text-purple-400'>Life Path:</span>
            <span className='ml-2 text-white font-bold'>{result.lifePath}</span>
          </div>
          <div>
            <span className='text-purple-400'>Expression:</span>
            <span className='ml-2 text-white font-bold'>{result.expression}</span>
          </div>
          <div>
            <span className='text-purple-400'>Soul Urge:</span>
            <span className='ml-2 text-white font-bold'>{result.soulUrge}</span>
          </div>
          <div>
            <span className='text-purple-400'>Personality:</span>
            <span className='ml-2 text-white font-bold'>{result.personality}</span>
          </div>
        </div>

        {result.lifePurpose && (
          <div className='mt-3 p-3 bg-purple-900/20 rounded'>
            <h4 className='text-purple-300 font-medium mb-1'>Life Purpose</h4>
            <p className='text-purple-100 text-sm'>{result.lifePurpose}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NumerologyEngine;

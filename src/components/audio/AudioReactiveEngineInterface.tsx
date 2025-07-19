/**
 * Audio-Reactive Engine Interface for WitnessOS
 * 
 * Integrates audio visualizer with consciousness engines for immersive experience
 * Uses frequency analysis to modulate engine calculations and visual feedback
 */

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { UI_COPY } from '@/utils/witnessos-ui-constants';

interface AudioReactiveEngineInterfaceProps {
  engineKey: string;
  engineData?: any;
  onEngineInteraction?: (interaction: AudioEngineInteraction) => void;
  isActive?: boolean;
}

interface AudioEngineInteraction {
  type: 'frequency_peak' | 'rhythm_sync' | 'harmonic_resonance';
  frequency: number;
  amplitude: number;
  timestamp: number;
  engineModulation: number;
}

interface AudioAnalysisData {
  frequencies: Float32Array;
  dominantFrequency: number;
  amplitude: number;
  rhythmCoherence: number;
  harmonicContent: number;
}

export default function AudioReactiveEngineInterface({
  engineKey,
  engineData,
  onEngineInteraction,
  isActive = false
}: AudioReactiveEngineInterfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  
  const [audioData, setAudioData] = useState<AudioAnalysisData | null>(null);
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);
  const [engineResonance, setEngineResonance] = useState(0);

  // Engine-specific frequency mappings
  const ENGINE_FREQUENCY_MAPS = {
    numerology: { baseFreq: 432, harmonics: [432, 528, 639] },
    human_design: { baseFreq: 528, harmonics: [396, 528, 741] },
    tarot: { baseFreq: 639, harmonics: [417, 639, 852] },
    iching: { baseFreq: 741, harmonics: [396, 741, 963] },
    biorhythm: { baseFreq: 7.83, harmonics: [7.83, 14.2, 20.8] }, // Schumann resonance
    sacred_geometry: { baseFreq: 963, harmonics: [528, 741, 963] },
    gene_keys: { baseFreq: 852, harmonics: [528, 852, 963] },
    vimshottari: { baseFreq: 417, harmonics: [396, 417, 528] },
    enneagram: { baseFreq: 285, harmonics: [174, 285, 396] },
    sigil_forge: { baseFreq: 174, harmonics: [174, 285, 396] },
  };

  // Initialize audio context and analyser
  const initializeAudio = useCallback(async () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      
      // Get microphone input for breath detection
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      setIsAudioInitialized(true);
      
      console.log('🎵 Audio-reactive engine interface initialized');
    } catch (error) {
      console.error('❌ Audio initialization failed:', error);
    }
  }, []);

  // Analyze audio frequencies and map to engine resonance
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return null;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatFrequencyData(dataArray);

    // Find dominant frequency
    let maxAmplitude = -Infinity;
    let dominantFrequency = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      if (dataArray[i] > maxAmplitude) {
        maxAmplitude = dataArray[i];
        dominantFrequency = (i * audioContextRef.current!.sampleRate) / (2 * bufferLength);
      }
    }

    // Calculate rhythm coherence (stability of dominant frequency)
    const rhythmCoherence = Math.max(0, (maxAmplitude + 100) / 100); // Normalize dB to 0-1

    // Calculate harmonic content
    const engineFreqs = ENGINE_FREQUENCY_MAPS[engineKey as keyof typeof ENGINE_FREQUENCY_MAPS];
    let harmonicContent = 0;
    
    if (engineFreqs) {
      harmonicContent = engineFreqs.harmonics.reduce((sum, freq) => {
        const binIndex = Math.round((freq * 2 * bufferLength) / audioContextRef.current!.sampleRate);
        return sum + (dataArray[binIndex] || -100);
      }, 0) / engineFreqs.harmonics.length;
      harmonicContent = Math.max(0, (harmonicContent + 100) / 100); // Normalize
    }

    return {
      frequencies: dataArray,
      dominantFrequency,
      amplitude: Math.max(0, (maxAmplitude + 100) / 100),
      rhythmCoherence,
      harmonicContent,
    };
  }, [engineKey]);

  // Calculate engine resonance based on audio analysis
  const calculateEngineResonance = useCallback((audioData: AudioAnalysisData) => {
    const engineFreqs = ENGINE_FREQUENCY_MAPS[engineKey as keyof typeof ENGINE_FREQUENCY_MAPS];
    if (!engineFreqs) return 0;

    // Check if dominant frequency matches engine's base frequency (within tolerance)
    const freqTolerance = 50; // Hz
    const baseFreqMatch = Math.abs(audioData.dominantFrequency - engineFreqs.baseFreq) < freqTolerance;
    
    // Calculate resonance score
    let resonance = 0;
    resonance += baseFreqMatch ? 0.4 : 0;
    resonance += audioData.harmonicContent * 0.3;
    resonance += audioData.rhythmCoherence * 0.2;
    resonance += audioData.amplitude * 0.1;

    return Math.min(1, resonance);
  }, [engineKey]);

  // Animation loop
  const animate = useCallback(() => {
    if (!isActive || !isAudioInitialized) return;

    const currentAudioData = analyzeAudio();
    if (currentAudioData) {
      setAudioData(currentAudioData);
      
      const resonance = calculateEngineResonance(currentAudioData);
      setEngineResonance(resonance);

      // Trigger engine interaction on significant frequency peaks
      if (resonance > 0.7 && onEngineInteraction) {
        onEngineInteraction({
          type: 'harmonic_resonance',
          frequency: currentAudioData.dominantFrequency,
          amplitude: currentAudioData.amplitude,
          timestamp: Date.now(),
          engineModulation: resonance,
        });
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isActive, isAudioInitialized, analyzeAudio, calculateEngineResonance, onEngineInteraction]);

  // Start/stop animation
  useEffect(() => {
    if (isActive && isAudioInitialized) {
      animate();
    } else if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, isAudioInitialized, animate]);

  // Initialize on mount
  useEffect(() => {
    if (isActive) {
      initializeAudio();
    }
  }, [isActive, initializeAudio]);

  return (
    <div className="audio-reactive-engine-interface relative w-full h-full">
      {/* Audio Visualization Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Engine Resonance Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/50 backdrop-blur-md rounded-lg p-3 text-white">
          <div className="text-sm font-mono mb-2">
            {UI_COPY.LUMINTH_RESONANCE}
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-200"
                style={{ width: `${engineResonance * 100}%` }}
              />
            </div>
            <span className="text-xs text-cyan-300">
              {Math.round(engineResonance * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Audio Status */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-black/50 backdrop-blur-md rounded-lg p-3 text-white">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${isAudioInitialized ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="font-mono">
              {isAudioInitialized ? UI_COPY.BREATHFIELD_SYNC : 'Audio Inactive'}
            </span>
          </div>
          {audioData && (
            <div className="text-xs text-gray-300 mt-1 font-mono">
              {Math.round(audioData.dominantFrequency)}Hz • {Math.round(audioData.amplitude * 100)}%
            </div>
          )}
        </div>
      </div>

      {/* Initialization Button */}
      {!isAudioInitialized && (
        <div className="absolute inset-0 flex items-center justify-center">
          <button
            onClick={initializeAudio}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-mono transition-colors"
          >
            {UI_COPY.ACTIVATE_LUMINTH}
          </button>
        </div>
      )}
    </div>
  );
}

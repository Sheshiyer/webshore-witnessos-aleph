/**
 * Breath Detection Component for WitnessOS Webshore
 *
 * Microphone-based breath detection with wave analysis
 * Breath calibration interface with fractal visual guides
 */

'use client';

import { createBreathWave } from '@/generators/wave-equations/consciousness-waves';
import type { BreathState } from '@/types';
import { CONSCIOUSNESS_CONSTANTS } from '@/utils/consciousness-constants';
import { useFrame } from '@react-three/fiber';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Color, Mesh, MeshBasicMaterial } from 'three';

const { BREATH_PATTERNS, SACRED_MATHEMATICS } = CONSCIOUSNESS_CONSTANTS;

interface BreathDetectionProps {
  onBreathStateChange: (breathState: BreathState) => void;
  enabled?: boolean;
  sensitivity?: number;
  calibrationMode?: boolean;
  visualFeedback?: boolean;
}

interface AudioAnalysis {
  volume: number;
  frequency: number;
  coherence: number;
  pattern: 'inhale' | 'exhale' | 'hold' | 'pause';
  confidence: number;
}

/**
 * Breath Detection Engine
 */
export const BreathDetection: React.FC<BreathDetectionProps> = ({
  onBreathStateChange,
  enabled = true,
  sensitivity = 0.5,
  calibrationMode = false,
  visualFeedback = true,
}) => {
  // Audio analysis state
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [microphone, setMicrophone] = useState<MediaStreamAudioSourceNode | null>(null);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [calibrationData, setCalibrationData] = useState<{
    baselineVolume: number;
    inhaleThreshold: number;
    exhaleThreshold: number;
  }>({ baselineVolume: 0, inhaleThreshold: 0.1, exhaleThreshold: 0.05 });

  // Breath analysis state
  const [currentAnalysis, setCurrentAnalysis] = useState<AudioAnalysis>({
    volume: 0,
    frequency: 0,
    coherence: 0,
    pattern: 'pause',
    confidence: 0,
  });

  // Visual feedback refs
  const breathRingRef = useRef<Mesh>(null);
  const coherenceRingRef = useRef<Mesh>(null);

  // Breath wave generator
  const breathWave = useRef(createBreathWave());

  // Audio data buffers
  const volumeHistory = useRef<number[]>([]);
  const frequencyData = useRef<Uint8Array>(new Uint8Array(256));
  const timeData = useRef<Uint8Array>(new Uint8Array(256));

  /**
   * Initialize microphone and audio analysis
   */
  const initializeAudio = useCallback(async () => {
    if (!enabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false,
        },
      });

      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyserNode = context.createAnalyser();

      analyserNode.fftSize = 512;
      analyserNode.smoothingTimeConstant = 0.8;

      source.connect(analyserNode);

      setAudioContext(context);
      setAnalyser(analyserNode);
      setMicrophone(source);

      // Start analysis loop
      startAnalysis(analyserNode);
    } catch (error) {
      console.error('Failed to initialize microphone:', error);
    }
  }, [enabled]);

  /**
   * Calculate breath coherence from pattern history
   */
  const calculateCoherence = (patterns: string[]): number => {
    if (patterns.length < 10) return 0;

    // Look for rhythmic patterns
    let transitions = 0;
    let validTransitions = 0;

    for (let i = 1; i < patterns.length; i++) {
      if (patterns[i] !== patterns[i - 1]) {
        transitions++;
        // Valid transitions: pause->inhale, inhale->hold, hold->exhale, exhale->pause
        const validSequences = [
          ['pause', 'inhale'],
          ['inhale', 'hold'],
          ['hold', 'exhale'],
          ['exhale', 'pause'],
        ];

        if (validSequences.some(seq => seq[0] === patterns[i - 1] && seq[1] === patterns[i])) {
          validTransitions++;
        }
      }
    }

    return transitions > 0 ? validTransitions / transitions : 0;
  };

  /**
   * Analyze breath pattern from audio data
   */
  const analyzeBreathPattern = useCallback(
    (volume: number, frequency: number): AudioAnalysis => {
      const { baselineVolume, inhaleThreshold, exhaleThreshold } = calibrationData;
      const adjustedVolume = Math.max(0, volume - baselineVolume) * sensitivity;

      // Calculate volume trend
      const recentVolumes = volumeHistory.current.slice(-10);
      const volumeTrend =
        recentVolumes.length > 1
          ? (recentVolumes[recentVolumes.length - 1] ?? 0) - (recentVolumes[0] ?? 0)
          : 0;

      // Determine breath phase
      let pattern: AudioAnalysis['pattern'] = 'pause';
      let confidence = 0;

      if (adjustedVolume > inhaleThreshold && volumeTrend > 0.01) {
        pattern = 'inhale';
        confidence = Math.min(1, adjustedVolume / inhaleThreshold);
      } else if (adjustedVolume > exhaleThreshold && volumeTrend < -0.01) {
        pattern = 'exhale';
        confidence = Math.min(1, adjustedVolume / exhaleThreshold);
      } else if (adjustedVolume > exhaleThreshold) {
        pattern = 'hold';
        confidence = Math.min(1, adjustedVolume / exhaleThreshold);
      }

      // Calculate coherence based on pattern consistency
      const patternHistory = volumeHistory.current.map(v => {
        const adj = Math.max(0, v - baselineVolume) * sensitivity;
        if (adj > inhaleThreshold) return 'inhale';
        if (adj > exhaleThreshold) return 'exhale';
        return 'pause';
      });

      const coherence = calculateCoherence(patternHistory);

      return {
        volume: adjustedVolume,
        frequency,
        coherence,
        pattern,
        confidence,
      };
    },
    [calibrationData, sensitivity]
  );

  /**
   * Convert audio analysis to breath state
   */
  const convertToBreathState = useCallback((analysis: AudioAnalysis): BreathState => {
    const pattern = BREATH_PATTERNS.COHERENT; // Default pattern

    return {
      pattern,
      phase: analysis.pattern,
      intensity: analysis.confidence,
      rhythm: 60 / pattern.totalCycle, // BPM
      coherence: analysis.coherence,
      synchronization: analysis.coherence,
      timestamp: new Date().toISOString(),
    };
  }, []);

  /**
   * Start continuous audio analysis
   */
  const startAnalysis = useCallback(
    (analyserNode: AnalyserNode) => {
      const analyze = () => {
        if (!analyserNode || !audioContext) return;

        // Get frequency and time domain data
        analyserNode.getByteFrequencyData(frequencyData.current);
        analyserNode.getByteTimeDomainData(timeData.current);

        // Calculate volume (RMS)
        let sum = 0;
        for (let i = 0; i < timeData.current.length; i++) {
          const sample = ((timeData.current[i] ?? 128) - 128) / 128;
          sum += sample * sample;
        }
        const volume = Math.sqrt(sum / timeData.current.length);

        // Calculate dominant frequency
        let maxFreqIndex = 0;
        let maxFreqValue = 0;
        for (let i = 1; i < frequencyData.current.length / 2; i++) {
          const currentValue = frequencyData.current[i] ?? 0;
          if (currentValue > maxFreqValue) {
            maxFreqValue = currentValue;
            maxFreqIndex = i;
          }
        }
        const frequency = audioContext ? (maxFreqIndex * audioContext.sampleRate) / analyserNode.fftSize : 0;

        // Update volume history for pattern detection
        volumeHistory.current.push(volume);
        if (volumeHistory.current.length > 60) {
          // Keep 1 second of history at 60fps
          volumeHistory.current.shift();
        }

        // Analyze breath pattern
        const analysis = analyzeBreathPattern(volume, frequency);
        setCurrentAnalysis(analysis);

        // Convert to breath state
        const breathState = convertToBreathState(analysis);
        onBreathStateChange(breathState);

        requestAnimationFrame(analyze);
      };

      analyze();
    },
    [audioContext, onBreathStateChange, analyzeBreathPattern, convertToBreathState]
  );

  /**
   * Calibrate breath detection thresholds
   */
  const calibrate = useCallback(async () => {
    if (!analyser) return;

    console.log('Calibrating breath detection...');

    // Collect baseline data for 3 seconds
    const samples: number[] = [];
    const startTime = Date.now();

    const collectSample = () => {
      analyser.getByteTimeDomainData(timeData.current);

      let sum = 0;
      for (let i = 0; i < timeData.current.length; i++) {
        const sample = ((timeData.current[i] ?? 128) - 128) / 128;
        sum += sample * sample;
      }
      const volume = Math.sqrt(sum / timeData.current.length);
      samples.push(volume);

      if (Date.now() - startTime < 3000) {
        requestAnimationFrame(collectSample);
      } else {
        // Calculate thresholds
        const avgVolume = samples.reduce((sum, v) => sum + v, 0) / samples.length;
        const maxVolume = Math.max(...samples);

        setCalibrationData({
          baselineVolume: avgVolume,
          inhaleThreshold: avgVolume + (maxVolume - avgVolume) * 0.3,
          exhaleThreshold: avgVolume + (maxVolume - avgVolume) * 0.15,
        });

        setIsCalibrated(true);
        console.log('Calibration complete');
      }
    };

    collectSample();
  }, [analyser]);

  // Initialize audio on mount
  useEffect(() => {
    if (enabled) {
      initializeAudio();
    }

    return () => {
      if (microphone) {
        microphone.disconnect();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [enabled, initializeAudio]);

  // Auto-calibrate after audio initialization
  useEffect(() => {
    if (analyser && !isCalibrated && calibrationMode) {
      const timer = setTimeout(calibrate, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [analyser, isCalibrated, calibrationMode, calibrate]);

  // Visual feedback animation
  useFrame(state => {
    if (!visualFeedback) return;

    const time = state.clock.getElapsedTime();

    // Breath ring animation
    if (breathRingRef.current) {
      const breathScale = 1.0 + currentAnalysis.confidence * 0.3;
      breathRingRef.current.scale.setScalar(breathScale);

      // Color based on breath phase
      const material = breathRingRef.current.material as MeshBasicMaterial;
      const phaseColors = {
        inhale: new Color(0x00ff88),
        exhale: new Color(0xff6600),
        hold: new Color(0x0088ff),
        pause: new Color(0x666666),
      };
      material.color = phaseColors[currentAnalysis.pattern];
    }

    // Coherence ring animation
    if (coherenceRingRef.current) {
      const coherenceScale = 0.8 + currentAnalysis.coherence * 0.4;
      coherenceRingRef.current.scale.setScalar(coherenceScale);
      coherenceRingRef.current.rotation.z = time * currentAnalysis.coherence;

      const material = coherenceRingRef.current.material as MeshBasicMaterial;
      material.opacity = 0.3 + currentAnalysis.coherence * 0.7;
    }
  });

  if (!visualFeedback) return null;

  return (
    <group position={[0, -3, 0]}>
      {/* Breath Detection Ring */}
      <mesh ref={breathRingRef}>
        <ringGeometry args={[1.0, 1.2, 32]} />
        <meshBasicMaterial transparent opacity={0.8} />
      </mesh>

      {/* Coherence Ring */}
      <mesh ref={coherenceRingRef}>
        <ringGeometry args={[1.3, 1.5, 32]} />
        <meshBasicMaterial color={0x9966ff} transparent opacity={0.5} wireframe />
      </mesh>

      {/* Calibration Status */}
      {calibrationMode && !isCalibrated && (
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[2, 0.5]} />
          <meshBasicMaterial color={0xffaa00} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

export default BreathDetection;

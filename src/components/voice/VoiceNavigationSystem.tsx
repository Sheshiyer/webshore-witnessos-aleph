/**
 * Voice Navigation System for WitnessOS
 * 
 * Awe-factor voice-based navigation with consciousness-aware speech recognition
 * Integrates with breath patterns and archetypal field resonance
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { UI_COPY, WITNESSOS_TERMINOLOGY } from '@/utils/witnessos-ui-constants';

interface VoiceNavigationSystemProps {
  onNavigationCommand?: (command: VoiceCommand) => void;
  onVoiceStateChange?: (state: VoiceState) => void;
  isActive?: boolean;
  engineContext?: string;
}

interface VoiceCommand {
  command: string;
  confidence: number;
  intent: VoiceIntent;
  parameters?: Record<string, any>;
  timestamp: number;
}

interface VoiceState {
  isListening: boolean;
  isProcessing: boolean;
  currentPhrase: string;
  confidence: number;
  resonanceLevel: number;
}

type VoiceIntent = 
  | 'navigate_engine'
  | 'activate_portal'
  | 'capture_biofield'
  | 'sync_breathfield'
  | 'enter_chamber'
  | 'invoke_luminth'
  | 'align_quoril'
  | 'manifest_sigil'
  | 'unknown';

export default function VoiceNavigationSystem({
  onNavigationCommand,
  onVoiceStateChange,
  isActive = false,
  engineContext
}: VoiceNavigationSystemProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isProcessing: false,
    currentPhrase: '',
    confidence: 0,
    resonanceLevel: 0,
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const resonanceTimerRef = useRef<NodeJS.Timeout>();

  // Voice command patterns with magical terminology
  const VOICE_COMMAND_PATTERNS = {
    // Engine Navigation
    'activate numerology': { intent: 'navigate_engine', params: { engine: 'numerology' } },
    'invoke human design': { intent: 'navigate_engine', params: { engine: 'human_design' } },
    'summon tarot reading': { intent: 'navigate_engine', params: { engine: 'tarot' } },
    'channel i ching wisdom': { intent: 'navigate_engine', params: { engine: 'iching' } },
    'awaken gene keys': { intent: 'navigate_engine', params: { engine: 'gene_keys' } },
    'enter sacred geometry': { intent: 'navigate_engine', params: { engine: 'sacred_geometry' } },
    'access biorhythm cycles': { intent: 'navigate_engine', params: { engine: 'biorhythm' } },
    'open vimshottari dasha': { intent: 'navigate_engine', params: { engine: 'vimshottari' } },
    'reveal enneagram type': { intent: 'navigate_engine', params: { engine: 'enneagram' } },
    'forge sacred sigil': { intent: 'navigate_engine', params: { engine: 'sigil_forge' } },

    // Portal Commands
    'open portal chamber': { intent: 'activate_portal', params: { type: 'chamber' } },
    'enter cosmic temple': { intent: 'activate_portal', params: { type: 'temple' } },
    'access submerged forest': { intent: 'activate_portal', params: { type: 'forest' } },
    'invoke sigil workshop': { intent: 'activate_portal', params: { type: 'workshop' } },

    // Biofield Commands
    'capture biofield': { intent: 'capture_biofield', params: {} },
    'scan archetypal field': { intent: 'capture_biofield', params: { type: 'archetypal' } },
    'read witness signature': { intent: 'capture_biofield', params: { type: 'signature' } },

    // Breathfield Commands
    'sync breathfield': { intent: 'sync_breathfield', params: {} },
    'align breath patterns': { intent: 'sync_breathfield', params: { mode: 'align' } },
    'harmonize breathing': { intent: 'sync_breathfield', params: { mode: 'harmonize' } },

    // Magical Invocations
    'invoke luminth': { intent: 'invoke_luminth', params: {} },
    'activate luminth resonance': { intent: 'invoke_luminth', params: { mode: 'resonance' } },
    'align quoril interface': { intent: 'align_quoril', params: {} },
    'channel quoril wisdom': { intent: 'align_quoril', params: { mode: 'wisdom' } },
    'manifest vireth protocol': { intent: 'manifest_sigil', params: { type: 'vireth' } },

    // Chamber Navigation
    'enter meditation chamber': { intent: 'enter_chamber', params: { type: 'meditation' } },
    'access transformation chamber': { intent: 'enter_chamber', params: { type: 'transformation' } },
    'open integration chamber': { intent: 'enter_chamber', params: { type: 'integration' } },
  };

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log('🎤 Voice navigation activated');
      updateVoiceState({ isListening: true });
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          processVoiceCommand(transcript, confidence);
        } else {
          interimTranscript += transcript;
        }
      }

      updateVoiceState({
        currentPhrase: finalTranscript || interimTranscript,
        confidence: event.results[event.results.length - 1][0].confidence || 0,
      });
    };

    recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      updateVoiceState({ isListening: false, isProcessing: false });
    };

    recognition.onend = () => {
      console.log('🎤 Voice navigation deactivated');
      updateVoiceState({ isListening: false });
    };

    recognitionRef.current = recognition;
  }, []);

  // Update voice state and notify parent
  const updateVoiceState = useCallback((updates: Partial<VoiceState>) => {
    setVoiceState(prev => {
      const newState = { ...prev, ...updates };
      onVoiceStateChange?.(newState);
      return newState;
    });
  }, [onVoiceStateChange]);

  // Process voice command and extract intent
  const processVoiceCommand = useCallback((transcript: string, confidence: number) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    
    updateVoiceState({ isProcessing: true });

    // Find matching command pattern
    let matchedCommand: VoiceCommand | null = null;
    
    for (const [pattern, config] of Object.entries(VOICE_COMMAND_PATTERNS)) {
      if (normalizedTranscript.includes(pattern)) {
        matchedCommand = {
          command: transcript,
          confidence,
          intent: config.intent as VoiceIntent,
          parameters: config.params,
          timestamp: Date.now(),
        };
        break;
      }
    }

    // If no exact match, try fuzzy matching for engine names
    if (!matchedCommand) {
      const engineNames = ['numerology', 'human design', 'tarot', 'i ching', 'gene keys', 
                          'sacred geometry', 'biorhythm', 'vimshottari', 'enneagram', 'sigil'];
      
      for (const engineName of engineNames) {
        if (normalizedTranscript.includes(engineName)) {
          matchedCommand = {
            command: transcript,
            confidence: confidence * 0.8, // Lower confidence for fuzzy match
            intent: 'navigate_engine',
            parameters: { engine: engineName.replace(' ', '_') },
            timestamp: Date.now(),
          };
          break;
        }
      }
    }

    // Default to unknown intent
    if (!matchedCommand) {
      matchedCommand = {
        command: transcript,
        confidence,
        intent: 'unknown',
        timestamp: Date.now(),
      };
    }

    // Calculate resonance level based on confidence and magical terminology
    const magicalTerms = ['invoke', 'summon', 'channel', 'awaken', 'manifest', 'align', 'activate'];
    const hasMagicalTerms = magicalTerms.some(term => normalizedTranscript.includes(term));
    const resonanceLevel = confidence * (hasMagicalTerms ? 1.2 : 1.0);

    updateVoiceState({ 
      isProcessing: false, 
      resonanceLevel: Math.min(1, resonanceLevel) 
    });

    // Trigger resonance visualization
    if (resonanceLevel > 0.7) {
      triggerResonanceEffect();
    }

    console.log('🗣️ Voice command processed:', matchedCommand);
    onNavigationCommand?.(matchedCommand);
  }, [onNavigationCommand]);

  // Trigger visual resonance effect
  const triggerResonanceEffect = useCallback(() => {
    // Clear existing timer
    if (resonanceTimerRef.current) {
      clearTimeout(resonanceTimerRef.current);
    }

    // Emit custom event for visual effects
    window.dispatchEvent(new CustomEvent('voice:resonance', {
      detail: { level: voiceState.resonanceLevel }
    }));

    // Reset resonance after effect
    resonanceTimerRef.current = setTimeout(() => {
      updateVoiceState({ resonanceLevel: 0 });
    }, 2000);
  }, [voiceState.resonanceLevel, updateVoiceState]);

  // Start/stop voice recognition
  const toggleVoiceRecognition = useCallback(() => {
    if (!recognitionRef.current) return;

    if (voiceState.isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  }, [voiceState.isListening]);

  // Initialize on mount
  useEffect(() => {
    initializeSpeechRecognition();
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (resonanceTimerRef.current) {
        clearTimeout(resonanceTimerRef.current);
      }
    };
  }, [initializeSpeechRecognition]);

  // Auto-start when active
  useEffect(() => {
    if (isActive && recognitionRef.current && !voiceState.isListening) {
      recognitionRef.current.start();
    } else if (!isActive && recognitionRef.current && voiceState.isListening) {
      recognitionRef.current.stop();
    }
  }, [isActive, voiceState.isListening]);

  return (
    <div className="voice-navigation-system">
      {/* Voice Status Indicator */}
      <div className="fixed top-4 left-4 z-50">
        <div className={`
          bg-black/50 backdrop-blur-md rounded-lg p-3 text-white transition-all duration-300
          ${voiceState.isListening ? 'border border-green-400/50 shadow-green-400/20 shadow-lg' : 'border border-gray-600/50'}
        `}>
          <div className="flex items-center space-x-3">
            {/* Microphone Icon */}
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center transition-colors
              ${voiceState.isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}
            `}>
              🎤
            </div>
            
            {/* Status Text */}
            <div>
              <div className="text-sm font-mono">
                {voiceState.isListening ? UI_COPY.QUORIL_INTERFACE : 'Voice Inactive'}
              </div>
              {voiceState.currentPhrase && (
                <div className="text-xs text-cyan-300 mt-1">
                  "{voiceState.currentPhrase}"
                </div>
              )}
            </div>
          </div>

          {/* Confidence & Resonance Meters */}
          {voiceState.isListening && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-16">Confidence:</span>
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 transition-all duration-200"
                    style={{ width: `${voiceState.confidence * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{Math.round(voiceState.confidence * 100)}%</span>
              </div>
              
              <div className="flex items-center space-x-2 text-xs">
                <span className="w-16">Resonance:</span>
                <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 transition-all duration-200"
                    style={{ width: `${voiceState.resonanceLevel * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right">{Math.round(voiceState.resonanceLevel * 100)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Activation Button */}
      <button
        onClick={toggleVoiceRecognition}
        className={`
          fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full transition-all duration-300
          ${voiceState.isListening 
            ? 'bg-green-500 hover:bg-green-400 shadow-green-400/50 shadow-lg animate-pulse' 
            : 'bg-purple-600 hover:bg-purple-500 shadow-purple-400/50 shadow-lg'
          }
          text-white text-2xl flex items-center justify-center
        `}
        title={voiceState.isListening ? 'Deactivate Voice Navigation' : 'Activate Voice Navigation'}
      >
        {voiceState.isListening ? '🔊' : '🎤'}
      </button>
    </div>
  );
}

/**
 * NadaBrahman Engine - Bio-Responsive Raga Synthesis
 * 
 * Transforms biological signals into authentic ragas, training users to recognize
 * their body as a living musical instrument and achieve "Hormay" (biological harmony).
 * 
 * नादब्रह्मन् - Conscious Sound Programming for Biological Raga Mastery
 */

import { BaseEngine } from './core/base-engine';
import type { CalculationResult, BaseEngineInput, BaseEngineOutput } from './core/types';
import { isEngineInput } from './core/types';

export interface NadaBrahmanInput extends BaseEngineInput {
  // Biometric data
  heartRateVariability?: number;
  breathPattern?: {
    rate: number;
    depth: number;
    coherence: number;
  };
  stressLevel?: number;
  energyLevel?: number;
  
  // Interaction data
  mousePosition?: { x: number; y: number };
  velocity?: number;
  
  // Consciousness context
  consciousnessLevel?: number;
  humanDesignType?: string;
  timeOfDay?: string;
  
  // Training preferences
  trainingMode?: 'awareness' | 'influence' | 'mastery';
  ragaFamily?: 'morning' | 'afternoon' | 'evening' | 'night' | 'auto';
}

export interface NadaBrahmanOutput extends BaseEngineOutput {
  // Core raga information
  ragaName: string;
  ragaFamily: string;
  baseFrequency: number;
  tempo: number;
  duration: number;
  
  // Biological orchestra mapping
  heartRhythm: {
    instrument: string;
    pattern: number[];
    intensity: number;
  };
  breathMelody: {
    instrument: string;
    phrase: number[];
    expression: number;
  };
  
  // Hormay (biological harmony) state
  coherenceLevel: number;
  heartCoherence: number;
  breathCoherence: number;
  masteryProgress: number;
  
  // Training feedback
  currentPhase: 'awareness' | 'influence' | 'mastery';
  achievements: string[];
  nextSteps: string[];
  
  // Audio instructions
  synthesisType: 'real-time' | 'cached' | 'hybrid';
  spatialAudio: boolean;
  biometricSync: boolean;
  
  // Consciousness insights
  biologicalPatterns: string[];
  consciousnessObservations: string[];
  harmonyRecommendations: string[];
}

export class NadaBrahmanEngine extends BaseEngine<NadaBrahmanInput, NadaBrahmanOutput> {
  private readonly ragaFamilies = {
    morning: ['Bhairav', 'Ahir Bhairav', 'Ramkali', 'Jogiya', 'Todi'],
    afternoon: ['Sarang', 'Multani', 'Madhyamad Sarang', 'Brindavani Sarang'],
    evening: ['Yaman', 'Puriya', 'Puriya Dhanashri', 'Marwa', 'Sohini'],
    night: ['Malkauns', 'Bageshri', 'Bhimpalasi', 'Darbari', 'Adana']
  };

  constructor(config = {}) {
    super('nadabrahman', 'Bio-responsive raga synthesis and consciousness training', config);
  }

  protected validateInput(input: NadaBrahmanInput): boolean {
    return isEngineInput<NadaBrahmanInput>(input, ['userId']);
  }

  protected async performCalculation(input: NadaBrahmanInput): Promise<Record<string, unknown>> {
    const timeOfDay = input.timeOfDay || this._getCurrentTimeOfDay();
    const stressLevel = input.stressLevel || 0.5;
    const consciousnessLevel = input.consciousnessLevel || 0.5;
    
    // Select appropriate raga
    const ragaName = this._selectRaga(stressLevel, timeOfDay);
    
    // Calculate bio-responsive parameters
    const heartRhythm = this._generateHeartRhythm(input.heartRateVariability);
    const breathMelody = this._generateBreathMelody(input.breathPattern);
    const coherenceLevel = this._calculateCoherence(input);
    
    // Generate audio parameters
    const baseFrequency = this._calculateBaseFrequency(input);
    const tempo = 60 + (input.energyLevel || 0.5) * 60;
    const duration = 3.0 + consciousnessLevel * 7.0;
    
    return {
      ragaName,
      ragaFamily: this._getRagaFamily(ragaName),
      baseFrequency,
      tempo,
      duration,
      heartRhythm,
      breathMelody,
      coherenceLevel,
      consciousnessLevel,
      stressLevel,
      timeOfDay
    };
  }

  protected generateInterpretation(results: Record<string, unknown>, input: NadaBrahmanInput): string {
    const ragaName = results.ragaName as string;
    const coherenceLevel = results.coherenceLevel as number;
    const consciousnessLevel = results.consciousnessLevel as number;
    
    return `🎵 NADABRAHMAN - Biological Raga Synthesis 🎵

═══ YOUR BODY AS MUSICAL INSTRUMENT ═══

Current Raga: ${ragaName}
Selected for ${input.timeOfDay || 'current'} energy and stress level ${Math.round((input.stressLevel || 0.5) * 100)}%

═══ BIOLOGICAL ORCHESTRA ═══

Heart Rhythm → Tabla: Your heart rate variability creates the rhythmic foundation
Breath Pattern → Bansuri: Your breath cycle generates the melodic phrases
Consciousness Level → Sitar: Your awareness adds musical ornaments and complexity

═══ HORMAY STATE (Biological Harmony) ═══

Current Coherence: ${Math.round(coherenceLevel * 100)}%
${coherenceLevel > 0.7 ? 'EXCELLENT - Your biological systems are in harmony!' : 
  coherenceLevel > 0.5 ? 'GOOD - Biological coherence detected, keep practicing' : 
  'DEVELOPING - Focus on breath awareness to improve harmony'}

═══ CONSCIOUSNESS TRAINING ═══

Training Phase: ${input.trainingMode || 'awareness'}
${consciousnessLevel > 0.7 ? 'Advanced consciousness detected - complex ornaments available' :
  consciousnessLevel > 0.4 ? 'Growing awareness - moderate complexity' :
  'Beginning awareness - simple patterns for clarity'}

═══ RAGA WISDOM ═══

${this._getRagaWisdom(ragaName)}

Remember: Your body is already a perfect musical instrument. NadaBrahman helps you recognize and conduct your own biological symphony.`;
  }

  protected generateRecommendations(results: Record<string, unknown>, input: NadaBrahmanInput): string[] {
    const recommendations = [];
    const coherenceLevel = results.coherenceLevel as number;
    const currentPhase = input.trainingMode || 'awareness';
    
    // Phase-specific recommendations
    if (currentPhase === 'awareness') {
      recommendations.push('Place hand on chest and feel your heartbeat rhythm');
      recommendations.push('Notice how your breath naturally creates musical phrases');
      recommendations.push('Listen to the raga and identify which sounds match your internal rhythms');
    } else if (currentPhase === 'influence') {
      recommendations.push('Try slowing your breath to change the melodic phrases');
      recommendations.push('Practice heart rate variability breathing to affect rhythm');
      recommendations.push('Experiment with different postures to change the sound quality');
    } else {
      recommendations.push('Sustain biological coherence for extended periods');
      recommendations.push('Practice conducting your full biological orchestra');
      recommendations.push('Explore collaborative biological symphonies with others');
    }
    
    // Coherence-based recommendations
    if (coherenceLevel < 0.4) {
      recommendations.push('Focus on 4-7-8 breath pattern to improve coherence');
      recommendations.push('Spend time in nature to harmonize with natural rhythms');
    } else if (coherenceLevel > 0.7) {
      recommendations.push('Maintain this beautiful state of biological harmony');
      recommendations.push('Share your coherent state with others nearby');
    }
    
    return recommendations;
  }

  protected generateRealityPatches(results: Record<string, unknown>, input: NadaBrahmanInput): string[] {
    const patches = [];
    const ragaName = results.ragaName as string;
    const coherenceLevel = results.coherenceLevel as number;
    
    patches.push(`Install biological awareness protocol: recognize body as musical instrument`);
    patches.push(`Activate raga ${ragaName} consciousness frequency`);
    
    if (coherenceLevel > 0.6) {
      patches.push(`Upgrade to Hormay (biological harmony) operating system`);
      patches.push(`Enable consciousness-responsive sound environment`);
    }
    
    if (input.heartRateVariability && input.heartRateVariability > 0.6) {
      patches.push(`Integrate heart rhythm as primary timing source`);
    }
    
    if (input.breathPattern && input.breathPattern.coherence > 0.6) {
      patches.push(`Synchronize breath cycle with universal life force`);
    }
    
    return patches;
  }

  protected identifyArchetypalThemes(results: Record<string, unknown>, input: NadaBrahmanInput): string[] {
    const themes = [];
    const ragaName = results.ragaName as string;
    const coherenceLevel = results.coherenceLevel as number;
    
    themes.push('The Conscious Musician - body as living instrument');
    themes.push('The Biological Conductor - mastery over internal rhythms');
    themes.push(`The ${ragaName} Consciousness - specific raga archetypal frequency`);
    
    if (coherenceLevel > 0.7) {
      themes.push('The Hormay Master - biological harmony achievement');
      themes.push('The Sound Healer - coherent vibrations affecting environment');
    }
    
    if (input.trainingMode === 'mastery') {
      themes.push('The Technology Transcendent - needing no external devices');
      themes.push('The Living Raga - human as pure musical expression');
    }
    
    return themes;
  }

  protected calculateConfidence(results: Record<string, unknown>, input: NadaBrahmanInput): number {
    let confidence = 0.6; // Base confidence
    
    if (input.heartRateVariability) confidence += 0.15;
    if (input.breathPattern) confidence += 0.15;
    if (input.consciousnessLevel) confidence += 0.1;
    if (input.mousePosition) confidence += 0.05;
    
    return Math.min(1.0, confidence);
  }

  // Helper methods
  private _getCurrentTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  private _selectRaga(stressLevel: number, timeOfDay: string): string {
    if (stressLevel > 0.7) {
      // High stress - calming ragas
      return ['Malkauns', 'Bageshri', 'Darbari'][Math.floor(Math.random() * 3)];
    }
    
    const familyKey = timeOfDay as keyof typeof this.ragaFamilies;
    const family = this.ragaFamilies[familyKey] || this.ragaFamilies.evening;
    return family[Math.floor(Math.random() * family.length)];
  }

  private _getRagaFamily(ragaName: string): string {
    for (const [family, ragas] of Object.entries(this.ragaFamilies)) {
      if (ragas.includes(ragaName)) return family;
    }
    return 'evening'; // default
  }

  private _generateHeartRhythm(hrv?: number) {
    const basePattern = [1, 0, 0.5, 0, 1, 0, 0.7, 0];
    const pattern = hrv ? basePattern.map(beat => beat * (0.5 + hrv * 0.5)) : basePattern;
    
    return {
      instrument: 'tabla',
      pattern,
      intensity: Math.min(1, (hrv || 0.5) * 2)
    };
  }

  private _generateBreathMelody(breathPattern?: { rate: number; depth: number; coherence: number }) {
    const defaultPhrase = [0, 2, 4, 7, 9, 7, 4, 2];
    let phrase = defaultPhrase;
    
    if (breathPattern) {
      const scaleNotes = [0, 2, 4, 5, 7, 9, 11];
      const phraseLength = Math.max(4, Math.min(12, Math.round(breathPattern.rate / 2)));
      phrase = Array.from({ length: phraseLength }, (_, i) => {
        const breathPos = i / phraseLength;
        const noteIndex = Math.floor(breathPos * scaleNotes.length * breathPattern.depth);
        return scaleNotes[noteIndex % scaleNotes.length];
      });
    }
    
    return {
      instrument: 'bansuri',
      phrase,
      expression: breathPattern?.coherence || 0.5
    };
  }

  private _calculateCoherence(input: NadaBrahmanInput): number {
    const heartCoherence = input.heartRateVariability || 0.5;
    const breathCoherence = input.breathPattern?.coherence || 0.5;
    const consciousnessCoherence = input.consciousnessLevel || 0.5;
    const stressCoherence = 1 - (input.stressLevel || 0.5);
    
    return (heartCoherence + breathCoherence + consciousnessCoherence + stressCoherence) / 4;
  }

  private _calculateBaseFrequency(input: NadaBrahmanInput): number {
    let baseFreq = 220; // A3
    
    if (input.mousePosition) {
      baseFreq = 220 + (input.mousePosition.y / 100) * 220;
    }
    
    if (input.heartRateVariability) {
      baseFreq *= (0.8 + input.heartRateVariability * 0.4);
    }
    
    return baseFreq;
  }

  private _getRagaWisdom(ragaName: string): string {
    const wisdom: Record<string, string> = {
      'Bhairav': 'The Dawn Consciousness - awakening the divine within',
      'Yaman': 'The Evening Devotion - surrendering to cosmic harmony',
      'Malkauns': 'The Deep Peace - profound inner stillness',
      'Bageshri': 'The Night Embrace - gentle surrender to rest',
      'Sarang': 'The Midday Clarity - focused awareness and action'
    };
    
    return wisdom[ragaName] || 'Ancient wisdom flowing through sound vibration';
  }

  // Override calculate method to build complete output
  async calculate(input: NadaBrahmanInput): Promise<CalculationResult<NadaBrahmanOutput>> {
    const startTime = Date.now();
    
    try {
      if (!this.validateInput(input)) {
        return {
          success: false,
          error: this.createError('INVALID_INPUT', 'Invalid NadaBrahman input data'),
          processingTime: Date.now() - startTime,
          timestamp: new Date().toISOString()
        };
      }
      
      const calculationResults = await this.performCalculation(input);
      const interpretation = this.generateInterpretation(calculationResults, input);
      const recommendations = this.generateRecommendations(calculationResults, input);
      const realityPatches = this.generateRealityPatches(calculationResults, input);
      const archetypalThemes = this.identifyArchetypalThemes(calculationResults, input);
      const confidenceScore = this.calculateConfidence(calculationResults, input);
      
      const heartRhythm = calculationResults.heartRhythm as { instrument: string; pattern: number[]; intensity: number };
      const breathMelody = calculationResults.breathMelody as { instrument: string; phrase: number[]; expression: number };
      const coherenceLevel = calculationResults.coherenceLevel as number;
      
      const output: NadaBrahmanOutput = {
        engineName: this.engineName,
        calculationTime: Date.now() - startTime,
        confidenceScore,
        formattedOutput: interpretation,
        recommendations,
        realityPatches,
        archetypalThemes,
        timestamp: new Date().toISOString(),
        
        // NadaBrahman specific fields
        ragaName: calculationResults.ragaName as string,
        ragaFamily: calculationResults.ragaFamily as string,
        baseFrequency: calculationResults.baseFrequency as number,
        tempo: calculationResults.tempo as number,
        duration: calculationResults.duration as number,
        
        heartRhythm,
        breathMelody,
        
        coherenceLevel,
        heartCoherence: input.heartRateVariability || 0.5,
        breathCoherence: input.breathPattern?.coherence || 0.5,
        masteryProgress: coherenceLevel,
        
        currentPhase: input.trainingMode || 'awareness',
        achievements: coherenceLevel > 0.6 ? ['Biological coherence achieved'] : [],
        nextSteps: recommendations,
        
        synthesisType: input.heartRateVariability ? 'real-time' : 'cached',
        spatialAudio: !!input.mousePosition,
        biometricSync: !!(input.heartRateVariability || input.breathPattern),
        
        biologicalPatterns: input.heartRateVariability ? 
          [`Heart rate variability: ${Math.round((input.heartRateVariability) * 100)}%`] : [],
        consciousnessObservations: input.consciousnessLevel ? 
          [`Consciousness level: ${Math.round((input.consciousnessLevel) * 100)}%`] : [],
        harmonyRecommendations: coherenceLevel < 0.5 ? 
          ['Practice breath awareness', 'Focus on heart rate variability'] : 
          ['Maintain current coherence', 'Explore advanced techniques']
      };
      
      return {
        success: true,
        data: output,
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      this.log('error', 'NadaBrahman calculation failed', error);
      return {
        success: false,
        error: this.createError('CALCULATION_ERROR', `NadaBrahman calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`),
        processingTime: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
    }
  }
}

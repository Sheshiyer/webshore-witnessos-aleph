/**
 * Advanced Interaction Systems for WitnessOS Webshore
 * 
 * Phase 6 - Enhanced immersion through advanced gesture recognition,
 * spatial audio visualization, and enhanced visual effects
 */

// Advanced Gesture Recognition
export { default as AdvancedGestureRecognition } from './AdvancedGestureRecognition';

// Gesture Visualization Components
export {
  TrailVisualization,
  GestureVisualization,
  FrequencyVisualization,
  TrainingInterface,
  GestureConfidenceIndicator,
} from './GestureVisualizationComponents';

// Enhanced Visual Effects
export { default as EnhancedVisualEffects } from './EnhancedVisualEffects';

// Spatial Audio System (UI Visualization)
export { default as SpatialAudioSystem } from './SpatialAudioSystem';

// Type definitions for interaction systems
export interface InteractionSystemsConfig {
  gestureRecognition: {
    enabled: boolean;
    sensitivity: number;
    trainingMode: boolean;
  };
  visualEffects: {
    enabled: boolean;
    intensity: number;
    consciousnessFieldVisible: boolean;
    energyFlowVisible: boolean;
    sacredGeometryVisible: boolean;
    auraVisible: boolean;
    breathFeedbackVisible: boolean;
  };
  spatialAudio: {
    enabled: boolean;
    visualizationOnly: boolean;
    binauralBeatsEnabled: boolean;
    solfeggioFrequenciesEnabled: boolean;
    consciousnessAdaptation: boolean;
  };
}

export const DEFAULT_INTERACTION_CONFIG: InteractionSystemsConfig = {
  gestureRecognition: {
    enabled: true,
    sensitivity: 0.7,
    trainingMode: false,
  },
  visualEffects: {
    enabled: true,
    intensity: 1.0,
    consciousnessFieldVisible: true,
    energyFlowVisible: true,
    sacredGeometryVisible: true,
    auraVisible: true,
    breathFeedbackVisible: true,
  },
  spatialAudio: {
    enabled: true,
    visualizationOnly: true,
    binauralBeatsEnabled: true,
    solfeggioFrequenciesEnabled: true,
    consciousnessAdaptation: true,
  },
};

// Sacred gesture types for advanced recognition
export type SacredGestureType = 
  | 'infinity-symbol'
  | 'golden-spiral'
  | 'pentagram-star'
  | 'vesica-piscis'
  | 'flower-of-life'
  | 'merkaba-star'
  | 'torus-field'
  | 'fibonacci-spiral'
  | 'mandala-circle'
  | 'consciousness-wave';

// Consciousness actions triggered by gestures
export type ConsciousnessAction =
  | 'breath-sync'
  | 'awareness-expand'
  | 'reality-shift'
  | 'portal-activate'
  | 'fractal-zoom'
  | 'time-dilate'
  | 'field-harmonize'
  | 'dimension-bridge';

// Audio source types for spatial audio
export type AudioSourceType = 
  | 'binaural' 
  | 'solfeggio' 
  | 'nature' 
  | 'consciousness';

// Soundscape themes for different consciousness levels
export type SoundscapeTheme = 
  | 'awakening' 
  | 'recognition' 
  | 'integration' 
  | 'mastery';

// Visual effect types
export type VisualEffectType =
  | 'consciousness-field'
  | 'energy-flow'
  | 'sacred-geometry'
  | 'consciousness-aura'
  | 'breath-feedback'
  | 'frequency-visualization'
  | 'reality-glitch'
  | 'portal-activation';

// Interaction system metadata
export const INTERACTION_METADATA = {
  gestureRecognition: {
    name: 'Advanced Gesture Recognition',
    description: 'Sacred gesture detection with consciousness action mapping',
    features: [
      'Multi-touch sacred symbol recognition',
      'Consciousness-responsive gesture training',
      'Reality glitch discovery mechanics',
      'Gesture confidence visualization',
      'Sacred geometry pattern matching',
    ],
  },
  visualEffects: {
    name: 'Enhanced Visual Effects',
    description: 'Consciousness field visualizations and breath-synchronized effects',
    features: [
      'Consciousness field particle systems',
      'Energy flow visualization',
      'Sacred geometry shader effects',
      'Consciousness aura rendering',
      'Breath-synchronized feedback',
    ],
  },
  spatialAudio: {
    name: 'Spatial Audio System',
    description: 'UI-focused spatial audio visualization and consciousness soundscapes',
    features: [
      'Solfeggio frequency visualization',
      'Binaural beat interface',
      '3D audio positioning',
      'Consciousness-adaptive soundscapes',
      'Frequency tuning interface',
    ],
  },
};

// Integration helpers
export const createInteractionSystem = (config: Partial<InteractionSystemsConfig> = {}) => {
  return {
    ...DEFAULT_INTERACTION_CONFIG,
    ...config,
  };
};

export const getGestureMetadata = (gestureType: SacredGestureType) => {
  const metadata = {
    'infinity-symbol': {
      name: 'Infinity Symbol',
      action: 'time-dilate' as ConsciousnessAction,
      frequency: 528,
      consciousnessLevel: 0.3,
      description: 'Activates time dilation and infinite awareness',
    },
    'golden-spiral': {
      name: 'Golden Spiral',
      action: 'fractal-zoom' as ConsciousnessAction,
      frequency: 741,
      consciousnessLevel: 0.5,
      description: 'Triggers fractal zoom and sacred geometry revelation',
    },
    'pentagram-star': {
      name: 'Pentagram Star',
      action: 'portal-activate' as ConsciousnessAction,
      frequency: 963,
      consciousnessLevel: 0.7,
      description: 'Activates consciousness portals and dimensional bridges',
    },
    'vesica-piscis': {
      name: 'Vesica Piscis',
      action: 'dimension-bridge' as ConsciousnessAction,
      frequency: 396,
      consciousnessLevel: 0.4,
      description: 'Creates bridges between consciousness dimensions',
    },
    'flower-of-life': {
      name: 'Flower of Life',
      action: 'field-harmonize' as ConsciousnessAction,
      frequency: 852,
      consciousnessLevel: 0.8,
      description: 'Harmonizes consciousness field and energy flow',
    },
    'merkaba-star': {
      name: 'Merkaba Star',
      action: 'reality-shift' as ConsciousnessAction,
      frequency: 639,
      consciousnessLevel: 0.6,
      description: 'Shifts reality perception and consciousness state',
    },
    'torus-field': {
      name: 'Torus Field',
      action: 'field-harmonize' as ConsciousnessAction,
      frequency: 417,
      consciousnessLevel: 0.5,
      description: 'Creates toroidal energy field harmonization',
    },
    'fibonacci-spiral': {
      name: 'Fibonacci Spiral',
      action: 'fractal-zoom' as ConsciousnessAction,
      frequency: 741,
      consciousnessLevel: 0.6,
      description: 'Activates natural growth pattern consciousness',
    },
    'mandala-circle': {
      name: 'Mandala Circle',
      action: 'awareness-expand' as ConsciousnessAction,
      frequency: 528,
      consciousnessLevel: 0.4,
      description: 'Expands awareness through circular consciousness',
    },
    'consciousness-wave': {
      name: 'Consciousness Wave',
      action: 'breath-sync' as ConsciousnessAction,
      frequency: 432,
      consciousnessLevel: 0.2,
      description: 'Synchronizes breath with consciousness waves',
    },
  };
  
  return metadata[gestureType];
};

export const getSolfeggioFrequencyMetadata = (frequency: number) => {
  const frequencies = {
    174: { name: 'Foundation', description: 'Pain relief and stress reduction' },
    285: { name: 'Quantum Cognition', description: 'Cellular healing and regeneration' },
    396: { name: 'Liberation', description: 'Liberating guilt and fear' },
    417: { name: 'Resonance', description: 'Facilitating change and transformation' },
    528: { name: 'Love', description: 'DNA repair and love frequency' },
    639: { name: 'Connection', description: 'Harmonizing relationships' },
    741: { name: 'Awakening', description: 'Awakening intuition and consciousness' },
    852: { name: 'Intuition', description: 'Returning to spiritual order' },
    963: { name: 'Unity', description: 'Connection to universal consciousness' },
  };
  
  return frequencies[frequency as keyof typeof frequencies];
};

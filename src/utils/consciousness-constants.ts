/**
 * Consciousness Constants for WitnessOS Webshore
 * 
 * Mathematical and spiritual constants for fractal consciousness exploration
 * Inspired by Yohei Nishitsuji's "Everything is a Wave" philosophy
 */

// Mathematical constants for sacred geometry and fractals
export const SACRED_MATHEMATICS = {
  // Golden ratio and related constants
  PHI: 1.618033988749,
  PHI_INVERSE: 0.618033988749,
  PHI_SQUARED: 2.618033988749,
  
  // Fibonacci sequence for fractal generation
  FIBONACCI: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987, 1597],
  
  // Mathematical constants
  PI: Math.PI,
  TAU: Math.PI * 2,
  E: Math.E,
  SQRT_2: Math.SQRT2,
  SQRT_3: Math.sqrt(3),
  SQRT_5: Math.sqrt(5),
  
  // Sacred angles (in radians)
  PENTAGRAM_ANGLE: (Math.PI * 2) / 5,
  HEXAGON_ANGLE: (Math.PI * 2) / 6,
  OCTAGON_ANGLE: (Math.PI * 2) / 8,
} as const;

// Consciousness frequencies based on spiritual and scientific research
export const CONSCIOUSNESS_FREQUENCIES = {
  // Solfeggio frequencies (Hz) - ancient sacred tones
  SOLFEGGIO: {
    UT: 174,    // Foundation, security
    RE: 285,    // Healing, regeneration
    MI: 396,    // Liberation from fear
    FA: 417,    // Transformation, change
    SOL: 528,   // Love, DNA repair
    LA: 639,    // Relationships, connection
    TI: 741,    // Expression, solutions
    DO: 852,    // Intuition, spiritual order
    SI: 963,    // Divine connection
  },
  
  // Chakra frequencies (Hz) - energy center resonances
  CHAKRA: {
    ROOT: 256,      // Muladhara - survival, grounding
    SACRAL: 288,    // Svadhisthana - creativity, sexuality
    SOLAR: 320,     // Manipura - personal power
    HEART: 341.3,   // Anahata - love, compassion
    THROAT: 384,    // Vishuddha - communication
    THIRD_EYE: 426.7, // Ajna - intuition, wisdom
    CROWN: 480,     // Sahasrara - spiritual connection
    SOUL_STAR: 512, // Above crown - cosmic consciousness
  },
  
  // Planetary frequencies (Hz) - celestial resonances
  PLANETARY: {
    EARTH: 194.18,    // Schumann resonance base
    MOON: 210.42,     // Lunar cycles
    MERCURY: 221.23,  // Communication
    VENUS: 229.22,    // Love, beauty
    MARS: 241.56,     // Action, energy
    JUPITER: 272.2,   // Expansion, wisdom
    SATURN: 295.7,    // Structure, discipline
    URANUS: 315.8,    // Innovation, change
  },
  
  // Brainwave frequencies (Hz) - consciousness states
  BRAINWAVES: {
    DELTA: 2,     // Deep sleep, healing
    THETA: 6,     // Deep meditation, creativity
    ALPHA: 10,    // Relaxed awareness
    BETA: 20,     // Normal waking consciousness
    GAMMA: 40,    // Higher consciousness, insight
  },
} as const;

// Breath patterns for consciousness synchronization
export const BREATH_PATTERNS = {
  // Coherent breathing - heart rate variability optimization
  COHERENT: {
    inhaleCount: 5,
    holdCount: 0,
    exhaleCount: 5,
    pauseCount: 0,
    rhythm: 6, // BPM
    totalCycle: 10,
    frequency: 0.1, // Hz (6 breaths per minute)
  },
  
  // Box breathing - military/meditation technique
  BOX: {
    inhaleCount: 4,
    holdCount: 4,
    exhaleCount: 4,
    pauseCount: 4,
    rhythm: 3.75, // BPM
    totalCycle: 16,
    frequency: 0.0625, // Hz (3.75 breaths per minute)
  },

  // Triangle breathing - energizing pattern
  TRIANGLE: {
    inhaleCount: 4,
    holdCount: 4,
    exhaleCount: 4,
    pauseCount: 0,
    rhythm: 5, // BPM
    totalCycle: 12,
    frequency: 0.083, // Hz (5 breaths per minute)
  },

  // Extended exhale - calming pattern
  EXTENDED: {
    inhaleCount: 4,
    holdCount: 7,
    exhaleCount: 8,
    pauseCount: 0,
    rhythm: 3.16, // BPM
    totalCycle: 19,
    frequency: 0.053, // Hz (3.16 breaths per minute)
  },

  // Natural breathing - default relaxed state
  NATURAL: {
    inhaleCount: 3,
    holdCount: 1,
    exhaleCount: 4,
    pauseCount: 1,
    rhythm: 6.67, // BPM
    totalCycle: 9,
    frequency: 0.111, // Hz (6.67 breaths per minute)
  },
} as const;

// Discovery layer constants for progressive revelation
export const DISCOVERY_LAYERS = {
  PORTAL: {
    id: 0,
    name: 'Portal Chamber',
    description: 'Breathing platform and consciousness entry',
    unlocked: true, // Always unlocked
    progress: 0,
    unlockThreshold: 0,
    fractalComplexity: 3,
    shaderOptimization: 267, // Nishitsuji's character limit
  },
  AWAKENING: {
    id: 1,
    name: 'Symbol Garden',
    description: 'Archetypal symbols and compass plaza',
    unlocked: false,
    progress: 0,
    unlockThreshold: 0.25,
    fractalComplexity: 5,
    shaderOptimization: 400,
  },
  RECOGNITION: {
    id: 2,
    name: 'System Understanding',
    description: 'Engine comprehension spaces',
    unlocked: false,
    progress: 0,
    unlockThreshold: 0.5,
    fractalComplexity: 7,
    shaderOptimization: 600,
  },
  INTEGRATION: {
    id: 3,
    name: 'Archetype Temples',
    description: 'Mastery and synthesis areas',
    unlocked: false,
    progress: 0,
    unlockThreshold: 0.75,
    fractalComplexity: 10,
    shaderOptimization: 1000,
  },
} as const;

// Fractal generation parameters
export const FRACTAL_PARAMETERS = {
  // Mandelbrot set parameters
  MANDELBROT: {
    maxIterations: 64,
    escapeRadius: 2.0,
    zoom: 1.0,
    centerX: -0.7269,
    centerY: 0.1889,
  },
  
  // Julia set parameters
  JULIA: {
    maxIterations: 64,
    escapeRadius: 2.0,
    cReal: -0.8,
    cImaginary: 0.156,
  },
  
  // Fractal noise parameters
  NOISE: {
    octaves: 5,
    frequency: 1.0,
    amplitude: 0.5,
    lacunarity: 2.0,
    persistence: 0.5,
  },
  
  // Performance optimization levels
  LOD: {
    HIGH: { iterations: 128, octaves: 8 },
    MEDIUM: { iterations: 64, octaves: 5 },
    LOW: { iterations: 32, octaves: 3 },
    MOBILE: { iterations: 16, octaves: 2 },
  },
} as const;

// Consciousness state mapping
export const CONSCIOUSNESS_STATES = {
  // Awareness levels (0.0 - 1.0)
  AWARENESS: {
    UNCONSCIOUS: 0.0,
    SUBCONSCIOUS: 0.25,
    CONSCIOUS: 0.5,
    SUPERCONSCIOUS: 0.75,
    COSMIC: 1.0,
  },
  
  // Coherence levels (0.0 - 1.0)
  COHERENCE: {
    CHAOTIC: 0.0,
    SCATTERED: 0.25,
    FOCUSED: 0.5,
    ALIGNED: 0.75,
    UNIFIED: 1.0,
  },
  
  // Integration levels (0.0 - 1.0)
  INTEGRATION: {
    FRAGMENTED: 0.0,
    PARTIAL: 0.25,
    BALANCED: 0.5,
    HARMONIZED: 0.75,
    SYNTHESIZED: 1.0,
  },
} as const;

// Archetypal color mappings for visual consistency
export const ARCHETYPAL_COLORS = {
  // Human Design types
  HUMAN_DESIGN: {
    GENERATOR: [1.0, 0.42, 0.42] as [number, number, number],      // Red - life force energy
    PROJECTOR: [0.31, 0.8, 0.77] as [number, number, number],      // Teal - guidance wisdom
    MANIFESTOR: [0.27, 0.72, 0.82] as [number, number, number],     // Blue - initiating power
    REFLECTOR: [0.59, 0.81, 0.71] as [number, number, number],      // Green - lunar reflection
  },
  
  // Enneagram centers
  ENNEAGRAM: {
    BODY: [0.91, 0.3, 0.24] as [number, number, number],           // Red - instinctual energy
    HEART: [0.95, 0.61, 0.07] as [number, number, number],          // Orange - emotional warmth
    HEAD: [0.2, 0.6, 0.86] as [number, number, number],           // Blue - mental clarity
  },

  // Consciousness fields
  CONSCIOUSNESS: {
    SHADOW: [0.17, 0.24, 0.31] as [number, number, number],         // Dark blue-gray
    GIFT: [0.9, 0.49, 0.13] as [number, number, number],           // Orange
    SIDDHI: [0.95, 0.77, 0.06] as [number, number, number],         // Gold
    FIELD: [0.61, 0.35, 0.71] as [number, number, number],          // Purple
  },
} as const;

// Export all constants as a unified object
export const CONSCIOUSNESS_CONSTANTS = {
  SACRED_MATHEMATICS,
  CONSCIOUSNESS_FREQUENCIES,
  BREATH_PATTERNS,
  DISCOVERY_LAYERS,
  FRACTAL_PARAMETERS,
  CONSCIOUSNESS_STATES,
  ARCHETYPAL_COLORS,
} as const;

// Type definitions for the constants
export type BreathPatternName = keyof typeof BREATH_PATTERNS;
export type DiscoveryLayerName = keyof typeof DISCOVERY_LAYERS;
export type ConsciousnessStateName = keyof typeof CONSCIOUSNESS_STATES;
export type ArchetypalColorCategory = keyof typeof ARCHETYPAL_COLORS;

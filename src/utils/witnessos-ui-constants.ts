/**
 * WitnessOS UI Constants & Terminology
 * 
 * Approved WitnessOS-aligned terminology and UI copy constants
 * Replaces banned "consciousness" terminology with project-specific language
 */

// Banned terms that should never appear in UI copy
export const BANNED_TERMS = [
  'consciousness',
  'conscious',
  'unconscious',
  'subconscious',
  'superconscious',
  'cosmic consciousness',
  'higher consciousness',
  'consciousness exploration',
  'consciousness technology',
  'consciousness field',
  'consciousness matrix',
  'consciousness signature',
  'consciousness designation',
  'consciousness verification',
  'consciousness initialization'
] as const;

// WitnessOS-approved terminology replacements
export const WITNESSOS_TERMINOLOGY = {
  // Core concepts
  WITNESS: 'witness',
  PORTAL: 'portal',
  ARCHETYPAL: 'archetypal',
  NEURAL: 'neural',
  SACRED: 'sacred',
  SPECTRAL: 'spectral',
  MATRIX: 'matrix',
  FIELD: 'field',
  SIGNATURE: 'signature',
  PATHWAY: 'pathway',
  CHAMBER: 'chamber',
  GATEWAY: 'gateway',

  // System terms
  VERIFICATION: 'verification',
  INITIALIZATION: 'initialization',
  RESTORATION: 'restoration',
  DESIGNATION: 'designation',
  ACCESS: 'access',
  CIPHER: 'cipher',

  // Spiritual/metaphysical terms
  AWARENESS: 'awareness',
  AWAKENING: 'awakening',
  RECOGNITION: 'recognition',
  INTEGRATION: 'integration',
  TRANSCENDENCE: 'transcendence',
  SACRED_GEOMETRY: 'sacred geometry',
  ARCHETYPAL_FIELD: 'archetypal field',

  // Magical Neologisms
  LUMINTH: 'luminth', // Luminous interface element
  QUORIL: 'quoril', // Quantum oracle interface
  VIRETH: 'vireth', // Vibrational resonance protocol
  BREATHFIELD: 'breathfield', // Breath-based field interface
  SOMANAUT: 'somanaut', // Body-consciousness explorer
  ARCHETYPAL_ENGINEERING: 'archetypal engineering',

  // Breathfield Protocols
  BREATHFIELD_PROTOCOLS: 'Breathfield Protocols',
  BREATHFIELD_SYNC: 'breathfield synchronization',
  BREATHFIELD_RESONANCE: 'breathfield resonance',
  BREATHFIELD_COHERENCE: 'breathfield coherence',

  // Advanced Terminology
  WITNESS_CONSCIOUSNESS: 'Witness Consciousness',
  WITNESS_FIELD: 'witness field',
  WITNESS_STATE: 'witness state',
  WITNESS_DEPTH: 'witness depth',
  FIELD_COHERENCE: 'field coherence',
  ARCHETYPAL_NEXUS: 'archetypal nexus',
} as const;

// Authentication modal copy constants using proper WitnessOS vocabulary
export const AUTH_MODAL_COPY = {
  TITLES: {
    LOGIN: 'WITNESS_VERIFICATION.sys',
    SIGNUP: 'ARCHETYPAL_INIT.protocol',
    RESET: 'FIELD_RESTORATION.dll',
  },

  SUBTITLES: {
    LOGIN: '// Verify witness state for portal chamber access',
    SIGNUP: '// Initialize new archetypal field in the system',
    RESET: '// Restore neural pathway access protocols',
  },

  LABELS: {
    NAME: 'ARCHETYPAL_DESIGNATION:',
    EMAIL: 'NEURAL_SIGNATURE:',
    PASSWORD: 'ACCESS_CIPHER:',
  },

  PLACEHOLDERS: {
    NAME: 'Enter archetypal designation...',
    EMAIL: 'witness@portal.net',
    PASSWORD: 'Enter neural access cipher...',
  },

  BUTTONS: {
    LOGIN: 'VERIFY_SIGNATURE',
    SIGNUP: 'INITIALIZE_FIELD',
    RESET: 'RESTORE_ACCESS',
    PROCESSING: 'PROCESSING...',
  },

  SUCCESS_MESSAGES: {
    LOGIN: 'Witness signature verified...',
    SIGNUP: 'Archetypal field initialized...',
    RESET: 'Neural pathway restoration initiated...',
  },

  LINK_TEXT: {
    TO_SIGNUP: 'Initialize new archetypal field?',
    TO_RESET: 'Restore neural pathway access?',
    TO_LOGIN: 'Return to witness verification',
  },
} as const;

// General UI copy constants with magical neologisms
export const UI_COPY = {
  SYSTEM_NAME: 'WitnessOS',
  PORTAL_ENTRY: 'Portal Chamber',
  WELCOME_MESSAGE: 'Welcome, Witness',
  LOADING_MESSAGE: 'Sacred pathways are being examined...',
  ERROR_PREFIX: '[ERROR]',
  SUCCESS_PREFIX: '[SUCCESS]',
  SYSTEM_PREFIX: '[SYSTEM]',

  // Engine Portal Copy
  ENGINE_PORTAL_TITLE: 'Archetypal Engine Nexus',
  ENGINE_COLLECTION_TITLE: 'Witness Engineering Protocols',
  FIELD_COHERENCE_LABEL: 'Field Coherence:',
  BREATH_COHERENCE_LABEL: 'Breathfield Resonance:',
  WITNESS_LEVEL_LABEL: 'Witness Depth:',

  // Magical Neologisms for UI Elements
  LUMINTH_ACTIVATION: 'Luminth Activation',
  QUORIL_INTERFACE: 'Quoril Interface',
  VIRETH_PROTOCOL: 'Vireth Protocol',
  BREATHFIELD_SYNC: 'Breathfield Synchronization',
  ARCHETYPAL_MATRIX: 'Archetypal Matrix',

  // Status Messages
  GATEWAY_ACTIVE: 'GATEWAY ACTIVE',
  BIOFIELD_ACTIVE: 'BIOFIELD ACTIVE',
  LUMINTH_RESONANCE: 'LUMINTH RESONANCE',
  QUORIL_ALIGNMENT: 'QUORIL ALIGNMENT',

  // Navigation Elements
  CAPTURE_BIOFIELD: 'CAPTURE BIOFIELD',
  ACTIVATE_LUMINTH: 'ACTIVATE LUMINTH',
  SYNC_BREATHFIELD: 'SYNC BREATHFIELD',
  ENTER_QUORIL: 'ENTER QUORIL',
} as const;

// Copy validation function
export function validateCopy(text: string): { isValid: boolean; violations: string[] } {
  const violations: string[] = [];
  const lowerText = text.toLowerCase();
  
  for (const bannedTerm of BANNED_TERMS) {
    if (lowerText.includes(bannedTerm.toLowerCase())) {
      violations.push(bannedTerm);
    }
  }
  
  return {
    isValid: violations.length === 0,
    violations,
  };
}

// Helper function to get WitnessOS-aligned replacement for banned terms
export function getWitnessOSReplacement(bannedTerm: string): string {
  const replacements: Record<string, string> = {
    'consciousness': 'witness field',
    'conscious': 'aware',
    'unconscious': 'dormant field',
    'subconscious': 'archetypal field',
    'superconscious': 'transcendent field',
    'cosmic consciousness': 'universal field',
    'higher consciousness': 'elevated witness state',
    'consciousness exploration': 'witness field navigation',
    'consciousness technology': 'witness engineering',
    'consciousness field': 'archetypal field',
    'consciousness matrix': 'archetypal matrix',
    'consciousness signature': 'witness signature',
    'consciousness designation': 'archetypal designation',
    'consciousness verification': 'witness verification',
    'consciousness initialization': 'archetypal initialization',
    'consciousness engineering': 'witness engineering',
    'consciousness state': 'witness state',
    'consciousness level': 'field coherence',
    'consciousness explorer': 'somanaut',
  };

  return replacements[bannedTerm.toLowerCase()] || bannedTerm;
}

// Export all constants
export const WITNESSOS_UI_CONSTANTS = {
  BANNED_TERMS,
  WITNESSOS_TERMINOLOGY,
  AUTH_MODAL_COPY,
  UI_COPY,
} as const;

// Type definitions
export type AuthMode = 'login' | 'signup' | 'reset';
export type WitnessOSTerminology = keyof typeof WITNESSOS_TERMINOLOGY;
export type BannedTerm = typeof BANNED_TERMS[number];

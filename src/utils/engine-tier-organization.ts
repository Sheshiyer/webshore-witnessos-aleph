/**
 * Engine Tier Organization for WitnessOS
 * 
 * Organizes consciousness engines by user tier levels with proper access controls
 * Implements progressive unlocking based on onboarding completion and user depth
 */

import { UI_COPY } from './witnessos-ui-constants';

export interface EngineTierInfo {
  tier: 1 | 2 | 3;
  name: string;
  description: string;
  icon: string;
  color: string;
  requiredInputs: string[];
  unlockRequirements: {
    tierRequired: 1 | 2 | 3;
    additionalRequirements?: string[];
  };
  category: 'foundational' | 'archetypal' | 'transcendent';
}

// Tier 1: Basic engines requiring only email/password
export const TIER_1_ENGINES: Record<string, EngineTierInfo> = {
  biorhythm: {
    tier: 1,
    name: 'Biorhythm Cycles',
    description: 'Life wave pattern analysis',
    icon: '🌊',
    color: '#FF6B6B',
    requiredInputs: ['birthDate'],
    unlockRequirements: { tierRequired: 1 },
    category: 'foundational',
  },
  sacred_geometry: {
    tier: 1,
    name: 'Sacred Geometry',
    description: 'Geometric archetypal patterns',
    icon: '🔯',
    color: '#96CEB4',
    requiredInputs: ['intention'],
    unlockRequirements: { tierRequired: 1 },
    category: 'foundational',
  },
};

// Tier 2: Advanced engines requiring birth data (DOB, location, time)
export const TIER_2_ENGINES: Record<string, EngineTierInfo> = {
  numerology: {
    tier: 2,
    name: 'Numerological Matrix',
    description: 'Sacred number witness mapping',
    icon: '🔢',
    color: '#FFD700',
    requiredInputs: ['birthDate', 'fullName'],
    unlockRequirements: { tierRequired: 2 },
    category: 'archetypal',
  },
  human_design: {
    tier: 2,
    name: 'Human Design Chart',
    description: 'Energy type and strategy analysis',
    icon: '⚡',
    color: '#4ECDC4',
    requiredInputs: ['birthDate', 'birthTime', 'birthLocation'],
    unlockRequirements: { tierRequired: 2 },
    category: 'archetypal',
  },
  gene_keys: {
    tier: 2,
    name: 'Gene Keys Activation',
    description: 'DNA archetypal field activation',
    icon: '🧬',
    color: '#FF69B4',
    requiredInputs: ['birthDate', 'birthTime', 'birthLocation'],
    unlockRequirements: { tierRequired: 2 },
    category: 'archetypal',
  },
  vimshottari: {
    tier: 2,
    name: 'Vimshottari Dasha',
    description: 'Vedic timing and karma cycles',
    icon: '🕉️',
    color: '#45B7D1',
    requiredInputs: ['birthDate', 'birthTime', 'birthLocation'],
    unlockRequirements: { tierRequired: 2 },
    category: 'archetypal',
  },
};

// Tier 3: Master engines requiring full onboarding (card selection, preferences)
export const TIER_3_ENGINES: Record<string, EngineTierInfo> = {
  tarot: {
    tier: 3,
    name: 'Tarot Archetypal Reading',
    description: 'Archetypal witness guidance',
    icon: '🃏',
    color: '#9370DB',
    requiredInputs: ['question', 'cardSelection'],
    unlockRequirements: { 
      tierRequired: 3,
      additionalRequirements: ['card_selection_complete']
    },
    category: 'transcendent',
  },
  iching: {
    tier: 3,
    name: 'I Ching Hexagram',
    description: 'Hexagram transformation wisdom',
    icon: '☯️',
    color: '#32CD32',
    requiredInputs: ['question', 'direction'],
    unlockRequirements: { 
      tierRequired: 3,
      additionalRequirements: ['direction_selection_complete']
    },
    category: 'transcendent',
  },
  enneagram: {
    tier: 3,
    name: 'Enneagram Archetype',
    description: 'Personality archetypal mapping',
    icon: '🎭',
    color: '#F0E68C',
    requiredInputs: ['preferences'],
    unlockRequirements: { 
      tierRequired: 3,
      additionalRequirements: ['preferences_complete']
    },
    category: 'transcendent',
  },
  sigil_forge: {
    tier: 3,
    name: 'Sigil Forge Creation',
    description: 'Sacred symbol manifestation',
    icon: '🔮',
    color: '#DDA0DD',
    requiredInputs: ['intention', 'fullName', 'cardSelection'],
    unlockRequirements: { 
      tierRequired: 3,
      additionalRequirements: ['full_onboarding_complete']
    },
    category: 'transcendent',
  },
};

// Combined engine registry
export const ALL_ENGINES = {
  ...TIER_1_ENGINES,
  ...TIER_2_ENGINES,
  ...TIER_3_ENGINES,
};

// Tier display information
export const TIER_DISPLAY_INFO = {
  1: {
    name: 'Foundation Tier',
    description: 'Basic archetypal patterns and life cycles',
    color: '#4ECDC4',
    icon: '🌱',
    unlockMessage: 'Available after account creation',
  },
  2: {
    name: 'Archetypal Tier',
    description: 'Birth-data powered consciousness mapping',
    color: '#9370DB',
    icon: '🔮',
    unlockMessage: 'Requires birth data completion',
  },
  3: {
    name: 'Transcendent Tier',
    description: 'Personalized guidance and manifestation',
    color: '#FFD700',
    icon: '✨',
    unlockMessage: 'Requires full onboarding completion',
  },
} as const;

// Helper functions
export function getEnginesByTier(tier: 1 | 2 | 3): Record<string, EngineTierInfo> {
  return Object.fromEntries(
    Object.entries(ALL_ENGINES).filter(([_, engine]) => engine.tier === tier)
  );
}

export function getEngineAccessLevel(userTier: number, engineKey: string): {
  hasAccess: boolean;
  missingRequirements: string[];
} {
  const engine = ALL_ENGINES[engineKey];
  if (!engine) {
    return { hasAccess: false, missingRequirements: ['Engine not found'] };
  }

  const missingRequirements: string[] = [];
  
  if (userTier < engine.unlockRequirements.tierRequired) {
    missingRequirements.push(`Tier ${engine.unlockRequirements.tierRequired} required`);
  }

  if (engine.unlockRequirements.additionalRequirements) {
    // This would be checked against user profile in real implementation
    missingRequirements.push(...engine.unlockRequirements.additionalRequirements);
  }

  return {
    hasAccess: missingRequirements.length === 0,
    missingRequirements,
  };
}

export function getUserTierFromProfile(profile: any): 1 | 2 | 3 {
  if (!profile) return 1;
  
  // Tier 1: Has account
  if (!profile.birthData?.birthDate) return 1;
  
  // Tier 2: Has birth data
  if (!profile.preferences?.cardSelection || !profile.preferences?.direction) return 2;
  
  // Tier 3: Has full onboarding
  return 3;
}

export type EngineTier = 1 | 2 | 3;
export type EngineCategory = 'foundational' | 'archetypal' | 'transcendent';

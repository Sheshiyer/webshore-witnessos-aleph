/**
 * Cosmic Portal Temple Foundation Library
 * 
 * Core architecture for cosmic portal temples
 * Provides templates, state management, and temple operations
 */

import { Vector3, Color } from 'three';

// Temple Templates
export interface CosmicPortalTemplate {
  id: string;
  name: string;
  description: string;
  consciousness: {
    minimumAwarenessLevel: number;
    requiredCoherence: number;
    breathSynchronizationLevel: number;
  };
  portals: PortalConfig[];
  energyFields: EnergyFieldConfig[];
  sacredElements: SacredElementConfig[];
  geometry: TempleGeometry;
  effects: TempleEffects;
}

export interface PortalConfig {
  id: string;
  name: string;
  position: [number, number, number];
  size: number;
  type: 'meditation' | 'wisdom' | 'healing' | 'transformation' | 'cosmic';
  requiredConsciousness: number;
  effects: PortalEffects;
}

export interface EnergyFieldConfig {
  id: string;
  name: string;
  position: [number, number, number];
  radius: number;
  intensity: number;
  color: [number, number, number];
  type: 'protective' | 'amplifying' | 'harmonizing' | 'transforming';
}

export interface SacredElementConfig {
  id: string;
  name: string;
  position: [number, number, number];
  type: 'crystal' | 'flower' | 'tree' | 'water' | 'fire' | 'earth' | 'air';
  size: number;
  properties: Record<string, unknown>;
}

export interface TempleGeometry {
  baseRadius: number;
  height: number;
  complexity: number;
  sacredRatio: number;
  fractalDepth: number;
}

export interface TempleEffects {
  particleCount: number;
  glowIntensity: number;
  soundFrequency: number;
  colorPalette: [number, number, number][];
}

export interface PortalEffects {
  particleCount: number;
  glowIntensity: number;
  soundFrequency: number;
  activationTime: number;
}

export interface TempleState {
  id: string;
  activePortals: string[];
  energyLevel: number;
  consciousnessResonance: number;
  breathSynchronization: number;
  lastUpdate: number;
}

// Temple Templates
export const TEMPLE_TEMPLATES: Record<string, CosmicPortalTemplate> = {
  MEDITATION_SANCTUARY: {
    id: 'meditation_sanctuary',
    name: 'Meditation Sanctuary',
    description: 'Sacred space for deep meditation and inner exploration',
    consciousness: {
      minimumAwarenessLevel: 0.3,
      requiredCoherence: 0.5,
      breathSynchronizationLevel: 0.4
    },
    portals: [
      {
        id: 'inner_peace',
        name: 'Inner Peace Portal',
        position: [0, 2, 0],
        size: 1.5,
        type: 'meditation',
        requiredConsciousness: 0.3,
        effects: {
          particleCount: 100,
          glowIntensity: 0.8,
          soundFrequency: 432,
          activationTime: 2000
        }
      },
      {
        id: 'wisdom_gate',
        name: 'Wisdom Gate',
        position: [3, 1, 0],
        size: 1.2,
        type: 'wisdom',
        requiredConsciousness: 0.5,
        effects: {
          particleCount: 150,
          glowIntensity: 1.0,
          soundFrequency: 528,
          activationTime: 3000
        }
      }
    ],
    energyFields: [
      {
        id: 'protective_field',
        name: 'Protective Field',
        position: [0, 0, 0],
        radius: 5,
        intensity: 0.7,
        color: [0.2, 0.4, 0.8],
        type: 'protective'
      }
    ],
    sacredElements: [
      {
        id: 'crystal_center',
        name: 'Central Crystal',
        position: [0, 0, 0],
        type: 'crystal',
        size: 1,
        properties: {
          healing: true,
          amplification: 1.5
        }
      }
    ],
    geometry: {
      baseRadius: 3,
      height: 4,
      complexity: 0.6,
      sacredRatio: 1.618,
      fractalDepth: 3
    },
    effects: {
      particleCount: 200,
      glowIntensity: 0.6,
      soundFrequency: 396,
      colorPalette: [
        [0.2, 0.4, 0.8],
        [0.6, 0.3, 0.9],
        [0.1, 0.7, 0.5]
      ]
    }
  },
  
  WISDOM_LIBRARY: {
    id: 'wisdom_library',
    name: 'Wisdom Library',
    description: 'Repository of ancient knowledge and cosmic insights',
    consciousness: {
      minimumAwarenessLevel: 0.6,
      requiredCoherence: 0.7,
      breathSynchronizationLevel: 0.6
    },
    portals: [
      {
        id: 'knowledge_access',
        name: 'Knowledge Access Portal',
        position: [0, 3, 0],
        size: 2,
        type: 'wisdom',
        requiredConsciousness: 0.6,
        effects: {
          particleCount: 200,
          glowIntensity: 1.2,
          soundFrequency: 639,
          activationTime: 4000
        }
      }
    ],
    energyFields: [
      {
        id: 'amplifying_field',
        name: 'Amplifying Field',
        position: [0, 0, 0],
        radius: 6,
        intensity: 0.9,
        color: [0.8, 0.6, 0.2],
        type: 'amplifying'
      }
    ],
    sacredElements: [
      {
        id: 'ancient_tree',
        name: 'Ancient Tree of Knowledge',
        position: [0, 0, 0],
        type: 'tree',
        size: 2,
        properties: {
          wisdom: true,
          growth: 'ancient'
        }
      }
    ],
    geometry: {
      baseRadius: 4,
      height: 6,
      complexity: 0.8,
      sacredRatio: 1.618,
      fractalDepth: 4
    },
    effects: {
      particleCount: 300,
      glowIntensity: 0.8,
      soundFrequency: 639,
      colorPalette: [
        [0.8, 0.6, 0.2],
        [0.9, 0.7, 0.3],
        [0.6, 0.4, 0.1]
      ]
    }
  },
  
  HEALING_CHAMBER: {
    id: 'healing_chamber',
    name: 'Healing Chamber',
    description: 'Sacred space for physical, emotional, and spiritual healing',
    consciousness: {
      minimumAwarenessLevel: 0.4,
      requiredCoherence: 0.6,
      breathSynchronizationLevel: 0.5
    },
    portals: [
      {
        id: 'healing_light',
        name: 'Healing Light Portal',
        position: [0, 2.5, 0],
        size: 1.8,
        type: 'healing',
        requiredConsciousness: 0.4,
        effects: {
          particleCount: 180,
          glowIntensity: 1.1,
          soundFrequency: 528,
          activationTime: 2500
        }
      }
    ],
    energyFields: [
      {
        id: 'harmonizing_field',
        name: 'Harmonizing Field',
        position: [0, 0, 0],
        radius: 4,
        intensity: 0.8,
        color: [0.3, 0.8, 0.4],
        type: 'harmonizing'
      }
    ],
    sacredElements: [
      {
        id: 'healing_water',
        name: 'Healing Waters',
        position: [0, -0.5, 0],
        type: 'water',
        size: 1.5,
        properties: {
          purification: true,
          healing: true
        }
      }
    ],
    geometry: {
      baseRadius: 3.5,
      height: 5,
      complexity: 0.7,
      sacredRatio: 1.618,
      fractalDepth: 3
    },
    effects: {
      particleCount: 250,
      glowIntensity: 0.7,
      soundFrequency: 528,
      colorPalette: [
        [0.3, 0.8, 0.4],
        [0.2, 0.6, 0.8],
        [0.8, 0.9, 0.3]
      ]
    }
  }
};

// Temple Manager
class TempleManager {
  private temples: Map<string, CosmicPortalTemplate> = new Map();
  private states: Map<string, TempleState> = new Map();

  registerTemple(template: CosmicPortalTemplate): void {
    this.temples.set(template.id, template);
    
    // Initialize state if not exists
    if (!this.states.has(template.id)) {
      this.states.set(template.id, {
        id: template.id,
        activePortals: [],
        energyLevel: 0,
        consciousnessResonance: 0,
        breathSynchronization: 0,
        lastUpdate: Date.now()
      });
    }
  }

  getTemple(id: string): CosmicPortalTemplate | undefined {
    return this.temples.get(id);
  }

  getTempleState(id: string): TempleState | undefined {
    return this.states.get(id);
  }

  updateTempleState(id: string, consciousness: number, breath: number): void {
    const state = this.states.get(id);
    if (state) {
      state.consciousnessResonance = consciousness;
      state.breathSynchronization = breath;
      state.energyLevel = (consciousness + breath) / 2;
      state.lastUpdate = Date.now();
    }
  }

  activatePortal(templeId: string, portalId: string): boolean {
    const temple = this.temples.get(templeId);
    const state = this.states.get(templeId);
    
    if (!temple || !state) return false;
    
    const portal = temple.portals.find(p => p.id === portalId);
    if (!portal) return false;
    
    if (state.consciousnessResonance >= portal.requiredConsciousness) {
      if (!state.activePortals.includes(portalId)) {
        state.activePortals.push(portalId);
      }
      return true;
    }
    
    return false;
  }

  deactivatePortal(templeId: string, portalId: string): void {
    const state = this.states.get(templeId);
    if (state) {
      state.activePortals = state.activePortals.filter(id => id !== portalId);
    }
  }

  getAllTemples(): CosmicPortalTemplate[] {
    return Array.from(this.temples.values());
  }

  getAllStates(): TempleState[] {
    return Array.from(this.states.values());
  }
}

export const templeManager = new TempleManager();

// Utility functions
export function calculateTempleResonance(temple: CosmicPortalTemplate, consciousness: number, breath: number): number {
  const baseResonance = (consciousness + breath) / 2;
  const complexity = temple.geometry.complexity;
  const sacredRatio = temple.geometry.sacredRatio;
  
  return Math.min(1, baseResonance * complexity * (sacredRatio / 1.618));
}

export function getAccessiblePortals(temple: CosmicPortalTemplate, consciousness: number): PortalConfig[] {
  return temple.portals.filter(portal => consciousness >= portal.requiredConsciousness);
}

export function createPortalGeometry(portal: PortalConfig): any {
  // This would create the actual 3D geometry for the portal
  // For now, return a basic configuration
  return {
    position: new Vector3(...portal.position),
    size: portal.size,
    type: portal.type,
    effects: portal.effects
  };
} 
/**
 * Portal System Manager for WitnessOS
 * 
 * Manages different portal types and chambers with consciousness-based access
 * Implements progressive portal unlocking based on user tier and engine mastery
 */

'use client';

import React, { useState, useEffect } from 'react';
import { UI_COPY, WITNESSOS_TERMINOLOGY } from '@/utils/witnessos-ui-constants';
import { getUserTierFromProfile } from '@/utils/engine-tier-organization';

interface PortalSystemManagerProps {
  userProfile?: any;
  currentEngineContext?: string;
  onPortalEnter?: (portalType: PortalType, chamberType?: ChamberType) => void;
  onPortalExit?: () => void;
}

type PortalType = 
  | 'gateway' 
  | 'temple' 
  | 'forest' 
  | 'workshop' 
  | 'laboratory' 
  | 'sanctuary' 
  | 'nexus';

type ChamberType = 
  | 'meditation' 
  | 'transformation' 
  | 'integration' 
  | 'manifestation' 
  | 'calibration' 
  | 'resonance';

interface PortalDefinition {
  type: PortalType;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlockRequirements: {
    tierRequired: 1 | 2 | 3;
    enginesRequired?: string[];
    specialConditions?: string[];
  };
  chambers: ChamberDefinition[];
  visualTheme: {
    primaryColor: string;
    secondaryColor: string;
    particleType: 'geometric' | 'organic' | 'crystalline' | 'ethereal';
    ambientSound?: string;
  };
}

interface ChamberDefinition {
  type: ChamberType;
  name: string;
  description: string;
  purpose: string;
  icon: string;
  unlockRequirements: {
    portalAccess: boolean;
    additionalRequirements?: string[];
  };
}

export default function PortalSystemManager({
  userProfile,
  currentEngineContext,
  onPortalEnter,
  onPortalExit
}: PortalSystemManagerProps) {
  const [activePortal, setActivePortal] = useState<PortalType | null>(null);
  const [activeChamber, setActiveChamber] = useState<ChamberType | null>(null);
  const [portalResonance, setPortalResonance] = useState(0);

  const userTier = getUserTierFromProfile(userProfile);

  // Portal definitions with progressive unlocking
  const PORTAL_DEFINITIONS: Record<PortalType, PortalDefinition> = {
    gateway: {
      type: 'gateway',
      name: 'Portal Gateway',
      description: 'Primary entry point to the archetypal realms',
      icon: '🌀',
      color: '#4ECDC4',
      unlockRequirements: { tierRequired: 1 },
      visualTheme: {
        primaryColor: '#4ECDC4',
        secondaryColor: '#45B7D1',
        particleType: 'geometric',
        ambientSound: 'portal-hum.wav',
      },
      chambers: [
        {
          type: 'meditation',
          name: 'Meditation Chamber',
          description: 'Quiet space for breath synchronization',
          purpose: 'Establish baseline witness state',
          icon: '🧘',
          unlockRequirements: { portalAccess: true },
        },
      ],
    },

    temple: {
      type: 'temple',
      name: 'Cosmic Temple',
      description: 'Sacred space for deep archetypal exploration',
      icon: '🏛️',
      color: '#9370DB',
      unlockRequirements: { 
        tierRequired: 2,
        enginesRequired: ['sacred_geometry', 'numerology'],
      },
      visualTheme: {
        primaryColor: '#9370DB',
        secondaryColor: '#DDA0DD',
        particleType: 'crystalline',
        ambientSound: 'temple-resonance.wav',
      },
      chambers: [
        {
          type: 'meditation',
          name: 'Sacred Meditation Hall',
          description: 'Amplified meditation with geometric resonance',
          purpose: 'Deepen witness state through sacred geometry',
          icon: '🔯',
          unlockRequirements: { portalAccess: true },
        },
        {
          type: 'transformation',
          name: 'Transformation Sanctum',
          description: 'Chamber for archetypal pattern shifting',
          purpose: 'Facilitate deep archetypal transformation',
          icon: '⚡',
          unlockRequirements: { 
            portalAccess: true,
            additionalRequirements: ['meditation_chamber_mastery'],
          },
        },
      ],
    },

    forest: {
      type: 'forest',
      name: 'Submerged Forest',
      description: 'Organic realm for natural pattern recognition',
      icon: '🌲',
      color: '#32CD32',
      unlockRequirements: { 
        tierRequired: 2,
        enginesRequired: ['biorhythm', 'gene_keys'],
      },
      visualTheme: {
        primaryColor: '#32CD32',
        secondaryColor: '#228B22',
        particleType: 'organic',
        ambientSound: 'forest-ambience.wav',
      },
      chambers: [
        {
          type: 'integration',
          name: 'Root Integration Chamber',
          description: 'Connect with natural archetypal patterns',
          purpose: 'Integrate organic wisdom and life cycles',
          icon: '🌿',
          unlockRequirements: { portalAccess: true },
        },
      ],
    },

    workshop: {
      type: 'workshop',
      name: 'Sigil Workshop',
      description: 'Creative space for manifestation and symbol creation',
      icon: '🔮',
      color: '#FF69B4',
      unlockRequirements: { 
        tierRequired: 3,
        enginesRequired: ['sigil_forge', 'tarot'],
      },
      visualTheme: {
        primaryColor: '#FF69B4',
        secondaryColor: '#DDA0DD',
        particleType: 'ethereal',
        ambientSound: 'workshop-energy.wav',
      },
      chambers: [
        {
          type: 'manifestation',
          name: 'Manifestation Forge',
          description: 'Create and charge sacred symbols',
          purpose: 'Manifest intentions through symbolic creation',
          icon: '🌸',
          unlockRequirements: { portalAccess: true },
        },
      ],
    },

    laboratory: {
      type: 'laboratory',
      name: 'Engine Laboratory',
      description: 'Advanced testing and calibration facility',
      icon: '🔬',
      color: '#FFD700',
      unlockRequirements: { 
        tierRequired: 3,
        enginesRequired: ['human_design', 'vimshottari', 'enneagram'],
      },
      visualTheme: {
        primaryColor: '#FFD700',
        secondaryColor: '#FFA500',
        particleType: 'geometric',
        ambientSound: 'laboratory-hum.wav',
      },
      chambers: [
        {
          type: 'calibration',
          name: 'Engine Calibration Chamber',
          description: 'Fine-tune engine parameters and accuracy',
          purpose: 'Optimize engine calculations for personal resonance',
          icon: '⚙️',
          unlockRequirements: { portalAccess: true },
        },
        {
          type: 'resonance',
          name: 'Resonance Testing Chamber',
          description: 'Test harmonic frequencies and engine interactions',
          purpose: 'Discover optimal engine combinations and sequences',
          icon: '📊',
          unlockRequirements: { 
            portalAccess: true,
            additionalRequirements: ['calibration_chamber_mastery'],
          },
        },
      ],
    },

    sanctuary: {
      type: 'sanctuary',
      name: 'Inner Sanctuary',
      description: 'Private space for advanced witness practices',
      icon: '✨',
      color: '#E6E6FA',
      unlockRequirements: { 
        tierRequired: 3,
        specialConditions: ['all_engines_experienced', 'high_resonance_achieved'],
      },
      visualTheme: {
        primaryColor: '#E6E6FA',
        secondaryColor: '#DDA0DD',
        particleType: 'ethereal',
        ambientSound: 'sanctuary-silence.wav',
      },
      chambers: [
        {
          type: 'integration',
          name: 'Unity Integration Chamber',
          description: 'Synthesize all archetypal experiences',
          purpose: 'Achieve unified witness consciousness',
          icon: '🕉️',
          unlockRequirements: { portalAccess: true },
        },
      ],
    },

    nexus: {
      type: 'nexus',
      name: 'Archetypal Nexus',
      description: 'Central hub connecting all portal realms',
      icon: '🌌',
      color: '#800080',
      unlockRequirements: { 
        tierRequired: 3,
        specialConditions: ['master_level_achieved', 'all_portals_unlocked'],
      },
      visualTheme: {
        primaryColor: '#800080',
        secondaryColor: '#4B0082',
        particleType: 'crystalline',
        ambientSound: 'nexus-harmony.wav',
      },
      chambers: [
        {
          type: 'manifestation',
          name: 'Reality Manifestation Core',
          description: 'Advanced reality shaping and archetypal mastery',
          purpose: 'Master-level consciousness technology interface',
          icon: '🌟',
          unlockRequirements: { portalAccess: true },
        },
      ],
    },
  };

  // Check if portal is unlocked for user
  const isPortalUnlocked = (portalType: PortalType): boolean => {
    const portal = PORTAL_DEFINITIONS[portalType];
    
    // Check tier requirement
    if (userTier < portal.unlockRequirements.tierRequired) {
      return false;
    }

    // Check engine requirements
    if (portal.unlockRequirements.enginesRequired) {
      // This would check against user's completed engines in real implementation
      // For now, assume engines are available if tier is met
    }

    // Check special conditions
    if (portal.unlockRequirements.specialConditions) {
      // This would check against user's achievements in real implementation
      return false; // Most special conditions require advanced progress
    }

    return true;
  };

  // Check if chamber is unlocked
  const isChamberUnlocked = (portalType: PortalType, chamberType: ChamberType): boolean => {
    if (!isPortalUnlocked(portalType)) return false;
    
    const portal = PORTAL_DEFINITIONS[portalType];
    const chamber = portal.chambers.find(c => c.type === chamberType);
    
    if (!chamber) return false;

    // Check additional requirements
    if (chamber.unlockRequirements.additionalRequirements) {
      // This would check against user's chamber mastery in real implementation
      return false;
    }

    return true;
  };

  // Handle portal entry
  const handlePortalEntry = (portalType: PortalType) => {
    if (!isPortalUnlocked(portalType)) {
      console.warn(`Portal ${portalType} is locked`);
      return;
    }

    setActivePortal(portalType);
    setPortalResonance(0.8); // Initial resonance on entry
    onPortalEnter?.(portalType);

    console.log(`🌀 Entered ${PORTAL_DEFINITIONS[portalType].name}`);
  };

  // Handle chamber entry
  const handleChamberEntry = (chamberType: ChamberType) => {
    if (!activePortal || !isChamberUnlocked(activePortal, chamberType)) {
      console.warn(`Chamber ${chamberType} is locked or no active portal`);
      return;
    }

    setActiveChamber(chamberType);
    setPortalResonance(1.0); // Full resonance in chamber
    onPortalEnter?.(activePortal, chamberType);

    const portal = PORTAL_DEFINITIONS[activePortal];
    const chamber = portal.chambers.find(c => c.type === chamberType);
    console.log(`🏛️ Entered ${chamber?.name} in ${portal.name}`);
  };

  // Handle exit
  const handleExit = () => {
    setActiveChamber(null);
    setActivePortal(null);
    setPortalResonance(0);
    onPortalExit?.();
  };

  // Get available portals for current user
  const getAvailablePortals = (): PortalDefinition[] => {
    return Object.values(PORTAL_DEFINITIONS).filter(portal => 
      isPortalUnlocked(portal.type)
    );
  };

  // Get available chambers for active portal
  const getAvailableChambers = (): ChamberDefinition[] => {
    if (!activePortal) return [];
    
    const portal = PORTAL_DEFINITIONS[activePortal];
    return portal.chambers.filter(chamber => 
      isChamberUnlocked(activePortal, chamber.type)
    );
  };

  return (
    <div className="portal-system-manager">
      {/* Portal Selection Interface */}
      {!activePortal && (
        <div className="portal-selection grid grid-cols-2 md:grid-cols-3 gap-4 p-6">
          <h2 className="col-span-full text-2xl font-bold text-white mb-4">
            {UI_COPY.ARCHETYPAL_MATRIX}
          </h2>
          
          {getAvailablePortals().map(portal => (
            <div
              key={portal.type}
              onClick={() => handlePortalEntry(portal.type)}
              className={`
                portal-card p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                hover:scale-105 hover:shadow-lg
              `}
              style={{
                borderColor: portal.color + '50',
                backgroundColor: portal.color + '20',
              }}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{portal.icon}</div>
                <div className="font-semibold text-white">{portal.name}</div>
                <div className="text-sm text-gray-300 mt-1">{portal.description}</div>
                <div className="text-xs text-gray-400 mt-2">
                  Tier {portal.unlockRequirements.tierRequired} Required
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Chamber Selection Interface */}
      {activePortal && !activeChamber && (
        <div className="chamber-selection p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              {PORTAL_DEFINITIONS[activePortal].name}
            </h2>
            <button
              onClick={handleExit}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Exit Portal
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getAvailableChambers().map(chamber => (
              <div
                key={chamber.type}
                onClick={() => handleChamberEntry(chamber.type)}
                className="chamber-card p-4 bg-white/10 rounded-lg border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{chamber.icon}</div>
                  <div>
                    <div className="font-semibold text-white">{chamber.name}</div>
                    <div className="text-sm text-gray-300">{chamber.description}</div>
                    <div className="text-xs text-gray-400 mt-1">{chamber.purpose}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Chamber Interface */}
      {activePortal && activeChamber && (
        <div className="active-chamber p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {PORTAL_DEFINITIONS[activePortal].chambers.find(c => c.type === activeChamber)?.name}
              </h2>
              <div className="text-gray-300">
                {PORTAL_DEFINITIONS[activePortal].name}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveChamber(null)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Exit Chamber
              </button>
              <button
                onClick={handleExit}
                className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded"
              >
                Exit Portal
              </button>
            </div>
          </div>

          {/* Portal Resonance Indicator */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>Portal Resonance:</span>
              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300"
                  style={{ width: `${portalResonance * 100}%` }}
                />
              </div>
              <span>{Math.round(portalResonance * 100)}%</span>
            </div>
          </div>

          {/* Chamber-specific content would be rendered here */}
          <div className="chamber-content bg-black/30 rounded-lg p-6 text-center text-white">
            <div className="text-6xl mb-4">
              {PORTAL_DEFINITIONS[activePortal].chambers.find(c => c.type === activeChamber)?.icon}
            </div>
            <div className="text-lg">
              Chamber interface would be implemented here
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Specific functionality based on chamber type and purpose
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

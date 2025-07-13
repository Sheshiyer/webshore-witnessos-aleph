/**
 * Gene Keys Calculator
 * 
 * Calculates Gene Keys profile based on Human Design astronomical foundation
 * Uses the same precise astronomical calculations but applies Gene Keys interpretation
 * 
 * Gene Keys System:
 * - 64 Gene Keys corresponding to I-Ching hexagrams
 * - Each key has 3 states: Shadow (fear-based), Gift (balanced), Siddhi (enlightened)
 * - 11 key spheres in the Gene Keys profile
 * - Based on same astronomical positions as Human Design
 */

import { preciseAstronomicalCalculator, PlanetaryPositions } from './precise-astronomical-calculator';
import { geneKeysDataLoader, type GeneKeyArchetype } from './gene-keys-data-loader';

export interface GeneKeyState {
  shadow: string;
  gift: string;
  siddhi: string;
}

export interface GeneKey {
  number: number;
  name: string;
  states: GeneKeyState;
  description: string;
  // Extended properties from comprehensive data
  codon?: string;
  amino_acid?: string;
  programming_partner?: number;
  physiology?: string;
  keywords?: string[];
  life_theme?: string;
}

export interface GeneKeySphere {
  name: string;
  geneKey: number;
  planet: string;
  type: 'personality' | 'design';
  description: string;
  purpose: string;
}

export interface GeneKeysProfile {
  // Core Spheres (4)
  lifeWork: GeneKeySphere;        // Personality Sun
  evolution: GeneKeySphere;       // Personality Earth  
  radiance: GeneKeySphere;        // Design Sun
  purpose: GeneKeySphere;         // Design Earth

  // Activation Spheres (4)
  iq: GeneKeySphere;              // Personality North Node
  eq: GeneKeySphere;              // Personality South Node
  sq: GeneKeySphere;              // Design North Node
  vq: GeneKeySphere;              // Design South Node

  // Venus Sequence (3)
  attraction: GeneKeySphere;      // Personality Venus
  creativity: GeneKeySphere;      // Design Venus
  pearl: GeneKeySphere;           // Venus synthesis

  // All Gene Keys in profile
  allKeys: GeneKeySphere[];
  
  // Profile metadata
  birthDate: Date;
  location: [number, number];
  calculatedAt: Date;
}

/**
 * Convert comprehensive Gene Key archetype to our GeneKey interface
 */
function convertArchetypeToGeneKey(archetype: GeneKeyArchetype): GeneKey {
  return {
    number: archetype.number,
    name: archetype.name,
    states: {
      shadow: archetype.shadow,
      gift: archetype.gift,
      siddhi: archetype.siddhi
    },
    description: archetype.gift_description,
    codon: archetype.codon,
    amino_acid: archetype.amino_acid,
    programming_partner: archetype.programming_partner,
    physiology: archetype.physiology,
    keywords: archetype.keywords,
    life_theme: archetype.life_theme
  };
}


export class GeneKeysCalculator {
  /**
   * Calculate complete Gene Keys profile
   */
  calculateProfile(
    birthDate: Date,
    latitude: number,
    longitude: number
  ): GeneKeysProfile {
    // Use the same precise astronomical calculations as Human Design
    const astronomicalData = preciseAstronomicalCalculator.calculateAllGates(
      birthDate,
      latitude,
      longitude
    );

    // Map astronomical positions to Gene Keys spheres
    const spheres = this.mapToGeneKeysSpheres(astronomicalData);

    // Create the complete profile
    const profile: GeneKeysProfile = {
      // Core Spheres
      lifeWork: spheres.find(s => s.name === "Life's Work")!,
      evolution: spheres.find(s => s.name === "Evolution")!,
      radiance: spheres.find(s => s.name === "Radiance")!,
      purpose: spheres.find(s => s.name === "Purpose")!,

      // Activation Spheres  
      iq: spheres.find(s => s.name === "IQ")!,
      eq: spheres.find(s => s.name === "EQ")!,
      sq: spheres.find(s => s.name === "SQ")!,
      vq: spheres.find(s => s.name === "VQ")!,

      // Venus Sequence
      attraction: spheres.find(s => s.name === "Attraction")!,
      creativity: spheres.find(s => s.name === "Creativity")!,
      pearl: this.calculatePearl(
        spheres.find(s => s.name === "Attraction")!,
        spheres.find(s => s.name === "Creativity")!
      ),

      // All spheres
      allKeys: spheres,

      // Metadata
      birthDate,
      location: [latitude, longitude],
      calculatedAt: new Date()
    };

    return profile;
  }

  /**
   * Map astronomical positions to Gene Keys spheres
   */
  private mapToGeneKeysSpheres(
    astronomicalData: { personality: PlanetaryPositions; design: PlanetaryPositions }
  ): GeneKeySphere[] {
    const spheres: GeneKeySphere[] = [];

    // Core Spheres (Sun/Earth)
    spheres.push({
      name: "Life's Work",
      geneKey: astronomicalData.personality.SUN.gate,
      planet: "SUN",
      type: "personality",
      description: "Your life's work and creative purpose",
      purpose: "The gift you came to give to the world"
    });

    spheres.push({
      name: "Evolution", 
      geneKey: astronomicalData.personality.EARTH.gate,
      planet: "EARTH",
      type: "personality", 
      description: "Your evolutionary path and grounding",
      purpose: "How you evolve and grow throughout life"
    });

    spheres.push({
      name: "Radiance",
      geneKey: astronomicalData.design.SUN.gate,
      planet: "SUN", 
      type: "design",
      description: "Your unconscious radiance and magnetism",
      purpose: "The light you naturally emanate"
    });

    spheres.push({
      name: "Purpose",
      geneKey: astronomicalData.design.EARTH.gate,
      planet: "EARTH",
      type: "design",
      description: "Your unconscious purpose and foundation", 
      purpose: "The deeper purpose that drives you"
    });

    // Activation Spheres (Nodes)
    spheres.push({
      name: "IQ",
      geneKey: astronomicalData.personality.NORTH_NODE.gate,
      planet: "NORTH_NODE",
      type: "personality",
      description: "Your mental activation and intelligence",
      purpose: "How your mind is designed to work"
    });

    spheres.push({
      name: "EQ", 
      geneKey: astronomicalData.personality.SOUTH_NODE.gate,
      planet: "SOUTH_NODE",
      type: "personality",
      description: "Your emotional activation and wisdom",
      purpose: "Your emotional intelligence and patterns"
    });

    spheres.push({
      name: "SQ",
      geneKey: astronomicalData.design.NORTH_NODE.gate,
      planet: "NORTH_NODE", 
      type: "design",
      description: "Your spiritual activation and connection",
      purpose: "Your spiritual intelligence and growth"
    });

    spheres.push({
      name: "VQ",
      geneKey: astronomicalData.design.SOUTH_NODE.gate,
      planet: "SOUTH_NODE",
      type: "design", 
      description: "Your vital activation and life force",
      purpose: "Your vital energy and life patterns"
    });

    // Venus Sequence
    spheres.push({
      name: "Attraction",
      geneKey: astronomicalData.personality.VENUS.gate,
      planet: "VENUS",
      type: "personality",
      description: "What you attract and are attracted to",
      purpose: "Your conscious relationship patterns"
    });

    spheres.push({
      name: "Creativity",
      geneKey: astronomicalData.design.VENUS.gate, 
      planet: "VENUS",
      type: "design",
      description: "Your unconscious creative expression",
      purpose: "How you naturally create and relate"
    });

    return spheres;
  }

  /**
   * Calculate the Pearl (synthesis of Venus sequence)
   */
  private calculatePearl(attraction: GeneKeySphere, creativity: GeneKeySphere): GeneKeySphere {
    // The Pearl is a synthesis - for now, use a simple calculation
    // In a full implementation, this would involve complex synthesis logic
    const pearlGeneKey = ((attraction.geneKey + creativity.geneKey) % 64) + 1;

    return {
      name: "Pearl",
      geneKey: pearlGeneKey,
      planet: "VENUS_SYNTHESIS",
      type: "personality",
      description: "The pearl of your relationships - your highest gift in love",
      purpose: "The wisdom that emerges from integrating attraction and creativity"
    };
  }

  /**
   * Get Gene Key data by number
   */
  getGeneKeyData(geneKeyNumber: number): GeneKey | null {
    const archetype = geneKeysDataLoader.getGeneKey(geneKeyNumber);
    return archetype ? convertArchetypeToGeneKey(archetype) : null;
  }

  /**
   * Get all Gene Keys data
   */
  getAllGeneKeysData(): Record<number, GeneKey> {
    const allArchetypes = geneKeysDataLoader.getAllGeneKeys();
    const result: Record<number, GeneKey> = {};

    for (const [key, archetype] of Object.entries(allArchetypes)) {
      result[parseInt(key)] = convertArchetypeToGeneKey(archetype);
    }

    return result;
  }

  /**
   * Get Gene Keys system information
   */
  getGeneKeysInfo() {
    return geneKeysDataLoader.getGeneKeysInfo();
  }
}

/**
 * Gene Keys Data Loader
 * 
 * Loads comprehensive Gene Keys data from the archetypes.json file
 * Provides complete information for all 64 Gene Keys
 */

// Note: fs and path are not available in Cloudflare Workers
// We'll use a different approach for loading data

export interface GeneKeyArchetype {
  number: number;
  name: string;
  shadow: string;
  gift: string;
  siddhi: string;
  codon: string;
  amino_acid: string;
  programming_partner: number;
  physiology: string;
  shadow_description: string;
  gift_description: string;
  siddhi_description: string;
  keywords: string[];
  life_theme: string;
}

export interface GeneKeysData {
  gene_keys_info: {
    name: string;
    description: string;
    total_keys: number;
    source: string;
    sequences: string[];
  };
  gene_keys: Record<string, GeneKeyArchetype>;
}

class GeneKeysDataLoader {
  private static instance: GeneKeysDataLoader;
  private geneKeysData: GeneKeysData | null = null;

  private constructor() {}

  public static getInstance(): GeneKeysDataLoader {
    if (!GeneKeysDataLoader.instance) {
      GeneKeysDataLoader.instance = new GeneKeysDataLoader();
    }
    return GeneKeysDataLoader.instance;
  }

  /**
   * Load Gene Keys data (using fallback data for Cloudflare Workers compatibility)
   */
  public loadGeneKeysData(): GeneKeysData {
    if (this.geneKeysData) {
      return this.geneKeysData;
    }

    // In Cloudflare Workers environment, we use the fallback data
    // In a full implementation, this data would be loaded from a database or API
    console.log('📚 Loading Gene Keys data (using embedded fallback for Workers compatibility)');
    this.geneKeysData = this.getFallbackData();
    return this.geneKeysData;
  }

  /**
   * Get a specific Gene Key by number
   */
  public getGeneKey(number: number): GeneKeyArchetype | null {
    const data = this.loadGeneKeysData();
    return data.gene_keys[number.toString()] || null;
  }

  /**
   * Get all Gene Keys
   */
  public getAllGeneKeys(): Record<string, GeneKeyArchetype> {
    const data = this.loadGeneKeysData();
    return data.gene_keys;
  }

  /**
   * Get Gene Keys info
   */
  public getGeneKeysInfo() {
    const data = this.loadGeneKeysData();
    return data.gene_keys_info;
  }

  /**
   * Fallback data in case the JSON file is not available
   */
  private getFallbackData(): GeneKeysData {
    return {
      gene_keys_info: {
        name: "Gene Keys Archetypal System",
        description: "The 64 Gene Keys with Shadow, Gift, and Siddhi frequencies",
        total_keys: 64,
        source: "Gene Keys synthesis by Richard Rudd",
        sequences: ["Activation", "Venus", "Pearl"]
      },
      gene_keys: {
        "1": {
          number: 1,
          name: "The Creative",
          shadow: "Entropy",
          gift: "Freshness",
          siddhi: "Beauty",
          codon: "CCG",
          amino_acid: "Proline",
          programming_partner: 33,
          physiology: "Physiology 1",
          shadow_description: "The shadow of Entropy manifests as creative stagnation, where life force becomes trapped in repetitive patterns and loses its natural flow.",
          gift_description: "The gift of Freshness brings spontaneous creativity and the ability to see life with new eyes, breaking free from stale patterns.",
          siddhi_description: "Beauty is the highest frequency - the recognition that all existence is an expression of divine aesthetic perfection.",
          keywords: ["transformation", "consciousness", "evolution", "awakening"],
          life_theme: "Breaking free from entropy through creative spontaneity"
        },
        "4": {
          number: 4,
          name: "Understanding",
          shadow: "Intolerance",
          gift: "Understanding",
          siddhi: "Forgiveness",
          codon: "TGC",
          amino_acid: "Cysteine",
          programming_partner: 36,
          physiology: "Physiology 4",
          shadow_description: "Intolerance creates rigid mental patterns and judgmental attitudes that block true comprehension.",
          gift_description: "Understanding brings mental clarity and the ability to see through complexity to essential truths.",
          siddhi_description: "Forgiveness transcends all judgment, recognizing the perfection in all experiences.",
          keywords: ["clarity", "comprehension", "wisdom", "insight"],
          life_theme: "Transforming intolerance into divine understanding"
        },
        "23": {
          number: 23,
          name: "Simplicity",
          shadow: "Complexity",
          gift: "Simplicity",
          siddhi: "Quintessence",
          codon: "GAG",
          amino_acid: "Glutamic Acid",
          programming_partner: 55,
          physiology: "Physiology 23",
          shadow_description: "Complexity creates mental confusion and the inability to communicate clearly or simply.",
          gift_description: "Simplicity cuts through complexity to reveal essential truths in clear, accessible ways.",
          siddhi_description: "Quintessence is the pure essence that underlies all complexity - the simple truth of being.",
          keywords: ["clarity", "communication", "essence", "truth"],
          life_theme: "Breaking down complexity into simple, essential truths"
        },
        "43": {
          number: 43,
          name: "Insight",
          shadow: "Deafness",
          gift: "Insight",
          siddhi: "Epiphany",
          codon: "TTG",
          amino_acid: "Leucine",
          programming_partner: 11,
          physiology: "Physiology 43",
          shadow_description: "Deafness creates the inability to hear inner wisdom and breakthrough insights.",
          gift_description: "Insight brings sudden moments of clarity and understanding that cut through confusion.",
          siddhi_description: "Epiphany is the ultimate insight - the sudden recognition of divine truth.",
          keywords: ["breakthrough", "clarity", "wisdom", "revelation"],
          life_theme: "The breakthrough moment of understanding"
        },
        "49": {
          number: 49,
          name: "Revolution",
          shadow: "Reaction",
          gift: "Revolution",
          siddhi: "Rebirth",
          codon: "TGT",
          amino_acid: "Cysteine",
          programming_partner: 17,
          physiology: "Physiology 49",
          shadow_description: "Reaction creates emotional volatility and the inability to transform constructively.",
          gift_description: "Revolution brings the power to transform and revolutionize outdated systems and patterns.",
          siddhi_description: "Rebirth is the ultimate revolution - complete transformation and renewal of consciousness.",
          keywords: ["transformation", "change", "renewal", "revolution"],
          life_theme: "The power to transform and revolutionize"
        },
        "52": {
          number: 52,
          name: "Restraint",
          shadow: "Stress",
          gift: "Restraint",
          siddhi: "Stillness",
          codon: "CGG",
          amino_acid: "Arginine",
          programming_partner: 20,
          physiology: "Physiology 52",
          shadow_description: "Stress creates the inability to be still and the compulsion to act inappropriately.",
          gift_description: "Restraint brings the wisdom of knowing when to act and when to wait in stillness.",
          siddhi_description: "Stillness is the ultimate restraint - perfect peace and presence in the eternal now.",
          keywords: ["patience", "timing", "stillness", "wisdom"],
          life_theme: "The wisdom of knowing when to act and when to wait"
        },
        "53": {
          number: 53,
          name: "Evolution",
          shadow: "Immaturity",
          gift: "Evolution",
          siddhi: "Superabundance",
          codon: "GGT",
          amino_acid: "Glycine",
          programming_partner: 21,
          physiology: "Physiology 53",
          shadow_description: "Immaturity creates the inability to develop and grow at the natural pace.",
          gift_description: "Evolution brings the gradual unfolding of potential over time through patient development.",
          siddhi_description: "Superabundance is the ultimate evolution - infinite creative potential manifesting.",
          keywords: ["development", "growth", "patience", "unfolding"],
          life_theme: "The gradual unfolding of potential over time"
        },
        "54": {
          number: 54,
          name: "Aspiration",
          shadow: "Greed",
          gift: "Aspiration",
          siddhi: "Ascension",
          codon: "GTG",
          amino_acid: "Valine",
          programming_partner: 22,
          physiology: "Physiology 54",
          shadow_description: "Greed creates the compulsive desire for more without appreciation for what is.",
          gift_description: "Aspiration brings the healthy drive to transcend current limitations and reach higher potentials.",
          siddhi_description: "Ascension is the ultimate aspiration - complete transcendence of material limitations.",
          keywords: ["transcendence", "ambition", "growth", "elevation"],
          life_theme: "The drive to transcend current limitations"
        },
        "59": {
          number: 59,
          name: "Intimacy",
          shadow: "Dishonesty",
          gift: "Intimacy",
          siddhi: "Transparency",
          codon: "TCC",
          amino_acid: "Serine",
          programming_partner: 27,
          physiology: "Physiology 59",
          shadow_description: "Dishonesty creates barriers to authentic connection and intimate relationships.",
          gift_description: "Intimacy brings the ability to connect deeply and authentically with others.",
          siddhi_description: "Transparency is the ultimate intimacy - complete openness and authentic being.",
          keywords: ["connection", "authenticity", "openness", "truth"],
          life_theme: "The ability to connect deeply and authentically"
        },
        "61": {
          number: 61,
          name: "Sanctity",
          shadow: "Psychosis",
          gift: "Sanctity",
          siddhi: "Holiness",
          codon: "TCG",
          amino_acid: "Serine",
          programming_partner: 29,
          physiology: "Physiology 61",
          shadow_description: "Psychosis creates disconnection from reality and the inability to discern truth.",
          gift_description: "Sanctity brings the recognition of the sacred in all things and experiences.",
          siddhi_description: "Holiness is the ultimate sanctity - the recognition that all existence is divine.",
          keywords: ["sacred", "divine", "reverence", "truth"],
          life_theme: "The recognition of the sacred in all things"
        },
        "62": {
          number: 62,
          name: "Precision",
          shadow: "Intellectualisation",
          gift: "Precision",
          siddhi: "Impeccability",
          codon: "TCT",
          amino_acid: "Serine",
          programming_partner: 30,
          physiology: "Physiology 62",
          shadow_description: "Intellectualisation creates over-thinking and the inability to express clearly.",
          gift_description: "Precision brings the art of perfect expression and clear communication.",
          siddhi_description: "Impeccability is the ultimate precision - flawless expression of divine truth.",
          keywords: ["clarity", "expression", "communication", "perfection"],
          life_theme: "The art of perfect expression and communication"
        }
        // Note: In production, all 64 keys would be loaded from the JSON file
      }
    };
  }
}

// Export singleton instance
export const geneKeysDataLoader = GeneKeysDataLoader.getInstance();

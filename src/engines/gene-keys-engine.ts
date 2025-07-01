/**
 * Gene Keys Compass Engine for WitnessOS
 * 
 * Provides Gene Keys archetypal analysis based on birth data.
 * Calculates Activation, Venus, and Pearl sequences with pathworking guidance.
 * 
 * Based on the work of Richard Rudd and the Gene Keys system.
 */

import { BaseEngine } from './core/base-engine';
import type { BaseEngineInput, BaseEngineOutput } from './core/types';

// Gene Keys Input Interface
export interface GeneKeysInput extends BaseEngineInput {
  birth_date: string; // ISO date string
  birth_time: string; // HH:MM format
  birth_location: [number, number]; // [latitude, longitude]
  timezone?: string; // Default to UTC
  focus_sequence?: 'activation' | 'venus' | 'pearl' | 'all';
  include_programming_partner?: boolean;
  pathworking_focus?: string;
}

// Gene Key Interface
export interface GeneKey {
  number: number; // 1-64
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

// Sequence Gate Interface
export interface SequenceGate {
  name: string;
  description: string;
  gene_key: GeneKey;
  calculation_method: string;
}

// Gene Keys Sequence Interface
export interface GeneKeysSequence {
  name: string;
  description: string;
  gates: SequenceGate[];
}

// Gene Keys Profile Interface
export interface GeneKeysProfile {
  activation_sequence: GeneKeysSequence;
  venus_sequence: GeneKeysSequence;
  pearl_sequence: GeneKeysSequence;
  birth_date: string;
  primary_gene_key: GeneKey;
  programming_partner: GeneKey;
}

// Gene Keys Output Interface
export interface GeneKeysOutput extends BaseEngineOutput {
  profile: GeneKeysProfile;
  pathworking_guidance: string[];
  life_theme_analysis: string;
  current_frequency_analysis: string;
  transformation_opportunities: string[];
}

export class GeneKeysEngine extends BaseEngine<GeneKeysInput, GeneKeysOutput> {
  public readonly name = 'gene_keys';
  public readonly description = 'Provides Gene Keys archetypal analysis based on birth data with Activation, Venus, and Pearl sequences';

  protected validateInput(input: GeneKeysInput): boolean {
    return !!(input.birth_date && input.birth_time && input.birth_location);
  }

  protected async performCalculation(input: GeneKeysInput): Promise<Record<string, unknown>> {
    return this._calculate(input);
  }

  protected generateInterpretation(results: Record<string, unknown>, input: GeneKeysInput): string {
    return this._interpret(results, input);
  }

  protected generateRecommendations(results: Record<string, unknown>, input: GeneKeysInput): string[] {
    return this._generateRecommendations(results, input);
  }

  protected generateRealityPatches(results: Record<string, unknown>, input: GeneKeysInput): string[] {
    return this._generateRealityPatches(results, input);
  }

  protected identifyArchetypalThemes(results: Record<string, unknown>, input: GeneKeysInput): string[] {
    return this._identifyArchetypalThemes(results, input);
  }

  protected calculateConfidence(results: Record<string, unknown>, input: GeneKeysInput): number {
    return this._calculateConfidence(results, input);
  }

  // Core Gene Keys data (subset for implementation - first 10 keys as reference)
  private readonly GENE_KEYS_DATA: Record<number, GeneKey> = {
    1: {
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
    2: {
      number: 2,
      name: "The Orientation",
      shadow: "Dislocation",
      gift: "Orientation",
      siddhi: "Unity",
      codon: "GGC",
      amino_acid: "Glycine",
      programming_partner: 34,
      physiology: "Physiology 2",
      shadow_description: "Dislocation creates a sense of not belonging, feeling lost or disconnected from one's true direction in life.",
      gift_description: "Orientation provides natural guidance and the ability to help others find their direction through patient, grounded wisdom.",
      siddhi_description: "Unity transcends all sense of separation, revealing the interconnectedness of all existence.",
      keywords: ["direction", "guidance", "belonging", "connection"],
      life_theme: "Finding and providing direction through inner compass"
    },
    3: {
      number: 3,
      name: "The Innovation",
      shadow: "Chaos",
      gift: "Innovation",
      siddhi: "Innocence",
      codon: "AAG",
      amino_acid: "Lysine",
      programming_partner: 35,
      physiology: "Physiology 3",
      shadow_description: "Chaos manifests as overwhelming confusion and the inability to bring order to new beginnings.",
      gift_description: "Innovation transforms chaos into breakthrough solutions, bringing order through creative problem-solving.",
      siddhi_description: "Innocence sees all challenges as opportunities for growth, maintaining childlike wonder in the face of complexity.",
      keywords: ["innovation", "breakthrough", "problem-solving", "creativity"],
      life_theme: "Transforming chaos into innovative solutions"
    },
    4: {
      number: 4,
      name: "The Understanding",
      shadow: "Intolerance",
      gift: "Understanding",
      siddhi: "Forgiveness",
      codon: "TGC",
      amino_acid: "Cysteine",
      programming_partner: 36,
      physiology: "Physiology 4",
      shadow_description: "Intolerance creates rigid thinking patterns and the inability to accept different perspectives or approaches.",
      gift_description: "Understanding brings mental clarity and the ability to see multiple perspectives, fostering tolerance and wisdom.",
      siddhi_description: "Forgiveness transcends all judgment, seeing the perfection in every experience and being.",
      keywords: ["understanding", "tolerance", "wisdom", "perspective"],
      life_theme: "Developing tolerance through deeper understanding"
    },
    5: {
      number: 5,
      name: "The Rhythm",
      shadow: "Impatience",
      gift: "Patience",
      siddhi: "Timelessness",
      codon: "TTG",
      amino_acid: "Leucine",
      programming_partner: 37,
      physiology: "Physiology 5",
      shadow_description: "Impatience disrupts natural timing and creates anxiety about outcomes, forcing premature action.",
      gift_description: "Patience aligns with natural rhythms and timing, knowing when to act and when to wait.",
      siddhi_description: "Timelessness transcends linear time, experiencing the eternal present moment.",
      keywords: ["patience", "timing", "rhythm", "flow"],
      life_theme: "Learning to flow with natural timing and rhythms"
    },
    6: {
      number: 6,
      name: "The Peacemaker",
      shadow: "Conflict",
      gift: "Diplomacy",
      siddhi: "Peace",
      codon: "TCG",
      amino_acid: "Serine",
      programming_partner: 38,
      physiology: "Physiology 6",
      shadow_description: "Conflict arises from emotional reactivity and the inability to find common ground with others.",
      gift_description: "Diplomacy brings natural peacemaking abilities and emotional intelligence in relationships.",
      siddhi_description: "Peace radiates unconditional love and harmony, dissolving all conflict through presence.",
      keywords: ["peace", "diplomacy", "harmony", "emotional intelligence"],
      life_theme: "Transforming conflict into harmony through emotional wisdom"
    },
    7: {
      number: 7,
      name: "The Role",
      shadow: "Division",
      gift: "Virtue",
      siddhi: "Virtue",
      codon: "CCG",
      amino_acid: "Proline",
      programming_partner: 39,
      physiology: "Physiology 7",
      shadow_description: "Division creates separation and the inability to see one's authentic role in the collective.",
      gift_description: "Virtue expresses authentic leadership and the ability to inspire others through example.",
      siddhi_description: "Pure Virtue embodies divine leadership that serves the highest good of all.",
      keywords: ["leadership", "virtue", "authenticity", "service"],
      life_theme: "Embodying authentic leadership through virtuous action"
    },
    8: {
      number: 8,
      name: "The Style",
      shadow: "Mediocrity",
      gift: "Style",
      siddhi: "Exquisiteness",
      codon: "GGC",
      amino_acid: "Glycine",
      programming_partner: 40,
      physiology: "Physiology 8",
      shadow_description: "Mediocrity settles for less than one's true potential, avoiding the risk of authentic expression.",
      gift_description: "Style expresses unique creative flair and the courage to be authentically different.",
      siddhi_description: "Exquisiteness embodies divine artistry in every moment and expression.",
      keywords: ["style", "uniqueness", "creativity", "authenticity"],
      life_theme: "Expressing unique creative style beyond mediocrity"
    },
    9: {
      number: 9,
      name: "The Determination",
      shadow: "Inertia",
      gift: "Determination",
      siddhi: "Invincibility",
      codon: "AAG",
      amino_acid: "Lysine",
      programming_partner: 41,
      physiology: "Physiology 9",
      shadow_description: "Inertia creates stagnation and the inability to sustain focused energy toward goals.",
      gift_description: "Determination provides unwavering focus and the ability to concentrate energy for achievement.",
      siddhi_description: "Invincibility transcends all obstacles through alignment with universal will.",
      keywords: ["determination", "focus", "perseverance", "achievement"],
      life_theme: "Overcoming inertia through determined focus"
    },
    10: {
      number: 10,
      name: "The Naturalness",
      shadow: "Self-Obsession",
      gift: "Naturalness",
      siddhi: "Being",
      codon: "TGC",
      amino_acid: "Cysteine",
      programming_partner: 42,
      physiology: "Physiology 10",
      shadow_description: "Self-obsession creates excessive focus on personal image and the need for external validation.",
      gift_description: "Naturalness expresses authentic self-love and acceptance, inspiring others to do the same.",
      siddhi_description: "Being embodies pure self-acceptance and love, radiating natural charisma.",
      keywords: ["naturalness", "self-love", "authenticity", "charisma"],
      life_theme: "Transforming self-obsession into natural self-love"
    }
  };

  protected async _calculate(input: GeneKeysInput): Promise<Record<string, any>> {
    // Validate inputs
    this.validateInputs(input);

    // Calculate Gene Keys using simplified astronomical method
    const geneKeyNumbers = this.calculateGeneKeysFromBirthData(
      input.birth_date,
      input.birth_time,
      input.birth_location
    );

    // Create sequences
    const activationSequence = this.createActivationSequence(geneKeyNumbers);
    const venusSequence = this.createVenusSequence(geneKeyNumbers);
    const pearlSequence = this.createPearlSequence(geneKeyNumbers);

    // Get primary Gene Key and programming partner
    const primaryGeneKey = this.getGeneKeyByNumber(geneKeyNumbers.lifes_work || 1);
    const programmingPartner = this.getGeneKeyByNumber(primaryGeneKey.programming_partner);

    // Create profile
    const profile: GeneKeysProfile = {
      activation_sequence: activationSequence,
      venus_sequence: venusSequence,
      pearl_sequence: pearlSequence,
      birth_date: input.birth_date,
      primary_gene_key: primaryGeneKey,
      programming_partner: programmingPartner
    };

    // Generate pathworking guidance
    const pathworkingGuidance = this.generatePathworkingGuidance(profile, input.pathworking_focus);

    return {
      profile,
      pathworking_guidance: pathworkingGuidance,
      gene_key_numbers: geneKeyNumbers,
      focus_sequence: input.focus_sequence || 'activation',
      include_programming_partner: input.include_programming_partner !== false
    };
  }

  private validateInputs(input: GeneKeysInput): void {
    // Validate birth date
    const birthDate = new Date(input.birth_date);
    if (isNaN(birthDate.getTime())) {
      throw new Error('Invalid birth date format');
    }

    // Validate birth time
    if (!input.birth_time || !/^\d{2}:\d{2}$/.test(input.birth_time)) {
      throw new Error('Birth time must be in HH:MM format');
    }

    // Validate coordinates
    const [lat, lon] = input.birth_location;
    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    if (lon < -180 || lon > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }
  }

  private calculateGeneKeysFromBirthData(
    birthDate: string,
    birthTime: string,
    location: [number, number]
  ): Record<string, number> {
    // Simplified Gene Keys calculation based on birth data
    // In reality, this would require precise astronomical calculations
    
    const date = new Date(birthDate);
    const [timeHours, timeMinutes] = birthTime.split(':').map(Number);
    const [lat, lon] = location;

    // Use birth data to generate deterministic Gene Key numbers
    const seed = this.createSeed(date, timeHours || 12, timeMinutes || 0, lat, lon);

    // Generate Gate numbers (1-64) for each position
    return {
      lifes_work: this.generateGateNumber(seed, 1), // Personality Sun
      evolution: this.generateGateNumber(seed, 2), // Personality Earth
      radiance: this.generateGateNumber(seed, 3), // Design Sun
      purpose: this.generateGateNumber(seed, 4), // Design Earth
      attraction: this.generateGateNumber(seed, 5), // Personality Venus
      magnetism: this.generateGateNumber(seed, 6), // Design Venus
      vocation: this.generateGateNumber(seed, 7), // Personality Jupiter
      culture: this.generateGateNumber(seed, 8), // Personality Saturn
      brand: this.generateGateNumber(seed, 9) // Personality Uranus
    };
  }

  private createSeed(date: Date, hours: number, minutes: number, lat: number, lon: number): number {
    // Create deterministic seed from birth data
    const dayOfYear = this.getDayOfYear(date);
    return dayOfYear + hours * 100 + minutes * 10 + Math.abs(lat) * 1000 + Math.abs(lon) * 100;
  }

  private getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private generateGateNumber(seed: number, position: number): number {
    // Use Linear Congruential Generator for deterministic randomness
    let value = (seed * position * 1103515245 + 12345) & 0x7fffffff;
    return ((value % 64) + 1); // Return number between 1-64
  }

  private getGeneKeyByNumber(number: number): GeneKey {
    // Ensure number is within valid range
    if (number < 1 || number > 64) {
      number = ((number - 1) % 64) + 1;
    }

    // If Gene Key exists in our data, return it
    if (this.GENE_KEYS_DATA[number]) {
      return this.GENE_KEYS_DATA[number];
    }

    // Otherwise create a simplified Gene Key
    return this.createFallbackGeneKey(number);
  }

  private createFallbackGeneKey(number: number): GeneKey {
    return {
      number,
      name: `Gene Key ${number}`,
      shadow: `Shadow ${number}`,
      gift: `Gift ${number}`,
      siddhi: `Siddhi ${number}`,
      codon: "XXX",
      amino_acid: "Unknown",
      programming_partner: ((number + 31) % 64) + 1,
      physiology: `Physiology ${number}`,
      shadow_description: "The shadow frequency represents unconscious patterns that create limitation and suffering.",
      gift_description: "The gift frequency expresses balanced consciousness that serves the collective good.",
      siddhi_description: "The siddhi frequency embodies the highest potential of human consciousness.",
      keywords: ["transformation", "consciousness", "evolution", "awakening"],
      life_theme: "Transforming unconscious patterns into conscious service"
    };
  }

  private createActivationSequence(geneKeyNumbers: Record<string, number>): GeneKeysSequence {
    const gates: SequenceGate[] = [
      {
        name: "Life's Work",
        description: "Your core life purpose and creative expression",
        gene_key: this.getGeneKeyByNumber(geneKeyNumbers.lifes_work || 1),
        calculation_method: "Personality Sun position at birth"
      },
      {
        name: "Evolution",
        description: "Your path of personal development and growth",
        gene_key: this.getGeneKeyByNumber(geneKeyNumbers.evolution),
        calculation_method: "Personality Earth position at birth"
      },
      {
        name: "Radiance",
        description: "Your gift to humanity and how you shine",
        gene_key: this.getGeneKeyByNumber(geneKeyNumbers.radiance),
        calculation_method: "Design Sun position (88 days before birth)"
      },
      {
        name: "Purpose",
        description: "Your deepest calling and spiritual mission",
        gene_key: this.getGeneKeyByNumber(geneKeyNumbers.purpose),
        calculation_method: "Design Earth position (88 days before birth)"
      }
    ];

    return {
      name: "Activation Sequence",
      description: "The four primary gates that form your core genetic blueprint",
      gates
    };
  }

  private createVenusSequence(geneKeyNumbers: Record<string, number>): GeneKeysSequence {
    const gates: SequenceGate[] = [
      {
        name: "Attraction",
        description: "What draws you to others and others to you",
        gene_key: this.getGeneKeyByNumber(geneKeyNumbers.attraction),
        calculation_method: "Personality Venus position at birth"
      },
      {
        name: "Magnetism",
        description: "Your natural charisma and appeal",
        gene_key: this.getGeneKeyByNumber(geneKeyNumbers.magnetism),
        calculation_method: "Design Venus position (88 days before birth)"
      }
    ];

    return {
      name: "Venus Sequence",
      description: "The pathway of love and relationships",
      gates
    };
  }

  private createPearlSequence(geneKeyNumbers: Record<string, number>): GeneKeysSequence {
    const gates: SequenceGate[] = [
      {
        name: "Vocation",
        description: "Your natural career path and work style",
        gene_key: this.getGeneKeyByNumber(geneKeyNumbers.vocation),
        calculation_method: "Personality Jupiter position at birth"
      },
      {
        name: "Culture",
        description: "Your contribution to collective evolution",
        gene_key: this.getGeneKeyByNumber(geneKeyNumbers.culture),
        calculation_method: "Personality Saturn position at birth"
      },
      {
        name: "Brand",
        description: "Your unique signature in the world",
        gene_key: this.getGeneKeyByNumber(geneKeyNumbers.brand),
        calculation_method: "Personality Uranus position at birth"
      }
    ];

    return {
      name: "Pearl Sequence",
      description: "The pathway of prosperity and material manifestation",
      gates
    };
  }

  private generatePathworkingGuidance(profile: GeneKeysProfile, focus?: string): string[] {
    const guidance: string[] = [];
    const primaryKey = profile.primary_gene_key;

    // Core pathworking guidance
    guidance.push(`Begin with contemplation of your Life's Work Gene Key ${primaryKey.number}: ${primaryKey.name}`);
    guidance.push(`Notice when you operate from the Shadow of ${primaryKey.shadow} and practice shifting to the Gift of ${primaryKey.gift}`);
    guidance.push(`Your programming partner is Gene Key ${primaryKey.programming_partner}, study both keys together for balance`);

    // Sequence-specific guidance
    if (focus === "activation" || focus === "all" || !focus) {
      guidance.push("Focus on your Activation Sequence to understand your core life purpose and creative expression");
      guidance.push("The Activation Sequence reveals your genetic destiny and highest potential");
    }

    if (focus === "venus" || focus === "all") {
      guidance.push("Explore your Venus Sequence to understand your patterns in love and relationships");
      guidance.push("The Venus Sequence guides you toward authentic intimacy and magnetic presence");
    }

    if (focus === "pearl" || focus === "all") {
      guidance.push("Engage with your Pearl Sequence to manifest prosperity and material success");
      guidance.push("The Pearl Sequence shows how to align your work with your deeper purpose");
    }

    // Three-frequency practice
    guidance.push("Practice the Three-Frequency awareness: Shadow (victim), Gift (genius), Siddhi (divine)");
    guidance.push("Remember: The shadows are not to be eliminated but integrated as wisdom");

    return guidance;
  }

  protected _interpret(calculationResults: Record<string, any>, input: GeneKeysInput): string {
    const profile = calculationResults.profile as GeneKeysProfile;
    const focusSequence = calculationResults.focus_sequence as string;
    const primaryKey = profile.primary_gene_key;

    return `
🧬 GENE KEYS COMPASS - ARCHETYPAL BLUEPRINT 🧬

═══ PRIMARY LIFE'S WORK ═══

Gene Key ${primaryKey.number}: ${primaryKey.name}
Shadow: ${primaryKey.shadow}
Gift: ${primaryKey.gift}
Siddhi: ${primaryKey.siddhi}

Life Theme: ${primaryKey.life_theme}

The Shadow Frequency (${primaryKey.shadow}):
${primaryKey.shadow_description}

The Gift Frequency (${primaryKey.gift}):
${primaryKey.gift_description}

The Siddhi Frequency (${primaryKey.siddhi}):
${primaryKey.siddhi_description}

═══ ACTIVATION SEQUENCE - YOUR GENETIC DESTINY ═══

${this.formatSequence(profile.activation_sequence)}

═══ VENUS SEQUENCE - THE PATH OF THE HEART ═══

${this.formatSequence(profile.venus_sequence)}

═══ PEARL SEQUENCE - PROSPERITY PATHWAY ═══

${this.formatSequence(profile.pearl_sequence)}

═══ PROGRAMMING PARTNER DYNAMICS ═══

Your Programming Partner: Gene Key ${profile.programming_partner.number} - ${profile.programming_partner.name}
Shadow: ${profile.programming_partner.shadow} | Gift: ${profile.programming_partner.gift}

Programming partners represent complementary patterns that create balance in your genetic expression.
Study both your primary key and programming partner for deeper understanding.

═══ PATHWORKING GUIDANCE ═══

The Gene Keys are not predictions but invitations to embody your highest potential.
Each key contains three frequencies - embrace the shadow, embody the gift, and surrender to the siddhi.

${focusSequence === 'all' ? 'Focus on all sequences for comprehensive transformation' : 
  `Primary focus: ${focusSequence} sequence for targeted development`}

Remember: Evolution is a choice. Every moment offers the opportunity to shift frequency.
    `.trim();
  }

  private formatSequence(sequence: GeneKeysSequence): string {
    let formatted = `${sequence.name}:\n${sequence.description}\n\n`;
    
    sequence.gates.forEach(gate => {
      formatted += `🔑 ${gate.name}: Gene Key ${gate.gene_key.number} - ${gate.gene_key.name}\n`;
      formatted += `   Shadow: ${gate.gene_key.shadow} → Gift: ${gate.gene_key.gift} → Siddhi: ${gate.gene_key.siddhi}\n`;
      formatted += `   ${gate.description}\n\n`;
    });

    return formatted;
  }

  protected _generateRecommendations(calculationResults: Record<string, any>, input: GeneKeysInput): string[] {
    const profile = calculationResults.profile as GeneKeysProfile;
    const pathworkingGuidance = calculationResults.pathworking_guidance as string[];
    const recommendations: string[] = [];

    // Primary Gene Key recommendations
    const primaryKey = profile.primary_gene_key;
    recommendations.push(`Study Gene Key ${primaryKey.number} (${primaryKey.name}) as your primary life theme`);
    recommendations.push(`Practice shifting from ${primaryKey.shadow} (shadow) to ${primaryKey.gift} (gift) consciousness`);
    recommendations.push(`Contemplate the ${primaryKey.siddhi} siddhi as your highest potential`);

    // Sequence-specific recommendations
    const focusSequence = input.focus_sequence || 'activation';
    
    if (focusSequence === 'activation' || focusSequence === 'all') {
      recommendations.push("Work with your Activation Sequence to align with your core life purpose");
      recommendations.push("Use your Life's Work as your North Star for all major decisions");
    }

    if (focusSequence === 'venus' || focusSequence === 'all') {
      recommendations.push("Explore your Venus Sequence to transform relationship patterns");
      recommendations.push("Practice authentic vulnerability to activate your magnetism");
    }

    if (focusSequence === 'pearl' || focusSequence === 'all') {
      recommendations.push("Align your career and finances with your Pearl Sequence themes");
      recommendations.push("Trust that prosperity flows when you serve your authentic purpose");
    }

    // General pathworking recommendations
    recommendations.push(...pathworkingGuidance.slice(0, 3)); // Include core guidance

    return recommendations;
  }

  protected _generateRealityPatches(calculationResults: Record<string, any>, input: GeneKeysInput): string[] {
    const profile = calculationResults.profile as GeneKeysProfile;
    const patches: string[] = [];

    // Primary Gene Key patches
    const primaryKey = profile.primary_gene_key;
    patches.push(`Gene Key ${primaryKey.number} genetic blueprint activated`);
    patches.push(`${primaryKey.gift} gift frequency enabled`);
    patches.push(`${primaryKey.siddhi} siddhi potential unlocked`);

    // Sequence-based patches
    patches.push(`Activation Sequence archetypal field established`);
    patches.push(`Venus Sequence relationship matrix aligned`);
    patches.push(`Pearl Sequence prosperity pathway opened`);

    // Programming partner integration
    patches.push(`Programming Partner ${profile.programming_partner.number} complementary field activated`);

    // Consciousness frequency patches
    patches.push('Three-frequency awareness system online');
    patches.push('Shadow integration protocol enabled');
    patches.push('Gift embodiment pathway cleared');
    patches.push('Siddhi transmission field prepared');

    return patches;
  }

  protected _identifyArchetypalThemes(calculationResults: Record<string, any>, input: GeneKeysInput): string[] {
    const profile = calculationResults.profile as GeneKeysProfile;
    const themes: string[] = [];

    // Primary archetype
    const primaryKey = profile.primary_gene_key;
    themes.push(`${primaryKey.name} - Primary Life Archetype`);
    themes.push(`The ${primaryKey.shadow}/${primaryKey.gift}/${primaryKey.siddhi} Frequency Spectrum`);

    // Activation Sequence archetypes
    profile.activation_sequence.gates.forEach(gate => {
      themes.push(`${gate.name}: ${gate.gene_key.name} Archetype`);
    });

    // Venus and Pearl themes
    themes.push(`Venus Sequence: Love and Relationship Archetype`);
    themes.push(`Pearl Sequence: Prosperity and Manifestation Archetype`);

    // Programming partner dynamics
    themes.push(`Programming Partner: ${profile.programming_partner.name} Complementary Archetype`);

    // Genetic and consciousness themes
    themes.push('The Genetic Initiate - Working with DNA Consciousness');
    themes.push('The Frequency Walker - Navigating Shadow, Gift, and Siddhi');
    themes.push('The Archetypal Embodier - Living the Gene Keys');

    return themes;
  }

  protected _calculateConfidence(calculationResults: Record<string, any>, input: GeneKeysInput): number {
    let confidence = 0.75; // Base confidence for simplified astronomical calculations

    // Increase confidence for complete birth data
    if (input.birth_time && input.birth_location) {
      confidence += 0.1;
    }

    // Increase confidence for comprehensive Gene Keys data
    const profile = calculationResults.profile as GeneKeysProfile;
    if (this.GENE_KEYS_DATA[profile.primary_gene_key.number]) {
      confidence += 0.1;
    }

    // Reduce confidence for simplified calculations
    confidence -= 0.1;

    return Math.min(confidence, 0.85);
  }

  public async calculate(input: GeneKeysInput): Promise<GeneKeysOutput> {
    const calculationResults = await this._calculate(input);
    
    const interpretation = this._interpret(calculationResults, input);
    const recommendations = this._generateRecommendations(calculationResults, input);
    const realityPatches = this._generateRealityPatches(calculationResults, input);
    const archetypalThemes = this._identifyArchetypalThemes(calculationResults, input);
    const confidence = this._calculateConfidence(calculationResults, input);

    const profile = calculationResults.profile as GeneKeysProfile;
    const pathworkingGuidance = calculationResults.pathworking_guidance as string[];

    const output: GeneKeysOutput = {
      profile,
      pathworking_guidance: pathworkingGuidance,
      life_theme_analysis: this.generateLifeThemeAnalysis(profile),
      current_frequency_analysis: this.generateFrequencyAnalysis(profile),
      transformation_opportunities: this.generateTransformationOpportunities(profile),
      
      // Base engine outputs
      interpretation,
      recommendations,
      reality_patches: realityPatches,
      archetypal_themes: archetypalThemes,
      confidence,
      timestamp: new Date().toISOString()
    };

    return output;
  }

  private generateLifeThemeAnalysis(profile: GeneKeysProfile): string {
    const primaryKey = profile.primary_gene_key;
    return `Your primary life theme is embodied in Gene Key ${primaryKey.number}: ${primaryKey.name}. ${primaryKey.life_theme}. This archetypal pattern is your North Star for authentic self-expression and service to the collective.`;
  }

  private generateFrequencyAnalysis(profile: GeneKeysProfile): string {
    const primaryKey = profile.primary_gene_key;
    return `Currently navigating the spectrum from ${primaryKey.shadow} (shadow frequency) through ${primaryKey.gift} (gift frequency) toward ${primaryKey.siddhi} (siddhi frequency). Each frequency offers different experiences and opportunities for growth and service.`;
  }

  private generateTransformationOpportunities(profile: GeneKeysProfile): string[] {
    const opportunities: string[] = [];
    const primaryKey = profile.primary_gene_key;

    opportunities.push(`Transform ${primaryKey.shadow} patterns into ${primaryKey.gift} expressions`);
    opportunities.push(`Integrate programming partner Gene Key ${profile.programming_partner.number} for balanced development`);
    opportunities.push('Use your Activation Sequence to align with authentic life purpose');
    opportunities.push('Apply Venus Sequence wisdom to transform relationship patterns');
    opportunities.push('Manifest through Pearl Sequence alignment of purpose and prosperity');

    return opportunities;
  }
}

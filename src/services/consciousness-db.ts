/**
 * Unified Consciousness Database Service
 * Replaces ALL file dependencies for consciousness engines
 * Provides fast, indexed access to all engine data
 */

export interface HumanDesignGate {
  id: number;
  number: number;
  name: string;
  keynote: string;
  description: string;
  center: string;
  channel_partner: number;
  gift: string;
  shadow: string;
  siddhi: string;
  codon: string;
  amino_acid: string;
}

export interface GeneKey {
  id: number;
  number: number;
  name: string;
  shadow: string;
  gift: string;
  siddhi: string;
  description: string;
  programming_partner: number;
  codon: string;
  amino_acid: string;
}

export interface TarotCard {
  id: number;
  number: number;
  name: string;
  suit: string;
  arcana: string;
  description: string;
  upright_meaning: string;
  reversed_meaning: string;
  keywords: string;
  symbolism: string;
}

export interface IChingHexagram {
  id: number;
  number: number;
  name: string;
  chinese_name: string;
  description: string;
  judgment: string;
  image: string;
  upper_trigram: string;
  lower_trigram: string;
}

export interface NumerologyLifePath {
  id: number;
  number: number;
  name: string;
  description: string;
  characteristics: string;
  challenges: string;
  opportunities: string;
  compatibility: string;
}

export interface EnneagramType {
  id: number;
  number: number;
  name: string;
  description: string;
  core_motivation: string;
  core_fear: string;
  basic_desire: string;
  key_motivations: string;
  levels_of_development: string;
  wings: string;
  stress_direction: number;
  growth_direction: number;
}

export class ConsciousnessDB {
  constructor(private db: D1Database) {}

  // =====================================================
  // HUMAN DESIGN DATA ACCESS
  // =====================================================

  async getHumanDesignGate(gateNumber: number): Promise<HumanDesignGate | null> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_gates WHERE number = ?'
    ).bind(gateNumber).first();
    return result as HumanDesignGate | null;
  }

  async getAllHumanDesignGates(): Promise<HumanDesignGate[]> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_gates ORDER BY number'
    ).all();
    return result.results as HumanDesignGate[];
  }

  async getHumanDesignChannel(gate1: number, gate2: number) {
    const result = await this.db.prepare(
      'SELECT * FROM hd_channels WHERE (gate1 = ? AND gate2 = ?) OR (gate1 = ? AND gate2 = ?)'
    ).bind(gate1, gate2, gate2, gate1).first();
    return result;
  }

  async getHumanDesignCenter(centerName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM hd_centers WHERE name = ?'
    ).bind(centerName).first();
    return result;
  }

  async getHumanDesignType(typeName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM hd_types WHERE name = ?'
    ).bind(typeName).first();
    return result;
  }

  async getHumanDesignAuthority(authorityName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM hd_authorities WHERE name = ?'
    ).bind(authorityName).first();
    return result;
  }

  async getHumanDesignProfile(profileString: string) {
    const result = await this.db.prepare(
      'SELECT * FROM hd_profiles WHERE profile = ?'
    ).bind(profileString).first();
    return result;
  }

  // =====================================================
  // GENE KEYS DATA ACCESS
  // =====================================================

  async getGeneKey(geneKeyNumber: number): Promise<GeneKey | null> {
    const result = await this.db.prepare(
      'SELECT * FROM gk_gene_keys WHERE number = ?'
    ).bind(geneKeyNumber).first();
    return result as GeneKey | null;
  }

  async getAllGeneKeys(): Promise<GeneKey[]> {
    const result = await this.db.prepare(
      'SELECT * FROM gk_gene_keys ORDER BY number'
    ).all();
    return result.results as GeneKey[];
  }

  async getGeneKeySphere(sphereName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM gk_spheres WHERE name = ?'
    ).bind(sphereName).first();
    return result;
  }

  async getGeneKeysSequence(sequenceName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM gk_sequences WHERE name = ?'
    ).bind(sequenceName).first();
    return result;
  }

  // =====================================================
  // TAROT DATA ACCESS
  // =====================================================

  async getTarotCard(cardName: string): Promise<TarotCard | null> {
    const result = await this.db.prepare(
      'SELECT * FROM tarot_cards WHERE name = ?'
    ).bind(cardName).first();
    return result as TarotCard | null;
  }

  async getTarotCardByNumber(number: number): Promise<TarotCard | null> {
    const result = await this.db.prepare(
      'SELECT * FROM tarot_cards WHERE number = ?'
    ).bind(number).first();
    return result as TarotCard | null;
  }

  async getTarotCardsBySuit(suit: string): Promise<TarotCard[]> {
    const result = await this.db.prepare(
      'SELECT * FROM tarot_cards WHERE suit = ? ORDER BY number'
    ).bind(suit).all();
    return result.results as TarotCard[];
  }

  async getAllTarotCards(): Promise<TarotCard[]> {
    const result = await this.db.prepare(
      'SELECT * FROM tarot_cards ORDER BY number'
    ).all();
    return result.results as TarotCard[];
  }

  // =====================================================
  // I CHING DATA ACCESS
  // =====================================================

  async getIChingHexagram(hexagramNumber: number): Promise<IChingHexagram | null> {
    const result = await this.db.prepare(
      'SELECT * FROM iching_hexagrams WHERE number = ?'
    ).bind(hexagramNumber).first();
    return result as IChingHexagram | null;
  }

  async getAllIChingHexagrams(): Promise<IChingHexagram[]> {
    const result = await this.db.prepare(
      'SELECT * FROM iching_hexagrams ORDER BY number'
    ).all();
    return result.results as IChingHexagram[];
  }

  async getIChingLines(hexagramNumber: number) {
    const result = await this.db.prepare(
      'SELECT * FROM iching_lines WHERE hexagram_number = ? ORDER BY line_number'
    ).bind(hexagramNumber).all();
    return result.results;
  }

  // =====================================================
  // NUMEROLOGY DATA ACCESS
  // =====================================================

  async getNumerologyLifePath(number: number): Promise<NumerologyLifePath | null> {
    const result = await this.db.prepare(
      'SELECT * FROM num_life_paths WHERE number = ?'
    ).bind(number).first();
    return result as NumerologyLifePath | null;
  }

  async getNumerologyExpression(number: number) {
    const result = await this.db.prepare(
      'SELECT * FROM num_expressions WHERE number = ?'
    ).bind(number).first();
    return result;
  }

  // =====================================================
  // ENNEAGRAM DATA ACCESS
  // =====================================================

  async getEnneagramType(typeNumber: number): Promise<EnneagramType | null> {
    const result = await this.db.prepare(
      'SELECT * FROM enn_types WHERE number = ?'
    ).bind(typeNumber).first();
    return result as EnneagramType | null;
  }

  async getAllEnneagramTypes(): Promise<EnneagramType[]> {
    const result = await this.db.prepare(
      'SELECT * FROM enn_types ORDER BY number'
    ).all();
    return result.results as EnneagramType[];
  }

  async getEnneagramInstinct(instinctName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM enn_instincts WHERE name = ?'
    ).bind(instinctName).first();
    return result;
  }

  // =====================================================
  // VIMSHOTTARI DATA ACCESS
  // =====================================================

  async getVimshottariPlanet(planetName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM vim_planets WHERE name = ?'
    ).bind(planetName).first();
    return result;
  }

  async getVimshottariPeriods(planet: string) {
    const result = await this.db.prepare(
      'SELECT * FROM vim_periods WHERE planet = ?'
    ).bind(planet).all();
    return result.results;
  }

  // =====================================================
  // BIORHYTHM DATA ACCESS
  // =====================================================

  async getBiorhythmCycle(cycleName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM bio_cycles WHERE name = ?'
    ).bind(cycleName).first();
    return result;
  }

  async getAllBiorhythmCycles() {
    const result = await this.db.prepare(
      'SELECT * FROM bio_cycles ORDER BY period_days'
    ).all();
    return result.results;
  }

  // =====================================================
  // SACRED GEOMETRY DATA ACCESS
  // =====================================================

  async getSacredGeometryPattern(patternName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM sg_patterns WHERE name = ?'
    ).bind(patternName).first();
    return result;
  }

  async getAllSacredGeometryPatterns() {
    const result = await this.db.prepare(
      'SELECT * FROM sg_patterns ORDER BY name'
    ).all();
    return result.results;
  }

  // =====================================================
  // SIGIL FORGE DATA ACCESS
  // =====================================================

  async getSigilSymbol(symbolName: string) {
    const result = await this.db.prepare(
      'SELECT * FROM sf_symbols WHERE name = ?'
    ).bind(symbolName).first();
    return result;
  }

  async getAllSigilSymbols() {
    const result = await this.db.prepare(
      'SELECT * FROM sf_symbols ORDER BY name'
    ).all();
    return result.results;
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Initialize all database tables
   */
  async initializeDatabase(): Promise<void> {
    console.log('🗄️ Initializing consciousness database...');
    
    // Import and execute the complete schema
    const { COMPLETE_SCHEMA } = await import('../../scripts/comprehensive-data-migration');
    
    const statements = COMPLETE_SCHEMA.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await this.db.prepare(statement).run();
      }
    }
    
    console.log('✅ Database initialized successfully');
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    
    const tables = [
      'hd_gates', 'hd_channels', 'hd_centers', 'hd_types', 'hd_authorities', 'hd_profiles',
      'gk_gene_keys', 'gk_spheres', 'gk_sequences',
      'tarot_cards', 'iching_hexagrams', 'iching_lines',
      'num_life_paths', 'num_expressions',
      'enn_types', 'enn_instincts',
      'vim_planets', 'vim_periods',
      'bio_cycles', 'sg_patterns', 'sf_symbols',
      'astro_positions'
    ];

    for (const table of tables) {
      try {
        const result = await this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).first();
        stats[table] = (result as any)?.count || 0;
      } catch (error) {
        stats[table] = 0;
      }
    }

    return stats;
  }
}

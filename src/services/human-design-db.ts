/**
 * Human Design Database Service
 * Provides access to Human Design data stored in Cloudflare D1
 * Replaces direct file access to prevent code bloat
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

export interface HumanDesignChannel {
  id: number;
  number: number;
  name: string;
  description: string;
  gate1: number;
  gate2: number;
  center1: string;
  center2: string;
  circuitry: string;
  theme: string;
}

export interface HumanDesignCenter {
  id: number;
  name: string;
  description: string;
  theme: string;
  function: string;
  biological_correlation: string;
  defined_characteristics: string;
  undefined_characteristics: string;
}

export interface HumanDesignType {
  id: number;
  name: string;
  description: string;
  strategy: string;
  signature: string;
  not_self_theme: string;
  percentage: number;
  characteristics: string;
}

export interface HumanDesignAuthority {
  id: number;
  name: string;
  description: string;
  decision_making: string;
  characteristics: string;
  centers_required: string;
}

export interface HumanDesignProfile {
  id: number;
  profile: string;
  name: string;
  description: string;
  line1_description: string;
  line2_description: string;
  theme: string;
  characteristics: string;
}

export class HumanDesignDB {
  constructor(private db: D1Database) {}

  /**
   * Get gate information by number
   */
  async getGate(gateNumber: number): Promise<HumanDesignGate | null> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_gates WHERE number = ?'
    ).bind(gateNumber).first();
    
    return result as HumanDesignGate | null;
  }

  /**
   * Get all gates
   */
  async getAllGates(): Promise<HumanDesignGate[]> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_gates ORDER BY number'
    ).all();
    
    return result.results as HumanDesignGate[];
  }

  /**
   * Get channel by gate pair
   */
  async getChannelByGates(gate1: number, gate2: number): Promise<HumanDesignChannel | null> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_channels WHERE (gate1 = ? AND gate2 = ?) OR (gate1 = ? AND gate2 = ?)'
    ).bind(gate1, gate2, gate2, gate1).first();
    
    return result as HumanDesignChannel | null;
  }

  /**
   * Get all channels
   */
  async getAllChannels(): Promise<HumanDesignChannel[]> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_channels ORDER BY number'
    ).all();
    
    return result.results as HumanDesignChannel[];
  }

  /**
   * Get center information
   */
  async getCenter(centerName: string): Promise<HumanDesignCenter | null> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_centers WHERE name = ?'
    ).bind(centerName).first();
    
    return result as HumanDesignCenter | null;
  }

  /**
   * Get all centers
   */
  async getAllCenters(): Promise<HumanDesignCenter[]> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_centers'
    ).all();
    
    return result.results as HumanDesignCenter[];
  }

  /**
   * Get type information
   */
  async getType(typeName: string): Promise<HumanDesignType | null> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_types WHERE name = ?'
    ).bind(typeName).first();
    
    return result.results as HumanDesignType | null;
  }

  /**
   * Get authority information
   */
  async getAuthority(authorityName: string): Promise<HumanDesignAuthority | null> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_authorities WHERE name = ?'
    ).bind(authorityName).first();
    
    return result as HumanDesignAuthority | null;
  }

  /**
   * Get profile information
   */
  async getProfile(profileString: string): Promise<HumanDesignProfile | null> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_profiles WHERE profile = ?'
    ).bind(profileString).first();
    
    return result as HumanDesignProfile | null;
  }

  /**
   * Get channels that connect to a specific center
   */
  async getChannelsForCenter(centerName: string): Promise<HumanDesignChannel[]> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_channels WHERE center1 = ? OR center2 = ?'
    ).bind(centerName, centerName).all();
    
    return result.results as HumanDesignChannel[];
  }

  /**
   * Get gates that belong to a specific center
   */
  async getGatesForCenter(centerName: string): Promise<HumanDesignGate[]> {
    const result = await this.db.prepare(
      'SELECT * FROM hd_gates WHERE center = ?'
    ).bind(centerName).all();
    
    return result.results as HumanDesignGate[];
  }

  /**
   * Initialize database with schema (for migration)
   */
  async initializeSchema(): Promise<void> {
    const schema = `
      CREATE TABLE IF NOT EXISTS hd_gates (
        id INTEGER PRIMARY KEY,
        number INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        keynote TEXT,
        description TEXT,
        center TEXT,
        channel_partner INTEGER,
        gift TEXT,
        shadow TEXT,
        siddhi TEXT,
        codon TEXT,
        amino_acid TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hd_channels (
        id INTEGER PRIMARY KEY,
        number INTEGER UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        gate1 INTEGER NOT NULL,
        gate2 INTEGER NOT NULL,
        center1 TEXT,
        center2 TEXT,
        circuitry TEXT,
        theme TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hd_centers (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        theme TEXT,
        function TEXT,
        biological_correlation TEXT,
        defined_characteristics TEXT,
        undefined_characteristics TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hd_types (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        strategy TEXT,
        signature TEXT,
        not_self_theme TEXT,
        percentage REAL,
        characteristics TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hd_authorities (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        decision_making TEXT,
        characteristics TEXT,
        centers_required TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hd_profiles (
        id INTEGER PRIMARY KEY,
        profile TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        line1_description TEXT,
        line2_description TEXT,
        theme TEXT,
        characteristics TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Execute schema creation
    const statements = schema.split(';').filter(s => s.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await this.db.prepare(statement).run();
      }
    }
  }
}

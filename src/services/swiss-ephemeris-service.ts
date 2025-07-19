/**
 * Swiss Ephemeris Service for WitnessOS
 * Integrates with Render.com astronomical service for 100% accurate calculations
 * Replaces all JavaScript VSOP87 approximations with professional-grade Swiss Ephemeris
 */

export interface SwissEphemerisPosition {
  longitude: number;
  latitude: number;
  distance: number;
  zodiac_sign: string;
  zodiac_degree: number;
  human_design_gate: {
    gate: number;
    line: number;
    longitude: number;
    gate_position: number;
  };
}

export interface SwissEphemerisResponse {
  success: boolean;
  birth_data: {
    date: string;
    time: string;
    latitude: number;
    longitude: number;
    timezone_offset: number;
    julian_day: number;
  };
  personality: Record<string, SwissEphemerisPosition>;
  design: Record<string, SwissEphemerisPosition>;
  engine: string;
  accuracy: string;
  calculated_at: string;
  error?: string;
}

export class SwissEphemerisService {
  private readonly serviceUrl: string;
  private readonly db: D1Database;

  constructor(db: D1Database, serviceUrl?: string) {
    this.db = db;
    // Use the deployed Render service URL
    this.serviceUrl = serviceUrl || 'https://witnessos-astronomical-service.onrender.com';
  }

  /**
   * Get accurate planetary positions using Swiss Ephemeris
   * This is the REAL astronomical calculation that replaces all approximations
   * Handles Render.com free tier cold starts with robust retry logic
   */
  async getAccuratePlanetaryPositions(
    birthDate: Date,
    latitude: number,
    longitude: number,
    timezoneOffset: number = 0
  ): Promise<SwissEphemerisResponse> {
    console.log('🌟 SwissEphemerisService: Getting REAL astronomical data from Swiss Ephemeris');

    // Check cache first for performance
    const cached = await this.getCachedPositions(birthDate, latitude, longitude);
    if (cached) {
      console.log('✅ Using cached Swiss Ephemeris data');
      return cached;
    }

    // Format date and time for Swiss Ephemeris service
    const birthDateStr = birthDate.toISOString().split('T')[0]; // "1991-08-13"
    const birthTimeStr = birthDate.toISOString().split('T')[1].substring(0, 5); // "08:01"

    const requestData = {
      birth_date: birthDateStr,
      birth_time: birthTimeStr,
      latitude,
      longitude,
      timezone_offset: timezoneOffset
    };

    console.log('📡 Calling Swiss Ephemeris service:', this.serviceUrl);
    console.log('📊 Request data:', requestData);

    // Robust API call with retries for Render.com free tier cold starts
    const astronomicalData = await this.callSwissEphemerisWithRetries(requestData);

    console.log('✅ Swiss Ephemeris calculation successful');
    console.log(`🌟 Personality Sun: Gate ${astronomicalData.personality.SUN.human_design_gate.gate}.${astronomicalData.personality.SUN.human_design_gate.line}`);
    console.log(`🌙 Design Sun: Gate ${astronomicalData.design.SUN.human_design_gate.gate}.${astronomicalData.design.SUN.human_design_gate.line}`);

    // Cache the results for future use
    await this.cachePositions(birthDate, latitude, longitude, astronomicalData);

    return astronomicalData;
  }

  /**
   * Call Swiss Ephemeris service with robust retry logic for Render.com free tier
   * Handles cold starts that can take 50+ seconds
   */
  private async callSwissEphemerisWithRetries(requestData: any): Promise<SwissEphemerisResponse> {
    const maxRetries = 3;
    const timeouts = [60000, 90000, 120000]; // 60s, 90s, 120s - accommodate cold starts

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`🔄 Swiss Ephemeris attempt ${attempt + 1}/${maxRetries} (timeout: ${timeouts[attempt]/1000}s)`);

        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeouts[attempt]);

        const response = await fetch(`${this.serviceUrl}/calculate-positions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'WitnessOS-Cloudflare-Worker'
          },
          body: JSON.stringify(requestData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const astronomicalData: SwissEphemerisResponse = await response.json();

        if (!astronomicalData.success) {
          throw new Error(`Swiss Ephemeris calculation failed: ${astronomicalData.error}`);
        }

        console.log(`✅ Swiss Ephemeris succeeded on attempt ${attempt + 1}`);
        return astronomicalData;

      } catch (error) {
        const isLastAttempt = attempt === maxRetries - 1;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (errorMessage.includes('aborted')) {
          console.warn(`⏰ Swiss Ephemeris timeout on attempt ${attempt + 1} (${timeouts[attempt]/1000}s)`);
        } else {
          console.warn(`⚠️ Swiss Ephemeris error on attempt ${attempt + 1}: ${errorMessage}`);
        }

        if (isLastAttempt) {
          console.error('❌ Swiss Ephemeris failed after all retries');
          throw new Error(`Swiss Ephemeris service unavailable after ${maxRetries} attempts: ${errorMessage}`);
        }

        // Wait before retry (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 5000);
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    throw new Error('Swiss Ephemeris service failed - this should never be reached');
  }

  /**
   * Test with Sheshnarayan's birth data
   * Should return Generator type, not Reflector
   */
  async testSheshnarayanData(): Promise<SwissEphemerisResponse> {
    console.log('🧪 Testing Swiss Ephemeris with Sheshnarayan birth data');
    
    try {
      const response = await fetch(`${this.serviceUrl}/test-sheshnarayan`, {
        method: 'GET',
        headers: {
          'User-Agent': 'WitnessOS-Cloudflare-Worker'
        }
      });

      if (!response.ok) {
        throw new Error(`Test endpoint error: ${response.status}`);
      }

      const testResult: SwissEphemerisResponse = await response.json();
      
      console.log('🎯 Test Results:');
      console.log(`Personality Sun: Gate ${testResult.personality.SUN.human_design_gate.gate}.${testResult.personality.SUN.human_design_gate.line}`);
      console.log(`Design Sun: Gate ${testResult.design.SUN.human_design_gate.gate}.${testResult.design.SUN.human_design_gate.line}`);
      
      return testResult;

    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  /**
   * Check service health
   */
  async checkServiceHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serviceUrl}/`, {
        method: 'GET',
        headers: {
          'User-Agent': 'WitnessOS-Cloudflare-Worker'
        }
      });

      if (response.ok) {
        const health = await response.json();
        console.log('✅ Swiss Ephemeris service healthy:', health);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Swiss Ephemeris service health check failed:', error);
      return false;
    }
  }

  /**
   * Cache astronomical positions for performance
   */
  private async cachePositions(
    birthDate: Date,
    latitude: number,
    longitude: number,
    data: SwissEphemerisResponse
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(birthDate, latitude, longitude);
      
      await this.db.prepare(`
        INSERT OR REPLACE INTO swiss_ephemeris_cache 
        (cache_key, birth_date, birth_time, latitude, longitude, data, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        cacheKey,
        data.birth_data.date,
        data.birth_data.time,
        latitude,
        longitude,
        JSON.stringify(data),
        new Date().toISOString()
      ).run();

      console.log('💾 Swiss Ephemeris data cached successfully');
    } catch (error) {
      console.warn('⚠️ Failed to cache Swiss Ephemeris data:', error);
      // Don't throw - caching failure shouldn't break the calculation
    }
  }

  /**
   * Get cached astronomical positions
   */
  private async getCachedPositions(
    birthDate: Date,
    latitude: number,
    longitude: number
  ): Promise<SwissEphemerisResponse | null> {
    try {
      const cacheKey = this.getCacheKey(birthDate, latitude, longitude);
      
      const result = await this.db.prepare(`
        SELECT data FROM swiss_ephemeris_cache 
        WHERE cache_key = ? AND created_at > datetime('now', '-30 days')
      `).bind(cacheKey).first();

      if (result) {
        return JSON.parse(result.data as string);
      }

      return null;
    } catch (error) {
      console.warn('⚠️ Failed to retrieve cached data:', error);
      return null;
    }
  }

  /**
   * Generate cache key for birth data
   */
  private getCacheKey(birthDate: Date, latitude: number, longitude: number): string {
    const dateStr = birthDate.toISOString().split('T')[0];
    const timeStr = birthDate.toISOString().split('T')[1].substring(0, 5);
    const latStr = latitude.toFixed(4);
    const lonStr = longitude.toFixed(4);
    
    return `${dateStr}_${timeStr}_${latStr}_${lonStr}`;
  }

  /**
   * Initialize cache table
   */
  async initializeCache(): Promise<void> {
    try {
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS swiss_ephemeris_cache (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cache_key TEXT UNIQUE NOT NULL,
          birth_date TEXT NOT NULL,
          birth_time TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          data TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Create index for faster lookups
      await this.db.prepare(`
        CREATE INDEX IF NOT EXISTS idx_cache_key ON swiss_ephemeris_cache(cache_key)
      `).run();

      console.log('✅ Swiss Ephemeris cache initialized');
    } catch (error) {
      console.error('❌ Failed to initialize cache:', error);
    }
  }
}

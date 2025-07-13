/**
 * Astronomical Calculator for Human Design
 * Uses ephemeris library for accurate planetary positions
 */

import * as ephemeris from 'ephemeris';

export interface PlanetaryPosition {
  longitude: number;
  latitude: number;
  distance: number;
  rightAscension: number;
  declination: number;
}

export interface HumanDesignGatePosition {
  gate: number;
  line: number;
  planet: string;
  longitude: number;
  zodiacDegree: number;
}

export class AstronomicalCalculator {
  
  /**
   * Calculate planetary positions for a given date, time, and location
   */
  calculatePlanetaryPositions(
    birthDate: Date,
    latitude: number,
    longitude: number
  ): Record<string, PlanetaryPosition> {
    const positions: Record<string, PlanetaryPosition> = {};

    const planets = [
      'sun', 'moon', 'mercury', 'venus', 'mars',
      'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'
    ];

    for (const planet of planets) {
      try {
        // Calculate planetary position using ephemeris with Date object
        const allPlanets = ephemeris.getAllPlanets(birthDate, latitude, longitude, 0);
        const position = allPlanets[planet];

        if (position) {
          positions[planet.toUpperCase()] = {
            longitude: position.apparentLongitude || position.longitude || 0,
            latitude: position.latitude || 0,
            distance: position.distance || 1,
            rightAscension: position.rightAscension || 0,
            declination: position.declination || 0
          };
        }
      } catch (error) {
        console.warn(`Failed to calculate position for ${planet}:`, error);
        // Fallback to simplified calculation
        positions[planet.toUpperCase()] = this.getSimplifiedPlanetPosition(planet, birthDate);
      }
    }

    // Calculate lunar nodes (simplified approximation)
    try {
      const moonPos = positions['MOON'];
      if (moonPos) {
        const northNodeLon = (moonPos.longitude + 180) % 360;
        const southNodeLon = (northNodeLon + 180) % 360;

        positions['NORTH_NODE'] = {
          longitude: northNodeLon,
          latitude: 0,
          distance: 1,
          rightAscension: 0,
          declination: 0
        };

        positions['SOUTH_NODE'] = {
          longitude: southNodeLon,
          latitude: 0,
          distance: 1,
          rightAscension: 0,
          declination: 0
        };
      }
    } catch (error) {
      console.warn('Failed to calculate lunar nodes:', error);
    }

    return positions;
  }

  /**
   * Simplified planetary position calculation as fallback
   */
  private getSimplifiedPlanetPosition(planet: string, date: Date): PlanetaryPosition {
    // This is a very simplified calculation for demonstration
    // In a real implementation, you'd use proper astronomical algorithms
    const daysSinceEpoch = (date.getTime() - new Date('2000-01-01').getTime()) / (1000 * 60 * 60 * 24);

    // Simplified orbital periods and starting positions
    const orbitalData: Record<string, { period: number; startLon: number }> = {
      sun: { period: 365.25, startLon: 280 },
      moon: { period: 27.3, startLon: 0 },
      mercury: { period: 88, startLon: 0 },
      venus: { period: 225, startLon: 50 },
      mars: { period: 687, startLon: 100 },
      jupiter: { period: 4333, startLon: 150 },
      saturn: { period: 10759, startLon: 200 },
      uranus: { period: 30687, startLon: 250 },
      neptune: { period: 60190, startLon: 300 },
      pluto: { period: 90560, startLon: 350 }
    };

    const data = orbitalData[planet] || { period: 365, startLon: 0 };
    const longitude = (data.startLon + (daysSinceEpoch / data.period) * 360) % 360;

    return {
      longitude,
      latitude: 0,
      distance: 1,
      rightAscension: 0,
      declination: 0
    };
  }
  
  /**
   * Convert JavaScript Date to Julian Day Number
   */
  private dateToJulianDay(date: Date): number {
    const a = Math.floor((14 - (date.getMonth() + 1)) / 12);
    const y = date.getFullYear() + 4800 - a;
    const m = (date.getMonth() + 1) + 12 * a - 3;

    const jdn = date.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    // Add time of day
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();

    const timeOfDay = (hours - 12) / 24 + minutes / 1440 + seconds / 86400 + milliseconds / 86400000;

    return jdn + timeOfDay;
  }
  
  /**
   * Calculate Design time (88 degrees of solar arc before birth)
   * This is approximately 88-89 days before birth
   */
  calculateDesignTime(birthDate: Date): Date {
    // 88 degrees of solar arc ≈ 88.7 days
    const designDays = 88.7;
    const designTime = new Date(birthDate.getTime() - (designDays * 24 * 60 * 60 * 1000));
    return designTime;
  }
  
  /**
   * Convert ecliptic longitude to Human Design gate
   * Human Design uses a specific mapping of the 360-degree zodiac to 64 gates
   */
  longitudeToGate(longitude: number): { gate: number; line: number } {
    // Normalize longitude to 0-360
    const normalizedLon = ((longitude % 360) + 360) % 360;
    
    // Each gate covers 360/64 = 5.625 degrees
    const degreesPerGate = 360 / 64;
    
    // Human Design starts at 0° Aries with Gate 41
    // The gate sequence follows the I-Ching wheel
    const gateSequence = [
      41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
      27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
      31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
      28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
    ];
    
    // Calculate which gate this longitude falls into
    const gateIndex = Math.floor(normalizedLon / degreesPerGate);
    const gate = gateSequence[gateIndex % 64];
    
    // Calculate line (1-6) within the gate
    const positionInGate = (normalizedLon % degreesPerGate) / degreesPerGate;
    const line = Math.floor(positionInGate * 6) + 1;
    
    return { gate, line: Math.min(line, 6) };
  }
  
  /**
   * Calculate all Human Design gate positions for personality (birth time)
   */
  calculatePersonalityGates(
    birthDate: Date,
    latitude: number,
    longitude: number
  ): Record<string, HumanDesignGatePosition> {
    const positions = this.calculatePlanetaryPositions(birthDate, latitude, longitude);
    const gates: Record<string, HumanDesignGatePosition> = {};
    
    for (const [planet, position] of Object.entries(positions)) {
      const gateInfo = this.longitudeToGate(position.longitude);
      
      gates[planet] = {
        gate: gateInfo.gate,
        line: gateInfo.line,
        planet,
        longitude: position.longitude,
        zodiacDegree: position.longitude
      };
      
      // Calculate Earth position (opposite of Sun)
      if (planet === 'SUN') {
        const earthLongitude = (position.longitude + 180) % 360;
        const earthGateInfo = this.longitudeToGate(earthLongitude);
        
        gates['EARTH'] = {
          gate: earthGateInfo.gate,
          line: earthGateInfo.line,
          planet: 'EARTH',
          longitude: earthLongitude,
          zodiacDegree: earthLongitude
        };
      }
    }
    
    return gates;
  }
  
  /**
   * Calculate all Human Design gate positions for design (88 degrees before birth)
   */
  calculateDesignGates(
    birthDate: Date,
    latitude: number,
    longitude: number
  ): Record<string, HumanDesignGatePosition> {
    const designTime = this.calculateDesignTime(birthDate);
    return this.calculatePersonalityGates(designTime, latitude, longitude);
  }
}

// Export singleton instance
export const astronomicalCalculator = new AstronomicalCalculator();

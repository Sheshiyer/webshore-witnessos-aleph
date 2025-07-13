/**
 * Astrology Calculator for Human Design
 * 
 * Provides precise astronomical calculations using Swiss Ephemeris
 * Replaces the simplified mock calculations with real astronomical data
 */

import * as sweph from 'sweph';

// Human Design specific constants
const HUMAN_DESIGN_OFFSET = 58.0; // 58 degrees offset for Human Design gate mapping
const SOLAR_ARC_DEGREES = 88.0; // 88 degrees for Design time calculation
const SECONDS_PER_DAY = 86400;
const JULIAN_DAY_OFFSET = 2440587.5; // Unix epoch to Julian Day conversion

// Swiss Ephemeris constants (hardcoded since they're not exported properly)
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MERCURY = 2;
const SE_VENUS = 3;
const SE_MARS = 4;
const SE_JUPITER = 5;
const SE_SATURN = 6;
const SE_URANUS = 7;
const SE_NEPTUNE = 8;
const SE_PLUTO = 9;
const SE_TRUE_NODE = 11;
const SE_GREG_CAL = 1;
const SEFLG_MOSEPH = 4;
const SEFLG_SWIEPH = 2;
const SEFLG_SPEED = 256;

// Planet constants mapping
const PLANETS = {
  SUN: SE_SUN,
  MOON: SE_MOON,
  MERCURY: SE_MERCURY,
  VENUS: SE_VENUS,
  MARS: SE_MARS,
  JUPITER: SE_JUPITER,
  SATURN: SE_SATURN,
  URANUS: SE_URANUS,
  NEPTUNE: SE_NEPTUNE,
  PLUTO: SE_PLUTO,
  NORTH_NODE: SE_TRUE_NODE,
  SOUTH_NODE: SE_TRUE_NODE // Will calculate opposite
};

// Official Human Design gate sequence (64 gates in correct order)
const HUMAN_DESIGN_GATE_SEQUENCE = [
  // Quarter 1: Initiation (Gates 1-16)
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  // Quarter 2: Civilization (Gates 17-32) 
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  // Quarter 3: Duality (Gates 33-48)
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  // Quarter 4: Mutation (Gates 49-64)
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
];

export interface PlanetaryPosition {
  longitude: number;
  latitude: number;
  distance: number;
  speed: number;
}

export interface HumanDesignGateData {
  gate: number;
  line: number;
  color: number;
  tone: number;
  base: number;
  planet: string;
  longitude: number;
}

export interface AstronomicalData {
  julianDay: number;
  planetaryPositions: Record<string, PlanetaryPosition>;
  gateActivations: Record<string, HumanDesignGateData>;
}

export class AstrologyCalculator {
  private ephemerisPath: string | null = null;
  private initialized = false;

  constructor(ephemerisPath?: string) {
    if (ephemerisPath) {
      this.setEphemerisPath(ephemerisPath);
    }
    this.initialize();
  }

  /**
   * Set the path to ephemeris data files
   */
  setEphemerisPath(path: string): void {
    this.ephemerisPath = path;
    if (sweph.set_ephe_path) {
      sweph.set_ephe_path(path);
    }
  }

  /**
   * Initialize the calculator
   */
  private initialize(): void {
    try {
      // Use Moshier ephemeris if no data files are available
      // This provides reasonable accuracy without requiring large data files
      if (!this.ephemerisPath) {
        console.log('Using Moshier ephemeris (no data files required)');
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize Swiss Ephemeris:', error);
      throw new Error('Swiss Ephemeris initialization failed');
    }
  }

  /**
   * Convert JavaScript Date to Julian Day
   */
  dateToJulianDay(date: Date): number {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
    const day = date.getUTCDate();
    const hour = date.getUTCHours() + (date.getUTCMinutes() / 60.0) + (date.getUTCSeconds() / 3600.0);

    return sweph.julday(year, month, day, hour, SE_GREG_CAL);
  }

  /**
   * Convert Julian Day to JavaScript Date
   */
  julianDayToDate(julianDay: number): Date {
    const result = sweph.revjul(julianDay, SE_GREG_CAL);
    const year = result.year;
    const month = result.month - 1; // Convert to JavaScript 0-based months
    const day = Math.floor(result.day);
    const hour = Math.floor((result.day - day) * 24);
    const minute = Math.floor(((result.day - day) * 24 - hour) * 60);
    const second = Math.floor((((result.day - day) * 24 - hour) * 60 - minute) * 60);

    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }

  /**
   * Calculate planetary positions for a given Julian Day
   */
  calculatePlanetaryPositions(julianDay: number): Record<string, PlanetaryPosition> {
    if (!this.initialized) {
      throw new Error('AstrologyCalculator not initialized');
    }

    const positions: Record<string, PlanetaryPosition> = {};
    const flags = SEFLG_SPEED | (this.ephemerisPath ? SEFLG_SWIEPH : SEFLG_MOSEPH);

    for (const [planetName, planetId] of Object.entries(PLANETS)) {
      try {
        let result;
        
        if (planetName === 'SOUTH_NODE') {
          // Calculate South Node as opposite of North Node
          const northNodeResult = sweph.calc_ut(julianDay, PLANETS.NORTH_NODE, flags);
          if (northNodeResult.error) {
            throw new Error(`Error calculating North Node: ${northNodeResult.error}`);
          }
          // Extract data from the result object
          const data = northNodeResult.data;
          result = {
            longitude: (data[0] + 180) % 360,
            latitude: -data[1],
            distance: data[2],
            speed: data[3] ? -data[3] : 0
          };
        } else {
          const calcResult = sweph.calc_ut(julianDay, planetId, flags);
          if (calcResult.error) {
            throw new Error(`Error calculating ${planetName}: ${calcResult.error}`);
          }
          // Extract data from the result object
          const data = calcResult.data;
          result = {
            longitude: data[0],
            latitude: data[1],
            distance: data[2],
            speed: data[3] || 0
          };
        }

        positions[planetName] = result;
      } catch (error) {
        console.error(`Failed to calculate position for ${planetName}:`, error);
        // Continue with other planets even if one fails
      }
    }

    return positions;
  }

  /**
   * Calculate the Design time (88 degrees of solar arc before birth)
   * Uses binary search to find the precise moment
   */
  calculateDesignTime(birthJulianDay: number): number {
    const birthSunPosition = this.getSunLongitude(birthJulianDay);
    const targetSunPosition = (birthSunPosition - SOLAR_ARC_DEGREES + 360) % 360;

    // Binary search for the exact time when Sun was at target position
    let lowerBound = birthJulianDay - 100; // Start search 100 days before birth
    let upperBound = birthJulianDay - 80;  // End search 80 days before birth
    let tolerance = 0.0001; // Precision in days (about 8.6 seconds)
    let maxIterations = 50;
    let iteration = 0;

    while (upperBound - lowerBound > tolerance && iteration < maxIterations) {
      const midPoint = (lowerBound + upperBound) / 2;
      const midSunPosition = this.getSunLongitude(midPoint);
      
      // Handle the 0/360 degree boundary
      const diff = this.angleDifference(midSunPosition, targetSunPosition);
      
      if (Math.abs(diff) < 0.01) { // Found it within 0.01 degrees
        return midPoint;
      }
      
      if (diff > 0) {
        upperBound = midPoint;
      } else {
        lowerBound = midPoint;
      }
      
      iteration++;
    }

    return (lowerBound + upperBound) / 2;
  }

  /**
   * Get Sun's longitude for a given Julian Day
   */
  private getSunLongitude(julianDay: number): number {
    const flags = this.ephemerisPath ? SEFLG_SWIEPH : SEFLG_MOSEPH;
    const result = sweph.calc_ut(julianDay, SE_SUN, flags);
    
    if (result.error) {
      throw new Error(`Error calculating Sun position: ${result.error}`);
    }
    
    return result.data[0]; // Longitude is the first element in the data array
  }

  /**
   * Calculate the shortest angular difference between two longitudes
   */
  private angleDifference(angle1: number, angle2: number): number {
    let diff = angle1 - angle2;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff;
  }

  /**
   * Convert astronomical longitude to Human Design gate number
   */
  longitudeToGate(longitude: number): number {
    // Apply Human Design offset
    const adjustedLongitude = (longitude + HUMAN_DESIGN_OFFSET) % 360;
    
    // Each gate covers 360/64 = 5.625 degrees
    const gateIndex = Math.floor(adjustedLongitude / 5.625);
    
    // Return the gate number from the official sequence
    return HUMAN_DESIGN_GATE_SEQUENCE[gateIndex];
  }

  /**
   * Calculate line number from longitude (1-6)
   */
  longitudeToLine(longitude: number): number {
    const adjustedLongitude = (longitude + HUMAN_DESIGN_OFFSET) % 360;
    const gatePosition = (adjustedLongitude % 5.625) / 5.625; // Position within the gate (0-1)
    return Math.floor(gatePosition * 6) + 1; // Lines 1-6
  }

  /**
   * Calculate color from longitude (1-6)
   */
  longitudeToColor(longitude: number): number {
    const adjustedLongitude = (longitude + HUMAN_DESIGN_OFFSET) % 360;
    const linePosition = ((adjustedLongitude % 5.625) / 5.625) * 6; // Position within gate (0-6)
    const colorPosition = (linePosition % 1) * 6; // Position within line (0-6)
    return Math.floor(colorPosition) + 1; // Colors 1-6
  }

  /**
   * Calculate tone from longitude (1-6)
   */
  longitudeToTone(longitude: number): number {
    const adjustedLongitude = (longitude + HUMAN_DESIGN_OFFSET) % 360;
    const linePosition = ((adjustedLongitude % 5.625) / 5.625) * 6;
    const colorPosition = (linePosition % 1) * 6;
    const tonePosition = (colorPosition % 1) * 6;
    return Math.floor(tonePosition) + 1; // Tones 1-6
  }

  /**
   * Calculate base from longitude (1-5)
   */
  longitudeToBase(longitude: number): number {
    const adjustedLongitude = (longitude + HUMAN_DESIGN_OFFSET) % 360;
    const linePosition = ((adjustedLongitude % 5.625) / 5.625) * 6;
    const colorPosition = (linePosition % 1) * 6;
    const tonePosition = (colorPosition % 1) * 6;
    const basePosition = (tonePosition % 1) * 5;
    return Math.floor(basePosition) + 1; // Bases 1-5
  }

  /**
   * Calculate complete Human Design data for a given date/time
   */
  calculateHumanDesignData(birthDate: Date, birthLocation: [number, number]): {
    personality: AstronomicalData;
    design: AstronomicalData;
  } {
    const birthJulianDay = this.dateToJulianDay(birthDate);
    const designJulianDay = this.calculateDesignTime(birthJulianDay);

    // Calculate planetary positions for both times
    const personalityPositions = this.calculatePlanetaryPositions(birthJulianDay);
    const designPositions = this.calculatePlanetaryPositions(designJulianDay);

    // Convert to Human Design gate activations
    const personalityGates = this.positionsToGateActivations(personalityPositions, 'personality');
    const designGates = this.positionsToGateActivations(designPositions, 'design');

    return {
      personality: {
        julianDay: birthJulianDay,
        planetaryPositions: personalityPositions,
        gateActivations: personalityGates
      },
      design: {
        julianDay: designJulianDay,
        planetaryPositions: designPositions,
        gateActivations: designGates
      }
    };
  }

  /**
   * Convert planetary positions to Human Design gate activations
   */
  private positionsToGateActivations(
    positions: Record<string, PlanetaryPosition>,
    type: 'personality' | 'design'
  ): Record<string, HumanDesignGateData> {
    const gateActivations: Record<string, HumanDesignGateData> = {};

    for (const [planetName, position] of Object.entries(positions)) {
      const gate = this.longitudeToGate(position.longitude);
      const line = this.longitudeToLine(position.longitude);
      const color = this.longitudeToColor(position.longitude);
      const tone = this.longitudeToTone(position.longitude);
      const base = this.longitudeToBase(position.longitude);

      gateActivations[planetName] = {
        gate,
        line,
        color,
        tone,
        base,
        planet: planetName,
        longitude: position.longitude
      };
    }

    return gateActivations;
  }

  /**
   * Validate coordinates
   */
  validateCoordinates(latitude: number, longitude: number): boolean {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    try {
      if (sweph.close) {
        sweph.close();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const astrologyCalculator = new AstrologyCalculator();
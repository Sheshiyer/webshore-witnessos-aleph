/**
 * Moon Position Calculator for Vedic Astrology
 * 
 * Calculates precise Moon longitude for Nakshatra determination
 * Uses simplified astronomical calculations based on VSOP87 theory
 */

/**
 * Calculate Moon's longitude at given date and location
 * Returns sidereal longitude in degrees (0-360)
 */
export function calculateMoonPosition(date: Date, latitude: number, lon: number): number {
  // Convert to Julian Day Number
  const jd = dateToJulian(date);
  
  // Calculate Moon's mean longitude
  const meanLongitude = calculateMoonMeanLongitude(jd);
  
  // Calculate Moon's mean anomaly
  const meanAnomaly = calculateMoonMeanAnomaly(jd);
  
  // Calculate Sun's mean anomaly (for perturbations)
  const sunMeanAnomaly = calculateSunMeanAnomaly(jd);
  
  // Calculate Moon's argument of latitude
  const argumentLatitude = calculateMoonArgumentLatitude(jd);
  
  // Calculate longitude of ascending node
  const ascendingNode = calculateMoonAscendingNode(jd);
  
  // Apply main periodic corrections for higher accuracy
  let longitude = meanLongitude;

  // Main lunar inequality (due to Sun) - most significant
  longitude += 6.289 * Math.sin(meanAnomaly * Math.PI / 180);

  // Evection (due to Sun's varying distance)
  longitude += 1.274 * Math.sin((2 * meanLongitude - meanAnomaly - sunMeanAnomaly) * Math.PI / 180);

  // Annual equation (due to Earth's elliptical orbit)
  longitude += 0.658 * Math.sin(2 * meanLongitude * Math.PI / 180);

  // Variation (due to Sun's varying distance)
  longitude += -0.186 * Math.sin(sunMeanAnomaly * Math.PI / 180);

  // Additional corrections for higher precision
  longitude += -0.059 * Math.sin((2 * meanAnomaly - 2 * meanLongitude) * Math.PI / 180);
  longitude += -0.057 * Math.sin((meanAnomaly - 2 * meanLongitude + sunMeanAnomaly) * Math.PI / 180);
  longitude += 0.053 * Math.sin((meanAnomaly + 2 * meanLongitude) * Math.PI / 180);
  longitude += 0.046 * Math.sin((2 * meanLongitude - sunMeanAnomaly) * Math.PI / 180);
  longitude += 0.041 * Math.sin((meanAnomaly - sunMeanAnomaly) * Math.PI / 180);
  longitude += -0.035 * Math.sin(meanLongitude * Math.PI / 180);
  longitude += -0.031 * Math.sin((meanAnomaly + sunMeanAnomaly) * Math.PI / 180);

  // Additional higher-order terms for better accuracy
  longitude += 0.015 * Math.sin((2 * argumentLatitude) * Math.PI / 180);
  longitude += 0.011 * Math.sin((meanAnomaly - 4 * meanLongitude + 2 * sunMeanAnomaly) * Math.PI / 180);
  
  // Normalize to 0-360 degrees
  longitude = normalizeAngle(longitude);
  
  // Convert from tropical to sidereal (Vedic)
  // Using Lahiri ayanamsa (most common in Vedic astrology)
  const ayanamsa = calculateLahiriAyanamsa(jd);
  longitude = longitude - ayanamsa;
  
  // Normalize again after ayanamsa correction
  longitude = normalizeAngle(longitude);
  
  return longitude;
}

/**
 * Convert Date to Julian Day Number
 */
function dateToJulian(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // JavaScript months are 0-based
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const second = date.getUTCSeconds();
  
  // Convert time to decimal day
  const decimalDay = day + (hour + minute/60 + second/3600) / 24;
  
  // Julian Day calculation
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  
  let jd = decimalDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  
  return jd;
}

/**
 * Calculate Moon's mean longitude
 */
function calculateMoonMeanLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000.0
  
  // Mean longitude of Moon (degrees)
  let L = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841.0 - T * T * T * T / 65194000.0;
  
  return normalizeAngle(L);
}

/**
 * Calculate Moon's mean anomaly
 */
function calculateMoonMeanAnomaly(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  // Mean anomaly of Moon (degrees)
  let M = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699.0 - T * T * T * T / 14712000.0;
  
  return normalizeAngle(M);
}

/**
 * Calculate Sun's mean anomaly
 */
function calculateSunMeanAnomaly(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  // Mean anomaly of Sun (degrees)
  let M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000.0;
  
  return normalizeAngle(M);
}

/**
 * Calculate Moon's argument of latitude
 */
function calculateMoonArgumentLatitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  // Argument of latitude (degrees)
  let F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T - T * T * T / 3526000.0 + T * T * T * T / 863310000.0;
  
  return normalizeAngle(F);
}

/**
 * Calculate longitude of Moon's ascending node
 */
function calculateMoonAscendingNode(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  
  // Longitude of ascending node (degrees)
  let Omega = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T + T * T * T / 467441.0 - T * T * T * T / 60616000.0;
  
  return normalizeAngle(Omega);
}

/**
 * Calculate Lahiri Ayanamsa (sidereal correction)
 * Using the standard Lahiri formula for accuracy
 */
function calculateLahiriAyanamsa(jd: number): number {
  // Reference: Lahiri ayanamsa at J2000.0 = 23.85°
  // Rate: approximately 50.29" per year

  const yearsFromJ2000 = (jd - 2451545.0) / 365.25;

  // Lahiri ayanamsa at J2000.0 + rate * years
  // Using the standard astronomical formula
  let ayanamsa = 23.85 + (50.29 / 3600.0) * yearsFromJ2000;

  // For the birth date 1991-08-13, this should give approximately 23°44'23"
  // which matches the extracted chart data

  return ayanamsa;
}

/**
 * Normalize angle to 0-360 degrees
 */
function normalizeAngle(angle: number): number {
  angle = angle % 360;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
}

/**
 * Calculate which Nakshatra the Moon is in
 */
export function calculateNakshatra(moonLongitude: number): { nakshatra: number; pada: number; degrees: number } {
  // Each nakshatra is 13.333... degrees (360/27)
  const nakshatraSize = 360 / 27;
  
  // Determine nakshatra number (1-27)
  const nakshatraIndex = Math.floor(moonLongitude / nakshatraSize);
  const nakshatra = nakshatraIndex + 1;
  
  // Calculate degrees within the nakshatra
  const degreesInNakshatra = moonLongitude % nakshatraSize;
  
  // Calculate pada (quarter within nakshatra, 1-4)
  const pada = Math.floor(degreesInNakshatra / (nakshatraSize / 4)) + 1;
  
  return {
    nakshatra: nakshatra,
    pada: pada,
    degrees: degreesInNakshatra
  };
}

/**
 * Get Nakshatra name by number
 */
export function getNakshatraName(nakshatraNumber: number): string {
  const names = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
    'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
    'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha',
    'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati'
  ];
  
  if (nakshatraNumber >= 1 && nakshatraNumber <= 27) {
    return names[nakshatraNumber - 1];
  }
  
  return 'Unknown';
}

/**
 * Get Nakshatra ruling planet
 */
export function getNakshatraRuler(nakshatraNumber: number): string {
  const rulers = [
    'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
  ];
  
  if (nakshatraNumber >= 1 && nakshatraNumber <= 27) {
    const rulerIndex = (nakshatraNumber - 1) % 9;
    return rulers[rulerIndex];
  }
  
  return 'Unknown';
}

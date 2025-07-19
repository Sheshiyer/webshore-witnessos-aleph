/**
 * Geocoding Utilities for WitnessOS
 * 
 * Converts city/country names to latitude/longitude coordinates
 * Uses multiple fallback services for reliability
 */

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  timezone: string;
  city: string;
  country: string;
  success: boolean;
  error?: string;
}

/**
 * Geocode a location using OpenStreetMap Nominatim API (free, no API key required)
 */
async function geocodeWithNominatim(city: string, country: string): Promise<GeocodeResult> {
  try {
    const query = encodeURIComponent(`${city}, ${country}`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'WitnessOS/1.0 (consciousness technology platform)',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Location not found');
    }

    const result = data[0];
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new Error('Invalid coordinates returned');
    }

    // Estimate timezone based on longitude (rough approximation)
    const timezoneOffset = Math.round(longitude / 15);
    const timezone = `UTC${timezoneOffset >= 0 ? '+' : ''}${timezoneOffset}`;

    return {
      latitude,
      longitude,
      timezone,
      city: result.display_name.split(',')[0].trim(),
      country: result.address?.country || country,
      success: true,
    };
  } catch (error) {
    return {
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
      city,
      country,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown geocoding error',
    };
  }
}

/**
 * Fallback geocoding using a simple city database
 */
const MAJOR_CITIES: Record<string, { lat: number; lng: number; timezone: string }> = {
  // Major world cities for fallback
  'new york': { lat: 40.7128, lng: -74.0060, timezone: 'America/New_York' },
  'london': { lat: 51.5074, lng: -0.1278, timezone: 'Europe/London' },
  'tokyo': { lat: 35.6762, lng: 139.6503, timezone: 'Asia/Tokyo' },
  'paris': { lat: 48.8566, lng: 2.3522, timezone: 'Europe/Paris' },
  'sydney': { lat: -33.8688, lng: 151.2093, timezone: 'Australia/Sydney' },
  'mumbai': { lat: 19.0760, lng: 72.8777, timezone: 'Asia/Kolkata' },
  'bangalore': { lat: 12.9716, lng: 77.5946, timezone: 'Asia/Kolkata' },
  'delhi': { lat: 28.7041, lng: 77.1025, timezone: 'Asia/Kolkata' },
  'los angeles': { lat: 34.0522, lng: -118.2437, timezone: 'America/Los_Angeles' },
  'chicago': { lat: 41.8781, lng: -87.6298, timezone: 'America/Chicago' },
  'toronto': { lat: 43.6532, lng: -79.3832, timezone: 'America/Toronto' },
  'berlin': { lat: 52.5200, lng: 13.4050, timezone: 'Europe/Berlin' },
  'moscow': { lat: 55.7558, lng: 37.6176, timezone: 'Europe/Moscow' },
  'beijing': { lat: 39.9042, lng: 116.4074, timezone: 'Asia/Shanghai' },
  'shanghai': { lat: 31.2304, lng: 121.4737, timezone: 'Asia/Shanghai' },
  'singapore': { lat: 1.3521, lng: 103.8198, timezone: 'Asia/Singapore' },
  'dubai': { lat: 25.2048, lng: 55.2708, timezone: 'Asia/Dubai' },
  'cairo': { lat: 30.0444, lng: 31.2357, timezone: 'Africa/Cairo' },
  'johannesburg': { lat: -26.2041, lng: 28.0473, timezone: 'Africa/Johannesburg' },
  'sao paulo': { lat: -23.5505, lng: -46.6333, timezone: 'America/Sao_Paulo' },
  'mexico city': { lat: 19.4326, lng: -99.1332, timezone: 'America/Mexico_City' },
};

function geocodeWithFallback(city: string, country: string): GeocodeResult {
  const cityKey = city.toLowerCase();
  const fallback = MAJOR_CITIES[cityKey];
  
  if (fallback) {
    return {
      latitude: fallback.lat,
      longitude: fallback.lng,
      timezone: fallback.timezone,
      city,
      country,
      success: true,
    };
  }

  // Ultimate fallback - use browser timezone and rough coordinates
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return {
    latitude: 0,
    longitude: 0,
    timezone,
    city,
    country,
    success: false,
    error: 'Location not found in database',
  };
}

/**
 * Main geocoding function with multiple fallbacks
 */
export async function geocodeLocation(city: string, country: string): Promise<GeocodeResult> {
  if (!city || !country) {
    return {
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
      city: city || '',
      country: country || '',
      success: false,
      error: 'City and country are required',
    };
  }

  // Try primary geocoding service
  const primaryResult = await geocodeWithNominatim(city, country);
  if (primaryResult.success) {
    return primaryResult;
  }

  // Try fallback database
  const fallbackResult = geocodeWithFallback(city, country);
  if (fallbackResult.success) {
    return fallbackResult;
  }

  // Return the primary error if all fallbacks fail
  return primaryResult;
}

/**
 * Validate coordinates
 */
export function validateCoordinates(latitude: number, longitude: number): boolean {
  return (
    !isNaN(latitude) &&
    !isNaN(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(latitude: number, longitude: number): string {
  const latDir = latitude >= 0 ? 'N' : 'S';
  const lngDir = longitude >= 0 ? 'E' : 'W';
  return `${Math.abs(latitude).toFixed(4)}°${latDir}, ${Math.abs(longitude).toFixed(4)}°${lngDir}`;
}

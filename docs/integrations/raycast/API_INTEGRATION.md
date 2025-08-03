# WitnessOS Consciousness API Integration Guide

Complete TypeScript API documentation for Raycast extension integration with WitnessOS consciousness engines.

## 🔐 Authentication & Configuration

### Preferences Interface
```typescript
interface Preferences {
  apiToken: string;           // JWT authentication token
  apiBaseUrl: string;         // API endpoint (default: https://api.witnessos.space)
  userProfile: string;        // Full name for calculations
  birthDate: string;          // Birth date (YYYY-MM-DD)
  birthTime?: string;         // Birth time (HH:MM)
  birthLocation?: string;     // Birth location name
  birthLatitude?: string;     // Latitude coordinate
  birthLongitude?: string;    // Longitude coordinate
  defaultAIModel: string;     // AI model for synthesis
  aiCreativity: string;       // AI creativity level
  enableNotifications: boolean;
  cacheEnabled: boolean;
  debugMode: boolean;
}
```

### Authentication Setup
```typescript
import { getPreferenceValues } from "@raycast/api";

const preferences = getPreferenceValues<Preferences>();
const API_BASE_URL = preferences.apiBaseUrl || "https://api.witnessos.space";
const AUTH_HEADERS = {
  "Authorization": `Bearer ${preferences.apiToken}`,
  "Content-Type": "application/json"
};
```

## 🧠 Consciousness Engines API

### Base Response Types
```typescript
interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
  processingTime?: number;
  cached?: boolean;
}

interface EngineCalculationResponse<T = unknown> {
  success: true;
  data: {
    engine: string;
    calculation: T;
    interpretation: Record<string, string>;
    metadata?: {
      version: string;
      algorithm: string;
      confidence: number;
    };
  };
}
```

### Error Response Types
```typescript
interface APIError {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

// Common error codes
type ErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "INVALID_TOKEN"
  | "TOKEN_EXPIRED"
  | "INVALID_INPUT"
  | "ENGINE_ERROR"
  | "RATE_LIMIT_EXCEEDED"
  | "INTERNAL_ERROR";
```

## 🌸 Kazuhana - Numerology Engine

### Input Interface
```typescript
interface NumerologyInput {
  birth_date: string;         // YYYY-MM-DD format
  full_name: string;          // Complete birth name
  birth_name?: string;        // Original birth name if different
  system?: 'pythagorean' | 'chaldean';  // Default: pythagorean
  current_year?: number;      // For personal year calculation
}
```

### Response Interface
```typescript
interface NumerologyOutput {
  lifePath: number;
  expression: number;
  soulUrge: number;
  personality: number;
  maturity: number;
  personalYear: number;
  lifeExpressionBridge: number;
  soulPersonalityBridge: number;
  masterNumbers: number[];
  karmicDebt: number[];
  numerologySystem: string;
  calculationYear: number;
  nameBreakdown: Record<string, unknown>;
  coreMeanings: Record<string, string>;
  yearlyGuidance: string;
  lifePurpose: string;
  compatibilityNotes: string[];
  favorablePeriods: string[];
  challengePeriods: string[];
}
```

### API Call Example
```typescript
async function calculateNumerology(input: NumerologyInput): Promise<APIResponse<NumerologyOutput>> {
  const response = await fetch(`${API_BASE_URL}/engines/numerology/calculate`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({
      input,
      options: {
        useCache: true,
        saveProfile: true
      }
    })
  });

  return response.json();
}

// Usage
const numerologyResult = await calculateNumerology({
  birth_date: "1991-08-13",
  full_name: "Cumbipuram Nateshan Sheshnarayan",
  system: "pythagorean"
});
```

## 🎯 Tamashii no Sekkei - Human Design Engine

### Input Interface
```typescript
interface HumanDesignInput {
  fullName: string;
  birthDate: string;           // YYYY-MM-DD
  birthTime: string;           // HH:MM
  birthLocation: [number, number]; // [latitude, longitude]
  timezone: string;
  includeDesignCalculation?: boolean;
  detailedGates?: boolean;
}
```

### Response Interface
```typescript
interface HumanDesignOutput {
  chart: {
    typeInfo: {
      typeName: string;
      strategy: string;
      authority: string;
      signature: string;
      notSelf: string;
      percentage: number;
      description?: string;
      lifePurpose?: string;
    };
    profile: {
      personalityLine: number;
      designLine: number;
      profileName: string;
      description?: string;
      lifeTheme?: string;
      role?: string;
    };
    personalityGates: Record<string, HumanDesignGate>;
    designGates: Record<string, HumanDesignGate>;
    centers: Record<string, HumanDesignCenter>;
    definedChannels: string[];
    definitionType: string;
    incarnationCross?: Record<string, unknown>;
    variables?: Record<string, string>;
  };
  birthInfo: Record<string, unknown>;
  designInfo: Record<string, unknown>;
  typeAnalysis: string;
  profileAnalysis: string;
  centersAnalysis: string;
  gatesAnalysis: string;
  strategyGuidance: string;
  authorityGuidance: string;
  deconditioningGuidance: string;
}

interface HumanDesignGate {
  number: number;
  name: string;
  planet: string;
  line: number;
  color: number;
  tone: number;
  base: number;
  keynote?: string;
  description?: string;
  gift?: string;
  shadow?: string;
}

interface HumanDesignCenter {
  name: string;
  defined: boolean;
  gates: number[];
  function?: string;
  whenDefined?: string;
  whenUndefined?: string;
}
```

### API Call Example
```typescript
async function calculateHumanDesign(input: HumanDesignInput): Promise<APIResponse<HumanDesignOutput>> {
  const response = await fetch(`${API_BASE_URL}/engines/human_design/calculate`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({
      input,
      options: {
        includeChannels: true,
        detailedAnalysis: true
      }
    })
  });

  return response.json();
}

// Usage
const humanDesignResult = await calculateHumanDesign({
  fullName: "Cumbipuram Nateshan Sheshnarayan",
  birthDate: "1991-08-13",
  birthTime: "13:31",
  birthLocation: [12.9629, 77.5775], // Bengaluru coordinates
  timezone: "Asia/Kolkata"
});
```

## 🃏 Mirai no Kagami - Tarot Engine

### Input Interface
```typescript
interface TarotInput {
  question?: string;
  spreadType?: 'single_card' | 'three_card' | 'celtic_cross';
  deckType?: string;
  includeReversed?: boolean;
  focusArea?: string;
}
```

### Response Interface
```typescript
interface TarotOutput {
  drawnCards: DrawnCard[];
  spreadLayout: SpreadLayout;
  elementalBalance: Record<string, number>;
  archetypalPatterns: string[];
  overallTheme: string;
  cardMeanings: Record<string, string>;
  spreadInterpretation: string;
}

interface DrawnCard {
  card: TarotCard;
  position: number;
  positionMeaning: string;
  reversed: boolean;
  interpretation: string;
}

interface TarotCard {
  name: string;
  suit?: string;
  number?: string;
  arcanaType: 'major' | 'minor';
  keywords?: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  element?: string;
  astrological?: string;
}

interface SpreadLayout {
  name: string;
  description: string;
  positions: Record<string, unknown>[];
  cardCount: number;
}
```

### API Call Example
```typescript
async function calculateTarot(input: TarotInput): Promise<APIResponse<TarotOutput>> {
  const response = await fetch(`${API_BASE_URL}/engines/tarot/calculate`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({ input })
  });

  return response.json();
}

// Usage
const tarotResult = await calculateTarot({
  question: "What guidance do I need for my spiritual path?",
  spreadType: "celtic_cross",
  includeReversed: true
});
```

## ⏰ Jikan no Shisha - Vimshottari Engine

### Input Interface
```typescript
interface VimshottariInput {
  birth_date: string;         // YYYY-MM-DD
  birth_time: string;         // HH:MM
  birth_location: [number, number]; // [latitude, longitude]
  timezone?: string;
  include_sub_periods?: boolean;
  forecast_years?: number;
}
```

### Response Interface
```typescript
interface VimshottariOutput {
  currentDasha: DashaPeriod;
  nextDasha: DashaPeriod;
  dashaPeriods: DashaPeriod[];
  lifeTimeline: TimelineEvent[];
  planetaryInfluences: Record<string, PlanetaryInfluence>;
  currentGuidance: string;
  upcomingTransitions: TransitionEvent[];
  karmaticPatterns: string[];
}

interface DashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  duration: number;
  subPeriods?: SubDashaPeriod[];
  influence: string;
  themes: string[];
  opportunities: string[];
  challenges: string[];
}

interface SubDashaPeriod {
  planet: string;
  startDate: string;
  endDate: string;
  duration: number;
  influence: string;
}

interface TimelineEvent {
  date: string;
  event: string;
  significance: string;
  planet: string;
}

interface PlanetaryInfluence {
  planet: string;
  strength: number;
  benefic: boolean;
  aspects: string[];
  house: number;
  sign: string;
}

interface TransitionEvent {
  date: string;
  fromPlanet: string;
  toPlanet: string;
  significance: string;
  preparation: string[];
}
```

### API Call Example
```typescript
async function calculateVimshottari(input: VimshottariInput): Promise<APIResponse<VimshottariOutput>> {
  const response = await fetch(`${API_BASE_URL}/engines/vimshottari/calculate`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({
      input,
      options: {
        includeSubPeriods: true,
        forecastYears: 10
      }
    })
  });

  return response.json();
}

// Usage
const vimshottariResult = await calculateVimshottari({
  birth_date: "1991-08-13",
  birth_time: "13:31",
  birth_location: [12.9629, 77.5775],
  timezone: "Asia/Kolkata",
  include_sub_periods: true,
  forecast_years: 5
});
```

## 🌊 Biorhythm Engine

### Input Interface
```typescript
interface BiorhythmInput {
  birth_date: string;         // YYYY-MM-DD
  target_date?: string;       // YYYY-MM-DD (default: today)
  include_extended_cycles?: boolean;
  forecast_days?: number;     // Days to forecast ahead
}
```

### Response Interface
```typescript
interface BiorhythmOutput {
  birth_date: string;
  target_date: string;
  days_alive: number;
  physical_percentage: number;
  emotional_percentage: number;
  intellectual_percentage: number;
  intuitive_percentage?: number;
  aesthetic_percentage?: number;
  spiritual_percentage?: number;
  physical_phase: string;
  emotional_phase: string;
  intellectual_phase: string;
  overall_energy: number;
  critical_day: boolean;
  trend: string;
  cycle_details: Record<string, unknown>;
  critical_days_ahead: string[];
  forecast_summary: Record<string, unknown>;
  best_days_ahead: string[];
  challenging_days_ahead: string[];
  energy_optimization: Record<string, string>;
  cycle_synchronization: Record<string, unknown>;
}
```

### API Call Example
```typescript
async function calculateBiorhythm(input: BiorhythmInput): Promise<APIResponse<BiorhythmOutput>> {
  const response = await fetch(`${API_BASE_URL}/engines/biorhythm/calculate`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({
      input,
      options: {
        includeExtended: true,
        forecastDays: 7
      }
    })
  });

  return response.json();
}

// Usage
const biorhythmResult = await calculateBiorhythm({
  birth_date: "1991-08-13",
  target_date: "2025-01-29",
  include_extended_cycles: true,
  forecast_days: 14
});
```

## 🔮 I-Ching Engine

### Input Interface
```typescript
interface IChingInput {
  question?: string;
  method: 'coins' | 'yarrow' | 'random';
  includeChangingLines: boolean;
}
```

### Response Interface
```typescript
interface IChingOutput {
  primaryHexagram: Hexagram;
  changingHexagram?: Hexagram;
  changingLines: number[];
  interpretation: string;
  guidance: string;
  trigrams: {
    upper: Trigram;
    lower: Trigram;
  };
  elements: string[];
  timing: string;
  actionAdvice: string;
}

interface Hexagram {
  number: number;
  name: string;
  chineseName: string;
  symbol: string;
  lines: boolean[]; // true = yang, false = yin
  judgment: string;
  image: string;
  meaning: string;
}

interface Trigram {
  name: string;
  symbol: string;
  element: string;
  attribute: string;
  family: string;
  direction: string;
}
```

### API Call Example
```typescript
async function calculateIChing(input: IChingInput): Promise<APIResponse<IChingOutput>> {
  const response = await fetch(`${API_BASE_URL}/engines/iching/calculate`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({ input })
  });

  return response.json();
}

// Usage
const ichingResult = await calculateIChing({
  question: "What should I focus on in my spiritual development?",
  method: "coins",
  includeChangingLines: true
});
```

## 🎭 Enneagram Engine

### Input Interface
```typescript
interface EnneagramInput {
  responses: Record<string, number>; // question_id -> response_value (1-5 scale)
  includeWings: boolean;
  includeInstincts: boolean;
}
```

### Response Interface
```typescript
interface EnneagramOutput {
  profile: EnneagramProfile;
  typeScores: Record<number, number>;
  development: string;
  relationships: string;
  workStyle: string;
  stressResponse: string;
  growthPath: string;
}

interface EnneagramProfile {
  primaryType: EnneagramType;
  wings: EnneagramWing[];
  arrows: EnneagramArrow[];
  instinctualVariant: InstinctualVariant;
  center: 'body' | 'heart' | 'head';
  healthLevel: number; // 1-9
}

interface EnneagramType {
  number: number;
  name: string;
  description: string;
  coreMotivation: string;
  coreFear: string;
  coreDesire: string;
  keyMotivations: string[];
  basicFear: string;
  basicDesire: string;
  healthyLevels: string[];
  averageLevels: string[];
  unhealthyLevels: string[];
}

interface EnneagramWing {
  type: number;
  influence: number; // 0.0 - 1.0
  description: string;
}

interface EnneagramArrow {
  direction: 'integration' | 'disintegration';
  targetType: number;
  description: string;
  conditions: string;
}

interface InstinctualVariant {
  primary: 'self_preservation' | 'social' | 'sexual';
  secondary?: 'self_preservation' | 'social' | 'sexual';
  stacking: string;
  description: string;
}
```

### API Call Example
```typescript
async function calculateEnneagram(input: EnneagramInput): Promise<APIResponse<EnneagramOutput>> {
  const response = await fetch(`${API_BASE_URL}/engines/enneagram/calculate`, {
    method: 'POST',
    headers: AUTH_HEADERS,
    body: JSON.stringify({ input })
  });

  return response.json();
}

// Usage
const enneagramResult = await calculateEnneagram({
  responses: {
    "q1": 4,
    "q2": 2,
    "q3": 5,
    // ... more question responses
  },
  includeWings: true,
  includeInstincts: true
});
```

## 🔺 Sacred Geometry Engine

### Input Interface
```typescript
interface SacredGeometryInput {
  pattern_type: 'flower_of_life' | 'metatrons_cube' | 'sri_yantra' | 'golden_spiral';
  dimensions?: number;
  iterations?: number;
  include_analysis?: boolean;
}
```

### Response Interface
```typescript
interface SacredGeometryOutput {
  pattern: GeometricPattern;
  analysis: PatternAnalysis;
  symbolism: string;
  meditation_guidance: string;
  mathematical_properties: MathematicalProperties;
  spiritual_significance: string;
}

interface GeometricPattern {
  type: string;
  coordinates: number[][];
  svg_path: string;
  dimensions: number;
  center_point: [number, number];
}

interface PatternAnalysis {
  symmetry_type: string;
  golden_ratio_presence: boolean;
  fibonacci_sequence: number[];
  harmonic_ratios: number[];
  energy_centers: [number, number][];
}

interface MathematicalProperties {
  phi_ratio: number;
  pi_relationships: number[];
  geometric_mean: number;
  area_calculations: Record<string, number>;
}
```

## 🧬 Gene Keys Engine

### Input Interface
```typescript
interface GeneKeysInput {
  birth_date: string;
  birth_time: string;
  birth_location: [number, number];
  timezone: string;
  include_life_work?: boolean;
  include_relationships?: boolean;
}
```

### Response Interface
```typescript
interface GeneKeysOutput {
  profile: GeneKeysProfile;
  lifeWork: LifeWorkSphere;
  relationships: RelationshipSphere;
  venus_sequence: VenusSequence;
  pearl_sequence: PearlSequence;
  hologenetic_profile: HologeneticProfile;
}

interface GeneKeysProfile {
  sun_gate: GeneKey;
  earth_gate: GeneKey;
  north_node_gate: GeneKey;
  south_node_gate: GeneKey;
  moon_gate: GeneKey;
  venus_gate: GeneKey;
}

interface GeneKey {
  number: number;
  name: string;
  shadow: string;
  gift: string;
  siddhi: string;
  codon: string;
  amino_acid: string;
  programming_partner: number;
  physiology: string;
  psychology: string;
}
```

## 🔥 Sigil Forge Engine

### Input Interface
```typescript
interface SigilForgeInput {
  intention: string;
  method: 'austin_osman_spare' | 'chaos_magic' | 'planetary' | 'elemental';
  symbols?: string[];
  include_activation?: boolean;
}
```

### Response Interface
```typescript
interface SigilForgeOutput {
  sigil: SigilDesign;
  creation_process: CreationProcess;
  activation_instructions: string[];
  timing_recommendations: TimingRecommendations;
  meditation_guidance: string;
  charging_methods: string[];
}

interface SigilDesign {
  svg_path: string;
  base64_image: string;
  geometric_elements: GeometricElement[];
  color_scheme: string[];
  dimensions: [number, number];
}

interface CreationProcess {
  original_intention: string;
  letter_reduction: string[];
  symbol_combination: string;
  final_simplification: string;
  method_used: string;
}

interface TimingRecommendations {
  optimal_moon_phase: string;
  planetary_hours: string[];
  seasonal_timing: string;
  personal_power_days: string[];
}
```

## 🔄 Multi-Engine Operations

### Batch Calculation
```typescript
interface BatchCalculationRequest {
  calculations: EngineCalculation[];
  options?: {
    parallel?: boolean;
    useCache?: boolean;
    priority?: 'speed' | 'accuracy';
  };
}

interface EngineCalculation {
  engine: string;
  input: Record<string, unknown>;
  options?: Record<string, unknown>;
}

interface BatchCalculationResponse {
  success: boolean;
  results: EngineResult[];
  processingTime: number;
  cached: boolean;
  timestamp: string;
}

interface EngineResult {
  engine: string;
  success: boolean;
  data?: unknown;
  error?: string;
  processingTime: number;
  cached: boolean;
}
```

### Daily Guidance Synthesis
```typescript
interface DailyGuidanceRequest {
  engines: string[];
  synthesis_type: 'brief' | 'detailed' | 'actionable';
  focus_areas?: string[];
}

interface DailyGuidanceResponse {
  success: boolean;
  data: {
    date: string;
    overall_theme: string;
    engine_insights: Record<string, string>;
    ai_synthesis: string;
    action_items: string[];
    meditation_focus: string;
    affirmation: string;
    lucky_numbers?: number[];
    favorable_colors?: string[];
    timing_guidance: string;
  };
}
```

## 🔐 Error Handling Patterns

### Common Error Scenarios
```typescript
// Authentication errors
if (response.status === 401) {
  throw new Error("Invalid or expired API token. Please check your preferences.");
}

// Rate limiting
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  throw new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
}

// Input validation errors
if (response.status === 400) {
  const errorData = await response.json();
  throw new Error(`Invalid input: ${errorData.message}`);
}

// Engine calculation errors
if (response.status === 422) {
  const errorData = await response.json();
  throw new Error(`Calculation failed: ${errorData.details}`);
}

// Server errors
if (response.status >= 500) {
  throw new Error("WitnessOS API is temporarily unavailable. Please try again later.");
}
```

### Retry Logic Implementation
```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error("Max retries exceeded");
}
```

## 📊 Performance Optimization

### Caching Strategy
```typescript
// Cache durations by engine type
const CACHE_DURATIONS = {
  numerology: 24 * 60 * 60 * 1000,    // 24 hours
  human_design: 24 * 60 * 60 * 1000,  // 24 hours
  biorhythm: 60 * 60 * 1000,          // 1 hour
  tarot: 30 * 60 * 1000,              // 30 minutes
  iching: 60 * 60 * 1000,             // 1 hour
  enneagram: 7 * 24 * 60 * 60 * 1000, // 7 days
  sacred_geometry: 24 * 60 * 60 * 1000, // 24 hours
  gene_keys: 24 * 60 * 60 * 1000,     // 24 hours
  sigil_forge: 0,                     // No cache (always fresh)
  vimshottari: 24 * 60 * 60 * 1000,   // 24 hours
};
```

### Request Optimization
```typescript
// Compress request payloads for large inputs
const compressedInput = JSON.stringify(input);
if (compressedInput.length > 1024) {
  headers['Content-Encoding'] = 'gzip';
  body = await compress(compressedInput);
}

// Use appropriate timeout values
const TIMEOUT_VALUES = {
  numerology: 5000,      // 5 seconds
  human_design: 15000,   // 15 seconds (complex calculations)
  biorhythm: 3000,       // 3 seconds
  tarot: 5000,           // 5 seconds
  batch: 30000,          // 30 seconds for batch operations
};
```

---

*This comprehensive API integration guide provides complete TypeScript interfaces, authentication patterns, error handling, and optimization strategies for all WitnessOS consciousness engines in Raycast extensions.*

// Core API Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
  requestId?: string;
}

export interface UserProfile {
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  birthLatitude?: number;
  birthLongitude?: number;
}

export interface Preferences {
  apiToken: string;
  apiBaseUrl: string;
  userProfile: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
  birthLatitude?: string;
  birthLongitude?: string;
  defaultAIModel: string;
  aiCreativity: string;
  enableNotifications: boolean;
  cacheEnabled: boolean;
  debugMode: boolean;
}

// Engine Types
export interface EngineInput {
  [key: string]: unknown;
}

export interface EngineResult {
  engine: string;
  data: unknown;
  timestamp: string;
  cached?: boolean;
  processingTime?: number;
}

export interface BatchCalculation {
  engine: string;
  input: EngineInput;
  options?: {
    useCache?: boolean;
    priority?: number;
  };
}

export interface BatchResult {
  results: EngineResult[];
  cached: boolean;
  timestamp: string;
  totalProcessingTime: number;
}

// Specific Engine Types
export interface NumerologyInput {
  birth_date: string;
  full_name: string;
}

export interface NumerologyResult {
  life_path: number;
  expression: number;
  soul_urge: number;
  personality: number;
  birth_day: number;
  challenge_numbers: number[];
  pinnacle_numbers: number[];
  personal_year: number;
  interpretations: {
    life_path: string;
    expression: string;
    soul_urge: string;
    personality: string;
  };
}

export interface TarotInput {
  question: string;
  spread_type: "single" | "three_card" | "celtic_cross" | "relationship" | "career";
  deck?: "rider_waite" | "thoth" | "marseille";
}

export interface TarotCard {
  name: string;
  suit?: string;
  number?: number;
  reversed: boolean;
  meaning: string;
  position_meaning?: string;
}

export interface TarotResult {
  cards: TarotCard[];
  spread_type: string;
  question: string;
  interpretation: string;
  advice: string;
}

export interface HumanDesignInput {
  birth_date: string;
  birth_time: string;
  birth_latitude: number;
  birth_longitude: number;
}

export interface HumanDesignResult {
  type: "Generator" | "Manifesting Generator" | "Projector" | "Manifestor" | "Reflector";
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  centers: {
    [key: string]: {
      defined: boolean;
      gates: number[];
    };
  };
  channels: number[];
  gates: number[];
  interpretation: string;
}

export interface BiorhythmInput {
  birth_date: string;
  target_date: string;
  days_ahead?: number;
}

export interface BiorhythmCycle {
  type: "physical" | "emotional" | "intellectual";
  value: number; // -1 to 1
  percentage: number; // 0 to 100
  phase: "high" | "low" | "critical_positive" | "critical_negative";
  description: string;
}

export interface BiorhythmResult {
  physical: BiorhythmCycle;
  emotional: BiorhythmCycle;
  intellectual: BiorhythmCycle;
  compatibility?: number;
  forecast: BiorhythmCycle[];
}

export interface IChingInput {
  question: string;
  method?: "coins" | "yarrow" | "random";
}

export interface IChingResult {
  hexagram_number: number;
  hexagram_name: string;
  trigrams: {
    upper: string;
    lower: string;
  };
  changing_lines: number[];
  interpretation: string;
  judgment: string;
  image: string;
  advice: string;
}

// AI Types
export interface AIOptions {
  model?: string;
  creativity?: number;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResult {
  response: string;
  model: string;
  tokens_used: number;
  processing_time: number;
  cached?: boolean;
}

export interface Synthesis {
  summary: string;
  detailed_interpretation: string;
  key_insights: string[];
  recommendations: string[];
  confidence_score: number;
  engines_used: string[];
}

// UI Component Types
export interface EngineStatus {
  id: string;
  name: string;
  japaneseName: string;
  translation: string;
  available: boolean;
  lastCalculated?: string;
  result?: EngineResult;
  error?: string;
  tier: "zanpakuto" | "captain" | "soul-king";
  spiritualPower: number;
}

export interface FormValues {
  intention: string;
  engines: string[];
  aiModel: string;
  creativity: string;
  focusArea?: string;
}

// Error Types
export interface WitnessOSError extends Error {
  code?: string;
  statusCode?: number;
  details?: unknown;
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

// Workflow Types
export interface WorkflowResult {
  workflow_type: "daily" | "weekly" | "monthly" | "custom";
  engines_used: string[];
  results: Record<string, EngineResult>;
  synthesis: Synthesis;
  timestamp: string;
}

// Constants
export const ENGINE_NAMES = {
  numerology: { japanese: "Kazuhana", translation: "Number Flower", icon: "🌸" },
  human_design: { japanese: "Tamashii no Sekkei", translation: "Soul Blueprint", icon: "🎯" },
  tarot: { japanese: "Mirai no Kagami", translation: "Mirror of Futures", icon: "🔮" },
  iching: { japanese: "Kodai no Koe", translation: "Ancient Voice", icon: "☯️" },
  biorhythm: { japanese: "Seimei no Nami", translation: "Life Wave", icon: "〰️" },
  enneagram: { japanese: "Kyūkaku no Michi", translation: "Nine-Angled Path", icon: "⭐" },
  gene_keys: { japanese: "Iden no Kagi", translation: "Genetic Keys", icon: "🗝️" },
  ai_synthesis: { japanese: "Ishiki no Ōja", translation: "Consciousness Sovereign", icon: "👑" },
} as const;

export type EngineType = keyof typeof ENGINE_NAMES;

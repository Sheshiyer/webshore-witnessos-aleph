/**
 * Engine-Specific Types for WitnessOS Webshore
 *
 * TypeScript interfaces for all 10 consciousness engines
 * Based on Python data models from WitnessOS engine implementations
 */

import { BaseEngineInput, BaseEngineOutput, BirthData, PersonalData, QuestionInput } from './consciousness';

// ===== NUMEROLOGY ENGINE =====
export interface NumerologyInput extends BaseEngineInput, PersonalData {
  system: 'pythagorean' | 'chaldean';
  currentYear?: number;
  [key: string]: unknown; // Add index signature to satisfy BaseEngineInput constraint
}

export interface NumerologyOutput extends BaseEngineOutput {
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
  [key: string]: unknown; // Add index signature to satisfy BaseEngineOutput constraint
}

// ===== HUMAN DESIGN ENGINE =====
export interface HumanDesignInput extends BaseEngineInput {
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthLocation: [number, number]; // [latitude, longitude]
  timezone: string;
  includeDesignCalculation?: boolean;
  detailedGates?: boolean;
  [key: string]: unknown; // Add index signature to satisfy BaseEngineInput constraint
}

export interface HumanDesignGate {
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

export interface HumanDesignCenter {
  name: string;
  defined: boolean;
  gates: number[];
  function?: string;
  whenDefined?: string;
  whenUndefined?: string;
}

export interface HumanDesignProfile {
  personalityLine: number;
  designLine: number;
  profileName: string;
  description?: string;
  lifeTheme?: string;
  role?: string;
}

export interface HumanDesignType {
  typeName: string;
  strategy: string;
  authority: string;
  signature: string;
  notSelf: string;
  percentage: number;
  description?: string;
  lifePurpose?: string;
}

export interface HumanDesignChart {
  typeInfo: HumanDesignType;
  profile: HumanDesignProfile;
  personalityGates: Record<string, HumanDesignGate>;
  designGates: Record<string, HumanDesignGate>;
  centers: Record<string, HumanDesignCenter>;
  definedChannels: string[];
  definitionType: string;
  incarnationCross?: Record<string, unknown>;
  variables?: Record<string, string>;
}

export interface HumanDesignOutput extends BaseEngineOutput {
  chart: HumanDesignChart;
  birthInfo: Record<string, unknown>;
  designInfo: Record<string, unknown>;
  typeAnalysis: string;
  profileAnalysis: string;
  centersAnalysis: string;
  gatesAnalysis: string;
  strategyGuidance: string;
  authorityGuidance: string;
  deconditioningGuidance: string;
  [key: string]: unknown; // Add index signature to satisfy BaseEngineOutput constraint
}

// ===== TAROT ENGINE =====
export interface TarotInput extends BaseEngineInput {
  question?: string;
  spreadType?: 'single_card' | 'three_card' | 'celtic_cross';
  deckType?: string;
  includeReversed?: boolean;
  focusArea?: string;
  [key: string]: unknown; // Add index signature to satisfy BaseEngineInput constraint
}

export interface TarotCard {
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

export interface DrawnCard {
  card: TarotCard;
  position: number;
  positionMeaning: string;
  reversed: boolean;
  interpretation: string;
}

export interface SpreadLayout {
  name: string;
  description: string;
  positions: Record<string, unknown>[];
  cardCount: number;
}

export interface TarotDeck {
  deckInfo: Record<string, unknown>;
  majorArcana: Record<string, Record<string, unknown>>;
  minorArcana: Record<string, unknown>;
  spreads: Record<string, Record<string, unknown>>;
}

export interface TarotOutput extends BaseEngineOutput {
  drawnCards: DrawnCard[];
  spreadLayout: SpreadLayout;
  elementalBalance: Record<string, number>;
  archetypalPatterns: string[];
  overallTheme: string;
  cardMeanings: Record<string, string>;
  spreadInterpretation: string;
  [key: string]: unknown; // Add index signature to satisfy BaseEngineOutput constraint
}

// ===== I-CHING ENGINE =====
export interface IChingInput extends BaseEngineInput, QuestionInput {
  method: 'coins' | 'yarrow' | 'random';
  includeChangingLines: boolean;
}

export interface Trigram {
  name: string;
  symbol: string;
  element: string;
  attribute: string;
  family: string;
  direction: string;
}

export interface HexagramLine {
  position: number;
  type: 'yin' | 'yang' | 'changing_yin' | 'changing_yang';
  meaning: string;
}

export interface Hexagram {
  number: number;
  name: string;
  chineseName: string;
  upperTrigram: Trigram;
  lowerTrigram: Trigram;
  lines: HexagramLine[];
  judgment: string;
  image: string;
  meaning: string;
  advice: string;
}

export interface IChingReading {
  primaryHexagram: Hexagram;
  relatingHexagram?: Hexagram;
  changingLines: number[];
  interpretation: string;
}

export interface IChingOutput extends BaseEngineOutput {
  reading: IChingReading;
  divination: string;
  guidance: string;
  timing: string;
  action: string;
  [key: string]: unknown; // Add index signature to satisfy BaseEngineOutput constraint
}

// ===== ENNEAGRAM ENGINE =====
export interface EnneagramInput extends BaseEngineInput {
  responses: Record<string, number>; // question_id -> response_value
  includeWings: boolean;
  includeInstincts: boolean;
}

export interface EnneagramWing {
  type: number;
  influence: number; // 0.0 - 1.0
  description: string;
}

export interface EnneagramArrow {
  direction: 'integration' | 'disintegration';
  targetType: number;
  description: string;
  conditions: string;
}

export interface InstinctualVariant {
  primary: 'self_preservation' | 'social' | 'sexual';
  secondary?: 'self_preservation' | 'social' | 'sexual';
  stacking: string;
  description: string;
}

export interface EnneagramType {
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

export interface EnneagramProfile {
  primaryType: EnneagramType;
  wings: EnneagramWing[];
  arrows: EnneagramArrow[];
  instinctualVariant: InstinctualVariant;
  center: 'body' | 'heart' | 'head';
  healthLevel: number; // 1-9
}

export interface EnneagramOutput extends BaseEngineOutput {
  profile: EnneagramProfile;
  typeScores: Record<number, number>;
  development: string;
  relationships: string;
  workStyle: string;
  stressResponse: string;
  growthPath: string;
}

// ===== SACRED GEOMETRY ENGINE =====
export interface SacredGeometryInput extends BaseEngineInput {
  intention: string;
  birth_date?: string;
  pattern_type?: 'mandala' | 'flower_of_life' | 'sri_yantra' | 'golden_spiral' | 'platonic_solid' | 'vesica_piscis' | 'personal';
  petal_count?: number;
  layer_count?: number;
  spiral_turns?: number;
  solid_type?: 'tetrahedron' | 'cube' | 'octahedron' | 'dodecahedron' | 'icosahedron';
  size?: number;
  color_scheme?: 'golden' | 'rainbow' | 'monochrome' | 'chakra' | 'elemental';
  include_construction_lines?: boolean;
  include_sacred_ratios?: boolean;
  meditation_focus?: boolean;
  [key: string]: unknown;
}

export interface SacredGeometryOutput extends BaseEngineOutput {
  primary_pattern: {
    pattern_type: string;
    center_point: [number, number];
    scale: number;
    elements: unknown[];
    sacred_ratios: Record<string, number>;
    symbolism: string;
  };
  mathematical_properties: Record<string, unknown>;
  sacred_ratios: Record<string, number>;
  symmetry_analysis: Record<string, unknown>;
  meditation_points: [number, number][];
  energy_flow: Record<string, unknown>;
  chakra_correspondences: Record<string, string>;
  image_path?: string;
  svg_path?: string;
  geometric_meaning: string;
  meditation_guidance: string;
  manifestation_notes: string;
  [key: string]: unknown;
}

// ===== BIORHYTHM ENGINE =====
export interface BiorhythmInput extends BaseEngineInput {
  birth_date: string;
  target_date?: string;
  include_extended_cycles?: boolean;
  forecast_days?: number;
  [key: string]: unknown;
}

export interface BiorhythmOutput extends BaseEngineOutput {
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
  [key: string]: unknown;
}

// ===== VIMSHOTTARI ENGINE =====
export interface VimshottariInput extends BaseEngineInput {
  birth_date: string;
  birth_time: string;
  birth_location: [number, number];
  timezone: string;
  current_date?: string;
  include_sub_periods?: boolean;
  years_forecast?: number;
  [key: string]: unknown;
}

export interface VimshottariOutput extends BaseEngineOutput {
  timeline: {
    birth_nakshatra: {
      name: string;
      pada: number;
      ruling_planet: string;
      degrees_in_nakshatra: number;
      symbol: string;
      deity: string;
      nature: string;
      meaning: string;
      characteristics: string[];
    };
    current_mahadasha: {
      planet: string;
      period_type: string;
      start_date: string;
      end_date: string;
      duration_years: number;
      is_current: boolean;
      general_theme: string;
      opportunities: string[];
      challenges: string[];
      recommendations: string[];
    };
    current_antardasha?: unknown;
    current_pratyantardasha?: unknown;
    all_mahadashas: unknown[];
    upcoming_periods: unknown[];
    life_phase_analysis: string;
    karmic_themes: string[];
  };
  birth_info: Record<string, unknown>;
  calculation_date: string;
  current_period_analysis: string;
  upcoming_opportunities: string;
  karmic_guidance: string;
  favorable_periods: string[];
  challenging_periods: string[];
  [key: string]: unknown;
}

// ===== GENE KEYS ENGINE =====
export interface GeneKeysInput extends BaseEngineInput {
  birth_date: string;
  birth_time: string;
  birth_location: [number, number];
  timezone: string;
  focus_sequence?: 'activation' | 'venus' | 'pearl' | 'all';
  include_programming_partner?: boolean;
  pathworking_focus?: string;
  [key: string]: unknown;
}

export interface GeneKeysOutput extends BaseEngineOutput {
  activation_sequence: {
    name: string;
    description: string;
    gates: {
      name: string;
      description: string;
      gene_key: {
        number: number;
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
      };
      calculation_method: string;
    }[];
  };
  venus_sequence?: unknown;
  pearl_sequence?: unknown;
  primary_gene_key: unknown;
  programming_partner?: unknown;
  pathworking_guidance: string;
  transformation_themes: string[];
  [key: string]: unknown;
}

// ===== SIGIL FORGE ENGINE =====
export interface SigilForgeInput extends BaseEngineInput {
  intention: string;
  generation_method?: 'traditional' | 'geometric' | 'hybrid' | 'personal';
  letter_elimination?: boolean;
  connection_style?: 'sequential' | 'star' | 'web' | 'organic';
  sacred_geometry?: 'triangle' | 'square' | 'pentagon' | 'hexagon' | 'circle' | 'auto';
  birth_date?: string;
  personal_symbols?: string[];
  style?: 'minimal' | 'ornate' | 'organic' | 'geometric' | 'mystical';
  size?: number;
  color_scheme?: 'monochrome' | 'golden' | 'elemental' | 'personal';
  include_activation_guidance?: boolean;
  [key: string]: unknown;
}

export interface SigilForgeOutput extends BaseEngineOutput {
  sigil_analysis: {
    intention_breakdown: string[];
    symbolic_elements: string[];
    geometric_properties: Record<string, unknown>;
    energetic_signature: string;
    manifestation_potential: number;
  };
  activation_guidance: {
    charging_method: string;
    activation_ritual: string;
    timing_recommendations: string[];
    meditation_instructions: string;
    integration_practices: string[];
  };
  sigil_composition: {
    base_geometry: string;
    symbolic_layers: string[];
    color_meanings: Record<string, string>;
    proportions: Record<string, number>;
  };
  image_path?: string;
  svg_path?: string;
  creation_notes: string;
  usage_instructions: string;
  manifestation_timeline: string;
  [key: string]: unknown;
}

// ===== VEDICCLOCK-TCM ENGINE =====
export interface VedicClockTCMInput extends BaseEngineInput, BirthData {
  target_date?: string;
  target_time?: string;
  analysis_depth?: 'basic' | 'detailed' | 'comprehensive';
  optimization_focus?: string[];
  include_predictions?: boolean;
  prediction_hours?: number;
  [key: string]: unknown;
}

export interface VimshottariContext {
  mahadasha_lord: string;
  mahadasha_remaining_years: number;
  antardasha_lord: string;
  antardasha_remaining_months: number;
  pratyantardasha_lord: string;
  life_lesson_theme: string;
  karmic_focus: string;
}

export interface PanchangaState {
  tithi: string;
  vara: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  dominant_element: string;
  energy_quality: string;
  auspiciousness_score: number;
}

export interface TCMOrganState {
  primary_organ: string;
  secondary_organ: string;
  element: string;
  energy_direction: 'ascending' | 'peak' | 'descending' | 'rest';
  optimal_activities: string[];
  avoid_activities: string[];
}

export interface ElementalSynthesis {
  vedic_element: string;
  tcm_element: string;
  harmony_level: number;
  synthesis_quality: string;
  recommended_practices: string[];
}

export interface ConsciousnessOptimization {
  primary_focus: string;
  secondary_focuses: string[];
  optimal_practices: string[];
  timing_guidance: string;
  energy_management: string;
  integration_method: string;
}

export interface OptimizationWindow {
  start_time: string;
  end_time: string;
  opportunity_type: string;
  energy_quality: string;
  recommended_activities: string[];
  potency_score: number;
}

export interface VedicClockTCMOutput extends BaseEngineOutput {
  vimshottari_context: VimshottariContext;
  panchanga_state: PanchangaState;
  tcm_organ_state: TCMOrganState;
  elemental_synthesis: ElementalSynthesis;
  consciousness_optimization: ConsciousnessOptimization;
  personal_resonance_score: number;
  optimal_energy_window: boolean;
  upcoming_windows?: OptimizationWindow[];
  daily_curriculum: string;
  homework_practices: string[];
  progress_indicators: string[];
  [key: string]: unknown;
}

// Engine union types for generic handling
export type EngineInput = NumerologyInput | HumanDesignInput | TarotInput | IChingInput | EnneagramInput | SacredGeometryInput | BiorhythmInput | VimshottariInput | GeneKeysInput | SigilForgeInput | VedicClockTCMInput;

export type EngineOutput = NumerologyOutput | HumanDesignOutput | TarotOutput | IChingOutput | EnneagramOutput | SacredGeometryOutput | BiorhythmOutput | VimshottariOutput | GeneKeysOutput | SigilForgeOutput | VedicClockTCMOutput;

export type EngineName =
  | 'numerology'
  | 'human_design'
  | 'tarot'
  | 'iching'
  | 'enneagram'
  | 'sacred_geometry'
  | 'biorhythm'
  | 'vimshottari'
  | 'gene_keys'
  | 'sigil_forge'
  | 'vedicclock_tcm';

// Export all types - removed to avoid conflicts, using individual exports above

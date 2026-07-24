/**
 * Validation Constants for WitnessOS Engine Testing
 * 
 * Default user details for engine accuracy validation and testing
 */

export const DEFAULT_TEST_USER = {
  // Personal Details
  fullName: 'Cumbipuram Nateshan Sheshnarayan',
  email: 'sheshnarayan.iyer@gmail.com',
  password: 'Nada@Brahman314',
  
  // Birth Data
  birthDate: '1991-08-13', // 13 August 1991
  birthTime: '13:31', // 1:31 PM
  birthLocation: {
    name: 'Bangalore, India',
    latitude: 12.971599,
    longitude: 77.594566,
    timezone: 'Asia/Kolkata'
  },
  
  // Additional Context
  currentYear: new Date().getFullYear(),
  targetDate: new Date().toISOString().split('T')[0], // Today for biorhythm
} as const;

/**
 * Transform default user data for specific engine requirements
 */
export const ENGINE_INPUT_TRANSFORMERS = {
  numerology: () => ({
    full_name: DEFAULT_TEST_USER.fullName,
    birth_date: DEFAULT_TEST_USER.birthDate,
    system: 'pythagorean' as const,
    current_year: DEFAULT_TEST_USER.currentYear
  }),

  human_design: () => ({
    full_name: DEFAULT_TEST_USER.fullName,
    birth_date: DEFAULT_TEST_USER.birthDate,
    birth_time: DEFAULT_TEST_USER.birthTime,
    birth_location: [DEFAULT_TEST_USER.birthLocation.latitude, DEFAULT_TEST_USER.birthLocation.longitude],
    timezone: DEFAULT_TEST_USER.birthLocation.timezone
  }),

  biorhythm: () => ({
    birth_date: DEFAULT_TEST_USER.birthDate,
    target_date: DEFAULT_TEST_USER.targetDate,
    forecast_days: 30,
    include_extended_cycles: true
  }),

  vimshottari: () => ({
    birth_date: DEFAULT_TEST_USER.birthDate,
    birth_time: DEFAULT_TEST_USER.birthTime,
    birth_location: [DEFAULT_TEST_USER.birthLocation.latitude, DEFAULT_TEST_USER.birthLocation.longitude],
    timezone: DEFAULT_TEST_USER.birthLocation.timezone
  }),

  tarot: () => ({
    question: 'What guidance do you have for my spiritual path and consciousness development?',
    spread_type: 'three_card' as const,
    focus_area: 'spiritual_development'
  }),

  iching: () => ({
    question: 'What wisdom do you offer for my current life situation and growth?',
    method: 'coins' as const,
    include_changing_lines: true
  }),

  gene_keys: () => ({
    birth_date: DEFAULT_TEST_USER.birthDate,
    birth_time: DEFAULT_TEST_USER.birthTime,
    birth_location: [DEFAULT_TEST_USER.birthLocation.latitude, DEFAULT_TEST_USER.birthLocation.longitude],
    include_activation_sequence: true
  }),

  enneagram: () => ({
    identification_method: 'assessment' as const,
    assessment_responses: {
      'q1': '1',
      'q2': '2',
      'q3': '3'
    }
  }),
  
   sacred_geometry: () => ({
    intention: 'Explore the sacred patterns of consciousness and universal harmony',
    pattern_type: 'mandala' as const,
    petal_count: 8,
    layer_count: 3,
    color_scheme: 'chakra' as const,
    meditation_focus: true
  }),

  sigil_forge: () => ({
    intention: 'I am aligned with my highest consciousness and divine purpose',
    symbols: ['om', 'lotus', 'infinity'],
    style: 'sacred_geometry' as const,
    complexity: 'medium' as const
  })
} as const;

/**
 * Get transformed input for a specific engine
 */
export function getEngineTestInput(engineName: string): any {
  const transformer = ENGINE_INPUT_TRANSFORMERS[engineName as keyof typeof ENGINE_INPUT_TRANSFORMERS];
  if (!transformer) {
    throw new Error(`No input transformer found for engine: ${engineName}`);
  }
  return transformer();
}

/**
 * Get all engine test inputs
 */
export function getAllEngineTestInputs(): Record<string, any> {
  const inputs: Record<string, any> = {};
  
  for (const [engineName, transformer] of Object.entries(ENGINE_INPUT_TRANSFORMERS)) {
    inputs[engineName] = transformer();
  }
  
  return inputs;
}

/**
 * Validation test metadata
 */
export const VALIDATION_METADATA = {
  testUser: {
    name: DEFAULT_TEST_USER.fullName,
    birthInfo: `${DEFAULT_TEST_USER.birthDate} at ${DEFAULT_TEST_USER.birthTime}`,
    location: DEFAULT_TEST_USER.birthLocation.name,
    coordinates: `${DEFAULT_TEST_USER.birthLocation.latitude}, ${DEFAULT_TEST_USER.birthLocation.longitude}`
  },
  
  expectedEngines: [
    'numerology',
    'human_design', 
    'biorhythm',
    'vimshottari',
    'tarot',
    'iching',
    'gene_keys',
    'enneagram',
    'sacred_geometry',
    'sigil_forge'
  ],
  
  testTimestamp: new Date().toISOString(),
  
  notes: [
    'These are the default test values for engine validation',
    'Each engine will be tested with appropriate input format',
    'Results should be validated for accuracy against known calculations',
    'Any discrepancies should be noted and corrected'
  ]
} as const;

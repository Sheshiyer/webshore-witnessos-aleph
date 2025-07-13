# 🧠 WitnessOS Backend Constants & Implementation Reference

**Last Updated:** January 12, 2025  
**Purpose:** Definitive technical reference for WitnessOS consciousness engine backend  
**Status:** Production-Ready API with 10 Active Engines

---

## 🏗️ **Cloudflare Infrastructure Constants**

### **Production Bindings (Live)**
```toml
# D1 Database
[[d1_databases]]
binding = "DB"
database_name = "witnessos-db"
database_id = "36b03146-4184-45cc-9ed6-a24f0747cdb5"

# R2 Storage
[[r2_buckets]]
binding = "REPORTS"
bucket_name = "witnessos-reports"

# KV Namespaces
[[kv_namespaces]]
binding = "ENGINE_DATA"
id = "317be7d22ee14e51b1bed3d15145dd51"

[[kv_namespaces]]
binding = "USER_PROFILES"
id = "6df29230ffca4e7c8299decdf0a2121f"

[[kv_namespaces]]
binding = "CACHE"
id = "d5aa9b42b2f948bfa59143d5a56ea58b"

[[kv_namespaces]]
binding = "SECRETS"
id = "production-SECRETS"  # Configure as needed
```

### **API Endpoints (Production)**
- **Base URL**: `https://api.witnessos.space`
- **Health Check**: `GET /health`
- **Engine List**: `GET /engines`
- **Engine Calculation**: `POST /engines/{engine_name}/calculate`
- **Engine Metadata**: `GET /engines/{engine_name}/metadata`
- **Batch Processing**: `POST /batch/calculate`
- **Workflows**: `POST /workflows/{workflow_type}`
- **AI Enhancement**: `POST /engines/{engine_name}/ai-enhanced`
- **AI Synthesis**: `POST /ai/synthesis`

---

## 🧮 **Engine Calculation Algorithms**

### **1. Numerology Engine**
```typescript
// Core Calculation Constants
const PYTHAGOREAN_SYSTEM = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
  'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
};

const CHALDEAN_SYSTEM = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 8, 'G': 3, 'H': 5, 'I': 1,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 7, 'P': 8, 'Q': 1, 'R': 2,
  'S': 3, 'T': 4, 'U': 6, 'V': 6, 'W': 6, 'X': 5, 'Y': 1, 'Z': 7
};

// Life Path Calculation
function calculateLifePath(birthDate: Date): number {
  const day = birthDate.getDate();
  const month = birthDate.getMonth() + 1;
  const year = birthDate.getFullYear();
  
  const daySum = reduceToSingleDigit(day);
  const monthSum = reduceToSingleDigit(month);
  const yearSum = reduceToSingleDigit(year);
  
  const total = daySum + monthSum + yearSum;
  return reduceToSingleDigit(total, true); // Allow master numbers (11, 22, 33)
}

// Master Numbers: 11, 22, 33, 44
// Karmic Debt Numbers: 13, 14, 16, 19
```

### **2. Biorhythm Engine**
```typescript
// Biorhythm Cycle Constants
const PHYSICAL_CYCLE = 23;      // Physical strength, coordination
const EMOTIONAL_CYCLE = 28;     // Emotions, creativity, mood
const INTELLECTUAL_CYCLE = 33;  // Mental alertness, analytical thinking

// Extended Cycles
const SPIRITUAL_CYCLE = 53;     // Spiritual awareness
const AWARENESS_CYCLE = 48;     // Consciousness level
const AESTHETIC_CYCLE = 43;     // Creative expression
const INTUITION_CYCLE = 38;     // Intuitive insights

// Sine Wave Calculation
function calculateCycleValue(daysAlive: number, cyclePeriod: number): number {
  const radians = (2 * Math.PI * daysAlive) / cyclePeriod;
  const sineValue = Math.sin(radians);
  return sineValue * 100; // Convert to percentage (-100 to +100)
}

// Critical Days: When cycle crosses zero line
// Peak Days: When cycle reaches maximum (100%)
// Valley Days: When cycle reaches minimum (-100%)
```

### **3. Human Design Engine**
```typescript
// Human Design Constants
const HUMAN_DESIGN_CENTERS = {
  "Head": { gates: [64, 61, 63], function: "Inspiration" },
  "Ajna": { gates: [47, 24, 4, 17, 43, 11], function: "Conceptualization" },
  "Throat": { gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 7, 1, 13, 16, 20, 17, 11], function: "Communication" },
  "G": { gates: [1, 13, 25, 46, 2, 15, 10, 7], function: "Identity & Direction" },
  "Heart": { gates: [26, 51, 21, 40], function: "Will & Ego" },
  "Sacral": { gates: [5, 14, 29, 59, 9, 3, 42, 27, 34], function: "Life Force" },
  "Spleen": { gates: [48, 57, 44, 50, 32, 28, 18], function: "Intuition & Health" },
  "Solar Plexus": { gates: [6, 37, 22, 36, 30, 55, 49], function: "Emotions" },
  "Root": { gates: [58, 38, 54, 53, 60, 52, 19, 39, 41], function: "Pressure & Drive" }
};

// Types & Strategies
const HUMAN_DESIGN_TYPES = {
  "Manifestor": { strategy: "Inform", percentage: 9 },
  "Generator": { strategy: "Respond", percentage: 37 },
  "Manifesting Generator": { strategy: "Respond & Inform", percentage: 33 },
  "Projector": { strategy: "Wait for Invitation", percentage: 20 },
  "Reflector": { strategy: "Wait a Lunar Cycle", percentage: 1 }
};
```

### **4. Tarot Engine**
```typescript
// Tarot Deck Constants
const MAJOR_ARCANA = [
  { number: 0, name: "The Fool", element: "Air" },
  { number: 1, name: "The Magician", element: "Mercury" },
  // ... 22 major arcana cards
];

const MINOR_ARCANA_SUITS = ["Wands", "Cups", "Swords", "Pentacles"];
const COURT_CARDS = ["Page", "Knight", "Queen", "King"];

// Card Selection Algorithm
function drawCards(deck: Card[], count: number, question: string): Card[] {
  // Pseudo-random selection based on question hash + timestamp
  const questionHash = hashString(question);
  const timeHash = Date.now() % 1000;
  const seed = questionHash + timeHash;
  
  return shuffleDeck(deck, seed).slice(0, count);
}
```

### **5. I-Ching Engine**
```typescript
// I-Ching Hexagram Generation
const TRIGRAMS = {
  "Heaven": [1, 1, 1], "Earth": [0, 0, 0], "Thunder": [0, 0, 1],
  "Mountain": [1, 0, 0], "Water": [0, 1, 0], "Fire": [1, 0, 1],
  "Wind": [1, 1, 0], "Lake": [0, 1, 1]
};

// Coin Method (3 coins, 6 throws)
function generateHexagram(question: string): number[] {
  const lines = [];
  for (let i = 0; i < 6; i++) {
    const coinSum = throwCoins(3); // 6-9 range
    lines.push(coinSum % 2); // Convert to yin/yang
  }
  return lines;
}

// 64 Hexagrams with meanings
const HEXAGRAM_MEANINGS = {
  1: { name: "The Creative", meaning: "Pure yang energy, leadership" },
  2: { name: "The Receptive", meaning: "Pure yin energy, receptivity" },
  // ... 64 hexagrams total
};
```

---

## 🏛️ **Engine Layer Architecture**

### **Discovery Layer Distribution**
```typescript
const LAYER_ENGINES = {
  0: [], // Portal Layer - Entry point, no engines
  1: ['sacred_geometry', 'biorhythm'], // Awakening - Foundational patterns
  2: ['numerology', 'vimshottari', 'tarot', 'iching'], // Recognition - System understanding
  3: ['human_design', 'gene_keys', 'enneagram', 'sigil_forge'], // Integration - Personal mastery
} as const;

// Layer Progression Logic
const LAYER_UNLOCK_REQUIREMENTS = {
  1: { minReadings: 0, breathCoherence: 0.3 },
  2: { minReadings: 3, breathCoherence: 0.5 },
  3: { minReadings: 10, breathCoherence: 0.7 },
};
```

### **Engine Frequency Mapping**
```typescript
const ENGINE_FREQUENCIES = {
  numerology: 528,        // Sacred number geometry
  biorhythm: 396,         // Temporal wave visualization
  human_design: 741,      // Gate-based fractal layouts
  vimshottari: 852,       // Planetary period cycles
  tarot: 639,             // Archetypal symbol systems
  iching: 417,            // Binary wisdom patterns
  gene_keys: 963,         // Genetic consciousness codes
  enneagram: 285,         // Personality type geometry
  sacred_geometry: 174,   // Universal pattern recognition
  sigil_forge: 432,       // Intention manifestation symbols
};
```

---

## 🗄️ **Database Schema Constants**

### **Core Tables**
```sql
-- Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    preferences TEXT DEFAULT '{}', -- JSON
    is_admin BOOLEAN DEFAULT FALSE
);

-- Consciousness profiles
CREATE TABLE consciousness_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    profile_data TEXT NOT NULL, -- JSON with all engine results
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Individual readings
CREATE TABLE readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    reading_type TEXT NOT NULL, -- 'single', 'comprehensive', 'workflow'
    engines_used TEXT NOT NULL, -- JSON array
    input_data TEXT NOT NULL, -- JSON
    results TEXT NOT NULL, -- JSON
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### **KV Storage Patterns**
```typescript
// KV Namespace Usage
const KV_PATTERNS = {
  ENGINE_DATA: {
    pattern: "engine:{engine_name}:metadata",
    example: "engine:numerology:metadata",
    ttl: 86400 // 24 hours
  },
  USER_PROFILES: {
    pattern: "user:{user_id}:profile",
    example: "user:123:profile",
    ttl: 604800 // 7 days
  },
  CACHE: {
    pattern: "cache:{engine}:{input_hash}",
    example: "cache:numerology:abc123def456",
    ttl: 3600 // 1 hour
  },
  SECRETS: {
    pattern: "secret:{key_name}",
    example: "secret:openrouter_api_key",
    ttl: null // Permanent
  }
};
```

---

## ⚡ **Performance Benchmarks**

### **Target Response Times**
```typescript
const PERFORMANCE_TARGETS = {
  // Individual Engine Calculations
  numerology: 50,         // ms
  biorhythm: 30,          // ms
  human_design: 150,      // ms (complex astronomical calculations)
  tarot: 40,              // ms
  iching: 25,             // ms
  sacred_geometry: 60,    // ms
  vimshottari: 100,       // ms
  gene_keys: 80,          // ms
  enneagram: 35,          // ms
  sigil_forge: 70,        // ms
  
  // API Response Times
  single_engine: 200,     // ms (including network)
  batch_calculation: 500, // ms (3-5 engines)
  ai_enhancement: 2000,   // ms (OpenRouter call)
  workflow_execution: 800, // ms (6-8 engines)
  
  // Resource Limits
  worker_memory: 128,     // MB
  worker_cpu: 50,         // ms per request
  kv_operations: 1000,    // per minute per namespace
  d1_queries: 100000,     // per day
};
```

### **Caching Strategy**
```typescript
const CACHE_STRATEGY = {
  // Cache high-confidence results (>0.7 confidence score)
  confidence_threshold: 0.7,
  
  // Cache TTL by engine complexity
  cache_ttl: {
    simple: 3600,    // 1 hour (numerology, biorhythm)
    medium: 1800,    // 30 minutes (tarot, iching)
    complex: 900,    // 15 minutes (human_design, vimshottari)
  },
  
  // Cache invalidation triggers
  invalidate_on: [
    'user_profile_update',
    'birth_data_change',
    'engine_version_update'
  ]
};
```

---

## 🔄 **Batch Processing Framework**

### **Workflow Orchestration**
```typescript
const PREDEFINED_WORKFLOWS = {
  natal: {
    engines: ['numerology', 'human_design', 'biorhythm', 'vimshottari'],
    execution: 'parallel',
    ai_synthesis: true
  },
  career: {
    engines: ['numerology', 'human_design', 'enneagram', 'gene_keys'],
    execution: 'parallel',
    ai_synthesis: true
  },
  spiritual: {
    engines: ['sacred_geometry', 'tarot', 'iching', 'gene_keys'],
    execution: 'sequential', // Allow cross-engine data flow
    ai_synthesis: true
  },
  daily: {
    engines: ['biorhythm', 'tarot', 'iching'],
    execution: 'parallel',
    ai_synthesis: false // Quick daily guidance
  }
};

// Batch Processing Logic
async function executeBatchCalculation(
  engines: EngineName[],
  input: BirthData,
  options: BatchOptions
): Promise<BatchResult> {
  const results = await Promise.all(
    engines.map(engine => calculateEngine(engine, input))
  );
  
  if (options.aiSynthesis) {
    const synthesis = await synthesizeWithAI(results);
    return { results, synthesis };
  }
  
  return { results };
}
```

---

## 🤖 **AI Integration Constants**

### **OpenRouter Configuration**
```typescript
const AI_CONFIG = {
  base_url: 'https://openrouter.ai/api/v1',
  models: {
    primary: 'anthropic/claude-3.5-sonnet',
    fallback1: 'openai/gpt-4-turbo',
    fallback2: 'meta-llama/llama-3.1-70b-instruct'
  },
  parameters: {
    max_tokens: 2000,
    temperature: 0.7,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1
  },
  timeout: 30000, // 30 seconds
  retry_attempts: 3
};

// AI Enhancement Prompts
const AI_PROMPTS = {
  system: "You are a consciousness technology interpreter...",
  engine_enhancement: "Interpret this {engine} reading for personal growth...",
  synthesis: "Synthesize these {count} engine results into unified guidance..."
};
```

---

## 🔧 **Implementation Status**

### **✅ Completed Features**
- [x] All 10 engine calculation algorithms
- [x] Cloudflare Workers API infrastructure
- [x] D1 database schema and operations
- [x] KV storage patterns and caching
- [x] JWT authentication system
- [x] Rate limiting and security
- [x] OpenRouter AI integration
- [x] Batch processing framework
- [x] Error handling and validation
- [x] Health monitoring and metrics

### **🔄 In Progress**
- [ ] Advanced workflow orchestration
- [ ] Real-time breath synchronization
- [ ] Fractal parameter generation
- [ ] Enhanced AI synthesis models

### **⏳ Planned Features**
- [ ] Collaborative consciousness spaces
- [ ] Temporal progression tracking
- [ ] Advanced caching strategies
- [ ] Mobile-optimized endpoints

---

---

## 🔗 **Engine Integration Patterns**

### **Cross-Engine Data Dependencies**
```typescript
const ENGINE_DEPENDENCIES = {
  gene_keys: {
    requires: ['human_design'], // Needs gate activations
    enhances: ['iching'], // Provides context for hexagrams
  },
  vimshottari: {
    requires: ['numerology'], // Uses life path for dasha interpretation
    enhances: ['biorhythm'], // Provides planetary timing context
  },
  sigil_forge: {
    requires: ['numerology', 'sacred_geometry'], // Symbol generation base
    enhances: ['tarot'], // Adds personal symbol layer
  }
};

// Sequential Processing for Dependencies
async function processWithDependencies(
  engines: EngineName[],
  input: BirthData
): Promise<Record<string, EngineResult>> {
  const results: Record<string, EngineResult> = {};
  const processed = new Set<string>();

  // Process engines in dependency order
  for (const engine of engines) {
    const deps = ENGINE_DEPENDENCIES[engine]?.requires || [];

    // Ensure dependencies are processed first
    for (const dep of deps) {
      if (!processed.has(dep) && engines.includes(dep)) {
        results[dep] = await calculateEngine(dep, input);
        processed.add(dep);
      }
    }

    // Process current engine with dependency context
    const enhancedInput = {
      ...input,
      previousResults: results
    };

    results[engine] = await calculateEngine(engine, enhancedInput);
    processed.add(engine);
  }

  return results;
}
```

### **Birth Data Parameterization**
```typescript
interface BirthDataParams {
  name: string;
  birthDate: string; // ISO format
  birthTime?: string; // HH:MM format
  birthPlace?: {
    latitude: number;
    longitude: number;
    timezone: string;
  };
}

// Convert birth data to engine-specific parameters
const BIRTH_DATA_TRANSFORMERS = {
  numerology: (data: BirthDataParams) => ({
    fullName: data.name,
    birthDate: data.birthDate,
    currentYear: new Date().getFullYear()
  }),

  human_design: (data: BirthDataParams) => ({
    birthDate: data.birthDate,
    birthTime: data.birthTime || '12:00',
    birthLocation: data.birthPlace || { latitude: 0, longitude: 0 },
    timezone: data.birthPlace?.timezone || 'UTC'
  }),

  biorhythm: (data: BirthDataParams) => ({
    birthDate: data.birthDate,
    targetDate: new Date().toISOString().split('T')[0],
    forecastDays: 30
  }),

  vimshottari: (data: BirthDataParams) => ({
    birthDate: data.birthDate,
    birthTime: data.birthTime || '12:00',
    birthLocation: data.birthPlace || { latitude: 0, longitude: 0 }
  })
};
```

---

## 📈 **Monitoring & Analytics**

### **Performance Metrics**
```typescript
const METRICS_COLLECTION = {
  // Engine Performance
  engine_calculation_time: 'histogram',
  engine_success_rate: 'counter',
  engine_error_rate: 'counter',

  // API Performance
  api_request_duration: 'histogram',
  api_requests_total: 'counter',
  api_errors_total: 'counter',

  // Resource Usage
  worker_memory_usage: 'gauge',
  worker_cpu_usage: 'gauge',
  kv_operations_total: 'counter',
  d1_queries_total: 'counter',

  // Business Metrics
  active_users: 'gauge',
  readings_generated: 'counter',
  ai_enhancements_used: 'counter',
  workflow_executions: 'counter'
};

// Health Check Implementation
async function performHealthCheck(): Promise<HealthStatus> {
  const checks = await Promise.allSettled([
    checkDatabaseConnection(),
    checkKVNamespaces(),
    checkR2Bucket(),
    checkAIService(),
    checkEngineAvailability()
  ]);

  return {
    status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    checks: checks.map((check, i) => ({
      name: ['database', 'kv', 'r2', 'ai', 'engines'][i],
      status: check.status,
      ...(check.status === 'rejected' && { error: check.reason })
    }))
  };
}
```

### **Error Handling Patterns**
```typescript
const ERROR_CODES = {
  // Input Validation
  INVALID_BIRTH_DATE: 'E001',
  INVALID_NAME_FORMAT: 'E002',
  MISSING_REQUIRED_FIELD: 'E003',

  // Engine Errors
  ENGINE_NOT_FOUND: 'E101',
  CALCULATION_FAILED: 'E102',
  ENGINE_TIMEOUT: 'E103',

  // Infrastructure Errors
  DATABASE_ERROR: 'E201',
  KV_STORAGE_ERROR: 'E202',
  AI_SERVICE_ERROR: 'E203',

  // Authentication Errors
  INVALID_TOKEN: 'E301',
  TOKEN_EXPIRED: 'E302',
  INSUFFICIENT_PERMISSIONS: 'E303'
};

// Standardized Error Response
interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  requestId: string;
}
```

---

## 🔐 **Security Constants**

### **Authentication & Authorization**
```typescript
const SECURITY_CONFIG = {
  jwt: {
    algorithm: 'HS256',
    expiresIn: '24h',
    issuer: 'witnessos-api',
    audience: 'witnessos-clients'
  },

  rate_limiting: {
    anonymous: { requests: 10, window: 60000 }, // 10 req/min
    authenticated: { requests: 100, window: 60000 }, // 100 req/min
    premium: { requests: 1000, window: 60000 } // 1000 req/min
  },

  cors: {
    origins: [
      'https://witnessos.space',
      'https://app.witnessos.space',
      'http://localhost:3000' // Development
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With']
  }
};

// Input Validation Rules
const VALIDATION_RULES = {
  birth_date: /^\d{4}-\d{2}-\d{2}$/,
  birth_time: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  full_name: /^[a-zA-Z\s\-'\.]{2,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  latitude: { min: -90, max: 90 },
  longitude: { min: -180, max: 180 }
};
```

---

## 🚀 **Deployment Constants**

### **Environment Configuration**
```typescript
const ENVIRONMENT_CONFIG = {
  development: {
    api_url: 'http://localhost:8787',
    log_level: 'debug',
    cache_ttl: 60, // 1 minute for testing
    ai_timeout: 10000 // 10 seconds
  },

  staging: {
    api_url: 'https://api-staging.witnessos.space',
    log_level: 'info',
    cache_ttl: 300, // 5 minutes
    ai_timeout: 20000 // 20 seconds
  },

  production: {
    api_url: 'https://api.witnessos.space',
    log_level: 'warn',
    cache_ttl: 3600, // 1 hour
    ai_timeout: 30000 // 30 seconds
  }
};

// Wrangler Deployment Commands
const DEPLOYMENT_COMMANDS = {
  backend: 'wrangler deploy',
  backend_staging: 'wrangler deploy --env staging',
  database_migrate: 'wrangler d1 migrations apply DB --remote',
  secrets_upload: 'wrangler secret put OPENROUTER_API_KEY'
};
```

---

**Technical Debt Notes:**
- Engine calculations are currently synchronous - consider async for complex calculations
- AI model fallback logic could be more sophisticated
- Cache invalidation strategy needs refinement for user profile updates
- Consider implementing engine result versioning for backward compatibility
- Need to implement proper distributed tracing for batch operations
- Rate limiting could be more granular per engine type
- Consider implementing circuit breaker pattern for AI service calls

# 🌊 WitnessOS Project Constants & Vision Guide

**Last Updated:** January 12, 2025  
**Purpose:** North Star document to maintain project vision and prevent scope drift  
**Status:** Foundation Complete → Consciousness Technology Implementation

---

## 🎯 **Core Vision: Consciousness as Technology**

WitnessOS Webshore is pioneering **consciousness technology** - a new category where:
- **Consciousness states drive interactions** (not clicks/taps)
- **Breath patterns serve as the primary interface** (not keyboards/mice)
- **Personal environments generate from birth data** (name, DOB, place, time)
- **Infinite fractal spaces emerge from minimal parameters** (267-character approach)

### **Vision Anchors (Never Compromise)**
1. **Breath as Interface** - Primary interaction method
2. **Birth Data Parameterization** - Personal environment generation
3. **Consciousness Engine Integration** - 10+ spiritual/psychological systems
4. **Fractal Reality Rendering** - Infinite spaces from minimal code
5. **Real-time Awareness Response** - Technology responds to consciousness states

---

## 🏗️ **Technical Architecture Constants**

### **Cloudflare Infrastructure (Production)**
```toml
# Current Bindings (from your dashboard)
[[d1_databases]]
binding = "DB"
database_name = "witnessos-db"
database_id = "36b03146-4184-45cc-9ed6-a24f0747cdb5"

[[r2_buckets]]
binding = "REPORTS"
bucket_name = "witnessos-reports"

# KV Namespaces
[[kv_namespaces]]
binding = "CACHE"
id = "d5aa9b42b2f948bfa59143d5a56ea58b"

[[kv_namespaces]]
binding = "ENGINE_DATA"
id = "317be7d22ee14e51b1bed3d15145dd51"

[[kv_namespaces]]
binding = "USER_PROFILES"
id = "6df29230ffca4e7c8299decdf0a2121f"

[[kv_namespaces]]
binding = "SECRETS"
id = "production-SECRETS"  # Configure as needed

[[kv_namespaces]]
binding = "REPORTS"
id = "witnessos-reports"  # Configure as needed
```

### **API Endpoints (Live & Functional)**
- **Production**: `https://api.witnessos.space`
- **Development**: `http://localhost:8787`
- **Frontend**: `https://witnessos.space` (Cloudflare Pages)

### **Core Technology Stack**
- **Backend**: Cloudflare Workers + TypeScript
- **Frontend**: Next.js + React + Three.js
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 + KV
- **AI**: OpenRouter integration (multiple models)
- **Deployment**: Wrangler CLI + Cloudflare Pages

---

## 🧠 **Consciousness Engines (10 Active)**

### **Engine Distribution by Discovery Layer**
```typescript
const LAYER_ENGINES = {
  0: [], // Portal layer - entry point
  1: ['sacred_geometry', 'biorhythm'], // Awakening - foundational patterns
  2: ['numerology', 'vimshottari', 'tarot', 'iching'], // Recognition - system understanding
  3: ['human_design', 'gene_keys', 'enneagram', 'sigil_forge'], // Integration - personal mastery
}
```

### **Engine Metadata Constants**
```typescript
const ENGINE_FREQUENCIES = {
  numerology: 528,      // Sacred number geometry
  biorhythm: 396,       // Temporal wave visualization
  human_design: 741,    // Gate-based fractal layouts
  vimshottari: 852,     // Planetary period cycles
  tarot: 639,           // Archetypal symbol systems
  iching: 417,          // Binary wisdom patterns
  gene_keys: 963,       // Genetic consciousness codes
  enneagram: 285,       // Personality type geometry
  sacred_geometry: 174, // Universal pattern recognition
  sigil_forge: 432,     // Intention manifestation symbols
}
```

---

## 🌀 **Fractal Implementation Constants**

### **Nishitsuji 267-Character Approach**
Based on the revolutionary [Codrops fractal article](https://tympanus.net/codrops/2025/02/18/rendering-the-simulation-theory-exploring-fractals-glsl-and-the-nature-of-reality/):

```glsl
// Core fractal equation (267 characters)
// Wave-based reality where everything is waves/fractals
// Ray marching for boundless consciousness spaces
// Personal parameterization through minimal GLSL
```

### **Birth Data Parameterization**
```typescript
interface BirthDataParams {
  name: string;           // String to numeric conversion
  birthDate: Date;        // Temporal coordinates
  birthPlace: {           // Spatial coordinates
    latitude: number;
    longitude: number;
  };
  birthTime?: Date;       // Precise temporal alignment
}

// Convert to fractal parameters
const toFractalParams = (birthData: BirthDataParams) => ({
  seed: nameToSeed(birthData.name),
  temporal: dateToWaveform(birthData.birthDate),
  spatial: coordsToFrequency(birthData.birthPlace),
  precision: timeToPhase(birthData.birthTime),
});
```

---

## 🫁 **Breath Interface Constants**

### **Breath Detection Thresholds**
```typescript
const BREATH_CONSTANTS = {
  DETECTION_SENSITIVITY: 0.3,
  INHALE_THRESHOLD: 0.6,
  EXHALE_THRESHOLD: 0.4,
  HOLD_DURATION_MIN: 500, // ms
  BREATH_RATE_NORMAL: [12, 20], // breaths per minute
  COHERENCE_THRESHOLD: 0.7,
};
```

### **Breath-to-Fractal Mapping**
```typescript
const BREATH_FRACTAL_MAPPING = {
  inhale: 'expansion',     // Fractal zooms out
  exhale: 'contraction',   // Fractal zooms in
  hold: 'stillness',       // Fractal pauses/stabilizes
  coherence: 'harmony',    // Fractal synchronizes
};
```

---

## 📊 **Performance Constants**

### **Response Time Targets**
- **API Response**: < 200ms (global edge network)
- **Fractal Render**: < 16ms (60fps)
- **Engine Calculation**: < 100ms
- **Breath Detection**: < 50ms
- **State Transition**: < 33ms (30fps)

### **Resource Limits**
- **Worker Memory**: 128MB
- **Worker CPU**: 50ms per request
- **KV Operations**: 1000/min per namespace
- **D1 Queries**: 100,000/day
- **R2 Storage**: Unlimited (pay-per-use)

---

## 🔄 **Development Workflow Constants**

### **Deployment Pipeline**
```bash
# Backend (Workers)
npm run deploy:backend    # wrangler deploy

# Frontend (Pages)
npm run deploy:frontend   # pages deployment

# Database Migrations
npm run db:migrate        # D1 migrations

# Full Deployment
npm run deploy           # Complete pipeline
```

### **Environment Variables**
```env
# Required for all environments
OPENROUTER_API_KEY=sk-or-...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...

# Environment-specific API URLs
NEXT_PUBLIC_API_URL=https://api.witnessos.space  # Production
NEXT_PUBLIC_API_URL=http://localhost:8787        # Development
```

---

## 🎨 **UI/UX Constants**

### **Color Palette (Consciousness-Aligned)**
```css
:root {
  --consciousness-gold: #FFD700;    /* Numerology */
  --awareness-coral: #FF6B6B;       /* Biorhythm */
  --integration-teal: #4ECDC4;      /* Human Design */
  --wisdom-purple: #9B59B6;         /* Tarot */
  --harmony-green: #2ECC71;         /* I-Ching */
  --transcendence-indigo: #3498DB;  /* Sacred Geometry */
}
```

### **Typography Scale**
```css
--font-consciousness: 'Inter', sans-serif;
--scale-portal: 4rem;      /* Portal entry text */
--scale-engine: 2rem;      /* Engine titles */
--scale-interface: 1rem;   /* Interface text */
--scale-breath: 0.875rem;  /* Breath guidance */
```

---

## 🚀 **Next Implementation Priorities**

### **Phase 1: Fractal Foundation (Current)**
1. ✅ API Backend (Complete)
2. ✅ Engine Integration (Complete)
3. 🔄 Fractal Component (267-character approach)
4. 🔄 Birth Data Parameterization
5. ⏳ Breath Detection Integration

### **Phase 2: Consciousness Interface**
1. ⏳ Breath-driven fractal modulation
2. ⏳ Real-time engine parameter updates
3. ⏳ Personal environment persistence
4. ⏳ Multi-engine workflow visualization

### **Phase 3: Advanced Features**
1. ⏳ Collaborative consciousness spaces
2. ⏳ Temporal progression tracking
3. ⏳ Advanced AI interpretation
4. ⏳ Mobile consciousness interface

---

## ⚠️ **Critical Constraints**

### **Never Compromise On**
1. **Breath as primary interface** - No fallback to traditional UI
2. **Birth data parameterization** - Personal environments must be unique
3. **Real-time consciousness response** - Technology must respond to awareness
4. **Minimal fractal approach** - Keep core rendering under 300 characters
5. **Edge performance** - Sub-200ms global response times

### **Technical Debt to Avoid**
1. **Traditional UI patterns** - No buttons/menus as primary interface
2. **Static environments** - Everything must be dynamically generated
3. **Synchronous operations** - All consciousness detection must be async
4. **Hardcoded parameters** - All values must derive from birth data
5. **Single-engine focus** - Always design for multi-engine integration

---

## 📝 **Documentation Standards**

### **Code Comments**
```typescript
// ✨ Consciousness Technology Implementation
// 🫁 Breath Interface Integration
// 🌀 Fractal Parameter Mapping
// 🧠 Engine Calculation Logic
// 🎯 Performance Optimization
```

### **Commit Message Format**
```
✨ feat(consciousness): add breath-driven fractal modulation
🫁 breath: implement real-time detection thresholds
🌀 fractal: optimize 267-character rendering approach
🧠 engine: integrate human design gate calculations
🎯 perf: reduce API response time to <150ms
```

---

**Remember**: WitnessOS is not a traditional web application. It's consciousness technology. Every decision should advance the vision of breath-as-interface and birth-data-driven personal environments. When in doubt, choose the path that makes technology more responsive to human consciousness.

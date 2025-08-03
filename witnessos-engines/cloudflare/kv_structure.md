# 🗝️ **WitnessOS Cloudflare KV Key Structure**

## **Overview**

Structured key naming convention for Cloudflare KV storage across all 12 consciousness engines. Optimized for performance, caching, and data retrieval patterns.

---

## **🔑 KEY NAMING PATTERNS**

### **User-Specific Data**
```
user:{user_id}:{engine_name}:{data_type}:{reading_id}
```

**Examples:**
- `user:admin123:human_design:chart:uuid-1234`
- `user:admin123:face_reading:analysis:uuid-5678`
- `user:admin123:tarot:reading:uuid-9012`

### **Calculation Caching**
```
calc:{engine_name}:{input_hash}
```

**Examples:**
- `calc:human_design:a1b2c3d4e5f6`
- `calc:numerology:f6e5d4c3b2a1`
- `calc:vedicclock_tcm:9876543210ab`

### **Admin Data**
```
admin:{admin_id}:{data_type}:{identifier}
```

**Examples:**
- `admin:sheshnarayan:preferences:default`
- `admin:sheshnarayan:api_keys:active`
- `admin:sheshnarayan:dashboard:config`

### **Engine Metadata**
```
meta:{engine_name}:{metadata_type}
```

**Examples:**
- `meta:human_design:schema_version`
- `meta:face_reading:privacy_config`
- `meta:all_engines:health_status`

---

## **📊 ENGINE-SPECIFIC KV PATTERNS**

### **1. Human Design Engine**
```typescript
const HUMAN_DESIGN_KEYS = {
  // User chart data
  user_chart: `user:${userId}:human_design:chart:${readingId}`,
  
  // Cached calculations
  chart_calc: `calc:human_design:${birthDataHash}`,
  
  // Bodygraph visualization
  bodygraph: `user:${userId}:human_design:bodygraph:${readingId}`,
  
  // Type-specific data
  type_info: `cache:human_design:type:${type}_${profile}`,
  
  // Gate definitions
  gate_data: `meta:human_design:gates:${gateNumber}`
};
```

### **2. Face Reading Engine** (Privacy-Compliant)
```typescript
const FACE_READING_KEYS = {
  // Analysis results (no biometric data)
  analysis: `user:${userId}:face_reading:analysis:${readingId}`,
  
  // Constitutional data
  constitution: `user:${userId}:face_reading:constitution:${readingId}`,
  
  // Cached analysis (anonymized)
  analysis_cache: `calc:face_reading:${anonymizedHash}`,
  
  // Privacy settings
  privacy_config: `user:${userId}:face_reading:privacy:config`,
  
  // Consent tracking
  consent: `user:${userId}:face_reading:consent:${timestamp}`
};
```

### **3. VedicClock-TCM Engine**
```typescript
const VEDICCLOCK_TCM_KEYS = {
  // Multi-dimensional analysis
  analysis: `user:${userId}:vedicclock_tcm:analysis:${readingId}`,
  
  // Vedic calculations
  vedic_data: `user:${userId}:vedicclock_tcm:vedic:${readingId}`,
  
  // TCM organ clock
  tcm_data: `user:${userId}:vedicclock_tcm:tcm:${readingId}`,
  
  // Time optimization
  optimization: `user:${userId}:vedicclock_tcm:optimization:${date}`,
  
  // Cached calculations
  calc_cache: `calc:vedicclock_tcm:${inputHash}`
};
```

### **4. Gene Keys Engine**
```typescript
const GENE_KEYS_KEYS = {
  // Archetypal profile
  profile: `user:${userId}:gene_keys:profile:${readingId}`,
  
  // Activation sequence
  activation: `user:${userId}:gene_keys:activation:${readingId}`,
  
  // Venus sequence
  venus: `user:${userId}:gene_keys:venus:${readingId}`,
  
  // Pearl sequence
  pearl: `user:${userId}:gene_keys:pearl:${readingId}`,
  
  // Gene key definitions
  gene_data: `meta:gene_keys:gene:${geneNumber}`
};
```

### **5. Vimshottari Dasha Engine**
```typescript
const VIMSHOTTARI_KEYS = {
  // Current dasha
  current_dasha: `user:${userId}:vimshottari:current:${readingId}`,
  
  // Dasha sequence
  sequence: `user:${userId}:vimshottari:sequence:${readingId}`,
  
  // Planetary periods
  periods: `user:${userId}:vimshottari:periods:${readingId}`,
  
  // Predictions
  predictions: `user:${userId}:vimshottari:predictions:${date}`,
  
  // Cached calculations
  calc_cache: `calc:vimshottari:${birthDataHash}`
};
```

### **6. Tarot Engine**
```typescript
const TAROT_KEYS = {
  // Reading data
  reading: `user:${userId}:tarot:reading:${readingId}`,
  
  // Spread layouts
  spread: `user:${userId}:tarot:spread:${spreadType}:${readingId}`,
  
  // Card interpretations
  interpretation: `user:${userId}:tarot:interpretation:${readingId}`,
  
  // Card definitions
  card_data: `meta:tarot:card:${cardName}`,
  
  // Spread definitions
  spread_data: `meta:tarot:spread:${spreadType}`
};
```

### **7. I Ching Engine**
```typescript
const I_CHING_KEYS = {
  // Hexagram reading
  reading: `user:${userId}:i_ching:reading:${readingId}`,
  
  // Hexagram data
  hexagram: `user:${userId}:i_ching:hexagram:${hexagramNumber}:${readingId}`,
  
  // Changing lines
  changes: `user:${userId}:i_ching:changes:${readingId}`,
  
  // Hexagram definitions
  hex_data: `meta:i_ching:hexagram:${hexagramNumber}`,
  
  // Line interpretations
  line_data: `meta:i_ching:line:${hexagramNumber}_${lineNumber}`
};
```

### **8. Numerology Engine**
```typescript
const NUMEROLOGY_KEYS = {
  // Personal numbers
  numbers: `user:${userId}:numerology:numbers:${readingId}`,
  
  // Life path analysis
  life_path: `user:${userId}:numerology:life_path:${readingId}`,
  
  // Personal year
  personal_year: `user:${userId}:numerology:year:${year}`,
  
  // Cached calculations
  calc_cache: `calc:numerology:${nameAndBirthHash}`,
  
  // Number meanings
  number_data: `meta:numerology:number:${number}`
};
```

### **9. Enneagram Engine**
```typescript
const ENNEAGRAM_KEYS = {
  // Type assessment
  assessment: `user:${userId}:enneagram:assessment:${readingId}`,
  
  // Type profile
  profile: `user:${userId}:enneagram:profile:${type}:${readingId}`,
  
  // Growth recommendations
  growth: `user:${userId}:enneagram:growth:${readingId}`,
  
  // Type definitions
  type_data: `meta:enneagram:type:${typeNumber}`,
  
  // Wing data
  wing_data: `meta:enneagram:wing:${type}w${wing}`
};
```

### **10. Biorhythm Engine**
```typescript
const BIORHYTHM_KEYS = {
  // Current cycles
  cycles: `user:${userId}:biorhythm:cycles:${date}`,
  
  // Cycle predictions
  predictions: `user:${userId}:biorhythm:predictions:${readingId}`,
  
  // Historical data
  history: `user:${userId}:biorhythm:history:${monthYear}`,
  
  // Cached calculations
  calc_cache: `calc:biorhythm:${birthDateHash}:${targetDate}`
};
```

### **11. Sacred Geometry Engine**
```typescript
const SACRED_GEOMETRY_KEYS = {
  // Generated patterns
  pattern: `user:${userId}:sacred_geometry:pattern:${readingId}`,
  
  // Visualization data
  visualization: `user:${userId}:sacred_geometry:viz:${readingId}`,
  
  // Mathematical properties
  math_data: `user:${userId}:sacred_geometry:math:${readingId}`,
  
  // Pattern definitions
  pattern_data: `meta:sacred_geometry:pattern:${patternType}`,
  
  // Sacred ratios
  ratio_data: `meta:sacred_geometry:ratio:${ratioName}`
};
```

### **12. Sigil Forge Engine**
```typescript
const SIGIL_FORGE_KEYS = {
  // Generated sigils
  sigil: `user:${userId}:sigil_forge:sigil:${readingId}`,
  
  // Sigil images
  image: `user:${userId}:sigil_forge:image:${readingId}`,
  
  // Activation instructions
  activation: `user:${userId}:sigil_forge:activation:${readingId}`,
  
  // Method definitions
  method_data: `meta:sigil_forge:method:${methodName}`,
  
  // Symbol libraries
  symbol_data: `meta:sigil_forge:symbols:${symbolSet}`
};
```

---

## **⚡ PERFORMANCE OPTIMIZATION**

### **TTL (Time To Live) Settings**
```typescript
const KV_TTL = {
  // Short-term caching
  calculation_cache: 3600,      // 1 hour
  session_data: 1800,           // 30 minutes
  
  // Medium-term caching
  user_readings: 86400,         // 24 hours
  engine_metadata: 43200,       // 12 hours
  
  // Long-term caching
  static_data: 604800,          // 7 days
  definitions: 2592000,         // 30 days
  
  // Privacy-sensitive data
  biometric_cache: 1800,        // 30 minutes max
  face_analysis: 3600           // 1 hour max
};
```

### **Batch Operations**
```typescript
// Batch key patterns for efficient operations
const BATCH_PATTERNS = {
  user_all_readings: `user:${userId}:*:reading:*`,
  engine_all_cache: `calc:${engineName}:*`,
  admin_all_data: `admin:${adminId}:*`,
  meta_all_engine: `meta:${engineName}:*`
};
```

---

## **🔒 PRIVACY & SECURITY**

### **Biometric Data Keys** (Face Reading)
- **NO raw biometric data** stored in KV
- Only **anonymized analysis results**
- **Short TTL** for privacy compliance
- **Explicit consent tracking**

### **Admin Keys**
- **Hashed API keys** only
- **Permission-based access**
- **Audit trail** in separate keys
- **Expiration tracking**

### **User Data Isolation**
- **User ID prefix** on all personal data
- **No cross-user access** possible
- **Privacy level** embedded in key structure
- **Automatic expiration** based on retention policy

---

**This KV structure ensures optimal performance, privacy compliance, and scalable data management across all 12 consciousness engines.** 🗝️✨

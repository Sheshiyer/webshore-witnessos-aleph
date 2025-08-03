# 🧠 WitnessOS Consciousness Engines API Documentation

## Base URL
- **Production**: `https://witnessos-engines-production.up.railway.app` (pending Railway fix)
- **Fallback**: Frontend TypeScript engines (fully functional)

## Authentication
Currently no authentication required. Admin API key system available for elevated access.

---

## 🏥 Health & Status Endpoints

### GET `/`
Root endpoint with service information.

**Response:**
```json
{
  "service": "WitnessOS Consciousness Engines",
  "status": "operational",
  "version": "1.0.0",
  "engines_available": 13,
  "endpoints": {
    "health": "/health",
    "engines": "/engines",
    "docs": "/docs",
    "calculate": "/engines/{engine_name}/calculate"
  }
}
```

### GET `/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "witnessos-engines",
  "timestamp": "2025-08-03T16:00:00Z",
  "engines_available": ["human_design", "numerology", "biorhythm", "..."],
  "swiss_ephemeris": "operational"
}
```

### GET `/engines`
List all available consciousness engines.

**Response:**
```json
{
  "engines": ["human_design", "numerology", "biorhythm", "vimshottari", "tarot", "iching", "gene_keys", "enneagram", "sacred_geometry", "sigil_forge", "vedicclock_tcm", "face_reading", "biofield"],
  "count": 13,
  "service": "witnessos-engines"
}
```

---

## 🔮 Engine Calculation Endpoints

### POST `/engines/{engine_name}/calculate`
Calculate consciousness analysis for specified engine.

**Path Parameters:**
- `engine_name`: One of the available engines

**Request Body:**
```json
{
  "input": {
    // Engine-specific input parameters
  },
  "options": {
    // Optional engine-specific options
  }
}
```

**Response:**
```json
{
  "success": true,
  "engine": "engine_name",
  "processing_time": 1.23,
  "result": {
    // Engine-specific calculation results
  },
  "timestamp": "2025-08-03T16:00:00Z"
}
```

---

## 🧬 Individual Engine Specifications

### 1. Human Design Scanner
**Endpoint:** `POST /engines/human_design/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31:00",
    "birth_location": [12.9716, 77.5946],
    "timezone": "Asia/Kolkata"
  }
}
```

**Output:** Type, Strategy, Authority, Profile, Centers, Gates, Channels

### 2. Numerology Engine
**Endpoint:** `POST /engines/numerology/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "full_name": "John Doe",
    "preferred_name": "Johnny",
    "system": "pythagorean"
  }
}
```

**Output:** Life Path, Expression, Soul Urge, Personality, Master Numbers

### 3. Biorhythm Engine
**Endpoint:** `POST /engines/biorhythm/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "target_date": "2025-08-03",
    "cycles": ["physical", "emotional", "intellectual"]
  }
}
```

**Output:** Cycle positions, Critical days, Compatibility periods

### 4. Vimshottari Timeline Mapper
**Endpoint:** `POST /engines/vimshottari/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31:00",
    "birth_location": [12.9716, 77.5946],
    "timezone": "Asia/Kolkata"
  }
}
```

**Output:** Dasha periods, Current period, Upcoming transitions

### 5. Tarot Sequence Decoder
**Endpoint:** `POST /engines/tarot/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "question": "What guidance do I need?",
    "spread_type": "three_card"
  }
}
```

**Output:** Card meanings, Positions, Interpretations

### 6. I-Ching Mutation Oracle
**Endpoint:** `POST /engines/iching/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "question": "What is my path?",
    "method": "coin_toss"
  }
}
```

**Output:** Hexagram, Lines, Interpretation, Changing lines

### 7. Gene Keys Compass
**Endpoint:** `POST /engines/gene_keys/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31:00",
    "birth_location": [12.9716, 77.5946],
    "timezone": "Asia/Kolkata"
  }
}
```

**Output:** Life's Work, Evolution, Radiance, Purpose

### 8. Enneagram Resonator
**Endpoint:** `POST /engines/enneagram/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "assessment_responses": [1, 2, 3, 4, 5],
    "instinctual_variant": "sp"
  }
}
```

**Output:** Type, Wing, Instinct, Integration/Disintegration

### 9. Sacred Geometry Mapper
**Endpoint:** `POST /engines/sacred_geometry/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31:00",
    "birth_location": [12.9716, 77.5946],
    "geometry_type": "flower_of_life"
  }
}
```

**Output:** Geometric patterns, Sacred ratios, Harmonic frequencies

### 10. Sigil Forge Synthesizer
**Endpoint:** `POST /engines/sigil_forge/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "intention": "Manifest abundance",
    "style": "chaos_magic"
  }
}
```

**Output:** Sigil design, Activation method, Timing guidance

### 11. VedicClock-TCM Engine
**Endpoint:** `POST /engines/vedicclock_tcm/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31:00",
    "birth_location": [12.9716, 77.5946],
    "timezone": "Asia/Kolkata"
  }
}
```

**Output:** Organ clock, Five elements, Constitutional analysis

### 12. Face Reading Engine
**Endpoint:** `POST /engines/face_reading/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31:00",
    "birth_location": [12.9716, 77.5946],
    "timezone": "Asia/Kolkata",
    "processing_consent": true
  }
}
```

**Output:** Constitutional analysis, Personality traits, Health indicators

### 13. Biofield Engine
**Endpoint:** `POST /engines/biofield/calculate`

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "image_data": "<BASE64_ENCODED_IMAGE>",
    "analysis_mode": "single_frame",
    "biometric_consent": true
  }
}
```

**Output:** Spatial metrics, Colour analysis, Composite scores, Recommendations

---

## 🌟 Swiss Ephemeris Integration

### POST `/swiss_ephemeris/calculate`
Direct access to Swiss Ephemeris astronomical calculations.

**Input:**
```json
{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31:00",
    "birth_location": [12.9716, 77.5946]
  },
  "options": {
    "planets": ["sun", "moon", "mercury", "venus", "mars"],
    "houses": true,
    "aspects": true
  }
}
```

**Output:** Planetary positions, Houses, Aspects, Precision data

---

## 🧪 Testing Endpoints

### GET `/test/admin-user`
Test all engines with admin user data for validation.

**Response:**
```json
{
  "swiss_ephemeris": {
    "personality_sun": "Gate 4.1",
    "design_sun": "Gate 2.6"
  },
  "human_design_engine": {
    "type": "Generator",
    "profile": "2/4"
  },
  "all_engines_status": "operational"
}
```

---

## 📊 Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error description",
  "error_type": "ValidationError",
  "engine": "engine_name",
  "timestamp": "2025-08-03T16:00:00Z"
}
```

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Engine not found
- `422`: Validation Error
- `500`: Internal Server Error
- `503`: Service Unavailable

> **Privacy Note:** `face_reading` and `biofield` endpoints require the `biometric_consent` flag set to **true**; raw media is discarded unless explicitly requested via engine options.

---

## 🔧 Development & Testing

### Local Testing
```bash
# Test health endpoint
curl http://localhost:8000/health

# Test engine calculation
curl -X POST http://localhost:8000/engines/numerology/calculate \
  -H "Content-Type: application/json" \
  -d '{"input":{"birth_date":"1991-08-13","full_name":"Test User"}}'
```

### Production Testing
```bash
# Use provided test scripts
python test_railway_backend.py
python test_railway_root_endpoints.py
```

---

## 📚 Additional Resources

- **Interactive API Docs**: `/docs` (Swagger UI)
- **Alternative Docs**: `/redoc` (ReDoc)
- **Repository**: [webshore-witnessos-aleph](https://github.com/Sheshiyer/webshore-witnessos-aleph)
- **Frontend**: Intelligent fallback system with TypeScript engines

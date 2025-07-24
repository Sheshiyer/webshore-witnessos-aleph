# WitnessOS Consciousness API Documentation

## 🌟 **Overview**

The WitnessOS Consciousness API provides access to a sophisticated consciousness exploration platform featuring 10 different spiritual and psychological analysis engines, multi-engine workflows, and AI-enhanced interpretations.

### **Base URLs**
- **Production**: `https://witnessos-api.sheshnarayan-iyer.workers.dev`
- **Engine Proxy**: `https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev`
- **Railway Python Engines**: `https://webshore-witnessos-aleph-production.up.railway.app`
- **Development**: `http://localhost:8787`

### **Hybrid Architecture**
WitnessOS uses a hybrid architecture for optimal performance and accuracy:
- **Cloudflare Workers**: Handle authentication, routing, caching, and API orchestration
- **Railway Python Engines**: Provide 100% accurate consciousness calculations using Swiss Ephemeris
- **Edge Caching**: Intelligent KV-based caching for improved response times
- **Automatic Failover**: Built-in retry mechanisms and health monitoring

### **Railway Integration**
The consciousness engines run on Railway's infrastructure for maximum accuracy:
- **Swiss Ephemeris**: Professional-grade astronomical calculations
- **Python FastAPI**: High-performance engine runtime
- **Automatic Scaling**: Handles traffic spikes seamlessly
- **Health Monitoring**: Continuous uptime and performance tracking
- **Direct Access**: Engine proxy allows direct Railway communication

**Railway Engine URL**: `https://webshore-witnessos-aleph-production.up.railway.app`

**Available Engines**:
- `numerology`: Life path and destiny calculations
- `human_design`: Complete bodygraph with Swiss Ephemeris precision
- `biorhythm`: Physical, emotional, and intellectual cycles

### **Authentication**
Most endpoints require JWT authentication. Include your token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🎯 **Quick Start**

### **1. Register and Login**
```bash
# Register new user
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "Your Name"
  }'

# Login to get JWT token
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

### **2. Health Check**
```bash
# Main API health
curl https://witnessos-api.sheshnarayan-iyer.workers.dev/health

# Engine proxy health
curl https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev/health
```

### **3. List Available Engines**
```bash
# Via main API
curl https://witnessos-api.sheshnarayan-iyer.workers.dev/api/engines

# Direct from engine proxy
curl https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev/engines
```

### **4. Calculate with an Engine**
```bash
# Via main API (recommended)
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/api/engines/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "numerology",
    "birth_data": {
      "date": "1990-01-15",
      "full_name": "Alex Morgan"
    }
  }'

# Direct engine proxy
curl -X POST https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "numerology",
    "birth_data": {
      "date": "1990-01-15",
      "full_name": "Alex Morgan"
    }
  }'
```

---

## 🧠 **Consciousness Engines**

### **List All Engines**
```bash
# Via main API (includes authentication and caching)
curl https://witnessos-api.sheshnarayan-iyer.workers.dev/api/engines

# Direct from engine proxy (faster, no auth required)
curl https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev/engines
```

**Response:**
```json
{
  "success": true,
  "data": {
    "engines": [
      {
        "id": "numerology",
        "name": "Numerology",
        "description": "Life path and destiny number calculations",
        "version": "1.0.0",
        "status": "active",
        "provider": "railway"
      },
      {
        "id": "human_design",
        "name": "Human Design",
        "description": "Complete Human Design chart analysis using Swiss Ephemeris",
        "version": "1.0.0",
        "status": "active",
        "provider": "railway"
      },
      {
        "id": "biorhythm",
        "name": "Biorhythm",
        "description": "Physical, emotional, and intellectual cycles",
        "version": "1.0.0",
        "status": "active",
        "provider": "railway"
      }
    ],
    "swiss_ephemeris": true,
    "provider_status": "healthy"
  }
}
```

### **Available Engines**

| Engine | Endpoint | Description |
|--------|----------|-------------|
| **Numerology** | `/engines/numerology/calculate` | Life path, expression, and soul urge calculations |
| **Human Design** | `/engines/human_design/calculate` | Type, strategy, authority, and centers analysis |
| **Tarot** | `/engines/tarot/calculate` | Card spreads and interpretations |
| **I-Ching** | `/engines/iching/calculate` | Hexagram generation and wisdom |
| **Enneagram** | `/engines/enneagram/calculate` | Personality type and growth patterns |
| **Sacred Geometry** | `/engines/sacred_geometry/calculate` | Geometric pattern analysis |
| **Biorhythm** | `/engines/biorhythm/calculate` | Physical, emotional, and intellectual cycles |
| **Vimshottari** | `/engines/vimshottari/calculate` | Vedic dasha periods and timing |
| **Gene Keys** | `/engines/gene_keys/calculate` | 64 archetypal keys analysis |
| **Sigil Forge** | `/engines/sigil_forge/calculate` | Sacred symbol creation |

### **Engine Input Examples**

#### **Numerology**
```bash
# Via main API (recommended)
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/api/engines/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "numerology",
    "birth_data": {
      "date": "1990-01-15",
      "full_name": "Alexander Morgan",
      "birth_name": "Alexander James Morgan"
    }
  }'

# Direct engine proxy
curl -X POST https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "numerology",
    "birth_data": {
      "date": "1990-01-15",
      "full_name": "Alexander Morgan",
      "birth_name": "Alexander James Morgan"
    }
  }'
```

#### **Human Design**
```bash
# Via main API (recommended)
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/api/engines/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "human_design",
    "birth_data": {
      "date": "1990-01-15",
      "time": "14:30",
      "location": {
        "city": "New York",
        "country": "US",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "timezone": "America/New_York"
      }
    }
  }'

# Direct engine proxy
curl -X POST https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "human_design",
    "birth_data": {
      "date": "1990-01-15",
      "time": "14:30",
      "location": {
        "city": "New York",
        "country": "US",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "timezone": "America/New_York"
      }
    }
  }'
```

#### **Biorhythm**
```bash
# Via main API (recommended)
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/api/engines/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "biorhythm",
    "birth_data": {
      "date": "1990-01-15",
      "target_date": "2025-06-24",
      "cycles": ["physical", "emotional", "intellectual"]
    }
  }'

# Direct engine proxy
curl -X POST https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "biorhythm",
    "birth_data": {
      "date": "1990-01-15",
      "target_date": "2025-06-24",
      "cycles": ["physical", "emotional", "intellectual"]
    }
  }'
```

#### **Tarot**
```json
{
  "input": {
    "question": "What guidance do I need for my spiritual path?",
    "spread_type": "celtic_cross",
    "deck": "rider_waite"
  }
}
```

#### **I-Ching**
```json
{
  "input": {
    "question": "How can I find balance in my life?",
    "method": "coins",
    "includeChangingLines": true
  }
}
```

---

## 🔄 **Multi-Engine Workflows**

### **Available Workflows**

| Workflow | Endpoint | Engines Used | Description |
|----------|----------|--------------|-------------|
| **Natal** | `/workflows/natal` | Numerology + Human Design + Vimshottari | Complete birth chart analysis |
| **Career** | `/workflows/career` | Numerology + Enneagram + Tarot | Life purpose and career guidance |
| **Spiritual** | `/workflows/spiritual` | Gene Keys + I-Ching + Sacred Geometry | Spiritual development path |
| **Shadow** | `/workflows/shadow` | Enneagram + Tarot + Sacred Geometry | Shadow work and integration |
| **Relationships** | `/workflows/relationships` | Human Design + Numerology + Gene Keys | Compatibility analysis |
| **Daily** | `/workflows/daily` | Biorhythm + I-Ching + Tarot | Daily guidance and optimization |

### **Workflow Example**
```bash
curl -X POST https://api.witnessos.space/workflows/spiritual \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userProfile": {
      "fullName": "Alex Morgan",
      "birthDate": "1990-01-15",
      "birthTime": "14:30"
    },
    "intention": "deepening my spiritual practice and understanding"
  }'
```

---

## 🤖 **AI-Enhanced Features**

### **AI-Enhanced Engine Calculations**
Get personalized, narrative interpretations powered by LLM:

```bash
curl -X POST https://api.witnessos.space/engines/numerology/ai-enhanced \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "input": {
      "birth_date": "1990-01-15",
      "full_name": "Alex Morgan"
    },
    "aiConfig": {
      "model": "anthropic/claude-3-sonnet",
      "temperature": 0.7,
      "focusArea": "spiritual development"
    }
  }'
```

### **AI Synthesis**
Combine multiple engine results for comprehensive insights:

```bash
curl -X POST https://api.witnessos.space/ai/synthesis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "results": [
      {
        "engine": "numerology",
        "data": { ... }
      },
      {
        "engine": "human_design", 
        "data": { ... }
      }
    ],
    "userContext": {
      "currentChallenge": "career transition",
      "goals": ["spiritual growth", "authentic expression"]
    }
  }'
```

---

## 📦 **Batch Processing**

Process multiple engines in a single request:

```bash
curl -X POST https://api.witnessos.space/batch \
  -H "Content-Type: application/json" \
  -d '{
    "calculations": [
      {
        "engine": "numerology",
        "input": {
          "birth_date": "1990-01-15",
          "full_name": "Alex Morgan"
        }
      },
      {
        "engine": "biorhythm",
        "input": {
          "birth_date": "1990-01-15",
          "target_date": "2025-06-24"
        }
      }
    ],
    "options": {
      "parallel": true
    }
  }'
```

---

## 🔐 **Authentication**

### **Register User**
```bash
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "Your Name"
  }'
```

### **Login**
```bash
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### **Get Current User**
```bash
curl https://witnessos-api.sheshnarayan-iyer.workers.dev/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Logout**
```bash
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ⚡ **Rate Limiting**

### **Default Limits**
- **100 requests per minute** per IP/user
- **Burst capacity**: 20 requests
- **Headers included in responses**:
  - `X-RateLimit-Limit`: Maximum requests per window
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Reset time

### **Rate Limit Response**
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-06-24T14:30:00Z
Retry-After: 60

{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests",
  "timestamp": "2025-06-24T13:30:00Z"
}
```

---

## 📊 **Response Format**

### **Success Response**
```json
{
  "success": true,
  "data": {
    // Engine-specific results
  },
  "timestamp": "2025-06-24T13:30:00Z",
  "processingTime": 150,
  "cached": false,
  "requestId": "abc123-def456"
}
```

### **Error Response**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid birth date format",
  "timestamp": "2025-06-24T13:30:00Z",
  "requestId": "abc123-def456"
}
```

---

## 🚀 **Performance**

### **Response Times**
- **Single Engine**: < 200ms (95th percentile)
- **Batch Processing**: < 500ms for 3 engines
- **AI-Enhanced**: < 2000ms
- **Global CDN**: < 100ms latency worldwide

### **Caching**
- **Intelligent caching** for repeated calculations
- **Cache headers** indicate cached responses
- **Manual cache control** via `useCache: false`

---

## 🛠️ **Error Codes**

| HTTP Code | Error Code | Description |
|-----------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests |
| 500 | `INTERNAL_SERVER_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Temporary service issue |

---

## 🧪 **Testing**

### **Test Health**
```bash
# Main API health
curl https://witnessos-api.sheshnarayan-iyer.workers.dev/health

# Engine proxy health
curl https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev/health
```

### **Test Engine**
```bash
# Via main API
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/api/engines/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "numerology",
    "birth_data": {
      "date": "1990-01-15",
      "full_name": "Test User"
    }
  }'

# Direct engine proxy
curl -X POST https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engine": "numerology",
    "birth_data": {
      "date": "1990-01-15",
      "full_name": "Test User"
    }
  }'
```

### **Test Workflow**
```bash
curl -X POST https://witnessos-api.sheshnarayan-iyer.workers.dev/workflows/daily \
  -H "Content-Type: application/json" \
  -d '{"userProfile": {"fullName": "Test User", "birthDate": "1990-01-15"}}'
```

---

## 📋 **OpenAPI Specification**

Full OpenAPI 3.0 specification available at:
- **YAML**: [openapi.yaml](./openapi.yaml)
- **Interactive**: Coming soon at `https://docs.witnessos.space`

---

## 🌟 **Next Steps**

1. **Explore the Engines**: Try different consciousness engines
2. **Use Workflows**: Experience multi-engine analysis
3. **AI Enhancement**: Get personalized interpretations
4. **Build Applications**: Integrate consciousness features
5. **Join Community**: Connect with other consciousness explorers

**The universe of consciousness exploration awaits! ✨**
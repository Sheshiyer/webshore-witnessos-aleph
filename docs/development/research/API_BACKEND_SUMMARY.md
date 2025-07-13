# WitnessOS API Backend - Complete Integration Guide

## 🌟 **Executive Summary**

The WitnessOS Consciousness API is a production-ready spiritual technology backend powered by Cloudflare Workers, providing access to 10 consciousness engines, multi-engine workflows, and AI-enhanced interpretations. This document provides comprehensive details for external applications (like Raycast extensions, mobile apps, or third-party services) to integrate with our API.

---

## 🏗️ **Technical Architecture**

### **Infrastructure Stack**
- **Runtime**: Cloudflare Workers (Edge Computing)
- **Database**: Cloudflare D1 (SQLite-compatible)
- **Storage**: Cloudflare KV (Key-Value Store)
- **CDN**: Global edge network with <100ms latency
- **Security**: JWT authentication, rate limiting, CORS protection

### **API Endpoints**
- **Production**: `https://api.witnessos.space`
- **Staging**: `https://api-staging.witnessos.space`
- **Development**: `http://localhost:8787`

### **Performance Metrics**
- **Response Time**: <200ms (95th percentile)
- **Availability**: 99.9% uptime
- **Global Coverage**: 200+ edge locations
- **Rate Limits**: 1000 requests/minute (production)

---

## 🔐 **Authentication System**

### **JWT-Based Authentication**

#### **1. User Registration**
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### **2. User Login**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### **3. Token Usage**
Include JWT token in all authenticated requests:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧠 **Consciousness Engines**

### **Complete Engine Catalog**

| Engine | Endpoint | Input Requirements | Output |
|--------|----------|-------------------|--------|
| **Numerology** | `/engines/numerology/calculate` | birth_date, full_name | Life path, expression, soul urge numbers |
| **Human Design** | `/engines/human_design/calculate` | birth_date, birth_time, birth_location | Type, strategy, authority, centers |
| **Tarot** | `/engines/tarot/calculate` | question, spread_type | Card spread and interpretations |
| **I-Ching** | `/engines/iching/calculate` | question, method | Hexagram and wisdom |
| **Enneagram** | `/engines/enneagram/calculate` | personality_indicators | Type and growth patterns |
| **Sacred Geometry** | `/engines/sacred_geometry/calculate` | geometric_parameters | Pattern analysis |
| **Biorhythm** | `/engines/biorhythm/calculate` | birth_date, target_date | Physical, emotional, intellectual cycles |
| **Vimshottari** | `/engines/vimshottari/calculate` | birth_date, birth_time | Vedic dasha periods |
| **Gene Keys** | `/engines/gene_keys/calculate` | birth_data | 64 archetypal keys |
| **Sigil Forge** | `/engines/sigil_forge/calculate` | intention, symbols | Sacred symbol creation |

### **Engine Calculation Examples**

#### **Numerology Engine**
```bash
POST /engines/numerology/calculate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "input": {
    "birth_date": "1990-01-15",
    "full_name": "Alexander Morgan",
    "birth_name": "Alexander James Morgan"
  },
  "options": {
    "useCache": true,
    "saveProfile": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "engine": "numerology",
    "calculation": {
      "life_path": 7,
      "expression": 3,
      "soul_urge": 9,
      "personality": 6
    },
    "interpretation": {
      "life_path_meaning": "The Seeker - spiritual growth and inner wisdom",
      "expression_meaning": "Creative communication and artistic expression",
      "soul_urge_meaning": "Universal love and humanitarian service",
      "personality_meaning": "Nurturing and responsible caretaker"
    }
  },
  "timestamp": "2025-01-15T10:30:00Z",
  "processingTime": 150,
  "cached": false
}
```

#### **Tarot Engine**
```bash
POST /engines/tarot/calculate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "input": {
    "question": "What guidance do I need for my spiritual path?",
    "spread_type": "celtic_cross",
    "deck": "rider_waite"
  }
}
```

#### **Biorhythm Engine**
```bash
POST /engines/biorhythm/calculate
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "input": {
    "birth_date": "1990-01-15",
    "target_date": "2025-01-15",
    "days_ahead": 7
  }
}
```

---

## 🔄 **Multi-Engine Workflows**

### **Predefined Workflow Types**

| Workflow | Engines Used | Purpose | Endpoint |
|----------|--------------|---------|----------|
| **Natal** | Numerology + Human Design + Vimshottari | Complete birth chart analysis | `/workflows/natal` |
| **Career** | Numerology + Enneagram + Tarot | Life purpose and career guidance | `/workflows/career` |
| **Spiritual** | Gene Keys + I-Ching + Sacred Geometry | Spiritual development path | `/workflows/spiritual` |
| **Shadow** | Enneagram + Tarot + Sacred Geometry | Shadow work and integration | `/workflows/shadow` |
| **Relationships** | Human Design + Numerology + Gene Keys | Compatibility analysis | `/workflows/relationships` |
| **Daily** | Biorhythm + I-Ching + Tarot | Daily guidance and optimization | `/workflows/daily` |
| **Custom** | User-defined engine combination | Flexible multi-engine analysis | `/workflows/custom` |

### **Workflow Example: Daily Guidance**
```bash
POST /workflows/daily
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "userProfile": {
    "fullName": "Alex Morgan",
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthLocation": "New York, NY"
  },
  "intention": "guidance for today and optimal energy management"
}
```

**Response Structure:**
```json
{
  "success": true,
  "data": {
    "workflow_type": "daily",
    "engines_used": ["biorhythm", "iching", "tarot"],
    "results": {
      "biorhythm": {
        "physical": { "value": 0.75, "phase": "high", "description": "Peak energy day" },
        "emotional": { "value": 0.45, "phase": "rising", "description": "Emotional stability" },
        "intellectual": { "value": 0.85, "phase": "peak", "description": "Mental clarity" }
      },
      "iching": {
        "hexagram": {
          "number": 11,
          "name": "Peace",
          "chinese_name": "泰"
        },
        "interpretation": {
          "judgment": "Heaven and earth unite in harmony",
          "guidance": "A time of balance and prosperity approaches"
        }
      },
      "tarot": {
        "cards": [
          { "name": "The Sun", "position": "present", "meaning": "Joy and vitality" }
        ],
        "interpretation": {
          "overall_message": "A day of positive energy and clear vision"
        }
      }
    },
    "synthesis": {
      "summary": "Today brings peak intellectual clarity and rising emotional stability. The universe supports your endeavors with harmonious energy.",
      "detailed_interpretation": "Your biorhythm shows exceptional mental clarity (85%) paired with strong physical energy (75%). The I-Ching hexagram of Peace indicates universal support for your goals, while The Sun card promises joy and success in your endeavors.",
      "key_insights": [
        "Optimal day for important decisions and creative work",
        "Physical energy supports ambitious projects",
        "Emotional balance creates space for meaningful connections"
      ],
      "recommendations": [
        "Schedule important meetings or presentations today",
        "Engage in creative or intellectual pursuits",
        "Share your positive energy with others",
        "Take advantage of mental clarity for planning"
      ]
    }
  },
  "timestamp": "2025-01-15T10:30:00Z",
  "processingTime": 850
}
```

---

## 🤖 **AI-Enhanced Features**

### **AI-Enhanced Engine Calculations**
```bash
POST /engines/numerology/ai-enhanced
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "input": {
    "birth_date": "1990-01-15",
    "full_name": "Alex Morgan"
  },
  "aiConfig": {
    "model": "anthropic/claude-3-sonnet",
    "temperature": 0.7,
    "focusArea": "spiritual development",
    "personalContext": "seeking deeper understanding of life purpose"
  }
}
```

### **AI Synthesis of Multiple Results**
```bash
POST /ai/synthesis
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "results": [
    {
      "engine": "numerology",
      "data": { "life_path": 7, "expression": 3 }
    },
    {
      "engine": "human_design",
      "data": { "type": "Generator", "strategy": "Respond" }
    }
  ],
  "userContext": {
    "currentChallenge": "career transition",
    "goals": ["spiritual growth", "authentic expression"]
  }
}
```

---

## 📦 **Batch Processing**

### **Multiple Engine Calculations**
```bash
POST /batch
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
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
        "target_date": "2025-01-15"
      }
    },
    {
      "engine": "tarot",
      "input": {
        "question": "What do I need to know today?",
        "spread_type": "three_card"
      }
    }
  ],
  "options": {
    "parallel": true,
    "useCache": true
  }
}
```

---

## ⚡ **Rate Limiting & Performance**

### **Rate Limits by Environment**
- **Production**: 1000 requests/minute per user
- **Staging**: 100 requests/minute per user
- **Development**: 50 requests/minute per user

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2025-01-15T10:31:00Z
Retry-After: 60
```

### **Performance Optimization**
- **Intelligent Caching**: Repeated calculations cached for 1 hour
- **Parallel Processing**: Batch requests processed concurrently
- **Edge Computing**: Sub-100ms latency globally
- **Compression**: Gzip compression for all responses

---

## 🛠️ **Error Handling**

### **HTTP Status Codes**
| Code | Error Type | Description | Action |
|------|------------|-------------|--------|
| 200 | Success | Request completed successfully | Continue |
| 400 | Bad Request | Invalid request parameters | Fix input |
| 401 | Unauthorized | Missing/invalid authentication | Refresh token |
| 403 | Forbidden | Insufficient permissions | Check access |
| 404 | Not Found | Resource not found | Verify endpoint |
| 429 | Rate Limited | Too many requests | Wait and retry |
| 500 | Server Error | Internal server error | Retry later |

### **Error Response Format**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid birth date format. Expected YYYY-MM-DD",
  "timestamp": "2025-01-15T10:30:00Z",
  "requestId": "req_abc123def456",
  "details": {
    "field": "birth_date",
    "expected": "YYYY-MM-DD format",
    "received": "15/01/1990"
  }
}
```

---

## 🔧 **Development Environment**

### **Local Development Setup**
```bash
# Clone repository
git clone https://github.com/witnessos/webshore.git
cd webshore

# Install dependencies
npm install

# Start development server
npm run workers:dev

# API available at http://localhost:8787
```

### **Environment Variables**
```bash
# Required
JWT_SECRET=your_jwt_secret_key
ENVIRONMENT=development

# Optional
OPENROUTER_API_KEY=your_openrouter_key  # For AI features
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=60000
```

---

## 📊 **API Response Formats**

### **Standard Success Response**
```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  timestamp: string;
  processingTime?: number;
  cached?: boolean;
  requestId?: string;
}
```

### **Engine Calculation Response**
```typescript
interface EngineCalculationResponse {
  success: true;
  data: {
    engine: string;
    calculation: Record<string, any>;
    interpretation: Record<string, string>;
    metadata?: {
      version: string;
      algorithm: string;
      confidence: number;
    };
  };
}
```

### **Workflow Response**
```typescript
interface WorkflowResponse {
  success: true;
  data: {
    workflow_type: string;
    engines_used: string[];
    results: Record<string, any>;
    synthesis: {
      summary: string;
      detailed_interpretation: string;
      key_insights: string[];
      recommendations: string[];
    };
  };
}
```

---

## 🎯 **Integration Examples**

### **Raycast Extension**
Complete Raycast extension example available at:
- **Location**: `docs/examples/raycast-extension/`
- **Features**: Daily guidance, numerology, tarot, biorhythm
- **TypeScript**: Full type safety and error handling

### **Mobile App Integration**
```typescript
// React Native example
import { WitnessOSAPI } from './api/witnessos-client';

const api = new WitnessOSAPI({
  baseUrl: 'https://api.witnessos.space',
  token: await getStoredToken(),
});

// Get daily guidance
const guidance = await api.getDailyGuidance();

// Calculate numerology
const numerology = await api.calculateNumerology({
  birth_date: '1990-01-15',
  full_name: 'Alex Morgan'
});
```

### **Web Application Integration**
```javascript
// JavaScript/React example
const response = await fetch('https://api.witnessos.space/workflows/daily', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
  },
  body: JSON.stringify({
    userProfile: {
      fullName: 'Alex Morgan',
      birthDate: '1990-01-15'
    },
    intention: 'daily guidance and energy optimization'
  })
});

const data = await response.json();
```

---

## 🔐 **Security Best Practices**

### **For External Applications**
1. **Token Storage**: Store JWT tokens securely (keychain/secure storage)
2. **HTTPS Only**: Always use HTTPS endpoints
3. **Token Refresh**: Implement token refresh logic
4. **Input Validation**: Validate all user inputs before API calls
5. **Error Handling**: Never expose API errors to end users
6. **Rate Limiting**: Implement client-side rate limiting

### **API Security Features**
- **JWT Authentication**: Stateless, secure token-based auth
- **CORS Protection**: Configurable cross-origin policies
- **Rate Limiting**: Per-user and per-IP rate limits
- **Input Validation**: Comprehensive request validation
- **Audit Logging**: All requests logged with request IDs

---

## 📚 **Additional Resources**

### **Documentation**
- **API Documentation**: [docs/api/README.md](./api/README.md)
- **OpenAPI Specification**: [docs/api/openapi.yaml](./api/openapi.yaml)
- **Integration Guide**: [docs/EXTERNAL_API_INTEGRATION.md](./EXTERNAL_API_INTEGRATION.md)
- **Deployment Guide**: [docs/reference/deployment/README-DEPLOYMENT.md](./reference/deployment/README-DEPLOYMENT.md)

### **Code Examples**
- **Raycast Extension**: [docs/examples/raycast-extension/](./examples/raycast-extension/)
- **TypeScript Client**: [docs/examples/raycast-extension/src/api/witnessos-client.ts](./examples/raycast-extension/src/api/witnessos-client.ts)
- **React Components**: [docs/examples/raycast-extension/src/daily-guidance.tsx](./examples/raycast-extension/src/daily-guidance.tsx)

### **Support Channels**
- **API Support**: api@witnessos.space
- **Documentation**: https://docs.witnessos.space
- **Status Page**: https://status.witnessos.space
- **GitHub Issues**: https://github.com/witnessos/webshore/issues

---

## 🌟 **Getting Started Checklist**

### **For External Developers**

1. **✅ Account Setup**
   - [ ] Register at https://api.witnessos.space/auth/register
   - [ ] Obtain JWT token via login
   - [ ] Test authentication with /auth/me

2. **✅ API Testing**
   - [ ] Test health endpoint: GET /health
   - [ ] List engines: GET /engines
   - [ ] Try simple calculation: POST /engines/numerology/calculate

3. **✅ Integration Development**
   - [ ] Implement authentication flow
   - [ ] Add error handling and rate limiting
   - [ ] Test with real user data
   - [ ] Implement caching for performance

4. **✅ Production Deployment**
   - [ ] Use production API endpoint
   - [ ] Implement secure token storage
   - [ ] Add monitoring and logging
   - [ ] Test error scenarios

### **Quick Start Commands**
```bash
# Test API health
curl https://api.witnessos.space/health

# Register new user
curl -X POST https://api.witnessos.space/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'

# Get daily guidance
curl -X POST https://api.witnessos.space/workflows/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"userProfile":{"fullName":"Test User","birthDate":"1990-01-15"}}'
```

---

**Ready to integrate consciousness technology into your applications! ✨**

*The WitnessOS API provides the world's first production-ready spiritual technology backend, enabling developers to build consciousness-aware applications with enterprise-grade reliability and performance.*
# WitnessOS External API Integration Guide

## Current Status

✅ **Production API is LIVE and FULLY FUNCTIONAL**

The WitnessOS API has been successfully deployed to production and all core features are operational:
- ✅ User Authentication (Register/Login/Logout)
- ✅ Consciousness Engines (12 active engines)
- ✅ Workflow Processing (6 predefined workflows)
- ✅ AI Integration (Enhanced calculations and synthesis)
- ✅ Reading History & Profile Management
- ✅ Admin User Management
- ✅ Caching and Performance Optimization

## API Base URLs

### Production (LIVE)
```
https://api.witnessos.space
```
*Currently active and serving requests*

### Development
```
http://localhost:8787
```
*For local development and testing*

## Authentication

### User Registration

**Endpoint:** `POST /auth/register`

```bash
curl -X POST https://api.witnessos.space/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "is_admin": false,
    "created_at": "2024-01-15T10:30:00Z"
  },
  "requestId": "req_123456789"
}
```

### User Login

**Endpoint:** `POST /auth/login`

```bash
curl -X POST https://api.witnessos.space/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "is_admin": false
  },
  "requestId": "req_123456789"
}
```

## Consciousness Engines

### Available Engines

| Engine | Status | Description |
|--------|--------|-------------|
| Numerology | Active | Life path, expression, and soul urge calculations |
| Human Design | Active | Bodygraph analysis and type determination |
| Tarot | Active | Card readings and interpretations |
| I-Ching | Active | Hexagram analysis and wisdom |
| Enneagram | Active | Personality type assessment |
| Sacred Geometry | Active | Geometric pattern analysis |
| Biorhythm | Active | Physical, emotional, and intellectual cycles |
| Vimshottari | Active | Vedic astrology dasha system |
| Gene Keys | Active | Genetic destiny and life purpose |
| Sigil Forge | Active | Symbolic manifestation tools |
| NadaBrahman | Active | Sound and vibration analysis |
| Biofield Viewer | Active | Energy field visualization |

### Engine Calculation Example - Numerology

**Endpoint:** `POST /engines/numerology/calculate`

```bash
curl -X POST https://api.witnessos.space/engines/numerology/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "fullName": "Cumbipuram Nateshan Sheshnarayan",
      "birthDate": "1991-08-13"
    }
  }'
```

**Sample Response:**
```json
{
  "success": true,
  "data": {
    "engineName": "numerology",
    "calculationTime": 0,
    "confidenceScore": 0.95,
    "formattedOutput": "🔢 NUMEROLOGY FIELD EXTRACTION - CUMBIPURAM NATESHAN SHESHNARAYAN 🔢\n\n═══ SOUL-NUMBER MATRIX ═══\n\nLife Path 5: Freedom and adventure - embracing change and new experiences\n\nYour soul chose this incarnation to master the archetypal frequency of 5...",
    "lifePath": 5,
    "expression": 8,
    "soulUrge": 4,
    "personality": 4,
    "personalYear": 3,
    "coreMeanings": {
      "lifePath": "Freedom and adventure - embracing change and new experiences",
      "expression": "Your outer manifestation signature",
      "soulUrge": "Your deepest inner motivations",
      "personality": "How others perceive your energy field"
    },
    "recommendations": [
      "Meditate on your Life Path number 5 during morning breathwork",
      "Notice how your name affects others' responses to your energy field"
    ]
  },
  "cached": true,
  "requestId": "1452008d-b4c7-442b-82ab-0d06e8a9e951"
}
```

## Workflows

### Available Workflows

| Workflow | Status | Description |
|----------|--------|-------------|
| Natal | Active | Complete birth chart analysis |
| Career | Active | Professional path guidance |
| Spiritual | Active | Spiritual development insights |
| Shadow | Active | Shadow work and integration |
| Relationships | Active | Compatibility and dynamics |
| Daily | Active | Daily guidance and insights |
| Custom | Active | User-defined workflow combinations |

### Daily Guidance Workflow Example

**Endpoint:** `POST /workflows/daily`

```bash
curl -X POST https://api.witnessos.space/workflows/daily \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "fullName": "John Doe",
      "birthDate": "1990-01-15",
      "currentDate": "2024-01-15"
    }
  }'
```

## AI-Enhanced Features

### AI-Enhanced Engine Calculation

**Endpoint:** `POST /engines/{engine}/ai-enhanced`

```bash
curl -X POST https://api.witnessos.space/engines/numerology/ai-enhanced \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "fullName": "John Doe",
      "birthDate": "1990-01-15"
    },
    "enhancementType": "detailed_interpretation"
  }'
```

### AI Synthesis of Multiple Results

**Endpoint:** `POST /ai/synthesis`

```bash
curl -X POST https://api.witnessos.space/ai/synthesis \
  -H "Content-Type: application/json" \
  -d '{
    "results": [
      {"engine": "numerology", "data": {...}},
      {"engine": "tarot", "data": {...}}
    ],
    "synthesisType": "comprehensive_reading"
  }'
```

## Batch Processing

### Multiple Engine Calculations

**Endpoint:** `POST /batch/calculate`

```bash
curl -X POST https://api.witnessos.space/batch/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "engines": ["numerology", "tarot", "iching"],
    "input": {
      "fullName": "John Doe",
      "birthDate": "1990-01-15"
    }
  }'
```

## Reading History & Profile Management

### Save Reading
**Endpoint:** `POST /readings/save`

### Get Reading History
**Endpoint:** `GET /readings/history?userId={userId}`

### Upload Consciousness Profile
**Endpoint:** `POST /profiles/upload`

## Admin User Management

### Delete User (Admin Only)
**Endpoint:** `DELETE /admin/users/{email}`

```bash
curl -X DELETE https://api.witnessos.space/admin/users/user@example.com \
  -H "Authorization: Bearer {admin_token}"
```

## Additional Endpoints

### Health Check
**Endpoint:** `GET /health`

```bash
curl https://api.witnessos.space/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "connected",
    "kv_store": "operational",
    "ai_service": "available"
  }
}
```

### List Available Engines
**Endpoint:** `GET /engines`

```bash
curl https://api.witnessos.space/engines
```

### Get Engine Metadata
**Endpoint:** `GET /engines/{engine}/metadata`

```bash
curl https://api.witnessos.space/engines/numerology/metadata
```

### Test Authentication
**Endpoint:** `GET /auth/me`

```bash
curl https://api.witnessos.space/auth/me \
  -H "Authorization: Bearer {your_token}"
```

## Response Formats

### Standard Success Response
```json
{
  "success": true,
  "data": {
    "engine": "engine_name",
    "input": {...},
    "result": {...},
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "requestId": "req_123456789"
}
```

### Error Response
```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req_123456789"
}
```

### Authentication Response
```json
{
  "message": "Operation successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "is_admin": false
  },
  "requestId": "req_123456789"
}
```

## TypeScript Integration Example

```typescript
interface WitnessOSClient {
  baseURL: string;
  token?: string;
}

class WitnessOSAPI implements WitnessOSClient {
  baseURL = 'https://api.witnessos.space';
  token?: string;

  async register(email: string, password: string, name: string) {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return response.json();
  }

  async calculateNumerology(fullName: string, birthDate: string) {
    const response = await fetch(`${this.baseURL}/engines/numerology/calculate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ 
        input: { fullName, birthDate } 
      })
    });
    return response.json();
  }
}

// Usage
const api = new WitnessOSAPI();
const result = await api.calculateNumerology(
  'Cumbipuram Nateshan Sheshnarayan', 
  '1991-08-13'
);
```

## Rate Limiting

- **Limit:** 1000 requests per hour per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response Time:** Typically under 500ms

## Support

For technical support or integration questions:
- API Documentation: This guide
- Response Time: Headers include `X-Response-Time`
- Request ID: All responses include `requestId` for debugging

---

*Last Updated: July 11, 2025*
*API Version: 1.0.0*
*Status: Production Ready ✅*
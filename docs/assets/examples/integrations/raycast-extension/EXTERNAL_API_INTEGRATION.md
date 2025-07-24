# WitnessOS External API Integration Guide

This guide provides comprehensive documentation for integrating external UI sources (like Raycast extensions, mobile apps, or web interfaces) with the WitnessOS consciousness exploration platform.

## 🚀 **Current Status**

**✅ FULLY FUNCTIONAL** - The WitnessOS API is currently running in development mode with all core features operational:
- ✅ User authentication (registration, login, JWT tokens)
- ✅ 11+ consciousness engines (Numerology, Human Design, Tarot, I-Ching, etc.)
- ✅ Multi-engine workflows (Natal, Career, Spiritual guidance)
- ✅ AI-enhanced interpretations
- ✅ Reading history and profile management
- ✅ Admin user management
- ✅ Comprehensive error handling

## 🌐 **API Base URLs**

- **Production**: `https://api.witnessos.space` ✅ **Live & Active**
- **Development**: `http://localhost:8787` ✅ **Local Development**

> **Note**: The production API is now live! All examples in this guide use the production server (`https://api.witnessos.space`) which is fully functional and ready for external UI integration.

## 🚀 **Overview**

### **Current Status**
- ✅ **Authentication System**: Fully functional with JWT tokens
- ✅ **10 Consciousness Engines**: All engines operational
- ✅ **Multi-Engine Workflows**: 6 pre-built workflows available
- ✅ **AI-Enhanced Calculations**: OpenRouter integration ready
- ✅ **User Management**: Registration, login, admin functions
- ✅ **Reading History**: Save, retrieve, and manage readings

---

## 🔐 **Authentication Flow**

### **User Registration**
```bash
curl -X POST https://api.witnessos.space/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "Alex Morgan"
  }'
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "is_admin": false,
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}```

### **User Login**
```bash
curl -X POST https://api.witnessos.space/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "is_admin": false
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **Step 3: Using the JWT Token**
Include the JWT token in all subsequent requests:
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧠 **Available Consciousness Engines**

### **1. Numerology Engine**
```bash
curl -X POST http://localhost:8787/engines/numerology/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "input": {
      "birth_date": "1990-01-15",
      "full_name": "Alexander Morgan",
      "birth_name": "Alexander James Morgan"
    },
    "options": {
      "useCache": true
    }
  }'
```

**Response:**
```json
{
  "engine": "numerology",
  "input": {
    "birth_date": "1990-01-15",
    "full_name": "Alexander Morgan"
  },
  "result": {
    "life_path": 7,
    "expression": 3,
    "soul_urge": 9,
    "personality": 6,
    "interpretation": {
      "life_path_meaning": "The Seeker - spiritual growth and inner wisdom",
      "expression_meaning": "Creative communication and artistic expression"
    }
  },
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **2. Human Design Engine**
```bash
curl -X POST https://api.witnessos.space/engines/human_design/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "input": {
      "birth_date": "1990-01-15",
      "birth_time": "14:30",
      "birth_location": "New York, NY, USA",
      "includeChannels": true,
      "includeGates": true
    }
  }'
```

### **3. Tarot Engine**
```bash
curl -X POST https://api.witnessos.space/engines/tarot/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "input": {
      "question": "What guidance do I need for my spiritual path?",
      "spread_type": "celtic_cross",
      "deck": "rider_waite"
    }
  }'
```

### **4. I-Ching Engine**
```bash
curl -X POST https://api.witnessos.space/engines/iching/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "input": {
      "question": "How can I find balance in my life?",
      "method": "coins",
      "includeChangingLines": true
    }
  }'
```

### **5. Biorhythm Engine**
```bash
curl -X POST https://api.witnessos.space/engines/biorhythm/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "input": {
      "birth_date": "1990-01-15",
      "target_date": "2025-01-15",
      "days_ahead": 30
    }
  }'
```

### **Complete Engine List**
| Engine | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| **Numerology** | `/engines/numerology/calculate` | Life path, expression, soul urge | ✅ Active |
| **Human Design** | `/engines/human_design/calculate` | Type, strategy, authority, centers | ✅ Active |
| **Tarot** | `/engines/tarot/calculate` | Card spreads and interpretations | ✅ Active |
| **I-Ching** | `/engines/iching/calculate` | Hexagram generation and wisdom | ✅ Active |
| **Enneagram** | `/engines/enneagram/calculate` | Personality type and growth | ✅ Active |
| **Sacred Geometry** | `/engines/sacred_geometry/calculate` | Geometric pattern analysis | ✅ Active |
| **Biorhythm** | `/engines/biorhythm/calculate` | Physical, emotional, intellectual cycles | ✅ Active |
| **Vimshottari** | `/engines/vimshottari/calculate` | Vedic dasha periods | ✅ Active |
| **Gene Keys** | `/engines/gene_keys/calculate` | 64 archetypal keys | ✅ Active |
| **Sigil Forge** | `/engines/sigil_forge/calculate` | Sacred symbol creation | ✅ Active |
| **NadaBrahman** | `/engines/nadabrahman/calculate` | Bio-responsive raga synthesis | ✅ Active |

### **Additional Endpoints**
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | API health check |
| `/engines` | GET | List all available engines |
| `/engines/{engine}/metadata` | GET | Get engine metadata |
| `/engines/{engine}/ai-enhanced` | POST | AI-enhanced calculations |
| `/ai/synthesis` | POST | Multi-engine AI synthesis |

---

## 🔄 **Multi-Engine Workflows**

### **Natal Workflow** (Numerology + Human Design + Vimshottari)
```bash
curl -X POST http://localhost:8787/workflows/natal \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userProfile": {
      "fullName": "Alex Morgan",
      "birthDate": "1990-01-15",
      "birthTime": "14:30",
      "birthLocation": "New York, NY"
    },
    "intention": "understanding my life purpose and spiritual path"
  }'
```

### **Career Workflow** (Numerology + Enneagram + Tarot)
```bash
curl -X POST http://localhost:8787/workflows/career \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userProfile": {
      "fullName": "Alex Morgan",
      "birthDate": "1990-01-15"
    },
    "intention": "finding my ideal career path and life purpose"
  }'
```

### **Daily Guidance Workflow** (Biorhythm + I-Ching + Tarot)
```bash
curl -X POST http://localhost:8787/workflows/daily \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userProfile": {
      "fullName": "Alex Morgan",
      "birthDate": "1990-01-15"
    },
    "intention": "guidance for today and optimal energy management"
  }'
```

### **Available Workflows**
| Workflow | Endpoint | Engines Used | Purpose | Status |
|----------|----------|--------------|---------|--------|
| **Natal** | `/workflows/natal` | Numerology + Human Design + Vimshottari | Complete birth chart analysis | ✅ Active |
| **Career** | `/workflows/career` | Numerology + Enneagram + Tarot | Life purpose and career guidance | ✅ Active |
| **Spiritual** | `/workflows/spiritual` | Gene Keys + I-Ching + Sacred Geometry | Spiritual development path | ✅ Active |
| **Shadow** | `/workflows/shadow` | Enneagram + Tarot + Sacred Geometry | Shadow work and integration | ✅ Active |
| **Relationships** | `/workflows/relationships` | Human Design + Numerology + Gene Keys | Compatibility analysis | ✅ Active |
| **Daily** | `/workflows/daily` | Biorhythm + I-Ching + Tarot | Daily guidance and optimization | ✅ Active |
| **Custom** | `/workflows/custom` | User-defined engine combination | Personalized multi-engine analysis | ✅ Active |

---

## 🤖 **AI-Enhanced Features**

### **AI-Enhanced Engine Calculation**
```bash
curl -X POST http://localhost:8787/engines/numerology/ai-enhanced \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
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
  }'
```

### **AI Synthesis of Multiple Results**
```bash
curl -X POST http://localhost:8787/ai/synthesis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
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
  }'
```

---

## 📦 **Batch Processing**

### **Multiple Engine Calculations**
```bash
curl -X POST http://localhost:8787/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
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
  }'
```

## 📚 **Reading History & Profile Management**

### **Save Reading**
```bash
curl -X POST http://localhost:8787/api/readings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "engine": "numerology",
    "input": {
      "birth_date": "1990-01-15",
      "full_name": "Alex Morgan"
    },
    "result": {
      "life_path": 7,
      "expression": 3
    },
    "metadata": {
      "intention": "understanding life purpose",
      "tags": ["personal", "spiritual"]
    }
  }'
```

### **Get Reading History**
```bash
curl -X GET "http://localhost:8787/api/readings/history?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **Upload Consciousness Profile**
```bash
curl -X POST http://localhost:8787/api/consciousness-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "profile": {
      "birth_date": "1990-01-15",
      "birth_time": "14:30",
      "birth_location": "New York, NY",
      "full_name": "Alex Morgan"
    },
    "preferences": {
      "favorite_engines": ["numerology", "tarot"],
      "focus_areas": ["spiritual_growth", "career"]
    }
  }'
```

### **Admin User Management**
```bash
# Delete user (admin only)
curl -X DELETE http://localhost:8787/admin/users/user@example.com \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## 📊 **Response Format**

### **Standard Success Response**
```json
{
  "engine": "numerology",
  "input": {
    "birth_date": "1990-01-15",
    "full_name": "Alex Morgan"
  },
  "result": {
    "life_path": 7,
    "expression": 3,
    "soul_urge": 9,
    "personality": 6,
    "interpretation": {
      "life_path_meaning": "The Seeker - spiritual growth and inner wisdom",
      "expression_meaning": "Creative communication and artistic expression"
    }
  },
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **Error Response**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid birth date format. Expected YYYY-MM-DD",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### **Authentication Response**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "Alex Morgan",
    "is_admin": false
  },
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## ⚡ **Rate Limiting**

### **Default Limits**
- **Production**: 1000 requests per minute
- **Staging**: 100 requests per minute
- **Development**: 50 requests per minute

### **Rate Limit Headers**
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 2025-01-15T10:31:00Z
```

### **Rate Limit Exceeded Response**
```json
{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please try again later.",
  "timestamp": "2025-01-15T10:30:00Z",
  "retryAfter": 60
}
```

---

## 🛠️ **Error Handling**

### **HTTP Status Codes**
| Code | Error Type | Description |
|------|------------|-------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Internal server error |

### **Error Response Structure**
```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error description",
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

## 🎯 **Raycast Extension Example**

### **TypeScript Implementation**
```typescript
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  apiToken: string;
  apiBaseUrl: string;
}

class WitnessOSAPI {
  private baseUrl: string;
  private token: string;

  constructor() {
    const preferences = getPreferenceValues<Preferences>();
    this.baseUrl = preferences.apiBaseUrl || "http://localhost:8787";
    this.token = preferences.apiToken;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message}`);
    }

    return response.json();
  }

  async getDailyGuidance(birthDate: string, fullName: string) {
    return this.makeRequest("/workflows/daily", {
      method: "POST",
      body: JSON.stringify({
        userProfile: {
          fullName,
          birthDate,
        },
        intention: "guidance for today and optimal energy management",
      }),
    });
  }

  async calculateNumerology(birthDate: string, fullName: string) {
    return this.makeRequest("/engines/numerology/calculate", {
      method: "POST",
      body: JSON.stringify({
        input: {
          birth_date: birthDate,
          full_name: fullName,
        },
      }),
    });
  }

  async getTarotReading(question: string) {
    return this.makeRequest("/engines/tarot/calculate", {
      method: "POST",
      body: JSON.stringify({
        input: {
          question,
          spread_type: "three_card",
          deck: "rider_waite",
        },
      }),
    });
  }
}

export default WitnessOSAPI;
```

### **Usage in Raycast Command**
```typescript
import { ActionPanel, Action, List, showToast, Toast } from "@raycast/api";
import { useState, useEffect } from "react";
import WitnessOSAPI from "./api";

export default function DailyGuidance() {
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(true);
  const api = new WitnessOSAPI();

  useEffect(() => {
    async function fetchGuidance() {
      try {
        const result = await api.getDailyGuidance(
          "1990-01-15", // User's birth date
          "Alex Morgan"  // User's name
        );
        setGuidance(result.data);
      } catch (error) {
        showToast({
          style: Toast.Style.Failure,
          title: "Failed to fetch guidance",
          message: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchGuidance();
  }, []);

  return (
    <List isLoading={loading}>
      {guidance && (
        <List.Item
          title="Today's Guidance"
          subtitle={guidance.synthesis?.summary}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard
                title="Copy Guidance"
                content={guidance.synthesis?.detailed_interpretation}
              />
            </ActionPanel>
          }
        />
      )}
    </List>
  );
}
```

---

## 🔧 **Testing & Development**

### **Health Check**
```bash
curl http://localhost:8787/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "engines": {
    "status": "healthy",
    "available": [
      "numerology", "human_design", "tarot", "iching", 
      "enneagram", "sacred_geometry", "biorhythm", 
      "vimshottari", "gene_keys", "sigil_forge", "nadabrahman"
    ]
  },
  "storage": {
    "status": "healthy",
    "details": "KV storage operational"
  }
}
```

### **List Available Engines**
```bash
curl http://localhost:8787/engines
```

### **Get Engine Metadata**
```bash
curl http://localhost:8787/engines/numerology/metadata
```

### **Test Authentication**
```bash
curl http://localhost:8787/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📚 **Additional Resources**

- **OpenAPI Specification**: [openapi.yaml](./api/openapi.yaml)
- **Full API Documentation**: [README.md](./api/README.md)
- **Deployment Guide**: [deployment/README-DEPLOYMENT.md](./reference/deployment/README-DEPLOYMENT.md)
- **Project Overview**: [PROJECT_OVERVIEW.md](./project/PROJECT_OVERVIEW.md)

---

## 🌟 **Support**

For API support and questions:
- **Email**: api@witnessos.space
- **Documentation**: https://docs.witnessos.space
- **Status Page**: https://status.witnessos.space

**Ready to integrate consciousness technology into your applications! ✨**
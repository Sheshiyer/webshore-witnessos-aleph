# 🔗 WitnessOS Raycast Extension - API Endpoints Reference

Complete documentation for all API endpoints used by the Raycast extension for consciousness engine calculations, reading persistence, and user activity tracking.

## 🌐 Base Configuration

### **Current Working Endpoints**
```
Engine Proxy: https://witnessos-engine-proxy.sheshnarayan-iyer.workers.dev
API Token: wos_live_admin_sheshnarayan_2025_raycast_extension
Admin User ID: 1
```

### **Authentication**
All requests require the API token in the Authorization header:
```
Authorization: Bearer wos_live_admin_sheshnarayan_2025_raycast_extension
```

## 🧠 Consciousness Engine Endpoints

### **1. Numerology Calculation**
```http
POST /engines/numerology/calculate
Content-Type: application/json

{
  "input": {
    "birth_date": "1991-08-13",
    "full_name": "Cumbipuram Nateshan Sheshanarayan Iyer"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "engine_name": "numerology",
    "calculation_time": 0.0004,
    "confidence_score": 1,
    "formatted_output": "🔢 NUMEROLOGY FIELD EXTRACTION...",
    "chart": null,
    "interpretation": null,
    "recommendations": [...]
  },
  "requestId": "req_...",
  "executionTime": 1250
}
```

### **2. Human Design Chart**
```http
POST /engines/human_design/calculate
Content-Type: application/json

{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31",
    "birth_latitude": 12.9629,
    "birth_longitude": 77.5775
  }
}
```

### **3. Biorhythm Analysis**
```http
POST /engines/biorhythm/calculate
Content-Type: application/json

{
  "input": {
    "birth_date": "1991-08-13",
    "target_date": "2025-01-30",
    "days_ahead": 7
  }
}
```

### **4. Tarot Reading**
```http
POST /engines/tarot/calculate
Content-Type: application/json

{
  "input": {
    "question": "What guidance do I need for my spiritual path?",
    "spread_type": "three_card",
    "deck": "rider_waite"
  }
}
```

### **5. I-Ching Oracle**
```http
POST /engines/iching/calculate
Content-Type: application/json

{
  "input": {
    "question": "What is the nature of my current spiritual phase?",
    "method": "coins"
  }
}
```

### **6. Gene Keys Profile**
```http
POST /engines/gene_keys/calculate
Content-Type: application/json

{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31",
    "birth_latitude": 12.9629,
    "birth_longitude": 77.5775
  }
}
```

### **7. Enneagram Analysis**
```http
POST /engines/enneagram/calculate
Content-Type: application/json

{
  "input": {
    "assessment_responses": [...],
    "birth_date": "1991-08-13"
  }
}
```

### **8. Vimshottari Dasha**
```http
POST /engines/vimshottari/calculate
Content-Type: application/json

{
  "input": {
    "birth_date": "1991-08-13",
    "birth_time": "13:31",
    "birth_latitude": 12.9629,
    "birth_longitude": 77.5775
  }
}
```

### **9. Sacred Geometry**
```http
POST /engines/sacred_geometry/calculate
Content-Type: application/json

{
  "input": {
    "birth_date": "1991-08-13",
    "pattern_type": "mandala",
    "complexity": "medium"
  }
}
```

### **10. Sigil Forge (Enterprise)**
```http
POST /engines/sigil_forge/calculate
Content-Type: application/json

{
  "input": {
    "intention": "Consciousness expansion and spiritual growth",
    "style": "geometric",
    "complexity": "advanced"
  }
}
```

## 📊 Reading Persistence Endpoints

### **Store Reading Result**
```http
POST /api/readings/store
Content-Type: application/json
Authorization: Bearer {api_token}

{
  "userId": 1,
  "engineName": "numerology",
  "inputParameters": {
    "birth_date": "1991-08-13",
    "full_name": "Cumbipuram Nateshan Sheshanarayan Iyer"
  },
  "result": {
    "engine_name": "numerology",
    "formatted_output": "...",
    "calculation_time": 0.0004
  },
  "metadata": {
    "source": "raycast_extension",
    "timestamp": "2025-01-30T12:00:00Z",
    "executionTime": 1250,
    "version": "1.0.0"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "readingId": "reading_1753877295585",
    "stored": true,
    "timestamp": "2025-01-30T12:00:00Z"
  }
}
```

### **Get Reading History**
```http
GET /api/readings/history?userId=1&limit=50&timeRange=30d&engine=numerology
Authorization: Bearer {api_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "readings": [
      {
        "id": "reading_1753877295585",
        "userId": 1,
        "engineName": "numerology",
        "inputParameters": {...},
        "result": {...},
        "metadata": {
          "source": "raycast_extension",
          "timestamp": "2025-01-30T12:00:00Z",
          "executionTime": 1250,
          "version": "1.0.0"
        }
      }
    ],
    "total": 247,
    "page": 1,
    "limit": 50
  }
}
```

### **Get Specific Reading**
```http
GET /api/readings/{readingId}
Authorization: Bearer {api_token}
```

### **Get Reading Statistics**
```http
GET /api/readings/stats?userId=1&timeRange=90d
Authorization: Bearer {api_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReadings": 247,
    "engineBreakdown": {
      "numerology": 85,
      "tarot": 62,
      "biorhythm": 45,
      "human_design": 35,
      "iching": 20
    },
    "averageExecutionTime": 1350,
    "successRate": 0.98,
    "mostActiveDay": "2025-01-28",
    "streakDays": 12
  }
}
```

## 🔄 Workflow Endpoints

### **Daily Guidance Generation**
```http
POST /api/workflows/daily-guidance
Content-Type: application/json
Authorization: Bearer {api_token}

{
  "userId": 1,
  "engines": ["numerology", "biorhythm", "tarot"],
  "preferences": {
    "aiModel": "gpt-4",
    "creativity": "balanced",
    "focusArea": "consciousness_expansion"
  },
  "includeHistory": true
}
```

### **Batch Engine Calculations**
```http
POST /api/workflows/batch-calculate
Content-Type: application/json
Authorization: Bearer {api_token}

{
  "userId": 1,
  "engines": [
    {
      "name": "numerology",
      "input": {
        "birth_date": "1991-08-13",
        "full_name": "Cumbipuram Nateshan Sheshanarayan Iyer"
      }
    },
    {
      "name": "biorhythm",
      "input": {
        "birth_date": "1991-08-13",
        "target_date": "2025-01-30"
      }
    }
  ],
  "storeResults": true
}
```

## 👤 User Profile Endpoints

### **Get Consciousness Profile**
```http
GET /api/user/consciousness-profile?userId=1&includeHistory=true
Authorization: Bearer {api_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "profile": {
      "coreNumbers": {
        "lifePath": 5,
        "expression": 3,
        "soulUrge": 1,
        "personality": 2
      },
      "humanDesign": {
        "type": "Generator",
        "profile": "2/4",
        "authority": "Sacral"
      },
      "preferences": {
        "favoriteEngines": ["numerology", "tarot", "biorhythm"],
        "direction": "east",
        "card": "alchemist"
      }
    },
    "lastUpdated": "2025-01-30T12:00:00Z",
    "completeness": 95
  }
}
```

### **Update Consciousness Profile**
```http
PUT /api/user/consciousness-profile
Content-Type: application/json
Authorization: Bearer {api_token}

{
  "userId": 1,
  "profileData": {
    "coreNumbers": {
      "lifePath": 5,
      "expression": 3,
      "soulUrge": 1
    },
    "humanDesign": {
      "type": "Generator",
      "profile": "2/4"
    },
    "preferences": {
      "favoriteEngines": ["numerology", "tarot"]
    }
  },
  "source": "raycast_extension"
}
```

## 📈 Analytics & Tracking Endpoints

### **Log User Action**
```http
POST /api/analytics/action
Content-Type: application/json
Authorization: Bearer {api_token}

{
  "userId": 1,
  "action": "calculate_numerology",
  "source": "raycast_extension",
  "metadata": {
    "engineName": "numerology",
    "executionTime": 1250,
    "success": true,
    "timestamp": "2025-01-30T12:00:00Z"
  }
}
```

### **Get User Activity Statistics**
```http
GET /api/analytics/user-stats?userId=1&timeRange=30d
Authorization: Bearer {api_token}
```

### **Get Usage Patterns**
```http
GET /api/analytics/patterns?userId=1
Authorization: Bearer {api_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "favoriteEngines": ["numerology", "tarot", "biorhythm"],
    "peakUsageHours": [8, 9, 20, 21],
    "averageSessionLength": 15.5,
    "totalCalculations": 247,
    "streakDays": 12,
    "lastActive": "2025-01-30T12:00:00Z",
    "weeklyPattern": {
      "monday": 45,
      "tuesday": 38,
      "wednesday": 42,
      "thursday": 35,
      "friday": 28,
      "saturday": 15,
      "sunday": 22
    }
  }
}
```

## 🔍 Health & Status Endpoints

### **Engine Proxy Health**
```http
GET /health
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "service": "witnessos-engines",
    "engines_available": [
      "human_design", "numerology", "biorhythm", 
      "vimshottari", "tarot", "iching", "gene_keys", 
      "enneagram", "sacred_geometry", "sigil_forge"
    ],
    "swiss_ephemeris": true,
    "timestamp": "2025-07-30T12:08:16.358877"
  }
}
```

### **Available Engines**
```http
GET /engines
```

## 🚨 Error Handling

### **Standard Error Response**
```json
{
  "success": false,
  "error": {
    "code": "CALCULATION_FAILED",
    "message": "Invalid birth date format",
    "details": {
      "field": "birth_date",
      "expected": "YYYY-MM-DD",
      "received": "13-08-1991"
    },
    "requestId": "req_1753877295585",
    "timestamp": "2025-01-30T12:00:00Z"
  }
}
```

### **Common Error Codes**
- `INVALID_INPUT` - Input parameters validation failed
- `CALCULATION_FAILED` - Engine calculation error
- `UNAUTHORIZED` - Invalid or missing API token
- `RATE_LIMITED` - Too many requests
- `ENGINE_UNAVAILABLE` - Requested engine is not available
- `STORAGE_FAILED` - Failed to store reading result

## 🔧 Rate Limiting

### **Current Limits (Admin User)**
- **Per Minute**: 1000 requests
- **Per Hour**: 50,000 requests  
- **Per Day**: 500,000 requests

### **Rate Limit Headers**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1753877355
```

## 📝 Request/Response Examples

### **Complete Numerology Workflow**
```typescript
// 1. Calculate numerology
const calculation = await fetch('/engines/numerology/calculate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer wos_live_admin_sheshnarayan_2025_raycast_extension',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    input: {
      birth_date: '1991-08-13',
      full_name: 'Cumbipuram Nateshan Sheshanarayan Iyer'
    }
  })
});

// 2. Store the reading
const storage = await fetch('/api/readings/store', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer wos_live_admin_sheshnarayan_2025_raycast_extension',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 1,
    engineName: 'numerology',
    inputParameters: { /* ... */ },
    result: calculation.data,
    metadata: {
      source: 'raycast_extension',
      timestamp: new Date().toISOString(),
      executionTime: 1250,
      version: '1.0.0'
    }
  })
});

// 3. Log the action
await fetch('/api/analytics/action', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer wos_live_admin_sheshnarayan_2025_raycast_extension',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userId: 1,
    action: 'calculate_numerology',
    source: 'raycast_extension',
    metadata: {
      engineName: 'numerology',
      executionTime: 1250,
      success: true,
      timestamp: new Date().toISOString()
    }
  })
});
```

This comprehensive API reference ensures all Raycast extension actions are properly documented with persistence, tracking, and analytics capabilities! 🚀

# WitnessOS Hybrid Architecture

## Overview

WitnessOS uses a hybrid architecture combining **Railway Python engines** for consciousness calculations and **Cloudflare Workers** for API gateway, authentication, and workflow orchestration.

## Architecture Components

### 🚂 Railway Python Engines (`witnessos-engines/`)

**Location**: `https://webshore-witnessos-aleph-production.up.railway.app`

**Purpose**: Heavy computational consciousness calculations using Swiss Ephemeris

**Services**:
- **Swiss Ephemeris Service**: Astronomical calculations for consciousness mapping
- **Human Design Scanner**: Human Design chart calculations
- **Numerology Engine**: Numerological consciousness analysis
- **Biorhythm Engine**: Biological rhythm calculations
- **Vimshottari Timeline Mapper**: Vedic timeline mapping
- **Tarot Sequence Decoder**: Tarot-based consciousness interpretation
- **I Ching Mutation Oracle**: I Ching divination system
- **Gene Keys Compass**: Gene Keys consciousness mapping
- **Enneagram Resonator**: Enneagram personality analysis
- **Sacred Geometry Mapper**: Geometric consciousness patterns
- **Sigil Forge Synthesizer**: Sigil generation and analysis

**Technology Stack**:
- FastAPI (Python)
- Swiss Ephemeris library
- Pydantic for data validation
- CORS middleware for cross-origin requests

### ☁️ Cloudflare Workers

**Purpose**: API gateway, authentication, storage, and workflow orchestration

#### Core Services

1. **API Router** (`wrangler.toml`)
   - Main orchestration worker
   - Routes requests to specialized services
   - Handles authentication and rate limiting
   - Manages Durable Objects for state

2. **Engine Proxy** (`wrangler-engine-proxy.toml`)
   - Communicates with Railway Python engines
   - Handles caching and request optimization
   - Manages Railway API integration

3. **AI Service** (`wrangler-ai-service.toml`)
   - AI-powered synthesis and interpretation
   - Integrates with OpenRouter for LLM access
   - Processes consciousness data with AI

4. **Engine Service** (`wrangler-engine-service.toml`)
   - Coordinates consciousness engine calculations
   - Manages user profiles and engine data
   - Handles engine state and caching

5. **Forecast Service** (`wrangler-forecast-service.toml`)
   - Generates consciousness forecasts
   - Integrates multiple engine predictions
   - Manages forecast data and caching

#### Workflow Services

6. **Consciousness Workflow** (`wrangler-consciousness-workflow.toml`)
   - Handles natal chart workflows
   - Career consciousness mapping
   - Spiritual development tracking

7. **Integration Workflow** (`wrangler-integration-workflow.toml`)
   - External integrations (Raycast, Slack)
   - Webhook processing
   - API integrations

## Data Flow

```
Client Request
    ↓
Cloudflare API Router
    ↓
Service Routing (Engine/AI/Forecast/Workflow)
    ↓
Engine Proxy (for Python calculations)
    ↓
Railway Python Engines (Swiss Ephemeris + Consciousness Engines)
    ↓
Response Processing & Caching
    ↓
Client Response
```

## Storage Architecture

### Cloudflare KV Namespaces
- **KV_CACHE**: General caching
- **KV_USER_PROFILES**: User profile data
- **KV_FORECASTS**: Forecast data
- **KV_ENGINE_DATA**: Engine calculation results
- **KV_SECRETS**: Sensitive configuration
- **KV_AI_CACHE**: AI service caching
- **KV_INTEGRATIONS**: Integration data

### Cloudflare D1 Database
- **witnessos-db**: Persistent user data, sessions, and analytics

### Cloudflare R2 Buckets
- **witnessos-reports**: Generated reports and files

## Environment Configuration

### Development
- Caching disabled for real-time testing
- Railway engines enabled
- Reduced rate limits

### Staging
- Limited caching
- Railway engines enabled
- Moderate rate limits
- Separate domain: `api-staging.witnessos.space`

### Production
- Full caching enabled
- Railway engines enabled
- High rate limits
- Main domain: `api-v2.witnessos.space`

## Service Dependencies

```
API Router
├── Engine Service
│   ├── Engine Proxy (Railway)
│   └── AI Service
├── Forecast Service
│   ├── Engine Service
│   ├── AI Service
│   └── Engine Proxy
├── Consciousness Workflow
│   ├── Engine Service
│   ├── AI Service
│   └── Engine Proxy
└── Integration Workflow
    ├── Engine Service
    ├── AI Service
    ├── Forecast Service
    └── Engine Proxy
```

## Deployment Strategy

### Railway Python Engines
1. Deploy to Railway platform
2. Configure environment variables
3. Set up Swiss Ephemeris data files
4. Test health endpoints

### Cloudflare Workers
1. Deploy Engine Proxy first (Railway integration)
2. Deploy core services (AI, Engine, Forecast)
3. Deploy workflow services
4. Deploy main API Router last

### Deployment Script
```bash
./deploy-consolidated.sh
```

## Security & Secrets

### Required Secrets
- **JWT_SECRET**: Authentication tokens
- **OPENROUTER_API_KEY**: AI service access
- **RAILWAY_API_KEY**: Railway engine access

### Set via Wrangler
```bash
wrangler secret put JWT_SECRET
wrangler secret put OPENROUTER_API_KEY
wrangler secret put RAILWAY_API_KEY
```

## Monitoring & Health Checks

### Railway Engines
- Health endpoint: `/health`
- Admin test: `/test/admin-user`
- Engine list: `/engines`

### Cloudflare Workers
- Built-in health checks
- Log monitoring: `wrangler tail`
- Analytics via Cloudflare dashboard

## Performance Optimization

### Caching Strategy
- Engine calculations cached for 1 hour (production)
- User profiles cached in KV
- AI responses cached separately
- Forecast data cached with TTL

### Rate Limiting
- Development: 50 requests/minute
- Staging: 100 requests/minute
- Production: 1000 requests/minute

## Troubleshooting

### Common Issues
1. **Railway engines offline**: Check Railway dashboard
2. **Service binding errors**: Verify service names in wrangler.toml
3. **Secret missing**: Set required secrets via wrangler
4. **CORS issues**: Check CORS_ORIGIN configuration

### Debug Commands
```bash
# Check Railway engines
curl https://webshore-witnessos-aleph-production.up.railway.app/health

# Monitor worker logs
wrangler tail

# Test service endpoints
curl https://api-v2.witnessos.space/health
```

## Future Enhancements

1. **Edge Computing**: Move more logic to edge
2. **Database Optimization**: Implement connection pooling
3. **Caching Strategy**: Implement Redis for complex caching
4. **Monitoring**: Add detailed metrics and alerting
5. **Security**: Implement OAuth2 and advanced auth 
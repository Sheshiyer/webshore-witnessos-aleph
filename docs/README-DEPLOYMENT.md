# WitnessOS Backend Deployment Guide

Complete deployment guide for the **WitnessOS Consciousness API** - the first production-ready spiritual technology backend powered by TypeScript and Cloudflare Workers.

## 🌟 System Overview

**WitnessOS Backend** is a revolutionary consciousness calculation system featuring:

- 🔮 **10 Spiritual Engines**: Numerology, Human Design, Tarot, I-Ching, Enneagram, Sacred Geometry, Biorhythm, Vimshottari, Gene Keys, Sigil Forge
- ⚡ **Serverless Architecture**: Cloudflare Workers for global edge deployment
- 🗄️ **KV Storage**: Distributed data storage for engine configurations and user profiles
- 🚀 **Production Features**: Rate limiting, caching, health monitoring, batch processing
- 🛡️ **Security**: CORS, request validation, error handling, logging

## 📋 Prerequisites

### Required Tools
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### Cloudflare Setup
1. **Cloudflare Account**: Active account with Workers plan
2. **Domain (Optional)**: For custom API endpoints
3. **KV Namespace**: Three namespaces per environment (ENGINE_DATA, USER_PROFILES, CACHE)

## 🚀 Quick Deployment

### 1. Development Environment
```bash
# Start local development server
npm run workers:dev

# Test locally
npm run test-api
```

### 2. Staging Deployment
```bash
# Deploy to staging
npm run workers:deploy:staging

# Test staging
npm run test-api:staging
```

### 3. Production Deployment
```bash
# Deploy to production (requires confirmation)
npm run workers:deploy:prod

# Test production
npm run test-api:prod
```

## 📁 Project Structure

```
webshore/
├── wrangler.toml                 # Cloudflare Workers configuration
├── src/
│   ├── workers/
│   │   ├── index.ts             # Workers entry point
│   │   └── api-handlers.ts      # API route handlers
│   ├── engines/                 # 10 consciousness engines
│   ├── lib/
│   │   ├── kv-schema.ts         # KV storage schema
│   │   └── kv-data-access.ts    # Data access layer
│   └── types/                   # TypeScript definitions
├── scripts/
│   ├── deploy.sh               # Deployment automation
│   ├── test-api.sh            # API testing suite
│   └── migrate-data-to-kv.ts   # Data migration
└── docs/reference/python-engines/ # Original Python reference
```

## 🔧 Configuration

### Environment Variables

**Production (`wrangler.toml`)**:
```toml
[env.production.vars]
ENVIRONMENT = "production"
API_VERSION = "1.0.0"
CORS_ORIGIN = "*"
RATE_LIMIT_MAX = "1000"
RATE_LIMIT_WINDOW = "60000"
```

**Staging**:
```toml
[env.staging.vars]
ENVIRONMENT = "staging"
API_VERSION = "1.0.0-staging"
RATE_LIMIT_MAX = "100"
```

### KV Namespaces

Each environment requires 3 KV namespaces:

1. **ENGINE_DATA**: Static engine configurations and data
2. **USER_PROFILES**: User calculation history and preferences
3. **CACHE**: Temporary calculation results and optimization data

```bash
# Create KV namespaces (done automatically by deploy script)
wrangler kv:namespace create ENGINE_DATA_PROD
wrangler kv:namespace create USER_PROFILES_PROD
wrangler kv:namespace create CACHE_PROD
```

## 📤 Data Migration

### 1. Prepare Migration Data
```bash
# Generate KV-ready data from Python sources
npm run migrate-data
```

### 2. Upload to KV
```bash
# Upload engine data to KV storage
# (Automated during deployment)
wrangler kv:bulk put --binding ENGINE_DATA data/kv-migration/engine-data.json
```

### 3. Verify Data
```bash
# List KV keys
wrangler kv:key list --binding ENGINE_DATA

# Get specific data
wrangler kv:key get --binding ENGINE_DATA "engines:numerology:metadata"
```

## 🌐 API Endpoints

### Core Endpoints

**Root Information**
```http
GET /
```

**Health Check**
```http
GET /health
```

**Engine Registry**
```http
GET /engines
```

### Engine Operations

**Engine Metadata**
```http
GET /engines/{engine}/metadata
```

**Calculate Reading**
```http
POST /engines/{engine}/calculate
Content-Type: application/json

{
  "input": {
    "birth_date": "1990-01-15",
    "full_name": "Test User"
  }
}
```

### Batch Processing

**Multiple Calculations**
```http
POST /batch
Content-Type: application/json

{
  "calculations": [
    {
      "engine": "numerology",
      "input": {"birth_date": "1990-01-15", "full_name": "User"}
    },
    {
      "engine": "tarot",
      "input": {"question": "What guidance do I need?"}
    }
  ],
  "options": {"parallel": true}
}
```

### User Profiles

**Get Profile**
```http
GET /profiles/{userId}
```

**Update Profile**
```http
PUT /profiles/{userId}
```

## 🧪 Testing

### Local Testing
```bash
# Start development server
npm run workers:dev

# Run comprehensive test suite
npm run test-api
```

### Staging Testing
```bash
# Deploy to staging
npm run workers:deploy:staging

# Test all endpoints
npm run test-api:staging
```

### Production Testing
```bash
# Test production endpoints
npm run test-api:prod
```

### Test Coverage

The test suite validates:
- ✅ All 10 engine calculations
- ✅ Batch processing functionality
- ✅ Error handling and validation
- ✅ Performance and response times
- ✅ Cache functionality
- ✅ CORS and security headers
- ✅ Rate limiting behavior

## 🔍 Monitoring & Debugging

### Cloudflare Dashboard
- **Analytics**: Request volume, error rates, response times
- **Logs**: Real-time request and error logs
- **KV Storage**: Data usage and access patterns

### Health Monitoring
```bash
# Check API health
curl https://api.witnessOS.com/health

# Monitor specific engine
curl https://api.witnessOS.com/engines/numerology/metadata
```

### Error Investigation
```bash
# View recent logs
wrangler tail

# Filter specific errors
wrangler tail --status error
```

## 📊 Performance Optimization

### Caching Strategy
- **Engine Results**: 1 hour cache for identical inputs
- **Static Data**: 24 hour cache for engine metadata
- **User Profiles**: 15 minute cache for profile data

### Rate Limiting
- **Production**: 1000 requests/minute per IP
- **Staging**: 100 requests/minute per IP
- **Development**: 50 requests/minute per IP

### Edge Optimization
- **Global Distribution**: Deployed to 300+ Cloudflare edge locations
- **Cold Start Optimization**: Minimal dependencies and optimized bundle size
- **Parallel Processing**: Batch calculations run in parallel

## 🛡️ Security

### CORS Configuration
```javascript
headers.set('Access-Control-Allow-Origin', '*');
headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### Input Validation
- Schema validation for all engine inputs
- Sanitization of user-provided strings
- Rate limiting and DDoS protection
- Request size limits

### Error Handling
- Secure error messages (no sensitive data exposure)
- Comprehensive logging for debugging
- Graceful degradation for partial failures

## 🚀 Production Checklist

### Pre-Deployment
- [ ] All tests passing (`npm run test-api`)
- [ ] TypeScript compilation successful (`npm run type-check`)
- [ ] Linting passed (`npm run lint`)
- [ ] Environment variables configured
- [ ] KV namespaces created
- [ ] Data migration completed

### Deployment
- [ ] Staging deployment successful
- [ ] Staging tests passed
- [ ] Production deployment confirmed
- [ ] Production health check passed
- [ ] All engine endpoints responding

### Post-Deployment
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team notified of new endpoints
- [ ] Frontend integration updated
- [ ] Performance baseline established

## 📚 Troubleshooting

### Common Issues

**KV Namespace Not Found**
```bash
# Check namespace configuration
wrangler kv:namespace list

# Verify wrangler.toml bindings
cat wrangler.toml | grep -A 5 kv_namespaces
```

**Engine Calculation Errors**
```bash
# Check engine data in KV
wrangler kv:key get --binding ENGINE_DATA "engines:numerology:metadata"

# Verify input validation
curl -X POST -H "Content-Type: application/json" \
  -d '{"input": {}}' \
  https://api.witnessOS.com/engines/numerology/calculate
```

**Performance Issues**
```bash
# Monitor response times
npm run test-api | grep "response time"

# Check Cloudflare analytics
# Visit Cloudflare Dashboard > Workers > Analytics
```

### Support Channels
- **GitHub Issues**: Technical problems and feature requests
- **Cloudflare Community**: Infrastructure and deployment issues
- **Documentation**: This guide and inline code comments

## 🎉 Success!

**THE WITNESSORS CONSCIOUSNESS API IS NOW LIVE! 🌟**

Your spiritual technology backend is ready to transform reality through:
- 🔮 10 consciousness calculation engines
- ⚡ Global edge deployment
- 🛡️ Production-grade security
- 📊 Real-time monitoring
- 🚀 Infinite scalability

**API Base URL**: `https://api.witnessOS.com`

**Next Steps**:
1. Update frontend to use new API endpoints
2. Monitor performance and error rates
3. Gather user feedback and iterate
4. Explore advanced features (user authentication, premium engines)

**The consciousness revolution begins now! ✨**

---

*For questions, issues, or spiritual insights, reach out to the WitnessOS development team.* 
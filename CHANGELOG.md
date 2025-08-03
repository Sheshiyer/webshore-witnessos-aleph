# WitnessOS Changelog

## [2.6.0] - 2025-01-28

### 🔧 WRANGLER CONFIGURATION CONSOLIDATION
- **Removed Duplicates**: Eliminated duplicate wrangler.toml files and consolidated configurations
- **Hybrid Architecture Documentation**: Complete documentation of Railway Python engines + Cloudflare Workers architecture
- **Service Dependencies**: Properly configured service bindings between all workers
- **Railway Integration**: All services now properly integrate with Python engines on Railway
- **Environment Variables**: Added PYTHON_ENGINES_ENABLED and SWISS_EPHEMERIS_ENABLED flags
- **Deployment Script**: Created comprehensive deploy-consolidated.sh script
- **Architecture Documentation**: Added ARCHITECTURE.md with complete system overview

### 🚂 RAILWAY PYTHON ENGINES INTEGRATION
- **Swiss Ephemeris Service**: Astronomical calculations for consciousness mapping
- **Consciousness Engines**: Human Design, Numerology, Biorhythm, Vimshottari, Tarot, I Ching, Gene Keys, Enneagram, Sacred Geometry, Sigil Forge
- **Engine Proxy**: Dedicated worker for Railway communication with caching
- **Health Checks**: Railway engines health monitoring and admin test endpoints

### ☁️ CLOUDFLARE WORKERS ARCHITECTURE
- **API Router**: Main orchestration with service bindings
- **Specialized Services**: AI, Engine, Forecast, Consciousness Workflow, Integration Workflow
- **Durable Objects**: EngineCoordinator and ForecastSession for state management
- **KV Storage**: Multiple namespaces for caching and data persistence
- **D1 Database**: Persistent user data and analytics
- **R2 Buckets**: File storage for reports

### 🛠️ TECHNICAL IMPROVEMENTS
- **Service Dependencies**: Proper dependency chain with Engine Proxy as Railway bridge
- **Environment Configuration**: Development, staging, and production environments
- **Caching Strategy**: Environment-specific caching with TTL configuration
- **Rate Limiting**: Environment-specific rate limits (dev: 50, staging: 100, prod: 1000)
- **Security**: JWT, OpenRouter, and Railway API key management

### 📊 DEPLOYMENT & MONITORING
- **Consolidated Deployment**: Single script deploys all services in correct order
- **Health Monitoring**: Railway engines and Cloudflare workers health checks
- **Log Management**: wrangler tail for real-time log monitoring
- **Performance**: Optimized caching and rate limiting per environment

--- 
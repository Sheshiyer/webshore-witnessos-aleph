# 🏗️ **CONSOLIDATED WITNESSOS-ENGINES SERVICE**

## **📋 MAIN APPLICATION STRUCTURE**

### **app.py - Main FastAPI Application**
```python
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
import time
from datetime import datetime

# Import all engine modules
from engines.human_design.engine import HumanDesignEngine
from engines.numerology.engine import NumerologyEngine
from engines.biorhythm.engine import BiorhythmEngine
from engines.vimshottari.engine import VimshottariEngine
from engines.tarot.engine import TarotEngine
from engines.iching.engine import IChingEngine
from engines.gene_keys.engine import GeneKeysEngine
from engines.enneagram.engine import EnneagramEngine
from engines.sacred_geometry.engine import SacredGeometryEngine
from engines.sigil_forge.engine import SigilForgeEngine
from swiss_ephemeris.ephemeris import SwissEphemerisService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="WitnessOS Consciousness Engines",
    description="Consolidated consciousness technology calculation service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global engine instances (initialized once)
engines = {}
swiss_ephemeris = None

@app.on_event("startup")
async def startup_event():
    """Initialize all engines on startup"""
    global engines, swiss_ephemeris
    
    logger.info("🚀 Initializing WitnessOS Consciousness Engines...")
    
    try:
        # Initialize Swiss Ephemeris service first
        swiss_ephemeris = SwissEphemerisService()
        logger.info("✅ Swiss Ephemeris service initialized")
        
        # Initialize all consciousness engines
        engines = {
            "human_design": HumanDesignEngine(swiss_ephemeris=swiss_ephemeris),
            "numerology": NumerologyEngine(),
            "biorhythm": BiorhythmEngine(),
            "vimshottari": VimshottariEngine(swiss_ephemeris=swiss_ephemeris),
            "tarot": TarotEngine(),
            "iching": IChingEngine(),
            "gene_keys": GeneKeysEngine(swiss_ephemeris=swiss_ephemeris),
            "enneagram": EnneagramEngine(),
            "sacred_geometry": SacredGeometryEngine(),
            "sigil_forge": SigilForgeEngine()
        }
        
        logger.info(f"✅ Initialized {len(engines)} consciousness engines")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize engines: {e}")
        raise

# Common request/response models
class EngineRequest(BaseModel):
    input: Dict[str, Any]
    options: Optional[Dict[str, Any]] = {}

class EngineResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    processing_time: float
    timestamp: str
    engine: str

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check for the entire service"""
    return {
        "status": "healthy",
        "service": "witnessos-engines",
        "engines_loaded": len(engines),
        "swiss_ephemeris": swiss_ephemeris is not None,
        "timestamp": datetime.utcnow().isoformat()
    }

# Swiss Ephemeris endpoint
@app.post("/swiss_ephemeris/calculate", response_model=EngineResponse)
async def calculate_swiss_ephemeris(request: EngineRequest):
    """Calculate planetary positions using Swiss Ephemeris"""
    start_time = time.time()
    
    try:
        if not swiss_ephemeris:
            raise HTTPException(status_code=503, detail="Swiss Ephemeris service not available")
        
        result = swiss_ephemeris.calculate_positions(
            request.input.get("birth_date"),
            request.input.get("birth_time"),
            request.input.get("birth_location"),
            **request.options
        )
        
        processing_time = time.time() - start_time
        
        return EngineResponse(
            success=True,
            data=result,
            processing_time=processing_time,
            timestamp=datetime.utcnow().isoformat(),
            engine="swiss_ephemeris"
        )
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Swiss Ephemeris calculation failed: {e}")
        
        return EngineResponse(
            success=False,
            error=str(e),
            processing_time=processing_time,
            timestamp=datetime.utcnow().isoformat(),
            engine="swiss_ephemeris"
        )

# Generic engine calculation endpoint
@app.post("/engines/{engine_name}/calculate", response_model=EngineResponse)
async def calculate_engine(engine_name: str, request: EngineRequest):
    """Calculate using specified consciousness engine"""
    start_time = time.time()
    
    try:
        if engine_name not in engines:
            raise HTTPException(
                status_code=404, 
                detail=f"Engine '{engine_name}' not found. Available: {list(engines.keys())}"
            )
        
        engine = engines[engine_name]
        result = engine.calculate(request.input, **request.options)
        
        processing_time = time.time() - start_time
        
        return EngineResponse(
            success=True,
            data=result.dict() if hasattr(result, 'dict') else result,
            processing_time=processing_time,
            timestamp=datetime.utcnow().isoformat(),
            engine=engine_name
        )
        
    except Exception as e:
        processing_time = time.time() - start_time
        logger.error(f"Engine {engine_name} calculation failed: {e}")
        
        return EngineResponse(
            success=False,
            error=str(e),
            processing_time=processing_time,
            timestamp=datetime.utcnow().isoformat(),
            engine=engine_name
        )

# Batch calculation endpoint
@app.post("/engines/batch/calculate")
async def calculate_batch(requests: Dict[str, EngineRequest]):
    """Calculate multiple engines in parallel"""
    start_time = time.time()
    results = {}
    
    for engine_name, request in requests.items():
        try:
            if engine_name in engines:
                engine = engines[engine_name]
                result = engine.calculate(request.input, **request.options)
                results[engine_name] = {
                    "success": True,
                    "data": result.dict() if hasattr(result, 'dict') else result
                }
            else:
                results[engine_name] = {
                    "success": False,
                    "error": f"Engine '{engine_name}' not found"
                }
        except Exception as e:
            results[engine_name] = {
                "success": False,
                "error": str(e)
            }
    
    processing_time = time.time() - start_time
    
    return {
        "success": True,
        "results": results,
        "processing_time": processing_time,
        "timestamp": datetime.utcnow().isoformat()
    }

# Engine list endpoint
@app.get("/engines")
async def list_engines():
    """List all available consciousness engines"""
    return {
        "engines": list(engines.keys()),
        "count": len(engines),
        "swiss_ephemeris_available": swiss_ephemeris is not None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## **🔧 DEPLOYMENT CONFIGURATION**

### **requirements.txt**
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-multipart==0.0.6
pyswisseph==2.10.03.2
numpy==1.24.3
pandas==2.0.3
python-dateutil==2.8.2
pytz==2023.3
requests==2.31.0
aiohttp==3.9.1
```

### **Railway Deployment**
```yaml
services:
  - type: web
    name: witnessos-engines
    env: python
    plan: starter  # $7/month for better performance
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app:app --host 0.0.0.0 --port $PORT --workers 2
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: SERVICE_NAME
        value: witnessos-engines
      - key: LOG_LEVEL
        value: INFO
    healthCheckPath: /health
```

---

## **📊 MIGRATION PLAN**

### **Phase 1: Core Structure (Week 1)**
- [ ] Create consolidated service directory structure
- [ ] Migrate Swiss Ephemeris service into `/swiss_ephemeris/`
- [ ] Migrate Human Design engine (highest priority)
- [ ] Create main FastAPI application with routing
- [ ] Deploy and test Human Design accuracy

### **Phase 2: Engine Migration (Week 2)**
- [ ] Migrate Numerology, Biorhythm, Vimshottari engines
- [ ] Integrate with Swiss Ephemeris for astronomical engines
- [ ] Test batch calculation endpoint
- [ ] Performance optimization and caching

### **Phase 3: Complete Migration (Week 3)**
- [ ] Migrate remaining engines (Tarot, I-Ching, Gene Keys, etc.)
- [ ] Comprehensive testing suite
- [ ] Error handling and monitoring
- [ ] Documentation and API docs

### **Phase 4: Production Hardening (Week 4)**
- [ ] Load testing and performance tuning
- [ ] Security hardening and input validation
- [ ] Monitoring and alerting setup
- [ ] Final deployment and Cloudflare integration

---

## **🎯 NEXT IMMEDIATE STEPS**

1. **[ ] Update Railway service configuration**
2. **[ ] Create new consolidated service structure**
3. **[ ] Migrate Swiss Ephemeris integration first**
4. **[ ] Test Human Design engine accuracy**
5. **[ ] Update Cloudflare Workers to point to new service**

This consolidated approach will give you a **production-ready consciousness technology platform** at a fraction of the cost and complexity! 🚀

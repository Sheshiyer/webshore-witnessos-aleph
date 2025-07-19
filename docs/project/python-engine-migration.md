# 🐍 **PYTHON ENGINE MIGRATION PLAN**

## **📋 MIGRATION OVERVIEW**

**Source:** `/docs/reference/python-engines/`  
**Target:** Production Render.com services  
**Goal:** Deploy proven Python engines as production APIs

---

## **🏗️ PRODUCTION STRUCTURE**

### **New Directory Structure**
```
backend-services/
├── engines/
│   ├── human_design/
│   │   ├── app.py              # FastAPI application
│   │   ├── engine.py           # Migrated from reference
│   │   ├── models.py           # Pydantic models
│   │   └── requirements.txt    # Dependencies
│   ├── numerology/
│   ├── biorhythm/
│   ├── vimshottari/
│   └── ...
├── shared/
│   ├── base/                   # Base engine interfaces
│   ├── calculations/           # Shared calculations
│   ├── data/                   # Engine data files
│   └── utils/                  # Utilities
├── swiss-ephemeris/
│   ├── app.py                  # Swiss Ephemeris service
│   └── ephemeris.py           # Astronomical calculations
└── docker-compose.yml         # Local development
```

---

## **🚀 MIGRATION STEPS**

### **Step 1: Create Production Base Structure**
```bash
# Create new production directory
mkdir -p backend-services/{engines,shared,swiss-ephemeris}

# Copy shared components
cp -r docs/reference/python-engines/base backend-services/shared/
cp -r docs/reference/python-engines/calculations backend-services/shared/
cp -r docs/reference/python-engines/data backend-services/shared/
```

### **Step 2: Migrate Individual Engines**
For each engine (human_design, numerology, etc.):

```python
# backend-services/engines/human_design/app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from engine import HumanDesignScanner
import logging

app = FastAPI(title="Human Design Engine", version="1.0.0")
engine = HumanDesignScanner()

class CalculationRequest(BaseModel):
    input: dict
    options: dict = {}

class CalculationResponse(BaseModel):
    success: bool
    data: dict = None
    error: str = None
    processing_time: float
    timestamp: str

@app.post("/calculate", response_model=CalculationResponse)
async def calculate_human_design(request: CalculationRequest):
    try:
        result = engine.calculate(request.input)
        return CalculationResponse(
            success=True,
            data=result.dict(),
            processing_time=result.processing_time,
            timestamp=result.timestamp
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "engine": "human_design"}
```

### **Step 3: Create Render.com Deployment Config**
```yaml
# render.yaml
services:
  - type: web
    name: human-design-engine
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: DATABASE_URL
        fromDatabase:
          name: witnessos-engines-db
          property: connectionString

  - type: web
    name: swiss-ephemeris-service
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app:app --host 0.0.0.0 --port $PORT

databases:
  - name: witnessos-engines-db
    databaseName: witnessos_engines
    user: witnessos
```

---

## **🔧 ENGINE-SPECIFIC MIGRATIONS**

### **Human Design Engine**
- **Source**: `docs/reference/python-engines/engines/human_design.py`
- **Dependencies**: Swiss Ephemeris service, astrology calculations
- **Priority**: HIGHEST (accuracy critical)
- **Estimated Time**: 2 days

### **Numerology Engine**
- **Source**: `docs/reference/python-engines/engines/numerology.py`
- **Dependencies**: Minimal (name + birth date calculations)
- **Priority**: HIGH (commonly used)
- **Estimated Time**: 1 day

### **Biorhythm Engine**
- **Source**: `docs/reference/python-engines/engines/biorhythm.py`
- **Dependencies**: Date calculations only
- **Priority**: HIGH (daily forecasts)
- **Estimated Time**: 1 day

### **Vimshottari Engine**
- **Source**: `docs/reference/python-engines/engines/vimshottari.py`
- **Dependencies**: Swiss Ephemeris service
- **Priority**: MEDIUM (complex but proven)
- **Estimated Time**: 2 days

---

## **📊 DEPLOYMENT TIMELINE**

### **Week 1: Core Infrastructure**
- [ ] Day 1-2: Set up production directory structure
- [ ] Day 3-4: Migrate Human Design engine (PRIORITY)
- [ ] Day 5: Deploy and test Human Design accuracy

### **Week 2: Essential Engines**
- [ ] Day 1: Migrate Numerology engine
- [ ] Day 2: Migrate Biorhythm engine
- [ ] Day 3-4: Migrate Vimshottari engine
- [ ] Day 5: Integration testing

### **Week 3: Divination Engines**
- [ ] Day 1: Migrate Tarot engine
- [ ] Day 2: Migrate I-Ching engine
- [ ] Day 3: Migrate Gene Keys engine
- [ ] Day 4: Migrate Enneagram engine
- [ ] Day 5: Testing and optimization

### **Week 4: Advanced Engines**
- [ ] Day 1-2: Migrate Sacred Geometry engine
- [ ] Day 3-4: Migrate Sigil Forge engine
- [ ] Day 5: Final testing and production deployment

---

## **🎯 SUCCESS CRITERIA**

### **Accuracy Validation**
- [ ] Human Design returns Generator (not Projector) for test user
- [ ] All engines match reference implementation results
- [ ] Swiss Ephemeris integration working correctly
- [ ] Zero calculation errors or fallbacks

### **Performance Targets**
- [ ] Engine response time < 1 second (individual)
- [ ] Batch calculations < 3 seconds (multiple engines)
- [ ] Cold start time < 10 seconds
- [ ] 99.9% uptime for all services

### **API Compatibility**
- [ ] Maintain exact input/output format compatibility
- [ ] Preserve all existing engine features
- [ ] Support all current calculation options
- [ ] Backward compatibility with existing frontend

---

## **🔗 NEXT ACTIONS**

1. **[ ] Create backend-services directory structure**
2. **[ ] Migrate Human Design engine first (highest priority)**
3. **[ ] Deploy to Render.com and test accuracy**
4. **[ ] Update Cloudflare proxy to route to Python services**
5. **[ ] Validate with user's actual birth data**

**Owner:** Backend Migration Team  
**Timeline:** 4 weeks to complete migration  
**Status:** 🟢 **READY TO START**

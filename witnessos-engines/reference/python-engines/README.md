# 🐍 Python Engines - Production Services

**Last Updated:** January 12, 2025  
**Deployment**: Railway Production  
**Base URL**: `https://webshore-witnessos-aleph-production.up.railway.app`  
**Status**: ✅ Production Ready

---

## 🏗️ **Architecture Overview**

### **Technology Stack**
- **Framework**: FastAPI 0.104+
- **Astronomical Library**: Swiss Ephemeris (pyephem)
- **Deployment**: Railway.app
- **Python Version**: 3.11+
- **Database**: SQLite (local) + Cloudflare D1 (distributed)

### **Service Integration**
```
Cloudflare Workers (API Gateway)
        ↓
Railway Python Engines (Calculations)
        ↓
Swiss Ephemeris (Astronomical Data)
```

---

## 🧠 **Available Engines**

### **Layer 1: Awakening** (Foundational Patterns)
| Engine | Endpoint | Description |
|--------|----------|-------------|
| **Sacred Geometry** | `/engines/sacred_geometry/calculate` | Universal pattern recognition |
| **Biorhythm** | `/engines/biorhythm/calculate` | Temporal wave visualization |

### **Layer 2: Recognition** (System Understanding)
| Engine | Endpoint | Description |
|--------|----------|-------------|
| **Numerology** | `/engines/numerology/calculate` | Sacred number geometry |
| **Vimshottari** | `/engines/vimshottari/calculate` | Planetary period cycles |
| **Tarot** | `/engines/tarot/calculate` | Archetypal symbol systems |
| **I-Ching** | `/engines/iching/calculate` | Binary wisdom patterns |

### **Layer 3: Integration** (Personal Mastery)
| Engine | Endpoint | Description |
|--------|----------|-------------|
| **Human Design** | `/engines/human_design/calculate` | Gate-based fractal layouts |
| **Gene Keys** | `/engines/gene_keys/calculate` | Genetic consciousness codes |
| **Enneagram** | `/engines/enneagram/calculate` | Personality type geometry |
| **Sigil Forge** | `/engines/sigil_forge/calculate` | Intention manifestation symbols |

---

## 🔌 **API Endpoints**

### **Health & Status**
```bash
# Health Check
GET https://webshore-witnessos-aleph-production.up.railway.app/health

# Engine List
GET https://webshore-witnessos-aleph-production.up.railway.app/engines

# Engine Metadata
GET https://webshore-witnessos-aleph-production.up.railway.app/engines/{engine_name}/metadata
```

### **Calculations**
```bash
# Single Engine Calculation
POST https://webshore-witnessos-aleph-production.up.railway.app/engines/{engine_name}/calculate
Content-Type: application/json

{
  "birth_data": {
    "date": "1990-01-15",
    "time": "14:30",
    "birth_location": [40.7128, -74.0060],
    "timezone": "America/New_York"
  }
}
```

### **Batch Processing**
```bash
# Multiple Engine Calculations
POST https://webshore-witnessos-aleph-production.up.railway.app/batch/calculate
Content-Type: application/json

{
  "engines": ["numerology", "human_design", "biorhythm"],
  "birth_data": {
    "date": "1990-01-15",
    "time": "14:30",
    "birth_location": [40.7128, -74.0060],
    "timezone": "America/New_York"
  }
}
```

---

## 📊 **Data Models**

### **Birth Data Input**
```python
class BirthData(BaseModel):
    date: str  # YYYY-MM-DD format
    time: str  # HH:MM format (24-hour)
    birth_location: List[float]  # [latitude, longitude]
    timezone: str  # IANA timezone identifier
```

### **Engine Response**
```python
class EngineResponse(BaseModel):
    engine: str
    status: str  # "success" | "error"
    data: Dict[str, Any]  # Engine-specific calculation results
    metadata: Dict[str, Any]  # Calculation metadata
    timestamp: str  # ISO 8601 timestamp
```

---

## 🔧 **Development & Testing**

### **Local Development**
```bash
# Clone and setup
git clone <repository>
cd witnessos-engines
pip install -r requirements.txt

# Run locally
uvicorn main:app --reload --port 8000

# Test endpoints
curl http://localhost:8000/health
```

### **Testing**
```bash
# Run all tests
pytest tests/

# Test specific engine
pytest tests/test_human_design.py -v

# Test with coverage
pytest --cov=engines tests/
```

---

## 📈 **Performance Metrics**

### **Response Times** (Production)
- **Health Check**: ~50ms
- **Single Engine**: ~200-500ms
- **Batch (3 engines)**: ~800-1200ms
- **Complex Calculations**: ~1-3s

### **Accuracy Validation**
- **Human Design**: ✅ Verified against HumDes.com
- **Numerology**: ✅ Pythagorean & Chaldean systems
- **Biorhythm**: ✅ Standard cycle calculations
- **Vimshottari**: ✅ Vedic astronomical precision

---

## 🚀 **Deployment**

### **Railway Configuration**
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn main:app --host 0.0.0.0 --port $PORT"

[env]
PYTHON_VERSION = "3.11"
PORT = "8000"
```

### **Environment Variables**
- `PORT`: Railway-assigned port
- `RAILWAY_ENVIRONMENT`: Production environment
- `DATABASE_URL`: SQLite database path

---

## 📚 **Engine-Specific Documentation**

### **Layer 1: Awakening**
- [Sacred Geometry Engine](./sacred-geometry.md) *(Coming Soon)*
- [Biorhythm Engine](./biorhythm.md) ✅

### **Layer 2: Recognition**
- [Numerology Engine](./numerology.md) ✅
- [Vimshottari Engine](./vimshottari.md) *(Coming Soon)*
- [Tarot Engine](./tarot.md) *(Coming Soon)*
- [I-Ching Engine](./iching.md) *(Coming Soon)*

### **Layer 3: Integration**
- [Human Design Engine](./human-design.md) ✅
- [Gene Keys Engine](./gene-keys.md) *(Coming Soon)*
- [Enneagram Engine](./enneagram.md) *(Coming Soon)*
- [Sigil Forge Engine](./sigil-forge.md) *(Coming Soon)*
"""
WitnessOS Consolidated Consciousness Engines Service
Single FastAPI service containing all consciousness engines with integrated Swiss Ephemeris
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import logging
import time
import sys
import os
from datetime import datetime

# Add current directory to Python path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import Swiss Ephemeris service
from swiss_ephemeris.ephemeris import SwissEphemerisService

# Import all consciousness engines
from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput
from engines.numerology import NumerologyEngine
from engines.numerology_models import NumerologyInput
from engines.biorhythm import BiorhythmEngine
from engines.biorhythm_models import BiorhythmInput
from engines.vimshottari import VimshottariTimelineMapper
from engines.vimshottari_models import VimshottariInput
from engines.tarot import TarotSequenceDecoder
from engines.tarot_models import TarotInput
from engines.iching import IChingMutationOracle
from engines.iching_models import IChingInput
from engines.gene_keys import GeneKeysCompass
from engines.gene_keys_models import GeneKeysInput
from engines.enneagram import EnneagramResonator
from engines.enneagram_models import EnneagramInput
from engines.sacred_geometry import SacredGeometryMapper
from engines.sacred_geometry_models import SacredGeometryInput
from engines.sigil_forge import SigilForgeSynthesizer
from engines.sigil_forge_models import SigilForgeInput

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="WitnessOS Consciousness Engines",
    description="Consolidated consciousness technology calculation service with integrated Swiss Ephemeris",
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

# Global services
swiss_ephemeris = None
engines = {}

@app.on_event("startup")
async def startup_event():
    """Initialize all engines and services on startup"""
    global swiss_ephemeris, engines
    
    logger.info("🚀 Initializing WitnessOS Consolidated Consciousness Engines...")
    
    try:
        # Initialize Swiss Ephemeris service first
        swiss_ephemeris = SwissEphemerisService()
        logger.info("✅ Swiss Ephemeris service initialized")
        
        # Test Swiss Ephemeris with admin user data
        logger.info("🧪 Testing Swiss Ephemeris accuracy...")
        test_result = swiss_ephemeris.test_admin_user_calculation()
        logger.info(f"🎯 Test completed - Personality Sun: Gate {test_result['personality']['SUN']['human_design_gate']['gate']}.{test_result['personality']['SUN']['human_design_gate']['line']}")
        
        # Initialize all consciousness engines
        logger.info("🔧 Initializing all consciousness engines...")
        engines = {
            "human_design": HumanDesignScanner(),
            "numerology": NumerologyEngine(),
            "biorhythm": BiorhythmEngine(),
            "vimshottari": VimshottariTimelineMapper(),
            "tarot": TarotSequenceDecoder(),
            "iching": IChingMutationOracle(),
            "gene_keys": GeneKeysCompass(),
            "enneagram": EnneagramResonator(),
            "sacred_geometry": SacredGeometryMapper(),
            "sigil_forge": SigilForgeSynthesizer(),
        }
        
        logger.info(f"✅ Initialized consolidated service with {len(engines)} engines")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
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
    """Health check for the entire consolidated service"""
    return {
        "status": "healthy",
        "service": "witnessos-engines",
        "engines_available": list(engines.keys()),
        "swiss_ephemeris": swiss_ephemeris is not None,
        "human_design_fix": "complete-earth-precision-v4",  # Complete coordinate transformation
        "timestamp": datetime.utcnow().isoformat()
    }

# Swiss Ephemeris endpoint
@app.post("/swiss_ephemeris/calculate", response_model=EngineResponse)
async def calculate_swiss_ephemeris(request: EngineRequest):
    """Calculate planetary positions using integrated Swiss Ephemeris"""
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
        logger.error(f"❌ Swiss Ephemeris calculation failed: {e}")
        
        return EngineResponse(
            success=False,
            error=str(e),
            processing_time=processing_time,
            timestamp=datetime.utcnow().isoformat(),
            engine="swiss_ephemeris"
        )

# Test endpoint for admin user Human Design
@app.get("/test/admin-user")
async def test_admin_user():
    """Test proven Human Design engine with admin user birth data"""
    try:
        if "human_design" not in engines:
            raise HTTPException(status_code=503, detail="Human Design engine not available")

        # Test Swiss Ephemeris first
        swiss_result = swiss_ephemeris.test_admin_user_calculation()

        # Test Human Design engine with admin user data
        from datetime import date as date_class, time as dt_time
        admin_input = HumanDesignInput(
            birth_date=date_class(1991, 8, 13),
            birth_time=dt_time(13, 31, 0),  # 13:31 local time (08:01 UTC)
            birth_location=(12.9716, 77.5946),  # Bengaluru, India
            timezone="Asia/Kolkata"
        )

        hd_engine = engines["human_design"]
        hd_result = hd_engine.calculate(admin_input)

        return {
            "success": True,
            "message": "Admin user test completed with proven engines",
            "swiss_ephemeris": {
                "personality_sun": f"Gate {swiss_result['personality']['SUN']['human_design_gate']['gate']}.{swiss_result['personality']['SUN']['human_design_gate']['line']}",
                "design_sun": f"Gate {swiss_result['design']['SUN']['human_design_gate']['gate']}.{swiss_result['design']['SUN']['human_design_gate']['line']}"
            },
            "human_design_engine": {
                "type": hd_result.chart.type_info.type_name if hasattr(hd_result, 'chart') else "Unknown",
                "strategy": hd_result.chart.type_info.strategy if hasattr(hd_result, 'chart') else "Unknown",
                "authority": hd_result.chart.type_info.authority if hasattr(hd_result, 'chart') else "Unknown",
                "profile": hd_result.chart.profile.profile_name if hasattr(hd_result, 'chart') else "Unknown",
                "confidence": hd_result.confidence_score,
                "calculation_time": hd_result.calculation_time
            },
            "validation": {
                "expected_type": "Generator (2/4 profile)",
                "matches_expected": "TBD - needs validation"
            }
        }

    except Exception as e:
        logger.error(f"❌ Admin user test failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Debug endpoint removed - issue resolved

# Proven engine calculation endpoint
@app.post("/engines/{engine_name}/calculate", response_model=EngineResponse)
async def calculate_engine(engine_name: str, request: EngineRequest):
    """Calculate using proven consciousness engine"""
    start_time = time.time()

    try:
        if engine_name not in engines:
            raise HTTPException(
                status_code=404,
                detail=f"Engine '{engine_name}' not found. Available: {list(engines.keys())}"
            )

        engine = engines[engine_name]
        logger.info(f"🔮 Running {engine_name} calculation with proven engine")

        # Create appropriate input model based on engine
        from datetime import date as date_class, time as dt_time
        
        if engine_name == "human_design":
            input_obj = HumanDesignInput(
                birth_date=date_class.fromisoformat(request.input["birth_date"]),
                birth_time=dt_time.fromisoformat(request.input["birth_time"]),
                birth_location=request.input["birth_location"],
                timezone=request.input.get("timezone", "UTC")
            )
        elif engine_name == "numerology":
            input_obj = NumerologyInput(
                full_name=request.input["full_name"],
                birth_date=date_class.fromisoformat(request.input["birth_date"])
            )
        elif engine_name == "biorhythm":
            input_obj = BiorhythmInput(
                birth_date=date_class.fromisoformat(request.input["birth_date"]),
                target_date=date_class.fromisoformat(request.input.get("target_date", datetime.now().date().isoformat()))
            )
        elif engine_name == "vimshottari":
            input_obj = VimshottariInput(
                birth_date=date_class.fromisoformat(request.input["birth_date"]),
                birth_time=dt_time.fromisoformat(request.input["birth_time"]),
                birth_location=request.input["birth_location"],
                timezone=request.input.get("timezone", "UTC")
            )
        elif engine_name == "tarot":
            input_obj = TarotInput(
                question=request.input["question"],
                spread_type=request.input.get("spread_type", "three_card"),
                birth_date=date_class.fromisoformat(request.input.get("birth_date")) if request.input.get("birth_date") else None
            )
        elif engine_name == "iching":
            input_obj = IChingInput(
                question=request.input["question"],
                method=request.input.get("method", "coins"),
                birth_date=date_class.fromisoformat(request.input.get("birth_date")) if request.input.get("birth_date") else None
            )
        elif engine_name == "gene_keys":
            input_obj = GeneKeysInput(
                birth_date=date_class.fromisoformat(request.input["birth_date"]),
                birth_time=dt_time.fromisoformat(request.input["birth_time"]),
                birth_location=request.input["birth_location"],
                timezone=request.input.get("timezone", "UTC")
            )
        elif engine_name == "enneagram":
            input_obj = EnneagramInput(
                responses=request.input["responses"],
                birth_date=date_class.fromisoformat(request.input.get("birth_date")) if request.input.get("birth_date") else None
            )
        elif engine_name == "sacred_geometry":
            input_obj = SacredGeometryInput(
                birth_date=date_class.fromisoformat(request.input["birth_date"]),
                full_name=request.input["full_name"],
                birth_location=request.input.get("birth_location", (0, 0))
            )
        elif engine_name == "sigil_forge":
            input_obj = SigilForgeInput(
                intention=request.input["intention"],
                method=request.input.get("method", "traditional"),
                birth_date=date_class.fromisoformat(request.input.get("birth_date")) if request.input.get("birth_date") else None
            )
        else:
            raise HTTPException(status_code=400, detail=f"Input model not implemented for {engine_name}")

        # Run the proven engine calculation
        result = engine.calculate(input_obj)

        processing_time = time.time() - start_time

        return EngineResponse(
            success=True,
            data={
                "engine_name": result.engine_name,
                "calculation_time": result.calculation_time,
                "confidence_score": result.confidence_score,
                "field_signature": result.field_signature,
                "formatted_output": result.formatted_output,
                "chart": result.chart.dict() if hasattr(result, 'chart') and result.chart else None,
                "interpretation": result.interpretation if hasattr(result, 'interpretation') else None,
                "recommendations": result.recommendations if hasattr(result, 'recommendations') else None
            },
            processing_time=processing_time,
            timestamp=datetime.utcnow().isoformat(),
            engine=engine_name
        )

    except Exception as e:
        processing_time = time.time() - start_time
        import traceback
        error_details = {
            "error_message": str(e),
            "error_type": type(e).__name__,
            "traceback": traceback.format_exc(),
            "input_data": request.input
        }
        logger.error(f"❌ Engine {engine_name} calculation failed: {error_details}")

        return EngineResponse(
            success=False,
            data=None,
            error=f"{type(e).__name__}: {str(e)}",
            processing_time=processing_time,
            timestamp=datetime.utcnow().isoformat(),
            engine=engine_name
        )

# Engine list endpoint
@app.get("/engines")
async def list_engines():
    """List all available consciousness engines"""
    return {
        "engines": list(engines.keys()),
        "count": len(engines),
        "swiss_ephemeris_available": swiss_ephemeris is not None,
        "service": "witnessos-engines"
    }

# Engine metadata endpoint
@app.get("/engines/{engine_name}/metadata")
async def get_engine_metadata(engine_name: str):
    """Get metadata for a specific consciousness engine"""
    if engine_name not in engines:
        raise HTTPException(
            status_code=404,
            detail=f"Engine '{engine_name}' not found. Available: {list(engines.keys())}"
        )
    
    # Define metadata for each engine
    metadata = {
        "human_design": {
            "name": "Human Design",
            "description": "Comprehensive Human Design bodygraph analysis with type, strategy, authority, and profile",
            "version": "2.5.0",
            "inputs": {
                "birth_date": {"type": "string", "format": "date", "required": True, "description": "Birth date in YYYY-MM-DD format"},
                "birth_time": {"type": "string", "format": "time", "required": True, "description": "Birth time in HH:MM:SS format"},
                "birth_location": {"type": "array", "items": "number", "required": True, "description": "[latitude, longitude] coordinates"},
                "timezone": {"type": "string", "required": False, "default": "UTC", "description": "Timezone identifier"}
            },
            "outputs": ["type", "strategy", "authority", "profile", "centers", "channels", "gates"],
            "calculation_time": "~2-5 seconds",
            "accuracy": "High (Swiss Ephemeris)"
        },
        "numerology": {
            "name": "Numerology",
            "description": "Pythagorean and Chaldean numerology calculations with life path, destiny, and soul urge numbers",
            "version": "2.5.0",
            "inputs": {
                "full_name": {"type": "string", "required": True, "description": "Full birth name"},
                "birth_date": {"type": "string", "format": "date", "required": True, "description": "Birth date in YYYY-MM-DD format"}
            },
            "outputs": ["life_path", "destiny", "soul_urge", "personality", "maturity"],
            "calculation_time": "~0.5-1 seconds",
            "accuracy": "High (Mathematical)"
        },
        "biorhythm": {
            "name": "Biorhythm",
            "description": "Physical, emotional, and intellectual biorhythm cycles with critical days detection",
            "version": "2.5.0",
            "inputs": {
                "birth_date": {"type": "string", "format": "date", "required": True, "description": "Birth date in YYYY-MM-DD format"},
                "target_date": {"type": "string", "format": "date", "required": False, "default": "today", "description": "Target date for calculation"}
            },
            "outputs": ["physical", "emotional", "intellectual", "cycles", "critical_days"],
            "calculation_time": "~0.2-0.5 seconds",
            "accuracy": "High (Mathematical)"
        },
        "vimshottari": {
            "name": "Vimshottari Dasha",
            "description": "Vedic astrology planetary periods and sub-periods analysis",
            "version": "2.5.0",
            "inputs": {
                "birth_date": {"type": "string", "format": "date", "required": True, "description": "Birth date in YYYY-MM-DD format"},
                "birth_time": {"type": "string", "format": "time", "required": True, "description": "Birth time in HH:MM:SS format"},
                "birth_location": {"type": "array", "items": "number", "required": True, "description": "[latitude, longitude] coordinates"},
                "timezone": {"type": "string", "required": False, "default": "UTC", "description": "Timezone identifier"}
            },
            "outputs": ["current_dasha", "sub_periods", "planetary_influences", "timeline"],
            "calculation_time": "~1-3 seconds",
            "accuracy": "High (Swiss Ephemeris)"
        },
        "tarot": {
            "name": "Tarot Reading",
            "description": "Intuitive tarot card readings with multiple spread types",
            "version": "2.5.0",
            "inputs": {
                "question": {"type": "string", "required": True, "description": "Question or intention for the reading"},
                "spread_type": {"type": "string", "required": False, "default": "three_card", "description": "Type of spread (three_card, celtic_cross, etc.)"},
                "birth_date": {"type": "string", "format": "date", "required": False, "description": "Birth date for personalization"}
            },
            "outputs": ["cards", "positions", "interpretation", "guidance"],
            "calculation_time": "~0.5-1 seconds",
            "accuracy": "Intuitive (Symbolic)"
        },
        "iching": {
            "name": "I Ching",
            "description": "Ancient Chinese divination with hexagram generation and interpretation",
            "version": "2.5.0",
            "inputs": {
                "question": {"type": "string", "required": True, "description": "Question or situation to explore"},
                "method": {"type": "string", "required": False, "default": "coins", "description": "Divination method (coins, yarrow, etc.)"},
                "birth_date": {"type": "string", "format": "date", "required": False, "description": "Birth date for personalization"}
            },
            "outputs": ["hexagram", "changing_lines", "interpretation", "guidance"],
            "calculation_time": "~0.5-1 seconds",
            "accuracy": "Intuitive (Symbolic)"
        },
        "gene_keys": {
            "name": "Gene Keys",
            "description": "Gene Keys profile with activation sequence and life themes",
            "version": "2.5.0",
            "inputs": {
                "birth_date": {"type": "string", "format": "date", "required": True, "description": "Birth date in YYYY-MM-DD format"},
                "birth_time": {"type": "string", "format": "time", "required": True, "description": "Birth time in HH:MM:SS format"},
                "birth_location": {"type": "array", "items": "number", "required": True, "description": "[latitude, longitude] coordinates"},
                "timezone": {"type": "string", "required": False, "default": "UTC", "description": "Timezone identifier"}
            },
            "outputs": ["activation_sequence", "life_work", "evolution", "radiance"],
            "calculation_time": "~2-4 seconds",
            "accuracy": "High (Swiss Ephemeris)"
        },
        "enneagram": {
            "name": "Enneagram",
            "description": "Personality type analysis with wings, instincts, and growth paths",
            "version": "2.5.0",
            "inputs": {
                "responses": {"type": "array", "items": "object", "required": True, "description": "Array of question responses"},
                "birth_date": {"type": "string", "format": "date", "required": False, "description": "Birth date for additional insights"}
            },
            "outputs": ["type", "wing", "instinct", "growth_path", "stress_path"],
            "calculation_time": "~1-2 seconds",
            "accuracy": "High (Psychological)"
        },
        "sacred_geometry": {
            "name": "Sacred Geometry",
            "description": "Geometric patterns and mathematical relationships in consciousness",
            "version": "2.5.0",
            "inputs": {
                "birth_date": {"type": "string", "format": "date", "required": True, "description": "Birth date in YYYY-MM-DD format"},
                "full_name": {"type": "string", "required": True, "description": "Full birth name"},
                "birth_location": {"type": "array", "items": "number", "required": False, "default": [0, 0], "description": "[latitude, longitude] coordinates"}
            },
            "outputs": ["geometric_patterns", "mathematical_relationships", "sacred_ratios"],
            "calculation_time": "~1-2 seconds",
            "accuracy": "High (Mathematical)"
        },
        "sigil_forge": {
            "name": "Sigil Forge",
            "description": "Personalized sigil creation for intention manifestation",
            "version": "2.5.0",
            "inputs": {
                "intention": {"type": "string", "required": True, "description": "Clear intention or desire to manifest"},
                "method": {"type": "string", "required": False, "default": "traditional", "description": "Sigil creation method"},
                "birth_date": {"type": "string", "format": "date", "required": False, "description": "Birth date for personalization"}
            },
            "outputs": ["sigil_design", "activation_method", "timing_guidance"],
            "calculation_time": "~0.5-1 seconds",
            "accuracy": "Creative (Symbolic)"
        }
    }
    
    engine_metadata = metadata.get(engine_name, {
        "name": engine_name.replace('_', ' ').title(),
        "description": f"Consciousness analysis engine: {engine_name}",
        "version": "2.5.0",
        "inputs": {},
        "outputs": [],
        "calculation_time": "Variable",
        "accuracy": "High"
    })
    
    return {
        "success": True,
        "engine": engine_name,
        "metadata": engine_metadata,
        "timestamp": datetime.utcnow().isoformat(),
        "service": "witnessos-engines"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

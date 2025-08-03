"""
WitnessOS Divination Engines Package

A modular collection of symbolic computation engines for consciousness debugging,
pattern recognition, and archetypal navigation.

Each engine provides standardized input/output interfaces while honoring the
sacred traditions behind their calculation methods.
"""

from .base.engine_interface import BaseEngine
from .base.data_models import (
    BaseEngineInput,
    BaseEngineOutput,
    EngineError,
    ValidationError
)

# Version info
__version__ = "0.1.0"
__author__ = "The Witness Alchemist & Runtime Architect"
__description__ = "WitnessOS Divination Engines - Modular Symbolic Computation"

# Available engines (will be populated as engines are implemented)
AVAILABLE_ENGINES = []

# Engine registry for dynamic loading
ENGINE_REGISTRY = {}

def register_engine(name: str, engine_class):
    """Register an engine class for dynamic loading."""
    ENGINE_REGISTRY[name] = engine_class
    if name not in AVAILABLE_ENGINES:
        AVAILABLE_ENGINES.append(name)

def get_engine(name: str):
    """Get an engine class by name."""
    if name not in ENGINE_REGISTRY:
        raise EngineError(f"Engine '{name}' not found. Available engines: {AVAILABLE_ENGINES}")
    return ENGINE_REGISTRY[name]

def list_engines():
    """List all available engines."""
    return AVAILABLE_ENGINES.copy()

# Import engines as they become available
# (These imports will be uncommented as engines are implemented)

try:
    from .engines.numerology import NumerologyEngine
    register_engine("numerology", NumerologyEngine)
except ImportError:
    pass

try:
    from .engines.biorhythm import BiorhythmEngine
    register_engine("biorhythm", BiorhythmEngine)
except ImportError:
    pass

# try:
#     from .engines.human_design import HumanDesignEngine
#     register_engine("human_design", HumanDesignEngine)
# except ImportError:
#     pass

# try:
#     from .engines.tarot import TarotEngine
#     register_engine("tarot", TarotEngine)
# except ImportError:
#     pass

# try:
#     from .engines.iching import IChingEngine
#     register_engine("iching", IChingEngine)
# except ImportError:
#     pass

# try:
#     from .engines.gene_keys import GeneKeysEngine
#     register_engine("gene_keys", GeneKeysEngine)
# except ImportError:
#     pass

# try:
#     from .engines.enneagram import EnneagramEngine
#     register_engine("enneagram", EnneagramEngine)
# except ImportError:
#     pass

try:
    from .engines.sacred_geometry import SacredGeometryMapper
    register_engine("sacred_geometry_mapper", SacredGeometryMapper)
except ImportError:
    pass

try:
    from .engines.sigil_forge import SigilForgeSynthesizer
    register_engine("sigil_forge_synthesizer", SigilForgeSynthesizer)
except ImportError:
    pass

# try:
#     from .engines.sigil_forge import SigilForgeEngine
#     register_engine("sigil_forge", SigilForgeEngine)
# except ImportError:
#     pass

# try:
#     from .engines.vimshottari_dasha import VimshottariDashaEngine
#     register_engine("vimshottari_dasha", VimshottariDashaEngine)
# except ImportError:
#     pass

__all__ = [
    "BaseEngine",
    "BaseEngineInput",
    "BaseEngineOutput",
    "EngineError",
    "ValidationError",
    "register_engine",
    "get_engine",
    "list_engines",
    "AVAILABLE_ENGINES",
    "ENGINE_REGISTRY"
]

"""
Individual engine implementations for WitnessOS Divination Engines

Each engine provides specialized divination calculations while inheriting
from the common BaseEngine interface.
"""

# Import available engines
try:
    from .numerology import NumerologyEngine
except ImportError:
    pass

try:
    from .biorhythm import BiorhythmEngine
except ImportError:
    pass

try:
    from .human_design import HumanDesignScanner
except ImportError:
    pass

try:
    from .vimshottari import VimshottariTimelineMapper
except ImportError:
    pass

try:
    from .tarot import TarotSequenceDecoder
except ImportError:
    pass

try:
    from .iching import IChingMutationOracle
except ImportError:
    pass

try:
    from .gene_keys import GeneKeysCompass
except ImportError:
    pass

try:
    from .enneagram import EnneagramResonator
except ImportError:
    pass

try:
    from .sacred_geometry import SacredGeometryMapper
except ImportError:
    pass

try:
    from .sigil_forge import SigilForgeSynthesizer
except ImportError:
    pass

# Future engines to be implemented:
# from .sacred_geometry import SacredGeometryEngine
# from .sigil_forge import SigilForgeEngine

__all__ = [
    "NumerologyEngine",
    "BiorhythmEngine",
    "HumanDesignScanner",
    "VimshottariTimelineMapper",
    "TarotSequenceDecoder",
    "IChingMutationOracle",
    "GeneKeysCompass",
    "EnneagramResonator",
    "SacredGeometryMapper",
    "SigilForgeSynthesizer",
    # Will be populated as more engines are implemented
]

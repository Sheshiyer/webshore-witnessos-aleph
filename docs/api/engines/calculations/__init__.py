"""
Shared calculation modules for WitnessOS Divination Engines

Contains reusable calculation logic that multiple engines can leverage,
avoiding duplication and ensuring consistency.
"""

# Import available calculation modules
try:
    from .numerology import NumerologyCalculator
except ImportError:
    pass

try:
    from .biorhythm import BiorhythmCalculator
except ImportError:
    pass

try:
    from .divination import DivinationCalculator
except ImportError:
    pass

# Examples of future modules:
# from .astrology import SwissEphemerisCalculator
# from .geometry import SacredGeometryCalculator

__all__ = [
    "NumerologyCalculator",
    "BiorhythmCalculator",
    "DivinationCalculator",
    # Will be populated as more modules are implemented
]

"""
Data models for Sacred Geometry Mapper Engine

Defines input/output structures for sacred geometry generation
and consciousness-resonant pattern creation.
"""

from datetime import date
from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field

from shared.base.data_models import BaseEngineInput, BaseEngineOutput


class SacredGeometryInput(BaseEngineInput):
    """Input model for Sacred Geometry Mapper calculations."""
    
    # Core intention and focus
    intention: str = Field(..., description="Intention or focus for the geometric pattern")
    
    # Optional birth data for personalization
    birth_date: Optional[date] = Field(None, description="Birth date for personalized geometry")
    
    # Geometry preferences
    pattern_type: Literal["mandala", "flower_of_life", "sri_yantra", "golden_spiral", "platonic_solid", "vesica_piscis", "personal"] = Field(
        default="personal", 
        description="Type of sacred geometry pattern to generate"
    )
    
    # Mandala-specific parameters
    petal_count: Optional[int] = Field(None, description="Number of petals/divisions for mandala (4-24)", ge=4, le=24)
    layer_count: Optional[int] = Field(None, description="Number of concentric layers (2-8)", ge=2, le=8)
    
    # Spiral parameters
    spiral_turns: Optional[int] = Field(None, description="Number of spiral turns (2-10)", ge=2, le=10)
    
    # Platonic solid selection
    solid_type: Optional[Literal["tetrahedron", "cube", "octahedron", "dodecahedron", "icosahedron"]] = Field(
        None, description="Type of platonic solid"
    )
    
    # Visual parameters
    size: int = Field(default=512, description="Output image size in pixels", ge=256, le=2048)
    color_scheme: Literal["golden", "rainbow", "monochrome", "chakra", "elemental"] = Field(
        default="golden", description="Color scheme for the pattern"
    )
    
    # Advanced options
    include_construction_lines: bool = Field(default=False, description="Include geometric construction lines")
    include_sacred_ratios: bool = Field(default=True, description="Emphasize golden ratio and other sacred proportions")
    meditation_focus: bool = Field(default=True, description="Optimize pattern for meditation and contemplation")


class GeometricPattern(BaseModel):
    """Represents a generated geometric pattern."""
    
    pattern_type: str = Field(..., description="Type of geometric pattern")
    center_point: tuple[float, float] = Field(..., description="Center coordinates of the pattern")
    scale: float = Field(..., description="Scale factor of the pattern")
    elements: List[Dict[str, Any]] = Field(..., description="Geometric elements (circles, lines, polygons)")
    sacred_ratios: Dict[str, float] = Field(..., description="Sacred mathematical ratios present")
    symbolism: str = Field(..., description="Symbolic meaning and interpretation")


class SacredGeometryOutput(BaseEngineOutput):
    """Output model for Sacred Geometry Mapper results."""
    
    # Generated pattern data
    primary_pattern: GeometricPattern = Field(..., description="Main geometric pattern generated")
    construction_geometry: Optional[GeometricPattern] = Field(None, description="Construction lines and guides")
    
    # Pattern analysis
    mathematical_properties: Dict[str, Any] = Field(..., description="Mathematical properties of the pattern")
    sacred_ratios: Dict[str, float] = Field(..., description="Sacred ratios and proportions")
    symmetry_analysis: Dict[str, Any] = Field(..., description="Symmetry properties and group analysis")
    
    # Consciousness resonance
    meditation_points: List[tuple[float, float]] = Field(..., description="Key focal points for meditation")
    energy_flow: Dict[str, Any] = Field(..., description="Energy flow patterns in the geometry")
    chakra_correspondences: Dict[str, str] = Field(..., description="Chakra system correspondences")
    
    # Visual output paths
    image_path: Optional[str] = Field(None, description="Path to generated image file")
    svg_path: Optional[str] = Field(None, description="Path to generated SVG file")
    
    # Interpretation and guidance
    geometric_meaning: str = Field(..., description="Meaning and significance of the generated pattern")
    meditation_guidance: str = Field(..., description="How to use the pattern for meditation")
    manifestation_notes: str = Field(..., description="Notes on using the pattern for manifestation")


class SacredRatio(BaseModel):
    """Represents a sacred mathematical ratio."""
    
    name: str = Field(..., description="Name of the ratio")
    value: float = Field(..., description="Numerical value")
    significance: str = Field(..., description="Spiritual/mathematical significance")
    occurrences: List[str] = Field(..., description="Where this ratio appears in the pattern")


class SymmetryGroup(BaseModel):
    """Represents symmetry properties of a pattern."""
    
    type: str = Field(..., description="Type of symmetry (rotational, reflectional, etc.)")
    order: int = Field(..., description="Order of symmetry")
    axes: List[float] = Field(..., description="Symmetry axes (angles in radians)")
    description: str = Field(..., description="Description of the symmetry properties")


class MeditationPoint(BaseModel):
    """Represents a focal point for meditation."""
    
    coordinates: tuple[float, float] = Field(..., description="X, Y coordinates of the point")
    type: str = Field(..., description="Type of meditation point (center, intersection, etc.)")
    significance: str = Field(..., description="Spiritual significance of this point")
    meditation_technique: str = Field(..., description="Suggested meditation technique for this point")


class EnergyFlow(BaseModel):
    """Represents energy flow patterns in sacred geometry."""
    
    flow_type: str = Field(..., description="Type of energy flow (spiral, radial, etc.)")
    direction: str = Field(..., description="Direction of flow (inward, outward, clockwise, etc.)")
    intensity_points: List[tuple[float, float]] = Field(..., description="Points of high energy intensity")
    description: str = Field(..., description="Description of the energy flow pattern")


# Color scheme definitions
COLOR_SCHEMES = {
    "golden": {
        "primary": "#FFD700",
        "secondary": "#FFA500", 
        "accent": "#FF8C00",
        "background": "#FFF8DC"
    },
    "rainbow": {
        "primary": "#FF0000",
        "secondary": "#00FF00",
        "accent": "#0000FF",
        "background": "#FFFFFF"
    },
    "monochrome": {
        "primary": "#000000",
        "secondary": "#666666",
        "accent": "#333333",
        "background": "#FFFFFF"
    },
    "chakra": {
        "primary": "#8B00FF",  # Crown
        "secondary": "#4B0082", # Third Eye
        "accent": "#0000FF",   # Throat
        "background": "#F0F8FF"
    },
    "elemental": {
        "primary": "#FF4500",  # Fire
        "secondary": "#0080FF", # Water
        "accent": "#228B22",   # Earth
        "background": "#F5F5DC" # Air
    }
}

# Sacred ratio constants
SACRED_RATIOS = {
    "golden_ratio": 1.618033988749,
    "silver_ratio": 2.414213562373,
    "bronze_ratio": 3.302775637732,
    "pi": 3.141592653590,
    "e": 2.718281828459,
    "sqrt_2": 1.414213562373,
    "sqrt_3": 1.732050807569,
    "sqrt_5": 2.236067977500
}

# Platonic solid properties
PLATONIC_SOLIDS = {
    "tetrahedron": {
        "faces": 4,
        "vertices": 4,
        "edges": 6,
        "element": "Fire",
        "meaning": "Transformation and energy"
    },
    "cube": {
        "faces": 6,
        "vertices": 8,
        "edges": 12,
        "element": "Earth",
        "meaning": "Stability and foundation"
    },
    "octahedron": {
        "faces": 8,
        "vertices": 6,
        "edges": 12,
        "element": "Air",
        "meaning": "Balance and harmony"
    },
    "dodecahedron": {
        "faces": 12,
        "vertices": 20,
        "edges": 30,
        "element": "Ether/Spirit",
        "meaning": "Universal consciousness"
    },
    "icosahedron": {
        "faces": 20,
        "vertices": 12,
        "edges": 30,
        "element": "Water",
        "meaning": "Flow and adaptation"
    }
}

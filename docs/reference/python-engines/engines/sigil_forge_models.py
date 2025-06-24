"""
Data models for Sigil Forge Synthesizer Engine

Defines input/output structures for sigil generation from intentions,
including traditional and modern sigil creation methods.
"""

from datetime import date
from typing import Optional, List, Dict, Any, Literal, Tuple
from pydantic import BaseModel, Field

from ..base.data_models import BaseEngineInput, BaseEngineOutput


class SigilForgeInput(BaseEngineInput):
    """Input model for Sigil Forge Synthesizer calculations."""
    
    # Core intention
    intention: str = Field(..., description="The intention statement to convert into a sigil", min_length=3, max_length=500)
    
    # Sigil generation method
    generation_method: Literal["traditional", "geometric", "hybrid", "personal"] = Field(
        default="traditional", 
        description="Method for generating the sigil"
    )
    
    # Traditional method options
    letter_elimination: bool = Field(default=True, description="Use traditional letter elimination method")
    connection_style: Literal["sequential", "star", "web", "organic"] = Field(
        default="sequential", description="How to connect letter-derived points"
    )
    
    # Geometric method options
    sacred_geometry: Optional[Literal["triangle", "square", "pentagon", "hexagon", "circle", "auto"]] = Field(
        None, description="Sacred geometry base for geometric method"
    )
    
    # Personal customization
    birth_date: Optional[date] = Field(None, description="Birth date for personal sigil customization")
    personal_symbols: Optional[List[str]] = Field(None, description="Personal symbols to incorporate")
    
    # Visual styling
    style: Literal["minimal", "ornate", "organic", "geometric", "mystical"] = Field(
        default="minimal", description="Visual style of the sigil"
    )
    
    size: int = Field(default=512, description="Output image size in pixels", ge=256, le=2048)
    
    color_scheme: Literal["black_white", "golden", "silver", "red", "blue", "purple", "custom"] = Field(
        default="black_white", description="Color scheme for the sigil"
    )
    
    # Advanced options
    include_border: bool = Field(default=False, description="Include decorative border")
    add_activation_symbols: bool = Field(default=True, description="Add traditional activation symbols")
    optimize_for_meditation: bool = Field(default=True, description="Optimize design for meditation focus")
    
    # Charging and activation
    charging_method: Optional[Literal["visualization", "elemental", "planetary", "personal"]] = Field(
        None, description="Suggested charging method for the sigil"
    )


class SigilElement(BaseModel):
    """Represents a single element in the sigil."""
    
    element_type: str = Field(..., description="Type of element (line, curve, circle, symbol)")
    start_point: Tuple[float, float] = Field(..., description="Starting coordinates (0-1 normalized)")
    end_point: Tuple[float, float] = Field(..., description="Ending coordinates (0-1 normalized)")
    control_points: List[Tuple[float, float]] = Field(default=[], description="Control points for curves")
    properties: Dict[str, Any] = Field(default={}, description="Visual properties (weight, style, etc.)")


class SigilComposition(BaseModel):
    """Represents the complete sigil composition."""
    
    elements: List[SigilElement] = Field(..., description="All elements that make up the sigil")
    center_point: Tuple[float, float] = Field(..., description="Center point of the composition")
    bounding_box: Tuple[float, float, float, float] = Field(..., description="Bounding box (x1, y1, x2, y2)")
    symmetry_type: str = Field(..., description="Type of symmetry in the composition")
    intention_hash: str = Field(..., description="Hash of the original intention")


class SigilAnalysis(BaseModel):
    """Analysis of the generated sigil's properties."""
    
    complexity_score: float = Field(..., description="Complexity score (0-1)")
    balance_score: float = Field(..., description="Visual balance score (0-1)")
    symmetry_score: float = Field(..., description="Symmetry score (0-1)")
    element_count: int = Field(..., description="Total number of elements")
    dominant_shapes: List[str] = Field(..., description="Most prominent shapes in the sigil")
    energy_flow: str = Field(..., description="Perceived energy flow pattern")


class ActivationGuidance(BaseModel):
    """Guidance for activating and using the sigil."""
    
    charging_instructions: str = Field(..., description="How to charge the sigil")
    meditation_technique: str = Field(..., description="Meditation technique for the sigil")
    placement_suggestions: List[str] = Field(..., description="Where to place or use the sigil")
    timing_recommendations: str = Field(..., description="Best times to work with the sigil")
    destruction_guidance: str = Field(..., description="When and how to destroy the sigil")


class SigilForgeOutput(BaseEngineOutput):
    """Output model for Sigil Forge Synthesizer results."""
    
    # Generated sigil data
    sigil_composition: SigilComposition = Field(..., description="The complete sigil composition")
    
    # Analysis
    sigil_analysis: SigilAnalysis = Field(..., description="Analysis of the sigil's properties")
    
    # Generation details
    method_used: str = Field(..., description="Method used to generate the sigil")
    unique_letters: str = Field(..., description="Unique letters extracted from intention")
    letter_numbers: List[int] = Field(..., description="Numerical values of letters")
    
    # Visual output paths
    image_path: Optional[str] = Field(None, description="Path to generated image file")
    svg_path: Optional[str] = Field(None, description="Path to generated SVG file")
    
    # Activation and usage
    activation_guidance: ActivationGuidance = Field(..., description="How to activate and use the sigil")
    
    # Mystical interpretation
    symbolic_meaning: str = Field(..., description="Symbolic meaning of the generated sigil")
    elemental_correspondences: Dict[str, str] = Field(..., description="Elemental associations")
    planetary_influences: Dict[str, str] = Field(..., description="Planetary correspondences")


# Sigil generation methods
GENERATION_METHODS = {
    "traditional": {
        "name": "Traditional Letter Elimination",
        "description": "Classic method using letter elimination and geometric connection",
        "best_for": "General intentions and manifestation work"
    },
    "geometric": {
        "name": "Sacred Geometry Base",
        "description": "Uses sacred geometric forms as the foundation",
        "best_for": "Spiritual work and consciousness expansion"
    },
    "hybrid": {
        "name": "Hybrid Approach",
        "description": "Combines traditional and geometric methods",
        "best_for": "Complex intentions requiring multiple approaches"
    },
    "personal": {
        "name": "Personalized Sigil",
        "description": "Incorporates personal birth data and symbols",
        "best_for": "Individual spiritual practice and personal development"
    }
}

# Visual styles
VISUAL_STYLES = {
    "minimal": {
        "description": "Clean, simple lines with minimal decoration",
        "characteristics": ["thin_lines", "sparse_elements", "geometric_precision"]
    },
    "ornate": {
        "description": "Rich decoration with elaborate details",
        "characteristics": ["thick_lines", "decorative_elements", "complex_patterns"]
    },
    "organic": {
        "description": "Flowing, natural curves and shapes",
        "characteristics": ["curved_lines", "natural_flow", "asymmetric_balance"]
    },
    "geometric": {
        "description": "Sharp angles and precise geometric forms",
        "characteristics": ["angular_lines", "geometric_shapes", "mathematical_precision"]
    },
    "mystical": {
        "description": "Esoteric symbols and mystical elements",
        "characteristics": ["symbolic_elements", "mystical_symbols", "spiritual_geometry"]
    }
}

# Color schemes
COLOR_SCHEMES = {
    "black_white": {
        "primary": "#000000",
        "secondary": "#FFFFFF",
        "accent": "#666666",
        "background": "#FFFFFF"
    },
    "golden": {
        "primary": "#FFD700",
        "secondary": "#FFA500",
        "accent": "#FF8C00",
        "background": "#000000"
    },
    "silver": {
        "primary": "#C0C0C0",
        "secondary": "#A9A9A9",
        "accent": "#808080",
        "background": "#000000"
    },
    "red": {
        "primary": "#DC143C",
        "secondary": "#B22222",
        "accent": "#8B0000",
        "background": "#000000"
    },
    "blue": {
        "primary": "#4169E1",
        "secondary": "#0000CD",
        "accent": "#000080",
        "background": "#000000"
    },
    "purple": {
        "primary": "#8A2BE2",
        "secondary": "#9400D3",
        "accent": "#4B0082",
        "background": "#000000"
    }
}

# Elemental correspondences
ELEMENTAL_CORRESPONDENCES = {
    "fire": {
        "shapes": ["triangle", "angular", "pointed"],
        "energy": "active, transformative, passionate",
        "colors": ["red", "orange", "yellow"],
        "direction": "upward, expanding"
    },
    "water": {
        "shapes": ["circle", "curved", "flowing"],
        "energy": "receptive, emotional, intuitive",
        "colors": ["blue", "silver", "white"],
        "direction": "downward, contracting"
    },
    "air": {
        "shapes": ["line", "spiral", "scattered"],
        "energy": "mental, communicative, swift",
        "colors": ["yellow", "white", "light_blue"],
        "direction": "horizontal, dispersing"
    },
    "earth": {
        "shapes": ["square", "stable", "grounded"],
        "energy": "stable, practical, nurturing",
        "colors": ["green", "brown", "black"],
        "direction": "centered, solid"
    }
}

# Planetary influences
PLANETARY_INFLUENCES = {
    "sun": {
        "energy": "vitality, leadership, success",
        "symbols": ["circle", "dot", "radial"],
        "best_for": "confidence, authority, achievement"
    },
    "moon": {
        "energy": "intuition, emotions, cycles",
        "symbols": ["crescent", "circle", "curved"],
        "best_for": "psychic work, emotional healing, cycles"
    },
    "mercury": {
        "energy": "communication, intellect, travel",
        "symbols": ["lines", "connections", "networks"],
        "best_for": "learning, communication, quick results"
    },
    "venus": {
        "energy": "love, beauty, harmony",
        "symbols": ["curves", "hearts", "spirals"],
        "best_for": "relationships, artistic work, attraction"
    },
    "mars": {
        "energy": "action, courage, conflict",
        "symbols": ["arrows", "angles", "sharp"],
        "best_for": "courage, protection, overcoming obstacles"
    },
    "jupiter": {
        "energy": "expansion, wisdom, abundance",
        "symbols": ["large_forms", "crosses", "expansion"],
        "best_for": "growth, learning, prosperity"
    },
    "saturn": {
        "energy": "structure, discipline, limitation",
        "symbols": ["squares", "boundaries", "restriction"],
        "best_for": "discipline, long-term goals, banishing"
    }
}

# Charging methods
CHARGING_METHODS = {
    "visualization": {
        "description": "Charge through focused visualization and intent",
        "instructions": "Hold the sigil while visualizing your intention manifesting",
        "duration": "10-20 minutes daily until goal is achieved"
    },
    "elemental": {
        "description": "Charge using elemental energies",
        "instructions": "Expose to corresponding element (fire, water, air, earth)",
        "duration": "One full day/night cycle with chosen element"
    },
    "planetary": {
        "description": "Charge during specific planetary hours",
        "instructions": "Work with sigil during hours ruled by corresponding planet",
        "duration": "Multiple sessions during appropriate planetary hours"
    },
    "personal": {
        "description": "Charge using personal energy and meditation",
        "instructions": "Meditate with sigil, breathing your intention into it",
        "duration": "Until you feel the sigil is 'alive' with energy"
    }
}

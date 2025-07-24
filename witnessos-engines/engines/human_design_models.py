"""
Data models for Human Design Scanner Engine

Defines input/output structures and Human Design specific data types.
"""

from datetime import datetime, date, time
from typing import Optional, Dict, List, Tuple, Any, Union
from pydantic import BaseModel, Field, field_validator
from shared.base.data_models import BaseEngineInput, BaseEngineOutput, BirthDataInput


def geocode_location(location_name: str) -> Tuple[float, float]:
    """Convert location name to coordinates using a simple mapping."""
    # Simple geocoding mapping for common locations
    location_map = {
        "bangalore, india": (12.9716, 77.5946),
        "mumbai, india": (19.0760, 72.8777),
        "delhi, india": (28.7041, 77.1025),
        "new york, usa": (40.7128, -74.0060),
        "london, uk": (51.5074, -0.1278),
        "paris, france": (48.8566, 2.3522),
        "tokyo, japan": (35.6762, 139.6503),
        "sydney, australia": (-33.8688, 151.2093),
        "los angeles, usa": (34.0522, -118.2437),
        "toronto, canada": (43.6532, -79.3832)
    }
    
    normalized_location = location_name.lower().strip()
    if normalized_location in location_map:
        return location_map[normalized_location]
    
    # If not found, try to extract coordinates from common formats
    # This is a fallback - in production, you'd use a real geocoding service
    raise ValueError(f"Location '{location_name}' not found. Please provide coordinates as [latitude, longitude] or use a supported city name.")


class HumanDesignInput(BaseEngineInput, BirthDataInput):
    """Input model for Human Design calculations."""

    # Birth data is required for Human Design
    birth_time: time = Field(..., description="Exact birth time is required for Human Design")
    birth_location: Union[Tuple[float, float], str] = Field(..., description="Birth location as coordinates [lat, lon] or city name")
    timezone: str = Field(..., description="Birth timezone (e.g., 'America/New_York')")

    # Optional preferences
    include_design_calculation: bool = Field(default=True, description="Include Design (88 days before) calculation")
    detailed_gates: bool = Field(default=True, description="Include detailed gate information")

    @field_validator('birth_time')
    @classmethod
    def validate_birth_time(cls, v):
        if v is None:
            raise ValueError("Birth time is required for Human Design calculations")
        return v

    @field_validator('birth_location')
    @classmethod
    def validate_birth_location(cls, v):
        if v is None:
            raise ValueError("Birth location is required for Human Design calculations")
        
        # Handle string location names
        if isinstance(v, str):
            try:
                lat, lon = geocode_location(v)
                return (lat, lon)
            except ValueError as e:
                raise ValueError(str(e))
        
        # Handle coordinate tuples
        if isinstance(v, (tuple, list)) and len(v) == 2:
            lat, lon = float(v[0]), float(v[1])
            if not (-90 <= lat <= 90):
                raise ValueError("Latitude must be between -90 and 90")
            if not (-180 <= lon <= 180):
                raise ValueError("Longitude must be between -180 and 180")
            return (lat, lon)
        
        raise ValueError("Birth location must be either a string (city name) or coordinates [latitude, longitude]")


class HumanDesignGate(BaseModel):
    """Represents a Human Design gate with its properties."""

    number: int = Field(..., ge=1, le=64, description="Gate number (1-64)")
    name: str = Field(..., description="Gate name/title")
    planet: str = Field(..., description="Activating planet")
    line: int = Field(..., ge=1, le=6, description="Line number (1-6)")
    color: int = Field(..., ge=1, le=6, description="Color (1-6)")
    tone: int = Field(..., ge=1, le=6, description="Tone (1-6)")
    base: int = Field(..., ge=1, le=5, description="Base (1-5)")

    # Interpretive information
    keynote: str = Field(default="", description="Gate keynote/theme")
    description: str = Field(default="", description="Gate description")
    gift: str = Field(default="", description="Gate gift/potential")
    shadow: str = Field(default="", description="Gate shadow/challenge")


class HumanDesignCenter(BaseModel):
    """Represents a Human Design center with its properties."""

    name: str = Field(..., description="Center name")
    defined: bool = Field(..., description="Whether center is defined")
    gates: List[int] = Field(default_factory=list, description="Active gates in this center")

    # Center properties
    function: str = Field(default="", description="Center function/purpose")
    when_defined: str = Field(default="", description="Qualities when defined")
    when_undefined: str = Field(default="", description="Qualities when undefined")


class HumanDesignProfile(BaseModel):
    """Represents a Human Design profile (personality/design line combination)."""

    personality_line: int = Field(..., ge=1, le=6, description="Personality line (1-6)")
    design_line: int = Field(..., ge=1, le=6, description="Design line (1-6)")
    profile_name: str = Field(..., description="Profile name (e.g., '1/3 Investigator/Martyr')")
    description: str = Field(default="", description="Profile description")
    life_theme: str = Field(default="", description="Life theme")
    role: str = Field(default="", description="Life role")


class HumanDesignType(BaseModel):
    """Represents a Human Design type with strategy and authority."""

    type_name: str = Field(..., description="Type name (Generator, Projector, Manifestor, Reflector)")
    strategy: str = Field(..., description="Type strategy")
    authority: str = Field(..., description="Inner authority")
    signature: str = Field(..., description="Signature emotion")
    not_self: str = Field(..., description="Not-self emotion")

    # Type characteristics
    percentage: float = Field(..., description="Percentage of population")
    description: str = Field(default="", description="Type description")
    life_purpose: str = Field(default="", description="Life purpose")


class HumanDesignChart(BaseModel):
    """Complete Human Design chart data."""

    # Basic information
    type_info: HumanDesignType
    profile: HumanDesignProfile

    # Gates and centers
    personality_gates: Dict[str, HumanDesignGate] = Field(default_factory=dict)
    design_gates: Dict[str, HumanDesignGate] = Field(default_factory=dict)
    centers: Dict[str, HumanDesignCenter] = Field(default_factory=dict)

    # Channels and definitions
    defined_channels: List[str] = Field(default_factory=list, description="Defined channels")
    definition_type: str = Field(default="", description="Definition type (Single, Split, etc.)")

    # Additional data
    incarnation_cross: Dict[str, Any] = Field(default_factory=dict, description="Incarnation cross data")
    variables: Dict[str, str] = Field(default_factory=dict, description="PHS variables")


class HumanDesignOutput(BaseEngineOutput):
    """Output model for Human Design Scanner."""

    # Core chart data
    chart: HumanDesignChart = Field(..., description="Complete Human Design chart")

    # Calculation metadata
    birth_info: Dict[str, Any] = Field(default_factory=dict, description="Birth data used")
    design_info: Dict[str, Any] = Field(default_factory=dict, description="Design calculation data")

    # Interpretive sections
    type_analysis: str = Field(default="", description="Type-specific analysis")
    profile_analysis: str = Field(default="", description="Profile analysis")
    centers_analysis: str = Field(default="", description="Centers analysis")
    gates_analysis: str = Field(default="", description="Gates analysis")

    # Guidance sections
    strategy_guidance: str = Field(default="", description="Strategy guidance")
    authority_guidance: str = Field(default="", description="Authority guidance")
    deconditioning_guidance: str = Field(default="", description="Deconditioning guidance")


# Human Design reference data structures

HUMAN_DESIGN_TYPES = {
    "Generator": {
        "strategy": "To Respond",
        "authority": "Sacral Authority",
        "signature": "Satisfaction",
        "not_self": "Frustration",
        "percentage": 70.0,
        "description": "The life force of the planet, designed to build and create",
        "life_purpose": "To master something they love and find satisfaction in their work"
    },
    "Manifesting Generator": {
        "strategy": "To Respond",
        "authority": "Sacral Authority",
        "signature": "Satisfaction",
        "not_self": "Frustration",
        "percentage": 33.0,
        "description": "Multi-passionate builders with the ability to manifest quickly",
        "life_purpose": "To respond and then inform, creating efficiently"
    },
    "Projector": {
        "strategy": "Wait for Invitation",
        "authority": "Various (Splenic, Emotional, Ego, Self-Projected, Mental)",
        "signature": "Success",
        "not_self": "Bitterness",
        "percentage": 20.0,
        "description": "Natural guides and leaders, designed to see the bigger picture",
        "life_purpose": "To guide others and be recognized for their wisdom"
    },
    "Manifestor": {
        "strategy": "To Inform",
        "authority": "Emotional or Splenic",
        "signature": "Peace",
        "not_self": "Anger",
        "percentage": 9.0,
        "description": "Initiators and catalysts, designed to start things",
        "life_purpose": "To initiate and impact others through their actions"
    },
    "Reflector": {
        "strategy": "Wait a Lunar Cycle",
        "authority": "Lunar Authority",
        "signature": "Surprise",
        "not_self": "Disappointment",
        "percentage": 1.0,
        "description": "Mirrors of the community, designed to reflect the health of their environment",
        "life_purpose": "To reflect the health of their community and environment"
    }
}

HUMAN_DESIGN_CENTERS = {
    "Head": {
        "function": "Inspiration and mental pressure",
        "when_defined": "Consistent mental pressure and inspiration",
        "when_undefined": "Amplifies and reflects mental pressure from others"
    },
    "Ajna": {
        "function": "Conceptualization and mental processing",
        "when_defined": "Fixed way of thinking and processing information",
        "when_undefined": "Flexible thinking, takes in and amplifies others' thoughts"
    },
    "Throat": {
        "function": "Communication and manifestation",
        "when_defined": "Consistent voice and ability to communicate",
        "when_undefined": "Amplifies others' communication, speaks when prompted"
    },
    "G": {
        "function": "Identity, direction, and love",
        "when_defined": "Fixed sense of self and direction",
        "when_undefined": "Flexible identity, seeks direction from others"
    },
    "Heart": {
        "function": "Willpower and ego",
        "when_defined": "Consistent willpower and self-worth",
        "when_undefined": "Amplifies others' willpower, proves self-worth"
    },
    "Sacral": {
        "function": "Life force and sexuality",
        "when_defined": "Consistent life force energy and fertility",
        "when_undefined": "No consistent life force, amplifies others' energy"
    },
    "Solar Plexus": {
        "function": "Emotions and feelings",
        "when_defined": "Emotional wave and authority",
        "when_undefined": "Amplifies and takes on others' emotions"
    },
    "Spleen": {
        "function": "Intuition, health, and survival",
        "when_defined": "Consistent intuitive awareness",
        "when_undefined": "Amplifies others' fears and intuitions"
    },
    "Root": {
        "function": "Pressure and drive",
        "when_defined": "Consistent pressure and drive",
        "when_undefined": "Amplifies others' pressure and stress"
    }
}

PROFILE_LINES = {
    1: {"name": "Investigator", "description": "Foundation, introspection, security"},
    2: {"name": "Hermit", "description": "Natural talent, projection, being called out"},
    3: {"name": "Martyr", "description": "Trial and error, experimentation, discovery"},
    4: {"name": "Opportunist", "description": "Network, friendship, influence"},
    5: {"name": "Heretic", "description": "Projection, universalization, practical solutions"},
    6: {"name": "Role Model", "description": "Transition, objectivity, wisdom"}
}

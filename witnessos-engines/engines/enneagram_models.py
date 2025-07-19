"""
Data models for Enneagram Resonator Engine

Defines input/output structures and Enneagram-specific data types.
"""

from typing import Optional, Dict, List, Any, Literal
from pydantic import BaseModel, Field, field_validator
from shared.base.data_models import BaseEngineOutput, BaseEngineInput


class EnneagramWing(BaseModel):
    """Represents an Enneagram wing influence."""
    
    name: str = Field(..., description="Wing name (e.g., '1w9 - The Idealist')")
    description: str = Field(..., description="Wing description")
    traits: List[str] = Field(default_factory=list, description="Wing traits")


class EnneagramArrow(BaseModel):
    """Represents integration or disintegration arrow."""
    
    direction: int = Field(..., ge=1, le=9, description="Target type number")
    name: str = Field(..., description="Arrow name")
    description: str = Field(..., description="Arrow description")
    traits: List[str] = Field(default_factory=list, description="Traits when moving in this direction")


class InstinctualVariant(BaseModel):
    """Represents an instinctual variant."""
    
    name: str = Field(..., description="Variant name")
    description: str = Field(..., description="Variant description")
    traits: List[str] = Field(default_factory=list, description="Variant traits")


class EnneagramType(BaseModel):
    """Represents a complete Enneagram type."""
    
    number: int = Field(..., ge=1, le=9, description="Type number (1-9)")
    name: str = Field(..., description="Primary type name")
    alternative_names: List[str] = Field(default_factory=list, description="Alternative names")
    center: Literal["Body", "Heart", "Head"] = Field(..., description="Center of intelligence")
    
    # Core dynamics
    core_motivation: str = Field(..., description="Core motivation")
    core_fear: str = Field(..., description="Core fear")
    core_desire: str = Field(..., description="Core desire")
    basic_proposition: str = Field(..., description="Basic proposition")
    
    # Traditional Enneagram elements
    vice: str = Field(..., description="Vice/passion")
    virtue: str = Field(..., description="Virtue")
    passion: str = Field(..., description="Emotional passion")
    fixation: str = Field(..., description="Mental fixation")
    holy_idea: str = Field(..., description="Holy idea")
    trap: str = Field(..., description="Trap")
    
    # Wings and arrows
    wings: Dict[str, EnneagramWing] = Field(default_factory=dict, description="Wing influences")
    arrows: Dict[str, EnneagramArrow] = Field(default_factory=dict, description="Integration/disintegration arrows")
    
    # Instinctual variants
    instinctual_variants: Dict[str, InstinctualVariant] = Field(
        default_factory=dict, 
        description="Instinctual variants"
    )
    
    # Development and growth
    levels_of_development: Dict[str, Dict[str, str]] = Field(
        default_factory=dict,
        description="Levels of development"
    )
    growth_recommendations: List[str] = Field(
        default_factory=list,
        description="Growth recommendations"
    )
    
    keywords: List[str] = Field(default_factory=list, description="Key descriptive words")


class EnneagramCenter(BaseModel):
    """Represents one of the three centers of intelligence."""
    
    name: str = Field(..., description="Center name")
    types: List[int] = Field(..., description="Types in this center")
    core_emotion: str = Field(..., description="Core emotion of this center")
    focus: str = Field(..., description="Primary focus")
    description: str = Field(..., description="Center description")


class EnneagramProfile(BaseModel):
    """Complete Enneagram profile for an individual."""
    
    primary_type: EnneagramType = Field(..., description="Primary type")
    wing: Optional[EnneagramWing] = Field(None, description="Dominant wing")
    instinctual_variant: Optional[InstinctualVariant] = Field(None, description="Primary instinctual variant")
    
    # Current state analysis
    integration_direction: Optional[EnneagramArrow] = Field(None, description="Integration arrow")
    disintegration_direction: Optional[EnneagramArrow] = Field(None, description="Disintegration arrow")
    current_level: Optional[int] = Field(None, ge=1, le=9, description="Current level of development")
    
    # Center analysis
    center: EnneagramCenter = Field(..., description="Center of intelligence")
    
    # Assessment results
    assessment_confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence in type identification")
    secondary_types: List[int] = Field(default_factory=list, description="Other possible types")


class EnneagramInput(BaseEngineInput):
    """Input model for Enneagram Resonator."""
    
    # Type identification method
    identification_method: Literal["assessment", "self_select", "intuitive"] = Field(
        default="assessment",
        description="Method for type identification"
    )
    
    # For assessment method
    assessment_responses: Optional[Dict[str, str]] = Field(
        None,
        description="Responses to assessment questions"
    )
    
    # For self-selection method
    selected_type: Optional[int] = Field(
        None,
        ge=1,
        le=9,
        description="Self-selected type number"
    )
    
    # For intuitive method
    behavioral_description: Optional[str] = Field(
        None,
        description="Description of behavioral patterns"
    )
    
    # Analysis preferences
    include_wings: bool = Field(
        default=True,
        description="Include wing analysis"
    )
    
    include_instincts: bool = Field(
        default=True,
        description="Include instinctual variant analysis"
    )
    
    include_arrows: bool = Field(
        default=True,
        description="Include integration/disintegration analysis"
    )
    
    focus_area: Optional[Literal["growth", "relationships", "career", "spirituality"]] = Field(
        None,
        description="Specific area to focus analysis on"
    )
    
    @field_validator('identification_method')
    @classmethod
    def validate_identification_method(cls, v):
        valid_methods = ["assessment", "self_select", "intuitive"]
        if v not in valid_methods:
            raise ValueError(f"Identification method must be one of: {valid_methods}")
        return v
    
    @field_validator('assessment_responses')
    @classmethod
    def validate_assessment_responses(cls, v, info):
        if info.data.get('identification_method') == 'assessment' and not v:
            raise ValueError("Assessment responses required when using assessment method")
        return v
    
    @field_validator('selected_type')
    @classmethod
    def validate_selected_type(cls, v, info):
        if info.data.get('identification_method') == 'self_select' and not v:
            raise ValueError("Selected type required when using self-selection method")
        return v


class EnneagramOutput(BaseEngineOutput):
    """Output model for Enneagram Resonator."""
    
    # The base class provides: engine_name, calculation_time, confidence_score, 
    # timestamp, raw_data, formatted_output, recommendations, field_signature, 
    # reality_patches, archetypal_themes
    
    # Additional Enneagram-specific fields can be accessed via raw_data
    # This keeps the model simple and compatible with the base engine interface


# Enneagram data structure for loading
class EnneagramData(BaseModel):
    """Complete Enneagram data definition."""
    
    enneagram_info: Dict[str, Any] = Field(..., description="Enneagram metadata")
    types: Dict[str, Dict[str, Any]] = Field(..., description="All 9 types")
    centers: Dict[str, Dict[str, Any]] = Field(..., description="Three centers")
    assessment_questions: List[Dict[str, Any]] = Field(..., description="Assessment questions")


# Export all models
__all__ = [
    "EnneagramWing",
    "EnneagramArrow",
    "InstinctualVariant",
    "EnneagramType",
    "EnneagramCenter",
    "EnneagramProfile",
    "EnneagramInput",
    "EnneagramOutput",
    "EnneagramData"
]

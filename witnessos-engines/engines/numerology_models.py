"""
Data models for the Numerology Field Extractor engine

Defines the specific input and output structures for numerology calculations
while inheriting from the base WitnessOS engine models.
"""

from datetime import date
from typing import Optional, Dict, List, Any
from pydantic import Field, field_validator

from shared.base.data_models import BaseEngineInput, BaseEngineOutput


class NumerologyInput(BaseEngineInput):
    """Input model for numerology calculations."""
    
    full_name: str = Field(..., min_length=1, description="Complete birth name as it appears on birth certificate")
    birth_date: date = Field(..., description="Date of birth")
    preferred_name: Optional[str] = Field(None, description="Name currently used (optional)")
    system: str = Field(default="pythagorean", description="Numerology system to use")
    current_year: Optional[int] = Field(None, description="Year for personal year calculation (defaults to current year)")
    
    @field_validator('full_name')
    @classmethod
    def validate_full_name(cls, v):
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        # Ensure name contains at least some letters
        if not any(c.isalpha() for c in v):
            raise ValueError("Name must contain at least one letter")
        return v.strip()
    
    @field_validator('system')
    @classmethod
    def validate_system(cls, v):
        valid_systems = ["pythagorean", "chaldean"]
        if v.lower() not in valid_systems:
            raise ValueError(f"System must be one of: {valid_systems}")
        return v.lower()
    
    @field_validator('current_year')
    @classmethod
    def validate_current_year(cls, v):
        if v is not None:
            current_year = date.today().year
            if v < 1900 or v > current_year + 10:
                raise ValueError(f"Year must be between 1900 and {current_year + 10}")
        return v
    
    @field_validator('birth_date')
    @classmethod
    def validate_birth_date(cls, v):
        current_date = date.today()
        if v > current_date:
            raise ValueError("Birth date cannot be in the future")
        if v.year < 1900:
            raise ValueError("Birth year must be 1900 or later")
        return v


class NumerologyOutput(BaseEngineOutput):
    """Output model for numerology calculations."""
    
    # Core numerology numbers
    life_path: int = Field(..., description="Life Path number")
    expression: int = Field(..., description="Expression (Destiny) number")
    soul_urge: int = Field(..., description="Soul Urge (Heart's Desire) number")
    personality: int = Field(..., description="Personality number")
    
    # Additional numbers
    maturity: int = Field(..., description="Maturity number")
    personal_year: int = Field(..., description="Personal Year number")
    
    # Bridge numbers
    life_expression_bridge: int = Field(..., description="Bridge between Life Path and Expression")
    soul_personality_bridge: int = Field(..., description="Bridge between Soul Urge and Personality")
    
    # Special numbers
    master_numbers: List[int] = Field(default_factory=list, description="Master numbers found in profile")
    karmic_debt: List[int] = Field(default_factory=list, description="Karmic debt numbers identified")
    
    # System and metadata
    numerology_system: str = Field(..., description="Numerology system used")
    calculation_year: int = Field(..., description="Year used for personal year calculation")
    
    # Name analysis
    name_breakdown: Dict[str, Any] = Field(default_factory=dict, description="Detailed name analysis")
    
    # Interpretations
    core_meanings: Dict[str, str] = Field(default_factory=dict, description="Meanings of core numbers")
    yearly_guidance: str = Field(default="", description="Guidance for the personal year")
    life_purpose: str = Field(default="", description="Life purpose based on Life Path")
    
    # Compatibility and relationships
    compatibility_notes: List[str] = Field(default_factory=list, description="Relationship compatibility insights")
    
    # Timing and cycles
    favorable_periods: List[str] = Field(default_factory=list, description="Favorable time periods")
    challenge_periods: List[str] = Field(default_factory=list, description="Challenging time periods")


class NumerologyCompatibilityInput(BaseEngineInput):
    """Input model for numerology compatibility calculations."""
    
    person1_name: str = Field(..., min_length=1, description="First person's full name")
    person1_birth_date: date = Field(..., description="First person's birth date")
    person2_name: str = Field(..., min_length=1, description="Second person's full name")
    person2_birth_date: date = Field(..., description="Second person's birth date")
    relationship_type: str = Field(default="romantic", description="Type of relationship to analyze")
    system: str = Field(default="pythagorean", description="Numerology system to use")
    
    @field_validator('person1_name', 'person2_name')
    @classmethod
    def validate_names(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        if not any(c.isalpha() for c in v):
            raise ValueError("Name must contain at least one letter")
        return v.strip()
    
    @field_validator('relationship_type')
    @classmethod
    def validate_relationship_type(cls, v):
        valid_types = ["romantic", "friendship", "business", "family", "general"]
        if v.lower() not in valid_types:
            raise ValueError(f"Relationship type must be one of: {valid_types}")
        return v.lower()
    
    @field_validator('system')
    @classmethod
    def validate_system(cls, v):
        valid_systems = ["pythagorean", "chaldean"]
        if v.lower() not in valid_systems:
            raise ValueError(f"System must be one of: {valid_systems}")
        return v.lower()


class NumerologyCompatibilityOutput(BaseEngineOutput):
    """Output model for numerology compatibility analysis."""
    
    # Individual profiles
    person1_profile: Dict[str, Any] = Field(default_factory=dict, description="First person's numerology profile")
    person2_profile: Dict[str, Any] = Field(default_factory=dict, description="Second person's numerology profile")
    
    # Compatibility scores
    overall_compatibility: float = Field(..., ge=0.0, le=1.0, description="Overall compatibility score (0-1)")
    life_path_compatibility: float = Field(..., ge=0.0, le=1.0, description="Life Path compatibility")
    expression_compatibility: float = Field(..., ge=0.0, le=1.0, description="Expression compatibility")
    soul_urge_compatibility: float = Field(..., ge=0.0, le=1.0, description="Soul Urge compatibility")
    
    # Relationship dynamics
    strengths: List[str] = Field(default_factory=list, description="Relationship strengths")
    challenges: List[str] = Field(default_factory=list, description="Potential challenges")
    growth_opportunities: List[str] = Field(default_factory=list, description="Opportunities for growth")
    
    # Timing and cycles
    favorable_periods: List[str] = Field(default_factory=list, description="Favorable periods for the relationship")
    challenging_periods: List[str] = Field(default_factory=list, description="Challenging periods to navigate")
    
    # Guidance
    relationship_guidance: str = Field(default="", description="Overall relationship guidance")
    communication_tips: List[str] = Field(default_factory=list, description="Communication recommendations")
    
    # Metadata
    relationship_type: str = Field(..., description="Type of relationship analyzed")
    numerology_system: str = Field(..., description="Numerology system used")


# Quick validation functions

def validate_numerology_input(data: Dict[str, Any]) -> NumerologyInput:
    """Validate and create NumerologyInput from dictionary."""
    return NumerologyInput(**data)


def validate_compatibility_input(data: Dict[str, Any]) -> NumerologyCompatibilityInput:
    """Validate and create NumerologyCompatibilityInput from dictionary."""
    return NumerologyCompatibilityInput(**data)


# Export all models
__all__ = [
    "NumerologyInput",
    "NumerologyOutput", 
    "NumerologyCompatibilityInput",
    "NumerologyCompatibilityOutput",
    "validate_numerology_input",
    "validate_compatibility_input"
]

"""
Data models for I-Ching Mutation Oracle Engine

Defines input/output structures and I-Ching specific data types.
"""

from typing import Optional, Dict, List, Any, Literal
from pydantic import BaseModel, Field, field_validator
from base.data_models import BaseEngineOutput, QuestionInput


class Trigram(BaseModel):
    """Represents an I-Ching trigram."""
    
    name: str = Field(..., description="Name of the trigram")
    chinese: str = Field(..., description="Chinese name and character")
    binary: str = Field(..., description="Binary representation (3 bits)")
    element: str = Field(..., description="Associated element")
    attribute: str = Field(..., description="Primary attribute")
    family: str = Field(..., description="Family position")
    direction: str = Field(..., description="Compass direction")
    season: str = Field(..., description="Associated season")
    meaning: str = Field(..., description="Core meaning")


class Hexagram(BaseModel):
    """Represents an I-Ching hexagram."""
    
    number: int = Field(..., ge=1, le=64, description="Hexagram number (1-64)")
    name: str = Field(..., description="English name")
    chinese: str = Field(..., description="Chinese name and character")
    trigrams: List[str] = Field(..., description="Upper and lower trigrams")
    binary: str = Field(..., description="Binary representation (6 bits)")
    keywords: List[str] = Field(default_factory=list, description="Key themes")
    judgment: str = Field(..., description="The Judgment text")
    image: str = Field(..., description="The Image text")
    meaning: str = Field(..., description="Core meaning and interpretation")
    divination: str = Field(..., description="Divinatory meaning")
    changing_lines: Dict[str, str] = Field(default_factory=dict, description="Changing line interpretations")


class HexagramLine(BaseModel):
    """Represents a single line in a hexagram."""
    
    position: int = Field(..., ge=1, le=6, description="Line position (1-6, bottom to top)")
    value: int = Field(..., description="Line value (6, 7, 8, or 9)")
    type: Literal["yin", "yang"] = Field(..., description="Line type")
    changing: bool = Field(..., description="Whether this is a changing line")
    interpretation: Optional[str] = Field(None, description="Line-specific interpretation")


class IChingReading(BaseModel):
    """Complete I-Ching reading result."""
    
    primary_hexagram: Hexagram = Field(..., description="The primary hexagram")
    primary_lines: List[HexagramLine] = Field(..., description="Lines of primary hexagram")
    
    mutation_hexagram: Optional[Hexagram] = Field(None, description="Mutation hexagram (if changing lines)")
    mutation_lines: Optional[List[HexagramLine]] = Field(None, description="Lines of mutation hexagram")
    
    changing_lines: List[int] = Field(default_factory=list, description="Positions of changing lines")
    method_used: str = Field(..., description="Divination method used")


class IChingInput(QuestionInput):
    """Input model for I-Ching Mutation Oracle."""
    
    method: Literal["coins", "yarrow", "random"] = Field(
        default="coins",
        description="Divination method to use"
    )
    
    focus_area: Optional[str] = Field(
        None,
        description="Specific life area to focus on"
    )
    
    include_changing_lines: bool = Field(
        default=True,
        description="Whether to include changing line interpretations"
    )
    
    @field_validator('method')
    @classmethod
    def validate_method(cls, v):
        valid_methods = ["coins", "yarrow", "random"]
        if v not in valid_methods:
            raise ValueError(f"Method must be one of: {valid_methods}")
        return v


class IChingOutput(BaseEngineOutput):
    """Output model for I-Ching Mutation Oracle."""
    
    # The base class provides: engine_name, calculation_time, confidence_score, 
    # timestamp, raw_data, formatted_output, recommendations, field_signature, 
    # reality_patches, archetypal_themes
    
    # Additional I-Ching-specific fields can be accessed via raw_data
    # This keeps the model simple and compatible with the base engine interface


# I-Ching data structure for loading
class IChingData(BaseModel):
    """Complete I-Ching data definition."""
    
    hexagram_info: Dict[str, Any] = Field(..., description="Hexagram metadata")
    hexagrams: Dict[str, Dict[str, Any]] = Field(..., description="All 64 hexagrams")
    trigrams: Dict[str, Dict[str, Any]] = Field(..., description="8 trigrams")
    methods: Dict[str, Dict[str, Any]] = Field(..., description="Divination methods")


# Export all models
__all__ = [
    "Trigram",
    "Hexagram",
    "HexagramLine",
    "IChingReading",
    "IChingInput",
    "IChingOutput",
    "IChingData"
]

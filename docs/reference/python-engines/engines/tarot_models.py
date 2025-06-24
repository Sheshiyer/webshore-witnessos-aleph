"""
Data models for Tarot Sequence Decoder Engine

Defines input/output structures and tarot-specific data types.
"""

from typing import Optional, Dict, List, Any, Literal
from pydantic import BaseModel, Field, field_validator
from base.data_models import BaseEngineOutput, QuestionInput


class TarotCard(BaseModel):
    """Represents a single tarot card."""
    
    name: str = Field(..., description="Name of the card")
    suit: Optional[str] = Field(None, description="Suit for minor arcana cards")
    number: Optional[str] = Field(None, description="Card number or court position")
    arcana_type: Literal["major", "minor"] = Field(..., description="Major or minor arcana")
    keywords: List[str] = Field(default_factory=list, description="Key themes")
    upright_meaning: str = Field(..., description="Upright interpretation")
    reversed_meaning: str = Field(..., description="Reversed interpretation")
    element: Optional[str] = Field(None, description="Associated element")
    astrological: Optional[str] = Field(None, description="Astrological association")


class DrawnCard(BaseModel):
    """Represents a card drawn in a reading."""
    
    card: TarotCard = Field(..., description="The tarot card")
    position: int = Field(..., description="Position in the spread")
    position_meaning: str = Field(..., description="Meaning of this position")
    reversed: bool = Field(default=False, description="Whether card is reversed")
    interpretation: str = Field(..., description="Interpretation for this position")


class SpreadLayout(BaseModel):
    """Defines a tarot spread layout."""
    
    name: str = Field(..., description="Name of the spread")
    description: str = Field(..., description="Description of the spread")
    positions: List[Dict[str, Any]] = Field(..., description="Position definitions")
    card_count: int = Field(..., description="Number of cards in spread")


class TarotInput(QuestionInput):
    """Input model for Tarot Sequence Decoder."""
    
    spread_type: Literal["single_card", "three_card", "celtic_cross"] = Field(
        default="three_card",
        description="Type of tarot spread to use"
    )
    
    deck_type: str = Field(
        default="rider_waite",
        description="Tarot deck to use"
    )
    
    include_reversed: bool = Field(
        default=True,
        description="Whether to include reversed cards"
    )
    
    focus_area: Optional[str] = Field(
        None,
        description="Specific life area to focus on (love, career, spiritual, etc.)"
    )
    
    @field_validator('spread_type')
    @classmethod
    def validate_spread_type(cls, v):
        valid_spreads = ["single_card", "three_card", "celtic_cross"]
        if v not in valid_spreads:
            raise ValueError(f"Spread type must be one of: {valid_spreads}")
        return v


class TarotOutput(BaseEngineOutput):
    """Output model for Tarot Sequence Decoder."""

    # The base class provides: engine_name, calculation_time, confidence_score,
    # timestamp, raw_data, formatted_output, recommendations, field_signature,
    # reality_patches, archetypal_themes

    # Additional tarot-specific fields can be accessed via raw_data
    # This keeps the model simple and compatible with the base engine interface


# Tarot deck data structure for loading
class TarotDeck(BaseModel):
    """Complete tarot deck definition."""
    
    deck_info: Dict[str, Any] = Field(..., description="Deck metadata")
    major_arcana: Dict[str, Dict[str, Any]] = Field(..., description="Major arcana cards")
    minor_arcana: Dict[str, Any] = Field(..., description="Minor arcana structure")
    spreads: Dict[str, Dict[str, Any]] = Field(..., description="Available spreads")


# Export all models
__all__ = [
    "TarotCard",
    "DrawnCard", 
    "SpreadLayout",
    "TarotInput",
    "TarotOutput",
    "TarotDeck"
]

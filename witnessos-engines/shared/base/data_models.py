"""
Base data models for WitnessOS Divination Engines

Provides standardized input/output structures using Pydantic for type safety
and validation across all engines.
"""

from datetime import date, time, datetime
from typing import Optional, List, Dict, Tuple, Any, Union
from pydantic import BaseModel, Field, field_validator, ConfigDict
import time as time_module


class EngineError(Exception):
    """Base exception for engine-related errors."""
    pass


class ValidationError(EngineError):
    """Exception raised for input validation errors."""
    pass


class BaseEngineInput(BaseModel):
    """Base input model that all engine inputs inherit from."""

    user_id: Optional[str] = Field(None, description="Unique user identifier")
    session_id: Optional[str] = Field(None, description="Session identifier for tracking")
    timestamp: Optional[datetime] = Field(default_factory=datetime.now, description="Request timestamp")

    model_config = ConfigDict(
        validate_assignment=True,
        extra="forbid"  # Don't allow extra fields
    )


class BaseEngineOutput(BaseModel):
    """Base output model that all engine outputs inherit from."""

    engine_name: str = Field(..., description="Name of the engine that generated this output")
    calculation_time: float = Field(..., description="Time taken for calculation in seconds")
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence in the result (0-1)")
    timestamp: datetime = Field(default_factory=datetime.now, description="Generation timestamp")

    # Core data
    raw_data: Dict[str, Any] = Field(default_factory=dict, description="Raw calculation results")
    formatted_output: str = Field(..., description="Human-readable interpretation")
    recommendations: List[str] = Field(default_factory=list, description="Actionable guidance")

    # WitnessOS specific fields
    field_signature: Optional[str] = Field(None, description="Current field state signature")
    reality_patches: List[str] = Field(default_factory=list, description="Suggested reality patches")
    archetypal_themes: List[str] = Field(default_factory=list, description="Identified archetypal patterns")

    model_config = ConfigDict(validate_assignment=True)


# Specialized input models for common data types

class BirthDataInput(BaseModel):
    """Standard birth data input for astrological calculations."""

    birth_date: date = Field(..., description="Date of birth")
    birth_time: Optional[time] = Field(None, description="Time of birth (if known)")
    birth_location: Optional[Tuple[float, float]] = Field(None, description="(latitude, longitude)")
    timezone: Optional[str] = Field(None, description="Timezone (e.g., 'America/New_York')")

    @field_validator('birth_location')
    @classmethod
    def validate_coordinates(cls, v):
        if v is not None:
            lat, lon = v
            if not (-90 <= lat <= 90):
                raise ValueError("Latitude must be between -90 and 90")
            if not (-180 <= lon <= 180):
                raise ValueError("Longitude must be between -180 and 180")
        return v


class PersonalDataInput(BaseModel):
    """Personal information input for name-based calculations."""

    full_name: str = Field(..., min_length=1, description="Complete birth name")
    preferred_name: Optional[str] = Field(None, description="Name currently used")

    @field_validator('full_name')
    @classmethod
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class QuestionInput(BaseModel):
    """Input for divination questions and intentions."""

    question: Optional[str] = Field(None, description="Specific question or query")
    intention: Optional[str] = Field(None, description="Underlying intention or focus")
    context: Optional[str] = Field(None, description="Additional context or background")
    urgency: str = Field(default="normal", description="Priority level")

    @field_validator('urgency')
    @classmethod
    def validate_urgency(cls, v):
        valid_levels = ["low", "normal", "high", "urgent"]
        if v not in valid_levels:
            raise ValueError(f"Urgency must be one of: {valid_levels}")
        return v


# Utility functions for timing and validation

def start_timer() -> float:
    """Start a timer for calculation timing."""
    return time_module.time()


def end_timer(start_time: float) -> float:
    """End timer and return elapsed time in seconds."""
    return round(time_module.time() - start_time, 4)


def validate_date_range(birth_date: date, min_year: int = 1900, max_year: Optional[int] = None) -> bool:
    """Validate that a birth date is within reasonable range."""
    if max_year is None:
        max_year = datetime.now().year

    if birth_date.year < min_year or birth_date.year > max_year:
        raise ValidationError(f"Birth year must be between {min_year} and {max_year}")

    return True


def create_field_signature(*args) -> str:
    """Create a unique field signature from input parameters."""
    import hashlib

    # Convert all arguments to strings and join
    signature_data = "|".join(str(arg) for arg in args if arg is not None)

    # Create hash
    return hashlib.md5(signature_data.encode()).hexdigest()[:12]


# Common response structures

class CalculationResult(BaseModel):
    """Standard structure for calculation results."""

    value: Union[int, float, str, Dict, List]
    interpretation: str
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ArchetypalPattern(BaseModel):
    """Structure for archetypal pattern identification."""

    archetype: str
    strength: float = Field(ge=0.0, le=1.0)
    description: str
    guidance: Optional[str] = None


class TimelineEvent(BaseModel):
    """Structure for timeline-based predictions."""

    date_range: Tuple[date, date]
    event_type: str
    description: str
    probability: float = Field(ge=0.0, le=1.0)
    preparation: Optional[str] = None


# Export all models
__all__ = [
    "EngineError",
    "ValidationError",
    "BaseEngineInput",
    "BaseEngineOutput",
    "BirthDataInput",
    "PersonalDataInput",
    "QuestionInput",
    "CalculationResult",
    "ArchetypalPattern",
    "TimelineEvent",
    "start_timer",
    "end_timer",
    "validate_date_range",
    "create_field_signature"
]

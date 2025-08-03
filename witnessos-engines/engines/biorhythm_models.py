"""
Data models for the Biorhythm Synchronizer engine

Defines the specific input and output structures for biorhythm calculations
while inheriting from the base WitnessOS engine models.
"""

from datetime import date, timedelta
from typing import Optional, Dict, List, Any
from pydantic import Field, field_validator

from shared.base.data_models import (    BaseEngineInput, BaseEngineOutput, BirthDataInput,    CloudflareEngineInput, CloudflareEngineOutput)
from pydantic import BaseModel


class BiorhythmInput(CloudflareEngineInput):
    """Input model for biorhythm calculations."""

    birth_date: date = Field(..., description="Date of birth")
    target_date: Optional[date] = Field(None, description="Date to calculate for (defaults to today)")
    include_extended_cycles: bool = Field(default=False, description="Include intuitive, aesthetic, spiritual cycles")
    forecast_days: int = Field(default=7, ge=1, le=90, description="Number of days to forecast (1-90)")

    @field_validator('birth_date')
    @classmethod
    def validate_birth_date(cls, v):
        current_date = date.today()
        if v > current_date:
            raise ValueError("Birth date cannot be in the future")
        if v.year < 1900:
            raise ValueError("Birth year must be 1900 or later")
        # Check for reasonable age limit (150 years)
        if (current_date - v).days > 150 * 365:
            raise ValueError("Birth date too far in the past (max 150 years)")
        return v

    @field_validator('target_date')
    @classmethod
    def validate_target_date(cls, v):
        if v is not None:
            current_date = date.today()
            # Allow some future dates for forecasting
            max_future = current_date + timedelta(days=365)
            if v > max_future:
                raise ValueError("Target date cannot be more than 1 year in the future")
            if v.year < 1900:
                raise ValueError("Target date must be 1900 or later")
        return v

    @field_validator('forecast_days')
    @classmethod
    def validate_forecast_days(cls, v):
        if v < 1 or v > 90:
            raise ValueError("Forecast days must be between 1 and 90")
        return v


    def get_engine_kv_keys(self) -> Dict[str, str]:
        """Generate KV keys for biorhythm engine data."""
        engine_name = "biorhythm"
        return {
            'reading': self.generate_user_key(engine_name, 'reading'),
            'analysis': self.generate_user_key(engine_name, 'analysis'),
            'cache': self.generate_cache_key(engine_name),
            'metadata': f"user:{self.user_id}:{engine_name}:metadata"
        }
    
    def get_d1_table_name(self) -> str:
        """Get D1 table name for this engine."""
        return "engine_biorhythm_readings"

class BiorhythmCompatibilityInput(BaseEngineInput):
    """Input model for biorhythm compatibility calculations."""

    person1_birth_date: date = Field(..., description="First person's birth date")
    person2_birth_date: date = Field(..., description="Second person's birth date")
    target_date: Optional[date] = Field(None, description="Date to calculate compatibility for")
    relationship_type: str = Field(default="general", description="Type of relationship")

    @field_validator('person1_birth_date', 'person2_birth_date')
    @classmethod
    def validate_birth_dates(cls, v):
        current_date = date.today()
        if v > current_date:
            raise ValueError("Birth date cannot be in the future")
        if v.year < 1900:
            raise ValueError("Birth year must be 1900 or later")
        if (current_date - v).days > 150 * 365:
            raise ValueError("Birth date too far in the past (max 150 years)")
        return v

    @field_validator('relationship_type')
    @classmethod
    def validate_relationship_type(cls, v):
        valid_types = ["romantic", "friendship", "business", "family", "general"]
        if v.lower() not in valid_types:
            raise ValueError(f"Relationship type must be one of: {valid_types}")
        return v.lower()


class CycleData(BaseModel):
    """Data model for individual biorhythm cycle information."""

    name: str = Field(..., description="Cycle name")
    period: int = Field(..., description="Cycle period in days")
    percentage: float = Field(..., ge=-100, le=100, description="Current cycle percentage")
    phase: str = Field(..., description="Current phase of the cycle")
    days_to_peak: int = Field(..., ge=0, description="Days until next peak")
    days_to_valley: int = Field(..., ge=0, description="Days until next valley")
    next_critical_date: date = Field(..., description="Date of next critical day")


class BiorhythmOutput(CloudflareEngineOutput):
    """Output model for biorhythm calculations."""

    # Target information
    birth_date: date = Field(..., description="Birth date used in calculation")
    target_date: date = Field(..., description="Date calculated for")
    days_alive: int = Field(..., description="Number of days alive at target date")

    # Core cycle data
    physical_percentage: float = Field(..., ge=-100, le=100, description="Physical cycle percentage")
    emotional_percentage: float = Field(..., ge=-100, le=100, description="Emotional cycle percentage")
    intellectual_percentage: float = Field(..., ge=-100, le=100, description="Intellectual cycle percentage")

    # Extended cycles (if included)
    intuitive_percentage: Optional[float] = Field(None, ge=-100, le=100, description="Intuitive cycle percentage")
    aesthetic_percentage: Optional[float] = Field(None, ge=-100, le=100, description="Aesthetic cycle percentage")
    spiritual_percentage: Optional[float] = Field(None, ge=-100, le=100, description="Spiritual cycle percentage")

    # Cycle phases
    physical_phase: str = Field(..., description="Physical cycle phase")
    emotional_phase: str = Field(..., description="Emotional cycle phase")
    intellectual_phase: str = Field(..., description="Intellectual cycle phase")

    # Overall metrics
    overall_energy: float = Field(..., ge=-100, le=100, description="Overall energy level")
    critical_day: bool = Field(..., description="Whether this is a critical day")
    trend: str = Field(..., description="Overall biorhythm trend")

    # Detailed cycle information
    cycle_details: Dict[str, Any] = Field(default_factory=dict, description="Detailed cycle information")

    # Critical days and forecasting
    critical_days_ahead: List[date] = Field(default_factory=list, description="Critical days in forecast period")
    forecast_summary: Dict[str, Any] = Field(default_factory=dict, description="Forecast summary")

    # Timing and recommendations
    best_days_ahead: List[date] = Field(default_factory=list, description="Best days in forecast period")
    challenging_days_ahead: List[date] = Field(default_factory=list, description="Challenging days ahead")

    # Energy optimization
    energy_optimization: Dict[str, str] = Field(default_factory=dict, description="Energy optimization guidance")
    cycle_synchronization: Dict[str, Any] = Field(default_factory=dict, description="Cycle synchronization insights")


class BiorhythmCompatibilityOutput(BaseEngineOutput):
    """Output model for biorhythm compatibility analysis."""

    # Individual profiles
    person1_birth_date: date = Field(..., description="First person's birth date")
    person2_birth_date: date = Field(..., description="Second person's birth date")
    target_date: date = Field(..., description="Date analyzed")

    # Individual biorhythm states
    person1_cycles: Dict[str, float] = Field(default_factory=dict, description="First person's cycle percentages")
    person2_cycles: Dict[str, float] = Field(default_factory=dict, description="Second person's cycle percentages")

    # Compatibility scores
    physical_compatibility: float = Field(..., ge=0, le=1, description="Physical compatibility score")
    emotional_compatibility: float = Field(..., ge=0, le=1, description="Emotional compatibility score")
    intellectual_compatibility: float = Field(..., ge=0, le=1, description="Intellectual compatibility score")
    overall_compatibility: float = Field(..., ge=0, le=1, description="Overall compatibility score")

    # Relationship dynamics
    compatibility_strengths: List[str] = Field(default_factory=list, description="Compatibility strengths")
    compatibility_challenges: List[str] = Field(default_factory=list, description="Compatibility challenges")
    synchronization_opportunities: List[str] = Field(default_factory=list, description="Synchronization opportunities")

    # Timing recommendations
    best_interaction_times: List[str] = Field(default_factory=list, description="Best times for interaction")
    challenging_periods: List[str] = Field(default_factory=list, description="Periods requiring extra care")

    # Relationship guidance
    relationship_guidance: str = Field(default="", description="Overall relationship guidance")
    energy_balancing_tips: List[str] = Field(default_factory=list, description="Energy balancing recommendations")

    # Metadata
    relationship_type: str = Field(..., description="Type of relationship analyzed")
    include_extended_cycles: bool = Field(default=False, description="Whether extended cycles were included")


class BiorhythmForecastDay(BaseModel):
    """Data model for a single day in biorhythm forecast."""

    forecast_date: date = Field(..., description="Forecast date")
    days_alive: int = Field(..., description="Days alive on this date")
    physical: float = Field(..., ge=-100, le=100, description="Physical cycle percentage")
    emotional: float = Field(..., ge=-100, le=100, description="Emotional cycle percentage")
    intellectual: float = Field(..., ge=-100, le=100, description="Intellectual cycle percentage")
    overall_energy: float = Field(..., ge=-100, le=100, description="Overall energy level")
    critical_day: bool = Field(..., description="Whether this is a critical day")
    trend: str = Field(..., description="Daily trend")
    energy_rating: str = Field(..., description="Energy rating for the day")


# Quick validation functions

def validate_biorhythm_input(data: Dict[str, Any]) -> BiorhythmInput:
    """Validate and create BiorhythmInput from dictionary."""
    return BiorhythmInput(**data)


def validate_compatibility_input(data: Dict[str, Any]) -> BiorhythmCompatibilityInput:
    """Validate and create BiorhythmCompatibilityInput from dictionary."""
    return BiorhythmCompatibilityInput(**data)


# Export all models
__all__ = [
    "BiorhythmInput",
    "BiorhythmOutput",
    "BiorhythmCompatibilityInput",
    "BiorhythmCompatibilityOutput",
    "CycleData",
    "BiorhythmForecastDay",
    "validate_biorhythm_input",
    "validate_compatibility_input"
]

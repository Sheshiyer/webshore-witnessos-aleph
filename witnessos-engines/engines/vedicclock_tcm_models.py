"""
VedicClock-TCM Integration Engine Data Models for WitnessOS

Multi-dimensional consciousness optimization combining:
- Vimshottari Dasha (macro life curriculum)
- Vedic Panchanga (daily cosmic energies) 
- TCM Organ Clock (bodily energy cycles)
- Personal chart integration (lagna, nakshatra)
"""

from datetime import datetime, time, date
from typing import Dict, List, Any, Optional, Literal, Tuple
from pydantic import BaseModel, Field, field_validator

from shared.base.data_models import BaseEngineInput, BaseEngineOutput, BirthDataInput


# ===== INPUT MODELS =====

class VedicClockTCMInput(BaseEngineInput, BirthDataInput):
    """Input model for VedicClock-TCM Integration Engine."""

    # Birth data is required for VedicClock-TCM
    birth_time: time = Field(..., description="Birth time is required for VedicClock-TCM calculations")
    birth_location: Tuple[float, float] = Field(..., description="Birth location as coordinates [latitude, longitude]")
    timezone: str = Field(..., description="Birth timezone (e.g., 'Asia/Kolkata')")
    
    # Analysis Parameters
    target_date: Optional[str] = Field(None, description="Date for analysis (defaults to today)")
    target_time: Optional[str] = Field(None, description="Time for analysis (defaults to now)")
    analysis_depth: Literal["basic", "detailed", "comprehensive"] = Field(
        default="detailed", 
        description="Depth of consciousness analysis"
    )
    
    # Optimization Focus
    optimization_focus: Optional[List[str]] = Field(
        default=None,
        description="Areas to optimize: ['energy', 'creativity', 'health', 'spiritual', 'career']"
    )
    
    # User Preferences
    include_predictions: bool = Field(default=True, description="Include future optimization windows")
    prediction_hours: int = Field(default=24, ge=1, le=168, description="Hours ahead to predict (1-168)")

    @field_validator('birth_time')
    @classmethod
    def validate_birth_time(cls, v):
        if v is None:
            raise ValueError("Birth time is required for VedicClock-TCM calculations")
        return v

    @field_validator('birth_location')
    @classmethod
    def validate_birth_location(cls, v):
        if v is None:
            raise ValueError("Birth location is required for VedicClock-TCM calculations")
        return v


# ===== OUTPUT MODELS =====

class VimshottariContext(BaseModel):
    """Current Vimshottari Dasha context."""
    mahadasha_lord: str = Field(..., description="Current major period ruler")
    mahadasha_remaining_years: float = Field(..., description="Years remaining in major period")
    antardasha_lord: str = Field(..., description="Current sub-period ruler")
    antardasha_remaining_months: float = Field(..., description="Months remaining in sub-period")
    pratyantardasha_lord: str = Field(..., description="Current sub-sub-period ruler")
    life_lesson_theme: str = Field(..., description="Primary consciousness lesson for this period")
    karmic_focus: str = Field(..., description="Karmic work emphasis")


class PanchangaState(BaseModel):
    """Current Vedic Panchanga state."""
    tithi: str = Field(..., description="Lunar day")
    vara: str = Field(..., description="Weekday")
    nakshatra: str = Field(..., description="Lunar mansion")
    yoga: str = Field(..., description="Vedic yoga")
    karana: str = Field(..., description="Half lunar day")
    dominant_element: str = Field(..., description="Primary elemental influence")
    energy_quality: str = Field(..., description="Overall energy quality")
    auspiciousness_score: float = Field(..., ge=0, le=1, description="Auspiciousness rating (0-1)")


class TCMOrganState(BaseModel):
    """Current TCM Organ Clock state."""
    primary_organ: str = Field(..., description="Currently dominant organ")
    secondary_organ: str = Field(..., description="Supporting organ")
    element: str = Field(..., description="TCM element (Wood, Fire, Earth, Metal, Water)")
    energy_direction: Literal["ascending", "peak", "descending", "rest"] = Field(
        ..., description="Energy phase"
    )
    optimal_activities: List[str] = Field(..., description="Recommended activities for this time")
    avoid_activities: List[str] = Field(..., description="Activities to avoid")


class ElementalSynthesis(BaseModel):
    """Synthesis of Vedic and TCM elemental energies."""
    vedic_element: str = Field(..., description="Dominant Vedic element")
    tcm_element: str = Field(..., description="Dominant TCM element")
    harmony_level: float = Field(..., ge=0, le=1, description="Elemental harmony score (0-1)")
    synthesis_quality: str = Field(..., description="Quality of elemental interaction")
    recommended_practices: List[str] = Field(..., description="Practices to harmonize elements")


class ConsciousnessOptimization(BaseModel):
    """Personalized consciousness optimization recommendations."""
    primary_focus: str = Field(..., description="Main consciousness work for this moment")
    secondary_focuses: List[str] = Field(..., description="Supporting areas of development")
    optimal_practices: List[str] = Field(..., description="Recommended spiritual/consciousness practices")
    timing_guidance: str = Field(..., description="When to engage in primary practices")
    energy_management: str = Field(..., description="How to work with current energy patterns")
    integration_method: str = Field(..., description="How to integrate insights into daily life")


class OptimizationWindow(BaseModel):
    """Future optimization opportunity."""
    start_time: str = Field(..., description="Window start time (ISO format)")
    end_time: str = Field(..., description="Window end time (ISO format)")
    opportunity_type: str = Field(..., description="Type of optimization opportunity")
    energy_quality: str = Field(..., description="Energy quality during this window")
    recommended_activities: List[str] = Field(..., description="Optimal activities for this window")
    potency_score: float = Field(..., ge=0, le=1, description="Potency of this window (0-1)")


class VedicClockTCMOutput(BaseEngineOutput):
    """Output model for VedicClock-TCM Integration Engine."""
    
    # Core Analysis
    vimshottari_context: VimshottariContext = Field(..., description="Current dasha context")
    panchanga_state: PanchangaState = Field(..., description="Current Vedic time state")
    tcm_organ_state: TCMOrganState = Field(..., description="Current TCM organ clock state")
    
    # Synthesis
    elemental_synthesis: ElementalSynthesis = Field(..., description="Vedic-TCM elemental harmony")
    consciousness_optimization: ConsciousnessOptimization = Field(
        ..., description="Personalized consciousness guidance"
    )
    
    # Personal Resonance
    personal_resonance_score: float = Field(
        ..., ge=0, le=1, 
        description="How well current energies align with personal chart (0-1)"
    )
    optimal_energy_window: bool = Field(..., description="Whether this is an optimal energy window")
    
    # Predictions (if requested)
    upcoming_windows: Optional[List[OptimizationWindow]] = Field(
        None, description="Future optimization opportunities"
    )
    
    # Integration Guidance
    daily_curriculum: str = Field(..., description="Today's consciousness curriculum")
    homework_practices: List[str] = Field(..., description="Specific practices for integration")
    progress_indicators: List[str] = Field(..., description="Signs of successful integration")


# ===== DATA MODELS =====

class VedicClockTCMData(BaseModel):
    """Data container for VedicClock-TCM engine."""
    
    # Vimshottari Data
    dasha_periods: Dict[str, Any] = Field(default_factory=dict)
    planetary_qualities: Dict[str, Any] = Field(default_factory=dict)
    
    # Panchanga Data
    tithi_qualities: Dict[str, Any] = Field(default_factory=dict)
    nakshatra_qualities: Dict[str, Any] = Field(default_factory=dict)
    yoga_qualities: Dict[str, Any] = Field(default_factory=dict)
    
    # TCM Data
    organ_clock_schedule: Dict[str, Any] = Field(default_factory=dict)
    element_cycles: Dict[str, Any] = Field(default_factory=dict)
    
    # Integration Mappings
    vedic_tcm_correspondences: Dict[str, Any] = Field(default_factory=dict)
    consciousness_practices: Dict[str, Any] = Field(default_factory=dict)

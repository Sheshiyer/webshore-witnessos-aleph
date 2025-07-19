"""
Data models for Vimshottari Dasha Timeline Mapper Engine

Defines input/output structures and Vedic astrology specific data types.
"""

from datetime import datetime, date, time
from typing import Optional, Dict, List, Tuple, Any
from pydantic import BaseModel, Field, field_validator
from shared.base.data_models import BaseEngineInput, BaseEngineOutput, BirthDataInput


class VimshottariInput(BaseEngineInput, BirthDataInput):
    """Input model for Vimshottari Dasha calculations."""

    # Birth data is required for Vedic calculations
    birth_time: time = Field(..., description="Exact birth time is required for Dasha calculations")
    birth_location: Tuple[float, float] = Field(..., description="Birth coordinates (latitude, longitude)")
    timezone: str = Field(..., description="Birth timezone (e.g., 'America/New_York')")

    # Optional calculation preferences
    current_date: Optional[date] = Field(default=None, description="Date for current period analysis")
    include_sub_periods: bool = Field(default=True, description="Include Antardasha and Pratyantardasha")
    years_forecast: int = Field(default=10, ge=1, le=50, description="Years to forecast ahead")

    @field_validator('birth_time')
    @classmethod
    def validate_birth_time(cls, v):
        if v is None:
            raise ValueError("Birth time is required for Dasha calculations")
        return v

    @field_validator('birth_location')
    @classmethod
    def validate_birth_location(cls, v):
        if v is None:
            raise ValueError("Birth location is required for Dasha calculations")
        lat, lon = v
        if not (-90 <= lat <= 90):
            raise ValueError("Latitude must be between -90 and 90")
        if not (-180 <= lon <= 180):
            raise ValueError("Longitude must be between -180 and 180")
        return v


class DashaPeriod(BaseModel):
    """Represents a Dasha period with timing and characteristics."""

    planet: str = Field(..., description="Ruling planet of the period")
    period_type: str = Field(..., description="Type: Mahadasha, Antardasha, or Pratyantardasha")
    start_date: date = Field(..., description="Period start date")
    end_date: date = Field(..., description="Period end date")
    duration_years: float = Field(..., description="Duration in years")

    # Period characteristics
    is_current: bool = Field(default=False, description="Whether this is the current period")
    is_upcoming: bool = Field(default=False, description="Whether this period is upcoming")

    # Interpretive information
    general_theme: str = Field(default="", description="General theme of the period")
    opportunities: List[str] = Field(default_factory=list, description="Opportunities during this period")
    challenges: List[str] = Field(default_factory=list, description="Challenges during this period")
    recommendations: List[str] = Field(default_factory=list, description="Recommendations for this period")


class NakshatraInfo(BaseModel):
    """Information about the birth nakshatra."""

    name: str = Field(..., description="Nakshatra name")
    pada: int = Field(..., ge=1, le=4, description="Pada (quarter) number")
    ruling_planet: str = Field(..., description="Nakshatra ruling planet")
    degrees_in_nakshatra: float = Field(..., description="Degrees within the nakshatra")

    # Nakshatra characteristics
    symbol: str = Field(default="", description="Nakshatra symbol")
    deity: str = Field(default="", description="Presiding deity")
    nature: str = Field(default="", description="Nakshatra nature/guna")
    meaning: str = Field(default="", description="Nakshatra meaning")
    characteristics: List[str] = Field(default_factory=list, description="Key characteristics")


class DashaTimeline(BaseModel):
    """Complete Dasha timeline with all periods."""

    birth_nakshatra: NakshatraInfo = Field(..., description="Birth nakshatra information")

    # Current periods
    current_mahadasha: DashaPeriod = Field(..., description="Current major period")
    current_antardasha: Optional[DashaPeriod] = Field(None, description="Current sub-period")
    current_pratyantardasha: Optional[DashaPeriod] = Field(None, description="Current sub-sub-period")

    # Timeline data
    all_mahadashas: List[DashaPeriod] = Field(default_factory=list, description="All major periods")
    upcoming_periods: List[DashaPeriod] = Field(default_factory=list, description="Upcoming significant periods")

    # Analysis
    life_phase_analysis: str = Field(default="", description="Current life phase analysis")
    karmic_themes: List[str] = Field(default_factory=list, description="Karmic themes in current periods")


class VimshottariOutput(BaseEngineOutput):
    """Output model for Vimshottari Dasha Timeline Mapper."""

    # Core timeline data
    timeline: DashaTimeline = Field(..., description="Complete Dasha timeline")

    # Calculation metadata
    birth_info: Dict[str, Any] = Field(default_factory=dict, description="Birth data used")
    calculation_date: date = Field(..., description="Date of calculation")

    # Interpretive sections
    current_period_analysis: str = Field(default="", description="Analysis of current periods")
    upcoming_opportunities: str = Field(default="", description="Upcoming opportunities analysis")
    karmic_guidance: str = Field(default="", description="Karmic guidance based on periods")

    # Timing guidance
    favorable_periods: List[str] = Field(default_factory=list, description="Favorable upcoming periods")
    challenging_periods: List[str] = Field(default_factory=list, description="Challenging periods to prepare for")


# Vimshottari Dasha reference data

DASHA_PERIODS = {
    "Ketu": 7,
    "Venus": 20,
    "Sun": 6,
    "Moon": 10,
    "Mars": 7,
    "Rahu": 18,
    "Jupiter": 16,
    "Saturn": 19,
    "Mercury": 17
}

NAKSHATRA_DATA = {
    "Ashwini": {
        "ruling_planet": "Ketu",
        "symbol": "Horse's head",
        "deity": "Ashwini Kumaras",
        "nature": "Rajas",
        "meaning": "Born of a horse",
        "characteristics": ["Quick action", "Healing abilities", "Pioneering spirit", "Impatience"]
    },
    "Bharani": {
        "ruling_planet": "Venus",
        "symbol": "Yoni (female reproductive organ)",
        "deity": "Yama",
        "nature": "Rajas",
        "meaning": "The bearer",
        "characteristics": ["Creativity", "Sexuality", "Transformation", "Responsibility"]
    },
    "Krittika": {
        "ruling_planet": "Sun",
        "symbol": "Razor or flame",
        "deity": "Agni",
        "nature": "Rajas",
        "meaning": "The cutter",
        "characteristics": ["Sharp intellect", "Purification", "Leadership", "Critical nature"]
    },
    "Rohini": {
        "ruling_planet": "Moon",
        "symbol": "Ox cart or chariot",
        "deity": "Brahma",
        "nature": "Rajas",
        "meaning": "The red one",
        "characteristics": ["Beauty", "Fertility", "Growth", "Material success"]
    },
    "Mrigashira": {
        "ruling_planet": "Mars",
        "symbol": "Deer's head",
        "deity": "Soma",
        "nature": "Tamas",
        "meaning": "Deer head",
        "characteristics": ["Searching nature", "Curiosity", "Gentleness", "Restlessness"]
    },
    "Ardra": {
        "ruling_planet": "Rahu",
        "symbol": "Teardrop",
        "deity": "Rudra",
        "nature": "Tamas",
        "meaning": "Moist",
        "characteristics": ["Emotional intensity", "Transformation", "Destruction and renewal", "Research abilities"]
    },
    "Punarvasu": {
        "ruling_planet": "Jupiter",
        "symbol": "Bow and quiver",
        "deity": "Aditi",
        "nature": "Sattva",
        "meaning": "Return of the light",
        "characteristics": ["Renewal", "Optimism", "Spiritual growth", "Adaptability"]
    },
    "Pushya": {
        "ruling_planet": "Saturn",
        "symbol": "Cow's udder",
        "deity": "Brihaspati",
        "nature": "Sattva",
        "meaning": "Nourisher",
        "characteristics": ["Nourishment", "Spirituality", "Discipline", "Service"]
    },
    "Ashlesha": {
        "ruling_planet": "Mercury",
        "symbol": "Serpent",
        "deity": "Nagas",
        "nature": "Tamas",
        "meaning": "Embrace",
        "characteristics": ["Mysticism", "Intuition", "Manipulation", "Hidden knowledge"]
    },
    "Magha": {
        "ruling_planet": "Ketu",
        "symbol": "Royal throne",
        "deity": "Pitrs (ancestors)",
        "nature": "Tamas",
        "meaning": "Mighty",
        "characteristics": ["Royal nature", "Ancestral connection", "Authority", "Tradition"]
    },
    "Purva Phalguni": {
        "ruling_planet": "Venus",
        "symbol": "Front legs of bed",
        "deity": "Bhaga",
        "nature": "Rajas",
        "meaning": "Former reddish one",
        "characteristics": ["Pleasure", "Creativity", "Relationships", "Luxury"]
    },
    "Uttara Phalguni": {
        "ruling_planet": "Sun",
        "symbol": "Back legs of bed",
        "deity": "Aryaman",
        "nature": "Sattva",
        "meaning": "Latter reddish one",
        "characteristics": ["Service", "Friendship", "Contracts", "Reliability"]
    },
    "Hasta": {
        "ruling_planet": "Moon",
        "symbol": "Hand",
        "deity": "Savitar",
        "nature": "Sattva",
        "meaning": "Hand",
        "characteristics": ["Skill", "Craftsmanship", "Healing", "Dexterity"]
    },
    "Chitra": {
        "ruling_planet": "Mars",
        "symbol": "Bright jewel",
        "deity": "Tvashtar",
        "nature": "Tamas",
        "meaning": "Brilliant",
        "characteristics": ["Creativity", "Beauty", "Architecture", "Illusion"]
    },
    "Swati": {
        "ruling_planet": "Rahu",
        "symbol": "Young plant blown by wind",
        "deity": "Vayu",
        "nature": "Tamas",
        "meaning": "Independent",
        "characteristics": ["Independence", "Flexibility", "Trade", "Movement"]
    },
    "Vishakha": {
        "ruling_planet": "Jupiter",
        "symbol": "Triumphal arch",
        "deity": "Indra and Agni",
        "nature": "Rajas",
        "meaning": "Forked",
        "characteristics": ["Determination", "Goal achievement", "Ambition", "Transformation"]
    },
    "Anuradha": {
        "ruling_planet": "Saturn",
        "symbol": "Lotus flower",
        "deity": "Mitra",
        "nature": "Tamas",
        "meaning": "Following Radha",
        "characteristics": ["Devotion", "Friendship", "Success", "Balance"]
    },
    "Jyeshtha": {
        "ruling_planet": "Mercury",
        "symbol": "Circular amulet",
        "deity": "Indra",
        "nature": "Rajas",
        "meaning": "Eldest",
        "characteristics": ["Seniority", "Protection", "Responsibility", "Authority"]
    },
    "Mula": {
        "ruling_planet": "Ketu",
        "symbol": "Bunch of roots",
        "deity": "Nirriti",
        "nature": "Tamas",
        "meaning": "Root",
        "characteristics": ["Investigation", "Destruction", "Research", "Spiritual seeking"]
    },
    "Purva Ashadha": {
        "ruling_planet": "Venus",
        "symbol": "Elephant tusk",
        "deity": "Apas",
        "nature": "Rajas",
        "meaning": "Former invincible one",
        "characteristics": ["Invincibility", "Purification", "Strength", "Pride"]
    },
    "Uttara Ashadha": {
        "ruling_planet": "Sun",
        "symbol": "Elephant tusk",
        "deity": "Vishvadevas",
        "nature": "Sattva",
        "meaning": "Latter invincible one",
        "characteristics": ["Victory", "Leadership", "Righteousness", "Final achievement"]
    },
    "Shravana": {
        "ruling_planet": "Moon",
        "symbol": "Ear",
        "deity": "Vishnu",
        "nature": "Sattva",
        "meaning": "Hearing",
        "characteristics": ["Learning", "Listening", "Knowledge", "Connection"]
    },
    "Dhanishta": {
        "ruling_planet": "Mars",
        "symbol": "Drum",
        "deity": "Vasus",
        "nature": "Tamas",
        "meaning": "Wealthy",
        "characteristics": ["Wealth", "Music", "Fame", "Adaptability"]
    },
    "Shatabhisha": {
        "ruling_planet": "Rahu",
        "symbol": "Empty circle",
        "deity": "Varuna",
        "nature": "Tamas",
        "meaning": "Hundred healers",
        "characteristics": ["Healing", "Secrecy", "Research", "Innovation"]
    },
    "Purva Bhadrapada": {
        "ruling_planet": "Jupiter",
        "symbol": "Front legs of funeral cot",
        "deity": "Aja Ekapada",
        "nature": "Rajas",
        "meaning": "Former blessed feet",
        "characteristics": ["Transformation", "Spirituality", "Sacrifice", "Intensity"]
    },
    "Uttara Bhadrapada": {
        "ruling_planet": "Saturn",
        "symbol": "Back legs of funeral cot",
        "deity": "Ahir Budhnya",
        "nature": "Sattva",
        "meaning": "Latter blessed feet",
        "characteristics": ["Depth", "Wisdom", "Kundalini", "Cosmic consciousness"]
    },
    "Revati": {
        "ruling_planet": "Mercury",
        "symbol": "Fish",
        "deity": "Pushan",
        "nature": "Sattva",
        "meaning": "Wealthy",
        "characteristics": ["Completion", "Journey", "Nourishment", "Prosperity"]
    }
}

PLANET_CHARACTERISTICS = {
    "Sun": {
        "nature": "Royal, authoritative, spiritual",
        "opportunities": ["Leadership roles", "Government positions", "Spiritual growth", "Recognition"],
        "challenges": ["Ego conflicts", "Authority issues", "Health problems", "Isolation"],
        "recommendations": ["Practice humility", "Serve others", "Focus on spirituality", "Maintain health"]
    },
    "Moon": {
        "nature": "Emotional, nurturing, changeable",
        "opportunities": ["Emotional healing", "Family matters", "Public recognition", "Travel"],
        "challenges": ["Emotional instability", "Mental stress", "Relationship issues", "Health fluctuations"],
        "recommendations": ["Practice meditation", "Nurture relationships", "Stay hydrated", "Avoid negative emotions"]
    },
    "Mars": {
        "nature": "Energetic, aggressive, action-oriented",
        "opportunities": ["Physical activities", "Competition", "Real estate", "Technical skills"],
        "challenges": ["Anger issues", "Accidents", "Conflicts", "Impulsiveness"],
        "recommendations": ["Channel energy positively", "Practice patience", "Avoid conflicts", "Exercise regularly"]
    },
    "Mercury": {
        "nature": "Intellectual, communicative, versatile",
        "opportunities": ["Education", "Communication", "Business", "Writing"],
        "challenges": ["Mental confusion", "Communication problems", "Nervous disorders", "Indecision"],
        "recommendations": ["Study regularly", "Improve communication", "Practice concentration", "Avoid overthinking"]
    },
    "Jupiter": {
        "nature": "Wise, spiritual, expansive",
        "opportunities": ["Spiritual growth", "Higher education", "Teaching", "Wealth"],
        "challenges": ["Over-optimism", "Weight gain", "Liver problems", "Excessive spending"],
        "recommendations": ["Practice wisdom", "Help others", "Study scriptures", "Maintain discipline"]
    },
    "Venus": {
        "nature": "Artistic, luxurious, relationship-oriented",
        "opportunities": ["Relationships", "Arts", "Luxury", "Beauty"],
        "challenges": ["Relationship problems", "Excessive indulgence", "Kidney issues", "Materialism"],
        "recommendations": ["Practice moderation", "Appreciate beauty", "Nurture relationships", "Avoid excess"]
    },
    "Saturn": {
        "nature": "Disciplined, restrictive, karmic",
        "opportunities": ["Hard work rewards", "Discipline", "Longevity", "Spiritual growth"],
        "challenges": ["Delays", "Restrictions", "Health issues", "Depression"],
        "recommendations": ["Practice patience", "Work hard", "Serve others", "Accept limitations"]
    },
    "Rahu": {
        "nature": "Materialistic, ambitious, unconventional",
        "opportunities": ["Foreign connections", "Technology", "Innovation", "Sudden gains"],
        "challenges": ["Confusion", "Deception", "Addiction", "Unconventional problems"],
        "recommendations": ["Stay grounded", "Avoid shortcuts", "Practice discrimination", "Seek guidance"]
    },
    "Ketu": {
        "nature": "Spiritual, detached, mystical",
        "opportunities": ["Spiritual growth", "Mystical experiences", "Research", "Liberation"],
        "challenges": ["Confusion", "Isolation", "Health issues", "Lack of direction"],
        "recommendations": ["Practice spirituality", "Seek inner guidance", "Avoid materialism", "Meditate regularly"]
    }
}

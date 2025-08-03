"""
Base data models for WitnessOS Divination Engines

Provides standardized input/output structures using Pydantic for type safety
and validation across all engines.
"""

from datetime import date, time, datetime
from typing import Optional, List, Dict, Tuple, Any, Union
from pydantic import BaseModel, Field, field_validator, ConfigDict
import time as time_module
import uuid
import hashlib
import json
from enum import Enum


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


class CloudflareEngineInput(BaseEngineInput):
    """Enhanced base input model with Cloudflare D1/KV integration support."""

    # Cloudflare-specific fields
    reading_id: Optional[str] = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique reading identifier for D1 storage"
    )
    cache_key: Optional[str] = Field(None, description="KV cache key for result caching")
    admin_api_key: Optional[str] = Field(None, description="Admin API key for elevated access")

    # Storage preferences
    store_reading: bool = Field(default=True, description="Store reading in D1 database")
    cache_result: bool = Field(default=True, description="Cache result in KV store")
    retention_days: Optional[int] = Field(default=365, description="Data retention period in days")

    # Privacy and compliance
    data_processing_consent: bool = Field(default=False, description="Explicit consent for data processing")
    privacy_level: str = Field(default="standard", description="Privacy level: minimal, standard, enhanced")

    def generate_cache_key(self, engine_name: str) -> str:
        """Generate a structured cache key for KV storage."""
        if self.cache_key:
            return self.cache_key

        # Create deterministic hash from input data
        input_dict = self.model_dump(exclude={'cache_key', 'reading_id', 'timestamp', 'admin_api_key'})
        input_str = json.dumps(input_dict, sort_keys=True)
        input_hash = hashlib.md5(input_str.encode()).hexdigest()[:12]

        return f"calc:{engine_name}:{input_hash}"

    def generate_user_key(self, engine_name: str, data_type: str = "reading") -> str:
        """Generate user-specific key for KV storage."""
        reading_id = self.reading_id or str(uuid.uuid4())
        return f"user:{self.user_id}:{engine_name}:{data_type}:{reading_id}"


class BaseEngineOutput(BaseModel):
    """Base output model that all engine outputs inherit from."""

    engine_name: str = Field(..., description="Name of the engine that generated this output")
    calculation_time: float = Field(..., description="Time taken for calculation in seconds")
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0, description="Confidence in the result (0-1)")
    timestamp: datetime = Field(default_factory=datetime.now, description="Generation timestamp")

    # Core data
    raw_data: Dict[str, Any] = Field(default_factory=dict, description="Raw calculation results")
    formatted_output: Union[str, Dict[str, Any]] = Field(..., description="Human-readable interpretation or structured data")
    recommendations: List[str] = Field(default_factory=list, description="Actionable guidance")

    # WitnessOS specific fields
    field_signature: Optional[str] = Field(None, description="Current field state signature")
    reality_patches: List[str] = Field(default_factory=list, description="Suggested reality patches")
    archetypal_themes: List[str] = Field(default_factory=list, description="Identified archetypal patterns")

    model_config = ConfigDict(validate_assignment=True)


class CloudflareEngineOutput(BaseEngineOutput):
    """Enhanced base output model with Cloudflare D1/KV integration support."""

    # Storage metadata
    reading_id: Optional[str] = Field(None, description="Unique reading identifier")
    user_id: Optional[str] = Field(None, description="User who requested this reading")
    created_at: datetime = Field(default_factory=datetime.now, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update timestamp")

    # Cloudflare integration
    storage_metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Metadata for D1/KV storage operations"
    )
    kv_cache_keys: List[str] = Field(
        default_factory=list,
        description="KV keys used for caching this result"
    )
    d1_table_refs: List[str] = Field(
        default_factory=list,
        description="D1 tables referenced by this reading"
    )

    # Data lifecycle
    expires_at: Optional[datetime] = Field(None, description="Expiration timestamp for data retention")
    privacy_level: str = Field(default="standard", description="Privacy level applied to this data")

    # Serialization support for Cloudflare Workers
    def to_kv_value(self) -> str:
        """Serialize for KV storage with optimized JSON."""
        return self.model_dump_json(exclude={'storage_metadata', 'kv_cache_keys', 'd1_table_refs'})

    def to_d1_record(self) -> Dict[str, Any]:
        """Convert to D1 database record format."""
        # Generate reading_id if not provided
        reading_id = self.reading_id or str(uuid.uuid4())
        return {
            'id': reading_id,
            'user_id': self.user_id,
            'engine_name': self.engine_name,
            'data': self.model_dump_json(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'privacy_level': self.privacy_level
        }

    @classmethod
    def from_d1_record(cls, record: Dict[str, Any]) -> 'CloudflareEngineOutput':
        """Create instance from D1 database record."""
        data = json.loads(record['data'])
        return cls(**data)


# ===== CLOUDFLARE STORAGE MODELS =====

class StoragePrivacyLevel(str, Enum):
    """Privacy levels for data storage."""
    MINIMAL = "minimal"      # Store only essential data
    STANDARD = "standard"    # Store full reading data
    ENHANCED = "enhanced"    # Store with additional metadata
    BIOMETRIC = "biometric"  # Special handling for biometric data


class CloudflareStorageConfig(BaseModel):
    """Configuration for Cloudflare storage operations."""

    # D1 Database settings
    d1_database_name: str = Field(default="witnessos_readings", description="D1 database name")
    d1_table_prefix: str = Field(default="engine_", description="Table prefix for engine data")

    # KV settings
    kv_namespace: str = Field(default="WITNESSOS_CACHE", description="KV namespace for caching")
    kv_ttl_seconds: int = Field(default=86400, description="KV TTL in seconds (24 hours)")

    # Privacy settings
    default_privacy_level: StoragePrivacyLevel = Field(
        default=StoragePrivacyLevel.STANDARD,
        description="Default privacy level"
    )
    biometric_retention_days: int = Field(default=30, description="Biometric data retention period")
    standard_retention_days: int = Field(default=365, description="Standard data retention period")

    # Admin settings
    admin_api_key_hash: Optional[str] = Field(None, description="Hashed admin API key for validation")

    def get_d1_table_name(self, engine_name: str) -> str:
        """Generate D1 table name for engine."""
        clean_name = engine_name.lower().replace(' ', '_').replace('-', '_')
        return f"{self.d1_table_prefix}{clean_name}_readings"

    def get_kv_key(self, key_type: str, **kwargs) -> str:
        """Generate structured KV key."""
        if key_type == "user_reading":
            return f"user:{kwargs['user_id']}:{kwargs['engine_name']}:{kwargs['reading_id']}"
        elif key_type == "calculation_cache":
            return f"calc:{kwargs['engine_name']}:{kwargs['input_hash']}"
        elif key_type == "admin_data":
            return f"admin:{kwargs['admin_id']}:{kwargs['data_type']}"
        else:
            return f"{key_type}:{':'.join(str(v) for v in kwargs.values())}"


class BiometricDataConfig(BaseModel):
    """Special configuration for biometric data handling."""

    # Privacy compliance
    require_explicit_consent: bool = Field(default=True, description="Require explicit consent")
    local_processing_only: bool = Field(default=True, description="Process locally only")
    no_cloud_storage: bool = Field(default=True, description="Prohibit cloud storage")

    # Data handling
    anonymize_landmarks: bool = Field(default=True, description="Anonymize facial landmarks")
    hash_biometric_data: bool = Field(default=True, description="Hash biometric identifiers")
    max_retention_days: int = Field(default=30, description="Maximum retention period")

    # Compliance
    gdpr_compliant: bool = Field(default=True, description="GDPR compliance mode")
    ccpa_compliant: bool = Field(default=True, description="CCPA compliance mode")
    audit_all_access: bool = Field(default=True, description="Audit all data access")


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

"""
Data models for Gene Keys Compass Engine

Defines input/output structures and Gene Keys specific data types.
"""

from datetime import date, time
from typing import Optional, Dict, List, Any, Literal, Tuple
from pydantic import BaseModel, Field, field_validator
from shared.base.data_models import (
    BaseEngineInput, BaseEngineOutput, BirthDataInput,
    CloudflareEngineInput, CloudflareEngineOutput
)


class GeneKey(BaseModel):
    """Represents a single Gene Key with its three frequencies."""
    
    number: int = Field(..., ge=1, le=64, description="Gene Key number (1-64)")
    name: str = Field(..., description="Name of the Gene Key")
    shadow: str = Field(..., description="Shadow frequency (victim consciousness)")
    gift: str = Field(..., description="Gift frequency (genius consciousness)")
    siddhi: str = Field(..., description="Siddhi frequency (divine consciousness)")
    codon: str = Field(..., description="Genetic codon")
    amino_acid: str = Field(..., description="Associated amino acid")
    programming_partner: int = Field(..., description="Programming partner Gene Key number")
    physiology: str = Field(..., description="Associated body system")
    
    shadow_description: str = Field(..., description="Detailed shadow description")
    gift_description: str = Field(..., description="Detailed gift description")
    siddhi_description: str = Field(..., description="Detailed siddhi description")
    keywords: List[str] = Field(default_factory=list, description="Key themes")
    life_theme: str = Field(..., description="Core life theme")


class SequenceGate(BaseModel):
    """Represents a gate within a Gene Keys sequence."""
    
    name: str = Field(..., description="Name of the gate")
    description: str = Field(..., description="Description of the gate's purpose")
    gene_key: GeneKey = Field(..., description="The Gene Key for this gate")
    calculation_method: str = Field(..., description="How this gate is calculated")


class GeneKeysSequence(BaseModel):
    """Represents a complete Gene Keys sequence."""
    
    name: str = Field(..., description="Name of the sequence")
    description: str = Field(..., description="Description of the sequence")
    gates: List[SequenceGate] = Field(..., description="Gates in this sequence")


class GeneKeysProfile(BaseModel):
    """Complete Gene Keys profile for an individual."""
    
    activation_sequence: GeneKeysSequence = Field(..., description="Activation Sequence")
    venus_sequence: GeneKeysSequence = Field(..., description="Venus Sequence")
    pearl_sequence: GeneKeysSequence = Field(..., description="Pearl Sequence")
    
    birth_date: date = Field(..., description="Birth date used for calculation")
    primary_gene_key: GeneKey = Field(..., description="Primary Life's Work Gene Key")
    programming_partner: GeneKey = Field(..., description="Programming partner Gene Key")


class GeneKeysInput(BirthDataInput):
    """Input model for Gene Keys Compass."""

    # Birth data is required for Gene Keys (same as Human Design)
    birth_time: time = Field(..., description="Exact birth time is required for Gene Keys calculations")
    birth_location: Tuple[float, float] = Field(..., description="Birth coordinates (latitude, longitude)")
    timezone: str = Field(..., description="Birth timezone (e.g., 'America/New_York')")

    focus_sequence: Optional[Literal["activation", "venus", "pearl", "all"]] = Field(
        default="activation",
        description="Which sequence to focus on"
    )

    include_programming_partner: bool = Field(
        default=True,
        description="Whether to include programming partner analysis"
    )

    pathworking_focus: Optional[str] = Field(
        None,
        description="Specific area for pathworking guidance"
    )
    
    @field_validator('focus_sequence')
    @classmethod
    def validate_focus_sequence(cls, v):
        if v is not None:
            valid_sequences = ["activation", "venus", "pearl", "all"]
            if v not in valid_sequences:
                raise ValueError(f"Focus sequence must be one of: {valid_sequences}")
        return v


    def get_engine_kv_keys(self) -> Dict[str, str]:
        """Generate KV keys for genekeys engine data."""
        engine_name = "genekeys"
        return {
            'reading': self.generate_user_key(engine_name, 'reading'),
            'analysis': self.generate_user_key(engine_name, 'analysis'),
            'cache': self.generate_cache_key(engine_name),
            'metadata': f"user:{self.user_id}:{engine_name}:metadata"
        }
    
    def get_d1_table_name(self) -> str:
        """Get D1 table name for this engine."""
        return "engine_genekeys_readings"

class GeneKeysOutput(CloudflareEngineOutput):
    """Output model for Gene Keys Compass."""
    
    # The base class provides: engine_name, calculation_time, confidence_score, 
    # timestamp, raw_data, formatted_output, recommendations, field_signature, 
    # reality_patches, archetypal_themes
    
    # Additional Gene Keys-specific fields can be accessed via raw_data
    # This keeps the model simple and compatible with the base engine interface


# Gene Keys data structure for loading
class GeneKeysData(BaseModel):
    """Complete Gene Keys data definition."""
    
    gene_keys_info: Dict[str, Any] = Field(..., description="Gene Keys metadata")
    gene_keys: Dict[str, Dict[str, Any]] = Field(..., description="All 64 Gene Keys")
    sequences: Dict[str, Dict[str, Any]] = Field(..., description="Sequence definitions")
    frequencies: Dict[str, Dict[str, Any]] = Field(..., description="Frequency descriptions")
    pathworking: Dict[str, Dict[str, Any]] = Field(..., description="Pathworking methods")


# Export all models
__all__ = [
    "GeneKey",
    "SequenceGate",
    "GeneKeysSequence", 
    "GeneKeysProfile",
    "GeneKeysInput",
    "GeneKeysOutput",
    "GeneKeysData"
]

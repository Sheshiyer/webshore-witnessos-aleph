"""
Biofield Engine Data Models for WitnessOS

Advanced PIP (Poly-contrast Interference Photography) analysis combining:
- 17 core biofield metrics
- 10 color analysis parameters  
- 7 composite consciousness scores
- Real-time energy field assessment
- Integration with Face Reading, Vedic, and TCM engines
"""

from datetime import datetime, time, date
from typing import Dict, List, Any, Optional, Literal, Tuple
from pydantic import BaseModel, Field, field_validator

from shared.base.data_models import (
    BaseEngineInput, BaseEngineOutput, BirthDataInput,
    CloudflareEngineInput, CloudflareEngineOutput
)


# ===== CORE BIOFIELD METRICS =====

class BiofieldMetrics(BaseModel):
    """17 core biofield analysis metrics from PIP image processing."""
    
    # Spatial Pattern Metrics
    light_quanta_density: float = Field(..., description="Photon emission density measurement")
    normalized_area: float = Field(..., description="Light pattern to total area ratio")
    average_intensity: float = Field(..., description="Mean intensity of light patterns")
    inner_noise: float = Field(..., description="Variability in light patterns within regions")
    energy_analysis: float = Field(..., description="Total integrated emission energy")
    
    # Complexity Metrics
    entropy_form_coefficient: float = Field(..., description="Pattern irregularity measurement")
    fractal_dimension: float = Field(..., description="Spatial complexity and self-similarity")
    correlation_dimension: float = Field(..., description="Non-linear complexity assessment")
    
    # Temporal Dynamics
    hurst_exponent: float = Field(..., description="Long-term correlation analysis")
    lyapunov_exponent: float = Field(..., description="Pattern stability assessment")
    dfa_analysis: float = Field(..., description="Detrended fluctuation analysis")
    
    # System Analysis
    bifurcation_analysis: float = Field(..., description="Energetic state transition points")
    recurrence_analysis: float = Field(..., description="Cyclic pattern detection")
    nonlinear_mapping: float = Field(..., description="Manifold structure analysis")
    
    # Symmetry & Form
    body_symmetry: float = Field(..., description="Left/right energy balance")
    contour_complexity: float = Field(..., description="Bio-energy field boundary analysis")
    pattern_regularity: float = Field(..., description="Coherent emission uniformity")


class ColorAnalysis(BaseModel):
    """10 color analysis parameters for chromatic biofield assessment."""
    
    color_distribution: Dict[str, float] = Field(..., description="Percentage distribution across color channels")
    color_entropy: float = Field(..., description="Randomness/complexity in color distribution")
    color_correlation: float = Field(..., description="Correlation between color channels")
    spectral_power_distribution: Dict[str, float] = Field(..., description="Fourier transform spectral analysis")
    color_coherence: float = Field(..., description="Connected regions per color channel")
    color_energy: float = Field(..., description="Integrated pixel intensities across channels")
    color_symmetry: float = Field(..., description="Left/right color similarity")
    color_contrast: float = Field(..., description="Intensity gradients between regions")
    dominant_wavelength: float = Field(..., description="Most prominent wavelength/hue")
    color_perimeter: float = Field(..., description="Border length between color regions")


class CompositeScores(BaseModel):
    """7 composite scores derived from biofield metrics."""
    
    # Primary Scores
    energy_score: float = Field(..., ge=0, le=1, description="Overall biofield vitality")
    symmetry_balance_score: float = Field(..., ge=0, le=1, description="Energetic harmony measure")
    coherence_score: float = Field(..., ge=0, le=1, description="Field stability evaluation")
    
    # Advanced Scores
    complexity_score: float = Field(..., ge=0, le=1, description="Pattern sophistication analysis")
    regulation_score: float = Field(..., ge=0, le=1, description="Energetic control assessment")
    
    # Color Scores
    color_vitality_score: float = Field(..., ge=0, le=1, description="Chromatic energy evaluation")
    color_coherence_score: float = Field(..., ge=0, le=1, description="Chromatic harmony measure")


# ===== INPUT/OUTPUT MODELS =====

class BiofieldInput(CloudflareEngineInput, BirthDataInput):
    """Input model for Biofield Engine."""
    
    # Image/Video Data
    image_data: Optional[str] = Field(None, description="Base64 encoded PIP image data")
    video_data: Optional[str] = Field(None, description="Base64 encoded video data for temporal analysis")
    
    # Analysis Parameters
    analysis_mode: Literal["single_frame", "temporal_sequence", "real_time"] = Field(
        default="single_frame", 
        description="Type of biofield analysis to perform"
    )
    analysis_depth: Literal["basic", "detailed", "comprehensive"] = Field(
        default="detailed", 
        description="Depth of biofield analysis"
    )
    
    # Metric Selection
    include_spatial_metrics: bool = Field(default=True, description="Include spatial pattern analysis")
    include_temporal_metrics: bool = Field(default=True, description="Include temporal dynamics")
    include_color_analysis: bool = Field(default=True, description="Include color analysis")
    include_composite_scores: bool = Field(default=True, description="Calculate composite scores")
    
    # Integration Options
    integrate_with_face_reading: bool = Field(default=True, description="Cross-validate with face reading")
    integrate_with_vedic: bool = Field(default=True, description="Correlate with Vedic timing")
    integrate_with_tcm: bool = Field(default=True, description="Correlate with TCM organ clock")
    
    # Processing Settings
    noise_reduction: bool = Field(default=True, description="Apply noise reduction algorithms")
    edge_enhancement: bool = Field(default=True, description="Enhance biofield boundaries")
    calibration_mode: Literal["auto", "manual", "reference"] = Field(
        default="auto", 
        description="Calibration method for measurements"
    )
    
    # Privacy & Consent
    biometric_consent: bool = Field(default=False, description="Consent for biometric processing")
    store_analysis_only: bool = Field(default=True, description="Store analysis results only, not raw images")
    
    @field_validator('biometric_consent')
    @classmethod
    def validate_consent(cls, v):
        if not v:
            raise ValueError("Explicit consent required for biofield biometric processing")
        return v
    
    def get_engine_kv_keys(self) -> Dict[str, str]:
        """Generate KV keys for biofield engine data."""
        engine_name = "biofield"
        return {
            'reading': self.generate_user_key(engine_name, 'reading'),
            'analysis': self.generate_user_key(engine_name, 'analysis'),
            'metrics': self.generate_user_key(engine_name, 'metrics'),
            'composite_scores': self.generate_user_key(engine_name, 'scores'),
            'cache': self.generate_cache_key(engine_name),
            'metadata': f"user:{self.user_id}:{engine_name}:metadata"
        }
    
    def get_d1_table_name(self) -> str:
        """Get D1 table name for this engine."""
        return "engine_biofield_readings"


class MultiModalIntegration(BaseModel):
    """Integration results with other WitnessOS consciousness engines."""
    
    # Face Reading Correlation
    constitutional_correlation: Dict[str, float] = Field(
        default_factory=dict, 
        description="Correlation with face reading constitutional analysis"
    )
    five_elements_alignment: Dict[str, float] = Field(
        default_factory=dict, 
        description="Alignment with Five Elements from face reading"
    )
    
    # Vedic Integration
    panchanga_correlation: Dict[str, float] = Field(
        default_factory=dict, 
        description="Correlation with current Vedic panchanga state"
    )
    cosmic_timing_alignment: float = Field(
        default=0.5, 
        description="Alignment with optimal cosmic timing"
    )
    
    # TCM Integration
    organ_clock_correlation: Dict[str, float] = Field(
        default_factory=dict, 
        description="Correlation with TCM organ activity cycles"
    )
    elemental_harmony: float = Field(
        default=0.5, 
        description="Harmony with TCM elemental cycles"
    )
    
    # Unified Assessment
    multi_modal_consistency: float = Field(
        default=0.5, 
        ge=0, le=1, 
        description="Consistency across all consciousness engines"
    )
    unified_recommendations: List[str] = Field(
        default_factory=list, 
        description="Integrated recommendations from all engines"
    )


class BiofieldOutput(CloudflareEngineOutput):
    """Complete Biofield Engine output with multi-modal integration."""
    
    # Core Analysis Results
    biofield_metrics: BiofieldMetrics = Field(..., description="17 core biofield measurements")
    color_analysis: ColorAnalysis = Field(..., description="10 color analysis parameters")
    composite_scores: CompositeScores = Field(..., description="7 composite consciousness scores")
    
    # Multi-Modal Integration
    multi_modal_integration: MultiModalIntegration = Field(
        ..., 
        description="Integration with other WitnessOS engines"
    )
    
    # Analysis Metadata
    image_quality_score: float = Field(..., ge=0, le=1, description="Input image quality assessment")
    processing_time: float = Field(..., description="Analysis processing time in seconds")
    calibration_status: str = Field(..., description="Calibration status and accuracy")
    
    # Temporal Analysis (if applicable)
    temporal_trends: Optional[Dict[str, List[float]]] = Field(
        None, 
        description="Temporal trends in biofield metrics"
    )
    stability_assessment: Optional[float] = Field(
        None, 
        description="Temporal stability of biofield patterns"
    )
    
    # Recommendations
    biofield_optimization: List[str] = Field(
        default_factory=list, 
        description="Specific biofield enhancement recommendations"
    )
    practice_suggestions: List[str] = Field(
        default_factory=list, 
        description="Consciousness practices for biofield improvement"
    )
    
    # Privacy Compliance
    data_retention_policy: str = Field(
        default="analysis_only", 
        description="Data retention policy applied"
    )
    biometric_protection_level: str = Field(
        default="maximum", 
        description="Level of biometric data protection"
    )


# ===== SPECIALIZED MODELS =====

class BiofieldCalibration(BaseModel):
    """Calibration settings for biofield measurements."""
    
    reference_baseline: Optional[Dict[str, float]] = Field(None, description="Reference baseline values")
    environmental_factors: Dict[str, float] = Field(default_factory=dict, description="Environmental corrections")
    equipment_calibration: Dict[str, Any] = Field(default_factory=dict, description="Equipment-specific settings")
    personal_baseline: Optional[Dict[str, float]] = Field(None, description="Individual baseline measurements")


class BiofieldTrends(BaseModel):
    """Temporal trends and patterns in biofield measurements."""
    
    short_term_trends: Dict[str, float] = Field(default_factory=dict, description="Trends over minutes/hours")
    medium_term_trends: Dict[str, float] = Field(default_factory=dict, description="Trends over days/weeks")
    long_term_trends: Dict[str, float] = Field(default_factory=dict, description="Trends over months/years")
    
    cyclical_patterns: List[Dict[str, Any]] = Field(default_factory=list, description="Detected cyclical patterns")
    anomaly_detection: List[Dict[str, Any]] = Field(default_factory=list, description="Detected anomalies")


class BiofieldData(BaseModel):
    """Data container for Biofield engine."""
    
    # Analysis Algorithms
    spatial_algorithms: Dict[str, Any] = Field(default_factory=dict)
    temporal_algorithms: Dict[str, Any] = Field(default_factory=dict)
    color_algorithms: Dict[str, Any] = Field(default_factory=dict)
    
    # Reference Data
    baseline_references: Dict[str, Any] = Field(default_factory=dict)
    calibration_standards: Dict[str, Any] = Field(default_factory=dict)
    
    # Integration Mappings
    face_reading_correlations: Dict[str, Any] = Field(default_factory=dict)
    vedic_correlations: Dict[str, Any] = Field(default_factory=dict)
    tcm_correlations: Dict[str, Any] = Field(default_factory=dict)

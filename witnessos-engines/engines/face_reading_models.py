"""
Face Reading Engine Data Models for WitnessOS

Traditional Chinese Physiognomy analysis combining:
- 12 Houses (十二宫) facial mapping
- Five Elements constitutional analysis
- MediaPipe landmark integration
- Real-time biometric feedback
"""

from datetime import datetime, time, date
from typing import Dict, List, Any, Optional, Literal, Tuple
from pydantic import BaseModel, Field, field_validator

from shared.base.data_models import (
    BaseEngineInput, BaseEngineOutput, BirthDataInput,
    CloudflareEngineInput, CloudflareEngineOutput, BiometricDataConfig
)


# ===== INPUT MODELS =====

class FaceReadingInput(CloudflareEngineInput, BirthDataInput):
    """Input model for Face Reading Engine."""

    # Face Analysis Parameters
    analysis_mode: Literal["photo", "video", "live"] = Field(
        default="photo", 
        description="Analysis mode: photo upload, video file, or live camera"
    )
    
    # Image/Video Data
    image_data: Optional[str] = Field(None, description="Base64 encoded image data")
    video_data: Optional[str] = Field(None, description="Base64 encoded video data")
    
    # Analysis Depth
    analysis_depth: Literal["basic", "detailed", "comprehensive"] = Field(
        default="detailed", 
        description="Depth of physiognomy analysis"
    )
    
    # Traditional Analysis Options
    include_twelve_houses: bool = Field(default=True, description="Include 12 Houses analysis")
    include_five_elements: bool = Field(default=True, description="Include Five Elements constitution")
    include_age_points: bool = Field(default=True, description="Include age point mapping")
    include_health_indicators: bool = Field(default=True, description="Include health correlations")
    
    # Integration Options
    integrate_with_vedic: bool = Field(default=True, description="Integrate with Vedic chart data")
    integrate_with_tcm: bool = Field(default=True, description="Integrate with TCM organ clock")
    
    # Privacy Settings
    store_biometric_data: bool = Field(default=False, description="Store facial landmarks (privacy setting)")
    processing_consent: bool = Field(default=False, description="Explicit consent for biometric processing")

    # Cloudflare-specific biometric settings
    biometric_config: Optional[BiometricDataConfig] = Field(
        default_factory=BiometricDataConfig,
        description="Biometric data handling configuration"
    )
    anonymize_results: bool = Field(default=True, description="Anonymize analysis results for storage")
    max_retention_hours: int = Field(default=24, description="Maximum data retention in hours")

    @field_validator('processing_consent')
    @classmethod
    def validate_consent(cls, v):
        if not v:
            raise ValueError("Explicit consent required for biometric processing")
        return v

    def get_biometric_kv_keys(self) -> Dict[str, str]:
        """Generate KV keys for biometric data storage."""
        return {
            'analysis': self.generate_user_key('face_reading', 'analysis'),
            'constitution': self.generate_user_key('face_reading', 'constitution'),
            'privacy_config': self.generate_user_key('face_reading', 'privacy'),
            'consent': self.generate_user_key('face_reading', 'consent')
        }


# ===== OUTPUT MODELS =====

    def get_engine_kv_keys(self) -> Dict[str, str]:
        """Generate KV keys for facereading engine data."""
        engine_name = "facereading"
        return {
            'reading': self.generate_user_key(engine_name, 'reading'),
            'analysis': self.generate_user_key(engine_name, 'analysis'),
            'cache': self.generate_cache_key(engine_name),
            'metadata': f"user:{self.user_id}:{engine_name}:metadata"
        }
    
    def get_d1_table_name(self) -> str:
        """Get D1 table name for this engine."""
        return "engine_facereading_readings"

class FacialLandmarks(BaseModel):
    """MediaPipe facial landmarks data."""
    total_landmarks: int = Field(..., description="Total number of detected landmarks")
    key_points: Dict[str, Tuple[float, float]] = Field(..., description="Key facial points")
    face_bounds: Dict[str, float] = Field(..., description="Face bounding box coordinates")
    detection_confidence: float = Field(..., description="Face detection confidence score")


class TwelveHousesAnalysis(BaseModel):
    """Traditional Chinese 12 Houses facial analysis."""
    ming_gong: Dict[str, Any] = Field(..., description="命宫 - Life Palace analysis")
    cai_bo_gong: Dict[str, Any] = Field(..., description="財帛宫 - Wealth Palace analysis")
    xiong_di_gong: Dict[str, Any] = Field(..., description="兄弟宫 - Siblings Palace analysis")
    tian_zhai_gong: Dict[str, Any] = Field(..., description="田宅宫 - Property Palace analysis")
    nan_nv_gong: Dict[str, Any] = Field(..., description="男女宫 - Children Palace analysis")
    nu_pu_gong: Dict[str, Any] = Field(..., description="奴僕宫 - Servants Palace analysis")
    qi_qie_gong: Dict[str, Any] = Field(..., description="妻妾宫 - Spouse Palace analysis")
    ji_e_gong: Dict[str, Any] = Field(..., description="疾厄宫 - Health Palace analysis")
    qian_yi_gong: Dict[str, Any] = Field(..., description="遷移宫 - Travel Palace analysis")
    guan_lu_gong: Dict[str, Any] = Field(..., description="官祿宫 - Career Palace analysis")
    fu_de_gong: Dict[str, Any] = Field(..., description="福德宫 - Fortune Palace analysis")
    xiang_mao_gong: Dict[str, Any] = Field(..., description="相貌宫 - Appearance Palace analysis")
    
    overall_harmony: float = Field(..., description="Overall facial harmony score")
    dominant_houses: List[str] = Field(..., description="Most prominent houses")


class FiveElementsConstitution(BaseModel):
    """Five Elements constitutional analysis from facial features."""
    wood_percentage: float = Field(..., description="Wood element percentage (0-100)")
    fire_percentage: float = Field(..., description="Fire element percentage (0-100)")
    earth_percentage: float = Field(..., description="Earth element percentage (0-100)")
    metal_percentage: float = Field(..., description="Metal element percentage (0-100)")
    water_percentage: float = Field(..., description="Water element percentage (0-100)")
    
    dominant_element: str = Field(..., description="Primary constitutional element")
    secondary_element: str = Field(..., description="Secondary constitutional element")
    
    constitutional_type: str = Field(..., description="Traditional constitutional classification")
    temperament_indicators: List[str] = Field(..., description="Personality indicators from facial features")
    health_tendencies: List[str] = Field(..., description="Health predispositions based on constitution")


class AgePointMapping(BaseModel):
    """Traditional age point mapping on facial features."""
    current_age_point: int = Field(..., description="Current age point location")
    age_point_location: str = Field(..., description="Facial area of current age point")
    age_point_quality: str = Field(..., description="Quality assessment of current age point")
    
    life_phase_indicators: Dict[str, str] = Field(..., description="Life phase analysis by facial regions")
    temporal_insights: List[str] = Field(..., description="Time-based insights from age points")
    
    favorable_periods: List[Dict[str, Any]] = Field(..., description="Upcoming favorable periods")
    challenging_periods: List[Dict[str, Any]] = Field(..., description="Periods requiring attention")


class BiometricIntegration(BaseModel):
    """Integration with other WitnessOS consciousness engines."""
    vedic_element_correlation: Dict[str, float] = Field(..., description="Correlation with Vedic elements")
    tcm_organ_correlation: Dict[str, float] = Field(..., description="Correlation with TCM organ systems")
    
    constitutional_recommendations: List[str] = Field(..., description="Personalized recommendations")
    breath_pattern_optimization: List[str] = Field(..., description="Optimal breathing patterns")
    meditation_techniques: List[str] = Field(..., description="Recommended meditation practices")
    
    consciousness_alignment_score: float = Field(..., description="Overall consciousness alignment score")


class FaceReadingOutput(CloudflareEngineOutput):
    """Complete Face Reading Engine output."""
    
    # Core Analysis Results
    facial_landmarks: FacialLandmarks
    twelve_houses: TwelveHousesAnalysis
    five_elements: FiveElementsConstitution
    age_points: AgePointMapping
    biometric_integration: BiometricIntegration
    
    # Traditional Insights
    constitutional_summary: str = Field(..., description="Overall constitutional analysis summary")
    personality_insights: List[str] = Field(..., description="Personality insights from facial features")
    health_recommendations: List[str] = Field(..., description="Health optimization recommendations")
    
    # Temporal Analysis
    current_life_phase: str = Field(..., description="Current life phase based on age points")
    optimal_timing: List[str] = Field(..., description="Optimal timing for various activities")
    
    # Integration Insights
    multi_modal_recommendations: List[str] = Field(..., description="Recommendations combining multiple systems")
    consciousness_optimization: List[str] = Field(..., description="Consciousness development recommendations")
    
    # Privacy & Metadata
    processing_timestamp: str = Field(..., description="Analysis timestamp")
    privacy_compliance: Dict[str, bool] = Field(..., description="Privacy compliance indicators")
    cultural_context: List[str] = Field(..., description="Cultural context and educational information")


# ===== DATA MODELS =====

class FaceReadingData(BaseModel):
    """Data container for Face Reading engine."""
    
    # Traditional Knowledge Base
    twelve_houses_data: Dict[str, Any] = Field(default_factory=dict)
    five_elements_data: Dict[str, Any] = Field(default_factory=dict)
    age_points_data: Dict[str, Any] = Field(default_factory=dict)
    
    # Facial Analysis Parameters
    landmark_mappings: Dict[str, Any] = Field(default_factory=dict)
    proportional_standards: Dict[str, Any] = Field(default_factory=dict)
    
    # Integration Mappings
    vedic_correlations: Dict[str, Any] = Field(default_factory=dict)
    tcm_correlations: Dict[str, Any] = Field(default_factory=dict)
    
    # Cultural Context
    traditional_interpretations: Dict[str, Any] = Field(default_factory=dict)
    educational_content: Dict[str, Any] = Field(default_factory=dict)

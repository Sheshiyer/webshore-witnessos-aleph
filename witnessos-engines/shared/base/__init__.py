"""
Base module for WitnessOS Divination Engines

Provides the foundation classes, data models, and utilities that all engines
build upon.
"""

from .engine_interface import BaseEngine
from .data_models import (
    EngineError,
    ValidationError,
    BaseEngineInput,
    BaseEngineOutput,
    BirthDataInput,
    PersonalDataInput,
    QuestionInput,
    CalculationResult,
    ArchetypalPattern,
    TimelineEvent,
    start_timer,
    end_timer,
    validate_date_range,
    create_field_signature
)
from .utils import (
    get_data_path,
    ensure_data_directory,
    load_json_data,
    save_json_data,
    parse_date_flexible,
    parse_time_flexible,
    reduce_to_single_digit,
    calculate_checksum,
    SeededRandom,
    validate_coordinates,
    validate_name,
    extract_letters_only,
    extract_vowels,
    extract_consonants,
    load_engine_config,
    get_config_value
)

__all__ = [
    # Core classes
    "BaseEngine",
    
    # Exceptions
    "EngineError",
    "ValidationError",
    
    # Data models
    "BaseEngineInput",
    "BaseEngineOutput", 
    "BirthDataInput",
    "PersonalDataInput",
    "QuestionInput",
    "CalculationResult",
    "ArchetypalPattern",
    "TimelineEvent",
    
    # Timing utilities
    "start_timer",
    "end_timer",
    
    # Validation utilities
    "validate_date_range",
    "validate_coordinates",
    "validate_name",
    
    # Data utilities
    "get_data_path",
    "ensure_data_directory",
    "load_json_data",
    "save_json_data",
    "load_engine_config",
    "get_config_value",
    
    # Date/time utilities
    "parse_date_flexible",
    "parse_time_flexible",
    
    # Numerical utilities
    "reduce_to_single_digit",
    "calculate_checksum",
    "create_field_signature",
    
    # Random utilities
    "SeededRandom",
    
    # Text utilities
    "extract_letters_only",
    "extract_vowels",
    "extract_consonants"
]

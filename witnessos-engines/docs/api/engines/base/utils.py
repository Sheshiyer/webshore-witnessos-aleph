"""
Shared utilities for WitnessOS Divination Engines

Common functions and helpers used across multiple engines.
"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from datetime import date, datetime, time
import hashlib
import random
from functools import lru_cache


# Path utilities

def get_data_path(engine_name: str, filename: str) -> Path:
    """
    Get the path to a data file for a specific engine.
    
    Args:
        engine_name: Name of the engine (e.g., 'tarot', 'iching')
        filename: Name of the data file
        
    Returns:
        Path to the data file
    """
    engines_dir = Path(__file__).parent.parent
    return engines_dir / "data" / engine_name / filename


def ensure_data_directory(engine_name: str) -> Path:
    """
    Ensure that the data directory for an engine exists.
    
    Args:
        engine_name: Name of the engine
        
    Returns:
        Path to the data directory
    """
    data_dir = get_data_path(engine_name, "")
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


# Data loading utilities

@lru_cache(maxsize=32)
def load_json_data(engine_name: str, filename: str) -> Dict[str, Any]:
    """
    Load JSON data file for an engine (with caching).
    
    Args:
        engine_name: Name of the engine
        filename: Name of the JSON file (with or without .json extension)
        
    Returns:
        Loaded JSON data
        
    Raises:
        FileNotFoundError: If the file doesn't exist
        json.JSONDecodeError: If the file is not valid JSON
    """
    if not filename.endswith('.json'):
        filename += '.json'
    
    file_path = get_data_path(engine_name, filename)
    
    if not file_path.exists():
        raise FileNotFoundError(f"Data file not found: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json_data(engine_name: str, filename: str, data: Dict[str, Any]) -> None:
    """
    Save data to a JSON file for an engine.
    
    Args:
        engine_name: Name of the engine
        filename: Name of the JSON file (with or without .json extension)
        data: Data to save
    """
    if not filename.endswith('.json'):
        filename += '.json'
    
    ensure_data_directory(engine_name)
    file_path = get_data_path(engine_name, filename)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False, default=str)


# Date and time utilities

def parse_date_flexible(date_input: Union[str, date, datetime]) -> date:
    """
    Parse a date from various input formats.
    
    Args:
        date_input: Date in various formats
        
    Returns:
        Parsed date object
        
    Raises:
        ValueError: If the date cannot be parsed
    """
    if isinstance(date_input, date):
        return date_input
    elif isinstance(date_input, datetime):
        return date_input.date()
    elif isinstance(date_input, str):
        # Try common date formats
        formats = [
            "%Y-%m-%d",
            "%m/%d/%Y", 
            "%d/%m/%Y",
            "%Y/%m/%d",
            "%B %d, %Y",
            "%d %B %Y",
            "%m-%d-%Y",
            "%d-%m-%Y"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(date_input, fmt).date()
            except ValueError:
                continue
        
        raise ValueError(f"Could not parse date: {date_input}")
    else:
        raise ValueError(f"Invalid date type: {type(date_input)}")


def parse_time_flexible(time_input: Union[str, time, datetime]) -> Optional[time]:
    """
    Parse a time from various input formats.
    
    Args:
        time_input: Time in various formats
        
    Returns:
        Parsed time object or None if parsing fails
    """
    if time_input is None:
        return None
    elif isinstance(time_input, time):
        return time_input
    elif isinstance(time_input, datetime):
        return time_input.time()
    elif isinstance(time_input, str):
        # Try common time formats
        formats = [
            "%H:%M:%S",
            "%H:%M",
            "%I:%M:%S %p",
            "%I:%M %p",
            "%H.%M",
            "%H:%M:%S.%f"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(time_input, fmt).time()
            except ValueError:
                continue
        
        return None
    else:
        return None


# Numerical utilities

def reduce_to_single_digit(number: int, keep_master: bool = True) -> int:
    """
    Reduce a number to a single digit (numerology reduction).
    
    Args:
        number: Number to reduce
        keep_master: Whether to keep master numbers (11, 22, 33)
        
    Returns:
        Reduced number
    """
    if keep_master and number in [11, 22, 33]:
        return number
    
    while number > 9:
        number = sum(int(digit) for digit in str(number))
        if keep_master and number in [11, 22, 33]:
            break
    
    return number


def calculate_checksum(data: str) -> str:
    """
    Calculate a simple checksum for data integrity.
    
    Args:
        data: String data to checksum
        
    Returns:
        Hexadecimal checksum
    """
    return hashlib.md5(data.encode()).hexdigest()[:8]


# Random utilities with seeding

class SeededRandom:
    """Random number generator with optional seeding for reproducible results."""
    
    def __init__(self, seed: Optional[int] = None):
        self.random = random.Random(seed)
        self.seed = seed
    
    def choice(self, sequence: List[Any]) -> Any:
        """Choose a random element from a sequence."""
        return self.random.choice(sequence)
    
    def choices(self, sequence: List[Any], k: int = 1) -> List[Any]:
        """Choose k random elements from a sequence."""
        return self.random.choices(sequence, k=k)
    
    def shuffle(self, sequence: List[Any]) -> List[Any]:
        """Return a shuffled copy of the sequence."""
        shuffled = sequence.copy()
        self.random.shuffle(shuffled)
        return shuffled
    
    def randint(self, a: int, b: int) -> int:
        """Return a random integer between a and b (inclusive)."""
        return self.random.randint(a, b)
    
    def random_float(self) -> float:
        """Return a random float between 0 and 1."""
        return self.random.random()

    def uniform(self, a: float, b: float) -> float:
        """Return a random float between a and b."""
        return self.random.uniform(a, b)


# Validation utilities

def validate_coordinates(latitude: float, longitude: float) -> bool:
    """
    Validate geographic coordinates.
    
    Args:
        latitude: Latitude in degrees
        longitude: Longitude in degrees
        
    Returns:
        True if valid
        
    Raises:
        ValueError: If coordinates are invalid
    """
    if not (-90 <= latitude <= 90):
        raise ValueError(f"Invalid latitude: {latitude}. Must be between -90 and 90.")
    
    if not (-180 <= longitude <= 180):
        raise ValueError(f"Invalid longitude: {longitude}. Must be between -180 and 180.")
    
    return True


def validate_name(name: str) -> str:
    """
    Validate and clean a name string.
    
    Args:
        name: Name to validate
        
    Returns:
        Cleaned name
        
    Raises:
        ValueError: If name is invalid
    """
    if not name or not name.strip():
        raise ValueError("Name cannot be empty")
    
    cleaned = name.strip()
    
    if len(cleaned) < 1:
        raise ValueError("Name must contain at least one character")
    
    return cleaned


# Text processing utilities

def extract_letters_only(text: str) -> str:
    """
    Extract only letters from text (for numerology calculations).
    
    Args:
        text: Input text
        
    Returns:
        Text with only letters
    """
    return ''.join(char for char in text if char.isalpha())


def extract_vowels(text: str) -> str:
    """
    Extract only vowels from text.
    
    Args:
        text: Input text
        
    Returns:
        Text with only vowels
    """
    vowels = 'AEIOU'
    return ''.join(char for char in text.upper() if char in vowels)


def extract_consonants(text: str) -> str:
    """
    Extract only consonants from text.
    
    Args:
        text: Input text
        
    Returns:
        Text with only consonants
    """
    vowels = 'AEIOU'
    return ''.join(char for char in text.upper() if char.isalpha() and char not in vowels)


# Configuration utilities

def load_engine_config(engine_name: str) -> Dict[str, Any]:
    """
    Load configuration for a specific engine.
    
    Args:
        engine_name: Name of the engine
        
    Returns:
        Configuration dictionary
    """
    try:
        return load_json_data(engine_name, "config")
    except FileNotFoundError:
        return {}


def get_config_value(config: Dict[str, Any], key: str, default: Any = None) -> Any:
    """
    Get a configuration value with dot notation support.
    
    Args:
        config: Configuration dictionary
        key: Key (supports dot notation like 'section.subsection.key')
        default: Default value if key not found
        
    Returns:
        Configuration value or default
    """
    keys = key.split('.')
    value = config
    
    for k in keys:
        if isinstance(value, dict) and k in value:
            value = value[k]
        else:
            return default
    
    return value


# Export all utilities
__all__ = [
    "get_data_path",
    "ensure_data_directory",
    "load_json_data",
    "save_json_data",
    "parse_date_flexible",
    "parse_time_flexible",
    "reduce_to_single_digit",
    "calculate_checksum",
    "SeededRandom",
    "validate_coordinates",
    "validate_name",
    "extract_letters_only",
    "extract_vowels",
    "extract_consonants",
    "load_engine_config",
    "get_config_value"
]

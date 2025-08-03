#!/usr/bin/env python3
"""
Debug script to check if Swiss Ephemeris is being used.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'witnessos-engines'))

from datetime import datetime
from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput
import logging

# Set up logging to see what's happening
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(name)s - %(message)s')

def check_swiss_usage():
    """Check if Swiss Ephemeris is being used."""
    
    print("🔍 CHECKING SWISS EPHEMERIS USAGE")
    print("=" * 40)
    
    # Initialize scanner
    scanner = HumanDesignScanner()
    
    print(f"Swiss calc available: {scanner.swiss_calc is not None}")
    if scanner.swiss_calc is not None:
        print(f"Swiss calc type: {type(scanner.swiss_calc)}")
    
    # Test calculation
    birth_datetime = datetime(1991, 8, 13, 13, 31, 0)
    latitude = 12.9716
    longitude = 77.5946
    timezone_str = "Asia/Kolkata"
    
    input_data = HumanDesignInput(
        birth_date=birth_datetime.date(),
        birth_time=birth_datetime.time(),
        birth_location=(latitude, longitude),
        timezone=timezone_str
    )
    
    print("\nRunning calculation...")
    result = scanner.calculate(input_data)
    
    print(f"\nPersonality Sun: Gate {result.chart.personality_gates['sun'].number}")
    print(f"Design Sun: Gate {result.chart.design_gates['sun'].number}")

if __name__ == "__main__":
    check_swiss_usage()
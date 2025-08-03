#!/usr/bin/env python3
"""
Simple Human Design Test Script
Tests the Human Design calculation for specific birth data to verify profile and incarnation cross.
"""

import sys
import os
from datetime import date, time

# Add the engines directory to the path
sys.path.insert(0, '/Users/sheshnarayaniyer/2025/witnessos/WitnessOS/webshore/witnessos-engines')

from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput

def test_human_design():
    """Test Human Design calculation with specific birth data."""
    
    # Create engine instance
    engine = HumanDesignScanner()
    
    # Test data - using a known birth date for verification
    test_input = HumanDesignInput(
        birth_date=date(1991, 8, 13),
        birth_time=time(13, 31, 0),
        birth_location=(11.0168, 76.9558),  # Coimbatore, India
        timezone="Asia/Kolkata"
    )
    
    print("Testing Human Design calculation...")
    print(f"Birth Date: {test_input.birth_date}")
    print(f"Birth Time: {test_input.birth_time}")
    print(f"Birth Location: {test_input.birth_location}")
    print(f"Timezone: {test_input.timezone}")
    print("-" * 50)
    
    try:
        # Calculate Human Design
        result = engine.calculate(test_input)
        
        print(f"Engine: {result.engine_name}")
        print(f"Confidence: {result.confidence_score}")
        print(f"Calculation Time: {result.calculation_time}s")
        print("-" * 50)
        
        # Print chart information
        chart = result.chart
        print("CHART INFORMATION:")
        print(f"Type: {chart.type_info.type_name}")
        print(f"Strategy: {chart.type_info.strategy}")
        print(f"Authority: {chart.type_info.authority}")
        print()
        
        # Print profile information
        profile = chart.profile
        print("PROFILE INFORMATION:")
        print(f"Profile: {profile.profile_name}")
        print(f"Personality Line: {profile.personality_line}")
        print(f"Design Line: {profile.design_line}")
        print(f"Description: {profile.description}")
        print()
        
        # Print incarnation cross
        cross = chart.incarnation_cross
        print("INCARNATION CROSS:")
        if isinstance(cross, dict):
            print(f"Name: {cross.get('name', 'Unknown')}")
            print(f"Description: {cross.get('description', 'No description')}")
            print(f"Gates: {cross.get('gates', [])}")
        else:
            print(f"Name: {cross.name}")
            print(f"Description: {cross.description}")
            print(f"Gates: {cross.gates}")
        print()
        
        # Print personality gates (Sun and Earth)
        print("PERSONALITY GATES:")
        if 'sun' in chart.personality_gates:
            sun_gate = chart.personality_gates['sun']
            print(f"Sun: Gate {sun_gate.number}.{sun_gate.line} - {sun_gate.name}")
        if 'earth' in chart.personality_gates:
            earth_gate = chart.personality_gates['earth']
            print(f"Earth: Gate {earth_gate.number}.{earth_gate.line} - {earth_gate.name}")
        print()
        
        # Print design gates (Sun and Earth)
        print("DESIGN GATES:")
        if 'sun' in chart.design_gates:
            sun_gate = chart.design_gates['sun']
            print(f"Sun: Gate {sun_gate.number}.{sun_gate.line} - {sun_gate.name}")
        if 'earth' in chart.design_gates:
            earth_gate = chart.design_gates['earth']
            print(f"Earth: Gate {earth_gate.number}.{earth_gate.line} - {earth_gate.name}")
        print()
        
        return result
        
    except Exception as e:
        print(f"Error during calculation: {e}")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    test_human_design()
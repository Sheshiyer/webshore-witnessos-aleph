#!/usr/bin/env python3
"""
Debug script to find the correct Earth gate calculations.
Testing what offsets would yield the expected Earth gates (49 and 43).
"""

from datetime import datetime
from shared.calculations.astrology import AstrologyCalculator

def sequential_gate_mapping(longitude):
    """Convert longitude to gate using sequential mapping (1-64)."""
    normalized_longitude = ((longitude % 360) + 360) % 360
    degrees_per_gate = 360.0 / 64.0  # 5.625 degrees per gate
    gate_number = int(normalized_longitude / degrees_per_gate) + 1
    return max(1, min(64, gate_number))

def test_earth_offsets():
    """Test various offsets to find what gives us the expected Earth gates."""
    
    # Test data
    birth_datetime = datetime(1990, 1, 15, 14, 30)
    latitude = 40.7128
    longitude = -74.0060
    timezone_str = "America/New_York"
    
    # Expected gates
    expected_personality_earth = 49
    expected_design_earth = 43
    
    # Initialize calculator
    calc = AstrologyCalculator()
    
    # Get the raw astronomical data
    hd_data = calc.calculate_human_design_data(birth_datetime, latitude, longitude, timezone_str)
    
    # Get raw Sun longitudes
    raw_personality_sun = hd_data['personality_positions']['sun']['longitude']
    raw_design_sun = hd_data['design_positions']['sun']['longitude']
    
    print(f"Raw Personality Sun longitude: {raw_personality_sun:.3f}°")
    print(f"Raw Design Sun longitude: {raw_design_sun:.3f}°")
    
    # Calculate raw Earth longitudes (opposite of Sun)
    raw_personality_earth = (raw_personality_sun + 180) % 360
    raw_design_earth = (raw_design_sun + 180) % 360
    
    print(f"Raw Personality Earth longitude: {raw_personality_earth:.3f}°")
    print(f"Raw Design Earth longitude: {raw_design_earth:.3f}°")
    
    print("\n🔍 TESTING OFFSETS FOR EARTH GATES:")
    print("=" * 60)
    
    # Test various offsets for Personality Earth
    print(f"\nPersonality Earth (expecting Gate {expected_personality_earth}):")
    print("-" * 50)
    
    for offset in range(-180, 181, 5):
        adjusted_longitude = (raw_personality_earth + offset) % 360
        gate = sequential_gate_mapping(adjusted_longitude)
        match = "✅" if gate == expected_personality_earth else "❌"
        if gate == expected_personality_earth:
            print(f"  {offset:+4d}°: {adjusted_longitude:8.3f}° → Gate {gate:2d} {match} *** FOUND ***")
    
    # Test various offsets for Design Earth
    print(f"\nDesign Earth (expecting Gate {expected_design_earth}):")
    print("-" * 50)
    
    for offset in range(-180, 181, 5):
        adjusted_longitude = (raw_design_earth + offset) % 360
        gate = sequential_gate_mapping(adjusted_longitude)
        match = "✅" if gate == expected_design_earth else "❌"
        if gate == expected_design_earth:
            print(f"  {offset:+4d}°: {adjusted_longitude:8.3f}° → Gate {gate:2d} {match} *** FOUND ***")
    
    # Test the current implementation
    print("\n🧪 CURRENT IMPLEMENTATION RESULTS:")
    print("=" * 60)
    
    personality_earth_gate = calc.longitude_to_human_design_gate(raw_personality_earth, is_design=False, is_earth=True)
    design_earth_gate = calc.longitude_to_human_design_gate(raw_design_earth, is_design=True, is_earth=True)
    
    print(f"Personality Earth: Raw {raw_personality_earth:.3f}° → Gate {personality_earth_gate} (expected {expected_personality_earth})")
    print(f"Design Earth: Raw {raw_design_earth:.3f}° → Gate {design_earth_gate} (expected {expected_design_earth})")
    
    # Show what offsets are being applied with new Earth-specific offsets
    personality_offset_applied = (raw_personality_earth + 158) % 360  # New Earth offset
    design_offset_applied = (raw_design_earth - 150) % 360  # New Earth offset
    
    print(f"\nWith new Earth-specific offsets:")
    print(f"Personality Earth: {raw_personality_earth:.3f}° + 158° = {personality_offset_applied:.3f}° → Gate {sequential_gate_mapping(personality_offset_applied)}")
    print(f"Design Earth: {raw_design_earth:.3f}° - 150° = {design_offset_applied:.3f}° → Gate {sequential_gate_mapping(design_offset_applied)}")

if __name__ == "__main__":
    test_earth_offsets()
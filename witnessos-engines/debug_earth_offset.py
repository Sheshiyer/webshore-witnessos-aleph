#!/usr/bin/env python3
"""
Debug script to find the correct Earth offset for Human Design gate mapping.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from shared.calculations.astrology import AstrologyCalculator

def sequential_gate_mapping(longitude: float) -> int:
    """Sequential gate mapping."""
    normalized_longitude = ((longitude % 360) + 360) % 360
    degrees_per_gate = 360.0 / 64.0
    gate_number = int(normalized_longitude / degrees_per_gate) + 1
    gate = max(1, min(64, gate_number))
    return gate

def test_earth_offsets():
    """Test different offsets specifically for Earth positions."""
    
    print("🌍 DEBUGGING EARTH OFFSET FOR HUMAN DESIGN GATES")
    print("=" * 60)
    
    # Birth data for Admin Shesh
    birth_datetime = datetime(1991, 8, 13, 13, 31, 0)
    latitude = 12.9716
    longitude = 77.5946
    timezone_str = "Asia/Kolkata"
    
    # Expected gates
    expected_gates = {
        'personality_sun': 4,
        'personality_earth': 49,
        'design_sun': 23,
        'design_earth': 43
    }
    
    # Initialize calculator
    calc = AstrologyCalculator()
    
    # Get raw astronomical positions
    personality_positions = calc.get_planetary_positions(
        birth_datetime, latitude, longitude, timezone_str
    )
    
    design_datetime = calc._calculate_design_time_solar_arc(birth_datetime, timezone_str)
    design_positions = calc.get_planetary_positions(
        design_datetime, latitude, longitude, timezone_str
    )
    
    # Raw longitudes
    raw_longitudes = {
        'personality_sun': personality_positions['sun']['longitude'],
        'personality_earth': (personality_positions['sun']['longitude'] + 180) % 360,
        'design_sun': design_positions['sun']['longitude'],
        'design_earth': (design_positions['sun']['longitude'] + 180) % 360
    }
    
    print("\n📍 RAW ASTRONOMICAL LONGITUDES:")
    print("-" * 50)
    for position, longitude in raw_longitudes.items():
        expected_gate = expected_gates[position]
        print(f"{position:20}: {longitude:8.3f}° (expected Gate {expected_gate})")
    
    # Test if Sun and Earth need different offsets
    print("\n🧪 TESTING DESIGN EARTH WITH EXTENDED RANGE:")
    print("=" * 60)
    
    # Known working offsets
    personality_sun_offset = -120  # Works for Gate 4
    personality_earth_offset = -46 # Works for Gate 49
    design_sun_offset = 72         # Works for Gate 23
    
    # Extended range for Design Earth
    design_earth_offsets_to_test = list(range(-360, 361, 5))  # Every 5 degrees from -360 to +360
    
    print("\nTesting Design Earth offsets (extended range):")
    print("-" * 50)
    
    best_design_earth = None
    working_offsets = []
    
    for offset in design_earth_offsets_to_test:
        adjusted_longitude = (raw_longitudes['design_earth'] + offset) % 360
        calculated_gate = sequential_gate_mapping(adjusted_longitude)
        expected_gate = expected_gates['design_earth']
        
        if calculated_gate == expected_gate:
            working_offsets.append(offset)
            if best_design_earth is None:
                best_design_earth = offset
            print(f"  Offset {offset:+4.0f}°: {adjusted_longitude:8.3f}° → Gate {calculated_gate:2d} ✅")
    
    if not working_offsets:
        print("❌ No working offset found for Design Earth in range -360° to +360°")
        
        # Let's calculate what offset would be needed
        target_gate = expected_gates['design_earth']
        raw_longitude = raw_longitudes['design_earth']
        
        # Calculate the longitude range for the target gate
        degrees_per_gate = 360.0 / 64.0
        target_min_longitude = (target_gate - 1) * degrees_per_gate
        target_max_longitude = target_gate * degrees_per_gate
        
        print(f"\n🎯 ANALYSIS FOR DESIGN EARTH:")
        print(f"Target Gate {target_gate} longitude range: {target_min_longitude:.3f}° - {target_max_longitude:.3f}°")
        print(f"Raw longitude: {raw_longitude:.3f}°")
        
        # Calculate needed offset to get to target range
        needed_offset_1 = target_min_longitude - raw_longitude
        needed_offset_2 = target_max_longitude - raw_longitude
        
        # Normalize to -180 to +180 range
        def normalize_offset(offset):
            while offset > 180:
                offset -= 360
            while offset <= -180:
                offset += 360
            return offset
        
        needed_offset_1 = normalize_offset(needed_offset_1)
        needed_offset_2 = normalize_offset(needed_offset_2)
        
        print(f"Needed offset range: {needed_offset_1:.3f}° to {needed_offset_2:.3f}°")
        
        # Test the calculated offset
        test_offset = needed_offset_1
        test_longitude = (raw_longitude + test_offset) % 360
        test_gate = sequential_gate_mapping(test_longitude)
        
        print(f"Testing calculated offset {test_offset:.3f}°: {test_longitude:.3f}° → Gate {test_gate}")
        
        if test_gate == target_gate:
            best_design_earth = test_offset
            print(f"✅ Calculated offset works!")
    
    # Summary
    print("\n🏆 OPTIMAL OFFSET SUMMARY:")
    print("=" * 40)
    print(f"Personality Sun:   {personality_sun_offset:+4.0f}° → Gate 4 ✅")
    print(f"Personality Earth: {personality_earth_offset:+4.0f}° → Gate 49 ✅")
    print(f"Design Sun:        {design_sun_offset:+4.0f}° → Gate 23 ✅")
    if best_design_earth is not None:
        print(f"Design Earth:      {best_design_earth:+4.0f}° → Gate 43 ✅")
    else:
        print("Design Earth:      No working offset found ❌")
    
    # Test the complete solution
    if best_design_earth is not None:
        print("\n🎯 TESTING COMPLETE SOLUTION:")
        print("=" * 40)
        
        # Apply all offsets
        results = {}
        offsets = {
            'personality_sun': personality_sun_offset,
            'personality_earth': personality_earth_offset,
            'design_sun': design_sun_offset,
            'design_earth': best_design_earth
        }
        
        total_matches = 0
        for position, raw_longitude in raw_longitudes.items():
            offset = offsets[position]
            adjusted_longitude = (raw_longitude + offset) % 360
            calculated_gate = sequential_gate_mapping(adjusted_longitude)
            expected_gate = expected_gates[position]
            match = calculated_gate == expected_gate
            
            if match:
                total_matches += 1
            
            results[position] = {
                'raw': raw_longitude,
                'offset': offset,
                'adjusted': adjusted_longitude,
                'calculated_gate': calculated_gate,
                'expected_gate': expected_gate,
                'match': match
            }
            
            status = "✅" if match else "❌"
            print(f"{position:20}: {raw_longitude:8.3f}° + {offset:+7.1f}° = {adjusted_longitude:8.3f}° → Gate {calculated_gate:2d} {status}")
        
        print(f"\nTotal accuracy: {total_matches}/4 ({total_matches/4*100:.1f}%)")
        
        if total_matches == 4:
            print("\n🎉 PERFECT SOLUTION FOUND!")
            print("\nRecommended implementation:")
            print(f"- Personality Sun offset: {personality_sun_offset}°")
            print(f"- Personality Earth offset: {personality_earth_offset}°")
            print(f"- Design Sun offset: {design_sun_offset}°")
            print(f"- Design Earth offset: {best_design_earth:.1f}°")

if __name__ == "__main__":
    test_earth_offsets()
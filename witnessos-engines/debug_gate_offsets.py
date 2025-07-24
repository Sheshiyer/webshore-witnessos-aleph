#!/usr/bin/env python3
"""
Debug script to test different coordinate offsets for Human Design gate mapping.
Based on the astronomical accuracy breakthrough documentation.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime
from shared.calculations.astrology import AstrologyCalculator

def sequential_gate_mapping(longitude: float) -> int:
    """Sequential gate mapping as per breakthrough documentation."""
    # Normalize longitude to 0-360°
    normalized_longitude = ((longitude % 360) + 360) % 360
    
    # Each gate covers exactly 5.625° (360° ÷ 64 gates)
    degrees_per_gate = 360.0 / 64.0
    
    # Calculate gate number (1-64) - SEQUENTIAL!
    gate_number = int(normalized_longitude / degrees_per_gate) + 1
    gate = max(1, min(64, gate_number))
    
    return gate

def test_coordinate_offsets():
    """Test different coordinate offsets to find the correct mapping."""
    
    print("🔍 DEBUGGING COORDINATE OFFSETS FOR HUMAN DESIGN GATES")
    print("=" * 70)
    
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
        raw_gate = sequential_gate_mapping(longitude)
        print(f"{position:20}: {longitude:8.3f}° → Gate {raw_gate:2d} (expected {expected_gate})")
    
    # Test different offsets based on documentation
    offsets_to_test = [
        ("No offset", 0),
        ("Personality -120°", -120),
        ("Design +72°", 72),
        ("+46° (current)", 46),
        ("-46°", -46),
        ("+90°", 90),
        ("-90°", -90),
        ("+180°", 180),
        ("-180°", -180)
    ]
    
    print("\n🧪 TESTING DIFFERENT COORDINATE OFFSETS:")
    print("=" * 70)
    
    best_matches = {}
    
    for offset_name, offset in offsets_to_test:
        print(f"\n{offset_name} ({offset:+.0f}°):")
        print("-" * 40)
        
        matches = 0
        total = 4
        
        for position, raw_longitude in raw_longitudes.items():
            # Apply offset
            adjusted_longitude = (raw_longitude + offset) % 360
            calculated_gate = sequential_gate_mapping(adjusted_longitude)
            expected_gate = expected_gates[position]
            
            match = "✅" if calculated_gate == expected_gate else "❌"
            if calculated_gate == expected_gate:
                matches += 1
            
            print(f"  {position:20}: {adjusted_longitude:8.3f}° → Gate {calculated_gate:2d} {match}")
        
        accuracy = matches / total * 100
        print(f"  Accuracy: {matches}/{total} ({accuracy:.1f}%)")
        
        if matches > 0:
            best_matches[offset_name] = (matches, accuracy, offset)
    
    # Show best results
    if best_matches:
        print("\n🏆 BEST OFFSET RESULTS:")
        print("-" * 40)
        
        sorted_matches = sorted(best_matches.items(), key=lambda x: x[1][0], reverse=True)
        for offset_name, (matches, accuracy, offset) in sorted_matches[:3]:
            print(f"{offset_name}: {matches}/4 gates ({accuracy:.1f}%) with {offset:+.0f}° offset")
    
    # Test specific offsets for Personality vs Design
    print("\n🎯 TESTING PERSONALITY vs DESIGN SPECIFIC OFFSETS:")
    print("=" * 60)
    
    # Test Personality with -120° and Design with +72° as per documentation
    personality_offset = -120
    design_offset = 72
    
    print(f"\nPersonality calculations with {personality_offset:+.0f}° offset:")
    for position in ['personality_sun', 'personality_earth']:
        raw_longitude = raw_longitudes[position]
        adjusted_longitude = (raw_longitude + personality_offset) % 360
        calculated_gate = sequential_gate_mapping(adjusted_longitude)
        expected_gate = expected_gates[position]
        match = "✅" if calculated_gate == expected_gate else "❌"
        print(f"  {position:20}: {adjusted_longitude:8.3f}° → Gate {calculated_gate:2d} {match}")
    
    print(f"\nDesign calculations with {design_offset:+.0f}° offset:")
    for position in ['design_sun', 'design_earth']:
        raw_longitude = raw_longitudes[position]
        adjusted_longitude = (raw_longitude + design_offset) % 360
        calculated_gate = sequential_gate_mapping(adjusted_longitude)
        expected_gate = expected_gates[position]
        match = "✅" if calculated_gate == expected_gate else "❌"
        print(f"  {position:20}: {adjusted_longitude:8.3f}° → Gate {calculated_gate:2d} {match}")

if __name__ == "__main__":
    test_coordinate_offsets()
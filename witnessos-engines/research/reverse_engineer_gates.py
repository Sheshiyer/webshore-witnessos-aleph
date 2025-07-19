#!/usr/bin/env python3
"""
Reverse engineer the correct gate mapping by working backwards from known incarnation cross.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
from calculations.astrology import AstrologyCalculator

def reverse_engineer_mapping():
    """
    Work backwards from known incarnation cross to find the correct gate mapping.
    """
    
    print("🔍 Reverse Engineering Gate Mapping")
    print("=" * 50)
    
    # Known data
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)
    birth_location = (12.9716, 77.5946)
    timezone = "Asia/Kolkata"
    
    # Expected incarnation cross
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    birth_datetime = datetime.combine(birth_date, birth_time)
    lat, lon = birth_location
    
    calc = AstrologyCalculator()
    
    # Get actual planetary positions
    personality_positions = calc.get_planetary_positions(
        birth_datetime, lat, lon, timezone
    )
    
    design_datetime = birth_datetime - timedelta(days=88)
    design_positions = calc.get_planetary_positions(
        design_datetime, lat, lon, timezone
    )
    
    print("Actual Planetary Positions:")
    print(f"Personality Sun: {personality_positions['sun']['longitude']:.6f}°")
    print(f"Personality Earth: {(personality_positions['sun']['longitude'] + 180) % 360:.6f}°")
    print(f"Design Sun: {design_positions['sun']['longitude']:.6f}°")
    print(f"Design Earth: {(design_positions['sun']['longitude'] + 180) % 360:.6f}°")
    print()
    
    # Calculate what the gate ranges should be for the expected gates
    print("Required Gate Ranges for Expected Incarnation Cross:")
    print("-" * 55)
    
    positions = {
        'conscious_sun': personality_positions['sun']['longitude'],
        'conscious_earth': (personality_positions['sun']['longitude'] + 180) % 360,
        'unconscious_sun': design_positions['sun']['longitude'],
        'unconscious_earth': (design_positions['sun']['longitude'] + 180) % 360
    }
    
    for gate_type, longitude in positions.items():
        expected_gate = expected_gates[gate_type]
        print(f"{gate_type:>15}: {longitude:>10.6f}° should be Gate {expected_gate}")
        
        # Calculate what the gate range should be
        # If we assume 360° / 64 gates = 5.625° per gate
        standard_gate_size = 360.0 / 64.0
        standard_gate_start = (expected_gate - 1) * standard_gate_size
        standard_gate_end = expected_gate * standard_gate_size
        
        print(f"                   Standard range for Gate {expected_gate}: {standard_gate_start:.6f}° - {standard_gate_end:.6f}°")
        
        # Check if actual position falls in standard range
        if standard_gate_start <= longitude <= standard_gate_end:
            print(f"                   ✅ Position fits standard calculation")
        else:
            # Calculate the offset needed
            gate_center = standard_gate_start + (standard_gate_size / 2)
            offset = longitude - gate_center
            print(f"                   ❌ Offset needed: {offset:.6f}° ({offset/standard_gate_size:.3f} gates)")
        print()
    
    # Try to find a systematic offset
    print("Analyzing Systematic Offset:")
    print("-" * 30)
    
    offsets = []
    for gate_type, longitude in positions.items():
        expected_gate = expected_gates[gate_type]
        standard_gate_size = 360.0 / 64.0
        standard_gate_center = (expected_gate - 1) * standard_gate_size + (standard_gate_size / 2)
        offset = longitude - standard_gate_center
        offsets.append(offset)
        print(f"{gate_type}: {offset:.6f}° offset")
    
    avg_offset = sum(offsets) / len(offsets)
    print(f"\nAverage offset: {avg_offset:.6f}°")
    print(f"Offset in gates: {avg_offset / standard_gate_size:.3f}")
    
    # Test if a consistent offset works
    print(f"\nTesting with {avg_offset:.6f}° offset:")
    print("-" * 40)
    
    for gate_type, longitude in positions.items():
        adjusted_longitude = (longitude - avg_offset) % 360
        calculated_gate = int(adjusted_longitude / standard_gate_size) + 1
        if calculated_gate > 64:
            calculated_gate -= 64
        expected_gate = expected_gates[gate_type]
        
        match = "✅" if calculated_gate == expected_gate else "❌"
        print(f"{gate_type}: {longitude:.6f}° - {avg_offset:.6f}° = {adjusted_longitude:.6f}° → Gate {calculated_gate} (expected {expected_gate}) {match}")
    
    # Try different starting points for the gate wheel
    print(f"\nTesting Different Gate Wheel Starting Points:")
    print("-" * 45)
    
    for start_offset in [0, 15, 30, 45, 60, 75, 90]:
        print(f"\nStarting wheel at {start_offset}°:")
        matches = 0
        for gate_type, longitude in positions.items():
            adjusted_longitude = (longitude + start_offset) % 360
            calculated_gate = int(adjusted_longitude / standard_gate_size) + 1
            if calculated_gate > 64:
                calculated_gate -= 64
            expected_gate = expected_gates[gate_type]
            
            if calculated_gate == expected_gate:
                matches += 1
            
            print(f"  {gate_type}: Gate {calculated_gate} (expected {expected_gate})")
        
        print(f"  Matches: {matches}/4")
        if matches == 4:
            print(f"  🎯 PERFECT MATCH with {start_offset}° offset!")

if __name__ == "__main__":
    reverse_engineer_mapping()

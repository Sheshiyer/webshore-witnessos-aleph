#!/usr/bin/env python3
"""
Test different ephemeris and calculation methods to match HumDes.com.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
from calculations.astrology import AstrologyCalculator
import pytz

def test_ephemeris_differences():
    """
    Test different ephemeris and calculation approaches.
    """
    
    print("🔍 Testing Different Ephemeris and Calculation Methods")
    print("=" * 60)
    
    # Expected results from HumDes.com
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    # Birth data
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)  # Local time
    lat, lon = 12.9716, 77.5946  # Bengaluru
    
    calc = AstrologyCalculator()
    
    print("Testing different time interpretations and ephemeris...")
    print()
    
    # Test 1: Different timezone handling
    test_cases = [
        ("Local time with timezone", datetime.combine(birth_date, birth_time), "Asia/Kolkata"),
        ("UTC time from chart", datetime.combine(birth_date, time(8, 1)), None),
        ("Local time as UTC", datetime.combine(birth_date, birth_time), None),
    ]
    
    for case_name, birth_datetime, timezone_str in test_cases:
        print(f"📅 {case_name}")
        print(f"   Birth: {birth_datetime} ({timezone_str or 'UTC'})")
        
        try:
            # Calculate design time (88 days before)
            design_datetime = birth_datetime - timedelta(days=88)
            
            # Get positions
            personality_positions = calc.get_planetary_positions(
                birth_datetime, lat, lon, timezone_str
            )
            design_positions = calc.get_planetary_positions(
                design_datetime, lat, lon, timezone_str
            )
            
            print(f"   Design: {design_datetime}")
            print(f"   Personality Sun: {personality_positions['sun']['longitude']:.6f}°")
            print(f"   Design Sun: {design_positions['sun']['longitude']:.6f}°")
            
            # Test different gate mapping approaches
            test_gate_mappings(personality_positions, design_positions, expected_gates)
            print()
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            print()
    
    # Test 2: Different design calculation (maybe not exactly 88 days?)
    print("🔍 Testing different design calculation periods:")
    print("-" * 50)
    
    birth_datetime = datetime.combine(birth_date, birth_time)
    
    for days_offset in [87, 88, 89, 88.0, 88.25, 88.5, 88.75]:
        print(f"\n📅 Design offset: {days_offset} days")
        
        try:
            design_datetime = birth_datetime - timedelta(days=days_offset)
            
            personality_positions = calc.get_planetary_positions(
                birth_datetime, lat, lon, "Asia/Kolkata"
            )
            design_positions = calc.get_planetary_positions(
                design_datetime, lat, lon, "Asia/Kolkata"
            )
            
            print(f"   Design: {design_datetime}")
            print(f"   Design Sun: {design_positions['sun']['longitude']:.6f}°")
            
            # Quick test with standard mapping
            gate_size = 360.0 / 64.0
            positions = {
                'conscious_sun': personality_positions['sun']['longitude'],
                'conscious_earth': (personality_positions['sun']['longitude'] + 180) % 360,
                'unconscious_sun': design_positions['sun']['longitude'],
                'unconscious_earth': (design_positions['sun']['longitude'] + 180) % 360
            }
            
            gates = {}
            matches = 0
            for gate_type, longitude in positions.items():
                gate = int(longitude / gate_size) + 1
                if gate > 64:
                    gate -= 64
                gates[gate_type] = gate
                if gate == expected_gates[gate_type]:
                    matches += 1
            
            cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
            print(f"   Result: {cross_str} (matches: {matches}/4)")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")

def test_gate_mappings(personality_positions, design_positions, expected_gates):
    """Test different gate mapping approaches."""
    
    gate_size = 360.0 / 64.0
    
    positions = {
        'conscious_sun': personality_positions['sun']['longitude'],
        'conscious_earth': (personality_positions['sun']['longitude'] + 180) % 360,
        'unconscious_sun': design_positions['sun']['longitude'],
        'unconscious_earth': (design_positions['sun']['longitude'] + 180) % 360
    }
    
    # Test different starting points for the I Ching wheel
    best_matches = 0
    best_offset = 0
    
    for offset in range(0, 360, 1):  # Test every degree
        matches = 0
        gates = {}
        
        for gate_type, longitude in positions.items():
            adjusted_longitude = (longitude - offset) % 360
            gate = int(adjusted_longitude / gate_size) + 1
            if gate <= 0:
                gate += 64
            if gate > 64:
                gate -= 64
            gates[gate_type] = gate
            
            if gate == expected_gates[gate_type]:
                matches += 1
        
        if matches > best_matches:
            best_matches = matches
            best_offset = offset
            
            if matches == 4:
                print(f"   🎯 PERFECT MATCH with offset {offset}°!")
                cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
                print(f"   Result: {cross_str}")
                return True
    
    if best_matches > 0:
        print(f"   Best match: {best_matches}/4 with offset {best_offset}°")
        
        # Show the best result
        gates = {}
        for gate_type, longitude in positions.items():
            adjusted_longitude = (longitude - best_offset) % 360
            gate = int(adjusted_longitude / gate_size) + 1
            if gate <= 0:
                gate += 64
            if gate > 64:
                gate -= 64
            gates[gate_type] = gate
        
        cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
        print(f"   Best result: {cross_str}")
    else:
        print(f"   No matches found with any offset")
    
    return False

if __name__ == "__main__":
    test_ephemeris_differences()

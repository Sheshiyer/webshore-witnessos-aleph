#!/usr/bin/env python3
"""
Comprehensive test to find any systematic offset that matches HumDes.com.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
import swisseph as swe
import pytz

def comprehensive_offset_test():
    """
    Test every possible systematic offset to find a match.
    """
    
    print("🔍 Comprehensive Offset Test")
    print("=" * 40)
    
    # Expected results from HumDes.com
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    # Use HumDes.com exact times
    birth_datetime = datetime.combine(date(1991, 8, 13), time(8, 1))
    design_datetime = datetime.combine(date(1991, 5, 13), time(8, 28))
    
    # Calculate Julian days
    birth_jd = swe.julday(
        birth_datetime.year, birth_datetime.month, birth_datetime.day,
        birth_datetime.hour + birth_datetime.minute/60.0
    )
    
    design_jd = swe.julday(
        design_datetime.year, design_datetime.month, design_datetime.day,
        design_datetime.hour + design_datetime.minute/60.0
    )
    
    # Calculate Sun positions
    personality_sun, _ = swe.calc_ut(birth_jd, swe.SUN)
    design_sun, _ = swe.calc_ut(design_jd, swe.SUN)
    
    positions = {
        'conscious_sun': personality_sun[0],
        'conscious_earth': (personality_sun[0] + 180) % 360,
        'unconscious_sun': design_sun[0],
        'unconscious_earth': (design_sun[0] + 180) % 360
    }
    
    print(f"Birth: {birth_datetime} UTC")
    print(f"Design: {design_datetime} UTC")
    print(f"Expected: {expected_gates['conscious_sun']}/{expected_gates['conscious_earth']} | {expected_gates['unconscious_sun']}/{expected_gates['unconscious_earth']}")
    print()
    
    print("Calculated positions:")
    for gate_type, longitude in positions.items():
        print(f"  {gate_type:>15}: {longitude:>8.3f}°")
    print()
    
    # Test 1: Systematic offset search with high precision
    print("🔍 Testing systematic offsets (0.01° precision)")
    print("-" * 50)
    
    gate_size = 360.0 / 64.0
    best_matches = 0
    best_offset = 0
    perfect_matches = []
    
    # Test offsets from -180 to +180 degrees with 0.01 degree precision
    for offset_hundredths in range(-18000, 18001):
        offset = offset_hundredths / 100.0
        
        gates = {}
        matches = 0
        
        for gate_type, longitude in positions.items():
            adjusted_longitude = (longitude + offset) % 360
            gate = int(adjusted_longitude / gate_size) + 1
            if gate > 64:
                gate -= 64
            gates[gate_type] = gate
            
            if gate == expected_gates[gate_type]:
                matches += 1
        
        if matches > best_matches:
            best_matches = matches
            best_offset = offset
        
        if matches == 4:
            cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
            perfect_matches.append((offset, cross_str))
            print(f"🎯 PERFECT MATCH with {offset:.2f}° offset!")
            print(f"   Result: {cross_str}")
    
    if perfect_matches:
        print(f"\nFound {len(perfect_matches)} perfect match(es)!")
        for offset, cross_str in perfect_matches:
            print(f"  Offset {offset:.2f}°: {cross_str}")
    else:
        print(f"\nNo perfect matches found.")
        print(f"Best result: {best_matches}/4 matches with {best_offset:.2f}° offset")
        
        # Show the best result
        gates = {}
        for gate_type, longitude in positions.items():
            adjusted_longitude = (longitude + best_offset) % 360
            gate = int(adjusted_longitude / gate_size) + 1
            if gate > 64:
                gate -= 64
            gates[gate_type] = gate
        
        cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
        print(f"Best result: {cross_str}")
        
        # Show which gates matched
        print("\nMatches:")
        for gate_type in expected_gates:
            calculated = gates[gate_type]
            expected = expected_gates[gate_type]
            match = "✅" if calculated == expected else "❌"
            print(f"  {gate_type:>15}: {calculated:>2} (expected {expected:>2}) {match}")
    
    # Test 2: Maybe there's a different gate numbering system
    print(f"\n🔍 Testing alternative gate numbering systems")
    print("-" * 50)
    
    # Test if gates are numbered differently (e.g., starting from 0, or in reverse)
    alternative_systems = [
        ("Standard (1-64)", lambda g: g),
        ("Zero-based (0-63)", lambda g: g - 1 if g > 0 else 63),
        ("Reverse (64-1)", lambda g: 65 - g),
        ("Reverse zero-based", lambda g: 64 - g),
    ]
    
    for system_name, transform_func in alternative_systems:
        print(f"\n  Testing {system_name}:")
        
        # Calculate gates with standard method
        standard_gates = {}
        for gate_type, longitude in positions.items():
            gate = int(longitude / gate_size) + 1
            if gate > 64:
                gate -= 64
            standard_gates[gate_type] = gate
        
        # Transform gates according to alternative system
        transformed_gates = {}
        for gate_type, gate in standard_gates.items():
            transformed_gates[gate_type] = transform_func(gate)
        
        # Check matches
        matches = 0
        for gate_type in expected_gates:
            if transformed_gates[gate_type] == expected_gates[gate_type]:
                matches += 1
        
        cross_str = f"{transformed_gates['conscious_sun']}/{transformed_gates['conscious_earth']} | {transformed_gates['unconscious_sun']}/{transformed_gates['unconscious_earth']}"
        print(f"    Result: {cross_str} (matches: {matches}/4)")
        
        if matches == 4:
            print(f"    🎯 PERFECT MATCH!")
    
    # Test 3: Maybe there's a different starting point for the zodiac
    print(f"\n🔍 Testing different zodiacal starting points")
    print("-" * 50)
    
    # Test if the zodiac starts at a different point
    zodiac_offsets = [
        (0, "Aries 0° (standard)"),
        (30, "Taurus 0°"),
        (60, "Gemini 0°"),
        (90, "Cancer 0°"),
        (120, "Leo 0°"),
        (150, "Virgo 0°"),
        (180, "Libra 0°"),
        (210, "Scorpio 0°"),
        (240, "Sagittarius 0°"),
        (270, "Capricorn 0°"),
        (300, "Aquarius 0°"),
        (330, "Pisces 0°"),
    ]
    
    for zodiac_offset, description in zodiac_offsets:
        gates = {}
        matches = 0
        
        for gate_type, longitude in positions.items():
            adjusted_longitude = (longitude - zodiac_offset) % 360
            gate = int(adjusted_longitude / gate_size) + 1
            if gate <= 0:
                gate += 64
            if gate > 64:
                gate -= 64
            gates[gate_type] = gate
            
            if gate == expected_gates[gate_type]:
                matches += 1
        
        if matches >= 2:  # Show promising results
            cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
            print(f"  {description:>20}: {cross_str} (matches: {matches}/4)")
            
            if matches == 4:
                print(f"                        🎯 PERFECT MATCH!")

if __name__ == "__main__":
    comprehensive_offset_test()

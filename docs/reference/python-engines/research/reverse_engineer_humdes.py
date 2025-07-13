#!/usr/bin/env python3
"""
Reverse engineer the exact HumDes.com calculation method.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
import swisseph as swe
import pytz

def reverse_engineer_humdes():
    """
    Try to reverse engineer the exact method HumDes.com uses.
    """
    
    print("🔍 Reverse Engineering HumDes.com Calculation")
    print("=" * 60)
    
    # Expected results from HumDes.com chart
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    # Data from HumDes.com chart
    birth_date = date(1991, 8, 13)
    birth_time_local = time(13, 31)
    birth_time_utc = time(8, 1)
    design_date = date(1991, 5, 13)
    design_time_utc = time(8, 28)
    
    print("HumDes.com Chart Data:")
    print(f"Birth: {birth_date} {birth_time_local} Local (13:31)")
    print(f"Birth: {birth_date} {birth_time_utc} UTC (08:01)")
    print(f"Design: {design_date} {design_time_utc} UTC (08:28)")
    print(f"Expected: {expected_gates['conscious_sun']}/{expected_gates['conscious_earth']} | {expected_gates['unconscious_sun']}/{expected_gates['unconscious_earth']}")
    print()
    
    # Calculate what longitudes would be needed for the expected gates
    gate_size = 360.0 / 64.0
    
    required_longitudes = {}
    for gate_type, expected_gate in expected_gates.items():
        # Calculate the center longitude for this gate
        gate_start = (expected_gate - 1) * gate_size
        gate_center = gate_start + (gate_size / 2)
        required_longitudes[gate_type] = gate_center
    
    print("Required longitudes for expected gates:")
    for gate_type, longitude in required_longitudes.items():
        gate_num = expected_gates[gate_type]
        print(f"  {gate_type:>15}: {longitude:>8.3f}° (Gate {gate_num})")
    print()
    
    # Test using the exact times from HumDes.com
    print("🔍 Testing with HumDes.com exact times:")
    print("-" * 40)
    
    # Use the exact UTC times shown in the chart
    personality_datetime = datetime.combine(birth_date, birth_time_utc)
    design_datetime = datetime.combine(design_date, design_time_utc)
    
    # Calculate Julian days
    personality_jd = swe.julday(
        personality_datetime.year, personality_datetime.month, personality_datetime.day,
        personality_datetime.hour + personality_datetime.minute/60.0
    )
    
    design_jd = swe.julday(
        design_datetime.year, design_datetime.month, design_datetime.day,
        design_datetime.hour + design_datetime.minute/60.0
    )
    
    print(f"Personality JD: {personality_jd:.6f}")
    print(f"Design JD: {design_jd:.6f}")
    print(f"Difference: {personality_jd - design_jd:.6f} days")
    print()
    
    # Calculate Sun positions
    personality_sun, _ = swe.calc_ut(personality_jd, swe.SUN)
    design_sun, _ = swe.calc_ut(design_jd, swe.SUN)
    
    actual_longitudes = {
        'conscious_sun': personality_sun[0],
        'conscious_earth': (personality_sun[0] + 180) % 360,
        'unconscious_sun': design_sun[0],
        'unconscious_earth': (design_sun[0] + 180) % 360
    }
    
    print("Calculated longitudes:")
    for gate_type, longitude in actual_longitudes.items():
        print(f"  {gate_type:>15}: {longitude:>8.3f}°")
    print()
    
    # Calculate the differences
    print("Longitude differences (required - actual):")
    differences = {}
    for gate_type in expected_gates:
        diff = required_longitudes[gate_type] - actual_longitudes[gate_type]
        # Normalize to -180 to +180
        while diff > 180:
            diff -= 360
        while diff < -180:
            diff += 360
        differences[gate_type] = diff
        print(f"  {gate_type:>15}: {diff:>8.3f}°")
    
    # Check if there's a consistent offset
    avg_diff = sum(differences.values()) / len(differences)
    print(f"\nAverage difference: {avg_diff:.3f}°")
    
    # Test if applying this offset works
    print(f"\n🔍 Testing with {avg_diff:.3f}° offset:")
    print("-" * 40)
    
    corrected_gates = {}
    matches = 0
    
    for gate_type, longitude in actual_longitudes.items():
        corrected_longitude = (longitude + avg_diff) % 360
        corrected_gate = int(corrected_longitude / gate_size) + 1
        if corrected_gate > 64:
            corrected_gate -= 64
        corrected_gates[gate_type] = corrected_gate
        
        expected = expected_gates[gate_type]
        match = "✅" if corrected_gate == expected else "❌"
        print(f"  {gate_type:>15}: {corrected_longitude:>8.3f}° → Gate {corrected_gate:>2} (expected {expected:>2}) {match}")
        
        if corrected_gate == expected:
            matches += 1
    
    cross_str = f"{corrected_gates['conscious_sun']}/{corrected_gates['conscious_earth']} | {corrected_gates['unconscious_sun']}/{corrected_gates['unconscious_earth']}"
    print(f"\nResult: {cross_str}")
    print(f"Matches: {matches}/4")
    
    if matches == 4:
        print("🎯 PERFECT MATCH!")
        return avg_diff
    
    # If that doesn't work, try testing specific offsets that might be used
    print(f"\n🔍 Testing specific offset values:")
    print("-" * 40)
    
    # Test offsets that might be related to ayanamsa or other astronomical corrections
    test_offsets = [
        23.5,   # Approximate ayanamsa
        24.0,   # Round ayanamsa
        25.0,   # Another ayanamsa value
        -23.5,  # Negative ayanamsa
        -24.0,  # Negative round ayanamsa
        58.5,   # Different calculation
        -58.5,  # Negative version
        90.0,   # Quarter circle
        -90.0,  # Negative quarter
        180.0,  # Half circle
        -180.0, # Negative half
    ]
    
    best_matches = 0
    best_offset = 0
    
    for offset in test_offsets:
        gates = {}
        matches = 0
        
        for gate_type, longitude in actual_longitudes.items():
            corrected_longitude = (longitude + offset) % 360
            gate = int(corrected_longitude / gate_size) + 1
            if gate > 64:
                gate -= 64
            gates[gate_type] = gate
            
            if gate == expected_gates[gate_type]:
                matches += 1
        
        if matches > best_matches:
            best_matches = matches
            best_offset = offset
        
        if matches >= 2:  # Show promising results
            cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
            print(f"  Offset {offset:>6.1f}°: {cross_str} (matches: {matches}/4)")
        
        if matches == 4:
            print(f"  🎯 PERFECT MATCH with {offset}° offset!")
            return offset
    
    print(f"\nBest result: {best_matches}/4 matches with {best_offset}° offset")
    
    # Try a more granular search around the best offset
    if best_matches > 0:
        print(f"\n🔍 Fine-tuning around {best_offset}°:")
        print("-" * 40)
        
        for fine_offset in [best_offset + i*0.1 for i in range(-50, 51)]:
            gates = {}
            matches = 0
            
            for gate_type, longitude in actual_longitudes.items():
                corrected_longitude = (longitude + fine_offset) % 360
                gate = int(corrected_longitude / gate_size) + 1
                if gate > 64:
                    gate -= 64
                gates[gate_type] = gate
                
                if gate == expected_gates[gate_type]:
                    matches += 1
            
            if matches == 4:
                cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
                print(f"  🎯 PERFECT MATCH with {fine_offset:.1f}° offset!")
                print(f"  Result: {cross_str}")
                return fine_offset
    
    print("\n❌ No perfect match found with any tested offset")
    return None

if __name__ == "__main__":
    result = reverse_engineer_humdes()
    if result is not None:
        print(f"\n✅ Found working offset: {result:.3f}°")
    else:
        print(f"\n❌ Could not determine the exact calculation method")

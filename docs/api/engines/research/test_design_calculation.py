#!/usr/bin/env python3
"""
Test different design calculation methods to match HumDes.com.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
import swisseph as swe
import pytz

def test_design_calculation_methods():
    """
    Test different methods for calculating the design time.
    """
    
    print("🔍 Testing Design Calculation Methods")
    print("=" * 50)
    
    # Expected results from HumDes.com
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    # Birth data from HumDes.com
    birth_date = date(1991, 8, 13)
    birth_time_utc = time(8, 1)  # UTC time from chart
    birth_datetime_utc = datetime.combine(birth_date, birth_time_utc)
    
    # Design data from HumDes.com
    design_date = date(1991, 5, 13)
    design_time_utc = time(8, 28)
    design_datetime_utc = datetime.combine(design_date, design_time_utc)
    
    print(f"Birth (UTC): {birth_datetime_utc}")
    print(f"Design (UTC): {design_datetime_utc}")
    
    # Calculate the actual difference
    actual_difference = birth_datetime_utc - design_datetime_utc
    print(f"Actual difference: {actual_difference.total_seconds() / (24 * 3600):.6f} days")
    print()
    
    # Test 1: Use the exact design time from HumDes.com
    print("🔍 Test 1: Using exact HumDes.com design time")
    print("-" * 45)
    
    test_with_design_time(birth_datetime_utc, design_datetime_utc, expected_gates, "HumDes.com exact")
    
    # Test 2: Try different day offsets around the HumDes.com value
    actual_days = actual_difference.total_seconds() / (24 * 3600)
    
    print(f"\n🔍 Test 2: Testing offsets around {actual_days:.3f} days")
    print("-" * 50)
    
    for offset in [90, 91, 92, 93, actual_days]:
        design_test = birth_datetime_utc - timedelta(days=offset)
        test_with_design_time(birth_datetime_utc, design_test, expected_gates, f"{offset:.3f} days")
    
    # Test 3: Maybe it's calculated differently - let's try working backwards
    print(f"\n🔍 Test 3: Working backwards from expected gates")
    print("-" * 50)
    
    # Calculate what Sun positions we need
    gate_size = 360.0 / 64.0
    
    required_sun_positions = {
        'personality': (expected_gates['conscious_sun'] - 1) * gate_size + (gate_size / 2),
        'design': (expected_gates['unconscious_sun'] - 1) * gate_size + (gate_size / 2)
    }
    
    print(f"Required personality Sun: {required_sun_positions['personality']:.3f}°")
    print(f"Required design Sun: {required_sun_positions['design']:.3f}°")
    
    # Find when the Sun was at these positions
    find_sun_position_times(required_sun_positions, birth_datetime_utc)
    
    # Test 4: Maybe there's a different starting point for the I Ching wheel
    print(f"\n🔍 Test 4: Testing I Ching wheel offsets with HumDes.com times")
    print("-" * 60)
    
    test_iching_wheel_offsets(birth_datetime_utc, design_datetime_utc, expected_gates)

def test_with_design_time(birth_datetime, design_datetime, expected_gates, description):
    """Test calculation with specific design time."""
    
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
    
    # Calculate gates
    gate_size = 360.0 / 64.0
    
    positions = {
        'conscious_sun': personality_sun[0],
        'conscious_earth': (personality_sun[0] + 180) % 360,
        'unconscious_sun': design_sun[0],
        'unconscious_earth': (design_sun[0] + 180) % 360
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
    
    print(f"  {description:>20}: {cross_str} (matches: {matches}/4)")
    print(f"                      Personality Sun: {personality_sun[0]:.3f}°")
    print(f"                      Design Sun: {design_sun[0]:.3f}°")
    
    if matches == 4:
        print(f"                      🎯 PERFECT MATCH!")
        return True
    
    return False

def find_sun_position_times(required_positions, reference_time):
    """Find when the Sun was at the required positions."""
    
    print(f"\nSearching for times when Sun was at required positions...")
    
    # Search around the reference time
    for days_offset in range(-100, 5):
        test_time = reference_time + timedelta(days=days_offset)
        
        test_jd = swe.julday(
            test_time.year, test_time.month, test_time.day,
            test_time.hour + test_time.minute/60.0
        )
        
        sun_pos, _ = swe.calc_ut(test_jd, swe.SUN)
        sun_longitude = sun_pos[0]
        
        # Check if this matches our required positions
        for pos_type, required_longitude in required_positions.items():
            diff = abs(sun_longitude - required_longitude)
            if diff > 180:
                diff = 360 - diff
            
            if diff < 1.0:  # Within 1 degree
                print(f"  {pos_type:>12}: {test_time} (Sun at {sun_longitude:.3f}°, diff: {diff:.3f}°)")

def test_iching_wheel_offsets(birth_datetime, design_datetime, expected_gates):
    """Test different I Ching wheel starting points."""
    
    # Calculate Sun positions
    birth_jd = swe.julday(
        birth_datetime.year, birth_datetime.month, birth_datetime.day,
        birth_datetime.hour + birth_datetime.minute/60.0
    )
    
    design_jd = swe.julday(
        design_datetime.year, design_datetime.month, design_datetime.day,
        design_datetime.hour + design_datetime.minute/60.0
    )
    
    personality_sun, _ = swe.calc_ut(birth_jd, swe.SUN)
    design_sun, _ = swe.calc_ut(design_jd, swe.SUN)
    
    positions = {
        'conscious_sun': personality_sun[0],
        'conscious_earth': (personality_sun[0] + 180) % 360,
        'unconscious_sun': design_sun[0],
        'unconscious_earth': (design_sun[0] + 180) % 360
    }
    
    gate_size = 360.0 / 64.0
    
    # Test systematic offsets
    best_matches = 0
    best_offset = 0
    
    print(f"Testing I Ching wheel offsets...")
    
    for offset in range(0, 360):
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
        
        if matches >= 3:  # Show good results
            cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
            print(f"  Offset {offset:>3}°: {cross_str} (matches: {matches}/4)")
        
        if matches == 4:
            cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
            print(f"  🎯 PERFECT MATCH with {offset}° offset!")
            print(f"     Result: {cross_str}")
            return offset
    
    if best_matches > 0:
        print(f"\nBest result: {best_matches}/4 matches with {best_offset}° offset")
    else:
        print(f"\nNo significant matches found")
    
    return None

if __name__ == "__main__":
    test_design_calculation_methods()

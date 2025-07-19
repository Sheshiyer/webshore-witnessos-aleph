#!/usr/bin/env python3
"""
Analyze individual offsets needed for each gate position.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
import swisseph as swe
import pytz

def analyze_individual_offsets():
    """
    Find the individual offset needed for each gate position.
    """
    
    print("🔍 Analyzing Individual Offsets for Each Position")
    print("=" * 60)
    
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
    
    print(f"Calculated positions:")
    for gate_type, longitude in positions.items():
        print(f"  {gate_type:>15}: {longitude:>8.3f}°")
    print()
    
    # Calculate required positions for expected gates
    gate_size = 360.0 / 64.0
    required_positions = {}
    
    for gate_type, expected_gate in expected_gates.items():
        # Calculate the center longitude for this gate
        gate_start = (expected_gate - 1) * gate_size
        gate_center = gate_start + (gate_size / 2)
        required_positions[gate_type] = gate_center
    
    print(f"Required positions for expected gates:")
    for gate_type, longitude in required_positions.items():
        gate_num = expected_gates[gate_type]
        print(f"  {gate_type:>15}: {longitude:>8.3f}° (Gate {gate_num})")
    print()
    
    # Calculate individual offsets needed
    print(f"Individual offsets needed:")
    individual_offsets = {}
    
    for gate_type in expected_gates:
        current_pos = positions[gate_type]
        required_pos = required_positions[gate_type]
        
        # Calculate the offset needed
        offset = required_pos - current_pos
        
        # Normalize to -180 to +180
        while offset > 180:
            offset -= 360
        while offset < -180:
            offset += 360
        
        individual_offsets[gate_type] = offset
        
        print(f"  {gate_type:>15}: {offset:>8.3f}°")
    
    # Check if there are patterns in the offsets
    print(f"\nAnalyzing offset patterns:")
    
    # Group by conscious vs unconscious
    conscious_offsets = [individual_offsets['conscious_sun'], individual_offsets['conscious_earth']]
    unconscious_offsets = [individual_offsets['unconscious_sun'], individual_offsets['unconscious_earth']]
    
    print(f"  Conscious offsets: {conscious_offsets[0]:.3f}°, {conscious_offsets[1]:.3f}°")
    print(f"  Unconscious offsets: {unconscious_offsets[0]:.3f}°, {unconscious_offsets[1]:.3f}°")
    
    # Check if sun and earth have related offsets
    sun_offsets = [individual_offsets['conscious_sun'], individual_offsets['unconscious_sun']]
    earth_offsets = [individual_offsets['conscious_earth'], individual_offsets['unconscious_earth']]
    
    print(f"  Sun offsets: {sun_offsets[0]:.3f}°, {sun_offsets[1]:.3f}°")
    print(f"  Earth offsets: {earth_offsets[0]:.3f}°, {earth_offsets[1]:.3f}°")
    
    # Check if there's a 180° relationship between sun and earth
    sun_earth_diff_conscious = abs(individual_offsets['conscious_sun'] - individual_offsets['conscious_earth'])
    sun_earth_diff_unconscious = abs(individual_offsets['unconscious_sun'] - individual_offsets['unconscious_earth'])
    
    print(f"  Sun-Earth offset difference (conscious): {sun_earth_diff_conscious:.3f}°")
    print(f"  Sun-Earth offset difference (unconscious): {sun_earth_diff_unconscious:.3f}°")
    
    # Test if there's a systematic pattern we can apply
    print(f"\n🔍 Testing systematic patterns:")
    print("-" * 40)
    
    # Pattern 1: Same offset for all positions
    avg_offset = sum(individual_offsets.values()) / len(individual_offsets)
    print(f"\n1. Average offset ({avg_offset:.3f}°):")
    test_pattern_offset(positions, expected_gates, avg_offset, "all positions")
    
    # Pattern 2: Different offsets for conscious vs unconscious
    avg_conscious = sum(conscious_offsets) / len(conscious_offsets)
    avg_unconscious = sum(unconscious_offsets) / len(unconscious_offsets)
    
    print(f"\n2. Conscious/Unconscious split:")
    print(f"   Conscious avg: {avg_conscious:.3f}°")
    print(f"   Unconscious avg: {avg_unconscious:.3f}°")
    
    test_split_pattern(positions, expected_gates, avg_conscious, avg_unconscious, "conscious", "unconscious")
    
    # Pattern 3: Different offsets for sun vs earth
    avg_sun = sum(sun_offsets) / len(sun_offsets)
    avg_earth = sum(earth_offsets) / len(earth_offsets)
    
    print(f"\n3. Sun/Earth split:")
    print(f"   Sun avg: {avg_sun:.3f}°")
    print(f"   Earth avg: {avg_earth:.3f}°")
    
    test_sun_earth_pattern(positions, expected_gates, avg_sun, avg_earth)
    
    # Pattern 4: Check if there's a relationship to ayanamsa
    print(f"\n4. Checking ayanamsa-like corrections:")
    
    # Get ayanamsa for the birth date
    swe.set_sid_mode(swe.SIDM_LAHIRI)
    ayanamsa = swe.get_ayanamsa_ut(birth_jd)
    print(f"   Lahiri ayanamsa: {ayanamsa:.3f}°")
    
    # Test if any of our offsets are related to ayanamsa
    for gate_type, offset in individual_offsets.items():
        ayanamsa_relation = offset / ayanamsa if ayanamsa != 0 else 0
        print(f"   {gate_type:>15}: {offset:.3f}° / {ayanamsa:.3f}° = {ayanamsa_relation:.3f}")

def test_pattern_offset(positions, expected_gates, offset, description):
    """Test applying a single offset to all positions."""
    
    gate_size = 360.0 / 64.0
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
    
    cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
    print(f"   Result: {cross_str} (matches: {matches}/4)")

def test_split_pattern(positions, expected_gates, conscious_offset, unconscious_offset, conscious_label, unconscious_label):
    """Test applying different offsets to conscious vs unconscious positions."""
    
    gate_size = 360.0 / 64.0
    gates = {}
    matches = 0
    
    for gate_type, longitude in positions.items():
        if 'conscious' in gate_type:
            offset = conscious_offset
        else:
            offset = unconscious_offset
        
        adjusted_longitude = (longitude + offset) % 360
        gate = int(adjusted_longitude / gate_size) + 1
        if gate > 64:
            gate -= 64
        gates[gate_type] = gate
        
        if gate == expected_gates[gate_type]:
            matches += 1
    
    cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
    print(f"   Result: {cross_str} (matches: {matches}/4)")

def test_sun_earth_pattern(positions, expected_gates, sun_offset, earth_offset):
    """Test applying different offsets to sun vs earth positions."""
    
    gate_size = 360.0 / 64.0
    gates = {}
    matches = 0
    
    for gate_type, longitude in positions.items():
        if 'sun' in gate_type:
            offset = sun_offset
        else:
            offset = earth_offset
        
        adjusted_longitude = (longitude + offset) % 360
        gate = int(adjusted_longitude / gate_size) + 1
        if gate > 64:
            gate -= 64
        gates[gate_type] = gate
        
        if gate == expected_gates[gate_type]:
            matches += 1
    
    cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
    print(f"   Result: {cross_str} (matches: {matches}/4)")

if __name__ == "__main__":
    analyze_individual_offsets()

#!/usr/bin/env python3
"""
Investigate alternative calculation methods that might match HumDes.com.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
import swisseph as swe
import pytz

def investigate_alternative_methods():
    """
    Investigate alternative calculation methods.
    """
    
    print("🔍 Investigating Alternative Calculation Methods")
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
    birth_time_utc = time(8, 1)
    birth_datetime_utc = datetime.combine(birth_date, birth_time_utc)
    
    birth_jd = swe.julday(
        birth_datetime_utc.year, birth_datetime_utc.month, birth_datetime_utc.day,
        birth_datetime_utc.hour + birth_datetime_utc.minute/60.0
    )
    
    print(f"Birth: {birth_datetime_utc} UTC")
    print(f"Expected: {expected_gates['conscious_sun']}/{expected_gates['conscious_earth']} | {expected_gates['unconscious_sun']}/{expected_gates['unconscious_earth']}")
    print()
    
    # Test 1: Maybe they're using a different planet for the "design" calculation
    print("🔍 Test 1: Different planets for design calculation")
    print("-" * 50)
    
    planets_to_test = [
        (swe.SUN, "Sun"),
        (swe.MOON, "Moon"),
        (swe.MERCURY, "Mercury"),
        (swe.VENUS, "Venus"),
        (swe.MARS, "Mars"),
        (swe.JUPITER, "Jupiter"),
        (swe.SATURN, "Saturn"),
        (swe.URANUS, "Uranus"),
        (swe.NEPTUNE, "Neptune"),
        (swe.PLUTO, "Pluto"),
        (swe.MEAN_NODE, "North Node"),
    ]
    
    # Get personality Sun
    personality_sun, _ = swe.calc_ut(birth_jd, swe.SUN)
    personality_sun_lon = personality_sun[0]
    
    for planet_id, planet_name in planets_to_test:
        try:
            # Get planet position at birth
            planet_pos, _ = swe.calc_ut(birth_jd, planet_id)
            planet_lon = planet_pos[0]
            
            # Test if this planet at birth gives us the expected design gates
            test_design_planet(personality_sun_lon, planet_lon, expected_gates, f"Birth {planet_name}")
            
        except Exception as e:
            print(f"  ❌ Error with {planet_name}: {str(e)}")
    
    # Test 2: Maybe they're using the same planet but at a different time offset
    print(f"\n🔍 Test 2: Different time offsets for design Sun")
    print("-" * 50)
    
    # Test various offsets
    test_offsets = [
        14, 15, 16,  # Based on our backwards calculation
        30, 60, 90,  # Common astrological periods
        88.25, 88.5, 88.75,  # Variations around 88 days
        365.25 / 4,  # Quarter year
        365.25 / 6,  # Sixth of year
    ]
    
    for offset_days in test_offsets:
        design_jd = birth_jd - offset_days
        design_sun, _ = swe.calc_ut(design_jd, swe.SUN)
        design_sun_lon = design_sun[0]
        
        test_design_planet(personality_sun_lon, design_sun_lon, expected_gates, f"{offset_days:.2f} days before")
    
    # Test 3: Maybe there's a different coordinate system
    print(f"\n🔍 Test 3: Different coordinate systems")
    print("-" * 50)
    
    coordinate_systems = [
        (swe.FLG_SWIEPH, "Geocentric tropical"),
        (swe.FLG_SWIEPH | swe.FLG_SIDEREAL, "Geocentric sidereal"),
        (swe.FLG_SWIEPH | swe.FLG_HELCTR, "Heliocentric"),
    ]
    
    for flags, description in coordinate_systems:
        try:
            if flags & swe.FLG_SIDEREAL:
                swe.set_sid_mode(swe.SIDM_LAHIRI)  # Use Lahiri ayanamsa
            
            personality_sun, _ = swe.calc_ut(birth_jd, swe.SUN, flags)
            design_sun, _ = swe.calc_ut(birth_jd - 88, swe.SUN, flags)
            
            personality_sun_lon = personality_sun[0]
            design_sun_lon = design_sun[0]
            
            test_design_planet(personality_sun_lon, design_sun_lon, expected_gates, description)
            
        except Exception as e:
            print(f"  ❌ Error with {description}: {str(e)}")
    
    # Test 4: Maybe they're using a completely different gate mapping
    print(f"\n🔍 Test 4: Alternative gate mapping systems")
    print("-" * 50)
    
    # Use our calculated positions with HumDes.com exact times
    design_datetime_utc = datetime.combine(date(1991, 5, 13), time(8, 28))
    design_jd = swe.julday(
        design_datetime_utc.year, design_datetime_utc.month, design_datetime_utc.day,
        design_datetime_utc.hour + design_datetime_utc.minute/60.0
    )
    
    personality_sun, _ = swe.calc_ut(birth_jd, swe.SUN)
    design_sun, _ = swe.calc_ut(design_jd, swe.SUN)
    
    positions = {
        'conscious_sun': personality_sun[0],
        'conscious_earth': (personality_sun[0] + 180) % 360,
        'unconscious_sun': design_sun[0],
        'unconscious_earth': (design_sun[0] + 180) % 360
    }
    
    print(f"Using HumDes.com exact times:")
    print(f"  Personality Sun: {personality_sun[0]:.3f}°")
    print(f"  Design Sun: {design_sun[0]:.3f}°")
    
    # Test different gate mapping systems
    test_alternative_gate_mappings(positions, expected_gates)

def test_design_planet(personality_sun_lon, design_planet_lon, expected_gates, description):
    """Test using a specific planet/position for design calculation."""
    
    gate_size = 360.0 / 64.0
    
    positions = {
        'conscious_sun': personality_sun_lon,
        'conscious_earth': (personality_sun_lon + 180) % 360,
        'unconscious_sun': design_planet_lon,
        'unconscious_earth': (design_planet_lon + 180) % 360
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
    
    if matches >= 2:  # Show promising results
        print(f"  {description:>25}: {cross_str} (matches: {matches}/4)")
        
        if matches == 4:
            print(f"                           🎯 PERFECT MATCH!")
            return True
    
    return False

def test_alternative_gate_mappings(positions, expected_gates):
    """Test alternative gate mapping systems."""
    
    print(f"\nTesting alternative gate mapping systems...")
    
    # Test 1: Different gate sizes
    for num_gates in [60, 64, 72]:
        gate_size = 360.0 / num_gates
        print(f"\n  Testing {num_gates} gates ({gate_size:.3f}° per gate):")
        
        gates = {}
        for gate_type, longitude in positions.items():
            gate = int(longitude / gate_size) + 1
            if gate > num_gates:
                gate -= num_gates
            gates[gate_type] = gate
        
        # Map to 64-gate system for comparison
        if num_gates != 64:
            mapped_gates = {}
            for gate_type, gate in gates.items():
                mapped_gate = int((gate - 1) * 64 / num_gates) + 1
                mapped_gates[gate_type] = mapped_gate
            gates = mapped_gates
        
        matches = sum(1 for gate_type in expected_gates if gates[gate_type] == expected_gates[gate_type])
        cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
        print(f"    Result: {cross_str} (matches: {matches}/4)")
    
    # Test 2: Different starting points with fine granularity
    print(f"\n  Testing fine-grained offsets:")
    gate_size = 360.0 / 64.0
    best_matches = 0
    best_offset = 0
    
    for offset_tenths in range(0, 3600):  # 0.1 degree increments
        offset = offset_tenths / 10.0
        
        gates = {}
        matches = 0
        
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
            cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
            print(f"    🎯 PERFECT MATCH with {offset:.1f}° offset!")
            print(f"    Result: {cross_str}")
            return offset
    
    if best_matches > 0:
        print(f"    Best: {best_matches}/4 matches with {best_offset:.1f}° offset")
    else:
        print(f"    No matches found")
    
    return None

if __name__ == "__main__":
    investigate_alternative_methods()

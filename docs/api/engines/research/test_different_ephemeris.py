#!/usr/bin/env python3
"""
Test different Swiss Ephemeris flags and I Ching wheel starting points.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
import swisseph as swe
import pytz

def test_different_ephemeris_flags():
    """
    Test different Swiss Ephemeris calculation flags.
    """
    
    print("🔍 Testing Different Swiss Ephemeris Flags")
    print("=" * 50)
    
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
    birth_datetime = datetime.combine(birth_date, birth_time)
    
    # Convert to UTC
    kolkata_tz = pytz.timezone('Asia/Kolkata')
    birth_datetime_local = kolkata_tz.localize(birth_datetime)
    birth_datetime_utc = birth_datetime_local.astimezone(pytz.UTC)
    
    # Calculate Julian Day
    julian_day = swe.julday(
        birth_datetime_utc.year, 
        birth_datetime_utc.month, 
        birth_datetime_utc.day,
        birth_datetime_utc.hour + birth_datetime_utc.minute/60.0 + birth_datetime_utc.second/3600.0
    )
    
    design_julian_day = julian_day - 88.0
    
    print(f"Birth: {birth_datetime_utc} UTC (JD: {julian_day:.6f})")
    print(f"Design: JD {design_julian_day:.6f}")
    print()
    
    # Test different ephemeris flags
    ephemeris_flags = [
        (swe.FLG_SWIEPH, "Swiss Ephemeris (default)"),
        (swe.FLG_JPLEPH, "JPL Ephemeris"),
        (swe.FLG_MOSEPH, "Moshier Ephemeris"),
        (swe.FLG_SWIEPH | swe.FLG_TOPOCTR, "Swiss Ephemeris (topocentric)"),
        (swe.FLG_SWIEPH | swe.FLG_HELCTR, "Swiss Ephemeris (heliocentric)"),
        (swe.FLG_SWIEPH | swe.FLG_BARYCTR, "Swiss Ephemeris (barycentric)"),
        (swe.FLG_SWIEPH | swe.FLG_TRUEPOS, "Swiss Ephemeris (true positions)"),
        (swe.FLG_SWIEPH | swe.FLG_NONUT, "Swiss Ephemeris (no nutation)"),
        (swe.FLG_SWIEPH | swe.FLG_NOGDEFL, "Swiss Ephemeris (no gravitational deflection)"),
    ]
    
    for flag, description in ephemeris_flags:
        print(f"🔍 Testing: {description}")
        
        try:
            # Calculate Sun positions
            personality_sun, ret_flag = swe.calc_ut(julian_day, swe.SUN, flag)
            design_sun, ret_flag = swe.calc_ut(design_julian_day, swe.SUN, flag)
            
            personality_sun_lon = personality_sun[0]
            design_sun_lon = design_sun[0]
            
            print(f"   Personality Sun: {personality_sun_lon:.6f}°")
            print(f"   Design Sun: {design_sun_lon:.6f}°")
            
            # Test gate calculations with different starting points
            test_gate_calculations(personality_sun_lon, design_sun_lon, expected_gates)
            print()
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            print()

def test_gate_calculations(personality_sun_lon, design_sun_lon, expected_gates):
    """Test gate calculations with different I Ching wheel configurations."""
    
    gate_size = 360.0 / 64.0
    
    positions = {
        'conscious_sun': personality_sun_lon,
        'conscious_earth': (personality_sun_lon + 180) % 360,
        'unconscious_sun': design_sun_lon,
        'unconscious_earth': (design_sun_lon + 180) % 360
    }
    
    # Test different starting points for the I Ching wheel
    # Human Design might start the wheel at a different point than 0°
    
    # Common starting points to test
    test_offsets = [
        (0, "Standard (0° = Gate 1)"),
        (45, "45° offset"),
        (90, "90° offset (Aries point)"),
        (180, "180° offset"),
        (270, "270° offset"),
        # Test some specific degrees that might align with traditional systems
        (15, "15° offset"),
        (30, "30° offset"),
        (22.5, "22.5° offset (half gate)"),
        (2.8125, "2.8125° offset (half line)"),
        # Test if it's related to sidereal vs tropical
        (23.5, "~23.5° offset (ayanamsa-like)"),
        (24, "24° offset"),
        (25, "25° offset"),
    ]
    
    best_matches = 0
    best_offset = 0
    best_result = ""
    
    for offset, description in test_offsets:
        matches = 0
        gates = {}
        
        for gate_type, longitude in positions.items():
            # Adjust longitude by offset
            adjusted_longitude = (longitude - offset) % 360
            
            # Calculate gate
            gate = int(adjusted_longitude / gate_size) + 1
            if gate <= 0:
                gate += 64
            if gate > 64:
                gate -= 64
            
            gates[gate_type] = gate
            
            if gate == expected_gates[gate_type]:
                matches += 1
        
        cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
        
        if matches > best_matches:
            best_matches = matches
            best_offset = offset
            best_result = cross_str
        
        if matches >= 2:  # Show promising results
            print(f"   {description}: {cross_str} (matches: {matches}/4)")
            
        if matches == 4:
            print(f"   🎯 PERFECT MATCH!")
            return True
    
    if best_matches > 0:
        print(f"   Best: {best_matches}/4 matches with {best_offset}° offset: {best_result}")
    else:
        print(f"   No significant matches found")
    
    return False

def test_ayanamsa_corrections():
    """Test if ayanamsa (sidereal correction) affects the calculation."""
    
    print("\n🔍 Testing Ayanamsa (Sidereal) Corrections")
    print("=" * 50)
    
    # Birth data
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)
    birth_datetime = datetime.combine(birth_date, birth_time)
    
    # Convert to UTC
    kolkata_tz = pytz.timezone('Asia/Kolkata')
    birth_datetime_local = kolkata_tz.localize(birth_datetime)
    birth_datetime_utc = birth_datetime_local.astimezone(pytz.UTC)
    
    julian_day = swe.julday(
        birth_datetime_utc.year, 
        birth_datetime_utc.month, 
        birth_datetime_utc.day,
        birth_datetime_utc.hour + birth_datetime_utc.minute/60.0 + birth_datetime_utc.second/3600.0
    )
    
    # Test different ayanamsa systems
    ayanamsa_systems = [
        (swe.SIDM_LAHIRI, "Lahiri"),
        (swe.SIDM_KRISHNAMURTI, "Krishnamurti"),
        (swe.SIDM_RAMAN, "Raman"),
        (swe.SIDM_FAGAN_BRADLEY, "Fagan-Bradley"),
        (swe.SIDM_DELUCE, "De Luce"),
        (swe.SIDM_USHASHASHI, "Usha-Shashi"),
    ]
    
    for ayanamsa_id, ayanamsa_name in ayanamsa_systems:
        print(f"\n🔍 Testing {ayanamsa_name} Ayanamsa:")
        
        try:
            # Set ayanamsa
            swe.set_sid_mode(ayanamsa_id)
            
            # Calculate sidereal positions
            personality_sun, ret_flag = swe.calc_ut(julian_day, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
            design_sun, ret_flag = swe.calc_ut(julian_day - 88, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SIDEREAL)
            
            personality_sun_lon = personality_sun[0]
            design_sun_lon = design_sun[0]
            
            print(f"   Personality Sun: {personality_sun_lon:.6f}°")
            print(f"   Design Sun: {design_sun_lon:.6f}°")
            
            # Quick test with standard gate mapping
            gate_size = 360.0 / 64.0
            
            positions = {
                'conscious_sun': personality_sun_lon,
                'conscious_earth': (personality_sun_lon + 180) % 360,
                'unconscious_sun': design_sun_lon,
                'unconscious_earth': (design_sun_lon + 180) % 360
            }
            
            gates = {}
            for gate_type, longitude in positions.items():
                gate = int(longitude / gate_size) + 1
                if gate > 64:
                    gate -= 64
                gates[gate_type] = gate
            
            cross_str = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
            print(f"   Result: {cross_str}")
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")

if __name__ == "__main__":
    test_different_ephemeris_flags()
    test_ayanamsa_corrections()

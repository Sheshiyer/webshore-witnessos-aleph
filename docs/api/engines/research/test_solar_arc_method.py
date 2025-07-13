#!/usr/bin/env python3
"""
Test the solar arc method (88 degrees vs 88 days) for Human Design calculation.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
import swisseph as swe
import pytz

def test_solar_arc_method():
    """
    Test the difference between 88 days and 88 degrees of solar arc.
    """
    
    print("🔍 Testing Solar Arc Method (88 degrees vs 88 days)")
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
    
    # Get birth Sun position
    personality_sun, _ = swe.calc_ut(birth_jd, swe.SUN)
    personality_sun_lon = personality_sun[0]
    
    print(f"Personality Sun longitude: {personality_sun_lon:.6f}°")
    print()
    
    # Method 1: 88 days before birth
    print("🔍 Method 1: 88 days before birth")
    print("-" * 40)
    
    design_jd_88days = birth_jd - 88.0
    design_sun_88days, _ = swe.calc_ut(design_jd_88days, swe.SUN)
    design_sun_lon_88days = design_sun_88days[0]
    
    # Convert Julian day back to datetime
    year, month, day, hour = swe.revjul(design_jd_88days)
    hour_int = int(hour)
    minute = int((hour - hour_int) * 60)
    design_dt_88days = datetime(year, month, day, hour_int, minute)
    
    print(f"Design time: {design_dt_88days}")
    print(f"Design Sun longitude: {design_sun_lon_88days:.6f}°")
    
    test_calculation(personality_sun_lon, design_sun_lon_88days, expected_gates, "88 days")
    
    # Method 2: 88 degrees of solar arc before birth
    print(f"\n🔍 Method 2: 88 degrees of solar arc before birth")
    print("-" * 50)
    
    # Calculate when the Sun was 88 degrees earlier in longitude
    target_sun_longitude = (personality_sun_lon - 88.0) % 360
    
    print(f"Target Sun longitude: {target_sun_longitude:.6f}°")
    
    # Search for when the Sun was at this position
    design_jd_88degrees = find_sun_longitude_time(target_sun_longitude, birth_jd - 100, birth_jd)
    
    if design_jd_88degrees:
        design_sun_88degrees, _ = swe.calc_ut(design_jd_88degrees, swe.SUN)
        design_sun_lon_88degrees = design_sun_88degrees[0]
        
        # Convert Julian day back to datetime
        year, month, day, hour = swe.revjul(design_jd_88degrees)
        hour_int = int(hour)
        minute = int((hour - hour_int) * 60)
        design_dt_88degrees = datetime(year, month, day, hour_int, minute)
        
        print(f"Design time: {design_dt_88degrees}")
        print(f"Design Sun longitude: {design_sun_lon_88degrees:.6f}°")
        print(f"Difference from target: {abs(design_sun_lon_88degrees - target_sun_longitude):.6f}°")
        
        test_calculation(personality_sun_lon, design_sun_lon_88degrees, expected_gates, "88 degrees")
        
        # Calculate the time difference
        time_diff = birth_jd - design_jd_88degrees
        print(f"Time difference: {time_diff:.3f} days")
    else:
        print("Could not find exact 88-degree solar arc position")
    
    # Method 3: Test the exact HumDes.com design time
    print(f"\n🔍 Method 3: HumDes.com exact design time")
    print("-" * 45)
    
    humdes_design_datetime = datetime.combine(date(1991, 5, 13), time(8, 28))
    humdes_design_jd = swe.julday(
        humdes_design_datetime.year, humdes_design_datetime.month, humdes_design_datetime.day,
        humdes_design_datetime.hour + humdes_design_datetime.minute/60.0
    )
    
    humdes_design_sun, _ = swe.calc_ut(humdes_design_jd, swe.SUN)
    humdes_design_sun_lon = humdes_design_sun[0]
    
    print(f"HumDes design time: {humdes_design_datetime}")
    print(f"HumDes design Sun longitude: {humdes_design_sun_lon:.6f}°")
    
    # Calculate the solar arc difference
    solar_arc_diff = (personality_sun_lon - humdes_design_sun_lon) % 360
    if solar_arc_diff > 180:
        solar_arc_diff -= 360
    
    print(f"Solar arc difference: {solar_arc_diff:.3f}°")
    
    time_diff_humdes = birth_jd - humdes_design_jd
    print(f"Time difference: {time_diff_humdes:.3f} days")
    
    test_calculation(personality_sun_lon, humdes_design_sun_lon, expected_gates, "HumDes exact")
    
    # Method 4: Test if there's a different interpretation of "88 degrees"
    print(f"\n🔍 Method 4: Testing alternative solar arc interpretations")
    print("-" * 60)
    
    # Maybe it's 88 degrees in a different coordinate system or with corrections
    for arc_degrees in [87, 88, 89, 90, 91, 92]:
        target_longitude = (personality_sun_lon - arc_degrees) % 360
        design_jd = find_sun_longitude_time(target_longitude, birth_jd - 100, birth_jd)
        
        if design_jd:
            design_sun, _ = swe.calc_ut(design_jd, swe.SUN)
            design_sun_lon = design_sun[0]
            
            time_diff = birth_jd - design_jd
            
            result = test_calculation(personality_sun_lon, design_sun_lon, expected_gates, f"{arc_degrees}° arc")
            print(f"  Time difference: {time_diff:.3f} days")
            
            if result['matches'] == 4:
                print(f"  🎯 PERFECT MATCH with {arc_degrees}° solar arc!")
                return arc_degrees

def find_sun_longitude_time(target_longitude, start_jd, end_jd, tolerance=0.001):
    """
    Find the Julian day when the Sun was at a specific longitude.
    """
    
    # Binary search for the exact time
    while end_jd - start_jd > tolerance / 365.25:  # Convert tolerance to days
        mid_jd = (start_jd + end_jd) / 2.0
        
        sun_pos, _ = swe.calc_ut(mid_jd, swe.SUN)
        sun_longitude = sun_pos[0]
        
        # Handle longitude wraparound
        diff = (target_longitude - sun_longitude + 180) % 360 - 180
        
        if abs(diff) < tolerance:
            return mid_jd
        elif diff > 0:
            end_jd = mid_jd
        else:
            start_jd = mid_jd
    
    return (start_jd + end_jd) / 2.0

def test_calculation(personality_sun_lon, design_sun_lon, expected_gates, method_name):
    """Test a calculation method and return results."""
    
    gate_size = 360.0 / 64.0
    
    positions = {
        'conscious_sun': personality_sun_lon,
        'conscious_earth': (personality_sun_lon + 180) % 360,
        'unconscious_sun': design_sun_lon,
        'unconscious_earth': (design_sun_lon + 180) % 360
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
    
    print(f"Result ({method_name}): {cross_str} (matches: {matches}/4)")
    
    if matches == 4:
        print(f"🎯 PERFECT MATCH!")
    
    return {
        'gates': gates,
        'matches': matches,
        'cross_str': cross_str
    }

if __name__ == "__main__":
    test_solar_arc_method()

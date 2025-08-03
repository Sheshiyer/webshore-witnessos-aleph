#!/usr/bin/env python3
"""
Debug script to check actual longitude values from Swiss Ephemeris
for Shesh's birth data and see why all planets show Line 6.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from datetime import datetime, date, time
from swiss_ephemeris.ephemeris import SwissEphemerisCalculator

def debug_actual_longitudes():
    """Debug the actual longitude values for Shesh's birth data."""
    
    print("🔍 DEBUGGING ACTUAL LONGITUDE VALUES")
    print("=" * 60)
    
    # Shesh's actual birth data
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)  # 1:31 PM
    birth_location = (12.9629, 77.5775)  # Bengaluru coordinates
    timezone = "Asia/Kolkata"
    
    print(f"Birth Date: {birth_date}")
    print(f"Birth Time: {birth_time}")
    print(f"Location: {birth_location}")
    print(f"Timezone: {timezone}")
    print()
    
    # Initialize calculator
    calc = SwissEphemerisCalculator()
    
    try:
        # Combine birth date and time
        birth_datetime = datetime.combine(birth_date, birth_time)
        lat, lon = birth_location
        
        print(f"Combined DateTime: {birth_datetime}")
        print()
        
        # Calculate Human Design data
        hd_data = calc.calculate_human_design_data(
            birth_datetime, lat, lon, timezone
        )
        
        print("🌟 PERSONALITY GATES (Birth Time):")
        print("-" * 40)
        personality_gates = hd_data['personality_gates']
        
        for planet, data in personality_gates.items():
            if 'human_design_gate' in data:
                longitude = data['longitude']
                gate = data['human_design_gate']['gate']
                line = data['human_design_gate']['line']
                gate_position = data['human_design_gate']['gate_position']
                
                print(f"{planet:12} | {longitude:8.4f}° → Gate {gate:2d}.{line} (pos: {gate_position:.4f})")
                
                # Debug why this gives Line 6
                debug_line_calculation(longitude, planet)
        
        print("\n🌙 DESIGN GATES (88 days before):")
        print("-" * 40)
        design_gates = hd_data['design_gates']
        
        for planet, data in design_gates.items():
            if 'human_design_gate' in data:
                longitude = data['longitude']
                gate = data['human_design_gate']['gate']
                line = data['human_design_gate']['line']
                gate_position = data['human_design_gate']['gate_position']
                
                print(f"{planet:12} | {longitude:8.4f}° → Gate {gate:2d}.{line} (pos: {gate_position:.4f})")
                
                # Debug why this gives Line 6
                debug_line_calculation(longitude, planet)
        
        # Compare with expected values
        print("\n🎯 EXPECTED VS ACTUAL:")
        print("-" * 40)
        
        expected_personality_sun = {"gate": 4, "line": 2}
        expected_design_sun = {"gate": 23, "line": 4}
        
        actual_personality_sun = personality_gates.get('SUN', {}).get('human_design_gate', {})
        actual_design_sun = design_gates.get('SUN', {}).get('human_design_gate', {})
        
        print(f"Personality Sun:")
        print(f"  Expected: Gate {expected_personality_sun['gate']}.{expected_personality_sun['line']}")
        print(f"  Actual:   Gate {actual_personality_sun.get('gate', 'N/A')}.{actual_personality_sun.get('line', 'N/A')}")
        print()
        
        print(f"Design Sun:")
        print(f"  Expected: Gate {expected_design_sun['gate']}.{expected_design_sun['line']}")
        print(f"  Actual:   Gate {actual_design_sun.get('gate', 'N/A')}.{actual_design_sun.get('line', 'N/A')}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

def debug_line_calculation(longitude: float, planet_name: str):
    """Debug why a specific longitude gives Line 6."""
    
    gate_degrees = 360.0 / 64.0  # 5.625
    line_degrees = gate_degrees / 6.0  # 0.9375
    
    position_in_gate = longitude % gate_degrees
    line_calc = position_in_gate / line_degrees
    line_number = int(line_calc) + 1
    
    # Check if this is suspiciously close to Line 6
    if line_number == 6:
        print(f"  ⚠️  {planet_name} Line 6 Debug:")
        print(f"      Position in gate: {position_in_gate:.6f}°")
        print(f"      Line calculation: {line_calc:.6f}")
        print(f"      Line threshold for 6: {5 * line_degrees:.6f}°")
        print(f"      Distance from Line 6 threshold: {position_in_gate - (5 * line_degrees):.6f}°")
        print()

if __name__ == "__main__":
    debug_actual_longitudes()

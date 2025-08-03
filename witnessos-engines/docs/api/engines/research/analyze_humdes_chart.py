#!/usr/bin/env python3
"""
Analyze the HumDes.com chart to understand their calculation method.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
from calculations.astrology import AstrologyCalculator

def analyze_humdes_calculation():
    """
    Analyze the HumDes.com calculation method based on the chart screenshot.
    """
    
    print("🔍 Analyzing HumDes.com Chart Calculation")
    print("=" * 50)
    
    # Data from the HumDes.com chart
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)  # Local time
    utc_time = time(8, 1)      # UTC time shown
    design_date = date(1991, 5, 13)
    design_time = time(8, 28)  # UTC time for design
    
    birth_location = (12.9716, 77.5946)  # Bengaluru
    lat, lon = birth_location
    
    # Expected results from HumDes.com
    expected_incarnation_cross = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    print("HumDes.com Chart Data:")
    print(f"Birth Date/Time: {birth_date} {birth_time} (Local)")
    print(f"UTC Time: {birth_date} {utc_time}")
    print(f"Design Date/Time: {design_date} {design_time} (UTC)")
    print(f"Expected Cross: {expected_incarnation_cross['conscious_sun']}/{expected_incarnation_cross['conscious_earth']} | {expected_incarnation_cross['unconscious_sun']}/{expected_incarnation_cross['unconscious_earth']}")
    print()
    
    calc = AstrologyCalculator()
    
    # Test different interpretations of the times
    test_cases = [
        ("Our current method", datetime.combine(birth_date, birth_time), "Asia/Kolkata"),
        ("UTC time from chart", datetime.combine(birth_date, utc_time), None),
        ("Design date from chart", datetime.combine(design_date, design_time), None),
    ]
    
    for case_name, test_datetime, timezone_str in test_cases:
        print(f"🔍 Testing: {case_name}")
        print(f"   DateTime: {test_datetime}")
        
        try:
            # Get personality positions
            personality_positions = calc.get_planetary_positions(
                test_datetime, lat, lon, timezone_str
            )
            
            # Calculate design time (88 days before)
            design_datetime = test_datetime - timedelta(days=88)
            design_positions = calc.get_planetary_positions(
                design_datetime, lat, lon, timezone_str
            )
            
            print(f"   Design DateTime: {design_datetime}")
            
            # Calculate gates using our current method
            gate_size = 360.0 / 64.0
            
            positions = {
                'conscious_sun': personality_positions['sun']['longitude'],
                'conscious_earth': (personality_positions['sun']['longitude'] + 180) % 360,
                'unconscious_sun': design_positions['sun']['longitude'],
                'unconscious_earth': (design_positions['sun']['longitude'] + 180) % 360
            }
            
            calculated_gates = {}
            matches = 0
            
            for gate_type, longitude in positions.items():
                calculated_gate = int(longitude / gate_size) + 1
                if calculated_gate > 64:
                    calculated_gate -= 64
                calculated_gates[gate_type] = calculated_gate
                
                if calculated_gate == expected_incarnation_cross[gate_type]:
                    matches += 1
            
            cross_str = f"{calculated_gates['conscious_sun']}/{calculated_gates['conscious_earth']} | {calculated_gates['unconscious_sun']}/{calculated_gates['unconscious_earth']}"
            
            print(f"   Result: {cross_str}")
            print(f"   Matches: {matches}/4")
            
            if matches == 4:
                print(f"   🎯 PERFECT MATCH!")
            
            # Show detailed positions
            print(f"   Personality Sun: {personality_positions['sun']['longitude']:.6f}°")
            print(f"   Design Sun: {design_positions['sun']['longitude']:.6f}°")
            print()
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            print()
    
    # Test using the exact design date/time from the chart
    print("🔍 Testing with Exact Design Date from Chart")
    print("-" * 45)
    
    # Use the exact design date and time shown in the chart
    personality_datetime = datetime.combine(birth_date, utc_time)
    design_datetime_exact = datetime.combine(design_date, design_time)
    
    print(f"Personality: {personality_datetime} UTC")
    print(f"Design: {design_datetime_exact} UTC")
    
    try:
        personality_positions = calc.get_planetary_positions(
            personality_datetime, lat, lon, None  # UTC
        )
        
        design_positions = calc.get_planetary_positions(
            design_datetime_exact, lat, lon, None  # UTC
        )
        
        positions = {
            'conscious_sun': personality_positions['sun']['longitude'],
            'conscious_earth': (personality_positions['sun']['longitude'] + 180) % 360,
            'unconscious_sun': design_positions['sun']['longitude'],
            'unconscious_earth': (design_positions['sun']['longitude'] + 180) % 360
        }
        
        calculated_gates = {}
        matches = 0
        
        for gate_type, longitude in positions.items():
            calculated_gate = int(longitude / gate_size) + 1
            if calculated_gate > 64:
                calculated_gate -= 64
            calculated_gates[gate_type] = calculated_gate
            
            if calculated_gate == expected_incarnation_cross[gate_type]:
                matches += 1
        
        cross_str = f"{calculated_gates['conscious_sun']}/{calculated_gates['conscious_earth']} | {calculated_gates['unconscious_sun']}/{calculated_gates['unconscious_earth']}"
        
        print(f"Result: {cross_str}")
        print(f"Matches: {matches}/4")
        
        if matches == 4:
            print(f"🎯 PERFECT MATCH!")
        
        print("\nDetailed breakdown:")
        for gate_type, longitude in positions.items():
            calc_gate = calculated_gates[gate_type]
            exp_gate = expected_incarnation_cross[gate_type]
            match_symbol = "✅" if calc_gate == exp_gate else "❌"
            print(f"  {gate_type:>15}: {longitude:>8.3f}° → Gate {calc_gate:>2} (expected {exp_gate:>2}) {match_symbol}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
    
    # Test if there might be a different ephemeris or calculation offset
    print(f"\n" + "="*50)
    print("TESTING POTENTIAL CALCULATION DIFFERENCES")
    
    # The difference might be in how the gates are mapped to degrees
    # Let's see what longitudes would be needed for the expected gates
    print("\nRequired longitudes for expected gates:")
    for gate_type, expected_gate in expected_incarnation_cross.items():
        required_start = (expected_gate - 1) * gate_size
        required_end = expected_gate * gate_size
        required_center = required_start + (gate_size / 2)
        print(f"  {gate_type:>15}: Gate {expected_gate} needs {required_start:.3f}° - {required_end:.3f}° (center: {required_center:.3f}°)")

if __name__ == "__main__":
    analyze_humdes_calculation()

#!/usr/bin/env python3
"""
Test IST to UTC conversion for incarnation cross calculation.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
from calculations.astrology import AstrologyCalculator
import pytz

def test_ist_to_utc():
    """Test IST to UTC conversion for Mage's birth data."""
    
    print("🕐 Testing IST to UTC Conversion")
    print("=" * 40)
    
    # Original birth data in IST
    birth_date = date(1991, 8, 13)
    birth_time_ist = time(13, 31)  # 1:31 PM IST
    birth_location = (12.9716, 77.5946)  # Bengaluru coordinates
    lat, lon = birth_location
    
    # Expected incarnation cross
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    print(f"Original time: {birth_time_ist} IST")
    print(f"Expected cross: {expected_gates['conscious_sun']}/{expected_gates['conscious_earth']} | {expected_gates['unconscious_sun']}/{expected_gates['unconscious_earth']}")
    print()
    
    calc = AstrologyCalculator()
    
    # Convert IST to UTC
    ist_tz = pytz.timezone('Asia/Kolkata')
    utc_tz = pytz.UTC
    
    # Create IST datetime
    ist_datetime = datetime.combine(birth_date, birth_time_ist)
    ist_localized = ist_tz.localize(ist_datetime)
    
    # Convert to UTC
    utc_datetime = ist_localized.astimezone(utc_tz)
    utc_naive = utc_datetime.replace(tzinfo=None)
    
    print(f"IST datetime: {ist_datetime}")
    print(f"UTC datetime: {utc_naive}")
    print(f"Time difference: {ist_datetime - utc_naive}")
    print()
    
    # Test different interpretations
    test_cases = [
        ("Original (IST as local)", ist_datetime, "Asia/Kolkata"),
        ("Converted to UTC", utc_naive, None),
        ("IST time treated as UTC", ist_datetime, None),
    ]
    
    for case_name, test_datetime, timezone_str in test_cases:
        print(f"🔍 Testing: {case_name}")
        print(f"   DateTime: {test_datetime}")
        print(f"   Timezone: {timezone_str}")
        
        try:
            # Get planetary positions
            personality_positions = calc.get_planetary_positions(
                test_datetime, lat, lon, timezone_str
            )
            
            design_datetime = test_datetime - timedelta(days=88)
            design_positions = calc.get_planetary_positions(
                design_datetime, lat, lon, timezone_str
            )
            
            # Calculate gates
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
                
                expected_gate = expected_gates[gate_type]
                if calculated_gate == expected_gate:
                    matches += 1
            
            cross_str = f"{calculated_gates['conscious_sun']}/{calculated_gates['conscious_earth']} | {calculated_gates['unconscious_sun']}/{calculated_gates['unconscious_earth']}"
            
            print(f"   Result: {cross_str}")
            print(f"   Matches: {matches}/4")
            
            if matches == 4:
                print(f"   🎯 PERFECT MATCH!")
            elif matches >= 2:
                print(f"   ⚡ Good partial match!")
            
            # Show detailed breakdown
            print(f"   Details:")
            for gate_type, longitude in positions.items():
                calc_gate = calculated_gates[gate_type]
                exp_gate = expected_gates[gate_type]
                match_symbol = "✅" if calc_gate == exp_gate else "❌"
                print(f"     {gate_type:>15}: {longitude:>8.3f}° → Gate {calc_gate:>2} (expected {exp_gate:>2}) {match_symbol}")
            
            print()
            
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")
            print()
    
    # Also test with small time adjustments around the UTC time
    print("🕐 Testing Small Adjustments Around UTC Time")
    print("-" * 45)
    
    for minutes_offset in [-30, -15, -10, -5, 0, 5, 10, 15, 30]:
        test_datetime = utc_naive + timedelta(minutes=minutes_offset)
        test_time_str = test_datetime.strftime("%H:%M")
        
        try:
            personality_positions = calc.get_planetary_positions(
                test_datetime, lat, lon, None  # UTC
            )
            
            design_datetime = test_datetime - timedelta(days=88)
            design_positions = calc.get_planetary_positions(
                design_datetime, lat, lon, None
            )
            
            # Calculate gates
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
                
                if calculated_gate == expected_gates[gate_type]:
                    matches += 1
            
            cross_str = f"{calculated_gates['conscious_sun']}/{calculated_gates['conscious_earth']} | {calculated_gates['unconscious_sun']}/{calculated_gates['unconscious_earth']}"
            
            if matches == 4:
                print(f"  ✅ {test_time_str} UTC ({minutes_offset:+3d}min): PERFECT MATCH! {cross_str}")
            elif matches >= 2:
                print(f"  ⚡ {test_time_str} UTC ({minutes_offset:+3d}min): {cross_str} ({matches}/4 match)")
            else:
                print(f"  ❌ {test_time_str} UTC ({minutes_offset:+3d}min): {cross_str} ({matches}/4 match)")
                
        except Exception as e:
            print(f"  ❌ {test_time_str} UTC ({minutes_offset:+3d}min): Error - {str(e)}")

if __name__ == "__main__":
    test_ist_to_utc()

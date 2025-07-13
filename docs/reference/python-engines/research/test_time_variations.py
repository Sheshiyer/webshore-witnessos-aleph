#!/usr/bin/env python3
"""
Test different time interpretations to find the correct incarnation cross.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
from calculations.astrology import AstrologyCalculator
import pytz

def test_time_variations():
    """Test different time interpretations for Mage's birth data."""
    
    print("🕐 Testing Different Time Interpretations")
    print("=" * 60)
    
    # Base birth data
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)  # 1:31 PM
    birth_location = (12.9716, 77.5946)  # Bengaluru coordinates
    lat, lon = birth_location
    
    calc = AstrologyCalculator()
    
    # Test different timezone interpretations
    test_cases = [
        ("Local Time (Asia/Kolkata)", "Asia/Kolkata"),
        ("UTC", "UTC"),
        ("GMT", "GMT"),
        ("Local Time as UTC", None),  # Treat local time as UTC
    ]
    
    target_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    print(f"Target Incarnation Cross: {target_gates['conscious_sun']}/{target_gates['conscious_earth']} | {target_gates['unconscious_sun']}/{target_gates['unconscious_earth']}")
    print()
    
    for case_name, timezone_str in test_cases:
        print(f"🔍 Testing: {case_name}")
        
        try:
            birth_datetime = datetime.combine(birth_date, birth_time)
            
            # Handle timezone conversion
            if timezone_str == "UTC" or timezone_str == "GMT":
                # Convert from Asia/Kolkata to UTC
                kolkata_tz = pytz.timezone('Asia/Kolkata')
                utc_tz = pytz.UTC
                
                # Assume the time was given in Kolkata time, convert to UTC
                kolkata_time = kolkata_tz.localize(birth_datetime)
                birth_datetime = kolkata_time.astimezone(utc_tz).replace(tzinfo=None)
                timezone_str = None  # Use as naive datetime
                
            elif timezone_str is None:
                # Use the time as-is (naive)
                pass
            
            # Get planetary positions
            personality_positions = calc.get_planetary_positions(
                birth_datetime, lat, lon, timezone_str
            )
            
            design_datetime = birth_datetime - timedelta(days=88)
            design_positions = calc.get_planetary_positions(
                design_datetime, lat, lon, timezone_str
            )
            
            # Calculate gates
            personality_sun_gate = calc.longitude_to_human_design_gate(personality_positions['sun']['longitude'])
            personality_earth_gate = calc.longitude_to_human_design_gate((personality_positions['sun']['longitude'] + 180) % 360)
            design_sun_gate = calc.longitude_to_human_design_gate(design_positions['sun']['longitude'])
            design_earth_gate = calc.longitude_to_human_design_gate((design_positions['sun']['longitude'] + 180) % 360)
            
            actual_gates = {
                'conscious_sun': personality_sun_gate,
                'conscious_earth': personality_earth_gate,
                'unconscious_sun': design_sun_gate,
                'unconscious_earth': design_earth_gate
            }
            
            cross_str = f"{personality_sun_gate}/{personality_earth_gate} | {design_sun_gate}/{design_earth_gate}"
            
            # Check if this matches target
            if actual_gates == target_gates:
                print(f"  ✅ PERFECT MATCH! {cross_str}")
            else:
                print(f"  ❌ {cross_str}")
                
                # Check how many gates match
                matches = sum(1 for k in target_gates if actual_gates[k] == target_gates[k])
                print(f"     {matches}/4 gates match")
            
            print(f"     DateTime used: {birth_datetime}")
            print(f"     Sun longitude: {personality_positions['sun']['longitude']:.4f}°")
            print()
            
        except Exception as e:
            print(f"  ❌ Error: {str(e)}")
            print()
    
    # Test small time adjustments around the original time
    print("🕐 Testing Small Time Adjustments (±30 minutes)")
    print("-" * 40)
    
    base_datetime = datetime.combine(birth_date, birth_time)
    
    for minutes_offset in [-30, -15, -5, 0, 5, 15, 30]:
        test_datetime = base_datetime + timedelta(minutes=minutes_offset)
        test_time_str = test_datetime.strftime("%H:%M")
        
        try:
            personality_positions = calc.get_planetary_positions(
                test_datetime, lat, lon, "Asia/Kolkata"
            )
            
            design_datetime = test_datetime - timedelta(days=88)
            design_positions = calc.get_planetary_positions(
                design_datetime, lat, lon, "Asia/Kolkata"
            )
            
            # Calculate gates
            personality_sun_gate = calc.longitude_to_human_design_gate(personality_positions['sun']['longitude'])
            personality_earth_gate = calc.longitude_to_human_design_gate((personality_positions['sun']['longitude'] + 180) % 360)
            design_sun_gate = calc.longitude_to_human_design_gate(design_positions['sun']['longitude'])
            design_earth_gate = calc.longitude_to_human_design_gate((design_positions['sun']['longitude'] + 180) % 360)
            
            actual_gates = {
                'conscious_sun': personality_sun_gate,
                'conscious_earth': personality_earth_gate,
                'unconscious_sun': design_sun_gate,
                'unconscious_earth': design_earth_gate
            }
            
            cross_str = f"{personality_sun_gate}/{personality_earth_gate} | {design_sun_gate}/{design_earth_gate}"
            
            if actual_gates == target_gates:
                print(f"  ✅ {test_time_str} ({minutes_offset:+3d}min): PERFECT MATCH! {cross_str}")
            else:
                matches = sum(1 for k in target_gates if actual_gates[k] == target_gates[k])
                print(f"  ❌ {test_time_str} ({minutes_offset:+3d}min): {cross_str} ({matches}/4 match)")
                
        except Exception as e:
            print(f"  ❌ {test_time_str} ({minutes_offset:+3d}min): Error - {str(e)}")

if __name__ == "__main__":
    test_time_variations()

#!/usr/bin/env python3
"""
Debug script for astronomical calculations to understand incarnation cross discrepancy.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
from calculations.astrology import AstrologyCalculator

def debug_mage_astro():
    """Debug astronomical calculations for Mage's birth data."""
    
    print("🔍 Debugging Astronomical Calculations")
    print("=" * 60)
    
    # Mage's birth data
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)  # 1:31 PM
    birth_location = (12.9716, 77.5946)  # Bengaluru coordinates
    timezone = "Asia/Kolkata"
    
    birth_datetime = datetime.combine(birth_date, birth_time)
    lat, lon = birth_location
    
    print(f"Birth Date: {birth_date}")
    print(f"Birth Time: {birth_time}")
    print(f"Birth Location: {birth_location} (Bengaluru)")
    print(f"Timezone: {timezone}")
    print(f"Combined DateTime: {birth_datetime}")
    print()
    
    # Initialize calculator
    calc = AstrologyCalculator()
    
    try:
        # Get raw planetary positions
        print("🌍 PERSONALITY (Birth Time) POSITIONS:")
        personality_positions = calc.get_planetary_positions(
            birth_datetime, lat, lon, timezone
        )
        
        for planet, pos in personality_positions.items():
            if planet in ['sun', 'moon']:  # Focus on key planets
                longitude = pos['longitude']
                gate = calc.longitude_to_human_design_gate(longitude)
                print(f"{planet.upper():>8}: {longitude:>8.4f}° → Gate {gate:>2}")
        
        # Calculate Earth position manually
        sun_longitude = personality_positions['sun']['longitude']
        earth_longitude = (sun_longitude + 180) % 360
        earth_gate = calc.longitude_to_human_design_gate(earth_longitude)
        print(f"{'EARTH':>8}: {earth_longitude:>8.4f}° → Gate {earth_gate:>2}")
        print()
        
        # Design time (88 days before)
        design_datetime = birth_datetime - timedelta(days=88)
        print(f"🎨 DESIGN TIME: {design_datetime}")
        print("DESIGN (88 days before) POSITIONS:")
        
        design_positions = calc.get_planetary_positions(
            design_datetime, lat, lon, timezone
        )
        
        for planet, pos in design_positions.items():
            if planet in ['sun', 'moon']:  # Focus on key planets
                longitude = pos['longitude']
                gate = calc.longitude_to_human_design_gate(longitude)
                print(f"{planet.upper():>8}: {longitude:>8.4f}° → Gate {gate:>2}")
        
        # Calculate Design Earth position manually
        design_sun_longitude = design_positions['sun']['longitude']
        design_earth_longitude = (design_sun_longitude + 180) % 360
        design_earth_gate = calc.longitude_to_human_design_gate(design_earth_longitude)
        print(f"{'EARTH':>8}: {design_earth_longitude:>8.4f}° → Gate {design_earth_gate:>2}")
        print()
        
        # Summary of incarnation cross gates
        print("🎯 INCARNATION CROSS GATES:")
        personality_sun_gate = calc.longitude_to_human_design_gate(personality_positions['sun']['longitude'])
        personality_earth_gate = calc.longitude_to_human_design_gate(earth_longitude)
        design_sun_gate = calc.longitude_to_human_design_gate(design_positions['sun']['longitude'])
        design_earth_gate = calc.longitude_to_human_design_gate(design_earth_longitude)
        
        print(f"Conscious Sun (Personality):   Gate {personality_sun_gate}")
        print(f"Conscious Earth (Personality): Gate {personality_earth_gate}")
        print(f"Unconscious Sun (Design):      Gate {design_sun_gate}")
        print(f"Unconscious Earth (Design):    Gate {design_earth_gate}")
        print()
        print(f"Incarnation Cross: {personality_sun_gate}/{personality_earth_gate} | {design_sun_gate}/{design_earth_gate}")
        print()
        
        # Expected vs Actual
        expected = "4/49 | 23/43"
        actual = f"{personality_sun_gate}/{personality_earth_gate} | {design_sun_gate}/{design_earth_gate}"
        
        print("📊 COMPARISON:")
        print(f"Expected: {expected}")
        print(f"Actual:   {actual}")
        
        if actual == expected:
            print("✅ PERFECT MATCH!")
        else:
            print("❌ MISMATCH - investigating...")
            
            # Check if we're close to gate boundaries
            print("\n🔬 BOUNDARY ANALYSIS:")
            
            # Check Sun position relative to gate boundaries
            sun_long = personality_positions['sun']['longitude']
            gate_size = 360.0 / 64.0  # 5.625 degrees per gate
            
            # Which gate should this longitude be in?
            calculated_gate = int(sun_long / gate_size) + 1
            if calculated_gate > 64:
                calculated_gate = calculated_gate - 64
                
            gate_start = (calculated_gate - 1) * gate_size
            gate_end = calculated_gate * gate_size
            position_in_gate = sun_long - gate_start
            
            print(f"Sun longitude: {sun_long:.6f}°")
            print(f"Gate size: {gate_size:.6f}°")
            print(f"Calculated gate: {calculated_gate}")
            print(f"Gate {calculated_gate} range: {gate_start:.6f}° - {gate_end:.6f}°")
            print(f"Position in gate: {position_in_gate:.6f}° ({position_in_gate/gate_size*100:.2f}%)")
            
            # Check if we're near a boundary
            if position_in_gate < 0.1 or position_in_gate > (gate_size - 0.1):
                print("⚠️  Very close to gate boundary - small timing differences could change the gate")
            
    except Exception as e:
        print(f"❌ Error during calculation: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_mage_astro()

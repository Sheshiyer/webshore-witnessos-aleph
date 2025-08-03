#!/usr/bin/env python3
"""
Debug script to examine the exact longitude calculations causing wrong gates.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'witnessos-engines'))

from datetime import datetime
from engines.human_design import HumanDesignScanner, HumanDesignInput
from shared.calculations.astrology import AstrologyCalculator

def debug_longitude_calculations():
    """Debug the longitude calculations step by step."""
    
    # Test data from validation document
    birth_date = "1991-08-13"
    birth_time = "13:31:00"
    birth_location = [12.9629, 77.5775]  # Bengaluru coordinates
    timezone = "Asia/Kolkata"
    
    print("🔍 DEBUGGING LONGITUDE CALCULATIONS")
    print("=" * 50)
    print(f"Birth: {birth_date} {birth_time} {timezone}")
    print(f"Location: {birth_location[0]:.4f}°N, {birth_location[1]:.4f}°E")
    print()
    
    # Expected results from validation document
    expected_gates = {
        'personality_sun': 4,
        'personality_earth': 49,
        'design_sun': 23,
        'design_earth': 43
    }
    
    print("Expected Gates:")
    for position, gate in expected_gates.items():
        print(f"  {position:20}: Gate {gate}")
    print()
    
    # Test with AstrologyCalculator directly
    print("🧪 TESTING ASTROLOGY CALCULATOR DIRECTLY:")
    print("-" * 40)
    
    astro_calc = AstrologyCalculator()
    birth_datetime = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M:%S")
    
    try:
        hd_data = astro_calc.calculate_human_design_data(
            birth_datetime, birth_location[0], birth_location[1], timezone
        )
        
        print("Raw Astronomical Data:")
        print(f"  Birth datetime: {birth_datetime}")
        print(f"  Design datetime: {hd_data.get('design_datetime', 'Not calculated')}")
        print()
        
        # Check personality positions
        if 'personality_positions' in hd_data:
            print("Personality Positions (Raw Longitudes):")
            for planet, pos_data in hd_data['personality_positions'].items():
                if isinstance(pos_data, dict) and 'longitude' in pos_data:
                    longitude = pos_data['longitude']
                    print(f"  {planet:15}: {longitude:8.3f}°")
        
        # Check design positions
        if 'design_positions' in hd_data:
            print("\nDesign Positions (Raw Longitudes):")
            for planet, pos_data in hd_data['design_positions'].items():
                if isinstance(pos_data, dict) and 'longitude' in pos_data:
                    longitude = pos_data['longitude']
                    print(f"  {planet:15}: {longitude:8.3f}°")
        
        # Check calculated gates
        print("\nCalculated Gates:")
        if 'personality_gates' in hd_data:
            for planet, gate in hd_data['personality_gates'].items():
                print(f"  personality_{planet:10}: Gate {gate}")
        
        if 'design_gates' in hd_data:
            for planet, gate in hd_data['design_gates'].items():
                print(f"  design_{planet:15}: Gate {gate}")
        
        print()
        
        # Test different coordinate offsets manually
        print("🧪 TESTING MANUAL COORDINATE OFFSETS:")
        print("-" * 40)
        
        # Get raw sun longitudes
        personality_sun_raw = None
        design_sun_raw = None
        
        if 'personality_positions' in hd_data and 'sun' in hd_data['personality_positions']:
            personality_sun_raw = hd_data['personality_positions']['sun']['longitude']
        
        if 'design_positions' in hd_data and 'sun' in hd_data['design_positions']:
            design_sun_raw = hd_data['design_positions']['sun']['longitude']
        
        if personality_sun_raw is not None and design_sun_raw is not None:
            print(f"Raw Personality Sun: {personality_sun_raw:.3f}°")
            print(f"Raw Design Sun: {design_sun_raw:.3f}°")
            print()
            
            # Test different offsets to find the correct ones
            test_offsets = [
                ("Current Personality", personality_sun_raw, -120, 4),  # Expected Gate 4
                ("Current Design", design_sun_raw, 72, 23),  # Expected Gate 23
                ("Swiss Personality", personality_sun_raw, -134, 4),  # Swiss Ephemeris offset
                ("Swiss Design", design_sun_raw, 58, 23),  # Swiss Ephemeris offset
                ("No offset Personality", personality_sun_raw, 0, 4),
                ("No offset Design", design_sun_raw, 0, 23),
                ("+180 Personality", personality_sun_raw, 180, 4),
                ("+180 Design", design_sun_raw, 180, 23),
            ]
            
            for test_name, raw_longitude, offset, expected_gate in test_offsets:
                adjusted_longitude = (raw_longitude + offset) % 360
                gate_degrees = 360.0 / 64.0  # 5.625 degrees per gate
                calculated_gate = int(adjusted_longitude / gate_degrees) + 1
                
                match = "✅" if calculated_gate == expected_gate else "❌"
                print(f"  {test_name:20}: {adjusted_longitude:8.3f}° → Gate {calculated_gate:2d} {match}")
        
    except Exception as e:
        print(f"❌ Error with AstrologyCalculator: {e}")
        import traceback
        traceback.print_exc()
    
    print()
    
    # Test with Human Design Scanner
    print("🧪 TESTING HUMAN DESIGN SCANNER:")
    print("-" * 40)
    
    try:
        scanner = HumanDesignScanner()
        
        input_data = HumanDesignInput(
            birth_date=datetime.strptime(birth_date, "%Y-%m-%d").date(),
            birth_time=datetime.strptime(birth_time, "%H:%M:%S").time(),
            birth_location=birth_location,
            timezone=timezone
        )
        
        result = scanner.calculate(input_data)
        
        print("Human Design Scanner Results:")
        if hasattr(result, 'chart') and result.chart:
            chart = result.chart
            
            # Check personality gates
            if hasattr(chart, 'personality_gates') and chart.personality_gates:
                print("\nPersonality Gates:")
                for planet, gate_obj in chart.personality_gates.items():
                    if hasattr(gate_obj, 'number'):
                        print(f"  {planet:15}: Gate {gate_obj.number}")
            
            # Check design gates
            if hasattr(chart, 'design_gates') and chart.design_gates:
                print("\nDesign Gates:")
                for planet, gate_obj in chart.design_gates.items():
                    if hasattr(gate_obj, 'number'):
                        print(f"  {planet:15}: Gate {gate_obj.number}")
            
            # Check profile
            if hasattr(chart, 'profile') and chart.profile:
                profile = chart.profile
                if hasattr(profile, 'name'):
                    print(f"\nProfile: {profile.name}")
                if hasattr(profile, 'personality_line') and hasattr(profile, 'design_line'):
                    print(f"Lines: {profile.personality_line}/{profile.design_line}")
        
    except Exception as e:
        print(f"❌ Error with Human Design Scanner: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_longitude_calculations()
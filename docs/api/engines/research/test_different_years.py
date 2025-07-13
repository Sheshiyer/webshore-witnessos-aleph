#!/usr/bin/env python3
"""
Test different years to see if any would produce the expected incarnation cross.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
from calculations.astrology import AstrologyCalculator

def test_different_years():
    """Test different years around 1991 to find the expected incarnation cross."""
    
    print("📅 Testing Different Years")
    print("=" * 30)
    
    # Base birth data
    birth_month = 8
    birth_day = 13
    birth_time = time(13, 31)
    birth_location = (12.9716, 77.5946)
    timezone = "Asia/Kolkata"
    lat, lon = birth_location
    
    # Expected incarnation cross
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    calc = AstrologyCalculator()
    gate_size = 360.0 / 64.0
    
    print(f"Target: {expected_gates['conscious_sun']}/{expected_gates['conscious_earth']} | {expected_gates['unconscious_sun']}/{expected_gates['unconscious_earth']}")
    print(f"Testing date: {birth_month}/{birth_day} at {birth_time}")
    print()
    
    best_matches = []
    
    # Test years from 1985 to 1995
    for year in range(1985, 1996):
        birth_date = date(year, birth_month, birth_day)
        birth_datetime = datetime.combine(birth_date, birth_time)
        
        try:
            # Get planetary positions
            personality_positions = calc.get_planetary_positions(
                birth_datetime, lat, lon, timezone
            )
            
            design_datetime = birth_datetime - timedelta(days=88)
            design_positions = calc.get_planetary_positions(
                design_datetime, lat, lon, timezone
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
            
            result = {
                'year': year,
                'matches': matches,
                'cross': cross_str,
                'gates': calculated_gates,
                'positions': positions
            }
            
            if matches > 0:
                best_matches.append(result)
                match_symbol = "🎯" if matches == 4 else "⚡" if matches >= 2 else "✨"
                print(f"{year}: {cross_str} ({matches}/4 matches) {match_symbol}")
            else:
                print(f"{year}: {cross_str} (0/4 matches)")
                
        except Exception as e:
            print(f"{year}: Error - {str(e)}")
    
    print("\n" + "="*50)
    print("BEST MATCHES:")
    
    if best_matches:
        # Sort by number of matches
        best_matches.sort(key=lambda x: x['matches'], reverse=True)
        
        for result in best_matches[:5]:  # Show top 5
            print(f"\n{result['year']}: {result['cross']} ({result['matches']}/4 matches)")
            
            if result['matches'] >= 2:
                print("  Detailed breakdown:")
                for gate_type in ['conscious_sun', 'conscious_earth', 'unconscious_sun', 'unconscious_earth']:
                    calc_gate = result['gates'][gate_type]
                    exp_gate = expected_gates[gate_type]
                    longitude = result['positions'][gate_type]
                    match_symbol = "✅" if calc_gate == exp_gate else "❌"
                    print(f"    {gate_type:>15}: {longitude:>8.3f}° → Gate {calc_gate:>2} (expected {exp_gate:>2}) {match_symbol}")
    else:
        print("No matches found in any tested year.")
    
    # Also test some specific years that might be relevant
    print(f"\n" + "="*50)
    print("TESTING SPECIFIC ALTERNATIVE YEARS:")
    
    alternative_years = [1990, 1992, 1989, 1993]
    
    for year in alternative_years:
        birth_date = date(year, birth_month, birth_day)
        birth_datetime = datetime.combine(birth_date, birth_time)
        
        try:
            personality_positions = calc.get_planetary_positions(
                birth_datetime, lat, lon, timezone
            )
            
            design_datetime = birth_datetime - timedelta(days=88)
            design_positions = calc.get_planetary_positions(
                design_datetime, lat, lon, timezone
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
                
                if calculated_gate == expected_gates[gate_type]:
                    matches += 1
            
            cross_str = f"{calculated_gates['conscious_sun']}/{calculated_gates['conscious_earth']} | {calculated_gates['unconscious_sun']}/{calculated_gates['unconscious_earth']}"
            
            print(f"{year}: {cross_str} ({matches}/4 matches)")
            
        except Exception as e:
            print(f"{year}: Error - {str(e)}")

if __name__ == "__main__":
    test_different_years()

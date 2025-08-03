#!/usr/bin/env python3
"""
Find what birth data would produce the expected incarnation cross.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
from calculations.astrology import AstrologyCalculator

def find_correct_birth_data():
    """
    Find what birth data would produce the expected incarnation cross.
    """
    
    print("🔍 Finding Birth Data for Expected Incarnation Cross")
    print("=" * 60)
    
    # Expected incarnation cross
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    # Base birth data
    base_date = date(1991, 8, 13)
    birth_location = (12.9716, 77.5946)
    timezone = "Asia/Kolkata"
    lat, lon = birth_location
    
    calc = AstrologyCalculator()
    
    print(f"Target Incarnation Cross: {expected_gates['conscious_sun']}/{expected_gates['conscious_earth']} | {expected_gates['unconscious_sun']}/{expected_gates['unconscious_earth']}")
    print()
    
    # Calculate what longitude ranges we need
    gate_size = 360.0 / 64.0
    target_ranges = {}
    
    for gate_type, gate_num in expected_gates.items():
        gate_start = (gate_num - 1) * gate_size
        gate_end = gate_num * gate_size
        gate_center = gate_start + (gate_size / 2)
        target_ranges[gate_type] = {
            'start': gate_start,
            'end': gate_end,
            'center': gate_center,
            'gate': gate_num
        }
    
    print("Target Longitude Ranges:")
    for gate_type, range_info in target_ranges.items():
        print(f"{gate_type:>15}: {range_info['start']:>8.3f}° - {range_info['end']:>8.3f}° (Gate {range_info['gate']})")
    print()
    
    # Test different dates around the birth date
    print("Testing Different Dates:")
    print("-" * 25)
    
    best_match = {'matches': 0, 'date': None, 'time': None, 'details': None}
    
    # Test dates within ±30 days
    for day_offset in range(-30, 31, 5):
        test_date = base_date + timedelta(days=day_offset)
        
        # Test different times
        for hour in [0, 6, 12, 18]:
            for minute in [0, 30]:
                test_time = time(hour, minute)
                test_datetime = datetime.combine(test_date, test_time)
                
                try:
                    # Get planetary positions
                    personality_positions = calc.get_planetary_positions(
                        test_datetime, lat, lon, timezone
                    )
                    
                    design_datetime = test_datetime - timedelta(days=88)
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
                    
                    # Check matches
                    matches = 0
                    match_details = {}
                    
                    for gate_type, longitude in positions.items():
                        calculated_gate = int(longitude / gate_size) + 1
                        if calculated_gate > 64:
                            calculated_gate -= 64
                        
                        expected_gate = expected_gates[gate_type]
                        is_match = calculated_gate == expected_gate
                        
                        if is_match:
                            matches += 1
                        
                        match_details[gate_type] = {
                            'longitude': longitude,
                            'calculated_gate': calculated_gate,
                            'expected_gate': expected_gate,
                            'match': is_match
                        }
                    
                    # Update best match
                    if matches > best_match['matches']:
                        best_match = {
                            'matches': matches,
                            'date': test_date,
                            'time': test_time,
                            'datetime': test_datetime,
                            'details': match_details,
                            'positions': positions
                        }
                        
                        print(f"New best: {test_date} {test_time} - {matches}/4 matches")
                        
                        if matches == 4:
                            print(f"🎯 PERFECT MATCH FOUND!")
                            break
                    
                except Exception as e:
                    continue
            
            if best_match['matches'] == 4:
                break
        
        if best_match['matches'] == 4:
            break
    
    print(f"\n" + "="*60)
    print("BEST MATCH FOUND:")
    print(f"Date: {best_match['date']}")
    print(f"Time: {best_match['time']}")
    print(f"Matches: {best_match['matches']}/4")
    print()
    
    if best_match['details']:
        print("Detailed Results:")
        for gate_type, details in best_match['details'].items():
            match_symbol = "✅" if details['match'] else "❌"
            print(f"{gate_type:>15}: {details['longitude']:>8.3f}° → Gate {details['calculated_gate']:>2} (expected {details['expected_gate']:>2}) {match_symbol}")
    
    # If we found a perfect match, show the difference from original
    if best_match['matches'] == 4:
        original_datetime = datetime.combine(base_date, time(13, 31))
        time_diff = best_match['datetime'] - original_datetime
        print(f"\nTime difference from original (13:31): {time_diff}")
    
    # Also test if a different location might work
    print(f"\n" + "="*60)
    print("Testing Different Locations (same date/time):")
    
    original_datetime = datetime.combine(base_date, time(13, 31))
    
    # Test some major cities
    test_locations = [
        ("New York", (40.7128, -74.0060)),
        ("London", (51.5074, -0.1278)),
        ("Mumbai", (19.0760, 72.8777)),
        ("Delhi", (28.7041, 77.1025)),
        ("Chennai", (13.0827, 80.2707)),
    ]
    
    for city_name, (test_lat, test_lon) in test_locations:
        try:
            personality_positions = calc.get_planetary_positions(
                original_datetime, test_lat, test_lon, timezone
            )
            
            design_datetime = original_datetime - timedelta(days=88)
            design_positions = calc.get_planetary_positions(
                design_datetime, test_lat, test_lon, timezone
            )
            
            # Calculate gates
            positions = {
                'conscious_sun': personality_positions['sun']['longitude'],
                'conscious_earth': (personality_positions['sun']['longitude'] + 180) % 360,
                'unconscious_sun': design_positions['sun']['longitude'],
                'unconscious_earth': (design_positions['sun']['longitude'] + 180) % 360
            }
            
            matches = 0
            for gate_type, longitude in positions.items():
                calculated_gate = int(longitude / gate_size) + 1
                if calculated_gate > 64:
                    calculated_gate -= 64
                expected_gate = expected_gates[gate_type]
                if calculated_gate == expected_gate:
                    matches += 1
            
            print(f"{city_name:>10}: {matches}/4 matches")
            
        except Exception as e:
            print(f"{city_name:>10}: Error - {str(e)}")

if __name__ == "__main__":
    find_correct_birth_data()

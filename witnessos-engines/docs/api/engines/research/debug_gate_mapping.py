#!/usr/bin/env python3
"""
Debug the gate mapping system to understand the discrepancy.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time, timedelta
from calculations.astrology import AstrologyCalculator

def debug_gate_mapping():
    """
    Debug different gate mapping approaches.
    """
    
    print("🔍 Debugging Gate Mapping System")
    print("=" * 50)
    
    # Expected results from HumDes.com
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    # Our calculated positions
    calculated_positions = {
        'conscious_sun': 140.093,
        'conscious_earth': 320.093,
        'unconscious_sun': 52.093,
        'unconscious_earth': 232.093
    }
    
    print("Current positions and expected gates:")
    for pos_type in expected_gates:
        pos = calculated_positions[pos_type]
        exp_gate = expected_gates[pos_type]
        print(f"  {pos_type:>15}: {pos:>8.3f}° → Expected Gate {exp_gate}")
    
    print("\n" + "="*50)
    print("TESTING DIFFERENT GATE MAPPING SYSTEMS")
    print("="*50)
    
    # Test 1: Standard mapping (what we're using)
    print("\n1. Standard mapping (0° = Gate 1):")
    gate_size = 360.0 / 64.0
    for pos_type, longitude in calculated_positions.items():
        gate = int(longitude / gate_size) + 1
        if gate > 64:
            gate -= 64
        expected = expected_gates[pos_type]
        print(f"   {pos_type:>15}: {longitude:>8.3f}° → Gate {gate:>2} (expected {expected:>2})")
    
    # Test 2: Different starting points
    print("\n2. Testing different starting points:")
    for offset_degrees in [0, 90, 180, 270]:
        print(f"\n   Offset by {offset_degrees}°:")
        for pos_type, longitude in calculated_positions.items():
            adjusted_longitude = (longitude + offset_degrees) % 360
            gate = int(adjusted_longitude / gate_size) + 1
            if gate > 64:
                gate -= 64
            expected = expected_gates[pos_type]
            match = "✅" if gate == expected else "❌"
            print(f"     {pos_type:>15}: {adjusted_longitude:>8.3f}° → Gate {gate:>2} (expected {expected:>2}) {match}")
    
    # Test 3: Reverse gate order
    print("\n3. Testing reverse gate order:")
    for pos_type, longitude in calculated_positions.items():
        gate = 65 - (int(longitude / gate_size) + 1)
        if gate <= 0:
            gate += 64
        expected = expected_gates[pos_type]
        match = "✅" if gate == expected else "❌"
        print(f"   {pos_type:>15}: {longitude:>8.3f}° → Gate {gate:>2} (expected {expected:>2}) {match}")
    
    # Test 4: Different gate size or starting point
    print("\n4. Testing if gates start at different degree:")
    # Maybe gates start at a different point in the zodiac
    for start_degree in [0, 15, 30, 45]:
        print(f"\n   Starting at {start_degree}°:")
        for pos_type, longitude in calculated_positions.items():
            adjusted_longitude = (longitude - start_degree) % 360
            gate = int(adjusted_longitude / gate_size) + 1
            if gate <= 0:
                gate += 64
            if gate > 64:
                gate -= 64
            expected = expected_gates[pos_type]
            match = "✅" if gate == expected else "❌"
            print(f"     {pos_type:>15}: {adjusted_longitude:>8.3f}° → Gate {gate:>2} (expected {expected:>2}) {match}")
    
    # Test 5: Check if there's a systematic offset
    print("\n5. Calculating required offsets:")
    for pos_type, longitude in calculated_positions.items():
        expected_gate = expected_gates[pos_type]
        
        # What longitude would give us the expected gate?
        expected_longitude_start = (expected_gate - 1) * gate_size
        expected_longitude_end = expected_gate * gate_size
        expected_longitude_center = expected_longitude_start + (gate_size / 2)
        
        # What's the difference?
        diff_to_start = (expected_longitude_start - longitude) % 360
        diff_to_center = (expected_longitude_center - longitude) % 360
        
        print(f"   {pos_type:>15}:")
        print(f"     Current: {longitude:>8.3f}°")
        print(f"     Expected range: {expected_longitude_start:>8.3f}° - {expected_longitude_end:>8.3f}°")
        print(f"     Offset needed: {diff_to_center:>8.3f}° (to center)")
    
    # Test 6: Maybe it's using a different ephemeris or coordinate system
    print("\n6. Testing coordinate system differences:")
    print("   (This might require different ephemeris data)")
    
    # Let's see if there's a consistent pattern in the offsets
    offsets = []
    for pos_type, longitude in calculated_positions.items():
        expected_gate = expected_gates[pos_type]
        expected_longitude_center = (expected_gate - 1) * gate_size + (gate_size / 2)
        offset = (expected_longitude_center - longitude) % 360
        if offset > 180:
            offset -= 360
        offsets.append(offset)
        print(f"   {pos_type:>15}: Offset = {offset:>8.3f}°")
    
    avg_offset = sum(offsets) / len(offsets)
    print(f"\n   Average offset: {avg_offset:>8.3f}°")
    
    # Test if applying the average offset works
    print(f"\n7. Testing with average offset ({avg_offset:.3f}°):")
    for pos_type, longitude in calculated_positions.items():
        adjusted_longitude = (longitude + avg_offset) % 360
        gate = int(adjusted_longitude / gate_size) + 1
        if gate > 64:
            gate -= 64
        expected = expected_gates[pos_type]
        match = "✅" if gate == expected else "❌"
        print(f"   {pos_type:>15}: {adjusted_longitude:>8.3f}° → Gate {gate:>2} (expected {expected:>2}) {match}")

if __name__ == "__main__":
    debug_gate_mapping()

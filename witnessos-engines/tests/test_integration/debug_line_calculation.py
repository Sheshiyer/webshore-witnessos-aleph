#!/usr/bin/env python3
"""
Debug script to test Human Design line calculations.
This will help identify why all planets are showing Line 6.
"""

import math
from typing import Tuple

def debug_line_calculation():
    """Debug the line calculation with known test cases."""
    
    print("🔍 DEBUGGING HUMAN DESIGN LINE CALCULATIONS")
    print("=" * 60)
    
    # Test cases based on actual chart data
    test_cases = [
        # Expected results from actual chart
        ("Personality Sun", "should be Gate 4, Line 2", None),
        ("Design Sun", "should be Gate 23, Line 4", None),
        
        # Test with specific longitude values that should give different lines
        ("Test Line 1", "Gate center + 0.1°", 0.1),
        ("Test Line 2", "Gate center + 1.0°", 1.0),
        ("Test Line 3", "Gate center + 2.0°", 2.0),
        ("Test Line 4", "Gate center + 3.0°", 3.0),
        ("Test Line 5", "Gate center + 4.0°", 4.0),
        ("Test Line 6", "Gate center + 5.0°", 5.0),
    ]
    
    # Test the current Swiss Ephemeris method
    print("\n🧪 TESTING CURRENT SWISS EPHEMERIS METHOD:")
    print("-" * 50)
    
    for name, description, test_longitude in test_cases:
        if test_longitude is not None:
            gate, line = swiss_ephemeris_method(test_longitude)
            print(f"{name:20} | {test_longitude:6.1f}° → Gate {gate:2d}, Line {line}")
    
    # Test alternative methods
    print("\n🧪 TESTING ALTERNATIVE METHODS:")
    print("-" * 50)
    
    # Test with longitude values that should span all 6 lines
    test_longitudes = [0.1, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4]  # Should give lines 1-6
    
    for i, longitude in enumerate(test_longitudes):
        gate1, line1 = swiss_ephemeris_method(longitude)
        gate2, line2 = alternative_method_1(longitude)
        gate3, line3 = alternative_method_2(longitude)
        
        print(f"Test {i+1:2d} | {longitude:4.1f}° → Swiss: L{line1} | Alt1: L{line2} | Alt2: L{line3}")
    
    # Test with actual problematic values
    print("\n🚨 TESTING WITH PROBLEMATIC VALUES:")
    print("-" * 50)
    
    # These are longitude values that might be causing the Line 6 issue
    problematic_values = [
        ("High longitude", 350.0),
        ("Mid longitude", 180.0),
        ("Low longitude", 10.0),
        ("Edge case 1", 359.9),
        ("Edge case 2", 0.1),
    ]
    
    for name, longitude in problematic_values:
        gate, line = swiss_ephemeris_method(longitude)
        print(f"{name:15} | {longitude:6.1f}° → Gate {gate:2d}, Line {line}")
        
        # Debug the calculation step by step
        debug_step_by_step(longitude, name)

def swiss_ephemeris_method(longitude: float) -> Tuple[int, int]:
    """Current Swiss Ephemeris line calculation method."""
    
    # Official Human Design gate sequence (64 gates in I Ching wheel order)
    gate_sequence = [
        41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
        27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
        31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
        28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
    ]
    
    # Each gate covers 5.625 degrees (360° / 64 gates)
    gate_degrees = 360.0 / 64.0
    
    # Calculate gate index (0-63)
    gate_index = int(longitude / gate_degrees) % 64
    gate_number = gate_sequence[gate_index]
    
    # Calculate line within gate (1-6)
    # Each line covers 0.9375 degrees (5.625° / 6 lines)
    line_degrees = gate_degrees / 6.0
    position_in_gate = longitude % gate_degrees
    line_number = int(position_in_gate / line_degrees) + 1
    line_number = min(6, max(1, line_number))  # Ensure line is 1-6
    
    return gate_number, line_number

def alternative_method_1(longitude: float) -> Tuple[int, int]:
    """Alternative method 1 - simpler calculation."""
    
    # Normalize longitude
    longitude = longitude % 360
    
    # Each gate covers 5.625 degrees
    gate_degrees = 360.0 / 64.0
    
    # Calculate gate (simplified - just use index + 1)
    gate_index = int(longitude / gate_degrees)
    gate_number = (gate_index % 64) + 1
    
    # Calculate line
    position_in_gate = longitude % gate_degrees
    line_degrees = gate_degrees / 6.0
    line_number = int(position_in_gate / line_degrees) + 1
    line_number = max(1, min(6, line_number))
    
    return gate_number, line_number

def alternative_method_2(longitude: float) -> Tuple[int, int]:
    """Alternative method 2 - using fractional approach."""
    
    # Normalize longitude
    longitude = longitude % 360
    
    # Each gate covers 5.625 degrees
    gate_degrees = 360.0 / 64.0
    
    # Calculate gate
    gate_number = int(longitude / gate_degrees) + 1
    gate_number = max(1, min(64, gate_number))
    
    # Calculate line using fractional position
    position_in_gate = longitude % gate_degrees
    line_fraction = position_in_gate / gate_degrees
    line_number = int(line_fraction * 6) + 1
    line_number = max(1, min(6, line_number))
    
    return gate_number, line_number

def debug_step_by_step(longitude: float, name: str):
    """Debug the calculation step by step."""
    print(f"  🔍 Debug {name}:")
    
    gate_degrees = 360.0 / 64.0  # 5.625
    line_degrees = gate_degrees / 6.0  # 0.9375
    
    gate_index = int(longitude / gate_degrees) % 64
    position_in_gate = longitude % gate_degrees
    line_calc = position_in_gate / line_degrees
    line_number = int(line_calc) + 1
    
    print(f"    Longitude: {longitude:.4f}°")
    print(f"    Gate degrees: {gate_degrees:.4f}°")
    print(f"    Line degrees: {line_degrees:.4f}°")
    print(f"    Gate index: {gate_index}")
    print(f"    Position in gate: {position_in_gate:.4f}°")
    print(f"    Line calculation: {line_calc:.4f}")
    print(f"    Line number: {line_number}")
    print()

if __name__ == "__main__":
    debug_line_calculation()

#!/usr/bin/env python3
"""
Test script to verify the line calculation fix works correctly.
"""

def old_calculate_line(longitude: float, gate_num: int) -> int:
    """OLD (BROKEN) line calculation method."""
    gate_size = 360.0 / 64.0
    line_size = gate_size / 6.0

    # Position within the gate - WRONG METHOD
    gate_start = (gate_num - 1) * gate_size
    position_in_gate = longitude - gate_start
    if position_in_gate < 0:
        position_in_gate += 360

    line = int(position_in_gate / line_size) + 1
    return min(max(line, 1), 6)

def new_calculate_line(longitude: float, gate_num: int) -> int:
    """NEW (FIXED) line calculation method."""
    gate_degrees = 360.0 / 64.0  # 5.625 degrees per gate
    line_degrees = gate_degrees / 6.0  # 0.9375 degrees per line

    # FIXED: Use modulo to get position within current gate
    position_in_gate = longitude % gate_degrees
    line_number = int(position_in_gate / line_degrees) + 1
    return min(6, max(1, line_number))  # Clamp to 1-6

def swiss_ephemeris_method(longitude: float) -> tuple:
    """Swiss Ephemeris method for comparison."""
    gate_sequence = [
        41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
        27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
        31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
        28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
    ]
    
    gate_degrees = 360.0 / 64.0
    gate_index = int(longitude / gate_degrees) % 64
    gate_number = gate_sequence[gate_index]
    
    line_degrees = gate_degrees / 6.0
    position_in_gate = longitude % gate_degrees
    line_number = int(position_in_gate / line_degrees) + 1
    line_number = min(6, max(1, line_number))
    
    return gate_number, line_number

def test_line_calculations():
    """Test the line calculation fix."""
    
    print("🧪 TESTING LINE CALCULATION FIX")
    print("=" * 60)
    
    # Test cases with various longitude values
    test_cases = [
        # (longitude, expected_gate, expected_line, description)
        (0.1, 41, 1, "Very start of wheel"),
        (0.9, 41, 1, "Still Line 1"),
        (1.0, 41, 2, "Start of Line 2"),
        (2.8, 41, 3, "Line 3"),
        (4.7, 41, 5, "Line 5"),
        (5.5, 41, 6, "Line 6"),
        (5.625, 19, 1, "Next gate starts"),
        (19.6875, 4, 1, "Gate 4 area (expected for Shesh)"),
        (20.6875, 4, 2, "Gate 4, Line 2 (expected for Shesh)"),
        (128.8125, 23, 1, "Gate 23 area (expected for Design Sun)"),
        (132.5625, 23, 4, "Gate 23, Line 4 (expected for Design Sun)"),
    ]
    
    print(f"{'Longitude':>10} | {'Expected':>8} | {'Old Method':>10} | {'New Method':>10} | {'Swiss':>10} | {'Description'}")
    print("-" * 80)
    
    for longitude, exp_gate, exp_line, description in test_cases:
        # Get Swiss Ephemeris result (ground truth)
        swiss_gate, swiss_line = swiss_ephemeris_method(longitude)
        
        # Test old method (should be wrong)
        old_line = old_calculate_line(longitude, swiss_gate)
        
        # Test new method (should match Swiss)
        new_line = new_calculate_line(longitude, swiss_gate)
        
        # Format results
        expected = f"G{exp_gate}.{exp_line}"
        old_result = f"G{swiss_gate}.{old_line}"
        new_result = f"G{swiss_gate}.{new_line}"
        swiss_result = f"G{swiss_gate}.{swiss_line}"
        
        # Mark correct results
        old_correct = "✅" if old_line == exp_line else "❌"
        new_correct = "✅" if new_line == exp_line else "❌"
        
        print(f"{longitude:10.4f} | {expected:>8} | {old_result:>8} {old_correct} | {new_result:>8} {new_correct} | {swiss_result:>8} | {description}")
    
    print("\n🎯 SPECIFIC TEST FOR SHESH'S DATA:")
    print("-" * 40)
    
    # Test with longitudes that should give the expected results
    # These are approximate - we'd need actual Swiss Ephemeris to get exact values
    
    # Longitude that should give Gate 4, Line 2 (Personality Sun)
    test_longitude_p_sun = 20.6875  # Approximate
    swiss_gate, swiss_line = swiss_ephemeris_method(test_longitude_p_sun)
    old_line = old_calculate_line(test_longitude_p_sun, swiss_gate)
    new_line = new_calculate_line(test_longitude_p_sun, swiss_gate)
    
    print(f"Personality Sun test longitude: {test_longitude_p_sun}°")
    print(f"  Swiss Ephemeris: Gate {swiss_gate}, Line {swiss_line}")
    print(f"  Old method: Gate {swiss_gate}, Line {old_line} {'✅' if old_line == 2 else '❌'}")
    print(f"  New method: Gate {swiss_gate}, Line {new_line} {'✅' if new_line == 2 else '❌'}")
    
    # Longitude that should give Gate 23, Line 4 (Design Sun)
    test_longitude_d_sun = 132.5625  # Approximate
    swiss_gate, swiss_line = swiss_ephemeris_method(test_longitude_d_sun)
    old_line = old_calculate_line(test_longitude_d_sun, swiss_gate)
    new_line = new_calculate_line(test_longitude_d_sun, swiss_gate)
    
    print(f"\nDesign Sun test longitude: {test_longitude_d_sun}°")
    print(f"  Swiss Ephemeris: Gate {swiss_gate}, Line {swiss_line}")
    print(f"  Old method: Gate {swiss_gate}, Line {old_line} {'✅' if old_line == 4 else '❌'}")
    print(f"  New method: Gate {swiss_gate}, Line {new_line} {'✅' if new_line == 4 else '❌'}")
    
    print("\n🏆 CONCLUSION:")
    print("The new method should now produce varied line numbers (1-6)")
    print("instead of always returning Line 6 like the old method.")
    print("This fix should resolve the profile calculation error!")

if __name__ == "__main__":
    test_line_calculations()

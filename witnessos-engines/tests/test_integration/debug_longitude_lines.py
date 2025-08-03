#!/usr/bin/env python3
"""
Debug script to test longitude to line calculations
"""

def longitude_to_gate_line(longitude: float):
    """
    Convert astronomical longitude to Human Design gate and line.
    Uses the official I Ching wheel sequence starting from 0° Aries.
    """
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

# Test with some example longitudes
test_longitudes = [
    0.0,    # Should be Gate 41, Line 1
    2.8,    # Should be Gate 41, Line 4 (middle of gate)
    5.6,    # Should be Gate 41, Line 6 (end of gate)
    5.625,  # Should be Gate 19, Line 1 (start of next gate)
    140.0,  # Random longitude
    250.0,  # Random longitude
]

print("🧪 Testing longitude to gate/line conversion:")
print("=" * 60)

for longitude in test_longitudes:
    gate, line = longitude_to_gate_line(longitude)
    gate_degrees = 360.0 / 64.0
    position_in_gate = longitude % gate_degrees
    line_degrees = gate_degrees / 6.0
    
    print(f"Longitude: {longitude:6.2f}° → Gate {gate:2d}, Line {line}")
    print(f"  Position in gate: {position_in_gate:.3f}° (line degree: {line_degrees:.3f}°)")
    print(f"  Line calculation: int({position_in_gate:.3f} / {line_degrees:.3f}) + 1 = {int(position_in_gate / line_degrees) + 1}")
    print()

# Test specific values that might be causing Line 6 issues
print("\n🔍 Testing edge cases that might cause Line 6:")
print("=" * 60)

# Test values near the end of gates
for gate_num in range(3):
    base_longitude = gate_num * 5.625
    for offset in [5.0, 5.2, 5.4, 5.6, 5.62]:
        longitude = base_longitude + offset
        gate, line = longitude_to_gate_line(longitude)
        print(f"Longitude: {longitude:6.2f}° → Gate {gate:2d}, Line {line}")

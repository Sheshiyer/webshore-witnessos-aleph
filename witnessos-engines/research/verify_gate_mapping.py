#!/usr/bin/env python3
"""
Verify the gate mapping logic and find what longitude should give us the expected gates.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from calculations.astrology import AstrologyCalculator

def verify_gate_mapping():
    """Verify gate mapping and find required longitudes for expected gates."""
    
    print("🔍 Verifying Gate Mapping Logic")
    print("=" * 50)
    
    calc = AstrologyCalculator()
    
    # Expected gates
    expected_gates = [4, 49, 23, 43]
    
    print("Expected Gates and their longitude ranges:")
    print("-" * 40)
    
    gate_size = 360.0 / 64.0  # 5.625 degrees per gate
    
    for gate in expected_gates:
        gate_start = (gate - 1) * gate_size
        gate_end = gate * gate_size
        gate_center = gate_start + (gate_size / 2)
        
        print(f"Gate {gate:>2}: {gate_start:>8.4f}° - {gate_end:>8.4f}° (center: {gate_center:>8.4f}°)")
        
        # Verify the calculation works both ways
        calculated_gate = calc.longitude_to_human_design_gate(gate_center)
        print(f"         Center {gate_center:.4f}° → Gate {calculated_gate} {'✅' if calculated_gate == gate else '❌'}")
        print()
    
    print("Current Sun position analysis:")
    print("-" * 30)
    
    # Our current Sun longitude
    current_sun_longitude = 140.0935
    current_gate = calc.longitude_to_human_design_gate(current_sun_longitude)
    
    print(f"Current Sun longitude: {current_sun_longitude:.4f}°")
    print(f"Current gate: {current_gate}")
    
    # What longitude would give us Gate 4?
    target_gate = 4
    target_gate_start = (target_gate - 1) * gate_size
    target_gate_end = target_gate * gate_size
    target_gate_center = target_gate_start + (gate_size / 2)
    
    print(f"\nTo get Gate {target_gate}:")
    print(f"Need longitude: {target_gate_start:.4f}° - {target_gate_end:.4f}°")
    print(f"Center would be: {target_gate_center:.4f}°")
    print(f"Difference from current: {target_gate_center - current_sun_longitude:.4f}°")
    
    # This is a huge difference - let's check if there's an offset issue
    print(f"\nDifference analysis:")
    print(f"Current longitude: {current_sun_longitude:.4f}°")
    print(f"Target longitude:  {target_gate_center:.4f}°")
    print(f"Difference:        {current_sun_longitude - target_gate_center:.4f}°")
    
    # Check if there's a systematic offset
    offset = current_sun_longitude - target_gate_center
    print(f"Offset in gates:   {offset / gate_size:.2f} gates")
    
    # Test different gate ordering systems
    print(f"\n🔍 Testing different gate ordering systems:")
    print("-" * 45)
    
    # Standard I-Ching order (what we're using)
    standard_gate = calc.longitude_to_human_design_gate(current_sun_longitude)
    print(f"Standard calculation: {current_sun_longitude:.4f}° → Gate {standard_gate}")
    
    # Try different starting points
    for start_gate in [0, 1, 2]:
        alt_gate = int((current_sun_longitude / gate_size) % 64) + start_gate
        if alt_gate > 64:
            alt_gate -= 64
        if alt_gate < 1:
            alt_gate += 64
        print(f"Starting from {start_gate}: {current_sun_longitude:.4f}° → Gate {alt_gate}")
    
    # Try reverse order
    reverse_gate = 64 - int((current_sun_longitude / gate_size) % 64) + 1
    if reverse_gate > 64:
        reverse_gate -= 64
    print(f"Reverse order: {current_sun_longitude:.4f}° → Gate {reverse_gate}")
    
    print(f"\n🎯 Summary:")
    print(f"To get your expected incarnation cross (4/49 | 23/43),")
    print(f"the Sun would need to be at approximately:")
    
    for gate in [4, 49, 23, 43]:
        gate_center = (gate - 1) * gate_size + (gate_size / 2)
        print(f"  Gate {gate}: {gate_center:.4f}°")

if __name__ == "__main__":
    verify_gate_mapping()

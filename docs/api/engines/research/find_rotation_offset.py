#!/usr/bin/env python3
"""
Find the rotation offset for the Human Design wheel.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_official_gate_sequence():
    """Create the official Human Design gate sequence."""
    
    # Quarter of Initiation
    quarter_initiation = [
        [13, 49, 30, 55],  # Kali
        [37, 63, 22, 36],  # Mitra
        [25, 17, 21, 51],  # Michael
        [42, 3, 27, 24]    # Janus
    ]
    
    # Quarter of Civilization
    quarter_civilization = [
        [2, 23, 8, 20],    # Maia
        [16, 35, 45, 12],  # Lakshmi
        [15, 52, 39, 53],  # Parvati
        [62, 56, 31, 33]   # Ma'at
    ]
    
    # Quarter of Duality
    quarter_duality = [
        [7, 4, 29, 59],    # Thoth
        [40, 64, 47, 6],   # Harmonia
        [46, 18, 48, 57],  # Christ Consciousness
        [44, 28, 50, 32]   # Minerva
    ]
    
    # Quarter of Mutation
    quarter_mutation = [
        [1, 43, 14, 34],   # Hades
        [9, 5, 26, 11],    # Prometheus
        [10, 58, 38, 54],  # Vishnu
        [60, 61, 41, 19]   # Keepers
    ]
    
    # Combine all quarters
    all_quarters = [
        quarter_initiation,
        quarter_civilization, 
        quarter_duality,
        quarter_mutation
    ]
    
    # Create flat sequence
    gate_sequence = []
    for quarter in all_quarters:
        for godhead in quarter:
            gate_sequence.extend(godhead)
    
    return gate_sequence

def find_gate_position(gate, gate_sequence):
    """Find the position of a gate in the sequence."""
    try:
        return gate_sequence.index(gate)
    except ValueError:
        return None

def calculate_required_offset():
    """Calculate what rotation offset would give us the correct gates."""
    
    print("🔍 Calculating Required Rotation Offset")
    print("=" * 60)
    
    gate_sequence = create_official_gate_sequence()
    
    # Our calculated longitudes
    calculated_longitudes = {
        'conscious_sun': 140.093,
        'conscious_earth': (140.093 + 180) % 360,  # 320.093
        'unconscious_sun': 52.094,
        'unconscious_earth': (52.094 + 180) % 360   # 232.094
    }
    
    # Expected gates
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    gate_size = 360.0 / 64.0  # 5.625 degrees per gate
    
    print("Calculating offsets for each position:")
    print("-" * 60)
    
    offsets = []
    
    for position, longitude in calculated_longitudes.items():
        expected_gate = expected_gates[position]
        
        # Find where the expected gate is in the sequence
        expected_position = find_gate_position(expected_gate, gate_sequence)
        
        if expected_position is not None:
            # Calculate current position based on longitude
            current_position = longitude / gate_size
            
            # Calculate required offset in positions
            position_offset = expected_position - current_position
            
            # Convert to degrees
            degree_offset = position_offset * gate_size
            
            # Normalize to 0-360
            degree_offset = degree_offset % 360
            
            offsets.append(degree_offset)
            
            print(f"\n{position}:")
            print(f"  Longitude: {longitude:.3f}°")
            print(f"  Current position: {current_position:.1f}")
            print(f"  Expected gate: {expected_gate}")
            print(f"  Expected position: {expected_position}")
            print(f"  Position offset needed: {position_offset:.1f}")
            print(f"  Degree offset needed: {degree_offset:.3f}°")
        else:
            print(f"\n{position}: Gate {expected_gate} not found in sequence!")
    
    if offsets:
        # Check if all offsets are similar
        avg_offset = sum(offsets) / len(offsets)
        max_diff = max(abs(offset - avg_offset) for offset in offsets)
        
        print(f"\n📊 OFFSET ANALYSIS:")
        print(f"All calculated offsets: {[f'{o:.1f}°' for o in offsets]}")
        print(f"Average offset: {avg_offset:.3f}°")
        print(f"Maximum difference: {max_diff:.3f}°")
        
        if max_diff < 5:  # If all offsets are within 5 degrees
            print(f"✅ Consistent offset found: {avg_offset:.1f}°")
            return avg_offset
        else:
            print("❌ Offsets are not consistent - may need different approach")
            return None
    
    return None

def test_with_offset(offset_degrees):
    """Test the gate mapping with a specific offset."""
    
    print(f"\n🧪 Testing with offset: {offset_degrees:.1f}°")
    print("=" * 60)
    
    gate_sequence = create_official_gate_sequence()
    gate_size = 360.0 / 64.0
    
    # Our calculated longitudes
    calculated_longitudes = {
        'conscious_sun': 140.093,
        'conscious_earth': (140.093 + 180) % 360,
        'unconscious_sun': 52.094,
        'unconscious_earth': (52.094 + 180) % 360
    }
    
    # Expected gates
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    matches = 0
    total = 4
    
    for position, longitude in calculated_longitudes.items():
        # Apply offset
        adjusted_longitude = (longitude + offset_degrees) % 360
        
        # Calculate gate position
        gate_position = int(adjusted_longitude / gate_size)
        gate_position = min(gate_position, 63)
        
        calculated_gate = gate_sequence[gate_position]
        expected_gate = expected_gates[position]
        
        match = "✅" if calculated_gate == expected_gate else "❌"
        if calculated_gate == expected_gate:
            matches += 1
            
        print(f"\n{position}:")
        print(f"  Original longitude: {longitude:.3f}°")
        print(f"  Adjusted longitude: {adjusted_longitude:.3f}°")
        print(f"  Gate position: {gate_position}")
        print(f"  Calculated gate: {calculated_gate}")
        print(f"  Expected gate: {expected_gate}")
        print(f"  Match: {match}")
    
    print(f"\n📈 ACCURACY: {matches}/{total} gates match ({matches/total*100:.1f}%)")
    
    return matches == total

def find_best_offset():
    """Try different offsets to find the best match."""
    
    print("\n🔍 Searching for Best Offset")
    print("=" * 60)
    
    best_matches = 0
    best_offset = 0
    
    # Try offsets in 1-degree increments
    for offset in range(0, 360, 1):
        gate_sequence = create_official_gate_sequence()
        gate_size = 360.0 / 64.0
        
        calculated_longitudes = {
            'conscious_sun': 140.093,
            'conscious_earth': (140.093 + 180) % 360,
            'unconscious_sun': 52.094,
            'unconscious_earth': (52.094 + 180) % 360
        }
        
        expected_gates = {
            'conscious_sun': 4,
            'conscious_earth': 49,
            'unconscious_sun': 23,
            'unconscious_earth': 43
        }
        
        matches = 0
        
        for position, longitude in calculated_longitudes.items():
            adjusted_longitude = (longitude + offset) % 360
            gate_position = int(adjusted_longitude / gate_size)
            gate_position = min(gate_position, 63)
            calculated_gate = gate_sequence[gate_position]
            expected_gate = expected_gates[position]
            
            if calculated_gate == expected_gate:
                matches += 1
        
        if matches > best_matches:
            best_matches = matches
            best_offset = offset
            
        if matches == 4:  # Perfect match found
            print(f"🎉 PERFECT MATCH found at offset: {offset}°")
            return offset
    
    print(f"🔶 Best match: {best_matches}/4 gates at offset: {best_offset}°")
    return best_offset

if __name__ == "__main__":
    # First, calculate theoretical offset
    theoretical_offset = calculate_required_offset()
    
    if theoretical_offset is not None:
        success = test_with_offset(theoretical_offset)
        if success:
            print(f"🎉 SUCCESS! Offset {theoretical_offset:.1f}° works perfectly!")
            sys.exit(0)
    
    # If theoretical doesn't work, search for best offset
    best_offset = find_best_offset()
    
    if best_offset is not None:
        print(f"\nTesting best offset: {best_offset}°")
        success = test_with_offset(best_offset)
        sys.exit(0 if success else 1)
    
    sys.exit(1)

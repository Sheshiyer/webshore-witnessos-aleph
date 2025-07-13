#!/usr/bin/env python3
"""
Create the official Human Design gate mapping based on the Godhead structure.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_official_gate_sequence():
    """Create the official Human Design gate sequence based on the Godhead structure."""
    
    # Based on the official Human Design mandala structure
    # Gates are arranged in Quarters and Godheads, not evenly around the zodiac
    
    # Quarter of Initiation (Gates 13-24) - Purpose fulfilled through Mind
    quarter_initiation = [
        # Kali - The Destroyer of False Devotion
        [13, 49, 30, 55],
        # Mitra - The Evolution of Consciousness  
        [37, 63, 22, 36],
        # Michael - The Angelical Mind
        [25, 17, 21, 51],
        # Janus - The Fertility of Mind
        [42, 3, 27, 24]
    ]
    
    # Quarter of Civilization (Gates 2-33) - Purpose fulfilled through Form
    quarter_civilization = [
        # Maia - The Mother Goddess
        [2, 23, 8, 20],
        # Lakshmi - Goddess of Beauty and Good Fortune
        [16, 35, 45, 12],
        # Parvati - Goddess of Domestic Bliss
        [15, 52, 39, 53],
        # Ma'at - Goddess of Truth, Justice and Cosmic Harmony
        [62, 56, 31, 33]
    ]
    
    # Quarter of Duality (Gates 7-44) - Purpose fulfilled through Bonding
    quarter_duality = [
        # Thoth - God of Wisdom, Writing and Time
        [7, 4, 29, 59],
        # Harmonia - Goddess of the Family Bond
        [40, 64, 47, 6],
        # Christ Consciousness Field - "Love Thy Neighbor"
        [46, 18, 48, 57],
        # Minerva - Virgin Goddess of Warfare, Arts and Crafts
        [44, 28, 50, 32]
    ]
    
    # Quarter of Mutation (Gates 1-19) - Purpose fulfilled through Transformation
    quarter_mutation = [
        # Hades - God of the Underworld
        [1, 43, 14, 34],
        # Prometheus - Thief of Fire and Benefactor of Humanity
        [9, 5, 26, 11],
        # Vishnu - God of Monotheism
        [10, 58, 38, 54],
        # The Keepers of the Wheel - Guardians of the Wheel
        [60, 61, 41, 19]
    ]
    
    # Combine all quarters in the correct sequence
    all_quarters = [
        quarter_initiation,
        quarter_civilization, 
        quarter_duality,
        quarter_mutation
    ]
    
    # Create a flat sequence of gates
    gate_sequence = []
    for quarter in all_quarters:
        for godhead in quarter:
            gate_sequence.extend(godhead)
    
    return gate_sequence

def create_gate_to_position_mapping():
    """Create a mapping from gate number to position in the wheel."""
    
    gate_sequence = create_official_gate_sequence()
    
    # Create mapping: gate_number -> position (0-63)
    gate_to_position = {}
    for position, gate in enumerate(gate_sequence):
        gate_to_position[gate] = position
    
    return gate_to_position, gate_sequence

def longitude_to_gate_official(longitude):
    """Convert longitude to gate using the official Human Design sequence."""
    
    gate_to_position, gate_sequence = create_gate_to_position_mapping()
    
    # Normalize longitude to 0-360
    longitude = longitude % 360
    
    # Each gate covers 360/64 = 5.625 degrees
    gate_size = 360.0 / 64.0
    
    # Calculate position in the sequence
    position = int(longitude / gate_size)
    
    # Make sure we don't go out of bounds
    position = min(position, 63)
    
    # Get the gate at this position
    gate = gate_sequence[position]
    
    return gate

def test_official_mapping():
    """Test the official gate mapping."""
    
    print("🔍 Testing Official Human Design Gate Mapping")
    print("=" * 60)
    
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
    
    print("Testing official gate mapping:")
    print("-" * 60)
    
    matches = 0
    total = 4
    
    for position, longitude in calculated_longitudes.items():
        expected_gate = expected_gates[position]
        calculated_gate = longitude_to_gate_official(longitude)
        
        match = "✅" if calculated_gate == expected_gate else "❌"
        if calculated_gate == expected_gate:
            matches += 1
            
        print(f"\n{position}:")
        print(f"  Longitude: {longitude:.3f}°")
        print(f"  Calculated Gate: {calculated_gate}")
        print(f"  Expected Gate: {expected_gate}")
        print(f"  Match: {match}")
    
    print(f"\n📈 ACCURACY: {matches}/{total} gates match ({matches/total*100:.1f}%)")
    
    if matches == total:
        print("🎉 PERFECT MATCH! Official mapping is correct!")
        return True
    else:
        print("🔴 Still not matching. Need to investigate the exact sequence.")
        
        # Show the gate sequence around our calculated positions
        gate_to_position, gate_sequence = create_gate_to_position_mapping()
        
        print("\nGate sequence analysis:")
        print("-" * 40)
        
        for position, longitude in calculated_longitudes.items():
            gate_size = 360.0 / 64.0
            seq_position = int(longitude / gate_size)
            calculated_gate = gate_sequence[seq_position]
            expected_gate = expected_gates[position]
            
            print(f"\n{position} (longitude {longitude:.3f}°):")
            print(f"  Sequence position: {seq_position}")
            print(f"  Gates around this position:")
            
            for offset in range(-2, 3):
                test_pos = (seq_position + offset) % 64
                test_gate = gate_sequence[test_pos]
                marker = "👉" if test_pos == seq_position else "  "
                expected_marker = "⭐" if test_gate == expected_gate else ""
                
                print(f"    {marker} Position {test_pos:2d}: Gate {test_gate:2d} {expected_marker}")
        
        return False

def analyze_gate_sequence():
    """Analyze the gate sequence structure."""
    
    print("\n🔍 Gate Sequence Structure Analysis")
    print("=" * 60)
    
    gate_to_position, gate_sequence = create_gate_to_position_mapping()
    
    print("Official Human Design gate sequence (first 16 gates):")
    for i in range(16):
        print(f"Position {i:2d}: Gate {gate_sequence[i]:2d}")
    
    print("\nQuarter boundaries:")
    print("Quarter of Initiation:  Positions  0-15 (Gates 13-24)")
    print("Quarter of Civilization: Positions 16-31 (Gates 2-33)")  
    print("Quarter of Duality:     Positions 32-47 (Gates 7-44)")
    print("Quarter of Mutation:    Positions 48-63 (Gates 1-19)")

if __name__ == "__main__":
    success = test_official_mapping()
    analyze_gate_sequence()
    sys.exit(0 if success else 1)

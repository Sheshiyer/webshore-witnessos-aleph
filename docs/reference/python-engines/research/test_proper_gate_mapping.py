#!/usr/bin/env python3
"""
Test the proper Human Design gate mapping using zodiac sign information.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_zodiac_gate_mapping():
    """Create the proper gate-to-zodiac mapping from the Human Design system."""
    
    # Based on the gate cheat sheet, create zodiac sign to gates mapping
    # Each zodiac sign is 30 degrees, starting from 0° Aries
    zodiac_gates = {
        # Aries (0° - 30°)
        'aries': [3, 17, 21, 25, 42, 51],
        
        # Taurus (30° - 60°)  
        'taurus': [2, 3, 8, 23, 24, 27],
        
        # Gemini (60° - 90°)
        'gemini': [8, 12, 15, 16, 20, 35, 45],
        
        # Cancer (90° - 120°)
        'cancer': [15, 38, 39, 52, 53, 56, 62],
        
        # Leo (120° - 150°)
        'leo': [4, 7, 29, 31, 33, 56],
        
        # Virgo (150° - 180°)
        'virgo': [6, 29, 40, 47, 59, 64],
        
        # Libra (180° - 210°)
        'libra': [18, 32, 46, 48, 50, 57],
        
        # Scorpio (210° - 240°)
        'scorpio': [1, 14, 28, 43, 44],
        
        # Sagittarius (240° - 270°)
        'sagittarius': [5, 9, 10, 14, 26, 34],
        
        # Capricorn (270° - 300°)
        'capricorn': [10, 54, 58, 60, 61],
        
        # Aquarius (300° - 330°)
        'aquarius': [13, 19, 30, 41, 49, 60],
        
        # Pisces (330° - 360°)
        'pisces': [22, 25, 30, 36, 37, 55, 63]
    }
    
    return zodiac_gates

def longitude_to_zodiac_sign(longitude):
    """Convert longitude to zodiac sign."""
    # Normalize longitude to 0-360
    longitude = longitude % 360
    
    signs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
             'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']
    
    sign_index = int(longitude // 30)
    sign_name = signs[sign_index]
    degrees_in_sign = longitude % 30
    
    return sign_name, degrees_in_sign

def find_gate_in_sign(longitude, zodiac_gates):
    """Find the correct gate for a longitude using zodiac mapping."""
    sign_name, degrees_in_sign = longitude_to_zodiac_sign(longitude)
    
    if sign_name in zodiac_gates:
        gates_in_sign = zodiac_gates[sign_name]
        
        # Each gate covers 30°/number_of_gates_in_sign
        if gates_in_sign:
            gate_size = 30.0 / len(gates_in_sign)
            gate_index = int(degrees_in_sign / gate_size)
            
            # Make sure we don't go out of bounds
            gate_index = min(gate_index, len(gates_in_sign) - 1)
            
            return gates_in_sign[gate_index], sign_name, degrees_in_sign
    
    return None, sign_name, degrees_in_sign

def test_zodiac_gate_mapping():
    """Test the zodiac-based gate mapping."""
    
    print("🔍 Testing Zodiac-Based Gate Mapping")
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
    
    zodiac_gates = create_zodiac_gate_mapping()
    
    print("Testing zodiac-based gate mapping:")
    print("-" * 60)
    
    matches = 0
    total = 4
    
    for position, longitude in calculated_longitudes.items():
        expected_gate = expected_gates[position]
        
        gate, sign, degrees_in_sign = find_gate_in_sign(longitude, zodiac_gates)
        
        match = "✅" if gate == expected_gate else "❌"
        if gate == expected_gate:
            matches += 1
            
        print(f"\n{position}:")
        print(f"  Longitude: {longitude:.3f}°")
        print(f"  Zodiac Sign: {sign.title()} ({degrees_in_sign:.3f}° into sign)")
        print(f"  Calculated Gate: {gate}")
        print(f"  Expected Gate: {expected_gate}")
        print(f"  Match: {match}")
        
        if sign in zodiac_gates:
            print(f"  Available gates in {sign.title()}: {zodiac_gates[sign]}")
    
    print(f"\n📈 ACCURACY: {matches}/{total} gates match ({matches/total*100:.1f}%)")
    
    if matches == total:
        print("🎉 PERFECT MATCH! Zodiac-based mapping is correct!")
    elif matches >= 2:
        print("🔶 PARTIAL MATCH! Getting closer to the correct mapping.")
    else:
        print("🔴 Still not matching. Need to investigate further.")
    
    return matches == total

def analyze_gate_distribution():
    """Analyze how gates are distributed across zodiac signs."""
    
    print("\n🔍 Gate Distribution Analysis")
    print("=" * 60)
    
    zodiac_gates = create_zodiac_gate_mapping()
    
    total_gates = 0
    for sign, gates in zodiac_gates.items():
        total_gates += len(gates)
        degrees_per_gate = 30.0 / len(gates) if gates else 0
        print(f"{sign.title():12}: {len(gates):2} gates ({degrees_per_gate:.2f}°/gate) - {gates}")
    
    print(f"\nTotal gates mapped: {total_gates}/64")
    
    if total_gates != 64:
        print(f"⚠️  Missing {64 - total_gates} gates from the mapping!")

if __name__ == "__main__":
    success = test_zodiac_gate_mapping()
    analyze_gate_distribution()
    sys.exit(0 if success else 1)

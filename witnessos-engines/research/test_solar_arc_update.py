#!/usr/bin/env python3
"""
Test the updated solar arc calculation method.
This script tests our new 88-degree solar arc calculation against the expected results.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time
from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput

def test_solar_arc_calculation():
    """Test the updated solar arc calculation method."""
    
    print("🔍 Testing Updated Solar Arc Calculation Method")
    print("=" * 60)
    
    # Expected results from HumDes.com and Jovian Archive
    expected_gates = {
        'conscious_sun': 4,
        'conscious_earth': 49,
        'unconscious_sun': 23,
        'unconscious_earth': 43
    }
    
    print(f"Expected Incarnation Cross: {expected_gates['conscious_sun']}/{expected_gates['conscious_earth']} | {expected_gates['unconscious_sun']}/{expected_gates['unconscious_earth']}")
    print("Expected: Right Angle Cross of Explanation")
    print()
    
    # Test data - Mage's birth data
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)  # 13:31 local time
    birth_location = (12.9716, 77.5946)  # Bengaluru coordinates
    timezone = "Asia/Kolkata"
    
    # Create input
    input_data = HumanDesignInput(
        birth_date=birth_date,
        birth_time=birth_time,
        birth_location=birth_location,
        timezone=timezone
    )
    
    print(f"Birth Data:")
    print(f"  Date: {birth_date}")
    print(f"  Time: {birth_time} ({timezone})")
    print(f"  Location: Bengaluru ({birth_location[0]}, {birth_location[1]})")
    print()
    
    # Initialize engine
    engine = HumanDesignScanner()
    
    try:
        # Calculate Human Design chart
        print("🔄 Calculating with updated solar arc method...")
        result = engine.calculate(input_data)
        
        # Extract incarnation cross
        incarnation_cross = result.raw_data['incarnation_cross']
        gates = incarnation_cross['gates']
        
        print("✅ Calculation completed!")
        print()
        
        print("📊 RESULTS:")
        print(f"Incarnation Cross: {incarnation_cross['name']}")
        print(f"Gates: {gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}")
        print()
        
        # Check if calculation details are included
        if 'calculation_details' in incarnation_cross:
            details = incarnation_cross['calculation_details']
            print("🔧 Solar Arc Calculation Details:")
            for key, value in details.items():
                print(f"  {key}: {value}")
            print()
        
        # Check design info
        design_info = result.raw_data['design_info']
        print("🕐 Design Information:")
        print(f"  Method: {design_info['calculation_method']}")
        print(f"  Design DateTime: {design_info['datetime']}")
        if 'solar_arc_details' in design_info:
            print("  Solar Arc Details:")
            for key, value in design_info['solar_arc_details'].items():
                print(f"    {key}: {value}")
        print()
        
        # Compare with expected results
        print("🎯 COMPARISON WITH EXPECTED RESULTS:")
        matches = 0
        total = 4
        
        for gate_type, expected_gate in expected_gates.items():
            actual_gate = gates[gate_type]
            match = "✅" if actual_gate == expected_gate else "❌"
            print(f"  {gate_type}: Expected {expected_gate}, Got {actual_gate} {match}")
            if actual_gate == expected_gate:
                matches += 1
        
        print()
        print(f"📈 ACCURACY: {matches}/{total} gates match ({matches/total*100:.1f}%)")
        
        if matches == total:
            print("🎉 PERFECT MATCH! Solar arc calculation is working correctly!")
        elif matches >= 3:
            print("🔶 CLOSE MATCH! Minor discrepancy - may need fine-tuning.")
        else:
            print("🔴 SIGNIFICANT DISCREPANCY! Solar arc calculation needs adjustment.")
        
        return matches == total
        
    except Exception as e:
        print(f"❌ Error during calculation: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_solar_arc_calculation()
    sys.exit(0 if success else 1)

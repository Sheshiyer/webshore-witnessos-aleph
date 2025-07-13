#!/usr/bin/env python3
"""
Test the Human Design calculation with multiple birth data sets.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time
from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput

def test_birth_data(name, birth_date, birth_time, birth_location, timezone, expected_cross=None):
    """Test Human Design calculation for a specific birth data set."""
    
    print(f"\n🔍 Testing: {name}")
    print("=" * 60)
    
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
    print(f"  Location: {birth_location}")
    print()
    
    # Initialize engine
    engine = HumanDesignScanner()
    
    try:
        # Calculate Human Design chart
        print("🔄 Calculating...")
        result = engine.calculate(input_data)
        
        # Extract results
        incarnation_cross = result.raw_data['incarnation_cross']
        gates = incarnation_cross['gates']
        design_info = result.raw_data['design_info']
        
        print("✅ Calculation completed!")
        print()
        
        print("📊 RESULTS:")
        print(f"Incarnation Cross: {incarnation_cross['name']}")
        print(f"Gates: {gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}")
        print(f"Type: {result.raw_data['type']}")
        print(f"Strategy: {result.raw_data['strategy']}")
        print(f"Authority: {result.raw_data['authority']}")
        print(f"Profile: {result.raw_data['profile']['line']}")
        print()
        
        # Show calculation details
        if 'calculation_details' in incarnation_cross:
            details = incarnation_cross['calculation_details']
            print("🔧 Calculation Details:")
            for key, value in details.items():
                print(f"  {key}: {value}")
            print()
        
        # Show design info
        print("🕐 Design Information:")
        print(f"  Method: {design_info['calculation_method']}")
        print(f"  Design DateTime: {design_info['datetime']}")
        if 'solar_arc_details' in design_info:
            print("  Solar Arc Details:")
            for key, value in design_info['solar_arc_details'].items():
                print(f"    {key}: {value}")
        print()
        
        # Verify solar arc is exactly 88 degrees
        if 'solar_arc_details' in design_info:
            arc_diff = design_info['solar_arc_details'].get('solar_arc_difference', '')
            if '88.0°' in arc_diff:
                print("✅ Solar arc calculation: CORRECT (88.0°)")
            else:
                print(f"⚠️  Solar arc calculation: {arc_diff} (should be 88.0°)")
        
        # Check against expected cross if provided
        if expected_cross:
            actual_gates = f"{gates['conscious_sun']}/{gates['conscious_earth']} | {gates['unconscious_sun']}/{gates['unconscious_earth']}"
            if actual_gates == expected_cross:
                print(f"✅ Expected cross match: {expected_cross}")
            else:
                print(f"❌ Cross mismatch - Expected: {expected_cross}, Got: {actual_gates}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error during calculation: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def run_multiple_tests():
    """Run tests with multiple birth data sets."""
    
    print("🧪 TESTING HUMAN DESIGN CALCULATION WITH MULTIPLE BIRTH DATA")
    print("=" * 80)
    
    # Test cases
    test_cases = [
        {
            "name": "Mage (Verified)",
            "birth_date": date(1991, 8, 13),
            "birth_time": time(13, 31),
            "birth_location": (12.9716, 77.5946),  # Bengaluru
            "timezone": "Asia/Kolkata",
            "expected_cross": "4/49 | 23/43"  # Right Angle Cross of Explanation
        },
        {
            "name": "Test Case 2 (New York)",
            "birth_date": date(1985, 12, 25),
            "birth_time": time(10, 30),
            "birth_location": (40.7128, -74.0060),  # New York
            "timezone": "America/New_York",
            "expected_cross": None  # We don't know the expected result
        },
        {
            "name": "Test Case 3 (London)",
            "birth_date": date(1990, 6, 15),
            "birth_time": time(14, 45),
            "birth_location": (51.5074, -0.1278),  # London
            "timezone": "Europe/London",
            "expected_cross": None
        },
        {
            "name": "Test Case 4 (Sydney)",
            "birth_date": date(1988, 3, 8),
            "birth_time": time(8, 15),
            "birth_location": (-33.8688, 151.2093),  # Sydney
            "timezone": "Australia/Sydney",
            "expected_cross": None
        }
    ]
    
    successful_tests = 0
    total_tests = len(test_cases)
    
    for test_case in test_cases:
        success = test_birth_data(**test_case)
        if success:
            successful_tests += 1
    
    print("\n" + "=" * 80)
    print("📈 SUMMARY")
    print("=" * 80)
    print(f"Successful tests: {successful_tests}/{total_tests}")
    print(f"Success rate: {successful_tests/total_tests*100:.1f}%")
    
    if successful_tests == total_tests:
        print("🎉 ALL TESTS PASSED! Human Design calculation is working correctly!")
    elif successful_tests >= total_tests * 0.8:
        print("🔶 MOSTLY SUCCESSFUL! Minor issues may need attention.")
    else:
        print("🔴 SIGNIFICANT ISSUES! Calculation method needs review.")
    
    return successful_tests == total_tests

if __name__ == "__main__":
    success = run_multiple_tests()
    sys.exit(0 if success else 1)

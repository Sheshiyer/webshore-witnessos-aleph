#!/usr/bin/env python3
"""
Final verification test to confirm Swiss Ephemeris and AstrologyCalculator produce identical results.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'witnessos-engines'))

from datetime import datetime, date, time
from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput
from shared.calculations.astrology import AstrologyCalculator

def test_multiple_birth_dates():
    """
    Test multiple birth dates to ensure consistency between calculators.
    """
    print("🧪 FINAL VERIFICATION TEST")
    print("=" * 50)
    
    test_cases = [
        {
            'name': 'Admin User',
            'birth_date': '1991-08-13',
            'birth_time': '08:01:00',
            'birth_location': [12.9716, 77.5946],
            'timezone': 'Asia/Kolkata',
            'expected_personality_sun': 4,
            'expected_design_sun': 23
        },
        {
            'name': 'Test Case 2',
            'birth_date': '1985-03-15',
            'birth_time': '14:30:00',
            'birth_location': [40.7128, -74.0060],  # New York
            'timezone': 'America/New_York'
        },
        {
            'name': 'Test Case 3',
            'birth_date': '1995-12-25',
            'birth_time': '00:00:00',
            'birth_location': [51.5074, -0.1278],  # London
            'timezone': 'Europe/London'
        }
    ]
    
    all_tests_passed = True
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{i}. Testing {test_case['name']}:")
        print("-" * 30)
        
        try:
            # Test AstrologyCalculator
            astro_calc = AstrologyCalculator()
            birth_datetime = datetime.strptime(f"{test_case['birth_date']} {test_case['birth_time']}", "%Y-%m-%d %H:%M:%S")
            lat, lon = test_case['birth_location']
            
            hd_data = astro_calc.calculate_human_design_data(
                birth_datetime, lat, lon, test_case['timezone']
            )
            
            astro_personality_sun = hd_data['personality_gates']['sun']
            astro_design_sun = hd_data['design_gates']['sun']
            
            # Test HumanDesignScanner
            scanner = HumanDesignScanner()
            input_data = HumanDesignInput(
                birth_date=datetime.strptime(test_case['birth_date'], "%Y-%m-%d").date(),
                birth_time=datetime.strptime(test_case['birth_time'], "%H:%M:%S").time(),
                birth_location=test_case['birth_location'],
                timezone=test_case['timezone']
            )
            
            result = scanner.calculate(input_data)
            scanner_personality_sun = result.chart.personality_gates['sun'].number
            scanner_design_sun = result.chart.design_gates['sun'].number
            
            # Compare results
            personality_match = astro_personality_sun == scanner_personality_sun
            design_match = astro_design_sun == scanner_design_sun
            
            print(f"  AstrologyCalculator - Personality Sun: Gate {astro_personality_sun}, Design Sun: Gate {astro_design_sun}")
            print(f"  HumanDesignScanner  - Personality Sun: Gate {scanner_personality_sun}, Design Sun: Gate {scanner_design_sun}")
            print(f"  Personality Match: {'✅' if personality_match else '❌'}")
            print(f"  Design Match: {'✅' if design_match else '❌'}")
            
            # Check expected values if provided
            if 'expected_personality_sun' in test_case:
                expected_match = (astro_personality_sun == test_case['expected_personality_sun'] and 
                                scanner_personality_sun == test_case['expected_personality_sun'])
                print(f"  Expected Personality Sun (Gate {test_case['expected_personality_sun']}): {'✅' if expected_match else '❌'}")
                
            if 'expected_design_sun' in test_case:
                expected_match = (astro_design_sun == test_case['expected_design_sun'] and 
                                scanner_design_sun == test_case['expected_design_sun'])
                print(f"  Expected Design Sun (Gate {test_case['expected_design_sun']}): {'✅' if expected_match else '❌'}")
            
            if not (personality_match and design_match):
                all_tests_passed = False
                
        except Exception as e:
            print(f"  ❌ Error: {e}")
            all_tests_passed = False
    
    print("\n" + "=" * 50)
    if all_tests_passed:
        print("🎉 ALL TESTS PASSED! Swiss Ephemeris and AstrologyCalculator are now consistent.")
    else:
        print("❌ Some tests failed. Further investigation needed.")
    print("=" * 50)
    
    return all_tests_passed

if __name__ == "__main__":
    test_multiple_birth_dates()
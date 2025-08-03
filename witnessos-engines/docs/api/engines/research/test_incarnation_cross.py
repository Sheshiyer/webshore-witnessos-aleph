#!/usr/bin/env python3
"""
Test script for incarnation cross calculation with Mage's birth data.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, date, time
from engines.human_design import HumanDesignScanner
from engines.human_design_models import HumanDesignInput

def test_mage_incarnation_cross():
    """Test incarnation cross calculation with Mage's birth data."""
    
    print("🧪 Testing Incarnation Cross Calculation")
    print("=" * 50)
    
    # Mage's birth data
    birth_date = date(1991, 8, 13)
    birth_time = time(13, 31)  # 1:31 PM
    birth_location = (12.9716, 77.5946)  # Bengaluru coordinates
    timezone = "Asia/Kolkata"
    
    print(f"Birth Date: {birth_date}")
    print(f"Birth Time: {birth_time}")
    print(f"Birth Location: {birth_location} (Bengaluru)")
    print(f"Timezone: {timezone}")
    print()
    
    # Create input
    input_data = HumanDesignInput(
        birth_date=birth_date,
        birth_time=birth_time,
        birth_location=birth_location,
        timezone=timezone,
        include_design_calculation=True,
        detailed_gates=True
    )
    
    # Initialize engine
    engine = HumanDesignScanner()
    
    try:
        # Calculate
        print("🔮 Calculating Human Design chart...")
        result = engine.calculate(input_data)
        
        print("✅ Calculation completed successfully!")
        print()
        
        # Extract incarnation cross from raw calculation results
        if hasattr(result, 'raw_data') and 'incarnation_cross' in result.raw_data:
            cross = result.raw_data['incarnation_cross']
            
            print("🎯 INCARNATION CROSS RESULTS:")
            print(f"Name: {cross['name']}")
            print(f"Type: {cross['type']}")
            print(f"Gates: {cross['gates']}")
            print(f"Theme: {cross.get('theme', 'N/A')}")
            print()
            print(f"Description: {cross.get('description', 'N/A')}")
            print()
            
            # Check if it matches expected
            expected_gates = {
                'conscious_sun': 4,
                'conscious_earth': 49,
                'unconscious_sun': 23,
                'unconscious_earth': 43
            }
            
            if cross['gates'] == expected_gates:
                print("✅ CORRECT! Gates match expected: 4/49 | 23/43")
                if "Explanation" in cross['name']:
                    print("✅ PERFECT! Incarnation cross name contains 'Explanation'")
                else:
                    print("⚠️  Cross name doesn't contain 'Explanation' but gates are correct")
            else:
                print("❌ Gates don't match expected:")
                print(f"Expected: {expected_gates}")
                print(f"Got: {cross['gates']}")
        
        else:
            print("❌ No incarnation cross data found in results")
            print("Available keys:", list(result.raw_data.keys()) if hasattr(result, 'raw_data') else "No raw_data")
        
        # Also check the interpretation
        print("\n" + "="*50)
        print("📖 INTERPRETATION EXCERPT:")
        interpretation = result.formatted_output
        if "INCARNATION CROSS" in interpretation:
            lines = interpretation.split('\n')
            cross_section = []
            in_cross_section = False
            
            for line in lines:
                if "INCARNATION CROSS" in line:
                    in_cross_section = True
                elif "═══════════════════════════════════════════════════════════════" in line and in_cross_section:
                    break
                
                if in_cross_section:
                    cross_section.append(line)
            
            print('\n'.join(cross_section))
        else:
            print("No incarnation cross section found in interpretation")
            
    except Exception as e:
        print(f"❌ Error during calculation: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_mage_incarnation_cross()
